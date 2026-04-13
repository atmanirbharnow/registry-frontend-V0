import { NextRequest, NextResponse } from "next/server";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { generateSchoolHash } from "@/lib/hashUtils";
import { calculateSchoolImpact } from "@/lib/schoolCalculationEngine";
import { adminDb, adminStorage } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { normalizeSchoolName } from "@/lib/schoolUtils";

const hasAdminCredentials = !!(
    process.env.FIREBASE_PRIVATE_KEY &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY.includes("BEGIN PRIVATE KEY")
);

function getProjectId() {
    return process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!;
}

const DATABASE_ID = "asia-pacific";

function getBaseUrl() {
    return `https://firestore.googleapis.com/v1/projects/${getProjectId()}/databases/${DATABASE_ID}/documents`;
}

function toFirestoreValue(value: unknown): Record<string, unknown> {
    if (value === null || value === undefined) return { nullValue: null };
    if (typeof value === "string") return { stringValue: value };
    if (typeof value === "number") return { doubleValue: value };
    if (typeof value === "boolean") return { booleanValue: value };
    if (Array.isArray(value)) {
        return { arrayValue: { values: value.map(toFirestoreValue) } };
    }
    return { stringValue: String(value) };
}

function toFirestoreDoc(data: Record<string, unknown>) {
    const fields: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
        fields[key] = toFirestoreValue(value);
    }
    return { fields };
}

async function incrementCounterREST(bearerToken: string): Promise<number> {
    const commitUrl = `${getBaseUrl()}:commit`;
    const docPath = `projects/${getProjectId()}/databases/${DATABASE_ID}/documents/meta/schoolRegistryCounter`;

    const res = await fetch(commitUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${bearerToken}`,
        },
        body: JSON.stringify({
            writes: [
                {
                    transform: {
                        document: docPath,
                        fieldTransforms: [
                            {
                                fieldPath: "count",
                                increment: { integerValue: "1" },
                            },
                        ],
                    },
                },
            ],
        }),
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || "Counter increment failed");
    }

    const data = await res.json();
    const newValue = data.writeResults?.[0]?.transformResults?.[0]?.integerValue;
    return Number(newValue);
}

async function commitBatchREST(
    writes: Array<{ schoolRef: string; schoolData: any; baselineRef: string; baselineData: any; actionRef: string; actionData: any }>,
    bearerToken: string
): Promise<void> {
    const commitUrl = `${getBaseUrl()}:commit`;
    const payload = {
        writes: writes.flatMap((w) => [
            {
                update: {
                    name: `projects/${getProjectId()}/databases/${DATABASE_ID}/documents/schools/${w.schoolRef}`,
                    ...toFirestoreDoc(w.schoolData),
                },
            },
            {
                update: {
                    name: `projects/${getProjectId()}/databases/${DATABASE_ID}/documents/schoolBaselines/${w.baselineRef}`,
                    ...toFirestoreDoc(w.baselineData),
                },
            },
            {
                update: {
                    name: `projects/${getProjectId()}/databases/${DATABASE_ID}/documents/schoolActions/${w.actionRef}`,
                    ...toFirestoreDoc(w.actionData),
                },
            },
        ]),
    };

    const res = await fetch(commitUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${bearerToken}`,
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || "Batch commit failed");
    }
}

function sanitizeLargeData(data: Record<string, any>): Record<string, any> {
    const MAX_VAL_SIZE = 500 * 1024; // 500KB safeguard (increased for photos)
    const result = { ...data };
    for (const [key, value] of Object.entries(result)) {
        if (typeof value === "string" && value.length > MAX_VAL_SIZE) {
            if (value.startsWith("data:image")) {
                console.warn(`[sanitize-school] Truncating large image field: ${key} (${value.length} bytes)`);
                result[key] = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="; // 1x1 transparent
            } else {
                console.warn(`[sanitize-school] Truncating large field: ${key} (${value.length} bytes)`);
                result[key] = value.substring(0, 1024) + "... [truncated]";
            }
        }
    }
    return result;
}

export async function POST(request: NextRequest) {
    const isSimulation = process.env.RAZORPAY_SIMULATION_MODE === "true";
    
    try {
        const formData = await request.formData();
        
        const razorpay_order_id = formData.get("razorpay_order_id") as string;
        const razorpay_payment_id = formData.get("razorpay_payment_id") as string;
        const razorpay_signature = formData.get("razorpay_signature") as string;
        const userId = formData.get("userId") as string;
        const userIdToken = formData.get("userIdToken") as string; // We need this for REST
        const photoFile = formData.get("photo_file") as File | null;

        // Verify Signature
        if (!isSimulation) {
            const isValid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
            if (!isValid) return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
        }

        let nextValue: number;
        if (hasAdminCredentials) {
            const counterRef = adminDb.collection("meta").doc("schoolRegistryCounter");
            nextValue = await adminDb.runTransaction(async (tx) => {
                const snap = await tx.get(counterRef);
                const current = snap.exists ? (snap.data()?.count ?? 0) : 0;
                const next = current + 1;
                tx.set(counterRef, { 
                    count: next, 
                    prefix: "CAF-SCH-", 
                    last_updated: FieldValue.serverTimestamp() 
                }, { merge: true });
                return next;
            });
        } else {
            nextValue = await incrementCounterREST(userIdToken);
        }

        const registryId = `CAF-SCH-${String(nextValue).padStart(4, "0")}`;
        const now = new Date().toISOString();

        const bOrganic = Number(formData.get("baselineWasteOrganic")) || 0;
        const bInorganic = Number(formData.get("baselineWasteInorganic")) || 0;
        const bHazardous = Number(formData.get("baselineWasteHazardous")) || 0;
        const calculatedDiverted = bOrganic + bInorganic + bHazardous;

        let actions = [];
        try {
            const actionTypesArr = JSON.parse(formData.get("actionTypes") as string || "[]");
            const actionDetailsObj = JSON.parse(formData.get("actionDetails") as string || "{}");
            if (Array.isArray(actionTypesArr)) {
                actions = actionTypesArr.map(type => ({
                    actionType: type,
                    quantity: Number(actionDetailsObj[type]?.quantity) || 0,
                    unit: actionDetailsObj[type]?.unit || "",
                    commissioningDate: actionDetailsObj[type]?.commissioningDate || ""
                }));
            }
        } catch (e) {
            console.error("Failed to parse school actions array", e);
        }

        const primaryActionType = (formData.get("action_type") as string) || (actions.length > 0 ? actions[0].actionType : "Solar");
        const primaryQuantity = Number(formData.get("actionQuantity")) || (actions.length > 0 ? actions[0].quantity : 0);

        // Calculate Impact
        const impact = calculateSchoolImpact({
            baselineEnergyGrid: Number(formData.get("baselineEnergyGrid")) || 0,
            baselineEnergyDiesel: Number(formData.get("baselineEnergyDiesel")) || 0,
            baselineEnergySolar: Number(formData.get("baselineEnergySolar")) || 0,
            baselineWaterMunicipal: Number(formData.get("baselineWaterMunicipal")) || 0,
            baselineWaterRain: Number(formData.get("baselineWaterRain")) || 0,
            baselineWaterWaste: Number(formData.get("baselineWaterWaste")) || 0,
            baselineWasteOrganic: bOrganic,
            baselineWasteInorganic: bInorganic,
            baselineWasteHazardous: bHazardous,
            waste_diverted_kg: calculatedDiverted,
            students_count: Number(formData.get("students_count")) || 1,
            actionType: primaryActionType,
            actionQuantity: primaryQuantity,
            actions: actions
        });

        const sha256Hash = generateSchoolHash({
            registryId,
            schoolName: formData.get("schoolName") as string,
            address: formData.get("address") as string,
            userId,
            createdAt: now,
        });

        // Feature 8: Split Collections
        // Collection 1: schools (publicly readable identity)
        const schoolDocData = {
            registryId,
            schoolName: formData.get("schoolName"),
            address: formData.get("address"),
            city: formData.get("city"),
            state: formData.get("state"),
            pincode: formData.get("pincode"),
            sector: formData.get("sector"),
            place_id: formData.get("place_id"),
            contactPerson: formData.get("contactPerson"),
            phone: formData.get("phone"),
            email: formData.get("email"),
            projectId: formData.get("projectId"),
            status: "pledged",
            // Feature 10: 3 Consent Flags
            consent_verification: true,
            consent_public: true,
            consent_research: true,
            attribution_percentage: Number(formData.get("attribution_pct_energy")) || 100,
            tco2e_annual: impact.tco2e_annual,
            atmanirbhar_pct: impact.atmanirbhar_pct,
            circularity_pct: impact.circularity_pct,
            carbon_intensity: impact.carbon_intensity,
            sha256Hash,
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            payment_status: "verified",
            userId,
            createdAt: now,
            updatedAt: null,
            verifiedAt: null,
            verifiedBy: null,
            lat: formData.get("lat") ? Number(formData.get("lat")) : null,
            lng: formData.get("lng") ? Number(formData.get("lng")) : null,
            // Baseline fields for Admin Modal
            baselineEnergyGrid: Number(formData.get("baselineEnergyGrid")) || 0,
            baselineEnergyDiesel: Number(formData.get("baselineEnergyDiesel")) || 0,
            baselineEnergySolar: Number(formData.get("baselineEnergySolar")) || 0,
            baselineWaterMunicipal: Number(formData.get("baselineWaterMunicipal")) || 0,
            baselineWaterRain: Number(formData.get("baselineWaterRain")) || 0,
            baselineWaterWaste: Number(formData.get("baselineWaterWaste")) || 0,
            baselineWasteOrganic: bOrganic,
            baselineWasteInorganic: bInorganic,
            baselineWasteHazardous: bHazardous,
            waste_diverted_kg: calculatedDiverted,
            baseline_source: formData.get("baseline_source") || "self-reported",
            name_normalized: normalizeSchoolName(formData.get("schoolName") as string),
            students_count: Number(formData.get("students_count")) || 1,
            // Action Data
            actionQuantity: primaryQuantity,
            action_type: primaryActionType,
            actions: actions,
            action_id: formData.get("action_id"),
            energyBillCopy: formData.get("energyBillCopy") || null,
            meterPhoto: formData.get("meterPhoto") || null,
            moreDetailsPhoto: formData.get("moreDetailsPhoto") || null,
            siteOverviewPhoto: formData.get("siteOverviewPhoto") || null,
            // Dynamic Photofields
            solar_rooftop: formData.get("solar_rooftop") || null,
            solar_water_heater: formData.get("solar_water_heater") || null,
            rainwater_harvesting: formData.get("rainwater_harvesting") || null,
            biogas_cooking: formData.get("biogas_cooking") || null,
            waterless_urinals: formData.get("waterless_urinals") || null,
            composting: formData.get("composting") || null,
            wastewater_recycling: formData.get("wastewater_recycling") || null,
            led_retrofit: formData.get("led_retrofit") || null,
        };

        const sanitizedSchool = sanitizeLargeData(schoolDocData);

        // Collection 2: schoolBaselines (admin only, raw data + impact)
        const baselineDocData = {
            ...impact,
            baselineEnergyGrid: Number(formData.get("baselineEnergyGrid")) || 0,
            baselineEnergyDiesel: Number(formData.get("baselineEnergyDiesel")) || 0,
            baselineEnergySolar: Number(formData.get("baselineEnergySolar")) || 0,
            baselineWaterMunicipal: Number(formData.get("baselineWaterMunicipal")) || 0,
            baselineWaterRain: Number(formData.get("baselineWaterRain")) || 0,
            baselineWaterWaste: Number(formData.get("baselineWaterWaste")) || 0,
            baselineWasteOrganic: bOrganic,
            baselineWasteInorganic: bInorganic,
            baselineWasteHazardous: bHazardous,
            waste_diverted_kg: calculatedDiverted,
            students_count: Number(formData.get("students_count")),
            reporting_year: formData.get("reporting_year"),
            action_id: formData.get("action_id"),
            actionQuantity: Number(formData.get("actionQuantity")) || 0,
            baseline_source: formData.get("baseline_source"),
            last_calculated: now,
            userId, // Include userId for security rules
        };

        const sanitizedBaseline = sanitizeLargeData(baselineDocData);

        const schoolId = hasAdminCredentials ? adminDb.collection("schools").doc().id : crypto.randomUUID();

        // Feature 9: Photo Upload
        let photoUrl = null;
        if (photoFile && typeof photoFile !== "string") {
            if (hasAdminCredentials) {
                const buffer = Buffer.from(await photoFile.arrayBuffer());
                const bucket = adminStorage.bucket();
                const actionId = formData.get("action_id") || "initial";
                const filePath = `school-actions/${schoolId}/${actionId}/photo.jpg`;
                const file = bucket.file(filePath);
                await file.save(buffer, { contentType: "image/jpeg" });
                photoUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
            } else {
                // Return data URL for simulation if no admin credentials
                const bytes = await photoFile.arrayBuffer();
                const buffer = Buffer.from(bytes);
                photoUrl = `data:${photoFile.type};base64,${buffer.toString("base64")}`;
            }
        }

        // Add action if provided
        const actionData = {
            schoolId,
            projectId: formData.get("projectId"),
            action_id: formData.get("action_id"),
            has_existing_actions: formData.get("has_existing_actions"),
            action_type: formData.get("action_type"),
            installation_date: formData.get("installation_date"),
            capacity_description: formData.get("capacity_description"),
            photo_url: formData.get("energyBillCopy") || formData.get("meterPhoto") || formData.get("moreDetailsPhoto") || formData.get("siteOverviewPhoto") || null,
            energyBillCopy: formData.get("energyBillCopy") || null,
            meterPhoto: formData.get("meterPhoto") || null,
            moreDetailsPhoto: formData.get("moreDetailsPhoto") || null,
            siteOverviewPhoto: formData.get("siteOverviewPhoto") || null,
            // Dynamic Photofields
            solar_rooftop: formData.get("solar_rooftop") || null,
            solar_water_heater: formData.get("solar_water_heater") || null,
            rainwater_harvesting: formData.get("rainwater_harvesting") || null,
            biogas_cooking: formData.get("biogas_cooking") || null,
            waterless_urinals: formData.get("waterless_urinals") || null,
            composting: formData.get("composting") || null,
            wastewater_recycling: formData.get("wastewater_recycling") || null,
            led_retrofit: formData.get("led_retrofit") || null,
            createdAt: now,
            userId, // Include userId for security rules
        };

        const sanitizedAction = sanitizeLargeData(actionData);

        if (hasAdminCredentials) {
            const batch = adminDb.batch();
            batch.set(adminDb.collection("schools").doc(schoolId), sanitizedSchool);
            batch.set(adminDb.collection("schoolBaselines").doc(schoolId), sanitizedBaseline);
            batch.set(adminDb.collection("schoolActions").doc(), sanitizedAction);
            await batch.commit();
        } else {
            const actionRef = crypto.randomUUID();
            await commitBatchREST(
                [{ schoolRef: schoolId, schoolData: sanitizedSchool, baselineRef: schoolId, baselineData: sanitizedBaseline, actionRef: actionRef, actionData: sanitizedAction }],
                userIdToken
            );
        }

        return NextResponse.json({
            registryId,
            schoolId,
            impact,
            sha256Hash,
        });
    } catch (error: any) {
        const message = error.message || "Payment verification failed";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from "next/server";
import { calculateSchoolImpact } from "@/lib/schoolCalculationEngine";

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
    return { stringValue: String(value) };
}

async function updateSchoolAdmin(
    schoolId: string,
    data: Record<string, unknown>
): Promise<void> {
    const { adminDb } = await import("@/lib/firebaseAdmin");
    const batch = adminDb.batch();
    
    // Update both schools and schoolBaselines
    const schoolRef = adminDb.collection("schools").doc(schoolId);
    const baselineRef = adminDb.collection("schoolBaselines").doc(schoolId);
    
    batch.update(schoolRef, data);
    batch.update(baselineRef, data);
    
    await batch.commit();
}

async function updateSchoolREST(
    schoolId: string,
    data: Record<string, unknown>,
    bearerToken: string
): Promise<void> {

    const fields: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
        fields[key] = toFirestoreValue(value);
    }

    const updateMask = Object.keys(data).map((f) => `updateMask.fieldPaths=${f}`).join("&");
    
    // Update both collections via REST
    const collections = ["schools", "schoolBaselines"];
    
    for (const coll of collections) {
        const docPath = `projects/${getProjectId()}/databases/${DATABASE_ID}/documents/${coll}/${schoolId}`;
        const res = await fetch(
            `https://firestore.googleapis.com/v1/${docPath}?${updateMask}`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${bearerToken}`,
                },
                body: JSON.stringify({ fields }),
            }
        );

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error?.message || `Firestore update failed for ${coll}`);
        }
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            schoolId,
            status,
            adminNotes,
            adminUid,
            adminIdToken,
            editedData
        } = body;

        if (!schoolId || !status || !adminUid) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        let updateData: Record<string, unknown> = {
            status,
            adminNotes: adminNotes || null,
            updatedAt: new Date().toISOString(),
        };

        if (status === "verified") {
            updateData.verifiedAt = new Date().toISOString();
            updateData.verifiedBy = adminUid;
        }

        // If admin edited data, merge it and recalculate impact
        if (editedData) {
            const impact = calculateSchoolImpact({
                baselineEnergyGrid: Number(editedData.baselineEnergyGrid ?? editedData.electricity_kWh_year) || 0,
                baselineEnergyDiesel: Number(editedData.baselineEnergyDiesel ?? editedData.fuel_consumption_litres) || 0,
                baselineEnergySolar: Number(editedData.baselineEnergySolar ?? editedData.renewable_energy_kwh) || 0,
                baselineWaterMunicipal: Number(editedData.baselineWaterMunicipal ?? editedData.water_consumption_m3) || 0,
                baselineWaterRain: Number(editedData.baselineWaterRain) || 0,
                baselineWaterWaste: Number(editedData.baselineWaterWaste) || 0,
                baselineWasteOrganic: Number(editedData.baselineWasteOrganic ?? editedData.waste_generated_kg) || 0,
                baselineWasteInorganic: Number(editedData.baselineWasteInorganic ?? editedData.waste_diverted_kg) || 0,
                baselineWasteHazardous: Number(editedData.baselineWasteHazardous) || 0,
                students_count: Number(editedData.students_count) || 1,
                actionType: editedData.actionType || "Solar",
                actionQuantity: Number(editedData.actionQuantity) || 0,
            });

            updateData = {
                ...editedData,
                action_type: editedData.actionType,
                tco2e_annual: impact.tco2e_annual,
                atmanirbhar_pct: impact.atmanirbhar_pct,
                circularity_pct: impact.circularity_pct,
                carbon_intensity: impact.carbon_intensity,
                energyCo2eKg: impact.energyCo2eKg,
                fuelCo2eKg: impact.fuelCo2eKg,
                waterCo2eKg: impact.waterCo2eKg,
                wasteCo2eKg: impact.wasteCo2eKg,
            };

            // Ensure numeric fields are numbers for Firestore
            if (updateData.electricity_kWh_year) updateData.electricity_kWh_year = Number(updateData.electricity_kWh_year);
            if (updateData.fuel_consumption_litres) updateData.fuel_consumption_litres = Number(updateData.fuel_consumption_litres);
            if (updateData.renewable_energy_kwh) updateData.renewable_energy_kwh = Number(updateData.renewable_energy_kwh);
            if (updateData.waste_generated_kg) updateData.waste_generated_kg = Number(updateData.waste_generated_kg);
            if (updateData.waste_diverted_kg) updateData.waste_diverted_kg = Number(updateData.waste_diverted_kg);
            if (updateData.water_consumption_m3) updateData.water_consumption_m3 = Number(updateData.water_consumption_m3);
            if (updateData.attribution_pct_energy) updateData.attribution_pct_energy = Number(updateData.attribution_pct_energy);
            if (updateData.attribution_pct_waste) updateData.attribution_pct_waste = Number(updateData.attribution_pct_waste);
            if (updateData.attribution_pct_water) updateData.attribution_pct_water = Number(updateData.attribution_pct_water);
            if (updateData.students_count) updateData.students_count = Number(updateData.students_count);
        }

        if (hasAdminCredentials) {
            await updateSchoolAdmin(schoolId, updateData);
        } else {
            await updateSchoolREST(schoolId, updateData, adminIdToken);
        }

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        const message =
            error instanceof Error ? error.message : "Verification failed";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

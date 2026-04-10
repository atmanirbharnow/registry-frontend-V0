import { NextRequest, NextResponse } from "next/server";
import { createRazorpayOrder } from "@/lib/razorpay";

export async function POST(request: NextRequest) {
    // Read at runtime, not module level — server-only env vars aren't available at build time
    const isSimulation = process.env.RAZORPAY_SIMULATION_MODE === "true";

    try {
        const body = await request.json().catch(() => ({}));
        const { idToken } = body;

        let individualPrice = 1;

        // AUTHENTICATED FETCH: This approach works in both local dev and production
        // without requiring a Service Account JSON key. It uses the user's own token.
        if (idToken) {
            try {
                const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
                const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/asia-pacific/documents/meta/paymentSettings`;
                const res = await fetch(url, {
                    headers: { Authorization: `Bearer ${idToken}` },
                });
                
                if (res.ok) {
                    const data = await res.json();
                    // Firestore REST API returns fields in a specific format
                    const fields = data.fields || {};
                    individualPrice = fields.individualPrice?.doubleValue || fields.individualPrice?.integerValue || 1;
                }
            } catch (err) {
                console.error("Authenticated price fetch failed:", err);
            }
        }

        const amountPaise = Math.round(Number(individualPrice) * 100);

        if (isSimulation) {
            return NextResponse.json({
                orderId: `order_SIM_${Date.now()}`,
                amount: amountPaise,
                currency: "INR",
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                simulated: true,
            });
        }

        const order = await createRazorpayOrder(amountPaise);

        return NextResponse.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            simulated: false,
        });
    } catch (error: unknown) {
        const message =
            error instanceof Error ? error.message : "Failed to create order";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from "next/server";
import { createRazorpayOrder } from "@/lib/razorpay";

export async function POST(request: NextRequest) {
    const isSimulation = process.env.RAZORPAY_SIMULATION_MODE === "true";

    try {
        const body = await request.json().catch(() => ({}));
        const { idToken } = body;

        let schoolPrice = 1;

        if (idToken) {
            try {
                const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
                const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/asia-pacific/documents/meta/paymentSettings`;
                const res = await fetch(url, {
                    headers: { Authorization: `Bearer ${idToken}` },
                });
                
                if (res.ok) {
                    const data = await res.json();
                    const fields = data.fields || {};
                    schoolPrice = fields.schoolPrice?.doubleValue || fields.schoolPrice?.integerValue || 1;
                }
            } catch (err) {
                console.error("Authenticated price fetch failed:", err);
            }
        }

        const amountPaise = Math.round(Number(schoolPrice) * 100);

        if (isSimulation) {
            return NextResponse.json({
                orderId: `order_SCH_SIM_${Date.now()}`,
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
        const message = error instanceof Error ? error.message : "Failed to create order";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

import crypto from "crypto";

const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";

export interface RazorpayOrder {
    id: string;
    amount: number;
    currency: string;
}

export async function createRazorpayOrder(
    amountInPaise: number
): Promise<RazorpayOrder> {
    const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64");

    const response = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${auth}`,
        },
        body: JSON.stringify({
            amount: amountInPaise,
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.description || "Failed to create Razorpay order");
    }

    const data = await response.json();
    return {
        id: data.id,
        amount: data.amount,
        currency: data.currency,
    };
}

export function verifyRazorpaySignature(
    orderId: string,
    paymentId: string,
    signature: string
): boolean {
    const body = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
        .createHmac("sha256", RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex");

    return expectedSignature === signature;
}

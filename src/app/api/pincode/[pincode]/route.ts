import { NextRequest, NextResponse } from "next/server";

/**
 * Pincode Proxy API
 * Proxies requests to api.postalpincode.in to avoid CORS/Referrer issues in production.
 */
export async function GET(
    request: NextRequest,
    context: any
) {
    try {
        // In Next.js 15+, params is a promise.
        const { pincode } = await context.params;

        if (!pincode || pincode.length !== 6) {
            return NextResponse.json({ error: "Invalid pincode" }, { status: 400 });
        }

        const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`, {
            // Optional: add cache headers if needed, Next.js handles this via fetch options
            next: { revalidate: 86400 } // Cache for 24 hours
        });

        if (!res.ok) {
            throw new Error(`External API responded with status: ${res.status}`);
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Pincode proxy error:", error);
        return NextResponse.json(
            { error: "Failed to fetch pincode details", details: error.message },
            { status: 500 }
        );
    }
}

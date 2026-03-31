import { NextRequest, NextResponse } from "next/server";

/**
 * Google Geocoding Proxy API
 * Proxies requests to maps.googleapis.com to avoid CORS/Referrer issues in production.
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const lat = searchParams.get("lat")?.trim();
        const lng = searchParams.get("lng")?.trim();
        const address = searchParams.get("address")?.trim();
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ error: "Missing API Key" }, { status: 500 });
        }

        let url = `https://maps.googleapis.com/maps/api/geocode/json?key=${apiKey}`;
        if (address) {
            url += `&address=${encodeURIComponent(address)}`;
        } else if (lat && lng) {
            url += `&latlng=${lat},${lng}`;
        } else {
            return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
        }

        const res = await fetch(url, {
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        const data = await res.json();

        if (!res.ok || data.status === "REQUEST_DENIED" || data.status === "INVALID_REQUEST") {
            const googleError = data.error_message || data.status || "Unknown Google API error";
            return NextResponse.json(
                { error: "Google API Error", details: googleError, googleStatus: data.status },
                { status: res.status === 200 ? 400 : res.status }
            );
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Geocoding proxy error:", error);
        return NextResponse.json(
            { error: "Internal Server Error", details: error.message },
            { status: 500 }
        );
    }
}

import { NextRequest, NextResponse } from "next/server";

/**
 * Google Geocoding Proxy API
 * Proxies requests to maps.googleapis.com to avoid CORS/Referrer issues in production.
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl;
        const lat = searchParams.get("lat")?.trim();
        const lng = searchParams.get("lng")?.trim();
        const address = searchParams.get("address")?.trim();
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ error: "Missing API Key" }, { status: 500 });
        }

        const googleQuery = new URLSearchParams({ key: apiKey });
        
        if (address) {
            googleQuery.set("address", address);
        } else if (lat && lng) {
            googleQuery.set("latlng", `${lat},${lng}`);
        } else {
            return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
        }

        const url = `https://maps.googleapis.com/maps/api/geocode/json?${googleQuery.toString()}`;
        
        const res = await fetch(url, {
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        const data = await res.json();

        if (!res.ok || data.status === "REQUEST_DENIED" || data.status === "INVALID_REQUEST") {
            const googleError = data.error_message || data.status || "Unknown Google API error";
            console.error("Google Geocode API Error:", googleError, "Full Status:", data.status);
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

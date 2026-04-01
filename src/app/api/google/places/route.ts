import { NextRequest, NextResponse } from "next/server";

/**
 * Google Places Autocomplete Proxy API
 * Proxies requests to maps.googleapis.com for address suggestions.
 * Supports optional `types` param (e.g. "school", "establishment").
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const input = searchParams.get("input")?.trim();
        const types = searchParams.get("types")?.trim();
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

        if (!input || !apiKey) {
            return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
        }

        // Build Google Places API URL
        const googleParams = new URLSearchParams({
            input,
            components: "country:in",
            key: apiKey,
        });
        if (types) {
            googleParams.set("types", types);
        }

        const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?${googleParams.toString()}`;
        const res = await fetch(url, {
            next: { revalidate: 300 } // Cache for 5 min (short to avoid caching errors)
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
        console.error("Places proxy error:", error);
        return NextResponse.json(
            { error: "Internal Server Error", details: error.message },
            { status: 500 }
        );
    }
}

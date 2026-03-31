import { NextRequest, NextResponse } from "next/server";

/**
 * Google Places Autocomplete Proxy API
 * Proxies requests to maps.googleapis.com for address suggestions.
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const input = searchParams.get("input");
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

        if (!input || !apiKey) {
            return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
        }

        // Search in India
        const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&components=country:in&key=${apiKey}`;
        const res = await fetch(url, {
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        if (!res.ok) {
            throw new Error(`Google API responded with status: ${res.status}`);
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Places proxy error:", error);
        return NextResponse.json(
            { error: "Failed to fetch suggestions", details: error.message },
            { status: 500 }
        );
    }
}

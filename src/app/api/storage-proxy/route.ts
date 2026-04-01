import { NextRequest, NextResponse } from "next/server";

const hasAdminCredentials = !!(
    process.env.FIREBASE_PRIVATE_KEY &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY.includes("BEGIN PRIVATE KEY")
);

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;
        const path = formData.get("path") as string;

        if (!file || !path) {
            return NextResponse.json(
                { error: "File and path are required" },
                { status: 400 }
            );
        }

        const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
        if (!bucketName) {
            return NextResponse.json(
                { error: "Storage bucket not configured" },
                { status: 500 }
            );
        }

        if (!hasAdminCredentials) {
            // Return a small mock URL for simulation to keep document size under 1MB
            // High-resolution Base64 would exceed Firestore's 1MB limit for multi-photo actions
            return NextResponse.json({ 
                url: "https://placehold.co/400x400/202682/ffffff?text=Simulated+Upload", 
                simulated: true 
            });
        }

        const { getStorage } = await import("firebase-admin/storage");
        const { adminDb } = await import("@/lib/firebaseAdmin");
        void adminDb;

        const { getApps } = await import("firebase-admin/app");
        const app = getApps()[0];
        const bucket = getStorage(app).bucket(bucketName);
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const fileRef = bucket.file(path);

        await fileRef.save(fileBuffer, {
            metadata: { contentType: file.type },
        });

        await fileRef.makePublic();
        const url = `https://storage.googleapis.com/${bucketName}/${path}`;

        return NextResponse.json({ url });
    } catch (error: unknown) {
        const message =
            error instanceof Error ? error.message : "Upload failed";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

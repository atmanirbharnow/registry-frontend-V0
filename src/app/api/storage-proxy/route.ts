import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";

function getAdminApp() {
    if (getApps().length > 0) return getApps()[0];

    return initializeApp({
        credential: cert({
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL || "",
            privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
        }),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
}

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

        try {
            getAdminApp();
        } catch {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const base64 = buffer.toString("base64");
            const mimeType = file.type || "application/octet-stream";
            const dataUrl = `data:${mimeType};base64,${base64}`;

            return NextResponse.json({ url: dataUrl, simulated: true });
        }

        const app = getAdminApp();
        const bucket = getStorage(app).bucket();
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const fileRef = bucket.file(path);

        await fileRef.save(fileBuffer, {
            metadata: {
                contentType: file.type,
            },
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

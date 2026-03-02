import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function POST() {
    try {
        const actionsRef = adminDb.collection("actions");
        const snapshot = await actionsRef.get();
        const batch = adminDb.batch();

        let updatedCount = 0;

        // Process sequentially to ensure counter increments safely
        for (const doc of snapshot.docs) {
            const data = doc.data();
            if (!data.registryId) {
                // Read and increment counter safely
                const counterRef = adminDb.collection("meta").doc("registryCounter");
                const newCount = await adminDb.runTransaction(async (tx) => {
                    const snap = await tx.get(counterRef);
                    const current = snap.exists ? (snap.data()?.count ?? 0) : 0;
                    const next = current + 1;
                    tx.set(counterRef, { count: next }, { merge: true });
                    return next;
                });

                const newRegistryId = `ECF-${String(newCount).padStart(4, "0")}`;
                batch.update(doc.ref, { registryId: newRegistryId });
                updatedCount++;
            }
        }

        if (updatedCount > 0) {
            await batch.commit();
        }

        return NextResponse.json({
            message: `Successfully backfilled ${updatedCount} registry IDs.`,
            updatedCount,
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Backfill failed";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

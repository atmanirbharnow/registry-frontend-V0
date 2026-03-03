import { NextRequest, NextResponse } from "next/server";

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!;
const DATABASE_ID = "asia-pacific";
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents`;

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get("authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const bearerToken = authHeader.slice(7);

        // 1. Get all actions
        const actionsRes = await fetch(`${BASE_URL}/actions?pageSize=100`, {
            headers: { Authorization: `Bearer ${bearerToken}` },
        });
        if (!actionsRes.ok) {
            const err = await actionsRes.json();
            throw new Error(err.error?.message || "Failed to fetch actions");
        }
        const actionsData = await actionsRes.json();
        const documents = actionsData.documents || [];

        // 2. Sort by createdAt to ensure consistent ordering
        documents.sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
            const aDate = (a as { fields?: { createdAt?: { stringValue?: string } } }).fields?.createdAt?.stringValue || "";
            const bDate = (b as { fields?: { createdAt?: { stringValue?: string } } }).fields?.createdAt?.stringValue || "";
            return aDate.localeCompare(bDate);
        });

        // 3. Re-assign unique ECF IDs sequentially
        let counter = 0;
        const updates: { docName: string; newId: string }[] = [];

        for (const doc of documents) {
            counter++;
            const newRegistryId = `ECF-${String(counter).padStart(4, "0")}`;
            const currentId = (doc as { fields?: { registryId?: { stringValue?: string } } }).fields?.registryId?.stringValue;

            if (currentId !== newRegistryId) {
                updates.push({ docName: (doc as { name: string }).name, newId: newRegistryId });
            }
        }

        // 4. Update each document
        for (const update of updates) {
            await fetch(
                `${update.docName}?updateMask.fieldPaths=registryId`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${bearerToken}`,
                    },
                    body: JSON.stringify({
                        fields: { registryId: { stringValue: update.newId } },
                    }),
                }
            );
        }

        // 5. Update the counter to the final value
        const commitUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents:commit`;
        const counterDocPath = `projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents/meta/registryCounter`;
        await fetch(commitUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${bearerToken}`,
            },
            body: JSON.stringify({
                writes: [
                    {
                        update: {
                            name: counterDocPath,
                            fields: { count: { integerValue: String(counter) } },
                        },
                        updateMask: { fieldPaths: ["count"] },
                    },
                ],
            }),
        });

        return NextResponse.json({
            message: `Fixed ${updates.length} actions. Counter set to ${counter}.`,
            totalActions: documents.length,
            updatedActions: updates.map((u) => u.newId),
            counterValue: counter,
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Fix failed";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

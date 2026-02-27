export async function generateSHA256Hash(
    canonicalString: string
): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(canonicalString);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function buildCanonicalString(fields: {
    registryId: string;
    actionType: string;
    quantity: number;
    unit: string;
    address: string;
    userId: string;
    createdAt: string;
}): string {
    return [
        fields.registryId,
        fields.actionType,
        String(fields.quantity),
        fields.unit,
        fields.address,
        fields.userId,
        fields.createdAt,
    ].join("|");
}

export async function generateActionHash(fields: {
    registryId: string;
    actionType: string;
    quantity: number;
    unit: string;
    address: string;
    userId: string;
    createdAt: string;
}): Promise<string> {
    const canonical = buildCanonicalString(fields);
    return generateSHA256Hash(canonical);
}

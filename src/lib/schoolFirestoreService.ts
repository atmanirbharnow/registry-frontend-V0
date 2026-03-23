import {
    collection,
    doc,
    getDocs,
    getDoc,
    query,
    where,
    orderBy,
    limit,
    updateDoc,
    onSnapshot,
    Unsubscribe
} from "firebase/firestore";
import { db } from "./firebaseConfig";
import { School } from "@/types/school";
import { haversineDistance, normalizeSchoolName } from "./schoolUtils";

const SCHOOL_COLLECTION = "schools";
const BASELINE_COLLECTION = "schoolBaselines";
const PROJECT_COLLECTION = "projects";

export function getSchoolByRegistryIdRealtime(
    registryId: string,
    onUpdate: (school: School | null) => void,
    onError?: (error: any) => void
): Unsubscribe {
    const q = query(
        collection(db, SCHOOL_COLLECTION),
        where("registryId", "==", registryId)
    );

    return onSnapshot(q, async (snapshot) => {
        if (snapshot.empty) {
            onUpdate(null);
            return;
        }
        const schoolDoc = snapshot.docs[0];
        const schoolData = { id: schoolDoc.id, ...schoolDoc.data() } as School;
        
        // Fetch baseline in background if needed (though we now sync baseline to schools)
        onUpdate(schoolData);
    }, (error) => {
        console.error("Firestore Error:", error);
        onError?.(error);
    });
}

export async function getSchoolByRegistryId(registryId: string): Promise<School | null> {
    const q = query(
        collection(db, SCHOOL_COLLECTION),
        where("registryId", "==", registryId)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const schoolDoc = snap.docs[0];
    
    // Fetch baseline data too
    const baselineSnap = await getDoc(doc(db, BASELINE_COLLECTION, schoolDoc.id));
    const baselineData = baselineSnap.exists() ? baselineSnap.data() : {};
    
    return { id: schoolDoc.id, ...schoolDoc.data(), ...baselineData } as School;
}

export async function getSchoolBaseline(schoolId: string): Promise<Record<string, any>> {
    const baselineSnap = await getDoc(doc(db, BASELINE_COLLECTION, schoolId));
    return baselineSnap.exists() ? baselineSnap.data() : {};
}

export async function checkDuplicateSchool(place_id: string, schoolName: string, lat: number, lng: number): Promise<{ isDuplicate: boolean; registryId?: string; type?: 'BLOCK' | 'WARNING' }> {
    // Step 1: Place ID Check
    if (place_id) {
        const qPlace = query(collection(db, SCHOOL_COLLECTION), where("place_id", "==", place_id));
        const snapPlace = await getDocs(qPlace);
        if (!snapPlace.empty) {
            return { isDuplicate: true, registryId: snapPlace.docs[0].data().registryId, type: 'BLOCK' };
        }
    }

    // Step 2 & 3: Normalized Name + Geo Distance Check
    const normalized = normalizeSchoolName(schoolName);
    const qName = query(collection(db, SCHOOL_COLLECTION), where("name_normalized", "==", normalized));
    const snapName = await getDocs(qName);
    
    for (const d of snapName.docs) {
        const data = d.data();
        const distance = haversineDistance(lat, lng, data.lat, data.lng);
        if (distance < 500) {
            return { isDuplicate: true, registryId: data.registryId, type: 'BLOCK' };
        } else {
            return { isDuplicate: true, registryId: data.registryId, type: 'WARNING' };
        }
    }

    return { isDuplicate: false };
}

export async function getProjects() {
    try {
        const q = query(collection(db, PROJECT_COLLECTION), orderBy("name"));
        const snap = await getDocs(q);
        if (snap.empty) {
            return [
                { id: "proj-general", name: "General Carbon Registry Project" },
                { id: "proj-earthcarbon", name: "Earth Carbon Foundation - School Decarbonization" }
            ];
        }
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
        console.error("Error fetching projects:", error);
        return [
            { id: "proj-general", name: "General Carbon Registry Project" },
            { id: "proj-earthcarbon", name: "Earth Carbon Foundation - School Decarbonization" }
        ];
    }
}

export async function getSchoolActions(projectId: string) {
    try {
        const q = query(collection(db, "schoolActionsList"), where("projectId", "==", projectId));
        const snap = await getDocs(q);
        if (snap.empty) {
            return [
                { id: "ACT-001", type: "Solar Installation" },
                { id: "ACT-002", type: "Tree Plantation" },
                { id: "ACT-003", type: "Waste Management" },
                { id: "ACT-004", type: "Energy Efficiency" },
                { id: "ACT-005", type: "Water Conservation" },
                { id: "ACT-006", type: "Biodiversity Conservation" },
                { id: "ACT-007", type: "EV Integration" }
            ];
        }
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
        console.error("Error fetching actions:", error);
        return [
            { id: "ACT-001", type: "Solar Installation" },
            { id: "ACT-002", type: "Tree Plantation" },
            { id: "ACT-003", type: "Waste Management" },
            { id: "ACT-004", type: "Energy Efficiency" },
            { id: "ACT-005", type: "Water Conservation" },
            { id: "ACT-006", type: "Biodiversity Conservation" },
            { id: "ACT-007", type: "EV Integration" }
        ];
    }
}

export function getAllSchoolsRealtime(
    onUpdate: (schools: School[]) => void,
    onError?: (error: any) => void,
    limitCount: number = 50
): Unsubscribe {
    const q = query(
        collection(db, SCHOOL_COLLECTION)
    );

    return onSnapshot(q, async (snapshot) => {
        const schools = snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
        })) as School[];
        onUpdate(schools);
    }, (error) => {
        console.error("Firestore Error:", error);
        onError?.(error);
    });
}
export function getUserSchoolsRealtime(
    userId: string,
    onUpdate: (schools: School[]) => void,
    onError?: (error: any) => void
): Unsubscribe {
    const q = query(
        collection(db, SCHOOL_COLLECTION),
        where("userId", "==", userId)
    );

    return onSnapshot(q, (snapshot) => {
        const schools = snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
        })) as School[];
        
        // Sort by createdAt if it exists
        schools.sort((a, b) => {
            const timeA = (a.createdAt as any)?.toMillis?.() || 0;
            const timeB = (b.createdAt as any)?.toMillis?.() || 0;
            return timeB - timeA;
        });

        onUpdate(schools);
    }, (error) => {
        console.error("Firestore Error:", error);
        onError?.(error);
    });
}


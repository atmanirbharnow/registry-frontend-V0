import { Timestamp } from "firebase/firestore";

export type UserRole = "user" | "admin";

export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    photoURL: string | null;
    role: UserRole;
    socialHandles: [string, string, string];
    phone?: string;
    contactPerson?: string;
    institutionType?: "School" | "Corporate" | "NGO" | "Government" | "Individual";
    actorName?: string;
    createdAt: Timestamp;
    updatedAt?: Timestamp;
}

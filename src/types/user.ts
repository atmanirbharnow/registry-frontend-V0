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
    institutionType?: "School" | "Hospital" | "MSME" | "Commercial" | "NGO" | "Government" | "Individual";
    state?: string;
    pincode?: string;
    address?: string;
    city?: string;
    lat?: number;
    lng?: number;
    place_id?: string;
    sector?: string;
    consentVerified?: boolean;
    actorName?: string;
    createdAt: Timestamp;
    updatedAt?: Timestamp;
}

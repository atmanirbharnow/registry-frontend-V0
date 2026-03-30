import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebaseConfig";

// This is meant for server-side initial hydration (ISR)
export async function getPublicStats() {
  try {
    // Total Actions
    const actionsSnap = await getDocs(collection(db, "actions"));
    const totalActions = actionsSnap.size;

    // Verified Actions
    const verifiedQuery = query(collection(db, "actions"), where("status", "==", "verified"));
    const verifiedSnap = await getDocs(verifiedQuery);
    const verifiedActions = verifiedSnap.size;

    // Total CO2e (kg)
    let totalCO2eKg = 0;
    verifiedSnap.forEach(doc => {
      totalCO2eKg += (doc.data().co2eKg || 0);
    });

    // Total Schools
    const schoolsSnap = await getDocs(collection(db, "schools"));
    const totalSchools = schoolsSnap.size;
    
    // Entity count (Users)
    const usersSnap = await getDocs(collection(db, "users"));
    const totalEntities = usersSnap.size;

    return {
      totalActions,
      verifiedActions,
      totalSchools,
      totalEntities,
      totalCO2eTonnes: Math.round((totalCO2eKg / 1000) * 100) / 100,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error fetching public stats for landing page:", error);
    return {
      totalActions: 0,
      verifiedActions: 0,
      totalSchools: 0,
      totalEntities: 0,
      totalCO2eTonnes: 0,
      timestamp: new Date().toISOString()
    };
  }
}

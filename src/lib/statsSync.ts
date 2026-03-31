import { getDocs, collection, doc, setDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";

/**
 * Recalculates all registry stats from the browser and updates the public summary document.
 * This can be called manually by an admin or automatically after any data change.
 */
export async function syncPlatformStats(adminUid: string) {
  // 1. Fetch Registered Actions (Individual + School)
  const actionsSnap = await getDocs(collection(db, "actions"));
  const schoolsSnap = await getDocs(collection(db, "schools"));
  const totalRegisteredActions = actionsSnap.size + schoolsSnap.size;

  // 2. Fetch Verified Actions and Sum CO2e
  let totalVerifiedActions = 0;
  let totalCO2eKg = 0;

  actionsSnap.forEach(docSnap => {
    const data = docSnap.data();
    if (data.status === "verified" || data.status === "Verified") {
      totalVerifiedActions++;
      totalCO2eKg += data.co2eKg || (data.actionImpactTCO2e * 1000) || 0;
    }
  });

  schoolsSnap.forEach(docSnap => {
    const data = docSnap.data();
    if (data.status === "verified" || data.status === "Verified") {
      totalVerifiedActions++;
      // Schools often store as tCO2e, so we convert to Kg for standard summation
      const schoolCo2Kg = data.co2eKg || (data.tco2e_annual ? data.tco2e_annual * 1000 : 0) || (data.actionImpactTCO2e * 1000) || 0;
      totalCO2eKg += schoolCo2Kg;
    }
  });

  // 3. Fetch Total Organizations (Users count)
  const usersSnap = await getDocs(collection(db, "users"));
  const totalOrganizations = usersSnap.size;

  // 4. Update Public Stats Summary Document
  const statsData = {
    totalRegisteredActions,
    totalVerifiedActions,
    totalCO2eTonnes: Math.round((totalCO2eKg / 1000) * 100) / 100,
    totalOrganizations,
    lastUpdated: new Date().toISOString(),
    updatedBy: adminUid,
    syncMode: "browser-auto"
  };

  await setDoc(doc(db, "public_stats", "totals"), statsData);
  
  return statsData;
}

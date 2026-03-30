"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";

interface LiveStats {
  totalRegisteredActions: number;
  totalVerifiedActions: number;
  totalCO2eTonnes: number;
  totalOrganizations: number;
  loading: boolean;
}

export function useLiveStats(): LiveStats {
  const [stats, setStats] = useState<LiveStats>({
    totalRegisteredActions: 0,
    totalVerifiedActions: 0,
    totalCO2eTonnes: 0,
    totalOrganizations: 0,
    loading: true,
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        // 1. Fetch Registered Actions (Individual + School)
        const actionsSnap = await getDocs(collection(db, "actions"));
        const schoolActionsSnap = await getDocs(collection(db, "schoolActions"));
        
        console.log("Stats Debug: actions.size =", actionsSnap.size);
        console.log("Stats Debug: schoolActions.size =", schoolActionsSnap.size);

        const totalRegisteredActions = actionsSnap.size + schoolActionsSnap.size;

        // 2. Fetch Verified Actions and Sum CO2e
        // Use lowercase 'verified' as per ActionStatus type
        const verifiedActionsQuery = query(collection(db, "actions"), where("status", "in", ["verified", "Verified"]));
        const verifiedSchoolQuery = query(collection(db, "schoolActions"), where("status", "in", ["verified", "Verified"]));
        
        const [verifiedSnap, verifiedSchoolSnap] = await Promise.all([
          getDocs(verifiedActionsQuery),
          getDocs(verifiedSchoolQuery)
        ]);

        console.log("Stats Debug: verifiedSnap.size =", verifiedSnap.size);
        console.log("Stats Debug: verifiedSchoolSnap.size =", verifiedSchoolSnap.size);

        const totalVerifiedActions = verifiedSnap.size + verifiedSchoolSnap.size;

        let totalCO2eKg = 0;
        verifiedSnap.forEach((doc) => { 
          const data = doc.data();
          totalCO2eKg += data.co2eKg || data.actionImpactTCO2e * 1000 || 0; 
        });
        verifiedSchoolSnap.forEach((doc) => { 
          const data = doc.data();
          totalCO2eKg += data.co2eKg || data.actionImpactTCO2e * 1000 || 0; 
        });

        // 3. Fetch Total Organizations (Users count)
        const usersSnap = await getDocs(collection(db, "users"));
        console.log("Stats Debug: users.size =", usersSnap.size);
        const totalOrganizations = usersSnap.size;

        setStats({
          totalRegisteredActions,
          totalVerifiedActions,
          totalCO2eTonnes: Math.round((totalCO2eKg / 1000) * 100) / 100,
          totalOrganizations,
          loading: false,
        });
      } catch (error) {
        console.error("Failed to fetch live stats:", error);
        setStats((prev) => ({ ...prev, loading: false }));
      }
    }

    fetchStats();
    const interval = setInterval(fetchStats, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  return stats;
}

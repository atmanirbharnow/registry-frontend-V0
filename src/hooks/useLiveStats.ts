"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";

interface LiveStats {
  totalActions: number;
  verifiedActions: number;
  totalSchools: number;
  totalCO2eTonnes: number;
  totalEntities: number;
  loading: boolean;
}

export function useLiveStats(): LiveStats {
  const [stats, setStats] = useState<LiveStats>({
    totalActions: 0,
    verifiedActions: 0,
    totalSchools: 0,
    totalCO2eTonnes: 0,
    totalEntities: 0,
    loading: true,
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch all actions for total count
        const actionsSnap = await getDocs(collection(db, "actions"));
        const totalActions = actionsSnap.size;

        // Fetch verified actions and sum CO2e
        const verifiedQuery = query(
          collection(db, "actions"),
          where("status", "==", "verified")
        );
        const verifiedSnap = await getDocs(verifiedQuery);
        const verifiedActions = verifiedSnap.size;

        let totalCO2eKg = 0;
        verifiedSnap.forEach((doc) => {
          totalCO2eKg += doc.data().co2eKg || 0;
        });

        // Fetch total entities (users)
        const usersSnap = await getDocs(collection(db, "users"));
        const totalEntities = usersSnap.size;

        // Fetch schools count
        const schoolsSnap = await getDocs(collection(db, "schools"));
        const totalSchools = schoolsSnap.size;

        setStats({
          totalActions,
          verifiedActions,
          totalSchools,
          totalCO2eTonnes: Math.round((totalCO2eKg / 1000) * 100) / 100,
          totalEntities,
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

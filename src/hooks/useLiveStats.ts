"use client";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
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
    // Read from the public_stats summary document for maximum performance and public access
    const statsRef = doc(db, "public_stats", "totals");
    
    const unsubscribe = onSnapshot(statsRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setStats({
          totalRegisteredActions: data.totalRegisteredActions || 0,
          totalVerifiedActions: data.totalVerifiedActions || 0,
          totalCO2eTonnes: data.totalCO2eTonnes || 0,
          totalOrganizations: data.totalOrganizations || 0,
          loading: false,
        });
      } else {
        console.warn("Public stats document not found. Ensure sync-stats API is run.");
        setStats(prev => ({ ...prev, loading: false }));
      }
    }, (error) => {
      console.error("Failed to fetch live stats from public summary:", error);
      setStats(prev => ({ ...prev, loading: false }));
    });

    return () => unsubscribe();
  }, []);

  return stats;
}

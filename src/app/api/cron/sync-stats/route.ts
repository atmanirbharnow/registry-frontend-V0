import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(request: NextRequest) {
  try {
    // 1. Verify Secret Key from Authorization Header
    const authHeader = request.headers.get("Authorization");
    const secret = process.env.CRON_SECRET || "080e880fe7b1d3bd3d47547e41ec05e868143eb9f62a65f15783416901a1caa5"; 

    if (!authHeader || authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Perform Full Sync (Same logic as manual sync)
    
    // Fetch Registered Actions
    const actionsSnap = await adminDb.collection("actions").get();
    const schoolActionsSnap = await adminDb.collection("schoolActions").get();
    const totalRegisteredActions = actionsSnap.size + schoolActionsSnap.size;

    // Fetch Verified Actions and Sum CO2e
    let totalVerifiedActions = 0;
    let totalCO2eKg = 0;

    actionsSnap.forEach(doc => {
      const data = doc.data();
      if ((data.status === "verified" || data.status === "Verified")) {
        totalVerifiedActions++;
        totalCO2eKg += data.co2eKg || (data.actionImpactTCO2e * 1000) || 0;
      }
    });

    schoolActionsSnap.forEach(doc => {
      const data = doc.data();
      if ((data.status === "verified" || data.status === "Verified")) {
        totalVerifiedActions++;
        totalCO2eKg += data.co2eKg || (data.actionImpactTCO2e * 1000) || 0;
      }
    });

    // Fetch Total Organizations
    const usersSnap = await adminDb.collection("users").get();
    const totalOrganizations = usersSnap.size;

    // Update Public Stats
    const statsData = {
      totalRegisteredActions,
      totalVerifiedActions,
      totalCO2eTonnes: Math.round((totalCO2eKg / 1000) * 100) / 100,
      totalOrganizations,
      lastUpdated: new Date().toISOString(),
      updatedBy: "system-cron"
    };

    await adminDb.collection("public_stats").doc("totals").set(statsData);

    return NextResponse.json({ 
      success: true, 
      message: "Daily cron sync completed successfully",
      stats: statsData 
    });

  } catch (error: any) {
    console.error("Cron Sync Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

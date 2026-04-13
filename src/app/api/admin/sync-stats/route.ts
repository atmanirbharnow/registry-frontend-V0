import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(request: NextRequest) {
  try {
    const { adminUid } = await request.json();

    if (!adminUid) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Fetch Registered Actions (Individual + School)
    const actionsSnap = await adminDb.collection("actions").get();
    const schoolsSnap = await adminDb.collection("schools").get();
    const totalRegisteredActions = actionsSnap.size + schoolsSnap.size;

    // 2. Fetch Verified Actions and Sum CO2e
    let totalVerifiedActions = 0;
    let totalCO2eKg = 0;

    actionsSnap.forEach(doc => {
      const data = doc.data();
      if ((data.status === "verified" || data.status === "Verified")) {
        totalVerifiedActions++;
        totalCO2eKg += data.co2eKg || (data.actionImpactTCO2e * 1000) || 0;
      }
    });

    schoolsSnap.forEach(doc => {
      const data = doc.data();
      if ((data.status === "verified" || data.status === "Verified")) {
        totalVerifiedActions++;
        // Schools store impact in tCO2e (tco2e_annual), so we convert to Kg
        const schoolCo2Kg = data.co2eKg || (data.tco2e_annual ? data.tco2e_annual * 1000 : 0) || (data.actionImpactTCO2e * 1000) || 0;
        totalCO2eKg += schoolCo2Kg;
      }
    });

    // 3. Fetch Total Organizations (Users count)
    const usersSnap = await adminDb.collection("users").get();
    const totalOrganizations = usersSnap.size;

    // 4. Update Public Stats Summary Document
    const statsData = {
      totalRegisteredActions,
      totalVerifiedActions,
      totalCO2eTonnes: Math.round((totalCO2eKg / 1000) * 100) / 100,
      totalOrganizations,
      lastUpdated: new Date().toISOString(),
      updatedBy: adminUid
    };

    await adminDb.collection("public_stats").doc("totals").set(statsData);

    return NextResponse.json({ 
      success: true, 
      stats: statsData 
    });

  } catch (error: any) {
    console.error("Sync Stats Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

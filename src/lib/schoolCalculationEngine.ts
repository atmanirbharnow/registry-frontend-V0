import { SCHOOL_EMISSION_FACTORS, SCHOOL_FALLBACK_CONSTANTS, SCHOOL_CALCULATION_VERSION } from "./constants/schoolConstants";

export interface SchoolImpactInput {
    baselineEnergyGrid: number;
    baselineEnergyDiesel: number;
    baselineEnergySolar: number;
    baselineWaterMunicipal: number;
    baselineWaterRain: number;
    baselineWaterWaste: number;
    baselineWasteOrganic: number;
    baselineWasteInorganic: number;
    baselineWasteHazardous: number;
    waste_diverted_kg?: number;
    students_count: number;
    
    // Action details
    actionType?: string;
    actionQuantity?: number; // For schools, we've mapped electricity_kWh_year as quantity temporarily
    actions?: Array<{ actionType: string, quantity: number, unit?: string }>;
}

export interface SchoolImpactResult {
    tco2e_annual: number;
    atmanirbhar_pct: number;
    circularity_pct: number;
    carbon_intensity: number;
    
    energyCo2eKg: number;
    fuelCo2eKg: number;
    waterCo2eKg: number;
    wasteCo2eKg: number;
    
    calculationVersion: string;
}

export function calculateSchoolImpact(input: SchoolImpactInput): SchoolImpactResult {
    const {
        baselineEnergyGrid,
        baselineEnergyDiesel,
        baselineEnergySolar,
        baselineWaterMunicipal,
        baselineWaterRain,
        baselineWaterWaste,
        baselineWasteOrganic,
        baselineWasteInorganic,
        baselineWasteHazardous,
        waste_diverted_kg = 0,
        students_count,
        actionType = "",
        actionQuantity = 0,
        actions = []
    } = input;

    const safeStudents = Math.max(1, students_count);

    // 1. Annual Baseline (Pre-Action / Current State)
    const annualEnergyCo2eKg = (
        (baselineEnergyGrid * SCHOOL_EMISSION_FACTORS.ELECTRICITY) +
        (baselineEnergyDiesel * SCHOOL_EMISSION_FACTORS.DIESEL)
    ) * 12;

    const annualWaterCo2eKg = (baselineWaterMunicipal / 1000 * SCHOOL_EMISSION_FACTORS.WATER_SUPPLY) * 12;
    
    const totalBaselineWaste = baselineWasteOrganic + baselineWasteInorganic + baselineWasteHazardous;
    const annualWasteCo2eKg = (totalBaselineWaste * SCHOOL_EMISSION_FACTORS.WASTE_LANDFILL) * 12;

    const totalBaselineEmissionsKg = annualEnergyCo2eKg + annualWaterCo2eKg + annualWasteCo2eKg;

    // 2. Reduction from Action
    let actionLocalEnergy = 0;
    let actionLocalWater = 0;
    let actionLocalWaste = 0;
    let reductionKg = 0;

    const actionList = actions.length > 0 ? actions : (actionType ? [{ actionType, quantity: actionQuantity }] : []);

    for (const act of actionList) {
        const type = act.actionType.toLowerCase();
        const quantity = act.quantity || 0;
        
        // Monthly impact calculation (School actionQuantity is usually monthly or annual context)
        const type_lower = type.toLowerCase();
        
        if (type === "solar_rooftop") {
            // Assume quantity is kW (rooftop). 1 kW = 125 kWh/mo
            actionLocalEnergy += quantity * 125;
            reductionKg += (quantity * 125) * SCHOOL_EMISSION_FACTORS.ELECTRICITY;
        } else if (type === "solar_water_heater") {
            // 800kg/yr per 100 LPD -> monthly
            reductionKg += (quantity / 100) * 800 / 12; 
            actionLocalEnergy += (quantity / 100) * 125;
        } else if (type === "biogas_cooking") {
            // Biogas cooking is mapped to energy savings
            actionLocalEnergy += quantity * 30; // approx m3 to kWh equivalent
            reductionKg += (quantity / 2) * 1.2 * 1000 / 12;
        } else if (type === "led_retrofit") {
            // Efficiency / LED Retrofit saves energy
            const savings = quantity * 5; 
            actionLocalEnergy += savings;
            reductionKg += savings * SCHOOL_EMISSION_FACTORS.ELECTRICITY;
        } else if (type === "rainwater_harvesting") {
            actionLocalWater += quantity;
            reductionKg += (quantity * 47.4) / 12;
        } else if (type === "waterless_urinals") {
            // ~40,000 L saved/yr -> ~20kg CO2e saving
            actionLocalWater += quantity * 3333; 
            reductionKg += (quantity * 20) / 12;
        } else if (type === "wastewater_recycling") {
            actionLocalWater += quantity * 30; // m3/day to monthly
            reductionKg += (quantity * 30) * 0.5;
        } else if (type === "composting") {
            // Waste processing
            actionLocalWaste += quantity;
            reductionKg += quantity * 0.45;
        } else if (type_lower.includes("tree")) {
            reductionKg += quantity * 20 / 12; // 20kg per tree/yr
        }
    }

    const tco2e_annual = (reductionKg * 12) / 1000; // Annualized

    // 3. Atmanirbhar Score (Σ Local / Σ Total)
    const localSum = 
        (baselineEnergySolar + actionLocalEnergy) +
        (baselineWaterRain + baselineWaterWaste + actionLocalWater) +
        (baselineWasteOrganic + waste_diverted_kg + actionLocalWaste);

    const totalEnergy = baselineEnergyGrid + baselineEnergyDiesel + baselineEnergySolar + actionLocalEnergy;
    const totalWater = baselineWaterMunicipal + baselineWaterRain + baselineWaterWaste + actionLocalWater;
    const totalWaste = baselineWasteOrganic + baselineWasteInorganic + baselineWasteHazardous + actionLocalWaste;

    const totalSum = totalEnergy + totalWater + totalWaste;
    const atmanirbhar_pct = totalSum > 0 ? (localSum / totalSum) * 100 : 0;

    // 4. Circularity Score (Diverted / Total Generated)
    const totalWasteGenerated = baselineWasteOrganic + baselineWasteInorganic + baselineWasteHazardous;
    const totalDiverted = waste_diverted_kg + actionLocalWaste; // Action + Baseline Diverted
    
    let circularity_pct = 0;
    if (totalWasteGenerated > 0) {
        circularity_pct = (totalDiverted / totalWasteGenerated) * 100;
    } else if (totalDiverted > 0) {
        circularity_pct = 100;
    }

    const carbon_intensity = (totalBaselineEmissionsKg / 1000) / safeStudents;

    return {
        tco2e_annual: Math.round(tco2e_annual * 1000) / 1000,
        atmanirbhar_pct: Math.min(100, Math.round(atmanirbhar_pct * 10) / 10),
        circularity_pct: Math.min(100, Math.round(circularity_pct * 10) / 10),
        carbon_intensity: Math.round(carbon_intensity * 100) / 100,
        energyCo2eKg: Math.round(annualEnergyCo2eKg),
        fuelCo2eKg: Math.round(baselineEnergyDiesel * SCHOOL_EMISSION_FACTORS.DIESEL * 12),
        waterCo2eKg: Math.round(annualWaterCo2eKg),
        wasteCo2eKg: Math.round(annualWasteCo2eKg),
        calculationVersion: SCHOOL_CALCULATION_VERSION
    };
}

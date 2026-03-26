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
    students_count: number;
    
    // Action details
    actionType: string;
    actionQuantity: number; // For schools, we've mapped electricity_kWh_year as quantity temporarily
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
        students_count,
        actionType,
        actionQuantity
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

    const type = actionType.toLowerCase();
    
    // Monthly impact calculation (School actionQuantity is usually monthly or annual context)
    if (type.includes("solar")) {
        // Assume actionQuantity is kW (rooftop). 1 kW = 125 kWh/mo
        actionLocalEnergy = actionQuantity * 125;
        reductionKg = actionLocalEnergy * SCHOOL_EMISSION_FACTORS.ELECTRICITY;
    } else if (type.includes("efficiency") || type.includes("led")) {
        // Efficiency saves energy from baseline
        actionLocalEnergy = baselineEnergyGrid * 0.2; // Example 20% savings
        reductionKg = actionLocalEnergy * SCHOOL_EMISSION_FACTORS.ELECTRICITY;
    } else if (type.includes("water") || type.includes("rainwater")) {
        // Assume actionQuantity is Liters/month
        actionLocalWater = actionQuantity;
        reductionKg = (actionLocalWater / 1000) * SCHOOL_EMISSION_FACTORS.WATER_SUPPLY;
    } else if (type.includes("waste") || type.includes("compost")) {
        // Assume actionQuantity is kg/month
        actionLocalWaste = actionQuantity;
        reductionKg = actionLocalWaste * SCHOOL_EMISSION_FACTORS.WASTE_LANDFILL;
    } else if (type.includes("tree")) {
        reductionKg = actionQuantity * 20; // 20kg per tree/yr
    }

    const tco2e_annual = (reductionKg * 12) / 1000; // Annualized

    // 3. Atmanirbhar Score (Σ Local / Σ Total)
    const localSum = 
        (baselineEnergySolar + actionLocalEnergy) +
        (baselineWaterRain + baselineWaterWaste + actionLocalWater) +
        (baselineWasteOrganic + actionLocalWaste);

    const totalEnergy = baselineEnergyGrid + baselineEnergyDiesel + baselineEnergySolar + actionLocalEnergy;
    const totalWater = baselineWaterMunicipal + baselineWaterRain + baselineWaterWaste + actionLocalWater;
    const totalWaste = baselineWasteOrganic + baselineWasteInorganic + baselineWasteHazardous + actionLocalWaste;

    const totalSum = totalEnergy + totalWater + totalWaste;
    const atmanirbhar_pct = totalSum > 0 ? (localSum / totalSum) * 100 : 0;

    // 4. Circularity Score (Diverted / Total Generated)
    const totalWasteGenerated = Math.max(baselineWasteOrganic + baselineWasteInorganic + baselineWasteHazardous, actionLocalWaste);
    const totalDiverted = actionLocalWaste + baselineWasteOrganic; // Assume organic waste is diverted/composted
    const circularity_pct = totalWasteGenerated > 0 ? (totalDiverted / totalWasteGenerated) * 100 : 0;

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

/**
 * Calculation Engine - Phase 2 Production Version
 * 
 * Uses client-approved emission factors from Earth Carbon Foundation.
 * Structured for easy Phase 3 upgrade without UI changes.
 * 
 * © 2024 Earth Carbon Foundation. Proprietary calculation methodologies.
 */

import { EMISSION_FACTORS_PHASE2 } from './constants/emissionFactors';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface CalculationInput {
    actionType: string;
    quantity: number; // Monthly action impact (kWh, L, kg) or capacity (kW, LPD)
    unit: string;

    // Baseline Usage (Monthly Average - Step 1)
    baselineEnergyGrid?: number;
    baselineEnergyDiesel?: number;
    baselineEnergySolar?: number;
    baselineWaterMunicipal?: number;
    baselineWaterRain?: number;
    baselineWaterWaste?: number;
    baselineWasteOrganic?: number;
    baselineWasteInorganic?: number;
    baselineWasteHazardous?: number;
    
    beneficiariesCount?: number;
}

export interface CalculationResult {
    tCO2e: number; // Total Annual Baseline Footprint
    actionImpactTCO2e: number; // Annual Savings from the specific action
    atmanirbharScore: number;
    circularityScore: number;
    carbonIntensity: number; // tCO2e per beneficiary
    calculationVersion: string;
    methodology: string;
    emissionFactorUsed?: string;
}

// ============================================
// MAIN CALCULATION FUNCTION
// ============================================

/**
 * Calculate environmental impact using Phase 2 methodology
 */
export function calculateImpactPhase2(input: CalculationInput): CalculationResult {
    const { beneficiariesCount = 1 } = input;
    
    // 1. Calculate Baseline Emissions (Annualized)
    const baselineCO2eKg = calculateBaselineCO2e(input);
    const actionImpactKg = calculateCO2ePhase2(input);
    
    // 2. Scores
    const atmanirbharScore = calculateAtmanirbharPhase2(input);
    const circularityScore = calculateCircularityScore(input);

    const totalTCO2e = baselineCO2eKg / 1000;
    const carbonIntensity = totalTCO2e / Math.max(1, beneficiariesCount);

    return {
        tCO2e: Math.round(totalTCO2e * 1000) / 1000,
        actionImpactTCO2e: Math.round((actionImpactKg / 1000) * 1000) / 1000,
        atmanirbharScore,
        circularityScore,
        carbonIntensity: Math.round(carbonIntensity * 100) / 100,
        calculationVersion: 'v1.2-phase2-audit-fixed',
        methodology: 'ECF Combined Resource Ratio',
        emissionFactorUsed: getEmissionFactorDescription(input.actionType),
    };
}

// ============================================
// CIRCULARITY CALCULATION
// ============================================

/**
 * Circularity % = waste_diverted_kg / waste_generated_kg * 100
 * Capped at 100%.
 */
/**
 * Circularity % = waste_diverted / total_waste_generated * 100
 * Capped at 100%.
 */
function calculateCircularityScore(input: CalculationInput): number {
    const { 
        baselineWasteOrganic = 0, 
        baselineWasteInorganic = 0, 
        baselineWasteHazardous = 0,
        actionType = "",
        quantity = 0 
    } = input;
    
    // Total throughput = Sum of all waste streams + any new diverted amount not accounted for
    const totalBaselineWaste = baselineWasteOrganic + baselineWasteInorganic + baselineWasteHazardous;
    
    // Diverted amount
    let divertedWaste = baselineWasteOrganic; // Assume organic waste is diverted/composted
    if (actionType.toLowerCase().includes("waste") || actionType.toLowerCase().includes("recycling") || actionType.toLowerCase().includes("compost")) {
        divertedWaste += quantity; // Monthly kg
    }

    // Denominator should be at least as large as what we diverted
    const totalMaterialThroughput = Math.max(totalBaselineWaste, divertedWaste);
    if (totalMaterialThroughput === 0) return 0;

    const score = (divertedWaste / totalMaterialThroughput) * 100;
    return Math.min(100, Math.round(score * 10) / 10);
}

// ============================================
// BASELINE CO2e CALCULATION
// ============================================

/**
 * Annual Baseline Footprint = Σ [Monthly Consumption × Factor × 12]
 */
function calculateBaselineCO2e(input: CalculationInput): number {
    const {
        baselineEnergyGrid = 0,
        baselineEnergyDiesel = 0,
        baselineEnergySolar = 0,
        baselineWaterMunicipal = 0,
        baselineWasteOrganic = 0,
        baselineWasteInorganic = 0,
        baselineWasteHazardous = 0
    } = input;

    // Energy: Grid (0.82), Diesel (2.68), Solar Credit (-0.82)
    const energyCo2eMonthly = 
        (baselineEnergyGrid * 0.82) + 
        (baselineEnergyDiesel * 2.68) - 
        (baselineEnergySolar * 0.82);

    // Water: Municipal (0.5 kg/m3 = 0.0005 kg/L)
    const waterCo2eMonthly = (baselineWaterMunicipal / 1000) * 0.5;

    // Waste: Landfill (0.5 kg/kg)
    const totalWasteMonthly = baselineWasteOrganic + baselineWasteInorganic + baselineWasteHazardous;
    const wasteCo2eMonthly = totalWasteMonthly * 0.5;

    const totalMonthlyKg = energyCo2eMonthly + waterCo2eMonthly + wasteCo2eMonthly;
    return totalMonthlyKg * 12; // Annualize
}

// ============================================
// CO2e CALCULATION (Action Specific)
// ============================================

function calculateCO2ePhase2(input: CalculationInput): number {
    const { actionType, quantity } = input;
    let co2eKg = 0;

    switch (actionType) {
        case 'solar_rooftop': {
            // Factor: 1.23 tCO2e per year per kW (Earth Carbon Phase 2)
            co2eKg = quantity * 1.23 * 1000;
            break;
        }
        case 'solar_water_heater': {
            // Factor: 800 kg/yr per 100 LPD
            co2eKg = (quantity / 100) * 800;
            break;
        }
        case 'borewell_water': {
            // factor: 0.67 kg per kL (pumping 150m)
            co2eKg = quantity * 0.67;
            break;
        }
        case 'rainwater_harvesting': {
            // Mid-point of 26.8 - 68.0 kg/yr for 1000L/day
            co2eKg = quantity * 47.4; 
            break;
        }
        case 'biogas_plant':
        case 'biogas': {
            // Factor: 1.2 tCO2e/yr per plant
            co2eKg = quantity * 1.2 * 1000;
            break;
        }
        case 'composting': {
            // Factor: 0.45 kg per kg food waste
            co2eKg = quantity * 0.45;
            break;
        }
        case 'plastic_recycling': {
            co2eKg = quantity * 1.5;
            break;
        }
        case 'paper_recycling': {
            co2eKg = quantity * 0.9;
            break;
        }
        case 'textile_recycling': {
            co2eKg = quantity * 2.2;
            break;
        }
        case 'metal_recycling': {
            co2eKg = quantity * 3.0;
            break;
        }
        case 'turn_off_bulb': {
            // Factor: 17.96 kg/yr per bulb (1 hr/day reduction)
            co2eKg = quantity * 17.96;
            break;
        }
        case 'turn_off_fan': {
            // Factor: 7.68 kg/yr per fan (1 hr/day reduction)
            co2eKg = quantity * 7.68;
            break;
        }
        case 'wastewater_recycling': {
            // quantity = kL/day capacity. Saves municipal water (0.5 kg/kL)
            co2eKg = (quantity * 365) * 0.5;
            break;
        }
        case 'tree_plantation': {
            // Approx 22 kg/tree/year
            co2eKg = quantity * 22;
            break;
        }
        case 'battery_storage': {
            // Efficiency based - estimated 10% grid displacement optimization
            co2eKg = quantity * 0.82 * 0.1 * 1000;
            break;
        }
        default: {
            co2eKg = 0;
        }
    }

    // Round to 3 decimal places
return Math.round(co2eKg * 1000) / 1000;
}

// ============================================
// ATMANIRBHAR CALCULATION
// ============================================

/**
 * Atmanirbhar % = (Σ Local Resource Value / Σ Total Resource Value) × 100
 * = (renewable_kWh + rainwater_harvested_L + waste_processed_kg)
 *   / (total_electricity_kWh + total_water_L + total_waste_kg) * 100
 */
function calculateAtmanirbharPhase2(input: CalculationInput): number {
    const {
        baselineEnergyGrid = 0,
        baselineEnergyDiesel = 0,
        baselineEnergySolar = 0,
        baselineWaterMunicipal = 0,
        baselineWaterRain = 0,
        baselineWaterWaste = 0,
        baselineWasteOrganic = 0,
        baselineWasteInorganic = 0,
        baselineWasteHazardous = 0,
        actionType = "",
        quantity = 0,
    } = input;

    // 1. Calculate Action Contributions (converted to monthly resource units)
    let actionLocalEnergy = 0;
    let actionLocalWater = 0;
    let actionLocalWaste = 0;

    const type = actionType.toLowerCase();

    if (type.includes("solar")) {
        // quantity is kW (rooftop) or units (heater).
        // 1 kW rooftop = 1500 kWh/yr = 125 kWh/mo
        // 100 LPD heater geyser displacement = 1500 kWh/yr = 125 kWh/mo
        if (type.includes("rooftop")) {
            actionLocalEnergy = quantity * 125;
        } else {
            actionLocalEnergy = (quantity / 100) * 125;
        }
    } else if (type.includes("rainwater") || type.includes("rwh")) {
        // quantity is units of 1000L/day. 1 unit = 30k L/mo
        actionLocalWater = quantity * 30000;
    } else if (type.includes("waste") || type.includes("recycling") || type.includes("compost")) {
        // quantity is kg/mo
        actionLocalWaste = quantity;
    } else if (type.includes("wastewater")) {
        // quantity is kL/day. 1 kL/day = 30k L/mo
        actionLocalWater = quantity * 30000;
    } else if (type.includes("led") || type.includes("efficiency")) {
        // Efficiency adds to local energy 'savings'
        actionLocalEnergy = baselineEnergyGrid * 0.2; // Estimated 20% savings
    }

    // 2. Sum Numerator (Local Resources)
    const localSum =
        (baselineEnergySolar + actionLocalEnergy) +
        (baselineWaterRain + baselineWaterWaste + actionLocalWater) +
        (baselineWasteOrganic + actionLocalWaste);

    // 3. Sum Denominator (Total Resources)
    const totalEnergy = baselineEnergyGrid + baselineEnergyDiesel + baselineEnergySolar + actionLocalEnergy;
    const totalWater = baselineWaterMunicipal + baselineWaterRain + baselineWaterWaste + actionLocalWater;
    const totalWaste = baselineWasteOrganic + baselineWasteInorganic + baselineWasteHazardous + actionLocalWaste;

    const totalSum = totalEnergy + totalWater + totalWaste;

    if (totalSum === 0) return 0;

    const score = (localSum / totalSum) * 100;
    return Math.min(100, Math.round(score * 10) / 10);
}


// ============================================
// HELPER FUNCTIONS
// ============================================

function getEmissionFactorDescription(actionType: string): string {
    const descriptions: Record<string, string> = {
        solar_rooftop: '1.23 tCO2e/yr per kW',
        solar_water_heater: '800 kg/yr per 100 LPD',
        borewell_water: '0.67 kg per kL (pumping 150m)',
        rainwater_harvesting: '26.8-68 kg/yr per 1000L/day',
        biogas: '1.2 tCO2e/yr (2m³ Plant)',
        composting: '0.45 kg per kg food waste',
        plastic_recycling: '1.5 kg per kg plastic',
        paper_recycling: '0.9 kg per kg paper',
        textile_recycling: '2.2 kg per kg textile',
        metal_recycling: '3.0 kg per kg metal',
        turn_off_bulb: '17.96 kg/yr per bulb (1 hr/day)',
        turn_off_fan: '7.68 kg/yr per fan (1 hr/day)',
    };

    return descriptions[actionType] || 'Standard emission factor';
}

/**
 * Validate calculation input
 */
export function validateCalculationInput(input: CalculationInput): {
    valid: boolean;
    errors: string[]
} {
    const errors: string[] = [];

    if (!input.actionType) {
        errors.push('Action type is required');
    }

    if (!input.quantity || input.quantity <= 0) {
        errors.push('Quantity must be greater than 0');
    }

    if (!input.unit) {
        errors.push('Unit is required');
    }

    // Validate baseline fields if provided
    const baselineFields = [
        { value: input.baselineEnergyGrid, name: 'Grid Electricity' },
        { value: input.baselineWaterMunicipal, name: 'Water Consumption' },
    ];

    baselineFields.forEach(field => {
        if (field.value !== undefined && field.value < 0) {
            errors.push(`${field.name} must be 0 or greater`);
        }
    });

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Get all available action types with their units
 */
export function getAvailableActionTypes(): Array<{ value: string; label: string; unit: string }> {
    return [
        { value: 'solar_rooftop', label: 'Solar Rooftop (1 kW)', unit: 'kW' },
        { value: 'solar_water_heater', label: 'Solar Water Heater (100 LPD)', unit: 'units' },
        { value: 'borewell_water', label: 'Water Borewell (1 kL)', unit: 'kL' },
        { value: 'rainwater_harvesting', label: 'Water Rainwater (1000 L/day)', unit: 'units' },
        { value: 'biogas', label: 'Biogas (2m³ Plant)', unit: 'plants' },
        { value: 'composting', label: 'Waste Composting (1 kg food)', unit: 'kg' },
        { value: 'plastic_recycling', label: 'Waste Plastic Recycling (1 kg)', unit: 'kg' },
        { value: 'paper_recycling', label: 'Waste Paper Recycling (1 kg)', unit: 'kg' },
        { value: 'textile_recycling', label: 'Waste Textile Recycling (1 kg)', unit: 'kg' },
        { value: 'metal_recycling', label: 'Waste Metal Recycling (1 kg)', unit: 'kg' },
        { value: 'turn_off_bulb', label: 'Lighting Turn Off Bulb (1 hr/day)', unit: 'bulbs' },
        { value: 'turn_off_fan', label: 'Lighting Turn Off Fan (1 hr/day)', unit: 'fans' },
    ];
}

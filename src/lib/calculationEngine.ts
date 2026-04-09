/**
 * Calculation Engine - Phase 2 Production Version
 * 
 * Uses client-approved emission factors from Climate Asset Foundation.
 * Structured for easy Phase 3 upgrade without UI changes.
 * 
 * © 2024 Climate Asset Foundation. Proprietary calculation methodologies.
 */

import { EMISSION_FACTORS_PHASE2 } from './constants/emissionFactors';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface CalculationInput {
    actionType?: string;
    quantity?: number; // Monthly action impact (kWh, L, kg) or capacity (kW, LPD)
    unit?: string;
    actions?: Array<{ actionType: string, quantity: number, unit?: string }>;

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
    baselineWasteDiverted?: number;
    
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
        methodology: 'CAF Combined Resource Ratio',
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
        baselineWasteDiverted = 0,
        actionType = "",
        quantity = 0,
        actions = []
    } = input;

    const totalBaselineWaste = baselineWasteOrganic + baselineWasteInorganic + baselineWasteHazardous;

    const actionList = actions.length > 0 ? actions : (actionType ? [{ actionType, quantity }] : []);

    let actionWasteDiverted = 0;
    for (const act of actionList) {
        const type = act.actionType.toLowerCase();
        if (type.includes("waste") || type.includes("recycling") || type.includes("compost") || type.includes("biogas_digester") || type.includes("material_recovery") || type.includes("plastic") || type.includes("paper") || type.includes("metal") || type.includes("textile")) {
            actionWasteDiverted += act.quantity || 0;
        }
    }

    let divertedWaste = baselineWasteDiverted + actionWasteDiverted;

    if (totalBaselineWaste === 0) {
        return divertedWaste > 0 ? 100 : 0;
    }

    const score = (divertedWaste / totalBaselineWaste) * 100;
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
    const { actionType = "", quantity = 0, actions = [] } = input;
    let totalCo2eKg = 0;

    const actionList = actions.length > 0 ? actions : (actionType ? [{ actionType, quantity }] : []);

    for (const act of actionList) {
        let co2eKg = 0;
        const qty = act.quantity || 0;
        switch (act.actionType) {
            case 'solar_rooftop': {
                co2eKg = qty * 1.23 * 1000;
                break;
            }
            case 'solar_water_heater': {
                co2eKg = (qty / 100) * 800;
                break;
            }
            case 'rainwater_harvesting': {
                co2eKg = qty * 47.4; 
                break;
            }
            case 'biogas_cooking': {
                // qty is m3/day. 1 m3/day is approx 1.2 tCO2e/yr
                co2eKg = (qty / 2) * 1.2 * 1000;
                break;
            }
            case 'composting': {
                co2eKg = qty * 0.45;
                break;
            }
            case 'wastewater_recycling': {
                co2eKg = (qty * 365) * 0.5;
                break;
            }
            case 'led_retrofit': {
                // qty is fixtures. ~0.05 tCO2e/yr per fixture
                co2eKg = qty * 50;
                break;
            }
            case 'waterless_urinals': {
                // ~40,000 L saved/yr -> ~20kg CO2e saving
                co2eKg = qty * 20;
                break;
            }
        }
        totalCo2eKg += co2eKg;
    }

    return Math.round(totalCo2eKg * 1000) / 1000;
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
        actions = []
    } = input;

    let actionLocalEnergy = 0;
    let actionLocalWater = 0;
    let actionLocalWaste = 0;

    const actionList = actions.length > 0 ? actions : (actionType ? [{ actionType, quantity }] : []);

    for (const act of actionList) {
        const type = act.actionType.toLowerCase();
        const qty = act.quantity || 0;

        if (type.includes("solar")) {
            if (type.includes("rooftop")) {
                actionLocalEnergy += qty * 125;
            } else {
                actionLocalEnergy += (qty / 100) * 125;
            }
        } else if (type.includes("rainwater") || type.includes("rwh")) {
            actionLocalWater += qty * 30000;
        } else if (type.includes("waste") || type.includes("recycling") || type.includes("compost")) {
            actionLocalWaste += qty;
        } else if (type.includes("wastewater")) {
            actionLocalWater += qty * 30000;
        } else if (type.includes("led") || type.includes("efficiency")) {
            actionLocalEnergy += baselineEnergyGrid * 0.2; 
        }
    }

    const localSum =
        (baselineEnergySolar + actionLocalEnergy) +
        (baselineWaterRain + baselineWaterWaste + actionLocalWater) +
        (baselineWasteOrganic + actionLocalWaste);

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
        rainwater_harvesting: '26.8-68 kg/yr per 1000L/day',
        biogas_cooking: '1.2 tCO2e/yr per 2m3/day',
        composting: '0.45 kg per kg food waste',
        wastewater_recycling: '0.5 kg per m3 recycled',
        led_retrofit: '50 kg/yr per fixture',
        waterless_urinals: '20 kg/yr per urinal',
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
        { value: 'solar_rooftop', label: 'Rooftop Solar', unit: 'kW' },
        { value: 'solar_water_heater', label: 'Solar Water Heating', unit: 'liters' },
        { value: 'rainwater_harvesting', label: 'Rain Water Harvesting', unit: 'liters' },
        { value: 'biogas_cooking', label: 'Biogas (cooking)', unit: 'm3/day' },
        { value: 'waterless_urinals', label: 'Waterless Urinals', unit: 'units' },
        { value: 'composting', label: 'Waste Composting', unit: 'Kg' },
        { value: 'wastewater_recycling', label: 'Waste Water Recycled', unit: 'm3' },
        { value: 'led_retrofit', label: 'LED Retrofit', unit: 'fixtures' },
    ];
}

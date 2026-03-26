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
    quantity: number;
    unit: string;

    // Current Usage (New)
    electricityUseKwh?: number;
    fuelDieselLiters?: number;
    fuelPetrolLiters?: number;
    fuelKeroseneLiters?: number;
    waterUsageKLD?: number;
    wasteOrganicKg?: number;
    wasteTextileKg?: number;
    wastePlasticKg?: number;
    wasteElectronicKg?: number;

    // Action Specific (New)
    capacityKw?: number;
    installationDate?: string;
    sizeLiters?: number;
    capacity?: string;
    tankCapacityKL?: number;
    capacityM3?: string;

    // Baseline Data (Updated)
    baselineElectricityKwh?: number;
    baselineWaterKL?: number;
    baselineWasteOrganicKg?: number;
    baselineWastePaperKg?: number;
    baselineWastePlasticKg?: number;
    baselineWasteTextileKg?: number;
    baselineWasteEWasteKg?: number;

    // Optional circularity data (waste)
    wasteGeneratedKg?: number;
    wasteDivertedKg?: number;

    // Optional action-specific parameters
    oldStarRating?: number;  // For refrigerator upgrade
    newStarRating?: number;
    oldTempC?: number;        // For geyser temp reduction
    newTempC?: number;
    oldWattage?: number;      // For LED replacement
    newWattage?: number;
    hoursPerDay?: number;
}

export interface CalculationResult {
    tCO2e: number;
    atmanirbharScore: number;
    circularityScore: number;
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
    const co2eKg = calculateCO2ePhase2(input);
    const atmanirbharScore = calculateAtmanirbharPhase2(input);
    const circularityScore = calculateCircularityScore(input);

    return {
        tCO2e: co2eKg / 1000, // Convert kg to tonnes
        atmanirbharScore,
        circularityScore,
        calculationVersion: 'v1.0-phase2',
        methodology: 'ECF Simplified Factors',
        emissionFactorUsed: getEmissionFactorDescription(input.actionType),
    };
}

// ============================================
// CIRCULARITY CALCULATION
// ============================================

/**
 * Circularity Score = (waste diverted from landfill / waste generated) * 100
 * Same formula as school action module. Capped at 100%.
 */
function calculateCircularityScore(input: CalculationInput): number {
    const { wasteGeneratedKg, wasteDivertedKg } = input;
    
    // Weighted waste streams (future-proofing for multiple streams)
    const streams = [
        { generated: wasteGeneratedKg || 0, diverted: wasteDivertedKg || 0, weight: 1.0 }
    ];

    let totalScore = 0;
    let totalWeight = 0;

    streams.forEach(s => {
        if (s.generated > 0) {
            const rawScore = (s.diverted / s.generated) * 100;
            const cappedScore = Math.min(100, rawScore); // Cap individual at 100%
            totalScore += cappedScore * s.weight;
            totalWeight += s.weight;
        }
    });

    if (totalWeight === 0) return 0;
    return Math.round((totalScore / totalWeight) * 10) / 10;
}

// ============================================
// CO2e CALCULATION (Using Client's Factors)
// ============================================

function calculateCO2ePhase2(input: CalculationInput): number {
    const { actionType, quantity, baselineElectricityKwh, baselineWaterKL, baselineWasteOrganicKg } = input;

    let co2eKg = 0;

    switch (actionType) {
        case 'solar_rooftop': {
            // Factor: 1.23 tCO2e per year per kW
            co2eKg = quantity * EMISSION_FACTORS_PHASE2.SOLAR_ROOFTOP.factor * 1000;
            break;
        }
        case 'solar_water_heater': {
            // Factor: 800 kg/yr per 100 LPD
            co2eKg = (quantity / 100) * EMISSION_FACTORS_PHASE2.SOLAR_WATER_HEATER.factor;
            break;
        }

        case 'borewell_water': {
            // factor: 0.67 kg per kL
            co2eKg = quantity * EMISSION_FACTORS_PHASE2.BOREWELL_WATER.factor;
            break;
        }

        case 'rainwater_harvesting': {
            // Use mid-point of 26.8 - 68.0 kg/yr for 1000L/day
            const avgFactor = (EMISSION_FACTORS_PHASE2.RAINWATER_HARVESTING.factorMin +
                EMISSION_FACTORS_PHASE2.RAINWATER_HARVESTING.factorMax) / 2;
            co2eKg = quantity * avgFactor;
            break;
        }

        case 'biogas': {
            // Use client's factor: 1.2 tCO2e/yr per plant
            co2eKg = quantity * EMISSION_FACTORS_PHASE2.BIOGAS_PLANT.factor * 1000;
            break;
        }

        case 'composting': {
            // Use client's factor: 0.45 kg per kg food waste
            co2eKg = quantity * EMISSION_FACTORS_PHASE2.COMPOSTING.factor;
            break;
        }

        case 'plastic_recycling': {
            co2eKg = quantity * EMISSION_FACTORS_PHASE2.PLASTIC_RECYCLING.factor;
            break;
        }

        case 'paper_recycling': {
            co2eKg = quantity * EMISSION_FACTORS_PHASE2.PAPER_RECYCLING.factor;
            break;
        }

        case 'textile_recycling': {
            co2eKg = quantity * EMISSION_FACTORS_PHASE2.TEXTILE_RECYCLING.factor;
            break;
        }

        case 'metal_recycling': {
            co2eKg = quantity * EMISSION_FACTORS_PHASE2.METAL_RECYCLING.factor;
            break;
        }

        case 'turn_off_bulb': {
            // Factor: 17.96 kg/yr per bulb (1 hr/day reduction)
            co2eKg = quantity * EMISSION_FACTORS_PHASE2.LIGHTING_BULB.factor;
            break;
        }

        case 'turn_off_fan': {
            // Factor: 7.68 kg/yr per fan (1 hr/day reduction)
            co2eKg = quantity * EMISSION_FACTORS_PHASE2.LIGHTING_FAN.factor;
            break;
        }

        // Keep legacy for safety but these are new primary handlers
        case 'rwh': {
            const avgFactor = (EMISSION_FACTORS_PHASE2.RAINWATER_HARVESTING.factorMin +
                EMISSION_FACTORS_PHASE2.RAINWATER_HARVESTING.factorMax) / 2;
            co2eKg = quantity * avgFactor;
            break;
        }

        // Legacy action types (keep for backward compatibility)
        case 'swh': {
            // Solar water heater: 100L saves ~1500 kWh/year
            const energySavings = (quantity / 100) * 1500;
            co2eKg = energySavings * EMISSION_FACTORS_PHASE2.GRID_ELECTRICITY.factor;
            break;
        }

        case 'waterless_urinal': {
            // Each urinal saves ~150 kL per year
            const waterSavings = quantity * 150;
            co2eKg = waterSavings * EMISSION_FACTORS_PHASE2.BOREWELL_WATER.factor;
            break;
        }

        case 'wastewater_recycling': {
            // quantity = kL/day capacity
            const annualWaterKL = quantity * 365;
            co2eKg = annualWaterKL * EMISSION_FACTORS_PHASE2.MUNICIPAL_WATER.factor;
            break;
        }

        case 'tree_plantation': {
            // Trees - use approximate 22 kg/tree/year (not in client's table)
            co2eKg = quantity * 22;
            break;
        }

        default: {
            // Unknown action type - return 0 (admin will enter manually)
            co2eKg = 0;
        }
    }

    // Round to 3 decimal places
    return Math.round(co2eKg * 1000) / 1000;
}

// ============================================
// ATMANIRBHAR CALCULATION
// ============================================

function calculateAtmanirbharPhase2(input: CalculationInput): number {
    const {
        baselineElectricityKwh = 0,
        baselineWaterKL = 0,
        baselineWasteOrganicKg = 0,
        electricityUseKwh = 0,
        waterUsageKLD = 0,
        wasteOrganicKg = 0,
    } = input;

    // Client-approved weights (0.4 Energy, 0.3 Water, 0.2 Waste, 0.1 Action Baseline)
    const WEIGHTS = {
        energy: 0.4,
        water: 0.3,
        waste: 0.2,
        action: 0.1,
    };

    // 1. Energy Efficiency Score
    let energyScore = 0;
    if (baselineElectricityKwh > 0) {
        const reduction = Math.max(0, baselineElectricityKwh - electricityUseKwh);
        energyScore = Math.min(100, (reduction / baselineElectricityKwh) * 100);
    }

    // 2. Water Conservation Score
    let waterScore = 0;
    if (baselineWaterKL > 0) {
        const reduction = Math.max(0, baselineWaterKL - waterUsageKLD);
        waterScore = Math.min(100, (reduction / baselineWaterKL) * 100);
    }

    // 3. Waste Diversion Score
    let wasteScore = 0;
    if (baselineWasteOrganicKg > 0) {
        const divertedPercent = (input.wasteDivertedKg ?? 0) / (input.wasteGeneratedKg ?? baselineWasteOrganicKg) * 100;
        wasteScore = Math.min(100, divertedPercent);
    }

    // 4. Action Specific Impact (as a fallback/proxy for the 0.1 weight)
    const actionScore = input.quantity > 0 ? 100 : 0;

    const weightedScore = 
        (energyScore * WEIGHTS.energy) +
        (waterScore * WEIGHTS.water) +
        (wasteScore * WEIGHTS.waste) +
        (actionScore * WEIGHTS.action);

    return Math.round(weightedScore * 10) / 10;
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

    // Validate breakdown fields if provided
    const baselineFields = [
        { value: input.baselineElectricityKwh, name: 'Electricity Usage' },
        { value: input.baselineWaterKL, name: 'Water Consumption' },
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

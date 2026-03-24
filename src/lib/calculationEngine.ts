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

    // Optional baseline data
    baselineEnergyKwh?: number;
    baselineWaterM3?: number;
    baselineWasteKg?: number;

    // Optional atmanirbhar data
    localPercent?: number;
    indigenousPercent?: number;
    communityPercent?: number;
    jobsCreated?: number;

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

    return {
        tCO2e: co2eKg / 1000, // Convert kg to tonnes
        atmanirbharScore,
        calculationVersion: 'v1.0-phase2',
        methodology: 'ECF Simplified Factors',
        emissionFactorUsed: getEmissionFactorDescription(input.actionType),
    };
}

// ============================================
// CO2e CALCULATION (Using Client's Factors)
// ============================================

function calculateCO2ePhase2(input: CalculationInput): number {
    const { actionType, quantity, baselineEnergyKwh, baselineWaterM3, baselineWasteKg } = input;

    let co2eKg = 0;

    switch (actionType) {
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
        localPercent = 0,
        indigenousPercent = 0,
        communityPercent = 0,
        jobsCreated = 0,
    } = input;

    // If no data provided, return 0
    if (localPercent === 0 && indigenousPercent === 0 &&
        communityPercent === 0 && jobsCreated === 0) {
        return 0;
    }

    // Client-approved weights
    const WEIGHTS = {
        local: 0.4,        // 40%
        indigenous: 0.3,   // 30%
        community: 0.2,    // 20%
        jobs: 0.1,         // 10%
    };

    // Calculate jobs score (capped at 100)
    const jobsScore = Math.min(jobsCreated * 10, 100);

    // Weighted average
    const score =
        localPercent * WEIGHTS.local +
        indigenousPercent * WEIGHTS.indigenous +
        communityPercent * WEIGHTS.community +
        jobsScore * WEIGHTS.jobs;

    // Round to 1 decimal place
    return Math.round(score * 10) / 10;
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

    // Validate percentage fields if provided
    const percentFields = [
        { value: input.localPercent, name: 'Local sourcing %' },
        { value: input.indigenousPercent, name: 'Indigenous tech %' },
        { value: input.communityPercent, name: 'Community ownership %' },
    ];

    percentFields.forEach(field => {
        if (field.value !== undefined && (field.value < 0 || field.value > 100)) {
            errors.push(`${field.name} must be between 0 and 100`);
        }
    });

    if (input.jobsCreated !== undefined && input.jobsCreated < 0) {
        errors.push('Jobs created must be 0 or greater');
    }

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

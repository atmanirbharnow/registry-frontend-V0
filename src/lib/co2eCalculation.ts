import { EMISSION_FACTORS_PHASE2 } from "./constants/emissionFactors";

interface ActionInput {
    actionType: string;
    quantity: number;
    baselineEnergyKwh?: number;
    baselineWaterM3?: number;
    baselineWasteKg?: number;
    commissioningYear?: number;
}

export function calculateCo2eEnhanced(input: ActionInput): number | null {
    const { actionType, quantity, baselineEnergyKwh, baselineWaterM3, baselineWasteKg } = input;

    const currentYear = new Date().getFullYear();
    const years = input.commissioningYear
        ? Math.max(1, currentYear - input.commissioningYear + 1)
        : 1;

    let co2eKg = 0;
    const ef = EMISSION_FACTORS_PHASE2;

    switch (actionType) {
        case "solar_rooftop": {
            const annualImpact = quantity * ef.SOLAR_ROOFTOP.factor; // 1.23 tCO2e = 1230 kg
            co2eKg = annualImpact * 1000 * years;
            break;
        }
        case "solar_water_heater": {
            // Factor is 800 kg per 100 LPD unit
            co2eKg = (quantity / 100) * ef.SOLAR_WATER_HEATER.factor * years;
            break;
        }
        case "borewell_water": {
            co2eKg = quantity * ef.BOREWELL_WATER.factor * years;
            break;
        }
        case "rainwater_harvesting": {
            // Average of min (replacing borewell) and max (replacing municipal)
            const avgFactor = (ef.RAINWATER_HARVESTING.factorMin + ef.RAINWATER_HARVESTING.factorMax) / 2;
            co2eKg = (quantity / 1000) * avgFactor * years;
            break;
        }
        case "biogas": {
            co2eKg = quantity * ef.BIOGAS_PLANT.factor * 1000 * years;
            break;
        }
        case "composting": {
            co2eKg = quantity * ef.COMPOSTING.factor * years;
            break;
        }
        case "plastic_recycling": {
            co2eKg = quantity * ef.PLASTIC_RECYCLING.factor * years;
            break;
        }
        case "paper_recycling": {
            co2eKg = quantity * ef.PAPER_RECYCLING.factor * years;
            break;
        }
        case "textile_recycling": {
            co2eKg = quantity * ef.TEXTILE_RECYCLING.factor * years;
            break;
        }
        case "metal_recycling": {
            co2eKg = quantity * ef.METAL_RECYCLING.factor * years;
            break;
        }
        case "turn_off_bulb": {
            co2eKg = quantity * ef.LIGHTING_BULB.factor * years;
            break;
        }
        case "turn_off_fan": {
            co2eKg = quantity * ef.LIGHTING_FAN.factor * years;
            break;
        }
        case "tree_plantation":
            co2eKg = quantity * 22 * years; // Default tree factor
            break;
        default:
            return null;
    }

    return Math.round(co2eKg * 1000) / 1000;
}

export function calculateCo2e(
    actionType: string,
    quantity: number,
    years: number = 1
): number | null {
    return calculateCo2eEnhanced({
        actionType,
        quantity,
        commissioningYear: new Date().getFullYear() - years + 1,
    });
}

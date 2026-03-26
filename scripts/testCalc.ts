import { ACTION_TYPES } from '../src/lib/constants';
import { ACTION_TYPE_OPTIONS } from '../src/lib/constants/schoolConstants';
import { calculateImpactPhase2 } from '../src/lib/calculationEngine';
import { calculateSchoolImpact } from '../src/lib/schoolCalculationEngine';

function runTests() {
    console.log("==================================================");
    console.log("INDIVIDUAL CALCULATION ENGINE TEST");
    console.log("==================================================");

    const individualStats = ACTION_TYPES.map((action: any) => {
        const input = {
            actionType: action.value,
            quantity: 50, // 50 units (kW, kg, LPD, etc)
            unit: action.unit || "unit",
            baselineEnergyGrid: 100,
            baselineWasteOrganic: 50,
            baselineWasteInorganic: 50,
            baselineWaterMunicipal: 1000
        };

        const result = calculateImpactPhase2(input);
        return {
            Type: action.label,
            Value: action.value,
            InputUnit: action.unit,
            tCO2e: result.tCO2e,
            actionImpactTCO2e: result.actionImpactTCO2e,
            circularityScore: result.circularityScore,
            atmanirbharScore: result.atmanirbharScore
        };
    });

    console.table(individualStats);

    console.log("\n==================================================");
    console.log("SCHOOL CALCULATION ENGINE TEST");
    console.log("==================================================");

    const schoolStats = ACTION_TYPE_OPTIONS.map((action: any) => {
        const input = {
            actionType: action.value,
            actionQuantity: 50, // 50 units
            students_count: 500,
            baselineEnergyGrid: 5000,
            baselineEnergyDiesel: 0,
            baselineEnergySolar: 0,
            baselineWaterMunicipal: 10000,
            baselineWaterRain: 0,
            baselineWaterWaste: 0,
            baselineWasteOrganic: 100,
            baselineWasteInorganic: 100,
            baselineWasteHazardous: 0
        };

        const result = calculateSchoolImpact(input);
        return {
            Type: action.label,
            Value: action.value,
            tco2e_annual: result.tco2e_annual,
            circularity_pct: result.circularity_pct,
            atmanirbhar_pct: result.atmanirbhar_pct
        };
    });

    console.table(schoolStats);
}

runTests();

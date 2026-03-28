import { calculateImpactPhase2 } from './src/lib/calculationEngine';
import { calculateSchoolImpact } from './src/lib/schoolCalculationEngine';

// Individual test
const bOrganic1 = 50;
const bInorganic1 = 20;
const bHazardous1 = 30;
const calculatedDiverted1 = bOrganic1 + bInorganic1 + bHazardous1;

const individualImpact = calculateImpactPhase2({
    actionType: "solar",
    quantity: 10,
    unit: "kW",
    baselineWasteOrganic: bOrganic1,
    baselineWasteInorganic: bInorganic1,
    baselineWasteHazardous: bHazardous1,
    baselineWasteDiverted: calculatedDiverted1,
});

console.log("=== Individual Impact Score ===");
console.log("Input Diverted:", calculatedDiverted1);
console.log("Circularity Score:", individualImpact.circularityScore);
console.log("Atmanirbhar Score:", individualImpact.atmanirbharScore);

// School test
const bOrganic2 = 100;
const bInorganic2 = 50;
const bHazardous2 = 50;
const calculatedDiverted2 = bOrganic2 + bInorganic2 + bHazardous2;

const schoolImpact = calculateSchoolImpact({
    baselineEnergyGrid: 1000,
    baselineEnergyDiesel: 0,
    baselineEnergySolar: 100,
    baselineWaterMunicipal: 5000,
    baselineWaterRain: 200,
    baselineWaterWaste: 0,
    baselineWasteOrganic: bOrganic2,
    baselineWasteInorganic: bInorganic2,
    baselineWasteHazardous: bHazardous2,
    waste_diverted_kg: calculatedDiverted2,
    students_count: 500,
    actionType: "solar_rooftop",
    actionQuantity: 50,
});

console.log("\n=== School Impact Score ===");
console.log("Input Diverted:", calculatedDiverted2);
console.log("Circularity Score:", schoolImpact.circularity_pct);
console.log("Atmanirbhar Score:", schoolImpact.atmanirbhar_pct);
console.log("Carbon Intensity:", schoolImpact.carbon_intensity);

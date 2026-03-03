// CO₂e emission factors per action type
// Sources: IPCC, EPA, BEE India standards
// All values return kg CO₂e avoided/sequestered

const CO2E_FACTORS: Record<string, (quantity: number, years: number) => number | null> = {
    // Solar rooftop: quantity in kW, 1500 kWh/kW/year, grid EF = 0.82 kg CO₂/kWh (India CEA)
    solar_rooftop: (quantity, years) => quantity * 1500 * 0.82 * years,

    // Biogas: quantity in m³ of biogas, ~1.3 kg CO₂e per m³ methane captured
    biogas: (quantity) => quantity * 1.3,

    // Solar water heater: quantity in liters capacity
    // 100L SWH saves ~1500 kWh/year electricity
    swh: (quantity, years) => (quantity / 100) * 1500 * 0.82 * years,

    // Rainwater harvesting: quantity in m³ harvested
    // Water treatment + pumping saves ~0.5 kWh/m³
    rwh: (quantity) => quantity * 0.5 * 0.82,

    // Waterless urinal: quantity = number of urinals, each saves ~150,000L water/year
    // Water treatment energy ~0.5 kWh/m³
    waterless_urinal: (quantity, years) => quantity * 150 * 0.5 * 0.82 * years,

    // Wastewater recycling: quantity in m³/day capacity
    // ~0.8 kWh/m³ saved vs fresh water treatment
    wastewater_recycling: (quantity, years) => quantity * 365 * 0.8 * 0.82 * years,

    // LED replacement: quantity = number of lights
    // Each LED saves ~40W vs CFL/incandescent, 10 hours/day
    led_replacement: (quantity, years) => quantity * 0.04 * 10 * 365 * 0.82 * years,

    // Tree plantation: quantity = number of trees
    // Average tree absorbs ~22 kg CO₂/year (IPCC)
    tree_plantation: (quantity, years) => quantity * 22 * years,
};

export function calculateCo2e(
    actionType: string,
    quantity: number,
    years: number = 1
): number | null {
    const factor = CO2E_FACTORS[actionType];
    if (!factor) return null;
    const result = factor(quantity, years);
    if (result === null) return null;
    return Math.round(result * 1000) / 1000;
}

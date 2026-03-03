const CO2E_FACTORS: Record<string, (quantity: number, years: number) => number | null> = {
    solar_rooftop: (quantity, years) => quantity * 1500 * 0.82 * years,
    biogas: (quantity) => quantity * 1.3,
    swh: (quantity, years) => (quantity / 100) * 1500 * 0.82 * years,
    rwh: (quantity) => quantity * 0.5 * 0.82,
    waterless_urinal: (quantity, years) => quantity * 150 * 0.5 * 0.82 * years,
    wastewater_recycling: (quantity, years) => quantity * 365 * 0.8 * 0.82 * years,
    led_replacement: (quantity, years) => quantity * 0.04 * 10 * 365 * 0.82 * years,
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

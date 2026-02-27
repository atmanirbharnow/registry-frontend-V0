const CO2E_FACTORS: Record<string, (quantity: number, years: number) => number | null> = {
    solar_rooftop: (quantity, years) => quantity * 1.5 * years,
    biogas: (quantity) => quantity * 0.0021,
    swh: () => null,
    rwh: () => null,
    waterless_urinal: () => null,
    wastewater_recycling: () => null,
    led_replacement: () => null,
    tree_plantation: () => null,
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

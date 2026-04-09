// src/lib/constants/emissionFactors.ts

/**
 * AUTHORITATIVE EMISSION FACTORS - Phase 2
 * Source: Climate Asset Foundation Proprietary Calculation Methodologies
 * © 2024 Climate Asset Foundation. All rights reserved.
 * 
 * DO NOT MODIFY WITHOUT CLIENT APPROVAL
 */

export const EMISSION_FACTORS_PHASE2 = {
    // Grid Electricity
    GRID_ELECTRICITY: {
        factor: 0.82, // kg CO2e per kWh
        unit: 'kWh',
        source: 'CEA India 2023-24',
    },

    // Water
    BOREWELL_WATER: {
        factor: 0.67, // kg CO2e per kL
        unit: 'kL',
        source: 'Pumping 150m depth',
    },
    MUNICIPAL_WATER: {
        factor: 1.69, // kg CO2e per kL
        unit: 'kL',
        source: 'Treatment + distribution',
    },
    RAINWATER_HARVESTING: {
        factorMin: 26.8, // kg per yr (replacing borewell)
        factorMax: 68.0, // kg per yr (replacing municipal)
        unit: 'units (1000L/day)',
        source: 'Monsoon harvesting',
    },

    // Solar
    SOLAR_ROOFTOP: {
        factor: 1.23, // tCO2e per year per kW
        unit: 'kW',
        source: '1500 kWh × 0.82 kg',
        annualGeneration: 1500, // kWh per kW per year
    },
    SOLAR_WATER_HEATER: {
        factor: 800, // kg per year per 100 LPD
        unit: '100 LPD',
        source: 'Electric geyser displacement',
    },

    // Biogas 
    BIOGAS_PLANT: {
        factor: 1.2, // tCO2e per year (2m³ Plant)
        unit: '1 plant',
        source: 'Methane avoidance + LPG',
    },

    // Waste & Recycling
    COMPOSTING: {
        factor: 0.45, // kg per kg food waste
        unit: 'kg food',
        source: 'Landfill methane avoidance',
    },
    PLASTIC_RECYCLING: {
        factor: 1.5, // kg per kg plastic
        unit: 'kg',
        source: 'Virgin production avoidance',
    },
    PAPER_RECYCLING: {
        factor: 0.9, // kg per kg paper
        unit: 'kg',
        source: 'Virgin production avoidance',
    },
    TEXTILE_RECYCLING: {
        factor: 2.2, // kg per kg textile
        unit: 'kg',
        source: 'New production avoidance',
    },
    METAL_RECYCLING: {
        factor: 3.0, // kg per kg metal
        unit: 'kg',
        source: 'Aluminum average',
    },

    // Lighting (1 hr/day reduction)
    LIGHTING_BULB: {
        factor: 17.96, // kg per year
        unit: '60W bulb',
        source: '1 hr/day reduction',
    },
    LIGHTING_FAN: {
        factor: 7.68, // kg per year
        unit: '52W fan',
        source: '1 hr/day reduction',
    },

    // Legacy / Other
    LED_VS_ICL: {
        factor: 57, // kg per year
        unit: '100W→5W',
        source: '2 hrs/day',
    },
    REFRIGERATOR_UPGRADE: {
        factor: 100, // kg per year
        unit: '2→5 Star',
        source: 'BEE data',
    },
    GEYSER_TEMP_REDUCTION: {
        factor: 172, // kg per year
        unit: '60→40°C',
        source: 'User data',
    },
} as const;

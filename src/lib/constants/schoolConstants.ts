export const SCHOOL_EMISSION_FACTORS = {
    ELECTRICITY: 0.82,   // kg CO2 per kWh (CEA 2024)
    DIESEL: 2.68,       // kg CO2 per litre
    PETROL: 2.31,       // kg CO2 per litre
    LPG: 1.51,          // kg CO2 per kg
    NATURAL_GAS: 2.04,  // kg CO2 per m3
    WATER_SUPPLY: 0.5, // kg CO2 per m3
    WASTE_LANDFILL: 0.5, // kg CO2 per kg
    RENEWABLE: -0.82,    // kg CO2 per kWh (credit)
} as const;

export const SCHOOL_FALLBACK_CONSTANTS = {
    ELECTRICITY_KWH_PER_STUDENT: 150,
    WATER_M3_PER_STUDENT_PER_YEAR: (20 * 365) / 1000,
    WASTE_KG_PER_STUDENT_PER_YEAR: 0.25 * 365,
} as const;

export const SCHOOL_CALCULATION_VERSION = "v1.1-school-onboarding";

export const SCHOOL_STATUS_OPTIONS = [
    { value: "pledged", label: "Pledged" },
    { value: "verified", label: "Verified" },
    { value: "rejected", label: "Rejected" },
] as const;

export const BASELINE_SOURCE_OPTIONS = [
    { value: "school_shared", label: "School Shared Data" },
    { value: "sectoral_average", label: "Sectoral Average" },
    { value: "estimated", label: "Manual Estimate" },
] as const;

export const FUEL_TYPE_OPTIONS = [
    { value: "None", label: "None" },
    { value: "Diesel", label: "Diesel" },
    { value: "Petrol", label: "Petrol" },
    { value: "LPG", label: "LPG" },
    { value: "Natural Gas", label: "Natural Gas" },
] as const;

export const RENEWABLE_TYPE_OPTIONS = [
    { value: "None", label: "None" },
    { value: "Solar", label: "Solar" },
    { value: "Wind", label: "Wind" },
    { value: "Biogas", label: "Biogas" },
    { value: "Small Hydro", label: "Small Hydro" },
] as const;

export const REPORTING_YEAR_OPTIONS = [
    { value: "2018", label: "2018" },
    { value: "2019", label: "2019" },
    { value: "2020", label: "2020" },
    { value: "2021", label: "2021" },
    { value: "2022", label: "2022" },
    { value: "2023", label: "2023" },
    { value: "2024", label: "2024" },
    { value: "2025", label: "2025" },
] as const;

export const RECYCLING_PROGRAM_OPTIONS = [
    { value: "Paper", label: "Paper" },
    { value: "Plastic", label: "Plastic" },
    { value: "Organic", label: "Organic" },
    { value: "E-waste", label: "E-waste" },
    { value: "None", label: "None" },
] as const;

export const ACTION_TYPE_OPTIONS = [
    { value: "Solar", label: "Solar" },
    { value: "Biogas", label: "Biogas" },
    { value: "Waste", label: "Waste & Recycling" },
    { value: "Water", label: "Water" },
    { value: "Efficiency", label: "Efficiency & Lighting" },
] as const;


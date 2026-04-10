export const ACTION_TYPES = [
  { value: "solar_rooftop", label: "Rooftop Solar", unit: "kW", photoLabel: "Solar panels or inverter photo" },
  { value: "solar_water_heater", label: "Solar Water Heating", unit: "liters", photoLabel: "Solar tank or collector photo" },
  { value: "rainwater_harvesting", label: "Rain Water Harvesting", unit: "liters", photoLabel: "Rainwater tank or catchment system photo" },
  { value: "biogas_cooking", label: "Biogas (cooking)", unit: "m3/day", photoLabel: "Biogas unit or feedstock photo" },
  { value: "waterless_urinals", label: "Waterless Urinals", unit: "units", photoLabel: "Waterless urinal installation photo" },
  { value: "composting", label: "Waste Composting", unit: "Kg", photoLabel: "Composting unit or organic waste area photo" },
  { value: "wastewater_recycling", label: "Waste Water Recycled", unit: "m3", photoLabel: "Greywater treatment or reuse system photo" },
  { value: "led_retrofit", label: "Energy Efficiency", unit: "fixtures", photoLabel: "Energy efficiency installation photo" },
];

export const ACTION_PHOTO_LABELS: Record<string, string> = ACTION_TYPES.reduce(
  (acc, type) => {
    acc[type.value] = type.photoLabel;
    return acc;
  },
  {} as Record<string, string>
);

export const ACTION_LABELS: Record<string, string> = ACTION_TYPES.reduce(
  (acc, type) => {
    acc[type.value] = type.label;
    return acc;
  },
  {} as Record<string, string>
);

export const ACTION_UNITS: Record<string, string> = ACTION_TYPES.reduce(
  (acc, type) => {
    acc[type.value] = type.unit;
    return acc;
  },
  {} as Record<string, string>
);

export const ACTOR_TYPES = [
  { value: "individual", label: "Individual" },
  { value: "organization", label: "Organization" },
  { value: "government", label: "Government" },
  { value: "ngo", label: "NGO" },
] as const;

export const SECTOR_LABELS: Record<string, string> = {
    School: "Educational Institution",
    Hospital: "Healthcare Facility",
    "Hospital and Hotel": "Hospital & Hotel",
    MSME: "MSME / Small Business",
    SME: "MSME / Small Business",
    Commercial: "Commercial Entity",
    NGO: "Non-Profit Organization",
    Government: "Government Body",
    Individual: "Individual Actor",
    Household: "Household",
    Education: "Educational Institution",
};

export const ACTION_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "verified", label: "Verified" },
  { value: "rejected", label: "Rejected" },
] as const;

export const PIPELINE_STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "pipeline", label: "In Pipeline" },
] as const;

export const ACTION_PILLAR_MAP: Record<string, "energy" | "water" | "waste" | "other"> = {
  // Energy / Efficiency
  solar_rooftop: "energy",
  solar_water_heater: "energy",
  led_retrofit: "energy",
  biogas_cooking: "energy",

  // Water
  rainwater_harvesting: "water",
  waterless_urinals: "water",
  wastewater_recycling: "water",

  // Waste
  composting: "waste",
};

export const PAYMENT_AMOUNT_PAISE = 100;
export const PAYMENT_AMOUNT_DISPLAY = "₹1";

export const APP_URL =
  (process.env.NEXT_PUBLIC_APP_URL || "https://climateassetregistry.org").replace(/\/+$/, "");

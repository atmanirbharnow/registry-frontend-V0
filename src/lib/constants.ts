export const ACTION_TYPES = [
  { value: "solar_rooftop", label: "Solar Rooftop", unit: "kW" },
  { value: "swh", label: "Solar Water Heater", unit: "liters" },
  { value: "rwh", label: "Rainwater Harvesting", unit: "m³" },
  { value: "waterless_urinal", label: "Waterless Urinal", unit: "No." },
  { value: "wastewater_recycling", label: "Wastewater Recycling", unit: "m3" },
  { value: "biogas", label: "Biogas (Food Waste)", unit: "kg" },
  { value: "led_replacement", label: "LED Replacement", unit: "No." },
  { value: "tree_plantation", label: "Tree Plantation", unit: "No. of Trees" },
];

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

export const PAYMENT_AMOUNT_PAISE = 19900;
export const PAYMENT_AMOUNT_DISPLAY = "₹199";

export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://registryearthcarbon.org";

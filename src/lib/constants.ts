export const ACTION_TYPES = [
  // Solar
  { 
    value: "solar_rooftop", 
    label: "Solar Rooftop 1 kW", 
    unit: "kW", 
    source: "1500 kWh × 0.82 kg", 
    notes: "India average generation" 
  },
  { 
    value: "solar_water_heater", 
    label: "Solar Water Heater 100 LPD", 
    unit: "100 LPD", 
    source: "Electric geyser displacement", 
    notes: "Per 100 liters/day" 
  },

  // Water
  { 
    value: "borewell_water", 
    label: "Water Borewell 1 kL", 
    unit: "kL", 
    source: "Pumping 150m", 
    notes: "Energy for extraction" 
  },
  { 
    value: "rainwater_harvesting", 
    label: "Water Rainwater 1000 L/day", 
    unit: "1000L/day", 
    source: "Borewell-Municipal", 
    notes: "Monsoon harvesting" 
  },

  // Biogas
  { 
    value: "biogas", 
    label: "Biogas 2m³ Plant", 
    unit: "1 plant", 
    source: "Methane + LPG", 
    notes: "Includes manure" 
  },

  // Waste & Recycling
  { 
    value: "composting", 
    label: "Waste Composting 1 kg food", 
    unit: "kg food", 
    source: "Landfill methane avoidance", 
    notes: "Monthly household" 
  },
  { 
    value: "plastic_recycling", 
    label: "Waste Plastic Recycling 1 kg", 
    unit: "kg", 
    source: "Virgin production", 
    notes: "Per kg recycled" 
  },
  { 
    value: "paper_recycling", 
    label: "Waste Paper Recycling 1 kg", 
    unit: "kg", 
    source: "Virgin production", 
    notes: "17kg = 1 tree" 
  },
  { 
    value: "textile_recycling", 
    label: "Waste Textile Recycling 1 kg", 
    unit: "kg", 
    source: "New production", 
    notes: "Per kg recycled" 
  },
  { 
    value: "metal_recycling", 
    label: "Waste Metal Recycling 1 kg", 
    unit: "kg", 
    source: "Aluminum average", 
    notes: "Per kg recycled" 
  },

  // Lighting
  { 
    value: "turn_off_bulb", 
    label: "Lighting Turn Off Bulb 1 hr/day", 
    unit: "60W bulb", 
    source: "1 hr/day reduction", 
    notes: "Per hour reduction" 
  },
  { 
    value: "turn_off_fan", 
    label: "Lighting Turn Off Fan 1 hr/day", 
    unit: "52W fan", 
    source: "1 hr/day reduction", 
    notes: "Per hour reduction" 
  },
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

export const SECTOR_LABELS: Record<string, string> = {
    School: "Educational Institution",
    Hospital: "Healthcare Facility",
    MSME: "MSME Enterprise",
    Commercial: "Commercial Entity",
    NGO: "Non-Profit Organization",
    Government: "Government Body",
    Individual: "Individual Actor",
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
  // Energy
  solar_rooftop: "energy",
  solar_water_heater: "energy",
  turn_off_bulb: "energy",
  turn_off_fan: "energy",
  led_replacement: "energy",
  refrigerator_upgrade: "energy",
  geyser_temp_reduction: "energy",

  // Water
  borewell_water: "water",
  rainwater_harvesting: "water",

  // Waste
  biogas: "waste",
  composting: "waste",
  plastic_recycling: "waste",
  paper_recycling: "waste",
  textile_recycling: "waste",
  metal_recycling: "waste",

  // Other
  tree_plantation: "other",
};

export const PAYMENT_AMOUNT_PAISE = 100;
export const PAYMENT_AMOUNT_DISPLAY = "₹1";

export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://climateassetregistry.org";

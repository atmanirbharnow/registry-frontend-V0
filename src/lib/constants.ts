export const ACTION_TYPES = [
  { value: "solar_rooftop", label: "Solar Rooftop Installation", unit: "kW", photoLabel: "Solar panels or inverter photo" },
  { value: "battery_storage", label: "Battery Storage Addition", unit: "kWh", photoLabel: "Battery setup or energy management unit photo" },
  { value: "led_upgrade", label: "LED/Efficiency Upgrade", unit: "% reduction", photoLabel: "Replaced LED bulbs / efficient appliances photo" },
  { value: "biomass_energy", label: "Biomass/Biogas Energy", unit: "kWh", photoLabel: "Biomass/Biogas unit or feedstock photo" },
  { value: "renewable_ppa", label: "Renewable PPA (Local)", unit: "kWh", photoLabel: "PPA contract or project site photo" },
  { value: "rainwater_harvesting", label: "Rainwater Harvesting", unit: "L/day", photoLabel: "Rainwater tank or catchment system photo" },
  { value: "greywater_recycling", label: "Greywater Recycling", unit: "L/day", photoLabel: "Greywater treatment or reuse system photo" },
  { value: "water_fixtures", label: "Water-Efficient Fixtures", unit: "% reduction", photoLabel: "Water-efficient taps or dual-flush tanks photo" },
  { value: "recharge_well", label: "Recharge Pit/Well", unit: "L/month", photoLabel: "Groundwater recharge pit or well photo" },
  { value: "composting", label: "Organic Waste Composting", unit: "kg/month", photoLabel: "Composting unit or organic waste area photo" },
  { value: "biogas_digester", label: "Biogas Digester", unit: "kg/day", photoLabel: "Biogas digester or gas collection photo" },
  { value: "material_recovery", label: "Material Recovery/Recycling", unit: "kg/month", photoLabel: "Recycling bins or sorting facility photo" },
  { value: "waste_reduction", label: "Waste Reduction Initiative", unit: "% reduction", photoLabel: "Zero-waste initiative or data logs photo" },
  { value: "borewell_water", label: "Borewell Water Pumping", unit: "HP", photoLabel: "Pump or energy meter photo" },
  { value: "plastic_recycling", label: "Plastic Recycling", unit: "kg", photoLabel: "Recycled plastic batch photo" },
  { value: "paper_recycling", label: "Paper Recycling", unit: "kg", photoLabel: "Paper collection point photo" },
  { value: "textile_recycling", label: "Textile Recycling", unit: "kg", photoLabel: "Textile waste storage photo" },
  { value: "metal_recycling", label: "Metal Recycling", unit: "kg", photoLabel: "Metal scrap storage photo" },
  { value: "turn_off_bulb", label: "Lighting Efficiency", unit: "points", photoLabel: "LED installation photo" },
  { value: "turn_off_fan", label: "Fan Efficiency", unit: "points", photoLabel: "Efficient fan photo" },
  { value: "solar_water_heater", label: "Solar Water Heater", unit: "Liters", photoLabel: "Solar tank or collector photo" },
  { value: "biogas_plant", label: "Biogas Plant Installation", unit: "m3", photoLabel: "Biogas digester or stove photo" },
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
  // Energy
  solar_rooftop: "energy",
  solar_water_heater: "energy",
  battery_storage: "energy",
  led_upgrade: "energy",
  biomass_energy: "energy",
  renewable_ppa: "energy",
  turn_off_bulb: "energy",
  turn_off_fan: "energy",

  // Water
  rainwater_harvesting: "water",
  greywater_recycling: "water",
  water_fixtures: "water",
  recharge_well: "water",
  borewell_water: "water",
  waterless_urinal: "water",
  wastewater_recycling: "water",

  // Waste
  composting: "waste",
  biogas_digester: "waste",
  biogas_plant: "waste",
  material_recovery: "waste",
  waste_reduction: "waste",
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
  (process.env.NEXT_PUBLIC_APP_URL || "https://climateassetregistry.org").replace(/\/+$/, "");

# Calculations Reference

## CO₂e Reduction Calculation

Each action type has a specific emission factor. The CO₂e reduction is calculated as:

```
co2eKg = quantity × emissionFactor
```

### Emission Factors by Action Type

| Action Type | Unit | Factor (kg CO₂e / unit) |
|---|---|---|
| Solar Panel | kW | 1400.0 |
| Biogas Plant | cubic meters | 0.72 |
| Tree Planting | trees | 22.0 |
| Rainwater Harvesting | liters | 0.001 |
| Composting | kg | 0.5 |
| Organic Farming | hectares | 500.0 |

**Notes:**
- Factors are approximations based on Indian conditions and IPCC guidelines.
- Some action types may return `null` if the formula is not yet defined.
- All values are in kg CO₂e (kilograms of CO₂ equivalent).

## Atmanirbhar (Self-Reliance) Score

The Atmanirbhar percentage measures how self-reliant and community-driven the action is. It is calculated as:

```
atmanirbharPercent = (localPercent + indigenousPercent + communityPercent + jobsBonus) / 4
```

Where:
- `localPercent` — Percentage of materials sourced locally (0-100)
- `indigenousPercent` — Percentage of technology that is indigenous (0-100)
- `communityPercent` — Percentage of community involvement (0-100)
- `jobsBonus` — `min(jobsCreated × 10, 100)` — Capped at 100

### Example

```
localPercent = 80
indigenousPercent = 60
communityPercent = 40
jobsCreated = 5

jobsBonus = min(5 × 10, 100) = 50
atmanirbharPercent = (80 + 60 + 40 + 50) / 4 = 57.5%
```

## SHA-256 Digital Signature

Each registered action receives a SHA-256 hash computed over a canonical string of key fields:

```
canonicalString = registryId|actionType|quantity|unit|actorName|email|phone|lat|lng
hash = SHA-256(canonicalString)
```

This hash serves as a tamper-proof digital signature — if any field is modified after registration, the hash will no longer match, proving the data has been altered.

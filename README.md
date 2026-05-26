# Energy Burden Index — Toronto Neighbourhoods

A data pipeline that computes an **Energy Burden Index (EBI)** for each of Toronto's 158 City Planning Neighbourhoods, classifies them into equity tiers, recommends targeted energy-assistance programs, and estimates financial impact.

---

## How to Run

```bash
python build_index.py
```

**Requirements:** Python 3.9+, `pandas`, `numpy` (stdlib `json` included).

```bash
pip install pandas numpy
```

The script reads `consumption_results_158.csv` and writes two output files:

| Output file | Description |
|---|---|
| `energy_burden_index.csv` | 158-row ranked CSV (backward-compatible) |
| `neighbourhoods.json` | 158-entry JSON array consumed by the React frontend |

---

## Index Formula

```
age_score  = min-max normalize(age_factor)   → [0, 1]

EBI = 0.35 × income_score
    + 0.25 × renter_score
    + 0.25 × consumption_score
    + 0.15 × age_score
```

| Weight | Component | Rationale |
|--------|-----------|-----------|
| 35% | Income score | Low income = highest proportional energy cost |
| 25% | Renter score | Renters locked out of capital upgrade programs |
| 25% | Consumption score | Higher kWh = higher dollar burden |
| 15% | Age score | Pre-1960s stock = lowest thermal efficiency |

---

## Tier Classification

Tiers are assigned by **percentile thresholds** computed from the full 158-neighbourhood dataset:

| Tier | Threshold | Count |
|------|-----------|-------|
| **Critical** | Top 25% (EBI ≥ 75th percentile) | ~40 |
| **High** | Middle 50% (25th–75th percentile) | ~78 |
| **Moderate** | Bottom 25% (EBI < 25th percentile) | ~40 |

---

## Program Recommendation Logic

| Condition | Primary Program | Secondary Program |
|-----------|----------------|------------------|
| Critical + renter % > 50% | Energy Affordability Program (EAP) | Enbridge Affordable Housing Multi-Residential |
| Critical (owner-dominated) | Energy Affordability Program (EAP) | Ontario Electricity Support Program (OESP) |
| High | Ontario Electricity Support Program (OESP) | Low-Income Energy Assistance Program (LEAP) |
| Moderate | Save on Energy Home Renovation Rebate | Smart Thermostat Rebate |

### Program Reference

| Key | Full Name | Est. Annual Benefit/HH | Eligibility |
|-----|-----------|------------------------|-------------|
| EAP | Energy Affordability Program | $1,500 | OW/ODSP recipients or household income < $52k |
| OESP | Ontario Electricity Support Program | $420 | Below OESP income thresholds |
| LEAP | Low-Income Energy Assistance Program | $650 (max) | Referred by utility; unable to pay bills |
| MULTIRES | Enbridge Affordable Housing Multi-Residential | $2,500/unit | Building owner applies for 5+ unit buildings |
| SOE_HOME | Save on Energy Home Renovation Rebate | $500 | Homeowners with eligible HVAC/insulation upgrades |
| SOE_THERM | Smart Thermostat Rebate | $75 | Any Ontario electricity customer |

---

## Impact Estimation

```
eligible_households  = 5,000 avg/neighbourhood × 30% uptake = 1,500
total_annual_benefit = eligible_households × primary_program_benefit_per_hh
```

Constants are documented at the top of `build_index.py` and can be tuned without touching the pipeline logic.

---

## Output Schema — `neighbourhoods.json`

```json
{
  "id": 4,
  "name": "Rexdale-Kipling",
  "rank": 1,
  "ebi_score": 0.757,
  "tier": "Critical",
  "scores": {
    "income": 0.887,
    "renter": 0.514,
    "consumption": 0.770,
    "age": 0.839
  },
  "raw": {
    "est_kwh": 12243,
    "renter_pct": 0.4956,
    "dominant_type": "Single detached"
  },
  "programs": {
    "primary": {
      "name": "Energy Affordability Program (EAP)",
      "annual_benefit_per_hh": 1500,
      "eligibility": "Low-income households (OW/ODSP recipients or household income <$52k)"
    },
    "secondary": {
      "name": "Ontario Electricity Support Program (OESP)",
      "annual_benefit_per_hh": 420,
      "eligibility": "Households below OESP income thresholds (~$52k for 1-2 person households)"
    }
  },
  "impact": {
    "eligible_households": 1500,
    "total_annual_benefit": 2250000,
    "uptake_assumption": "30%"
  }
}
```

---

## Data Sources

### Consumption & Building Stock
- **NRCan Survey of Household Energy Use (SHEU 2021)** — natural gas and electricity consumption by dwelling type, province-level, used to calibrate `base_kwh` and `age_factor` ranges.  
  https://oee.nrcan.gc.ca/publications/statistics/sheu/2021/

### Demographics (Income & Tenure)
- **Statistics Canada Census 2021 — National Household Survey (NHS)** — Dissemination Area-level household income quintiles and tenure (owner/renter) aggregated to Toronto's 158 City Planning Neighbourhoods.  
  https://www12.statcan.gc.ca/census-recensement/2021/

### Building Age
- **Statistics Canada Census 2021 — Dwelling Characteristics** — period of construction (pre-1960, 1960–1980, post-1980) by DA, used to compute `age_factor` as a weighted share of aged stock.

### Electricity Rate Assumptions
- **Ontario Energy Board (OEB) — Regulated Price Plan (RPP), Q1 2024** — Time-of-Use rates used in `est_kwh` to annual cost conversion:  
  Off-Peak $0.074/kWh · Mid-Peak $0.102/kWh · On-Peak $0.151/kWh.  
  https://www.oeb.ca/rates-and-your-bill/electricity-rates

### Neighbourhood Boundaries
- **City of Toronto Open Data — Neighbourhood Profiles 2021** (`neighbourhood_profile_2021.xlsx`) — 158 neighbourhood definitions aligned to 2016 Census geography.  
  https://open.toronto.ca/dataset/neighbourhood-profiles/

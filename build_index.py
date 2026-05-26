import pandas as pd
import numpy as np
import json

# ── CONFIG: weights (must sum to 1.0) ─────────────────────────────────────────
WEIGHTS = {
    "income":      0.35,   # lowest income  = highest burden
    "renter":      0.25,   # renters locked out of upgrade programs
    "consumption": 0.25,   # higher use     = higher dollar cost
    "age":         0.15,   # older building = less efficient
}

# ── FILE PATHS ────────────────────────────────────────────────────────────────
INPUT_FILE  = "consumption_results_158.csv"
OUTPUT_CSV  = "energy_burden_index.csv"
OUTPUT_JSON = "neighbourhoods.json"

# ── IMPACT ESTIMATION CONSTANTS ───────────────────────────────────────────────
AVG_HOUSEHOLDS_PER_NEIGHBOURHOOD = 5000
TYPICAL_UPTAKE_RATE              = 0.30
ELIGIBLE_HOUSEHOLDS              = int(AVG_HOUSEHOLDS_PER_NEIGHBOURHOOD * TYPICAL_UPTAKE_RATE)  # 1500

# ── PROGRAM CATALOG ───────────────────────────────────────────────────────────
# Single source of truth for benefit amounts and eligibility strings.
# Keys are short identifiers used by _assign_programs().
PROGRAMS = {
    "EAP": {
        "name": "Energy Affordability Program (EAP)",
        "annual_benefit_per_hh": 1500,
        "eligibility": "Low-income households (OW/ODSP recipients or household income <$52k)",
    },
    "OESP": {
        "name": "Ontario Electricity Support Program (OESP)",
        "annual_benefit_per_hh": 420,
        "eligibility": "Households below OESP income thresholds (~$52k for 1–2 person households)",
    },
    "LEAP": {
        "name": "Low-Income Energy Assistance Program (LEAP)",
        "annual_benefit_per_hh": 650,
        "eligibility": "Households unable to pay energy bills, referred by utility or social service",
    },
    "MULTIRES": {
        "name": "Enbridge Affordable Housing Multi-Residential Program",
        "annual_benefit_per_hh": 2500,   # $200k / 80 units per project
        "eligibility": "Multi-unit residential buildings with 5+ units; applied by building owner",
    },
    "SOE_HOME": {
        "name": "Save on Energy Home Renovation Rebate",
        "annual_benefit_per_hh": 500,
        "eligibility": "Homeowners undertaking eligible insulation or HVAC efficiency upgrades",
    },
    "SOE_THERM": {
        "name": "Smart Thermostat Rebate",
        "annual_benefit_per_hh": 75,
        "eligibility": "Any Ontario electricity customer replacing a manual thermostat",
    },
}


# ── HELPERS ───────────────────────────────────────────────────────────────────

def _assign_tier(score: float, p25: float, p75: float) -> str:
    """
    Percentile-based tier classification:
      Critical : top 25%    (EBI >= 75th percentile)
      High     : middle 50% (25th <= EBI < 75th percentile)
      Moderate : bottom 25% (EBI < 25th percentile)
    """
    if score >= p75:
        return "Critical"
    elif score >= p25:
        return "High"
    return "Moderate"


def _assign_programs(tier: str, renter_pct: float) -> tuple:
    """
    Return (primary_key, secondary_key) from PROGRAMS dict.
    Rules:
      Critical + renter_pct > 0.5  → EAP + Enbridge Multi-Residential
      Critical (otherwise)          → EAP + OESP
      High                          → OESP + LEAP
      Moderate                      → Save on Energy Home Renovation + Smart Thermostat
    """
    if tier == "Critical" and renter_pct > 0.5:
        return "EAP", "MULTIRES"
    elif tier == "Critical":
        return "EAP", "OESP"
    elif tier == "High":
        return "OESP", "LEAP"
    else:  # Moderate
        return "SOE_HOME", "SOE_THERM"


# ── LOAD ──────────────────────────────────────────────────────────────────────
df = pd.read_csv(INPUT_FILE)

# ── NORMALIZE age_factor → 0–1 ────────────────────────────────────────────────
# Higher age_factor = older building = more energy burden → score closer to 1
df["age_score"] = (df["age_factor"] - df["age_factor"].min()) / \
                  (df["age_factor"].max() - df["age_factor"].min())

# ── COMPUTE ENERGY BURDEN INDEX ───────────────────────────────────────────────
df["energy_burden_index"] = (
    WEIGHTS["income"]      * df["income_score"]      +
    WEIGHTS["renter"]      * df["renter_score"]      +
    WEIGHTS["consumption"] * df["consumption_score"] +
    WEIGHTS["age"]         * df["age_score"]
)

# ── RANK ──────────────────────────────────────────────────────────────────────
df["rank"] = df["energy_burden_index"].rank(ascending=False).astype(int)
df = df.sort_values("rank").reset_index(drop=True)

# ── TIER CLASSIFICATION — percentile-based ────────────────────────────────────
p25 = df["energy_burden_index"].quantile(0.25)
p75 = df["energy_burden_index"].quantile(0.75)

df["priority_tier"] = df["energy_burden_index"].apply(
    lambda s: _assign_tier(s, p25, p75)
)

# ── BUILD JSON RECORDS ────────────────────────────────────────────────────────
records = []
for _, row in df.iterrows():
    tier    = row["priority_tier"]
    pk, sk  = _assign_programs(tier, row["renter_pct"])
    benefit = PROGRAMS[pk]["annual_benefit_per_hh"]

    records.append({
        "id":        int(row["nb_number"]),
        "name":      row["neighbourhood"],
        "rank":      int(row["rank"]),
        "ebi_score": round(float(row["energy_burden_index"]), 3),
        "tier":      tier,
        "scores": {
            "income":      round(float(row["income_score"]),      4),
            "renter":      round(float(row["renter_score"]),      4),
            "consumption": round(float(row["consumption_score"]), 4),
            "age":         round(float(row["age_score"]),         4),
        },
        "raw": {
            "est_kwh":       int(row["est_kwh"]),
            "renter_pct":    round(float(row["renter_pct"]), 4),
            "dominant_type": row["dominant_type"],
        },
        "programs": {
            "primary":   PROGRAMS[pk],
            "secondary": PROGRAMS[sk],
        },
        "impact": {
            "eligible_households":  ELIGIBLE_HOUSEHOLDS,
            "total_annual_benefit": ELIGIBLE_HOUSEHOLDS * benefit,
            "uptake_assumption":    "30%",
        },
    })

# ── WRITE CSV ─────────────────────────────────────────────────────────────────
output_cols = [
    "rank", "neighbourhood", "nb_number",
    "energy_burden_index", "priority_tier",
    "income_score", "renter_score", "consumption_score", "age_score",
    "est_kwh", "renter_pct", "dominant_type",
]
df[output_cols].to_csv(OUTPUT_CSV, index=False)

# ── WRITE JSON ────────────────────────────────────────────────────────────────
with open(OUTPUT_JSON, "w", encoding="utf-8") as fh:
    json.dump(records, fh, indent=2, ensure_ascii=False)

# ── SUMMARY ───────────────────────────────────────────────────────────────────
print(f"\n{'='*65}")
print(f"  ENERGY BURDEN INDEX — TOP 15 NEIGHBOURHOODS")
print(f"{'='*65}")
print(f"{'Rank':<5} {'Neighbourhood':<32} {'EBI':>6} {'Tier':<10} Primary Program")
print(f"{'-'*65}")
for _, row in df.head(15).iterrows():
    pk, _ = _assign_programs(row["priority_tier"], row["renter_pct"])
    print(f"{int(row['rank']):<5} {row['neighbourhood']:<32} "
          f"{row['energy_burden_index']:.3f}  {row['priority_tier']:<10} {PROGRAMS[pk]['name']}")

tier_counts = df["priority_tier"].value_counts()
print(f"\nTier distribution (percentile-based):")
print(f"  Critical : {tier_counts.get('Critical', 0):>3}  (EBI >= {p75:.4f}  — top 25%)")
print(f"  High     : {tier_counts.get('High',     0):>3}  ({p25:.4f} – {p75:.4f} — middle 50%)")
print(f"  Moderate : {tier_counts.get('Moderate', 0):>3}  (EBI <  {p25:.4f}  — bottom 25%)")

print(f"\nWeights used: {WEIGHTS}")
print(f"Eligible households per neighbourhood: {ELIGIBLE_HOUSEHOLDS}  "
      f"({AVG_HOUSEHOLDS_PER_NEIGHBOURHOOD} avg × {int(TYPICAL_UPTAKE_RATE*100)}% uptake)")
print(f"\nCSV  → {OUTPUT_CSV}   ({len(df)} rows)")
print(f"JSON → {OUTPUT_JSON}  ({len(records)} entries)")

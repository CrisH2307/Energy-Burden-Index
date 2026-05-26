import pandas as pd
import numpy as np

# ── CONFIG: adjust weights here, must sum to 1.0 ──────────────────────────────
WEIGHTS = {
    "income":      0.35,   # lowest income = highest burden
    "renter":      0.25,   # renters = locked out of upgrade programs
    "consumption": 0.25,   # higher use = higher dollar cost
    "age":         0.15,   # older building = less efficient
}

INPUT_FILE  = "consumption_results_158.csv"
OUTPUT_FILE = "energy_burden_index.csv"

# ── LOAD ───────────────────────────────────────────────────────────────────────
df = pd.read_csv(INPUT_FILE)

# ── NORMALIZE age_factor to 0-1 ────────────────────────────────────────────────
# Higher age_factor = older building = more energy burden → score closer to 1
df["age_score"] = (df["age_factor"] - df["age_factor"].min()) / \
                  (df["age_factor"].max() - df["age_factor"].min())

# ── COMPUTE ENERGY BURDEN INDEX ────────────────────────────────────────────────
df["energy_burden_index"] = (
    WEIGHTS["income"]      * df["income_score"]      +
    WEIGHTS["renter"]      * df["renter_score"]      +
    WEIGHTS["consumption"] * df["consumption_score"] +
    WEIGHTS["age"]         * df["age_score"]
)

# ── RANK ───────────────────────────────────────────────────────────────────────
df["rank"] = df["energy_burden_index"].rank(ascending=False).astype(int)
df = df.sort_values("rank")

# ── PRIORITY TIER (for Figma color coding) ─────────────────────────────────────
# Top 20% = Critical, next 30% = High, rest = Moderate
df["priority_tier"] = pd.cut(
    df["energy_burden_index"],
    bins=[0, 0.4, 0.6, 1.0],
    labels=["Moderate", "High", "Critical"],
    include_lowest=True
)

# ── OUTPUT ─────────────────────────────────────────────────────────────────────
output_cols = [
    "rank", "neighbourhood", "nb_number",
    "energy_burden_index", "priority_tier",
    "income_score", "renter_score", "consumption_score", "age_score",
    "est_kwh", "renter_pct", "dominant_type"
]
df[output_cols].to_csv(OUTPUT_FILE, index=False)

# ── SUMMARY PRINT ──────────────────────────────────────────────────────────────
print(f"\n{'='*55}")
print(f"  ENERGY BURDEN INDEX — TOP 15 NEIGHBOURHOODS")
print(f"{'='*55}")
print(f"{'Rank':<5} {'Neighbourhood':<30} {'EBI':>5} {'Tier':<10}")
print(f"{'-'*55}")
for _, row in df.head(15).iterrows():
    print(f"{int(row['rank']):<5} {row['neighbourhood']:<30} "
          f"{row['energy_burden_index']:.3f}  {row['priority_tier']}")

print(f"\nWeights used: {WEIGHTS}")
print(f"Output saved to: {OUTPUT_FILE}")
print(f"Total neighbourhoods scored: {len(df)}")
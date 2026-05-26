// ─── Core Types ───────────────────────────────────────────────────────────────

export type Tier = 'Critical' | 'High' | 'Moderate';
export type ProgramKey = 'EAP' | 'OESP' | 'LEAP' | 'MULTIRES' | 'SOE_HOME' | 'SOE_THERM';
export type ViewMode = 'burden' | 'decision';

// ─── Raw JSON shape from public/data/neighbourhoods.json ──────────────────────
export interface RawNeighbourhood {
  id: number;
  name: string;
  rank: number;
  ebi_score: number;
  tier: Tier;
  scores: {
    income: number;
    renter: number;
    consumption: number;
    age: number;
  };
  raw: {
    est_kwh: number;
    renter_pct: number;
    dominant_type: string;
  };
  programs: {
    primary: {
      name: string;
      annual_benefit_per_hh: number;
      eligibility: string;
    };
    secondary: {
      name: string;
      annual_benefit_per_hh: number;
      eligibility: string;
    };
  };
  impact: {
    eligible_households: number;
    total_annual_benefit: number;
    uptake_assumption: string;
  };
}

// ─── Processed shape used throughout the app ──────────────────────────────────
export interface Neighbourhood {
  id: number;               // nb_number / AREA_SHORT_CODE join key
  name: string;
  rank: number;
  ebi: number;              // 0–1 energy burden index
  tier: Tier;

  // Sub-scores (0–1)
  income: number;
  renter: number;
  consumption: number;
  age: number;

  // Raw values
  est_kwh: number;
  renter_pct: number;
  dwelling: string;

  // Program recommendations
  primaryKey: ProgramKey;
  secondaryKey: ProgramKey;
  primaryName: string;
  secondaryName: string;
  primaryBenefit: number;
  secondaryBenefit: number;
  primaryEligibility: string;
  secondaryEligibility: string;

  // Impact
  eligible_households: number;
  total_annual_benefit: number;
  uptake_assumption: string;
}

export interface Program {
  name: string;
  benefit: number;
  eligibility: string;
  short: string;
}

// GeoJSON types
export interface TorontoFeature {
  type: 'Feature';
  geometry: {
    type: 'MultiPolygon' | 'Polygon';
    coordinates: number[][][] | number[][][][];
  };
  properties: {
    AREA_SHORT_CODE: string;
    AREA_NAME: string;
    [key: string]: unknown;
  };
}

export interface TorontoGeoJSON {
  type: 'FeatureCollection';
  features: TorontoFeature[];
}

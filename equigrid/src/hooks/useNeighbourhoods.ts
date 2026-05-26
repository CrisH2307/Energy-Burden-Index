import { useEffect, useState } from 'react';
import type { Neighbourhood, RawNeighbourhood, TorontoGeoJSON } from '../types';
import { nameToKey } from '../data/constants';

interface UseNeighbourhoodsResult {
  data: Neighbourhood[];
  geojson: TorontoGeoJSON | null;
  loading: boolean;
  error: string | null;
}

/**
 * Loads neighbourhoods.json and toronto_neighbourhoods.geojson from /data/,
 * then joins them on id ↔ AREA_SHORT_CODE.
 */
export function useNeighbourhoods(): UseNeighbourhoodsResult {
  const [data, setData] = useState<Neighbourhood[]>([]);
  const [geojson, setGeojson] = useState<TorontoGeoJSON | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [nbRes, geoRes] = await Promise.all([
          fetch('/data/neighbourhoods.json'),
          fetch('/data/toronto_neighbourhoods.geojson'),
        ]);

        if (!nbRes.ok) throw new Error(`Failed to load neighbourhoods.json: ${nbRes.status}`);
        if (!geoRes.ok) throw new Error(`Failed to load GeoJSON: ${geoRes.status}`);

        const rawNb: RawNeighbourhood[] = await nbRes.json();
        const rawGeo: TorontoGeoJSON    = await geoRes.json();

        if (cancelled) return;

        // Process neighbourhoods JSON
        const processed: Neighbourhood[] = rawNb.map((r) => ({
          id:              r.id,
          name:            r.name,
          rank:            r.rank,
          ebi:             r.ebi_score,
          tier:            r.tier,
          income:          r.scores.income,
          renter:          r.scores.renter,
          consumption:     r.scores.consumption,
          age:             r.scores.age,
          est_kwh:         r.raw.est_kwh,
          renter_pct:      r.raw.renter_pct,
          dwelling:        r.raw.dominant_type,
          primaryKey:      nameToKey(r.programs.primary.name),
          secondaryKey:    nameToKey(r.programs.secondary.name),
          primaryName:     r.programs.primary.name,
          secondaryName:   r.programs.secondary.name,
          primaryBenefit:  r.programs.primary.annual_benefit_per_hh,
          secondaryBenefit:r.programs.secondary.annual_benefit_per_hh,
          primaryEligibility:   r.programs.primary.eligibility,
          secondaryEligibility: r.programs.secondary.eligibility,
          eligible_households:  r.impact.eligible_households,
          total_annual_benefit: r.impact.total_annual_benefit,
          uptake_assumption:    r.impact.uptake_assumption,
        }));

        setData(processed);
        setGeojson(rawGeo);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Unknown error loading data');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return { data, geojson, loading, error };
}

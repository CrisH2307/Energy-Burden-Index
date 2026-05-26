# EquiGrid — VS Code Project Structure

This is the structural blueprint Members 2 and 3 will follow when porting the HTML preview to a real React project.

## Recommended Stack

- **Vite + React 18 + TypeScript**
- **Tailwind CSS** (utility classes used in preview)
- **@arcgis/map-components** for the ArcGIS map
- **D3** (only if needed for color scaling — Tailwind handles most styling)

## Setup Commands

```bash
npm create vite@latest equigrid -- --template react-ts
cd equigrid
npm install
npm install @arcgis/map-components @arcgis/core
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

## File Structure

```
equigrid/
├── public/
│   ├── data/
│   │   ├── neighbourhoods.json        ← Member 1 outputs this
│   │   └── toronto_neighbourhoods.geojson  ← from open.toronto.ca
├── src/
│   ├── App.tsx                        ← top-level layout, state
│   ├── main.tsx                       ← Vite entry
│   ├── index.css                      ← Tailwind directives
│   ├── types.ts                       ← TypeScript types for Neighbourhood
│   ├── data/
│   │   └── constants.ts               ← TIER_COLORS, PROGRAM_COLORS
│   ├── hooks/
│   │   ├── useNeighbourhoods.ts       ← loads & joins JSON + GeoJSON
│   │   └── useFilters.ts              ← filter state management
│   ├── components/
│   │   ├── Sidebar.tsx                ← Member 2 owns
│   │   ├── MapView.tsx                ← Member 2/4 owns
│   │   ├── DetailPanel.tsx            ← Member 3 owns
│   │   ├── ScoreBar.tsx               ← Member 3 owns
│   │   ├── ProgramCard.tsx            ← Member 3 owns
│   │   ├── ModeToggle.tsx             ← Member 2 owns
│   │   ├── TierFilter.tsx             ← Member 2 owns
│   │   └── CIMDToggle.tsx             ← Member 4 owns
│   └── utils/
│       ├── exportBriefing.ts          ← Member 3 owns
│       └── colors.ts                  ← burdenColor() function
```

## TypeScript Types (`src/types.ts`)

```typescript
export type Tier = 'Critical' | 'High' | 'Moderate';
export type ProgramKey = 'EAP' | 'OESP' | 'LEAP' | 'MULTIRES' | 'SOE';

export interface Neighbourhood {
  id: number;
  name: string;
  rank: number;
  ebi: number;
  tier: Tier;
  income: number;
  renter: number;
  consumption: number;
  age: number;
  est_kwh: number;
  renter_pct: number;
  dwelling: string;
  p_primary: ProgramKey;
  p_secondary: ProgramKey;
  households: number;
  eligible: number;
  impact: number;
}

export interface Program {
  name: string;
  benefit: number;
  eligibility: string;
  short: string;
}
```

## Color Constants (`src/data/constants.ts`)

```typescript
export const TIER_COLORS = {
  Critical: { bg: '#DC2626', light: '#FEE2E2', text: '#7F1D1D' },
  High:     { bg: '#F97316', light: '#FED7AA', text: '#9A3412' },
  Moderate: { bg: '#14B8A6', light: '#CCFBF1', text: '#115E59' }
};

export const PROGRAM_COLORS = {
  EAP:      { bg: '#8B5CF6', light: '#EDE9FE', text: '#5B21B6', name: 'EAP' },
  OESP:     { bg: '#14B8A6', light: '#CCFBF1', text: '#115E59', name: 'OESP' },
  LEAP:     { bg: '#3B82F6', light: '#DBEAFE', text: '#1E40AF', name: 'LEAP' },
  MULTIRES: { bg: '#F97316', light: '#FED7AA', text: '#9A3412', name: 'Multi-Res' },
  SOE:      { bg: '#84CC16', light: '#ECFCCB', text: '#3F6212', name: 'Save on Energy' }
};

export const WEIGHTS = {
  income: 0.35, renter: 0.25, consumption: 0.25, age: 0.15
};
```

## ArcGIS Map Integration (Member 4's task)

Replace the grid view in `MapView.tsx` with the real ArcGIS map:

```tsx
import '@arcgis/map-components/components/arcgis-map';
import { useEffect, useRef } from 'react';

function MapView({ data, mode, selectedId, setSelectedId, tiers, cimdOn }) {
  const mapRef = useRef<HTMLArcgisMapElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    // Load GeoJSON, join with data, render polygons
    // Each polygon's fill = mode === 'burden' ? burdenColor(ebi) : PROGRAM_COLORS[p_primary]
    // Click polygon → setSelectedId
    // CIMD overlay = additional FeatureLayer from Living Atlas URL
  }, [data, mode, cimdOn]);

  return (
    <arcgis-map
      ref={mapRef}
      basemap="gray-vector"
      center="-79.38,43.72"
      zoom="11"
    />
  );
}
```

## CIMD Living Atlas URL (Member 4 to verify)

Search ArcGIS Online for: `Canadian Index of Multiple Deprivation`
Expected layer: Statistics Canada's official feature service.

Use as:
```typescript
const cimdLayer = new FeatureLayer({
  url: 'https://services.arcgis.com/...',  // Member 4 finds this
  opacity: 0.4,
  visible: cimdOn
});
```

## Toronto Neighbourhood GeoJSON

Download from: https://open.toronto.ca/dataset/neighbourhoods/

Match column: `AREA_SHORT_CODE` in GeoJSON → `nb_number` in our data.

## Reference: The Preview HTML

The `equigrid_preview.html` file is the reference implementation. All components, colors, layouts, and interaction patterns are already correct there. Members can copy logic directly from the preview into TypeScript components.

The ONLY differences in the production app:
1. Replace grid with real ArcGIS map polygons (Member 4)
2. Load data from JSON files (not embedded)
3. Add TypeScript types
4. Split into separate component files

Everything else — design tokens, formulas, recommendation logic, briefing export — is already done in the preview.

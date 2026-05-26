# Esri Integration — EquiGrid (Seneca Hackathon 2026)

EquiGrid is a React + TypeScript decision-support app for Toronto utility planners, built for **Theme 3: Community Equity** (Alectra + Esri Canada). This document lists every Esri technology used in the project and how it supports the pitch deck.

---

## Esri technologies in use

| Technology | Package / service | Role in EquiGrid |
|------------|-------------------|------------------|
| **ArcGIS Maps SDK for JavaScript** | `@arcgis/core` ^5.0.19 | Core mapping runtime: map, view, layers, symbols, popups |
| **Map** | `@arcgis/core/Map` | Container for basemap + operational layers |
| **MapView** | `@arcgis/core/views/MapView` | 2D map display, pan/zoom, hit-testing for clicks |
| **Basemap: gray-vector** | ArcGIS Online basemap gallery | Neutral backdrop so EBI choropleth colours read clearly |
| **GraphicsLayer** | `@arcgis/core/layers/GraphicsLayer` | Client-side neighbourhood polygons joined to EBI data |
| **Graphic** | `@arcgis/core/Graphic` | One polygon per neighbourhood with attributes + popup |
| **Polygon** | `@arcgis/core/geometry/Polygon` | GeoJSON → Esri geometry (WGS 84 / WKID 4326) |
| **SimpleFillSymbol / SimpleLineSymbol** | `@arcgis/core/symbols/*` | Tier/program fill colours and selection outline |
| **PopupTemplate** | `@arcgis/core/PopupTemplate` | Click popup: rank, EBI, tier, primary program |
| **FeatureLayer** (planned overlay) | `@arcgis/core/layers/FeatureLayer` | CIMD 2021 validation layer from Statistics Canada |
| **esriConfig (CDN assets)** | `@arcgis/core/config` | Loads SDK assets from `js.arcgis.com` CDN to avoid bundling ~100MB |
| **Esri light theme CSS** | `@arcgis/core/assets/esri/themes/light/main.css` | Default map UI styling |
| **ArcGIS REST services** | StatCan + City of Toronto | CIMD deprivation quintiles; neighbourhood boundaries (validation script) |

### Implementation location

- **Primary:** `equigrid/src/components/MapView.tsx` (`EsriMapView` component)
- **Entry:** `equigrid/src/main.tsx` (Esri CSS import; StrictMode disabled to avoid double MapView mount)
- **Build:** `equigrid/vite.config.ts` (`chunkSizeWarningLimit` raised for ArcGIS chunks)

### Map configuration (current)

| Setting | Value |
|---------|--------|
| Basemap | `gray-vector` |
| Center | `[-79.38, 43.72]` (Toronto) |
| Zoom | `11` |
| UI widgets | Zoom, compass |
| Attribution | Esri / StatCan / City of Toronto (automatic via MapView; **"Powered by Esri"** visible in map attribution bar) |

### Data join on the map

- **Boundaries:** `public/data/toronto_neighbourhoods.geojson` (City of Toronto)
- **Join key:** GeoJSON `AREA_SHORT_CODE` ↔ EBI `id` / `nb_number`
- **Symbology:**
  - **Burden mode** — continuous red scale via `burdenColor(ebi)` in `src/utils/colors.ts`
  - **Decision mode** — discrete colours from `PROGRAM_COLORS` in `src/data/constants.ts`

### CIMD overlay (Statistics Canada — ArcGIS Living Atlas / Open Government)

**Confirmed REST endpoint (2021 CIMD):**

```
https://maps-cartes.services.geo.ca/server2_serveur2/rest/services/StatCan/multiple_deprivation_2021/MapServer/1
```

- **Publisher:** Statistics Canada (Government of Canada)
- **Geometry:** Dissemination areas (DA)
- **Fields used:** Four dimension quintiles (`Residential_instability_Q`, `Economic_dependency_Q`, `Situational_vulnerability_Q`, `Ethno_cultural_composition_Q`)
- **Overlay settings (spec):** `opacity: 0.4`, `visible` when CIMD toggle on, must not block neighbourhood click/hit-test (overlay below or non-interactive graphics layer)

**Open data catalogue:** [Canadian Index of Multiple Deprivation 2021](https://open.canada.ca/data/en/dataset/ec6dc8e7-2fa0-4e49-8969-38541ca0a34d)

---

## CIMD validation toggle (UI)

- State: `cimdOn` / `setCimdOn` in `App.tsx`
- Control: checkbox in `Sidebar.tsx` — *"Show CIMD Validation Overlay"*
- Spec component: `CIMDToggle.tsx` (Member 4) — optional dedicated toggle matching Tailwind patterns

---

## Simulated vs. real utility data (Alectra)

**Important for judges and the pitch:**

EquiGrid's Energy Burden Index is built from **public and open data** (Census 2021, NRCan SHEU, OEB rates, City of Toronto neighbourhoods). The following variables that a real utility operations dashboard would use are **not available** in this hackathon build and are therefore **simulated or omitted**:

| Variable | Status in EquiGrid | Notes |
|----------|-------------------|--------|
| **Feeder-level load / overload risk** | Simulated / not integrated | Would require Alectra GIS feeder network + SCADA |
| **Grid hosting capacity** | Simulated / not integrated | Internal distribution planning data |
| **Outage frequency (SAIDI/CAIDI) by feeder** | Not used | Would strengthen equity–reliability narrative |
| **Transformer age / replacement queue** | Not used | Asset management systems |
| **Low-income enrollment in utility programs (actual uptake)** | **Assumed** 30% uptake | Documented in `build_index.py`; not live CRM data |

The map and EBI scores reflect **socio-economic and building-stock burden**, not live grid stress. Overlaying **CIMD** provides an independent StatCan validation that priority neighbourhoods align with official deprivation metrics (`validation_report.md`).

---

## Authentication

- **No Esri API key required** for the current build: basemap and StatCan public feature services run on anonymous access.
- If the team moves to secured Alectra layers or higher-quota ArcGIS Online items, register an app at [developers.arcgis.com](https://developers.arcgis.com) and set `esriConfig.apiKey`.

---

## Pitch deck talking points (Esri)

1. **Official boundaries + open deprivation data** — City polygons on Esri basemap, validated against StatCan CIMD 2021 on the same map stack.
2. **Planner workflow** — Click neighbourhood → popup + detail panel → export markdown briefing.
3. **Equity-first symbology** — Burden vs. program modes share one map component; colours driven from shared constants.
4. **Honest data story** — Public EBI + CIMD validation now (90% of Critical-tier neighbourhoods align with CIMD quintile 5); Alectra feeder/grid layers as the production roadmap.

---

## Related files

| File | Purpose |
|------|---------|
| `equigrid/src/components/MapView.tsx` | ArcGIS map implementation |
| `validate_cimd.py` | Spatial validation: EBI tiers vs. CIMD quintiles |
| `validation_report.md` | Correlation summary + pitch headline |
| `member4_cursor_prompt_final.md` | Member 4 task specification |

---

## Branding

- Esri brand blue for UI accents (where used): `#0079C1`
- Map attribution must remain visible per Esri terms of use

# Cursor AI — Member 4: ArcGIS / Esri Integration

## Who you are
You are an AI software engineer and coding assistant working on **EquiGrid** — a React + TypeScript web app built for the **Seneca Hackathon 2026**, Theme 3 (Community Equity), sponsored by **Alectra + Esri Canada**.

The app helps utility planners prioritize energy equity programs across Toronto's 158 neighbourhoods using a data-driven **Energy Burden Index (EBI)** scoring system.

---

## Before anything else

**Do NOT start planning or coding yet.**

Start by reading every file already in the project — source files, data files, types, constants, components, and any documentation. Understand what has already been built, what conventions are used, and what state the codebase is in. Then summarize your understanding before doing anything else.

---

## Your tasks

**Your primary file:** `src/components/MapView.tsx`
**Your secondary file:** `src/components/CIMDToggle.tsx`

### 1. ArcGIS map component (`MapView.tsx`)
Replace the existing placeholder with a real ArcGIS map using `@arcgis/map-components`.

Props received from `App.tsx`:
```ts
{ data, mode, selectedId, setSelectedId, tiers, cimdOn }
```

Requirements:
- Basemap: `"gray-vector"`. Center: `[-79.38, 43.72]`, zoom `11`
- Load `toronto_neighbourhoods.geojson`, join polygons with `data` on `AREA_SHORT_CODE` → `nb_number`
- Fill colour per polygon:
  - `mode === 'burden'` → `burdenColor(ebi)` from `src/utils/colors.ts`
  - `mode === 'program'` → `PROGRAM_COLORS[p_primary].bg` from constants
- Click polygon → call `setSelectedId(id)`
- CIMD overlay → `FeatureLayer`, `visible = cimdOn`, `opacity = 0.4`
- Esri attribution (`"Powered by Esri"`) must be visible

### 2. CIMD toggle component (`CIMDToggle.tsx`)
- Toggle switch receiving `cimdOn: boolean` and `setCimdOn: (v: boolean) => void`
- Style must match existing Tailwind patterns in the project

### 3. CIMD Living Atlas URL
- Search ArcGIS Living Atlas for: `"Canadian Index of Multiple Deprivation Statistics Canada"`
- Confirm the official Statistics Canada feature service URL
- Hardcode the confirmed URL into `MapView.tsx`

### 4. Non-code deliverables
- `ESRI_INTEGRATION.md` — every Esri technology used (for the pitch deck); acknowledge that grid/feeder risk variables are **simulated** due to no access to Alectra internal data
- `validation_report.md` — written description of how EBI tiers correlate with CIMD deprivation quintiles; target one pitch-ready line: *"Our Critical tier matches CIMD's top deprivation quintile in XX% of cases."*

---

## Hard constraints

- Do not modify `src/types.ts`, `src/data/constants.ts`, or any file you did not create
- All colours must come from `TIER_COLORS` / `PROGRAM_COLORS` in constants — no hardcoded hex values except `#0079C1` for Esri branding
- CIMD overlay must never block choropleth click interaction

---

## How to work — follow this sequence strictly

1. **Read** every existing file in the project
2. **Summarize** what has already been done and what state the codebase is in
3. **Ask** every question you need answered before planning (see below)
4. **Plan** — only after questions are resolved, write a full step-by-step implementation plan
5. **Wait** — do not write any code until you receive explicit approval of your plan

---

## Questions to ask before planning

Ask all of the following, plus anything else that is unclear after reading the files:

1. What is the exact prop signature `App.tsx` currently passes to `MapView`? Does it already include `cimdOn`?
2. Which `@arcgis` packages are installed and at what versions?
3. Is there a confirmed CIMD Living Atlas URL already, or do you need to find it?
4. Does `burdenColor()` already exist in `src/utils/colors.ts`, or does it need to be created?
5. Is the map mode colour switch (`burden` vs `program`) handled inside `MapView` or resolved before the prop is passed?
6. Is there an Esri API key set up, or does the map run on public/anonymous access?
7. Should the Python validation script be a `.py` file or a Jupyter notebook?

---

## First message

Respond with:
1. A summary of everything you found in the existing codebase
2. A numbered list of all questions and ambiguities you need resolved
3. Nothing else — wait for answers before proceeding

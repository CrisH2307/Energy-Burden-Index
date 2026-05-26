# Cursor AI — Interactive Choropleth Map with Detail Panel

## Context
You are continuing work on **EquiGrid**, a React + TypeScript + Tailwind + ArcGIS app for the Seneca Hackathon 2026. The map and data pipeline already exist. This task is specifically about making the map fully interactive with a right-side detail panel that appears when a neighbourhood is clicked.

---

## Before anything else
Read every existing file in the project first. Understand the current state of `MapView.tsx`, `DetailPanel.tsx`, `App.tsx`, `src/types.ts`, and `src/data/constants.ts` before touching anything. Summarize what you find, then ask any questions before planning. Do not write code until the plan is approved.

---

## What you are building

A two-panel layout:
- **Left / center:** interactive choropleth map of Toronto's 158 neighbourhoods
- **Right:** detail panel that slides in when a neighbourhood is clicked

The reference screenshot shows a red-scale choropleth with clear polygon boundaries. Clicking any polygon opens the detail panel on the right with full neighbourhood data.

---

## Map requirements (`MapView.tsx`)

The map already renders. Make it fully interactive:

1. **Clear polygon boundaries** — each neighbourhood polygon must have a visible stroke (e.g. `1.5px`, dark grey `#555`) so boundaries are legible at zoom 11
2. **Hover state** — on mouseover, highlight the polygon outline (e.g. thicker stroke, `#1a1a1a`, 2.5px) so the user knows it's clickable
3. **Click → select** — clicking a polygon calls `setSelectedId(id)`. The selected polygon gets a distinct navy/dark blue outline (`#1e3a5f`, 3px) matching the screenshot
4. **Choropleth colour scale** — EBI score mapped to a white → red gradient. Low burden = `#fff0f0`, high burden = `#b91c1c`. Use the `burdenColor(ebi)` utility (create it in `src/utils/colors.ts` if it doesn't exist yet)
5. **Legend** — bottom-left corner, labelled "Energy Burden Index" with a Lower → Higher gradient bar, matching the screenshot
6. **Data already loaded** — `toronto_neighbourhoods.geojson` + `neighbourhoods.json` are joined in `useNeighbourhoods.ts`. Use what's there.

---

## Detail panel requirements (`DetailPanel.tsx`)

Panel opens on the right when `selectedNb` is non-null. Receives props: `neighbourhood: Neighbourhood | null` and `onClose: () => void`.

Render exactly this structure, using the sample data below as the reference:

```
[Neighbourhood name]          RANK #[n]
[Tier badge]                       ✕

Overall need score    [score] / 1.000

── Score Breakdown ──────────────────
Income          w=35%   [bar]   0.887
Renter          w=25%   [bar]   0.514
Consumption     w=25%   [bar]   0.769
Building Age    w=15%   [bar]   0.839

── Key Stats ────────────────────────
Est. kWh/yr     [est_kwh]
Renter %        [renter_pct]
Dominant        [dwelling type]

── Recommended Programs ─────────────
[ProgramCard: primary]
[ProgramCard: secondary]

── Projected Impact ─────────────────
If 30% of eligible households enroll:
$[amount] in annual benefit delivered
to [n] households.
```

**Sample data for reference** (Rexdale-Kipling, Rank #1):
- EBI: 0.757, Tier: Critical/Urgent
- Income score: 0.887 (w=35%), Renter: 0.514 (w=25%), Consumption: 0.769 (w=25%), Building Age: 0.839 (w=15%)
- Est. kWh/yr: 12,243 | Renter %: 50% | Dominant: Single detached
- Program 1: Energy Affordability Program (EAP) — Low-income households (OW/ODSP or income <$52k) — $1,500/HH/yr — 1,500 eligible HHs — $2.3M total/yr
- Program 2: Ontario Electricity Support Program (OESP) — Below OESP income thresholds (~$52k for 1–2 person HH) — $420/HH/yr — 1,500 eligible HHs — $630K total/yr
- Projected impact: 30% enrollment → $2,250,000/yr to 1,500 households

---

## ScoreBar component (`src/components/ScoreBar.tsx`)

Props:
```ts
{ label: string, value: number, weight: number, rawLabel?: string }
```

- Horizontal filled bar, width = `value * 100%`
- Bar colour: low value = green-ish, high value = red (burden direction)
- Show `label`, `w=[weight%]`, the filled bar, and the numeric score on the right
- `rawLabel` shown below the bar when available (e.g. `"12,243 kWh/yr"`, `"50%"`) — only for `consumption` and `renter` since those have true raw values; omit for `income` and `age`

---

## ProgramCard component (`src/components/ProgramCard.tsx`)

Props:
```ts
{
  programKey: ProgramKey
  name: string
  benefit: number        // per HH/yr in dollars
  eligibility: string
  eligible: number       // number of eligible households
  impact: number         // total annual $ impact
}
```

- Use `PROGRAM_COLORS[programKey]` for the badge
- Show: program name (with coloured badge), eligibility text, per-HH benefit, eligible HH count, total annual impact
- Clean card style, consistent with Tailwind conventions in the rest of the app

---

## Export (`src/utils/exportBriefing.ts`)

- Input: `Neighbourhood` object
- Output: triggers browser download of `equigrid_briefing_[name].md`
- Content: name, rank, tier, EBI score, all 4 score components with weights, key stats, both programs with eligibility + benefit, projected impact line
- Format must be paste-ready into an email or report

---

## Layout wiring (`App.tsx`)

If not already done:
- When `selectedId` is set → render `<DetailPanel>` in a right panel (fixed width, e.g. `w-96`, scrollable)
- When `onClose` is called → set `selectedId` to `null`
- Map takes remaining width; panel does not overlay the map — it pushes it or sits beside it

---

## Hard constraints

- Do not modify `src/types.ts` or `src/data/constants.ts`
- All colours from `TIER_COLORS` / `PROGRAM_COLORS` in constants — no hardcoded hex values except the map choropleth gradient and `#0079C1` for Esri branding
- `ProgramKey` values in the codebase are `EAP | OESP | LEAP | MULTIRES | SOE_HOME | SOE_THERM` — do not use `SOE`
- Tailwind only — no additional UI libraries

---

## Sequence

1. Read all existing files
2. Summarize what is already done
3. Ask any questions
4. Write your plan
5. Wait for approval before writing any code

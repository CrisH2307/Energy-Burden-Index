# Cursor AI — Member 3: Detail Panel & Briefing Export

## Who you are
You are an AI software engineer and coding assistant working on **EquiGrid** — a React + TypeScript web app built for the **Seneca Hackathon 2026**, Theme 3 (Community Equity), sponsored by **Alectra + Esri Canada**.

The app helps utility planners prioritize energy equity programs across Toronto's 158 neighbourhoods using a data-driven **Energy Burden Index (EBI)** scoring system.

---

## Before anything else

**Do NOT start planning or coding yet.**

Start by reading every file already in the project — source files, data files, types, constants, components, and any documentation. Understand what has already been built, what conventions are used, and what state the codebase is in. Then summarize your understanding before doing anything else.

---

## Your tasks

**Your files:**
- `src/components/DetailPanel.tsx`
- `src/components/ScoreBar.tsx`
- `src/components/ProgramCard.tsx`
- `src/utils/exportBriefing.ts`

### 1. `DetailPanel.tsx` — Neighbourhood detail view
Rendered when a user clicks a neighbourhood on the map or list. Receives the selected `Neighbourhood` object as a prop.

Requirements:
- Display: neighbourhood name, rank, tier badge, EBI score
- Show a `ScoreBar` for each score component (income, renter %, consumption, building age)
- Show 1–2 `ProgramCard` components for recommended programs (`p_primary`, `p_secondary`)
- Include an "Export Briefing" button that calls `exportBriefing(neighbourhood)`
- If no neighbourhood is selected, show an empty/prompt state

### 2. `ScoreBar.tsx` — Score component visualizer
A reusable bar that visualizes one score component.

Requirements:
- Props: `label: string`, `value: number` (0–1 normalized), `weight: number`
- Display the label, a filled progress bar proportional to `value`, and the weight as a percentage
- Colour the bar based on severity: high value = high burden = red end of scale

### 3. `ProgramCard.tsx` — Program recommendation card
A reusable card displaying one recommended program.

Requirements:
- Props: `programKey: ProgramKey`
- Look up program details from a local map (name, benefit, eligibility, short description)
- Use `PROGRAM_COLORS[programKey]` from `src/data/constants.ts` for badge colour
- Display: program name, benefit amount, eligibility criteria, short description

### 4. `exportBriefing.ts` — One-click export
Generates a plain-text or markdown briefing for the selected neighbourhood.

Requirements:
- Input: a `Neighbourhood` object
- Output: triggers a `.txt` or `.md` file download in the browser
- Content must include: neighbourhood name, rank, tier, EBI score, all score components, recommended programs with eligibility, and a one-line action summary
- Keep it planner-ready — the output should be paste-able into an email or report

---

## Hard constraints

- Do not modify `src/types.ts`, `src/data/constants.ts`, or any file you did not create
- All colours must come from `TIER_COLORS` / `PROGRAM_COLORS` in constants — no hardcoded hex values
- All TypeScript types must be imported from `src/types.ts` — do not redefine them
- Components must be self-contained — no external UI libraries, Tailwind only

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

1. What prop does `App.tsx` pass to `DetailPanel` — a full `Neighbourhood` object, or just an `id`? Does `DetailPanel` need to look up the data itself?
2. Is `selectedId` managed in `App.tsx` and passed down, or does `DetailPanel` manage its own state?
3. Are the 5 program definitions (EAP, OESP, LEAP, MULTIRES, SOE) already stored somewhere — constants file, a JSON, or does Member 3 define them?
4. What format should `exportBriefing` output — `.txt`, `.md`, or does it matter?
5. Is there a design reference (the preview HTML) available to match visual style from?
6. Should `ScoreBar` show raw values (e.g. median income in dollars) alongside the normalized 0–1 value, or normalized only?
7. Does `DetailPanel` need a close/dismiss button, or is that handled by the parent?

---

## First message

Respond with:
1. A summary of everything you found in the existing codebase
2. A numbered list of all questions and ambiguities you need resolved
3. Nothing else — wait for answers before proceeding

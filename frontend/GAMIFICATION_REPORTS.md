# EcoSphere — Gamification & Reports (Member 3)

Two fully-built pages for the EcoSphere ESG platform, styled after the dark/orange
mockup. They run entirely client-side on seeded demo data (`lib/mock-data.ts`), so no
backend/MySQL is required to demo them.

## Run

```bash
cd frontend
npm install          # first time only
npm run dev          # http://localhost:3000  (root redirects to /gamification)
```

- **Gamification:** http://localhost:3000/gamification
- **Reports:** http://localhost:3000/reports

`npm run build` type-checks and compiles both pages.

## Gamification (`app/gamification/page.tsx`)

Pill sub-tabs: **Challenges · Challenge Participation · Badges · Rewards · Leaderboard**.

- **Challenges** — `+ New Challenge` dialog, lifecycle filter chips (Draft/Active/Under
  Review/Completed/Archived), challenge cards (XP · difficulty · deadline · status pill ·
  Join Challenge), plus admin lifecycle transitions, a Badge Gallery panel and a Leaderboard
  panel.
- **Challenge Participation** — approve/reject table. **Approving awards XP** and
  **auto-awards badges** when the participant crosses an XP/completed-challenge threshold.
- **Badges** — earned vs locked gallery with unlock rules.
- **Rewards** — redeem with points; stock + balance decrement; blocked when out of stock or
  insufficient points.
- **Leaderboard** — ranked employees/departments with a department filter and XP bar chart.

## Reports (`app/reports/page.tsx`)

Report gallery cards + pill sub-tabs: **Environmental · Social · Governance · ESG Summary ·
Custom Builder**.

- Each prebuilt report = KPI cards + charts (emissions trend line, donut, ranking bars,
  ESG gauge) + a data table, with **Export: PDF / Excel / CSV**.
- **Custom Builder** — six filters (Date Range · Department · Module · Employee · Challenge ·
  ESG Category) → Run Report → preview table → export.

## Demo script

1. Gamification → Challenge Participation → **Approve** Aditi Rao's Sustainability Sprint →
   My XP 4,850 → 5,050, **Badges 3/6 → 4/6** (Sustainability Champion auto-unlocks).
2. Rewards → **Redeem** the Water Bottle → points 1,250 → 950, stock 25 → 24; note
   "Not enough" / "Out of stock" states.
3. Challenges → move a Draft challenge → Active → Under Review → Completed.
4. Reports → Environmental → change filters; then **Custom Builder** → Run Report →
   **Export CSV / Excel / PDF**.

## Key files

- Pages: `app/gamification/page.tsx`, `app/reports/page.tsx`
- Data/types: `lib/mock-data.ts`, `lib/types.ts`
- Exports: `lib/exporters.ts`
- Shell/theme: `components/layout/PlatformFrame.tsx`, `app/globals.css` (dark + orange),
  forced dark in `app/layout.tsx`
- Charts: `components/charts/Charts.tsx` (Recharts)
- Gamification tabs: `components/gamification/*`
- Report views: `components/reports/*`
- Toasts: `components/feedback/Toaster.tsx`

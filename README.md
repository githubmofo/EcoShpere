# EcoSphere – ESG Management Platform

An ESG (Environmental, Social, Governance) management dashboard built with **Next.js**, **Tailwind CSS**, **shadcn/ui**, and **Recharts**.

## Project Structure

```
ecosphere-esg-platform/
├─ frontend/    # Next.js App Router (Tailwind + shadcn/ui + Recharts)
├─ backend/     # Express + Prisma + MySQL
└─ README.md
```

## Getting Started

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev
```

## Team Members

| Member   | Pages                        |
| -------- | ---------------------------- |
| Member 1 | Dashboard, Environmental     |
| Member 2 | Social, Governance           |
| Member 3 | Gamification, Reports        |
| Member 4 | Settings                     |

## Tech Stack

- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS + shadcn/ui
- **Charts:** Recharts
- **Backend:** Express + Prisma + MySQL
- **Data:** Seeded mock data for demo

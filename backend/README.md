# Backend – Express + Prisma + MySQL

## Setup

```bash
npm install
npx prisma generate
npx prisma db push
npm run seed   # Seed sample data
npm run dev    # Start dev server
```

## Environment

Copy `.env.example` to `.env` and set your MySQL connection string.

## API Routes

| Route                  | Description           |
| ---------------------- | --------------------- |
| `/api/dashboard`       | Dashboard metrics     |
| `/api/environmental`   | Environmental data    |
| `/api/social`          | Social data           |
| `/api/governance`      | Governance data       |
| `/api/gamification`    | Gamification data     |
| `/api/reports`         | Reports data          |
| `/api/settings`        | Settings management   |

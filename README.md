# EcoSphere

EcoSphere is a comprehensive ESG (Environmental, Social, and Governance) management platform designed to track sustainability metrics, foster social responsibility, and ensure corporate governance compliance.

## Quick Start

```bash
# Clone the repository
git clone https://github.com/githubmofo/EcoShpere.git
cd EcoShpere

# Setup the Local Database
The project is configured to use a local SQLite database (`dev.db`). No additional database server installation is required.

# Setup the Backend
cd backend
npm install
# The .env file uses a local SQLite file (e.g., DATABASE_URL="file:./dev.db")
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
npm run dev

# In a separate terminal, setup the Frontend
cd frontend
npm install
# Set up your .env.local file
npm run dev
```

Open http://localhost:3000 to view the application.
The backend API runs on http://localhost:4000.

## Requirements

- Node.js 20+
- SQLite (built-in via Prisma)
- npm or yarn

## Project Structure

```
backend/
├── prisma/       # Database schema and seed scripts
└── src/
    ├── controllers/ # API endpoint logic
    ├── routes/      # Express route definitions
    └── common/      # Shared utilities and Prisma client

frontend/
├── app/          # Next.js App Router pages
├── components/   # Reusable UI components (shadcn/ui, layout)
└── lib/          # Utilities, API client, mock data
```

## Environment Variables

### Backend (`backend/.env`)
| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | No | API port (default: 4000) |
| `DATABASE_URL` | Yes | Local database connection string (e.g., `file:./dev.db`) |

### Frontend (`frontend/.env.local`)
| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Yes | URL for the backend API (e.g. `http://localhost:4000/api`) |

## Key Pages and Features

EcoSphere is broken down into three main pillars:

### 🌍 Environmental
- **Dashboard**: High-level overview of carbon emissions, reduction targets, and environmental score.
- **Goals Tracking**: Track department-specific carbon emission goals and manage roadmap milestones.
- **Carbon Transactions**: Log and review carbon offset purchases and emission events.

### 🤝 Social
- **Dashboard**: Track overall employee participation, volunteering hours, and training metrics.
- **CSR Activities**: Browse, create, and join Corporate Social Responsibility (CSR) events like beach cleanups or mentoring.
- **Diversity & Training**: View demographic distribution and diversity compliance training progress.

### ⚖️ Governance
- **Dashboard**: Monitor open compliance issues, audits, and policy acknowledgements.
- **Policies & Acknowledgements**: Manage corporate policies (Code of Conduct, Anti-Bribery) and track employee acknowledgements.
- **Audits**: Track scheduled, in-progress, and completed audits alongside their findings.

## Tech Stack
- **Frontend**: Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS v4, Framer Motion, Recharts, shadcn/ui.
- **Backend**: Node.js, Express, TypeScript, Prisma ORM, SQLite.

## Authors
- Jenish Lad
- Ansh Nayak
- Parv Garara
- Punya Patel

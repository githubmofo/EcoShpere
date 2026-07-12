// src/common/types.ts
// Backend TypeScript types (mirror of frontend types)
// Keep in sync with frontend/lib/types.ts

export interface EmissionFactor {
  id: string;
  category: string;
  source: string;
  factor: number;
  unit: string;
  updatedAt: string;
}

export interface CarbonTransaction {
  id: string;
  date: string;
  department: string;
  category: string;
  amount: number;
  unit: string;
  description: string;
}

export interface EsgScore {
  environmental: number;
  social: number;
  governance: number;
  overall: number;
  period: string;
}

// TODO: Add remaining types as needed

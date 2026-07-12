// lib/types.ts
// Shared TypeScript types and interfaces for the ESG platform

// ─── Environmental ───────────────────────────────────────────
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

export interface EnvironmentalGoal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  deadline: string;
  status: "on-track" | "at-risk" | "behind";
}

// ─── Social ──────────────────────────────────────────────────
export interface CsrActivity {
  id: string;
  title: string;
  date: string;
  participants: number;
  impact: string;
  status: "planned" | "ongoing" | "completed";
}

export interface DiversityMetric {
  id: string;
  category: string;
  value: number;
  total: number;
  period: string;
}

// ─── Governance ──────────────────────────────────────────────
export interface Policy {
  id: string;
  title: string;
  category: string;
  version: string;
  effectiveDate: string;
  status: "active" | "draft" | "archived";
}

export interface Audit {
  id: string;
  title: string;
  auditor: string;
  date: string;
  findings: number;
  status: "scheduled" | "in-progress" | "completed";
}

export interface ComplianceIssue {
  id: string;
  title: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "in-progress" | "resolved";
  reportedDate: string;
  assignee: string;
}

// ─── Gamification ────────────────────────────────────────────
export interface Challenge {
  id: string;
  title: string;
  description: string;
  points: number;
  startDate: string;
  endDate: string;
  participantCount: number;
  status: "active" | "upcoming" | "completed";
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedBy: number;
  criteria: string;
}

export interface Reward {
  id: string;
  name: string;
  pointsCost: number;
  description: string;
  available: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  department: string;
  points: number;
  badges: number;
}

// ─── Reports ─────────────────────────────────────────────────
export interface EsgScore {
  environmental: number;
  social: number;
  governance: number;
  overall: number;
  period: string;
}

// ─── Settings ────────────────────────────────────────────────
export interface Department {
  id: string;
  name: string;
  head: string;
  employeeCount: number;
}

export interface Category {
  id: string;
  name: string;
  pillar: "environmental" | "social" | "governance";
  description: string;
}

export interface NotificationSetting {
  id: string;
  type: string;
  enabled: boolean;
  channel: "email" | "in-app" | "both";
}

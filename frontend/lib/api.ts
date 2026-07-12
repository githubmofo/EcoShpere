// lib/api.ts
// Typed fetch layer for the EcoSphere backend (Express + Prisma + MySQL).
// Every read has a mock-data fallback so the pages still render if the API is down.

import type {
  Badge,
  Challenge,
  ChallengeParticipation,
  ChallengeStatus,
  DepartmentScore,
  LeaderboardEntry,
  MonthlyEmission,
  ReportRow,
  Reward,
} from "./types";
import * as seed from "./mock-data";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`GET ${path} → ${res.status}`);
  return res.json();
}

async function send<T>(path: string, method: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}`);
  return res.json();
}

// ─── Gamification ────────────────────────────────────────────
export interface GamificationSummary {
  name: string;
  role: string;
  department: string;
  xp: number;
  points: number;
  badges: number;
  totalBadges: number;
  activeChallenges: number;
  totalChallenges: number;
}

export interface GamificationData {
  summary: GamificationSummary;
  challenges: Challenge[];
  participation: ChallengeParticipation[];
  badges: Badge[];
  rewards: Reward[];
  leaderboard: LeaderboardEntry[];
}

export async function fetchGamification(): Promise<GamificationData> {
  const [summary, challenges, participation, badges, rewards, leaderboard] =
    await Promise.all([
      get<GamificationSummary>("/gamification/summary"),
      get<Challenge[]>("/gamification/challenges"),
      get<ChallengeParticipation[]>("/gamification/participation"),
      get<Badge[]>("/gamification/badges"),
      get<Reward[]>("/gamification/rewards"),
      get<LeaderboardEntry[]>("/gamification/leaderboard"),
    ]);
  return { summary, challenges, participation, badges, rewards, leaderboard };
}

export const approveParticipation = (id: string) =>
  send(`/gamification/participation/${id}/approve`, "POST");
export const rejectParticipation = (id: string) =>
  send(`/gamification/participation/${id}/reject`, "POST");
export const redeemReward = (id: string) =>
  send(`/gamification/rewards/${id}/redeem`, "POST");
export const updateChallengeStatus = (id: string, status: ChallengeStatus) =>
  send(`/gamification/challenges/${id}/status`, "PATCH", { status });
export const createChallengeApi = (body: Omit<Challenge, "id">) =>
  send(`/gamification/challenges`, "POST", body);

// ─── Reports ─────────────────────────────────────────────────
export interface NamedValue {
  name: string;
  value: number;
}

export interface ReportsData {
  monthlyEmissions: MonthlyEmission[];
  emissionsByCategory: NamedValue[];
  emissionsByDepartment: NamedValue[];
  csrParticipation: NamedValue[];
  diversityBreakdown: NamedValue[];
  trainingCompletion: NamedValue[];
  complianceBySeverity: NamedValue[];
  governanceStats: {
    policyAckRate: number;
    auditsCompleted: number;
    auditsTotal: number;
    openIssues: number;
    overdueIssues: number;
  };
  departmentScores: DepartmentScore[];
  overallEsg: number;
  esgPillars: { environmental: number; social: number; governance: number };
  reportRows: ReportRow[];
  employees: string[];
  departments: string[];
  challenges: string[];
}

// Bundled mock data used as the fallback when the API is unavailable.
export const mockReportsData: ReportsData = {
  monthlyEmissions: seed.monthlyEmissions,
  emissionsByCategory: seed.emissionsByCategory,
  emissionsByDepartment: seed.emissionsByDepartment,
  csrParticipation: seed.csrParticipation,
  diversityBreakdown: seed.diversityBreakdown,
  trainingCompletion: seed.trainingCompletion,
  complianceBySeverity: seed.complianceBySeverity,
  governanceStats: seed.governanceStats,
  departmentScores: seed.departmentScores,
  overallEsg: seed.overallEsg,
  esgPillars: seed.esgPillars,
  reportRows: seed.reportRows,
  employees: [...seed.EMPLOYEES],
  departments: [...seed.DEPARTMENTS],
  challenges: seed.challenges.map((c) => c.title),
};

export async function fetchReportsData(): Promise<ReportsData> {
  return get<ReportsData>("/reports/data");
}

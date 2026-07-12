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
  dueDate?: string;
  overdue?: boolean;
}

// ─── Gamification ────────────────────────────────────────────
// Full challenge lifecycle per the spec: Draft → Active → Under Review → Completed, or Archived.
export type ChallengeStatus =
  | "draft"
  | "active"
  | "under-review"
  | "completed"
  | "archived";

export type Difficulty = "Easy" | "Medium" | "Hard";

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string; // emoji
  xp: number;
  difficulty: Difficulty;
  deadline: string; // ISO date
  status: ChallengeStatus;
  evidenceRequired: boolean;
  participantCount: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji
  criteria: string; // human-readable unlock rule
  unlockType: "xp" | "challenges";
  unlockThreshold: number;
  earned: boolean;
  earnedBy: number;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  icon: string;
  pointsCost: number;
  stock: number;
  category: string;
}

export interface RewardRedemption {
  id: string;
  rewardId: string;
  rewardName: string;
  pointsSpent: number;
  redeemedAt: string;
}

export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface ChallengeParticipation {
  id: string;
  challengeId: string;
  challengeTitle: string;
  employee: string;
  department: string;
  progress: number; // 0-100
  proof: string | null;
  approvalStatus: ApprovalStatus;
  xpAwarded: number;
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  kind: "employee" | "department";
  department: string;
  xp: number;
  badges: number;
}

export interface CurrentUser {
  id: string;
  name: string;
  role: "Admin" | "Employee";
  department: string;
  xp: number;
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

export interface ReportDepartmentScore {
  department: string;
  environmental: number;
  social: number;
  governance: number;
  total: number;
}

export interface MonthlyEmission {
  month: string; // e.g. "Feb"
  emissions: number; // tCO2e
  target: number;
}

export type ReportModule =
  | "Environmental"
  | "Social"
  | "Governance"
  | "Gamification";

export type EsgCategory = "environmental" | "social" | "governance";

export interface ReportFilters {
  dateRange: string;
  department: string;
  module: string;
  employee: string;
  challenge: string;
  esgCategory: string;
}

export interface ReportRow {
  date: string;
  department: string;
  module: string;
  metric: string;
  value: string;
  employee: string;
}

// ─── Settings ────────────────────────────────────────────────
export interface Department {
  id: string;
  name: string;
  code: string;
  headUserId: string | null;
  parentDepartmentId: string | null;
  employeeCount: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Category {
  id: string;
  name: string;
  type: 'CSR_ACTIVITY' | 'CHALLENGE';
  status: 'ACTIVE' | 'INACTIVE';
}

export interface EsgConfig {
  id?: string;
  envWeight: number;
  socialWeight: number;
  governanceWeight: number;
  autoEmissionEnabled: boolean;
  evidenceRequiredEnabled: boolean;
  badgeAutoAwardEnabled: boolean;
}

export interface NotificationSettings {
  id?: string;
  emailEnabled: boolean;
  inAppEnabled: boolean;
  notifyOnComplianceIssue: boolean;
  notifyOnComplianceOverdue: boolean;
  notifyOnCsrApproval: boolean;
  notifyOnChallengeApproval: boolean;
  notifyOnPolicyReminder: boolean;
  notifyOnBadgeUnlock: boolean;
}

export interface DepartmentScore {
  departmentId: string;
  environmentalScore: number;
  socialScore: number;
  governanceScore: number;
  totalScore: number;
}

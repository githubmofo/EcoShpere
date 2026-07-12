// lib/types.ts
// Shared TypeScript types and interfaces for the ESG platform

// ─── Environmental ───────────────────────────────────────────
export interface EmissionFactor {
  id: string;
  name: string;
  factorValue: number;
  unit: string;
  status: "Active" | "Inactive";
  category?: string;
  source?: string;
  factor?: number;
  updatedAt: string;
}

export interface CarbonTransaction {
  id: string;
  department: string;
  sourceType: "Purchase" | "Manufacturing" | "Expense" | "Fleet" | "Other";
  quantity: number;
  emissionsValue: number;
  operationDate: string;
  autoCalculated: boolean;
  emissionFactorId?: string;
  date?: string;
  category?: string;
  amount?: number;
  unit?: string;
  description?: string;
}

export interface EnvironmentalGoal {
  id: string;
  department: string;
  targetEmissions: number;
  currentEmissions: number;
  startDate: string;
  endDate: string;
  status: "on-track" | "at-risk" | "behind";
  title?: string;
  target?: number;
  current?: number;
  unit?: string;
  deadline?: string;
}

// ─── Social ──────────────────────────────────────────────────
export interface CsrActivity {
  id: string;
  title: string;
  categoryId: string;
  category: string;
  description: string;
  startDate: string;
  endDate: string;
  status: "planned" | "ongoing" | "completed";
  defaultPoints: number;
  departmentId: string;
  department: string;
  participantCount: number;
}

export interface EmployeeParticipation {
  id: string;
  employeeId: string;
  employeeName: string;
  activityId: string;
  activityTitle: string;
  department: string;
  proofFileName: string | null;
  pointsEarned: number;
  status: "pending" | "approved" | "rejected";
  comments: string;
  submittedAt: string;
}

export interface DiversityMetric {
  id: string;
  category: string;
  value: number;
  total: number;
  period: string;
}

export interface DiversitySummary {
  genderDistribution: { label: string; value: number; percentage: number }[];
  ageGroups: { label: string; value: number; percentage: number }[];
  trainingCompletion: { total: number; completed: number; percentage: number };
}

// ─── Governance ──────────────────────────────────────────────
export interface Policy {
  id: string;
  title: string;
  category: string;
  version: string;
  description: string;
  effectiveDate: string;
  status: "active" | "draft" | "archived";
  acknowledgedCount: number;
  totalEmployees: number;
}

export interface PolicyAcknowledgement {
  id: string;
  policyId: string;
  policyTitle: string;
  employeeId: string;
  employeeName: string;
  department: string;
  acknowledgedAt: string | null;
  status: "pending" | "acknowledged";
}

export interface Audit {
  id: string;
  title: string;
  departmentId: string;
  department: string;
  description: string;
  auditor: string;
  auditorId: string;
  auditDate: string;
  findings: number;
  status: "scheduled" | "in-progress" | "completed";
  linkedIssueCount: number;
}

export interface ComplianceIssue {
  id: string;
  auditId: string;
  auditTitle: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "in-progress" | "resolved";
  ownerId: string;
  owner: string;
  dueDate: string;
  reportedDate: string;
  assignee: string;
  dueDate?: string;
  overdue?: boolean;
  isOverdue: boolean;
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
export interface DepartmentScore {
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

// ─── Dashboard Specifics ──────────────────────────────────────
export interface DepartmentScore {
  department: string;
  environmental: number;
  social: number;
  governance: number;
  overall: number;
}

export interface DashboardMetric {
  environmentalScore: number;
  socialScore: number;
  governanceScore: number;
  overallScore: number;
}

export interface EmissionsPoint {
  date: string;
  emissions: number;
}

export interface RecentActivityItem {
  id: string;
  type: "csr" | "challenge" | "compliance" | "carbon" | "goal";
  title: string;
  description: string;
  timestamp: string;
  status?: string;
  user?: string;
}

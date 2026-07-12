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

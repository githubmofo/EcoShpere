export interface Department {
  id: string;
  name: string;
  code: string;
  head_user_id: string;
  parent_department_id: string | null;
  employee_count: number;
  status: 'Active' | 'Inactive';
}

export interface Category {
  id: string;
  name: string;
  type: 'CSR_ACTIVITY' | 'CHALLENGE';
  status: 'Active' | 'Inactive';
}

export interface EsgConfig {
  envWeight: number;
  socialWeight: number;
  governanceWeight: number;
  autoEmissionCalculation: boolean;
  evidenceRequirement: boolean;
  badgeAutoAward: boolean;
}

export interface NotificationSettings {
  emailEnabled: boolean;
  inAppEnabled: boolean;
  notifyComplianceIssueRaised: boolean;
  notifyComplianceIssueOverdue: boolean;
  notifyApprovalDecisions: boolean;
  notifyPolicyReminders: boolean;
  notifyBadgeUnlocks: boolean;
}

export interface DepartmentScore {
  departmentId: string;
  environmentalScore: number;
  socialScore: number;
  governanceScore: number;
  totalScore: number;
}

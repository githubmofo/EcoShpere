import { Department, Category, EsgConfig, NotificationSettings } from '@/lib/types';

export const mockDepartments: Department[] = [
  {
    id: '1',
    name: 'Global Operations',
    code: 'GLB-OPS',
    head_user_id: 'user_001',
    parent_department_id: null,
    employee_count: 500,
    status: 'Active',
  },
  {
    id: '2',
    name: 'North America',
    code: 'NA-01',
    head_user_id: 'user_002',
    parent_department_id: '1',
    employee_count: 200,
    status: 'Active',
  }
];

export const mockCategories: Category[] = [
  { id: 'c1', name: 'Beach Cleanup', type: 'CSR_ACTIVITY', status: 'Active' },
  { id: 'c2', name: 'Zero Waste Week', type: 'CHALLENGE', status: 'Active' }
];

export let mockEsgConfig: EsgConfig = {
  envWeight: 40,
  socialWeight: 30,
  governanceWeight: 30,
  autoEmissionCalculation: true,
  evidenceRequirement: false,
  badgeAutoAward: true
};

export function updateMockEsgConfig(updates: Partial<EsgConfig>) {
  mockEsgConfig = { ...mockEsgConfig, ...updates };
}

export let mockNotificationSettings: NotificationSettings = {
  emailEnabled: true,
  inAppEnabled: true,
  notifyComplianceIssueRaised: true,
  notifyComplianceIssueOverdue: true,
  notifyApprovalDecisions: true,
  notifyPolicyReminders: false,
  notifyBadgeUnlocks: true
};

export function updateMockNotificationSettings(updates: Partial<NotificationSettings>) {
  mockNotificationSettings = { ...mockNotificationSettings, ...updates };
}

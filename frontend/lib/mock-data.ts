// lib/mock-data.ts
import {
  CsrActivity,
  EmployeeParticipation,
  DiversitySummary,
  Policy,
  PolicyAcknowledgement,
  Audit,
  ComplianceIssue,
  CurrentUser,
  Challenge,
  Badge,
  Reward,
  RewardRedemption,
  ChallengeParticipation,
  LeaderboardEntry,
  DepartmentScore,
  MonthlyEmission,
  ReportRow
} from "./types";

export const DEPARTMENTS = [
  "Manufacturing",
  "Corporate",
  "Logistics",
  "R&D",
  "Sales",
] as const;

export const EMPLOYEES = [
  "Aditi Rao",
  "Rahul Mehta",
  "Sara Khan",
  "John Lee",
  "Priya Nair",
  "Marco Rossi",
  "Chen Wei",
  "Emma Brown",
] as const;

export const mockCsrActivities: CsrActivity[] = [
  {
    id: "act_1",
    title: "Beach Cleanup Drive",
    categoryId: "cat_env",
    category: "Environment",
    description: "Join us for a morning of cleaning up the local beach to protect marine life.",
    startDate: "2026-08-15",
    endDate: "2026-08-15",
    status: "planned",
    defaultPoints: 50,
    departmentId: "all",
    department: "All Departments",
    participantCount: 12
  },
  {
    id: "act_2",
    title: "Mentorship for Youth in Tech",
    categoryId: "cat_soc",
    category: "Education",
    description: "Provide mentorship to high school students interested in technology careers.",
    startDate: "2026-07-01",
    endDate: "2026-12-31",
    status: "ongoing",
    defaultPoints: 100,
    departmentId: "dep_eng",
    department: "Engineering",
    participantCount: 5
  },
  {
    id: "act_3",
    title: "Food Drive Collection",
    categoryId: "cat_soc_2",
    category: "Community",
    description: "Collecting non-perishable food items for the local food bank.",
    startDate: "2026-06-01",
    endDate: "2026-06-15",
    status: "completed",
    defaultPoints: 20,
    departmentId: "all",
    department: "All Departments",
    participantCount: 45
  }
];

export const mockParticipation: EmployeeParticipation[] = [
  {
    id: "part_1",
    employeeId: "emp_101",
    employeeName: "Alice Smith",
    activityId: "act_2",
    activityTitle: "Mentorship for Youth in Tech",
    department: "Engineering",
    proofFileName: "mentorship_log.pdf",
    pointsEarned: 0,
    status: "pending",
    comments: "",
    submittedAt: "2026-07-10T14:30:00Z"
  },
  {
    id: "part_2",
    employeeId: "emp_102",
    employeeName: "Bob Johnson",
    activityId: "act_3",
    activityTitle: "Food Drive Collection",
    department: "Sales",
    proofFileName: "receipt_foodbank.jpg",
    pointsEarned: 20,
    status: "approved",
    comments: "Great job, Bob!",
    submittedAt: "2026-06-14T09:15:00Z"
  }
];

export const mockDiversitySummary: DiversitySummary = {
  genderDistribution: [
    { label: "Female", value: 45, percentage: 45 },
    { label: "Male", value: 50, percentage: 50 },
    { label: "Non-binary", value: 5, percentage: 5 }
  ],
  ageGroups: [
    { label: "18-25", value: 20, percentage: 20 },
    { label: "26-35", value: 40, percentage: 40 },
    { label: "36-45", value: 25, percentage: 25 },
    { label: "46+", value: 15, percentage: 15 }
  ],
  trainingCompletion: {
    total: 150,
    completed: 120,
    percentage: 80
  }
};

export const mockPolicies: Policy[] = [
  {
    id: "pol_1",
    title: "Anti-Bribery and Corruption Policy",
    category: "Ethics",
    version: "2.1",
    description: "Guidelines and rules preventing bribery and corruption in all business dealings.",
    effectiveDate: "2025-01-01",
    status: "active",
    acknowledgedCount: 140,
    totalEmployees: 150
  },
  {
    id: "pol_2",
    title: "Data Privacy Policy (GDPR)",
    category: "Compliance",
    version: "3.0",
    description: "Ensuring all employee and customer data is handled according to GDPR standards.",
    effectiveDate: "2026-05-25",
    status: "active",
    acknowledgedCount: 110,
    totalEmployees: 150
  }
];

export const mockAcknowledgements: PolicyAcknowledgement[] = [
  {
    id: "ack_1",
    policyId: "pol_1",
    policyTitle: "Anti-Bribery and Corruption Policy",
    employeeId: "emp_101",
    employeeName: "Alice Smith",
    department: "Engineering",
    acknowledgedAt: "2026-01-05T10:00:00Z",
    status: "acknowledged"
  },
  {
    id: "ack_2",
    policyId: "pol_2",
    policyTitle: "Data Privacy Policy (GDPR)",
    employeeId: "emp_102",
    employeeName: "Bob Johnson",
    department: "Sales",
    acknowledgedAt: null,
    status: "pending"
  }
];

export const mockAudits: Audit[] = [
  {
    id: "aud_1",
    title: "Q2 Information Security Audit",
    departmentId: "dep_it",
    department: "IT",
    description: "Quarterly review of information security controls.",
    auditor: "External Auditor Inc.",
    auditorId: "ext_1",
    auditDate: "2026-06-30",
    findings: 3,
    status: "completed",
    linkedIssueCount: 3
  },
  {
    id: "aud_2",
    title: "Annual HR Compliance Review",
    departmentId: "dep_hr",
    department: "HR",
    description: "Yearly review of HR policies and diversity targets.",
    auditor: "Jane Doe (Internal)",
    auditorId: "emp_50",
    auditDate: "2026-11-15",
    findings: 0,
    status: "scheduled",
    linkedIssueCount: 0
  }
];

export const mockComplianceIssues: ComplianceIssue[] = [
  {
    id: "iss_1",
    auditId: "aud_1",
    auditTitle: "Q2 Information Security Audit",
    title: "Missing MFA on legacy systems",
    description: "Several legacy internal applications do not enforce Multi-Factor Authentication.",
    severity: "high",
    status: "open",
    ownerId: "emp_20",
    owner: "Charlie Dev",
    dueDate: "2026-07-15",
    reportedDate: "2026-07-01",
    isOverdue: false // dynamic in real app
  },
  {
    id: "iss_2",
    auditId: "aud_1",
    auditTitle: "Q2 Information Security Audit",
    title: "Outdated server OS",
    description: "One of the staging servers is running an EOL operating system.",
    severity: "medium",
    status: "resolved",
    ownerId: "emp_21",
    owner: "Dave Ops",
    dueDate: "2026-07-10",
    reportedDate: "2026-07-01",
    isOverdue: false
  },
  {
    id: "iss_3",
    auditId: "aud_1",
    auditTitle: "Q2 Information Security Audit",
    title: "Unencrypted backups",
    description: "Database backups to offsite storage are not encrypted at rest.",
    severity: "critical",
    status: "open",
    ownerId: "emp_21",
    owner: "Dave Ops",
    dueDate: "2026-07-05", // Overdue relative to July 12
    reportedDate: "2026-07-01",
    isOverdue: true // computed as true since 2026-07-05 is passed
  }
];

export const currentUser: CurrentUser = {
  id: "u-aditi",
  name: "Aditi Rao",
  role: "Admin",
  department: "Corporate",
  xp: 4850, // just below the 5,000 XP "Sustainability Champion" badge
  points: 1250,
  badges: 3,
};

export const challenges: Challenge[] = [
  {
    id: "c-1",
    title: "Sustainability Sprint",
    description: "Two-week push to cut office energy use by 15% across teams.",
    category: "Energy",
    icon: "🌍",
    xp: 200,
    difficulty: "Hard",
    deadline: "2026-07-20",
    status: "active",
    evidenceRequired: true,
    participantCount: 42,
  },
  {
    id: "c-2",
    title: "Recycle Challenge",
    description: "Log your recycling for a week and hit the department target.",
    category: "Waste",
    icon: "♻️",
    xp: 80,
    difficulty: "Easy",
    deadline: "2026-07-15",
    status: "active",
    evidenceRequired: false,
    participantCount: 96,
  },
  {
    id: "c-3",
    title: "Commute Green Week",
    description: "Bike, walk, carpool or take transit for your daily commute.",
    category: "Transport",
    icon: "🚲",
    xp: 120,
    difficulty: "Medium",
    deadline: "2026-07-25",
    status: "draft",
    evidenceRequired: true,
    participantCount: 0,
  },
  {
    id: "c-4",
    title: "Paperless Pledge",
    description: "Go fully digital — no printing for the whole month.",
    category: "Waste",
    icon: "📄",
    xp: 90,
    difficulty: "Easy",
    deadline: "2026-07-10",
    status: "under-review",
    evidenceRequired: true,
    participantCount: 58,
  },
  {
    id: "c-5",
    title: "Solar Ambassador",
    description: "Champion the rooftop solar rollout at your facility.",
    category: "Energy",
    icon: "☀️",
    xp: 250,
    difficulty: "Hard",
    deadline: "2026-06-30",
    status: "completed",
    evidenceRequired: true,
    participantCount: 24,
  },
  {
    id: "c-6",
    title: "Water Watch",
    description: "Report and fix water leaks in your area.",
    category: "Water",
    icon: "💧",
    xp: 110,
    difficulty: "Medium",
    deadline: "2026-05-31",
    status: "archived",
    evidenceRequired: false,
    participantCount: 33,
  },
  {
    id: "c-7",
    title: "Tree Planting Drive",
    description: "Join the quarterly community tree-planting event.",
    category: "Community",
    icon: "🌳",
    xp: 150,
    difficulty: "Medium",
    deadline: "2026-08-05",
    status: "active",
    evidenceRequired: true,
    participantCount: 61,
  },
  {
    id: "c-8",
    title: "Zero-Waste Lunch",
    description: "Bring a fully package-free lunch for two weeks.",
    category: "Waste",
    icon: "🥗",
    xp: 70,
    difficulty: "Easy",
    deadline: "2026-07-28",
    status: "draft",
    evidenceRequired: false,
    participantCount: 0,
  },
];

// ─── Badges ──────────────────────────────────────────────────
export const badges: Badge[] = [
  {
    id: "b-1",
    name: "Green Beginner",
    description: "Earned your first 100 XP on the platform.",
    icon: "🌱",
    criteria: "Reach 100 XP",
    unlockType: "xp",
    unlockThreshold: 100,
    earned: true,
    earnedBy: 214,
  },
  {
    id: "b-2",
    name: "Carbon Saver",
    description: "Accumulate 1,000 XP from sustainability actions.",
    icon: "🌿",
    criteria: "Reach 1,000 XP",
    unlockType: "xp",
    unlockThreshold: 1000,
    earned: true,
    earnedBy: 87,
  },
  {
    id: "b-3",
    name: "Sustainability Champion",
    description: "Reach 5,000 XP — a true ESG leader.",
    icon: "🏆",
    criteria: "Reach 5,000 XP",
    unlockType: "xp",
    unlockThreshold: 5000,
    earned: false,
    earnedBy: 12,
  },
  {
    id: "b-4",
    name: "Team Player",
    description: "Complete 5 challenges to earn this badge.",
    icon: "⭐",
    criteria: "Complete 5 challenges",
    unlockType: "challenges",
    unlockThreshold: 5,
    earned: true,
    earnedBy: 63,
  },
  {
    id: "b-5",
    name: "Streak Master",
    description: "Complete 10 challenges across the year.",
    icon: "🔥",
    criteria: "Complete 10 challenges",
    unlockType: "challenges",
    unlockThreshold: 10,
    earned: false,
    earnedBy: 21,
  },
  {
    id: "b-6",
    name: "Eco Legend",
    description: "Hit 10,000 XP — the highest honour.",
    icon: "👑",
    criteria: "Reach 10,000 XP",
    unlockType: "xp",
    unlockThreshold: 10000,
    earned: false,
    earnedBy: 3,
  },
];

// ─── Rewards ─────────────────────────────────────────────────
export const rewards: Reward[] = [
  {
    id: "r-1",
    name: "Reusable Water Bottle",
    description: "Branded insulated steel bottle.",
    icon: "🍶",
    pointsCost: 300,
    stock: 25,
    category: "Merch",
  },
  {
    id: "r-2",
    name: "Extra Day Off",
    description: "One additional paid day of leave.",
    icon: "🏖️",
    pointsCost: 2000,
    stock: 5,
    category: "Perk",
  },
  {
    id: "r-3",
    name: "Plant a Tree in Your Name",
    description: "We plant a tree and send you the certificate.",
    icon: "🌳",
    pointsCost: 500,
    stock: 100,
    category: "Impact",
  },
  {
    id: "r-4",
    name: "Coffee Voucher",
    description: "$15 voucher for the on-site café.",
    icon: "☕",
    pointsCost: 150,
    stock: 0,
    category: "Perk",
  },
  {
    id: "r-5",
    name: "Eco Tote Bag",
    description: "Organic cotton tote with the EcoSphere logo.",
    icon: "👜",
    pointsCost: 250,
    stock: 40,
    category: "Merch",
  },
  {
    id: "r-6",
    name: "Lunch with the CEO",
    description: "A sustainability roundtable lunch with leadership.",
    icon: "🍽️",
    pointsCost: 3000,
    stock: 2,
    category: "Experience",
  },
];

export const initialRedemptions: RewardRedemption[] = [
  {
    id: "rd-1",
    rewardId: "r-1",
    rewardName: "Reusable Water Bottle",
    pointsSpent: 300,
    redeemedAt: "2026-06-28",
  },
];

// ─── Challenge Participation ─────────────────────────────────
export const participations: ChallengeParticipation[] = [
  {
    id: "p-0",
    challengeId: "c-1",
    challengeTitle: "Sustainability Sprint",
    employee: "Aditi Rao",
    department: "Corporate",
    progress: 100,
    proof: "aditi-sprint.pdf",
    approvalStatus: "pending",
    xpAwarded: 0,
  },
  {
    id: "p-1",
    challengeId: "c-1",
    challengeTitle: "Sustainability Sprint",
    employee: "Rahul Mehta",
    department: "Manufacturing",
    progress: 100,
    proof: "sprint-report.pdf",
    approvalStatus: "pending",
    xpAwarded: 0,
  },
  {
    id: "p-2",
    challengeId: "c-2",
    challengeTitle: "Recycle Challenge",
    employee: "Sara Khan",
    department: "Corporate",
    progress: 100,
    proof: "recycle-log.jpg",
    approvalStatus: "pending",
    xpAwarded: 0,
  },
  {
    id: "p-3",
    challengeId: "c-4",
    challengeTitle: "Paperless Pledge",
    employee: "John Lee",
    department: "Logistics",
    progress: 80,
    proof: null,
    approvalStatus: "pending",
    xpAwarded: 0,
  },
  {
    id: "p-4",
    challengeId: "c-5",
    challengeTitle: "Solar Ambassador",
    employee: "Priya Nair",
    department: "R&D",
    progress: 100,
    proof: "solar-photos.zip",
    approvalStatus: "approved",
    xpAwarded: 250,
  },
  {
    id: "p-5",
    challengeId: "c-7",
    challengeTitle: "Tree Planting Drive",
    employee: "Marco Rossi",
    department: "Sales",
    progress: 60,
    proof: null,
    approvalStatus: "pending",
    xpAwarded: 0,
  },
  {
    id: "p-6",
    challengeId: "c-2",
    challengeTitle: "Recycle Challenge",
    employee: "Chen Wei",
    department: "Manufacturing",
    progress: 100,
    proof: "bins.jpg",
    approvalStatus: "rejected",
    xpAwarded: 0,
  },
];

// ─── Leaderboard (mix of departments and employees) ──────────
export const leaderboard: LeaderboardEntry[] = [
  { rank: 1, id: "l-1", name: "Manufacturing Dept", kind: "department", department: "Manufacturing", xp: 4820, badges: 0 },
  { rank: 2, id: "l-2", name: "Aditi Rao", kind: "employee", department: "Corporate", xp: 3910, badges: 3 },
  { rank: 3, id: "l-3", name: "Corporate Dept", kind: "department", department: "Corporate", xp: 3505, badges: 0 },
  { rank: 4, id: "l-4", name: "Priya Nair", kind: "employee", department: "R&D", xp: 3120, badges: 2 },
  { rank: 5, id: "l-5", name: "R&D Dept", kind: "department", department: "R&D", xp: 2980, badges: 0 },
  { rank: 6, id: "l-6", name: "Rahul Mehta", kind: "employee", department: "Manufacturing", xp: 2740, badges: 2 },
  { rank: 7, id: "l-7", name: "Sara Khan", kind: "employee", department: "Corporate", xp: 2190, badges: 1 },
  { rank: 8, id: "l-8", name: "Logistics Dept", kind: "department", department: "Logistics", xp: 1980, badges: 0 },
];

// ─── Reports: department scores & emissions ──────────────────
export const departmentScores: DepartmentScore[] = [
  { department: "Manufacturing", environmental: 62, social: 78, governance: 70, total: 69 },
  { department: "Corporate", environmental: 80, social: 85, governance: 88, total: 84 },
  { department: "Logistics", environmental: 55, social: 68, governance: 72, total: 64 },
  { department: "R&D", environmental: 88, social: 74, governance: 80, total: 81 },
  { department: "Sales", environmental: 72, social: 80, governance: 76, total: 76 },
];

export const monthlyEmissions: MonthlyEmission[] = [
  { month: "Jan", emissions: 612, target: 560 },
  { month: "Feb", emissions: 588, target: 555 },
  { month: "Mar", emissions: 601, target: 550 },
  { month: "Apr", emissions: 559, target: 545 },
  { month: "May", emissions: 534, target: 540 },
  { month: "Jun", emissions: 512, target: 535 },
  { month: "Jul", emissions: 498, target: 530 },
  { month: "Aug", emissions: 505, target: 525 },
];

export const emissionsByCategory = [
  { name: "Electricity", value: 1820 },
  { name: "Fleet", value: 1240 },
  { name: "Manufacturing", value: 980 },
  { name: "Purchased Goods", value: 760 },
  { name: "Business Travel", value: 410 },
];

export const emissionsByDepartment = departmentScores.map((d) => ({
  name: d.department,
  value: Math.round((100 - d.environmental) * 12),
}));

// ─── Reports: social ─────────────────────────────────────────
export const csrParticipation = [
  { name: "Manufacturing", value: 142 },
  { name: "Corporate", value: 210 },
  { name: "Logistics", value: 96 },
  { name: "R&D", value: 118 },
  { name: "Sales", value: 165 },
];

export const diversityBreakdown = [
  { name: "Women", value: 44 },
  { name: "Men", value: 54 },
  { name: "Non-binary", value: 2 },
];

export const trainingCompletion = [
  { name: "Manufacturing", value: 78 },
  { name: "Corporate", value: 94 },
  { name: "Logistics", value: 71 },
  { name: "R&D", value: 88 },
  { name: "Sales", value: 83 },
];

// ─── Reports: governance ─────────────────────────────────────
export const governanceStats = {
  policyAckRate: 87, // %
  auditsCompleted: 9,
  auditsTotal: 12,
  openIssues: 7,
  overdueIssues: 2,
};

export const complianceBySeverity = [
  { name: "Low", value: 4 },
  { name: "Medium", value: 6 },
  { name: "High", value: 3 },
  { name: "Critical", value: 1 },
];

// ─── Reports: flat rows for tables + custom builder ──────────
export const reportRows: ReportRow[] = [
  { date: "2026-07-08", department: "Manufacturing", module: "Environmental", metric: "Carbon Emissions", value: "498 tCO2e", employee: "—" },
  { date: "2026-07-06", department: "Corporate", module: "Environmental", metric: "Electricity Use", value: "12,400 kWh", employee: "—" },
  { date: "2026-07-05", department: "Logistics", module: "Environmental", metric: "Fleet Fuel", value: "3,200 L", employee: "—" },
  { date: "2026-07-07", department: "Corporate", module: "Social", metric: "CSR Participation", value: "210 employees", employee: "Sara Khan" },
  { date: "2026-07-04", department: "Sales", module: "Social", metric: "Training Completion", value: "83%", employee: "Marco Rossi" },
  { date: "2026-07-03", department: "R&D", module: "Social", metric: "Diversity Ratio", value: "46% women", employee: "Priya Nair" },
  { date: "2026-07-08", department: "Corporate", module: "Governance", metric: "Policy Acknowledgement", value: "87%", employee: "Aditi Rao" },
  { date: "2026-07-02", department: "Logistics", module: "Governance", metric: "Open Compliance Issues", value: "7", employee: "John Lee" },
  { date: "2026-06-30", department: "Manufacturing", module: "Governance", metric: "Audit Findings", value: "3", employee: "—" },
  { date: "2026-07-08", department: "Manufacturing", module: "Gamification", metric: "Challenge XP", value: "4,820 XP", employee: "Rahul Mehta" },
  { date: "2026-07-07", department: "Corporate", module: "Gamification", metric: "Challenge XP", value: "3,910 XP", employee: "Aditi Rao" },
  { date: "2026-07-05", department: "R&D", module: "Gamification", metric: "Badges Earned", value: "2 badges", employee: "Priya Nair" },
  { date: "2026-06-28", department: "Sales", module: "Social", metric: "CSR Participation", value: "165 employees", employee: "Marco Rossi" },
  { date: "2026-06-25", department: "R&D", module: "Environmental", metric: "Carbon Emissions", value: "144 tCO2e", employee: "—" },
];

export const overallEsg = Math.round(
  departmentScores.reduce((s, d) => s + d.total, 0) / departmentScores.length
);

export const esgPillars = {
  environmental: Math.round(
    departmentScores.reduce((s, d) => s + d.environmental, 0) / departmentScores.length
  ),
  social: Math.round(
    departmentScores.reduce((s, d) => s + d.social, 0) / departmentScores.length
  ),
  governance: Math.round(
    departmentScores.reduce((s, d) => s + d.governance, 0) / departmentScores.length
  ),
};

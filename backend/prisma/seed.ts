import { prisma } from '../src/common/prisma-client';
import { PrismaClient } from '@prisma/client';

// Local constants — the schema uses plain String fields, not Prisma enums
const Role = { ADMIN: 'ADMIN', DEPT_HEAD: 'DEPT_HEAD', EMPLOYEE: 'EMPLOYEE' } as const;
const CategoryType = { CHALLENGE: 'CHALLENGE', CSR_ACTIVITY: 'CSR_ACTIVITY' } as const;
const Status = { DRAFT: 'DRAFT', ACTIVE: 'ACTIVE', INACTIVE: 'INACTIVE', ARCHIVED: 'ARCHIVED' } as const;
const CsrStatus = { PLANNED: 'PLANNED', ONGOING: 'ONGOING', COMPLETED: 'COMPLETED' } as const;
const ApprovalStatus = { PENDING: 'PENDING', APPROVED: 'APPROVED', REJECTED: 'REJECTED' } as const;
const AuditStatus = { SCHEDULED: 'SCHEDULED', IN_PROGRESS: 'IN_PROGRESS', COMPLETED: 'COMPLETED' } as const;
const Severity = { LOW: 'LOW', MEDIUM: 'MEDIUM', HIGH: 'HIGH', CRITICAL: 'CRITICAL' } as const;
const IssueStatus = { OPEN: 'OPEN', IN_PROGRESS: 'IN_PROGRESS', RESOLVED: 'RESOLVED' } as const;

const daysFromNow = (n: number) => new Date(Date.now() + n * 86400000);

async function main() {
  console.log('Seeding database...');

  // Clean slate (children first, respecting FKs)
  await prisma.notification.deleteMany();
  await prisma.badgeAssignment.deleteMany();
  await prisma.rewardRedemption.deleteMany();
  await prisma.employeeXpBalance.deleteMany();
  await prisma.challengeParticipation.deleteMany();
  await prisma.employeeParticipation.deleteMany();
  await prisma.policyAcknowledgement.deleteMany();
  await prisma.complianceIssue.deleteMany();
  await prisma.audit.deleteMany();
  await prisma.departmentScore.deleteMany();
  await prisma.carbonTransaction.deleteMany();
  await prisma.environmentalGoal.deleteMany();
  await prisma.challenge.deleteMany();
  await prisma.csrActivity.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.reward.deleteMany();
  await prisma.emissionFactor.deleteMany();
  await prisma.esgPolicy.deleteMany();
  await prisma.category.deleteMany();
  await prisma.department.updateMany({ data: { headUserId: null, parentDepartmentId: null } });
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();
  await prisma.esgConfiguration.deleteMany();
  await prisma.notificationSettings.deleteMany();

  // ── Departments ──────────────────────────────────────────────
  const corp = await prisma.department.create({ data: { name: 'Corporate', code: 'CORP', employeeCount: 150 } });
  const mfg = await prisma.department.create({ data: { name: 'Manufacturing', code: 'MFG', employeeCount: 300 } });
  const logistics = await prisma.department.create({ data: { name: 'Logistics', code: 'LOG', employeeCount: 200 } });
  const rnd = await prisma.department.create({ data: { name: 'R&D', code: 'RND', employeeCount: 120 } });
  const sales = await prisma.department.create({ data: { name: 'Sales', code: 'SAL', employeeCount: 180 } });

  // ── Users (+ XP balances) ────────────────────────────────────
  const mkUser = async (
    name: string,
    email: string,
    role: Role,
    departmentId: string,
    xp: number,
    points: number
  ) => {
    const u = await prisma.user.create({
      data: { name, email, passwordHash: 'hashed_password_placeholder', role, departmentId },
    });
    await prisma.employeeXpBalance.create({
      data: { employeeId: u.id, xpTotal: xp, pointsTotal: points },
    });
    return u;
  };

  const aditi = await mkUser('Aditi Rao', 'aditi.rao@ecosphere.com', Role.ADMIN, corp.id, 4850, 1250);
  const rahul = await mkUser('Rahul Mehta', 'rahul.mehta@ecosphere.com', Role.DEPT_HEAD, mfg.id, 2740, 640);
  const sara = await mkUser('Sara Khan', 'sara.khan@ecosphere.com', Role.EMPLOYEE, corp.id, 2190, 410);
  const john = await mkUser('John Lee', 'john.lee@ecosphere.com', Role.EMPLOYEE, logistics.id, 1580, 300);
  const priya = await mkUser('Priya Nair', 'priya.nair@ecosphere.com', Role.EMPLOYEE, rnd.id, 3120, 720);
  const marco = await mkUser('Marco Rossi', 'marco.rossi@ecosphere.com', Role.EMPLOYEE, sales.id, 1320, 260);
  const chen = await mkUser('Chen Wei', 'chen.wei@ecosphere.com', Role.EMPLOYEE, mfg.id, 980, 180);

  await prisma.department.update({ where: { id: mfg.id }, data: { headUserId: rahul.id } });
  // 2. Users
  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@ecosphere.com',
      passwordHash: 'hashed_password_placeholder',
      role: 'ADMIN',
      departmentId: corp.id,
    },
  });

  const headMfg = await prisma.user.create({
    data: {
      name: 'Sarah Manager',
      email: 'sarah.manager@ecosphere.com',
      passwordHash: 'hashed_password_placeholder',
      role: 'DEPT_HEAD',
      departmentId: mfg.id,
    },
  });

  // ── Categories ───────────────────────────────────────────────
  const catEnergy = await prisma.category.create({ data: { name: 'Energy', type: CategoryType.CHALLENGE } });
  const catWaste = await prisma.category.create({ data: { name: 'Waste', type: CategoryType.CHALLENGE } });
  const catTransport = await prisma.category.create({ data: { name: 'Transport', type: CategoryType.CHALLENGE } });
  const catWater = await prisma.category.create({ data: { name: 'Water', type: CategoryType.CHALLENGE } });
  const catCommunity = await prisma.category.create({ data: { name: 'Community', type: CategoryType.CSR_ACTIVITY } });

  // ── Emission factors ─────────────────────────────────────────
  const emp1 = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john.doe@ecosphere.com',
      passwordHash: 'hashed_password_placeholder',
      role: 'EMPLOYEE',
      departmentId: mfg.id,
    },
  });

  const emp2 = await prisma.user.create({
    data: {
      name: 'Jane Smith',
      email: 'jane.smith@ecosphere.com',
      passwordHash: 'hashed_password_placeholder',
      role: 'EMPLOYEE',
      departmentId: logistics.id,
    },
  });

  // 3. Categories
  const csrCat = await prisma.category.create({
    data: {
      name: 'Community Outreach',
      type: 'CSR_ACTIVITY',
    },
  });

  const challengeCat = await prisma.category.create({
    data: {
      name: 'Energy Savings',
      type: 'CHALLENGE',
    },
  });

  // 4. Emission Factors
  await prisma.emissionFactor.createMany({
    data: [
      { name: 'Grid Electricity', factorValue: 0.5, unit: 'kgCO2e/kWh' },
      { name: 'Diesel Fuel', factorValue: 2.68, unit: 'kgCO2e/liter' },
      { name: 'Natural Gas', factorValue: 2.0, unit: 'kgCO2e/m3' },
    ],
  });

  // ── ESG policy + acknowledgements ────────────────────────────
  const policy = await prisma.esgPolicy.create({
    data: {
      title: 'Zero Waste to Landfill 2030',
      description: 'Corporate commitment to eliminate landfill waste by 2030.',
      effectiveDate: new Date('2025-01-01'),
    },
  });
  await prisma.policyAcknowledgement.createMany({
    data: [
      { policyId: policy.id, employeeId: aditi.id },
      { policyId: policy.id, employeeId: sara.id },
      { policyId: policy.id, employeeId: priya.id },
    ],
  });

  // ── Badges ───────────────────────────────────────────────────
  const badgeData = [
    { name: 'Green Beginner', description: 'Earned your first 100 XP.', unlockRuleType: 'XP_THRESHOLD', unlockThreshold: 100, iconUrl: '🌱' },
    { name: 'Carbon Saver', description: 'Accumulate 1,000 XP.', unlockRuleType: 'XP_THRESHOLD', unlockThreshold: 1000, iconUrl: '🌿' },
    { name: 'Sustainability Champion', description: 'Reach 5,000 XP.', unlockRuleType: 'XP_THRESHOLD', unlockThreshold: 5000, iconUrl: '🏆' },
    { name: 'Team Player', description: 'Complete 5 challenges.', unlockRuleType: 'CHALLENGE_COUNT', unlockThreshold: 5, iconUrl: '⭐' },
    { name: 'Streak Master', description: 'Complete 10 challenges.', unlockRuleType: 'CHALLENGE_COUNT', unlockThreshold: 10, iconUrl: '🔥' },
    { name: 'Eco Legend', description: 'Reach 10,000 XP.', unlockRuleType: 'XP_THRESHOLD', unlockThreshold: 10000, iconUrl: '👑' },
  ];
  const badges: Record<string, string> = {};
  for (const b of badgeData) {
    const created = await prisma.badge.create({ data: b });
    badges[b.name] = created.id;
  }
  // Aditi has earned the first three; Priya two
  await prisma.badgeAssignment.createMany({
    data: [
      { badgeId: badges['Green Beginner'], employeeId: aditi.id, source: 'AUTO' },
      { badgeId: badges['Carbon Saver'], employeeId: aditi.id, source: 'AUTO' },
      { badgeId: badges['Team Player'], employeeId: aditi.id, source: 'AUTO' },
      { badgeId: badges['Green Beginner'], employeeId: priya.id, source: 'AUTO' },
      { badgeId: badges['Carbon Saver'], employeeId: priya.id, source: 'AUTO' },
    ],
  });

  // ── Rewards ──────────────────────────────────────────────────
  const rewardData = [
    { name: 'Reusable Water Bottle', description: 'Branded insulated steel bottle.', pointsRequired: 300, stock: 25 },
    { name: 'Extra Day Off', description: 'One additional paid day of leave.', pointsRequired: 2000, stock: 5 },
    { name: 'Plant a Tree in Your Name', description: 'We plant a tree and send you the certificate.', pointsRequired: 500, stock: 100 },
    { name: 'Coffee Voucher', description: '$15 voucher for the on-site café.', pointsRequired: 150, stock: 0 },
    { name: 'Eco Tote Bag', description: 'Organic cotton tote with the EcoSphere logo.', pointsRequired: 250, stock: 40 },
    { name: 'Lunch with the CEO', description: 'A sustainability roundtable lunch with leadership.', pointsRequired: 3000, stock: 2 },
  ];
  const rewards: Record<string, string> = {};
  for (const r of rewardData) {
    const created = await prisma.reward.create({ data: r });
    rewards[r.name] = created.id;
  }
  await prisma.rewardRedemption.create({
    data: { rewardId: rewards['Reusable Water Bottle'], employeeId: aditi.id, pointsSpent: 300 },
  });

  // ── Challenges ───────────────────────────────────────────────
  const challengeData = [
    { title: 'Sustainability Sprint', categoryId: catEnergy.id, description: 'Two-week push to cut office energy use by 15% across teams.', xpAward: 200, difficulty: 'Hard', deadline: daysFromNow(8), status: Status.ACTIVE, evidenceRequired: true },
    { title: 'Recycle Challenge', categoryId: catWaste.id, description: 'Log your recycling for a week and hit the department target.', xpAward: 80, difficulty: 'Easy', deadline: daysFromNow(3), status: Status.ACTIVE, evidenceRequired: false },
    { title: 'Commute Green Week', categoryId: catTransport.id, description: 'Bike, walk, carpool or take transit for your daily commute.', xpAward: 120, difficulty: 'Medium', deadline: daysFromNow(13), status: Status.DRAFT, evidenceRequired: true },
    { title: 'Paperless Pledge', categoryId: catWaste.id, description: 'Go fully digital — no printing for the whole month.', xpAward: 90, difficulty: 'Easy', deadline: daysFromNow(-2), status: Status.ACTIVE, evidenceRequired: true },
    { title: 'Solar Ambassador', categoryId: catEnergy.id, description: 'Champion the rooftop solar rollout at your facility.', xpAward: 250, difficulty: 'Hard', deadline: daysFromNow(-12), status: Status.INACTIVE, evidenceRequired: true },
    { title: 'Water Watch', categoryId: catWater.id, description: 'Report and fix water leaks in your area.', xpAward: 110, difficulty: 'Medium', deadline: daysFromNow(-40), status: Status.ARCHIVED, evidenceRequired: false },
    { title: 'Tree Planting Drive', categoryId: catCommunity.id, description: 'Join the quarterly community tree-planting event.', xpAward: 150, difficulty: 'Medium', deadline: daysFromNow(24), status: Status.ACTIVE, evidenceRequired: true },
    { title: 'Zero-Waste Lunch', categoryId: catWaste.id, description: 'Bring a fully package-free lunch for two weeks.', xpAward: 70, difficulty: 'Easy', deadline: daysFromNow(16), status: Status.DRAFT, evidenceRequired: false },
  ];
  const challenges: Record<string, string> = {};
  for (const c of challengeData) {
    const created = await prisma.challenge.create({ data: c });
    challenges[c.title] = created.id;
  }

  // ── Challenge participations ─────────────────────────────────
  await prisma.challengeParticipation.createMany({
    data: [
      { challengeId: challenges['Sustainability Sprint'], employeeId: aditi.id, progressPercent: 100, proofPath: 'aditi-sprint.pdf', approvalStatus: ApprovalStatus.PENDING, xpAwarded: 0 },
      { challengeId: challenges['Sustainability Sprint'], employeeId: rahul.id, progressPercent: 100, proofPath: 'sprint-report.pdf', approvalStatus: ApprovalStatus.PENDING, xpAwarded: 0 },
      { challengeId: challenges['Recycle Challenge'], employeeId: sara.id, progressPercent: 100, proofPath: 'recycle-log.jpg', approvalStatus: ApprovalStatus.PENDING, xpAwarded: 0 },
      { challengeId: challenges['Paperless Pledge'], employeeId: john.id, progressPercent: 80, approvalStatus: ApprovalStatus.PENDING, xpAwarded: 0 },
      { challengeId: challenges['Solar Ambassador'], employeeId: priya.id, progressPercent: 100, proofPath: 'solar-photos.zip', approvalStatus: ApprovalStatus.APPROVED, xpAwarded: 250 },
      { challengeId: challenges['Tree Planting Drive'], employeeId: marco.id, progressPercent: 60, approvalStatus: ApprovalStatus.PENDING, xpAwarded: 0 },
      { challengeId: challenges['Recycle Challenge'], employeeId: chen.id, progressPercent: 100, proofPath: 'bins.jpg', approvalStatus: ApprovalStatus.REJECTED, xpAwarded: 0 },
    ],
  });

  // ── CSR activity + participation ─────────────────────────────
  const csr = await prisma.csrActivity.create({
    data: {
      title: 'Local Park Cleanup',
      categoryId: catCommunity.id,
      description: 'Join us to clean up the local park this weekend.',
      startDate: new Date(),
      endDate: daysFromNow(1),
      status: CsrStatus.ONGOING,
    },
  });
  await prisma.employeeParticipation.createMany({
    data: [
      { employeeId: rahul.id, csrActivityId: csr.id, approvalStatus: ApprovalStatus.APPROVED, pointsEarned: 50, completionDate: new Date() },
      { employeeId: sara.id, csrActivityId: csr.id, approvalStatus: ApprovalStatus.PENDING, pointsEarned: 0 },
    ],
  });

  // ── Carbon transactions (spread over months) ─────────────────
  const carbon: { departmentId: string; sourceType: string; quantity: number; emissionsValue: number; operationDate: Date }[] = [];
  const depts = [corp, mfg, logistics, rnd, sales];
  const sources = ['Electricity', 'Fleet', 'Manufacturing', 'Purchased Goods', 'Business Travel'];
  for (let m = 7; m >= 0; m--) {
    for (let i = 0; i < depts.length; i++) {
      carbon.push({
        departmentId: depts[i].id,
        sourceType: sources[i],
        quantity: 5000 + i * 800,
        emissionsValue: 300 + i * 120 + (7 - m) * 15,
        operationDate: daysFromNow(-m * 30 - 2),
      });
    }
  }
  await prisma.carbonTransaction.createMany({ data: carbon });

  // ── Audits + compliance issues ───────────────────────────────
  const audit = await prisma.audit.create({
    data: {
      departmentId: mfg.id,
      title: 'Q2 Environmental Audit',
      description: 'Quarterly environmental compliance audit of the Manufacturing site.',
      auditDate: daysFromNow(-20),
      auditorId: aditi.id,
      status: AuditStatus.COMPLETED,
    },
  });
  await prisma.complianceIssue.createMany({
    data: [
      { auditId: audit.id, severity: Severity.HIGH, description: 'Hazardous waste log incomplete.', ownerId: rahul.id, dueDate: daysFromNow(-5), status: IssueStatus.OPEN, flaggedOverdue: true },
      { auditId: audit.id, severity: Severity.MEDIUM, description: 'Fire extinguisher inspection overdue.', ownerId: john.id, dueDate: daysFromNow(-3), status: IssueStatus.OPEN, flaggedOverdue: true },
      { auditId: audit.id, severity: Severity.LOW, description: 'Recycling bins mislabeled.', ownerId: sara.id, dueDate: daysFromNow(10), status: IssueStatus.IN_PROGRESS, flaggedOverdue: false },
      { auditId: audit.id, severity: Severity.CRITICAL, description: 'Emissions monitoring sensor offline.', ownerId: priya.id, dueDate: daysFromNow(4), status: IssueStatus.OPEN, flaggedOverdue: false },
    ],
  });

  // ── Department scores ────────────────────────────────────────
  await prisma.departmentScore.createMany({
    data: [
      { departmentId: corp.id, environmentalScore: 80, socialScore: 85, governanceScore: 88, totalScore: 84 },
      { departmentId: mfg.id, environmentalScore: 62, socialScore: 78, governanceScore: 70, totalScore: 69 },
      { departmentId: logistics.id, environmentalScore: 55, socialScore: 68, governanceScore: 72, totalScore: 64 },
      { departmentId: rnd.id, environmentalScore: 88, socialScore: 74, governanceScore: 80, totalScore: 81 },
      { departmentId: sales.id, environmentalScore: 72, socialScore: 80, governanceScore: 76, totalScore: 76 },
    ],
  });

  // ── Configuration ────────────────────────────────────────────
  await prisma.esgConfiguration.create({
    data: { envWeight: 0.4, socialWeight: 0.3, governanceWeight: 0.3 },
  });
  await prisma.notificationSettings.create({ data: {} });

  console.log('Database seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

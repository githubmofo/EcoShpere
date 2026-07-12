import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Departments
  const corp = await prisma.department.create({
    data: {
      name: 'Corporate',
      code: 'CORP',
      employeeCount: 150,
    },
  });

  const mfg = await prisma.department.create({
    data: {
      name: 'Manufacturing',
      code: 'MFG',
      employeeCount: 300,
    },
  });

  const logistics = await prisma.department.create({
    data: {
      name: 'Logistics',
      code: 'LOG',
      employeeCount: 200,
    },
  });

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

  // Assign head to department
  await prisma.department.update({
    where: { id: mfg.id },
    data: { headUserId: headMfg.id },
  });

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

  // 5. ESG Policies
  const policy1 = await prisma.esgPolicy.create({
    data: {
      title: 'Zero Waste to Landfill 2030',
      description: 'Corporate commitment to eliminate landfill waste by 2030.',
      effectiveDate: new Date('2025-01-01'),
      status: 'ACTIVE',
    },
  });

  const policy2 = await prisma.esgPolicy.create({
    data: {
      title: 'Anti-Bribery and Corruption',
      description: 'Zero-tolerance policy towards any form of bribery or corruption in business dealings.',
      effectiveDate: new Date('2024-06-15'),
      status: 'ACTIVE',
    },
  });

  const policy3 = await prisma.esgPolicy.create({
    data: {
      title: 'Remote Work & Telecommuting',
      description: 'Guidelines and allowances for remote work to reduce commuting emissions.',
      effectiveDate: new Date('2023-09-01'),
      status: 'ACTIVE',
    },
  });

  const policy4 = await prisma.esgPolicy.create({
    data: {
      title: 'Supplier Code of Conduct',
      description: 'Mandatory environmental and social standards for all tier 1 and tier 2 suppliers.',
      effectiveDate: new Date('2025-11-01'),
      status: 'DRAFT',
    },
  });

  // 6. Badges & Rewards
  const badge1 = await prisma.badge.create({
    data: {
      name: 'Eco Warrior',
      description: 'Earn 1000 XP points in challenges.',
      unlockRuleType: 'XP_THRESHOLD',
      unlockThreshold: 1000,
      iconUrl: '/icons/eco-warrior.png',
    },
  });

  const reward1 = await prisma.reward.create({
    data: {
      name: 'Extra Vacation Day',
      description: 'Redeem 5000 points for an extra day off.',
      pointsRequired: 5000,
      stock: 10,
    },
  });

  // 7. Transactional Data: Carbon Transactions
  await prisma.carbonTransaction.createMany({
    data: [
      { departmentId: mfg.id, sourceType: 'Electricity', quantity: 10000, emissionsValue: 5000, operationDate: new Date() },
      { departmentId: logistics.id, sourceType: 'Diesel', quantity: 5000, emissionsValue: 13400, operationDate: new Date() },
    ],
  });

  // 8. Csr Activities & Participations
  const csr = await prisma.csrActivity.create({
    data: {
      title: 'Local Park Cleanup',
      categoryId: csrCat.id,
      description: 'Join us to clean up the local park this weekend. We will be picking up trash, painting benches, and planting some local flora.',
      startDate: new Date(),
      endDate: new Date(new Date().getTime() + 86400000), // +1 day
      status: 'ONGOING',
    },
  });

  const csr2 = await prisma.csrActivity.create({
    data: {
      title: 'Annual Tree Planting Drive',
      categoryId: csrCat.id,
      description: 'Help us reach our goal of planting 10,000 trees this year. Transportation to the site will be provided.',
      startDate: new Date(new Date().getTime() + 5 * 86400000),
      endDate: new Date(new Date().getTime() + 6 * 86400000),
      status: 'PLANNED',
    },
  });

  const csr3 = await prisma.csrActivity.create({
    data: {
      title: 'Food Bank Volunteering',
      categoryId: csrCat.id,
      description: 'Sort and pack donated food for distribution to local families in need.',
      startDate: new Date(new Date().getTime() - 10 * 86400000),
      endDate: new Date(new Date().getTime() - 9 * 86400000),
      status: 'COMPLETED',
    },
  });

  await prisma.employeeParticipation.create({
    data: {
      employeeId: emp1.id,
      csrActivityId: csr.id,
      approvalStatus: 'APPROVED',
      pointsEarned: 50,
      completionDate: new Date(),
    },
  });

  // 9. Challenges
  const challenge = await prisma.challenge.create({
    data: {
      title: 'Cycle to Work Week',
      categoryId: challengeCat.id,
      description: 'Cycle to work for a full week to reduce transport emissions.',
      xpAward: 200,
      difficulty: 'Medium',
      deadline: new Date(new Date().getTime() + 7 * 86400000), // +7 days
    },
  });

  await prisma.challengeParticipation.create({
    data: {
      employeeId: emp2.id,
      challengeId: challenge.id,
      progressPercent: 50,
      approvalStatus: 'PENDING',
    },
  });

  // 10. Department Scores
  await prisma.departmentScore.createMany({
    data: [
      { departmentId: corp.id, environmentalScore: 85, socialScore: 90, governanceScore: 88, totalScore: 87.6 },
      { departmentId: mfg.id, environmentalScore: 65, socialScore: 70, governanceScore: 80, totalScore: 71.6 },
      { departmentId: logistics.id, environmentalScore: 55, socialScore: 60, governanceScore: 75, totalScore: 63.3 },
    ],
  });

  // 10b. Audits
  await prisma.audit.create({
    data: {
      title: 'ISO 14001 Annual Recertification',
      description: 'Annual environmental management system audit conducted by external auditors.',
      departmentId: mfg.id,
      auditorId: adminUser.id,
      auditDate: new Date(),
      status: 'IN_PROGRESS',
    },
  });

  await prisma.audit.create({
    data: {
      title: 'Supplier Labor Rights Audit',
      description: 'Comprehensive review of working conditions and labor rights at tier 1 suppliers.',
      departmentId: logistics.id,
      auditorId: adminUser.id,
      auditDate: new Date(new Date().getTime() - 30 * 86400000),
      status: 'COMPLETED',
    },
  });

  // 11. Configuration Models
  await prisma.esgConfiguration.create({
    data: {
      envWeight: 0.4,
      socialWeight: 0.3,
      governanceWeight: 0.3,
    },
  });

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

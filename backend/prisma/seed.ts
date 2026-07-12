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

  const policy5 = await prisma.esgPolicy.create({
    data: {
      title: 'Diversity, Equity & Inclusion',
      description: 'Company-wide commitment to fostering an inclusive workplace and diverse hiring practices.',
      effectiveDate: new Date('2022-03-01'),
      status: 'ACTIVE',
    },
  });

  const policy6 = await prisma.esgPolicy.create({
    data: {
      title: 'Sustainable Procurement Policy',
      description: 'Prioritizing vendors and suppliers with proven sustainable practices and lower carbon footprints.',
      effectiveDate: new Date('2026-01-15'),
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

  const csr4 = await prisma.csrActivity.create({
    data: {
      title: 'River Cleanup Initiative',
      categoryId: csrCat.id,
      description: 'Join local environmental groups to clear plastic waste from the downtown riverfront.',
      startDate: new Date(new Date().getTime() + 14 * 86400000),
      endDate: new Date(new Date().getTime() + 15 * 86400000),
      status: 'PLANNED',
    },
  });

  const csr5 = await prisma.csrActivity.create({
    data: {
      title: 'Tech Mentorship Program',
      categoryId: csrCat.id,
      description: 'Mentor high school students in basic programming and web development skills over 4 weekends.',
      startDate: new Date(new Date().getTime() + 2 * 86400000),
      endDate: new Date(new Date().getTime() + 30 * 86400000),
      status: 'ONGOING',
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

  await prisma.employeeParticipation.create({
    data: {
      employeeId: emp2.id,
      csrActivityId: csr2.id,
      approvalStatus: 'PENDING',
      pointsEarned: 0,
      completionDate: new Date(),
    },
  });

  await prisma.employeeParticipation.create({
    data: {
      employeeId: adminUser.id,
      csrActivityId: csr3.id,
      approvalStatus: 'APPROVED',
      pointsEarned: 100,
      completionDate: new Date(new Date().getTime() - 9 * 86400000),
    },
  });

  await prisma.employeeParticipation.create({
    data: {
      employeeId: headMfg.id,
      csrActivityId: csr5.id,
      approvalStatus: 'APPROVED',
      pointsEarned: 200,
      completionDate: new Date(new Date().getTime() - 2 * 86400000),
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
  const audit1 = await prisma.audit.create({
    data: {
      title: 'ISO 14001 Annual Recertification',
      description: 'Annual environmental management system audit conducted by external auditors.',
      departmentId: mfg.id,
      auditorId: adminUser.id,
      auditDate: new Date(),
      status: 'IN_PROGRESS',
    },
  });

  const audit2 = await prisma.audit.create({
    data: {
      title: 'Supplier Labor Rights Audit',
      description: 'Comprehensive review of working conditions and labor rights at tier 1 suppliers.',
      departmentId: logistics.id,
      auditorId: adminUser.id,
      auditDate: new Date(new Date().getTime() - 30 * 86400000),
      status: 'COMPLETED',
    },
  });

  const audit3 = await prisma.audit.create({
    data: {
      title: 'Anti-Bribery Compliance Review',
      description: 'Internal audit of gift policies, vendor payments, and third-party due diligence across all departments.',
      departmentId: corp.id,
      auditorId: headMfg.id,
      auditDate: new Date(new Date().getTime() + 14 * 86400000),
      status: 'SCHEDULED',
    },
  });

  const audit4 = await prisma.audit.create({
    data: {
      title: 'Waste Management Process Audit',
      description: 'Evaluate factory-floor waste sorting, hazardous material handling, and landfill diversion metrics.',
      departmentId: mfg.id,
      auditorId: adminUser.id,
      auditDate: new Date(new Date().getTime() - 60 * 86400000),
      status: 'COMPLETED',
    },
  });

  const audit5 = await prisma.audit.create({
    data: {
      title: 'Data Privacy & GDPR Compliance Audit',
      description: 'Review of personal data handling, consent management, data retention policies, and breach notification procedures.',
      departmentId: corp.id,
      auditorId: adminUser.id,
      auditDate: new Date(new Date().getTime() - 15 * 86400000),
      status: 'COMPLETED',
    },
  });

  const audit6 = await prisma.audit.create({
    data: {
      title: 'Fleet Emissions Verification',
      description: 'Third-party verification of reported Scope 1 emissions from the logistics fleet against fuel purchase records.',
      departmentId: logistics.id,
      auditorId: headMfg.id,
      auditDate: new Date(new Date().getTime() + 7 * 86400000),
      status: 'SCHEDULED',
    },
  });

  // 10c. Compliance Issues
  await prisma.complianceIssue.create({
    data: {
      auditId: audit2.id,
      severity: 'HIGH',
      description: 'Two tier-1 suppliers failed to provide evidence of minimum wage compliance for contract workers.',
      ownerId: headMfg.id,
      dueDate: new Date(new Date().getTime() + 30 * 86400000),
      status: 'OPEN',
      flaggedOverdue: false,
    },
  });

  await prisma.complianceIssue.create({
    data: {
      auditId: audit4.id,
      severity: 'MEDIUM',
      description: 'Hazardous waste containers in Building C lacked proper labeling per OSHA 29 CFR 1910.1200.',
      ownerId: emp1.id,
      dueDate: new Date(new Date().getTime() - 5 * 86400000),
      status: 'OPEN',
      flaggedOverdue: true,
    },
  });

  await prisma.complianceIssue.create({
    data: {
      auditId: audit5.id,
      severity: 'CRITICAL',
      description: 'Customer PII stored in unencrypted S3 bucket accessible via public URL. Immediate remediation required.',
      ownerId: adminUser.id,
      dueDate: new Date(new Date().getTime() + 7 * 86400000),
      status: 'IN_PROGRESS',
      flaggedOverdue: false,
    },
  });

  await prisma.complianceIssue.create({
    data: {
      auditId: audit4.id,
      severity: 'LOW',
      description: 'Recycling station signage in the cafeteria does not meet the updated corporate branding guidelines.',
      ownerId: emp2.id,
      dueDate: new Date(new Date().getTime() + 45 * 86400000),
      status: 'OPEN',
      flaggedOverdue: false,
    },
  });

  await prisma.complianceIssue.create({
    data: {
      auditId: audit2.id,
      severity: 'HIGH',
      description: 'Supplier onboarding process lacks mandatory ESG risk assessment questionnaire for new vendors.',
      ownerId: headMfg.id,
      dueDate: new Date(new Date().getTime() + 20 * 86400000),
      status: 'OPEN',
      flaggedOverdue: false,
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

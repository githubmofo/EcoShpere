"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_client_1 = require("../src/common/prisma-client");
const client_1 = require("@prisma/client");
async function main() {
    console.log('Seeding database...');
    // 1. Departments
    const corp = await prisma_client_1.prisma.department.create({
        data: {
            name: 'Corporate',
            code: 'CORP',
            employeeCount: 150,
        },
    });
    const mfg = await prisma_client_1.prisma.department.create({
        data: {
            name: 'Manufacturing',
            code: 'MFG',
            employeeCount: 300,
        },
    });
    const logistics = await prisma_client_1.prisma.department.create({
        data: {
            name: 'Logistics',
            code: 'LOG',
            employeeCount: 200,
        },
    });
    // 2. Users
    const adminUser = await prisma_client_1.prisma.user.create({
        data: {
            name: 'Admin User',
            email: 'admin@ecosphere.com',
            passwordHash: 'hashed_password_placeholder',
            role: client_1.Role.ADMIN,
            departmentId: corp.id,
        },
    });
    const headMfg = await prisma_client_1.prisma.user.create({
        data: {
            name: 'Sarah Manager',
            email: 'sarah.manager@ecosphere.com',
            passwordHash: 'hashed_password_placeholder',
            role: client_1.Role.DEPT_HEAD,
            departmentId: mfg.id,
        },
    });
    // Assign head to department
    await prisma_client_1.prisma.department.update({
        where: { id: mfg.id },
        data: { headUserId: headMfg.id },
    });
    const emp1 = await prisma_client_1.prisma.user.create({
        data: {
            name: 'John Doe',
            email: 'john.doe@ecosphere.com',
            passwordHash: 'hashed_password_placeholder',
            role: client_1.Role.EMPLOYEE,
            departmentId: mfg.id,
        },
    });
    const emp2 = await prisma_client_1.prisma.user.create({
        data: {
            name: 'Jane Smith',
            email: 'jane.smith@ecosphere.com',
            passwordHash: 'hashed_password_placeholder',
            role: client_1.Role.EMPLOYEE,
            departmentId: logistics.id,
        },
    });
    // 3. Categories
    const csrCat = await prisma_client_1.prisma.category.create({
        data: {
            name: 'Community Outreach',
            type: client_1.CategoryType.CSR_ACTIVITY,
        },
    });
    const challengeCat = await prisma_client_1.prisma.category.create({
        data: {
            name: 'Energy Savings',
            type: client_1.CategoryType.CHALLENGE,
        },
    });
    // 4. Emission Factors
    await prisma_client_1.prisma.emissionFactor.createMany({
        data: [
            { name: 'Grid Electricity', factorValue: 0.5, unit: 'kgCO2e/kWh' },
            { name: 'Diesel Fuel', factorValue: 2.68, unit: 'kgCO2e/liter' },
            { name: 'Natural Gas', factorValue: 2.0, unit: 'kgCO2e/m3' },
        ],
    });
    // 5. ESG Policies
    const policy = await prisma_client_1.prisma.esgPolicy.create({
        data: {
            title: 'Zero Waste to Landfill 2030',
            description: 'Corporate commitment to eliminate landfill waste by 2030.',
            effectiveDate: new Date('2025-01-01'),
        },
    });
    // 6. Badges & Rewards
    const badge1 = await prisma_client_1.prisma.badge.create({
        data: {
            name: 'Eco Warrior',
            description: 'Earn 1000 XP points in challenges.',
            unlockRuleType: 'XP_THRESHOLD',
            unlockThreshold: 1000,
            iconUrl: '/icons/eco-warrior.png',
        },
    });
    const reward1 = await prisma_client_1.prisma.reward.create({
        data: {
            name: 'Extra Vacation Day',
            description: 'Redeem 5000 points for an extra day off.',
            pointsRequired: 5000,
            stock: 10,
        },
    });
    // 7. Transactional Data: Carbon Transactions
    await prisma_client_1.prisma.carbonTransaction.createMany({
        data: [
            { departmentId: mfg.id, sourceType: 'Electricity', quantity: 10000, emissionsValue: 5000, operationDate: new Date() },
            { departmentId: logistics.id, sourceType: 'Diesel', quantity: 5000, emissionsValue: 13400, operationDate: new Date() },
        ],
    });
    // 8. Csr Activities & Participations
    const csr = await prisma_client_1.prisma.csrActivity.create({
        data: {
            title: 'Local Park Cleanup',
            categoryId: csrCat.id,
            description: 'Join us to clean up the local park this weekend.',
            startDate: new Date(),
            endDate: new Date(new Date().getTime() + 86400000), // +1 day
            status: 'ONGOING',
        },
    });
    await prisma_client_1.prisma.employeeParticipation.create({
        data: {
            employeeId: emp1.id,
            csrActivityId: csr.id,
            approvalStatus: 'APPROVED',
            pointsEarned: 50,
            completionDate: new Date(),
        },
    });
    // 9. Challenges
    const challenge = await prisma_client_1.prisma.challenge.create({
        data: {
            title: 'Cycle to Work Week',
            categoryId: challengeCat.id,
            description: 'Cycle to work for a full week to reduce transport emissions.',
            xpAward: 200,
            difficulty: 'Medium',
            deadline: new Date(new Date().getTime() + 7 * 86400000), // +7 days
        },
    });
    await prisma_client_1.prisma.challengeParticipation.create({
        data: {
            employeeId: emp2.id,
            challengeId: challenge.id,
            progressPercent: 50,
            approvalStatus: 'PENDING',
        },
    });
    // 10. Department Scores
    await prisma_client_1.prisma.departmentScore.createMany({
        data: [
            { departmentId: corp.id, environmentalScore: 85, socialScore: 90, governanceScore: 88, totalScore: 87.6 },
            { departmentId: mfg.id, environmentalScore: 65, socialScore: 70, governanceScore: 80, totalScore: 71.6 },
            { departmentId: logistics.id, environmentalScore: 55, socialScore: 60, governanceScore: 75, totalScore: 63.3 },
        ],
    });
    // 11. Configuration Models
    await prisma_client_1.prisma.esgConfiguration.create({
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
    await prisma_client_1.prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map
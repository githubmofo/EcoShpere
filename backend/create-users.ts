import { PrismaClient } from "@prisma/client";
import * as crypto from "crypto";

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

async function main() {
  console.log("Wiping existing users...");
  
  // We must delete related records first due to foreign key constraints
  await prisma.notification.deleteMany();
  await prisma.badgeAssignment.deleteMany();
  await prisma.rewardRedemption.deleteMany();
  await prisma.employeeXpBalance.deleteMany();
  await prisma.challengeParticipation.deleteMany();
  await prisma.employeeParticipation.deleteMany();
  await prisma.policyAcknowledgement.deleteMany();
  await prisma.complianceIssue.deleteMany();
  await prisma.audit.deleteMany();
  
  // Update departments to remove headUserId constraint before deleting users
  await prisma.department.updateMany({ data: { headUserId: null } });
  
  await prisma.user.deleteMany();

  console.log("Creating default users...");

  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@ecosphere.com",
      passwordHash: hashPassword("admin123"),
      role: "ADMIN",
    },
  });

  const normal = await prisma.user.create({
    data: {
      name: "Normal User",
      email: "user@ecosphere.com",
      passwordHash: hashPassword("user123"),
      role: "EMPLOYEE",
    },
  });

  console.log("===================================");
  console.log("Success! Created the following users:");
  console.log(`1. Admin -> Email: ${admin.email} | Password: admin123`);
  console.log(`2. User  -> Email: ${normal.email} | Password: user123`);
  console.log("===================================");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

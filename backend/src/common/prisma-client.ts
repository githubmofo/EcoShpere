// src/common/prisma-client.ts
// Singleton Prisma client instance using MariaDB Driver Adapter for Prisma 7 compatibility
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import "dotenv/config";

const urlString = process.env.DATABASE_URL || "mysql://root:@localhost:3306/ecosphere";

const adapter = new PrismaMariaDb(urlString);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;

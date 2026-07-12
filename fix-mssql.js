const fs = require('fs');

// 1. Fix Schema
let schema = fs.readFileSync('backend/prisma/schema.prisma', 'utf8');

// Remove enum definitions
schema = schema.replace(/enum \w+ {[^}]+}/g, '');

// Replace enum types with String
const enums = ['Role', 'CategoryType', 'Status', 'CsrStatus', 'ApprovalStatus', 'AuditStatus', 'Severity', 'IssueStatus'];
enums.forEach(e => {
    const regex = new RegExp(`\\b${e}\\b`, 'g');
    schema = schema.replace(regex, 'String');
});

// Fix default values from enum (e.g. @default(ACTIVE) -> @default("ACTIVE"))
schema = schema.replace(/@default\((ACTIVE|INACTIVE|ARCHIVED|DRAFT|PLANNED|ONGOING|COMPLETED|CANCELLED|PENDING|APPROVED|REJECTED|SCHEDULED|IN_PROGRESS|LOW|MEDIUM|HIGH|CRITICAL|OPEN|RESOLVED|ADMIN|DEPT_HEAD|EMPLOYEE|AUDITOR)\)/g, '@default("$1")');

fs.writeFileSync('backend/prisma/schema.prisma', schema);

// 2. Fix Seed
let seed = fs.readFileSync('backend/prisma/seed.ts', 'utf8');

// Remove enum imports
seed = seed.replace(/, Role, CategoryType/, '');

// Replace enum usages (e.g. Role.ADMIN -> 'ADMIN')
seed = seed.replace(/Role\.ADMIN/g, "'ADMIN'");
seed = seed.replace(/Role\.DEPT_HEAD/g, "'DEPT_HEAD'");
seed = seed.replace(/Role\.EMPLOYEE/g, "'EMPLOYEE'");
seed = seed.replace(/CategoryType\.CSR_ACTIVITY/g, "'CSR_ACTIVITY'");
seed = seed.replace(/CategoryType\.CHALLENGE/g, "'CHALLENGE'");

fs.writeFileSync('backend/prisma/seed.ts', seed);
console.log("MSSQL Fixes Applied!");

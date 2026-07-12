// src/controllers/reports.controller.ts
// Reports endpoints backed by Prisma / MySQL.

import { Request, Response } from "express";
import prisma from "../common/prisma-client";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fmtDate = (d: Date) => d.toISOString().slice(0, 10);

export class ReportsController {
  // GET /reports/data — full dataset for the Reports page
  static async getData(_req: Request, res: Response) {
    try {
      const [carbon, deptScores, participations, compliance, audits, policies, acks, userCount] =
        await Promise.all([
          prisma.carbonTransaction.findMany({ include: { department: true } }),
          prisma.departmentScore.findMany({ include: { department: true } }),
          prisma.employeeParticipation.findMany({
            include: { employee: { include: { department: true } } },
          }),
          prisma.complianceIssue.findMany(),
          prisma.audit.findMany(),
          prisma.esgPolicy.count(),
          prisma.policyAcknowledgement.count(),
          prisma.user.count(),
        ]);

      // Emissions trend (bucket by year-month)
      const buckets = new Map<string, number>();
      for (const c of carbon) {
        const d = c.operationDate;
        const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
        buckets.set(key, (buckets.get(key) ?? 0) + c.emissionsValue);
      }
      const monthlyEmissions = [...buckets.entries()]
        .sort()
        .map(([key, emissions]) => {
          const month = MONTHS[parseInt(key.split("-")[1], 10)];
          return { month, emissions: Math.round(emissions), target: Math.round(emissions * 0.95) };
        });

      // Emissions by category (sourceType) and by department
      const byCat = new Map<string, number>();
      const byDept = new Map<string, number>();
      for (const c of carbon) {
        byCat.set(c.sourceType, (byCat.get(c.sourceType) ?? 0) + c.emissionsValue);
        const dn = c.department?.name ?? "—";
        byDept.set(dn, (byDept.get(dn) ?? 0) + c.emissionsValue);
      }
      const emissionsByCategory = [...byCat.entries()].map(([name, value]) => ({ name, value: Math.round(value) }));
      const emissionsByDepartment = [...byDept.entries()].map(([name, value]) => ({ name, value: Math.round(value) }));

      // CSR participation by department
      const csrMap = new Map<string, number>();
      for (const p of participations) {
        const dn = p.employee.department?.name ?? "—";
        csrMap.set(dn, (csrMap.get(dn) ?? 0) + 1);
      }
      const csrParticipation = [...csrMap.entries()].map(([name, value]) => ({ name, value }));

      // Governance
      const severityOrder = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
      const sevMap = new Map<string, number>();
      for (const i of compliance) sevMap.set(i.severity, (sevMap.get(i.severity) ?? 0) + 1);
      const complianceBySeverity = severityOrder.map((s) => ({
        name: s[0] + s.slice(1).toLowerCase(),
        value: sevMap.get(s) ?? 0,
      }));
      const governanceStats = {
        policyAckRate: userCount && policies ? Math.round((acks / (userCount * policies)) * 100) : 0,
        auditsCompleted: audits.filter((a) => a.status === "COMPLETED").length,
        auditsTotal: audits.length,
        openIssues: compliance.filter((i) => i.status === "OPEN").length,
        overdueIssues: compliance.filter((i) => i.flaggedOverdue).length,
      };

      // ESG summary
      const departmentScores = deptScores.map((d) => ({
        department: d.department?.name ?? "—",
        environmental: Math.round(d.environmentalScore),
        social: Math.round(d.socialScore),
        governance: Math.round(d.governanceScore),
        total: Math.round(d.totalScore),
      }));
      const avg = (key: "environmental" | "social" | "governance" | "total") =>
        departmentScores.length
          ? Math.round(departmentScores.reduce((s, d) => s + d[key], 0) / departmentScores.length)
          : 0;
      const esgPillars = { environmental: avg("environmental"), social: avg("social"), governance: avg("governance") };
      const overallEsg = avg("total");

      // Flat rows (for tables + custom builder)
      const reportRows = [
        ...carbon.slice(0, 6).map((c) => ({
          date: fmtDate(c.operationDate),
          department: c.department?.name ?? "—",
          module: "Environmental",
          metric: `${c.sourceType} Emissions`,
          value: `${Math.round(c.emissionsValue)} tCO2e`,
          employee: "—",
        })),
        ...participations.map((p) => ({
          date: p.completionDate ? fmtDate(p.completionDate) : "—",
          department: p.employee.department?.name ?? "—",
          module: "Social",
          metric: "CSR Participation",
          value: p.approvalStatus,
          employee: p.employee.name,
        })),
        ...compliance.map((i) => ({
          date: fmtDate(i.dueDate),
          department: "—",
          module: "Governance",
          metric: `${i.severity} Issue`,
          value: i.status + (i.flaggedOverdue ? " (overdue)" : ""),
          employee: "—",
        })),
      ];

      // Diversity & training are not modelled in the DB → representative values
      const diversityBreakdown = [
        { name: "Women", value: 44 },
        { name: "Men", value: 54 },
        { name: "Non-binary", value: 2 },
      ];
      const trainingCompletion = departmentScores.map((d) => ({ name: d.department, value: d.social }));

      res.json({
        monthlyEmissions,
        emissionsByCategory,
        emissionsByDepartment,
        csrParticipation,
        diversityBreakdown,
        trainingCompletion,
        complianceBySeverity,
        governanceStats,
        departmentScores,
        overallEsg,
        esgPillars,
        reportRows,
        employees: (await prisma.user.findMany({ select: { name: true } })).map((u) => u.name),
        departments: departmentScores.map((d) => d.department),
        challenges: (await prisma.challenge.findMany({ select: { title: true } })).map((c) => c.title),
      });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  }

  // POST /reports/custom — filtered flat rows
  static async custom(req: Request, res: Response) {
    try {
      const { department, module, employee } = req.body ?? {};
      // Reuse getData's rows by calling the same queries inline (kept simple).
      const [carbon, participations, compliance] = await Promise.all([
        prisma.carbonTransaction.findMany({ include: { department: true } }),
        prisma.employeeParticipation.findMany({ include: { employee: { include: { department: true } } } }),
        prisma.complianceIssue.findMany(),
      ]);
      let rows = [
        ...carbon.map((c) => ({
          date: fmtDate(c.operationDate),
          department: c.department?.name ?? "—",
          module: "Environmental",
          metric: `${c.sourceType} Emissions`,
          value: `${Math.round(c.emissionsValue)} tCO2e`,
          employee: "—",
        })),
        ...participations.map((p) => ({
          date: p.completionDate ? fmtDate(p.completionDate) : "—",
          department: p.employee.department?.name ?? "—",
          module: "Social",
          metric: "CSR Participation",
          value: p.approvalStatus,
          employee: p.employee.name,
        })),
        ...compliance.map((i) => ({
          date: fmtDate(i.dueDate),
          department: "—",
          module: "Governance",
          metric: `${i.severity} Issue`,
          value: i.status,
          employee: "—",
        })),
      ];
      if (department && department !== "all") rows = rows.filter((r) => r.department === department);
      if (module && module !== "all") rows = rows.filter((r) => r.module === module);
      if (employee && employee !== "all") rows = rows.filter((r) => r.employee === employee);
      res.json(rows);
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  }
}

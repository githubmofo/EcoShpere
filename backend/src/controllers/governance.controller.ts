// src/controllers/governance.controller.ts
// Governance module — Policies & Audits

import { Request, Response } from "express";
import prisma from "../common/prisma-client";

export class GovernanceController {
  // ── GET /api/governance/policies ────────────────────────────
  static async getPolicies(_req: Request, res: Response) {
    try {
      const policies = await prisma.esgPolicy.findMany({
        include: {
          acknowledgements: { select: { id: true } },
        },
        orderBy: { effectiveDate: "desc" },
      });

      // Count total users for acknowledgement ratio
      const totalEmployees = await prisma.user.count();

      const mapped = policies.map((p) => ({
        id: p.id,
        title: p.title,
        category: "Compliance", // EsgPolicy has no category field; can be extended later
        version: "1.0",
        description: p.description,
        effectiveDate: p.effectiveDate.toISOString().split("T")[0],
        status: p.status.toLowerCase(),
        acknowledgedCount: p.acknowledgements.length,
        totalEmployees,
      }));

      res.json(mapped);
    } catch (err) {
      console.error("[getPolicies]", err);
      res.status(500).json({ error: "Failed to fetch policies" });
    }
  }

  // ── POST /api/governance/policies ───────────────────────────
  static async createPolicy(req: Request, res: Response) {
    const { title, description, effectiveDate } = req.body as {
      title?: string;
      description?: string;
      effectiveDate?: string;
    };

    if (!title || !description || !effectiveDate) {
      res.status(400).json({ error: "title, description, and effectiveDate are required" });
      return;
    }

    try {
      const policy = await prisma.esgPolicy.create({
        data: {
          title,
          description,
          effectiveDate: new Date(effectiveDate),
          status: "ACTIVE",
        },
      });

      res.status(201).json({
        id: policy.id,
        title: policy.title,
        category: "Compliance",
        version: "1.0",
        description: policy.description,
        effectiveDate: policy.effectiveDate.toISOString().split("T")[0],
        status: policy.status.toLowerCase(),
        acknowledgedCount: 0,
        totalEmployees: 0,
      });
    } catch (err) {
      console.error("[createPolicy]", err);
      res.status(500).json({ error: "Failed to create policy" });
    }
  }

  // ── GET /api/governance/audits ──────────────────────────────
  static async getAudits(_req: Request, res: Response) {
    try {
      const audits = await prisma.audit.findMany({
        include: {
          department: { select: { name: true } },
          auditor: { select: { name: true } },
          complianceIssues: { select: { id: true } },
        },
        orderBy: { auditDate: "desc" },
      });

      const mapped = audits.map((a) => ({
        id: a.id,
        title: a.title,
        departmentId: a.departmentId,
        department: a.department.name,
        description: a.description,
        auditor: a.auditor.name,
        auditorId: a.auditorId,
        auditDate: a.auditDate.toISOString().split("T")[0],
        findings: a.complianceIssues.length,
        status: a.status.toLowerCase(),
        linkedIssueCount: a.complianceIssues.length,
      }));

      res.json(mapped);
    } catch (err) {
      console.error("[getAudits]", err);
      res.status(500).json({ error: "Failed to fetch audits" });
    }
  }

  // ── POST /api/governance/audits ─────────────────────────────
  static async createAudit(req: Request, res: Response) {
    const { title, description, departmentId, auditorId, auditDate } = req.body as {
      title?: string;
      description?: string;
      departmentId?: string;
      auditorId?: string;
      auditDate?: string;
    };

    if (!title || !description || !auditDate) {
      res.status(400).json({ error: "title, description, and auditDate are required" });
      return;
    }

    try {
      // Resolve fallback department and auditor if not provided
      let resolvedDeptId = departmentId;
      if (!resolvedDeptId) {
        const dept = await prisma.department.findFirst({ select: { id: true } });
        if (!dept) {
          res.status(400).json({ error: "No departments found. Please seed the database first." });
          return;
        }
        resolvedDeptId = dept.id;
      }

      let resolvedAuditorId = auditorId;
      if (!resolvedAuditorId) {
        const user = await prisma.user.findFirst({ select: { id: true } });
        if (!user) {
          res.status(400).json({ error: "No users found. Please seed the database first." });
          return;
        }
        resolvedAuditorId = user.id;
      }

      const audit = await prisma.audit.create({
        data: {
          title,
          description,
          departmentId: resolvedDeptId,
          auditorId: resolvedAuditorId,
          auditDate: new Date(auditDate),
          status: "SCHEDULED",
        },
        include: {
          department: { select: { name: true } },
          auditor: { select: { name: true } },
        },
      });

      res.status(201).json({
        id: audit.id,
        title: audit.title,
        departmentId: audit.departmentId,
        department: audit.department.name,
        description: audit.description,
        auditor: audit.auditor.name,
        auditorId: audit.auditorId,
        auditDate: audit.auditDate.toISOString().split("T")[0],
        findings: 0,
        status: audit.status.toLowerCase(),
        linkedIssueCount: 0,
      });
    } catch (err) {
      console.error("[createAudit]", err);
      res.status(500).json({ error: "Failed to create audit" });
    }
  }

  // ── GET /api/governance/acknowledgements ─────────────────────
  static async getAcknowledgements(_req: Request, res: Response) {
    try {
      const acks = await prisma.policyAcknowledgement.findMany({
        include: {
          policy: { select: { title: true } },
          employee: { select: { name: true } },
        },
      });
      res.json(acks);
    } catch (err) {
      console.error("[getAcknowledgements]", err);
      res.status(500).json({ error: "Failed to fetch acknowledgements" });
    }
  }

  // ── GET /api/governance/compliance-issues ───────────────────
  static async getComplianceIssues(_req: Request, res: Response) {
    try {
      const issues = await prisma.complianceIssue.findMany({
        include: {
          audit: { select: { title: true } },
          owner: { select: { name: true } },
        },
        orderBy: { dueDate: "asc" },
      });
      res.json(issues);
    } catch (err) {
      console.error("[getComplianceIssues]", err);
      res.status(500).json({ error: "Failed to fetch compliance issues" });
    }
  }
}

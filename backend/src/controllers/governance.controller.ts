// src/controllers/governance.controller.ts
// Governance controller

import { Request, Response } from "express";

export class GovernanceController {
  static async getDashboardMetrics(_req: Request, res: Response) {
    res.json({
      openIssues: 5,
      overdueIssues: 2,
      completedAudits: 12,
      policiesAcknowledgedPercent: 88
    });
  }

  static async getPolicies(_req: Request, res: Response) {
    res.json([
      { id: "1", title: "Code of Conduct", category: "Ethics", lastUpdated: "2026-01-15", status: "Active", mandatory: true },
      { id: "2", title: "Anti-Bribery Policy", category: "Compliance", lastUpdated: "2025-11-20", status: "Active", mandatory: true }
    ]);
  }

  static async getAcknowledgements(_req: Request, res: Response) {
    res.json([
      { id: "1", employeeName: "Alice Smith", policyId: "1", policyTitle: "Code of Conduct", status: "Acknowledged", date: "2026-02-01" },
      { id: "2", employeeName: "Bob Jones", policyId: "2", policyTitle: "Anti-Bribery Policy", status: "Pending", date: null }
    ]);
  }

  static async getAudits(_req: Request, res: Response) {
    res.json([
      { id: "1", title: "Q1 Environmental Audit", type: "Environmental", status: "Completed", date: "2026-03-31", score: 92, findings: 2 },
      { id: "2", title: "Annual Security Audit", type: "Security", status: "In Progress", date: "2026-07-15", score: null, findings: 0 }
    ]);
  }

  static async getComplianceIssues(_req: Request, res: Response) {
    res.json([
      { id: "1", title: "Missing Supplier Certifications", severity: "High", status: "Open", reportedDate: "2026-06-10", department: "Procurement", assignedTo: "Supply Chain Manager" },
      { id: "2", title: "Delayed Waste Reporting", severity: "Medium", status: "Resolved", reportedDate: "2026-05-22", department: "Operations", assignedTo: "Facility Manager" }
    ]);
  }
}

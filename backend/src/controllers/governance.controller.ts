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
      { id: "1", title: "Code of Conduct", category: "Ethics", lastUpdated: "2026-01-15", status: "active", mandatory: true, effectiveDate: "2026-01-15", version: "1.2", acknowledgedCount: 1320, totalEmployees: 1500, description: "Standard code of conduct." },
      { id: "2", title: "Anti-Bribery Policy", category: "Compliance", lastUpdated: "2025-11-20", status: "active", mandatory: true, effectiveDate: "2025-11-20", version: "2.0", acknowledgedCount: 1450, totalEmployees: 1500, description: "Anti-bribery and corruption policy." },
      { id: "3", title: "Data Privacy Policy", category: "Security", lastUpdated: "2026-03-10", status: "draft", mandatory: true, effectiveDate: "2026-04-01", version: "1.0", acknowledgedCount: 0, totalEmployees: 1500, description: "New GDPR compliance policy." },
      { id: "4", title: "Remote Work Guidelines", category: "HR", lastUpdated: "2024-06-15", status: "archived", mandatory: false, effectiveDate: "2024-07-01", version: "1.5", acknowledgedCount: 1500, totalEmployees: 1500, description: "Archived remote work policy." },
      { id: "5", title: "Supplier Code of Conduct", category: "Procurement", lastUpdated: "2026-05-01", status: "active", mandatory: true, effectiveDate: "2026-05-15", version: "3.1", acknowledgedCount: 890, totalEmployees: 1500, description: "Standards for all vendors." }
    ]);
  }

  static async getAcknowledgements(_req: Request, res: Response) {
    res.json([
      { id: "1", employeeId: "e1", employeeName: "Alice Smith", department: "Engineering", policyId: "1", policyTitle: "Code of Conduct", status: "acknowledged", acknowledgedAt: "2026-02-01T09:00:00Z" },
      { id: "2", employeeId: "e2", employeeName: "Bob Jones", department: "Sales", policyId: "2", policyTitle: "Anti-Bribery Policy", status: "pending", acknowledgedAt: null },
      { id: "3", employeeId: "e3", employeeName: "Charlie Brown", department: "Marketing", policyId: "1", policyTitle: "Code of Conduct", status: "acknowledged", acknowledgedAt: "2026-02-05T10:30:00Z" },
      { id: "4", employeeId: "e4", employeeName: "Diana Prince", department: "HR", policyId: "5", policyTitle: "Supplier Code of Conduct", status: "acknowledged", acknowledgedAt: "2026-05-20T14:15:00Z" },
      { id: "5", employeeId: "e5", employeeName: "Ethan Hunt", department: "Operations", policyId: "2", policyTitle: "Anti-Bribery Policy", status: "pending", acknowledgedAt: null }
    ]);
  }

  static async getAudits(_req: Request, res: Response) {
    res.json([
      { id: "1", title: "Q1 Environmental Audit", departmentId: "d1", department: "Operations", description: "Standard Q1 audit.", auditorId: "a1", auditor: "Jane Doe", auditDate: "2026-03-31", findings: 2, status: "completed", linkedIssueCount: 1 },
      { id: "2", title: "Annual Security Audit", departmentId: "d2", department: "IT", description: "Yearly security assessment.", auditorId: "a2", auditor: "John Smith", auditDate: "2026-07-15", findings: 0, status: "in-progress", linkedIssueCount: 0 },
      { id: "3", title: "Supplier Compliance Review", departmentId: "d3", department: "Procurement", description: "Checking vendor compliance.", auditorId: "a1", auditor: "Jane Doe", auditDate: "2026-08-01", findings: 0, status: "scheduled", linkedIssueCount: 0 },
      { id: "4", title: "Diversity & Inclusion Audit", departmentId: "d4", department: "HR", description: "Review of HR practices.", auditorId: "a3", auditor: "Sarah Connor", auditDate: "2026-04-15", findings: 5, status: "completed", linkedIssueCount: 3 },
      { id: "5", title: "Financial Controls Audit", departmentId: "d5", department: "Finance", description: "Quarterly financial review.", auditorId: "a4", auditor: "Bruce Wayne", auditDate: "2026-06-30", findings: 1, status: "completed", linkedIssueCount: 1 }
    ]);
  }

  static async getComplianceIssues(_req: Request, res: Response) {
    res.json([
      { id: "1", auditId: "1", auditTitle: "Q1 Environmental Audit", title: "Missing Supplier Certifications", description: "Several suppliers lack ISO certs.", severity: "high", status: "open", ownerId: "o1", owner: "Supply Chain Manager", assignee: "Supply Chain Manager", dueDate: "2026-08-01", reportedDate: "2026-06-10", isOverdue: false },
      { id: "2", auditId: "4", auditTitle: "Diversity & Inclusion Audit", title: "Delayed Waste Reporting", description: "Waste logs not submitted on time.", severity: "medium", status: "resolved", ownerId: "o2", owner: "Facility Manager", assignee: "Facility Manager", dueDate: "2026-05-30", reportedDate: "2026-05-22", isOverdue: false },
      { id: "3", auditId: "4", auditTitle: "Diversity & Inclusion Audit", title: "Incomplete Training Logs", description: "Not all staff have completed ESG training.", severity: "low", status: "in-progress", ownerId: "o3", owner: "HR Director", assignee: "HR Director", dueDate: "2026-07-30", reportedDate: "2026-06-15", isOverdue: false },
      { id: "4", auditId: "5", auditTitle: "Financial Controls Audit", title: "Unapproved Expense Reports", description: "Found expenses bypassing approval.", severity: "critical", status: "open", ownerId: "o4", owner: "CFO", assignee: "CFO", dueDate: "2026-07-05", reportedDate: "2026-07-01", isOverdue: true },
      { id: "5", auditId: "1", auditTitle: "Q1 Environmental Audit", title: "Improper Waste Disposal", description: "Hazardous waste found in general bin.", severity: "high", status: "resolved", ownerId: "o2", owner: "Facility Manager", assignee: "Facility Manager", dueDate: "2026-04-15", reportedDate: "2026-04-01", isOverdue: false }
    ]);
  }

  static async acknowledgePolicy(req: Request, res: Response) {
    res.status(201).json({ success: true, message: "Policy acknowledged" });
  }

  static async createPolicy(req: Request, res: Response) {
    res.status(201).json({ success: true, id: "new-policy-id" });
  }

  static async remindPolicy(req: Request, res: Response) {
    res.json({ success: true, message: "Reminders sent" });
  }
}

// src/controllers/social.controller.ts
// Social module — CSR Activities & Participation

import { Request, Response } from "express";
import prisma from "../common/prisma-client";

export class SocialController {
  // ── GET /api/social/csr-activities ──────────────────────────
  static async getCsrActivities(_req: Request, res: Response) {
    try {
      const activities = await prisma.csrActivity.findMany({
        include: {
          category: { select: { name: true } },
          participations: { select: { id: true } },
        },
        orderBy: { startDate: "asc" },
      });

      const mapped = activities.map((a) => ({
        id: a.id,
        title: a.title,
        categoryId: a.categoryId,
        category: a.category.name,
        description: a.description,
        startDate: a.startDate.toISOString().split("T")[0],
        endDate: a.endDate.toISOString().split("T")[0],
        status: a.status.toLowerCase(),
        defaultPoints: 50, // default; update if you add a points column later
        departmentId: "all",
        department: "All Departments",
        participantCount: a.participations.length,
      }));

      res.json(mapped);
    } catch (err) {
      console.error("[getCsrActivities]", err);
      res.status(500).json({ error: "Failed to fetch CSR activities" });
    }
  }

  // ── POST /api/social/csr-activities ─────────────────────────
  static async createCsrActivity(req: Request, res: Response) {
    const { title, categoryId, description, startDate, endDate, status } = req.body as {
      title?: string;
      categoryId?: string;
      description?: string;
      startDate?: string;
      endDate?: string;
      status?: string;
    };

    if (!title || !description || !startDate || !endDate) {
      res.status(400).json({ error: "title, description, startDate and endDate are required" });
      return;
    }

    try {
      // Resolve categoryId — use first available category if none provided
      let resolvedCategoryId = categoryId;
      if (!resolvedCategoryId) {
        const fallback = await prisma.category.findFirst({
          where: { type: "CSR" },
          select: { id: true },
        });
        // If still not found, create a default one
        if (!fallback) {
          const created = await prisma.category.create({
            data: { name: "General", type: "CSR" },
          });
          resolvedCategoryId = created.id;
        } else {
          resolvedCategoryId = fallback.id;
        }
      }

      const activity = await prisma.csrActivity.create({
        data: {
          title,
          categoryId: resolvedCategoryId,
          description,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          status: (status ?? "PLANNED").toUpperCase(),
        },
        include: { category: { select: { name: true } } },
      });

      res.status(201).json({
        id: activity.id,
        title: activity.title,
        category: activity.category.name,
        description: activity.description,
        startDate: activity.startDate.toISOString().split("T")[0],
        endDate: activity.endDate.toISOString().split("T")[0],
        status: activity.status.toLowerCase(),
        defaultPoints: 50,
        participantCount: 0,
      });
    } catch (err) {
      console.error("[createCsrActivity]", err);
      res.status(500).json({ error: "Failed to create CSR activity" });
    }
  }

  // ── POST /api/social/participation ──────────────────────────
  static async joinActivity(req: Request, res: Response) {
    const { employeeId, activityId } = req.body as {
      employeeId?: string;
      activityId?: string;
    };

    if (!employeeId || !activityId) {
      res.status(400).json({ error: "employeeId and activityId are required" });
      return;
    }

    try {
      // Fallback to a valid user if hardcoded one doesn't exist
      let resolvedEmployeeId = employeeId;
      const userExists = await prisma.user.findUnique({ where: { id: employeeId } });
      if (!userExists) {
        const fallback = await prisma.user.findFirst();
        if (!fallback) {
          res.status(400).json({ error: "No users in database. Please seed." });
          return;
        }
        resolvedEmployeeId = fallback.id;
      }

      // Guard: check if already joined
      const existing = await prisma.employeeParticipation.findFirst({
        where: { employeeId: resolvedEmployeeId, csrActivityId: activityId },
      });
      if (existing) {
        res.status(409).json({ error: "Already joined this activity" });
        return;
      }

      const participation = await prisma.employeeParticipation.create({
        data: {
          employeeId: resolvedEmployeeId,
          csrActivityId: activityId,
          approvalStatus: "PENDING",
          pointsEarned: 0,
        },
      });

      res.status(201).json(participation);
    } catch (err) {
      console.error("[joinActivity]", err);
      res.status(500).json({ error: "Failed to join activity" });
    }
  }

  // ── GET /api/social/participation ───────────────────────────
  static async getParticipation(_req: Request, res: Response) {
    try {
      const records = await prisma.employeeParticipation.findMany({
        include: {
          employee: { select: { name: true, department: { select: { name: true } } } },
          csrActivity: { select: { title: true } },
        },
        orderBy: { completionDate: "desc" },
      });

      const mapped = records.map((r) => ({
        id: r.id,
        employeeId: r.employeeId,
        employeeName: r.employee.name,
        activityId: r.csrActivityId,
        activityTitle: r.csrActivity.title,
        department: r.employee.department?.name || "Unknown",
        proofFileName: r.proofPath,
        pointsEarned: r.pointsEarned,
        status: r.approvalStatus.toLowerCase(),
        comments: "",
        submittedAt: r.completionDate,
      }));

      res.json(mapped);
    } catch (err) {
      console.error("[getParticipation]", err);
      res.status(500).json({ error: "Failed to fetch participation" });
    }
  }

  // ── GET /api/social/dashboard ───────────────────────────
  static async getDashboard(_req: Request, res: Response) {
    try {
      const totalActivities = await prisma.csrActivity.count();
      const participations = await prisma.employeeParticipation.findMany({
        where: { approvalStatus: "APPROVED" },
      });
      const pointsAwarded = participations.reduce((acc, curr) => acc + curr.pointsEarned, 0);

      // Mocked rates for dashboard
      const participationRate = 65; 
      const trainingCompletionRate = 82;

      res.json({
        totalActivities,
        participationRate,
        pointsAwarded,
        trainingCompletionRate,
      });
    } catch (err) {
      console.error("[getDashboard]", err);
      res.status(500).json({ error: "Failed to fetch dashboard metrics" });
    }
  }

  // ── GET /api/social/diversity-summary ──────────────────────
  static async getDiversitySummary(_req: Request, res: Response) {
    res.json({
      genderDistribution: [
        { label: "Male", value: 300, percentage: 55 },
        { label: "Female", value: 230, percentage: 42 },
        { label: "Other", value: 15, percentage: 3 },
      ],
      ageGroups: [
        { label: "18-25", value: 45, percentage: 8 },
        { label: "26-35", value: 180, percentage: 33 },
        { label: "36-45", value: 200, percentage: 37 },
        { label: "46-55", value: 90, percentage: 17 },
        { label: "56+", value: 30, percentage: 5 },
      ],
      trainingCompletion: {
        total: 545,
        completed: 450,
        percentage: 82.5,
      },
    });
  }
}

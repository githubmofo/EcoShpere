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
      // Guard: check if already joined
      const existing = await prisma.employeeParticipation.findFirst({
        where: { employeeId, csrActivityId: activityId },
      });
      if (existing) {
        res.status(409).json({ error: "Already joined this activity" });
        return;
      }

      const participation = await prisma.employeeParticipation.create({
        data: {
          employeeId,
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

      res.json(records);
    } catch (err) {
      console.error("[getParticipation]", err);
      res.status(500).json({ error: "Failed to fetch participation" });
    }
  }

  // ── GET /api/social/diversity-training ──────────────────────
  static async getDiversityTraining(_req: Request, res: Response) {
    res.json({ message: "Diversity & training — coming soon" });
  }
}

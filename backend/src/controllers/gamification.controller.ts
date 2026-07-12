// src/controllers/gamification.controller.ts
// Gamification endpoints backed by Prisma / MySQL.

import { Request, Response } from "express";
const Status = {
  ACTIVE: "ACTIVE",
  DRAFT: "DRAFT",
  ARCHIVED: "ARCHIVED",
  INACTIVE: "INACTIVE",
} as const;
type Status = (typeof Status)[keyof typeof Status];

const ApprovalStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;
type ApprovalStatus = (typeof ApprovalStatus)[keyof typeof ApprovalStatus];
import prisma from "../common/prisma-client";

// DB Status enum → frontend challenge lifecycle status
const STATUS_TO_UI: Record<Status, string> = {
  ACTIVE: "active",
  DRAFT: "draft",
  ARCHIVED: "archived",
  INACTIVE: "completed",
};
const UI_TO_STATUS: Record<string, Status> = {
  active: Status.ACTIVE,
  draft: Status.DRAFT,
  archived: Status.ARCHIVED,
  completed: Status.INACTIVE,
  "under-review": Status.ACTIVE,
};

const CATEGORY_ICON: Record<string, string> = {
  Energy: "⚡",
  Waste: "♻️",
  Transport: "🚲",
  Water: "💧",
  Community: "🌳",
};
const REWARD_ICON: Record<string, string> = {
  "Reusable Water Bottle": "🍶",
  "Extra Day Off": "🏖️",
  "Plant a Tree in Your Name": "🌳",
  "Coffee Voucher": "☕",
  "Eco Tote Bag": "👜",
  "Lunch with the CEO": "🍽️",
};

async function getCurrentUser() {
  return prisma.user.findFirst({
    where: { role: "ADMIN" },
    include: { xpBalance: true, department: true },
  });
}

export class GamificationController {
  // GET /challenges
  static async getChallenges(_req: Request, res: Response) {
    try {
      const rows = await prisma.challenge.findMany({
        include: { category: true, _count: { select: { participations: true } } },
        orderBy: { deadline: "asc" },
      });
      res.json(
        rows.map((c) => ({
          id: c.id,
          title: c.title,
          description: c.description,
          category: c.category?.name ?? "General",
          icon: CATEGORY_ICON[c.category?.name ?? ""] ?? "🌱",
          xp: c.xpAward,
          difficulty: c.difficulty,
          deadline: c.deadline.toISOString(),
          status: STATUS_TO_UI[c.status],
          evidenceRequired: c.evidenceRequired,
          participantCount: c._count.participations,
        }))
      );
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  }

  // GET /participation
  static async getParticipation(_req: Request, res: Response) {
    try {
      const rows = await prisma.challengeParticipation.findMany({
        include: { challenge: true, employee: { include: { department: true } } },
        orderBy: { approvalStatus: "asc" },
      });
      res.json(
        rows.map((p) => ({
          id: p.id,
          challengeId: p.challengeId,
          challengeTitle: p.challenge.title,
          employee: p.employee.name,
          department: p.employee.department?.name ?? "—",
          progress: p.progressPercent,
          proof: p.proofPath,
          approvalStatus: p.approvalStatus.toLowerCase(),
          xpAwarded: p.xpAwarded,
        }))
      );
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  }

  // GET /badges
  static async getBadges(_req: Request, res: Response) {
    try {
      const me = await getCurrentUser();
      const rows = await prisma.badge.findMany({
        include: {
          _count: { select: { assignments: true } },
          assignments: me ? { where: { employeeId: me.id } } : false,
        },
      });
      res.json(
        rows.map((b) => ({
          id: b.id,
          name: b.name,
          description: b.description,
          icon: b.iconUrl || "🏅",
          criteria:
            b.unlockRuleType === "XP_THRESHOLD"
              ? `Reach ${b.unlockThreshold.toLocaleString()} XP`
              : `Complete ${b.unlockThreshold} challenges`,
          unlockType: b.unlockRuleType === "XP_THRESHOLD" ? "xp" : "challenges",
          unlockThreshold: b.unlockThreshold,
          earned: Array.isArray((b as any).assignments) && (b as any).assignments.length > 0,
          earnedBy: b._count.assignments,
        }))
      );
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  }

  // GET /rewards
  static async getRewards(_req: Request, res: Response) {
    try {
      const rows = await prisma.reward.findMany({ orderBy: { pointsRequired: "asc" } });
      res.json(
        rows.map((r) => ({
          id: r.id,
          name: r.name,
          description: r.description,
          icon: REWARD_ICON[r.name] ?? "🎁",
          pointsCost: r.pointsRequired,
          stock: r.stock,
          category: "Reward",
        }))
      );
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  }

  // GET /leaderboard
  static async getLeaderboard(_req: Request, res: Response) {
    try {
      const users = await prisma.user.findMany({
        include: { xpBalance: true, department: true, badges: true },
      });
      const employees = users.map((u) => ({
        id: u.id,
        name: u.name,
        kind: "employee" as const,
        department: u.department?.name ?? "—",
        xp: u.xpBalance?.xpTotal ?? 0,
        badges: u.badges.length,
      }));
      // Department aggregates
      const deptMap = new Map<string, number>();
      for (const u of users) {
        const d = u.department?.name;
        if (d) deptMap.set(d, (deptMap.get(d) ?? 0) + (u.xpBalance?.xpTotal ?? 0));
      }
      const departments = [...deptMap.entries()].map(([name, xp]) => ({
        id: `dept-${name}`,
        name: `${name} Dept`,
        kind: "department" as const,
        department: name,
        xp,
        badges: 0,
      }));
      const all = [...employees, ...departments]
        .sort((a, b) => b.xp - a.xp)
        .map((e, i) => ({ ...e, rank: i + 1 }));
      res.json(all);
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  }

  // GET /summary  (current admin user)
  static async getSummary(_req: Request, res: Response) {
    try {
      const me = await getCurrentUser();
      const activeChallenges = await prisma.challenge.count({ where: { status: Status.ACTIVE } });
      const totalChallenges = await prisma.challenge.count();
      const badgeCount = me ? await prisma.badgeAssignment.count({ where: { employeeId: me.id } }) : 0;
      const totalBadges = await prisma.badge.count();
      res.json({
        name: me?.name ?? "Guest",
        role: me?.role === "ADMIN" ? "Admin" : "Employee",
        department: me?.department?.name ?? "—",
        xp: me?.xpBalance?.xpTotal ?? 0,
        points: me?.xpBalance?.pointsTotal ?? 0,
        badges: badgeCount,
        totalBadges,
        activeChallenges,
        totalChallenges,
      });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  }

  // POST /participation/:id/approve
  static async approveParticipation(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const p = await prisma.challengeParticipation.findUnique({
        where: { id },
        include: { challenge: true },
      });
      if (!p) return res.status(404).json({ error: "Not found" });

      const award = p.challenge.xpAward;
      await prisma.challengeParticipation.update({
        where: { id },
        data: { approvalStatus: ApprovalStatus.APPROVED, xpAwarded: award },
      });
      const balance = await prisma.employeeXpBalance.upsert({
        where: { employeeId: p.employeeId },
        create: { employeeId: p.employeeId, xpTotal: award, pointsTotal: 0 },
        update: { xpTotal: { increment: award } },
      });

      // Badge auto-award
      const completed = await prisma.challengeParticipation.count({
        where: { employeeId: p.employeeId, approvalStatus: ApprovalStatus.APPROVED },
      });
      const badges = await prisma.badge.findMany();
      const existing = await prisma.badgeAssignment.findMany({
        where: { employeeId: p.employeeId },
        select: { badgeId: true },
      });
      const owned = new Set(existing.map((a) => a.badgeId));
      const unlocked: string[] = [];
      for (const b of badges) {
        if (owned.has(b.id)) continue;
        const hit =
          (b.unlockRuleType === "XP_THRESHOLD" && balance.xpTotal >= b.unlockThreshold) ||
          (b.unlockRuleType === "CHALLENGE_COUNT" && completed >= b.unlockThreshold);
        if (hit) {
          await prisma.badgeAssignment.create({
            data: { badgeId: b.id, employeeId: p.employeeId, source: "AUTO" },
          });
          unlocked.push(b.name);
        }
      }
      res.json({ ok: true, xpAwarded: award, newXp: balance.xpTotal, unlockedBadges: unlocked });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  }

  // POST /participation/:id/reject
  static async rejectParticipation(req: Request, res: Response) {
    try {
      await prisma.challengeParticipation.update({
        where: { id: String(req.params.id) },
        data: { approvalStatus: ApprovalStatus.REJECTED },
      });
      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  }

  // POST /rewards/:id/redeem
  static async redeemReward(req: Request, res: Response) {
    try {
      const reward = await prisma.reward.findUnique({ where: { id: String(req.params.id) } });
      if (!reward) return res.status(404).json({ error: "Reward not found" });
      const me = await getCurrentUser();
      if (!me?.xpBalance) return res.status(400).json({ error: "No balance" });
      if (reward.stock <= 0) return res.status(400).json({ error: "Out of stock" });
      if (me.xpBalance.pointsTotal < reward.pointsRequired)
        return res.status(400).json({ error: "Insufficient points" });

      await prisma.$transaction([
        prisma.reward.update({ where: { id: reward.id }, data: { stock: { decrement: 1 } } }),
        prisma.employeeXpBalance.update({
          where: { employeeId: me.id },
          data: { pointsTotal: { decrement: reward.pointsRequired } },
        }),
        prisma.rewardRedemption.create({
          data: { rewardId: reward.id, employeeId: me.id, pointsSpent: reward.pointsRequired },
        }),
      ]);
      res.json({
        ok: true,
        newPoints: me.xpBalance.pointsTotal - reward.pointsRequired,
        stock: reward.stock - 1,
      });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  }

  // PATCH /challenges/:id/status
  static async updateChallengeStatus(req: Request, res: Response) {
    try {
      const status = UI_TO_STATUS[req.body?.status];
      if (!status) return res.status(400).json({ error: "Invalid status" });
      await prisma.challenge.update({ where: { id: String(req.params.id) }, data: { status } });
      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  }

  // POST /challenges
  static async createChallenge(req: Request, res: Response) {
    try {
      const { title, description, category, xp, difficulty, deadline } = req.body ?? {};
      if (!title) return res.status(400).json({ error: "Title required" });
      let cat = await prisma.category.findFirst({
        where: { name: category ?? "Energy", type: "CHALLENGE" },
      });
      if (!cat) cat = await prisma.category.findFirst({ where: { type: "CHALLENGE" } });
      if (!cat) cat = await prisma.category.create({ data: { name: category ?? "General", type: "CHALLENGE" } });

      const created = await prisma.challenge.create({
        data: {
          title,
          description: description ?? "New sustainability challenge.",
          categoryId: cat.id,
          xpAward: Number(xp) || 0,
          difficulty: difficulty ?? "Medium",
          deadline: deadline ? new Date(deadline) : new Date(),
          status: Status.DRAFT,
          evidenceRequired: false,
        },
      });
      res.json({ ok: true, id: created.id });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  }
}

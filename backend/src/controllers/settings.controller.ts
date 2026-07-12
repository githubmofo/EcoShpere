import { Request, Response } from "express";
import prisma from "../common/prisma-client";

export class SettingsController {
  // --- Departments ---
  static async getDepartments(req: Request, res: Response) {
    try {
      const departments = await prisma.department.findMany();
      res.json(departments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch departments" });
    }
  }

  static async createDepartment(req: Request, res: Response) {
    try {
      const department = await prisma.department.create({ data: req.body });
      res.status(201).json(department);
    } catch (error) {
      res.status(500).json({ error: "Failed to create department" });
    }
  }

  static async updateDepartment(req: Request, res: Response) {
    try {
      const department = await prisma.department.update({
        where: { id: req.params.id as string },
        data: req.body,
      });
      res.json(department);
    } catch (error) {
      res.status(500).json({ error: "Failed to update department" });
    }
  }

  static async deleteDepartment(req: Request, res: Response) {
    try {
      await prisma.department.delete({ where: { id: req.params.id as string } });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete department" });
    }
  }

  // --- Categories ---
  static async getCategories(req: Request, res: Response) {
    try {
      const categories = await prisma.category.findMany();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  }

  static async createCategory(req: Request, res: Response) {
    try {
      const category = await prisma.category.create({ data: req.body });
      res.status(201).json(category);
    } catch (error) {
      res.status(500).json({ error: "Failed to create category" });
    }
  }

  static async updateCategory(req: Request, res: Response) {
    try {
      const category = await prisma.category.update({
        where: { id: req.params.id as string },
        data: req.body,
      });
      res.json(category);
    } catch (error) {
      res.status(500).json({ error: "Failed to update category" });
    }
  }

  // --- ESG Config ---
  static async getEsgConfig(req: Request, res: Response) {
    try {
      const config = await prisma.esgConfiguration.findFirst();
      res.json(config || {});
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ESG config" });
    }
  }

  static async updateEsgConfig(req: Request, res: Response) {
    try {
      const existing = await prisma.esgConfiguration.findFirst();
      if (existing) {
        const config = await prisma.esgConfiguration.update({
          where: { id: existing.id },
          data: req.body,
        });
        res.json(config);
      } else {
        const config = await prisma.esgConfiguration.create({ data: req.body });
        res.json(config);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to update ESG config" });
    }
  }

  // --- Notifications ---
  static async getNotifications(req: Request, res: Response) {
    try {
      const config = await prisma.notificationSettings.findFirst();
      res.json(config || {});
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notification settings" });
    }
  }

  static async updateNotifications(req: Request, res: Response) {
    try {
      const existing = await prisma.notificationSettings.findFirst();
      if (existing) {
        const config = await prisma.notificationSettings.update({
          where: { id: existing.id },
          data: req.body,
        });
        res.json(config);
      } else {
        const config = await prisma.notificationSettings.create({ data: req.body });
        res.json(config);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to update notification settings" });
    }
  }
}

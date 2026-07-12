// src/controllers/dashboard.controller.ts
// Dashboard controller

import { Request, Response } from "express";

export class DashboardController {
  static async getOverview(_req: Request, res: Response) {
    // TODO: Implement dashboard overview logic
    res.json({ message: "Dashboard overview" });
  }
}

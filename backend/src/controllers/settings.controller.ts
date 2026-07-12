// src/controllers/settings.controller.ts
// Settings controller

import { Request, Response } from "express";

export class SettingsController {
  static async getDepartments(_req: Request, res: Response) {
    // TODO: Implement
    res.json({ message: "Departments" });
  }

  static async getCategories(_req: Request, res: Response) {
    // TODO: Implement
    res.json({ message: "Categories" });
  }

  static async getEsgConfig(_req: Request, res: Response) {
    // TODO: Implement
    res.json({ message: "ESG config" });
  }

  static async getNotifications(_req: Request, res: Response) {
    // TODO: Implement
    res.json({ message: "Notification settings" });
  }
}

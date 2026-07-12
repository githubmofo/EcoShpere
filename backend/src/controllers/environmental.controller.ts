// src/controllers/environmental.controller.ts
// Environmental controller

import { Request, Response } from "express";

export class EnvironmentalController {
  static async getEmissionFactors(_req: Request, res: Response) {
    // TODO: Implement
    res.json({ message: "Emission factors" });
  }

  static async getCarbonTransactions(_req: Request, res: Response) {
    // TODO: Implement
    res.json({ message: "Carbon transactions" });
  }

  static async getGoals(_req: Request, res: Response) {
    // TODO: Implement
    res.json({ message: "Environmental goals" });
  }
}

// src/controllers/social.controller.ts
// Social controller

import { Request, Response } from "express";

export class SocialController {
  static async getDashboardMetrics(_req: Request, res: Response) {
    res.json({
      totalActivities: 4,
      participationRate: 65,
      pointsAwarded: 1250,
      trainingCompletionRate: 80
    });
  }

  static async getCsrActivities(_req: Request, res: Response) {
    res.json([
      { id: "1", title: "Beach Cleanup Drive", description: "Clean up the local beach", type: "Environment", date: "2026-08-15", location: "Santa Monica Beach", status: "Planned", participants: 12, maxParticipants: 50, points: 100 },
      { id: "2", title: "Mentorship for Youth in Tech", description: "Mentor high school students", type: "Education", date: "2026-07-20", location: "Downtown Tech Hub", status: "Ongoing", participants: 5, maxParticipants: 10, points: 200 }
    ]);
  }

  static async getParticipation(_req: Request, res: Response) {
    res.json([
      { id: "1", employeeName: "Alice Smith", department: "Engineering", activityId: "1", activityTitle: "Beach Cleanup Drive", status: "Approved", hours: 4, points: 100, date: "2026-08-15" },
      { id: "2", employeeName: "Bob Jones", department: "Sales", activityId: "2", activityTitle: "Mentorship for Youth in Tech", status: "Pending", hours: 2, points: 200, date: "2026-07-20" }
    ]);
  }

  static async getDiversitySummary(_req: Request, res: Response) {
    res.json({
      totalEmployees: 1500,
      femalePercentage: 42,
      minorityPercentage: 35,
      leadershipDiversityPercent: 28,
      trainingCompletionRate: 80,
      payEquityGap: 2.1
    });
  }
}

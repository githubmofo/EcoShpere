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
      { id: "1", title: "Beach Cleanup Drive", categoryId: "c1", category: "Environment", description: "Clean up the local beach and remove plastic waste.", startDate: "2026-08-15", endDate: "2026-08-16", status: "planned", defaultPoints: 100, departmentId: "d1", department: "Operations", participantCount: 12 },
      { id: "2", title: "Mentorship for Youth in Tech", categoryId: "c2", category: "Education", description: "Mentor high school students interested in software engineering.", startDate: "2026-07-20", endDate: "2026-09-20", status: "ongoing", defaultPoints: 200, departmentId: "d2", department: "IT", participantCount: 5 },
      { id: "3", title: "Tree Planting Initiative", categoryId: "c1", category: "Environment", description: "Plant 500 saplings in the city park.", startDate: "2026-09-01", endDate: "2026-09-02", status: "planned", defaultPoints: 150, departmentId: "d3", department: "HR", participantCount: 20 },
      { id: "4", title: "Charity Code-a-Thon", categoryId: "c3", category: "Community", description: "Build open-source tools for local non-profits.", startDate: "2026-06-10", endDate: "2026-06-12", status: "completed", defaultPoints: 300, departmentId: "d2", department: "Engineering", participantCount: 45 },
      { id: "5", title: "Food Bank Volunteering", categoryId: "c3", category: "Community", description: "Help sort and pack food donations for the weekend.", startDate: "2026-07-25", endDate: "2026-07-25", status: "planned", defaultPoints: 50, departmentId: "d1", department: "All", participantCount: 8 }
    ]);
  }

  static async getParticipation(_req: Request, res: Response) {
    res.json([
      { id: "1", employeeId: "e1", employeeName: "Alice Smith", department: "Engineering", activityId: "1", activityTitle: "Beach Cleanup Drive", proofFileName: "cleanup_photo.jpg", pointsEarned: 100, status: "approved", comments: "Great job!", submittedAt: "2026-08-16T10:00:00Z" },
      { id: "2", employeeId: "e2", employeeName: "Bob Jones", department: "Sales", activityId: "2", activityTitle: "Mentorship for Youth in Tech", proofFileName: null, pointsEarned: 0, status: "pending", comments: "", submittedAt: "2026-07-21T09:30:00Z" },
      { id: "3", employeeId: "e3", employeeName: "Charlie Brown", department: "Marketing", activityId: "3", activityTitle: "Tree Planting Initiative", proofFileName: "trees.pdf", pointsEarned: 150, status: "pending", comments: "", submittedAt: "2026-09-03T11:15:00Z" },
      { id: "4", employeeId: "e4", employeeName: "Diana Prince", department: "HR", activityId: "4", activityTitle: "Charity Code-a-Thon", proofFileName: "github_repo.png", pointsEarned: 300, status: "approved", comments: "Excellent contribution.", submittedAt: "2026-06-13T14:20:00Z" },
      { id: "5", employeeId: "e5", employeeName: "Ethan Hunt", department: "Operations", activityId: "5", activityTitle: "Food Bank Volunteering", proofFileName: null, pointsEarned: 0, status: "rejected", comments: "Please provide proof of attendance.", submittedAt: "2026-07-26T08:00:00Z" }
    ]);
  }

  static async getDiversitySummary(_req: Request, res: Response) {
    res.json({
      genderDistribution: [
        { label: "Male", value: 870, percentage: 58 },
        { label: "Female", value: 630, percentage: 42 },
      ],
      ageGroups: [
        { label: "18-25", value: 200, percentage: 13.3 },
        { label: "26-35", value: 600, percentage: 40 },
        { label: "36-45", value: 400, percentage: 26.7 },
        { label: "46-55", value: 200, percentage: 13.3 },
        { label: "55+", value: 100, percentage: 6.7 },
      ],
      trainingCompletion: { total: 1500, completed: 1200, percentage: 80 }
    });
  }

  static async joinParticipation(req: Request, res: Response) {
    // Mock joining an activity
    res.status(201).json({ success: true, message: "Joined successfully", data: req.body });
  }

  static async createActivity(req: Request, res: Response) {
    // Mock creating an activity
    res.status(201).json({ success: true, message: "Activity created", data: req.body });
  }
}

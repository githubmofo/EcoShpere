// src/services/scoring.service.ts
// ESG scoring business logic

export class ScoringService {
  /**
   * Calculate overall ESG score from pillar scores
   */
  static calculateOverall(
    environmental: number,
    social: number,
    governance: number
  ): number {
    // Default weights: E=40%, S=30%, G=30%
    return environmental * 0.4 + social * 0.3 + governance * 0.3;
  }

  /**
   * Get letter grade from numeric score
   */
  static getGrade(score: number): string {
    if (score >= 90) return "A+";
    if (score >= 80) return "A";
    if (score >= 70) return "B";
    if (score >= 60) return "C";
    if (score >= 50) return "D";
    return "F";
  }
}

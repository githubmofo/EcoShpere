// lib/scoring.ts
// ESG scoring helper functions

export interface ScoreWeights {
  environmental: number;
  social: number;
  governance: number;
}

const DEFAULT_WEIGHTS: ScoreWeights = {
  environmental: 0.4,
  social: 0.3,
  governance: 0.3,
};

/**
 * Calculate overall ESG score from pillar scores
 */
export function calculateOverallScore(
  environmental: number,
  social: number,
  governance: number,
  weights: ScoreWeights = DEFAULT_WEIGHTS
): number {
  return (
    environmental * weights.environmental +
    social * weights.social +
    governance * weights.governance
  );
}

/**
 * Get letter grade from numeric score (0-100)
 */
export function getGrade(score: number): string {
  if (score >= 90) return "A+";
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  if (score >= 50) return "D";
  return "F";
}

/**
 * Get color class based on score
 */
export function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-500";
  if (score >= 60) return "text-yellow-500";
  if (score >= 40) return "text-orange-500";
  return "text-red-500";
}

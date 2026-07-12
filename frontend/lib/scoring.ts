import { DepartmentScore } from './types';

export interface ScoreWeights {
  environmental: number;
  social: number;
  governance: number;
}

const DEFAULT_WEIGHTS: ScoreWeights = {
  environmental: 40,
  social: 30,
  governance: 30,
};

/**
 * Validates that weights sum to exactly 100. If they do not, returns the default weights.
 */
function getValidWeights(weights?: Partial<ScoreWeights>): ScoreWeights {
  if (!weights) return DEFAULT_WEIGHTS;
  
  const e = weights.environmental ?? DEFAULT_WEIGHTS.environmental;
  const s = weights.social ?? DEFAULT_WEIGHTS.social;
  const g = weights.governance ?? DEFAULT_WEIGHTS.governance;

  if (e + s + g !== 100) {
    return DEFAULT_WEIGHTS;
  }
  
  return { environmental: e, social: s, governance: g };
}

/**
 * Calculate a department's total score based on the E/S/G scores and their respective weights.
 */
export function computeDepartmentScore(
  envScore: number,
  socialScore: number,
  governanceScore: number,
  weights?: Partial<ScoreWeights>
): number {
  const validWeights = getValidWeights(weights);
  
  const score = (
    (envScore * validWeights.environmental) +
    (socialScore * validWeights.social) +
    (governanceScore * validWeights.governance)
  ) / 100;
  
  return score;
}

/**
 * Calculate the overall organization ESG score based on all department scores and the configured weights.
 */
export function computeOverallEsgScore(
  departmentScores: DepartmentScore[],
  weights?: Partial<ScoreWeights>
): number {
  if (!departmentScores || departmentScores.length === 0) {
    return 0;
  }
  
  const validWeights = getValidWeights(weights);

  // Compute the average E, S, and G scores across all departments first
  const totalEnv = departmentScores.reduce((sum, dept) => sum + (dept.environmentalScore ?? dept.environmental), 0);
  const totalSoc = departmentScores.reduce((sum, dept) => sum + (dept.socialScore ?? dept.social), 0);
  const totalGov = departmentScores.reduce((sum, dept) => sum + (dept.governanceScore ?? dept.governance), 0);
  
  const avgEnv = totalEnv / departmentScores.length;
  const avgSoc = totalSoc / departmentScores.length;
  const avgGov = totalGov / departmentScores.length;

  return computeDepartmentScore(avgEnv, avgSoc, avgGov, validWeights);
}

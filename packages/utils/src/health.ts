/**
 * Calculate relationship health score (0-100) based on interaction patterns.
 *
 * Factors:
 * - Recency: How recently you interacted (exponential decay)
 * - Frequency: How often vs target frequency
 * - Variety: Different types of interactions
 * - Depth: Meaningful interactions weigh more
 */

const DEPTH_WEIGHTS: Record<string, number> = {
  coffee: 1.5,
  meal: 1.5,
  event: 1.3,
  call: 1.2,
  gift: 1.4,
  introduction: 1.3,
  favor: 1.3,
  email: 1.0,
  text: 0.8,
  other: 1.0,
};

interface HealthInput {
  daysSinceLastInteraction: number;
  targetFrequencyDays: number;
  interactionTypes: string[];
  totalInteractions: number;
}

/** Calculate health score based on interaction patterns */
export function calculateHealthScore(input: HealthInput): number {
  const { daysSinceLastInteraction, targetFrequencyDays, interactionTypes, totalInteractions } = input;

  // No interactions ever = 50 (neutral starting point for new contacts)
  if (totalInteractions === 0) return 50;

  // Recency score (0-40): exponential decay based on target frequency
  const recencyRatio = daysSinceLastInteraction / targetFrequencyDays;
  const recencyScore = Math.max(0, 40 * Math.exp(-1.5 * Math.max(0, recencyRatio - 0.5)));

  // Frequency score (0-30): how well you're maintaining the target cadence
  const frequencyScore = recencyRatio <= 1
    ? 30
    : Math.max(0, 30 * (1 - (recencyRatio - 1) / 3));

  // Variety score (0-15): unique interaction types
  const uniqueTypes = new Set(interactionTypes).size;
  const varietyScore = Math.min(15, uniqueTypes * 3);

  // Depth score (0-15): weighted by interaction type quality
  const avgDepth = interactionTypes.length > 0
    ? interactionTypes.reduce((sum, t) => sum + (DEPTH_WEIGHTS[t] || 1), 0) / interactionTypes.length
    : 1;
  const depthScore = Math.min(15, (avgDepth - 0.8) * 15 / 0.7);

  const total = Math.round(recencyScore + frequencyScore + varietyScore + Math.max(0, depthScore));
  return Math.min(100, Math.max(0, total));
}

/** Apply daily decay to a health score */
export function decayHealthScore(currentScore: number, daysSinceUpdate: number): number {
  // Lose ~1 point per day when overdue, accelerating as score drops
  const decayRate = 0.02;
  const decayed = currentScore * Math.exp(-decayRate * daysSinceUpdate);
  return Math.round(Math.max(0, decayed));
}

/** Get health status label from score */
export function getHealthStatus(score: number): 'healthy' | 'needs_attention' | 'cold' {
  if (score >= 60) return 'healthy';
  if (score >= 30) return 'needs_attention';
  return 'cold';
}

/** Get health color class for UI */
export function getHealthColor(score: number): string {
  if (score >= 60) return 'text-green-500';
  if (score >= 30) return 'text-yellow-500';
  return 'text-red-500';
}

/** Get health background color class for UI */
export function getHealthBgColor(score: number): string {
  if (score >= 60) return 'bg-green-500';
  if (score >= 30) return 'bg-yellow-500';
  return 'bg-red-500';
}

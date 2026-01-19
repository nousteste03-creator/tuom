// _impact.ts
// Cálculo determinístico do impactScore

export type ImpactWeights = {
  time: number;
  source: number;
  category: number;
  frequency: number;
};

export function calculateImpactScore(weights: ImpactWeights): number {
  const rawScore =
    weights.time *
    weights.source *
    weights.category *
    weights.frequency;

  const normalized = Math.round(rawScore * 100);

  // Garantia de faixa segura
  if (normalized < 0) return 0;
  if (normalized > 100) return 100;

  return normalized;
}

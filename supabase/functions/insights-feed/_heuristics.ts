// _heuristics.ts
// Funções puras de heurística (Fase 3)

export function getTimeWeight(publishedAtISO: string): number {
  const publishedAt = new Date(publishedAtISO);
  const now = new Date();

  const diffMs = now.getTime() - publishedAt.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours <= 6) return 1.0;
  if (diffHours <= 24) return 0.8;
  if (diffHours <= 72) return 0.6;
  if (diffHours <= 168) return 0.4;
  return 0.2;
}

export function getSourceWeight(source: {
  impact_default?: number | null;
}): number {
  if (typeof source?.impact_default === "number") {
    return source.impact_default;
  }
  return 0.6;
}

const CATEGORY_WEIGHTS: Record<string, number> = {
  economy: 1.0,
  investments: 1.0,
  politics: 0.9,
  fintech: 0.85,
  education: 0.8,
  general: 0.6,
};

export function getCategoryWeight(category?: string | null): number {
  if (!category) return 0.6;
  return CATEGORY_WEIGHTS[category] ?? 0.6;
}

export function getFrequencyWeight(occurrences: number): number {
  if (occurrences >= 5) return 0.6;
  if (occurrences >= 3) return 0.8;
  return 1.0;
}

export function generateTrendKey(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .split(/\s+/)
    .slice(0, 3)
    .join("-");
}

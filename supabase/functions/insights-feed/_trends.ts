// _trends.ts
// Agrupamento de trends por trend_key

type InsightItem = {
  id: string;
  trendKey?: string | null;
  impactScore: number;
};

type Trend = {
  trendKey: string;
  score: number;
  items: InsightItem[];
};

export function buildTrends(items: InsightItem[]): Trend[] {
  const groups: Record<string, InsightItem[]> = {};

  for (const item of items) {
    if (!item.trendKey) continue;

    if (!groups[item.trendKey]) {
      groups[item.trendKey] = [];
    }
    groups[item.trendKey].push(item);
  }

  const trends: Trend[] = Object.entries(groups)
    .filter(([, group]) => group.length >= 3)
    .map(([trendKey, group]) => {
      const avgScore =
        group.reduce((sum, i) => sum + i.impactScore, 0) / group.length;

      return {
        trendKey,
        score: Math.round(avgScore),
        items: group.slice(0, 3),
      };
    })
    .sort((a, b) => b.score - a.score);

  return trends;
}

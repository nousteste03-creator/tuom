// hooks/useInsights.ts
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

/* -------------------------------
   Tipagem dos dados de Insights
-------------------------------- */
export type ImpactLevel = "low" | "medium" | "high";

export interface InsightItem {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  url?: string;
  source?: string;
  category?: string;
  impactLevel?: ImpactLevel;
  impactScore?: number;
  publishedAt: string;
}

export interface InsightGroup {
  category: string;
  articles: InsightItem[];
}

export interface InsightsFeed {
  hero: InsightItem | null;
  categories: Record<string, InsightItem[]>;
  nextCursor: string | null;
}

/* -------------------------------
   Helpers
-------------------------------- */
function dedupeById(items: InsightItem[]) {
  const map = new Map<string, InsightItem>();
  items.forEach((item) => {
    if (!map.has(item.id)) {
      map.set(item.id, item);
    }
  });
  return Array.from(map.values());
}

/* -------------------------------
   Hook oficial: useInsights
-------------------------------- */
export function useInsights() {
  const [loading, setLoading] = useState(true);

  const [insightOfDay, setInsightOfDay] = useState({
    title: "A assinatura silenciosa que custa mais que seu aluguel.",
    subtitle: "Alguns hábitos custam caro porque se repetem.",
  });

  const [today, setToday] = useState<InsightItem[]>([]);
  const [highlights, setHighlights] = useState<InsightItem[]>([]);
  const [trends, setTrends] = useState<InsightGroup[]>([]);
  const [categories, setCategories] = useState<Record<string, InsightItem[]>>(
    {}
  );
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /* -------------------------------
     Fetch Insights Feed
  -------------------------------- */
  const fetchInsights = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke<InsightsFeed>(
        "insights-feed"
      );

      if (error) throw error;
      if (!data) throw new Error("Feed vazio");

      const hero = data.hero ?? null;
      const cats = data.categories ?? {};

      setCategories(cats);

      /* -------- Insight do Dia -------- */
      if (hero) {
        setInsightOfDay({
          title: hero.title,
          subtitle: hero.subtitle || hero.description || "",
        });
      }

      /* -------- Flatten geral -------- */
      const allItems = dedupeById(
        Object.values(cats).flat()
      );

      /* -------- Hoje (5 mais recentes, sem hero duplicado) -------- */
      const todayItems = allItems
        .filter((item) => !hero || item.id !== hero.id)
        .sort(
          (a, b) =>
            new Date(b.publishedAt).getTime() -
            new Date(a.publishedAt).getTime()
        )
        .slice(0, 5);

      setToday(todayItems);

      /* -------- Highlights (impacto, deduplicado) -------- */
      const highlightBase = hero
        ? dedupeById([...allItems, hero])
        : allItems;

      const highlightItems = highlightBase
        .sort(
          (a, b) => (b.impactScore ?? 0) - (a.impactScore ?? 0)
        )
        .slice(0, 3);

      setHighlights(highlightItems);

      /* -------- Trends por categoria (já seguros) -------- */
      const trendGroups: InsightGroup[] = Object.keys(cats).map((cat) => ({
        category: cat,
        articles: dedupeById(cats[cat]).slice(0, 3),
      }));

      setTrends(trendGroups);

      setNextCursor(data.nextCursor ?? null);
    } catch (err: any) {
      console.error("Erro ao buscar insights:", err);
      setError(err.message ?? "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  return {
    loading,
    insightOfDay,
    today,
    highlights,
    trends,
    categories,
    nextCursor,
    error,
    refresh: fetchInsights,
  };
}

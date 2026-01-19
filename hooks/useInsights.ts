// hooks/useInsights.ts
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

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

const DEFAULT_INSIGHT_IMAGE = "https://tuom.com/default-insight.jpg";

function dedupeById(items: InsightItem[]) {
  const map = new Map<string, InsightItem>();
  items.forEach((item) => {
    if (!map.has(item.id)) {
      map.set(item.id, item);
    }
  });
  return Array.from(map.values());
}

export function useInsights() {
  const [loading, setLoading] = useState(true);
  const [insightOfDay, setInsightOfDay] = useState({
    title: "A assinatura silenciosa que custa mais que seu aluguel.",
    subtitle: "Alguns hábitos custam caro porque se repetem.",
  });
  const [today, setToday] = useState<InsightItem[]>([]);
  const [highlights, setHighlights] = useState<InsightItem[]>([]);
  const [trends, setTrends] = useState<InsightGroup[]>([]);
  const [categories, setCategories] = useState<Record<string, InsightItem[]>>({});
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke<InsightsFeed>(
        "insights-feed"
      );
      if (error) throw error;
      if (!data) throw new Error("Feed vazio");

      console.log("LOG  Fetched data from insights-feed:", data);

      const heroRaw = data.hero ?? null;
      const catsRaw = data.categories ?? {};

      // Hero
      const hero = heroRaw
        ? { ...heroRaw, imageUrl: heroRaw.imageUrl || DEFAULT_INSIGHT_IMAGE }
        : null;
      if (hero && hero.imageUrl === DEFAULT_INSIGHT_IMAGE) {
        console.warn(`LOG  Hero is using fallback image: ${hero.id}`);
      }
      console.log("LOG  Hero processed:", hero);

      // Categories
      const categoriesWithImages: Record<string, InsightItem[]> = {};
      Object.keys(catsRaw).forEach((cat) => {
        categoriesWithImages[cat] = catsRaw[cat].map((item) => {
          const finalImage = item.imageUrl || DEFAULT_INSIGHT_IMAGE;
          if (!item.imageUrl) {
            console.warn(`LOG  Item using fallback image [${cat}]: ${item.id}`);
          }
          return { ...item, imageUrl: finalImage };
        });
      });
      console.log("LOG  Categories processed:", categoriesWithImages);

      setCategories(categoriesWithImages);

      // Insight do dia
      if (hero) {
        setInsightOfDay({
          title: hero.title,
          subtitle: hero.subtitle || hero.description || "",
        });
      }

      const allItems = dedupeById(Object.values(categoriesWithImages).flat());

      const todayItems = allItems
        .filter((item) => !hero || item.id !== hero.id)
        .sort(
          (a, b) =>
            new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        )
        .slice(0, 5);
      setToday(todayItems);

      const highlightBase = hero ? dedupeById([...allItems, hero]) : allItems;
      const highlightItems = highlightBase
        .sort((a, b) => (b.impactScore ?? 0) - (a.impactScore ?? 0))
        .slice(0, 3);
      setHighlights(highlightItems);

      const trendGroups: InsightGroup[] = Object.keys(categoriesWithImages).map(
        (cat) => ({
          category: cat,
          articles: dedupeById(categoriesWithImages[cat]).slice(0, 3),
        })
      );
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

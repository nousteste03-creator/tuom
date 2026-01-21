import { useCallback, useEffect, useMemo, useState } from "react";
import { ImageSourcePropType } from "react-native";
import { supabase } from "@/lib/supabase";

// fallback RN-safe
const FALLBACK_IMAGE: ImageSourcePropType =
  require("../assets/images/insights-fallback.png");

export type ImpactLevel = "low" | "medium" | "high";

export interface InsightItem {
  id: string;
  title: string;
  summary?: string;
  image: ImageSourcePropType;
  url?: string;
  category: string;
  impactLevel: ImpactLevel;
  impactScore: number;
  priorityScore: number;
  publishedAt: string;
  trendKey?: string;
}

export interface HeroInsight {
  id: string;
  title: string;
  description?: string;
  image: ImageSourcePropType;
  url?: string;
  category: string;
  impactLevel: ImpactLevel;
  impactScore: number;
  publishedAt: string;
}

interface InsightsFeedResponse {
  meta: {
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  hero: (Omit<HeroInsight, "image"> & { imageUrl?: string }) | null;
  items: (Omit<InsightItem, "image"> & { imageUrl?: string })[];
}

/**
 * 🎯 NORMALIZAÇÃO CENTRAL DE CATEGORIA
 */
function normalizeCategory(raw?: string) {
  if (!raw) return "Finanças";

  const key = raw.toLowerCase();

  if (
    key.includes("econom") ||
    key.includes("mercado") ||
    key.includes("finan")
  ) {
    return "Finanças";
  }

  if (key.includes("negó")) {
    return "Negócios";
  }

  return "Finanças";
}

export function useInsightsFeed() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [hero, setHero] = useState<HeroInsight | null>(null);
  const [items, setItems] = useState<InsightItem[]>([]);

  const [selectedCategory, setSelectedCategory] =
    useState<string>("all");

  const categories = ["all", "Finanças", "Negócios"];

  const fetchInsights = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token)
        throw new Error("Usuário não autenticado");

      const { data, error } =
        await supabase.functions.invoke<InsightsFeedResponse>(
          "insights-feed",
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

      if (error) throw error;
      if (!data) throw new Error("Insights feed vazio");

      // HERO
      setHero(
        data.hero
          ? {
              ...data.hero,
              category: normalizeCategory(data.hero.category),
              image: data.hero.imageUrl
                ? { uri: data.hero.imageUrl }
                : FALLBACK_IMAGE,
            }
          : null
      );

      // ITEMS
      setItems(
        data.items.map((item) => ({
          ...item,
          category: normalizeCategory(item.category),
          image: item.imageUrl
            ? { uri: item.imageUrl }
            : FALLBACK_IMAGE,
        }))
      );
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

  // ✅ FILTRO FUNCIONAL DE VERDADE
  const filteredItems = useMemo(() => {
    if (selectedCategory === "all") return items;
    return items.filter(
      (item) => item.category === selectedCategory
    );
  }, [items, selectedCategory]);

  return {
    loading,
    error,
    hero,
    items: filteredItems,
    categories,
    selectedCategory,
    setSelectedCategory,
    refresh: fetchInsights,
  };
}

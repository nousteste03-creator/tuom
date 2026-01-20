import { useCallback, useEffect, useMemo, useState } from "react";
import { ImageSourcePropType } from "react-native";
import { supabase } from "@/lib/supabase";

// ✅ fallback RN-safe (asset local)
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
    categories: string[];
  };
  hero: ({
    imageUrl?: string;
  } & Omit<HeroInsight, "image">) | null;
  items: ({
    imageUrl?: string;
  } & Omit<InsightItem, "image">)[];
}

export function useInsightsFeed() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [hero, setHero] = useState<HeroInsight | null>(null);
  const [items, setItems] = useState<InsightItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const fetchInsights = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 🔐 pega sessão atual
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;
      if (!session?.access_token)
        throw new Error("Usuário não autenticado");

      // 🔐 chama Edge Function com Authorization
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

      // -----------------------------
      // Normalização + fallback
      // -----------------------------
      setHero(
        data.hero
          ? {
              ...data.hero,
              image: data.hero.imageUrl
                ? { uri: data.hero.imageUrl }
                : FALLBACK_IMAGE,
            }
          : null
      );

      setItems(
        data.items.map((item) => ({
          ...item,
          image: item.imageUrl
            ? { uri: item.imageUrl }
            : FALLBACK_IMAGE,
        }))
      );

      setCategories(["all", ...data.meta.categories]);
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

  const filteredItems = useMemo(() => {
    if (selectedCategory === "all") return items;
    return items.filter((item) => item.category === selectedCategory);
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

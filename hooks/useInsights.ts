import { useEffect, useState } from "react";

type TrendGroup = {
  category: string;
  articles: any[];
};

export function useInsights() {
  const [loading, setLoading] = useState(true);

  const [insightOfDay] = useState({
    title: "A assinatura silenciosa que custa mais que seu aluguel.",
    subtitle: "Alguns hábitos custam caro porque se repetem.",
  });

  const [today, setToday] = useState<any[]>([]);
  const [highlights, setHighlights] = useState<any[]>([]);
  const [trends, setTrends] = useState<TrendGroup[]>([]);

  const BASE = process.env.EXPO_PUBLIC_SUPABASE_FUNCTIONS_URL!;
  const ANON = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

  const DEFAULT_TRENDS: TrendGroup[] = [
    { category: "Finanças", articles: [] },
    { category: "Negócios", articles: [] },
    { category: "Tecnologia & IA", articles: [] },
  ];

  const DEBUG = true;
  const log = (...a: any[]) => DEBUG && console.log("[INSIGHTS]", ...a);

  async function fetchSafe(path: string) {
    try {
      const url = `${BASE}${path}`;
      log("FETCH →", url);

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${ANON}`,
        },
      });

      log("STATUS ←", res.status);

      if (!res.ok) return null;

      return await res.json();
    } catch (e) {
      log("ERROR ←", e);
      return null;
    }
  }

  async function load() {
    setLoading(true);

    const [todayRes, highlightsRes, trendsRes] = await Promise.all([
      fetchSafe("/news/today"),
      fetchSafe("/news/highlights"),
      fetchSafe("/news/trends"),
    ]);

    setToday(todayRes?.news ?? []);
    setHighlights(highlightsRes?.highlights ?? []);
    setTrends(
      Array.isArray(trendsRes?.trends) ? trendsRes.trends : DEFAULT_TRENDS
    );

    log("TODAY →", todayRes?.news?.length ?? 0);
    log("HIGHLIGHTS →", highlightsRes?.highlights?.length ?? 0);
    log(
      "TRENDS →",
      (trendsRes?.trends ?? []).map((t: any) => ({
        category: t.category,
        count: t.articles.length,
      }))
    );

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  return {
    loading,
    insightOfDay,
    today,
    highlights,
    trends,
    reload: load,
  };
}

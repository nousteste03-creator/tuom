import { useEffect, useState } from "react";

/**
 * HOOK OFICIAL DO MÓDULO INSIGHTS (MARKETAUX ONLY)
 *
 * Endpoints:
 * - /news/today   → top 20
 * - /news/events  → top 40
 * - /news/trends  → finanças / negócios / tecnologia
 */

export function useInsights() {
  const [loading, setLoading] = useState(true);

  // HERO estático até Pila gerar automaticamente
  const [insightOfDay] = useState({
    title: "A assinatura silenciosa que custa mais que seu aluguel.",
    subtitle: "Alguns hábitos custam caro porque se repetem.",
  });

  const [today, setToday] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [trends, setTrends] = useState<any[]>([]);

  // ENDPOINT BASE
  const BASE = "https://kurselrfgbnyhnmrlltq.functions.supabase.co";
  const ANON = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

  // fallback p/ nunca quebrar a UI
  const DEFAULT_TRENDS = [
    { category: "Finanças", articles: [] },
    { category: "Negócios", articles: [] },
    { category: "Tecnologia & IA", articles: [] },
  ];

  /* ---------------------- FETCHERS ---------------------- */

  async function fetchToday() {
    try {
      const res = await fetch(`${BASE}/news/today`, {
        headers: { Authorization: `Bearer ${ANON}` },
      });
      const json = await res.json();
      return json.news ?? [];
    } catch {
      return [];
    }
  }

  async function fetchEvents() {
    try {
      const res = await fetch(`${BASE}/news/events`, {
        headers: { Authorization: `Bearer ${ANON}` },
      });
      const json = await res.json();
      return json.events ?? [];
    } catch {
      return [];
    }
  }

  async function fetchTrends() {
    try {
      const res = await fetch(`${BASE}/news/trends`, {
        headers: { Authorization: `Bearer ${ANON}` },
      });
      const json = await res.json();
      return json.trends ?? DEFAULT_TRENDS;
    } catch {
      return DEFAULT_TRENDS;
    }
  }

  /* ---------------------- LOAD ALL ---------------------- */

  async function load() {
    setLoading(true);

    const [todayRes, eventsRes, trendsRes] = await Promise.all([
      fetchToday(),
      fetchEvents(),
      fetchTrends(),
    ]);

    setToday(todayRes);
    setEvents(eventsRes);

    // trends sempre precisa 3 grupos
    setTrends(
      Array.isArray(trendsRes) && trendsRes.length === 3
        ? trendsRes
        : DEFAULT_TRENDS
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
    events,
    trends,
    reload: load,
  };
}

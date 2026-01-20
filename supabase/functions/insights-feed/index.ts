import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import {
  getTimeWeight,
  getSourceWeight,
  getCategoryWeight,
  getFrequencyWeight,
  generateTrendKey,
} from "./_heuristics.ts";

import { calculateImpactScore } from "./_impact.ts";

type InsightRow = {
  id: string;
  title: string | null;
  summary: string | null;
  link: string | null;
  image_url: string | null;
  category: string | null;
  published_at: string | null;
};

serve(async (req) => {
  try {
    // -----------------------------
    // Auth (mantido)
    // -----------------------------
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    // -----------------------------
    // Params
    // -----------------------------
    const url = new URL(req.url);
    const limit = Math.min(Number(url.searchParams.get("limit") || 20), 50);
    const offset = Number(url.searchParams.get("offset") || 0);

    // -----------------------------
    // Supabase
    // -----------------------------
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // -----------------------------
    // Fetch
    // -----------------------------
    const { data, error } = await supabase
      .from("insight_items")
      .select("*")
      .order("published_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // -----------------------------
    // Normalização + Heurísticas
    // -----------------------------
    const now = new Date();

    const items = (data ?? []).map((row: InsightRow) => {
      // 🔒 published_at seguro
      const publishedAt =
        row.published_at && !isNaN(Date.parse(row.published_at))
          ? new Date(row.published_at)
          : now;

      // 🔒 title nunca nulo
      const safeTitle = row.title?.trim() || "Insight";

      // 🔒 pesos 100% seguros (MVP)
      const timeWeight = getTimeWeight(publishedAt.toISOString());
      const sourceWeight = getSourceWeight({ impact_default: 0.6 });
      const categoryWeight = getCategoryWeight(row.category);
      const frequencyWeight = getFrequencyWeight(1);

      const impactScore = calculateImpactScore({
        time: timeWeight,
        source: sourceWeight,
        category: categoryWeight,
        frequency: frequencyWeight,
      });

      const impactLevel: "low" | "medium" | "high" =
        impactScore >= 70 ? "high" : impactScore >= 40 ? "medium" : "low";

      const priorityScore = Math.round(impactScore * 10 + timeWeight * 10);

      return {
        id: row.id,
        title: safeTitle,
        summary: row.summary,
        imageUrl: row.image_url ?? undefined,
        url: row.link ?? undefined,
        category: row.category?.toLowerCase() ?? "geral",
        impactScore,
        impactLevel,
        priorityScore,
        publishedAt: publishedAt.toISOString(),
        trendKey: generateTrendKey(safeTitle),
      };
    });

    // -----------------------------
    // Ordenação final
    // -----------------------------
    items.sort((a, b) => b.priorityScore - a.priorityScore);

    // -----------------------------
    // Hero automático
    // -----------------------------
    const heroCandidate =
      items.find(
        (i) =>
          i.impactLevel === "high" &&
          Date.now() - new Date(i.publishedAt).getTime() <=
            24 * 60 * 60 * 1000
      ) ?? items[0] ?? null;

    const hero = heroCandidate
      ? {
          id: heroCandidate.id,
          title: heroCandidate.title,
          description: heroCandidate.summary ?? "",
          imageUrl: heroCandidate.imageUrl,
          url: heroCandidate.url,
          category: heroCandidate.category,
          impactLevel: heroCandidate.impactLevel,
          impactScore: heroCandidate.impactScore,
          publishedAt: heroCandidate.publishedAt,
        }
      : null;

    // Remove hero da lista
    const listItems = hero
      ? items.filter((i) => i.id !== hero.id)
      : items;

    // -----------------------------
    // Categories metadata
    // -----------------------------
    const categories = Array.from(
      new Set(listItems.map((i) => i.category))
    );

    // -----------------------------
    // Response
    // -----------------------------
    return new Response(
      JSON.stringify({
        meta: {
          limit,
          offset,
          hasMore: listItems.length === limit,
          categories,
        },
        hero,
        items: listItems,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("insights-feed error:", err);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: err instanceof Error ? err.message : String(err),
      }),
      { status: 500 }
    );
  }
});

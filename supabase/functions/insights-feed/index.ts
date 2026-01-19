import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type InsightRow = {
  id: string;
  title: string;
  summary: string | null;
  link: string | null;
  image_url: string | null;
  category: string | null;
  impact_level: "low" | "medium" | "high" | null;
  impact_score: number;
  published_at: string | null;
};

serve(async (req) => {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader)
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401 }
      );

    const url = new URL(req.url);
    const limitParam = Number(url.searchParams.get("limit") || 20);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY)
      throw new Error("Missing Supabase env variables");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    let query = supabase
      .from("insight_items")
      .select("*")
      .order("impact_score", { ascending: false })
      .order("published_at", { ascending: false })
      .limit(limitParam);

    const { data, error } = await query;
    if (error) throw error;

    const rows: InsightRow[] = (data ?? []).map((row: any) => {
      const published = row.published_at
        ? new Date(row.published_at)
        : new Date();

      const impact_score = row.impact_score ?? 5;
      let impact_level: "low" | "medium" | "high" = "low";
      if (impact_score >= 8) impact_level = "high";
      else if (impact_score >= 5) impact_level = "medium";

      return { ...row, impact_score, impact_level, published_at: published.toISOString() };
    });

    // --- Hero automático pelo maior impact_score ---
    const heroRow = rows.reduce(
      (prev, curr) => (curr.impact_score > (prev?.impact_score ?? 0) ? curr : prev),
      rows[0] || null
    );
    const hero = heroRow
      ? {
          id: heroRow.id,
          title: heroRow.title,
          subtitle: heroRow.summary ?? "",
          description: heroRow.summary ?? "",
          imageUrl: heroRow.image_url ?? undefined,
          url: heroRow.link ?? undefined,
          category: heroRow.category?.toLowerCase() ?? "geral",
          impactLevel: heroRow.impact_level,
          impactScore: heroRow.impact_score,
          publishedAt: heroRow.published_at,
        }
      : null;

    // --- Agrupamento por categoria com normalização ---
    const categories: Record<string, any[]> = {};
    rows.forEach((row) => {
      const cat = row.category?.toLowerCase() ?? "geral";
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push({
        id: row.id,
        title: row.title,
        description: row.summary ?? "",
        imageUrl: row.image_url ?? undefined,
        url: row.link ?? undefined,
        category: cat,
        impactLevel: row.impact_level,
        impactScore: row.impact_score,
        publishedAt: row.published_at,
      });
    });

    console.log("LOG  Hero:", hero);
    console.log("LOG  Categories:", categories);

    const nextCursor = rows.length > 0 ? rows[rows.length - 1].published_at : null;

    return new Response(
      JSON.stringify({ hero, categories, nextCursor }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("insights-feed fatal error:", err);
    return new Response(
      JSON.stringify({
        error: "Internal error",
        details: err instanceof Error ? err.message : JSON.stringify(err),
      }),
      { status: 500 }
    );
  }
});

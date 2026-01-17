// supabase/functions/insights-feed/index.ts
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
  published_at: string;
};

serve(async (req) => {
  try {
    // 🔐 Auth obrigatória (anon funciona)
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401 }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    // -----------------------------
    // Buscar insights publicados
    // -----------------------------
    const { data, error } = await supabase
      .from("insights")
      .select(`
        id,
        title,
        summary,
        link,
        image_url,
        category,
        impact_level,
        published_at
      `)
      .order("published_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("DB error:", error);
      throw error;
    }

    const rows: InsightRow[] = data ?? [];

    // -----------------------------
    // Hero (primeiro de alto impacto)
    // -----------------------------
    const heroRow =
      rows.find((r) => r.impact_level === "high") ?? rows[0] ?? null;

    const hero = heroRow
      ? {
          id: heroRow.id,
          title: heroRow.title,
          subtitle: heroRow.summary ?? "",
          description: heroRow.summary ?? "",
          imageUrl: heroRow.image_url ?? undefined,
          url: heroRow.link ?? undefined,
          category: heroRow.category ?? "Geral",
          impactLevel: heroRow.impact_level,
          publishedAt: heroRow.published_at,
        }
      : null;

    // -----------------------------
    // Agrupar por categoria
    // -----------------------------
    const categories: Record<string, any[]> = {};

    rows.forEach((row) => {
      const cat = row.category ?? "Geral";
      if (!categories[cat]) categories[cat] = [];

      categories[cat].push({
        id: row.id,
        title: row.title,
        description: row.summary ?? "",
        imageUrl: row.image_url ?? undefined,
        url: row.link ?? undefined,
        category: cat,
        impactLevel: row.impact_level,
        impactScore:
          row.impact_level === "high"
            ? 3
            : row.impact_level === "medium"
            ? 2
            : 1,
        publishedAt: row.published_at,
      });
    });

    // -----------------------------
    // Resposta FINAL
    // -----------------------------
    return new Response(
      JSON.stringify({
        hero,
        categories,
        nextCursor: null,
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
        error: "Internal error",
        details: String(err),
      }),
      { status: 500 }
    );
  }
});

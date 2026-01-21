// supabase/functions/rss-ingest/index.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Parser from "https://esm.sh/rss-parser@3.13.0";

type SourceRow = {
  id: string;
  name: string;
  rss_url: string;
  is_active: boolean;
  category_default: string | null;
  impact_default: number | null;
};

function getQueryParam(url: string, key: string) {
  const u = new URL(url);
  return u.searchParams.get(key);
}

function safeText(x: unknown) {
  return typeof x === "string" ? x.trim() : null;
}

function extractImage(item: any): string | null {
  // 1) enclosure (muito comum)
  const encUrl = item?.enclosure?.url;
  if (typeof encUrl === "string" && encUrl.startsWith("http")) return encUrl;

  // 2) media:content (alguns feeds)
  const media = item?.["media:content"]?.["$"]?.url || item?.["media:content"]?.url;
  if (typeof media === "string" && media.startsWith("http")) return media;

  // 3) content com <img>
  const html = item?.content || item?.["content:encoded"] || "";
  if (typeof html === "string") {
    const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (m?.[1]?.startsWith("http")) return m[1];
  }

  // 4) itunes:image (podcast/alguns)
  const itunes = item?.itunes?.image;
  if (typeof itunes === "string" && itunes.startsWith("http")) return itunes;

  return null;
}

function computeWeights(item: {
  published_at: string;
  source_weight?: number;
  category?: string | null;
}) {
  // time_weight simples: mais recente, mais forte (até 7 dias)
  const now = Date.now();
  const pub = new Date(item.published_at).getTime();
  const ageHours = Math.max(0, (now - pub) / 36e5);
  const time_weight = Math.max(0.4, 1.2 - ageHours / (24 * 7)); // cai ao longo de 7 dias

  const category_weight =
    item.category === "Finanças" ? 1.15 :
    item.category === "Negócios" ? 1.05 :
    1.0;

  const source_weight = 1.0;

  return { time_weight, category_weight, source_weight };
}

function impactLevel(score: number) {
  if (score >= 80) return "high";
  if (score >= 50) return "medium";
  return "low";
}

Deno.serve(async (req) => {
  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const INSIGHTS_CRON_SECRET = Deno.env.get("INSIGHTS_CRON_SECRET")!;

    const authHeader = req.headers.get("authorization") || "";
    const cronHeader = req.headers.get("x-cron-secret") || "";

    // Permite:
    // - Cron via x-cron-secret
    // - Ou chamada manual autenticada via Bearer (se você quiser manter)
    const isCron = cronHeader && cronHeader === INSIGHTS_CRON_SECRET;
    const isBearer = authHeader.toLowerCase().startsWith("bearer ");

    if (!isCron && !isBearer) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const dryRun = getQueryParam(req.url, "dry_run") === "true";

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: sources, error: srcErr } = await supabase
      .from("insight_sources")
      .select("id,name,rss_url,is_active,category_default,impact_default")
      .eq("is_active", true);

    if (srcErr) throw srcErr;
    const parser = new Parser({ timeout: 15000 });

    const results: any[] = [];
    let totalFetched = 0;
    let totalInserted = 0;

    for (const source of (sources as SourceRow[])) {
      let fetched = 0;
      let inserted = 0;

      try {
        const feed = await parser.parseURL(source.rss_url);
        fetched = feed.items?.length ?? 0;
        totalFetched += fetched;

        const normalized = (feed.items || [])
          .map((it: any) => {
            const link = safeText(it.link) || safeText(it.guid);
            if (!link) return null;

            const published =
              safeText(it.isoDate) ||
              safeText(it.pubDate) ||
              new Date().toISOString();

            const title = safeText(it.title);
            const summary = safeText(it.contentSnippet) || safeText(it.content);

            const image_url = extractImage(it);

            // pesos e score
            const w = computeWeights({
              published_at: published,
              category: source.category_default,
            });

            const baseImpact = Math.round(((source.impact_default ?? 0.5) * 100));
            const impact_score = Math.max(0, Math.min(100, baseImpact));

            const priority_score = Math.round(
              impact_score * w.time_weight * w.category_weight * w.source_weight
            );

            return {
              source_id: source.id,
              title,
              summary,
              link,
              url: link, // se você ainda usa url na UI
              image_url,
              published_at: published,
              category: source.category_default ?? "Finanças",
              impact_score,
              impact_level: impactLevel(impact_score),
              time_weight: w.time_weight,
              category_weight: w.category_weight,
              source_weight: w.source_weight,
              frequency_weight: 1,
              priority_score,
            };
          })
          .filter(Boolean);

        // Dedup no banco via UNIQUE(link)
        if (!dryRun && normalized.length) {
          // upsert com onConflict link para não quebrar em feeds que republicam
          const { data, error } = await supabase
            .from("insight_items")
            .upsert(normalized as any[], { onConflict: "link", ignoreDuplicates: true })
            .select("id");

          if (error) throw error;
          inserted = data?.length ?? 0;
          totalInserted += inserted;
        }

        // log success
        if (!dryRun) {
          await supabase.from("insight_ingest_logs").insert({
            source_id: source.id,
            status: "success",
            items_fetched: fetched,
            items_inserted: inserted,
          });
        }

        results.push({
          source: source.name,
          fetched,
          inserted,
          dry_run: dryRun,
        });
      } catch (err: any) {
        // log error
        if (!dryRun) {
          await supabase.from("insight_ingest_logs").insert({
            source_id: source.id,
            status: "error",
            items_fetched: fetched,
            items_inserted: inserted,
            error_message: err?.message ?? String(err),
          });
        }

        results.push({
          source: source.name,
          fetched,
          inserted,
          error: err?.message ?? String(err),
          dry_run: dryRun,
        });
      }
    }

    return new Response(
      JSON.stringify({
        ok: true,
        dry_run: dryRun,
        total_sources: sources?.length ?? 0,
        total_fetched: totalFetched,
        total_inserted: totalInserted,
        results,
      }),
      { headers: { "content-type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ ok: false, error: err?.message ?? String(err) }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
});

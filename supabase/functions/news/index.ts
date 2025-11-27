// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/x/sift@0.6.0/mod.ts";

const KEY = Deno.env.get("MARKETAUX_KEY");

// normalização
function normalizeArticle(n: any) {
  return {
    id: n.uuid,
    title: n.title,
    description: n.description || n.snippet || "",
    imageUrl: n.image_url || null,
    url: n.url,
    source: n.source || "",
    publishedAt: n.published_at,
    type: "news",
  };
}

async function fetchMarketAux(params: string) {
  const url = `https://api.marketaux.com/v1/news/all?${params}&api_token=${KEY}`;
  const r = await fetch(url);
  const json = await r.json();
  return json.data?.map(normalizeArticle) ?? [];
}

serve({
  "/today": async () => {
    const articles = await fetchMarketAux("language=en,pt&limit=20&countries=us,br");
    return new Response(JSON.stringify({ news: articles }), {
      headers: { "Content-Type": "application/json" },
    });
  },
});

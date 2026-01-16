import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const GNEWS_API = "https://gnews.io/api/v4";
const GNEWS_KEY = Deno.env.get("GNEWS_API_KEY");

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
    },
  });
}

async function gnews(
  endpoint: string,
  params: Record<string, string | undefined>
) {
  const qs = new URLSearchParams({
    ...Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined)
    ),
    token: GNEWS_KEY!,
  });

  const res = await fetch(`${GNEWS_API}/${endpoint}?${qs}`);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GNews error ${res.status}: ${text}`);
  }

  const data = await res.json();

  return (data.articles ?? []).map((a: any) => ({
    id: a.url,
    title: a.title,
    description: a.description,
    imageUrl: a.image,
    url: a.url,
    source: a.source?.name,
    publishedAt: a.publishedAt,
  }));
}

serve(async (req) => {
  if (!GNEWS_KEY) {
    return json({ error: "Missing GNEWS_API_KEY" }, 500);
  }

  const url = new URL(req.url);
  const path = url.pathname;

  const lang = url.searchParams.get("lang") ?? "en";
  const country = url.searchParams.get("country") ?? "us";

  /* ---------------- TODAY ---------------- */
  if (path.endsWith("/today")) {
    const news = await gnews("top-headlines", {
      lang,
      country,
      max: "10",
    });

    return json({ news });
  }

  /* ---------------- HIGHLIGHTS ---------------- */
  if (path.endsWith("/highlights")) {
    const highlights = await gnews("top-headlines", {
      lang,
      country,
      max: "25",
    });

    return json({ highlights });
  }

  /* ---------------- TRENDS ---------------- */
  if (path.endsWith("/trends")) {
    const categories = [
      { category: "Finanças", q: "finance OR economy" },
      { category: "Negócios", q: "business OR companies" },
      { category: "Tecnologia & IA", q: "technology OR artificial intelligence" },
    ];

    const trends = await Promise.all(
      categories.map(async (c) => ({
        category: c.category,
        articles: await gnews("search", {
          q: c.q,
          lang,
          country,
          max: "6",
        }),
      }))
    );

    return json({ trends });
  }

  return json({ error: "Not found" }, 404);
});

// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

/**
 * NEWS ENGINE — Marketaux Only (Premium Mode Ready)
 *
 * Fontes:
 * - Marketaux (focado em business + finance)
 *
 * Endpoints:
 * - /news/today   → 20 principais
 * - /news/events  → 40 principais
 * - /news/trends  → separados por Finanças / Negócios / Tecnologia
 */

const MARKET_KEY = Deno.env.get("MARKETAUX_API_KEY");

console.log("Marketaux Loaded:", !!MARKET_KEY);

/* ---------------------- TYPES ---------------------- */

type Article = {
  id: string | number;
  title: string;
  description: string;
  imageUrl: string | null;
  url: string;
  source: string;
  publishedAt: string;
  type: "news";
};

/* ---------------------- HELPERS ---------------------- */

const TOPIC_KEYWORDS = [
  "finance",
  "financial",
  "economy",
  "economic",
  "market",
  "markets",
  "stock",
  "stocks",
  "equity",
  "investment",
  "investor",
  "startup",
  "startups",
  "business",
  "company",
  "companies",
  "earnings",
  "revenue",
  "tech",
  "technology",
  "software",
  "ai",
  "artificial intelligence",
  "machine learning",
];

function matchesTopics(a: Article): boolean {
  const text = `${a.title} ${a.description}`.toLowerCase();
  return TOPIC_KEYWORDS.some((kw) => text.includes(kw));
}

function normalize(raw: any): Article | null {
  try {
    return {
      id: raw.uuid ?? crypto.randomUUID(),
      title: raw.title ?? "",
      description: raw.description ?? raw.snippet ?? "",
      imageUrl: raw.image_url ?? null,
      url: raw.url,
      source: raw.source ?? "Marketaux",
      publishedAt: raw.published_at ?? new Date().toISOString(),
      type: "news",
    };
  } catch {
    return null;
  }
}

function dedupe(list: Article[]): Article[] {
  const map = new Map<string, Article>();

  for (const a of list) {
    const key = a.url || a.title;
    if (!map.has(key)) map.set(key, a);
  }

  return Array.from(map.values()).sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

/* ---------------------- FETCHER ---------------------- */

async function fetchMarketaux(limit: number): Promise<Article[]> {
  if (!MARKET_KEY) return [];

  try {
    const url =
      `https://api.marketaux.com/v1/news/all` +
      `?language=en&countries=us` +
      `&filter_entities=true` +
      `&limit=${limit}` +
      `&api_token=${MARKET_KEY}`;

    const res = await fetch(url);
    const json = await res.json();

    const arr = Array.isArray(json.data) ? json.data : [];
    const mapped = arr
      .map((n: any) => normalize(n))
      .filter((a): a is Article => !!a && matchesTopics(a));

    return mapped;
  } catch (e) {
    console.error("Marketaux ERROR:", e);
    return [];
  }
}

/* ---------------------- BUILD FEED ---------------------- */

async function buildFeed() {
  // Free Mode = 3 / PRO Mode = 50
  const limit = MARKET_KEY ? 50 : 3;

  const raw = await fetchMarketaux(limit);

  // remove lixo / notícias locais / irrelevantes
  const clean = raw.filter(
    (a) =>
      a.title &&
      a.url &&
      !/brasil|latam|niter[oó]i|prefeitura|vereador|banheiro|rio de janeiro/i.test(
        `${a.title} ${a.description}`
      )
  );

  return dedupe(clean);
}

/* ---------------------- HANDLERS ---------------------- */

async function handleToday() {
  const feed = await buildFeed();
  return Response.json({ news: feed.slice(0, 20) });
}

async function handleEvents() {
  const feed = await buildFeed();
  return Response.json({ events: feed.slice(0, 40) });
}

async function handleTrends() {
  const feed = await buildFeed();

  const trends = [
    {
      category: "Finanças",
      articles: feed.filter((a) =>
        /finance|economy|stock|market|invest/i.test(
          `${a.title} ${a.description}`
        )
      ).slice(0, 15),
    },
    {
      category: "Negócios",
      articles: feed.filter((a) =>
        /business|startup|company|revenue|earnings/i.test(
          `${a.title} ${a.description}`
        )
      ).slice(0, 15),
    },
    {
      category: "Tecnologia & IA",
      articles: feed.filter((a) =>
        /tech|technology|ai|software|chip|cloud/i.test(
          `${a.title} ${a.description}`
        )
      ).slice(0, 15),
    },
  ];

  return Response.json({ trends });
}

/* ---------------------- ROUTER ---------------------- */

serve(async (req) => {
  const path = new URL(req.url).pathname;

  if (path.endsWith("/today")) return handleToday();
  if (path.endsWith("/events")) return handleEvents();
  if (path.endsWith("/trends")) return handleTrends();

  return new Response("Not found", { status: 404 });
});

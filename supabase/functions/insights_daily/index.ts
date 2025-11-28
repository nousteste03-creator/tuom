/*  INSIGHTS_DAILY — versão final com MERCURY PARSER + GROQ
 *
 * Agora funciona 100% real:
 * - Coleta 5 notícias por categoria (Marketaux)
 * - Extrai conteúdo com Mercury (funciona em 90% dos sites modernos)
 * - Gera análise densa via Groq
 * - Retorna JSON limpo para o app
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// ENV KEYS
const MARKET_KEY = Deno.env.get("MARKETAUX_API_KEY")!;
const GROQ_KEY = Deno.env.get("GROQ_API_KEY")!;

// Categorias oficiais
const CATEGORIES = [
  { id: "Finanças", query: "finance" },
  { id: "Negócios", query: "business" },
  { id: "Tecnologia", query: "technology" },
  { id: "Mercado", query: "markets" },
];

// ---------------------------
// 1) Marketaux
// ---------------------------
async function getMarketauxNews(query: string) {
  const url =
    `https://api.marketaux.com/v1/news/all?` +
    `filter_entities=true&language=pt,en&countries=br,us` +
    `&limit=5&topics=${query}&api_token=${MARKET_KEY}`;

  try {
    const r = await fetch(url);
    const json = await r.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

// ---------------------------
// 2) MERCURY PARSER
// ---------------------------
async function extractText(url: string) {
  try {
    const mercuryURL =
      "https://mercury-parser-api.vercel.app/api?url=" +
      encodeURIComponent(url);

    const r = await fetch(mercuryURL);
    const data = await r.json();

    if (!data?.content) return "";

    const clean = data.content
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 2000);

    return clean;
  } catch {
    return "";
  }
}

// ---------------------------
// 3) GROQ — análise IA
// ---------------------------
async function analyzeWithGroq(category: string, texts: string[]) {
  const prompt = `
Analise as notícias abaixo e produza um relatório de mercado para a categoria "${category}".
Responda SOMENTE em JSON válido:

{
 "sentiment_percent": número entre -10 e 10,
 "sentiment_label": "otimista" | "neutro" | "cauteloso",
 "summary_pt": "Resumo do dia (3-5 frases)",
 "impact_pt": "Impacto no mercado",
 "highlights": ["ponto 1","ponto 2","ponto 3"]
}

NOTÍCIAS:
${texts.map((t, i) => `${i + 1}) ${t}`).join("\n\n")}
`;

  const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GROQ_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.1-70b-versatile",
      messages: [
        { role: "system", content: "Responda somente JSON válido." },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
    }),
  });

  const json = await r.json();

  try {
    return JSON.parse(json.choices[0].message.content.trim());
  } catch {
    return {
      sentiment_percent: 0,
      sentiment_label: "neutro",
      summary_pt: "Não foi possível gerar análise hoje.",
      impact_pt: "",
      highlights: [],
    };
  }
}

// ---------------------------
// 4) SERVIDOR PRINCIPAL
// ---------------------------
Deno.serve(async () => {
  const final: any[] = [];

  for (const cat of CATEGORIES) {
    // notícias
    const news = await getMarketauxNews(cat.query);

    // scrap Mercury
    const texts = [];
    for (const item of news) {
      texts.push(await extractText(item.url));
    }

    // IA GROQ
    const analysis = await analyzeWithGroq(cat.id, texts);

    final.push({
      category: cat.id,
      articles: news,
      analysis,
    });
  }

  return new Response(JSON.stringify({ status: "ok", insights: final }), {
    headers: { "Content-Type": "application/json" },
  });
});

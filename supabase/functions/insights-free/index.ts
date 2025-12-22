// /supabase/functions/insights-free/index.ts
// TUÖM Invest+ — Insights FREE (DeepSeek)
// Versão final com segurança, filtros e fallback heurístico.

import { serve } from "https://deno.land/std@0.223.0/http/server.ts";

const DEEPSEEK_KEY = Deno.env.get("DEEPSEEK_API_KEY") || "";

/* ==========================================================
   1) Função para chamar DeepSeek com proteção
============================================================ */
async function callDeepSeek(prompt: string): Promise<string> {
  if (!DEEPSEEK_KEY) {
    return "IA indisponível: chave não configurada.";
  }

  const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${DEEPSEEK_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: `
Você é o Analista Técnico Oficial da TUÖM Invest+.

REGRAS ABSOLUTAS:
1. Não faça cálculos. Nunca derive números. Use APENAS os valores enviados.
2. Nunca recomende compra, venda, trade, rebalanceamento ou estratégia.
3. Não especule sobre futuro. Não faça previsões de preço.
4. Não invente fatos, métricas ou dados externos.
5. Não mencione notícias, histórico, empresas ou cenários fora do prompt.
6. Não mencione ser IA ou modelo.
7. Não use emojis. Não use linguagem motivacional.
8. Mantenha tom técnico, objetivo, claro e conciso.
9. Se faltar informação: diga “não há dados suficientes para avaliar”.
10. Não ultrapasse 120 palavras.

ESTILO:
- Preciso, direto, profissional.
- Interpretação, não recomendação.
- Similar a Bloomberg / Apple Finance.
`
        },
        { role: "user", content: prompt }
      ],
    }),
  });

  const json = await response.json();

  if (json.error) {
    return `IA indisponível: ${json.error.message}`;
  }

  const content = json?.choices?.[0]?.message?.content?.trim();
  if (!content || content.length < 10) return "Sem resposta interpretável.";

  return content;
}

/* ==========================================================
   2) Heurísticas determinísticas TUÖM
============================================================ */
function computeHeuristics(projection: any, market: any) {
  const series = projection?.series || [];
  const first = series[0]?.value || 0;
  const last = series.at(-1)?.value || 0;

  const growthTotal = last - first;
  const growthPct = first > 0 ? (growthTotal / first) * 100 : 0;

  const monthlyReturn = series[0]?.monthlyReturn || 0;

  const cdiAnnual = projection?.cdiAnnual || 0;
  const cdiMonthly = Math.pow(1 + cdiAnnual, 1 / 12) - 1;

  const assetTrend =
    market.dailyChangePct > 1
      ? "alta forte"
      : market.dailyChangePct > 0
      ? "alta leve"
      : market.dailyChangePct < -1
      ? "queda forte"
      : "queda leve";

  const volatility =
    market.volatility30d > 5
      ? "alta volatilidade"
      : market.volatility30d > 2
      ? "volatilidade moderada"
      : "baixa volatilidade";

  return {
    first,
    last,
    growthTotal,
    growthPct,
    monthlyReturn,
    cdiMonthly,
    assetTrend,
    volatility,
  };
}

/* ==========================================================
   3) Fallback seguro caso IA falhe
============================================================ */
function fallbackInsight(h: any): string {
  return `
O investimento apresentou crescimento de ${h.growthPct.toFixed(
    1
  )}% no período analisado. O retorno mensal projetado (${(
    h.monthlyReturn * 100
  ).toFixed(2)}%) está próximo do CDI estimado (${(
    h.cdiMonthly * 100
  ).toFixed(2)}%). O ativo mostra ${h.assetTrend}, com ${h.volatility}.
`
    .trim()
    .replace(/\s+/g, " ");
}

/* ==========================================================
   4) Filtro anti-alucinação
============================================================ */
function sanitizeInsight(text: string, h: any): string {
  const forbidden = [
    "compre",
    "venda",
    "recomendo",
    "deve comprar",
    "deve vender",
    "vai subir",
    "vai cair",
    "promete",
    "garante",
    "prever",
    "previsão",
    "100%",
    "certeza",
    "assumir",
    "notícia",
    "rumores",
    "analistas dizem",
  ];

  const lower = text.toLowerCase();

  for (const term of forbidden) {
    if (lower.includes(term)) {
      return fallbackInsight(h);
    }
  }

  return text;
}

/* ==========================================================
   5) Handler principal
============================================================ */
serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, error: "Use POST" }), {
      status: 405,
    });
  }

  try {
    const body = await req.json();
    const heur = computeHeuristics(body.projection, body.market);

    const prompt = `
Interprete os seguintes dados:

• Crescimento total: R$ ${heur.growthTotal.toFixed(2)}
• Crescimento percentual: ${heur.growthPct.toFixed(2)}%
• Retorno mensal projetado: ${(heur.monthlyReturn * 100).toFixed(2)}%
• CDI mensal estimado: ${(heur.cdiMonthly * 100).toFixed(2)}%
• Tendência do ativo: ${heur.assetTrend}
• Volatilidade: ${heur.volatility}

Gere um insight técnico curto seguindo as regras.
    `;

    let insight = await callDeepSeek(prompt);

    // fallback automático
    if (
      insight.includes("IA indisponível") ||
      insight === "Sem resposta interpretável."
    ) {
      insight = fallbackInsight(heur);
    }

    // filtro anti-alucinação
    insight = sanitizeInsight(insight, heur);

    return new Response(
      JSON.stringify({
        ok: true,
        insight,
        heuristics: heur,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: String(err) }),
      { status: 500 }
    );
  }
});

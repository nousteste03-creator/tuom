// /supabase/functions/insights-premium/index.ts
// TUÖM Invest+ — Insight Premium (GPT-4o-mini)
// Versão ULTRA-CVM — Bloqueio total de subjetividade. Fallback imediato.

import { serve } from "https://deno.land/std@0.223.0/http/server.ts";

const OPENAI_KEY = Deno.env.get("OPENAI_API_KEY") || "";

/* ==========================================================
   1) Chamada segura ao GPT-4o-mini
============================================================ */
async function callOpenAI(prompt: string): Promise<string> {
  if (!OPENAI_KEY) return "IA indisponível: chave não configurada.";

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Você opera no modo jurídico/compliance da TUÖM Invest+.

REGRAS ABSOLUTAS:
1. Não fazer cálculos além dos dados fornecidos.
2. Não recomendar compra, venda ou qualquer ação de investimento.
3. Não interpretar, avaliar, julgar ou sugerir desempenho, tendência, risco ou potencial.
4. NÃO usar adjetivos, advérbios opinativos, qualificações subjetivas ou linguagem emocional.
5. NÃO narrar, NÃO criar contexto, NÃO inferir, NÃO especular.
6. NÃO citar notícias, histórico externo ou informações não fornecidas.
7. NÃO mencionar IA, modelo ou limitações.
8. O texto deve ter entre 60 e 110 palavras.
9. Descrever SOMENTE o comportamento numérico e os dados recebidos.

Se divergir disso, o texto será descartado.
`
        },
        { role: "user", content: prompt }
      ],
    }),
  });

  const json = await response.json();
  const content = json?.choices?.[0]?.message?.content?.trim();

  if (!content || content.length < 20) return "Sem resposta interpretável.";
  return content;
}

/* ==========================================================
   2) Heurísticas determinísticas
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
    market.dailyChangePct > 0
      ? "variação diária positiva"
      : market.dailyChangePct < 0
      ? "variação diária negativa"
      : "variação diária neutra";

  const volatility =
    market.volatility30d > 5
      ? "volatilidade elevada"
      : market.volatility30d > 2
      ? "volatilidade moderada"
      : "volatilidade baixa";

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
   3) Fallback jurídico neutro definitivo
============================================================ */
function fallbackInsight(h: any): string {
  return `
Durante o período informado, o valor registrado passou de ${h.first.toFixed(2)} para ${h.last.toFixed(2)}. 
O crescimento total é de ${h.growthTotal.toFixed(2)}, equivalente ao percentual calculado de ${h.growthPct.toFixed(2)}%. 
O retorno mensal informado é ${(h.monthlyReturn * 100).toFixed(2)}%, enquanto o CDI mensal calculado é ${(h.cdiMonthly * 100).toFixed(2)}%. 
A variação diária apresentada é classificada como ${h.assetTrend}, e a volatilidade corresponde ao nível descrito como ${h.volatility}. 
As informações refletem exclusivamente os valores contidos nos dados fornecidos.
  `.trim().replace(/\s+/g, " ");
}

/* ==========================================================
   4) SANITIZE ULTRA NUCLEAR — opinião = fallback imediato
============================================================ */
function sanitizeInsight(text: string, h: any): string {
  const lower = text.toLowerCase();

  /* -------- BLOQUEIO DE TERMOS SUBJETIVOS -------- */
  const bannedWords = [
    "expressiv", "positivo", "positiva", "negativo", "negativa",
    "favorável", "favoravel", "atrativo", "atraente", "vantagem",
    "sutil", "consistente", "robust", "significativ",
    "encorajador", "otimista", "promissor",
    "estável", "estavel", "resiliência", "panorama"
  ];
  for (const w of bannedWords) {
    if (lower.includes(w)) return fallbackInsight(h);
  }

  /* -------- BLOQUEIO UNIVERSAL DE ADJETIVOS -------- */
  if (/\b\w+(ante|ente|oso|osa|ivo|iva|áveis|aveis|ável|avel|ível|ivel|ário|ária)\b/.test(lower)) {
    return fallbackInsight(h);
  }

  /* -------- BLOQUEIO DE ADVÉRBIOS OPINATIVOS -------- */
  if (/\b\w+mente\b/.test(lower)) {
    return fallbackInsight(h);
  }

  /* -------- BLOQUEIO DE "verbo + adjetivo" (interpretação) -------- */
  if (/(crescimento|movimento|panorama|trajetória|cenario|performance|retorno)\s+\w+/.test(lower)) {
    return fallbackInsight(h);
  }

  /* -------- BLOQUEIO DE VERBOS INTERPRETATIVOS -------- */
  if (/(sugere|indica|reflete|demonstra|aponta|implica)/.test(lower)) {
    return fallbackInsight(h);
  }

  /* -------- BLOQUEIO DE FRASES TÍPICAS DE OPINIÃO -------- */
  if (/(em suma|em resumo|em geral|no geral)/.test(lower)) {
    return fallbackInsight(h);
  }

  /* -------- BLOQUEIO DE PALAVRAS EMOCIONAIS -------- */
  if (/(sensação|segurança|confiança|percepção)/.test(lower)) {
    return fallbackInsight(h);
  }

  /* -------- HEURÍSTICA: se houver MAIS DE 0 adjetivos → opinião -------- */
  const adjMatches = lower.match(/\b\w+(ante|ente|oso|osa|ivo|iva|ável|avel|ível|ivel)\b/g);
  if (adjMatches && adjMatches.length >= 1) {
    return fallbackInsight(h);
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
Descrever exclusivamente os dados fornecidos:

• Valor inicial: ${heur.first}
• Valor final: ${heur.last}
• Crescimento total: ${heur.growthTotal}
• Crescimento percentual: ${heur.growthPct}
• Retorno mensal informado: ${(heur.monthlyReturn * 100).toFixed(2)}%
• CDI mensal calculado: ${(heur.cdiMonthly * 100).toFixed(2)}%
• Variação diária: ${heur.assetTrend}
• Volatilidade: ${heur.volatility}

Sem interpretação, sem opinião, sem adjetivos.
    `;

    let insight = await callOpenAI(prompt);

    // fallback imediato se houver qualquer violação
    insight = sanitizeInsight(insight, heur);

    return new Response(
      JSON.stringify({ ok: true, insight, heuristics: heur }),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
    });
  }
});

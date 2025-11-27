/* -------------------------------------------------------
   SENTIMENTO BEM SIMPLES (PT + EN), FUNCIONA COM TITULOS
-------------------------------------------------------- */

const POSITIVE_WORDS = [
  "cresce","aumenta","alta","recorde","melhora","expande",
  "positivo","otimista","ganha","bate","avanço","impulsiona",
  "investimento","sobe","lidera","conquista","forte"
];

const NEGATIVE_WORDS = [
  "cai","queda","baixa","desaba","recua","alerta","crise",
  "negativo","recuo","problema","piora","perde","risco",
  "ameaça","derrota","fraco","falha"
];

export function computeNewsSentiment(items: { title?: string }[]) {
  if (!items || items.length === 0)
    return { score: 0, label: "Neutro" };

  let score = 0;

  for (const item of items) {
    const text = (item.title || "").toLowerCase();

    for (const w of POSITIVE_WORDS) {
      if (text.includes(w)) score += 1;
    }
    for (const w of NEGATIVE_WORDS) {
      if (text.includes(w)) score -= 1;
    }
  }

  const final = Math.max(-5, Math.min(5, score));

  const label =
    final > 1 ? "Positivo"
    : final < -1 ? "Negativo"
    : "Neutro";

  return { score: final, label };
}

export function formatSentimentScore(sentiment: { score: number }) {
  return `${sentiment.score}%`;
}

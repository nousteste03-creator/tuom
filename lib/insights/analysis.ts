// lib/insights/analysis.ts
import type { RemoteNewsItem } from "@/lib/api/news";

export type SentimentLabel = "Otimista" | "Neutro" | "Cauteloso";

export type ImpactTag =
  | "Puxou o índice para cima"
  | "Pressionou o setor"
  | "Impacto moderado";

export type HeadlineInfluence = {
  id: string;
  title: string;
  source: string;
  publishedAt?: string;
  minutesAgo?: number;
  impactTag: ImpactTag;
};

export type CategoryAnalysisResult = {
  score: number;
  sentimentLabel: SentimentLabel;
  sentimentColor: string;
  summaryText: string;
  marketViewText: string;
  topHeadlines: HeadlineInfluence[];
};

const POSITIVE_KEYWORDS = [
  "alta",
  "altas",
  "subiu",
  "sobem",
  "recorde",
  "otimista",
  "otimismo",
  "lucro",
  "ganho",
  "ganhos",
  "cresce",
  "crescem",
  "crescimento",
  "expansão",
  "expande",
  "valorização",
  "acelera",
  "aceleração",
  "investimento",
  "investimentos",
  "captação",
  "captou",
  "avanço",
  "avanços",
];

const NEGATIVE_KEYWORDS = [
  "queda",
  "quedas",
  "cai",
  "caem",
  "despenca",
  "despencam",
  "recuo",
  "recuos",
  "crise",
  "crises",
  "derrota",
  "derrotas",
  "demissão",
  "demissões",
  "prejuízo",
  "prejuízos",
  "perda",
  "perdas",
  "pressão",
  "riscos",
  "risco",
  "alerta",
  "alertas",
  "tensão",
  "tensões",
];

function scoreText(text: string | undefined): number {
  if (!text) return 0;
  const lower = text.toLowerCase();

  let score = 0;

  for (const word of POSITIVE_KEYWORDS) {
    if (lower.includes(word)) score += 1;
  }

  for (const word of NEGATIVE_KEYWORDS) {
    if (lower.includes(word)) score -= 1;
  }

  return score;
}

function normalizeScore(rawScore: number, newsCount: number): number {
  if (newsCount <= 0) return 0;

  const base = (rawScore / newsCount) * 25;
  const clamped = Math.max(-40, Math.min(40, base));
  return Math.round(clamped);
}

function getSentimentLabelAndColor(score: number): {
  label: SentimentLabel;
  color: string;
} {
  if (score > 8) return { label: "Otimista", color: "#4ECB71" };
  if (score < -8) return { label: "Cauteloso", color: "#FF5C5C" };
  return { label: "Neutro", color: "rgba(255,255,255,0.7)" };
}

function buildSummaryText(
  categoryLabel: string,
  sentimentLabel: SentimentLabel
): string {
  if (sentimentLabel === "Otimista") {
    return `A área de ${categoryLabel} mostra um dia otimista. As principais manchetes destacam avanços concretos, impacto corporativo e movimento consistente de interesse. O apetite do mercado se mantém elevado, com perspectiva de alocação crescente no tema ao longo da semana.`;
  }

  if (sentimentLabel === "Cauteloso") {
    return `O ambiente em ${categoryLabel} está mais cauteloso hoje. As manchetes refletem preocupação com riscos, ajustes de expectativa e maior seletividade nas decisões. O mercado observa o tema com atenção, evitando movimentos abruptos enquanto novos dados não são consolidados.`;
  }

  return `O dia em ${categoryLabel} apresenta um quadro neutro. As notícias se dividem entre sinais positivos e pontos de atenção, sem mudança estrutural relevante. O mercado acompanha o tema de forma equilibrada, aguardando gatilhos mais claros antes de reposicionar alocação.`;
}

function buildMarketViewText(
  categoryLabel: string,
  sentimentLabel: SentimentLabel
): string {
  if (sentimentLabel === "Otimista") {
    return `O sentimento positivo observado hoje em ${categoryLabel} favorece projetos de execução consistente e modelos de negócio já validados. Iniciativas ligadas à eficiência operacional e expansão internacional tendem a concentrar o maior interesse. O cenário sugere continuidade no fluxo de capital, com ajustes pontuais conforme novas informações forem surgindo.`;
  }

  if (sentimentLabel === "Cauteloso") {
    return `O tom mais cauteloso em ${categoryLabel} desloca o foco para gestão de risco e preservação de caixa. Empresas com balanços mais robustos e exposição diversificada tendem a se destacar frente às demais. O mercado deve priorizar visibilidade de resultado e governança sólida antes de ampliar qualquer posição relevante nesse tema.`;
  }

  return `Com o cenário neutro em ${categoryLabel}, o mercado tende a manter posições atuais enquanto monitora novos dados. Movimentos mais relevantes devem acontecer apenas diante de resultados, anúncios estratégicos ou mudanças regulatórias específicas. No curto prazo, o comportamento predominante é de observação disciplinada, sem euforia nem pessimismo excessivo.`;
}

function buildImpactTag(score: number): ImpactTag {
  if (score > 0) return "Puxou o índice para cima";
  if (score < 0) return "Pressionou o setor";
  return "Impacto moderado";
}

export function analyzeCategoryNews(
  categoryLabel: string,
  news: RemoteNewsItem[]
): CategoryAnalysisResult {
  if (!news || news.length === 0) {
    return {
      score: 0,
      sentimentLabel: "Neutro",
      sentimentColor: "rgba(255,255,255,0.7)",
      summaryText: `Ainda não há dados suficientes hoje para formar uma leitura consistente sobre ${categoryLabel}. Assim que novas manchetes relevantes forem publicadas, a Pila passa a consolidar a análise automaticamente.`,
      marketViewText:
        "Sem volume de informação adequado, a leitura do mercado permanece neutra, com postura predominantemente observadora.",
      topHeadlines: [],
    };
  }

  let totalScore = 0;
  const perHeadlineScore: { item: RemoteNewsItem; score: number }[] = [];

  for (const item of news) {
    const headlineScore = scoreText(item.title);
    totalScore += headlineScore;
    perHeadlineScore.push({ item, score: headlineScore });
  }

  const normalizedScore = normalizeScore(totalScore, news.length);
  const { label, color } = getSentimentLabelAndColor(normalizedScore);

  const sorted = perHeadlineScore
    .sort((a, b) => Math.abs(b.score) - Math.abs(a.score))
    .slice(0, 3);

  const topHeadlines: HeadlineInfluence[] = sorted.map(({ item, score }) => ({
    id: item.id,
    title: item.title,
    source: item.source ?? "TUÖM Insights",
    publishedAt: item.publishedAt,
    minutesAgo: item.minutesAgo,
    impactTag: buildImpactTag(score),
  }));

  return {
    score: normalizedScore,
    sentimentLabel: label,
    sentimentColor: color,
    summaryText: buildSummaryText(categoryLabel, label),
    marketViewText: buildMarketViewText(categoryLabel, label),
    topHeadlines,
  };
}

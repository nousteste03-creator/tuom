// lib/news/heuristic.ts
// --------------------------------------------------
// HEURÍSTICO PREMIUM — Resumo estilo Apple News
// --------------------------------------------------

export function detectCategory(title: string): string {
  const t = title.toLowerCase();

  if (/crypto|bitcoin|ethereum|blockchain/.test(t)) return "crypto";
  if (/stocks|market|shares|índice|bolsa|wall street|s&p/.test(t)) return "market";
  if (/economy|inflation|juros|economia/.test(t)) return "economy";
  if (/startup|tech startup|seed|venture/.test(t)) return "startups";
  if (/ai |artificial intelligence|inteligência artificial/.test(t)) return "ai";
  if (/microsoft|apple|google|amazon|meta|technology/.test(t)) return "technology";
  if (/energia|oil|gas|petro|energy/.test(t)) return "energy";
  if (/politics|election|governo|presidente/.test(t)) return "politics";

  return "general";
}

export function generateHeuristicSummary(title?: string): string {
  if (!title) return "";

  const category = detectCategory(title);

  const base = {
    market:
      "A matéria aborda movimentos relevantes no mercado financeiro, refletindo o sentimento dos investidores e possíveis desdobramentos no curto prazo.",
    economy:
      "O conteúdo destaca aspectos importantes do cenário econômico, indicando impactos sobre consumo, atividade e decisões políticas.",
    startups:
      "A notícia envolve avanços no ambiente de inovação e negócios, mostrando tendências que moldam o setor de tecnologia e empreendedorismo.",
    ai:
      "A matéria evidencia discussões sobre inteligência artificial e sua influência crescente em produtos, empresas e comportamento de mercado.",
    technology:
      "O conteúdo trata de movimentos importantes no setor de tecnologia, envolvendo empresas globais e tendências que afetam o cotidiano digital.",
    crypto:
      "A notícia aborda temas relevantes do universo cripto, destacando oscilações, regulações e fatores que influenciam o apetite ao risco.",
    energy:
      "O conteúdo discute pontos essenciais sobre energia, combustíveis e impactos no ambiente global e econômico.",
    politics:
      "A matéria envolve decisões e movimentos políticos que podem influenciar economia, mercado e relações internacionais.",
    general:
      "A notícia traz pontos relevantes do cenário global, refletindo temas que impactam discussões econômicas, sociais ou tecnológicas.",
  };

  const closure =
    " A matéria oferece contexto adicional sobre o cenário atual e suas possíveis implicações.";

  return base[category] + closure;
}

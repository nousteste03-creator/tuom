/**
 * Hero Copy — TUÖM
 *
 * Responsabilidade:
 * - Centralizar o TOM e o POSICIONAMENTO do hero
 * - Ser simples de editar, testar e desligar
 * - Não conter lógica de UI
 *
 * Regra:
 * Se este arquivo for removido, o app NÃO quebra.
 */

export type HeroCopyContext = {
  moment?: "default" | "onboarding" | "returning";
};

export const HERO_FALLBACK_PHRASES: string[] = [
  "Organização financeira para quem quer clareza, não promessas.",
  "Menos ruído. Mais controle sobre sua vida financeira.",
  "Finanças com responsabilidade, consciência e autonomia.",
  "Um sistema para pensar melhor sobre dinheiro.",
];

export const HERO_PROMPT = (context?: HeroCopyContext) => {
  return `
Você é um redator sênior de uma empresa de tecnologia financeira chamada TUÖM.

Contexto da marca:
- Público adulto
- Tom maduro, humano e responsável
- Sem hype, sem jargões vazios
- Nada de promessas irreais
- Comunicação clara, curta e confiante

Objetivo:
Criar UMA frase curta para o hero de um app de organização financeira.

Regras da frase:
- Máximo de 12 palavras
- Linguagem simples e direta
- Não usar emojis
- Não usar palavras como: revolução, futuro, incrível, transforme sua vida
- Não parecer texto de marketing genérico
- Soar como uma empresa real e confiável

Momento do usuário: ${context?.moment ?? "default"}

Retorne apenas a frase. Sem aspas. Sem explicações.
`;
};

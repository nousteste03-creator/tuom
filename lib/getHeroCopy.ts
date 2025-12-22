import { HERO_FALLBACK_PHRASES, HERO_PROMPT, HeroCopyContext } from "./heroCopy";

/**
 * getHeroCopy — Step 4
 *
 * Agora suporta diferentes momentos/contextos do usuário
 * - fallback selecionado por contexto
 * - nunca quebra
 */

function getRandomFallback(context?: HeroCopyContext) {
  // Podemos ter fallback diferentes por momento
  switch (context?.moment) {
    case "onboarding":
      return (
        HERO_FALLBACK_PHRASES[0] ?? HERO_FALLBACK_PHRASES[0]
      );
    case "returning":
      return (
        HERO_FALLBACK_PHRASES[1] ?? HERO_FALLBACK_PHRASES[0]
      );
    default:
      return (
        HERO_FALLBACK_PHRASES[
          Math.floor(Math.random() * HERO_FALLBACK_PHRASES.length)
        ] ?? HERO_FALLBACK_PHRASES[0]
      );
  }
}

export async function getHeroCopy(
  context?: HeroCopyContext
): Promise<string> {
  try {
    const AI_ENABLED = false; // placeholder consciente

    if (!AI_ENABLED) {
      throw new Error("AI disabled");
    }

    // Placeholder para futura integração com IA
    // const response = await openai.responses.create({...});
    // const text = response.output_text?.trim();
    // if (!text) throw new Error("Empty AI response");
    // return text;

    return getRandomFallback(context);
  } catch {
    return getRandomFallback(context);
  }
}

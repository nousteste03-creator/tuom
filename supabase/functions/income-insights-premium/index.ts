import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { OpenAI } from "https://deno.land/x/openai@v4.21.0/mod.ts";

const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY") });

serve(async (req) => {
  try {
    const { incomeSources = [] } = await req.json();

    // Monta heurísticas p/ enviar ao GPT (não será o texto final)
    const monthly = incomeSources.reduce((acc, s) => acc + (s.amount || 0), 0);
    const yearly = monthly * 12;

    const prompt = `
Gere um insight financeiro curto baseado nestes dados:

Renda mensal: ${monthly}
Renda anual: ${yearly}
Número de fontes: ${incomeSources.length}

Retorne apenas um texto de interpretação. Nada de sugestões operacionais, nada de recomendação de ações.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: "Você é um analista financeiro neutro e conservador." },
                 { role: "user", content: prompt }],
      max_tokens: 120,
      temperature: 0,
    });

    const text = completion.choices[0]?.message?.content?.trim() || null;

    const insightObj = text
      ? [{
          id: "income-premium-1",
          type: "income",
          severity: "neutral",
          title: "Análise da sua renda",
          message: text,
        }]
      : [];

    return new Response(JSON.stringify({ insights: insightObj }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(
      JSON.stringify({
        insights: [],
        error: "Erro ao processar income-insights-premium",
        details: String(err),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
    );
  }
});

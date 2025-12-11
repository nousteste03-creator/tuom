import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { OpenAI } from "https://deno.land/x/openai@v4.21.0/mod.ts";

const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY") });

serve(async (req) => {
  try {
    const { investments = [] } = await req.json();

    const insights: any[] = [];

    for (const inv of investments) {
      const months = inv.projection?.monthsToGoal;

      const prompt = `
Gere um insight curto sobre este investimento:

Nome: ${inv.title}
Valor atual: ${inv.currentAmount}
Aporte mensal: ${inv.autoRuleMonthly}
Meses para a meta: ${months}

Regra: análise interpretativa, sem sugestões de ação, sem opinião forte.
`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Você é um analista financeiro neutro." },
          { role: "user", content: prompt }
        ],
        temperature: 0,
        max_tokens: 130,
      });

      const text = completion.choices[0]?.message?.content?.trim() || null;

      if (text) {
        insights.push({
          id: `inv-prem-${inv.id}`,
          type: "investments",
          severity: "neutral",
          title: `Análise de "${inv.title}"`,
          message: text,
        });
      }
    }

    return new Response(JSON.stringify({ insights }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(
      JSON.stringify({
        insights: [],
        error: "Erro em investment-goal-insights-premium",
        details: String(err),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

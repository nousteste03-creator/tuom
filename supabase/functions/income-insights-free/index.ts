import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  try {
    const { incomeSources = [] } = await req.json();

    const insights: any[] = [];

    // Nenhuma renda cadastrada
    if (incomeSources.length === 0) {
      insights.push({
        id: "income-none",
        type: "income",
        severity: "danger",
        title: "Nenhuma renda cadastrada",
        message: "Adicione ao menos uma fonte de renda para gerar projeções e análises.",
      });
    }

    // Uma única fonte → renda concentrada
    if (incomeSources.length === 1) {
      const src = incomeSources[0];
      insights.push({
        id: "income-concentrated",
        type: "income",
        severity: "neutral",
        title: "Renda concentrada",
        message: `Sua renda depende de uma única fonte (${src.name}). Diversificar pode trazer estabilidade.`,
      });
    }

    return new Response(JSON.stringify({ insights }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        insights: [],
        error: "Erro ao processar income-insights-free",
        details: String(err),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
    );
  }
});

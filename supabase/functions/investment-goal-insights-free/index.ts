import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  try {
    const { investments = [] } = await req.json();
    const insights: any[] = [];

    for (const inv of investments) {
      if (inv.projection?.monthsToGoal <= 3) {
        insights.push({
          id: `inv-free-${inv.id}`,
          type: "investments",
          severity: "positive",
          title: `"${inv.title}" está perto da meta`,
          message: `Faltam apenas ${inv.projection.monthsToGoal} meses para alcançar o objetivo.`,
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
        error: "Erro em investment-goal-insights-free",
        details: String(err),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

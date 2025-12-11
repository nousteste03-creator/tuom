// supabase/functions/goals-insights-free/index.ts
// -------------------------------------------------------------
// Insights FREE de metas
// - Regras determinísticas (sem IA)
// - Seguro, estável e compatível com o hook useGoalsInsights
// - Resultados sempre previsíveis
// -------------------------------------------------------------

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

serve(async (req) => {
  try {
    // -------------------------------------------------------------
    // 1) VALIDAR JWT — obrigatório para RLS e segurança
    // -------------------------------------------------------------
    const auth = req.headers.get("Authorization");
    if (!auth || !auth.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({
          insights: [],
          error: "Unauthorized: missing JWT",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // -------------------------------------------------------------
    // 2) LER PAYLOAD COM SEGURANÇA
    // -------------------------------------------------------------
    let body: any = null;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({
          insights: [],
          error: "Invalid JSON body",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const goals = body?.goals ?? [];

    if (!Array.isArray(goals) || goals.length === 0) {
      return new Response(
        JSON.stringify({
          insights: [],
          warning:
            "Nenhuma meta encontrada. Para gerar insights, envie metas válidas.",
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // -------------------------------------------------------------
    // 3) REGRAS DETERMNÍSTICAS DE INSIGHTS (FREE)
    // -------------------------------------------------------------
    const insights: any[] = [];

    for (const g of goals) {
      const progress = Number(g.progressPercent ?? 0);
      const aheadBehind = Number(g.aheadOrBehindMonths ?? 0);
      const title = g.title ?? "Meta";

      // PROGRESSO ALTO
      if (progress >= 70) {
        insights.push({
          id: `goal-progress-${g.id ?? "x"}`,
          type: "goals",
          severity: "positive",
          title: `Sua meta "${title}" está evoluindo bem`,
          message: `Você já alcançou ${progress.toFixed(
            0
          )}% da meta. Continue acompanhando seu progresso.`,
        });
      }

      // ATRASO
      if (aheadBehind < -1) {
        insights.push({
          id: `goal-delay-${g.id ?? "x"}`,
          type: "goals",
          severity: aheadBehind < -3 ? "danger" : "warning",
          title: `A meta "${title}" está atrasada`,
          message: `O progresso está ${Math.abs(
            aheadBehind
          )} meses atrás do esperado.`,
        });
      }
    }

    // -------------------------------------------------------------
    // 4) RETORNO FINAL
    // -------------------------------------------------------------
    return new Response(
      JSON.stringify({
        insights,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    // -------------------------------------------------------------
    // 5) ERRO GLOBAL — nunca deixa o app quebrar
    // -------------------------------------------------------------
    return new Response(
      JSON.stringify({
        insights: [],
        fallback:
          "Não foi possível gerar insights gratuitos no momento. Tente novamente mais tarde.",
        error: String(err),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});

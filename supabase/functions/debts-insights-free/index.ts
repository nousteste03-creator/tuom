// supabase/functions/debts-insights-free/index.ts
// -------------------------------------------------------------
// Insights FREE para DÍVIDAS
// Retorna heurísticas simples, sem IA, sem opinião e sem previsão.
//
// Regras FREE:
// - Apenas lógica determinística local
// - Sem acesso a modelos
// - Resposta curta e objetiva
// -------------------------------------------------------------

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

serve(async (req) => {
  try {
    // -------------------------------------------------------------
    // 1) Validar JWT do Supabase (obrigatório)
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

    const jwt = auth.replace("Bearer ", "").trim();

    // -------------------------------------------------------------
    // 2) Ler o payload enviado pelo app
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

    const debts = body?.debts ?? [];

    // -------------------------------------------------------------
    // 3) Se não houver dívidas → nenhum insight
    // -------------------------------------------------------------
    if (!Array.isArray(debts) || debts.length === 0) {
      return new Response(
        JSON.stringify({
          insights: [],
          warning: "Nenhuma dívida enviada. Nada a analisar.",
        }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // -------------------------------------------------------------
    // 4) Gerar heurísticas FREE de forma determinística
    // -------------------------------------------------------------
    const insights: any[] = [];

    for (const d of debts) {
      const installments = d.installments ?? [];
      const next = installments.find((i: any) => i.status !== "paid");

      if (!next || next.amount == null || !d.targetAmount) continue;

      // Heurística 1 — Parcela muito alta
      if (next.amount > d.targetAmount * 0.2) {
        insights.push({
          id: `debt-heavy-${d.id}`,
          type: "debts",
          severity: "danger",
          title: `Parcela alta em "${d.title}"`,
          message: `A próxima parcela é de R$${next.amount.toFixed(
            2
          )}, acima de 20% do valor total da dívida.`,
        });
      }

      // Heurística 2 — Dívida longa demais
      if (installments.length > 24) {
        insights.push({
          id: `debt-long-${d.id}`,
          type: "debts",
          severity: "warning",
          title: `Dívida muito longa`,
          message: `A dívida "${d.title}" possui mais de 24 parcelas e pode comprometer seu orçamento por um longo período.`,
        });
      }

      // Heurística 3 — Progresso muito lento
      if (d.progressPercent < 5) {
        insights.push({
          id: `debt-slow-${d.id}`,
          type: "debts",
          severity: "neutral",
          title: `Pagamento lento`,
          message: `A dívida "${d.title}" ainda está no início. Continue pagando para evitar acúmulo de juros.`,
        });
      }
    }

    // -------------------------------------------------------------
    // 5) Retorno final
    // -------------------------------------------------------------
    return new Response(JSON.stringify({ insights }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    return new Response(
      JSON.stringify({
        insights: [],
        error: `Internal error: ${e?.message ?? e}`,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});

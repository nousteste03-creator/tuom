// supabase/functions/debt-insights/index.ts
// Edge Function para gerar insights de dívidas (PRO futuro)

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// TIPAGENS BÁSICAS (iguais ao app)
type Goal = {
  id: string;
  user_id: string;
  titulo: string;
  tipo: string;
  target_amount: number;
  current_amount: number;
};

type Installment = {
  id: string;
  goal_id: string;
  numero_parcela: number;
  valor_parcela: number;
  vencimento: string;
  status: "pending" | "paid";
};

type DebtInsight = {
  title: string;
  description: string;
  highlight?: boolean;
};

type DebtInsightsResponse = {
  insights: DebtInsight[];
  riskLevel: "low" | "medium" | "high";
  strategy: "snowball" | "avalanche" | "balanced";
};

// Inicialização do Supabase (se você quiser buscar coisas do banco aqui)
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
// Se precisar de acesso mais profundo, usar SERVICE_ROLE com muito cuidado.
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// (OPCIONAL FUTURO) OpenAI / outra IA
// const openaiApiKey = Deno.env.get("OPENAI_API_KEY")!;
// const client = new OpenAI({ apiKey: openaiApiKey });

serve(async (req) => {
  // CORS básico
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  }

  try {
    if (req.method !== "POST") {
      return json({ error: "Method not allowed" }, 405);
    }

    // ============================
    // 1) AUTENTICAÇÃO
    // ============================
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return json({ error: "Unauthorized" }, 401);
    }

    // ============================
    // 2) INPUT DO CLIENTE
    // ============================
    const body = await req.json();
    const goal = body.goal as Goal | undefined;
    const installments = (body.installments as Installment[]) || [];
    const mode = (body.mode as "free" | "pro") || "free";

    if (!goal || !goal.id) {
      return json({ error: "Goal is required" }, 400);
    }

    // (Opcional) Segurança extra: garantir que a meta pertence ao user
    if (goal.user_id && goal.user_id !== user.id) {
      return json({ error: "Forbidden" }, 403);
    }

    // ============================
    // 3) CÁLCULOS BASE
    // ============================
    const total = installments.reduce(
      (acc, i) => acc + (Number(i.valor_parcela) || 0),
      0,
    );

    const paid = installments
      .filter((i) => i.status === "paid")
      .reduce((acc, i) => acc + (Number(i.valor_parcela) || 0), 0);

    const remaining = total - paid;

    const pending = installments.filter((i) => i.status === "pending");
    const totalInstallments = installments.length;
    const paidCount = installments.filter((i) => i.status === "paid").length;

    const progressPct = total > 0 ? (paid / total) * 100 : 0;

    // Próxima parcela
    const nextInstallment = pending[0] || null;

    // Duração total (em meses) – baseado na primeira e última parcela
    let durationMonths = 0;
    if (installments.length > 1) {
      const first = new Date(installments[0].vencimento);
      const last = new Date(installments[installments.length - 1].vencimento);
      durationMonths =
        (last.getFullYear() - first.getFullYear()) * 12 +
        (last.getMonth() - first.getMonth()) +
        1;
    }

    // ============================
    // 4) HEURÍSTICA (FREE)
    // ============================
    const heuristic = buildHeuristicInsights({
      goal,
      total,
      paid,
      remaining,
      progressPct,
      totalInstallments,
      paidCount,
      durationMonths,
      nextInstallment,
    });

    // ============================
    // 5) IA (PRO FUTURO)
    // ============================
    let finalResponse: DebtInsightsResponse = heuristic;

    if (mode === "pro") {
      // Quando você ativar OpenAI, troca esse bloco:
      // const ai = await generateAiInsights({ goal, installments, base: heuristic });
      // finalResponse = ai;
      // Por enquanto, só retornamos a heurística.
    }

    return json(finalResponse, 200);
  } catch (e) {
    console.error("debt-insights error:", e);
    return json({ error: "Internal error" }, 500);
  }
});

/* ============================================================
   HELPER – resposta JSON com CORS
============================================================ */
function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

/* ============================================================
   HEURÍSTICA (FREE) – base real, sem IA paga
============================================================ */
function buildHeuristicInsights(input: {
  goal: Goal;
  total: number;
  paid: number;
  remaining: number;
  progressPct: number;
  totalInstallments: number;
  paidCount: number;
  durationMonths: number;
  nextInstallment: Installment | null;
}): DebtInsightsResponse {
  const {
    goal,
    total,
    paid,
    remaining,
    progressPct,
    totalInstallments,
    paidCount,
    durationMonths,
    nextInstallment,
  } = input;

  const insights: DebtInsight[] = [];

  // 1) Progresso
  if (paidCount === 0) {
    insights.push({
      title: "Primeira parcela ainda não foi paga",
      description:
        "Começar a pagar a primeira parcela já melhora bastante sua linha do tempo de dívida.",
    });
  } else if (progressPct >= 80) {
    insights.push({
      title: "Reta final",
      description:
        "Você está muito perto de quitar essa dívida. Se possível, tente antecipar uma ou duas parcelas.",
      highlight: true,
    });
  } else if (progressPct >= 50) {
    insights.push({
      title: "Metade do caminho concluída",
      description:
        "Mais da metade dessa dívida já está paga. Manter a disciplina agora acelera sua quitação.",
      highlight: true,
    });
  }

  // 2) Duração
  if (durationMonths >= 12) {
    insights.push({
      title: "Dívida de longo prazo",
      description:
        "Essa dívida acompanha você por mais de um ano. Avalie se vale renegociar juros ou antecipar parcelas.",
    });
  }

  // 3) Próxima parcela
  if (nextInstallment) {
    insights.push({
      title: "Próxima parcela",
      description: `Você tem uma parcela de R$ ${Number(
        nextInstallment.valor_parcela,
      ).toFixed(2)} com vencimento em ${
        nextInstallment.vencimento
      }. Organize o mês para não atrasar.`,
    });
  }

  if (!insights.length) {
    insights.push({
      title: "Dívida em andamento",
      description:
        "Sua dívida está em progresso normal. Continue acompanhando para evitar atrasos.",
    });
  }

  // Risco simples: alta se dívida grande + longo prazo
  let risk: "low" | "medium" | "high" = "low";
  if (remaining > total * 0.7 || durationMonths >= 24) risk = "high";
  else if (remaining > total * 0.4 || durationMonths >= 12) risk = "medium";

  // Estratégia default: snowball (behavior-friendly)
  const strategy: "snowball" | "avalanche" | "balanced" = "snowball";

  return {
    insights,
    riskLevel: risk,
    strategy,
  };
}

/* ============================================================
   FUTURO – gerar insights com IA (OpenAI / outro modelo)
============================================================ */
// async function generateAiInsights(args: {
//   goal: Goal;
//   installments: Installment[];
//   base: DebtInsightsResponse;
// }): Promise<DebtInsightsResponse> {
//   const { goal, installments, base } = args;

//   // Montar prompt aqui usando goal + installments + base.insights
//   // const completion = await client.responses.create({ ... });
//   // Parsear a resposta e misturar com base.insights.

//   return base; // Por enquanto, fallback para heurística
// }

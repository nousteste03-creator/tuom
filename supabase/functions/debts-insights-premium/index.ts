// supabase/functions/goals-insights-premium/index.ts
// -------------------------------------------------------------
// Insights PREMIUM de METAS
// - Usa GPT-4o-mini com system prompt seguro (sem previsão!)
// - Exige JWT (RLS-friendly)
// - Resposta sempre em JSON padronizado
// -------------------------------------------------------------

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import OpenAI from "https://esm.sh/openai@4.47.0";

const client = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY") ?? "",
});

serve(async (req) => {
  try {
    // -------------------------------------------------------------
    // 1) VALIDAR JWT
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

    // O app não precisa usar esse JWT aqui, mas ele precisa existir
    const jwt = auth.replace("Bearer ", "").trim();

    // -------------------------------------------------------------
    // 2) LER PAYLOAD
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
          warning: "Nenhuma meta enviada. Para análise premium, envie ao menos uma meta.",
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // Premium analisa apenas a meta principal da tela
    const g = goals[0];

    // -------------------------------------------------------------
    // 3) SYSTEM PROMPT — SUPER RESTRITO (CVM SAFE)
    // -------------------------------------------------------------
    const systemPrompt = `
Você é uma IA financeira explicativa para um aplicativo.
NUNCA faça:
- previsões de futuro
- recomendações de investimento
- conselhos pessoais
- julgamentos de qualidade
- projeções numéricas

SUA FUNÇÃO:
- descrever o estado atual da meta
- interpretar progresso e atraso/adianto
- orientar o usuário de maneira informativa e neutra

REGRAS:
- Seja curto (2 a 3 frases)
- Português claro e calmo
- Não use bullets, listas, markdown ou emojis
- Apenas texto corrido, nada técnico demais
- NUNCA invente valores que não foram informados
`;

    const userPrompt = `
Dados da meta:
Título: ${g.title ?? "Meta sem título"}
Progresso atual: ${g.progressPercent ?? 0}%
Atraso/adianto em meses: ${g.aheadOrBehindMonths ?? 0}
`;

    // -------------------------------------------------------------
    // 4) CHAMADA AO GPT-4o-mini
    // -------------------------------------------------------------
    let aiText = "";

    try {
      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 220,
        temperature: 0.2,
      });

      const raw = completion.choices?.[0]?.message?.content;
      aiText = typeof raw === "string" ? raw.trim() : "";
    } catch (err) {
      console.error("GPT ERROR:", err);
      aiText = "";
    }

    // -------------------------------------------------------------
    // 5) FALLBACK SE A IA DER ERRO
    // -------------------------------------------------------------
    if (!aiText) {
      aiText =
        "Esta meta ainda não possui dados suficientes para uma análise mais aprofundada, mas acompanhar sua evolução regularmente pode ajudar no planejamento.";
    }

    // -------------------------------------------------------------
    // 6) REGRAS DETERMINÍSTICAS (para severity e título)
    // -------------------------------------------------------------
    const progress = Number(g.progressPercent ?? 0);
    const aheadBehind = Number(g.aheadOrBehindMonths ?? 0);

    let severity: "positive" | "warning" | "danger" | "neutral" = "neutral";

    if (progress >= 70) severity = "positive";
    else if (aheadBehind < -2) severity = "warning";
    else if (aheadBehind < -4) severity = "danger";

    const titleBase =
      severity === "positive"
        ? `Sua meta "${g.title ?? "Meta"}" está evoluindo bem`
        : severity === "warning"
        ? `A meta "${g.title ?? "Meta"}" está um pouco atrasada`
        : severity === "danger"
        ? `A meta "${g.title ?? "Meta"}" está muito atrasada`
        : `Visão geral da meta "${g.title ?? "Meta"}"`;

    // -------------------------------------------------------------
    // 7) RETORNO FINAL
    // -------------------------------------------------------------
    return new Response(
      JSON.stringify({
        insights: [
          {
            id: `goal-premium-${g.id ?? "unknown"}`,
            type: "goals",
            severity,
            title: titleBase,
            message: aiText,
          },
        ],
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("GOALS INSIGHTS PREMIUM ERROR:", err);

    return new Response(
      JSON.stringify({
        insights: [],
        fallback: "Não foi possível gerar análise premium no momento.",
        error: String(err),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});

// supabase/functions/goals-insights-premium/index.ts
// ----------------------------------------------------------------------
// Análise Premium de Metas (GOALS)
// - Usa GPT-4o-mini apenas para gerar texto explicativo curto
// - Nunca recomenda, nunca prevê futuro, nunca opina
// - Sem JSON retornado pelo modelo (evita parse bugs)
// - Severidade determinada por regra fixa e auditável
// - Compatível com o hook useGoalsInsights
// ----------------------------------------------------------------------

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import OpenAI from "https://esm.sh/openai@4.47.0";

const client = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY")!,
});

serve(async (req) => {
  try {
    // ---------------------------------------------------------
    // 1) Validar Bearer Token (RLS)
    // ---------------------------------------------------------
    const auth = req.headers.get("Authorization");
    if (!auth || !auth.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({
          insights: [],
          error: "Unauthorized: missing bearer token",
        }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // ---------------------------------------------------------
    // 2) Ler payload com segurança
    // ---------------------------------------------------------
    let body: any = null;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({
          insights: [],
          error: "Invalid JSON body",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const goals = body?.goals ?? [];

    if (!Array.isArray(goals) || goals.length === 0) {
      return new Response(
        JSON.stringify({
          insights: [],
          warning: "Nenhuma meta enviada para análise premium.",
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // ---------------------------------------------------------
    // 3) Usar APENAS a primeira meta (design atual do app)
    // ---------------------------------------------------------
    const g = goals[0];

    // ---------------------------------------------------------
    // 4) Prompt seguro, com IA sendo proibida de prever ou recomendar
    // ---------------------------------------------------------
    const systemPrompt = `
Você é uma IA financeira explicativa.  
NUNCA:
- dê recomendações
- sugira ações
- faça previsões
- fale sobre o futuro

Faça apenas uma explicação curta, neutra e descritiva da situação atual da meta.
Use tom calmo e profissional.
Nunca use markdown, bullets ou listas.
Entregue apenas texto corrido com 2–3 frases.`;

    const userPrompt = `
Dados da meta:
Título: ${g.title ?? "Meta"}
Progresso atual: ${g.progressPercent ?? 0}%
Atraso/adianto em meses: ${g.aheadOrBehindMonths ?? 0}

Explique somente o momento atual desta meta.`;

    // ---------------------------------------------------------
    // 5) Chamada OpenAI — SEM JSON no retorno
    // ---------------------------------------------------------
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 200,
      temperature: 0.25,
    });

    let aiText = completion.choices?.[0]?.message?.content ?? "";
    aiText = aiText.trim();

    if (!aiText) {
      aiText =
        "No momento, esta meta não apresenta sinais claros de atraso ou adiantamento significativos.";
    }

    // ---------------------------------------------------------
    // 6) Severidade — REGRAS FIXAS (auditoria CVM-safe)
    // ---------------------------------------------------------
    const progress = Number(g.progressPercent ?? 0);
    const aheadBehind = Number(g.aheadOrBehindMonths ?? 0);

    let severity: "positive" | "warning" | "danger" | "neutral" = "neutral";

    if (progress >= 70) severity = "positive";
    else if (aheadBehind < -1 && aheadBehind >= -3) severity = "warning";
    else if (aheadBehind < -3) severity = "danger";

    const titleBase =
      severity === "positive"
        ? `Sua meta "${g.title ?? "Meta"}" está evoluindo bem`
        : severity === "warning"
        ? `"${g.title ?? "Meta"}" apresenta sinais de atraso`
        : severity === "danger"
        ? `Atraso relevante em "${g.title ?? "Meta"}"`
        : `Visão geral da meta "${g.title ?? "Meta"}"`;

    // ---------------------------------------------------------
    // 7) Construção do JSON final — compatível com o hook
    // ---------------------------------------------------------
    const responseBody = {
      insights: [
        {
          id: `goal-premium-${g.id ?? crypto.randomUUID()}`,
          type: "goals",
          severity,
          title: titleBase,
          message: aiText,
        },
      ],
    };

    return new Response(JSON.stringify(responseBody), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    // ---------------------------------------------------------
    // 8) Fallback seguro — o app nunca quebra
    // ---------------------------------------------------------
    return new Response(
      JSON.stringify({
        insights: [],
        fallback: "Não foi possível gerar análise premium.",
        error: String(err),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});

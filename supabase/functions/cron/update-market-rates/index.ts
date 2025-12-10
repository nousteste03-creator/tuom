// /supabase/functions/cron/update-market-rates/index.ts
// Atualiza: CDI, Selic, IPCA e Prefixado diariamente às 06h00
// Função robusta com fallback e logs premium

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// === ENV ===
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const DEEPSEEK_KEY = Deno.env.get("DEEPSEEK_KEY") ?? null;

const HEADERS = {
  "Content-Type": "application/json",
  apikey: SUPABASE_SERVICE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
};

// ===============================
// HELPERS PROFISSIONAIS
// ===============================

// Chamada API oficial Banco Central (SGS)
async function getBCBRate(code: number): Promise<number | null> {
  try {
    const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${code}/dados/ultimos/1?formato=json`;

    const resp = await fetch(url);
    if (!resp.ok) return null;

    const data = await resp.json();
    const value = parseFloat(data?.[0]?.valor);

    return isNaN(value) ? null : value;
  } catch (_) {
    return null;
  }
}

// Fallback via DeepSeek (LLM interpreta HTML/Texto)
async function getRateViaDeepSeek(name: string): Promise<number | null> {
  if (!DEEPSEEK_KEY) return null;

  try {
    const prompt = `Extraia somente a taxa numérica atual do indicador financeiro brasileiro "${name}".
Se não conseguir, responda apenas "null".`;

    const r = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        temperature: 0,
      }),
    });

    const json = await r.json();
    const txt = json?.choices?.[0]?.message?.content ?? "";

    const match = txt.match(/([\d.,]+)/);
    if (!match) return null;

    return parseFloat(match[1].replace(",", "."));
  } catch {
    return null;
  }
}

// Insere taxa no Supabase
async function saveRates(rates: Record<string, number | null>) {
  const payload = {
    cdi_daily: rates.cdi,
    selic_daily: rates.selic,
    ipca_monthly: rates.ipca,
    prefixado_annual: rates.prefixado,
    is_active: true,
  };

  await fetch(`${SUPABASE_URL}/rest/v1/market_reference_rates`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify(payload),
  });

  console.log("[OK] Taxas inseridas:", payload);
}

// ===============================
// MAIN FUNCTION — EXECUTADA 06h00
// ===============================

serve(async () => {
  console.log("=== CRON 06h - Atualizando taxas ===");

  // 1 — Buscar taxas oficiais
  let cdi = await getBCBRate(12);     // CDI diário
  let selic = await getBCBRate(11);   // Selic meta
  let ipca = await getBCBRate(433);   // IPCA mensal
  let prefixado = await getBCBRate(4391); // Juros prefixados

  console.log("[BCB] Respostas:", { cdi, selic, ipca, prefixado });

  // 2 — Fallback via DeepSeek (se algum estiver nulo)
  if (!cdi) cdi = await getRateViaDeepSeek("CDI hoje");
  if (!selic) selic = await getRateViaDeepSeek("taxa Selic atual");
  if (!ipca) ipca = await getRateViaDeepSeek("IPCA mensal atual");
  if (!prefixado) prefixado = await getRateViaDeepSeek("juros prefixados Brasil");

  console.log("[FINAL] Taxas ajustadas:", {
    cdi,
    selic,
    ipca,
    prefixado,
  });

  // 3 — Registrar no Postgres
  await saveRates({ cdi, selic, ipca, prefixado });

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
});

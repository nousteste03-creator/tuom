// /supabase/functions/projection-calc/index.ts
// NÖUS Invest+ — Projeção Real de Investimentos
// CDI + Selic + Retorno do Ativo (opcional via FMP)
// Nunca usa IA — apenas matemática determinística

import { serve } from "https://deno.land/std@0.223.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const FMP_KEY = Deno.env.get("FMP_API_KEY") || ""; // opcional

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

/* ==========================================================
   1) Carregar taxas de referência (CDI, Selic, IPCA, Prefixado)
============================================================ */
async function loadMarketRates() {
  const { data, error } = await supabase
    .from("market_reference_rates")
    .select("*")
    .eq("is_active", true)
    .maybeSingle();

  if (error || !data) {
    console.error("Erro ao carregar taxas:", error);
    throw new Error("Falha ao carregar taxas de referência.");
  }

  return data;
}

/* ==========================================================
   2) Carregar retorno histórico anualizado do ativo via FMP
============================================================ */
async function loadAssetAnnualReturn(symbol: string | null): Promise<number | null> {
  if (!symbol || !FMP_KEY) return null;

  try {
    const url = `https://financialmodelingprep.com/api/v3/historical-chart/1month/${symbol}?apikey=${FMP_KEY}`;
    const response = await fetch(url);
    const json = await response.json();

    if (!Array.isArray(json) || json.length < 12) return null;

    const first = json[json.length - 12].close;
    const last = json[0].close;
    const pct = (last - first) / first;

    return Number(pct);
  } catch (err) {
    console.error("Erro FMP:", err);
    return null;
  }
}

/* ==========================================================
   3) Cálculo determinístico da projeção mensal
============================================================ */
function computeProjection({
  initialAmount,
  monthlyAmount,
  months,
  cdiAnnual,
  assetAnnualReturn
}: {
  initialAmount: number;
  monthlyAmount: number;
  months: number;
  cdiAnnual: number;
  assetAnnualReturn: number | null;
}) {
  const monthlyCDI = Math.pow(1 + cdiAnnual, 1 / 12) - 1;
  const monthlyAsset = assetAnnualReturn ? Math.pow(1 + assetAnnualReturn, 1 / 12) - 1 : 0;

  const monthlyReturn = monthlyCDI + monthlyAsset;

  let balance = initialAmount;
  const series = [];

  for (let m = 1; m <= months; m++) {
    balance += monthlyAmount;
    balance *= 1 + monthlyReturn;

    series.push({
      month: m,
      value: Number(balance.toFixed(2)),
      monthlyReturn: Number(monthlyReturn.toFixed(6))
    });
  }

  return { series, monthlyReturn };
}

/* ==========================================================
   4) Handler Oficial — Supabase Edge Runtime
============================================================ */
serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ ok: false, error: "Use POST" }),
      { status: 405 }
    );
  }

  try {
    const body = await req.json();

    const initialAmount = Number(body.initialAmount || 0);
    const monthlyAmount = Number(body.monthlyAmount || 0);
    const months = Number(body.months || 1);
    const assetSymbol = body.assetSymbol || null;

    // 1. Taxas base (CDI, Selic, IPCA)
    const rates = await loadMarketRates();

    // CDI diário → CDI anual aproximado
    const cdiAnnual = Number(rates.cdi_daily || 0) * 252;

    // 2. Retorno do ativo (opcional)
    const assetAnnualReturn = await loadAssetAnnualReturn(assetSymbol);

    // 3. Cálculo da projeção
    const { series } = computeProjection({
      initialAmount,
      monthlyAmount,
      months,
      cdiAnnual,
      assetAnnualReturn
    });

    return new Response(
      JSON.stringify({
        ok: true,
        projection: {
          initialAmount,
          monthlyAmount,
          months,
          cdiAnnual,
          assetAnnualReturn,
          series
        }
      }),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ ok: false, error: String(err) }),
      { status: 500 }
    );
  }
});

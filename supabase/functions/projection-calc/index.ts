// /supabase/functions/projection/calc/index.ts
// Edge Function oficial — NÖUS Invest+
// Projeção real com CDI + aporte mensal + retorno opcional de ativo

import { serve } from "https://deno.land/x/sift@0.6.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const FMP_KEY = Deno.env.get("FMP_API_KEY") || "";

const supabase = createClient(supabaseUrl, supabaseKey);

/* ==========================================================
   Helper — Busca taxa CDI/Selic/IPCA
=========================================================== */
async function loadMarketRates() {
  const { data, error } = await supabase
    .from("market_reference_rates")
    .select("*")
    .eq("is_active", true)
    .maybeSingle();

  if (error || !data) {
    throw new Error("Falha ao carregar taxas de referência");
  }

  return data;
}

/* ==========================================================
   Retorno anualizado do ativo (opcional)
   Usa FMP — NÖUS padrão
=========================================================== */
async function loadAssetAnnualReturn(symbol: string | null): Promise<number | null> {
  if (!symbol || !FMP_KEY) return null;

  try {
    const url = `https://financialmodelingprep.com/api/v3/historical-chart/1month/${symbol}?apikey=${FMP_KEY}`;
    const response = await fetch(url);
    const json = await response.json();

    if (!Array.isArray(json) || json.length < 12) return null;

    // cálcula retorno anual aproximado
    const first = json[json.length - 12].close;
    const last = json[0].close;
    const pct = (last - first) / first;

    return pct; // exemplo: 0.12 = 12% ao ano
  } catch {
    return null;
  }
}

/* ==========================================================
   Cálculo principal de projeção
=========================================================== */
function computeProjection({
  initialAmount,
  monthlyAmount,
  months,
  cdiRate,
  assetReturn
}: {
  initialAmount: number;
  monthlyAmount: number;
  months: number;
  cdiRate: number;       // ex: 0.13 = 13% a.a.
  assetReturn: number | null;
}) {
  const monthlyCDI = Math.pow(1 + cdiRate, 1 / 12) - 1;
  const monthlyAsset = assetReturn ? Math.pow(1 + assetReturn, 1 / 12) - 1 : 0;

  const monthlyReturn = monthlyCDI + monthlyAsset;

  let balance = initialAmount;
  const series = [];

  for (let m = 1; m <= months; m++) {
    balance += monthlyAmount;
    balance *= 1 + monthlyReturn;

    series.push({
      month: m,
      value: Number(balance.toFixed(2))
    });
  }

  return { series, monthlyReturn };
}

/* ==========================================================
   Handler principal
=========================================================== */
serve({
  async POST(req) {
    try {
      const body = await req.json();

      const initialAmount = Number(body.initialAmount || 0);
      const monthlyAmount = Number(body.monthlyAmount || 0);
      const months = Number(body.months || 0);
      const assetSymbol = body.assetSymbol || null;

      // 1. Carregar taxas
      const rates = await loadMarketRates();
      const cdi = Number(rates.cdi_daily || 0) * 252; // converte diário → anual aproximado

      // 2. Retorno opcional do ativo
      const assetReturn = await loadAssetAnnualReturn(assetSymbol);

      // 3. Calcular projeção
      const { series } = computeProjection({
        initialAmount,
        monthlyAmount,
        months,
        cdiRate: cdi,
        assetReturn
      });

      return new Response(
        JSON.stringify({
          ok: true,
          projection: {
            initialAmount,
            monthlyAmount,
            months,
            cdiRate: cdi,
            assetReturn,
            series
          }
        }),
        { headers: { "Content-Type": "application/json" } }
      );

    } catch (err) {
      return new Response(
        JSON.stringify({ ok: false, error: err.message }),
        { status: 500 }
      );
    }
  },

  // método proibido
  async GET() {
    return new Response(
      JSON.stringify({ ok: false, error: "Use POST" }),
      { status: 405 }
    );
  }
});

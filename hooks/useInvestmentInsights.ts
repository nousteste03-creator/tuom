import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useUserPlan } from "@/hooks/useUserPlan";

type InsightResponse = {
  ok: boolean;
  insight: string;
  heuristics: any;
};

type UseInvestmentInsightsProps = {
  symbol: string;
  projection: any;  // resultado do useInvestmentProjection()
  market: any;      // preço atual, variação diária, volatilidade
};

export function useInvestmentInsights({
  symbol,
  projection,
  market,
}: UseInvestmentInsightsProps) {
  const { isPro } = useUserPlan();

  const [insight, setInsight] = useState<string | null>(null);
  const [heuristics, setHeuristics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ============================================================
     1) Escolher a FUNCTION correta
  ============================================================ */
  const functionName = isPro ? "insights-premium" : "insights-free";

  /* ============================================================
     2) Função interna para carregar insights
  ============================================================ */
  const fetchInsights = useCallback(async () => {
    if (!symbol || !projection || !market) return;

    try {
      setLoading(true);
      setError(null);

      const url = `${supabase.functions.url}/${functionName}`;

      const { data, error } = await supabase.functions.invoke(functionName, {
        body: {
          symbol,
          projection,
          market,
        },
      });

      if (error) {
        setError(error.message || "Erro ao carregar insights");
        return;
      }

      if (!data?.ok) {
        setError("Insight indisponível");
        return;
      }

      setInsight(data.insight);
      setHeuristics(data.heuristics);
    } catch (err: any) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, [symbol, projection, market, functionName]);

  /* ============================================================
     3) Auto-load quando tudo estiver pronto
  ============================================================ */
  useEffect(() => {
    if (projection && market) {
      fetchInsights();
    }
  }, [projection, market]);

  /* ============================================================
     Retorno final
  ============================================================ */
  return {
    loading,
    insight,
    heuristics,
    error,
    refresh: fetchInsights,
    functionName,
    isPro,
  };
}

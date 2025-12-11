// hooks/useInvestmentProjection.ts
// NÖUS Invest+ — Hook oficial de Projeção de Investimentos
// Conecta diretamente com a Supabase Function `/projection-calc`

import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export type ProjectionPoint = {
  month: number;
  value: number;
  monthlyReturn: number;
};

export type ProjectionResult = {
  initialAmount: number;
  monthlyAmount: number;
  months: number;
  cdiAnnual?: number;
  assetAnnualReturn?: number | null;
  series: ProjectionPoint[];
};

export function useInvestmentProjection() {
  const [projection, setProjection] = useState<ProjectionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Chamada à função /projection-calc
   */
  const fetchProjection = useCallback(
    async (params: {
      initialAmount: number;
      monthlyAmount: number;
      months: number;
      assetSymbol?: string;
    }) => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fnError } = await supabase.functions.invoke(
          "projection-calc",
          {
            body: params,
          }
        );

        if (fnError) {
          setError(fnError.message);
          return;
        }

        if (!data?.projection) {
          setError("Nenhuma projeção retornada.");
          return;
        }

        setProjection(data.projection);
      } catch (err: any) {
        setError(String(err.message || err));
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Métricas derivadas
   */
  const growthTotal =
    projection?.series?.length
      ? projection.series.at(-1)!.value - projection.series[0]!.value
      : 0;

  const growthPct =
    projection?.series?.length && projection.series[0]!.value > 0
      ? (growthTotal / projection.series[0]!.value) * 100
      : 0;

  return {
    projection,
    loading,
    error,
    fetchProjection,

    // métricas derivadas
    growthTotal,
    growthPct,

    // série completa
    series: projection?.series || [],
  };
}

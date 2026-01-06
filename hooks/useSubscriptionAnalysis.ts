import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type SubscriptionAnalysis = {
  user_id: string;
  subscription_id: string;

  monthly_total: number;
  annual_total: number;
  charges_detected_count: number;

  billing_pattern_summary?: string;
  price_trend?: string;
  price_variation_detected?: boolean;
  price_change_frequency?: string;

  market_signal?: string;
  news_based_price_pressure?: boolean;
  risk_of_price_increase?: boolean;
  risk_reason?: string;

  raw_model_version: string;
  created_at?: string;
};

type UseSubscriptionAnalysisResult = {
  data: SubscriptionAnalysis | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

type Options = {
  autoFetch?: boolean;
};

export function useSubscriptionAnalysis(
  subscriptionId: string | null,
  options: Options = { autoFetch: true }
): UseSubscriptionAnalysisResult {
  const [data, setData] = useState<SubscriptionAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = useCallback(async () => {
    if (!subscriptionId) return;

    setLoading(true);
    setError(null);

    try {
      const { data: analysisData, error: fetchError } = await supabase
        .from("subscription_analysis")
        .select("*")
        .eq("subscription_id", subscriptionId)
        .single();

      if (fetchError) {
        if (fetchError.code === "PGRST116") {
          // análise ainda não existe
          setData(null);
          return;
        }
        throw fetchError;
      }

      setData(analysisData);
    } catch (err) {
      setError("FAILED_TO_LOAD_ANALYSIS");
    } finally {
      setLoading(false);
    }
  }, [subscriptionId]);

  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchAnalysis();
    }
  }, [fetchAnalysis, options.autoFetch]);

  return {
    data,
    loading,
    error,
    refetch: fetchAnalysis,
  };
}

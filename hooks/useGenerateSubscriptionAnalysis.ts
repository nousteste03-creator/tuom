import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface GenerateAnalysisParams {
  subscriptionId: string;
  transactions: any[];
  metadata?: Record<string, any>;
}

export function useGenerateSubscriptionAnalysis() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any | null>(null);

  const generateAnalysis = async ({
    subscriptionId,
    transactions,
    metadata = {},
  }: GenerateAnalysisParams) => {
    try {
      setLoading(true);
      setError(null);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) throw new Error("USER_NOT_AUTHENTICATED");

      /**
       * 1️⃣ Chama Edge Function analyze-subscription
       */
      const { data: analysisResult, error: functionError } =
        await supabase.functions.invoke("analyze-subscription", {
          body: {
            userId: user.id,
            subscriptionId,
            transactions,
            metadata,
          },
        });

      if (functionError || !analysisResult) {
        throw new Error("ANALYSIS_FUNCTION_FAILED");
      }

      /**
       * 2️⃣ Persiste na tabela subscription_analysis
       *    Atualiza ou insere (upsert) para manter histórico atualizado
       */
      const { data: savedAnalysis, error: insertError } = await supabase
        .from("subscription_analysis")
        .upsert(
          {
            user_id: user.id,
            subscription_id: subscriptionId,
            ...analysisResult,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id,subscription_id",
          }
        )
        .select()
        .single();

      if (insertError) throw new Error("ANALYSIS_PERSISTENCE_FAILED");

      setData(savedAnalysis);
      return savedAnalysis;
    } catch (err: any) {
      setError(err.message ?? "UNKNOWN_ERROR");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    generateAnalysis,
    loading,
    error,
    data,
  };
}

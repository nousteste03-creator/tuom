import { useState } from "react";
import { supabase } from "@/lib/supabase";

type InvoiceAnalysisResult = {
  invoice_name: string;
  currency: string;
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
};

type UseInvoiceAnalysisState = {
  loading: boolean;
  error: string | null;
  data: InvoiceAnalysisResult | null;
};

export function useInvoiceAnalysis() {
  const [state, setState] = useState<UseInvoiceAnalysisState>({
    loading: false,
    error: null,
    data: null,
  });

  /**
   * PIPELINE COMPLETO:
   * 1. parse-invoice
   * 2. analyze-invoice
   * 3. persistência (invoice_analysis)
   */
  const analyzeInvoice = async ({
    fileContent,
    invoiceName,
  }: {
    fileContent: string;
    invoiceName: string;
  }) => {
    try {
      setState({ loading: true, error: null, data: null });

      /**
       * 1️⃣ PARSE
       */
      const parseResponse = await supabase.functions.invoke(
        "parse-invoice",
        {
          body: {
            file: {
              content: fileContent,
            },
          },
        }
      );

      const transactions = parseResponse.data?.transactions ?? [];

      if (transactions.length === 0) {
        throw new Error("NO_TRANSACTIONS_DETECTED");
      }

      /**
       * 2️⃣ ANALYZE (CONSOLIDADO)
       */
      const analysisResponse = await supabase.functions.invoke(
        "analyze-invoice",
        {
          body: {
            transactions,
            invoiceMetadata: {
              name: invoiceName,
            },
          },
        }
      );

      const analysis = analysisResponse.data;

      if (!analysis) {
        throw new Error("ANALYSIS_FAILED");
      }

      /**
       * 3️⃣ PERSISTE
       */
      const user = (await supabase.auth.getUser()).data.user;

      if (!user) {
        throw new Error("NOT_AUTHENTICATED");
      }

      await supabase.from("invoice_analysis").insert({
        user_id: user.id,
        invoice_name: analysis.invoice_name,
        currency: analysis.currency,
        monthly_total: analysis.monthly_total,
        annual_total: analysis.annual_total,
        charges_detected_count: analysis.charges_detected_count,

        billing_pattern_summary: analysis.billing_pattern_summary,
        price_trend: analysis.price_trend,
        price_variation_detected: analysis.price_variation_detected,
        price_change_frequency: analysis.price_change_frequency,

        market_signal: analysis.market_signal,
        news_based_price_pressure: analysis.news_based_price_pressure,
        risk_of_price_increase: analysis.risk_of_price_increase,
        risk_reason: analysis.risk_reason,
      });

      setState({
        loading: false,
        error: null,
        data: analysis,
      });

      return analysis;
    } catch (err: any) {
      setState({
        loading: false,
        error: err.message ?? "UNKNOWN_ERROR",
        data: null,
      });
      throw err;
    }
  };

  return {
    ...state,
    analyzeInvoice,
  };
}

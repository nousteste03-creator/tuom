// hooks/useGoalsInsights.ts
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useUserPlan } from "@/hooks/useUserPlan";

type InsightTab = "goals" | "debts" | "investments" | "income";

type Params = {
  tab: InsightTab;
  goals?: any[];
  debts?: any[];
  investments?: any[];
  incomeSources?: any[];
};

export function useGoalsInsights({
  tab,
  goals,
  debts,
  investments,
  incomeSources,
}: Params) {
  const { isPro } = useUserPlan();

  const [loading, setLoading] = useState(false);
  const [remoteInsights, setRemoteInsights] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  /* =========================================================
     NORMALIZAÇÃO DEFENSIVA (CRÍTICA)
  ========================================================= */
  const safeGoals = Array.isArray(goals) ? goals : [];
  const safeDebts = Array.isArray(debts) ? debts : [];
  const safeInvestments = Array.isArray(investments) ? investments : [];
  const safeIncomeSources = Array.isArray(incomeSources)
    ? incomeSources
    : [];

  /* ---------------------------------------------------------
     1) Definir função correta
  --------------------------------------------------------- */
  const fnName = useMemo(() => {
    const tier = isPro ? "premium" : "free";

    if (tab === "goals") return `goals-insights-${tier}`;
    if (tab === "debts") return `debts-insights-${tier}`;
    if (tab === "investments")
      return `investment-goal-insights-${tier}`;
    if (tab === "income") return `income-insights-${tier}`;

    return null;
  }, [tab, isPro]);

  /* ---------------------------------------------------------
     LOGS (SEGUROS)
  --------------------------------------------------------- */
  console.log("------------------------------------------------------");
  console.log("🔍 INSIGHTS - ABA:", tab);
  console.log("🔍 IS PRO?", isPro);
  console.log("🔍 Função selecionada:", fnName);
  console.log("📦 PAYLOAD (resume):", {
    goals: safeGoals.length,
    debts: safeDebts.length,
    investments: safeInvestments.length,
    incomeSources: safeIncomeSources.length,
  });
  console.log("------------------------------------------------------");

  /* ---------------------------------------------------------
     2) Payload unificado (SEGURO)
  --------------------------------------------------------- */
  const payload = useMemo(
    () => ({
      goals: safeGoals,
      debts: safeDebts,
      investments: safeInvestments,
      incomeSources: safeIncomeSources,
    }),
    [safeGoals, safeDebts, safeInvestments, safeIncomeSources]
  );

  /* ---------------------------------------------------------
     3) Chamada Edge Function
  --------------------------------------------------------- */
  useEffect(() => {
    if (!fnName) return;

    // 🔒 Não chamar se ainda não existe dado real
    if (
      safeGoals.length === 0 &&
      safeDebts.length === 0 &&
      safeInvestments.length === 0 &&
      safeIncomeSources.length === 0
    ) {
      console.log("⏭️ Insights ignorados — sem dados");
      return;
    }

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const { data: session } = await supabase.auth.getSession();
        const token = session?.session?.access_token;

        if (!token) {
          console.log("❌ Sem token JWT");
          return;
        }

        console.log("🌐 Chamando Edge Function:", fnName);

        const { data, error } = await supabase.functions.invoke(fnName, {
          body: payload,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (error) throw error;

        console.log("📥 RESPOSTA BRUTA:", data);

        setRemoteInsights(data?.insights ?? []);
      } catch (err) {
        console.log("🔥 ERRO useGoalsInsights:", err);
        setError("Falha ao gerar insights");
        setRemoteInsights([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [fnName, payload]);

  /* ---------------------------------------------------------
     4) Resultado final
  --------------------------------------------------------- */
  return {
    insights: remoteInsights,
    loading,
    error,
  };
}

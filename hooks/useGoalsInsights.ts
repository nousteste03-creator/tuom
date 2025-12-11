// hooks/useGoalsInsights.ts
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useGoals } from "@/hooks/useGoals";
import { useIncomeSources } from "@/hooks/useIncomeSources";
import { useUserPlan } from "@/hooks/useUserPlan";

/**
 * Hook oficial de insights por categoria (goals, debts, investments, income)
 * Agora com:
 * - JWT enviado para a Edge Function
 * - Logs completos
 * - Fallback local
 */
export function useGoalsInsights(
  tab: "goals" | "debts" | "investments" | "income"
) {
  const { goals, debts, investments } = useGoals();
  const { incomeSources } = useIncomeSources();
  const { isPro } = useUserPlan();

  const [loading, setLoading] = useState(true);
  const [remoteInsights, setRemoteInsights] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  /* ---------------------------------------------------------
   * 1) Escolher qual função será chamada
   --------------------------------------------------------- */
  const fnName = useMemo(() => {
    const tier = isPro ? "premium" : "free";

    if (tab === "goals") return `goals-insights-${tier}`;
    if (tab === "debts") return `debts-insights-${tier}`;
    if (tab === "investments") return `investment-goal-insights-${tier}`;
    if (tab === "income") return `income-insights-${tier}`;

    return null;
  }, [tab, isPro]);

  console.log("------------------------------------------------------");
  console.log("🔍 INSIGHTS - ABA:", tab);
  console.log("🔍 IS PRO?", isPro);
  console.log("🔍 Função selecionada:", fnName);
  console.log("------------------------------------------------------");

  /* ---------------------------------------------------------
   * 2) Criar payload unificado enviado às funções
   --------------------------------------------------------- */
  const payload = useMemo(
    () => ({
      goals,
      debts,
      investments,
      incomeSources,
    }),
    [goals, debts, investments, incomeSources]
  );

  console.log("📦 PAYLOAD:", {
    goals: goals.length,
    debts: debts.length,
    investments: investments.length,
    incomeSources: incomeSources.length,
  });

  /* ---------------------------------------------------------
   * 3) Chamada oficial da Edge Function
   * Agora com envio do JWT para respeitar RLS e Policies
   --------------------------------------------------------- */
  useEffect(() => {
    if (!fnName) return;

    if (!goals || !debts || !investments || !incomeSources) return;

    async function load() {
      try {
        setLoading(true);
        setRemoteInsights([]);
        setError(null);

        console.log("🌐 Chamando Edge Function:", fnName);

        // 1) Pegar o JWT do usuário
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;

        if (!token) {
          console.log("❌ SEM TOKEN — usuário não autenticado");
          setError("Usuário não autenticado");
          return;
        }

        // 2) Chamar a função com JWT
        const { data, error } = await supabase.functions.invoke(fnName, {
          body: payload,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (error) {
          console.log("❌ ERRO DA EDGE FUNCTION:", error);
          throw error;
        }

        console.log("📥 RESPOSTA BRUTA:", data);

        const items = data?.insights ?? [];

        console.log("📥 INSIGHTS REMOTOS:", items);

        setRemoteInsights(items);
      } catch (err) {
        console.log("🔥 ERRO NO HOOK useGoalsInsights:", err);
        setError("IA indisponível");
        setRemoteInsights([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [fnName, payload]);

  /* ---------------------------------------------------------
   * 4) Fallback local para quando a IA não retornar nada
   --------------------------------------------------------- */
  const fallback = useMemo(() => {
    const out: any[] = [];

    if (tab === "goals") {
      for (const g of goals) {
        if (g.progressPercent >= 70) {
          out.push({
            id: "fb-goal-" + g.id,
            type: "goals",
            severity: "positive",
            title: `Meta "${g.title}" está indo bem`,
            message: `Você já atingiu ${g.progressPercent.toFixed(0)}% da meta.`,
          });
        }
      }
    }

    if (tab === "debts") {
      for (const d of debts) {
        const next = d.installments?.find((i) => i.status !== "paid");
        if (next && next.amount > d.targetAmount * 0.2) {
          out.push({
            id: "fb-debt-" + d.id,
            type: "debts",
            severity: "danger",
            title: "Parcela alta encontrada",
            message: `A próxima parcela é de R$${next.amount.toFixed(2)}.`,
          });
        }
      }
    }

    if (tab === "investments") {
      for (const inv of investments) {
        if (inv.projection?.monthsToGoal <= 3) {
          out.push({
            id: "fb-invest-" + inv.id,
            type: "investments",
            severity: "positive",
            title: "Investimento perto da meta",
            message: `Faltam ${inv.projection.monthsToGoal} meses.`,
          });
        }
      }
    }

    if (tab === "income") {
      if (incomeSources.length === 0) {
        out.push({
          id: "fb-inc-0",
          type: "income",
          severity: "danger",
          title: "Nenhuma renda cadastrada",
          message: "Adicione sua renda para gerar projeções reais.",
        });
      }

      if (incomeSources.length === 1) {
        out.push({
          id: "fb-inc-1",
          type: "income",
          severity: "neutral",
          title: "Renda concentrada",
          message: "Depender de uma única fonte aumenta o risco financeiro.",
        });
      }
    }

    console.log("📦 FALLBACK LOCAL:", out);

    return out;
  }, [tab, goals, debts, investments, incomeSources]);

  /* ---------------------------------------------------------
   * 5) Resultado final exibido na UI
   --------------------------------------------------------- */
  const finalInsights =
    remoteInsights.length > 0 ? remoteInsights : fallback;

  console.log("📌 INSIGHTS FINAIS ENVIADOS PARA A UI:", finalInsights);
  console.log("------------------------------------------------------");

  return {
    insights: finalInsights,
    loading,
    error,
  };
}

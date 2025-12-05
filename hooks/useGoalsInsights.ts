import { useMemo } from "react";
import { useGoals, GoalWithStats } from "@/hooks/useGoals";
import { useIncomeSources, IncomeSource } from "@/hooks/useIncomeSources";

export function useGoalsInsights() {
  const { goals, debts, investments } = useGoals();
  const { incomeSources } = useIncomeSources();

  return useMemo(() => {
    const insights = [];

    /* ---------------------------------------------------------
       0. Segurança — caso os hooks ainda estejam carregando
    --------------------------------------------------------- */
    if (!goals || !debts || !investments || !incomeSources) {
      return { insights: [], loading: true };
    }

    /* ---------------------------------------------------------
       1. Meta indo bem (progress)
    --------------------------------------------------------- */
    for (const g of goals) {
      if (g.progressPercent >= 70) {
        insights.push({
          id: "progress-" + g.id,
          type: "progress",
          severity: "positive",
          title: `Sua meta "${g.title}" está indo muito bem`,
          message: `Você já alcançou ${g.progressPercent.toFixed(
            0
          )}% da meta. Continue nesse ritmo.`,
        });
      }
    }

    /* ---------------------------------------------------------
       2. Meta atrasada (delay)
    --------------------------------------------------------- */
    for (const g of goals) {
      if (g.aheadOrBehindMonths && g.aheadOrBehindMonths < -1) {
        insights.push({
          id: "delay-" + g.id,
          type: "delay",
          severity: "warning",
          title: `"${g.title}" está ficando para trás`,
          message: `Você está cerca de ${Math.abs(
            g.aheadOrBehindMonths
          ).toFixed(1)} meses atrás do plano.`,
        });
      }
    }

    /* ---------------------------------------------------------
       3. Dívidas com parcelas altas
    --------------------------------------------------------- */
    for (const d of debts) {
      const next = d.installments?.find((i) => i.status !== "paid");

      if (!next) continue;

      if (next.amount > d.targetAmount * 0.2) {
        insights.push({
          id: "debt-" + d.id,
          type: "debts",
          severity: "danger",
          title: `Parcela alta na dívida "${d.title}"`,
          message: `A próxima parcela de R$${next.amount.toFixed(
            2
          )} é significativa. Considere ajustar seu fluxo mensal.`,
        });
      }
    }

    /* ---------------------------------------------------------
       4. Investimento com grande potencial (próximo de bater meta)
    --------------------------------------------------------- */
    for (const inv of investments) {
      if (inv.projection && inv.projection.monthsToGoal <= 3) {
        insights.push({
          id: "invest-" + inv.id,
          type: "investments",
          severity: "positive",
          title: `Seu investimento "${inv.title}" está perto de completar`,
          message: `Faltam apenas ${inv.projection.monthsToGoal} meses para atingir o objetivo.`,
        });
      }
    }

    /* ---------------------------------------------------------
       5. Renda concentrada (alerta)
    --------------------------------------------------------- */
    if (incomeSources.length === 1) {
      insights.push({
        id: "income-1",
        type: "income",
        severity: "neutral",
        title: "Sua renda está concentrada em uma única fonte",
        message: "Diversificação tende a trazer estabilidade financeira.",
      });
    }

    /* ---------------------------------------------------------
       6. Nenhuma renda cadastrada (erro)
    --------------------------------------------------------- */
    if (incomeSources.length === 0) {
      insights.push({
        id: "income-0",
        type: "income",
        severity: "danger",
        title: "Nenhuma fonte de renda cadastrada",
        message:
          "Adicione sua renda para gerar projeções realistas e insights mais precisos.",
      });
    }

    return { insights, loading: false };
  }, [goals, debts, investments, incomeSources]);
}

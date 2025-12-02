// hooks/useIncomeToGoals.ts
import { useIncomeSources } from "./useIncomeSources";
import { useIncomeAnalytics } from "./useIncomeAnalytics";
import { useGoals } from "./useGoals";

export function useIncomeToGoals() {
  const { calculateMonthlyIncome } = useIncomeSources();
  const { calculateSavingsSuggestion } = useIncomeAnalytics();
  const { goals } = useGoals();

  /* ============================================================
     5.1 — estimateGoalTime(goal)
     Estimar quantos meses o usuário leva para bater a meta
============================================================ */
  function estimateGoalTime(goal: any) {
    if (!goal) return null;

    const monthlyIncome = calculateMonthlyIncome();
    const { value: suggestedSaving } = calculateSavingsSuggestion();

    const remaining = Math.max(
      goal.target_amount - goal.current_amount,
      0
    );

    if (suggestedSaving <= 0) return Infinity;

    const months = remaining / suggestedSaving;

    return {
      months: Math.ceil(months),
      monthlyContribution: suggestedSaving,
      remaining,
    };
  }

  /* ============================================================
     5.2 — suggestedMonthlySaving(goal)
     Quanto o usuário deveria guardar por mês para bater a meta
============================================================ */
  function suggestedMonthlySaving(goal: any) {
    if (!goal) return null;

    const monthlyIncome = calculateMonthlyIncome();
    const { value: baseSave } = calculateSavingsSuggestion();

    // regra:
    // metas maiores → sugerimos um pouco mais
    const factor =
      goal.target_amount > 50000
        ? 1.4
        : goal.target_amount > 20000
        ? 1.25
        : 1.1;

    const suggested = baseSave * factor;

    return {
      suggested,
      percentage: (suggested / monthlyIncome) * 100,
    };
  }

  /* ============================================================
     5.3 — integrateWithRenda(goalId)
     Retorna um pacote completo para a tela da meta:
       - prazo estimado
       - recomendação mensal
       - impacto da renda atual
============================================================ */
  function integrateWithRenda(goalId: string) {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return null;

    const estimation = estimateGoalTime(goal);
    const suggestion = suggestedMonthlySaving(goal);
    const monthlyIncome = calculateMonthlyIncome();

    return {
      goal,
      monthlyIncome,
      estimatedMonths: estimation?.months,
      monthlyContribution: estimation?.monthlyContribution,
      remaining: estimation?.remaining,
      suggestedMonthlySaving: suggestion?.suggested,
      suggestedSavingPct: suggestion?.percentage,
    };
  }

  /* ============================================================
     EXPORT
============================================================ */
  return {
    estimateGoalTime,
    suggestedMonthlySaving,
    integrateWithRenda,
  };
}

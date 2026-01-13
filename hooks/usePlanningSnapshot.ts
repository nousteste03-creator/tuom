import { useMemo, useEffect } from "react";
import { useIncomeSources } from "@/hooks/useIncomeSources";
import { useGoals } from "@/context/GoalsContext";
import { useBudget } from "@/context/BudgetContext";

export function usePlanningSnapshot() {
  /* ============================================================
     FONTES PRIMÁRIAS (DOMÍNIO)
  ============================================================ */

  const {
    totalMonthlyIncome,
    monthlyProjection,
    loading: loadingIncome,
  } = useIncomeSources();

  const {
    monthlyDebtOutflow,
    monthlyGoalsOutflow,
    monthlyInvestmentsOutflow,
    loading: loadingGoals,
  } = useGoals();

  const {
    totalExpenses, // despesas variáveis realizadas
    categories,
    loading: loadingBudget,
  } = useBudget();

  /* ============================================================
     SNAPSHOT DERIVADO (ORQUESTRAÇÃO APENAS)
     ❌ NÃO recalcula domínio financeiro
     ✅ Apenas compõe agregados oficiais
  ============================================================ */

  const snapshot = useMemo(() => {
    if (totalMonthlyIncome == null) return null;

    /* ---------- BUDGET VARIÁVEL ---------- */
    const variablePlanned = (categories ?? [])
      .filter((c) => !c.isFixed)
      .reduce((sum, c) => sum + Number(c.limit_amount || 0), 0);

    const variableUsed = Number(totalExpenses || 0);

    const variableRemaining = Math.max(
      variablePlanned - variableUsed,
      0
    );

    /* ---------- OUTFLOWS (FONTE ÚNICA: GoalsContext) ---------- */
    const investmentOutflow = Number(monthlyInvestmentsOutflow || 0);
    const debtOutflow = Number(monthlyDebtOutflow || 0);
    const goalsOutflow = Number(monthlyGoalsOutflow || 0);

    /**
     * committedBalance =
     * - despesas variáveis realizadas (budget)
     * - + compromissos mensais de dívidas
     * - + aportes de metas
     * - + aportes de investimentos
     */
    const committedBalance =
      variableUsed +
      investmentOutflow +
      debtOutflow +
      goalsOutflow;

    return {
      panel: {
        incomeTotal: totalMonthlyIncome,
        investmentOutflow,
        debtOutflow,
        goalsOutflow,
        committedBalance,
        freeBalance: totalMonthlyIncome - committedBalance,
        annualIncomeProjection: monthlyProjection(12),
      },

      budget: {
        variable: {
          planned: variablePlanned,
          used: variableUsed,
          remaining: variableRemaining,
          percentUsed:
            variablePlanned > 0
              ? Math.min((variableUsed / variablePlanned) * 100, 100)
              : 0,
        },
      },
    };
  }, [
    totalMonthlyIncome,
    monthlyProjection,
    monthlyDebtOutflow,
    monthlyGoalsOutflow,
    monthlyInvestmentsOutflow,
    totalExpenses,
    categories,
  ]);

  /* ============================================================
     LOADING GLOBAL
  ============================================================ */

  const loading =
    loadingIncome ||
    loadingGoals ||
    loadingBudget ||
    snapshot === null;

  /* ============================================================
     DEBUG CONTROLADO
  ============================================================ */

  useEffect(() => {
    console.log("🟢 [PlanningSnapshot] snapshot:", snapshot);
    console.log("🟢 [PlanningSnapshot] loading:", loading);
  }, [snapshot, loading]);

  return { snapshot, loading };
}

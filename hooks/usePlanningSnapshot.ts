import { useEffect, useState, useMemo, useCallback } from "react";
import { useIncomeSources } from "@/hooks/useIncomeSources";
import { useGoals } from "@/hooks/useGoals";
import { useBudget } from "@/context/BudgetContext";

export function usePlanningSnapshot() {
  const { totalMonthlyIncome, monthlyProjection, loading: loadingIncome } = useIncomeSources();
  const { debts, investments, goals, loading: loadingGoals } = useGoals();
  const { totalExpenses, categories, loading: loadingBudget } = useBudget();

  const [snapshotReady, setSnapshotReady] = useState(false);

  const snapshot = useMemo(() => {
    if (!totalMonthlyIncome) return null;

    const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

    const investmentOutflow = sum(investments.map((i) => i.autoRuleMonthly || 0));
    const debtOutflow = sum(debts.flatMap((d) => d.installments?.map((i) => i.amount) || []));
    const goalsOutflow = sum(goals.map((g) => g.autoRuleMonthly || 0));

    const variablePlanned = sum(
      (categories || []).filter(c => !c.isFixed).map(c => Number(c.limit_amount || 0))
    );
    const variableUsed = totalExpenses;
    const variableRemaining = variablePlanned - variableUsed;

    const committedBalance = totalExpenses + investmentOutflow + debtOutflow + goalsOutflow;

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
          percentUsed: variablePlanned > 0 ? Math.min((variableUsed / variablePlanned) * 100, 100) : 0,
        },
      },
    };
  }, [totalMonthlyIncome, investments, debts, goals, categories, totalExpenses, monthlyProjection]);

  // Marca quando snapshot está pronto
  useEffect(() => {
    if (snapshot) setSnapshotReady(true);
  }, [snapshot]);

  const loading = loadingIncome || loadingGoals || loadingBudget || !snapshotReady;

  // DEBUG
  useEffect(() => {
    console.log("🟢 [PlanningSnapshot] snapshot:", snapshot);
    console.log("🟢 [PlanningSnapshot] loading:", loading);
  }, [snapshot, loading]);

  return { snapshot, loading };
}

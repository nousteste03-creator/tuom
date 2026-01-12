import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useIncomeSources } from "@/hooks/useIncomeSources";
import { useGoals } from "@/hooks/useGoals";
import { useBudget } from "@/context/BudgetContext";

export function useFinanceSnapshot() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(true);

  const { totalMonthlyIncome, monthlyProjection, loading: loadingIncome } =
    useIncomeSources();

  const { debts, investments, goals, loading: loadingGoals } = useGoals();

  // ⬇️ já existia, apenas vamos CONSUMIR mais dados
  const {
    totalExpenses,
    categories,
    loading: loadingBudget,
    reload,
  } = useBudget();

  const fetchSubscriptions = useCallback(async () => {
    setLoadingSubs(true);

    const { data } = await supabase
      .from("subscriptions")
      .select("price, frequency");

    setSubscriptions(data?.filter((s) => s.frequency === "monthly") || []);
    setLoadingSubs(false);
  }, []);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const snapshot = useMemo(() => {
    if (!totalMonthlyIncome) return null;

    const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

    // --------------------------------------------------
    // FIXOS / AUTOMÁTICOS (já existiam)
    // --------------------------------------------------
    const fixedExpenseTotal = sum(subscriptions.map((s) => s.price || 0));
    const investmentOutflow = sum(investments.map((i) => i.autoRuleMonthly || 0));
    const debtOutflow = sum(
      debts.flatMap((d) => d.installments?.map((i) => i.amount) || [])
    );
    const goalsOutflow = sum(goals.map((g) => g.autoRuleMonthly || 0));

    // --------------------------------------------------
    // 🆕 ORÇAMENTO VARIÁVEL (NOVO — fonte: useBudget)
    // --------------------------------------------------
    const variablePlanned = sum(
      (categories || [])
        .filter((c: any) => !c.isFixed)
        .map((c: any) => Number(c.limit_amount || 0))
    );

    const variableUsed = totalExpenses;

    const variableRemaining = variablePlanned - variableUsed;

    const variablePercentUsed =
      variablePlanned > 0
        ? Math.min((variableUsed / variablePlanned) * 100, 100)
        : 0;

    // --------------------------------------------------
    // TOTAL COMPROMETIDO
    // --------------------------------------------------
    const committedBalance =
      totalExpenses +
      fixedExpenseTotal +
      investmentOutflow +
      debtOutflow +
      goalsOutflow;

    return {
      panel: {
        incomeTotal: totalMonthlyIncome,
        expenseTotal: totalExpenses,
        fixedExpenseTotal,
        investmentOutflow,
        debtOutflow,
        goalsOutflow,
        committedBalance,
        freeBalance: totalMonthlyIncome - committedBalance,
        annualIncomeProjection: monthlyProjection(12),
        annualOutflowProjection: committedBalance * 12,
      },

      // ⬇️ 🆕 BLOCO NOVO (não quebra ninguém)
      budget: {
        variable: {
          planned: variablePlanned,
          used: variableUsed,
          remaining: variableRemaining,
          percentUsed: variablePercentUsed,
        },
      },
    };
  }, [
    totalMonthlyIncome,
    totalExpenses,
    subscriptions,
    investments,
    debts,
    goals,
    categories,
    monthlyProjection,
  ]);

  return {
    snapshot,
    loading:
      loadingIncome || loadingGoals || loadingBudget || loadingSubs || !snapshot,
    reload: async () => {
      await Promise.all([fetchSubscriptions(), reload?.()]);
    },
  };
}

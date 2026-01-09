import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

import { useIncomeSources } from "@/hooks/useIncomeSources";
import { useGoals } from "@/hooks/useGoals";
import { useBudget } from "@/hooks/useBudget";

export type FinanceCategory = {
  id: string;
  title: string;
  spent: number;
  limit: number;
  percent: number;
};

export type FinanceSnapshot = {
  panel: {
    incomeTotal: number;
    expenseTotal: number;
    fixedExpenseTotal: number;
    investmentOutflow: number;
    debtOutflow: number;
    goalsOutflow: number;
    committedBalance: number;
    freeBalance: number;
    annualIncomeProjection: number;
    annualOutflowProjection: number;
  };
  budget: {
    totalSpent: number;
    totalLimit: number;
    percentUsed: number;
    categories: FinanceCategory[];
    subscriptions: { total: number };
    goalsTotal: number;
  };
};

export function useFinanceSnapshot() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(true);

  const { totalMonthlyIncome, monthlyProjection, loading: loadingIncome } =
    useIncomeSources();

  const { debts, investments, goals, loading: loadingGoals } = useGoals();

  const { categories, expenses, loading: loadingBudget } = useBudget();

  /* =========================
     ASSINATURAS
  ========================= */
  useEffect(() => {
    fetchSubscriptions();
  }, []);

  async function fetchSubscriptions() {
    setLoadingSubs(true);
    const { data, error } = await supabase
      .from("subscriptions")
      .select("id, price, frequency");

    if (error) {
      console.error("❌ [FinanceSnapshot] Erro ao buscar assinaturas", error);
      setSubscriptions([]);
    } else {
      setSubscriptions(data?.filter((s) => s.frequency === "monthly") ?? []);
    }
    setLoadingSubs(false);
  }

  /* =========================
     SNAPSHOT DERIVADO
     Sem loop de recalculo
  ========================= */
  const snapshot: FinanceSnapshot | null = useMemo(() => {
    const dataReady =
      totalMonthlyIncome !== null &&
      Array.isArray(categories) &&
      Array.isArray(expenses) &&
      Array.isArray(debts) &&
      Array.isArray(investments) &&
      Array.isArray(goals) &&
      Array.isArray(subscriptions);

    if (!dataReady) return null;

    const sum = (arr: number[]) => arr.reduce((acc, v) => acc + Number(v || 0), 0);

    const incomeTotal = Number(totalMonthlyIncome || 0);
    const investmentOutflow = sum(investments.map((i) => i.autoRuleMonthly ?? 0));
    const debtOutflow = sum(debts.flatMap((d) => d.installments?.map((i) => i.amount) ?? []));
    const goalsOutflow = sum(goals.map((g) => g.autoRuleMonthly ?? 0));
    const fixedExpenseTotal = sum(subscriptions.map((s) => s.price));

    const mappedCategories: FinanceCategory[] = categories.map((cat) => {
      const spent = sum(expenses.filter((e) => e.categoryId === cat.id).map((e) => e.amount));
      const limit = Number((cat as any).monthlyLimit ?? (cat as any).limit_amount ?? 0);
      const percent = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
      return { id: cat.id, title: cat.title, spent, limit, percent };
    });

    const expenseTotal = sum(mappedCategories.map((c) => c.spent));
    const totalLimit = sum(mappedCategories.map((c) => c.limit));

    const committedBalance = expenseTotal + fixedExpenseTotal + investmentOutflow + debtOutflow + goalsOutflow;
    const freeBalance = incomeTotal - committedBalance;

    return {
      panel: {
        incomeTotal,
        expenseTotal,
        fixedExpenseTotal,
        investmentOutflow,
        debtOutflow,
        goalsOutflow,
        committedBalance,
        freeBalance,
        annualIncomeProjection: monthlyProjection(12),
        annualOutflowProjection: committedBalance * 12,
      },
      budget: {
        totalSpent: expenseTotal + fixedExpenseTotal + goalsOutflow,
        totalLimit,
        percentUsed:
          totalLimit > 0
            ? Math.min(((expenseTotal + fixedExpenseTotal + goalsOutflow) / totalLimit) * 100, 100)
            : 0,
        categories: mappedCategories,
        subscriptions: { total: fixedExpenseTotal },
        goalsTotal: goalsOutflow,
      },
    };
  }, [totalMonthlyIncome, monthlyProjection, investments, debts, goals, subscriptions, categories, expenses]);

  const loading = snapshot === null || loadingIncome || loadingGoals || loadingBudget || loadingSubs;

  return { snapshot, loading, reload: fetchSubscriptions };
}

import { useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";

import { useSubscriptions } from "./useSubscriptions";
import { useCategories } from "./useCategories";
import { useGoals } from "./useGoals";
import { useOpenFinance } from "./useOpenFinance";

export function useFinance() {
  const { monthlyTotal: subsTotal } = useSubscriptions();
  const { categories } = useCategories();
  const { goals } = useGoals();
  const { connected } = useOpenFinance();

  // ───────────────────────────────────────────
  // CÁLCULOS DO PAINEL
  // ───────────────────────────────────────────
  const totalIncome = useMemo(
    () =>
      categories
        .filter((c) => c.type === "income")
        .reduce((t, c) => t + c.amount, 0),
    [categories]
  );

  const personalExpenses = useMemo(
    () =>
      categories
        .filter((c) => c.type === "expense")
        .reduce((t, c) => t + c.amount, 0),
    [categories]
  );

  const totalExpenses = subsTotal + personalExpenses;
  const balance = totalIncome - totalExpenses;

  // ───────────────────────────────────────────
  // SALVAR HISTÓRICO AUTOMATICAMENTE
  // ───────────────────────────────────────────

  async function saveHistory({
    userId,
    month,
    income,
    expenses,
    subscriptions,
    balance,
  }: {
    userId: string;
    month: string;
    income: number;
    expenses: number;
    subscriptions: number;
    balance: number;
  }) {
    await supabase.from("finance_history").upsert(
      {
        user_id: userId,
        month,
        income,
        expenses,
        subscriptions,
        balance,
      },
      { onConflict: "user_id,month" }
    );
  }

  useEffect(() => {
    async function persist() {
      const { data } = await supabase.auth.getSession();
      const user = data?.session?.user;
      if (!user) return;

      const month = new Date().toISOString().slice(0, 7); // YYYY-MM

      await saveHistory({
        userId: user.id,
        month,
        income: totalIncome,
        expenses: totalExpenses,
        subscriptions: subsTotal,
        balance,
      });
    }

    persist();
  }, [totalIncome, totalExpenses, subsTotal, balance]);

  // ───────────────────────────────────────────
  // RETORNO FINAL
  // ───────────────────────────────────────────
  return {
    totalIncome,
    totalExpenses,
    subsTotal,
    personalExpenses,
    balance,
    goals,
    openFinanceEnabled: connected,
    insight:
      balance < 0
        ? "Seu mês tende ao negativo. Vamos ajustar juntos."
        : balance < totalExpenses * 0.15
        ? "Positivo, mas apertado. Pequenos ajustes já aliviam."
        : "Mês saudável com folga. Ótimo para reforçar metas.",
  };
}

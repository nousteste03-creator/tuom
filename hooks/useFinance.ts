// hooks/useFinance.ts
import { useMemo, useState } from "react";
import { useSubscriptions } from "./useSubscriptions";
import { useBudget } from "./useBudget";
import { useGoals } from "./useGoals";
import { useOpenFinance } from "./useOpenFinance";

export function useFinance() {
  // Assinaturas
  const { monthlyTotal: subsTotal, reload: reloadSubs } = useSubscriptions();

  // Orçamento (Budget)
  const {
    totalExpenses: budgetTotal,
    totalsByCategory,
    reload: reloadBudget,
  } = useBudget();

  // Metas
  const { goals, reload: reloadGoals } = useGoals();

  // Placeholder Open Finance
  const { connected } = useOpenFinance();

  const [loading, setLoading] = useState(false);

  // --------------------------------------------------------
  // SAÍDAS DO MÊS = categorias + assinaturas
  // --------------------------------------------------------
  const totalExpenses = subsTotal + budgetTotal;

  // --------------------------------------------------------
  // RECEITA – por enquanto sempre 0 (até integrar)
  // --------------------------------------------------------
  const totalIncome = 0;

  // --------------------------------------------------------
  // SALDO
  // --------------------------------------------------------
  const balance = totalIncome - totalExpenses;

  // --------------------------------------------------------
  // PROJEÇÃO ANUAL
  // --------------------------------------------------------
  const annualProjection = totalExpenses * 12;

  // --------------------------------------------------------
  // INSIGHT
  // --------------------------------------------------------
  const insight =
    balance < 0
      ? "Seu mês tende ao negativo. Vamos ajustar juntos."
      : balance < totalExpenses * 0.15
      ? "Positivo, mas apertado. Pequenos ajustes já aliviam."
      : "Mês saudável com folga. Ótimo para reforçar metas.";

  // --------------------------------------------------------
  // RELOAD GLOBAL
  // --------------------------------------------------------
  async function reload() {
    setLoading(true);
    await Promise.all([reloadSubs?.(), reloadBudget?.(), reloadGoals?.()]);
    setLoading(false);
  }

  return {
    // Saídas
    totalExpenses,
    subsTotal,
    budgetTotal,

    // Entradas
    totalIncome,

    // Painel
    balance,
    annualProjection,
    insight,

    // Extras
    totalsByCategory,
    goals,
    openFinanceEnabled: connected,
    loading,

    // API
    reload,
  };
}

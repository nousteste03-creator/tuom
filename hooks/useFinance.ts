// hooks/useFinance.ts
import { useMemo, useState } from "react";
import { useSubscriptions } from "./useSubscriptions";
import { useBudget } from "./useBudget";
import { useGoals } from "./useGoals";
import { useOpenFinance } from "./useOpenFinance";

export function useFinance() {
  // Assinaturas
  const { monthlyTotal: subsTotal, reload: reloadSubs } = useSubscriptions();

  // Orçamento
  const {
    totalExpenses: budgetTotal,
    totalsByCategory,
    reload: reloadBudget,
  } = useBudget();

  // Metas (agora incluímos projecao_mensal)
  const { goals, getGoals: reloadGoals } = useGoals();

  // Open Finance
  const { connected } = useOpenFinance();

  const [loading, setLoading] = useState(false);

  // --------------------------------------------------------
  // TOTAL DE DESPESAS (assinaturas + orçamento)
  // --------------------------------------------------------
  const totalExpenses = subsTotal + budgetTotal;

  // --------------------------------------------------------
  // PROJEÇÃO DAS METAS (PRO)
  // Somatório da coluna projecao_mensal das metas ativas
  // --------------------------------------------------------
  const totalGoalsMonthlyProjection = useMemo(() => {
    if (!goals || goals.length === 0) return 0;

    return goals
      .filter(
        (g) =>
          g.status === "active" &&
          (g.tipo === "meta" || g.tipo === "investimento") &&
          g.projecao_mensal !== null &&
          g.projecao_mensal !== undefined
      )
      .reduce((acc, g) => acc + Number(g.projecao_mensal), 0);
  }, [goals]);

  // --------------------------------------------------------
  // RECEITA (placeholder até metas entrarem)
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

    // Projeção de metas (PRO)
    totalGoalsMonthlyProjection,

    // Extras
    totalsByCategory,
    goals,
    openFinanceEnabled: connected,
    loading,

    // API
    reload,
  };
}

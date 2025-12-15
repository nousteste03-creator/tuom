// hooks/useFinance.ts
import { useMemo, useState } from "react";

import { useSubscriptions } from "./useSubscriptions";
import { useBudget } from "./useBudget";
import { useIncomeSources } from "@/hooks/useIncomeSources";
import { useGoals } from "@/context/GoalsContext";
import { useOpenFinance } from "./useOpenFinance";

export function useFinance() {
  /* =========================================================
     FONTES
  ========================================================= */

  // Assinaturas
  const { monthlyTotal: subsTotal, reload: reloadSubs } = useSubscriptions();

  // Orçamento
  const {
    totalExpenses: budgetTotal,
    totalsByCategory,
    reload: reloadBudget,
  } = useBudget();

  // Receitas
  const {
    incomeSources,
    totalMonthlyIncome,
    reload: reloadIncome,
  } = useIncomeSources();

  // Metas / Dívidas
  const {
    debts,
    monthlyDebtOutflow,
    reload: reloadGoals,
  } = useGoals();

  // Open Finance
  const { connected } = useOpenFinance();

  const [loading, setLoading] = useState(false);

  /* =========================================================
     CLASSIFICAÇÃO DE RECEITAS
  ========================================================= */

  const variableIncome = useMemo(() => {
    return incomeSources.filter(
      (src) => src.active && src.frequency === "once"
    );
  }, [incomeSources]);

  const variableIncomeTotal = useMemo(() => {
    return variableIncome.reduce((acc, src) => acc + Number(src.amount || 0), 0);
  }, [variableIncome]);

  /* =========================================================
     CLASSIFICAÇÃO DE DÍVIDAS
  ========================================================= */

  // Dívidas variáveis = parcelas únicas (sem recorrência futura)
  const variableDebtTotal = useMemo(() => {
    let total = 0;

    for (const debt of debts) {
      const unpaid = debt.installments.filter(
        (i) => i.status !== "paid"
      );

      if (unpaid.length === 1) {
        total += Number(unpaid[0].amount || 0);
      }
    }

    return total;
  }, [debts]);

  /* =========================================================
     SAÍDAS MENSAIS (RECORRENTES)
  ========================================================= */

  const monthlyExpenses =
    subsTotal + budgetTotal + monthlyDebtOutflow;

  /* =========================================================
     ENTRADAS MENSAIS (RECORRENTES)
  ========================================================= */

  const monthlyIncome = totalMonthlyIncome;

  /* =========================================================
     TOTAIS DO MÊS (PAINEL)
  ========================================================= */

  const totalIncome = monthlyIncome + variableIncomeTotal;
  const totalExpenses = monthlyExpenses + variableDebtTotal;

  /* =========================================================
     SALDO
  ========================================================= */

  const balance = totalIncome - totalExpenses;

  /* =========================================================
     PROJEÇÕES ANUAIS (12 MESES)
  ========================================================= */

  // ENTRADAS
  const annualIncomeFixed = monthlyIncome * 12;
  const annualIncomeWithVariable =
    annualIncomeFixed + variableIncomeTotal;

  // SAÍDAS
  const annualExpensesFixed = monthlyExpenses * 12;
  const annualExpensesWithVariable =
    annualExpensesFixed + variableDebtTotal;

  /* =========================================================
     INSIGHT
  ========================================================= */

  const insight =
    balance < 0
      ? "Seu mês tende ao negativo. Vamos ajustar juntos."
      : balance < totalExpenses * 0.15
      ? "Positivo, mas apertado. Pequenos ajustes já aliviam."
      : "Mês saudável com folga. Ótimo para reforçar metas.";

  /* =========================================================
     RELOAD GLOBAL
  ========================================================= */

  async function reload() {
    setLoading(true);
    await Promise.all([
      reloadSubs?.(),
      reloadBudget?.(),
      reloadIncome?.(),
      reloadGoals?.(),
    ]);
    setLoading(false);
  }

  /* =========================================================
     RETURN — CONTRATO FINANCE
  ========================================================= */

  return {
    /* ---------- ENTRADAS ---------- */
    totalIncome,
    monthlyIncome,
    variableIncomeTotal,

    /* ---------- SAÍDAS ---------- */
    totalExpenses,
    monthlyExpenses,
    variableDebtTotal,
    subsTotal,
    budgetTotal,

    /* ---------- PROJEÇÕES ---------- */
    projections: {
      income: {
        fixed: annualIncomeFixed,
        withVariable: annualIncomeWithVariable,
      },
      expenses: {
        fixed: annualExpensesFixed,
        withVariable: annualExpensesWithVariable,
      },
    },

    /* ---------- PAINEL ---------- */
    balance,
    insight,

    /* ---------- EXTRAS ---------- */
    totalsByCategory,
    debts,
    openFinanceEnabled: connected,
    loading,

    /* ---------- API ---------- */
    reload,
  };
}

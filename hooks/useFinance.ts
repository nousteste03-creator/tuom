// hooks/useFinance.ts
import { useMemo, useState } from "react";

import { useSubscriptions } from "./useSubscriptions";
import { useBudget } from "./useBudget";
import { useIncomeSources } from "@/hooks/useIncomeSources";
import { useGoals } from "@/context/GoalsContext";
import { useOpenFinance } from "./useOpenFinance";
import { useUserSettings } from "@/context/UserSettingsContext";

export function useFinance() {
  /* =========================================================
     SETTINGS
  ========================================================= */

  const { settings } = useUserSettings();

  /* =========================================================
     FONTES
  ========================================================= */

  // Assinaturas
  const { monthlyTotal: subsTotal, reload: reloadSubs } =
    useSubscriptions();

  // Orçamento (despesas comuns)
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

  // Metas / Dívidas / Investimentos
  const {
    debts,
    monthlyDebtOutflow,
    monthlyGoalsOutflow,
    monthlyInvestmentsOutflow,
    reload: reloadGoals,
  } = useGoals();

  // Open Finance
  const { connected } = useOpenFinance();

  const [loading, setLoading] = useState(false);

  /* =========================================================
     ENTRADAS
  ========================================================= */

  const fixedIncome = totalMonthlyIncome;

  const variableIncome = useMemo(() => {
    return incomeSources.filter(
      (src) => src.active && src.frequency === "once"
    );
  }, [incomeSources]);

  const variableIncomeTotal = useMemo(() => {
    return variableIncome.reduce(
      (acc, src) => acc + Number(src.amount || 0),
      0
    );
  }, [variableIncome]);

  const totalIncome = fixedIncome + variableIncomeTotal;

  /* =========================================================
     DÍVIDAS VARIÁVEIS (parcelas únicas)
  ========================================================= */

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
     SAÍDAS FINANCEIRAS (gasto real)
  ========================================================= */

  const financialOutflows =
    subsTotal +       // assinaturas
    budgetTotal;      // despesas do orçamento

  /* =========================================================
     CONSTRUÇÃO FINANCEIRA (alocação de capital)
  ========================================================= */

  const investmentsOutflow =
    settings?.consider_investments_in_cashflow
      ? monthlyInvestmentsOutflow
      : 0;

  const financialConstruction =
    monthlyGoalsOutflow +
    investmentsOutflow;

  /* =========================================================
     DÍVIDAS FINANCEIRAS
  ========================================================= */

  const debtOutflows =
    monthlyDebtOutflow + variableDebtTotal;

  /* =========================================================
     TOTAIS DO MÊS
  ========================================================= */

  const totalMonthlyOutflows =
    financialOutflows +
    financialConstruction +
    debtOutflows;

  /* =========================================================
     SALDOS (NOVO MODELO)
  ========================================================= */

  // Saldo livre → o que sobra após gastos reais
  const freeBalance =
    totalIncome - financialOutflows;

  // Saldo comprometido → construção + dívidas
  const committedBalance =
    financialConstruction + debtOutflows;

  /* =========================================================
     PROJEÇÕES ANUAIS
  ========================================================= */

  // RECEBIMENTOS + CONSTRUÇÃO
  const annualIncomeProjection =
    fixedIncome * 12 +
    variableIncomeTotal +
    financialConstruction * 12;

  // SAÍDAS + DÍVIDAS
  const annualOutflowsProjection =
    financialOutflows * 12 +
    debtOutflows * 12;

  /* =========================================================
     INSIGHT
  ========================================================= */

  const insight =
    freeBalance < 0
      ? "Seu saldo livre está negativo. Ajustes urgentes são recomendados."
      : freeBalance < financialOutflows * 0.15
      ? "Saldo livre positivo, porém apertado. Pequenas otimizações ajudam."
      : "Saldo livre saudável. Bom momento para fortalecer metas.";

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
     RETURN — CONTRATO FINAL FINANCE
  ========================================================= */

  return {
    /* ---------- ENTRADAS ---------- */
    income: {
      fixed: fixedIncome,
      variable: variableIncomeTotal,
      total: totalIncome,
    },

    /* ---------- SAÍDAS ---------- */
    outflows: {
      financial: financialOutflows,
      construction: financialConstruction,
      debts: debtOutflows,
      total: totalMonthlyOutflows,
      breakdown: {
        subscriptions: subsTotal,
        budget: budgetTotal,
        goals: monthlyGoalsOutflow,
        investments: investmentsOutflow,
        debts: monthlyDebtOutflow,
        variableDebts: variableDebtTotal,
      },
    },

    /* ---------- SALDOS ---------- */
    balances: {
      free: freeBalance,
      committed: committedBalance,
    },

    /* ---------- PROJEÇÕES ---------- */
    projections: {
      annual: {
        incomePlusConstruction: annualIncomeProjection,
        outflowsPlusDebts: annualOutflowsProjection,
      },
    },

    /* ---------- PAINEL ---------- */
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

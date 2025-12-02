// hooks/useIncomeAnalytics.ts
import { useMemo } from "react";
import { useIncomeSources } from "./useIncomeSources";
import { useIncomeHistory } from "./useIncomeHistory";

/* ============================================================
   Tipagem de retorno
============================================================ */
export type IncomeProjection = {
  month: string;   // "2025-03"
  projected: number;
};

export type IncomeInsight = {
  title: string;
  description: string;
  highlight?: string;
};

export function useIncomeAnalytics() {
  const { sources, calculateMonthlyIncome } = useIncomeSources();
  const { history, getMonthlyAverage, getVariation } = useIncomeHistory();

  /* ============================================================
     4.1 — PROJEÇÃO DE RENDA
     Lógica:
     - média dos últimos meses
     - tendência atual (variação)
     - pondera renda fixa + variável
============================================================ */
  function calculateProjection(months = 6): IncomeProjection[] {
    const avg = getMonthlyAverage();
    const variation = getVariation() / 100; // transformar em decimal

    const projections: IncomeProjection[] = [];

    for (let i = 1; i <= months; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() + i);

      const month = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      // projeção heurística
      const projected = avg * Math.pow(1 + variation, i);

      projections.push({
        month,
        projected: Number(projected.toFixed(2)),
      });
    }

    return projections;
  }

  /* ============================================================
     4.2 — Média simples da renda atual
============================================================ */
  function calculateAverageIncome() {
    return getMonthlyAverage();
  }

  /* ============================================================
     4.3 — INSIGHTS AUTOMÁTICOS
============================================================ */
  const generateInsights = useMemo((): IncomeInsight[] => {
    const insights: IncomeInsight[] = [];

    const monthly = calculateMonthlyIncome();
    const avg = getMonthlyAverage();
    const variation = getVariation();

    const fixed = sources
      .filter((s) => s.tipo === "salario" || s.tipo === "empresa")
      .reduce((acc, s) => acc + Number(s.valor), 0);

    const variable = sources
      .filter((s) => s.tipo === "servico" || s.tipo === "variavel")
      .reduce((acc, s) => acc + Number(s.valor), 0);

    const fixedPct = fixed > 0 ? (fixed / monthly) * 100 : 0;
    const varPct = variable > 0 ? (variable / monthly) * 100 : 0;

    // ✔ Insight 1: Renda fixa domina?
    if (fixedPct >= 60) {
      insights.push({
        title: "Renda estável",
        description: `Sua renda fixa representa ${fixedPct.toFixed(
          1
        )}% da sua renda total.`,
        highlight: "Boa estabilidade",
      });
    }

    // ✔ Insight 2: Renda variável alta
    if (varPct >= 40) {
      insights.push({
        title: "Renda variável elevada",
        description: `Sua renda variável representa ${varPct.toFixed(
          1
        )}% da sua renda mensal.`,
        highlight: "Atenção à volatilidade",
      });
    }

    // ✔ Insight 3: Crescimento ou queda
    if (variation > 0) {
      insights.push({
        title: "Sua renda está crescendo",
        description: `Você aumentou sua renda em ${variation.toFixed(
          1
        )}% em relação ao mês anterior.`,
        highlight: "Ótimo desempenho!",
      });
    } else if (variation < 0) {
      insights.push({
        title: "Renda caiu este mês",
        description: `Sua renda diminuiu ${Math.abs(variation).toFixed(
          1
        )}% comparado ao mês anterior.`,
        highlight: "Ajuste sua reserva",
      });
    }

    // ✔ Insight 4: Comparação com média histórica
    if (monthly > avg) {
      insights.push({
        title: "Acima da média",
        description: `Você está ${((monthly / avg - 1) * 100).toFixed(
          1
        )}% acima da sua média histórica.`,
      });
    } else {
      insights.push({
        title: "Abaixo da média",
        description: `Sua renda está ${((1 - monthly / avg) * 100).toFixed(
          1
        )}% abaixo da média dos últimos meses.`,
      });
    }

    return insights;
  }, [sources, history]);

  /* ============================================================
     4.4 — SUGESTÃO DE POUPANÇA
     - usa renda atual
     - média
     - volatilidade da renda variável
============================================================ */
  function calculateSavingsSuggestion() {
    const monthly = calculateMonthlyIncome();
    const avg = getMonthlyAverage();

    const variablePart = sources
      .filter((s) => s.tipo === "servico" || s.tipo === "variavel")
      .reduce((acc, s) => acc + Number(s.valor), 0);

    const volatility = variablePart / monthly; // 0 a 1

    // regra heurística:
    // quanto mais variável a renda → mais o usuário deve poupar
    let suggestedPct = 0.10; // mínimo: 10%

    if (volatility > 0.3) suggestedPct = 0.15;
    if (volatility > 0.5) suggestedPct = 0.20;

    const suggestedValue = monthly * suggestedPct;

    return {
      percentage: suggestedPct * 100,
      value: Number(suggestedValue.toFixed(2)),
    };
  }

  /* ============================================================
     EXPORTAR
============================================================ */
  return {
    calculateProjection,
    calculateAverageIncome,
    generateInsights,
    calculateSavingsSuggestion,
  };
}

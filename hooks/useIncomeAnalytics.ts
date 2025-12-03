// hooks/useIncomeAnalytics.ts
import { IncomeHistory } from "./useIncomeHistory";
import { useIncomeSources } from "./useIncomeSources";

export type IncomeInsight = {
  title: string;
  description: string;
  highlight?: boolean;
};

/*  
  Agora o hook recebe o HISTORY de fora,
  porque a tela já carregou o history e
  não queremos criar um history separado.
*/
export function useIncomeAnalytics(history: IncomeHistory[]) {
  const { calculateMonthlyIncome } = useIncomeSources();

  /* ============================================================
     CÁLCULOS BASEADOS EM HISTORY REAL
  ============================================================ */

  function getVariation(): number {
    if (!history || history.length < 2) return 0;

    const last = history.at(-1)!;
    const before = history.at(-2)!;

    if (!before.total || before.total === 0) return 0;

    const diff = last.total - before.total;
    return (diff / before.total) * 100;
  }

  function getMonthlyAverage(): number {
    if (!history || history.length === 0) return 0;
    const sum = history.reduce((acc, h) => acc + (h.total || 0), 0);
    return sum / history.length;
  }

  /* ============================================================
     1) PROJEÇÃO — funciona mesmo sem histórico
  ============================================================ */
  function calculateProjection(months: number) {
    const base = calculateMonthlyIncome(); // R$ total atual
    const variation = getVariation();      // % entre último mês e o anterior

    const result = [];

    // Se não tiver histórico, mantém a projeção linear (sem variação)
    const growth = variation !== 0 ? variation / 100 : 0;

    for (let i = 1; i <= months; i++) {
      const projected = base * Math.pow(1 + growth, i);
      result.push({ month: i, projected });
    }

    return result;
  }

  /* ============================================================
     2) INSIGHTS — agora funciona mesmo sem history
  ============================================================ */
  function generateInsights(): IncomeInsight[] {
    const insights: IncomeInsight[] = [];

    const variation = getVariation();
    const avg = getMonthlyAverage();
    const current = calculateMonthlyIncome();

    /* -------------------------------
       CASO 1 — Sem histórico,
       mas com renda cadastrada
    ------------------------------- */
    if (!history.length && current > 0) {
      insights.push({
        title: "Primeiro mês registrado",
        description:
          `Sua renda mensal é de R$ ${current.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
          })}. Com mais meses adicionados, vamos gerar análises reais.`,
        highlight: true,
      });

      return insights;
    }

    /* -------------------------------
       CASO 2 — Histórico suficiente
    ------------------------------- */
    if (variation > 0) {
      insights.push({
        title: "Sua renda está crescendo 📈",
        description: `Aumento de ${variation.toFixed(
          1
        )}% em relação ao mês anterior.`,
        highlight: true,
      });
    }

    if (variation < 0) {
      insights.push({
        title: "Atenção à sua renda 👀",
        description: `Queda de ${variation.toFixed(
          1
        )}% comparado ao mês anterior.`,
      });
    }

    if (current > avg && avg > 0) {
      insights.push({
        title: "Acima da média histórica",
        description: `Sua renda atual está maior que sua média de ${avg.toLocaleString(
          "pt-BR",
          { minimumFractionDigits: 2 }
        )}.`,
      });
    }

    /* -------------------------------
       CASO 3 — Nenhum insight gerado
    ------------------------------- */
    if (insights.length === 0) {
      insights.push({
        title: "Renda estável",
        description:
          "Nenhuma variação significativa detectada nos últimos meses.",
      });
    }

    return insights;
  }

  /* ============================================================
     3) Sugestão de quanto guardar mensalmente
  ============================================================ */
  function calculateSavingsSuggestion() {
    const income = calculateMonthlyIncome();
    const value = income * 0.15; // 15% da renda
    return { value };
  }

  /* ============================================================
     EXPORTS
  ============================================================ */
  return {
    calculateProjection,
    generateInsights,
    calculateSavingsSuggestion,
  };
}

// hooks/useDebtAnalytics.ts
import { Installment } from "./useInstallments";

export function useDebtAnalytics() {
  /* ============================================================
     1) calculateDebtProgress(goal, installments)
     Retorna % concluída com base nas parcelas pagas
  ============================================================ */
  function calculateDebtProgress(goal: any, installments: Installment[]) {
    if (!goal || !installments.length) return 0;

    const total = installments.reduce(
      (acc, i) => acc + (Number(i.valor) || 0),
      0
    );

    const paid = installments
      .filter((i) => i.status === "pago")
      .reduce((acc, i) => acc + (Number(i.valor) || 0), 0);

    if (total === 0) return 0;

    return Number(((paid / total) * 100).toFixed(1));
  }

  /* ============================================================
     2) estimatePayoffDate(goal, installments)
     Retorna a previsão da data em que a dívida ficará quitada
     (última parcela pendente)
  ============================================================ */
  function estimatePayoffDate(goal: any, installments: Installment[]) {
    if (!goal || !installments.length) return null;

    const pendentes = installments.filter((i) => i.status === "pendente");

    if (pendentes.length === 0) return "Quitada";

    const ultima = pendentes.at(-1); // última parcela

    return ultima?.data_vencimento || null;
  }

  /* ============================================================
     3) generateDebtInsights(goal, installments)
     HEURÍSTICO (FREE)
     Baseado em lógica financeira real
  ============================================================ */
  function generateDebtInsights(goal: any, installments: Installment[]) {
    if (!goal || !installments.length) {
      return [
        {
          title: "Adicione parcelas",
          description: "Crie o cronograma da sua dívida para ver análises.",
        },
      ];
    }

    const total = installments.reduce(
      (acc, i) => acc + (Number(i.valor) || 0),
      0
    );

    const paid = installments
      .filter((i) => i.status === "pago")
      .reduce((acc, i) => acc + (Number(i.valor) || 0), 0);

    const pendentes = installments.filter((i) => i.status === "pendente");
    const restantes = pendentes.length;

    const insights = [];

    // 1 — Já pagou metade
    if (paid >= total * 0.5) {
      insights.push({
        title: "Você já passou da metade!",
        description:
          "A maior parte da dívida já está paga. Continue assim para quitar mais rápido.",
        highlight: true,
      });
    }

    // 2 — Falta pouco
    if (paid >= total * 0.8) {
      insights.push({
        title: "Reta final",
        description: `A dívida está quase quitada — faltam apenas ${restantes} parcelas.`,
      });
    }

    // 3 — Dívida longa
    if (restantes >= 12) {
      insights.push({
        title: "Compromisso de longo prazo",
        description:
          "Essa dívida acompanha você por mais de um ano. Analise se vale antecipar parcelas.",
      });
    }

    // 4 — Primeira parcela ainda pendente
    if (paid === 0) {
      insights.push({
        title: "Primeiros passos",
        description:
          "Nenhuma parcela foi quitada ainda. Pagar a primeira já melhora sua linha do tempo.",
      });
    }

    if (insights.length === 0) {
      insights.push({
        title: "Linha do tempo gerada",
        description: "Continue pagando para obter novos insights.",
      });
    }

    return insights;
  }

  /* ============================================================
     4) generateDebtInsightsAI() — PRO (futuro)
     Integração com OpenAI / DeepSeek / Anthropic
  ============================================================ */
  async function generateDebtInsightsAI(payload: {
    goal: any;
    installments: Installment[];
  }) {
    // futuro: integração com IA paga
    return {
      title: "Recurso Premium",
      description:
        "A análise inteligente da dívida será gerada com IA no plano PRO.",
    };
  }

  /* ============================================================
     EXPORT
  ============================================================ */
  return {
    calculateDebtProgress,
    estimatePayoffDate,
    generateDebtInsights,
    generateDebtInsightsAI,
  };
}

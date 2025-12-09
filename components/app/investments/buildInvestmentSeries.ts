import { SeriesMap, SeriesPoint } from "./InvestmentTimeframesPanel";

/**
 * Constrói séries REALISTAS no estilo Apple Stocks
 * combinando:
 *  - valor atual real
 *  - histórico real (parcelas/aportes pagos)
 *  - projeção futura
 */
export function buildInvestmentSeries(goal: any): SeriesMap {
  const now = new Date();

  // 1. PONTO REAL ATUAL
  const basePoint: SeriesPoint = {
    date: now.toISOString().split("T")[0],
    value: goal.currentAmount ?? 0,
  };

  // 2. HISTÓRICO REAL (parcelas / aportes pagos)
  const history: SeriesPoint[] = (goal.installments ?? [])
    .filter((i: any) => i.status === "paid")
    .map((i: any) => ({
      date: i.paidAt ?? i.dueDate,
      value: i.amount,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // 3. PROJEÇÃO FUTURA
  const future: SeriesPoint[] =
    goal.projection?.curveFuture?.map((p: any) => ({
      date: p.date,
      value: p.value,
    })) ?? [];

  // 4. SÉRIE COMPLETA (histórico → atual → futuro)
  const fullSeries: SeriesPoint[] = [
    ...history,
    basePoint,
    ...future,
  ];

  // 5. CRIA TIMEFRAMES
  const makeRange = (days: number): SeriesPoint[] => {
    const limit = new Date();
    limit.setDate(limit.getDate() - days);
    return fullSeries.filter(
      (p) => new Date(p.date).getTime() >= limit.getTime()
    );
  };

  return {
    "1D": makeRange(1),
    "1S": makeRange(7),
    "1M": makeRange(30),
    "3M": makeRange(90),
    "1Y": makeRange(365),
    ALL: fullSeries,
  };
}

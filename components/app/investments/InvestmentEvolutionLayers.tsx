// components/app/investments/InvestmentEvolutionLayers.tsx
import React, { useEffect, useMemo } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";

/* ============================================================
   TIPOS
============================================================ */

export type TimeframeKey = "1D" | "1S" | "1M" | "3M" | "1Y" | "ALL";

type LayerModel = {
  value: number; // absoluto (R$)
  kind: "start" | "now" | "future";
};

/* ============================================================
   CONFIG
============================================================ */

const brandFont = Platform.select({
  ios: "SF Pro Display",
  android: "Inter",
  default: "System",
});

const MAX_LAYERS = 8;

/**
 * Quantas camadas futuras mostrar (além de "agora")
 * - 1D: só comparação (start/now) sem futuro
 */
const FUTURE_LAYERS_BY_TIMEFRAME: Record<TimeframeKey, number> = {
  "1D": 0,
  "1S": 1,
  "1M": 2,
  "3M": 3,
  "1Y": 6,
  ALL: 8,
};

const timeframeLabel: Record<TimeframeKey, string> = {
  "1D": "hoje",
  "1S": "últimos 7 dias",
  "1M": "último mês",
  "3M": "últimos 3 meses",
  "1Y": "últimos 12 meses",
  ALL: "plano completo",
};

const CHART_HEIGHT = 118; // altura fixa das barras (px)
const BAR_RADIUS = 10;

/* ============================================================
   PROPS
============================================================ */

type Props = {
  currentAmount: number;
  targetAmount: number;
  monthlyContribution?: number | null;
  timeframe: TimeframeKey;
  /** data final opcional (YYYY-MM-DD) */
  endDate?: string | null;
};

/* ============================================================
   HELPERS
============================================================ */

function clamp(v: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, v));
}

function formatCurrency(v: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(v || 0);
}

function parseISODate(date?: string | null) {
  if (!date) return null;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function monthsBetween(a: Date, b: Date) {
  const years = b.getFullYear() - a.getFullYear();
  const months = b.getMonth() - a.getMonth();
  const total = years * 12 + months;
  return Math.max(0, total);
}

/**
 * Estima o "Início do período" de forma determinística (sem histórico real).
 * - Serve apenas para comparação visual/educacional dentro do timeframe.
 */
function estimateStartValue(params: {
  currentAmount: number;
  monthlyContribution: number | null;
  timeframe: TimeframeKey;
  endDate?: string | null;
}) {
  const { currentAmount, monthlyContribution, timeframe, endDate } = params;

  if (!monthlyContribution || monthlyContribution <= 0) {
    return Math.max(0, currentAmount);
  }

  // Multiplicadores conservadores (sem inventar histórico)
  const now = new Date();

  if (timeframe === "1D") return Math.max(0, currentAmount);

  if (timeframe === "1S") {
    // ~1/4 de um aporte mensal
    const back = monthlyContribution * 0.25;
    return Math.max(0, currentAmount - back);
  }

  if (timeframe === "1M") return Math.max(0, currentAmount - monthlyContribution);
  if (timeframe === "3M") return Math.max(0, currentAmount - monthlyContribution * 3);
  if (timeframe === "1Y") return Math.max(0, currentAmount - monthlyContribution * 12);

  // ALL: se existir endDate, consideramos "plano até o fim" como contexto,
  // mas o "início" ainda é uma estimativa conservadora (12 meses) para comparação.
  if (timeframe === "ALL") {
    const d = parseISODate(endDate);
    if (d) {
      const m = monthsBetween(now, d);
      // limita para não virar uma estimativa agressiva demais
      const capped = Math.min(24, Math.max(6, m));
      return Math.max(0, currentAmount - monthlyContribution * capped);
    }
    return Math.max(0, currentAmount - monthlyContribution * 12);
  }

  return Math.max(0, currentAmount);
}

/* ============================================================
   SUBCOMPONENTE (Hooks seguros por item)
============================================================ */

function LayerBar({
  ratio,
  delayMs,
  strong,
}: {
  ratio: number; // 0..1
  delayMs: number;
  strong?: boolean;
}) {
  const h = useSharedValue(0);
  const o = useSharedValue(0);

  useEffect(() => {
    const targetH = Math.round(CHART_HEIGHT * clamp(ratio, 0, 1));
    h.value = 0;
    o.value = 0;

    h.value = withDelay(
      delayMs,
      withTiming(targetH, {
        duration: 520,
        easing: Easing.out(Easing.cubic),
      })
    );

    o.value = withDelay(
      delayMs,
      withTiming(1, { duration: 360, easing: Easing.out(Easing.cubic) })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ratio, delayMs]);

  const fillStyle = useAnimatedStyle(() => ({
    height: h.value,
    opacity: o.value,
  }));

  return (
    <View style={styles.layerWrapper}>
      <View style={styles.barBg}>
        <Animated.View
          style={[
            styles.barFill,
            strong ? styles.barFillStrong : styles.barFillSoft,
            fillStyle,
          ]}
        />
      </View>
    </View>
  );
}

/* ============================================================
   COMPONENT
============================================================ */

export default function InvestmentEvolutionLayers({
  currentAmount,
  targetAmount,
  monthlyContribution,
  timeframe,
  endDate,
}: Props) {
  const safeCurrent = Number(currentAmount || 0);
  const safeTarget = targetAmount > 0 ? Number(targetAmount) : 1;

  const startValue = useMemo(() => {
    return estimateStartValue({
      currentAmount: safeCurrent,
      monthlyContribution: monthlyContribution ?? null,
      timeframe,
      endDate,
    });
  }, [safeCurrent, monthlyContribution, timeframe, endDate]);

  const deltaValue = useMemo(() => safeCurrent - startValue, [safeCurrent, startValue]);

  const layers = useMemo<LayerModel[]>(() => {
    // Sempre garante start + now
    const base: LayerModel[] = [
      { value: startValue, kind: "start" },
      { value: safeCurrent, kind: "now" },
    ];

    const futureCount = FUTURE_LAYERS_BY_TIMEFRAME[timeframe];
    const mc = monthlyContribution ?? null;

    // 1D: comparação apenas
    if (timeframe === "1D") return base;

    // Sem aporte definido: não inventa futuro
    if (!mc || mc <= 0 || futureCount <= 0) return base;

    let acc = safeCurrent;

    for (let i = 0; i < futureCount; i++) {
      acc += mc;
      if (acc >= safeTarget) {
        base.push({ value: safeTarget, kind: "future" });
        break;
      }
      base.push({ value: acc, kind: "future" });

      if (base.length >= MAX_LAYERS) break;
    }

    return base.slice(0, MAX_LAYERS);
  }, [startValue, safeCurrent, safeTarget, monthlyContribution, timeframe]);

  const description = useMemo(() => {
    if (timeframe === "1D") return "Comparação do valor de hoje.";
    if (timeframe === "ALL") {
      return endDate
        ? "Camadas do plano até a data definida."
        : "Camadas do plano até atingir a meta.";
    }
    return "Comparação do período + evolução estimada no ritmo atual.";
  }, [timeframe, endDate]);

  // alturas em px, sem % (evita quebrar layout)
  const ratios = useMemo(() => {
    return layers.map((l) => clamp(l.value / safeTarget, 0, 1));
  }, [layers, safeTarget]);

  return (
    <View style={styles.container}>
      {/* CAMADAS */}
      <View style={styles.layersRow}>
        {ratios.map((r, idx) => {
          const kind = layers[idx]?.kind ?? "future";
          const strong = kind === "now";
          const delay = idx * 70;

          return (
            <LayerBar
              key={`layer-${idx}-${timeframe}`}
              ratio={r}
              delayMs={delay}
              strong={strong}
            />
          );
        })}
      </View>

      {/* VALORES (APENAS START + NOW) */}
      <View style={styles.valuesRow}>
        <View style={styles.valueCol}>
          <Text style={styles.valueLabel}>Início</Text>
          <Text style={styles.valueText}>{formatCurrency(startValue)}</Text>
        </View>

        <View style={styles.valueColRight}>
          <Text style={styles.valueLabel}>Agora</Text>
          <Text style={styles.valueText}>{formatCurrency(safeCurrent)}</Text>
        </View>
      </View>

      {/* DELTA (A) + R$ X no período */}
      <Text style={styles.deltaText}>
        {deltaValue >= 0 ? "+ " : "- "}
        {formatCurrency(Math.abs(deltaValue))} no período ({timeframeLabel[timeframe]})
      </Text>

      {/* DESCRIÇÃO CURTA */}
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({
  container: {
    marginTop: 14,
    marginBottom: 14,
  },

  layersRow: {
    height: CHART_HEIGHT,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    paddingHorizontal: 6,
  },

  layerWrapper: {
    flex: 1,
    justifyContent: "flex-end",
  },

  barBg: {
    height: CHART_HEIGHT,
    borderRadius: BAR_RADIUS,
    backgroundColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
    justifyContent: "flex-end",
  },

  barFill: {
    width: "100%",
    borderRadius: BAR_RADIUS,
  },

  barFillSoft: {
    backgroundColor: "rgba(255,255,255,0.34)",
  },

  barFillStrong: {
    backgroundColor: "rgba(255,255,255,0.95)",
  },

  valuesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingHorizontal: 6,
  },

  valueCol: {
    flex: 1,
  },

  valueColRight: {
    flex: 1,
    alignItems: "flex-end",
  },

  valueLabel: {
    fontFamily: brandFont,
    fontSize: 11,
    color: "rgba(255,255,255,0.55)",
  },

  valueText: {
    marginTop: 2,
    fontFamily: brandFont,
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  deltaText: {
    marginTop: 8,
    paddingHorizontal: 6,
    fontFamily: brandFont,
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(255,255,255,0.90)",
  },

  description: {
    marginTop: 6,
    paddingHorizontal: 6,
    fontFamily: brandFont,
    fontSize: 12,
    color: "rgba(255,255,255,0.55)",
    lineHeight: 16,
  },
});

import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Dimensions,
  TouchableOpacity,
  LayoutChangeEvent,
} from "react-native";

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";

import InvestmentInteractiveChart from "./InvestmentInteractiveChart";

/* -----------------------------------------------------------
   TIPAGENS
------------------------------------------------------------*/
export type TimeframeKey = "1D" | "1S" | "1M" | "3M" | "1Y" | "ALL";

export type SeriesPoint = {
  date: string;
  value: number;
};

export type SeriesMap = Record<TimeframeKey, SeriesPoint[]>;

/* -----------------------------------------------------------
   CONFIG
------------------------------------------------------------*/
const brandFont = Platform.select({
  ios: "SF Pro Display",
  android: "Inter",
  default: "System",
});

const RANGES: TimeframeKey[] = ["1D", "1S", "1M", "3M", "1Y", "ALL"];

const timeframeLabels: Record<TimeframeKey, string> = {
  "1D": "último dia",
  "1S": "últimos 7 dias",
  "1M": "último mês",
  "3M": "últimos 3 meses",
  "1Y": "últimos 12 meses",
  ALL: "todo o período",
};

/* -----------------------------------------------------------
   HELPERS DE ANÁLISE
------------------------------------------------------------*/
function calcStats(curve: SeriesPoint[]) {
  if (!curve || curve.length < 2) {
    return {
      first: 0,
      last: 0,
      variationPct: 0,
      trend: "estável" as const,
      volatility: "baixa" as const,
    };
  }

  const values = curve.map((p) => p.value);
  const first = values[0];
  const last = values[values.length - 1];
  const variationPct = ((last - first) / (first || 1)) * 100;

  // regressão linear simples para tendência
  const n = values.length;
  const xs = Array.from({ length: n }, (_, i) => i);
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = values.reduce((a, b) => a + b, 0) / n;

  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - meanX) * (values[i] - meanY);
    den += (xs[i] - meanX) ** 2;
  }
  const slope = den === 0 ? 0 : num / den;

  let trend: "alta" | "estável" | "queda";
  if (slope > 0.15) trend = "alta";
  else if (slope < -0.15) trend = "queda";
  else trend = "estável";

  // volatilidade (desvio padrão)
  const variance =
    values.reduce((acc, v) => acc + (v - meanY) ** 2, 0) / n;
  const stdDev = Math.sqrt(variance);

  let volatility: "baixa" | "moderada" | "alta";
  const normalized = first || 1;
  const stdPct = (stdDev / normalized) * 100;

  if (stdPct < 3) volatility = "baixa";
  else if (stdPct < 8) volatility = "moderada";
  else volatility = "alta";

  return {
    first,
    last,
    variationPct,
    trend,
    volatility,
  };
}

function formatCurrencyBRL(v: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(v || 0);
}

/* -----------------------------------------------------------
   PROPS
------------------------------------------------------------*/
type Props = {
  series: SeriesMap;
  lineColor?: string;
  onPointChange?: (p: {
    value: number;
    date: string;
    range: TimeframeKey;
  }) => void;
  onTimeframeChange?: (range: TimeframeKey) => void;
};

/* -----------------------------------------------------------
   COMPONENTE PRINCIPAL
------------------------------------------------------------*/
export default function InvestmentTimeframesPanel({
  series,
  lineColor = "#7FC5FF",
  onPointChange,
  onTimeframeChange,
}: Props) {
  const [range, setRange] = useState<TimeframeKey>("1M");
  const [segmentWidth, setSegmentWidth] = useState(0);
  const [chartWidth, setChartWidth] = useState(
    Dimensions.get("window").width * 0.5
  );
  const [hoveredPoint, setHoveredPoint] =
    useState<SeriesPoint | null>(null);

  const highlightIndex = useSharedValue(RANGES.indexOf("1M"));
  const chartOpacity = useSharedValue(1);

  /* -----------------------------------------------------------
     CURVA ATUAL
  ------------------------------------------------------------*/
  const currentCurve = useMemo<SeriesPoint[]>(() => {
    const arr = series?.[range] ?? [];
    if (!arr.length)
      return [
        { date: "2025-01-01", value: 0 },
        { date: "2025-02-01", value: 0 },
      ];
    return arr;
  }, [range, series]);

  /* -----------------------------------------------------------
     STATS E INSIGHT
  ------------------------------------------------------------*/
  const stats = useMemo(() => calcStats(currentCurve), [currentCurve]);

  const insightText = useMemo(() => {
    const { first, last, variationPct, trend, volatility } = stats;
    const label = timeframeLabels[range];

    const dir =
      variationPct > 0
        ? "aumentou"
        : variationPct < 0
        ? "reduziu"
        : "se manteve praticamente estável";

    const absPct = Math.abs(variationPct).toFixed(1);

    const trendSentence =
      trend === "alta"
        ? "A linha mostra uma tendência de alta ao longo do período, indicando que os aportes e a evolução do investimento estão puxando o saldo para cima."
        : trend === "queda"
        ? "A linha indica uma tendência de queda, o que pode refletir resgates, redução de aportes ou desempenho negativo do ativo."
        : "A linha permanece relativamente estável, com pequenas oscilações naturais de mercado e de aportes.";

    const volSentence =
      volatility === "baixa"
        ? "A volatilidade é baixa, o que sugere um comportamento previsível e adequado para quem busca estabilidade."
        : volatility === "moderada"
        ? "A volatilidade é moderada, dentro do esperado para investimentos de médio risco."
        : "A volatilidade é alta; oscilações mais fortes exigem atenção redobrada para alinhar o risco ao seu perfil.";

    return (
      `No período de ${label}, o valor do investimento ${dir} ` +
      `${variationPct === 0 ? "" : `${absPct}% `} ` +
      `ao sair de ${formatCurrencyBRL(first)} para ${formatCurrencyBRL(
        last
      )}. ${trendSentence} ${volSentence}`
    );
  }, [stats, range]);

  /* -----------------------------------------------------------
     HEADER (VALOR + DATA)
  ------------------------------------------------------------*/
  const lastPoint = currentCurve[currentCurve.length - 1];

  const displayPoint = hoveredPoint ?? lastPoint;

  const headerValue = displayPoint?.value ?? 0;
  const headerDate = displayPoint
    ? new Date(displayPoint.date).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "";

  /* -----------------------------------------------------------
     LAYOUT SEGMENTED
  ------------------------------------------------------------*/
  function onSegmentLayout(e: LayoutChangeEvent) {
    const fullWidth = e.nativeEvent.layout.width;
    setSegmentWidth(fullWidth / RANGES.length);
  }

  const highlightStyle = useAnimatedStyle(() => ({
    width: segmentWidth * 0.82,
    transform: [{ translateX: highlightIndex.value * segmentWidth }],
  }));

  const chartStyle = useAnimatedStyle(() => ({
    opacity: chartOpacity.value,
    transform: [
      {
        translateY: interpolate(
          chartOpacity.value,
          [0, 1],
          [8, 0],
          Extrapolate.CLAMP
        ),
      },
    ],
  }));

  /* -----------------------------------------------------------
     TROCA DE TIMEFRAME
  ------------------------------------------------------------*/
  function switchTimeframe(next: TimeframeKey, index: number) {
    if (next === range) return;

    chartOpacity.value = withTiming(0, { duration: 120 });
    setRange(next);
    setHoveredPoint(null);

    if (onTimeframeChange) onTimeframeChange(next);

    const pts = series[next] ?? [];
    if (pts.length > 0 && onPointChange) {
      const last = pts[pts.length - 1];
      onPointChange({
        value: last.value,
        date: last.date,
        range: next,
      });
    }

    highlightIndex.value = withTiming(index, { duration: 180 });
    chartOpacity.value = withTiming(1, { duration: 180 });
  }

  /* -----------------------------------------------------------
     TOUCH DO GRÁFICO
  ------------------------------------------------------------*/
  function handlePoint(p: { value: number; date: string }) {
    const point: SeriesPoint = { value: p.value, date: p.date };
    setHoveredPoint(point);

    if (onPointChange) {
      onPointChange({ ...point, range });
    }
  }

  /* -----------------------------------------------------------
     LAYOUT CHART WIDTH
  ------------------------------------------------------------*/
  function onLeftPaneLayout(e: LayoutChangeEvent) {
    const w = e.nativeEvent.layout.width;
    if (w > 0 && Math.abs(w - chartWidth) > 4) {
      setChartWidth(w);
    }
  }

  const chartHeight = Math.min(
    Dimensions.get("window").height * 0.28,
    300
  );

  /* -----------------------------------------------------------
     RENDER
  ------------------------------------------------------------*/
  return (
    <View style={styles.container}>
      {/* VALOR ATUAL + DATA */}
      <Text style={styles.valueText}>
        {formatCurrencyBRL(headerValue)}
      </Text>
      <Text style={styles.dateText}>{headerDate}</Text>

      {/* SEGMENTED */}
      <View
        style={styles.segmentContainer}
        onLayout={onSegmentLayout}
      >
        <Animated.View
          style={[styles.segmentHighlight, highlightStyle]}
        />
        {RANGES.map((tf, idx) => (
          <TouchableOpacity
            key={tf}
            style={styles.segmentItem}
            onPress={() => switchTimeframe(tf, idx)}
          >
            <Text
              style={[
                styles.segmentText,
                tf === range && styles.segmentTextActive,
              ]}
            >
              {tf}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* DUAL PANE: GRÁFICO + ANÁLISE */}
      <View style={styles.dualRow}>
        {/* ESQUERDA: GRÁFICO */}
        <View style={styles.leftPane} onLayout={onLeftPaneLayout}>
          <Animated.View style={[styles.chartWrapper, chartStyle]}>
            <InvestmentInteractiveChart
              curve={currentCurve}
              width={chartWidth}
              height={chartHeight}
              lineColor={lineColor}
              onPointChange={handlePoint}
            />
          </Animated.View>
        </View>

        {/* DIREITA: INSIGHT PROFISSIONAL */}
        <View style={styles.rightPane}>
          <View style={styles.insightCard}>
            <Text style={styles.insightTitle}>
              Visão do período ({timeframeLabels[range]})
            </Text>

            <View style={styles.insightRow}>
              <Text style={styles.insightLabel}>Variação</Text>
              <Text
                style={[
                  styles.insightValue,
                  stats.variationPct > 0
                    ? styles.positive
                    : stats.variationPct < 0
                    ? styles.negative
                    : null,
                ]}
              >
                {stats.variationPct >= 0 ? "+" : ""}
                {stats.variationPct.toFixed(1)}%
              </Text>
            </View>

            <View style={styles.insightRow}>
              <Text style={styles.insightLabel}>Tendência</Text>
              <Text style={styles.insightValue}>
                {stats.trend === "alta"
                  ? "Alta"
                  : stats.trend === "queda"
                  ? "Queda"
                  : "Estável"}
              </Text>
            </View>

            <View style={styles.insightRow}>
              <Text style={styles.insightLabel}>Volatilidade</Text>
              <Text style={styles.insightValue}>
                {stats.volatility.charAt(0).toUpperCase() +
                  stats.volatility.slice(1)}
              </Text>
            </View>

            <Text style={styles.insightParagraph}>
              {insightText}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

/* -----------------------------------------------------------
   STYLES
------------------------------------------------------------*/
const styles = StyleSheet.create({
  container: {
    marginTop: 18,
  },
  valueText: {
    fontFamily: brandFont,
    fontSize: 26,
    fontWeight: "600",
    color: "#FFF",
  },
  dateText: {
    fontFamily: brandFont,
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    marginBottom: 10,
  },

  /* SEGMENTED */
  segmentContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 18,
    paddingHorizontal: 6,
    paddingVertical: 5,
    overflow: "hidden",
    marginBottom: 14,
  },
  segmentHighlight: {
    position: "absolute",
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.16)",
    borderRadius: 18,
  },
  segmentItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 3,
  },
  segmentText: {
    fontFamily: brandFont,
    fontSize: 11,
    color: "rgba(255,255,255,0.55)",
  },
  segmentTextActive: {
    color: "#FFF",
    fontWeight: "600",
  },

  /* DUAL PANE */
  dualRow: {
    flexDirection: "row",
    gap: 12,
  },
  leftPane: {
    flex: 1,
    borderRadius: 22,
    backgroundColor: "rgba(12,12,12,0.95)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    overflow: "hidden",
  },
  rightPane: {
    flex: 1,
  },
  chartWrapper: {
    paddingVertical: 8,
  },

  /* INSIGHT CARD */
  insightCard: {
    flex: 1,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "rgba(20,20,20,0.98)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  insightTitle: {
    fontFamily: brandFont,
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 10,
  },
  insightRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  insightLabel: {
    fontFamily: brandFont,
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
  },
  insightValue: {
    fontFamily: brandFont,
    fontSize: 12,
    color: "#FFFFFF",
  },
  positive: {
    color: "#30D158",
  },
  negative: {
    color: "#FF453A",
  },
  insightParagraph: {
    marginTop: 10,
    fontFamily: brandFont,
    fontSize: 12,
    lineHeight: 16,
    color: "rgba(255,255,255,0.85)",
  },
});

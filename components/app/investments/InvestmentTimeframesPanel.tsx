import React, { useMemo, useState, useEffect } from "react";
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
   HELPERS
------------------------------------------------------------*/
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
   COMPONENTE
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

  /** ponto ativo (header + insight) */
  const [activePoint, setActivePoint] =
    useState<SeriesPoint | null>(null);

  const highlightIndex = useSharedValue(RANGES.indexOf("1M"));
  const chartOpacity = useSharedValue(1);

  /* -----------------------------------------------------------
     CURVA ATUAL
  ------------------------------------------------------------*/
  const currentCurve = useMemo<SeriesPoint[]>(() => {
    const arr = series?.[range] ?? [];
    return arr.length
      ? arr
      : [
          { date: "2025-01-01", value: 0 },
          { date: "2025-02-01", value: 0 },
        ];
  }, [range, series]);

  /* -----------------------------------------------------------
     SETA PONTO PADRÃO AO TROCAR CURVA
------------------------------------------------------------*/
  useEffect(() => {
    if (currentCurve.length > 0) {
      setActivePoint(currentCurve[currentCurve.length - 1]);
    }
  }, [currentCurve]);

  /* -----------------------------------------------------------
     HEADER
------------------------------------------------------------*/
  const headerValue = activePoint?.value ?? 0;

  const headerDate = activePoint
    ? new Date(activePoint.date).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "";

  /* -----------------------------------------------------------
     SEGMENTED
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
     TROCA DE TIMEFRAME (CORRIGIDA)
------------------------------------------------------------*/
  function switchTimeframe(next: TimeframeKey, index: number) {
    if (next === range) return;

    chartOpacity.value = withTiming(0, { duration: 120 });
    setRange(next);

    highlightIndex.value = withTiming(index, { duration: 180 });
    chartOpacity.value = withTiming(1, { duration: 180 });

    onTimeframeChange?.(next);

    const pts = series[next] ?? [];
    if (pts.length > 0 && onPointChange) {
      const last = pts[pts.length - 1];
      onPointChange({ ...last, range: next });
    }
  }

  /* -----------------------------------------------------------
     TOUCH DO GRÁFICO
------------------------------------------------------------*/
  function handlePoint(p: { value: number; date: string }) {
    const point: SeriesPoint = { value: p.value, date: p.date };
    setActivePoint(point);

    onPointChange?.({ ...point, range });
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
      <Text style={styles.valueText}>
        {formatCurrencyBRL(headerValue)}
      </Text>
      <Text style={styles.dateText}>{headerDate}</Text>

      <View style={styles.segmentContainer} onLayout={onSegmentLayout}>
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

  chartWrapper: {
    borderRadius: 22,
    backgroundColor: "rgba(12,12,12,0.95)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    overflow: "hidden",
  },
});

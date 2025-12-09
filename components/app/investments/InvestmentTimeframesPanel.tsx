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
   TIPOS
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

/* -----------------------------------------------------------
   COMPONENTE
------------------------------------------------------------*/
type Props = {
  series: SeriesMap;
  lineColor?: string;

  // envia valor + data para o InvestmentMainBlock
  onPointChange?: (p: { value: number; date: string; range: TimeframeKey }) => void;

  // notifica mudança de timeframe
  onTimeframeChange?: (range: TimeframeKey) => void;
};

export default function InvestmentTimeframesPanel({
  series,
  lineColor = "#7FC5FF",
  onPointChange,
  onTimeframeChange,
}: Props) {
  const [range, setRange] = useState<TimeframeKey>("1M");
  const [segmentWidth, setSegmentWidth] = useState(0);

  const highlightIndex = useSharedValue(RANGES.indexOf("1M"));
  const chartOpacity = useSharedValue(1);

  /* -----------------------------------------------------------
     PEGA CURVA ATUAL
------------------------------------------------------------*/
  const currentCurve = useMemo(() => {
    const arr = series?.[range] ?? [];
    if (!arr.length)
      return [
        { date: "2025-01-01", value: 0 },
        { date: "2025-02-01", value: 0 },
      ];
    return arr;
  }, [range, series]);

  /* -----------------------------------------------------------
     LAYOUT DO SEGMENTED
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
          [10, 0],
          Extrapolate.CLAMP
        ),
      },
    ],
  }));

  /* -----------------------------------------------------------
     🔥 A MÁGICA DO TIMEFRAME
------------------------------------------------------------*/
  function switchTimeframe(next: TimeframeKey, index: number) {
    if (next === range) return;

    // animação de fade-out
    chartOpacity.value = withTiming(0, { duration: 150 });

    setRange(next);

    // avisa o InvestmentMainBlock
    if (onTimeframeChange) onTimeframeChange(next);

    // pega o último ponto do timeframe
    const pts = series[next] ?? [];
    if (pts.length > 0) {
      const last = pts[pts.length - 1];

      // envia para atualizar cabeçalho imediatamente
      if (onPointChange)
        onPointChange({
          value: last.value,
          date: last.date,
          range: next,
        });
    }

    // move o highlight
    highlightIndex.value = withTiming(index, { duration: 220 });

    // fade-in do gráfico
    chartOpacity.value = withTiming(1, { duration: 220 });
  }

  /* -----------------------------------------------------------
     TOUCH DO GRÁFICO
------------------------------------------------------------*/
  function handlePoint(p: { value: number; date: string }) {
    if (onPointChange)
      onPointChange({ ...p, range });
  }

  /* -----------------------------------------------------------
     HEADER (caso o usuário não esteja tocando)
------------------------------------------------------------*/
  const lastPoint = currentCurve[currentCurve.length - 1];

  const headerValue = lastPoint?.value ?? 0;

  const headerDate = lastPoint
    ? new Date(lastPoint.date).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "";

  return (
    <View style={styles.container}>
      {/* VALOR ATUAL */}
      <Text style={styles.valueText}>
        {new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(headerValue)}
      </Text>

      {/* DATA ATUAL */}
      <Text style={styles.dateText}>{headerDate}</Text>

      {/* SEGMENTED CONTROL PREMIUM */}
      <View style={styles.segmentContainer} onLayout={onSegmentLayout}>
        <Animated.View style={[styles.segmentHighlight, highlightStyle]} />

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

      {/* GRÁFICO INTERATIVO */}
      <Animated.View style={[styles.chartWrapper, chartStyle]}>
        <InvestmentInteractiveChart
          curve={currentCurve}
          width={Dimensions.get("window").width - 32}
          height={200}
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
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 20,
    paddingHorizontal: 6,
    paddingVertical: 6,
    overflow: "hidden",
    marginBottom: 10,
  },
  segmentHighlight: {
    position: "absolute",
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
  },
  segmentItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 4,
  },
  segmentText: {
    fontFamily: brandFont,
    fontSize: 12,
    color: "rgba(255,255,255,0.55)",
  },
  segmentTextActive: {
    color: "#FFF",
    fontWeight: "700",
  },
  chartWrapper: {
    borderRadius: 20,
    paddingVertical: 10,
    backgroundColor: "rgba(12,12,12,0.9)",
  },
});

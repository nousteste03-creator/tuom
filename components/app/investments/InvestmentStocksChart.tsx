// components/app/goals/investments/InvestmentStocksChart.tsx
import React, { useMemo, useState, useRef } from "react";
import { View, StyleSheet, PanResponder, PanResponderInstance } from "react-native";
import Svg, {
  Path,
  Defs,
  LinearGradient,
  Stop,
  Circle,
  Line,
} from "react-native-svg";

type Point = { date: string; value: number };

type Props = {
  curve: Point[];
  width: number;
  height: number;
  color?: string;
};

export default function InvestmentStocksChart({
  curve,
  width,
  height,
  color = "#85C7FF",
}: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(
    curve.length ? curve.length - 1 : null
  );

  // padding interno pro gráfico respirar
  const padding = 8;

  const prepared = useMemo(() => {
    if (!curve || curve.length === 0) return { path: "", points: [] as any[] };

    const values = curve.map((c) => c.value);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const normalize = (v: number) => (v - min) / (max - min || 1);

    const innerW = width - padding * 2;
    const innerH = height - padding * 2;
    const stepX = innerW / Math.max(curve.length - 1, 1);

    const pts: { x: number; y: number; value: number; date: string }[] = [];
    let d = "";

    curve.forEach((p, i) => {
      const x = padding + i * stepX;
      const y = padding + (1 - normalize(p.value)) * innerH;

      pts.push({ x, y, value: p.value, date: p.date });

      if (i === 0) d += `M ${x} ${y}`;
      else d += ` L ${x} ${y}`;
    });

    return { path: d, points: pts, stepX, innerH, min, max };
  }, [curve, width, height]);

  const { path, points, stepX } = prepared;

  const panResponder = useRef<PanResponderInstance>(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => handleTouch(evt.nativeEvent.locationX),
      onPanResponderMove: (evt) => handleTouch(evt.nativeEvent.locationX),
    })
  ).current;

  function handleTouch(x: number) {
    if (!points.length) return;
    const innerX = Math.min(Math.max(x - padding, 0), width - padding * 2);
    const index = Math.round(innerX / (stepX || 1));
    const clamped = Math.min(Math.max(index, 0), points.length - 1);
    setActiveIndex(clamped);
  }

  const activePoint =
    activeIndex != null && points[activeIndex] ? points[activeIndex] : null;

  return (
    <View style={styles.wrapper} {...panResponder.panHandlers}>
      {/** TOOLTIP SIMPLES NO TOPO (Apple style) */}
      {activePoint && (
        <View style={styles.tooltip}>
          {/* Valor e data serão exibidos pela tela pai */}
        </View>
      )}

      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={color} stopOpacity={0.25} />
            <Stop offset="100%" stopColor={color} stopOpacity={0.02} />
          </LinearGradient>
        </Defs>

        {/* Área preenchida */}
        {path !== "" && (
          <Path
            d={`${path} L ${width - padding} ${height - padding} L ${padding} ${
              height - padding
            } Z`}
            fill="url(#fill)"
          />
        )}

        {/* Linha principal */}
        {path !== "" && (
          <Path
            d={path}
            stroke={color}
            strokeWidth={2}
            fill="transparent"
            strokeLinecap="round"
          />
        )}

        {/* Crosshair + ponto ativo */}
        {activePoint && (
          <>
            <Line
              x1={activePoint.x}
              y1={padding}
              x2={activePoint.x}
              y2={height - padding}
              stroke={color}
              strokeWidth={1}
              strokeDasharray="4 4"
              opacity={0.6}
            />
            <Circle
              cx={activePoint.x}
              cy={activePoint.y}
              r={4}
              fill={color}
              stroke="#0B0B0C"
              strokeWidth={2}
            />
          </>
        )}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 18,
    overflow: "hidden",
  },
  tooltip: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 24,
  },
});

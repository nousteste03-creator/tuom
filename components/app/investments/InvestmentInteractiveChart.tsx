import React, { useMemo } from "react";
import Svg, { Path, Line, Circle } from "react-native-svg";
import {
  Gesture,
  GestureDetector,
} from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  interpolate,
  runOnJS,
} from "react-native-reanimated";

type Point = { date: string; value: number };

const AnimatedLine = Animated.createAnimatedComponent(Line);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/* ============================================================
   CURVA SUAVIZADA (Bezier)
============================================================ */
function smoothPath(points: { x: number; y: number }[]) {
  if (points.length <= 1) return "";

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length - 2; i++) {
    const xc = (points[i].x + points[i + 1].x) / 2;
    const yc = (points[i].y + points[i + 1].y) / 2;
    path += ` Q ${points[i].x} ${points[i].y}, ${xc} ${yc}`;
  }

  const n = points.length;
  path += ` Q ${points[n - 2].x} ${points[n - 2].y}, ${points[n - 1].x} ${points[n - 1].y}`;

  return path;
}

/* ============================================================
   PROPS
============================================================ */
type Props = {
  curve: Point[];
  width: number;
  height: number;
  lineColor?: string;
  onPointChange?: (p: { value: number; date: string }) => void;
};

/* ============================================================
   COMPONENTE PRINCIPAL
============================================================ */
export default function InvestmentInteractiveChart({
  curve,
  width,
  height,
  lineColor = "#7FC5FF",
  onPointChange,
}: Props) {
  // Fallback seguro: sempre pelo menos 2 pontos
  const safeCurve: Point[] =
    Array.isArray(curve) && curve.length >= 2
      ? curve
      : [
          { date: "2025-01-01", value: 0 },
          { date: "2025-02-01", value: 0 },
        ];

  const values = safeCurve.map((c) => c.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1; // evita divisão por zero

  const paddingX = 12;
  const paddingY = 18;
  const chartW = Math.max(width - paddingX * 2, 20);
  const chartH = Math.max(height - paddingY * 2, 20);

  /* ------------------------------------------------------------
     CÁLCULO DOS PONTOS / PATH (PURO, SEM setState)
  ------------------------------------------------------------ */
  const points = useMemo(() => {
    const lastIndex = safeCurve.length - 1;

    return safeCurve.map((item, idx) => {
      const x =
        paddingX +
        (lastIndex === 0 ? 0 : (idx / lastIndex) * chartW);

      const y =
        paddingY +
        chartH -
        ((item.value - min) / range) * chartH;

      return { x, y };
    });
  }, [safeCurve, chartW, chartH, min, range]);

  const path = useMemo(() => smoothPath(points), [points]);

  /* ============================================================
     SHARED VALUES (GESTO)
============================================================ */
  const touchX = useSharedValue(-1);
  const touchY = useSharedValue(-1);
  const active = useSharedValue(0);

  /* ============================================================
     GESTO APPLE-LIKE
============================================================ */
  const gesture = Gesture.Pan()
    .onStart((e) => {
      active.value = 1;
      touchX.value = e.x;
    })
    .onUpdate((e) => {
      // limita ao intervalo visível
      const clampedX = Math.max(
        paddingX,
        Math.min(e.x, width - paddingX)
      );
      touchX.value = clampedX;

      // mapeia posição X para índice
      const idx = Math.round(
        interpolate(
          clampedX,
          [paddingX, width - paddingX],
          [0, safeCurve.length - 1]
        )
      );

      const safeIdx = Math.min(
        Math.max(idx, 0),
        safeCurve.length - 1
      );

      const point = safeCurve[safeIdx];
      const pos = points[safeIdx];

      touchY.value = pos.y;

      if (onPointChange) {
        runOnJS(onPointChange)({
          value: point.value,
          date: point.date,
        });
      }
    })
    .onEnd(() => {
      active.value = 0;
    });

  /* ============================================================
     ANIMATED PROPS – CROSSHAIR / DOT
============================================================ */
  const animatedCrosshair = useAnimatedProps(() => ({
    x1: touchX.value,
    x2: touchX.value,
    y1: 0,
    y2: height,
    opacity: active.value,
  }));

  const animatedDot = useAnimatedProps(() => ({
    cx: touchX.value,
    cy: touchY.value,
    opacity: active.value,
  }));

  /* ============================================================
     RENDER
============================================================ */
  return (
    <GestureDetector gesture={gesture}>
      <Svg width={width} height={height}>
        {/* Linha suavizada */}
        <Path
          d={path}
          stroke={lineColor}
          strokeWidth={2.4}
          fill="none"
        />

        {/* Crosshair vertical */}
        <AnimatedLine
          animatedProps={animatedCrosshair}
          stroke="#ffffff55"
          strokeWidth={1}
        />

        {/* Ponto */}
        <AnimatedCircle
          animatedProps={animatedDot}
          r={4.5}
          fill="#ffffff"
        />
      </Svg>
    </GestureDetector>
  );
}

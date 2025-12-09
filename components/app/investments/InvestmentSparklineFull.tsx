import React from "react";
import { View } from "react-native";
import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg";

type Point = { date: string; value: number };

type Props = {
  curve: Point[];
  width: number;
  height: number;
  color?: string;
};

export default function InvestmentSparklineFull({
  curve,
  width,
  height,
  color = "#85C7FF",
}: Props) {
  if (!curve || curve.length === 0) {
    return <View style={{ width, height }} />;
  }

  const values = curve.map((c) => c.value);
  const max = Math.max(...values);
  const min = Math.min(...values);

  const normalize = (v: number) => (v - min) / (max - min || 1);
  const stepX = width / Math.max(curve.length - 1, 1);

  let d = "";

  curve.forEach((p, i) => {
    const x = i * stepX;
    const y = height - normalize(p.value) * height;
    if (i === 0) d += `M ${x} ${y}`;
    else d += ` L ${x} ${y}`;
  });

  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={color} stopOpacity={0.22} />
          <Stop offset="100%" stopColor={color} stopOpacity={0.02} />
        </LinearGradient>
      </Defs>

      {/* Linha */}
      <Path
        d={d}
        stroke={color}
        strokeWidth={2}
        fill="transparent"
        strokeLinecap="round"
      />

      {/* Área preenchida */}
      <Path
        d={`${d} L ${width} ${height} L 0 ${height} Z`}
        fill="url(#fill)"
      />
    </Svg>
  );
}

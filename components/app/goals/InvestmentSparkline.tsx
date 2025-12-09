import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Polyline } from "react-native-svg";

type Point = { date: string; value: number };

type Props = {
  data: Point[];
  width?: number;
  height?: number;
  strokeWidth?: number;
};

export default function InvestmentSparkline({
  data,
  width = 160,
  height = 50,
  strokeWidth = 2,
}: Props) {
  // Garantir segurança caso o array venha vazio
  const safeData = Array.isArray(data) && data.length > 1 ? data : [];

  const points = useMemo(() => {
    if (safeData.length < 2) return "";

    const values = safeData.map((p) => p.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    return safeData
      .map((p, index) => {
        const x = (index / (safeData.length - 1)) * width;
        const y = height - ((p.value - min) / range) * height;
        return `${x},${y}`;
      })
      .join(" ");
  }, [safeData, width, height]);

  if (safeData.length < 2) {
    return <View style={[styles.placeholder, { width, height }]} />;
  }

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        <Polyline
          points={points}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 6,
  },
});

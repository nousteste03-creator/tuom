// components/charts/WaveChart.tsx
import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
} from "react-native";
import Svg, {
  Path,
  Defs,
  LinearGradient,
  Stop,
  Circle,
} from "react-native-svg";

const MONTH_WIDTH = 120;          // B) 120px por mês
const CHART_HEIGHT = 190;        // altura interna do gráfico
const TOP_PADDING = 10;
const BOTTOM_PADDING = 24;

export type WavePoint = {
  monthLabel: string;
  expense: number;
  income: number;
  goalProgress: number;
};

interface WaveChartProps {
  data: WavePoint[];
}

type Point = { x: number; y: number };

function buildPoints(values: number[], maxValue: number, totalWidth: number): Point[] {
  const len = values.length;
  if (!len) return [];
  const usableHeight = CHART_HEIGHT - TOP_PADDING - BOTTOM_PADDING;
  const stepX = len > 1 ? totalWidth / (len - 1) : 0;

  return values.map((v, i) => {
    const x = i * stepX;
    const ratio = maxValue > 0 ? v / maxValue : 0;
    const y =
      TOP_PADDING +
      (1 - ratio) * usableHeight; // maior valor fica mais em cima
    return { x, y };
  });
}

function buildLinePath(points: Point[]): string {
  if (!points.length) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cx = (prev.x + curr.x) / 2;
    // curva suave Q
    d += ` Q ${cx} ${prev.y}, ${curr.x} ${curr.y}`;
  }
  return d;
}

function buildAreaPath(points: Point[], totalWidth: number): string {
  if (!points.length) return "";
  const baseY = CHART_HEIGHT - BOTTOM_PADDING;
  let d = `M 0 ${baseY}`;
  d += ` L ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cx = (prev.x + curr.x) / 2;
    d += ` Q ${cx} ${prev.y}, ${curr.x} ${curr.y}`;
  }
  d += ` L ${points[points.length - 1].x} ${baseY}`;
  d += " Z";
  return d;
}

export default function WaveChart({ data }: WaveChartProps) {
  const safeData = data && data.length ? data : [];
  const len = safeData.length;

  if (!len) {
    return (
      <View style={{ paddingVertical: 16, alignItems: "center" }}>
        <Text style={{ color: "#9CA3AF", fontSize: 12 }}>
          Adicione dados para ver o gráfico.
        </Text>
      </View>
    );
  }

  const TOTAL_WIDTH = len * MONTH_WIDTH;

  const expenses = safeData.map((p) => p.expense);
  const incomes = safeData.map((p) => p.income);
  const goals = safeData.map((p) => p.goalProgress);

  const maxValue = useMemo(
    () => Math.max(...expenses, ...incomes, ...goals, 1),
    [expenses, incomes, goals]
  );

  const pointsExp = buildPoints(expenses, maxValue, TOTAL_WIDTH);
  const pointsInc = buildPoints(incomes, maxValue, TOTAL_WIDTH);
  const pointsGoal = buildPoints(goals, maxValue, TOTAL_WIDTH);

  const pathExp = buildLinePath(pointsExp);
  const pathInc = buildLinePath(pointsInc);
  const pathGoal = buildLinePath(pointsGoal);

  const areaExp = buildAreaPath(pointsExp, TOTAL_WIDTH);
  const areaInc = buildAreaPath(pointsInc, TOTAL_WIDTH);
  const areaGoal = buildAreaPath(pointsGoal, TOTAL_WIDTH);

  // mês selecionado para tooltip (card fixo)
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedPoint = safeData[selectedIndex];

  return (
    <View style={{ flex: 1 }}>
      {/* Tooltip fixo topo, estilo Apple */}
      <View
        style={{
          paddingHorizontal: 12,
          paddingVertical: 10,
          borderRadius: 16,
          backgroundColor: "rgba(15,23,42,0.96)",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.14)",
          marginBottom: 10,
        }}
      >
        <Text
          style={{
            color: "#E5E7EB",
            fontSize: 12,
            marginBottom: 6,
          }}
        >
          {selectedPoint.monthLabel}
        </Text>

        <TooltipRow
          label="Despesas"
          color="#F97373"
          value={selectedPoint.expense}
        />
        <TooltipRow
          label="Receitas"
          color="#4ADE80"
          value={selectedPoint.income}
        />
        <TooltipRow
          label="Meta"
          color="#60A5FA"
          value={selectedPoint.goalProgress}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        bounces
        contentContainerStyle={{
          width: TOTAL_WIDTH,
          paddingBottom: 8,
        }}
      >
        <View style={{ width: TOTAL_WIDTH }}>
          <Svg
            width={TOTAL_WIDTH}
            height={CHART_HEIGHT}
            style={{ overflow: "visible" }}
          >
            <Defs>
              {/* gradientes bem leves */}
              <LinearGradient id="gradExp" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor="rgba(249,115,115,0.22)" />
                <Stop offset="95%" stopColor="rgba(249,115,115,0.03)" />
              </LinearGradient>

              <LinearGradient id="gradInc" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor="rgba(74,222,128,0.22)" />
                <Stop offset="95%" stopColor="rgba(74,222,128,0.03)" />
              </LinearGradient>

              <LinearGradient id="gradGoal" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor="rgba(96,165,250,0.22)" />
                <Stop offset="95%" stopColor="rgba(96,165,250,0.03)" />
              </LinearGradient>
            </Defs>

            {/* Áreas, camada de fundo */}
            <Path d={areaExp} fill="url(#gradExp)" />
            <Path d={areaInc} fill="url(#gradInc)" />
            <Path d={areaGoal} fill="url(#gradGoal)" />

            {/* Linhas por cima das áreas */}
            <Path d={pathExp} stroke="#F97373" strokeWidth={2} fill="none" />
            <Path d={pathInc} stroke="#4ADE80" strokeWidth={2} fill="none" />
            <Path d={pathGoal} stroke="#60A5FA" strokeWidth={2} fill="none" />

            {/* Pontos do mês selecionado */}
            {pointsExp[selectedIndex] && (
              <>
                <Circle
                  cx={pointsExp[selectedIndex].x}
                  cy={pointsExp[selectedIndex].y}
                  r={4}
                  fill="#F97373"
                />
                <Circle
                  cx={pointsInc[selectedIndex].x}
                  cy={pointsInc[selectedIndex].y}
                  r={4}
                  fill="#4ADE80"
                />
                <Circle
                  cx={pointsGoal[selectedIndex].x}
                  cy={pointsGoal[selectedIndex].y}
                  r={4}
                  fill="#60A5FA"
                />
              </>
            )}
          </Svg>

          {/* Zonas de toque por mês */}
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              height: CHART_HEIGHT,
              width: TOTAL_WIDTH,
              flexDirection: "row",
            }}
          >
            {safeData.map((_, index) => (
              <Pressable
                key={index}
                onPress={() => setSelectedIndex(index)}
                style={{
                  width: MONTH_WIDTH,
                  height: "100%",
                }}
              />
            ))}
          </View>

          {/* Labels de meses */}
          <View
            style={{
              flexDirection: "row",
              width: TOTAL_WIDTH,
              marginTop: 6,
            }}
          >
            {safeData.map((p, index) => (
              <View
                key={index}
                style={{
                  width: MONTH_WIDTH,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color:
                      index === selectedIndex ? "#F9FAFB" : "#9CA3AF",
                    fontSize: 12,
                    fontWeight: index === selectedIndex ? "600" : "400",
                  }}
                >
                  {p.monthLabel}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function TooltipRow({
  label,
  color,
  value,
}: {
  label: string;
  color: string;
  value: number;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 2,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
        <View
          style={{
            width: 7,
            height: 7,
            borderRadius: 999,
            backgroundColor: color,
          }}
        />
        <Text
          style={{
            color: "#9CA3AF",
            fontSize: 11,
          }}
        >
          {label}
        </Text>
      </View>
      <Text
        style={{
          color: "#E5E7EB",
          fontSize: 11,
        }}
      >
        R$ {value.toFixed(2)}
      </Text>
    </View>
  );
}

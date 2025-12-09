import React, { useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";

import InvestmentTimeframesPanel, {
  TimeframeKey,
  SeriesMap,
} from "./InvestmentTimeframesPanel";

import InvestmentHero from "./InvestmentHero";
import InvestmentKPISection from "./InvestmentKPISection";

const brandFont = Platform.select({
  ios: "SF Pro Display",
  android: "Inter",
  default: "System",
});

type Props = {
  goal: any;
  series: SeriesMap;
  onPressAdd: () => void;
  onPressEdit: () => void;
};

export default function InvestmentMainBlock({
  goal,
  series,
  onPressAdd,
  onPressEdit,
}: Props) {
  const progressPercent = goal.progressPercent ?? 0;

  /* ------------------------------------------------------------
     Callbacks apenas para futuro (logs / IA etc.)
  ------------------------------------------------------------ */
  const handleTimeframeChange = useCallback((tf: TimeframeKey) => {
    console.log("[TIMEFRAME]", tf);
  }, []);

  const handlePointChange = useCallback(
    (p: { value: number; date: string; range: TimeframeKey }) => {
      console.log("[POINT]", p);
    },
    []
  );

  /* ------------------------------------------------------------
     RENDER
  ------------------------------------------------------------ */
  return (
    <BlurView intensity={35} tint="dark" style={styles.card}>
      {/* HERO – sempre valor REAL do investimento */}
      <InvestmentHero
        title={goal.title}
        currentValue={goal.currentAmount}
        targetValue={goal.targetAmount}
        progressPercent={progressPercent}
      />

      {/* AÇÕES */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={onPressAdd}>
          <Text style={styles.actionText}>Registrar aporte</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={onPressEdit}>
          <Text style={styles.actionText}>Editar</Text>
        </TouchableOpacity>
      </View>

      {/* TIMEFRAMES + GRÁFICO (valores FUTUROS/projeção) */}
      <InvestmentTimeframesPanel
        series={series}
        lineColor="#7FC5FF"
        onTimeframeChange={handleTimeframeChange}
        onPointChange={handlePointChange}
      />

      {/* KPIs – usa projeção real calculada no hook */}
      <InvestmentKPISection
        projection={goal.projection}
        remainingAmount={goal.remainingAmount}
        progressPercent={progressPercent}
      />
    </BlurView>
  );
}

/* ------------------------------------------------------------ */

const styles = StyleSheet.create({
  card: {
    marginTop: 12,
    marginBottom: 24,
    padding: 18,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
    marginBottom: 22,
  },

  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 6,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
  },

  actionText: {
    color: "#fff",
    fontFamily: brandFont,
    fontSize: 14,
    fontWeight: "600",
  },
});

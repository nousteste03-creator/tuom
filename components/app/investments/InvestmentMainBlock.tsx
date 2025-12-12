import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";

import InvestmentHero from "./InvestmentHero";
import InvestmentKPISection from "./InvestmentKPISection";
import InvestmentEvolutionLayers from "./InvestmentEvolutionLayers";

/* ------------------------------------------------------------
   CONFIG
------------------------------------------------------------ */

const brandFont = Platform.select({
  ios: "SF Pro Display",
  android: "Inter",
  default: "System",
});

/* ------------------------------------------------------------
   TIPOS
------------------------------------------------------------ */

export type TimeframeKey = "1D" | "1S" | "1M" | "3M" | "1Y" | "ALL";

type Props = {
  /** Investimento completo (goal do tipo investment) */
  goal: any;

  /** Registrar aporte */
  onPressAdd: () => void;

  /** Editar investimento */
  onPressEdit: () => void;
};

/* ------------------------------------------------------------
   COMPONENT
------------------------------------------------------------ */

export default function InvestmentMainBlock({
  goal,
  onPressAdd,
  onPressEdit,
}: Props) {
  /* ----------------------------------------------------------
     GUARD
  ---------------------------------------------------------- */
  if (!goal) {
    console.warn("[InvestmentMainBlock] goal ausente");
    return null;
  }

  /* ----------------------------------------------------------
     STATE
  ---------------------------------------------------------- */
  const [timeframe, setTimeframe] = useState<TimeframeKey>("1M");

  const progressPercent = goal.progressPercent ?? 0;

  /* ----------------------------------------------------------
     DADOS BASE (FONTE ÚNICA)
  ---------------------------------------------------------- */
  const currentAmount = Number(goal.currentAmount ?? 0);
  const targetAmount = Number(goal.targetAmount ?? 0);

  /**
   * Aporte mensal real:
   * 1) autoRuleMonthly (definido pelo usuário)
   * 2) fallback para projection.monthly (calculado)
   */
  const monthlyContribution =
    goal.autoRuleMonthly ??
    goal.projection?.monthly ??
    null;

  const endDate = goal.endDate ?? null;

  /* ----------------------------------------------------------
     RENDER
  ---------------------------------------------------------- */
  return (
    <BlurView intensity={35} tint="dark" style={styles.card}>
      {/* HERO — valor REAL */}
      <InvestmentHero
        title={goal.title}
        currentValue={currentAmount}
        targetValue={targetAmount}
        progressPercent={progressPercent}
      />

      {/* AÇÕES */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={onPressAdd}
          activeOpacity={0.85}
        >
          <Text style={styles.actionText}>Registrar aporte</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={onPressEdit}
          activeOpacity={0.85}
        >
          <Text style={styles.actionText}>Editar</Text>
        </TouchableOpacity>
      </View>

      {/* SEGMENTED — TIMEFRAMES */}
      <View style={styles.segmentedRow}>
        {(["1D", "1S", "1M", "3M", "1Y", "ALL"] as TimeframeKey[]).map(
          (tf) => (
            <TouchableOpacity
              key={tf}
              style={[
                styles.segmentItem,
                timeframe === tf && styles.segmentItemActive,
              ]}
              onPress={() => setTimeframe(tf)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.segmentText,
                  timeframe === tf && styles.segmentTextActive,
                ]}
              >
                {tf}
              </Text>
            </TouchableOpacity>
          )
        )}
      </View>

      {/* EVOLUÇÃO POR CAMADAS — DERIVADA */}
      <InvestmentEvolutionLayers
        currentAmount={currentAmount}
        targetAmount={targetAmount}
        monthlyContribution={monthlyContribution}
        timeframe={timeframe}
        endDate={endDate}
      />

      {/* KPIs */}
      <InvestmentKPISection
        projection={goal.projection}
        remainingAmount={goal.remainingAmount}
        progressPercent={progressPercent}
      />
    </BlurView>
  );
}

/* ------------------------------------------------------------
   STYLES
------------------------------------------------------------ */

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
    marginBottom: 18,
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

  /* SEGMENTED */
  segmentedRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 18,
    paddingHorizontal: 6,
    paddingVertical: 6,
    marginBottom: 16,
  },

  segmentItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 4,
    borderRadius: 14,
  },

  segmentItemActive: {
    backgroundColor: "rgba(255,255,255,0.16)",
  },

  segmentText: {
    fontFamily: brandFont,
    fontSize: 11,
    color: "rgba(255,255,255,0.55)",
  },

  segmentTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});

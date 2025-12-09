// components/app/goals/GoalInvestmentMainCard.tsx

import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";

import type { GoalWithStats } from "@/hooks/useGoals";

const brandFont = Platform.select({
  ios: "SF Pro Display",
  android: "Inter",
  default: "System",
});

type Props = {
  goal: GoalWithStats;
  isPro?: boolean;
  /** Detalhes do investimento (tocar no card ou no texto "Detalhes") */
  onPress?: () => void;
  /** Registrar novo aporte */
  onPressAportar?: () => void;
  /** Editar investimento */
  onPressEdit?: () => void;
};

/**
 * Sparkline simples usando apenas Views
 * - Não adiciona nenhuma dependência nova (seguro)
 * - Estilo Apple Stocks minimal: linha branca fina
 */
function InvestmentSparkline({
  points,
}: {
  points: { date: string; value: number }[];
}) {
  if (!points || points.length === 0) {
    return (
      <View style={styles.sparklineEmpty}>
        <Text style={styles.sparklineEmptyText}>Sem projeção ainda</Text>
      </View>
    );
  }

  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const normalized = values.map((v) => (v - min) / range);

  return (
    <View style={styles.sparklineContainer}>
      {normalized.map((n, idx) => (
        <View key={idx} style={styles.sparklinePointWrapper}>
          <View
            style={[
              styles.sparklinePoint,
              {
                // altura baseada no valor normalizado
                height: 8 + n * 18, // 8–26 px
              },
            ]}
          />
        </View>
      ))}
    </View>
  );
}

export default function GoalInvestmentMainCard({
  goal,
  isPro,
  onPress,
  onPressAportar,
  onPressEdit,
}: Props) {
  const {
    title,
    currentAmount,
    targetAmount,
    progressPercent,
    projection,
  } = goal;

  const currency = useMemo(
    () =>
      (v: number) =>
        new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
          minimumFractionDigits: 2,
        }).format(v || 0),
    []
  );

  const progressLabel = useMemo(() => {
    if (!targetAmount || targetAmount <= 0) return "0% concluído";
    const pct = Math.min(100, Math.max(0, progressPercent || 0));
    return `${pct.toFixed(0)}% concluído`;
  }, [targetAmount, progressPercent]);

  const projectedDateLabel = useMemo(() => {
    const date = projection?.projectedEndDate;
    if (!date) return "Sem previsão definida";
    try {
      const d = new Date(date);
      if (Number.isNaN(d.getTime())) return "Sem previsão definida";
      return `Previsto para ${d.toLocaleDateString("pt-BR")}`;
    } catch {
      return "Sem previsão definida";
    }
  }, [projection?.projectedEndDate]);

  const aporteMensalLabel = useMemo(() => {
    const v = projection?.monthly ?? goal.autoRuleMonthly ?? null;
    if (!v || v <= 0) return "Sem aporte mensal configurado";
    return `Aporte mensal: ${currency(v)}`;
  }, [projection?.monthly, goal.autoRuleMonthly, currency]);

  const handleDetails = () => {
    onPress?.();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handleDetails}
      style={{ marginHorizontal: 16, marginTop: 12 }}
    >
      <BlurView intensity={30} tint="dark" style={styles.card}>
        {/* TOPO: TÍTULO + PROGRESSO DISCRETO */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title} numberOfLines={1}>
              {title || "Investimento"}
            </Text>
            <Text style={styles.progressLabel}>{progressLabel}</Text>
          </View>

          {/* Badge PRO opcional */}
          {isPro && (
            <View style={styles.proBadge}>
              <Text style={styles.proBadgeText}>PRO</Text>
            </View>
          )}
        </View>

        {/* VALOR ATUAL + META ABAIXO (ESTILO APPLE STOCKS) */}
        <View style={styles.valueBlock}>
          <Text style={styles.currentValue}>{currency(currentAmount || 0)}</Text>
          <Text style={styles.targetLabel}>
            Meta: {currency(targetAmount || 0)}
          </Text>
        </View>

        {/* SPARKLINE + META / DATA PREVISTA */}
        <View style={styles.middleRow}>
          <View style={{ flex: 1 }}>
            <InvestmentSparkline
              points={projection?.curveFuture ?? []}
            />
          </View>

          <View style={styles.middleInfo}>
            <Text style={styles.smallLabel}>{aporteMensalLabel}</Text>
            <Text style={styles.smallMuted}>{projectedDateLabel}</Text>
          </View>
        </View>

        {/* AÇÕES: APENAS TEXTO CLICÁVEL */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onPressAportar}
            style={styles.actionTouch}
          >
            <Text style={styles.actionText}>Aportar</Text>
          </TouchableOpacity>

          <View style={styles.actionDivider} />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onPressEdit}
            style={styles.actionTouch}
          >
            <Text style={styles.actionText}>Editar</Text>
          </TouchableOpacity>

          <View style={styles.actionDivider} />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleDetails}
            style={styles.actionTouch}
          >
            <Text style={styles.actionText}>Detalhes</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </TouchableOpacity>
  );
}

/* ============================================================
   STYLES — Apple Stocks Glass
============================================================ */

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 18,
    backgroundColor: "rgba(15,15,18,0.9)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  title: {
    fontFamily: brandFont,
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  progressLabel: {
    marginTop: 2,
    fontFamily: brandFont,
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
  },

  proBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "rgba(216,236,238,0.16)",
  },

  proBadgeText: {
    fontFamily: brandFont,
    fontSize: 10,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },

  valueBlock: {
    marginTop: 4,
    marginBottom: 10,
  },

  currentValue: {
    fontFamily: brandFont,
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  targetLabel: {
    marginTop: 2,
    fontFamily: brandFont,
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
  },

  middleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 6,
  },

  middleInfo: {
    marginLeft: 12,
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },

  smallLabel: {
    fontFamily: brandFont,
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    textAlign: "right",
  },

  smallMuted: {
    marginTop: 2,
    fontFamily: brandFont,
    fontSize: 11,
    color: "rgba(255,255,255,0.55)",
    textAlign: "right",
  },

  sparklineContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 28,
    overflow: "hidden",
  },

  sparklinePointWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },

  sparklinePoint: {
    width: 2,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    opacity: 0.9,
  },

  sparklineEmpty: {
    height: 28,
    justifyContent: "center",
  },

  sparklineEmptyText: {
    fontFamily: brandFont,
    fontSize: 11,
    color: "rgba(255,255,255,0.4)",
  },

  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
    paddingTop: 10,
  },

  actionTouch: {
    flex: 1,
    alignItems: "center",
  },

  actionText: {
    fontFamily: brandFont,
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
  },

  actionDivider: {
    width: 1,
    height: 16,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
});

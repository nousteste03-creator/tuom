// components/app/goals/GoalInvestmentCard.tsx
import React, { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import GoalProgressBar from "./GoalProgressBar";
import type { GoalWithStats } from "@/hooks/useGoals";

const brandFont = Platform.select({
  ios: "SF Pro Display",
  android: "Inter",
  default: "System",
});

type Props = {
  goal: GoalWithStats;
  isPro: boolean;
  onPress?: () => void;
};

function formatCurrency(value: number) {
  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    }).format(value);
  } catch {
    return `R$ ${value.toFixed(2)}`;
  }
}

function formatSituationLabel(aheadOrBehindMonths: number | null): string {
  if (aheadOrBehindMonths == null) return "No ritmo da meta";

  if (aheadOrBehindMonths > 0.25) {
    return "Acima do plano";
  }
  if (aheadOrBehindMonths < -0.25) {
    return "Abaixo do plano";
  }
  return "No ritmo da meta";
}

function buildTechnicalInsight(goal: GoalWithStats): string {
  const ahead = goal.aheadOrBehindMonths ?? 0;
  const aporte =
  (goal.autoRuleMonthly ??
    goal.suggestedMonthly ??
    goal.currentAmount / 6) || 0;

  if (ahead < -0.5) {
    return (
      "Seu aporte está abaixo do ritmo previsto. Em investimentos de longo prazo, " +
      "a consistência é mais importante do que grandes aportes pontuais. " +
      "Considere revisar o valor mensal para reduzir o risco de não atingir o alvo no prazo."
    );
  }

  if (ahead > 0.5) {
    return (
      "Você está à frente do plano de aportes. Manter esse ritmo aumenta o efeito " +
      "dos juros compostos ao longo do tempo e oferece maior margem de segurança " +
      "contra períodos de volatilidade."
    );
  }

  if (aporte > 0 && goal.targetAmount > 0) {
    return (
      "Aporte recorrente é a base de qualquer estratégia sólida de construção de patrimônio. " +
      "Com um aporte médio de " +
      formatCurrency(aporte) +
      " por mês, o efeito composto tende a se intensificar ao longo dos anos, " +
      "especialmente se você mantiver disciplina mesmo em cenários de mercado voláteis."
    );
  }

  return (
    "Definir um valor de aporte mensal claro e sustentável ajuda a reduzir decisões emocionais " +
    "e aproxima sua estratégia de investimento de uma lógica mais profissional."
  );
}

export default function GoalInvestmentCard({ goal, isPro, onPress }: Props) {
  const aporteMensal = useMemo(() => {
    if (goal.autoRuleMonthly != null) return goal.autoRuleMonthly;
    if (goal.suggestedMonthly != null) return goal.suggestedMonthly;
    // heurística simples se nada foi definido
    if (goal.targetAmount > 0 && goal.monthsRemaining && goal.monthsRemaining > 0) {
      return goal.remainingAmount / goal.monthsRemaining;
    }
    return null;
  }, [goal]);
  console.log("INVESTMENT CARD GOAL:", goal);

  const situationLabel = formatSituationLabel(goal.aheadOrBehindMonths);
  const insight = useMemo(() => buildTechnicalInsight(goal), [goal]);

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
      <BlurView intensity={25} tint="dark" style={styles.card}>
        {/* HEADER */}
        <View style={styles.headerRow}>
          <View style={styles.iconBadge}>
            <Text style={styles.iconText}>
              {(goal.title ?? "Inv").charAt(0).toUpperCase()}
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.title} numberOfLines={1}>
              {goal.title ?? "Investimento"}
            </Text>
            <Text style={styles.subtitle}>Investimento recorrente</Text>
          </View>
        </View>

        {/* VALORES PRINCIPAIS */}
        <View style={styles.valuesRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Acumulado</Text>
            <Text style={styles.value}>
              {formatCurrency(goal.currentAmount ?? 0)}
            </Text>
          </View>

          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.label}>Alvo</Text>
            <Text style={styles.valueMuted}>
              {formatCurrency(goal.targetAmount ?? 0)}
            </Text>
          </View>
        </View>

        {/* Aporte + Situação */}
        <View style={styles.metricsRow}>
          <View style={styles.metricBlock}>
            <Text style={styles.metricLabel}>Aporte mensal</Text>
            <Text style={styles.metricValue}>
              {aporteMensal != null ? formatCurrency(aporteMensal) : "Definir aporte"}
            </Text>
          </View>

          <View style={styles.metricBlock}>
            <Text style={styles.metricLabel}>Situação</Text>
            <Text style={styles.metricValue}>{situationLabel}</Text>
          </View>
        </View>

        {/* Barra de progresso */}
        <View style={styles.progressWrapper}>
          <GoalProgressBar progress={goal.progressPercent ?? 0} height={8} />
        </View>

        {/* Insight técnico */}
        <View style={styles.insightWrapper}>
          {isPro ? (
            <>
              <Text style={styles.insightTitle}>Insight técnico</Text>
              <Text style={styles.insightText}>{insight}</Text>
            </>
          ) : (
            <>
              <Text style={styles.insightTitle}>Insight avançado</Text>
              <Text style={styles.insightLocked}>
                Desbloqueie análises de estratégia de aporte, risco e juros compostos no plano
                PRO.
              </Text>
            </>
          )}
        </View>
      </BlurView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  iconText: {
    fontFamily: brandFont,
    color: "#FFFFFF",
    fontSize: 15,
  },

  title: {
    fontFamily: brandFont,
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
  },

  subtitle: {
    fontFamily: brandFont,
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    marginTop: 2,
  },

  valuesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  label: {
    fontFamily: brandFont,
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
  },

  value: {
    fontFamily: brandFont,
    fontSize: 15,
    color: "#FFFFFF",
    fontWeight: "500",
    marginTop: 2,
  },

  valueMuted: {
    fontFamily: brandFont,
    fontSize: 14,
    color: "rgba(255,255,255,0.75)",
    marginTop: 2,
  },

  metricsRow: {
    flexDirection: "row",
    marginTop: 10,
    marginBottom: 8,
  },

  metricBlock: {
    flex: 1,
  },

  metricLabel: {
    fontFamily: brandFont,
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
    marginBottom: 2,
  },

  metricValue: {
    fontFamily: brandFont,
    fontSize: 13,
    color: "#FFFFFF",
  },

  progressWrapper: {
    marginTop: 4,
  },

  insightWrapper: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
    paddingTop: 8,
  },

  insightTitle: {
    fontFamily: brandFont,
    fontSize: 12,
    color: "#7f9daeff",
    marginBottom: 4,
  },

  insightText: {
    fontFamily: brandFont,
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
  },

  insightLocked: {
    fontFamily: brandFont,
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
  },
});

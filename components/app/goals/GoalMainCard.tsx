import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Animated,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

import type { GoalWithStats } from "@/hooks/useGoals";

const brandFont = Platform.select({
  ios: "SF Pro Display",
  android: "Inter",
  default: "System",
});

/* -----------------------------------------------------------
   Helpers
------------------------------------------------------------*/

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

function formatMonths(m: number | null): string {
  if (m == null) return "—";
  if (m <= 0) return "Concluindo";
  if (m === 1) return "1 mês";
  return `${m} meses`;
}

function formatAheadBehind(a: number | null): string {
  if (a == null) return "No ritmo do plano";
  const abs = Math.abs(a);
  const rounded = Math.round(abs * 10) / 10;

  if (a > 0.25) return `~${rounded} mês(es) adiantado`;
  if (a < -0.25) return `~${rounded} mês(es) atrasado`;
  return "No ritmo do plano";
}

function buildInsight(goal: GoalWithStats, isPro: boolean): string | null {
  if (!isPro) return null;

  if (goal.type === "goal") {
    if (goal.aheadOrBehindMonths && goal.aheadOrBehindMonths < -0.25) {
      return "Você está um pouco atrás da sua meta. Considere aumentar ligeiramente o valor mensal para recuperar o ritmo.";
    }
    if (goal.aheadOrBehindMonths && goal.aheadOrBehindMonths > 0.25) {
      return "Você está à frente do plano — ótimo sinal. Se mantiver esse ritmo, pode concluir a meta antes do previsto.";
    }
    return "Sua meta está alinhada com o plano. Mantenha a consistência para consolidar esse hábito.";
  }

  if (goal.type === "debt") {
    return "Observe se o valor das parcelas cabe com folga no seu mês. Dívidas saudáveis não deveriam comprometer mais de uma parte pequena da sua renda.";
  }

  if (goal.type === "investment") {
    return "Use essa meta para construir disciplina. Considere estudar investidores clássicos como Benjamin Graham para fortalecer sua estratégia.";
  }

  return null;
}

/* -----------------------------------------------------------
   Componente principal
------------------------------------------------------------*/

type GoalMainCardProps = {
  goal: GoalWithStats | null;
  isPro: boolean;
  onPressDetails?: () => void;
  onPressEdit?: () => void;
  onPressAddInstallment?: () => void;
};

export default function GoalMainCard({
  goal,
  isPro,
  onPressDetails,
  onPressEdit,
  onPressAddInstallment,
}: GoalMainCardProps) {
  const [barWidth, setBarWidth] = useState(0);

  // animações
  const entryAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(entryAnim, {
      toValue: 1,
      duration: 380,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    const target = goal?.progressPercent ?? 0;
    Animated.timing(progressAnim, {
      toValue: target,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [goal]);

  const animatedWidth =
    barWidth > 0
      ? progressAnim.interpolate({
          inputRange: [0, 100],
          outputRange: [0, barWidth],
        })
      : 0;

  const isDebt = goal?.type === "debt";
  const isInvestment = goal?.type === "investment";

  const paidInstallments = useMemo(() => {
    if (!goal || !isDebt) return 0;
    return goal.installments.filter((i) => i.status === "paid").length;
  }, [goal]);

  const totalInstallments = goal?.installments.length ?? 0;

  const nextInstallment = useMemo(() => {
    if (!goal || !isDebt) return null;
    const upcoming = goal.installments.filter((i) => i.status !== "paid");
    if (upcoming.length === 0) return null;
    return upcoming.reduce((acc, cur) => {
      const dAcc = new Date(acc.dueDate).getTime();
      const dCur = new Date(cur.dueDate).getTime();
      return dCur < dAcc ? cur : acc;
    });
  }, [goal]);

  const suggestedPerMonth =
    goal?.autoRuleMonthly ?? goal?.suggestedMonthly ?? null;

  const insight = goal ? buildInsight(goal, isPro) : null;

  /* Se não existe meta */
  if (!goal) {
    return (
      <BlurView
        intensity={30}
        tint="dark"
        style={[styles.card, styles.centerContent]}
      >
        <Text style={styles.emptyTitle}>Nenhuma meta definida</Text>
        <Text style={styles.emptySubtitle}>
          Crie sua primeira meta para acompanhar seu progresso aqui.
        </Text>
      </BlurView>
    );
  }

  return (
    <Animated.View
      style={{
        opacity: entryAnim,
        transform: [
          {
            translateY: entryAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [14, 0],
            }),
          },
        ],
      }}
    >
      <BlurView intensity={40} tint="dark" style={styles.card}>
        {/* HEADER */}
        <View style={styles.headerRow}>
          <View style={styles.titleWrapper}>
            <View style={styles.iconBadge}>
              <Text style={styles.iconText}>
                {goal.title?.charAt(0)?.toUpperCase()}
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.title} numberOfLines={1}>
                {goal.title}
              </Text>
              <Text style={styles.subtitle}>
                {isDebt
                  ? "Dívida planejada"
                  : isInvestment
                  ? "Investimento"
                  : "Meta pessoal"}
              </Text>
            </View>
          </View>
        </View>

        {/* VALORES */}
        <View style={styles.valuesRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.valueLabel}>Acumulado</Text>
            <Text style={styles.valueAmount}>
              {formatCurrency(goal.currentAmount)}
            </Text>
          </View>

          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.valueLabel}>Meta</Text>
            <Text style={styles.valueAmountMuted}>
              {formatCurrency(goal.targetAmount)}
            </Text>
          </View>
        </View>

        {/* BARRA DE PROGRESSO */}
        <View
          style={styles.progressWrapper}
          onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
        >
          <View style={styles.progressBackground} />

          {barWidth > 0 && (
            <Animated.View
              style={{
                width: animatedWidth,
                height: 10,
                borderRadius: 999,
                overflow: "hidden",
              }}
            >
              <LinearGradient
                colors={["#bedcf9ff", "#cce2eeff", "#c4d9e1ff"]}
                locations={[0, 0.6, 1]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
          )}
        </View>

        {/* META INFORMACIONAL */}
        <View style={styles.progressMetaRow}>
          <Text style={styles.progressPercent}>
            {Math.round(goal.progressPercent)}%
          </Text>

          <Text style={styles.progressInfo}>
            {goal.monthsRemaining != null
              ? `${formatMonths(goal.monthsRemaining)} restantes`
              : "Sem prazo definido"}
          </Text>
        </View>

        {/* MÉTRICAS */}
        <View style={styles.metricsRow}>
          <View style={styles.metricBlock}>
            <Text style={styles.metricLabel}>Meses restantes</Text>
            <Text style={styles.metricValue}>
              {formatMonths(goal.monthsRemaining)}
            </Text>
          </View>

          <View style={styles.metricBlock}>
            <Text style={styles.metricLabel}>Situação</Text>
            <Text style={styles.metricValue}>
              {formatAheadBehind(goal.aheadOrBehindMonths)}
            </Text>
          </View>

          <View style={styles.metricBlock}>
            <Text style={styles.metricLabel}>
              {isDebt ? "Parc. pagas" : "Sugestão/mês"}
            </Text>

            {isDebt ? (
              <Text style={styles.metricValue}>
                {paidInstallments}/{totalInstallments || "—"}
              </Text>
            ) : suggestedPerMonth != null && isPro ? (
              <Text style={styles.metricValue}>
                {formatCurrency(suggestedPerMonth)}
              </Text>
            ) : (
              <Text style={styles.metricValueMuted}>
                {isPro ? "—" : "Exclusivo PRO"}
              </Text>
            )}
          </View>
        </View>

        {/* BLOCOS POR TIPO */}
        {isDebt && (
          <View style={styles.typeBlock}>
            <Text style={styles.typeLabel}>Próxima parcela</Text>

            {nextInstallment ? (
              <Text style={styles.typeValue}>
                {formatCurrency(nextInstallment.amount)} •{" "}
                {new Date(nextInstallment.dueDate).toLocaleDateString("pt-BR")}
              </Text>
            ) : (
              <Text style={styles.typeValueMuted}>Nenhuma parcela futura</Text>
            )}

            <Text style={styles.typeExtra}>
              Restante: {formatCurrency(goal.remainingAmount)}
            </Text>
          </View>
        )}

        {isInvestment && (
          <View style={styles.typeBlock}>
            <Text style={styles.typeLabel}>Aporte mensal</Text>

            <Text style={styles.typeValue}>
              {suggestedPerMonth
                ? formatCurrency(suggestedPerMonth)
                : "Defina um valor mensal"}
            </Text>

            <Text style={styles.typeExtra}>
              Acumulado: {formatCurrency(goal.currentAmount)}
            </Text>
          </View>
        )}

        {/* INSIGHTS */}
        <View style={styles.insightWrapper}>
          {isPro && insight ? (
            <>
              <Text style={styles.insightTitle}>Insight PILA</Text>
              <Text style={styles.insightText}>{insight}</Text>
            </>
          ) : (
            <>
              <Text style={styles.insightLockedTitle}>
                Insights avançados
              </Text>
              <Text style={styles.insightLockedText}>
                Recomendações inteligentes estão disponíveis no plano PRO.
              </Text>
            </>
          )}
        </View>

        {/* BOTÕES */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.85}
            onPress={onPressDetails}
          >
            <Text style={styles.primaryButtonText}>Ver detalhes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.85}
            onPress={onPressEdit}
          >
            <Text style={styles.secondaryButtonText}>Editar</Text>
          </TouchableOpacity>

          {isDebt && (
            <TouchableOpacity
              style={styles.secondaryButton}
              activeOpacity={0.85}
              onPress={onPressAddInstallment}
            >
              <Text style={styles.secondaryButtonText}>+ Parcela</Text>
            </TouchableOpacity>
          )}
        </View>
      </BlurView>
    </Animated.View>
  );
}

/* -----------------------------------------------------------
   STYLES
------------------------------------------------------------*/

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 26,

    // Apple Glass
    backgroundColor: "rgba(20,20,20,0.55)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },

  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },

  emptyTitle: {
    fontFamily: brandFont,
    fontSize: 16,
    color: "#FFFFFF",
  },
  emptySubtitle: {
    fontFamily: brandFont,
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  titleWrapper: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  iconBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(138,143,255,0.17)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  iconText: {
    fontFamily: brandFont,
    fontSize: 16,
    color: "#FFFFFF",
  },

  title: {
    fontFamily: brandFont,
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  subtitle: {
    fontFamily: brandFont,
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    marginTop: 1,
  },

  valuesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  valueLabel: {
    fontFamily: brandFont,
    fontSize: 12,
    color: "rgba(255,255,255,0.55)",
  },

  valueAmount: {
    fontFamily: brandFont,
    fontSize: 21,
    color: "#FFFFFF",
    marginTop: 2,
  },

  valueAmountMuted: {
    fontFamily: brandFont,
    fontSize: 18,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },

  progressWrapper: {
    height: 10,
    marginTop: 4,
    marginBottom: 4,
    borderRadius: 999,
    overflow: "hidden",
  },

  progressBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  progressMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  progressPercent: {
    fontFamily: brandFont,
    fontSize: 13,
    color: "#FFFFFF",
  },

  progressInfo: {
    fontFamily: brandFont,
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
  },

  metricsRow: {
    flexDirection: "row",
    marginBottom: 10,
  },

  metricBlock: {
    flex: 1,
  },

  metricLabel: {
    fontFamily: brandFont,
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
    marginBottom: 2,
  },

  metricValue: {
    fontFamily: brandFont,
    fontSize: 13,
    color: "#FFFFFF",
  },

  metricValueMuted: {
    fontFamily: brandFont,
    fontSize: 13,
    color: "rgba(255,255,255,0.45)",
  },

  typeBlock: {
    marginBottom: 12,
  },

  typeLabel: {
    fontFamily: brandFont,
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
  },

  typeValue: {
    fontFamily: brandFont,
    fontSize: 13,
    color: "#FFFFFF",
    marginTop: 2,
  },

  typeValueMuted: {
    fontFamily: brandFont,
    fontSize: 13,
    color: "rgba(255,255,255,0.5)",
    marginTop: 2,
  },

  typeExtra: {
    fontFamily: brandFont,
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    marginTop: 2,
  },

  insightWrapper: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
    marginBottom: 14,
  },

  insightTitle: {
    fontFamily: brandFont,
    fontSize: 12,
    color: "#c7f1efff",
    marginBottom: 4,
  },

  insightText: {
    fontFamily: brandFont,
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    lineHeight: 16,
  },

  insightLockedTitle: {
    fontFamily: brandFont,
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 2,
  },

  insightLockedText: {
    fontFamily: brandFont,
    fontSize: 11,
    color: "rgba(255,255,255,0.55)",
  },

  actionsRow: {
    flexDirection: "row",
    gap: 8,
  },

  primaryButton: {
    flex: 1.2,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.20)",
    alignItems: "center",
    justifyContent: "center",
  },

  primaryButtonText: {
    fontFamily: brandFont,
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },

  secondaryButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.20)",
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },

  secondaryButtonText: {
    fontFamily: brandFont,
    fontSize: 13,
    color: "#FFFFFF",
  },
});

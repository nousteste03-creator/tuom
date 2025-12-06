import React, { useEffect, useRef, useState } from "react";
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
import type { Goal } from "@/hooks/useGoals";

const brandFont = Platform.select({
  ios: "SF Pro Display",
  android: "Inter",
  default: "System",
});

/* ============================================================
   Helpers
============================================================ */
function formatCurrency(value: number) {
  if (!value || isNaN(value)) return "R$ 0,00";

  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    }).format(value);
  } catch {
    return `R$ ${Number(value || 0).toFixed(2)}`;
  }
}

/* ============================================================
   Props
============================================================ */
export type GoalMainCardProps = {
  goal: Goal | null;

  progress?: number;
  remainingAmount?: number;
  nextInstallment?: number;

  isPro?: boolean;

  onPressDetails?: () => void;
  onPressEdit?: () => void;
  onPressAddInstallment?: () => void;
};

/* ============================================================
   COMPONENTE FINAL
============================================================ */
export default function GoalMainCard({
  goal,
  progress = 0,
  remainingAmount = 0,
  nextInstallment,
  isPro = false,
  onPressDetails,
  onPressEdit,
  onPressAddInstallment,
}: GoalMainCardProps) {
  const [barWidth, setBarWidth] = useState(0);

  const entryAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  /* Animação de entrada */
  useEffect(() => {
    Animated.timing(entryAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, []);

  /* Animação da barra */
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const animatedWidth =
    barWidth > 0
      ? progressAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, barWidth],
        })
      : 0;

  /* Estado vazio */
  if (!goal) {
    return (
      <BlurView intensity={30} tint="dark" style={[styles.card, styles.center]}>
        <Text style={styles.emptyTitle}>Nenhuma meta definida</Text>
        <Text style={styles.emptyText}>
          Crie sua primeira meta para acompanhar seu progresso.
        </Text>
      </BlurView>
    );
  }

  const isDebt = goal.type === "debt";
  const isInvestment = goal.type === "investment";

  /* ============================================================
     UI
  ============================================================ */
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
        <View style={styles.header}>
          <View style={styles.iconBadge}>
            <Text style={styles.iconText}>
              {goal.title.charAt(0).toUpperCase()}
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.title} numberOfLines={1}>
              {goal.title}
            </Text>

            <Text style={styles.subtitle}>
              {isDebt
                ? "Dívida"
                : isInvestment
                ? "Investimento"
                : "Meta pessoal"}
            </Text>
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

        {/* BARRA */}
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

        {/* PORCENTAGEM */}
        <View style={styles.progressMetaRow}>
          <Text style={styles.progressPercent}>
            {Math.round(progress * 100)}%
          </Text>

          <Text style={styles.progressInfo}>Sem prazo definido</Text>
        </View>

        {/* BLOCO: DÍVIDA */}
        {isDebt && (
          <View style={styles.typeBlock}>
            <Text style={styles.typeLabel}>Próxima parcela</Text>

            {nextInstallment ? (
              <Text style={styles.typeValue}>
                {formatCurrency(nextInstallment)}
              </Text>
            ) : (
              <Text style={styles.typeValueMuted}>Nenhuma parcela futura</Text>
            )}

            <Text style={styles.typeExtra}>
              Restante: {formatCurrency(remainingAmount)}
            </Text>
          </View>
        )}

        {/* INSIGHTS */}
        <View style={styles.insightWrapper}>
          {isPro ? (
            <>
              <Text style={styles.insightTitle}>Insight PILA</Text>
              <Text style={styles.insightText}>
                Insights avançados serão habilitados em breve.
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.insightLockedTitle}>Insights avançados</Text>
              <Text style={styles.insightLockedText}>
                Disponível apenas no plano PRO.
              </Text>
            </>
          )}
        </View>

        {/* BOTÕES */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.primaryButton} onPress={onPressDetails}>
            <Text style={styles.primaryButtonText}>Ver detalhes</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={onPressEdit}>
            <Text style={styles.secondaryButtonText}>Editar</Text>
          </TouchableOpacity>

          {isDebt && (
            <TouchableOpacity
              style={styles.secondaryButton}
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

/* ============================================================
   STYLES
============================================================ */
const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 26,
    backgroundColor: "rgba(20,20,20,0.55)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },

  center: {
    justifyContent: "center",
    alignItems: "center",
  },

  emptyTitle: {
    fontFamily: brandFont,
    fontSize: 16,
    color: "#FFFFFF",
  },
  emptyText: {
    fontFamily: brandFont,
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
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
  },

  typeValueMuted: {
    fontFamily: brandFont,
    fontSize: 13,
    color: "rgba(255,255,255,0.5)",
  },

  typeExtra: {
    fontFamily: brandFont,
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
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
    color: "#c7f1ef",
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
  },

  primaryButtonText: {
    fontFamily: brandFont,
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  secondaryButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.20)",
    alignItems: "center",
  },

  secondaryButtonText: {
    fontFamily: brandFont,
    fontSize: 13,
    color: "#FFFFFF",
  },
});

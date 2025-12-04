// components/app/goals/GoalInstallmentsTimeline.tsx
import React, { useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Platform,
  ScrollView,
} from "react-native";
import { BlurView } from "expo-blur";
import type { Installment } from "@/hooks/useGoals";

const brandFont = Platform.select({
  ios: "SF Pro Display",
  android: "Inter",
  default: "System",
});

type Props = {
  installments: Installment[];
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

function formatShortDate(iso: string) {
  if (!iso) return "--/--";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "--/--";
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
}

export default function GoalInstallmentsTimeline({ installments }: Props) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const sorted = useMemo(() => {
  const arr = [...(installments ?? [])];

    arr.sort((a, b) => {
      if (a.sequence != null && b.sequence != null) {
        return (a.sequence ?? 0) - (b.sequence ?? 0);
      }
      return (
        new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      );
    });
    return arr;
  }, [installments]);

  const total = sorted.length;
  const paidCount = sorted.filter((i) => i.status === "paid").length;

  const currentIndex = useMemo(() => {
    const idx = sorted.findIndex(
      (i) => i.status === "upcoming" || i.status === "overdue"
    );
    if (idx === -1) {
      // tudo pago ou sem futuras → considera última como atual
      return total > 0 ? total - 1 : -1;
    }
    return idx;
  }, [sorted, total]);

  const nextInstallment =
    sorted.find((i) => i.status === "upcoming" || i.status === "overdue") ??
    null;

  return (
    <Animated.View
      style={{
        opacity: anim,
        transform: [
          {
            translateY: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [12, 0],
            }),
          },
        ],
      }}
    >
      <BlurView intensity={26} tint="dark" style={styles.card}>
        <Text style={styles.title}>Cronograma de parcelas</Text>

        {/* Linha de blocos glass */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.blocksRow}
        >
          {sorted.map((inst, index) => {
            const isPaid = inst.status === "paid";
            const isOverdue = inst.status === "overdue";
            const isCurrent = index === currentIndex;

            let backgroundColor = "rgba(255,255,255,0.04)";
            let borderColor = "rgba(255,255,255,0.08)";
            let labelColor = "rgba(255,255,255,0.65)";
            let amountColor = "#FFFFFF";

            if (isPaid) {
              backgroundColor = "rgba(255,255,255,0.02)";
              borderColor = "rgba(255,255,255,0.10)";
              amountColor = "rgba(255,255,255,0.75)";
            }

            if (isCurrent) {
              backgroundColor = "rgba(138,143,255,0.18)";
              borderColor = "rgba(138,143,255,0.9)";
              labelColor = "rgba(255,255,255,0.85)";
              amountColor = "#FFFFFF";
            }

            if (isOverdue) {
              borderColor = "rgba(255,120,120,0.85)";
              backgroundColor = "rgba(255,120,120,0.12)";
            }

            return (
              <View
                key={inst.id}
                style={[
                  styles.block,
                  {
                    backgroundColor,
                    borderColor,
                  },
                ]}
              >
                <Text style={[styles.blockLabel, { color: labelColor }]}>
                  {index + 1}/{total || 1}
                </Text>

                <Text style={[styles.blockAmount, { color: amountColor }]}>
                  {formatCurrency(inst.amount)}
                </Text>

                <Text style={styles.blockDate}>
                  {formatShortDate(inst.dueDate)}
                </Text>

                {/* Indicador de status minimalista */}
                <View style={styles.statusLineWrapper}>
                  <View
                    style={[
                      styles.statusLine,
                      isPaid && styles.statusPaid,
                      isCurrent && styles.statusCurrent,
                      isOverdue && styles.statusOverdue,
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Rodapé com resumo */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>
            {paidCount} de {total} pagas
          </Text>

          {nextInstallment ? (
            <Text style={styles.footerText}>
              Próxima: {formatCurrency(nextInstallment.amount)} •{" "}
              {formatShortDate(nextInstallment.dueDate)}
            </Text>
          ) : (
            <Text style={styles.footerText}>
              Nenhuma parcela futura
            </Text>
          )}
        </View>
      </BlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    backgroundColor: "rgba(15,15,18,0.7)",
  },

  title: {
    fontFamily: brandFont,
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    marginBottom: 10,
  },

  blocksRow: {
    flexDirection: "row",
    paddingRight: 4,
  },

  block: {
    width: 96,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },

  blockLabel: {
    fontFamily: brandFont,
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
    marginBottom: 2,
  },

  blockAmount: {
    fontFamily: brandFont,
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 2,
  },

  blockDate: {
    fontFamily: brandFont,
    fontSize: 11,
    color: "rgba(255,255,255,0.65)",
  },

  statusLineWrapper: {
    marginTop: 6,
  },

  statusLine: {
    height: 3,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.16)",
  },

  statusPaid: {
    backgroundColor: "rgba(160,230,190,0.65)",
  },

  statusCurrent: {
    backgroundColor: "rgba(138,143,255,0.95)",
  },

  statusOverdue: {
    backgroundColor: "rgba(255,120,120,0.9)",
  },

  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  footerText: {
    fontFamily: brandFont,
    fontSize: 12,
    color: "rgba(255,255,255,0.65)",
  },
});

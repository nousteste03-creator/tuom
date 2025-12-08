// components/app/goals/GoalDebtCard.tsx
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
  goal?: GoalWithStats;
  onPress?: () => void;
};

export default function GoalDebtCard({ goal, onPress }: Props) {
  /** ------------------------------------------------------------
   * FAIL-SAFE FINAL
   * Nunca exibir skeleton, nunca exibir mensagem errada.
   * Se goal ainda não carregou → simplesmente não renderiza.
   --------------------------------------------------------------*/
  if (!goal) return null;

  const installments = goal.installments ?? [];

  /** ------------------------------------------------------------
   * Parcelas pagas / totais
   --------------------------------------------------------------*/
  const paidInstallments = installments.filter((i) => i.status === "paid").length;
  const totalInstallments = installments.length;

  /** ------------------------------------------------------------
   * Próxima parcela (manual ou automática)
   --------------------------------------------------------------*/
  const nextInstallment = useMemo(() => {
    const upcoming = installments.filter((i) => i.status !== "paid");
    if (upcoming.length === 0) return null;

    return upcoming.reduce((acc, cur) =>
      new Date(cur.dueDate).getTime() < new Date(acc.dueDate).getTime()
        ? cur
        : acc
    );
  }, [installments]);

  /** ------------------------------------------------------------
   * Restante — sempre correto
   --------------------------------------------------------------*/
  const remaining = goal.remainingAmount ?? 0;

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
      <BlurView intensity={25} tint="dark" style={styles.card}>
        {/* HEADER */}
        <View style={styles.headerRow}>
          <View style={styles.iconBadge}>
            <Text style={styles.iconText}>
              {(goal.title ?? "M").charAt(0).toUpperCase()}
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.title} numberOfLines={1}>
              {goal.title ?? "Meta sem nome"}
            </Text>

            <Text style={styles.subtitle}>
              {paidInstallments}/{totalInstallments} parcelas
            </Text>
          </View>
        </View>

        {/* RESTANTE */}
        <View style={styles.infoRow}>
          <Text style={styles.label}>Restante</Text>

          <Text style={styles.amount}>
            {Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(remaining)}
          </Text>
        </View>

        {/* PRÓXIMA PARCELA */}
        {nextInstallment && (
          <Text style={styles.next}>
            Próxima:{" "}
            {Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(nextInstallment.amount)}{" "}
            • {new Date(nextInstallment.dueDate).toLocaleDateString("pt-BR")}
          </Text>
        )}

        {/* PROGRESSO */}
        <View style={{ marginTop: 10 }}>
          <GoalProgressBar progress={goal.progressPercent ?? 0} height={8} />
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
  },

  infoRow: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  label: {
    fontFamily: brandFont,
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
  },

  amount: {
    fontFamily: brandFont,
    fontSize: 15,
    color: "#FFFFFF",
    fontWeight: "500",
  },

  next: {
    fontFamily: brandFont,
    fontSize: 12,
    color: "rgba(255,255,255,0.75)",
    marginTop: 6,
  },
});

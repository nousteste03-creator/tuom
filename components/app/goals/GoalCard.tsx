// components/app/goals/GoalCard.tsx
import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
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

  // NOVAS PROPS
  onPressDetail?: () => void;
  onPressEdit?: () => void;
  onPressContribution?: () => void;

  // fallback original
  onPress?: () => void;
};

function formatCurrency(v: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(v);
}

export default function GoalCard({
  goal,
  onPress,
  onPressDetail,
  onPressEdit,
  onPressContribution,
}: Props) {
  const handlePress = () => {
    if (onPressDetail) return onPressDetail();
    if (onPress) return onPress();
  };

  const isDebt = goal.type === "debt";
  const isInvestment = goal.type === "investment";

  const paidInstallments = useMemo(() => {
    if (!isDebt) return 0;
    return goal.installments.filter((i) => i.status === "paid").length;
  }, [goal]);

  const nextInstallment = useMemo(() => {
    if (!isDebt) return null;
    const upcoming = goal.installments.filter((i) => i.status !== "paid");
    if (upcoming.length === 0) return null;

    return upcoming.reduce((acc, cur) =>
      new Date(cur.dueDate).getTime() < new Date(acc.dueDate).getTime()
        ? cur
        : acc
    );
  }, [goal]);

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={handlePress}>
      <BlurView intensity={22} tint="dark" style={styles.card}>
        <View style={styles.row}>
          {/* Ícone minimalista */}
          <View style={styles.icon}>
            <Text style={styles.iconText}>
              {goal.title.charAt(0).toUpperCase()}
            </Text>
          </View>

          {/* Conteúdo */}
          <View style={{ flex: 1 }}>
            <Text style={styles.title} numberOfLines={1}>
              {goal.title}
            </Text>

            {/* SUBINFO */}
            {goal.type === "goal" && (
              <Text style={styles.subtitle}>
                {formatCurrency(goal.currentAmount)} /{" "}
                {formatCurrency(goal.targetAmount)}
              </Text>
            )}

            {isDebt && (
              <Text style={styles.subtitle}>
                {paidInstallments}/{goal.installments.length} parcelas • restante{" "}
                {formatCurrency(goal.remainingAmount)}
              </Text>
            )}

            {isInvestment && (
              <Text style={styles.subtitle}>
                Acumulado {formatCurrency(goal.currentAmount)} • aporte{" "}
                {goal.suggestedMonthly
                  ? formatCurrency(goal.suggestedMonthly)
                  : "—"}
              </Text>
            )}

            {/* Barra de progresso */}
            <View style={{ marginTop: 6 }}>
              <GoalProgressBar progress={goal.progressPercent} height={6} />
            </View>
          </View>

          <Text style={styles.chevron}>›</Text>
        </View>
      </BlurView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderRadius: 18,
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
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
    fontSize: 15,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  subtitle: {
    fontFamily: brandFont,
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    marginTop: 2,
  },
  chevron: {
    fontSize: 22,
    color: "rgba(255,255,255,0.45)",
    marginLeft: 8,
  },
});

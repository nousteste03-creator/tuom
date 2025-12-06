// app/goals/[id].tsx
import React from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  StyleSheet,
} from "react-native";
import {
  useLocalSearchParams,
  useRouter,
  useFocusEffect,
} from "expo-router";

import Screen from "@/components/layout/Screen";
import Icon from "@/components/ui/Icon";

import GoalMainCard from "@/components/app/goals/GoalMainCard";
import GoalDebtCard from "@/components/app/goals/GoalDebtCard";
import GoalInvestmentCard from "@/components/app/goals/GoalInvestmentCard";
import GoalInstallmentsTimeline from "@/components/app/goals/GoalInstallmentsTimeline";
import GoalsInsightsCard from "@/components/app/goals/GoalsInsightsCard";

import { useGoals } from "@/hooks/useGoals";
import { useGoalsInsights } from "@/hooks/useGoalsInsights";

const brandFont = Platform.select({
  ios: "SF Pro Display",
  android: "Inter",
  default: "System",
});

export default function GoalDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const rawId = params?.id ?? null;

  /** ------------------------------------------------------------
   * (1) BLOQUEAR goalId === "create"
   * ------------------------------------------------------------ */
  const goalId = rawId === "create" ? null : rawId;

  const { loading, goals, debts, investments, reload } = useGoals();
  const { insights } = useGoalsInsights();

  /** ------------------------------------------------------------
   * (2) FOCUS EFFECT — sem spam
   * ------------------------------------------------------------ */
  useFocusEffect(
    React.useCallback(() => {
      reload(); // sem logs extras
    }, [reload])
  );

  /** ------------------------------------------------------------
   * Encontrar meta
   * ------------------------------------------------------------ */
  const goal = React.useMemo(() => {
    if (!goalId) return null;
    return (
      goals.find((g) => g.id === goalId) ||
      debts.find((g) => g.id === goalId) ||
      investments.find((g) => g.id === goalId) ||
      null
    );
  }, [goalId, goals, debts, investments]);

  /** ------------------------------------------------------------
   * (5) Parcial — usamos installments corretas
   * ------------------------------------------------------------ */
  const installmentsAll = goal?.installments ?? [];
  const hasInstallments = installmentsAll.length > 0;

  /** ------------------------------------------------------------
   * Loading
   * ------------------------------------------------------------ */
  if (loading) {
    return (
      <Screen style={styles.center}>
        <ActivityIndicator size="large" color="#fff" />
      </Screen>
    );
  }

  /** ------------------------------------------------------------
   * (1) Meta inválida ou goalId="create"
   * ------------------------------------------------------------ */
  if (!goal) {
    return (
      <Screen style={styles.center}>
        <Text style={styles.notFound}>Meta não encontrada.</Text>

        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>
      </Screen>
    );
  }

  /** ------------------------------------------------------------
   * Render principal
   * ------------------------------------------------------------ */
  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* HEADER */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.iconBtn}
          >
            {/* (4) Corrigir ícone inválido */}
            <Icon name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.title}>{goal.title}</Text>

          <View style={{ width: 32 }} />
        </View>

        {/* MAIN CARD */}
        <GoalMainCard goal={goal} />

        {/* CARDS ESPECÍFICOS */}
        {goal.type === "debt" && <GoalDebtCard debt={goal} />}
        {goal.type === "investment" && (
          <GoalInvestmentCard investment={goal} />
        )}

        {/* TIMELINE */}
        {hasInstallments && (
          <GoalInstallmentsTimeline installments={installmentsAll} />
        )}

        {/* INSIGHTS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Insights</Text>

          {!insights || insights.length === 0 ? (
            <Text style={styles.noInsights}>Nenhum insight disponível.</Text>
          ) : (
            insights.map((insight, idx) => (
              <GoalsInsightsCard key={idx} item={insight} />
            ))
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

/* ------------------------------------------------------------
   Estilos — Premium Apple/Glass
------------------------------------------------------------ */
const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  headerRow: {
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontFamily: brandFont,
    fontSize: 20,
    color: "#fff",
    fontWeight: "600",
  },

  section: {
    marginTop: 30,
    paddingHorizontal: 18,
  },

  sectionTitle: {
    fontFamily: brandFont,
    fontSize: 17,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 12,
  },

  noInsights: {
    fontFamily: brandFont,
    color: "rgba(255,255,255,0.45)",
    fontSize: 15,
  },

  notFound: {
    fontFamily: brandFont,
    fontSize: 18,
    color: "#fff",
    marginBottom: 14,
  },

  backBtn: {
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.10)",
  },

  backText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: brandFont,
  },
});

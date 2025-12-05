// app/goals/[id].tsx
import React, { useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import Screen from "@/components/layout/Screen";
import Icon from "@/components/ui/Icon";

import GoalMainCard from "@/components/app/goals/GoalMainCard";
import GoalDebtCard from "@/components/app/goals/GoalDebtCard";
import GoalInvestmentCard from "@/components/app/goals/GoalInvestmentCard";
import GoalsInsightsCard from "@/components/app/goals/GoalsInsightsCard";

import { useGoals } from "@/hooks/useGoals";
import { useGoalsInsights } from "@/hooks/useGoalsInsights";
import { useUserPlan } from "@/hooks/useUserPlan";

const brandFont = Platform.select({
  ios: "SF Pro Display",
  android: "Inter",
  default: "System",
});

export default function GoalDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const goalId = params.id;

  const { goals, debts, investments, loading } = useGoals();
  const { insights, loading: loadingInsights } = useGoalsInsights();
  const { isPro } = useUserPlan();

  const allItems = useMemo(
    () => [...(goals ?? []), ...(debts ?? []), ...(investments ?? [])],
    [goals, debts, investments]
  );

  const goal = allItems.find((g) => g.id === goalId);

  if (loading && !goal) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      </Screen>
    );
  }

  if (!goal) {
    return (
      <Screen>
        <View style={styles.center}>
          <Text style={styles.error}>Meta não encontrada.</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.link}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </Screen>
    );
  }

  const goalInsights = insights.filter((ins) =>
    ins.id.endsWith(goalId || "")
  );

  return (
    <Screen>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerBtn}
        >
          <Icon name="chevron-left" size={18} />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {goal.title}
        </Text>

        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      >
        <View style={{ marginBottom: 20 }}>
          {goal.type === "goal" && (
            <GoalMainCard
              goal={goal}
              progress={goal.progressPercent / 100}
              remainingAmount={goal.remainingAmount}
              isPro={isPro}
              onPressDetails={() => {}}
              onPressEdit={() =>
                router.push(`/goals/edit/page?id=${goal.id}`)
              }
            />
          )}

          {goal.type === "debt" && (
            <GoalDebtCard
              goal={goal}
              onPressEdit={() =>
                router.push(`/goals/edit/page?id=${goal.id}`)
              }
            />
          )}

          {goal.type === "investment" && (
            <GoalInvestmentCard
              goal={goal}
              onPressEdit={() =>
                router.push(`/goals/edit/page?id=${goal.id}`)
              }
            />
          )}
        </View>

        <View style={{ marginBottom: 20 }}>
          <Text style={styles.blockTitle}>Insights desta meta</Text>

          {loadingInsights && (
            <ActivityIndicator style={{ marginTop: 12 }} />
          )}

          {!loadingInsights &&
            goalInsights.map((ins) => (
              <View key={ins.id} style={{ marginBottom: 12 }}>
                <GoalsInsightsCard insight={ins} isPro={isPro} />
              </View>
            ))}

          {!loadingInsights && goalInsights.length === 0 && (
            <Text style={styles.emptyText}>
              Nenhum insight disponível.
            </Text>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    alignItems: "center",
  },
  headerBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontFamily: brandFont,
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  blockTitle: {
    fontFamily: brandFont,
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  emptyText: {
    fontFamily: brandFont,
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
  },
  error: {
    color: "#fff",
    fontSize: 15,
    marginBottom: 6,
    fontFamily: brandFont,
  },
  link: {
    color: "#87b4c7ff",
    fontSize: 13,
    fontWeight: "500",
    fontFamily: brandFont,
  },
});

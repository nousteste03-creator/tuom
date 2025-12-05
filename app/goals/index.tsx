import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";

import Screen from "@/components/layout/Screen";
import Icon from "@/components/ui/Icon";

import GoalsHeader from "@/components/app/goals/GoalsHeader";
import GoalMainCard from "@/components/app/goals/GoalMainCard";
import GoalCard from "@/components/app/goals/GoalCard";
import GoalDebtCard from "@/components/app/goals/GoalDebtCard";
import GoalInvestmentCard from "@/components/app/goals/GoalInvestmentCard";
import GoalInstallmentsTimeline from "@/components/app/goals/GoalInstallmentsTimeline";
import GoalsEmptyState from "@/components/app/goals/GoalsEmptyState";
import GoalsIncomeBlock from "@/components/app/goals/GoalsIncomeBlock";
import GoalsInsightsCard from "@/components/app/goals/GoalsInsightsCard";

import { useGoals, Goal } from "@/hooks/useGoals";
import { useIncomeSources } from "@/hooks/useIncomeSources";
import { useGoalsInsights } from "@/hooks/useGoalsInsights";
import { useUserPlan } from "@/hooks/useUserPlan";

const brandFont = Platform.select({
  ios: "SF Pro Display",
  android: "Inter",
  default: "System",
});

type SegmentKey = "overview" | "debts" | "investments" | "income";

const SEGMENTS = [
  { key: "overview", label: "Visão Geral" },
  { key: "debts", label: "Dívidas" },
  { key: "investments", label: "Investimentos" },
  { key: "income", label: "Receitas" },
];

function GoalsSegmentedControl({ value, onChange }) {
  return (
    <View style={styles.segmentContainer}>
      {SEGMENTS.map((seg) => {
        const active = seg.key === value;
        return (
          <TouchableOpacity
            key={seg.key}
            activeOpacity={0.8}
            onPress={() => onChange(seg.key)}
            style={[styles.segmentItem, active && styles.segmentItemActive]}
          >
            <Text
              style={[
                styles.segmentLabel,
                active && styles.segmentLabelActive,
              ]}
            >
              {seg.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function GoalsIndexScreen() {
  const router = useRouter();
  const [segment, setSegment] = useState<SegmentKey>("overview");

  const { loading: goalsLoading, goals, debts, investments } = useGoals();
  const {
    incomeSources,
    nextIncomeEvent,
    totalMonthlyIncome,
    loading: incomeLoading,
  } = useIncomeSources();
  const { insights, loading: insightsLoading } = useGoalsInsights();
  const { isPro } = useUserPlan();

  const segmentAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    segmentAnim.setValue(0);
    Animated.timing(segmentAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [segment]);

  const animatedStyle = {
    opacity: segmentAnim,
    transform: [
      {
        translateX: segmentAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [16, 0],
        }),
      },
    ],
  };

  const primaryGoal: Goal | null = useMemo(() => {
    if (!goals || goals.length === 0) return null;

    const explicitPrimary = goals.find(
      (g) => g.type === "goal" && (g as any).isPrimary
    );
    if (explicitPrimary) return explicitPrimary;

    const goalsOnly = goals.filter((g) => g.type === "goal");
    if (goalsOnly.length === 0) return null;

    return [...goalsOnly].sort((a, b) => {
      const aDate = new Date((a as any).createdAt ?? 0).getTime();
      const bDate = new Date((b as any).createdAt ?? 0).getTime();
      return bDate - aDate;
    })[0];
  }, [goals]);

  const otherGoals = useMemo(() => {
    if (!goals || goals.length === 0) return [];
    if (!primaryGoal) return goals;
    return goals.filter((g) => g.id !== primaryGoal.id);
  }, [goals, primaryGoal]);

  const hasAnyGoal =
    (goals && goals.length > 0) ||
    (debts && debts.length > 0) ||
    (investments && investments.length > 0);

  /* VISÃO GERAL */
  const renderOverview = () => {
    if (!hasAnyGoal) {
      return (
        <View style={styles.block}>
          <GoalsEmptyState />
        </View>
      );
    }

    return (
      <>

        {/* META PRINCIPAL */}
        {primaryGoal && (
          <View style={styles.block}>
            <GoalMainCard
              goal={primaryGoal}
              onPressDetails={() => router.push(`/goals/${primaryGoal.id}`)}
              onPressEdit={() =>
                router.push(`/goals/edit?id=${primaryGoal.id}`)
              }
            />
          </View>
        )}

        {/* OUTRAS METAS */}
        {otherGoals.length > 0 && (
          <View style={styles.block}>
            <Text style={styles.blockTitle}>Todas as metas</Text>

            {otherGoals.map((goal) => (
              <View key={goal.id} style={styles.goalItemWrapper}>
                <GoalCard
                  goal={goal}
                  onPress={() => router.push(`/goals/${goal.id}`)}
                />
              </View>
            ))}
          </View>
        )}

        {/* LINHA DO TEMPO */}
        <View style={styles.block}>
          <Text style={styles.blockTitle}>Próximas parcelas</Text>
          <GoalInstallmentsTimeline />
        </View>

        {/* INSIGHTS */}
        <View style={styles.block}>
          <Text style={styles.blockTitle}>Insights sobre suas metas</Text>

          {insightsLoading && <ActivityIndicator style={{ marginTop: 12 }} />}

          {!insightsLoading && insights.length === 0 && (
            <Text style={styles.emptyText}>
              Nenhum insight crítico no momento.
            </Text>
          )}

          {!insightsLoading &&
            insights.length > 0 &&
            insights.map((ins) => (
              <View key={ins.id} style={{ marginBottom: 12 }}>
                <GoalsInsightsCard insight={ins} isPro={isPro} />
              </View>
            ))}
        </View>
      </>
    );
  };

  /* DÍVIDAS */
  const renderDebts = () => (
    <>
      <View style={styles.block}>
        <View style={styles.blockHeaderRow}>
          <Text style={styles.blockTitle}>Minhas dívidas</Text>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push("/goals/create?type=debt")}
          >
            <Text style={styles.linkText}>Nova dívida</Text>
          </TouchableOpacity>
        </View>

        {debts.length === 0 && (
          <Text style={styles.emptyText}>Nenhuma dívida cadastrada.</Text>
        )}

        {debts.map((d) => (
          <View key={d.id} style={styles.goalItemWrapper}>
            <GoalDebtCard
              goal={d}
              onPress={() => router.push(`/goals/${d.id}`)}
            />
          </View>
        ))}
      </View>

      <View style={styles.block}>
        <Text style={styles.blockTitle}>Linha do tempo das parcelas</Text>
        <GoalInstallmentsTimeline />
      </View>
    </>
  );

  /* INVESTIMENTOS */
  const renderInvestments = () => (
    <>
      <View style={styles.block}>
        <View style={styles.blockHeaderRow}>
          <Text style={styles.blockTitle}>Investimentos</Text>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push("/goals/create?type=investment")}
          >
            <Text style={styles.linkText}>Novo investimento</Text>
          </TouchableOpacity>
        </View>

        {investments.length === 0 && (
          <Text style={styles.emptyText}>
            Nenhum investimento cadastrado.
          </Text>
        )}

        {investments.map((inv) => (
          <View key={inv.id} style={styles.goalItemWrapper}>
            <GoalInvestmentCard
              goal={inv}
              onPress={() => router.push(`/goals/${inv.id}`)}
            />
          </View>
        ))}
      </View>

      <View style={styles.block}>
        <Text style={styles.blockTitle}>Cronograma de aportes</Text>
        <GoalInstallmentsTimeline />
      </View>
    </>
  );

  /* RECEITAS */
  const renderIncome = () => (
    <>
      <View style={styles.block}>
        <View style={styles.blockHeaderRow}>
          <Text style={styles.blockTitle}>Receitas</Text>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push("/goals/create?type=income")}
          >
            <Text style={styles.linkText}>Nova receita</Text>
          </TouchableOpacity>
        </View>

        {incomeLoading ? (
          <ActivityIndicator style={{ marginTop: 12 }} />
        ) : (
          <GoalsIncomeBlock
            incomeSources={incomeSources}
            nextIncomeEvent={nextIncomeEvent}
            totalMonthlyIncome={totalMonthlyIncome}
          />
        )}
      </View>
    </>
  );

  const renderSegmentContent = () => {
    switch (segment) {
      case "overview":
        return renderOverview();
      case "debts":
        return renderDebts();
      case "investments":
        return renderInvestments();
      case "income":
        return renderIncome();
    }
  };

  const globalLoading = goalsLoading && !hasAnyGoal;

  /* RENDER FINAL */
  return (
    <Screen>
      <GoalsHeader
        title="Metas"
        subtitle="Planejamento do mês"
        rightActions={
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => router.push("/goals/create")}
              style={styles.headerIconButton}
              activeOpacity={0.9}
            >
              <Icon name="plus" size={18} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {}}
              style={styles.headerIconButton}
              activeOpacity={0.9}
            >
              <Icon name="slider" size={18} />
            </TouchableOpacity>
          </View>
        }
      />

      {globalLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator />
        </View>
      ) : (
        <>
          <GoalsSegmentedControl value={segment} onChange={setSegment} />

          <Animated.View style={[styles.contentContainer, animatedStyle]}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {renderSegmentContent()}
            </ScrollView>
          </Animated.View>
        </>
      )}
    </Screen>
  );
}

/* ======================================================================
   STYLES — mantidos iguais
====================================================================== */
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  headerActions: {
    flexDirection: "row",
    gap: 8,
  },

  headerIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
  },

  segmentContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    marginTop: 8,
    marginBottom: 4,
    marginHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
  },

  segmentItem: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },

  segmentItemActive: {
    backgroundColor: "rgba(255,255,255,0.16)",
  },

  segmentLabel: {
    fontFamily: brandFont,
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
  },

  segmentLabelActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },

  contentContainer: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 8,
  },

  block: {
    marginBottom: 20,
  },

  blockHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },

  blockTitle: {
    fontFamily: brandFont,
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  linkText: {
    fontFamily: brandFont,
    fontSize: 13,
    color: "#87b4c7ff",
    fontWeight: "500",
  },

  emptyText: {
    fontFamily: brandFont,
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    marginTop: 6,
  },

  goalItemWrapper: {
    marginTop: 10,
  },
});

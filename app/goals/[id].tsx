import React, { useMemo, useCallback } from "react";
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

// METAS / DÍVIDAS
import GoalMainCard from "@/components/app/goals/GoalMainCard";
import GoalDebtMainCard from "@/components/app/goals/GoalDebtMainCard";

// INVESTIMENTOS
import InvestmentMainBlock from "@/components/app/investments/InvestmentMainBlock";
import {
  SeriesMap,
  SeriesPoint,
} from "@/components/app/investments/InvestmentTimeframesPanel";

// TIMELINE / INSIGHTS
import GoalInstallmentsTimeline from "@/components/app/goals/GoalInstallmentsTimeline";
import GoalsInsightsCard from "@/components/app/goals/GoalsInsightsCard";

// HOOKS
import { useGoals } from "@/context/GoalsContext";
import { useGoalsInsights } from "@/hooks/useGoalsInsights";
import { useIncomeSources } from "@/hooks/useIncomeSources";
import { useUserPlan } from "@/hooks/useUserPlan";

const brandFont = Platform.select({
  ios: "SF Pro Display",
  android: "Inter",
  default: "System",
});

/* ============================================================
   HELPERS — séries Apple Stocks
============================================================ */
function buildInvestmentSeries(goal: any): SeriesMap {
  const todayISO = new Date().toISOString().split("T")[0];

  const base: SeriesPoint = {
    date: todayISO,
    value: Number(goal?.currentAmount ?? 0),
  };

  const future = goal?.projection?.curveFuture ?? [];
  const curve = [base, ...future];

  const ensure = (arr: SeriesPoint[]) => (arr.length ? arr : curve);

  return {
    "1D": ensure(curve),
    "1S": ensure(curve),
    "1M": ensure(curve),
    "3M": ensure(curve),
    "1Y": ensure(curve),
    ALL: curve,
  };
}

export default function GoalDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const { isPro } = useUserPlan();

  const goalId = params?.id && params.id !== "create" ? params.id : null;

  /* ============================================================
     DADOS — NORMALIZAÇÃO OBRIGATÓRIA
  ============================================================ */
  const {
    loading,
    goals: rawGoals,
    debts: rawDebts,
    investments: rawInvestments,
    reload,
  } = useGoals();

  const goals = Array.isArray(rawGoals) ? rawGoals : [];
  const debts = Array.isArray(rawDebts) ? rawDebts : [];
  const investments = Array.isArray(rawInvestments) ? rawInvestments : [];

  const { incomeSources } = useIncomeSources();

  /* ============================================================
     RELOAD AO FOCAR
  ============================================================ */
  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  /* ============================================================
     LOCALIZAR ITEM (AGORA 100% SEGURO)
  ============================================================ */
  const goal = useMemo(() => {
    if (!goalId) return null;

    return (
      goals.find((g) => g.id === goalId) ||
      debts.find((d) => d.id === goalId) ||
      investments.find((i) => i.id === goalId) ||
      null
    );
  }, [goalId, goals, debts, investments]);

  const isDebt = goal?.type === "debt";
  const isInvestment = goal?.type === "investment";
  const isGoal = goal?.type === "goal";
  const hasInstallments = (goal?.installments ?? []).length > 0;

  /* ============================================================
     INSIGHTS
  ============================================================ */
  const tab: "goals" | "debts" | "investments" =
    isDebt ? "debts" : isInvestment ? "investments" : "goals";

  const { insights, loading: insightsLoading } = useGoalsInsights({
    tab,
    goals,
    debts,
    investments,
    incomeSources,
  });

  /* ============================================================
     HANDLERS DE AÇÃO
  ============================================================ */
  const goEdit = () => {
    if (!goal) return;

    if (isInvestment) {
      router.push(`/goals/investments/edit?id=${goal.id}`);
      return;
    }

    if (isDebt) {
      router.push(`/goals/details/debt-edit?id=${goal.id}`);
      return;
    }

    router.push(`/goals/details/edit?id=${goal.id}`);
  };

  const goAddContribution = () => {
    if (!goal) return;

    if (isInvestment) {
      router.push(`/goals/investments/contribution?id=${goal.id}`);
      return;
    }

    if (isGoal) {
      router.push(`/goals/details/add?id=${goal.id}`);
    }
  };

  const goAddInstallment = () => {
    if (!goal || !isDebt) return;
    router.push(`/goals/details/debt-add-installment?id=${goal.id}`);
  };

  const goPayDebt = () => {
    if (!goal || !isDebt) return;
    router.push(`/goals/details/debt-pay?id=${goal.id}`);
  };

  const goSettleDebt = () => {
    if (!goal || !isDebt) return;
    router.push(`/goals/details/debt-settle?id=${goal.id}`);
  };

  /* ============================================================
     LOADING / NOT FOUND
  ============================================================ */
  if (loading && !goal) {
    return (
      <Screen style={styles.center}>
        <ActivityIndicator size="large" color="#fff" />
      </Screen>
    );
  }

  if (!goal) {
    return (
      <Screen style={styles.center}>
        <Text style={styles.notFound}>Item não encontrado.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>
      </Screen>
    );
  }

  /* ============================================================
     SERIES — INVESTIMENTO
  ============================================================ */
  const series: SeriesMap = isInvestment
    ? buildInvestmentSeries(goal)
    : {
        "1D": [],
        "1S": [],
        "1M": [],
        "3M": [],
        "1Y": [],
        ALL: [],
      };

  /* ============================================================
     RENDER
  ============================================================ */
  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        {/* HEADER */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <Icon name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.title}>{goal.title}</Text>
          <View style={{ width: 32 }} />
        </View>

        {/* META / DÍVIDA */}
        {isDebt ? (
          <GoalDebtMainCard
            debt={goal}
            showSettleButton
            onPressPay={goPayDebt}
            onPressEdit={goEdit}
            onPressSettle={goSettleDebt}
          />
        ) : !isInvestment ? (
          <GoalMainCard
            goal={goal}
            isPro={isPro}
            onPressDetails={goAddContribution}
            onPressEdit={goEdit}
            onPressAddInstallment={goAddInstallment}
          />
        ) : null}

        {/* INVESTIMENTO */}
        {isInvestment && (
          <View style={{ marginTop: 20, paddingHorizontal: 18 }}>
            <InvestmentMainBlock
              goal={goal}
              series={series}
              onPressAdd={goAddContribution}
              onPressEdit={goEdit}
            />
          </View>
        )}

        {/* PARCELAS */}
        {hasInstallments && (
          <GoalInstallmentsTimeline installments={goal.installments} />
        )}

        {/* INSIGHTS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Insights</Text>

          {insightsLoading ? (
            <Text style={styles.noInsights}>Carregando insights...</Text>
          ) : insights.length === 0 ? (
            <Text style={styles.noInsights}>Nenhum insight disponível.</Text>
          ) : (
            insights.map((insight, i) => (
              <GoalsInsightsCard
                key={insight.id ?? i}
                insight={insight}
                isPro={isPro}
              />
            ))
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

/* ============================================================
   STYLES
============================================================ */
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
    fontSize: 15,
    color: "rgba(255,255,255,0.45)",
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

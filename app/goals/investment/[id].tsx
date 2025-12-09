// app/goals/[id].tsx
import React, { useMemo } from "react";
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

// INVESTIMENTO — BLOCO PREMIUM
import InvestmentMainBlock from "@/components/app/investments/InvestmentMainBlock";
import {
  SeriesMap,
  SeriesPoint,
} from "@/components/app/investments/InvestmentTimeframesPanel";

// TIMELINE / INSIGHTS
import GoalInstallmentsTimeline from "@/components/app/goals/GoalInstallmentsTimeline";
import GoalsInsightsCard from "@/components/app/goals/GoalsInsightsCard";

// HOOKS
import { useGoals } from "@/hooks/useGoals";
import { useGoalsInsights } from "@/hooks/useGoalsInsights";

const brandFont = Platform.select({
  ios: "SF Pro Display",
  android: "Inter",
  default: "System",
});

/* ============================================================
   HELPERS — construir séries estilo Apple Stocks
============================================================ */
function buildInvestmentSeries(goal: any): SeriesMap {
  const now = new Date();
  const todayISO = now.toISOString().split("T")[0];

  const basePoint: SeriesPoint = {
    date: todayISO,
    value: Number(goal?.currentAmount ?? 0),
  };

  const futureCurve: SeriesPoint[] = goal?.projection?.curveFuture ?? [];
  const curve: SeriesPoint[] = [basePoint, ...futureCurve];

  const parse = (d: string) => new Date(d);

  const filterUntilDaysAhead = (days: number) => {
    const limit = new Date(now);
    limit.setDate(limit.getDate() + days);
    return curve.filter((p) => parse(p.date) <= limit);
  };

  const filterUntilMonthsAhead = (months: number) => {
    const limit = new Date(now);
    limit.setMonth(limit.getMonth() + months);
    return curve.filter((p) => parse(p.date) <= limit);
  };

  const ensure = (arr: SeriesPoint[]): SeriesPoint[] =>
    arr.length ? arr : curve;

  return {
    "1D": ensure(filterUntilDaysAhead(1)),
    "1S": ensure(filterUntilDaysAhead(7)),
    "1M": ensure(filterUntilMonthsAhead(1)),
    "3M": ensure(filterUntilMonthsAhead(3)),
    "1Y": ensure(filterUntilMonthsAhead(12)),
    ALL: curve,
  };
}

export default function GoalDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();

  const rawId = params?.id ?? null;
  const goalId = rawId === "create" ? null : rawId;

  const { loading, goals, debts, investments, reload } = useGoals();
  const { insights } = useGoalsInsights();

  /* ============================================================
     RELOAD ao focar na tela
  ============================================================ */
  useFocusEffect(
    React.useCallback(() => {
      reload();
    }, [reload])
  );

  /* ============================================================
     ENCONTRAR ITEM
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
  const hasInstallments = (goal?.installments ?? []).length > 0;

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
        <Text style={styles.notFound}>Meta não encontrada.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>
      </Screen>
    );
  }

  /* ============================================================
     SÉRIES — somente para INVESTIMENTO
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

        {/* META OU DÍVIDA */}
        {isDebt ? (
          <GoalDebtMainCard
            debt={goal}
            showSettleButton
            onPressPay={() =>
              router.push(`/goals/details/debt-pay?id=${goal.id}`)
            }
            onPressEdit={() =>
              router.push(`/goals/details/debt-edit?id=${goal.id}`)
            }
            onPressSettle={() =>
              router.push(`/goals/details/debt-settle?id=${goal.id}`)
            }
          />
        ) : !isInvestment ? (
          <GoalMainCard
            goal={goal}
            onPressDetails={() =>
              router.push(`/goals/details/add?id=${goal.id}`)
            }
            onPressEdit={() =>
              router.push(`/goals/details/edit?id=${goal.id}`)
            }
          />
        ) : null}

        {/* INVESTIMENTO */}
        {isInvestment && (
          <View style={{ marginTop: 20, paddingHorizontal: 18 }}>
            <InvestmentMainBlock
              goal={goal}
              series={series}
              onPressAdd={() =>
                router.push({
                  pathname: "/goals/investments/contribution",
                  params: { goalId: goal.id },
                })
              }
              onPressEdit={() =>
                router.push({
                  pathname: "/goals/investments/edit",
                  params: { goalId: goal.id },
                })
              }
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

          {!insights || insights.length === 0 ? (
            <Text style={styles.noInsights}>Nenhum insight disponível.</Text>
          ) : (
            insights.map((item, i) => (
              <GoalsInsightsCard key={i} item={item} />
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

import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";

import Screen from "@/components/layout/Screen";
import FinanceOverviewPanel from "@/components/app/finance/FinanceOverviewPanel";
import MonthlyBudgetCard from "@/components/app/finance/MonthlyBudgetCard";

import { useFinanceSnapshot } from "@/hooks/useFinanceSnapshot";
import { useBudget } from "@/context/BudgetContext";
import { useSubscriptions } from "@/hooks/useSubscriptions";

export default function FinanceScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // FINANCE (painel superior)
  const { snapshot, loading, reload } = useFinanceSnapshot();

  // BUDGET = fonte da verdade
  const {
    categories,
    totalExpenses,
    loading: budgetLoading,
    reload: reloadBudget,
  } = useBudget() as any;

  const { monthlyTotal: subsTotal } = useSubscriptions();

  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      reload?.();
      reloadBudget?.();
    }, [reload, reloadBudget])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([reload?.(), reloadBudget?.()]);
    setRefreshing(false);
  };

  /* =========================
     CÁLCULOS — FORMATO 0–1
  ========================= */

  const limitTotal = useMemo(() => {
    if (!categories?.length) return 0;
    return categories.reduce(
      (sum: number, c: any) => sum + Number(c.limit_amount || 0),
      0
    );
  }, [categories]);

  const usedPct = useMemo(() => {
    if (!limitTotal || limitTotal <= 0) return 0;
    return Math.min(Number(totalExpenses || 0) / limitTotal, 1);
  }, [totalExpenses, limitTotal]);

  const mappedCategories = useMemo(() => {
    if (!categories?.length) return [];
    return categories.map((c: any) => ({
      id: c.id,
      title: c.title,
      spent: Number(c.spent || 0),
      limit: Number(c.limit_amount || 0),
      percent:
        c.limit_amount > 0
          ? Math.min(Number(c.spent || 0) / c.limit_amount, 1)
          : 0,
    }));
  }, [categories]);

  const budgetSnapshot = useMemo(() => {
    return {
      totalSpent: Number(totalExpenses || 0),
      totalLimit: limitTotal,
      percentUsed: usedPct,
      categories: mappedCategories,
      subscriptions: { total: Number(subsTotal || 0) },
      goalsTotal: 0,
    };
  }, [totalExpenses, limitTotal, usedPct, mappedCategories, subsTotal]);

  /* ========================= */

  return (
    <Screen>
      <StatusBar barStyle="light-content" />

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        decelerationRate="fast"
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 16, flexGrow: 1 },
        ]}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Financeiro</Text>
          <Text style={styles.headerSubtitle}>Visão consolidada</Text>
        </View>

        {/* HERO */}
        <View style={styles.heroCard}>
          <View style={styles.heroGlow} />
          <BlurView intensity={32} tint="dark" style={styles.heroContent}>
            <Text style={styles.heroLabel}>Resumo do mês</Text>
            <Text style={styles.heroTitle}>
              Sua posição financeira atual
            </Text>
          </BlurView>
        </View>

        {/* OVERVIEW */}
        {!loading && snapshot && (
          <FinanceOverviewPanel snapshot={snapshot} />
        )}

        {/* MICRO INSIGHT */}
        <View style={styles.microInsight}>
          <Text style={styles.microInsightText}>
            Seus gastos estão dentro do planejado este mês.
          </Text>
        </View>

        {/* BUDGET */}
        {!budgetLoading && (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push("/finance/budget")}
          >
            <MonthlyBudgetCard snapshot={budgetSnapshot} />
          </TouchableOpacity>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    backgroundColor: "#050507",
  },

  header: {
    alignItems: "center",
    marginBottom: 22,
  },
  headerTitle: {
    fontSize: 28,
    color: "#FFF",
    fontWeight: "700",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.55)",
    marginTop: 4,
  },

  heroCard: {
    borderRadius: 26,
    overflow: "hidden",
    marginBottom: 28,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    position: "relative",
  },
  heroGlow: {
    position: "absolute",
    top: -40,
    left: -40,
    right: -40,
    height: 120,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 200,
  },
  heroContent: {
    padding: 20,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  heroLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    marginBottom: 6,
  },
  heroTitle: {
    fontSize: 18,
    color: "#FFF",
    fontWeight: "600",
  },

  microInsight: {
    marginVertical: 26,
    alignItems: "center",
  },
  microInsightText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.55)",
  },
});

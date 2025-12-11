// app/goals/index.tsx

import React, { useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";

import GoalsHeader from "@/components/app/goals/GoalsHeader";
import GoalsSegmented from "@/components/app/goals/GoalsSegmented";
import GoalCard from "@/components/app/goals/GoalCard";
import GoalMainCard from "@/components/app/goals/GoalMainCard";
import GoalDebtMainCard from "@/components/app/goals/GoalDebtMainCard";
import GoalInvestmentMainCard from "@/components/app/goals/GoalInvestmentMainCard";

import GoalsDebtList from "@/components/app/goals/GoalsDebtList";
import GoalsInvestmentList from "@/components/app/goals/GoalsInvestmentList";
import GoalsIncomeBlock from "@/components/app/goals/GoalsIncomeBlock";
import GoalsInsightsCard from "@/components/app/goals/GoalsInsightsCard";
import GoalsEmptyState from "@/components/app/goals/GoalsEmptyState";

import ModalPremiumPaywall from "@/components/app/common/ModalPremiumPaywall";

import { useGoals } from "@/hooks/useGoals";
import { useGoalsInsights } from "@/hooks/useGoalsInsights";
import { useUserPlan } from "@/context/UserPlanContext";

const brandFont = Platform.select({
  ios: "SF Pro Display",
  android: "Inter",
  default: "System",
});

export default function GoalsIndexScreen() {
  const router = useRouter();
  const { plan, isPro } = useUserPlan();

  // 1) O estado da aba precisa vir ANTES do hook de insights
  const [tab, setTab] =
    useState<"goals" | "debts" | "investments" | "income">("goals");

  const {
    goals,
    debts,
    investments,
    primaryGoal,
    nextInstallment,
    reload,
  } = useGoals();

  // 2) Hook de insights recebe a aba atual
  const { insights, loading: insightsLoading } = useGoalsInsights(tab);

  const [showPaywall, setShowPaywall] = useState(false);
  const [blockedType, setBlockedType] = useState<
    "goal" | "debt" | "investment" | null
  >(null);

  /* ORDENAR METAS */
  const orderedGoals = useMemo(() => {
    return [...goals].sort((a, b) => {
      if (a.isPrimary) return -1;
      if (b.isPrimary) return 1;
      return 0;
    });
  }, [goals]);

  const mainGoal =
    primaryGoal ?? orderedGoals.find((g) => g.isPrimary) ?? null;

  const otherGoals = orderedGoals.filter((g) => !g.isPrimary);

  /* DÍVIDAS */
  const orderedDebts = useMemo(() => {
    return [...debts].sort((a, b) => {
      if (a.isPrimary) return -1;
      if (b.isPrimary) return 1;
      return 0;
    });
  }, [debts]);

  const mainDebt = orderedDebts[0] ?? null;
  const otherDebts = orderedDebts.slice(1);

  /* PAYWALL */
  const isPaywallLimit = useCallback(
    (type: "goal" | "debt" | "investment") => {
      if (isPro) return false;

      if (type === "goal" && goals.length >= 1) return true;
      if (type === "debt" && debts.length >= 1) return true;
      if (type === "investment" && investments.length >= 1) return true;

      return false;
    },
    [isPro, goals, debts, investments]
  );

  /* NAVIGATION */
  const openDetail = (id: string) => router.push(`/goals/${id}`);
  const openContribution = (id: string) =>
    router.push(`/goals/details/add?id=${id}`);
  const openEdit = (id: string) =>
    router.push(`/goals/details/edit?id=${id}`);
  const openDebtPay = (id: string) =>
    router.push(`/goals/details/debt-pay?id=${id}`);
  const openDebtEdit = (id: string) =>
    router.push(`/goals/details/debt-edit?id=${id}`);
  const openDebtSettle = (id: string) =>
    router.push(`/goals/details/debt-settle?id=${id}`);

  const openCreate = () => {
    const type =
      tab === "goals"
        ? "goal"
        : tab === "debts"
        ? "debt"
        : tab === "investments"
        ? "investment"
        : "income";

    if (type === "income") {
      router.push(`/goals/create?type=income`);
      return;
    }

    if (isPaywallLimit(type)) {
      setBlockedType(type);
      setShowPaywall(true);
      return;
    }

    router.push(`/goals/create?type=${type}`);
  };

  /* UI */
  return (
    <View style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl tintColor="#fff" refreshing={false} onRefresh={reload} />
        }
      >
        <GoalsHeader />

        <View style={{ marginTop: 12 }}>
          <GoalsSegmented value={tab} onChange={(v) => setTab(v as any)} />
        </View>

        {/* RENDA — comportamento ORIGINAL preservado (sem push) */}
        {tab === "income" && (
          <View style={{ marginTop: 6 }}>
            <GoalsIncomeBlock />
          </View>
        )}

        {/* DÍVIDAS */}
        {tab === "debts" && (
          <>
            {mainDebt && (
              <View style={{ marginTop: 6 }}>
                <GoalDebtMainCard
                  debt={mainDebt}
                  onPressPay={() => openDebtPay(mainDebt.id)}
                  onPressEdit={() => openDebtEdit(mainDebt.id)}
                  onPressSettle={() => openDebtSettle(mainDebt.id)}
                />
              </View>
            )}

            <GoalsDebtList debts={otherDebts} onPress={openDetail} />
          </>
        )}

        {/* INVESTIMENTOS */}
        {tab === "investments" && (
          <View style={{ marginTop: 6 }}>
            {investments.length > 0 && (
              <GoalInvestmentMainCard
                goal={investments[0]}
                isPro={isPro}
                onPress={() => openDetail(investments[0].id)}
              />
            )}

            <GoalsInvestmentList
              investments={investments.slice(1)}
              isPro={isPro}
              onPress={openDetail}
              onPressUpgrade={() => {
                setBlockedType("investment");
                setShowPaywall(true);
              }}
            />
          </View>
        )}

        {/* METAS */}
        {tab === "goals" && (
          <>
            {mainGoal && (
              <View style={{ marginTop: 6 }}>
                <GoalMainCard
                  goal={mainGoal}
                  progress={mainGoal.progressPercent / 100}
                  remainingAmount={mainGoal.remainingAmount}
                  nextInstallment={nextInstallment(mainGoal.id)}
                  isPro={isPro}
                  onPressDetails={() =>
                    mainGoal.type === "debt"
                      ? openDebtPay(mainGoal.id)
                      : openContribution(mainGoal.id)
                  }
                  onPressEdit={() =>
                    mainGoal.type === "debt"
                      ? openDebtEdit(mainGoal.id)
                      : openEdit(mainGoal.id)
                  }
                />
              </View>
            )}

            {otherGoals.length === 0 ? (
              <GoalsEmptyState />
            ) : (
              otherGoals.map((g) => (
                <GoalCard key={g.id} goal={g} onPress={() => openDetail(g.id)} />
              ))
            )}
          </>
        )}

        {/* INSIGHTS — final da tela */}
        <View style={{ marginTop: 28, marginBottom: 20 }}>
          <Text style={styles.sectionTitle}>Insights</Text>

          {insightsLoading ? (
            <Text style={styles.noInsights}>Carregando insights...</Text>
          ) : !insights || insights.length === 0 ? (
            <Text style={styles.noInsights}>Nenhum insight disponível.</Text>
          ) : (
            insights.map((insight, idx) => (
              <GoalsInsightsCard
                key={insight.id ?? idx}
                insight={insight}
                isPro={isPro}
                onPressUpgrade={() => {
                  setBlockedType("goal");
                  setShowPaywall(true);
                }}
              />
            ))
          )}
        </View>

        {/* CTA */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={openCreate} style={styles.footerBtn}>
            <Text style={styles.footerBtnText}>Criar nova {tab}</Text>
          </TouchableOpacity>

          {plan === "free" && (
            <Text style={styles.paywallHint}>
              Usuários FREE podem criar 1 meta, 1 dívida e 1 investimento.
            </Text>
          )}
        </View>
      </ScrollView>

      {/* PAYWALL */}
      {showPaywall && (
        <ModalPremiumPaywall
          visible={showPaywall}
          blockedType={blockedType}
          onClose={() => {
            setShowPaywall(false);
            setBlockedType(null);
          }}
          onUpgrade={() => {
            setShowPaywall(false);
            setBlockedType(null);
            router.push("/premium");
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  sectionTitle: {
    marginLeft: 18,
    marginBottom: 8,
    fontFamily: brandFont,
    fontSize: 17,
    fontWeight: "600",
    color: "white",
  },
  noInsights: {
    fontFamily: brandFont,
    fontSize: 13,
    marginLeft: 20,
    color: "rgba(255,255,255,0.45)",
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    marginTop: 10,
  },
  footerBtn: {
    paddingVertical: 14,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    alignItems: "center",
  },
  footerBtnText: {
    fontFamily: brandFont,
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  paywallHint: {
    marginTop: 10,
    textAlign: "center",
    fontFamily: brandFont,
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
  },
});

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
import GoalsDebtList from "@/components/app/goals/GoalsDebtList";
import GoalsInvestmentList from "@/components/app/goals/GoalsInvestmentList";
import GoalsIncomeBlock from "@/components/app/goals/GoalsIncomeBlock";
import GoalsInsightsCard from "@/components/app/goals/GoalsInsightsCard";
import GoalsEmptyState from "@/components/app/goals/GoalsEmptyState";

import ModalPremiumPaywall from "@/components/app/common/ModalPremiumPaywall";

import { useGoals } from "@/hooks/useGoals";
import { useIncomeSources } from "@/hooks/useIncomeSources";
import { useGoalsInsights } from "@/hooks/useGoalsInsights";
import { useUserPlan } from "@/hooks/useUserPlan";

const brandFont = Platform.select({
  ios: "SF Pro Display",
  android: "Inter",
  default: "System",
});

export default function GoalsIndexScreen() {
  const router = useRouter();

  const { userPlan: plan } = useUserPlan();
  const { goals, debts, investments, reload } = useGoals();
  const { insights } = useGoalsInsights();
  const { incomeSources } = useIncomeSources();

  const [tab, setTab] =
    useState<"goals" | "debts" | "investments" | "income">("goals");

  // Paywall
  const [showPaywall, setShowPaywall] = useState(false);
  const [blockedType, setBlockedType] = useState<
    "goal" | "debt" | "investment" | "income" | null
  >(null);

  /* -----------------------------------------------------------
     COMPUTED
  ------------------------------------------------------------*/
  const orderedGoals = useMemo(() => {
    return [...goals].sort((a, b) => {
      if (a.isPrimary) return -1;
      if (b.isPrimary) return 1;
      return 0;
    });
  }, [goals]);

  const isPro = plan === "PRO";

  const isPaywallLimit = useCallback(
    (type: "goal" | "debt" | "investment") => {
      if (plan === "PRO") return false;

      if (type === "goal" && goals.length >= 1) return true;
      if (type === "debt" && debts.length >= 1) return true;
      if (type === "investment" && investments.length >= 1) return true;

      return false;
    },
    [plan, goals, debts, investments]
  );

  /* -----------------------------------------------------------
     NAVIGAÇÃO
  ------------------------------------------------------------*/
  const openDetail = (id: string) => {
    router.push(`/goals/${id}`);
  };

  const openCreate = () => {
    const type =
      tab === "goals"
        ? "goal"
        : tab === "debts"
        ? "debt"
        : tab === "investments"
        ? "investment"
        : "income";

    if (isPaywallLimit(type as any)) {
      setBlockedType(type as any);
      setShowPaywall(true);
      return;
    }

    router.push(`/goals/create?type=${type}`);
  };

  /* -----------------------------------------------------------
     RENDER
  ------------------------------------------------------------*/
  return (
    <>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl tintColor="#fff" refreshing={false} onRefresh={reload} />
        }
      >
        {/* HEADER */}
        <GoalsHeader />

        {/* SEGMENTED */}
        <View style={{ marginTop: 12 }}>
          <GoalsSegmented value={tab} onChange={(v) => setTab(v as any)} />
        </View>

        {/* === TAB: RENDA === */}
        {tab === "income" && (
          <View style={{ marginTop: 6 }}>
            <GoalsIncomeBlock />
          </View>
        )}

        {/* === TAB: DÍVIDAS === */}
        {tab === "debts" && (
          <GoalsDebtList debts={debts} onPress={(id) => openDetail(id)} />
        )}

        {/* === TAB: INVESTIMENTOS === */}
        {tab === "investments" && (
          <GoalsInvestmentList
            investments={investments}
            isPro={isPro}
            onPress={(id) => openDetail(id)}
            onPressUpgrade={() => {
              setBlockedType("investment");
              setShowPaywall(true);
            }}
          />
        )}

        {/* === TAB: METAS === */}
        {tab === "goals" && (
          <>
            {orderedGoals.length === 0 ? (
              <GoalsEmptyState />
            ) : (
              orderedGoals.map((g) => (
                <GoalCard key={g.id} goal={g} onPress={() => openDetail(g.id)} />
              ))
            )}
          </>
        )}

        {/* === INSIGHTS === */}
        <View style={{ marginTop: 28, marginBottom: 20 }}>
          <Text style={styles.sectionTitle}>Insights</Text>

          {!insights || insights.length === 0 ? (
            <Text style={styles.noInsights}>Nenhum insight disponível.</Text>
          ) : (
            insights.map((i, idx) => <GoalsInsightsCard key={idx} item={i} />)
          )}
        </View>

        {/* CTA FINAL */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={openCreate} style={styles.footerBtn}>
            <Text style={styles.footerBtnText}>Criar nova {tab}</Text>
          </TouchableOpacity>

          {plan === "FREE" && (
            <Text style={styles.paywallHint}>
              Usuários FREE podem criar 1 meta, 1 dívida e 1 investimento.
            </Text>
          )}
        </View>
      </ScrollView>

      {/* ============================ */}
      {/*        MODAL PAYWALL        */}
      {/* ============================ */}
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
    </>
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

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
import GoalsEmptyState from "@/components/app/goals/GoalsEmptyState";

import ModalPremiumPaywall from "@/components/app/common/ModalPremiumPaywall";

import { useGoals } from "@/hooks/useGoals";
import { useIncomeSources } from "@/hooks/useIncomeSources";
import { useUserPlan } from "@/context/UserPlanContext";

const brandFont = Platform.select({
  ios: "SF Pro Display",
  android: "Inter",
  default: "System",
});

export default function GoalsIndexScreen() {
  const router = useRouter();
  const { plan, isPro } = useUserPlan();

  /* -----------------------------------------------------------
   * Estado da aba
   ----------------------------------------------------------- */
  const [tab, setTab] =
    useState<"goals" | "debts" | "investments" | "income">("goals");

  /* -----------------------------------------------------------
   * Dados base (NORMALIZADOS)
   ----------------------------------------------------------- */
  const {
    goals: rawGoals,
    debts: rawDebts,
    investments: rawInvestments,
    primaryGoal,
    nextInstallment,
    reload,
  } = useGoals();

  const goals = Array.isArray(rawGoals) ? rawGoals : [];
  const debts = Array.isArray(rawDebts) ? rawDebts : [];
  const investments = Array.isArray(rawInvestments) ? rawInvestments : [];

  useIncomeSources(); // mantido por consistência do fluxo global

  /* -----------------------------------------------------------
   * Paywall
   ----------------------------------------------------------- */
  const [showPaywall, setShowPaywall] = useState(false);
  const [blockedType, setBlockedType] = useState<"goal" | "debt" | "investment" | null>(null);

  /* -----------------------------------------------------------
   * Ordenações (SEGURAS)
   ----------------------------------------------------------- */
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

  const orderedDebts = useMemo(() => {
    return [...debts].sort((a, b) => {
      if (a.isPrimary) return -1;
      if (b.isPrimary) return 1;
      return 0;
    });
  }, [debts]);

  const mainDebt = orderedDebts[0] ?? null;
  const otherDebts = orderedDebts.slice(1);

  /* -----------------------------------------------------------
   * Paywall logic
   ----------------------------------------------------------- */
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

  /* -----------------------------------------------------------
   * Navegação
   ----------------------------------------------------------- */
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

    if (type === "income") {
      // Aqui ajustamos para abrir a tela de gerenciar receita
      router.push("/goals/income/index");
      return;
    }

    if (isPaywallLimit(type)) {
      setBlockedType(type);
      setShowPaywall(true);
      return;
    }

    router.push(`/goals/create?type=${type}`);
  };

  /* -----------------------------------------------------------
   * UI
   ----------------------------------------------------------- */
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            tintColor="#fff"
            refreshing={false}
            onRefresh={reload}
          />
        }
      >
        <GoalsHeader />

        <View style={{ marginTop: 12 }}>
          <GoalsSegmented value={tab} onChange={(v) => setTab(v as any)} />
        </View>

        {/* RENDA */}
        {tab === "income" && <GoalsIncomeBlock />}

        {/* DÍVIDAS */}
        {tab === "debts" && (
          <>
            {mainDebt && (
              <GoalDebtMainCard
                debt={mainDebt}
                onPressPay={() => openDetail(mainDebt.id)}
                onPressEdit={() => openDetail(mainDebt.id)}
              />
            )}
            <GoalsDebtList debts={otherDebts} onPress={openDetail} />
          </>
        )}

        {/* INVESTIMENTOS */}
        {tab === "investments" && (
          <>
            {investments[0] && (
              <GoalInvestmentMainCard
                goal={investments[0]}
                isPro={isPro}
                onPress={() => openDetail(investments[0].id)}
                onPressAdd={() => openDetail(investments[0].id)}
                onPressEdit={() => openDetail(investments[0].id)}
              />
            )}
            <GoalsInvestmentList
              investments={investments.slice(1)}
              isPro={isPro}
              onPress={openDetail}
            />
          </>
        )}

        {/* METAS */}
        {tab === "goals" && (
          <>
            {mainGoal && (
              <GoalMainCard
                goal={mainGoal}
                progress={mainGoal.progressPercent / 100}
                remainingAmount={mainGoal.remainingAmount}
                nextInstallment={nextInstallment(mainGoal.id)}
                isPro={isPro}
                onPressDetails={() => openDetail(mainGoal.id)}
                onPressEdit={() => openDetail(mainGoal.id)}
              />
            )}

            {otherGoals.length === 0 ? (
              <GoalsEmptyState />
            ) : (
              otherGoals.map((g) => (
                <GoalCard
                  key={g.id}
                  goal={g}
                  onPress={() => openDetail(g.id)}
                />
              ))
            )}
          </>
        )}

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
          visible
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

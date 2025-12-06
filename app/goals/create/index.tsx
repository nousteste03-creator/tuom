// app/goals/create/index.tsx

import React, { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";

import CreateGoalModal from "./CreateGoalModal";
import CreateDebtModal from "./CreateDebtModal";
import CreateInvestmentModal from "./CreateInvestmentModal";
import CreateIncomeModal from "./CreateIncomeModal";

import ModalPremiumPaywall from "@/components/app/common/ModalPremiumPaywall";
import { useUserPlan } from "@/hooks/useUserPlan";
import { useGoals } from "@/hooks/useGoals";

export default function GoalsCreateScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const type = (params.type as string) ?? "goal";

  const { userPlan } = useUserPlan();
  const { goals, debts, investments } = useGoals();

  const [showPaywall, setShowPaywall] = useState(false);
  const [blockedType, setBlockedType] = useState<
    "goal" | "debt" | "investment" | "income" | null
  >(null);

  /* ---------------------------------------------------------
     PAYWALL LIMIT CHECK
  ----------------------------------------------------------*/
  function exceededFreeLimit() {
    if (userPlan === "PRO") return false;

    if (type === "goal" && goals.length >= 1) return true;
    if (type === "debt" && debts.length >= 1) return true;
    if (type === "investment" && investments.length >= 1) return true;

    return false;
  }

  /* ---------------------------------------------------------
     CLOSE HANDLER — importantíssimo para evitar loops
  ----------------------------------------------------------*/
  function closeModal() {
    // Nunca usar router.back() aqui!
    router.replace("/goals");
  }

  /* ---------------------------------------------------------
     PAYWALL BLOCK
  ----------------------------------------------------------*/
  if (exceededFreeLimit()) {
    if (!showPaywall) {
      setShowPaywall(true);
      setBlockedType(type as any);
    }

    return (
      <ModalPremiumPaywall
        visible={showPaywall}
        blockedType={blockedType}
        onClose={() => {
          setShowPaywall(false);
          setBlockedType(null);
          router.replace("/goals");
        }}
        onUpgrade={() => {
          setShowPaywall(false);
          setBlockedType(null);
          router.push("/premium");
        }}
      />
    );
  }

  /* ---------------------------------------------------------
     RENDER MODAL
  ----------------------------------------------------------*/
  if (type === "debt")
    return <CreateDebtModal visible onClose={closeModal} />;

  if (type === "investment")
    return <CreateInvestmentModal visible onClose={closeModal} />;

  if (type === "income")
    return <CreateIncomeModal visible onClose={closeModal} />;

  return <CreateGoalModal visible onClose={closeModal} />;
}

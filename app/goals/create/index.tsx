// app/goals/create/index.tsx
import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";

import Screen from "@/components/layout/Screen";

import CreateGoalModal from "./CreateGoalModal";
import CreateDebtModal from "./CreateDebtModal";
import CreateInvestmentModal from "./CreateInvestmentModal";
import CreateIncomeModal from "./CreateIncomeModal";

export default function GoalsCreateScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const type = (params.type as string) ?? "goal";

  function close() {
    router.back();
  }

  return (
    <Screen>
      {type === "investment" && (
        <CreateInvestmentModal visible={true} onClose={close} />
      )}

      {type === "debt" && (
        <CreateDebtModal visible={true} onClose={close} />
      )}

      {type === "income" && (
        <CreateIncomeModal visible={true} onClose={close} />
      )}

      {type === "goal" && (
        <CreateGoalModal visible={true} onClose={close} />
      )}
    </Screen>
  );
}

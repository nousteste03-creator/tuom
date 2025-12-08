// app/goals/create/index.tsx
import React from "react";
import { View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

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
    <View style={{ flex: 1, backgroundColor: "transparent" }}>
      {type === "debt" && <CreateDebtModal visible onClose={close} />}

      {type === "investment" && (
        <CreateInvestmentModal visible onClose={close} />
      )}

      {type === "income" && <CreateIncomeModal visible onClose={close} />}

      {type === "goal" && <CreateGoalModal visible onClose={close} />}
    </View>
  );
}

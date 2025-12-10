// app/goals/create/index.tsx
import React from "react";
import { View } from "react-native";
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

  /**
   * INVESTIMENTO → usa o mesmo wrapper da tela de teste
   * (Screen full, safe-area, fundo preto). Isso garante
   * que o overlay do CreateInvestmentModal se comporte
   * exatamente igual ao TEST_C... que ficou perfeito.
   */
  if (type === "investment") {
    return (
      <Screen>
        <CreateInvestmentModal visible={true} onClose={close} />
      </Screen>
    );
  }

  /**
   * Os outros tipos continuam com o comportamento
   * anterior (bottom-sheet / modal padrão).
   */
  return (
    <View style={{ flex: 1, backgroundColor: "transparent" }}>
      {type === "debt" && <CreateDebtModal visible={true} onClose={close} />}

      {type === "income" && (
        <CreateIncomeModal visible={true} onClose={close} />
      )}

      {type === "goal" && <CreateGoalModal visible={true} onClose={close} />}
    </View>
  );
}

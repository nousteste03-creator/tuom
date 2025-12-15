import "react-native-reanimated";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import * as SystemUI from "expo-system-ui";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { UserPlanProvider } from "@/context/UserPlanContext";
import { UserSettingsProvider } from "@/context/UserSettingsContext";
import { BudgetProvider } from "@/context/BudgetContext";
import { GoalsProvider } from "@/context/GoalsContext";

export default function RootLayout() {
  useEffect(() => {
    SystemUI.setBackgroundColorAsync("#0B0B0C");
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* 🔐 Plano do usuário */}
      <UserPlanProvider>
        {/* ⚙️ Configurações globais */}
        <UserSettingsProvider>
          {/* 💰 Orçamento */}
          <BudgetProvider>
            {/* 🎯 Metas / Dívidas / Investimentos */}
            <GoalsProvider>
              <StatusBar style="light" />

              <Stack
                screenOptions={{
                  headerShown: false,
                  animation: "fade",
                  contentStyle: { backgroundColor: "#0B0B0C" },
                }}
              />
            </GoalsProvider>
          </BudgetProvider>
        </UserSettingsProvider>
      </UserPlanProvider>
    </GestureHandlerRootView>
  );
}

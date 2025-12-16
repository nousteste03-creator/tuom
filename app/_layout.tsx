import "react-native-reanimated";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import * as SystemUI from "expo-system-ui";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { supabase } from "@/lib/supabase";

// 🔔 FASE 2 — bootstrap
import { ensureUserSettings } from "@/lib/bootstrap/ensureUserSettings";
import { registerDeviceForPush } from "@/lib/notifications/registerDevice";

// 🔐 Contexts existentes
import { UserPlanProvider } from "@/context/UserPlanContext";
import { UserSettingsProvider } from "@/context/UserSettingsContext";
import { BudgetProvider } from "@/context/BudgetContext";
import { GoalsProvider } from "@/context/GoalsContext";

export default function RootLayout() {
  useEffect(() => {
    SystemUI.setBackgroundColorAsync("#0B0B0C");
  }, []);

  /**
   * -----------------------------------------------------
   * BOOTSTRAP DE SESSÃO (FASE 2 — NOTIFICAÇÕES)
   *
   * Responsabilidades:
   * 1. Verificar se existe usuário autenticado
   * 2. Garantir user_settings (upsert)
   * 3. Registrar device para push (token)
   *
   * ⚠️ NÃO:
   * - criar cron
   * - enviar push
   * - criar lógica de negócio
   * -----------------------------------------------------
   */
  useEffect(() => {
    const bootstrapNotifications = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.warn("Session error:", error.message);
        return;
      }

      const user = data.session?.user;

      if (!user) {
        // App pode rodar sem login por enquanto
        return;
      }

      try {
        // 1️⃣ Garante settings (idempotente)
        await ensureUserSettings(user.id);

        // 2️⃣ Registra device (push token)
        await registerDeviceForPush(user.id);
      } catch (err) {
        console.error("Bootstrap notifications error:", err);
      }
    };

    bootstrapNotifications();
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

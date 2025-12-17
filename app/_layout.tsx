import "react-native-reanimated";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import * as SystemUI from "expo-system-ui";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { supabase } from "@/lib/supabase";

// 🔔 FASE 2 — bootstrap de notificações
import { ensureUserSettings } from "@/lib/bootstrap/ensureUserSettings";
import { registerDeviceForPush } from "@/lib/notifications/registerDevice";

// ✅ AJUSTE LGPD — sync de aceite versionado
import { syncLegalAcceptance } from "@/lib/bootstrap/syncLegalAcceptance";

// 🔐 Contexts
import { UserPlanProvider } from "@/context/UserPlanContext";
import { UserSettingsProvider } from "@/context/UserSettingsContext";
import { BudgetProvider } from "@/context/BudgetContext";
import { GoalsProvider } from "@/context/GoalsContext";

// 🌑 Splash técnico
import SplashScreen from "@/components/system/SplashScreen";

export default function RootLayout() {
  const [isAppReady, setIsAppReady] = useState(false);

  // 🎨 Fundo nativo (antes de qualquer render)
  useEffect(() => {
    SystemUI.setBackgroundColorAsync("#000000");
  }, []);

  /**
   * -----------------------------------------------------
   * BOOTSTRAP DE NOTIFICAÇÕES (FASE 2)
   * Executa APENAS se houver usuário autenticado
   * -----------------------------------------------------
   */
  useEffect(() => {
    const bootstrapNotifications = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.warn("[bootstrap] session error:", error.message);
        return;
      }

      const user = data.session?.user;
      if (!user) return;

      try {
        // 1️⃣ garante user_settings (idempotente)
        await ensureUserSettings(user.id);

        // 2️⃣ garante aceite LGPD versionado (idempotente)
        await syncLegalAcceptance(user.id);

        // 3️⃣ registra device para push
        await registerDeviceForPush();
      } catch (err) {
        console.error("[bootstrap] notifications error:", err);
      }
    };

    bootstrapNotifications();
  }, []);

  /**
   * -----------------------------------------------------
   * BOOTSTRAP TÉCNICO DO APP
   * (Splash artificial apenas para validação visual)
   * -----------------------------------------------------
   */
  useEffect(() => {
    const prepareApp = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1400));
      setIsAppReady(true);
    };

    prepareApp();
  }, []);

  // 🌑 GATE ABSOLUTO
  if (!isAppReady) {
    return <SplashScreen />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <UserPlanProvider>
        <UserSettingsProvider>
          <BudgetProvider>
            <GoalsProvider>
              <StatusBar style="light" />

              <Stack
                screenOptions={{
                  headerShown: false,
                  animation: "fade",
                  contentStyle: { backgroundColor: "#000000" },
                }}
              />
            </GoalsProvider>
          </BudgetProvider>
        </UserSettingsProvider>
      </UserPlanProvider>
    </GestureHandlerRootView>
  );
}

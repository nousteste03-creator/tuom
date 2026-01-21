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

// ✅ LGPD — sync de aceite versionado
import { syncLegalAcceptance } from "@/lib/bootstrap/syncLegalAcceptance";

// 🔥 PRELOAD CRÍTICO (Insights)
import { preloadInsightsAssets } from "@/lib/bootstrap/preloadAssets";

// 🔐 Contexts globais
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
   * Reage a sessão atual E a mudanças de auth
   * -----------------------------------------------------
   */
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const runBootstrap = async (userId: string) => {
      try {
        // 1️⃣ garante user_settings (idempotente)
        await ensureUserSettings(userId);

        // 2️⃣ garante aceite LGPD versionado (idempotente)
        await syncLegalAcceptance(userId);

        // 3️⃣ registra device para push (idempotente no backend)
        await registerDeviceForPush();
      } catch (err) {
        console.error("[bootstrap] notifications error:", err);
      }
    };

    const init = async () => {
      // 👉 caso o usuário já esteja logado
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      if (user) {
        runBootstrap(user.id);
      }

      // 👉 reage a login/logout futuros
      const { data: listener } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          const user = session?.user;
          if (user) {
            runBootstrap(user.id);
          }
        }
      );

      unsubscribe = () => {
        listener.subscription.unsubscribe();
      };
    };

    init();

    return () => {
      unsubscribe?.();
    };
  }, []);

  /**
   * -----------------------------------------------------
   * BOOTSTRAP TÉCNICO DO APP (Camada 1)
   * -----------------------------------------------------
   */
  useEffect(() => {
    const prepareApp = async () => {
      try {
        // 🔥 preload crítico (hero + poster + fallback)
        await preloadInsightsAssets();

        // ⏳ tempo mínimo de splash (UX estável)
        await new Promise((resolve) => setTimeout(resolve, 900));
      } catch (err) {
        console.warn("[bootstrap] preload error:", err);
      } finally {
        setIsAppReady(true);
      }
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

                  // ✅ ANIMAÇÃO MADURA (Apple / BTG style)
                  animation: "slide_from_right",
                  animationDuration: 220,
                  gestureEnabled: true,

                  // ✅ FUNDO SEMPRE PRETO
                  contentStyle: {
                    backgroundColor: "#000000",
                  },
                }}
              />
            </GoalsProvider>
          </BudgetProvider>
        </UserSettingsProvider>
      </UserPlanProvider>
    </GestureHandlerRootView>
  );
}

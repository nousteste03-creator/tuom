// app/_layout.tsx
import "react-native-reanimated"; // obrigatório antes de qualquer import
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import * as SystemUI from "expo-system-ui";

// IMPORTANTE — necessário para Wagmi Charts + gestures
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  useEffect(() => {
    // Fundo profundo Apple Dark
    SystemUI.setBackgroundColorAsync("#0B0B0C");
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />

      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
          contentStyle: {
            backgroundColor: "#0B0B0C",
          },
        }}
      />
    </GestureHandlerRootView>
  );
}

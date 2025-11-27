// app/_layout.tsx
import "react-native-reanimated"; // obrigatório antes de qualquer import
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import * as SystemUI from "expo-system-ui";

export default function RootLayout() {
  useEffect(() => {
    // Fundo profundo Apple Dark (fundamental para efeito ChatGPT)
    SystemUI.setBackgroundColorAsync("#0B0B0C");
  }, []);

  return (
    <>
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
    </>
  );
}

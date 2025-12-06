import "react-native-reanimated";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import * as SystemUI from "expo-system-ui";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  useEffect(() => {
    SystemUI.setBackgroundColorAsync("#0B0B0C");
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />

      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
          contentStyle: { backgroundColor: "#0B0B0C" },
        }}
      />
    </GestureHandlerRootView>
  );
}

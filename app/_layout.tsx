import "react-native-reanimated";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import * as SystemUI from "expo-system-ui";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { UserPlanProvider } from "@/context/UserPlanContext";

export default function RootLayout() {
  useEffect(() => {
    SystemUI.setBackgroundColorAsync("#0B0B0C");
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <UserPlanProvider>
        <StatusBar style="light" />

        <Stack
          screenOptions={{
            headerShown: false,
            animation: "fade",
            contentStyle: { backgroundColor: "#0B0B0C" },
          }}
        />
      </UserPlanProvider>
    </GestureHandlerRootView>
  );
}

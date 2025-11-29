// components/layout/Screen.tsx
import React from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Screen({ children, style }: any) {
  return (
    <SafeAreaView
      style={[
        {
          flex: 1,
          backgroundColor: "#000",
        },
        style,
      ]}
    >
      <View
        style={{
          flex: 1,
          width: "100%",
        }}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}

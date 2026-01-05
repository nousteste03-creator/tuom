import React from "react";
import { SafeAreaView, StatusBar } from "react-native";
import { LogoRingLoader } from "@/components/cards/LogoRingLoader";

export default function LogoLoaderScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
      <StatusBar barStyle="light-content" />
      <LogoRingLoader size={120} ringWidth={3} duration={1500} />
    </SafeAreaView>
  );
}

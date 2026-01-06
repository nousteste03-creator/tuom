// app/immersive/ImmersiveHeaderTest.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { useSharedValue, useAnimatedScrollHandler } from "react-native-reanimated";

import { ImmersiveHeader } from "@/components/app/upload/ImmersiveHeader";
import { ValueSnapshot } from "@/components/app/upload/ValueSnapshot";

export default function ImmersiveHeaderTest() {
  const scrollY = useSharedValue(0);

  // Scroll handler com log
  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
    console.log("ScrollY:", scrollY.value);
  });

  console.log("Renderizando ImmersiveHeaderTest");

  // Definição dos cards menores
  const smallCards = [
    { logo: require("@/assets/icons/subscriptions/netflix.png"), name: "Netflix", category: "Streaming" },
    { logo: require("@/assets/icons/subscriptions/spotify.png"), name: "Spotify", category: "Streaming" },
    { logo: require("@/assets/icons/subscriptions/canva.png"), name: "Canva", category: "Streaming" },
    { logo: require("@/assets/icons/subscriptions/airtable.png"), name: "Airtable", category: "Streaming" },
    { logo: require("@/assets/icons/subscriptions/figma.png"), name: "Figma", category: "Streaming" },
  ];

  // Logos para Card 6 maior
  const allLogos = [
    require("@/assets/icons/subscriptions/netflix.png"),
    require("@/assets/icons/subscriptions/spotify.png"),
    require("@/assets/icons/subscriptions/canva.png"),
    require("@/assets/icons/subscriptions/airtable.png"),
    require("@/assets/icons/subscriptions/figma.png"),
    require("@/assets/icons/subscriptions/github.png"),
    require("@/assets/icons/subscriptions/asana.png"),
    require("@/assets/icons/subscriptions/audible.png"),
  ];

  let headerComponent;
  try {
    headerComponent = (
      <ImmersiveHeader
        smallCards={smallCards}
        allLogos={allLogos}
        scrollY={scrollY}
      />
    );
  } catch (error) {
    console.error("Erro ao montar ImmersiveHeader:", error);
    headerComponent = (
      <View style={styles.error}>
        <Text style={styles.errorText}>Erro ao carregar header</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: 600 }}
      >
        {headerComponent}

        {/* Value Snapshot (Impacto Financeiro) */}
        <ValueSnapshot monthlyValue={79.90} annualValue={958.80} />

        {/* Conteúdo fictício para teste do scroll */}
        <View style={styles.content}>
          <Text style={styles.text}>Conteúdo abaixo do header</Text>
          <Text style={styles.text}>Role para ver o efeito de parallax</Text>
          <Text style={styles.text}>Aqui você pode adicionar mais conteúdo para teste</Text>
          <Text style={styles.text}>Os cards menores ficam acima do card maior</Text>
          <Text style={styles.text}>O Card 6 mostra todas as assinaturas do usuário</Text>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    marginTop: 20,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  text: {
    color: "#fff",
    fontSize: 18,
    marginVertical: 10,
  },
  error: {
    padding: 20,
    backgroundColor: "red",
    margin: 20,
    borderRadius: 10,
  },
  errorText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

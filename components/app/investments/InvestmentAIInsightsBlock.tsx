import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Platform, Animated } from "react-native";
import { BlurView } from "expo-blur";

const brandFont = Platform.select({
  ios: "SF Pro Display",
  android: "Inter",
  default: "System",
});

export default function InvestmentAIInsightsBlock() {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 420,
        easing: (t) => 1 - Math.pow(1 - t, 3), // EaseOutCubic Apple feel
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 420,
        easing: (t) => 1 - Math.pow(1 - t, 3),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity,
        transform: [{ translateY }],
      }}
    >
      <BlurView intensity={40} tint="dark" style={styles.card}>
        <Text style={styles.title}>Insights da NÖUS AI</Text>

        <Text style={styles.subtitle}>
          Em breve, sua análise inteligente será gerada aqui pela OpenAI.
        </Text>

        <View style={styles.placeholderBox}>
          <Text style={styles.placeholderText}>
            “Estamos preparando uma leitura avançada do seu investimento,
            baseada em comportamento, projeções e movimentos de mercado...”
          </Text>
        </View>
      </BlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 24,
    padding: 20,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },

  title: {
    fontFamily: brandFont,
    fontSize: 17,
    color: "#fff",
    fontWeight: "600",
    marginBottom: 6,
  },

  subtitle: {
    fontFamily: brandFont,
    fontSize: 13,
    color: "rgba(255,255,255,0.55)",
    marginBottom: 16,
  },

  placeholderBox: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  placeholderText: {
    fontFamily: brandFont,
    fontSize: 13,
    color: "rgba(255,255,255,0.4)",
    lineHeight: 18,
  },
});

// components/app/goals/GoalsInsightsCard.tsx
import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Animated,
  TouchableOpacity,
} from "react-native";
import { BlurView } from "expo-blur";

const brandFont = Platform.select({
  ios: "SF Pro Display",
  android: "Inter",
  default: "System",
});

type Insight = {
  id: string;
  type: string;
  severity: "positive" | "warning" | "danger" | "neutral";
  title: string;
  message: string;
};

type Props = {
  insight: Insight;
  isPro: boolean;
  onPressUpgrade?: () => void;
};

export default function GoalsInsightsCard({
  insight,
  isPro,
  onPressUpgrade,
}: Props) {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 320,
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 320,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  /* ------------------------------------------------------------
     PAYWALL
  ------------------------------------------------------------ */
  if (!isPro) {
    return (
      <TouchableOpacity onPress={onPressUpgrade} activeOpacity={0.9}>
        <BlurView intensity={45} tint="dark" style={styles.lockedCard}>
          <Text style={styles.lockedTitle}>Insights Premium</Text>
          <Text style={styles.lockedDesc}>
            Veja análises avançadas sobre suas metas, dívidas e investimentos.
          </Text>
          <Text style={styles.lockedCTA}>Desbloquear PRO ›</Text>
        </BlurView>
      </TouchableOpacity>
    );
  }

  /* ------------------------------------------------------------
     CARD DE INSIGHT PREMIUM
  ------------------------------------------------------------ */
  return (
    <Animated.View
      style={{
        opacity: fade,
        transform: [{ translateY: slide }],
      }}
    >
      <BlurView intensity={35} tint="dark" style={styles.card}>
        {/* HEADER */}
        <View style={styles.headerRow}>
          <View
            style={[
              styles.iconDot,
              insight.severity === "positive" && { backgroundColor: "#4cd964" },
              insight.severity === "warning" && { backgroundColor: "#ffcc00" },
              insight.severity === "danger" && { backgroundColor: "#ff453a" },
              insight.severity === "neutral" && { backgroundColor: "#8e8e93" },
            ]}
          />
          <Text style={styles.headerText}>Insight Premium</Text>
        </View>

        {/* TÍTULO */}
        <Text style={styles.title}>{insight.title}</Text>

        {/* DESCRIÇÃO */}
        <Text style={styles.desc}>{insight.message}</Text>
      </BlurView>
    </Animated.View>
  );
}

/* ===========================================================
   ESTILOS
=========================================================== */
const styles = StyleSheet.create({
  card: {
    marginHorizontal: 18,
    marginTop: 18,
    padding: 20,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  iconDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  headerText: {
    fontFamily: brandFont,
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
  },

  title: {
    fontFamily: brandFont,
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  desc: {
    fontFamily: brandFont,
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    lineHeight: 18,
  },

  /* BLOCO PRO BLOQUEADO */
  lockedCard: {
    marginHorizontal: 18,
    marginTop: 18,
    padding: 20,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  lockedTitle: {
    fontFamily: brandFont,
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  lockedDesc: {
    fontFamily: brandFont,
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    marginTop: 6,
  },
  lockedCTA: {
    marginTop: 10,
    fontFamily: brandFont,
    fontSize: 13,
    color: "#87b4c7ff",
    fontWeight: "600",
  },
});

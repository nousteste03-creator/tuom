// app/immersive/ValueSnapshot.tsx
import React, { useEffect } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { BlurView } from "expo-blur";
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  Easing,
  interpolateColor,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

interface ValueSnapshotProps {
  monthlyValue: number;
  annualValue: number;
}

export const ValueSnapshot: React.FC<ValueSnapshotProps> = ({
  monthlyValue,
  annualValue,
}) => {
  const anim = useSharedValue(0);

  useEffect(() => {
    anim.value = withTiming(1, { duration: 1200, easing: Easing.out(Easing.exp) });
  }, []);

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: (1 - anim.value) * 30 },
      { scale: 0.95 + anim.value * 0.05 },
    ],
    opacity: anim.value,
  }));

  // Gradiente de cor animado para os valores (neon cyan -> purple)
  const animatedValueStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      anim.value,
      [0, 1],
      ["#4d8a8aff", "#ffffffff"] // cyan -> purple
    );
    return { color };
  });

  return (
    <Animated.View style={[styles.container, animatedCardStyle]}>
      <View style={styles.cardsContainer}>
        {/* Card Mensal */}
        <BlurView intensity={90} tint="dark" style={styles.card}>
          <Text style={styles.label}>Mensal</Text>
          <Animated.Text style={[styles.value, animatedValueStyle]}>
            R$ {monthlyValue.toFixed(2)}
          </Animated.Text>
          <View style={styles.iaGlow} />
        </BlurView>

        {/* Card Anual */}
        <BlurView intensity={90} tint="dark" style={styles.card}>
          <Text style={styles.label}>Anual</Text>
          <Animated.Text style={[styles.value, animatedValueStyle]}>
            R$ {annualValue.toFixed(2)}
          </Animated.Text>
          <View style={styles.iaGlow} />
        </BlurView>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    width: "100%",
    alignItems: "center",
  },
  cardsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: width - 32,
  },
  card: {
    flex: 1,
    marginHorizontal: 8,
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.25)", // glass futurista
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
    overflow: "hidden",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#b3cfd3ff",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  iaGlow: {
    position: "absolute",
    top: -10,
    right: -10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(231, 231, 231, 0.15)", // glow roxo suave
    shadowColor: "#000000ff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
});

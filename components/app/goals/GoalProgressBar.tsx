import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Animated, Easing } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

/**
 * progress: 0 a 100 (porcentagem)
 */
type GoalProgressBarProps = {
  progress: number; // 0–100
  height?: number;
  color?: "green" | "purple";
};

export default function GoalProgressBar({
  progress,
  height = 12,
  color = "green",
}: GoalProgressBarProps) {
  const [width, setWidth] = useState(0);
  const anim = useRef(new Animated.Value(0)).current;

  // garante que nunca passa de 0–100
  const safeProgress = Math.max(0, Math.min(progress ?? 0, 100));

  useEffect(() => {
    Animated.timing(anim, {
      toValue: safeProgress,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [safeProgress]);

  const animatedWidth =
    width > 0
      ? anim.interpolate({
          inputRange: [0, 100],
          outputRange: [0, width],
          extrapolate: "clamp",
        })
      : 0;

  const gradientColors =
    color === "green"
      ? (["#2ECC71", "#27AE60", "#1E8449"] as const)
      : (["#6268FF", "#8A8FFF", "#AFAFFF"] as const);

  return (
    <View
      style={[
        styles.wrapper,
        {
          height,
          borderRadius: height * 0.5,
        },
      ]}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
    >
      <BlurView
        intensity={20}
        tint="dark"
        style={[StyleSheet.absoluteFill, { borderRadius: height * 0.5 }]}
      />

      {/* Barra preenchida */}
      <Animated.View
        style={{
          width: animatedWidth || 0,
          height,
          borderRadius: height * 0.5,
          overflow: "hidden",
        }}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    backgroundColor: "rgba(15,15,15,0.55)",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
});

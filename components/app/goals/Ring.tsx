// components/app/goals/Ring.tsx
import React, { useEffect, useRef } from "react";
import { View, Animated } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";

type Props = {
  size?: number;
  strokeWidth?: number;
  progress: number; // 0–1
  color?: string;
  backgroundColor?: string;
  children?: React.ReactNode;
};

export function Ring({
  size = 64,
  strokeWidth = 6,
  progress,
  color = "#8A8FFF",
  backgroundColor = "rgba(255,255,255,0.08)",
  children,
}: Props) {
  const animated = useRef(new Animated.Value(0)).current;

  const clamped = Math.min(1, Math.max(0, progress));

  useEffect(() => {
    Animated.timing(animated, {
      toValue: clamped,
      duration: 650,
      easing: (t) => t, // linear suave
      useNativeDriver: false, // IMPORTANTE para SVG
    }).start();
  }, [clamped]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const strokeDashoffset = animated.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Svg width={size} height={size}>
        <Defs>
          {/* Gradiente Premium */}
          <LinearGradient id="ringGradient" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={color} stopOpacity={0.85} />
            <Stop offset="100%" stopColor={color} stopOpacity={1} />
          </LinearGradient>

          {/* Glow gradiente */}
          <LinearGradient id="glowGradient" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={color} stopOpacity={0.15} />
            <Stop offset="100%" stopColor={color} stopOpacity={0.0} />
          </LinearGradient>
        </Defs>

        {/* ANEL DE FUNDO */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* GLOW (stroke grande) */}
        {clamped > 0 && (
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#glowGradient)"
            strokeWidth={strokeWidth * 2.5}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            opacity={0.35}
          />
        )}

        {/* ANEL PRINCIPAL */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#ringGradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>

      {/* CONTEÚDO CENTRAL */}
      <View
        style={{
          position: "absolute",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {children}
      </View>
    </View>
  );
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

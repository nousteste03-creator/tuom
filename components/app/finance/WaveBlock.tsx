import React, { useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Svg, { Path } from "react-native-svg";
import Animated, {
  Easing,
  useSharedValue,
  useAnimatedProps,
  withTiming,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import Icon from "@/components/ui/Icon";

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface Props {
  isPremium: boolean;
}

export default function WaveBlock({ isPremium }: Props) {
  return (
    <View
      style={{
        marginTop: 10,
        borderRadius: 24,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.07)",
      }}
    >
      <BlurView
        intensity={22}
        tint="dark"
        style={{
          padding: 18,
          backgroundColor: "rgba(15,15,15,0.45)",
        }}
      >
        <Text
          style={{
            color: "#FFF",
            fontSize: 16,
            fontWeight: "600",
            marginBottom: 4,
          }}
        >
          Visão avançada do mês
        </Text>

        <Text
          style={{
            color: "#9CA3AF",
            fontSize: 12,
            marginBottom: isPremium ? 18 : 20,
          }}
        >
          Entradas, saídas e tendência projetada
        </Text>

        {isPremium ? <PremiumWave /> : <LockedWave />}
      </BlurView>
    </View>
  );
}

/* ---------------------------------------------------
   PREMIUM — Gráfico linear minimalista estilo XP
-----------------------------------------------------*/
function PremiumWave() {
  // Dados de exemplo (safe) — depois você troca
  const points = [20, 45, 35, 55, 40, 60, 50, 70];

  // Constrói curva Bezier suave
  const d = useMemo(() => {
    const width = 300;
    const height = 110;
    const step = width / (points.length - 1);

    let path = `M 0 ${height - points[0]}`;

    for (let i = 1; i < points.length; i++) {
      const x = step * i;
      const y = height - points[i];
      const prevX = step * (i - 1);
      const prevY = height - points[i - 1];

      // curva suave
      const c1x = prevX + (x - prevX) / 2;
      const c1y = prevY;
      const c2x = prevX + (x - prevX) / 2;
      const c2y = y;

      path += ` C ${c1x},${c1y} ${c2x},${c2y} ${x},${y}`;
    }

    return path;
  }, []);

  // Animação draw-on-load
  const progress = useSharedValue(0);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: (1 - progress.value) * 600,
  }));

  React.useEffect(() => {
    progress.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.ease),
    });
  }, []);

  return (
    <View style={{ width: "100%", height: 140 }}>
      <Svg width="100%" height="140">
        <AnimatedPath
          d={d}
          stroke="#F5F5F7"
          strokeWidth={2}
          fill="none"
          strokeDasharray={600}
          animatedProps={animatedProps}
        />
      </Svg>

      {/* Pontinho final pulsando */}
      <AnimatedDot />
    </View>
  );
}

/* Pontinho final (último ponto da curva) */
function AnimatedDot() {
  const scale = useSharedValue(1);

  React.useEffect(() => {
    scale.value = withTiming(1.35, {
      duration: 600,
      easing: Easing.inOut(Easing.ease),
    });
  }, []);

  const style = useAnimatedProps(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={{
        position: "absolute",
        bottom: 20,
        right: 20,
        width: 10,
        height: 10,
        borderRadius: 20,
        backgroundColor: "#F5F5F7",
      }}
    />
  );
}

/* ---------------------------------------------------
   FREE — Bloqueado
-----------------------------------------------------*/
function LockedWave() {
  return (
    <View
      style={{
        paddingVertical: 22,
        paddingHorizontal: 12,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Icon name="lock-closed-outline" size={26} color="#9CA3AF" />

      <Text
        style={{
          color: "#E5E7EB",
          fontSize: 14,
          marginTop: 10,
          fontWeight: "600",
        }}
      >
        Recurso Premium
      </Text>

      <Text
        style={{
          color: "#9CA3AF",
          fontSize: 12,
          textAlign: "center",
          marginTop: 4,
          lineHeight: 17,
        }}
      >
        Desbloqueie a visão avançada do mês com o plano Premium.
      </Text>

      <TouchableOpacity
        activeOpacity={0.85}
        style={{
          marginTop: 14,
          paddingVertical: 8,
          paddingHorizontal: 22,
          borderRadius: 999,
          backgroundColor: "#FFF",
        }}
        onPress={() => {
          // placeholder
        }}
      >
        <Text style={{ fontWeight: "600", fontSize: 13, color: "#000" }}>
          Desbloquear
        </Text>
      </TouchableOpacity>
    </View>
  );
}

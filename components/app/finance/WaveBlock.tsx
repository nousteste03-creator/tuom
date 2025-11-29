// components/app/finance/WaveBlock.tsx
import React, { useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Svg, { Polyline } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import Icon from "@/components/ui/Icon";

const AnimatedPolyline = Animated.createAnimatedComponent(Polyline);

interface Props {
  isPremium: boolean;
  income: number;
  expenses: number;
  balance: number;
  onPress?: () => void;
}

export default function WaveBlock({
  isPremium,
  income,
  expenses,
  balance,
  onPress,
}: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={isPremium ? onPress : undefined}
      style={{
        marginTop: 10,
        borderRadius: 24,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.07)",
        opacity: isPremium ? 1 : 0.55,
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
            marginBottom: 20,
          }}
        >
          Tendência linear projetada
        </Text>

        <LinearWave
          income={income}
          expenses={expenses}
          balance={balance}
          locked={!isPremium}
        />
      </BlurView>
    </TouchableOpacity>
  );
}

/* -----------------------------------------------------
   GRÁFICO LINEAR PREMIUM — sem curvas, sem risco
-----------------------------------------------------*/
function LinearWave({ income, expenses, balance, locked }: any) {
  const width = 300;
  const height = 90;

  // Blindagem total
  income = Number(income) || 0;
  expenses = Number(expenses) || 0;
  balance = Number(balance) || 0;

  // Converte valores para pontos
  const points = useMemo(() => {
    if (locked) return [40, 42, 38, 35, 37, 36];

    const arr = [
      income * 0.2,
      income * 0.4 - expenses * 0.1,
      balance,
      balance * 0.9,
      balance * 1.05,
      balance * 0.95,
    ];

    // Normaliza entre 20 e 80
    return arr.map((v) => {
      const n = v / 10;
      return Math.min(80, Math.max(20, n));
    });
  }, [income, expenses, balance, locked]);

  // Transforma em coordenadas X,Y
  const coords = points
    .map((p, i) => `${(i / (points.length - 1)) * width},${height - p}`)
    .join(" ");

  // Animação
  const dash = useSharedValue(1);
  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: dash.value * 600,
  }));

  React.useEffect(() => {
    dash.value = withTiming(0, {
      duration: 700,
      easing: Easing.out(Easing.quad),
    });
  }, []);

  return (
    <View style={{ width: "100%", height: 120, alignItems: "center" }}>
      <Svg width={width} height={120}>
        <AnimatedPolyline
          points={coords}
          fill="none"
          stroke={locked ? "#444" : "#F5F5F7"}
          strokeWidth={2}
          strokeDasharray={600}
          animatedProps={animatedProps}
          opacity={locked ? 0.4 : 1}
        />
      </Svg>

      {!locked && <Dot />}
      {locked && <LockedOverlay />}
    </View>
  );
}

/* Pontinho animado */
function Dot() {
  return (
    <View
      style={{
        position: "absolute",
        right: 25,
        bottom: 32,
        width: 10,
        height: 10,
        borderRadius: 10,
        backgroundColor: "#FFF",
      }}
    />
  );
}

/* Overlay premium bloqueado */
function LockedOverlay() {
  return (
    <View
      style={{
        position: "absolute",
        inset: 0,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.55)",
        borderRadius: 24,
      }}
    >
      <Icon name="lock-closed-outline" size={26} color="#E5E7EB" />
      <Text
        style={{
          color: "#FFF",
          marginTop: 8,
          fontWeight: "600",
          fontSize: 14,
        }}
      >
        Recurso Premium
      </Text>
      <Text
        style={{
          color: "#AAA",
          textAlign: "center",
          fontSize: 12,
          marginTop: 4,
          paddingHorizontal: 20,
          lineHeight: 17,
        }}
      >
        Desbloqueie a visão avançada do mês.
      </Text>
    </View>
  );
}

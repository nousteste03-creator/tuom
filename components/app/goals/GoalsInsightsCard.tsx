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
import type { GoalWithStats } from "@/hooks/useGoals";

const brandFont = Platform.select({
  ios: "SF Pro Display",
  android: "Inter",
  default: "System",
});

type Props = {
  goal: GoalWithStats;
  isPro: boolean;
  onPressUpgrade?: () => void;
};

/* ===========================================================
   INSIGHT DINÂMICO — baseado nos dados reais da meta
=========================================================== */
function buildInsight(goal: GoalWithStats) {
  const { type, aheadOrBehindMonths, remainingAmount, progressPercent } = goal;

  // META NORMAL
  if (type === "goal") {
    if (aheadOrBehindMonths != null) {
      if (aheadOrBehindMonths < -0.5) {
        return {
          title: "Abaixo do plano",
          desc:
            "Seu progresso está atrás do esperado para esta data. Reavaliar o aporte mensal pode evitar atrasos futuros.",
        };
      }
      if (aheadOrBehindMonths > 0.5) {
        return {
          title: "Acima do ritmo esperado",
          desc:
            "Você está avançando além do planejado. Mantendo esse ritmo, pode concluir sua meta antes do previsto.",
        };
      }
    }

    if (progressPercent < 20) {
      return {
        title: "Primeiros passos",
        desc:
          "Você está começando a construir essa meta. Continue com pequenas contribuições regulares para criar consistência.",
      };
    }

    if (remainingAmount < 200) {
      return {
        title: "Quase lá",
        desc:
          "Faltam apenas alguns passos para alcançar sua meta. Mantenha o foco nos aportes finais.",
      };
    }

    return {
      title: "Ritmo estável",
      desc:
        "Sua meta está avançando de forma consistente. Continue revisando mensalmente para manter o equilíbrio.",
    };
  }

  // DÍVIDA
  if (type === "debt") {
    return {
      title: "Gestão de dívida saudável",
      desc:
        "Você está reduzindo sua dívida continuamente. Revisar juros e negociar taxas pode melhorar ainda mais seu progresso.",
    };
  }

  // INVESTIMENTO
  if (type === "investment") {
    return {
      title: "Disciplina de aportes",
      desc:
        "Manter constância nos aportes é uma das chaves para o crescimento. Avalie oportunidades de diversificação.",
    };
  }

  return {
    title: "Insight indisponível",
    desc: "Não foi possível gerar análise para este tipo de meta.",
  };
}

/* ===========================================================
   COMPONENTE
=========================================================== */
export default function GoalsInsightsCard({ goal, isPro, onPressUpgrade }: Props) {
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

  // Debug opcional
  console.log("DEBUG GoalsInsightsCard:", {
    id: goal.id,
    title: goal.title,
    progressPercent: goal.progressPercent,
    aheadOrBehindMonths: goal.aheadOrBehindMonths,
    remaining: goal.remainingAmount,
  });

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

  const insight = buildInsight(goal);

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
          <View style={styles.iconDot} />
          <Text style={styles.headerText}>Insight Premium</Text>
        </View>

        {/* TÍTULO */}
        <Text style={styles.title}>{insight.title}</Text>

        {/* DESCRIÇÃO */}
        <Text style={styles.desc}>{insight.desc}</Text>
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
    backgroundColor: "rgba(255,255,255,0.45)",
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

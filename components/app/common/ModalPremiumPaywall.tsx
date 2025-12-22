// components/app/common/ModalPremiumPaywall.tsx

import React, { useRef, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";

import { supabase } from "@/lib/supabase";
import { useUserPlan } from "@/context/UserPlanContext"; // CONTEXTO OFICIAL

const brandFont = Platform.select({
  ios: "SF Pro Display",
  android: "Inter",
  default: "System",
});

type BlockType = "goal" | "debt" | "investment" | "income";

type Props = {
  visible: boolean;
  blockedType?: BlockType;
  onClose: () => void;
  onUpgrade: () => void;
};

export default function ModalPremiumPaywall({
  visible,
  blockedType = "goal",
  onClose,
  onUpgrade,
}: Props) {

  const userPlan = useUserPlan();
  const reloadPlan = userPlan?.reload;

  // ANIMAÇÃO
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.92)).current;
  const translate = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(translate, {
          toValue: 0,
          duration: 260,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      opacity.setValue(0);
      scale.setValue(0.92);
      translate.setValue(12);
    }
  }, [visible]);

  // UPGRADE REAL — AGORA FUNCIONA
  async function handleUpgrade() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.id) return;

    await supabase
      .from("user_settings")
      .update({ plan: "pro" })
      .eq("user_id", user.id);

    await reloadPlan?.(); // Atualiza provider
    onUpgrade?.(); // Volta pra tela anterior
  }

  // TEXTOS
  const title = useMemo(() => {
    switch (blockedType) {
      case "goal":
        return "Limite de metas atingido";
      case "debt":
        return "Limite de dívidas atingido";
      case "investment":
        return "Limite de investimentos atingido";
      case "income":
        return "Limite de receitas atingido";
      default:
        return "Desbloqueie todo o potencial";
    }
  }, [blockedType]);

  const subtitle = useMemo(() => {
    switch (blockedType) {
      case "goal":
        return "Crie metas ilimitadas e acompanhe sua evolução com projeções inteligentes.";
      case "debt":
        return "Gerencie suas dívidas com calendário e acompanhamento automático.";
      case "investment":
        return "Adicione investimentos ilimitados e veja projeções reais.";
      case "income":
        return "Cadastre múltiplas fontes de renda e tenha fluxo mensal avançado.";
      default:
        return "Assine o TUÖM PRO e libere recursos avançados.";
    }
  }, [blockedType]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlay, { opacity }]}>
      <BlurView tint="dark" intensity={65} style={styles.blurBackground} />

      <Animated.View
        style={[
          styles.card,
          {
            transform: [{ scale }, { translateY: translate }],
          },
        ]}
      >
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        <View style={styles.features}>
          <Feature icon="add-circle-outline" text="Itens ilimitados" />
          <Feature icon="bar-chart" text="Projeções inteligentes" />
          <Feature icon="sparkles" text="Insights avançados" />
          <Feature icon="shield-checkmark" text="Prioridade e controle total" />
        </View>

        <Text style={styles.price}>R$16,90/mês</Text>
        <Text style={styles.small}>Cancelamento fácil, sem fidelidade.</Text>

        <TouchableOpacity style={styles.button} onPress={handleUpgrade}>
          <Text style={styles.buttonText}>Assinar TUÖM PRO</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onClose} style={{ marginTop: 16 }}>
          <Text style={styles.close}>Fechar</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

function Feature({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.featureItem}>
      <Ionicons name={icon as any} size={18} color="white" style={{ opacity: 0.85 }} />
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    inset: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  blurBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    width: "86%",
    padding: 24,
    paddingBottom: 34,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  title: {
    fontFamily: brandFont,
    fontSize: 22,
    color: "white",
    fontWeight: "700",
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: brandFont,
    fontSize: 14,
    color: "rgba(255,255,255,0.65)",
    textAlign: "center",
    marginBottom: 16,
  },
  features: {
    marginVertical: 10,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  featureText: {
    marginLeft: 8,
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
  },
  price: {
    marginTop: 20,
    fontSize: 20,
    color: "white",
    fontWeight: "600",
    textAlign: "center",
  },
  small: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
    marginTop: 2,
  },
  button: {
    marginTop: 20,
    backgroundColor: "white",
    paddingVertical: 13,
    borderRadius: 12,
  },
  buttonText: {
    fontFamily: brandFont,
    textAlign: "center",
    color: "#111",
    fontSize: 15,
    fontWeight: "600",
  },
  close: {
    fontFamily: brandFont,
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    textAlign: "center",
  },
});

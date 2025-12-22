// app/(tabs)/home/subscription.tsx

import React, { useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Platform,
  Dimensions,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import { Video } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

import Screen from "@/components/layout/Screen";
import Icon from "@/components/ui/Icon";
import { useUserPlan } from "@/context/UserPlanContext";

/* -------------------------------------------------------
   CONSTANTES
------------------------------------------------------- */
const { height: SCREEN_H } = Dimensions.get("window");

const brandFont = Platform.select({
  ios: "SF Pro Display",
  default: "System",
});

type PlanMode = "basic" | "pro";

/* -------------------------------------------------------
   COPY (dinâmico por modo)
------------------------------------------------------- */
const COPY = {
  basic: {
    title: "Você vê os números.",
    body:
      "Organiza gastos, acompanha valores e mantém controle essencial.\n\nAs decisões ainda dependem só de você.",
    bullets: [] as string[],
    cta: "Continuar no modo básico",
    hint: "Você pode ativar o PRO quando quiser.",
  },
  pro: {
    title: "Os números ganham contexto.",
    body:
      "A TUÖM  interpreta seus dados, conecta padrões e reduz ruído para você decidir com clareza.",
    bullets: [
      "Interpretação com PILA",
      "Contexto de mercado e notícias",
      "Insights contínuos",
    ],
    cta: "Ativar TUÖM PRO",
    hint: "Cancele quando quiser.",
  },
} as const;

/* -------------------------------------------------------
   COMPONENTES
------------------------------------------------------- */
function PlanCardBasic({
  active,
  onPress,
}: {
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={{ flex: 1 }}>
      <View
        style={[
          styles.planCardBase,
          styles.planCardBasic,
          active ? styles.planCardActive : styles.planCardInactive,
        ]}
      >
        <View style={styles.planTopRow}>
          <Text style={styles.planTitle}>Básico</Text>
          <View
            style={[
              styles.radio,
              active ? styles.radioOn : styles.radioOff,
            ]}
          >
            {active ? <View style={styles.radioDot} /> : null}
          </View>
        </View>

        <Text style={styles.planDesc}>Organização essencial</Text>
      </View>
    </TouchableOpacity>
  );
}

function PlanCardPro({
  active,
  onPress,
}: {
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={{ flex: 1 }}>
      <BlurView
        intensity={active ? 26 : 18}
        tint="dark"
        style={[
          styles.planCardBase,
          styles.planCardPro,
          active ? styles.planCardProActive : styles.planCardInactive,
        ]}
      >
        <View style={styles.planProGlow} />

        <View style={styles.planTopRow}>
          <Text style={styles.planTitle}>TUÖM PRO</Text>
          <View
            style={[
              styles.radio,
              active ? styles.radioOn : styles.radioOff,
            ]}
          >
            {active ? <View style={styles.radioDot} /> : null}
          </View>
        </View>

        <Text style={styles.planDesc}>Clareza, contexto e decisão</Text>
      </BlurView>
    </TouchableOpacity>
  );
}

function DynamicPlanBlock({
  mode,
  isPro,
}: {
  mode: PlanMode;
  isPro: boolean;
}) {
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);

  useEffect(() => {
    // “Troca de modo” com fade curto + leve deslocamento (silencioso)
    opacity.value = withTiming(0, { duration: 140 });
    translateY.value = withTiming(6, { duration: 140 });

    const t = setTimeout(() => {
      opacity.value = withTiming(1, { duration: 260 });
      translateY.value = withTiming(0, { duration: 260 });
    }, 150);

    return () => clearTimeout(t);
  }, [mode]);

  const aStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const content = COPY[mode];

  return (
    <Animated.View style={[styles.dynamicWrap, aStyle]}>
      <Text style={styles.dynamicTitle}>{content.title}</Text>

      <Text style={styles.dynamicBody}>{content.body}</Text>

      {mode === "pro" && content.bullets.length > 0 ? (
        <View style={styles.bullets}>
          {content.bullets.map((b, i) => (
            <View key={`${b}-${i}`} style={styles.bulletRow}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>{b}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {/* Se já é PRO, reforça “estado” sem ficar vendedor */}
      {isPro ? (
        <View style={styles.proBadgeInline}>
          <Icon name="check" size={16} color="rgba(255,255,255,0.85)" />
          <Text style={styles.proBadgeText}>Assinatura ativa</Text>
        </View>
      ) : null}
    </Animated.View>
  );
}

/* -------------------------------------------------------
   SCREEN
------------------------------------------------------- */
export default function SubscriptionScreen() {
  const router = useRouter();
  const { isPro } = useUserPlan();

  // Default: destacar PRO (padrão premium, sem agressividade).
  const [mode, setMode] = useState<PlanMode>("pro");

  const content = useMemo(() => COPY[mode], [mode]);

  function handleCTA() {
    if (isPro) {
      router.push("/settings/manage-subscription");
      return;
    }

    if (mode === "basic") {
      // Aqui você decide o fluxo:
      // - ou volta para home,
      // - ou fecha modal,
      // - ou apenas mantém como “preview”
      router.back();
      return;
    }

    // 🔒 Checkout depois (Stripe/InfinitePay etc.)
    // router.push("/checkout");
  }

  return (
    <Screen noPadding>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ================= HERO ================= */}
        <View style={styles.hero}>
          <Video
            source={require("@/assets/video/subscription-hero.mp4")}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
            isLooping
            shouldPlay
            isMuted
          />

          <View style={styles.heroDim} />

          <LinearGradient
            colors={[
              "rgba(0,0,0,0.00)",
              "rgba(0,0,0,0.55)",
              "rgba(0,0,0,0.92)",
              "#000000",
            ]}
            locations={[0, 0.45, 0.78, 1]}
            style={StyleSheet.absoluteFillObject}
          />

          <View style={styles.heroHeader}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.closeBtn}
            >
              <Icon name="close" size={20} color="#fff" />
            </TouchableOpacity>

            <Text style={styles.heroBrand}>TUÖM PRO</Text>
          </View>

          <View style={styles.heroTextWrap}>
            <Text style={styles.heroTitle}>
              Controle financeiro.
              {"\n"}Sem ruído.
            </Text>

            <Text style={styles.heroSubtitle}>
              Tudo o que importa, no lugar certo.
            </Text>
          </View>
        </View>

        {/* ================= CONTENT ================= */}
        <View style={styles.content}>
          {/* Seletor de modo */}
          <View style={styles.planRow}>
            <PlanCardBasic
              active={mode === "basic"}
              onPress={() => setMode("basic")}
            />

            <PlanCardPro
              active={mode === "pro"}
              onPress={() => setMode("pro")}
            />
          </View>

          {/* Conteúdo dinâmico */}
          <DynamicPlanBlock mode={mode} isPro={isPro} />

          {/* CTA */}
          <View style={styles.ctaBlock}>
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleCTA}
              style={[
                styles.ctaBtn,
                isPro
                  ? styles.ctaBtnProActive
                  : mode === "pro"
                  ? styles.ctaBtnPrimary
                  : styles.ctaBtnGhost,
              ]}
            >
              <Text
                style={[
                  styles.ctaText,
                  isPro
                    ? styles.ctaTextProActive
                    : mode === "pro"
                    ? styles.ctaTextPrimary
                    : styles.ctaTextGhost,
                ]}
              >
                {isPro ? "Gerenciar assinatura" : content.cta}
              </Text>
            </TouchableOpacity>

            <Text style={styles.ctaHint}>
              {isPro ? "Você pode ajustar sua assinatura a qualquer momento." : content.hint}
            </Text>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

/* -------------------------------------------------------
   STYLES
------------------------------------------------------- */
const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 140,
    backgroundColor: "#000",
  },

  hero: {
    height: Math.min(SCREEN_H * 0.56, 520),
    backgroundColor: "#000",
  },

  heroDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.18)",
  },

  heroHeader: {
    position: "absolute",
    top: 54,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(103, 123, 129, 0.28)",
    borderWidth: 1,
    borderColor: "rgba(69, 115, 121, 0.96)",
    overflow: "hidden",
  },

  heroBrand: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    fontFamily: brandFont,
    letterSpacing: 0.2,
  },

  heroTextWrap: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 26,
    gap: 10,
  },

  heroTitle: {
    color: "#fbfbfbff",
    fontSize: 34,
    fontWeight: "900",
    lineHeight: 38,
    fontFamily: brandFont,
  },

  heroSubtitle: {
    color: "rgba(255,255,255,0.70)",
    fontSize: 15,
    lineHeight: 22,
    fontFamily: brandFont,
  },

  content: {
    paddingHorizontal: 20,
    marginTop: 18,
    gap: 16,
  },

  /* ------ Plan selector ------ */
  planRow: {
    flexDirection: "row",
    gap: 12,
  },

  planCardBase: {
    borderRadius: 22,
    padding: 16,
    minHeight: 86,
    overflow: "hidden",
    borderWidth: 1,
  },

  planCardBasic: {
    backgroundColor: "rgba(10,10,10,0.92)",
    borderColor: "rgba(255,255,255,0.08)",
  },

  planCardPro: {
    borderColor: "rgba(255,255,255,0.12)",
  },

  planCardActive: {
    borderColor: "rgba(255,255,255,0.22)",
  },

  planCardProActive: {
    borderColor: "rgba(255,255,255,0.26)",
  },

  planCardInactive: {
    opacity: 0.68,
  },

  planTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  planTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
    fontFamily: brandFont,
    letterSpacing: 0.2,
  },

  planDesc: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 13,
    marginTop: 6,
    fontFamily: brandFont,
    lineHeight: 18,
  },

  planProGlow: {
    position: "absolute",
    top: -40,
    right: -60,
    width: 160,
    height: 160,
    borderRadius: 999,
    backgroundColor: "rgba(58, 159, 199, 0.12)",
  },

  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  radioOn: {
    borderColor: "rgba(255,255,255,0.85)",
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  radioOff: {
    borderColor: "rgba(255,255,255,0.22)",
    backgroundColor: "rgba(0,0,0,0.18)",
  },

  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
    opacity: 0.92,
  },

  /* ------ Dynamic block ------ */
  dynamicWrap: {
    borderRadius: 22,
    padding: 18,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },

  dynamicTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    fontFamily: brandFont,
    letterSpacing: 0.15,
  },

  dynamicBody: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 14,
    marginTop: 8,
    fontFamily: brandFont,
    lineHeight: 21,
  },

  bullets: {
    marginTop: 12,
    gap: 10,
  },

  bulletRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.85)",
  },

  bulletText: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 13,
    fontFamily: brandFont,
    lineHeight: 18,
  },

  proBadgeInline: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignSelf: "flex-start",
  },

  proBadgeText: {
    color: "rgba(255,255,255,0.80)",
    fontSize: 13,
    fontFamily: brandFont,
    fontWeight: "700",
  },

  /* ------ CTA ------ */
  ctaBlock: {
    gap: 10,
    marginTop: 2,
  },

  ctaBtn: {
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: "center",
    borderWidth: 1,
  },

  ctaBtnPrimary: {
    backgroundColor: "#f6f6f6ff",
    borderColor: "rgba(255,255,255,0.95)",
  },

  ctaBtnGhost: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.14)",
  },

  ctaBtnProActive: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.14)",
  },

  ctaText: {
    fontSize: 16,
    fontWeight: "900",
    fontFamily: brandFont,
    letterSpacing: 0.1,
  },

  ctaTextPrimary: {
    color: "#161717ff",
  },

  ctaTextGhost: {
    color: "rgba(255,255,255,0.84)",
  },

  ctaTextProActive: {
    color: "rgba(255,255,255,0.82)",
  },

  ctaHint: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 13,
    textAlign: "center",
    fontFamily: brandFont,
  },
});

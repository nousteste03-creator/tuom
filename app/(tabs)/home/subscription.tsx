// app/(tabs)/home/subscription.tsx

import React from "react";
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

/* -------------------------------------------------------
   DATA
------------------------------------------------------- */
const TIMELINE: Array<[string, string]> = [
  ["Hoje", "Você passa a enxergar tudo."],
  ["Em poucos dias", "Identifica padrões reais."],
  ["Sempre", "Decide com mais consciência."],
];

const FEATURES: Array<[string, string]> = [
  ["Clareza", "Todos os seus números organizados."],
  ["PILA", "Interpreta seus dados, sem julgamento."],
  ["Contexto", "Notícias e insights que importam."],
];

/* -------------------------------------------------------
   COMPONENT
------------------------------------------------------- */
export default function SubscriptionScreen() {
  const router = useRouter();
  const { isPro } = useUserPlan();

  function handleCTA() {
    if (isPro) {
      router.push("/settings/manage-subscription");
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

          {/* Overlay (melhora leitura e evita “quebra” visual) */}
          <View style={styles.heroDim} />

          {/* Gradiente: segura o texto e integra com o fundo preto */}
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

          {/* Header no topo (fixo, não depende do vídeo) */}
          <View style={styles.heroHeader}>
            <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
              <Icon name="close" size={20} color="#fff" />
            </TouchableOpacity>

            <Text style={styles.heroBrand}>NÖUS PRO</Text>
          </View>

          {/* Hero Text (sempre dentro da área segura do gradiente) */}
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
          {/* Timeline */}
          <View style={styles.timelineBlock}>
            {TIMELINE.map(([title, desc], i) => (
              <View key={`${title}-${i}`} style={styles.timelineRow}>
                <View style={styles.timelineDot} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.timelineTitle}>{title}</Text>
                  <Text style={styles.timelineDesc}>{desc}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Features (Apple Glass) */}
          <View style={{ gap: 14 }}>
            {FEATURES.map(([title, desc], i) => (
              <BlurView
                key={`${title}-${i}`}
                intensity={22}
                tint="dark"
                style={styles.glass}
              >
                <View style={styles.glassInner}>
                  <Text style={styles.featureTitle}>{title}</Text>
                  <Text style={styles.featureDesc}>{desc}</Text>
                </View>
              </BlurView>
            ))}
          </View>

          {/* CTA */}
          <View style={styles.ctaBlock}>
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleCTA}
              style={[
                styles.ctaBtn,
                { backgroundColor: isPro ? "rgba(255,255,255,0.10)" : "#FFFFFF" },
              ]}
            >
              <Text
                style={[
                  styles.ctaText,
                  { color: isPro ? "rgba(255,255,255,0.70)" : "#111827" },
                ]}
              >
                {isPro ? "Gerenciar assinatura" : "Começar agora"}
              </Text>
            </TouchableOpacity>

            <Text style={styles.ctaHint}>Cancele quando quiser.</Text>
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
    backgroundColor: "rgba(0,0,0,0.28)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
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
    color: "#fff",
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
    marginTop: 22,
    gap: 26,
  },

  timelineBlock: {
    gap: 18,
  },

  timelineRow: {
    flexDirection: "row",
    gap: 14,
    alignItems: "flex-start",
  },

  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
    marginTop: 6,
    opacity: 0.95,
  },

  timelineTitle: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
    fontFamily: brandFont,
  },

  timelineDesc: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 14,
    marginTop: 2,
    fontFamily: brandFont,
  },

  glass: {
    borderRadius: 22,
    overflow: "hidden",
  },

  glassInner: {
    padding: 18,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  featureTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    fontFamily: brandFont,
  },

  featureDesc: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 14,
    marginTop: 4,
    fontFamily: brandFont,
    lineHeight: 20,
  },

  ctaBlock: {
    gap: 10,
    marginTop: 4,
  },

  ctaBtn: {
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },

  ctaText: {
    fontSize: 16,
    fontWeight: "800",
    fontFamily: brandFont,
  },

  ctaHint: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 13,
    textAlign: "center",
    fontFamily: brandFont,
  },
});

// components/finance/FinanceProOverlay.tsx

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Video } from "expo-av";
import { useRouter } from "expo-router";

const { height: SCREEN_H } = Dimensions.get("window");

export default function FinanceProOverlay() {
  const router = useRouter();

  return (
    <View style={styles.wrapper} pointerEvents="auto">
      {/* ================= FADE SUPERIOR ================= */}
      <LinearGradient
        colors={[
          "rgba(0,0,0,0)",
          "rgba(0,0,0,0.45)",
          "rgba(0,0,0,0.85)",
          "#000",
        ]}
        locations={[0, 0.45, 0.75, 1]}
        style={styles.topFade}
      />

      {/* ================= BLOCO CTA ================= */}
      <View style={styles.bottomBlock}>
        <Video
          source={require("@/assets/video/lobby.mp4")}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
          shouldPlay
          isLooping
          isMuted
        />

        <View style={styles.videoDim} />

        <View style={styles.content}>
          <Text style={styles.title}>Finance é PRO</Text>

          <Text style={styles.body}>
            Interpretação automática, contexto real e clareza sobre seus
            números.
          </Text>

          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.cta}
            onPress={() => router.push("/subscription")}
          >
            <Text style={styles.ctaText}>Ativar TUÖM PRO</Text>
          </TouchableOpacity>

          <Text style={styles.hint}>
            Libere análise avançada e insights contínuos.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  /* -------- Fade superior -------- */
  topFade: {
    position: "absolute",
    top: 0,
    height: SCREEN_H * 0.5,
    width: "100%",
  },

  /* -------- Bloco inferior -------- */
  bottomBlock: {
    position: "absolute",
    bottom: 0,
    height: SCREEN_H * 0.5,
    width: "100%",
    overflow: "hidden",
    backgroundColor: "#000",
  },

  videoDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
  },

  content: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 22,
    paddingBottom: 36,
    gap: 12,
  },

  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 0.2,
  },

  body: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 15,
    lineHeight: 22,
  },

  cta: {
    marginTop: 18,
    backgroundColor: "#fff",
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: "center",
  },

  ctaText: {
    color: "#151515",
    fontSize: 16,
    fontWeight: "900",
  },

  hint: {
    marginTop: 10,
    color: "rgba(255,255,255,0.45)",
    fontSize: 13,
    textAlign: "center",
  },
});

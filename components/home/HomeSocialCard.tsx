"use client";

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  Image,
  Linking,
} from "react-native";
import { Video } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { useUserPlan } from "@/context/UserPlanContext";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

const brandFont = Platform.select({
  ios: "SF Pro Display",
  default: "System",
});

export default function HomeSocialCard() {
  const { isPro } = useUserPlan();
  const router = useRouter();

  const openInstagram = () =>
    Linking.openURL(
      "https://www.instagram.com/tuomapp?igsh=NGwwNmVxb2V2anFz&utm_source=qr"
    );
  const openLinkedIn = () =>
    Linking.openURL("https://www.linkedin.com/company/tuom-finance/");

  const handleCTA = () => {
    if (!isPro) {
      router.push("/home/subscription");
    }
  };

  return (
    <View style={styles.cardWrap}>
      <Video
        source={require("@/assets/video/subscription-hero.mp4")}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
        isLooping
        shouldPlay
        isMuted
      />

      <View style={styles.dim} />
      <LinearGradient
        colors={["rgba(0,0,0,0.00)", "rgba(0,0,0,0.55)", "rgba(0,0,0,0.92)", "#000"]}
        locations={[0, 0.45, 0.78, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.content}>
        <Text style={styles.title}>Acompanhe dicas financeiras</Text>
        <Text style={styles.subtitle}>
          {isPro
            ? "Você já é PRO! Siga nossas redes para conteúdos exclusivos e insights semanais."
            : "Ative o TUÖM PRO e receba dicas completas para seu controle financeiro."}
        </Text>

        {!isPro ? (
          <TouchableOpacity
            onPress={handleCTA}
            activeOpacity={0.88}
            style={[styles.ctaBtn, styles.ctaBtnFree]}
          >
            <Text style={[styles.ctaText, styles.ctaTextFree]}>Ativar TUÖM PRO</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.socialRow}>
            <TouchableOpacity onPress={openInstagram} style={styles.socialBtn}>
              <Image
                source={require("@/assets/icons/instagram.png")}
                style={styles.socialIcon}
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={openLinkedIn} style={styles.socialBtn}>
              <Image
                source={require("@/assets/icons/linkedin.png")}
                style={styles.socialIcon}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrap: {
    width: width - 40,
    height: 200,
    borderRadius: 22,
    overflow: "hidden",
    marginVertical: 12,
    backgroundColor: "#000",
  },
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.18)",
  },
  content: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    gap: 10,
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
    fontFamily: brandFont,
  },
  subtitle: {
    color: "rgba(255,255,255,0.70)",
    fontSize: 14,
    fontFamily: brandFont,
    lineHeight: 20,
  },
  ctaBtn: {
    marginTop: 10,
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
  },
  ctaBtnFree: {
    backgroundColor: "#f6f6f6",
  },
  ctaTextFree: {
    color: "#161717",
    fontSize: 16,
    fontWeight: "900",
    fontFamily: brandFont,
  },
  socialRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 10,
  },
  socialBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  socialIcon: {
    width: 28,
    height: 28,
    resizeMode: "contain",
  },
});

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  Animated,
  Easing,
} from "react-native";
import { useRef, useState, useEffect } from "react";
import { Video, ResizeMode } from "expo-av";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export default function LobbyScreen() {
  const router = useRouter();
  const videoRef = useRef<Video>(null);
  const [videoEnded, setVideoEnded] = useState(false);

  // ✅ animações
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(10)).current;

  const subOpacity = useRef(new Animated.Value(0)).current;
  const subY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 520,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(titleY, {
          toValue: 0,
          duration: 520,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(subOpacity, {
          toValue: 1,
          duration: 520,
          delay: 40,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(subY, {
          toValue: 0,
          duration: 520,
          delay: 40,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [titleOpacity, titleY, subOpacity, subY]);

  const handlePlaybackStatusUpdate = (status: any) => {
    if (!status?.isLoaded) return;

    if (status.didJustFinish && !videoEnded) {
      setVideoEnded(true);
      videoRef.current?.pauseAsync();
    }
  };

  return (
    <View style={styles.root}>
      {/* 🎥 Vídeo híbrido */}
      <Video
        ref={videoRef}
        source={require("@/assets/video/lobby.mp4")}
        style={StyleSheet.absoluteFill}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping={false}
        isMuted
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
      />

      {/* Overlay base */}
      <View style={styles.overlay} />

      {/* Vinheta forte no rodapé */}
      <LinearGradient
        colors={[
          "rgba(0,0,0,0)",
          "rgba(0,0,0,0.25)",
          "rgba(0,0,0,0.55)",
          "rgba(0,0,0,0.85)",
          "rgba(0,0,0,1)",
        ]}
        locations={[0, 0.45, 0.65, 0.82, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* Blur leve global */}
      <BlurView intensity={8} tint="dark" style={StyleSheet.absoluteFill} />

      {/* Conteúdo */}
      <View style={styles.content}>
        {/* HEADER — integrado: watermark + headline + elemento */}
        <View style={styles.header}>
          {/* watermark gigante */}
          <Text style={styles.brandWatermark} numberOfLines={1}>
            TUÖM
          </Text>

          {/* headline animado (com personalidade) */}
          <Animated.View
            style={{
              opacity: titleOpacity,
              transform: [{ translateY: titleY }],
            }}
          >
            {/* ✅ aqui é o “headline” branco — sem cara de system */}
            <Text style={styles.headline}>
              CLAREZA{"\n"}FINANCEIRA
            </Text>

            {/* ✅ elemento simples (linha) pra integrar e dar assinatura */}
            <View style={styles.accentLine} />
          </Animated.View>

          {/* subtítulo animado (mantém cinza) */}
          <Animated.View
            style={{
              opacity: subOpacity,
              transform: [{ translateY: subY }],
            }}
          >
            <Text style={styles.subtitle}>
              Assinaturas, metas e insights — tudo num lugar só.
            </Text>
          </Animated.View>
        </View>

        {/* FOOTER — 2 CARDS */}
        <View style={styles.footer}>
          <View style={styles.cardsRow}>
            {/* LOGIN — BLACK */}
            <TouchableOpacity
              activeOpacity={0.9}
              style={[styles.cardBase, styles.cardBlack]}
              onPress={() => router.push("/(auth)/login")}
            >
              <Text style={styles.cardTitleBlack}>Log in</Text>
              <Text style={styles.cardHintBlack}>Entrar</Text>
            </TouchableOpacity>

            {/* REGISTER — WHITE */}
            <TouchableOpacity
              activeOpacity={0.9}
              style={[styles.cardBase, styles.cardWhite]}
              onPress={() => router.push("/(auth)/register")}
            >
              <Text style={styles.cardTitleWhite}>Sign up</Text>
              <Text style={styles.cardHintWhite}>Criar conta</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.legal}>
            Ao continuar, você concorda com os{" "}
            <Text style={styles.legalLink} onPress={() => router.push("/terms")}>
              Termos
            </Text>{" "}
            e a{" "}
            <Text
              style={styles.legalLink}
              onPress={() => router.push("/privacy")}
            >
              Privacidade
            </Text>
            .
          </Text>
        </View>
      </View>
    </View>
  );
}

const GAP = 14;
const CARD_W = (width - 24 * 2 - GAP) / 2;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000" },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
  },

  content: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 88 : 72,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },

  header: {
    maxWidth: width * 0.92,
    paddingTop: 8,
  },

  // watermark TUÖM
  brandWatermark: {
    fontFamily: "Agrandir-Regular",
    fontSize: 92,
    lineHeight: 92,
    fontWeight: "900",
    letterSpacing: -2.4,
    color: "rgba(255,255,255,0.14)",
    textTransform: "uppercase",
  },

  // ✅ headline branco: estilo Wise (forte, editorial)
  headline: {
    marginTop: 10,
    fontFamily: "Agrandir-Regular",
    fontSize: 44,
    lineHeight: 44,
    fontWeight: "900",
    letterSpacing: -0.8,
    color: "#fff",
    textTransform: "uppercase",
  },

  // ✅ elemento simples, assinatura (sem geometria aleatória)
  accentLine: {
    marginTop: 14,
    width: 56,
    height: 3,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.85)",
  },

  subtitle: {
    marginTop: 14,
    fontFamily: "Agrandir-Regular",
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "600",
    letterSpacing: 0.2,
    color: "rgba(255,255,255,0.72)",
  },

  footer: { paddingBottom: 28, gap: 18 },

  cardsRow: { flexDirection: "row", gap: GAP },

  cardBase: {
    width: CARD_W,
    height: 88,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 16,
    justifyContent: "center",
    overflow: "hidden",
  },

  cardBlack: {
    backgroundColor: "#000",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },

  cardTitleBlack: { color: "#fff", fontSize: 17, fontWeight: "800" },
  cardHintBlack: {
    marginTop: 6,
    color: "rgba(255,255,255,0.62)",
    fontSize: 12,
    fontWeight: "500",
  },

  cardWhite: { backgroundColor: "#fff" },
  cardTitleWhite: { color: "#000", fontSize: 17, fontWeight: "800" },
  cardHintWhite: {
    marginTop: 6,
    color: "rgba(0,0,0,0.6)",
    fontSize: 12,
    fontWeight: "500",
  },

  legal: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 16,
    color: "rgba(255,255,255,0.5)",
    textAlign: "center",
  },

  legalLink: {
    color: "rgba(255,255,255,0.75)",
    textDecorationLine: "underline",
  },
});

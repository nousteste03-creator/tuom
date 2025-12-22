import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import { useRef, useState } from "react";
import { Video, ResizeMode } from "expo-av";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export default function LobbyScreen() {
  const router = useRouter();
  const videoRef = useRef<Video>(null);
  const [videoEnded, setVideoEnded] = useState(false);

  const handlePlaybackStatusUpdate = (status: any) => {
    if (!status.isLoaded) return;

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
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.brand}>TUÖM</Text>
          <Text style={styles.subtitle}>
            Organize sua vida financeira.{"\n"}
            Assinaturas, metas e insights únicos.
          </Text>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push("/(auth)/login")}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryText}>Entrar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push("/(auth)/register")}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryText}>Criar conta</Text>
          </TouchableOpacity>

          <Text style={styles.legal}>
            Ao continuar, você concorda com os{" "}
            <Text
              style={styles.legalLink}
              onPress={() => router.push("/terms")}
            >
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

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000",
  },

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
    maxWidth: width * 0.9,
  },

  brand: {
    fontFamily: "Agrandir-Regular",
    fontSize: 34,
    color: "#fff",
    marginBottom: 18,
    letterSpacing: 1.4,
  },

  subtitle: {
    fontFamily: "Agrandir-Regular",
    fontSize: 16,
    lineHeight: 24,
    color: "rgba(255,255,255,0.75)",
  },

  footer: {
    paddingBottom: 28,
    gap: 14,
  },

  primaryButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },

  primaryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  secondaryButton: {
    height: 54,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },

  secondaryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },

  legal: {
    marginTop: 12,
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

import React, { useRef, useEffect } from "react";
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

const brandFont = Platform.select({
  ios: "SF Pro Display",
  android: "Inter",
  default: "System",
});

type Props = {
  visible: boolean;
  onClose: () => void;
  onUpgrade: () => void;
};

export default function ModalPremiumPaywall({ visible, onClose, onUpgrade }: Props) {
  // ANIMAÇÃO APPLE MUSIC
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
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset instantâneo para reabrir suave
      opacity.setValue(0);
      scale.setValue(0.92);
      translate.setValue(12);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[styles.overlay, { opacity }]}
    >
      <BlurView tint="dark" intensity={65} style={styles.blurBackground} />

      <Animated.View
        style={[
          styles.card,
          {
            transform: [
              { scale },
              { translateY: translate },
            ],
          },
        ]}
      >
        <Text style={styles.title}>Desbloqueie todo o potencial</Text>

        <Text style={styles.subtitle}>
          Assine o NÖUS PRO e tenha acesso ilimitado a metas, dívidas,
          investimentos e receitas.
        </Text>

        <View style={styles.features}>
          <Feature icon="infinite" text="Metas ilimitadas" />
          <Feature icon="trending-up" text="Investimentos ilimitados" />
          <Feature icon="card" text="Dívidas ilimitadas" />
          <Feature icon="wallet" text="Receitas ilimitadas" />
          <Feature icon="sparkles" text="Insights avançados" />
          <Feature icon="bar-chart" text="Projeções inteligentes" />
        </View>

        <Text style={styles.price}>R$16,90/mês</Text>
        <Text style={styles.small}>Cancelamento fácil, sem fidelidade.</Text>

        <TouchableOpacity style={styles.button} onPress={onUpgrade}>
          <Text style={styles.buttonText}>Assinar NÖUS PRO</Text>
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
      <Ionicons name={icon as any} size={18} color="white" style={{ opacity: 0.8 }} />
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
  },
  blurBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    width: "86%",
    padding: 22,
    paddingBottom: 32,
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
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: brandFont,
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
    marginBottom: 18,
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

import { View, StyleSheet, Dimensions } from "react-native";
import { useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

const LOGO = require("@/assets/images/splash.png");

const { width, height } = Dimensions.get("window");

// 🔥 SPLASH DE MARCA — GRANDE DE VERDADE
// Usa o menor eixo da tela para não cortar em devices altos
const BASE = Math.min(width, height);
const LOGO_SIZE = Math.min(BASE * 0.98, 720);

export default function SplashScreen() {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);

  useEffect(() => {
    // ENTRADA — presença
    opacity.value = withTiming(1, {
      duration: 700,
      easing: Easing.out(Easing.cubic),
    });

    scale.value = withTiming(1, {
      duration: 700,
      easing: Easing.out(Easing.cubic),
    });

    // RESPIRAÇÃO + SAÍDA
    const exitTimer = setTimeout(() => {
      opacity.value = withTiming(0, {
        duration: 420,
        easing: Easing.in(Easing.cubic),
      });

      scale.value = withTiming(1.03, {
        duration: 420,
        easing: Easing.in(Easing.cubic),
      });
    }, 2000);

    return () => clearTimeout(exitTimer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.root}>
      <Animated.Image
        source={LOGO}
        resizeMode="contain"
        style={[styles.logo, animatedStyle]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
});

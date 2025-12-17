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
const BASE = Math.min(width, height);
const LOGO_SIZE = Math.min(BASE * 0.98, 720);

export default function SplashScreen() {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.88);

  useEffect(() => {
    // ATO 1 — DESPERTAR (mais solene)
    opacity.value = withTiming(1, {
      duration: 900,
      easing: Easing.out(Easing.cubic),
    });

    scale.value = withTiming(1, {
      duration: 900,
      easing: Easing.out(Easing.cubic),
    });

    // ATO 3 — DISSOLUÇÃO (após respiração)
    const exitTimer = setTimeout(() => {
      opacity.value = withTiming(0, {
        duration: 500,
        easing: Easing.in(Easing.cubic),
      });

      scale.value = withTiming(1.02, {
        duration: 500,
        easing: Easing.in(Easing.cubic),
      });
    }, 2000); // 900ms entrada + ~1100ms respiração

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

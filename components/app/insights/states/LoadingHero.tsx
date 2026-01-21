import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";

const LoadingHero = () => {
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.6,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.35,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.hero,
        { opacity },
      ]}
    />
  );
};

export default LoadingHero;

const styles = StyleSheet.create({
  hero: {
    height: 280,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginBottom: 16,
  },
});

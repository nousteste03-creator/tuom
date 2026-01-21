import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";

const LoadingCard = () => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.55,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.card,
        { opacity },
      ]}
    >
      <View style={styles.image} />
      <View style={styles.textBlock} />
      <View style={styles.textLine} />
    </Animated.View>
  );
};

export default LoadingCard;

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  image: {
    height: 180,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginBottom: 12,
  },
  textBlock: {
    height: 14,
    width: "70%",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 4,
    marginBottom: 8,
  },
  textLine: {
    height: 12,
    width: "40%",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 4,
  },
});

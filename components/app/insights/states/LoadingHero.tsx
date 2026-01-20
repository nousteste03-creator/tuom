import React from "react";
import { View, StyleSheet } from "react-native";

const LoadingHero = () => (
  <View style={styles.box} />
);

export default LoadingHero;

const styles = StyleSheet.create({
  box: {
    height: 320,
    backgroundColor: "#111",
    marginBottom: 16,
  },
});

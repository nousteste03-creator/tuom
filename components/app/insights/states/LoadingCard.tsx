import React from "react";
import { View, StyleSheet } from "react-native";

const LoadingCard = () => (
  <View style={styles.box} />
);

export default LoadingCard;

const styles = StyleSheet.create({
  box: {
    height: 96,
    backgroundColor: "#111",
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 8,
  },
});

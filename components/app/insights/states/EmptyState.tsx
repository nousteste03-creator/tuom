import React from "react";
import { View, Text, StyleSheet } from "react-native";

const EmptyState = () => (
  <View style={styles.container}>
    <Text style={styles.text}>
      Nada novo agora.{"\n"}Clareza também vive no silêncio.
    </Text>
  </View>
);

export default EmptyState;

const styles = StyleSheet.create({
  container: {
    padding: 32,
    alignItems: "center",
  },
  text: {
    color: "#666",
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
  },
});

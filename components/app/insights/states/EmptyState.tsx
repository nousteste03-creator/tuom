import React from "react";
import { View, Text, StyleSheet } from "react-native";

const EmptyState = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Hoje, nada realmente relevante aconteceu aqui.
      </Text>

      <Text style={styles.text}>
        O mercado segue em movimento, mas sem sinais que mereçam destaque nesta
        categoria.{"\n"}
        Quando algo importar de verdade, você vai ver primeiro.
      </Text>
    </View>
  );
};

export default EmptyState;
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },

  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 8,
    lineHeight: 24,
  },

  text: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
    lineHeight: 20,
  },
});

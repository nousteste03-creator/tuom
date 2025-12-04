import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";

const brandFont = "SF Pro Display";

type GoalsIncomeEmptyProps = {
  message?: string;
};

export default function GoalsIncomeEmpty({
  message = "Nenhuma receita cadastrada ainda.",
}: GoalsIncomeEmptyProps) {
  return (
    <BlurView intensity={25} tint="dark" style={styles.wrapper}>
      {/* Badge circular */}
      <View style={styles.iconWrapper}>
        <Text style={styles.icon}>＋</Text>
      </View>

      <Text style={styles.title}>Sem receitas</Text>
      <Text style={styles.subtitle}>{message}</Text>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    paddingVertical: 26,
    paddingHorizontal: 20,
    marginBottom: 14,
    borderRadius: 22,

    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",

    alignItems: "center",
    justifyContent: "center",
  },

  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },

  icon: {
    fontFamily: brandFont,
    fontSize: 20,
    color: "#FFFFFF",
  },

  title: {
    fontFamily: brandFont,
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
    marginBottom: 2,
  },

  subtitle: {
    fontFamily: brandFont,
    fontSize: 13,
    color: "rgba(255,255,255,0.55)",
    textAlign: "center",
    lineHeight: 17,
  },
});

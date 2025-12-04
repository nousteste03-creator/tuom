import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";

const brandFont = "SF Pro Display";

type GoalsIncomeItemProps = {
  name: string;
  amount: number;
  frequency: string;
  nextDate?: string | null;
};

function formatCurrency(value: number) {
  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    }).format(value);
  } catch {
    return `R$ ${value.toFixed(2)}`;
  }
}

function formatDate(d?: string | null) {
  if (!d) return null;
  try {
    return new Date(d).toLocaleDateString("pt-BR");
  } catch {
    return null;
  }
}

export default function GoalsIncomeItem({
  name,
  amount,
  frequency,
  nextDate,
}: GoalsIncomeItemProps) {
  const fDate = formatDate(nextDate);

  return (
    <BlurView intensity={25} tint="dark" style={styles.container}>
      {/* Nome e frequência */}
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.frequency}>
          {frequency}
          {fDate ? ` • Próx: ${fDate}` : ""}
        </Text>
      </View>

      {/* Valor */}
      <Text style={styles.amount}>{formatCurrency(amount)}</Text>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",

    flexDirection: "row",
    alignItems: "center",
  },

  name: {
    fontFamily: brandFont,
    fontSize: 15,
    color: "#fff",
    fontWeight: "500",
  },

  frequency: {
    fontFamily: brandFont,
    fontSize: 12,
    color: "rgba(255,255,255,0.55)",
    marginTop: 2,
  },

  amount: {
    fontFamily: brandFont,
    fontSize: 15,
    color: "#A7F3D0",
    fontWeight: "600",
  },
});

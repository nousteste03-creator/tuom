import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { BlurView } from "expo-blur";

const brandFont = Platform.select({
  ios: "SF Pro Display",
  android: "Inter",
  default: "System",
});

type Projection = {
  monthly: number | null;
  remaining: number;
  projectedEndDate: string | null;
  monthsToGoal: number | null;
};

type Props = {
  projection?: Projection | null;
  remainingAmount: number;
  progressPercent: number;
};

export default function InvestmentKPISection({
  projection,
  remainingAmount,
  progressPercent,
}: Props) {
  const currency = (v: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(v);

  return (
    <BlurView intensity={40} tint="dark" style={styles.card}>
      <Text style={styles.title}>Informações</Text>

      <Text style={styles.label}>
        Aporte mensal sugerido:
        <Text style={styles.value}>
          {" "}
          {projection?.monthly ? currency(projection.monthly) : "—"}
        </Text>
      </Text>

      <Text style={styles.label}>
        Restante:
        <Text style={styles.value}> {currency(remainingAmount)}</Text>
      </Text>

      <Text style={styles.label}>
        Progresso:
        <Text style={styles.value}> {progressPercent.toFixed(0)}%</Text>
      </Text>

      <Text style={styles.label}>
        Conclusão estimada:
        <Text style={styles.value}>
          {" "}
          {projection?.projectedEndDate ?? "—"}
        </Text>
      </Text>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 20,
    padding: 20,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  title: {
    fontFamily: brandFont,
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  label: {
    fontFamily: brandFont,
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    marginTop: 6,
  },
  value: {
    color: "#fff",
    fontWeight: "600",
  },
});

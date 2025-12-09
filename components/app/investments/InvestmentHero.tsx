import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { BlurView } from "expo-blur";

const brandFont = Platform.select({
  ios: "SF Pro Display",
  android: "Inter",
  default: "System",
});

type Props = {
  title: string;
  currentValue: number;
  targetValue: number;
  progressPercent: number;
  dateLabel?: string; // <-- NOVO
};

export default function InvestmentHero({
  title,
  currentValue,
  targetValue,
  progressPercent,
  dateLabel,
}: Props) {
  const currency = (v: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(v);

  return (
    <BlurView intensity={40} tint="dark" style={styles.card}>
      <Text style={styles.title}>{title}</Text>

      <Text style={styles.currentValue}>{currency(currentValue)}</Text>

      {/* DATA DINÂMICA (somente quando houver timeframe / ponto selecionado) */}
      {dateLabel ? (
        <Text style={styles.dateText}>{dateLabel}</Text>
      ) : null}

      <Text style={styles.targetValue}>
        Meta {currency(targetValue)} — {progressPercent.toFixed(0)}%
      </Text>

      <View style={styles.divider} />

      <Text style={styles.subtleInfo}>
        {progressPercent >= 100
          ? "Meta concluída"
          : `Você atingiu ${progressPercent.toFixed(1)}% do objetivo`}
      </Text>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  title: {
    fontFamily: brandFont,
    fontSize: 18,
    color: "#fff",
    marginBottom: 8,
    fontWeight: "600",
  },
  currentValue: {
    fontFamily: brandFont,
    fontSize: 36,
    color: "#fff",
    fontWeight: "700",
  },
  dateText: {
    fontFamily: brandFont,
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    marginTop: 4,
  },
  targetValue: {
    marginTop: 6,
    fontFamily: brandFont,
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    marginVertical: 14,
  },
  subtleInfo: {
    fontFamily: brandFont,
    fontSize: 13,
    color: "rgba(255,255,255,0.65)",
  },
});

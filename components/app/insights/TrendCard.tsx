// components/app/insights/TrendCard.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import type { SentimentResult } from "@/lib/analytics/sentiment";
import { SentimentBar } from "./SentimentBar";

type Props = {
  title: string;
  sentiment: SentimentResult | null;
  isLocked?: boolean;
  onPress?: () => void;
};

export const TrendCard: React.FC<Props> = ({
  title,
  sentiment,
  isLocked = false,
  onPress,
}) => {
  const label =
    !sentiment || sentiment.score === 0
      ? "Carregando dados..."
      : `${sentiment.score > 0 ? "+" : ""}${sentiment.score}% • ${
          sentiment.label
        }`;

  return (
    <TouchableOpacity
      activeOpacity={isLocked ? 1 : 0.8}
      onPress={isLocked ? undefined : onPress}
      style={[styles.card, isLocked && styles.cardLocked]}
    >
      <Text
        style={[styles.title, isLocked && styles.textLocked]}
        numberOfLines={2}
      >
        {title}
      </Text>

      <Text
        style={[styles.subtitle, isLocked && styles.textLocked]}
        numberOfLines={1}
      >
        {label}
      </Text>

      {sentiment && (
        <SentimentBar score={sentiment.score} bucket={sentiment.bucket} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexBasis: "48%",
    padding: 14,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    minHeight: 110,
    justifyContent: "space-between",
  },
  cardLocked: {
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
  },
  textLocked: {
    color: "rgba(255,255,255,0.4)",
  },
});

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SentimentBar } from "./SentimentBar";

type Props = {
  title: string;
  analysis: {
    sentiment_percent: number;
    sentiment_label: string;
  } | null;
  onPress?: () => void;
};

export const TrendCard: React.FC<Props> = ({ title, analysis, onPress }) => {
  const label = !analysis
    ? "Carregando..."
    : `${analysis.sentiment_percent > 0 ? "+" : ""}${analysis.sentiment_percent}% • ${analysis.sentiment_label}`;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{label}</Text>

      {analysis && (
        <SentimentBar
          score={analysis.sentiment_percent}
          bucket={
            analysis.sentiment_label === "otimista"
              ? "positive"
              : analysis.sentiment_label === "cauteloso"
              ? "negative"
              : "neutral"
          }
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexBasis: "48%",
    padding: 16,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    minHeight: 120,
    justifyContent: "space-between",
  },
  title: { color: "#fff", fontSize: 15, fontWeight: "600" },
  subtitle: { color: "#aaa", fontSize: 12, marginTop: 6 },
});

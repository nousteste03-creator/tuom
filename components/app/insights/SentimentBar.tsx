// components/app/insights/SentimentBar.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { SentimentBucket } from "@/lib/analytics/sentiment";

type Props = {
  score: number; // -100 a +100
  bucket: SentimentBucket;
};

export const SentimentBar: React.FC<Props> = ({ score, bucket }) => {
  const left = `${(score + 100) / 2}%`; // -100 → 0%, +100 → 100%

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Pessimista</Text>
      <View style={styles.track}>
        <View
          style={[
            styles.thumb,
            bucket === "positive" && styles.thumbPositive,
            bucket === "neutral" && styles.thumbNeutral,
            bucket === "negative" && styles.thumbNegative,
            { left },
          ]}
        />
      </View>
      <Text style={styles.label}>Otimista</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    fontSize: 10,
    color: "rgba(255,255,255,0.5)",
  },
  track: {
    flex: 1,
    height: 4,
    marginHorizontal: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    position: "relative",
    overflow: "hidden",
  },
  thumb: {
    position: "absolute",
    top: -4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#FFFFFF",
  },
  thumbPositive: { backgroundColor: "#4ECB71" },
  thumbNeutral: { backgroundColor: "#8A8FFF" },
  thumbNegative: { backgroundColor: "#FF5C5C" },
});

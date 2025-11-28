import React from "react";
import { View, Text, StyleSheet } from "react-native";

type Props = {
  score: number; 
  bucket: "positive" | "neutral" | "negative";
};

export const SentimentBar: React.FC<Props> = ({ score, bucket }) => {
  const percent = (score + 10) * 5; // -10 = 0%, 10 = 100%

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Cautela</Text>

      <View style={styles.track}>
        <View
          style={[
            styles.thumb,
            bucket === "positive" && styles.positive,
            bucket === "neutral" && styles.neutral,
            bucket === "negative" && styles.negative,
            { left: `${percent}%` },
          ]}
        />
      </View>

      <Text style={styles.label}>Otimismo</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  label: { fontSize: 10, color: "rgba(255,255,255,0.5)" },
  track: {
    flex: 1,
    height: 4,
    marginHorizontal: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 999,
    position: "relative",
  },
  thumb: {
    position: "absolute",
    top: -5,
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  positive: { backgroundColor: "#4ECB71" },
  neutral: { backgroundColor: "#8A8FFF" },
  negative: { backgroundColor: "#FF5C5C" },
});

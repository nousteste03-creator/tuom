"use client";

import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

const MOCK_DATA = {
  assinaturas: [
    { id: "netflix", label: "Netflix", current: 55 },
    { id: "spotify", label: "Spotify", current: 22 },
  ],
  contas: [
    { id: "luz", label: "Luz", current: 300 },
    { id: "agua", label: "Água", current: 95 },
    { id: "aluguel", label: "Aluguel", current: 1500 },
  ],
};

const TIME_OPTIONS = [
  { label: "1M", months: 1 },
  { label: "3M", months: 3 },
  { label: "6M", months: 6 },
  { label: "12M", months: 12 },
];

export function EconomiaAcumuladaCard() {
  const [category, setCategory] = useState<"assinaturas" | "contas">(
    "assinaturas"
  );
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [time, setTime] = useState(TIME_OPTIONS[0]);

  const economiaMensal = useMemo(() => {
    if (!selectedItem) return 0;

    if (category === "assinaturas") {
      return selectedItem.current;
    }

    if (category === "contas") {
      return Math.round(selectedItem.current * 0.25); // economia simulada (25%)
    }

    return 0;
  }, [selectedItem, category]);

  const economiaTotal = economiaMensal * time.months;

  const animatedLine = useAnimatedStyle(() => ({
    width: withTiming(`${Math.min(100, time.months * 20)}%`, {
      duration: 700,
    }),
    opacity: withTiming(selectedItem ? 1 : 0, { duration: 300 }),
  }));

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Economia acumulada</Text>
      <Text style={styles.subtitle}>
        Visualize o impacto de ajustes financeiros ao longo do tempo
      </Text>

      {/* CATEGORY */}
      <View style={styles.row}>
        {[
          { key: "assinaturas", label: "Assinaturas" },
          { key: "contas", label: "Contas fixas" },
        ].map((item) => (
          <Pressable
            key={item.key}
            onPress={() => {
              setCategory(item.key as any);
              setSelectedItem(null);
            }}
            style={[
              styles.chip,
              category === item.key && styles.chipActive,
            ]}
          >
            <Text
              style={[
                styles.chipText,
                category === item.key && styles.chipTextActive,
              ]}
            >
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* ITEMS */}
      <View style={styles.row}>
        {MOCK_DATA[category].map((item) => (
          <Pressable
            key={item.id}
            onPress={() => setSelectedItem(item)}
            style={[
              styles.chipSmall,
              selectedItem?.id === item.id && styles.chipActive,
            ]}
          >
            <Text
              style={[
                styles.chipText,
                selectedItem?.id === item.id && styles.chipTextActive,
              ]}
            >
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* GRAPH */}
      <View style={styles.graphContainer}>
        <Animated.View style={[styles.graphLine, animatedLine]} />
      </View>

      {/* TIME */}
      <View style={styles.row}>
        {TIME_OPTIONS.map((t) => (
          <Pressable
            key={t.label}
            onPress={() => setTime(t)}
            style={[
              styles.timeChip,
              time.label === t.label && styles.timeChipActive,
            ]}
          >
            <Text
              style={[
                styles.timeText,
                time.label === t.label && styles.timeTextActive,
              ]}
            >
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* VALUE */}
      <View style={styles.valueBox}>
        <Text style={styles.valueLabel}>
          Economia estimada ({economiaMensal}/mês)
        </Text>
        <Text style={styles.value}>
          R$ {economiaTotal.toLocaleString("pt-BR")}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  title: { color: "#fff", fontSize: 18, fontWeight: "600" },
  subtitle: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    marginTop: 4,
  },
  row: { flexDirection: "row", flexWrap: "wrap", marginTop: 14, gap: 8 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  chipSmall: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  chipActive: { backgroundColor: "rgba(255,255,255,0.18)" },
  chipText: { color: "rgba(255,255,255,0.7)", fontSize: 13 },
  chipTextActive: { color: "#fff", fontWeight: "600" },
  graphContainer: {
    height: 120,
    marginTop: 20,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "flex-end",
  },
  graphLine: {
    height: 3,
    backgroundColor: "#fff",
    borderRadius: 3,
  },
  timeChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  timeChipActive: { backgroundColor: "rgba(255,255,255,0.15)" },
  timeText: { fontSize: 12, color: "rgba(255,255,255,0.6)" },
  timeTextActive: { color: "#fff" },
  valueBox: { marginTop: 20, alignItems: "center" },
  valueLabel: { color: "rgba(255,255,255,0.6)", fontSize: 13 },
  value: { color: "#fff", fontSize: 26, fontWeight: "700", marginTop: 4 },
});
"use client";

import React, { useEffect, useState } from "react";
import { View, Text, Animated, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { SERVICES_LIBRARY } from "@/constants/services";

type CategoryDistributionItem = {
  category: string;
  total: number;
  percentage: number;
};

const CATEGORY_COLORS: Record<string, string> = {
  Streaming: "#FF6B6B",
  Música: "#4ECDC4",
  Cloud: "#1A535C",
  Jogos: "#F7B801",
  Produtividade: "#5F4B8B",
  Design: "#FF9F1C",
  Educação: "#2EC4B6",
  "Design / IA": "#FF9F1C",
  Outros: "#9fafc2",
};

export default function CategoryDistribution() {
  const { subscriptions } = useSubscriptions();
  const [data, setData] = useState<CategoryDistributionItem[]>([]);
  const [animValues, setAnimValues] = useState<Animated.Value[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const grouped: Record<string, number> = {};
    let totalSum = 0;

    subscriptions.forEach((s) => {
      // Converte service do usuário para lowercase
      const serviceId = s.service.toLowerCase();

      // Busca por ID exato ou por name lowercase
      const serviceInfo =
        SERVICES_LIBRARY.find(
          (srv) => srv.id.toLowerCase() === serviceId || srv.name.toLowerCase() === serviceId
        );

      const category = serviceInfo?.category || "Outros";

      grouped[category] = (grouped[category] || 0) + s.price;
      totalSum += s.price;
    });

    const items: CategoryDistributionItem[] = Object.entries(grouped)
      .map(([category, total]) => ({
        category,
        total,
        percentage: totalSum ? (total / totalSum) * 100 : 0,
      }))
      .sort((a, b) => b.percentage - a.percentage);

    setData(items);

    const anims = items.map(() => new Animated.Value(0));
    setAnimValues(anims);

    Animated.stagger(
      80,
      anims.map((v, i) =>
        Animated.timing(v, {
          toValue: items[i].percentage,
          duration: 700,
          useNativeDriver: false,
        })
      )
    ).start();
  }, [subscriptions]);

  const renderItem = ({ item, index }: { item: CategoryDistributionItem; index: number }) => {
    const width = animValues[index]
      ? animValues[index].interpolate({
          inputRange: [0, 100],
          outputRange: ["0%", `${item.percentage}%`],
        })
      : "0%";

    const isSelected = selectedCategory === item.category;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.itemContainer, isSelected && styles.selectedItem]}
        onPress={() => setSelectedCategory(item.category)}
      >
        <View style={styles.row}>
          <Text style={styles.categoryText}>{item.category}</Text>
          <Text style={styles.totalText}>R$ {item.total.toFixed(2)}</Text>
        </View>

        <View style={styles.barBackground}>
          <Animated.View
            style={[
              styles.barFill,
              { backgroundColor: CATEGORY_COLORS[item.category] || "#9fafc2", width },
            ]}
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.category}
      renderItem={renderItem}
      contentContainerStyle={{ padding: 16 }}
      scrollEnabled={false}
    />
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    marginBottom: 16,
    padding: 4,
    borderRadius: 8,
  },
  selectedItem: {
    backgroundColor: "rgba(14,165,233,0.2)",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  totalText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#D1D5DB",
  },
  barBackground: {
    marginTop: 6,
    height: 6,
    backgroundColor: "#1F2937",
    borderRadius: 3,
    overflow: "hidden",
  },
  barFill: {
    height: 6,
    borderRadius: 3,
  },
});

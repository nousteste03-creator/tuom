"use client";

import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import type { Subscription } from "@/types/subscriptions";
import { getSubscriptionIcon } from "@/constants/subscriptionIcons";
import { SERVICES_LIBRARY } from "@/constants/services";

type BillingTimelineProps = {
  items: Subscription[];
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
};

export default function BillingTimeline({ items }: BillingTimelineProps) {
  if (!items || items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          Nenhuma cobrança nos próximos 7 dias.
        </Text>
      </View>
    );
  }

  const today = new Date();
  const grouped: Record<string, Subscription[]> = {};

  // Agrupa por dia
  items.forEach((sub) => {
    const date = new Date(sub.next_billing);
    const key = date.toDateString();
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(sub);
  });

  const sortedDates = Object.keys(grouped).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  return (
    <View>
      {sortedDates.map((dateStr) => {
        const subs = grouped[dateStr];
        const date = new Date(dateStr);
        const relative =
          date.toDateString() === today.toDateString()
            ? "Hoje"
            : `Em ${Math.ceil((date.getTime() - today.getTime()) / 86400000)} dias`;

        return (
          <View key={dateStr} style={styles.dayContainer}>
            {/* Linha da timeline */}
            <View style={styles.timeline}>
              <View style={styles.verticalLine} />
              <View style={styles.circle} />
            </View>

            <Text
              style={[
                styles.dayHeader,
                date.toDateString() === today.toDateString() && styles.today,
              ]}
            >
              {relative}
            </Text>

            {subs.map((sub) => {
              const service = SERVICES_LIBRARY.find((s) => s.id === sub.service);
              const category = service?.category || "Outros";
              const color = CATEGORY_COLORS[category] || "#888";

              return (
                <View key={sub.id} style={[styles.item, { borderLeftColor: color }]}>
                  <Image
                    source={getSubscriptionIcon(sub.service)}
                    style={styles.icon}
                  />
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{sub.service}</Text>
                    <Text style={styles.itemPrice}>
                      R$ {sub.price.toFixed(2)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    padding: 16,
    alignItems: "center",
  },
  emptyText: {
    color: "#A1A1AA", // cinza claro visível em fundo preto
    fontSize: 14,
  },
  dayContainer: {
    marginBottom: 20,
    paddingLeft: 16,
    position: "relative",
  },
  dayHeader: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#FFFFFF", // título dos dias visível em fundo preto
  },
  today: {
    color: "#FF6B6B", // destaque de "Hoje"
  },
  timeline: {
    position: "absolute",
    left: 0,
    top: 8,
    bottom: 0,
    alignItems: "center",
    width: 20,
  },
  verticalLine: {
    position: "absolute",
    width: 2,
    backgroundColor: "#555555", // linha da timeline mais visível
    top: 0,
    bottom: 0,
  },
  circle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FFFFFF", // círculo da timeline branco
    borderWidth: 2,
    borderColor: "#888888",
    position: "absolute",
    top: 0,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    padding: 10,
    borderLeftWidth: 4,
    backgroundColor: "rgba(255,255,255,0.08)", // fundo do item mais visível
    borderRadius: 8,
  },
  icon: {
    width: 32,
    height: 32,
    marginRight: 12,
    borderRadius: 6,
  },
  itemInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    color: "#FFFFFF", // texto do nome da assinatura visível
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#D1D5DB", // preço em cinza claro
  },
});

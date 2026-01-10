"use client";

import React from "react";
import { View, Text } from "react-native";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { useBudget } from "@/context/BudgetContext";

const COLORS = {
  glass: "rgba(0,0,0,0.85)",
  textPrimary: "#FFFFFF",
  textSecondary: "rgba(255,255,255,0.60)",
  textMuted: "rgba(255,255,255,0.42)",
  dividerSoft: "rgba(255,255,255,0.06)",
};

export default function MonthlyBudgetCard() {
  const router = useRouter();
  const { categories, totalExpenses } = useBudget();

  const currency = (v: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(v || 0);

  const totalLimit = categories.reduce(
    (acc: number, c: any) => acc + Number(c.limit_amount || 0),
    0
  );

  const percentUsed =
    totalLimit > 0 ? Math.min((totalExpenses / totalLimit) * 100, 100) : 0;

  return (
    <View style={{ borderRadius: 26, overflow: "hidden", marginBottom: 24 }}>
      <BlurView
        intensity={45}
        tint="dark"
        style={{
          padding: 20,
          backgroundColor: COLORS.glass,
          borderRadius: 26,
          gap: 20,
        }}
      >
        <Text
          style={{ color: COLORS.textPrimary, fontSize: 19, fontWeight: "700" }}
          onPress={() => router.push("/finance/budget")}
        >
          Orçamento do mês
        </Text>

        <View>
          <Text style={{ color: COLORS.textMuted, fontSize: 11 }}>
            Gasto no mês
          </Text>
          <Text style={{ color: COLORS.textPrimary, fontSize: 16 }}>
            {currency(totalExpenses)}
          </Text>
        </View>

        <View>
          <Text style={{ color: COLORS.textMuted, fontSize: 11 }}>
            Limite definido
          </Text>
          <Text style={{ color: COLORS.textPrimary, fontSize: 16 }}>
            {currency(totalLimit)}
          </Text>
        </View>

        <View
          style={{
            height: 4,
            borderRadius: 999,
            backgroundColor: "rgba(255,255,255,0.04)",
            overflow: "hidden",
          }}
        >
          <View
            style={{
              width: `${percentUsed}%`,
              height: "100%",
              backgroundColor:
                percentUsed < 70
                  ? "rgba(94,255,185,0.8)"
                  : percentUsed < 100
                  ? "rgba(255,255,140,0.9)"
                  : "rgba(255,120,120,0.9)",
            }}
          />
        </View>

        {categories.map((cat: any) => {
          const pct =
            cat.limit_amount > 0
              ? Math.min((cat.spent / cat.limit_amount) * 100, 100)
              : 0;

          return (
            <View
              key={cat.id}
              style={{ borderTopWidth: 0.4, borderTopColor: COLORS.dividerSoft }}
            >
              <Text style={{ color: COLORS.textPrimary, fontSize: 14 }}>
                {cat.title}
              </Text>
              <Text style={{ color: COLORS.textSecondary, fontSize: 12 }}>
                {currency(cat.spent)} /{" "}
                {cat.limit_amount > 0
                  ? currency(cat.limit_amount)
                  : "Sem limite"}
              </Text>
            </View>
          );
        })}
      </BlurView>
    </View>
  );
}

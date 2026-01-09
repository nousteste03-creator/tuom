import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { BlurView } from "expo-blur";
import Icon from "@/components/ui/Icon";
import { useRouter } from "expo-router";

const COLORS = {
  glass: "rgba(255,255,255,0.03)",
  textPrimary: "#FFFFFF",
  textSecondary: "rgba(255,255,255,0.60)",
  textMuted: "rgba(255,255,255,0.42)",
  dividerSoft: "rgba(255,255,255,0.06)",
};

type MonthlyBudgetSnapshot = {
  totalSpent: number;
  totalLimit: number;
  percentUsed: number; // 0–1
  categories: Array<{
    id: string;
    title: string;
    spent: number;
    limit: number;
    percent: number; // 0–1
  }>;
  subscriptions: { total: number };
};

type Props = { snapshot?: Partial<MonthlyBudgetSnapshot> };

export default function MonthlyBudgetCard({ snapshot }: Props) {
  const router = useRouter();

  const safeSnapshot: MonthlyBudgetSnapshot = {
    totalSpent: snapshot?.totalSpent || 0,
    totalLimit: snapshot?.totalLimit || 0,
    percentUsed: snapshot?.percentUsed ?? 0,
    categories: snapshot?.categories || [],
    subscriptions: snapshot?.subscriptions || { total: 0 },
  };

  const currency = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);

  const pctMes = Math.min(safeSnapshot.percentUsed, 100);

  return (
    <View style={{ borderRadius: 26, overflow: "hidden", marginBottom: 24 }}>
      <BlurView
        intensity={14}
        tint="dark"
        style={{
          padding: 20,
          backgroundColor: "rgba(5,5,5,0.9)",
          borderRadius: 26,
          borderWidth: 0.5,
          borderColor: "rgba(255,255,255,0.05)",
          gap: 20,
        }}
      >
        {/* HEADER */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={{ color: COLORS.textPrimary, fontSize: 19, fontWeight: "700" }}>
              Orçamento do mês
            </Text>
            <Text style={{ color: COLORS.textSecondary, fontSize: 13, marginTop: 2 }}>
              Categorias + assinaturas automáticas.
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => router.push("/finance/budget")}
            style={{ width: 34, height: 34, borderRadius: 17, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.glass }}
          >
            <Icon name="refresh" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* TOTAL */}
        <View style={{ gap: 10 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <View>
              <Text style={{ color: COLORS.textMuted, fontSize: 11 }}>Gasto no mês</Text>
              <Text style={{ color: COLORS.textPrimary, fontSize: 16, fontWeight: "600" }}>
                {currency(safeSnapshot.totalSpent)}
              </Text>
            </View>

            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ color: COLORS.textMuted, fontSize: 11 }}>Limite definido</Text>
              <Text style={{ color: COLORS.textPrimary, fontSize: 16, fontWeight: "600" }}>
                {currency(safeSnapshot.totalLimit)}
              </Text>
            </View>
          </View>

          {/* BARRA */}
          <View style={{ width: "100%", height: 4, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.04)", overflow: "hidden", marginTop: 4 }}>
            <View
              style={{
                width: `${pctMes}%`,
                height: "100%",
                backgroundColor:
                  pctMes < 70
                    ? "rgba(94,255,185,0.8)"
                    : pctMes < 100
                    ? "rgba(255,255,140,0.85)"
                    : "rgba(255,120,120,0.9)",
              }}
            />
          </View>

          <Text style={{ color: COLORS.textSecondary, fontSize: 12 }}>
            {safeSnapshot.totalLimit > 0 ? `${pctMes.toFixed(0)}% do limite utilizado` : "Nenhum limite definido para este mês"}
          </Text>
        </View>

        {/* CATEGORIAS */}
        <View>
          {safeSnapshot.categories.map((cat, idx) => {
            const pctCat = Math.min(cat.percent, 100);

            return (
              <View
                key={cat.id}
                style={{ paddingVertical: 10, borderTopWidth: idx === 0 ? 0.5 : 0.4, borderTopColor: COLORS.dividerSoft }}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <View>
                    <Text style={{ color: COLORS.textPrimary, fontSize: 14, fontWeight: "600" }}>{cat.title}</Text>
                    <Text style={{ color: COLORS.textSecondary, fontSize: 12, marginTop: 2 }}>
                      {currency(cat.spent)} / {cat.limit > 0 ? currency(cat.limit) : "Sem limite"}
                    </Text>
                  </View>
                  <Text style={{ color: COLORS.textSecondary, fontSize: 12 }}>{cat.limit > 0 ? `${pctCat.toFixed(0)}%` : "-"}</Text>
                </View>

                <View style={{ marginTop: 6, height: 3, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.04)", overflow: "hidden" }}>
                  <View
                    style={{
                      width: `${pctCat}%`,
                      height: "100%",
                      backgroundColor:
                        pctCat < 70
                          ? "rgba(94,255,185,0.8)"
                          : pctCat < 100
                          ? "rgba(255,255,140,0.9)"
                          : "rgba(255,120,120,0.9)",
                    }}
                  />
                </View>
              </View>
            );
          })}

          {/* ASSINATURAS */}
          <View style={{ paddingTop: 12, borderTopWidth: 0.5, borderTopColor: COLORS.dividerSoft }}>
            <Text style={{ color: COLORS.textPrimary, fontSize: 14, fontWeight: "600" }}>Assinaturas</Text>
            <Text style={{ marginTop: 4, color: COLORS.textSecondary, fontSize: 12 }}>
              {currency(safeSnapshot.subscriptions.total)}
            </Text>
          </View>
        </View>
      </BlurView>
    </View>
  );
}

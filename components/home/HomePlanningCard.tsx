"use client";

import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";

import Icon from "@/components/ui/Icon";
import { usePlanningSnapshot } from "@/hooks/usePlanningSnapshot";

const TABS = ["Metas", "Dívidas", "Investimentos", "Receitas"] as const;
type TabType = (typeof TABS)[number];

function formatCurrency(value?: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value ?? 0);
}

export default function HomePlanningCard() {
  const router = useRouter();
  const { snapshot, loading } = usePlanningSnapshot();
  const [activeTab, setActiveTab] = useState<TabType>("Metas");

  const panel = snapshot?.panel;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push("/goals")}
      style={{ marginHorizontal: 16, borderRadius: 20, overflow: "hidden" }}
      disabled={!snapshot}
    >
      <BlurView
        intensity={40}
        tint="dark"
        style={{
          padding: 20,
          borderRadius: 20,
          backgroundColor: "rgba(255,255,255,0.05)",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.1)",
        }}
      >
        {/* HEADER */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
          <Icon name="calendar-outline" size={16} color="#D1D5DB" />
          <Text
            style={{
              color: "#D1D5DB",
              fontSize: 13,
              fontWeight: "500",
              marginLeft: 6,
            }}
          >
            Planejamento
          </Text>
        </View>

        {/* LOADING STATE */}
        {loading && !snapshot && (
          <View style={{ paddingVertical: 24 }}>
            <ActivityIndicator color="#FFFFFF" />
          </View>
        )}

        {/* CONTENT */}
        {snapshot && panel && (
          <>
            {/* TABS */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 12 }}
            >
              {TABS.map((tab) => (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  style={{ marginRight: 16 }}
                >
                  <Text
                    style={{
                      color: activeTab === tab ? "#FFFFFF" : "#D1D5DB",
                      fontWeight: activeTab === tab ? "700" : "500",
                      fontSize: 13,
                    }}
                  >
                    {tab}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* TAB CONTENT */}
            <View style={{ marginBottom: 12 }}>
              {activeTab === "Metas" && (
                <Row
                  label="Metas em andamento"
                  value={formatCurrency(panel.goalsOutflow)}
                />
              )}

              {activeTab === "Dívidas" && (
                <Row
                  label="Dívidas (parcelas do mês)"
                  value={formatCurrency(panel.debtOutflow)}
                />
              )}

              {activeTab === "Investimentos" && (
                <Row
                  label="Investimentos programados"
                  value={formatCurrency(panel.investmentOutflow)}
                />
              )}

              {activeTab === "Receitas" && (
                <Row
                  label="Receitas mensais"
                  value={formatCurrency(panel.incomeTotal)}
                />
              )}
            </View>

            {/* RESUMO GERAL */}
            <View
              style={{
                marginTop: 8,
                borderTopWidth: 1,
                borderColor: "rgba(255,255,255,0.1)",
                paddingTop: 12,
                gap: 6,
              }}
            >
              <Row
                label="Total Receitas"
                value={formatCurrency(panel.incomeTotal)}
              />
              <Row
                label="Total Gastos"
                value={formatCurrency(panel.committedBalance)}
              />
              <Row
                label="Saldo Líquido"
                value={formatCurrency(panel.freeBalance)}
              />
            </View>
          </>
        )}
      </BlurView>
    </TouchableOpacity>
  );
}

/* ---------- UI HELPERS ---------- */

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Text style={{ color: "#D1D5DB", fontSize: 12, flexShrink: 1 }}>
        {label}
      </Text>
      <Text
        style={{
          color: "#FFFFFF",
          fontSize: 14,
          fontWeight: "700",
          textAlign: "right",
          flexShrink: 1,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

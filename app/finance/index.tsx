"use client";

import React from "react";
import { View, ScrollView, ActivityIndicator, Text } from "react-native";
import { useFinanceSnapshot } from "@/hooks/useFinanceSnapshot";

import FinanceOverviewPanel from "@/components/app/finance/FinanceOverviewPanel";
import MonthlyBudgetCard from "@/components/app/finance/MonthlyBudgetCard";

export default function FinanceScreen() {
  const { snapshot, loading } = useFinanceSnapshot();

  // Loading inicial
  if (loading || !snapshot) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#111827",
        }}
      >
        <ActivityIndicator size="large" color="#A7F3D0" />
        <Text style={{ color: "#9CA3AF", marginTop: 12 }}>
          Carregando informações financeiras...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{ paddingVertical: 24, paddingHorizontal: 16 }}
      style={{ flex: 1, backgroundColor: "#111827" }}
    >
      {/* Painel de Visão Geral */}
      <FinanceOverviewPanel snapshot={snapshot} />

      {/* Card de Orçamento Mensal */}
      <MonthlyBudgetCard snapshot={snapshot.budget} />

      {/* Exemplo opcional: exibir metas separadas */}
      {snapshot.budget.goalsTotal > 0 && (
        <View style={{ marginTop: 24, padding: 16, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.03)" }}>
          <Text style={{ color: "#FFFFFF", fontWeight: "600", fontSize: 16 }}>
            Total comprometido com metas
          </Text>
          <Text style={{ color: "#A7F3D0", marginTop: 4, fontSize: 14 }}>
            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(snapshot.budget.goalsTotal)}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

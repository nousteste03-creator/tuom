// components/app/home/HomePlanningCard.tsx
import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import Icon from "@/components/ui/Icon";
import { useGoals } from "@/hooks/useGoals";
import { useIncomeSources } from "@/hooks/useIncomeSources";

const TABS = ["Metas", "Dívidas", "Investimentos", "Receitas"] as const;
type TabType = typeof TABS[number];

export default function HomePlanningCard() {
  const router = useRouter();
  const { goals, debts, investments, primaryGoal } = useGoals();
  const { incomeSources, totalMonthlyIncome } = useIncomeSources(); // assume hook retorna total mensal
  const [activeTab, setActiveTab] = useState<TabType>("Metas");

  // Funções de cálculo por aba
  const monthlyGoalsOutflow = goals.reduce((acc, g) => acc + (g.installments?.reduce((s, i) => s + (i.amount || 0), 0) || 0), 0);
  const monthlyDebtOutflow = debts.reduce((acc, d) => acc + (d.installments?.reduce((s, i) => s + (i.amount || 0), 0) || 0), 0);
  const monthlyInvestmentsOutflow = investments.reduce((acc, inv) => acc + (inv.installments?.reduce((s, i) => s + (i.amount || 0), 0) || 0), 0);
  const monthlyExpenses = monthlyGoalsOutflow + monthlyDebtOutflow + monthlyInvestmentsOutflow;
  const netBalance = totalMonthlyIncome - monthlyExpenses;

  // Render por aba
  const renderTabContent = () => {
    switch (activeTab) {
      case "Metas":
        return (
          <View style={{ gap: 8 }}>
            {goals.length ? goals.map((g) => (
              <Row key={g.id} label={g.title} value={`R$ ${g.currentAmount.toFixed(2)} / R$ ${g.targetAmount.toFixed(2)} (${g.progressPercent.toFixed(0)}%)`} />
            )) : <Text style={{ color: "#D1D5DB", fontSize: 12 }}>Nenhuma meta registrada</Text>}
          </View>
        );
      case "Dívidas":
        return (
          <View style={{ gap: 8 }}>
            {debts.length ? debts.map((d) => (
              <Row key={d.id} label={d.title} value={`R$ ${d.remainingAmount.toFixed(2)} restantes`} />
            )) : <Text style={{ color: "#D1D5DB", fontSize: 12 }}>Nenhuma dívida registrada</Text>}
          </View>
        );
      case "Investimentos":
        return (
          <View style={{ gap: 8 }}>
            {investments.length ? investments.map((inv) => (
              <Row key={inv.id} label={inv.title} value={`R$ ${inv.currentAmount.toFixed(2)} (${inv.progressPercent.toFixed(0)}%)`} />
            )) : <Text style={{ color: "#D1D5DB", fontSize: 12 }}>Nenhum investimento registrado</Text>}
          </View>
        );
      case "Receitas":
        return (
          <View style={{ gap: 8 }}>
            {incomeSources.length ? incomeSources.map((inc) => (
              <Row key={inc.id} label={inc.name} value={`R$ ${inc.amount.toFixed(2)}`} />
            )) : <Text style={{ color: "#D1D5DB", fontSize: 12 }}>Nenhuma receita registrada</Text>}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push("/goals")}
      style={{ marginHorizontal: 16, borderRadius: 20, overflow: "hidden" }}
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
          <Text style={{ color: "#D1D5DB", fontSize: 13, fontWeight: "500", marginLeft: 6 }}>Planejamento</Text>
        </View>

        {/* TABS */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
          {TABS.map((tab) => (
            <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} style={{ marginRight: 16 }}>
              <Text style={{
                color: activeTab === tab ? "#FFFFFF" : "#D1D5DB",
                fontWeight: activeTab === tab ? "700" : "500",
                fontSize: 13
              }}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* CONTEÚDO */}
        {renderTabContent()}

        {/* RESUMO GERAL */}
        <View style={{ marginTop: 16, borderTopWidth: 1, borderColor: "rgba(255,255,255,0.1)", paddingTop: 12 }}>
          <Row label="Total Receitas" value={`R$ ${totalMonthlyIncome.toFixed(2)}`} />
          <Row label="Total Gastos" value={`R$ ${monthlyExpenses.toFixed(2)}`} />
          <Row label="Saldo Líquido" value={`R$ ${netBalance.toFixed(2)}`} />
        </View>
      </BlurView>
    </TouchableOpacity>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
      <Text style={{ color: "#D1D5DB", fontSize: 12 }}>{label}</Text>
      <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "700" }}>{value}</Text>
    </View>
  );
}

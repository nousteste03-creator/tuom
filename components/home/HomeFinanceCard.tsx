"use client";

import { View, Text, TouchableOpacity } from "react-native";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import Icon from "@/components/ui/Icon";
import { useFinanceSnapshot } from "@/hooks/useFinanceSnapshot";

/* -------------------------------------------------------
   HELPERS
-------------------------------------------------------- */
function safeNumber(value: any): number {
  if (typeof value === "number" && !isNaN(value)) return value;
  return 0;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

/* -------------------------------------------------------
   COMPONENT
-------------------------------------------------------- */
export default function HomeFinanceCard() {
  const router = useRouter();
  const { snapshot } = useFinanceSnapshot();

  // Fallbacks
  const panel = snapshot?.panel ?? {
    incomeTotal: 0,
    committedBalance: 0,
    freeBalance: 0,
    annualIncomeProjection: 0,
    annualOutflowProjection: 0,
  };

  const variableBudget = snapshot?.budget?.variable ?? {
    planned: 0,
    used: 0,
  };

  const monthlyIncome = safeNumber(panel.incomeTotal);
  const monthlyExpenses = safeNumber(panel.committedBalance);
  const monthlyBalance = safeNumber(panel.freeBalance);

  const annualIncome = safeNumber(panel.annualIncomeProjection);
  const annualExpenses = safeNumber(panel.annualOutflowProjection);

  const plannedVariable = safeNumber(variableBudget.planned);
  const usedVariable = safeNumber(variableBudget.used);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push("/finance")}
      style={{ flex: 1, borderRadius: 20, overflow: "hidden" }}
    >
      <BlurView
        intensity={40}
        tint="dark"
        style={{
          padding: 16,
          backgroundColor: "rgba(255,255,255,0.05)",
          borderRadius: 20,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.1)",
          justifyContent: "space-between",
        }}
      >
        {/* ================= HEADER ================= */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Icon name="wallet-outline" size={16} color="#D1D5DB" />
          <Text
            style={{
              color: "#D1D5DB",
              fontSize: 13,
              fontWeight: "500",
              flex: 1,
              flexWrap: "wrap",
            }}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            Finanças
          </Text>
        </View>

        {/* ================= PROJEÇÃO ================= */}
        <View style={{ marginTop: 14, gap: 8 }}>
          <Row label="Entradas (mês)" value={formatCurrency(monthlyIncome)} />
          <Row label="Saídas (mês)" value={formatCurrency(monthlyExpenses)} />
          <Row
            label="Orçamento"
            value={`${formatCurrency(usedVariable)} / ${formatCurrency(
              plannedVariable
            )}`}
          />
        </View>

        {/* ================= VALOR PRINCIPAL ================= */}
        <View style={{ marginTop: 14, alignItems: "flex-start" }}>
          <Text
            style={{
              color: monthlyBalance >= 0 ? "#dbe0de" : "#FCA5A5",
              fontSize: 18,
              fontWeight: "700",
            }}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {formatCurrency(monthlyBalance)}
          </Text>

          <Text
            style={{
              color: "#D1D5DB",
              fontSize: 12,
              marginTop: 2,
            }}
          >
            saldo projetado do mês
          </Text>

          <Text
            style={{
              color: "#6B7280",
              fontSize: 11,
              marginTop: 4,
            }}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            Ano: {formatCurrency(annualIncome)} • {formatCurrency(annualExpenses)}
          </Text>
        </View>
      </BlurView>
    </TouchableOpacity>
  );
}

/* ----------------------- COMPONENT ROW ----------------------- */
function Row({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Text
        style={{
          color: "#9CA3AF",
          fontSize: 12,
          flex: 1,
          flexWrap: "wrap",
        }}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {label}
      </Text>
      <Text
        style={{
          color: "#f9fbff",
          fontSize: 12,
          fontWeight: "500",
          textAlign: "right",
          flexShrink: 1,
        }}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {value}
      </Text>
    </View>
  );
}

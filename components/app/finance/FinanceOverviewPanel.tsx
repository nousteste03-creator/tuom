import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { BlurView } from "expo-blur";

import Icon from "@/components/ui/Icon";
import { FinanceSnapshot } from "@/hooks/useFinanceSnapshot";

type Mode = "geral" | "compromissos" | "planejamento";

const MODES: { key: Mode; label: string }[] = [
  { key: "geral", label: "Visão Geral" },
  { key: "compromissos", label: "Compromissos" },
  { key: "planejamento", label: "Planejamento" },
];

type Props = {
  snapshot: FinanceSnapshot | null;
};

export default function FinanceOverviewPanel({ snapshot }: Props) {
  const [mode, setMode] = useState<Mode>("geral");

  const panel = snapshot?.panel ?? {
    incomeTotal: 0,
    expenseTotal: 0,
    fixedExpenseTotal: 0,
    investmentOutflow: 0,
    debtOutflow: 0,
    goalsOutflow: 0,
    committedBalance: 0,
    freeBalance: 0,
    annualIncomeProjection: 0,
    annualOutflowProjection: 0,
  };

  const budget = snapshot?.budget ?? {
    totalSpent: 0,
    totalLimit: 0,
    percentUsed: 0,
    categories: [],
    subscriptions: { total: 0 },
    goalsTotal: 0,
  };

  const currency = (v: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(isNaN(v) ? 0 : v);

  return (
    <View style={{ marginBottom: 24 }}>
      <BlurView
        intensity={45}
        tint="dark"
        style={{
          borderRadius: 26,
          padding: 22,
          backgroundColor: "rgba(0,0,0,0.85)",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        {/* HEADER */}
        <View style={{ marginBottom: 18 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
            <Icon name="wallet-outline" size={16} color="#E5E7EB" />
            <Text
              style={{
                color: "#E5E7EB",
                fontSize: 13,
                marginLeft: 6,
                fontWeight: "500",
              }}
            >
              Posição Financeira
            </Text>
          </View>

          <Text style={{ color: "#9CA3AF", fontSize: 12 }}>
            Resumo financeiro mensal com base nos seus compromissos e planejamento
          </Text>
        </View>

        {/* TABS */}
        <View style={{ flexDirection: "row", marginBottom: 20 }}>
          {MODES.map((m) => (
            <TouchableOpacity key={m.key} onPress={() => setMode(m.key)} style={{ marginRight: 20 }}>
              <Text
                style={{
                  color: mode === m.key ? "#FFFFFF" : "#9CA3AF",
                  fontWeight: mode === m.key ? "700" : "500",
                  fontSize: 13,
                }}
              >
                {m.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* VISÃO GERAL */}
        {mode === "geral" && (
          <View style={{ gap: 14 }}>
            <Metric label="Receitas mensais" value={currency(panel.incomeTotal)} />
            <Metric
              label="Total comprometido no mês"
              value={currency(panel.committedBalance)}
              negative
            />
            <Divider />
            <Metric
              label="Saldo livre estimado"
              value={currency(panel.freeBalance)}
              highlight
            />
          </View>
        )}

        {/* COMPROMISSOS */}
        {mode === "compromissos" && (
          <View style={{ gap: 14 }}>
            <SectionTitle>Gastos fixos</SectionTitle>
            <Metric
              label="Assinaturas e despesas recorrentes"
              value={currency(panel.fixedExpenseTotal)}
            />

            <Divider />

            <SectionTitle>Gastos variáveis</SectionTitle>
            <Metric
              label="Orçamento mensal planejado"
              value={currency(budget.totalLimit)}
            />
            <Metric
              label="Gasto variável realizado"
              value={currency(budget.totalSpent)}
            />
          </View>
        )}

        {/* PLANEJAMENTO */}
        {mode === "planejamento" && (
          <View style={{ gap: 14 }}>
            <SectionTitle>Planejamento financeiro ativo</SectionTitle>
            <Metric label="Metas em andamento" value={currency(panel.goalsOutflow)} />
            <Metric label="Dívidas (parcelas do mês)" value={currency(panel.debtOutflow)} />
            <Metric
              label="Investimentos programados"
              value={currency(panel.investmentOutflow)}
            />
          </View>
        )}
      </BlurView>
    </View>
  );
}

/* ---------- UI HELPERS ---------- */

function Metric({
  label,
  value,
  highlight,
  negative,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  negative?: boolean;
}) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
      <Text style={{ color: "#9CA3AF", fontSize: 12 }}>{label}</Text>
      <Text
        style={{
          color: highlight ? "#A7F3D0" : negative ? "#FCA5A5" : "#FFFFFF",
          fontSize: 16,
          fontWeight: "700",
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <Text style={{ color: "#E5E7EB", fontSize: 13, fontWeight: "600" }}>
      {children}
    </Text>
  );
}

function Divider() {
  return (
    <View
      style={{
        height: 1,
        backgroundColor: "rgba(255,255,255,0.08)",
        marginVertical: 6,
      }}
    />
  );
}

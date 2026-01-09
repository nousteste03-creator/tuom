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

  // Fallback caso snapshot ainda não esteja carregado
  const { panel, budget } = snapshot || {
    panel: {
      incomeTotal: 0,
      expenseTotal: 0,
      fixedExpenseTotal: 0,
      investmentOutflow: 0,
      debtOutflow: 0,
      committedBalance: 0,
      freeBalance: 0,
      annualIncomeProjection: 0,
      annualOutflowProjection: 0,
    },
    budget: {
      totalSpent: 0,
      totalLimit: 0,
      percentUsed: 0,
      categories: [],
      subscriptions: { total: 0 },
    },
  };

  const currency = (v: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(v || 0);

  return (
    <View style={{ marginHorizontal: 0, marginBottom: 24 }}>
      <BlurView
        intensity={45}
        tint="dark"
        style={{
          borderRadius: 26,
          padding: 22,
          backgroundColor: "rgba(255,255,255,0.035)",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        {/* HEADER */}
        <View style={{ marginBottom: 18 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 6,
            }}
          >
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
            Visão consolidada do seu mês financeiro
          </Text>
        </View>

        {/* TABS */}
        <View style={{ flexDirection: "row", marginBottom: 20 }}>
          {MODES.map((m) => (
            <TouchableOpacity
              key={m.key}
              onPress={() => setMode(m.key)}
              style={{ marginRight: 20 }}
            >
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
            <Metric
              label="Receitas mensais"
              value={currency(panel.incomeTotal)}
            />

            <Metric
              label="Gastos comprometidos"
              value={currency(panel.committedBalance)}
              negative
            />

            <Divider />

            <Metric
              label="Saldo disponível"
              value={currency(panel.freeBalance)}
              highlight
            />
          </View>
        )}

        {/* COMPROMISSOS */}
        {mode === "compromissos" && (
          <View style={{ gap: 14 }}>
            <SectionTitle>Despesas recorrentes</SectionTitle>

            <Metric
              label="Contas fixas e assinaturas"
              value={currency(panel.fixedExpenseTotal)}
            />

            <Divider />

            <SectionTitle>Orçamento mensal</SectionTitle>

            <Metric
              label="Limite definido no mês"
              value={currency(budget.totalLimit)}
            />
          </View>
        )}

        {/* PLANEJAMENTO */}
        {mode === "planejamento" && (
          <View style={{ gap: 14 }}>
            <SectionTitle>Construção financeira</SectionTitle>

            <Metric
              label="Metas"
              value={currency(
                panel.committedBalance -
                  panel.fixedExpenseTotal -
                  panel.expenseTotal -
                  panel.debtOutflow -
                  panel.investmentOutflow
              )}
            />

            <Metric label="Dívidas" value={currency(panel.debtOutflow)} />

            <Metric
              label="Investimentos"
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
          color: highlight
            ? "#A7F3D0"
            : negative
            ? "#FCA5A5"
            : "#FFFFFF",
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
    <Text
      style={{
        color: "#E5E7EB",
        fontSize: 13,
        fontWeight: "600",
      }}
    >
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

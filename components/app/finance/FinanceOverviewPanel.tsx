import { View, Text, Platform } from "react-native";

const brandFont = Platform.select({
  ios: "SF Pro Display",
  default: "System",
});

const COLORS = {
  card: "rgba(12,12,12,0.96)",
  glass: "rgba(255,255,255,0.03)",
  textPrimary: "#FFFFFF",
  textSecondary: "rgba(255,255,255,0.60)",
  textMuted: "rgba(255,255,255,0.42)",
  positive: "#A7F3D0",
  negative: "#FCA5A5",
};

type FinanceOverviewPanelProps = {
  /* Entradas */
  totalIncome: number;

  /* Saídas */
  totalExpenses: number;
  financialConstruction: number; // metas + investimentos
  financialDebts: number; // dívidas

  /* Saldos */
  freeBalance: number;
  committedBalance: number;

  /* Projeções */
  annualIncomeProjection: number;
  annualOutflowProjection: number;

  insight: string;
};

const currency = (v: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(v || 0);

export default function FinanceOverviewPanel({
  totalIncome,
  totalExpenses,
  financialConstruction,
  financialDebts,
  freeBalance,
  committedBalance,
  annualIncomeProjection,
  annualOutflowProjection,
  insight,
}: FinanceOverviewPanelProps) {
  return (
    <View
      style={{
        borderRadius: 24,
        backgroundColor: COLORS.card,
        padding: 18,
        gap: 18,
      }}
    >
      {/* HEADER */}
      <View>
        <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>
          Painel financeiro
        </Text>
        <Text
          style={{
            color: COLORS.textPrimary,
            fontSize: 22,
            fontWeight: "700",
            fontFamily: brandFont,
          }}
        >
          Visão geral do mês
        </Text>
      </View>

      {/* ENTRADAS / SAÍDAS */}
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <View>
          <Text style={{ color: COLORS.textMuted, fontSize: 11 }}>
            Entradas
          </Text>
          <Text style={{ color: COLORS.textPrimary, fontSize: 16 }}>
            {currency(totalIncome)}
          </Text>
        </View>

        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ color: COLORS.textMuted, fontSize: 11 }}>
            Saídas
          </Text>
          <Text style={{ color: COLORS.negative, fontSize: 16 }}>
            {currency(totalExpenses)}
          </Text>
        </View>
      </View>

      {/* CONSTRUÇÃO x DÍVIDAS */}
      <View
        style={{
          padding: 14,
          borderRadius: 18,
          backgroundColor: COLORS.glass,
          gap: 10,
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ color: COLORS.textSecondary, fontSize: 12 }}>
            Construção financeira
          </Text>
          <Text style={{ color: COLORS.positive, fontSize: 13 }}>
            {currency(financialConstruction)}
          </Text>
        </View>

        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ color: COLORS.textSecondary, fontSize: 12 }}>
            Dívidas financeiras
          </Text>
          <Text style={{ color: COLORS.negative, fontSize: 13 }}>
            {currency(financialDebts)}
          </Text>
        </View>
      </View>

      {/* SALDOS */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <View>
          <Text style={{ color: COLORS.textMuted, fontSize: 11 }}>
            Saldo livre
          </Text>
          <Text
            style={{
              color: freeBalance >= 0 ? COLORS.positive : COLORS.negative,
              fontSize: 16,
              fontWeight: "600",
            }}
          >
            {currency(freeBalance)}
          </Text>
        </View>

        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ color: COLORS.textMuted, fontSize: 11 }}>
            Saldo comprometido
          </Text>
          <Text
            style={{
              color: COLORS.textSecondary,
              fontSize: 16,
              fontWeight: "600",
            }}
          >
            {currency(committedBalance)}
          </Text>
        </View>
      </View>

      {/* PROJEÇÕES */}
      <View
        style={{
          padding: 14,
          borderRadius: 18,
          backgroundColor: COLORS.glass,
          gap: 8,
        }}
      >
        <Text style={{ color: COLORS.textMuted, fontSize: 11 }}>
          Projeção anual
        </Text>

        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ color: COLORS.textSecondary, fontSize: 12 }}>
            Recebimentos
          </Text>
          <Text style={{ color: COLORS.textPrimary, fontSize: 13 }}>
            {currency(annualIncomeProjection)}
          </Text>
        </View>

        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ color: COLORS.textSecondary, fontSize: 12 }}>
            Saídas + dívidas
          </Text>
          <Text style={{ color: COLORS.textPrimary, fontSize: 13 }}>
            {currency(annualOutflowProjection)}
          </Text>
        </View>
      </View>

      {/* INSIGHT */}
      <View
        style={{
          padding: 14,
          borderRadius: 18,
          backgroundColor: "rgba(0,0,0,0.85)",
          borderWidth: 0.5,
          borderColor: "rgba(148,163,184,0.35)",
        }}
      >
        <Text style={{ color: COLORS.textPrimary, fontSize: 12 }}>
          {insight}
        </Text>
      </View>
    </View>
  );
}

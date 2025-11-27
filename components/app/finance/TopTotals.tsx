// components/app/finance/TopTotals.tsx
import { View, Text } from "react-native";
import { BlurView } from "expo-blur";

type TopTotalsProps = {
  monthlySubscriptions: number;
  monthlyPersonal: number;
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

export default function TopTotals({
  monthlySubscriptions,
  monthlyPersonal,
}: TopTotalsProps) {
  const combined = monthlySubscriptions + monthlyPersonal;
  const annual = combined * 12;

  return (
    <View
      style={{
        borderRadius: 22,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
      }}
    >
      <BlurView
        intensity={26}
        tint="dark"
        style={{
          padding: 16,
        }}
      >
        {/* TÍTULO */}
        <Text
          style={{
            color: "#9CA3AF",
            fontSize: 12,
            marginBottom: 8,
          }}
        >
          Panorama geral
        </Text>

        {/* LINHA PRINCIPAL */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: 12,
            gap: 12,
          }}
        >
          {/* Total mensal (geral) */}
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: "#6B7280",
                fontSize: 11,
                marginBottom: 2,
              }}
            >
              Total mensal (geral)
            </Text>
            <Text
              style={{
                color: "#F9FAFB",
                fontSize: 18,
                fontWeight: "700",
              }}
            >
              {formatCurrency(combined)}
            </Text>
          </View>

          {/* Projeção anual */}
          <View
            style={{
              flex: 1,
              alignItems: "flex-end",
            }}
          >
            <Text
              style={{
                color: "#6B7280",
                fontSize: 11,
                marginBottom: 2,
              }}
            >
              Projeção anual
            </Text>
            <Text
              style={{
                color: "#E5E7EB",
                fontSize: 16,
                fontWeight: "600",
              }}
            >
              {formatCurrency(annual)}
            </Text>
          </View>
        </View>

        {/* LINHA — Assinaturas e Gastos pessoais */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            gap: 12,
            marginTop: 4,
          }}
        >
          {/* Assinaturas */}
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: "#6B7280",
                fontSize: 11,
                marginBottom: 2,
              }}
            >
              Assinaturas
            </Text>
            <Text
              style={{
                color: "#F97373",
                fontSize: 14,
                fontWeight: "600",
              }}
            >
              {formatCurrency(monthlySubscriptions)}
            </Text>
          </View>

          {/* Gastos pessoais — CORRIGIDO para ficar no canto direito */}
          <View
            style={{
              flex: 1,
              alignItems: "flex-end",
            }}
          >
            <Text
              style={{
                color: "#6B7280",
                fontSize: 11,
                marginBottom: 2,
              }}
            >
              Gastos pessoais
            </Text>
            <Text
              style={{
                color: "#93C5FD",
                fontSize: 14,
                fontWeight: "600",
              }}
            >
              {formatCurrency(monthlyPersonal)}
            </Text>
          </View>
        </View>
      </BlurView>
    </View>
  );
}

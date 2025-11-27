// components/app/finance/MonthSummaryCard.tsx
import { View, Text } from "react-native";
import { BlurView } from "expo-blur";
import { TimelineMonth } from "@/app/subscriptions/finance";
import RowValue from "./RowValue";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

export default function MonthSummaryCard({ month }: { month: TimelineMonth }) {
  const statusLabel =
    month.status === "alert"
      ? "Alerta"
      : month.status === "attention"
      ? "Atenção"
      : "Saudável";

  const statusColor =
    month.status === "alert"
      ? "#FCA5A5"
      : month.status === "attention"
      ? "#FACC15"
      : "#4ADE80";

  const resultLabel =
    month.savings >= 0 ? "Superávit" : "Déficit";

  const resultColor = month.savings >= 0 ? "#4ADE80" : "#FCA5A5";

  return (
    <View
      style={{
        borderRadius: 22,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.10)",
      }}
    >
      <BlurView intensity={32} tint="dark" style={{ padding: 16 }}>
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 12,
            alignItems: "center",
          }}
        >
          <View>
            <Text style={{ color: "#9CA3AF", fontSize: 12 }}>Panorama do mês</Text>
            <Text
              style={{
                color: "#FFF",
                fontSize: 16,
                fontWeight: "600",
                textTransform: "capitalize",
              }}
            >
              {month.label} {month.year}
            </Text>
          </View>

          <View
            style={{
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: "rgba(150,150,150,0.4)",
              backgroundColor: "rgba(15,15,15,0.9)",
            }}
          >
            <Text
              style={{
                color: statusColor,
                fontSize: 11,
                fontWeight: "600",
              }}
            >
              {statusLabel}
            </Text>
          </View>
        </View>

        {/* Valores */}
        <View
          style={{
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "rgba(40,40,40,0.8)",
            backgroundColor: "rgba(15,15,15,0.9)",
            padding: 12,
            marginBottom: 10,
            gap: 8,
          }}
        >
          <RowValue
            label="Receitas"
            value={formatCurrency(month.income)}
            color="#E5E7EB"
          />

          <RowValue
            label="Despesas"
            value={formatCurrency(month.expense)}
            color="#E5E7EB"
          />

          <RowValue
            label={resultLabel}
            value={formatCurrency(Math.abs(month.savings))}
            color={resultColor}
          />
        </View>

        <Text
          style={{
            color: "#9CA3AF",
            fontSize: 12,
            lineHeight: 18,
          }}
        >
          {month.message}
        </Text>
      </BlurView>
    </View>
  );
}

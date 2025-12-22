// components/app/home/HomeFinanceCard.tsx
import { View, Text, TouchableOpacity } from "react-native";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import Icon from "@/components/ui/Icon";
import { useFinance } from "@/hooks/useFinance";

/* -------------------------------------------------------
   HELPERS
-------------------------------------------------------- */
function safeNumber(value: any): number {
  if (typeof value === "number" && !isNaN(value)) return value;
  return 0;
}

function formatCurrency(value: number, short = false) {
  if (short) {
    return value >= 1000
      ? `R$ ${(value / 1000).toFixed(1)}k`
      : `R$ ${value.toFixed(0)}`;
  }
  return `R$ ${value.toFixed(2)}`;
}

/* -------------------------------------------------------
   COMPONENT
-------------------------------------------------------- */
export default function HomeFinanceCard() {
  const router = useRouter();
  const finance = useFinance();

  /**
   * 🔒 CONTRATO
   * O Finance já sabe calcular:
   * - projeção mensal de entrada
   * - projeção mensal de saída
   * - totais anuais
   */
  const monthlyIncome = safeNumber(finance?.monthlyIncome);
  const monthlyExpenses = safeNumber(finance?.monthlyExpenses);
  const annualIncome = safeNumber(finance?.annualIncome);
  const annualExpenses = safeNumber(finance?.annualExpenses);

  const monthlyBalance = monthlyIncome - monthlyExpenses;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push("/finance")}
      style={{
        flex: 1,
        borderRadius: 20,
        overflow: "hidden",
      }}
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
            }}
          >
            Finanças
          </Text>
        </View>

        {/* ================= PROJEÇÃO ================= */}
        <View style={{ marginTop: 12, gap: 6 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ color: "#9CA3AF", fontSize: 12 }}>
              Entradas (mês)
            </Text>
            <Text style={{ color: "#E5E7EB", fontSize: 12, fontWeight: "500" }}>
              {formatCurrency(monthlyIncome, true)}
            </Text>
          </View>

          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ color: "#9CA3AF", fontSize: 12 }}>
              Saídas (mês)
            </Text>
            <Text style={{ color: "#E5E7EB", fontSize: 12, fontWeight: "500" }}>
              {formatCurrency(monthlyExpenses, true)}
            </Text>
          </View>
        </View>

        {/* ================= VALOR PRINCIPAL ================= */}
        <View style={{ marginTop: 10 }}>
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 22,
              fontWeight: "700",
            }}
          >
            {formatCurrency(monthlyBalance)}
          </Text>

          <Text
            style={{
              color: "#D1D5DB",
              fontSize: 13,
              marginTop: 4,
            }}
          >
            saldo projetado do mês
          </Text>

          <Text
            style={{
              color: "#6B7280",
              fontSize: 12,
              marginTop: 6,
            }}
          >
            Ano: {formatCurrency(annualIncome)} • {formatCurrency(annualExpenses)}
          </Text>
        </View>
      </BlurView>
    </TouchableOpacity>
  );
}

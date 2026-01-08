import { View, Text } from "react-native";
import { BlurView } from "expo-blur";
import { useFinance } from "@/hooks/useFinance";

type Item = {
  label: string;
  value: number;
  color: string;
};

export default function FinanceAllocationChart() {
  const { outflows } = useFinance();

  if (!outflows) return null;

  const data: Item[] = [
    { label: "Orçamento", value: outflows.budget, color: "#93C5FD" },
    { label: "Assinaturas", value: outflows.subscriptions, color: "#A5B4FC" },
    { label: "Contas fixas", value: outflows.total, color: "#CBD5E1" },
    { label: "Metas", value: outflows.goals, color: "#6EE7B7" },
    { label: "Dívidas", value: outflows.debts, color: "#FCA5A5" },
    { label: "Investimentos", value: outflows.investments, color: "#FCD34D" },
  ].filter((i) => i.value > 0);

  const total = data.reduce((s, i) => s + i.value, 0);

  const currency = (v: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(v || 0);

  return (
    <View style={{ marginHorizontal: 16 }}>
      <BlurView
        intensity={40}
        tint="dark"
        style={{
          borderRadius: 24,
          padding: 20,
          backgroundColor: "rgba(255,255,255,0.03)",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        {/* HEADER */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: "#E5E7EB", fontSize: 13, fontWeight: "600" }}>
            Distribuição do mês
          </Text>
          <Text style={{ color: "#9CA3AF", fontSize: 12 }}>
            Como seu capital está alocado
          </Text>
        </View>

        {/* BARRAS */}
        <View style={{ gap: 14 }}>
          {data.map((item) => {
            const pct = (item.value / total) * 100;

            return (
              <View key={item.label}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <Text style={{ color: "#D1D5DB", fontSize: 12 }}>
                    {item.label}
                  </Text>
                  <Text style={{ color: "#FFFFFF", fontSize: 12 }}>
                    {currency(item.value)}
                  </Text>
                </View>

                <View
                  style={{
                    height: 6,
                    borderRadius: 999,
                    backgroundColor: "rgba(255,255,255,0.08)",
                    overflow: "hidden",
                  }}
                >
                  <View
                    style={{
                      width: `${pct}%`,
                      height: "100%",
                      backgroundColor: item.color,
                      borderRadius: 999,
                    }}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

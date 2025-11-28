// components/app/finance/BudgetBlock.tsx
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useBudget } from "@/hooks/useBudget";

export default function BudgetBlock({ isPremium }: { isPremium: boolean }) {
  const router = useRouter();
  const {
    categories,
    getCategoryStatus,
  } = useBudget();

  if (!isPremium)
    return (
      <View
        style={{
          padding: 18,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.1)",
          backgroundColor: "rgba(255,255,255,0.04)",
        }}
      >
        <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "700" }}>
          Orçamento Avançado
        </Text>

        <Text style={{ color: "#9CA3AF", marginTop: 6 }}>
          Defina limites mensais por categoria e veja alertas em tempo real.
        </Text>

        <TouchableOpacity
          onPress={() => router.push("/premium")}
          style={{
            marginTop: 12,
            padding: 10,
            backgroundColor: "#FFF",
            borderRadius: 999,
          }}
        >
          <Text style={{ textAlign: "center", color: "#000", fontWeight: "700" }}>
            Assinar Premium
          </Text>
        </TouchableOpacity>
      </View>
    );

  return (
    <View
      style={{
        padding: 18,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
        backgroundColor: "rgba(255,255,255,0.04)",
      }}
    >
      <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "700" }}>
        Orçamento do mês
      </Text>

      {categories.map((cat) => {
        const s = getCategoryStatus(cat);

        const barColor =
          s.status === "ok"
            ? "#A7F3D0"
            : s.status === "warning"
            ? "#FDE68A"
            : "#FCA5A5";

        return (
          <View key={cat.id} style={{ marginTop: 12 }}>
            <Text
              style={{
                color: "#E5E7EB",
                fontSize: 14,
                marginBottom: 4,
                fontWeight: "500",
              }}
            >
              {cat.title}
            </Text>

            {/* Barra */}
            <View
              style={{
                width: "100%",
                height: 10,
                borderRadius: 6,
                backgroundColor: "rgba(255,255,255,0.1)",
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  width: `${s.pct * 100}%`,
                  height: "100%",
                  backgroundColor: barColor,
                }}
              />
            </View>

            <Text
              style={{
                color: "#9CA3AF",
                fontSize: 12,
                marginTop: 4,
              }}
            >
              {`Gasto: R$ ${s.spent.toLocaleString("pt-BR")} / Limite: R$ ${s.limit.toLocaleString(
                "pt-BR"
              )}`}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

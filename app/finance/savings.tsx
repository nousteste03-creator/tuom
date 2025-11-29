// app/finance/savings/index.tsx
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import Screen from "@/components/layout/Screen";
import Icon from "@/components/ui/Icon";
import { useSavings } from "@/hooks/useSavings";

export default function SavingsScreen() {
  const router = useRouter();
  const { entries, totalSaved, suggestion, loading } = useSavings();

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 140,
          gap: 26,
        }}
      >
        {/* HEADER */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View>
            <Text style={{ color: "#9CA3AF", fontSize: 13 }}>
              Ferramentas Avançadas
            </Text>

            <Text
              style={{
                color: "#FFF",
                fontSize: 26,
                fontWeight: "700",
                marginTop: 4,
              }}
            >
              Economia Automatizada
            </Text>

            <Text
              style={{
                color: "#4B5563",
                fontSize: 12,
                marginTop: 4,
              }}
            >
              Guardar nunca foi tão simples — powered by Pila.
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              padding: 8,
              backgroundColor: "rgba(255,255,255,0.06)",
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.10)",
            }}
          >
            <Icon name="close" color="#FFF" size={18} />
          </TouchableOpacity>
        </View>

        {/* PAINEL TOTAL */}
        <BlurView
          intensity={22}
          tint="dark"
          style={{
            padding: 20,
            borderRadius: 22,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.08)",
            backgroundColor: "rgba(15,15,15,0.35)",
            gap: 12,
          }}
        >
          <Text style={{ color: "#9CA3AF", fontSize: 13 }}>
            Total guardado
          </Text>

          <Text
            style={{
              color: "#FFF",
              fontSize: 34,
              fontWeight: "700",
              letterSpacing: 0.5,
            }}
          >
            R$ {totalSaved.toLocaleString("pt-BR")}
          </Text>

          <Text
            style={{
              color: "#A5B4FC",
              marginTop: 6,
              fontSize: 14,
            }}
          >
            Sugestão da Pila: guardar{" "}
            <Text style={{ fontWeight: "700" }}>R$ {suggestion}</Text>{" "}
            essa semana.
          </Text>
        </BlurView>

        {/* LISTA DE DEPÓSITOS */}
        <View style={{ gap: 14 }}>
          <Text style={{ color: "#FFF", fontSize: 17, fontWeight: "700" }}>
            Histórico de depósitos
          </Text>

          {entries.length === 0 && (
            <Text style={{ color: "#6B7280", fontSize: 13 }}>
              Nenhuma movimentação registrada ainda.
            </Text>
          )}

          {entries.map((e) => (
            <View
              key={e.id}
              style={{
                padding: 16,
                borderRadius: 16,
                backgroundColor: "rgba(255,255,255,0.04)",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.08)",
              }}
            >
              <Text
                style={{
                  color: "#FFF",
                  fontSize: 16,
                  fontWeight: "600",
                }}
              >
                R$ {Number(e.amount).toLocaleString("pt-BR")}
              </Text>

              <Text
                style={{
                  color: "#6B7280",
                  fontSize: 12,
                  marginTop: 4,
                }}
              >
                {new Date(e.date).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </Text>
            </View>
          ))}
        </View>

        {/* BOTÃO ADICIONAR */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push("/finance/savings/new-saving")}
          style={{
            padding: 14,
            borderRadius: 999,
            backgroundColor: "#FFF",
            marginTop: 18,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: "#000",
              fontWeight: "700",
              fontSize: 15,
            }}
          >
            Guardar dinheiro
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </Screen>
  );
}

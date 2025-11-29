import { View, Text, TouchableOpacity } from "react-native";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import Icon from "@/components/ui/Icon";
import { useBudget } from "@/hooks/useBudget";

interface Props {
  isPremium: boolean;
}

export default function BudgetBlock({ isPremium }: Props) {
  const router = useRouter();
  const { categories } = useBudget(); // apenas o necessário

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={
        isPremium ? () => router.push("/finance/budget") : undefined
      }
      style={{
        marginTop: 14,
        borderRadius: 24,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.07)",
        opacity: isPremium ? 1 : 0.55,
      }}
    >
      <BlurView
        intensity={22}
        tint="dark"
        style={{
          padding: 18,
          backgroundColor: "rgba(15,15,15,0.45)",
        }}
      >
        {/* HEADER */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 4,
          }}
        >
          <Text
            style={{
              color: "#FFF",
              fontSize: 16,
              fontWeight: "700",
            }}
          >
            Orçamento do mês
          </Text>

          {isPremium && (
            <Icon name="pie-chart-outline" size={18} color="#FFF" />
          )}
        </View>

        <Text
          style={{
            color: "#9CA3AF",
            fontSize: 12,
            marginBottom: isPremium ? 16 : 20,
          }}
        >
          Somatório das categorias criadas por você.
        </Text>

        {/* FREE */}
        {!isPremium && <LockedBudget router={router} />}

        {/* PREMIUM */}
        {isPremium && (
          <View style={{ gap: 18 }}>
            {/* Sem categorias */}
            {categories.length === 0 && (
              <Text style={{ color: "#6B7280", fontSize: 13 }}>
                Crie categorias na tela de orçamento.
              </Text>
            )}

            {/* Preview (até 3 categorias) */}
            {categories.slice(0, 3).map((cat) => {
              const spent = Number(cat.spent ?? 0);
              const limit = Number(cat.limit_amount ?? 0); // CORRETO
              const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;

              const barColor =
                pct < 70
                  ? "#A7F3D0"
                  : pct < 100
                  ? "#FDE68A"
                  : "#FCA5A5";

              return (
                <View key={cat.id}>
                  <Text
                    style={{
                      color: "#E5E7EB",
                      fontSize: 14,
                      marginBottom: 6,
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
                        width: `${pct}%`,
                        height: "100%",
                        backgroundColor: barColor,
                      }}
                    />
                  </View>

                  {/* Texto */}
                  <Text
                    style={{
                      color: "#9CA3AF",
                      fontSize: 12,
                      marginTop: 4,
                    }}
                  >
                    {`R$ ${spent.toLocaleString(
                      "pt-BR"
                    )} / R$ ${limit.toLocaleString("pt-BR")}`}
                  </Text>
                </View>
              );
            })}

            {/* Ver completo */}
            {categories.length > 0 && (
              <TouchableOpacity
                onPress={() => router.push("/finance/budget")}
                activeOpacity={0.7}
                style={{ marginTop: 6 }}
              >
                <Text
                  style={{
                    color: "#A5B4FC",
                    fontSize: 13,
                    textDecorationLine: "underline",
                  }}
                >
                  Ver orçamento completo
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </BlurView>
    </TouchableOpacity>
  );
}

/* ---------------------------------------------------
    FREE — Bloqueado
-----------------------------------------------------*/
function LockedBudget({ router }: { router: any }) {
  return (
    <View
      style={{
        paddingVertical: 10,
        paddingHorizontal: 4,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Icon name="lock-closed-outline" size={24} color="#9CA3AF" />

      <Text
        style={{
          color: "#E5E7EB",
          fontSize: 14,
          marginTop: 10,
          fontWeight: "600",
        }}
      >
        Recurso Premium
      </Text>

      <Text
        style={{
          color: "#9CA3AF",
          fontSize: 12,
          textAlign: "center",
          marginTop: 4,
          lineHeight: 17,
        }}
      >
        Defina limites por categoria e acompanhe seus gastos mensais.
      </Text>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => router.push("/premium")}
        style={{
          marginTop: 14,
          paddingVertical: 8,
          paddingHorizontal: 22,
          borderRadius: 999,
          backgroundColor: "#FFF",
        }}
      >
        <Text style={{ fontWeight: "600", fontSize: 13, color: "#000" }}>
          Assinar Premium
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// app/finance/net-worth/index.tsx
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import Screen from "@/components/layout/Screen";
import Icon from "@/components/ui/Icon";
import { useNetWorth } from "@/hooks/useNetWorth";

/* ============================================================
   Sparkline Apple Minimal – igual do FinanceScreen
============================================================ */
function MiniSparkline({ value }: { value: number }) {
  return (
    <View
      style={{
        width: "100%",
        height: 22,
        borderRadius: 10,
        backgroundColor: "rgba(255,255,255,0.05)",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <View
        style={{
          width:
            value > 2 ? "80%" : value < -2 ? "40%" : "60%",
          height: 3,
          backgroundColor:
            value > 2
              ? "rgba(94,255,185,0.85)"
              : value < -2
              ? "rgba(255,120,120,0.85)"
              : "rgba(255,255,255,0.45)",
          borderRadius: 999,
          marginLeft: 10,
        }}
      />
    </View>
  );
}

export default function NetWorthScreen() {
  const router = useRouter();
  const {
    items,
    netWorth,
    totalAssets,
    totalLiabilities,
    loading,
    monthGrowth, // <- se existir no seu hook (se não tiver, ignora)
  } = useNetWorth();

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 140,
          gap: 26,
        }}
      >
        {/* ======================================================
            HEADER
        ====================================================== */}
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
              Patrimônio Líquido
            </Text>

            <Text
              style={{
                color: "#4B5563",
                fontSize: 12,
                marginTop: 4,
              }}
            >
              Ativos, dívidas e evolução mensal.
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

        {/* ======================================================
            RESUMO PRINCIPAL
        ====================================================== */}
        <BlurView
          intensity={22}
          tint="dark"
          style={{
            padding: 18,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.08)",
            backgroundColor: "rgba(15,15,15,0.35)",
            gap: 12,
          }}
        >
          <Text style={{ color: "#9CA3AF", fontSize: 13 }}>
            Patrimônio atual
          </Text>

          <Text style={{ color: "#FFF", fontSize: 32, fontWeight: "700" }}>
            R$ {netWorth.toLocaleString("pt-BR")}
          </Text>

          <View style={{ marginTop: 6, gap: 4 }}>
            <Text style={{ color: "#A7F3D0", fontSize: 14 }}>
              Ativos — R$ {totalAssets.toLocaleString("pt-BR")}
            </Text>

            <Text style={{ color: "#FCA5A5", fontSize: 14 }}>
              Dívidas — R$ {totalLiabilities.toLocaleString("pt-BR")}
            </Text>
          </View>

          {/* Sparkline TUÖM Premium */}
          <MiniSparkline value={monthGrowth ?? 0} />
        </BlurView>

        {/* ======================================================
            LISTA DE ITENS
        ====================================================== */}
        <View style={{ gap: 14 }}>
          <Text style={{ color: "#FFF", fontSize: 17, fontWeight: "700" }}>
            Seus ativos e dívidas
          </Text>

          {items.length === 0 && (
            <Text style={{ color: "#6B7280", fontSize: 13 }}>
              Nenhum item registrado ainda.
            </Text>
          )}

          {items.map((i) => (
            <TouchableOpacity
              key={i.id}
              activeOpacity={0.85}
              onPress={() =>
                router.push({
                  pathname: "/finance/net-worth/edit-item",
                  params: { id: i.id },
                })
              }
              style={{
                padding: 16,
                borderRadius: 14,
                backgroundColor: "rgba(255,255,255,0.05)",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.08)",
                gap: 6,
              }}
            >
              <Text
                style={{ color: "#FFF", fontSize: 16, fontWeight: "600" }}
              >
                {i.title}
              </Text>

              <Text
                style={{
                  color: i.type === "asset" ? "#A7F3D0" : "#FCA5A5",
                }}
              >
                R$ {Number(i.value).toLocaleString("pt-BR")}
              </Text>

              {/* Mini evolução por item – opcional */}
              <MiniSparkline value={i.growth ?? 0} />
            </TouchableOpacity>
          ))}
        </View>

        {/* ======================================================
            BOTÃO ADICIONAR
        ====================================================== */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push("/finance/net-worth/new-item")}
          style={{
            padding: 14,
            borderRadius: 999,
            backgroundColor: "#FFF",
            marginTop: 14,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: "#000",
              fontWeight: "700",
              fontSize: 14,
            }}
          >
            Adicionar item
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </Screen>
  );
}

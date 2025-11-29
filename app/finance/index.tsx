import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Platform,
  TouchableOpacity,
  RefreshControl,
} from "react-native";

import Screen from "@/components/layout/Screen";
import Icon from "@/components/ui/Icon";

import { useFinance } from "@/hooks/useFinance";
import { useBudget } from "@/hooks/useBudget";
import { useGoals } from "@/hooks/useGoals";
import { useUserPlan } from "@/hooks/useUserPlan";

import WaveBlock from "@/components/app/finance/WaveBlock";
import BudgetBlock from "@/components/app/finance/BudgetBlock";
import ToolsBlock from "@/components/app/finance/ToolsBlock";

import { useRouter } from "expo-router";

const brandFont = Platform.select({
  ios: "SF Pro Display",
  default: "System",
});

// ASCII bar
function asciiBar(progress: number) {
  const blocks = ["▁", "▂", "▃", "▄", "▅", "▆", "█"];
  const idx = Math.min(blocks.length - 1, Math.floor(progress * (blocks.length - 1)));
  return blocks[idx];
}

export default function FinanceScreen() {
  const router = useRouter();

  const { 
    subsTotal, 
    balance,
    totalIncome,
    totalExpenses,
    insight,
    reload: reloadFinance 
  } = useFinance();

  const {
    totalExpenses: budgetMonthTotal,
    reload: reloadBudget
  } = useBudget();

  const {
    mainGoal,
    secondaryGoals,
    reload: reloadGoals
  } = useGoals();

  const {
    isPremium,
    reload: reloadPlan
  } = useUserPlan();

  const [refreshing, setRefreshing] = useState(false);

  async function onRefresh() {
    setRefreshing(true);
    await Promise.all([
      reloadFinance?.(),
      reloadBudget?.(),
      reloadGoals?.(),
      reloadPlan?.(),
    ]);
    setRefreshing(false);
  }

  const combinedExpenses = budgetMonthTotal + subsTotal;
  const annualProjection = combinedExpenses * 12;

  const currency = (v: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(v);

  return (
    <Screen style={{ backgroundColor: "#0A0A0C" }}>
      <View style={{ flex: 1 }}>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FFF"
              colors={["#FFF"]}
              progressBackgroundColor="#000"
            />
          }
          contentContainerStyle={{
            paddingHorizontal: 22,
            paddingTop: 28,
            paddingBottom: 180,
            gap: 32,
          }}
        >

          {/* HEADER ------------------------------------------------ */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text
                style={{
                  color: "rgba(255,255,255,0.35)",
                  fontSize: 12,
                  letterSpacing: 0.8,
                }}
              >
                Finanças
              </Text>

              <Text
                style={{
                  color: "#FFF",
                  fontSize: 28,
                  fontWeight: "700",
                  fontFamily: brandFont ?? undefined,
                  marginTop: 2,
                }}
              >
                Painel financeiro
              </Text>

              <Text
                style={{
                  color: "rgba(255,255,255,0.45)",
                  fontSize: 13,
                  marginTop: 6,
                  lineHeight: 20,
                }}
              >
                O hub completo do seu mês — versão NÖUS PRO.
              </Text>
            </View>

            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: "rgba(255,255,255,0.05)",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.08)",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Icon name="pie-chart-outline" size={20} color="#FFF" />
            </View>
          </View>

          {/* ======================== PAINEL FINANCEIRO ======================== */}
          {/* *** ESTE BLOCO É O ÚNICO MANTIDO NO DESIGN ORIGINAL *** */}

          <View
            style={{
              borderRadius: 22,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.08)",
              backgroundColor: "rgba(8,8,8,0.92)",
              padding: 18,
              gap: 14,
            }}
          >
            <Text style={{ color: "#9CA3AF", fontSize: 12 }}>
              Painel Financeiro NÖUS
            </Text>

            {/* Histórico */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push("/finance/history")}
              style={{
                marginTop: 4,
                padding: 12,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.10)",
                backgroundColor: "rgba(255,255,255,0.04)",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{
                  color: "#E5E7EB",
                  fontSize: 13,
                  fontWeight: "500",
                }}
              >
                Histórico financeiro
              </Text>

              <Icon name="chevron-forward" size={16} color="#9CA3AF" />
            </TouchableOpacity>

            {/* Entradas / saídas */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#6B7280", fontSize: 11 }}>Entradas</Text>
                <Text style={{ color: "#E5E7EB", fontSize: 15, fontWeight: "600" }}>
                  {currency(totalIncome)}
                </Text>
              </View>

              <View style={{ flex: 1, alignItems: "flex-end" }}>
                <Text style={{ color: "#6B7280", fontSize: 11 }}>Saídas</Text>

                <Text style={{ color: "#FCA5A5", fontSize: 15, fontWeight: "600" }}>
                  {currency(combinedExpenses)}
                </Text>
              </View>
            </View>

            {/* Saldo */}
            <View style={{ marginTop: 2 }}>
              <Text style={{ color: "#6B7280", fontSize: 11 }}>
                Saldo projetado do mês
              </Text>

              <Text
                style={{
                  color: balance >= 0 ? "#A7F3D0" : "#FCA5A5",
                  fontSize: 17,
                  fontWeight: "700",
                }}
              >
                {balance >= 0 ? "+" : "-"} {currency(Math.abs(balance))}
              </Text>
            </View>

            {/* Linha */}
            <View
              style={{
                marginTop: 8,
                height: 2,
                borderRadius: 999,
                backgroundColor: "rgba(255,255,255,0.06)",
              }}
            />

            {/* Projeção anual */}
            <View style={{ alignItems: "center", marginTop: 2 }}>
              <Text style={{ color: "#6B7280", fontSize: 11 }}>Projeção anual</Text>
              <Text style={{ color: "#E5E7EB", fontSize: 15, fontWeight: "600" }}>
                {currency(annualProjection)}
              </Text>
            </View>

            {/* Insight Pila */}
            <View
              style={{
                marginTop: 12,
                padding: 12,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: "rgba(55,65,81,0.85)",
                backgroundColor: "rgba(0,0,0,0.85)",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <Icon name="sparkles-outline" size={14} color="#FFF" />
                <Text style={{ color: "#9CA3AF", fontSize: 11, fontWeight: "600" }}>
                  Pila analisou seu mês
                </Text>
              </View>

              <Text style={{ color: "#D1D5DB", fontSize: 12, lineHeight: 18 }}>
                {insight}
              </Text>

              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => router.push("/pila/chat")}
                style={{
                  marginTop: 10,
                  alignSelf: "flex-start",
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: "rgba(148,163,184,0.9)",
                  backgroundColor: "rgba(15,23,42,0.85)",
                }}
              >
                <Text style={{ color: "#E5E7EB", fontSize: 12, fontWeight: "600" }}>
                  Conversar com a Pila
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ===================== BLOCOS PREMIUM ====================== */}
          <WaveBlock isPremium={isPremium} />
          <BudgetBlock isPremium={isPremium} />
          <ToolsBlock isPremium={isPremium} />

          {/* =========================== METAS =========================== */}
          <View style={{ marginTop: 10 }}>
            <Text
              style={{
                color: "#FFF",
                fontSize: 20,
                fontWeight: "700",
                fontFamily: brandFont ?? undefined,
                marginBottom: 6,
              }}
            >
              Metas & Reservas
            </Text>

            {!mainGoal && secondaryGoals.length === 0 && (
              <Text
                style={{
                  color: "rgba(255,255,255,0.40)",
                  fontSize: 14,
                }}
              >
                Nenhuma meta criada ainda.
              </Text>
            )}

            {/* Meta principal */}
            {mainGoal && (
              <View style={{ marginTop: 16, gap: 6 }}>
                <Text style={{ color: "#FFF", fontSize: 15, fontWeight: "600" }}>
                  Meta principal
                </Text>

                <Text style={{ color: "#A1A1AA", fontSize: 14 }}>
                  {mainGoal.title}{" "}
                  {".".repeat(20)}{" "}
                  {Math.round(
                    (mainGoal.current_amount / mainGoal.target_amount) * 100
                  )}
                  %
                </Text>

                <Text
                  style={{
                    color: "#9CA3AF",
                    fontSize: 26,
                    letterSpacing: 1,
                    marginTop: 4,
                    fontWeight: "300",
                  }}
                >
                  {Array.from({ length: 12 })
                    .map(() =>
                      asciiBar(
                        mainGoal.current_amount / mainGoal.target_amount
                      )
                    )
                    .join("")}
                </Text>
              </View>
            )}

            {/* Secundárias */}
            {secondaryGoals.length > 0 && (
              <View style={{ marginTop: 22, gap: 10 }}>
                <Text style={{ color: "#FFF", fontSize: 15, fontWeight: "600" }}>
                  Metas secundárias
                </Text>

                {secondaryGoals.map((g) => {
                  const pct = Math.round(
                    (g.current_amount / g.target_amount) * 100
                  );

                  return (
                    <Text
                      key={g.id}
                      style={{ color: "#9CA3AF", fontSize: 14 }}
                    >
                      • {g.title} {Array.from({ length: 30 - g.title.length }).join(" ")} {pct}%
                    </Text>
                  );
                })}

                <TouchableOpacity onPress={() => router.push("/goals")}>
                  <Text
                    style={{
                      marginTop: 6,
                      color: "#A5B4FC",
                      fontSize: 13,
                      textDecorationLine: "underline",
                    }}
                  >
                    ver metas completas
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </Screen>
  );
}

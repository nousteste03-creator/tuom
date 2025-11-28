// app/finance/index.tsx
import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Platform,
  TouchableOpacity,
} from "react-native";

import Screen from "@/components/layout/Screen";
import Section from "@/components/layout/Section";
import Icon from "@/components/ui/Icon";

import { useFinance } from "@/hooks/useFinance";
import { useCategories } from "@/hooks/useCategories";
import { useGoals } from "@/hooks/useGoals";
import { useUserPlan } from "@/hooks/useUserPlan";

import CategoryCard from "@/components/app/finance/CategoryCard";
import WaveBlock from "@/components/app/finance/WaveBlock";
import BudgetBlock from "@/components/app/finance/BudgetBlock";
import ToolsBlock from "@/components/app/finance/ToolsBlock";

import CategoryCreateModal from "@/components/app/finance/CategoryCreateModal";
import CategoryEditModal from "@/components/app/finance/CategoryEditModal";

import { useRouter } from "expo-router";

// FONT
const brandFont = Platform.select({
  ios: "SF Pro Display",
  default: "System",
});

// ASCII
function asciiBar(progress: number) {
  const blocks = ["▁", "▂", "▃", "▄", "▅", "▆", "█"];
  const index = Math.min(
    blocks.length - 1,
    Math.floor(progress * (blocks.length - 1))
  );
  return blocks[index];
}

export default function FinanceScreen() {
  const router = useRouter();

  const { totalIncome, totalExpenses, subsTotal, balance, insight } = useFinance();

  const { categories, createCategory, updateCategory, deleteCategory } =
    useCategories();

  const { mainGoal, secondaryGoals } = useGoals();

  const { isPremium } = useUserPlan();

  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState<any>(null);

  const categoriesWithSubscriptions = [
    {
      id: "subscriptions",
      title: "Assinaturas",
      amount: subsTotal,
      type: "subscription" as const,
    },
    ...categories,
  ];

  const annualProjection = totalExpenses * 12;

  const currency = (v: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(v);

  return (
    <Screen>
      <View style={{ flex: 1, backgroundColor: "#000" }}>
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 160,
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
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#6B7280", fontSize: 13 }}>Finanças</Text>

              <Text
                style={{
                  color: "#FFF",
                  fontSize: 22,
                  fontWeight: "700",
                  fontFamily: brandFont ?? undefined,
                  marginTop: 4,
                }}
              >
                Painel financeiro
              </Text>

              <Text
                style={{
                  color: "#4B5563",
                  fontSize: 12,
                  marginTop: 4,
                }}
              >
                Controle premium do seu mês — estilo NÖUS 007.
              </Text>
            </View>

            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: "rgba(255,255,255,0.06)",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.10)",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Icon name="pie-chart-outline" size={16} color="#FFF" />
            </View>
          </View>

          {/* -------- PAINEL FINANCEIRO -------- */}
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
              Painel Financeiro NÖUS 007
            </Text>

            {/* HISTÓRICO */}
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
                  fontFamily: brandFont ?? undefined,
                }}
              >
                Histórico financeiro
              </Text>

              <Icon name="chevron-forward" size={16} color="#9CA3AF" />
            </TouchableOpacity>

            {/* Entradas / Saídas */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#6B7280", fontSize: 11 }}>Entradas</Text>
                <Text
                  style={{
                    color: "#E5E7EB",
                    fontSize: 15,
                    fontWeight: "600",
                  }}
                >
                  {currency(totalIncome)}
                </Text>
              </View>

              <View style={{ flex: 1, alignItems: "flex-end" }}>
                <Text style={{ color: "#6B7280", fontSize: 11 }}>Saídas</Text>

                <Text
                  style={{
                    color: "#FCA5A5",
                    fontSize: 15,
                    fontWeight: "600",
                  }}
                >
                  {currency(totalExpenses)}
                </Text>
              </View>
            </View>

            {/* Saldo projetado */}
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

            {/* Linha ghost */}
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
              <Text style={{ color: "#6B7280", fontSize: 11 }}>
                Projeção anual
              </Text>
              <Text
                style={{
                  color: "#E5E7EB",
                  fontSize: 15,
                  fontWeight: "600",
                }}
              >
                {currency(annualProjection)}
              </Text>
            </View>

            {/* Insight da Pila */}
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
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 6,
                }}
              >
                <Icon name="sparkles-outline" size={14} color="#FFF" />

                <Text
                  style={{
                    color: "#9CA3AF",
                    fontSize: 11,
                    fontWeight: "600",
                  }}
                >
                  Pila analisou seu mês
                </Text>
              </View>

              <Text
                style={{
                  color: "#D1D5DB",
                  fontSize: 12,
                  lineHeight: 18,
                }}
              >
                {insight}
              </Text>

              <TouchableOpacity
                activeOpacity={0.9}
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
                onPress={() => router.push("/pila/chat")}
              >
                <Text
                  style={{
                    color: "#E5E7EB",
                    fontSize: 12,
                    fontWeight: "600",
                  }}
                >
                  Conversar com a Pila
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ---------- BLOCOS PREMIUM ---------- */}
          <WaveBlock isPremium={isPremium} />
          <BudgetBlock isPremium={isPremium} />
          <ToolsBlock isPremium={isPremium} />

          {/* ---------- CATEGORIAS ---------- */}
          <Section title="Categorias (ranking automático)">
            {categoriesWithSubscriptions.map((c) => (
              <TouchableOpacity
                key={c.id}
                activeOpacity={0.85}
                onPress={() => {
                  if (c.id === "subscriptions") return;
                  setOpenEdit(c);
                }}
              >
                <CategoryCard
                  title={c.title}
                  amount={c.amount}
                  type={c.type}
                />
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              activeOpacity={0.9}
              style={{
                marginTop: 12,
                padding: 12,
                borderRadius: 999,
                backgroundColor: "#FFF",
                alignItems: "center",
              }}
              onPress={() => setOpenCreate(true)}
            >
              <Text
                style={{
                  color: "#000",
                  fontSize: 14,
                  fontWeight: "600",
                }}
              >
                Adicionar categoria
              </Text>
            </TouchableOpacity>
          </Section>

          {/* ---------- METAS ---------- */}
          <Section title="Metas & reservas">
            {!mainGoal && secondaryGoals.length === 0 && (
              <Text style={{ color: "#6B7280", fontSize: 13 }}>
                Nenhuma meta criada ainda.
              </Text>
            )}

            {mainGoal && (
              <View style={{ marginTop: 6, gap: 4 }}>
                <Text
                  style={{
                    color: "#E5E7EB",
                    fontSize: 15,
                    fontWeight: "600",
                  }}
                >
                  Meta principal
                </Text>

                <Text
                  style={{
                    color: "#9CA3AF",
                    fontSize: 14,
                    fontFamily: brandFont ?? undefined,
                  }}
                >
                  {mainGoal.title} {".".repeat(22)}{" "}
                  {Math.round(
                    (mainGoal.current_amount / mainGoal.target_amount) * 100
                  )}
                  % concluída
                </Text>

                <Text
                  style={{
                    color: "#9CA3AF",
                    fontSize: 24,
                    letterSpacing: 1,
                    marginTop: 2,
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

            {secondaryGoals.length > 0 && (
              <View style={{ marginTop: 16, gap: 6 }}>
                <Text
                  style={{
                    color: "#E5E7EB",
                    fontSize: 15,
                    fontWeight: "600",
                  }}
                >
                  Metas secundárias
                </Text>

                {secondaryGoals.map((g) => {
                  const pct = Math.round(
                    (g.current_amount / g.target_amount) * 100
                  );

                  return (
                    <Text
                      key={g.id}
                      style={{
                        color: "#9CA3AF",
                        fontSize: 14,
                        fontFamily: brandFont ?? undefined,
                      }}
                    >
                      • {g.title}
                      {" ".repeat(30 - g.title.length)}
                      {pct}%
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
                    (ver metas completas)
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </Section>
        </ScrollView>

        {/* MODAIS */}
        <CategoryCreateModal
          visible={openCreate}
          onClose={() => setOpenCreate(false)}
          onCreate={createCategory}
        />

        <CategoryEditModal
          visible={!!openEdit}
          category={openEdit}
          onClose={() => setOpenEdit(null)}
          onSave={(updated) =>
            updateCategory(updated.id, updated)
          }
          onDelete={(id) => deleteCategory(id)}
        />
      </View>
    </Screen>
  );
}

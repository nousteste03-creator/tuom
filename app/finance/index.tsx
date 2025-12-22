import { useState, useMemo } from "react";
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
import { useBudget } from "@/context/BudgetContext";
import { useGoals } from "@/context/GoalsContext";
import { useUserPlan } from "@/context/UserPlanContext";

import ToolsBlock from "@/components/app/finance/ToolsBlock";

import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { useMonthlyCategoryTrends } from "@/hooks/useMonthlyCategoryTrends";

const brandFont = Platform.select({
  ios: "SF Pro Display",
  default: "System",
});

const COLORS = {
  background: "#000000",
  card: "rgba(12,12,12,0.96)",
  softCard: "rgba(10,10,10,0.96)",
  glass: "rgba(255,255,255,0.03)",
  textPrimary: "#FFFFFF",
  textSecondary: "rgba(255,255,255,0.60)",
  textMuted: "rgba(255,255,255,0.42)",
  dividerSoft: "rgba(255,255,255,0.06)",
};

/* ============================================================
   ASCII BAR – metas
============================================================ */
function asciiBar(progress: number) {
  const blocks = ["▁", "▂", "▃", "▄", "▅", "▆", "█"];
  const idx = Math.min(blocks.length - 1, Math.floor(progress * (blocks.length - 1)));
  return blocks[idx];
}

/* ============================================================
   NEW SPARKLINE — Apple Style (SEM palitos verdes)
============================================================ */
function SparklinePair({ growthPct }: { growthPct: number }) {
  return (
    <View
      style={{
        width: "100%",
        height: 24,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.03)",
        overflow: "hidden",
        justifyContent: "center",
        paddingHorizontal: 10,
      }}
    >
      <View
        style={{
          width:
            growthPct > 2
              ? "82%"
              : growthPct < -2
              ? "46%"
              : "64%",
          height: 3,
          borderRadius: 999,
          backgroundColor:
            growthPct > 2
              ? "rgba(94,255,185,0.85)"
              : growthPct < -2
              ? "rgba(255,120,120,0.85)"
              : "rgba(255,255,255,0.35)",
        }}
      />
    </View>
  );
}

/* ============================================================
   TELA PRINCIPAL
============================================================ */
export default function FinanceScreen() {
  const router = useRouter();

  const { subsTotal, balance, totalIncome, insight, reload: reloadFinance } =
    useFinance();

  const {
    categories,
    totalExpenses: budgetMonthTotal,
    reload: reloadBudget,
  } = useBudget();

  const {
  mainGoal,
  secondaryGoals = [],
  reload: reloadGoals,
} = useGoals();

  const { isPremium, reload: reloadPlan } = useUserPlan();

  const {
    loading: loadingTrends,
    trends,
    reload: reloadTrends,
  } = useMonthlyCategoryTrends();

  const [refreshing, setRefreshing] = useState(false);

  async function onRefresh() {
    setRefreshing(true);
    await Promise.all([
      reloadFinance?.(),
      reloadBudget?.(),
      reloadGoals?.(),
      reloadPlan?.(),
      reloadTrends?.(),
    ]);
    setRefreshing(false);
  }

  const currency = (v: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(v || 0);

  const realCategories = categories.filter(
    (c: any) => c.id !== "builtin-subscriptions"
  );

  const spentCategorias = realCategories.reduce(
    (acc: number, c: any) => acc + Number(c.spent || 0),
    0
  );

  const limitCategorias = realCategories.reduce(
    (acc: number, c: any) => acc + Number(c.limit_amount || 0),
    0
  );

  const totalSpentMonth = spentCategorias + subsTotal;
  const annualProjection = totalSpentMonth * 12;

  const pctMes =
    limitCategorias > 0
      ? Math.min((totalSpentMonth / limitCategorias) * 100, 100)
      : 0;

  return (
    <Screen style={{ backgroundColor: COLORS.background }}>
      <View style={{ flex: 1 }}>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FFF"
              colors={["#FFF"]}
              progressBackgroundColor="#000000"
            />
          }
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 26,
            paddingBottom: 180,
            gap: 28,
          }}
        >
          {/* ======================================================
              HEADER
          ====================================================== */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <View style={{ flex: 1, paddingRight: 16 }}>
              <Text
                style={{
                  color: COLORS.textMuted,
                  fontSize: 12,
                  letterSpacing: 0.3,
                }}
              >
                Finanças
              </Text>

              <Text
                style={{
                  color: COLORS.textPrimary,
                  fontSize: 30,
                  fontWeight: "700",
                  fontFamily: brandFont ?? undefined,
                  marginTop: 4,
                  letterSpacing: 0.1,
                }}
              >
                Painel financeiro
              </Text>

              <Text
                style={{
                  color: COLORS.textSecondary,
                  fontSize: 13,
                  marginTop: 6,
                  lineHeight: 20,
                }}
              >
                O hub completo do seu mês — TUÖM PRO.
              </Text>
            </View>

            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "rgba(255,255,255,0.06)",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Icon name="pie-chart-outline" size={18} color="#FFFFFF" />
            </View>
          </View>

          {/* ======================================================
              PAINEL FINANCEIRO
          ====================================================== */}
          <View
            style={{
              borderRadius: 24,
              backgroundColor: COLORS.card,
              padding: 18,
              gap: 14,
              borderWidth: 0.5,
              borderColor: "rgba(255,255,255,0.05)",
              shadowColor: "#000",
              shadowOpacity: 0.45,
              shadowRadius: 18,
              shadowOffset: { width: 0, height: 16 },
            }}
          >
            <Text
              style={{
                color: COLORS.textSecondary,
                fontSize: 12,
                marginBottom: 4,
              }}
            >
              Painel Financeiro
            </Text>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => router.push("/finance/history")}
              style={{
                marginTop: 2,
                paddingVertical: 10,
                paddingHorizontal: 14,
                borderRadius: 999,
                backgroundColor: COLORS.glass,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{
                  color: COLORS.textPrimary,
                  fontSize: 13,
                  fontWeight: "500",
                }}
              >
                Histórico financeiro
              </Text>

              <Icon name="chevron-forward" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>

            {/* Entradas / Saídas */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                gap: 12,
                marginTop: 10,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ color: COLORS.textMuted, fontSize: 11 }}>
                  Entradas
                </Text>
                <Text
                  style={{
                    color: COLORS.textPrimary,
                    fontSize: 16,
                    fontWeight: "600",
                  }}
                >
                  {currency(totalIncome)}
                </Text>
              </View>

              <View style={{ flex: 1, alignItems: "flex-end" }}>
                <Text style={{ color: COLORS.textMuted, fontSize: 11 }}>
                  Saídas
                </Text>
                <Text
                  style={{
                    color: "#FCA5A5",
                    fontSize: 16,
                    fontWeight: "600",
                  }}
                >
                  {currency(totalSpentMonth)}
                </Text>
              </View>
            </View>

            {/* SALDO */}
            <View style={{ marginTop: 6 }}>
              <Text style={{ color: COLORS.textMuted, fontSize: 11 }}>
                Saldo projetado do mês
              </Text>

              <Text
                style={{
                  color: balance >= 0 ? "#A7F3D0" : "#FCA5A5",
                  fontSize: 18,
                  fontWeight: "700",
                  marginTop: 2,
                }}
              >
                {balance >= 0 ? "+" : "-"} {currency(Math.abs(balance))}
              </Text>
            </View>

            {/* PROJEÇÃO ANUAL */}
            <View
              style={{
                marginTop: 10,
                paddingVertical: 10,
                borderRadius: 14,
                backgroundColor: "rgba(255,255,255,0.02)",
                alignItems: "center",
              }}
            >
              <Text style={{ color: COLORS.textMuted, fontSize: 11 }}>
                Projeção anual
              </Text>
              <Text
                style={{
                  color: COLORS.textPrimary,
                  fontSize: 15,
                  fontWeight: "600",
                  marginTop: 2,
                }}
              >
                {currency(annualProjection)}
              </Text>
            </View>

            {/* INSIGHT PILA */}
            <View
              style={{
                marginTop: 10,
                padding: 12,
                borderRadius: 16,
                backgroundColor: "rgba(0,0,0,0.9)",
                borderWidth: 0.5,
                borderColor: "rgba(148,163,184,0.35)",
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
                <Icon name="sparkles-outline" size={14} color="#FFFFFF" />
                <Text
                  style={{
                    color: COLORS.textSecondary,
                    fontSize: 11,
                    fontWeight: "600",
                  }}
                >
                  Pila analisou seu mês
                </Text>
              </View>

              <Text
                style={{
                  color: COLORS.textPrimary,
                  fontSize: 12,
                  lineHeight: 18,
                }}
              >
                {insight}
              </Text>

              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => router.push("/pila/chat")}
                style={{
                  marginTop: 10,
                  alignSelf: "flex-start",
                  paddingHorizontal: 14,
                  paddingVertical: 7,
                  borderRadius: 999,
                  borderWidth: 0.5,
                  borderColor: "rgba(148,163,184,0.8)",
                  backgroundColor: "rgba(15,23,42,0.85)",
                }}
              >
                <Text
                  style={{
                    color: COLORS.textPrimary,
                    fontSize: 12,
                    fontWeight: "600",
                  }}
                >
                  Conversar com a Pila
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ======================================================
              ORÇAMENTO DO MÊS
          ====================================================== */}
          <View style={{ borderRadius: 26, overflow: "hidden" }}>
            <BlurView
              intensity={14}
              tint="dark"
              style={{
                padding: 20,
                backgroundColor: "rgba(5,5,5,0.9)",
                borderRadius: 26,
                borderWidth: 0.5,
                borderColor: "rgba(255,255,255,0.05)",
                gap: 20,
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
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <Text
                    style={{
                      color: COLORS.textPrimary,
                      fontSize: 19,
                      fontWeight: "700",
                    }}
                  >
                    Orçamento do mês
                  </Text>

                  <Text
                    style={{
                      color: COLORS.textSecondary,
                      fontSize: 13,
                      marginTop: 2,
                    }}
                  >
                    Categorias + assinaturas automáticas.
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => router.push("/finance/budget")}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 17,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: COLORS.glass,
                  }}
                >
                  <Icon name="refresh" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* TOTAL DO MÊS */}
              <View style={{ gap: 10 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <View>
                    <Text style={{ color: COLORS.textMuted, fontSize: 11 }}>
                      Gasto no mês
                    </Text>
                    <Text
                      style={{
                        color: COLORS.textPrimary,
                        fontSize: 16,
                        fontWeight: "600",
                      }}
                    >
                      {currency(totalSpentMonth)}
                    </Text>
                  </View>

                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={{ color: COLORS.textMuted, fontSize: 11 }}>
                      Limite definido
                    </Text>
                    <Text
                      style={{
                        color: COLORS.textPrimary,
                        fontSize: 16,
                        fontWeight: "600",
                      }}
                    >
                      {currency(limitCategorias)}
                    </Text>
                  </View>
                </View>

                {/* BARRA */}
                <View
                  style={{
                    width: "100%",
                    height: 4,
                    borderRadius: 999,
                    backgroundColor: "rgba(255,255,255,0.04)",
                    overflow: "hidden",
                    marginTop: 4,
                  }}
                >
                  <View
                    style={{
                      width: `${pctMes}%`,
                      height: "100%",
                      backgroundColor:
                        pctMes < 70
                          ? "rgba(94,255,185,0.8)"
                          : pctMes < 100
                          ? "rgba(255,255,140,0.85)"
                          : "rgba(255,120,120,0.9)",
                    }}
                  />
                </View>

                <Text
                  style={{
                    color: COLORS.textSecondary,
                    fontSize: 12,
                    marginTop: 2,
                  }}
                >
                  {limitCategorias > 0
                    ? `${pctMes.toFixed(0)}% do limite utilizado`
                    : "Nenhum limite definido para este mês"}
                </Text>
              </View>

              {/* LISTAGEM CATEGORIAS */}
              <View style={{ marginTop: 8 }}>
                {realCategories.map((cat: any, idx: number) => {
                  const limit = Number(cat.limit_amount || 0);
                  const spent = Number(cat.spent || 0);
                  const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;

                  const color =
                    pct < 70
                      ? "rgba(94,255,185,0.8)"
                      : pct < 100
                      ? "rgba(255,255,140,0.9)"
                      : "rgba(255,120,120,0.9)";

                  return (
                    <View
                      key={cat.id}
                      style={{
                        paddingVertical: 10,
                        borderTopWidth: idx === 0 ? 0.5 : 0.4,
                        borderTopColor: COLORS.dividerSoft,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <View style={{ flex: 1, paddingRight: 10 }}>
                          <Text
                            style={{
                              color: COLORS.textPrimary,
                              fontSize: 14,
                              fontWeight: "600",
                            }}
                          >
                            {cat.title}
                          </Text>

                          <Text
                            style={{
                              marginTop: 3,
                              color: COLORS.textSecondary,
                              fontSize: 12,
                            }}
                          >
                            {currency(spent)} /{" "}
                            {limit > 0 ? currency(limit) : "Sem limite"}
                          </Text>
                        </View>

                        <Text
                          style={{
                            color: COLORS.textSecondary,
                            fontSize: 12,
                          }}
                        >
                          {limit > 0 ? `${pct.toFixed(0)}%` : "-"}
                        </Text>
                      </View>

                      <View
                        style={{
                          marginTop: 6,
                          width: "100%",
                          height: 3,
                          borderRadius: 999,
                          backgroundColor: "rgba(255,255,255,0.04)",
                          overflow: "hidden",
                        }}
                      >
                        <View
                          style={{
                            width: `${pct}%`,
                            height: "100%",
                            backgroundColor: color,
                          }}
                        />
                      </View>
                    </View>
                  );
                })}

                {/* ASSINATURAS */}
                <View
                  style={{
                    paddingTop: 12,
                    borderTopWidth: realCategories.length ? 0.4 : 0.5,
                    borderTopColor: COLORS.dividerSoft,
                    marginTop: realCategories.length ? 4 : 0,
                  }}
                >
                  <Text
                    style={{
                      color: COLORS.textPrimary,
                      fontSize: 14,
                      fontWeight: "600",
                    }}
                  >
                    Assinaturas
                  </Text>

                  <Text
                    style={{
                      marginTop: 4,
                      color: COLORS.textSecondary,
                      fontSize: 12,
                    }}
                  >
                    {currency(subsTotal)}
                  </Text>

                  <View
                    style={{
                      marginTop: 6,
                      width: "100%",
                      height: 3,
                      borderRadius: 999,
                      backgroundColor: "rgba(255,255,255,0.04)",
                      overflow: "hidden",
                    }}
                  >
                    <View
                      style={{
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(94,255,185,0.55)",
                      }}
                    />
                  </View>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => router.push("/finance/budget")}
                activeOpacity={0.9}
                style={{
                  marginTop: 10,
                  alignSelf: "flex-end",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Text
                  style={{
                    color: COLORS.textSecondary,
                    fontSize: 13,
                  }}
                >
                  Ver orçamento completo
                </Text>

                <Icon
                  name="chevron-forward"
                  size={14}
                  color={COLORS.textSecondary}
                />
              </TouchableOpacity>
            </BlurView>
          </View>

{/* ======================================================
   ANÁLISE DO MÊS — PREMIUM / APPLE / XP
====================================================== */}
<View style={{ borderRadius: 26, overflow: "hidden" }}>
  <BlurView
    intensity={18}
    tint="dark"
    style={{
      padding: 22,
      backgroundColor: "rgba(0,0,0,0.82)",
      borderRadius: 26,
      borderWidth: 0.4,
      borderColor: "rgba(255,255,255,0.04)",
      gap: 22,
    }}
  >
    {/* HEADER */}
    <View style={{ gap: 4 }}>
      <Text
        style={{
          color: COLORS.textPrimary,
          fontSize: 20,
          fontWeight: "700",
          letterSpacing: 0.2,
        }}
      >
        Análise do mês
      </Text>

      <Text
        style={{
          color: COLORS.textSecondary,
          fontSize: 13,
        }}
      >
        Comparação inteligente das suas categorias.
      </Text>
    </View>

    {/* ESTADOS */}
    {loadingTrends && (
      <Text style={{ color: COLORS.textMuted, fontSize: 13 }}>
        Carregando análise personalizada...
      </Text>
    )}

    {!loadingTrends && trends.length === 0 && (
      <Text style={{ color: COLORS.textMuted, fontSize: 13 }}>
        Nenhum dado disponível para análise.
      </Text>
    )}

    {/* LISTA */}
    {!loadingTrends &&
      trends.map((row: any) => {
        const title = row.category_title;

        const pctUser = row.pct_user ?? null;
        const pctBR = row.national_percent ?? null;
        const growth = row.growth_pct ?? 0;

        const metaText = row.meta_analysis;

        const statusLabel =
          pctBR === null ? "Sem referência nacional" : "Comparação nacional";

        let growthColor = COLORS.textSecondary;
        if (growth > 3) growthColor = "rgba(94,255,185,0.95)";
        if (growth < -3) growthColor = "rgba(248,113,113,0.95)";

        return (
          <View
            key={row.id}
            style={{
              paddingVertical: 14,
              borderTopWidth: 0.35,
              borderTopColor: "rgba(255,255,255,0.06)",
              gap: 14,
            }}
          >
            {/* TÍTULO + TIPO */}
            <View>
              <Text
                style={{
                  color: COLORS.textPrimary,
                  fontSize: 16,
                  fontWeight: "600",
                }}
              >
                {title}
              </Text>

              <Text
                style={{
                  color: COLORS.textMuted,
                  fontSize: 11,
                  marginTop: 2,
                }}
              >
                {statusLabel}
              </Text>
            </View>

            {/* NÚMEROS PRINCIPAIS */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {/* USER */}
              <View>
                <Text
                  style={{
                    color: COLORS.textSecondary,
                    fontSize: 12,
                  }}
                >
                  Este mês
                  {pctUser !== null ? "" : " —"}
                </Text>

                <Text
                  style={{
                    color: COLORS.textPrimary,
                    fontSize: 17,
                    fontWeight: "700",
                  }}
                >
                  {pctUser !== null ? `${pctUser.toFixed(1)}%` : "--"}
                </Text>
              </View>

              {/* REFERÊNCIA (BR OU MÊS ANTERIOR) */}
              <View style={{ alignItems: "flex-end" }}>
                <Text
                  style={{
                    color: COLORS.textSecondary,
                    fontSize: 12,
                  }}
                >
                  Referência
                </Text>

                <Text
                  style={{
                    color: COLORS.textPrimary,
                    fontSize: 17,
                    fontWeight: "700",
                  }}
                >
                  {pctBR !== null ? `${pctBR.toFixed(1)}% BR` : "—"}
                </Text>
              </View>
            </View>

            {/* VARIAÇÃO */}
            <Text
              style={{
                color: growthColor,
                fontSize: 13,
                fontWeight: "600",
              }}
            >
              {growth > 0 && `↑ ${growth.toFixed(1)}% acima do BR`}
              {growth < 0 && `↓ ${Math.abs(growth).toFixed(1)}% abaixo do BR`}
              {growth === 0 && pctBR !== null && "Igual à média brasileira"}
              {pctBR === null && "Sem referência"}
            </Text>

            {/* INSIGHT INTELIGENTE */}
            <Text
              style={{
                color: COLORS.textSecondary,
                fontSize: 13,
                lineHeight: 20,
              }}
            >
              {metaText}
            </Text>

            {/* SPARKLINE PREMIUM */}
            <SparklinePair growthPct={growth} />
          </View>
        );
      })}
  </BlurView>
</View>

          {/* ======================================================
              TOOLS BLOCK (JÁ IMPORTADO PRONTO)
          ====================================================== */}
          <ToolsBlock isPremium={isPremium} />

          {/* ======================================================
              METAS E RESERVAS
          ====================================================== */}
          <View style={{ marginTop: 6 }}>
            <Text
              style={{
                color: COLORS.textPrimary,
                fontSize: 20,
                fontWeight: "700",
                fontFamily: brandFont ?? undefined,
                marginBottom: 8,
              }}
            >
              Metas & Reservas
            </Text>

            {!mainGoal && secondaryGoals.length === 0 && (
              <Text style={{ color: COLORS.textMuted, fontSize: 14 }}>
                Nenhuma meta criada ainda.
              </Text>
            )}

            {mainGoal && (
              <View
                style={{
                  marginTop: 12,
                  padding: 14,
                  borderRadius: 18,
                  backgroundColor: COLORS.softCard,
                  borderWidth: 0.5,
                  borderColor: "rgba(255,255,255,0.04)",
                }}
              >
                <Text
                  style={{
                    color: COLORS.textPrimary,
                    fontSize: 14,
                    fontWeight: "600",
                  }}
                >
                  Meta principal
                </Text>

                <Text
                  style={{
                    color: COLORS.textSecondary,
                    fontSize: 13,
                    marginTop: 4,
                  }}
                >
                  {mainGoal.title}
                </Text>

                <Text
                  style={{
                    color: COLORS.textMuted,
                    fontSize: 26,
                    letterSpacing: 1,
                    marginTop: 8,
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
              <View
                style={{
                  marginTop: 18,
                  padding: 14,
                  borderRadius: 18,
                  backgroundColor: COLORS.softCard,
                  borderWidth: 0.5,
                  borderColor: "rgba(255,255,255,0.03)",
                }}
              >
                <Text
                  style={{
                    color: COLORS.textPrimary,
                    fontSize: 14,
                    fontWeight: "600",
                    marginBottom: 8,
                  }}
                >
                  Metas secundárias
                </Text>

                {secondaryGoals.map((g: any) => {
                  const pct = Math.round(
                    (g.current_amount / g.target_amount) * 100
                  );

                  return (
                    <Text
                      key={g.id}
                      style={{
                        color: COLORS.textSecondary,
                        fontSize: 13,
                        marginBottom: 4,
                      }}
                    >
                      • {g.title} — {pct}%
                    </Text>
                  );
                })}

                <TouchableOpacity
                  onPress={() => router.push("/goals")}
                  style={{ marginTop: 6 }}
                >
                  <Text
                    style={{
                      color: "#A5B4FC",
                      fontSize: 13,
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

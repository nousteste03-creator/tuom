import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";

import Screen from "@/components/layout/Screen";
import Icon from "@/components/ui/Icon";

import { useBudget } from "@/hooks/useBudget";
import { useSubscriptions } from "@/hooks/useSubscriptions";

export default function BudgetIndexScreen() {
  const router = useRouter();

  // HOOKS
  const { loading, categories, totalExpenses, reload } = useBudget() as any;
  const { monthlyTotal: subsTotal } = useSubscriptions();

  const [refreshing, setRefreshing] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);

  const currency = (v: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(v || 0);

  async function onRefresh() {
    if (!reload) return;
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  }

  // CATEGORIA FIXA DE ASSINATURAS
  const subscriptionCategory = {
    id: "builtin-subscriptions",
    title: "Assinaturas",
    limit_amount: 0,
    spent: subsTotal,
    pct: 0,
    isFixed: true,
  };

  // REMOVER duplicações vindas do hook
  const cleanCategories = categories.filter(
    (c: any) => String(c.id) !== "builtin-subscriptions"
  );

  // ORDENAR pela opção E:
  // Assinaturas -> categorias ordenadas pelo maior gasto primeiro
  const sortedDynamic = cleanCategories.sort(
    (a: any, b: any) => Number(b.spent) - Number(a.spent)
  );

  const finalCategories = [subscriptionCategory, ...sortedDynamic];

  // SOMA DO LIMITE TOTAL (somente categorias normais)
  const limitTotal = useMemo(
    () =>
      finalCategories.reduce(
        (total: number, c: any) => total + Number(c.limit_amount ?? 0),
        0
      ),
    [finalCategories]
  );

  const usedPct = useMemo(() => {
    if (!limitTotal || limitTotal <= 0) return 0;
    return Math.min((Number(totalExpenses || 0) / limitTotal) * 100, 300);
  }, [totalExpenses, limitTotal]);

  const insightText = useMemo(() => {
    const today = new Date();
    const day = today.getDate();
    const daysInMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0
    ).getDate();
    const progressDia = (day / daysInMonth) * 100;

    if (!limitTotal || limitTotal <= 0) {
      if (!totalExpenses || totalExpenses <= 0) {
        return "Nenhum limite definido. Comece criando categorias para organizar seu mês.";
      }
      return "Você está gastando sem um limite definido. Crie tetos mensais para controlar melhor seu orçamento.";
    }

    if (usedPct < 20 && progressDia > 20) {
      return "Você está bem abaixo do ritmo esperado para o mês. Sinal excelente de controle.";
    }

    if (usedPct < 50) {
      return `Você usou ${usedPct.toFixed(
        0
      )}% do seu limite. Há boa folga para o restante do mês.`;
    }

    if (usedPct >= 50 && usedPct < 90) {
      if (usedPct > progressDia + 10) {
        return `Seu ritmo (${usedPct.toFixed(
          0
        )}%) está um pouco acima do calendário. Avalie seus gastos recentes.`;
      }
      return `Você está em ${usedPct.toFixed(
        0
      )}% do limite. Mantenha atenção nas próximas semanas.`;
    }

    if (usedPct >= 90 && usedPct <= 110) {
      return `Você está praticamente no teto (${usedPct.toFixed(
        0
      )}%). Evite excessos agora.`;
    }

    return `Você estourou o limite em ${(
      usedPct - 100
    ).toFixed(0)}%. Ajuste o próximo mês com esse aprendizado.`;
  }, [limitTotal, usedPct, totalExpenses]);

  return (
    <Screen style={{ backgroundColor: "#0A0A0C" }}>
      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 160,
          gap: 24,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FFF"
            colors={["#FFF"]}
            progressBackgroundColor="#000"
          />
        }
      >
        {/* HEADER */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(255,255,255,0.03)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.08)",
            }}
          >
            <Icon name="chevron-back" size={20} color="#FFF" />
          </TouchableOpacity>

          <View style={{ flex: 1, alignItems: "center" }}>
            <Text
              style={{
                color: "rgba(255,255,255,0.35)",
                fontSize: 11,
                letterSpacing: 1,
                marginBottom: 2,
              }}
            >
              BUDGET
            </Text>
            <Text style={{ color: "#FFF", fontSize: 20, fontWeight: "700" }}>
              Orçamento do mês
            </Text>
          </View>

          <View style={{ width: 42 }} />
        </View>

        {/* HERO */}
        <BlurView
          intensity={32}
          tint="dark"
          style={{
            borderRadius: 26,
            padding: 22,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.08)",
            backgroundColor: "rgba(20,20,20,0.28)",
            overflow: "hidden",
          }}
        >
          {/* Gasto */}
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 13 }}>
                Gasto no mês
              </Text>

              <Text
                style={{
                  color: "#FFF",
                  fontSize: 30,
                  fontWeight: "700",
                  marginTop: 6,
                }}
              >
                {currency(totalExpenses)}
              </Text>

              <Text
                style={{
                  color: "rgba(255,255,255,0.35)",
                  fontSize: 12,
                  marginTop: 6,
                }}
              >
                Limite mensal:{" "}
                <Text style={{ color: "#FFF" }}>
                  {limitTotal > 0 ? currency(limitTotal) : "não definido"}
                </Text>
              </Text>
            </View>

            {/* Badge */}
            <View style={{ alignItems: "flex-end", gap: 6 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 12,
                  paddingVertical: 5,
                  borderRadius: 999,
                  backgroundColor: "rgba(255,255,255,0.03)",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.08)",
                }}
              >
                <Icon name="sparkles-outline" size={14} color="#FFF" />
                <Text style={{ color: "#FFF", marginLeft: 6, fontSize: 12 }}>
                  Pila Insight
                </Text>
              </View>

              {limitTotal > 0 && (
                <View
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 999,
                    backgroundColor:
                      usedPct < 80
                        ? "rgba(22,163,74,0.25)"
                        : usedPct < 100
                        ? "rgba(234,179,8,0.25)"
                        : "rgba(220,38,38,0.25)",
                  }}
                >
                  <Text
                    style={{
                      color:
                        usedPct < 80
                          ? "#A7F3D0"
                          : usedPct < 100
                          ? "#FDE68A"
                          : "#FCA5A5",
                      fontSize: 11,
                      fontWeight: "600",
                    }}
                  >
                    {usedPct.toFixed(0)}% do limite
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Barra */}
          {limitTotal > 0 && (
            <View
              style={{
                marginTop: 18,
                width: "100%",
                height: 14,
                borderRadius: 999,
                backgroundColor: "rgba(0,0,0,0.45)",
                overflow: "hidden",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.06)",
              }}
            >
              <View
                style={{
                  width: `${Math.min(usedPct, 100)}%`,
                  height: "100%",
                  borderRadius: 999,
                  backgroundColor:
                    usedPct < 80
                      ? "rgba(45,212,191,1)"
                      : usedPct < 100
                      ? "rgba(250,204,21,1)"
                      : "rgba(248,113,113,1)",
                }}
              />
            </View>
          )}

          {/* Insight */}
          <View
            style={{
              marginTop: 18,
              padding: 12,
              borderRadius: 18,
              backgroundColor: "rgba(15,15,15,0.22)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.06)",
              flexDirection: "row",
              gap: 10,
            }}
          >
            <Icon name="chatbubble-ellipses-outline" size={16} color="#FFF" />
            <Text
              style={{
                color: "rgba(255,255,255,0.75)",
                fontSize: 13,
                lineHeight: 20,
                flex: 1,
              }}
            >
              {insightText}
            </Text>
          </View>
        </BlurView>

        {/* LISTAGEM */}
        {!loading &&
          finalCategories.map((cat: any) => {
            const limit = Number(cat.limit_amount || 0);
            const spent = Number(cat.spent || 0);
            const pct = limit > 0 ? Math.min((spent / limit) * 100, 300) : 0;

            const barColor =
              pct < 70 ? "#A7F3D0" : pct < 100 ? "#FDE68A" : "#FCA5A5";

            const statusLabel =
              pct < 70 ? "Saudável" : pct < 100 ? "Atenção" : "Estourado";

            const isSubscriptions = cat.id === "builtin-subscriptions";

            return (
              <TouchableOpacity
                key={cat.id}
                activeOpacity={isSubscriptions ? 1 : 0.9}
                onPress={() =>
                  isSubscriptions
                    ? null
                    : router.push(`/finance/budget/edit-category?id=${cat.id}`)
                }
                style={{
                  marginTop: 10,
                  borderRadius: 22,
                  overflow: "hidden",
                }}
              >
                <BlurView
                  intensity={20}
                  tint="dark"
                  style={{
                    padding: 18,
                    borderRadius: 22,
                    backgroundColor: "rgba(15,15,15,0.20)",
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.06)",
                  }}
                >
                  {/* Título */}
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <Text
                      style={{
                        color: "#FFF",
                        fontSize: 16,
                        fontWeight: "700",
                      }}
                    >
                      {cat.title}
                    </Text>

                    {!isSubscriptions && (
                      <View
                        style={{
                          paddingHorizontal: 10,
                          paddingVertical: 3,
                          borderRadius: 999,
                          backgroundColor:
                            pct < 70
                              ? "rgba(22,163,74,0.25)"
                              : pct < 100
                              ? "rgba(234,179,8,0.25)"
                              : "rgba(220,38,38,0.25)",
                        }}
                      >
                        <Text
                          style={{
                            color:
                              pct < 70
                                ? "#A7F3D0"
                                : pct < 100
                                ? "#FDE68A"
                                : "#FCA5A5",
                            fontSize: 11,
                            fontWeight: "600",
                          }}
                        >
                          {statusLabel}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Valores */}
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginBottom: 10,
                    }}
                  >
                    <Text
                      style={{
                        color: "rgba(255,255,255,0.55)",
                        fontSize: 13,
                      }}
                    >
                      {currency(spent)} gasto
                    </Text>

                    {!isSubscriptions && (
                      <Text
                        style={{ color: "rgba(255,255,255,0.55)", fontSize: 13 }}
                      >
                        Limite {currency(limit)}
                      </Text>
                    )}

                    {isSubscriptions && (
                      <Text
                        style={{ color: "rgba(255,255,255,0.55)", fontSize: 13 }}
                      >
                        Total {currency(spent)}
                      </Text>
                    )}
                  </View>

                  {/* Barra */}
                  {!isSubscriptions && (
                    <View
                      style={{
                        width: "100%",
                        height: 10,
                        borderRadius: 999,
                        backgroundColor: "rgba(0,0,0,0.4)",
                        borderWidth: 1,
                        borderColor: "rgba(255,255,255,0.05)",
                        overflow: "hidden",
                      }}
                    >
                      <View
                        style={{
                          width: `${Math.min(pct, 100)}%`,
                          height: "100%",
                          backgroundColor: barColor,
                        }}
                      />
                    </View>
                  )}

                  <Text
                    style={{
                      color: "rgba(255,255,255,0.40)",
                      fontSize: 12,
                      marginTop: 8,
                    }}
                  >
                    {isSubscriptions
                      ? "Assinaturas são atualizadas automaticamente."
                      : limit > 0
                      ? `${pct.toFixed(0)}% do limite usado.`
                      : "Nenhum limite definido para esta categoria."}
                  </Text>
                </BlurView>
              </TouchableOpacity>
            );
          })}
      </ScrollView>

      {/* BOTÃO FLOANTE */}
      <View
        style={{
          position: "absolute",
          bottom: 28,
          right: 24,
        }}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setActionsOpen(true)}
          style={{
            width: 58,
            height: 58,
            borderRadius: 999,
            backgroundColor: "#FFF",
            justifyContent: "center",
            alignItems: "center",
            shadowColor: "#000",
            shadowOpacity: 0.3,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 },
            elevation: 6,
          }}
        >
          <Icon name="add" size={26} color="#000" />
        </TouchableOpacity>
      </View>

      {/* MODAL */}
      {actionsOpen && (
        <View
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.55)",
            justifyContent: "flex-end",
          }}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={() => setActionsOpen(false)}
          />

          <BlurView
            intensity={32}
            tint="dark"
            style={{
              borderTopLeftRadius: 26,
              borderTopRightRadius: 26,
              paddingHorizontal: 20,
              paddingTop: 20,
              paddingBottom: 32,
              borderTopWidth: 1,
              borderColor: "rgba(255,255,255,0.08)",
              backgroundColor: "rgba(15,15,15,0.35)",
            }}
          >
            <View
              style={{
                width: 40,
                height: 4,
                borderRadius: 999,
                backgroundColor: "rgba(255,255,255,0.28)",
                alignSelf: "center",
                marginBottom: 16,
              }}
            />

            <Text
              style={{
                color: "#FFF",
                fontSize: 17,
                fontWeight: "700",
                marginBottom: 4,
              }}
            >
              Ações rápidas
            </Text>

            <Text
              style={{
                color: "rgba(255,255,255,0.45)",
                fontSize: 13,
                marginBottom: 18,
              }}
            >
              Crie categorias ou registre gastos diretamente no seu orçamento.
            </Text>

            {/* Criar categoria */}
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => {
                setActionsOpen(false);
                router.push("/finance/budget/new-category");
              }}
              style={{
                marginTop: 6,
                paddingVertical: 14,
                paddingHorizontal: 14,
                borderRadius: 18,
                backgroundColor: "#FFF",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Icon name="albums-outline" size={20} color="#000" />
                <View>
                  <Text style={{ color: "#000", fontSize: 15, fontWeight: "700" }}>
                    Criar categoria
                  </Text>

                  <Text
                    style={{
                      color: "#4B5563",
                      fontSize: 11,
                      marginTop: 2,
                    }}
                  >
                    Defina um novo limite para o mês.
                  </Text>
                </View>
              </View>

              <Icon name="chevron-forward" size={18} color="#4B5563" />
            </TouchableOpacity>

            {/* Registrar gasto */}
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => {
                setActionsOpen(false);
                router.push("/finance/budget/new-expense");
              }}
              style={{
                marginTop: 12,
                paddingVertical: 14,
                paddingHorizontal: 14,
                borderRadius: 18,
                backgroundColor: "rgba(255,255,255,0.02)",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.06)",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Icon name="card-outline" size={20} color="#FFF" />
                <View>
                  <Text style={{ color: "#FFF", fontSize: 15, fontWeight: "700" }}>
                    Registrar gasto
                  </Text>
                  <Text
                    style={{
                      color: "rgba(255,255,255,0.45)",
                      fontSize: 11,
                      marginTop: 2,
                    }}
                  >
                    Adicione um gasto a uma categoria existente.
                  </Text>
                </View>
              </View>

              <Icon name="chevron-forward" size={18} color="#FFF" />
            </TouchableOpacity>
          </BlurView>
        </View>
      )}
    </Screen>
  );
}

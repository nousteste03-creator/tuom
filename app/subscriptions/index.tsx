import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  ActivityIndicator,
} from "react-native";
import { BlurView } from "expo-blur";
import { router } from "expo-router";

import Screen from "@/components/layout/Screen";
import Section from "@/components/layout/Section";
import SubscriptionCard from "@/components/cards/SubscriptionCard";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import type { Subscription } from "@/types/subscriptions";
import Icon from "@/components/ui/Icon";
import SegmentedControl from "@/components/ui/SegmentedControl";

// NOVOS COMPONENTES
import CategoryDistribution from "@/components/subscriptions/CategoryDistribution";
import BillingTimeline from "@/components/subscriptions/BillingTimeline";

const { width } = Dimensions.get("window");

const brandFont = Platform.select({
  ios: "SF Pro Display",
  default: "System",
});

type TabKey = "overview" | "list";

export default function SubscriptionsScreen() {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  const {
    subscriptions,
    loading,
    error,
    monthlyTotal,
    annualTotal,
    upcomingRenewals,
  } = useSubscriptions();

  const activeCount = subscriptions.length;
  const monthly = Number.isFinite(monthlyTotal) ? monthlyTotal : 0;
  const annual = Number.isFinite(annualTotal) ? annualTotal : 0;

  const avgPerSubscription = activeCount > 0 ? monthly / activeCount : 0;

  const biggestSubscription = subscriptions.reduce<Subscription | null>(
    (acc, curr) => {
      if (!acc) return curr;
      return curr.price > acc.price ? curr : acc;
    },
    null
  );

  // FILTRO: assinaturas próximas a vencer (7 dias)
  const subscriptionsNext7Days = subscriptions.filter((sub) => {
    const next = new Date(sub.next_billing);
    const today = new Date();
    const diffDays = (next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 7;
  });

  return (
    <Screen>
      <View style={{ flex: 1, backgroundColor: "#000000" }}>
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 110,
            gap: 22,
          }}
        >
          {/* HEADER */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 4,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: "#9CA3AF",
                  fontSize: 13,
                  marginBottom: 4,
                }}
              >
                Assinaturas
              </Text>

              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 22,
                  fontWeight: "700",
                  fontFamily: brandFont ?? undefined,
                }}
              >
                Seu painel de recorrências
              </Text>

              <Text
                style={{
                  color: "#6B7280",
                  fontSize: 12,
                  marginTop: 4,
                }}
              >
                {activeCount} ativa{activeCount === 1 ? "" : "s"} • R${" "}
                {monthly.toFixed(2)}/mês
              </Text>
            </View>
          </View>

          {/* SEGMENTED CONTROL */}
          <SegmentedControl
            segments={[
              { key: "overview", label: "Visão geral" },
              { key: "list", label: "Minhas assinaturas" },
            ]}
            value={activeTab}
            onChange={(key) => setActiveTab(key as TabKey)}
          />

          {/* ---------------- TAB: VISÃO GERAL ---------------- */}
          {activeTab === "overview" && (
            <>
              {/* CARD PRINCIPAL */}
              <View
                style={{
                  borderRadius: 26,
                  overflow: "hidden",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.12)",
                }}
              >
                <BlurView intensity={30} tint="dark" style={{ flex: 1 }}>
                  <View
                    style={{
                      padding: 18,
                      flexDirection: "row",
                      gap: 14,
                      alignItems: "center",
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          color: "#9CA3AF",
                          fontSize: 12,
                          marginBottom: 4,
                        }}
                      >
                        Resumo do mês
                      </Text>

                      <Text
                        style={{
                          color: "#FFFFFF",
                          fontSize: 24,
                          fontWeight: "700",
                          marginBottom: 4,
                        }}
                      >
                        R$ {monthly.toFixed(2)}/mês
                      </Text>

                      <Text
                        style={{
                          color: "#D1D5DB",
                          fontSize: 13,
                        }}
                      >
                        Projeção anual de{" "}
                        <Text style={{ fontWeight: "600" }}>
                          R$ {annual.toFixed(2)}
                        </Text>
                        .
                      </Text>
                    </View>

                    <View style={{ width: width * 0.32, gap: 10 }}>
                      <View
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 10,
                          borderRadius: 14,
                          backgroundColor: "rgba(255,255,255,0.06)",
                          borderWidth: 1,
                          borderColor: "rgba(255,255,255,0.12)",
                        }}
                      >
                        <Text
                          style={{
                            color: "#9CA3AF",
                            fontSize: 11,
                            marginBottom: 2,
                          }}
                        >
                          Ativas
                        </Text>

                        <Text
                          style={{
                            color: "#FFFFFF",
                            fontSize: 15,
                            fontWeight: "700",
                          }}
                        >
                          {activeCount}
                        </Text>
                      </View>

                      <View
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 10,
                          borderRadius: 14,
                          backgroundColor: "rgba(255,255,255,0.06)",
                          borderWidth: 1,
                          borderColor: "rgba(255,255,255,0.12)",
                        }}
                      >
                        <Text
                          style={{
                            color: "#9CA3AF",
                            fontSize: 11,
                            marginBottom: 2,
                          }}
                        >
                          Ticket médio
                        </Text>

                        <Text
                          style={{
                            color: "#FFFFFF",
                            fontSize: 15,
                            fontWeight: "700",
                          }}
                        >
                          R$ {avgPerSubscription.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </BlurView>
              </View>

              {/* VISÃO RÁPIDA */}
              <Section title="Visão rápida">
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 12 }}
                >
                  {/* MAIOR ASSINATURA */}
                  <View
                    style={{
                      width: 230,
                      borderRadius: 20,
                      backgroundColor: "rgba(255,255,255,0.06)",
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.12)",
                      padding: 14,
                    }}
                  >
                    <Text style={{ color: "#9CA3AF", fontSize: 12, marginBottom: 6 }}>
                      Maior assinatura
                    </Text>

                    <Text
                      style={{
                        color: "#FFFFFF",
                        fontSize: 18,
                        fontWeight: "700",
                        marginBottom: 2,
                      }}
                    >
                      {biggestSubscription ? biggestSubscription.service : "—"}
                    </Text>

                    <Text style={{ color: "#E5E7EB", fontSize: 13, marginBottom: 4 }}>
                      {biggestSubscription
                        ? `R$ ${biggestSubscription.price.toFixed(2)}/${
                            biggestSubscription.frequency === "monthly"
                              ? "mês"
                              : "ano"
                          }`
                        : "Cadastre uma assinatura para ver."}
                    </Text>

                    <Text style={{ color: "#6B7280", fontSize: 11 }}>
                      Analise se vale cada centavo.
                    </Text>
                  </View>

                  {/* PRÓXIMOS 7 DIAS */}
                  <View
                    style={{
                      width: 230,
                      borderRadius: 20,
                      backgroundColor: "rgba(255,255,255,0.06)",
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.12)",
                      padding: 14,
                    }}
                  >
                    <Text style={{ color: "#9CA3AF", fontSize: 12, marginBottom: 6 }}>
                      Próximos 7 dias
                    </Text>

                    <Text
                      style={{
                        color: "#FFFFFF",
                        fontSize: 18,
                        fontWeight: "700",
                        marginBottom: 2,
                      }}
                    >
                      {subscriptionsNext7Days.length} cobrança
                      {subscriptionsNext7Days.length === 1 ? "" : "s"}
                    </Text>

                    <Text style={{ color: "#E5E7EB", fontSize: 13, marginBottom: 4 }}>
                      Fique atento ao fluxo.
                    </Text>

                    <Text style={{ color: "#6B7280", fontSize: 11 }}>
                      Planeje antes que vença.
                    </Text>
                  </View>

                  {/* CTA FINANCE */}
                  <View
                    style={{
                      width: 240,
                      borderRadius: 20,
                      backgroundColor: "rgba(255,255,255,0.06)",
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.12)",
                      padding: 14,
                    }}
                  >
                    <Text style={{ color: "#E0F2FE", fontSize: 12, marginBottom: 6 }}>
                      Finanças pessoais + assinaturas
                    </Text>

                    <Text
                      style={{
                        color: "#F9FAFB",
                        fontSize: 15,
                        fontWeight: "600",
                        marginBottom: 4,
                      }}
                    >
                      Veja o mês completo.
                    </Text>

                    <Text style={{ color: "#BAE6FD", fontSize: 12, marginBottom: 8 }}>
                      Gastos reais + suas assinaturas em um único dashboard.
                    </Text>

                    <TouchableOpacity
                      onPress={() => router.push("/finance")}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 999,
                        backgroundColor: "#0EA5E9",
                        alignSelf: "flex-start",
                      }}
                    >
                      <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "600" }}>
                        Abrir painel
                      </Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </Section>

              {/* ---------------- NOVOS COMPONENTES: 50% | 50% ---------------- */}
              <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
                <View style={{ flex: 1 }}>
                  <CategoryDistribution subscriptions={subscriptions} />
                </View>

                <View style={{ flex: 1 }}>
                  <BillingTimeline items={subscriptionsNext7Days} />
                </View>
              </View>
            </>
          )}

          {/* ---------------- TAB: MINHAS ASSINATURAS (ADIÇÃO) ---------------- */}
          {activeTab === "list" && (
            <Section title="Minhas assinaturas">
              {loading && (
                <View style={{ paddingVertical: 40 }}>
                  <ActivityIndicator />
                </View>
              )}

              {!loading && subscriptions.length === 0 && (
                <View style={{ paddingVertical: 40 }}>
                  <Text
                    style={{
                      color: "#9CA3AF",
                      fontSize: 14,
                      textAlign: "center",
                    }}
                  >
                    Você ainda não cadastrou nenhuma assinatura.
                  </Text>
                </View>
              )}

              {!loading && subscriptions.length > 0 && (
                <View style={{ gap: 12 }}>
                  {subscriptions.map((sub) => (
                    <SubscriptionCard key={sub.id} subscription={sub} />
                  ))}
                </View>
              )}
            </Section>
          )}
        </ScrollView>

        {/* BOTÃO FLUTUANTE */}
        <TouchableOpacity
          onPress={() => router.push("/subscriptions/add")}
          activeOpacity={0.9}
          style={{
            position: "absolute",
            right: 24,
            bottom: 24,
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: "#FFFFFF",
            justifyContent: "center",
            alignItems: "center",
            shadowColor: "#000",
            shadowOpacity: 0.25,
            shadowOffset: { width: 0, height: 8 },
            shadowRadius: 16,
            elevation: 6,
          }}
        >
          <Icon name="add" size={26} color="#020617" />
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

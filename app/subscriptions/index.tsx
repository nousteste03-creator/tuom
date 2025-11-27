// app/subscriptions/index.tsx
import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
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

  return (
    <Screen>
      <ImageBackground
        source={require("@/assets/images/home-bg.png")}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.35)" }}>
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

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <TouchableOpacity
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.12)",
                    backgroundColor: "rgba(15,15,15,0.85)",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Icon name="funnel-outline" size={16} color="#fff" />
                </TouchableOpacity>
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
                      {/* LADO ESQUERDO — TOTAL */}
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

                      {/* LADO DIREITO — MINI CARDS */}
                      <View style={{ width: width * 0.32, gap: 10 }}>
                        {/* CARD: ASSINATURAS ATIVAS */}
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

                        {/* CARD: TICKET MÉDIO */}
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
                    {/* CARD: MAIOR ASSINATURA */}
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
                      <Text
                        style={{
                          color: "#9CA3AF",
                          fontSize: 12,
                          marginBottom: 6,
                        }}
                      >
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
                        {biggestSubscription
                          ? biggestSubscription.service
                          : "—"}
                      </Text>

                      <Text
                        style={{
                          color: "#E5E7EB",
                          fontSize: 13,
                          marginBottom: 4,
                        }}
                      >
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

                    {/* CARD: PRÓXIMOS 7 DIAS */}
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
                      <Text
                        style={{
                          color: "#9CA3AF",
                          fontSize: 12,
                          marginBottom: 6,
                        }}
                      >
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
                        {upcomingRenewals.length} cobrança
                        {upcomingRenewals.length === 1 ? "" : "s"}
                      </Text>

                      <Text
                        style={{
                          color: "#E5E7EB",
                          fontSize: 13,
                          marginBottom: 4,
                        }}
                      >
                        Fique atento ao fluxo.
                      </Text>

                      <Text style={{ color: "#6B7280", fontSize: 11 }}>
                        Planeje antes que vença.
                      </Text>
                    </View>

                    {/* CTA PARA TELA FINANCE */}
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
                      <Text
                        style={{
                          color: "#E0F2FE",
                          fontSize: 12,
                          marginBottom: 6,
                        }}
                      >
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

                      <Text
                        style={{
                          color: "#BAE6FD",
                          fontSize: 12,
                          marginBottom: 8,
                        }}
                      >
                        Gastos reais + suas assinaturas em um único dashboard.
                      </Text>

                      <TouchableOpacity
                        onPress={() => router.push("/(tabs)/Finance")}
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 999,
                          backgroundColor: "#0EA5E9",
                          alignSelf: "flex-start",
                        }}
                      >
                        <Text
                          style={{
                            color: "#FFFFFF",
                            fontSize: 12,
                            fontWeight: "600",
                          }}
                        >
                          Abrir painel
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </ScrollView>
                </Section>

                {/* PRÓXIMOS VENCIMENTOS */}
                <Section title="Próximos vencimentos">
                  {upcomingRenewals.length === 0 && !loading && (
                    <Text style={{ color: "#9CA3AF", fontSize: 13 }}>
                      Nenhuma cobrança prevista.
                    </Text>
                  )}

                  {upcomingRenewals.map((s) => (
                    <TouchableOpacity
                      key={s.id}
                      activeOpacity={0.85}
                      onPress={() => router.push(`/subscriptions/${s.id}`)}
                      style={{
                        paddingVertical: 8,
                        borderBottomWidth: 1,
                        borderBottomColor: "rgba(255,255,255,0.06)",
                      }}
                    >
                      <Text
                        style={{
                          color: "#FFFFFF",
                          fontSize: 14,
                          marginBottom: 2,
                        }}
                      >
                        {s.service}
                      </Text>
                      <Text
                        style={{
                          color: "#D1D5DB",
                          fontSize: 12,
                        }}
                      >
                        R$ {s.price.toFixed(2)} • vence{" "}
                        {s.next_billing}
                      </Text>
                    </TouchableOpacity>
                  ))}

                  {loading && (
                    <Text style={{ color: "#9CA3AF", fontSize: 13 }}>
                      Carregando...
                    </Text>
                  )}
                </Section>

                {/* LISTA HORIZONTAL */}
                <Section
                  title="Suas assinaturas"
                  rightElement={
                    loading ? (
                      <ActivityIndicator size="small" color="#9CA3AF" />
                    ) : undefined
                  }
                >
                  {error && (
                    <Text
                      style={{
                        color: "#FCA5A5",
                        fontSize: 13,
                        marginBottom: 8,
                      }}
                    >
                      Erro ao carregar suas assinaturas.
                    </Text>
                  )}

                  {!loading && !error && activeCount === 0 && (
                    <Text style={{ color: "#9CA3AF", fontSize: 13 }}>
                      Adicione sua primeira assinatura.
                    </Text>
                  )}

                  {activeCount > 0 && (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ gap: 12, paddingRight: 8 }}
                    >
                      {subscriptions.map((s) => (
                        <TouchableOpacity
                          key={s.id}
                          activeOpacity={0.9}
                          onPress={() => router.push(`/subscriptions/${s.id}`)}
                          style={{ width: width - 60 }}
                        >
                          <SubscriptionCard subscription={s} />
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                </Section>
              </>
            )}

            {/* ---------------- TAB: LISTA ---------------- */}
            {activeTab === "list" && (
              <>
                <Section
                  title="Minhas assinaturas"
                  rightElement={
                    loading ? (
                      <ActivityIndicator size="small" color="#9CA3AF" />
                    ) : undefined
                  }
                >
                  {error && (
                    <Text
                      style={{
                        color: "#FCA5A5",
                        fontSize: 13,
                        marginBottom: 8,
                      }}
                    >
                      Erro ao carregar.
                    </Text>
                  )}

                  {!loading && !error && activeCount === 0 && (
                    <Text style={{ color: "#9CA3AF", fontSize: 13 }}>
                      Nenhuma assinatura cadastrada.
                    </Text>
                  )}

                  {!loading &&
                    !error &&
                    subscriptions.map((s) => (
                      <TouchableOpacity
                        key={s.id}
                        activeOpacity={0.9}
                        onPress={() => router.push(`/subscriptions/${s.id}`)}
                        style={{ marginBottom: 12 }}
                      >
                        <SubscriptionCard subscription={s} />
                      </TouchableOpacity>
                    ))}
                </Section>
              </>
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
      </ImageBackground>
    </Screen>
  );
}

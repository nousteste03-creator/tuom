// app/subscriptions/[id].tsx
import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  Platform,
  StyleSheet,
  Alert,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { BlurView } from "expo-blur";

import Screen from "@/components/layout/Screen";
import Section from "@/components/layout/Section";
import Icon from "@/components/ui/Icon";
import { supabase } from "@/lib/supabase";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import type { Subscription } from "@/types/subscriptions";
import { deleteSubscription } from "@/services/subscriptions";

const { width } = Dimensions.get("window");

const brandFont = Platform.select({
  ios: "SF Pro Display",
  default: "System",
});

// TODO: no futuro, essa flag vem do Supabase (plano Pro / Free)
const IS_PRO = false;

export default function SubscriptionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const {
    subscriptions,
    monthlyTotal,
    refetch,
  } = useSubscriptions();

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  // placeholders para a lógica futura de preço / API externa
  const [priceTrend, setPriceTrend] = useState<{
    direction: "up" | "down" | "stable";
    percent: number;
  } | null>(null);

  useEffect(() => {
    async function loadSubscription() {
      if (!id) return;

      setLoading(true);

      // tenta pegar da lista em memória primeiro
      const fromHook = subscriptions.find((s) => s.id === id);

      if (fromHook) {
        setSubscription(fromHook);
        // placeholder de trend só para ficarmos com visual pronto
        setPriceTrend({
          direction: "up",
          percent: 8,
        });
        setLoading(false);
        return;
      }

      // fallback: buscar no Supabase
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.log("ERROR LOADING SUBSCRIPTION DETAIL:", error);
        setSubscription(null);
      } else {
        setSubscription(data as Subscription);
        setPriceTrend({
          direction: "up",
          percent: 8,
        });
      }

      setLoading(false);
    }

    loadSubscription();
  }, [id, subscriptions]);

  if (!id) {
    return (
      <Screen>
        <View
          style={{
            flex: 1,
            backgroundColor: "#050505",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white" }}>
            Assinatura não encontrada.
          </Text>
        </View>
      </Screen>
    );
  }

  const price = subscription?.price ?? 0;
  const frequency = subscription?.frequency ?? "monthly";

  const monthlyPrice =
    frequency === "yearly" ? price / 12 : price;

  const annualPrice =
    frequency === "yearly" ? price : price * 12;

  const impactPercent =
    monthlyTotal > 0 ? (monthlyPrice / monthlyTotal) * 100 : 0;

  // cor da faixa de impacto (sempre liberado)
  let impactColor = "#22C55E"; // verde
  if (impactPercent >= 15) {
    impactColor = "#EF4444"; // vermelho
  } else if (impactPercent >= 7) {
    impactColor = "#FBBF24"; // amarelo
  }

  const impactLabel =
    impactPercent === 0
      ? "Impacto ainda não calculado"
      : `Essa assinatura representa ~${impactPercent.toFixed(
          1
        )}% do seu mês.`;

  // price trend visual (Pro)
  let trendLabel = "Sem dados ainda.";
  let trendColor = "#9CA3AF";

  if (priceTrend) {
    if (priceTrend.direction === "up") {
      trendLabel = `Subiu ~${priceTrend.percent.toFixed(
        1
      )}% nos últimos meses.`;
      trendColor = "#F97316";
    } else if (priceTrend.direction === "down") {
      trendLabel = `Caiu ~${priceTrend.percent.toFixed(
        1
      )}% nos últimos meses.`;
      trendColor = "#22C55E";
    } else {
      trendLabel = "Estável nos últimos meses.";
      trendColor = "#9CA3AF";
    }
  }

  async function handleDelete() {
    if (!id) return;

    Alert.alert(
      "Cancelar assinatura",
      "Tem certeza que deseja excluir essa assinatura da TUÖM? Isso não cancela no banco/serviço, apenas aqui no app.",
      [
        { text: "Manter", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await deleteSubscription(id);
              if (res?.error) {
                console.log("DELETE ERROR:", res.error);
                Alert.alert(
                  "Erro",
                  "Não foi possível excluir agora. Tente novamente."
                );
                return;
              }
              await refetch?.();
              router.replace("/(tabs)/subscriptions");
            } catch (err) {
              console.log("DELETE ERROR:", err);
              Alert.alert(
                "Erro",
                "Não foi possível excluir agora. Tente novamente."
              );
            }
          },
        },
      ]
    );
  }

  return (
    <Screen>
      <ImageBackground
        source={require("@/assets/images/home-bg.png")}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 40,
            gap: 22,
          }}
        >
          {/* HEADER SUPERIOR */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 4,
            }}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.18)",
                backgroundColor: "rgba(0,0,0,0.5)",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 12,
              }}
            >
              <Icon name="chevron-back" size={18} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: "#9CA3AF",
                  fontSize: 12,
                  marginBottom: 2,
                }}
              >
                Assinatura
              </Text>
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 18,
                  fontWeight: "600",
                }}
                numberOfLines={1}
              >
                {subscription?.service ?? "Carregando..."}
              </Text>
            </View>

            {/* CTA PRO discreto no topo */}
            <TouchableOpacity
              onPress={() => {
                // TODO: navegar para tela de planos
              }}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: "rgba(94,234,212,0.7)",
                backgroundColor: "rgba(15,23,42,0.9)",
              }}
            >
              <Text
                style={{
                  color: "#A5F3FC",
                  fontSize: 12,
                  fontWeight: "600",
                }}
              >
                TUÖM Pro
              </Text>
            </TouchableOpacity>
          </View>

          {/* CARD PRINCIPAL / HERO DA ASSINATURA */}
          <View
            style={{
              borderRadius: 26,
              overflow: "hidden",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.10)",
            }}
          >
            <BlurView intensity={32} tint="dark" style={{ flex: 1 }}>
              <View
                style={{
                  padding: 20,
                  flexDirection: "row",
                  gap: 16,
                }}
              >
                {/* ÍCONE / INICIAL */}
                <View
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 16,
                    backgroundColor: "rgba(15,23,42,0.9)",
                    justifyContent: "center",
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: "rgba(148,163,184,0.6)",
                  }}
                >
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontSize: 26,
                      fontWeight: "700",
                    }}
                  >
                    {subscription?.service
                      ? subscription.service.charAt(0)
                      : "?"}
                  </Text>
                </View>

                {/* VALORES PRINCIPAIS */}
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: "#9CA3AF",
                      fontSize: 13,
                      marginBottom: 4,
                    }}
                  >
                    Valor atual
                  </Text>
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontSize: 24,
                      fontWeight: "700",
                      marginBottom: 4,
                    }}
                  >
                    R$ {price.toFixed(2)}
                    {frequency === "monthly" ? "/mês" : "/ano"}
                  </Text>
                  <Text
                    style={{
                      color: "#E5E7EB",
                      fontSize: 13,
                    }}
                  >
                    Equivalente a{" "}
                    <Text style={{ fontWeight: "600" }}>
                      R$ {monthlyPrice.toFixed(2)}/mês
                    </Text>{" "}
                    no seu orçamento.
                  </Text>
                </View>
              </View>

              {/* FAIXA DE IMPACTO NO ORÇAMENTO (GRÁTIS) */}
              <View
                style={{
                  paddingHorizontal: 20,
                  paddingBottom: 18,
                }}
              >
                <Text
                  style={{
                    color: "#9CA3AF",
                    fontSize: 12,
                    marginBottom: 6,
                  }}
                >
                  Impacto no seu mês
                </Text>

                <View
                  style={{
                    height: 10,
                    borderRadius: 999,
                    backgroundColor: "rgba(15,23,42,0.9)",
                    overflow: "hidden",
                  }}
                >
                  <View
                    style={{
                      height: "100%",
                      width: `${Math.min(impactPercent, 100)}%`,
                      backgroundColor: impactColor,
                    }}
                  />
                </View>

                <Text
                  style={{
                    color: "#E5E7EB",
                    fontSize: 12,
                    marginTop: 6,
                  }}
                >
                  {impactLabel}
                </Text>
              </View>
            </BlurView>
          </View>

          {/* CARDS HORIZONTAIS — VISÃO GERAL / PRO */}
          <Section title="Visão geral da assinatura">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12 }}
            >
              {/* Card 1: Economia ao cancelar */}
              <View
                style={{
                  width: 220,
                  borderRadius: 20,
                  backgroundColor: "rgba(15,23,42,0.92)",
                  borderWidth: 1,
                  borderColor: "rgba(148,163,184,0.35)",
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
                  Impacto anual
                </Text>
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 18,
                    fontWeight: "700",
                    marginBottom: 4,
                  }}
                >
                  R$ {annualPrice.toFixed(2)}/ano
                </Text>
                <Text
                  style={{ color: "#D1D5DB", fontSize: 12 }}
                >
                  Se você cancelasse hoje, liberaria esse valor
                  no seu ano.
                </Text>
              </View>

              {/* Card 2: Comparativo interno */}
              <View
                style={{
                  width: 220,
                  borderRadius: 20,
                  backgroundColor: "rgba(15,23,42,0.92)",
                  borderWidth: 1,
                  borderColor: "rgba(148,163,184,0.35)",
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
                  Peso no seu orçamento
                </Text>
                <Text
                  style={{
                    color: impactColor,
                    fontSize: 18,
                    fontWeight: "700",
                    marginBottom: 4,
                  }}
                >
                  {impactPercent.toFixed(1)}%
                </Text>
                <Text
                  style={{ color: "#D1D5DB", fontSize: 12 }}
                >
                  Em relação ao total de assinaturas
                  cadastradas.
                </Text>
              </View>

              {/* Card 3: Tendência de preço (Pro) */}
              <View
                style={{
                  width: 240,
                  borderRadius: 20,
                  backgroundColor: "rgba(15,23,42,0.88)",
                  borderWidth: 1,
                  borderColor: "rgba(94,234,212,0.5)",
                  padding: 14,
                  overflow: "hidden",
                }}
              >
                <BlurView
                  intensity={IS_PRO ? 0 : 24}
                  tint="dark"
                  style={{ ...StyleSheet.absoluteFillObject }}
                />
                <Text
                  style={{
                    color: "#A5F3FC",
                    fontSize: 12,
                    marginBottom: 6,
                  }}
                >
                  Tendência de preço (Pro)
                </Text>
                <Text
                  style={{
                    color: trendColor,
                    fontSize: 16,
                    fontWeight: "600",
                    marginBottom: 4,
                  }}
                >
                  {trendLabel}
                </Text>
                <Text
                  style={{
                    color: "#E5E7EB",
                    fontSize: 12,
                    marginBottom: 8,
                  }}
                >
                  Monitoramos reajustes automáticos em tempo
                  real usando seus dados bancários (Open
                  Finance) e fontes públicas.
                </Text>

                {!IS_PRO && (
                  <TouchableOpacity
                    onPress={() => {
                      // TODO: navegar para planos
                    }}
                    style={{
                      alignSelf: "flex-start",
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 999,
                      backgroundColor: "#0EA5E9",
                    }}
                  >
                    <Text
                      style={{
                        color: "white",
                        fontSize: 12,
                        fontWeight: "600",
                      }}
                    >
                      Desbloquear no TUÖM Pro
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          </Section>

          {/* DETALHES TÉCNICOS DA ASSINATURA */}
          <Section title="Detalhes da assinatura">
            <View
              style={{
                backgroundColor: "rgba(15,15,15,0.96)",
                borderRadius: 18,
                borderWidth: 1,
                borderColor: "rgba(31,41,55,0.8)",
                padding: 16,
                gap: 10,
              }}
            >
              <DetailRow
                label="Serviço"
                value={subscription?.service ?? "-"}
              />
              <DetailRow
                label="Preço atual"
                value={
                  subscription
                    ? `R$ ${subscription.price.toFixed(2)}`
                    : "-"
                }
              />
              <DetailRow
                label="Frequência"
                value={
                  subscription?.frequency === "yearly"
                    ? "Anual"
                    : "Mensal"
                }
              />
              <DetailRow
                label="Próxima cobrança"
                value={subscription?.next_billing ?? "-"}
              />
              <DetailRow
                label="Forma de pagamento"
                value={subscription?.payment_method ?? "Não informado"}
              />
            </View>
          </Section>

          {/* BLOCO FINANCEIRO AVANÇADO (IA) — PRO */}
          <Section title="Inteligência financeira (TUÖM Pro)">
            <View
              style={{
                borderRadius: 20,
                overflow: "hidden",
                borderWidth: 1,
                borderColor: "rgba(94,234,212,0.6)",
              }}
            >
              <BlurView intensity={28} tint="dark" style={{ flex: 1 }}>
                <View style={{ padding: 16 }}>
                  <Text
                    style={{
                      color: "#E5E7EB",
                      fontSize: 15,
                      fontWeight: "600",
                      marginBottom: 8,
                    }}
                  >
                    Ajuste automático das suas contas
                  </Text>
                  <Text
                    style={{
                      color: "#9CA3AF",
                      fontSize: 13,
                      marginBottom: 8,
                    }}
                  >
                    A IA da TUÖM ajuda você a:
                  </Text>

                  <View style={{ gap: 4, marginBottom: 10 }}>
                    <Bullet>
                      Separar valores a pagar e a receber por
                      semana.
                    </Bullet>
                    <Bullet>
                      Sugerir cortes inteligentes sem afetar
                      seu dia a dia.
                    </Bullet>
                    <Bullet>
                      Usar dados reais do banco (Open Finance)
                      para detectar aumentos ocultos.
                    </Bullet>
                  </View>

                  {!IS_PRO && (
                    <View
                      style={{
                        marginTop: 8,
                        padding: 10,
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor: "rgba(56,189,248,0.5)",
                        backgroundColor: "rgba(15,23,42,0.9)",
                      }}
                    >
                      <Text
                        style={{
                          color: "#E0F2FE",
                          fontSize: 13,
                          marginBottom: 6,
                        }}
                      >
                        Disponível apenas no TUÖM Pro.
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          // TODO: navegação para tela de upgrade
                        }}
                        style={{
                          alignSelf: "flex-start",
                          paddingHorizontal: 14,
                          paddingVertical: 8,
                          borderRadius: 999,
                          backgroundColor: "#0EA5E9",
                        }}
                      >
                        <Text
                          style={{
                            color: "white",
                            fontSize: 13,
                            fontWeight: "600",
                          }}
                        >
                          Conhecer benefícios do Pro
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </BlurView>
            </View>
          </Section>

          {/* AÇÕES */}
          <View
            style={{
              flexDirection: "row",
              gap: 10,
              marginTop: 4,
            }}
          >
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: "#FFFFFF",
                borderRadius: 999,
                paddingVertical: 12,
                alignItems: "center",
              }}
              onPress={() => {
                if (!id) return;
                router.push(`/subscriptions/edit/${id}`);
              }}
            >
              <Text
                style={{
                  color: "#111827",
                  fontSize: 14,
                  fontWeight: "700",
                }}
              >
                Editar assinatura
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1,
                borderRadius: 999,
                paddingVertical: 12,
                alignItems: "center",
                borderWidth: 1,
                borderColor: "rgba(248,113,113,0.6)",
                backgroundColor: "rgba(127,29,29,0.35)",
              }}
              onPress={handleDelete}
            >
              <Text
                style={{
                  color: "#FCA5A5",
                  fontSize: 14,
                  fontWeight: "600",
                }}
              >
                Cancelar / excluir
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ImageBackground>
    </Screen>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 4,
      }}
    >
      <Text
        style={{
          color: "#9CA3AF",
          fontSize: 13,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          color: "#E5E7EB",
          fontSize: 13,
          textAlign: "right",
          maxWidth: "60%",
        }}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={{
        flexDirection: "row",
        gap: 6,
        alignItems: "flex-start",
      }}
    >
      <Text
        style={{
          color: "#38BDF8",
          marginTop: 1,
        }}
      >
        •
      </Text>
      <Text
        style={{
          color: "#E5E7EB",
          fontSize: 13,
          flex: 1,
        }}
      >
        {children}
      </Text>
    </View>
  );
}

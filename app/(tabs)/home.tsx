import { useEffect, useState, useRef } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  Platform,
  FlatList,
} from "react-native";
import { BlurView } from "expo-blur";
import Screen from "@/components/layout/Screen";
import Section from "@/components/layout/Section";
import SubscriptionCard from "@/components/cards/SubscriptionCard";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import Icon from "@/components/ui/Icon";
import { supabase } from "@/lib/supabase";
import type { Subscription } from "@/types/subscriptions";

const { width } = Dimensions.get("window");

// FRASES ROTATIVAS (cada uma vira um SLIDE do carrossel)
const PHRASES = [
  "Dê o primeiro passo.",
  "Tenha clareza sobre onde seu dinheiro está indo.",
  "Controle seus custos.",
  "Seu mês pode ser mais leve com organização financeira.",
  "Pequenos ajustes, grandes impactos no seu ano."
];

const MICROCARDS = [
  {
    id: "mc-1",
    tag: "Consciência de gastos",
    title: "Você lembra de todas as suas assinaturas?",
    body: "A maioria das pessoas subestima em 2x o quanto paga por mês em serviços recorrentes.",
  },
  {
    id: "mc-2",
    tag: "Impacto anual",
    title: "Seu ano em assinaturas",
    body: "Somando todos os serviços, você poderia transformar parte desse valor em uma meta concreta.",
  },
  {
    id: "mc-3",
    tag: "Otimização simples",
    title: "Cortar 1–2 serviços já muda o jogo",
    body: "Cancelar apenas duas assinaturas pouco usadas pode liberar centenas de reais por ano.",
  },
];

const brandFont = Platform.select({
  ios: "SF Pro Display",
  default: "System",
});

export default function HomeTab() {
  const {
    subscriptions,
    loading,
    error,
    monthlyTotal,
    annualTotal,
    upcomingRenewals,
  } = useSubscriptions();

  const [userName, setUserName] = useState<string | null>(null);
  const [greeting, setGreeting] = useState("Olá");

  // Saudação
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Bom dia");
    else if (hour < 18) setGreeting("Boa tarde");
    else setGreeting("Boa noite");
  }, []);

  // Nome do user
  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      const user = data.user;

      if (!user) return;

      const metadataName =
        (user.user_metadata as any)?.name ||
        (user.email ? user.email.split("@")[0] : null);

      setUserName(metadataName);
    }

    loadUser();
  }, []);

  const hasSubscriptions = subscriptions.length > 0;
const carouselRef = useRef<FlatList>(null);
const [currentIndex, setCurrentIndex] = useState(0);

// AUTOPLAY: troca de frase a cada 6s
useEffect(() => {
  const interval = setInterval(() => {
    let nextIndex = currentIndex + 1;

    if (nextIndex >= PHRASES.length) {
      nextIndex = 0; // volta ao início
    }

    carouselRef.current?.scrollToOffset({
      offset: nextIndex * (width - 40),
      animated: true,
    });

    setCurrentIndex(nextIndex);
  }, 6000);

  return () => clearInterval(interval);

}, [currentIndex]);
  return (
    <Screen>
      {/* FUNDO */}
      <ImageBackground
        source={require("@/assets/images/home-bg.png")}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 60,
            gap: 28,
          }}
        >
          {/* HEADER */}
<View
  style={{
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 4,
  }}
>
  {/* ESQUERDA — saudação */}
  <View style={{ flex: 1 }}>
    <Text style={{ color: "#A3A3A3", fontSize: 13 }}>{greeting},</Text>
    <Text
      style={{
        color: "#FFFFFF",
        fontSize: 22,
        fontWeight: "700",
        marginTop: 2,
      }}
    >
      {userName ?? "usuário"}
    </Text>
  </View>

  {/* CENTRO — SEMPRE NO MEIO */}
  <View
    style={{
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      pointerEvents: "none", // evita clique
    }}
  >
    <Text
      style={{
        color: "#FFFFFF",
        fontSize: 20,
        letterSpacing: 4,
        fontFamily: brandFont,
      }}
    >
      NÖUS
    </Text>
  </View>

  {/* DIREITA — ícones alinhados à direita */}
  <View
    style={{
      flex: 1,
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "center",
      gap: 10,
    }}
  >
    <TouchableOpacity
      style={{
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.12)",
        backgroundColor: "rgba(255,255,255,0.06)",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Icon name="notifications-outline" size={16} color="#fff" />
    </TouchableOpacity>

    <TouchableOpacity
      style={{
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.12)",
        backgroundColor: "rgba(255,255,255,0.06)",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Icon name="settings-outline" size={16} color="#fff" />
    </TouchableOpacity>
  </View>
</View>

          {/* HERO — COM BLUR E CARROSSEL */}
          <View style={{ borderRadius: 26, overflow: "hidden" }}>
            <ImageBackground
              source={require("@/assets/images/home-bg.png")}
              style={{
                height: width * 0.47,
                justifyContent: "center",
              }}
              imageStyle={{ opacity: 0.7 }}
            >
              <BlurView intensity={30} tint="dark" style={{ flex: 1 }}>
                <View style={{ flex: 1, padding: 20 }}>
                  <Text
                    style={{
                      color: "#D1D5DB",
                      fontSize: 13,
                      marginBottom: 10,
                    }}
                  >
                    Clareza financeira
                  </Text>

                  {/* CARROSSEL DE FRASES */}
                  <FlatList
  data={PHRASES}
  keyExtractor={(item, index) => String(index)}
  horizontal
  pagingEnabled
  showsHorizontalScrollIndicator={false}
  snapToAlignment="center"
  decelerationRate="fast"
  ref={carouselRef}
  onScroll={(e) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / (width - 40));
    setCurrentIndex(index);
  }}
  renderItem={({ item }) => (
    <View style={{ width: width - 40 }}>
      <Text
        style={{
          color: "#FFFFFF",
          fontSize: 22,
          fontWeight: "700",
          marginBottom: 16,
        }}
      >
        {item}
      </Text>
    </View>
  )}
/>

                  <TouchableOpacity
                    style={{
                      alignSelf: "flex-start",
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      backgroundColor: "#FFFFFF",
                      borderRadius: 999,
                      marginTop: 10,
                    }}
                  >
                    <Text
                      style={{
                        color: "#111827",
                        fontSize: 14,
                        fontWeight: "600",
                      }}
                    >
                      Ver detalhes do mês
                    </Text>
                  </TouchableOpacity>
                </View>
              </BlurView>
            </ImageBackground>
          </View>

          {/* TOTAL MENSAL E ANUAL */}
          <View
            style={{
              flexDirection: "row",
              gap: 14,
            }}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: "rgba(255,255,255,0.06)",
                borderRadius: 18,
                padding: 16,
                borderColor: "rgba(255,255,255,0.08)",
                borderWidth: 1,
              }}
            >
              <Text style={{ color: "#9CA3AF", fontSize: 12 }}>Total mensal</Text>
              <Text
                style={{
                  color: "white",
                  fontSize: 18,
                  fontWeight: "700",
                  marginTop: 6,
                }}
              >
                R$ {monthlyTotal.toFixed(2)}/mês
              </Text>
            </View>

            <View
              style={{
                flex: 1,
                backgroundColor: "rgba(255,255,255,0.06)",
                borderRadius: 18,
                padding: 16,
                borderColor: "rgba(255,255,255,0.08)",
                borderWidth: 1,
              }}
            >
              <Text style={{ color: "#9CA3AF", fontSize: 12 }}>Total anual</Text>
              <Text
                style={{
                  color: "white",
                  fontSize: 18,
                  fontWeight: "700",
                  marginTop: 6,
                }}
              >
                R$ {annualTotal.toFixed(2)}/ano
              </Text>
            </View>
          </View>

          {/* PRÓXIMOS VENCIMENTOS */}
          <Section title="Próximos vencimentos">
            {upcomingRenewals.length === 0 && !loading && (
              <Text style={{ color: "#9CA3AF", fontSize: 14 }}>
                Nenhuma cobrança prevista nos próximos 7 dias.
              </Text>
            )}

            {upcomingRenewals.map((s) => (
              <View
                key={s.id}
                style={{
                  paddingVertical: 10,
                  borderBottomWidth: 1,
                  borderBottomColor: "rgba(255,255,255,0.05)",
                }}
              >
                <Text style={{ color: "white", fontSize: 15 }}>{s.service}</Text>
                <Text style={{ color: "#D1D5DB", fontSize: 13 }}>
                  R$ {s.price.toFixed(2)} • {s.frequency} • vence em{" "}
                  {s.next_billing}
                </Text>
              </View>
            ))}
          </Section>

          {/* ASSINATURAS */}
          <Section title="Suas assinaturas">
            {subscriptions.map((s) => (
              <View key={s.id} style={{ marginBottom: 12 }}>
                <SubscriptionCard subscription={s} />
              </View>
            ))}
          </Section>

          {/* MICROCARDS */}
          <Section title="Insights rápidos">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12 }}
            >
              {MICROCARDS.map((card) => (
                <View
                  key={card.id}
                  style={{
                    width: 260,
                    backgroundColor: "rgba(255,255,255,0.05)",
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.08)",
                    borderRadius: 20,
                    padding: 16,
                  }}
                >
                  <Text
                    style={{
                      color: "#6B7280",
                      fontSize: 12,
                      textTransform: "uppercase",
                      marginBottom: 6,
                    }}
                  >
                    {card.tag}
                  </Text>
                  <Text
                    style={{
                      color: "white",
                      fontSize: 16,
                      fontWeight: "600",
                      marginBottom: 6,
                    }}
                  >
                    {card.title}
                  </Text>
                  <Text style={{ color: "#9CA3AF", fontSize: 13 }}>
                    {card.body}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </Section>
        </ScrollView>
      </ImageBackground>
    </Screen>
  );
}

import { useEffect, useState, useRef } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Platform,
  FlatList,
} from "react-native";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";

import Screen from "@/components/layout/Screen";
import Section from "@/components/layout/Section";
import SubscriptionCard from "@/components/cards/SubscriptionCard";
import HomeFinanceCard from "@/components/home/HomeFinanceCard";
import HomePlanningCard from "@/components/home/HomePlanningCard";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import Icon from "@/components/ui/Icon";
import { supabase } from "@/lib/supabase";

const { width } = Dimensions.get("window");

const PHRASES = [
  "Dê o primeiro passo.",
  "Tenha clareza sobre onde seu dinheiro está indo.",
  "Controle seus custos.",
  "Seu mês pode ser mais leve com organização financeira.",
  "Pequenos ajustes, grandes impactos no seu ano.",
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

export default function HomeScreen() {
  const router = useRouter();

  const {
    subscriptions,
    loading,
    monthlyTotal,
    annualTotal,
    upcomingRenewals,
  } = useSubscriptions();

  const [userName, setUserName] = useState<string | null>(null);
  const [greeting, setGreeting] = useState("Olá");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Bom dia");
    else if (hour < 18) setGreeting("Boa tarde");
    else setGreeting("Boa noite");
  }, []);

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

  const carouselRef = useRef<FlatList<string>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const next =
        currentIndex + 1 >= PHRASES.length ? 0 : currentIndex + 1;

      carouselRef.current?.scrollToOffset({
        offset: next * (width - 40),
        animated: true,
      });

      setCurrentIndex(next);
    }, 6000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 80,
          gap: 28,
          backgroundColor: "#000000", // fundo preto
        }}
      >
        {/* ================= HEADER ================= */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ color: "#A3A3A3", fontSize: 13 }}>{greeting},</Text>
            <Text style={{ color: "#FFFFFF", fontSize: 22, fontWeight: "700" }}>
              {userName ?? "usuário"}
            </Text>
          </View>

          <View style={{ flex: 1, alignItems: "center" }}>
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 20,
                letterSpacing: 4,
                fontFamily: brandFont,
              }}
            >
              TUÖM
            </Text>
          </View>

          <View
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 12,
            }}
          >
            <TouchableOpacity
              onPress={() => router.push("/menu")}
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
              <Icon name="menu" size={16} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/home/settings")}
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
              <Icon name="settings-outline" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ================= HERO ================= */}
        <View style={{ borderRadius: 26, overflow: "hidden" }}>
          <BlurView intensity={28} tint="dark" style={{ flex: 1, padding: 20 }}>
            <Text style={{ color: "#9CA3AF", fontSize: 13, marginBottom: 10 }}>
              Clareza financeira
            </Text>

            <FlatList
              data={PHRASES}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(_, i) => String(i)}
              ref={carouselRef}
              renderItem={({ item }) => (
                <View style={{ width: width - 40 }}>
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontSize: 22,
                      fontWeight: "700",
                    }}
                  >
                    {item}
                  </Text>
                </View>
              )}
            />
          </BlurView>
        </View>

        {/* ================= CARDS FINANCEIRO & PLANNING ================= */}
        <View style={{ flexDirection: "row", gap: 14 }}>
          <HomeFinanceCard />
          <HomePlanningCard />
        </View>

        {/* ================= PRÓXIMOS VENCIMENTOS ================= */}
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
              <Text style={{ color: "#9CA3AF", fontSize: 13 }}>
                R$ {s.price.toFixed(2)} • {s.frequency} • vence em {s.next_billing}
              </Text>
            </View>
          ))}
        </Section>

        {/* ================= ASSINATURAS ================= */}
        <Section title="Suas assinaturas">
          {subscriptions.map((s) => (
            <View key={s.id} style={{ marginBottom: 12 }}>
              <SubscriptionCard subscription={s} />
            </View>
          ))}
        </Section>

        {/* ================= MICROCARDS ================= */}
        <Section title="Insights rápidos">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {MICROCARDS.map((card) => (
              <View
                key={card.id}
                style={{
                  width: 260,
                  marginRight: 12,
                  backgroundColor: "rgba(255,255,255,0.04)",
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
                <Text style={{ color: "#9CA3AF", fontSize: 13 }}>{card.body}</Text>
              </View>
            ))}
          </ScrollView>
        </Section>
      </ScrollView>
    </Screen>
  );
}

const cardStyle = {
  flex: 1,
  backgroundColor: "rgba(255,255,255,0.05)",
  borderRadius: 18,
  padding: 16,
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.08)",
};

const labelStyle = {
  color: "#9CA3AF",
  fontSize: 12,
};

const valueStyle = {
  color: "white",
  fontSize: 18,
  fontWeight: "700" as const,
  marginTop: 6,
};

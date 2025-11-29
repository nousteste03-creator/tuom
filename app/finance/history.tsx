// app/finance/history.tsx
import { useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";

import Screen from "@/components/layout/Screen";
import Icon from "@/components/ui/Icon";
import { useFinanceHistory } from "@/hooks/useFinanceHistory";

const brandFont = Platform.select({
  ios: "SF Pro Display",
  default: "System",
});

export default function FinanceHistoryScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView | null>(null);

  // Hook REAL que já criamos com Supabase
  const { history, loading } = useFinanceHistory();

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, []);

  return (
    <Screen>
      <View style={{ flex: 1, backgroundColor: "#000" }}>
        {/* HEADER */}
        <View
          style={{
            paddingTop: 14,
            paddingHorizontal: 18,
            paddingBottom: 12,
            borderBottomWidth: 1,
            borderBottomColor: "rgba(31,41,55,0.8)",
            backgroundColor: "rgba(0,0,0,0.92)",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 34,
              height: 34,
              borderRadius: 999,
              justifyContent: "center",
              alignItems: "center",
              borderWidth: 1,
              borderColor: "rgba(148,163,184,0.5)",
              backgroundColor: "rgba(15,23,42,0.8)",
            }}
          >
            <Icon name="chevron-back" size={18} color="#E5E7EB" />
          </TouchableOpacity>

          <Text
            style={{
              color: "#FFF",
              fontSize: 18,
              fontFamily: brandFont ?? undefined,
              fontWeight: "700",
            }}
          >
            Histórico financeiro
          </Text>

          <View style={{ width: 34 }} />
        </View>

        {/* CONTENT */}
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{
            paddingHorizontal: 18,
            paddingTop: 16,
            paddingBottom: 60,
            gap: 20,
          }}
        >
          {/* LOADING */}
          {loading && (
            <View style={{ alignItems: "center", marginTop: 40 }}>
              <ActivityIndicator size="large" color="#FFF" />
            </View>
          )}

          {/* VAZIO */}
          {!loading && history.length === 0 && (
            <Text style={{ color: "#9CA3AF", fontSize: 14 }}>
              Nenhum dado registrado ainda.
            </Text>
          )}

          {/* TIMELINE */}
          {history.map((item, index) => {
            const prev = history[index + 1];

            return (
              <View
                key={item.id}
                style={{
                  padding: 16,
                  borderRadius: 18,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.08)",
                  backgroundColor: "rgba(15,15,15,0.94)",
                  gap: 14,
                }}
              >
                {/* MÊS */}
                <Text
                  style={{
                    color: "#FFF",
                    fontSize: 16,
                    fontWeight: "700",
                    fontFamily: brandFont ?? undefined,
                  }}
                >
                  {item.month_label}
                </Text>

                {/* VALORES */}
                <View style={{ gap: 8 }}>
                  <Row label="Entradas" value={item.total_income} color="#A7F3D0" />
                  <Row label="Saídas" value={item.total_expenses} color="#FCA5A5" />
                  <Row label="Assinaturas" value={item.total_subscriptions} color="#93C5FD" />
                  <Row label="Saldo" value={item.balance} bold color="#E5E7EB" />
                </View>

                {/* COMPARAÇÃO */}
                {prev && (
                  <BlurView
                    intensity={18}
                    tint="dark"
                    style={{
                      marginTop: 8,
                      padding: 12,
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: "rgba(55,65,81,0.5)",
                      backgroundColor: "rgba(0,0,0,0.7)",
                      gap: 8,
                    }}
                  >
                    <Text style={{ color: "#9CA3AF", fontSize: 12 }}>
                      Comparado com {prev.month_label}
                    </Text>

                    <DiffRow
                      label="Entradas"
                      current={item.total_income}
                      prev={prev.total_income}
                      positiveColor="#A7F3D0"
                      negativeColor="#FCA5A5"
                    />

                    <DiffRow
                      label="Saídas"
                      current={item.total_expenses}
                      prev={prev.total_expenses}
                      positiveColor="#FCA5A5"
                      negativeColor="#A7F3D0"
                    />

                    <DiffRow
                      label="Assinaturas"
                      current={item.total_subscriptions}
                      prev={prev.total_subscriptions}
                      positiveColor="#93C5FD"
                      negativeColor="#93C5FD"
                    />

                    <DiffRow
                      label="Saldo"
                      current={item.balance}
                      prev={prev.balance}
                      positiveColor="#A7F3D0"
                      negativeColor="#FCA5A5"
                    />
                  </BlurView>
                )}
              </View>
            );
          })}
        </ScrollView>
      </View>
    </Screen>
  );
}

/* -------------------- COMPONENTES ----------------------- */

function Row({ label, value, color, bold }: any) {
  const currency = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
      }}
    >
      <Text style={{ color: "#9CA3AF", fontSize: 13 }}>{label}</Text>

      <Text
        style={{
          color,
          fontSize: 14,
          fontWeight: bold ? "700" : "600",
        }}
      >
        {currency}
      </Text>
    </View>
  );
}

function DiffRow({ label, current, prev, positiveColor, negativeColor }: any) {
  const diff = current - prev;
  const pct = prev === 0 ? 0 : Math.round((diff / prev) * 100);

  const color = diff >= 0 ? positiveColor : negativeColor;
  const sign = diff >= 0 ? "+" : "";

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
      }}
    >
      <Text style={{ color: "#9CA3AF", fontSize: 12 }}>{label}</Text>

      <Text style={{ color, fontSize: 13, fontWeight: "600" }}>
        {sign}
        {pct}% 
      </Text>
    </View>
  );
}

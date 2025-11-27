// app/finance/history.tsx
import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
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
  const { months, loading, error } = useFinanceHistory();

  const scrollRef = useRef<ScrollView | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ y: 0, animated: true });
    }
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
            <View style={{ alignItems: "center", marginTop: 30 }}>
              <ActivityIndicator size="large" color="#FFF" />
            </View>
          )}

          {/* ERROR */}
          {error && (
            <Text style={{ color: "red", marginTop: 20 }}>
              Erro ao carregar histórico.
            </Text>
          )}

          {/* VAZIO */}
          {!loading && months.length === 0 && (
            <Text style={{ color: "#9CA3AF", fontSize: 14 }}>
              Nenhum dado registrado ainda.
            </Text>
          )}

          {/* TIMELINE */}
          {months.map((m, index) => {
            const prev = months[index + 1];
            const prevLabel = prev ? prev.label : "—";

            return (
              <View
                key={`${m.year}-${m.month}-${m.generated_at}`}
                style={{
                  padding: 16,
                  borderRadius: 18,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.08)",
                  backgroundColor: "rgba(15,15,15,0.95)",
                  gap: 12,
                }}
              >
                {/* MÊS ATUAL */}
                <Text
                  style={{
                    color: "#FFF",
                    fontSize: 16,
                    fontWeight: "600",
                    fontFamily: brandFont ?? undefined,
                  }}
                >
                  {m.label}
                </Text>

                {/* VALORES DO MÊS */}
                <View style={{ gap: 8 }}>
                  <Row label="Entradas" value={m.income} color="#A7F3D0" />
                  <Row label="Saídas" value={m.expenses} color="#FCA5A5" />
                  <Row label="Assinaturas" value={m.subscriptions} color="#93C5FD" />
                  <Row label="Saldo" value={m.balance} color="#E5E7EB" bold />
                </View>

                {/* COMPARAÇÃO — BLOCO GLASS */}
                <BlurView
                  intensity={20}
                  tint="dark"
                  style={{
                    marginTop: 10,
                    padding: 12,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: "rgba(55,65,81,0.6)",
                    backgroundColor: "rgba(0,0,0,0.85)",
                    gap: 8,
                  }}
                >
                  <Text
                    style={{
                      color: "#9CA3AF",
                      fontSize: 12,
                      marginBottom: 2,
                    }}
                  >
                    Comparado com {prevLabel}
                  </Text>

                  {/* VALORES DO MÊS ANTERIOR */}
                  {prev && (
                    <View style={{ gap: 4 }}>
                      <Row label="Entradas (anterior)" value={prev.income} color="#A7F3D0" />
                      <Row label="Saídas (anterior)" value={prev.expenses} color="#FCA5A5" />
                      <Row
                        label="Assinaturas (anterior)"
                        value={prev.subscriptions}
                        color="#93C5FD"
                      />
                      <Row label="Saldo (anterior)" value={prev.balance} color="#E5E7EB" />
                    </View>
                  )}

                  {/* DIFERENÇAS */}
                  <Text
                    style={{
                      color: "#E5E7EB",
                      fontSize: 13,
                      lineHeight: 20,
                      marginTop: 6,
                    }}
                  >
                    Entradas:{" "}
                    <Text style={{ color: "#A7F3D0" }}>
                      {m.diff_income > 0 ? "+" : ""}
                      {m.diff_income}%
                    </Text>{" "}
                    • Saídas:{" "}
                    <Text style={{ color: "#FCA5A5" }}>
                      {m.diff_expenses > 0 ? "+" : ""}
                      {m.diff_expenses}%
                    </Text>{" "}
                    • Saldo:{" "}
                    <Text
                      style={{
                        color: m.diff_balance >= 0 ? "#A7F3D0" : "#FCA5A5",
                      }}
                    >
                      {m.diff_balance > 0 ? "+" : ""}
                      {m.diff_balance}%
                    </Text>
                  </Text>
                </BlurView>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </Screen>
  );
}

function Row({
  label,
  value,
  color,
  bold,
}: {
  label: string;
  value: number;
  color: string;
  bold?: boolean;
}) {
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

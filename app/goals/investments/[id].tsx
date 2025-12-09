// app/goals/details/investment/[id].tsx

import React, { useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { BlurView } from "expo-blur";

import { useGoals } from "@/hooks/useGoals";
import InvestmentSparkline from "@/components/app/goals/InvestmentSparkline";

const brandFont = Platform.select({
  ios: "SF Pro Display",
  android: "Inter",
  default: "System",
});

export default function InvestmentDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { investments, nextInstallment } = useGoals();

  /* -----------------------------------------------------------
     LOCALIZAR O INVESTIMENTO
  ------------------------------------------------------------*/
  const investment = useMemo(
    () => investments.find((i) => i.id === id) ?? null,
    [investments, id]
  );

  if (!investment) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#fff" />
        <Text style={styles.loadingText}>Carregando investimento...</Text>
      </View>
    );
  }

  /* -----------------------------------------------------------
     IMPORTAÇÃO REAL DOS CAMPOS DO HOOK
  ------------------------------------------------------------*/
  const projection = investment.projection ?? null;
  const aporteMensal =
    investment.autoRuleMonthly ??
    investment.suggestedMonthly ??
    0;

  const remainingAmount = investment.remainingAmount;
  const progressPercent = investment.progressPercent;

  const next = nextInstallment(investment.id);

  /* -----------------------------------------------------------
     UI COMPLETA (Apple Stocks Style)
  ------------------------------------------------------------*/
  return (
    <ScrollView style={styles.container}>
      {/* ------------------------------------------ */}
      {/* HERO — Título, valor atual, meta */}
      {/* ------------------------------------------ */}
      <View style={styles.hero}>
        <Text style={styles.title}>{investment.title}</Text>

        <Text style={styles.currentValue}>
          {new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(investment.currentAmount)}
        </Text>

        <Text style={styles.target}>
          Meta:{" "}
          {new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(investment.targetAmount)}
        </Text>
      </View>

      {/* ------------------------------------------ */}
      {/* SPARKLINE GRANDE */}
      {/* ------------------------------------------ */}
      <View style={{ marginTop: 20 }}>
        <InvestmentSparkline
          curve={projection?.curveFuture ?? []}
          width={380}
          height={120}
          color="#85C7FF"
        />
      </View>

      {/* ------------------------------------------ */}
      {/* CARD VIDRO – PROJEÇÃO */}
      {/* ------------------------------------------ */}
      <BlurView intensity={40} tint="dark" style={styles.card}>
        <Text style={styles.cardTitle}>Projeção</Text>

        <Text style={styles.label}>
          Aporte mensal estimado:{" "}
          <Text style={styles.value}>
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(aporteMensal)}
          </Text>
        </Text>

        {projection?.projectedEndDate && (
          <Text style={styles.label}>
            Data projetada:{" "}
            <Text style={styles.value}>{projection.projectedEndDate}</Text>
          </Text>
        )}

        <Text style={styles.label}>
          Restante:{" "}
          <Text style={styles.value}>
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(remainingAmount)}
          </Text>
        </Text>

        {/* Próxima parcela opcional */}
        {next && (
          <Text style={styles.label}>
            Próximo aporte automático:{" "}
            <Text style={styles.value}>
              {new Date(next.date).toLocaleDateString("pt-BR")}
            </Text>
          </Text>
        )}
      </BlurView>

      {/* ------------------------------------------ */}
      {/* INSIGHTS — Placeholder (OpenAI depois) */}
      {/* ------------------------------------------ */}
      <BlurView intensity={40} tint="dark" style={styles.card}>
        <Text style={styles.cardTitle}>Insights do investimento</Text>

        <Text style={styles.muted}>
          Em breve: análise inteligente da NÖUS baseada em projeções, perfil e
          notícias do mercado.
        </Text>
      </BlurView>

      {/* ------------------------------------------ */}
      {/* AÇÕES */}
      {/* ------------------------------------------ */}
      <View style={{ marginTop: 20, marginBottom: 60 }}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => router.push(`/goals/details/add?id=${investment.id}`)}
        >
          <Text style={styles.actionText}>Registrar novo aporte</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => router.push(`/goals/details/edit?id=${investment.id}`)}
        >
          <Text style={styles.actionText}>Editar investimento</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: "rgba(255,80,80,0.22)" }]}
          onPress={() => router.back()}
        >
          <Text style={[styles.actionText, { color: "#ff8a8a" }]}>
            Voltar
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

/* -------------------------------------------------------------
   STYLES
-------------------------------------------------------------*/
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0B0C",
    paddingHorizontal: 18,
  },

  center: {
    flex: 1,
    backgroundColor: "#0B0B0C",
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 10,
    color: "rgba(255,255,255,0.6)",
    fontFamily: brandFont,
  },

  hero: {
    marginTop: 20,
  },

  title: {
    fontFamily: brandFont,
    fontSize: 22,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 10,
  },

  currentValue: {
    fontFamily: brandFont,
    fontSize: 32,
    fontWeight: "700",
    color: "#fff",
  },

  target: {
    marginTop: 4,
    fontFamily: brandFont,
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
  },

  card: {
    marginTop: 22,
    padding: 20,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },

  cardTitle: {
    fontFamily: brandFont,
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
    marginBottom: 10,
  },

  label: {
    fontFamily: brandFont,
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    marginTop: 6,
  },

  value: {
    color: "#fff",
    fontWeight: "600",
  },

  muted: {
    fontFamily: brandFont,
    fontSize: 13,
    color: "rgba(255,255,255,0.45)",
  },

  actionBtn: {
    marginTop: 14,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
  },

  actionText: {
    fontFamily: brandFont,
    fontSize: 15,
    color: "#fff",
    fontWeight: "600",
  },
});

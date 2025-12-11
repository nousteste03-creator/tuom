import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
} from "react-native";

import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";

import { useIncomeSources } from "@/hooks/useIncomeSources";
import { useUserPlan } from "@/hooks/useUserPlan";
import { supabase } from "@/lib/supabase";

const brandFont = Platform.select({
  ios: "SF Pro Display",
  android: "Inter",
  default: "System",
});

export default function IncomeScreen() {
  const router = useRouter();
  const { incomeSources, deleteIncomeSource, reload } = useIncomeSources();
  const { plan, isPro } = useUserPlan();

  const [insight, setInsight] = useState<string | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);

  /* --------------------------------------------------------
     TOTAL MENSAL
  -------------------------------------------------------- */
  const totalMonthly = useMemo(() => {
    if (!incomeSources || incomeSources.length === 0) return 0;

    return incomeSources.reduce((sum, item) => {
      const amt = Number(item.amount ?? 0);
      return sum + amt;
    }, 0);
  }, [incomeSources]);

  /* --------------------------------------------------------
     DISTRIBUIÇÃO PARA O GRÁFICO DE BARRAS
  -------------------------------------------------------- */
  const distribution = useMemo(() => {
    if (!incomeSources || incomeSources.length === 0) return [];

    return incomeSources.map((item) => {
      const amount = Number(item.amount ?? 0);
      const pct = totalMonthly > 0 ? amount / totalMonthly : 0;

      return {
        id: item.id,
        label: item.name,
        amount,
        pct,
      };
    });
  }, [incomeSources, totalMonthly]);

  /* --------------------------------------------------------
     INSIGHTS PRO — IA real
  -------------------------------------------------------- */
  useEffect(() => {
    if (!isPro || incomeSources.length === 0) {
      setInsight(null);
      return;
    }

    async function loadInsight() {
      try {
        setInsightLoading(true);

        const payload = {
          totalMonthly,
          sources: incomeSources.map((src) => ({
            name: src.name,
            amount: Number(src.amount ?? 0),
            frequency: src.frequency,
          })),
        };

        const { data, error } = await supabase.functions.invoke(
          "income-insights-premium",
          { body: payload }
        );

        if (error) {
          console.log("IA premium erro:", error);
          setInsight(null);
        } else {
          const text =
            (data as any)?.insightText ??
            (data as any)?.text ??
            (data as any)?.message ??
            null;

          setInsight(typeof text === "string" ? text : null);
        }
      } catch (err) {
        console.log("IA premium exception:", err);
        setInsight(null);
      } finally {
        setInsightLoading(false);
      }
    }

    loadInsight();
  }, [incomeSources, isPro, totalMonthly]);

  /* --------------------------------------------------------
     EXCLUIR RECEITA
  -------------------------------------------------------- */
  function handleDelete(id: string) {
    Alert.alert(
      "Excluir receita",
      "Tem certeza que deseja excluir esta receita?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            await deleteIncomeSource(id);
            reload();
          },
        },
      ]
    );
  }

  /* --------------------------------------------------------
     UI
  -------------------------------------------------------- */
  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {isPro ? "Fluxo de Renda" : "Suas Receitas"}
          </Text>
          <Text style={styles.headerSubtitle}>
            Acompanhe todas as entradas de dinheiro
          </Text>
        </View>

        {/* CARD RESUMO */}
        <BlurView intensity={30} tint="dark" style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total mensal</Text>
          <Text style={styles.summaryValue}>R$ {totalMonthly.toFixed(2)}</Text>

          <Text style={[styles.summaryLabel, { marginTop: 14 }]}>
            Fontes cadastradas
          </Text>
          <Text style={styles.summaryValueSmall}>
            {incomeSources.length} fonte{incomeSources.length !== 1 ? "s" : ""}
          </Text>

          {isPro && distribution.length > 0 && (
            <>
              <Text style={[styles.summaryLabel, { marginTop: 18 }]}>
                Concentração da renda
              </Text>
              <Text style={styles.summaryValueSmall}>
                {Math.round(distribution[0].pct * 100)}% na maior fonte
              </Text>
            </>
          )}
        </BlurView>

        {/* GRÁFICO PREMIUM DE BARRAS */}
        {distribution.length > 0 && (
          <View style={styles.chartContainer}>
            <Text style={styles.sectionTitle}>Distribuição</Text>

            {distribution.map((d, idx) => {
              const rawPct = d.pct ?? 0;
              const pct = Math.max(0, Math.min(rawPct, 1));
              const barWidth = `${pct * 100}%`;

              const baseOpacity = 0.7 + pct * 0.3;
              const barOpacity = Math.max(0.4, Math.min(baseOpacity, 1));

              return (
                <View key={d.id || idx} style={styles.chartRow}>
                  <Text style={styles.chartLabel}>{d.label}</Text>

                  <View style={styles.chartBarBackground}>
                    <View
                      style={[
                        styles.chartBarFill,
                        { width: barWidth, opacity: barOpacity },
                      ]}
                    />
                  </View>

                  <Text style={styles.chartValue}>
                    R$ {d.amount.toFixed(2)}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* INSIGHTS PRO */}
        {isPro && (
          <View style={styles.insightsSection}>
            <Text style={styles.sectionTitle}>Insights da PILA</Text>

            <BlurView intensity={25} tint="dark" style={styles.insightCard}>
              <Text style={styles.insightText}>
                {insightLoading
                  ? "Gerando interpretação..."
                  : insight || "Nenhum insight disponível."}
              </Text>
            </BlurView>
          </View>
        )}

        {/* LISTA DE RECEITAS */}
        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>Suas receitas</Text>

          {incomeSources.length === 0 && (
            <Text style={styles.emptyText}>Nenhuma receita cadastrada.</Text>
          )}

          {incomeSources.map((item) => (
            <BlurView
              key={item.id}
              intensity={25}
              tint="dark"
              style={styles.itemCard}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{item.name}</Text>
                <Text style={styles.itemValue}>
                  R$ {Number(item.amount ?? 0).toFixed(2)} / mês
                </Text>
              </View>

              <TouchableOpacity
                onPress={() =>
                  router.push(`/goals/create?type=income&edit=${item.id}`)
                }
              >
                <Text style={styles.editBtn}>Editar</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Text style={styles.deleteBtn}>Excluir</Text>
              </TouchableOpacity>
            </BlurView>
          ))}
        </View>

        {/* CTA FINAL */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.push("/goals/create?type=income")}
          >
            <Text style={styles.primaryBtnText}>Adicionar nova receita</Text>
          </TouchableOpacity>

          {plan === "free" && (
            <Text style={styles.freeHint}>
              Usuários FREE podem cadastrar receitas ilimitadas, mas os insights
              detalhados ficam no plano PRO.
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

/* --------------------------------------------------------
   STYLES
-------------------------------------------------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" },

  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 6 },

  headerTitle: {
    fontFamily: brandFont,
    color: "white",
    fontSize: 26,
    fontWeight: "700",
  },

  headerSubtitle: {
    fontFamily: brandFont,
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
    marginTop: 2,
  },

  summaryCard: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.05)",
  },

  summaryLabel: {
    color: "rgba(255,255,255,0.6)",
    fontFamily: brandFont,
    fontSize: 13,
  },

  summaryValue: {
    color: "white",
    fontFamily: brandFont,
    fontSize: 24,
    fontWeight: "700",
  },

  summaryValueSmall: {
    color: "white",
    fontFamily: brandFont,
    fontSize: 16,
    fontWeight: "600",
  },

  sectionTitle: {
    fontFamily: brandFont,
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    marginLeft: 18,
  },

  chartContainer: { marginTop: 10, paddingBottom: 10 },

  chartRow: { paddingHorizontal: 18, marginBottom: 14 },

  chartLabel: {
    color: "white",
    fontFamily: brandFont,
    fontSize: 13,
    marginBottom: 4,
  },

  chartBarBackground: {
    width: "100%",
    height: 10,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 10,
    overflow: "hidden",
  },

  chartBarFill: {
    height: "100%",
    backgroundColor: "#3EC6FF",
    borderRadius: 10,
    opacity: 1, // important to avoid type errors
  },

  chartValue: {
    color: "rgba(255,255,255,0.6)",
    fontFamily: brandFont,
    fontSize: 12,
    marginTop: 4,
  },

  insightsSection: { marginTop: 14 },

  insightCard: {
    marginHorizontal: 16,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.05)",
  },

  insightText: {
    color: "rgba(255,255,255,0.9)",
    fontFamily: brandFont,
    fontSize: 14,
    lineHeight: 20,
  },

  listSection: { marginTop: 20 },

  emptyText: {
    color: "rgba(255,255,255,0.5)",
    marginLeft: 20,
    fontFamily: brandFont,
  },

  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.05)",
    marginBottom: 10,
  },

  itemTitle: {
    color: "white",
    fontSize: 16,
    fontFamily: brandFont,
    fontWeight: "600",
  },

  itemValue: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    marginTop: 2,
    fontFamily: brandFont,
  },

  editBtn: {
    color: "#3EC6FF",
    fontSize: 13,
    fontFamily: brandFont,
    marginRight: 16,
  },

  deleteBtn: {
    color: "#FF4D4D",
    fontSize: 13,
    fontFamily: brandFont,
  },

  footer: {
    paddingHorizontal: 20,
    marginTop: 28,
    paddingBottom: 32,
  },

  primaryBtn: {
    backgroundColor: "rgba(255,255,255,0.1)",
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },

  primaryBtnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: brandFont,
  },

  freeHint: {
    marginTop: 10,
    textAlign: "center",
    fontFamily: brandFont,
    fontSize: 12,
    color: "rgba(255,255,255,0.55)",
  },
});

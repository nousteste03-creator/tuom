import React, { useMemo, useEffect, useState } from "react";
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

import Screen from "@/components/layout/Screen";
import { useIncomeSources } from "@/hooks/useIncomeSources";
import { useUserPlan } from "@/hooks/useUserPlan";
import { supabase } from "@/lib/supabase";

/* -----------------------------------------------------------
   FONT
----------------------------------------------------------- */
const brandFont = Platform.select({
  ios: "SF Pro Display",
  android: "Inter",
  default: "System",
});

/* -----------------------------------------------------------
   HELPERS
----------------------------------------------------------- */
function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value);
}

/* -----------------------------------------------------------
   TIPOS
----------------------------------------------------------- */
type IncomeEvent = {
  id: string;
  name: string;
  amount: number;
  day: number;
};

export default function IncomeIndexScreen() {
  console.log("🔥 INCOME INDEX — PASSO 2 (IA)");

  const router = useRouter();
  const { incomeSources, deleteIncomeSource, reload } = useIncomeSources();
  const { isPro } = useUserPlan();

  const [analysisText, setAnalysisText] = useState<string | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  /* =========================================================
     TOTAL
  ========================================================= */
  const totalMonthly = useMemo(() => {
    return incomeSources.reduce(
      (sum, src) => sum + Number(src.amount ?? 0),
      0
    );
  }, [incomeSources]);

  const totalYearly = totalMonthly * 12;

  /* =========================================================
     EVENTS TIMELINE
  ========================================================= */
  const events: IncomeEvent[] = useMemo(() => {
    const count = incomeSources.length;
    if (count === 0) return [];

    let days: number[] = [];

    if (count === 1) days = [5];
    else if (count === 2) days = [5, 20];
    else if (count === 3) days = [5, 15, 25];
    else {
      days = incomeSources.map((_, i) =>
        Math.round(((i + 1) / (count + 1)) * 28)
      );
    }

    return incomeSources.map((src, i) => ({
      id: src.id,
      name: src.name,
      amount: Number(src.amount ?? 0),
      day: days[i] ?? 15,
    }));
  }, [incomeSources]);

  /* =========================================================
     HEURÍSTICA LOCAL (FALLBACK)
  ========================================================= */
  const localInsight = useMemo(() => {
    if (events.length === 0) return null;

    if (events.length === 1) {
      return "Sua renda mensal depende de uma única fonte, o que pode aumentar a sensibilidade a atrasos ou interrupções.";
    }

    const biggest = Math.max(...events.map(e => e.amount));
    const concentration = biggest / totalMonthly;

    if (concentration > 0.6) {
      return "Grande parte da sua renda mensal está concentrada em uma única entrada, indicando dependência elevada de um evento específico.";
    }

    return "Sua renda apresenta uma distribuição relativamente equilibrada ao longo do mês, o que tende a trazer mais previsibilidade.";
  }, [events, totalMonthly]);

  /* =========================================================
     IA — INSIGHT
  ========================================================= */
  useEffect(() => {
    if (events.length === 0) {
      setAnalysisText(null);
      return;
    }

    async function loadInsight() {
      try {
        setLoadingAnalysis(true);

        const payload = {
          totalMonthly,
          totalYearly,
          sourcesCount: incomeSources.length,
          events: events.map(e => ({
            day: e.day,
            amount: e.amount,
          })),
        };

        const fn = isPro
          ? "income-insights-premium"
          : "income-insights-free";

        const { data, error } = await supabase.functions.invoke(fn, {
          body: payload,
        });

        if (error) {
          setAnalysisText(localInsight);
          return;
        }

        const text =
          (data as any)?.insightText ??
          (data as any)?.text ??
          null;

        setAnalysisText(typeof text === "string" ? text : localInsight);
      } catch {
        setAnalysisText(localInsight);
      } finally {
        setLoadingAnalysis(false);
      }
    }

    loadInsight();
  }, [events, isPro, localInsight, totalMonthly, totalYearly]);

  /* =========================================================
     DELETE
  ========================================================= */
  function handleDelete(id: string) {
    Alert.alert(
      "Excluir receita",
      "Deseja realmente excluir esta receita?",
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

  /* =========================================================
     UI
  ========================================================= */
  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>Fluxo de renda</Text>
          <Text style={styles.subtitle}>
            {formatBRL(totalMonthly)} / mês
          </Text>
        </View>

        {/* TIMELINE */}
        {events.length > 0 && (
          <View style={styles.timelineBlock}>
            <Text style={styles.timelineTitle}>
              Entradas previstas no mês
            </Text>

            <View style={styles.timelineLine} />

            <View style={styles.timeline}>
              {events.map(e => (
                <View
                  key={e.id}
                  style={[
                    styles.event,
                    { left: `${(e.day / 30) * 100}%` },
                  ]}
                >
                  <View style={styles.pill}>
                    <Text style={styles.pillValue}>
                      {formatBRL(e.amount)}
                    </Text>
                  </View>
                  <Text style={styles.pillDay}>dia {e.day}</Text>
                </View>
              ))}
            </View>

            {/* ANALISE */}
            <View style={styles.analysisBlock}>
              <Text style={styles.analysisTitle}>
                Análise do fluxo de renda
              </Text>

              <Text style={styles.analysisText}>
                {loadingAnalysis
                  ? "Analisando seu fluxo de renda…"
                  : analysisText}
              </Text>
            </View>

            <View style={styles.summary}>
              <Text style={styles.summaryText}>
                • Faturamento mensal:{" "}
                <Text style={styles.summaryStrong}>
                  {formatBRL(totalMonthly)}
                </Text>
              </Text>
              <Text style={styles.summaryText}>
                • Faturamento anual estimado:{" "}
                <Text style={styles.summaryStrong}>
                  {formatBRL(totalYearly)}
                </Text>
              </Text>
            </View>
          </View>
        )}

        {/* LISTA */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Receitas</Text>

          {incomeSources.map(item => (
            <View key={item.id} style={styles.row}>
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() =>
                  router.push(
                    `/goals/create?type=income&edit=${item.id}`
                  )
                }
              >
                <Text style={styles.rowTitle}>{item.name}</Text>
                <Text style={styles.rowValue}>
                  {formatBRL(Number(item.amount ?? 0))} / mês
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Text style={styles.deleteText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* CTA */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() =>
              router.push("/goals/create?type=income")
            }
          >
            <Text style={styles.primaryBtnText}>
              + Adicionar nova receita
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Screen>
  );
}

/* =========================================================
   STYLES
========================================================= */
const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontFamily: brandFont,
    fontSize: 26,
    fontWeight: "700",
    color: "#fff",
  },
  subtitle: {
    fontFamily: brandFont,
    fontSize: 16,
    color: "rgba(255,255,255,0.6)",
    marginTop: 4,
  },

  timelineBlock: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  timelineTitle: {
    fontFamily: brandFont,
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
    marginBottom: 12,
  },
  timelineLine: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
    marginBottom: 18,
  },
  timeline: {
    height: 60,
    position: "relative",
  },
  event: {
    position: "absolute",
    alignItems: "center",
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  pillValue: {
    fontFamily: brandFont,
    fontSize: 12,
    color: "#fff",
    fontWeight: "600",
  },
  pillDay: {
    marginTop: 4,
    fontFamily: brandFont,
    fontSize: 11,
    color: "rgba(255,255,255,0.45)",
  },

  analysisBlock: {
    marginTop: 14,
  },
  analysisTitle: {
    fontFamily: brandFont,
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  analysisText: {
    fontFamily: brandFont,
    fontSize: 13,
    lineHeight: 18,
    color: "rgba(255,255,255,0.75)",
  },

  summary: {
    marginTop: 10,
  },
  summaryText: {
    fontFamily: brandFont,
    fontSize: 13,
    color: "rgba(255,255,255,0.55)",
    marginTop: 2,
  },
  summaryStrong: {
    color: "#fff",
    fontWeight: "600",
  },

  section: {
    marginTop: 30,
  },
  sectionTitle: {
    marginLeft: 20,
    marginBottom: 10,
    fontFamily: brandFont,
    fontSize: 17,
    fontWeight: "600",
    color: "#fff",
  },
  row: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowTitle: {
    fontFamily: brandFont,
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  rowValue: {
    fontFamily: brandFont,
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    marginTop: 2,
  },
  deleteText: {
    fontFamily: brandFont,
    fontSize: 13,
    color: "rgba(255,255,255,0.5)",
  },

  footer: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  primaryBtn: {
    height: 52,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    fontFamily: brandFont,
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
});

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
     DISTRIBUIÇÃO
  -------------------------------------------------------- */
  const distribution = useMemo(() => {
    if (!incomeSources || incomeSources.length === 0) return [];
    return incomeSources.map((item) => {
      const amount = Number(item.amount ?? 0);
      const pct = totalMonthly > 0 ? amount / totalMonthly : 0;
      return { id: item.id, label: item.name, amount, pct };
    });
  }, [incomeSources, totalMonthly]);

  /* --------------------------------------------------------
     INSIGHTS PRO
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
          setInsight(null);
        } else {
          const text =
            (data as any)?.insightText ??
            (data as any)?.text ??
            (data as any)?.message ??
            null;

          setInsight(typeof text === "string" ? text : null);
        }
      } catch {
        setInsight(null);
      } finally {
        setInsightLoading(false);
      }
    }

    loadInsight();
  }, [incomeSources, isPro, totalMonthly]);

  /* --------------------------------------------------------
     DELETE
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
          <Text style={styles.headerTitle}>Fluxo de Renda</Text>
          <Text style={styles.headerSubtitle}>
            Visão consolidada das suas entradas mensais
          </Text>
        </View>

        {/* PAINEL PRINCIPAL */}
        <BlurView intensity={28} tint="dark" style={styles.mainPanel}>
          <Text style={styles.panelLabel}>Total mensal</Text>
          <Text style={styles.panelValue}>
            R$ {totalMonthly.toFixed(2)}
          </Text>

          <View style={styles.panelMetaRow}>
            <Text style={styles.panelMeta}>
              {incomeSources.length} fonte(s)
            </Text>

            {isPro && distribution.length > 0 && (
              <Text style={styles.panelMeta}>
                {Math.round(distribution[0].pct * 100)}% concentrado
              </Text>
            )}
          </View>

          {isPro && (
            <Text style={styles.panelInsight}>
              {insightLoading
                ? "Analisando seu fluxo de renda..."
                : insight || "Nenhum insight disponível no momento."}
            </Text>
          )}
        </BlurView>

        {/* DISTRIBUIÇÃO */}
        {distribution.length > 0 && (
          <View style={styles.distributionSection}>
            <Text style={styles.sectionTitle}>Distribuição</Text>

            {distribution.map((d) => (
              <View key={d.id} style={styles.distRow}>
                <Text style={styles.distLabel}>{d.label}</Text>

                <View style={styles.distBarBg}>
                  <View
                    style={[
                      styles.distBarFill,
                      { width: `${Math.min(d.pct * 100, 100)}%` },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        )}

        {/* LISTA */}
        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>Receitas</Text>

          {incomeSources.length === 0 && (
            <Text style={styles.emptyText}>
              Nenhuma receita cadastrada.
            </Text>
          )}

          {incomeSources.map((item) => (
            <View key={item.id} style={styles.listItem}>
              <View>
                <Text style={styles.itemTitle}>{item.name}</Text>
                <Text style={styles.itemValue}>
                  R$ {Number(item.amount ?? 0).toFixed(2)} / mês
                </Text>
              </View>

              <View style={styles.actions}>
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
              </View>
            </View>
          ))}
        </View>

        {/* CTA */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.push("/goals/create?type=income")}
          >
            <Text style={styles.primaryBtnText}>
              Adicionar nova receita
            </Text>
          </TouchableOpacity>

          {plan === "free" && (
            <Text style={styles.freeHint}>
              Insights avançados disponíveis no plano PRO.
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
  container: { flex: 1, backgroundColor: "#000" },

  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },

  headerTitle: {
    fontFamily: brandFont,
    color: "#fff",
    fontSize: 26,
    fontWeight: "700",
  },

  headerSubtitle: {
    fontFamily: brandFont,
    color: "rgba(255,255,255,0.55)",
    fontSize: 14,
    marginTop: 2,
  },

  mainPanel: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 22,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.04)",
  },

  panelLabel: {
    color: "rgba(255,255,255,0.6)",
    fontFamily: brandFont,
    fontSize: 13,
  },

  panelValue: {
    color: "#fff",
    fontFamily: brandFont,
    fontSize: 26,
    fontWeight: "700",
    marginTop: 2,
  },

  panelMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },

  panelMeta: {
    color: "rgba(255,255,255,0.6)",
    fontFamily: brandFont,
    fontSize: 13,
  },

  panelInsight: {
    marginTop: 16,
    color: "rgba(255,255,255,0.9)",
    fontFamily: brandFont,
    fontSize: 14,
    lineHeight: 20,
  },

  distributionSection: { marginTop: 22 },

  sectionTitle: {
    fontFamily: brandFont,
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    marginLeft: 18,
  },

  distRow: { paddingHorizontal: 18, marginBottom: 14 },

  distLabel: {
    color: "#fff",
    fontFamily: brandFont,
    fontSize: 13,
    marginBottom: 4,
  },

  distBarBg: {
    width: "100%",
    height: 8,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 8,
    overflow: "hidden",
  },

  distBarFill: {
    height: "100%",
    backgroundColor: "#3EC6FF",
    borderRadius: 8,
  },

  listSection: { marginTop: 24 },

  emptyText: {
    color: "rgba(255,255,255,0.5)",
    marginLeft: 20,
    fontFamily: brandFont,
  },

  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },

  itemTitle: {
    color: "#fff",
    fontSize: 16,
    fontFamily: brandFont,
    fontWeight: "600",
  },

  itemValue: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 13,
    marginTop: 2,
    fontFamily: brandFont,
  },

  actions: {
    flexDirection: "row",
    alignItems: "center",
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
    color: "#fff",
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

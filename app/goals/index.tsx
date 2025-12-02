import React, { useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";

import { useRouter, useFocusEffect } from "expo-router";

import Screen from "@/components/layout/Screen";
import Icon from "@/components/ui/Icon";

import type { GoalTypeFilter } from "@/components/app/goals/GoalTypeSelector";

import { useGoals } from "@/hooks/useGoals";
import { useIncomeSources } from "@/hooks/useIncomeSources";
import { useUserPlan } from "@/hooks/useUserPlan";

import GoalCard from "@/components/app/goals/GoalCard";
import GoalTypeSelector from "@/components/app/goals/GoalTypeSelector";
import IncomeCTA from "@/components/app/goals/IncomeCTA";
import { Ring } from "@/components/app/goals/Ring";

/* Helpers */
const brandFont = Platform.select({
  ios: "SF Pro Display",
  default: "System",
});

function formatCurrency(v: number) {
  return v.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function normalizeTipo(tipo: string) {
  const t = (tipo || "").toLowerCase();
  if (t === "divida") return "obrigacao";
  if (t === "fundo") return "investimento";
  if (t === "obrigacao") return "obrigacao";
  if (t === "investimento") return "investimento";
  return "meta";
}

function getColor(tipo: string) {
  const t = normalizeTipo(tipo);
  if (t === "obrigacao") return "#FFB85C";
  if (t === "investimento") return "#4DB5FF";
  return "#8A8FFF";
}

/* ============================================================
   TELA PRINCIPAL DE METAS
============================================================ */
export default function GoalsIndexScreen() {
  const router = useRouter();

  const { goals, loading } = useGoals();
  const {
    sources,
    calculateMonthlyIncome,
    getIncomeSources,         // <-- IMPORTANTE
  } = useIncomeSources();

  const { isPro } = useUserPlan() ?? { isPro: false };

  const [tab, setTab] = useState<GoalTypeFilter>("meta");

  const subtitle = isPro
    ? "Construa seu plano de vida"
    : "Alcance seu primeiro objetivo";

  /* ============================================================
     RELOAD AUTOMÁTICO QUANDO VOLTA PARA A TELA
  ============================================================ */
  useFocusEffect(
    useCallback(() => {
      getIncomeSources(); // <---- FORÇA ATUALIZAÇÃO
    }, [])
  );

  /* renda */
  const hasIncome = sources?.length > 0;
  const monthlyIncome = hasIncome ? calculateMonthlyIncome() : 0;

  /* Filtro de metas */
  const filteredGoals = useMemo(() => {
    if (!goals) return [];
    if (tab === "renda") return [];
    return goals.filter((g) => normalizeTipo(g.tipo) === tab);
  }, [goals, tab]);

  /* meta principal */
  const mainGoal =
    tab !== "renda" && filteredGoals.length > 0 ? filteredGoals[0] : null;

  return (
    <Screen>
      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 14 }}>
        
        {/* HEADER */}
        <View style={{ marginBottom: 18 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: brandFont,
                  fontSize: 28,
                  fontWeight: "700",
                  color: "#FFF",
                  marginBottom: 4,
                }}
              >
                Metas
              </Text>
              <Text
                style={{
                  color: "rgba(255,255,255,0.7)",
                  fontSize: 13,
                }}
              >
                {subtitle}
              </Text>
            </View>

            {tab !== "renda" && (
              <TouchableOpacity
                onPress={() =>
                  router.push(`/goals/create?type=${tab}` as `/goals/create`)
                }
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.18)",
                  backgroundColor: "rgba(255,255,255,0.05)",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Icon name="add" size={20} color="#FFF" />
              </TouchableOpacity>
            )}
          </View>

          {/* SEGMENTED CONTROL */}
          <GoalTypeSelector value={tab} onChange={setTab} />
        </View>

        {/* CONTEÚDO */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* ========= ABA RENDA ========= */}
          {tab === "renda" && (
            <IncomeCTA
              hasIncome={hasIncome}
              monthlyIncome={monthlyIncome}
              sources={sources}
              onPress={() => router.push("/goals/income")}
            />
          )}

          {/* ========= HERO PRINCIPAL ========= */}
          {tab !== "renda" && mainGoal ? (
            <View
              style={{
                borderRadius: 26,
                padding: 20,
                marginBottom: 20,
                backgroundColor: "rgba(20,20,22,0.98)",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.10)",
              }}
            >
              <View style={{ alignItems: "center", marginBottom: 14 }}>
                <Ring
                  size={110}
                  strokeWidth={10}
                  progress={
                    mainGoal.target_amount > 0
                      ? mainGoal.current_amount / mainGoal.target_amount
                      : 0
                  }
                  color={getColor(mainGoal.tipo)}
                >
                  <Text
                    style={{
                      color: "#FFF",
                      fontSize: 18,
                      fontWeight: "700",
                    }}
                  >
                    {Math.round(
                      (mainGoal.current_amount / mainGoal.target_amount) * 100
                    )}
                    %
                  </Text>
                </Ring>
              </View>

              <Text
                style={{
                  color: "#FFF",
                  fontSize: 18,
                  fontWeight: "700",
                  marginBottom: 6,
                  textAlign: "center",
                }}
              >
                {mainGoal.titulo}
              </Text>

              <Text
                style={{
                  color: "rgba(255,255,255,0.7)",
                  fontSize: 13,
                  textAlign: "center",
                }}
              >
                R$ {formatCurrency(mainGoal.current_amount)} /{" "}
                R$ {formatCurrency(mainGoal.target_amount)}
              </Text>
            </View>
          ) : null}

          {/* ========= LISTAGEM ========= */}
          {tab !== "renda" && (
            <>
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : filteredGoals.length === 0 ? (
                <View style={{ paddingVertical: 40, alignItems: "center" }}>
                  <Text
                    style={{
                      color: "rgba(255,255,255,0.7)",
                      fontSize: 13,
                      textAlign: "center",
                      marginBottom: 8,
                    }}
                  >
                    Nenhuma meta nesta categoria.
                  </Text>

                  <TouchableOpacity
                    onPress={() =>
                      router.push(
                        `/goals/create?type=${tab}` as `/goals/create`
                      )
                    }
                    style={{
                      paddingHorizontal: 18,
                      paddingVertical: 8,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.3)",
                    }}
                  >
                    <Text
                      style={{
                        color: "#FFF",
                        fontSize: 13,
                        fontWeight: "500",
                      }}
                    >
                      Criar primeira
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                filteredGoals.map((goal) => (
                  <GoalCard key={goal.id} goal={goal} router={router} />
                ))
              )}
            </>
          )}
        </ScrollView>
      </View>
    </Screen>
  );
}

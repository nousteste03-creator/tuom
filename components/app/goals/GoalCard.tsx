// components/app/goals/GoalCard.tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ring } from "./Ring";
import type { Goal } from "@/hooks/useGoals";

type Props = {
  goal: Goal;
  router: any;

  isPro?: boolean;

  // insights vindos do useGoals (opcional)
  percent?: number;
  idealMonthly?: number | null;
  estimatedMonths?: number | null;
  isAbovePace?: boolean;
};

/** Normalização do tipo para garantir estilo consistente */
function normalize(tipo: string) {
  const t = (tipo || "").toLowerCase();
  if (t === "divida") return "obrigacao";
  if (t === "fundo") return "investimento";
  return t as "meta" | "obrigacao" | "investimento";
}

export default function GoalCard({
  goal,
  router,
  isPro = false,
  percent,
  idealMonthly,
  estimatedMonths,
  isAbovePace = false,
}: Props) {
  const tipo = normalize(goal.tipo);

  /* PROGRESSO */
  const progress =
    percent ??
    (goal.target_amount > 0
      ? goal.current_amount / goal.target_amount
      : 0);

  const percentLabel = `${Math.round(progress * 100)}%`;

  /* TIPOS */
  const tipoLabel =
    tipo === "meta"
      ? "Meta"
      : tipo === "obrigacao"
      ? "Obrigação"
      : "Investimento";

  const tipoColor =
    tipo === "meta"
      ? "#8A8FFF" // lilás premium
      : tipo === "obrigacao"
      ? "#FFB85C" // dourado/alaranjado (obrigações)
      : "#4DB5FF"; // azul (investimentos)

  /* INSIGHTS PREMIUM (PRO) */
  let microInsight: string | null = null;

  if (isPro && estimatedMonths != null) {
    if (estimatedMonths <= 0) microInsight = "Conclusão neste mês";
    else if (estimatedMonths === 1) microInsight = "Falta 1 mês";
    else microInsight = `Faltam ${estimatedMonths} meses`;
  }

  if (isPro && idealMonthly != null) {
    const ideal = idealMonthly.toLocaleString("pt-BR", {
      minimumFractionDigits: 0,
    });

    if (!microInsight) microInsight = `Ritmo ideal: R$ ${ideal}/mês`;
    if (isAbovePace) microInsight = "Você está acima do ritmo ideal";
  }

  /* NAVEGAÇÃO */
  const handlePress = () => {
    router.push(`/goals/${goal.id}`);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handlePress}
      style={{
        marginBottom: 14,
        borderRadius: 20,
        padding: 16,
        flexDirection: "row",
        backgroundColor: "rgba(255,255,255,0.03)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.10)",
      }}
    >
      {/* RING PREMIUM */}
      <View style={{ marginRight: 14 }}>
        <Ring
          size={60}
          strokeWidth={6}
          progress={progress}
          color={tipoColor}
          backgroundColor="rgba(255,255,255,0.08)"
        >
          <Text
            style={{
              fontSize: 11,
              fontWeight: "600",
              color: "#FFF",
            }}
          >
            {percentLabel}
          </Text>
        </Ring>
      </View>

      {/* INFORMAÇÕES PRINCIPAIS */}
      <View style={{ flex: 1 }}>
        {/* Título + badge */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 6,
          }}
        >
          <Text
            numberOfLines={1}
            style={{
              flex: 1,
              fontSize: 16,
              fontWeight: "600",
              color: "#FFF",
            }}
          >
            {goal.titulo}
          </Text>

          {/* Badge do tipo */}
          <View
            style={{
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: `${tipoColor}55`,
              backgroundColor: `${tipoColor}22`,
              marginLeft: 8,
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: "500",
                color: tipoColor,
              }}
            >
              {tipoLabel}
            </Text>
          </View>
        </View>

        {/* Valores */}
        <Text
          style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.70)",
            marginBottom: 6,
          }}
        >
          R$ {goal.current_amount.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
          })}{" "}
          / R$ {goal.target_amount.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
          })}
        </Text>

        {/* Barra de progresso */}
        <View
          style={{
            height: 4,
            borderRadius: 999,
            backgroundColor: "rgba(255,255,255,0.08)",
            overflow: "hidden",
          }}
        >
          <View
            style={{
              width: `${Math.min(100, Math.max(0, progress * 100))}%`,
              height: "100%",
              backgroundColor: tipoColor,
            }}
          />
        </View>

        {/* MICRO INSIGHT PRO */}
        {isPro && microInsight && (
          <Text
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.85)",
              marginTop: 6,
            }}
          >
            {microInsight}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

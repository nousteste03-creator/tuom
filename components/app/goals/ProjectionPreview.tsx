// components/app/goals/ProjectionPreview.tsx
import React from "react";
import { View, Text } from "react-native";

type Props = {
  name: string;
  targetAmount: number;
  currentAmount: number;
  remainingAmount: number;
  monthlyContribution: number;
  estimatedMonths: number | null;
};

export function ProjectionPreview({
  name,
  targetAmount,
  currentAmount,
  remainingAmount,
  monthlyContribution,
  estimatedMonths,
}: Props) {
  const hasProjection =
    remainingAmount > 0 && monthlyContribution > 0 && estimatedMonths !== null;

  return (
    <View>
      <View
        style={{
          borderRadius: 18,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.18)",
          backgroundColor: "rgba(255,255,255,0.04)",
          padding: 14,
          marginBottom: 12,
        }}
      >
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: "#FFFFFF",
            marginBottom: 6,
          }}
        >
          {name || "Meta sem nome"}
        </Text>

        <Text
          style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.7)",
          }}
        >
          Alvo: R$ {targetAmount.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
          })}
        </Text>

        <Text
          style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.7)",
            marginTop: 2,
          }}
        >
          Já acumulado: R${" "}
          {currentAmount.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
          })}
        </Text>

        <Text
          style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.7)",
            marginTop: 2,
          }}
        >
          Restante: R${" "}
          {remainingAmount.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
          })}
        </Text>

        {monthlyContribution > 0 && (
          <Text
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.7)",
              marginTop: 4,
            }}
          >
            Aporte mensal planejado: R${" "}
            {monthlyContribution.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </Text>
        )}
      </View>

      {/* Mini "gráfico" de velocidade (barra) */}
      <View
        style={{
          borderRadius: 14,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.12)",
          backgroundColor: "rgba(255,255,255,0.03)",
          padding: 12,
          marginBottom: 10,
        }}
      >
        <Text
          style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.8)",
            marginBottom: 4,
          }}
        >
          Velocidade estimada
        </Text>

        <View
          style={{
            height: 6,
            borderRadius: 999,
            backgroundColor: "rgba(255,255,255,0.1)",
            overflow: "hidden",
            marginTop: 4,
          }}
        >
          <View
            style={{
              width: hasProjection ? "60%" : "10%",
              height: "100%",
              borderRadius: 999,
              backgroundColor: "#8A8FFF",
            }}
          />
        </View>

        <Text
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.7)",
            marginTop: 6,
          }}
        >
          {hasProjection
            ? `Com esse ritmo, você alcança em aproximadamente ${
                estimatedMonths === 1 ? "1 mês" : `${estimatedMonths} meses`
              }.`
            : "Defina um aporte mensal para ver uma estimativa de tempo."}
        </Text>
      </View>

      <Text
        style={{
          fontSize: 11,
          color: "rgba(255,255,255,0.7)",
        }}
      >
        Essa projeção é baseada no valor restante e no aporte mensal informado.
        Com o histórico real de aportes, a NÖUS ajusta essa linha do tempo em
        tempo real.
      </Text>
    </View>
  );
}

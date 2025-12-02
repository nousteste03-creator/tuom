// components/app/goals/GoalEvolutionChart.tsx
import React, { useMemo } from "react";
import { View, Text } from "react-native";
import {
  LineChart,
} from "react-native-wagmi-charts";

/*
  PROPS ESPERADOS:
    entries → goal_entries reais
    color  → cor do tipo (meta/divida/investimento)
*/

export function GoalEvolutionChart({ entries, color }) {
  // Transforma entries em dados acumulados
  const chartData = useMemo(() => {
    if (!entries || entries.length === 0) return [];

    let total = 0;

    return entries
      .sort(
        (a, b) =>
          new Date(a.data).getTime() - new Date(b.data).getTime()
      )
      .map((e) => {
        total += e.valor;
        return {
          timestamp: new Date(e.data).getTime(),
          value: total,
        };
      });
  }, [entries]);

  if (chartData.length < 2) {
    return (
      <View
        style={{
          borderRadius: 20,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.12)",
          backgroundColor: "rgba(255,255,255,0.03)",
          padding: 14,
          marginBottom: 16,
        }}
      >
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: "#FFF",
            marginBottom: 10,
          }}
        >
          Evolução (gráfico)
        </Text>

        <Text
          style={{
            color: "rgba(255,255,255,0.5)",
            fontSize: 12,
          }}
        >
          Ainda não há dados suficientes para gerar gráfico.
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.12)",
        backgroundColor: "rgba(255,255,255,0.03)",
        padding: 14,
        marginBottom: 16,
      }}
    >
      <Text
        style={{
          fontSize: 14,
          fontWeight: "600",
          color: "#FFF",
          marginBottom: 10,
        }}
      >
        Evolução (gráfico)
      </Text>

      <LineChart.Provider data={chartData}>
        <LineChart height={120}>
          {/* Linha principal */}
          <LineChart.Path
            color={color}
            width={3}
          >
            <LineChart.Gradient color={color} />
          </LineChart.Path>

          {/* Cursor com tooltip */}
          <LineChart.CursorCrosshair>
            <LineChart.Tooltip
              style={{
                backgroundColor: "rgba(255,255,255,0.05)",
                borderRadius: 10,
                paddingHorizontal: 8,
                paddingVertical: 4,
              }}
              textStyle={{
                color: "#FFF",
                fontSize: 12,
              }}
              formatter={({ value }) =>
                `R$ ${value.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}`
              }
            />
          </LineChart.CursorCrosshair>
        </LineChart>
      </LineChart.Provider>
    </View>
  );
}

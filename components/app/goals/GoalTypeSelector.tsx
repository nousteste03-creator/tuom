// components/app/goals/GoalTypeSelector.tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

/**
 * Tipos oficiais que podem aparecer na segmented bar.
 */
export type GoalTypeFilter =
  | "meta"
  | "obrigacao"
  | "investimento"
  | "renda";

type Props = {
  value: GoalTypeFilter;
  onChange: (v: GoalTypeFilter) => void;
  disabledDebtsAndInvestments?: boolean; // FREE
};

/**
 * Normaliza tipos antigos ou variações internas.
 */
function normalize(v: string): GoalTypeFilter {
  const t = v.toLowerCase();

  if (t === "divida") return "obrigacao";       // legado
  if (t === "fundo") return "investimento";     // legado

  if (t === "obrigacao") return "obrigacao";
  if (t === "investimento") return "investimento";
  if (t === "renda") return "renda";

  return "meta";
}

/**
 * SEGMENTED CONTROL PREMIUM — estilo Apple/XP
 */
export default function GoalTypeSelector({
  value,
  onChange,
  disabledDebtsAndInvestments = false,
}: Props) {
  const current = normalize(value);

  const items: { key: GoalTypeFilter; label: string }[] = [
    { key: "meta", label: "Metas" },
    { key: "obrigacao", label: "Obrigações" },
    { key: "investimento", label: "Investimentos" },
    { key: "renda", label: "Renda" },
  ];

  return (
    <View
      style={{
        marginTop: 12,
        marginBottom: 12,
        flexDirection: "row",
        backgroundColor: "rgba(255,255,255,0.04)",
        borderRadius: 999,
        padding: 4,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.10)",
      }}
    >
      {items.map((item) => {
        const disabled =
          disabledDebtsAndInvestments &&
          (item.key === "obrigacao" || item.key === "investimento");

        const active = current === item.key;

        return (
          <TouchableOpacity
            key={item.key}
            disabled={disabled}
            onPress={() => onChange(item.key)}
            style={{
              flex: 1,
              paddingVertical: 8,
              borderRadius: 999,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: active
                ? "rgba(255,255,255,0.14)"
                : "transparent",
              opacity: disabled ? 0.35 : 1,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: active ? "700" : "400",
                color: active ? "#FFFFFF" : "rgba(255,255,255,0.7)",
                letterSpacing: active ? 0.2 : 0,
              }}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

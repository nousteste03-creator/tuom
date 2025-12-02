// components/app/goals/GoalTimeline.tsx
import React from "react";
import { View, Text } from "react-native";
import Icon from "@/components/ui/Icon";

export type GoalEntry = {
  id: string;
  tipo: "aporte" | "pagamento_parcela" | "ajuste";
  valor: number;
  data: string;
  descricao?: string | null;
};

type Props = {
  entries: GoalEntry[];
};

export function GoalTimeline({ entries }: Props) {
  if (!entries || entries.length === 0) {
    return (
      <Text
        style={{
          fontSize: 12,
          color: "rgba(255,255,255,0.7)",
        }}
      >
        Ainda não há movimentações para essa meta.
      </Text>
    );
  }

  return (
    <View>
      {entries.map((e, index) => {
        const isLast = index === entries.length - 1;

        const isPayment = e.tipo === "pagamento_parcela";
        const isAdjust = e.tipo === "ajuste";

        const iconName = isPayment
          ? "credit-card"
          : isAdjust
          ? "sliders"
          : "plus-circle";

        const color = isPayment
          ? "#FF6A6A"
          : isAdjust
          ? "#F6C453"
          : "#8A8FFF";

        const label = isPayment
          ? "Parcela"
          : isAdjust
          ? "Ajuste"
          : "Aporte";

        return (
          <View
            key={e.id}
            style={{
              flexDirection: "row",
              paddingVertical: 8,
            }}
          >
            {/* timeline vertical */}
            <View
              style={{
                width: 20,
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: color,
                }}
              />
              {!isLast && (
                <View
                  style={{
                    flex: 1,
                    width: 1,
                    backgroundColor: "rgba(255,255,255,0.16)",
                    marginTop: 2,
                  }}
                />
              )}
            </View>

            <View
              style={{
                flex: 1,
                marginLeft: 8,
                borderBottomWidth: isLast ? 0 : 1,
                borderColor: "rgba(255,255,255,0.06)",
                paddingBottom: 8,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 2,
                }}
              >
                <Icon
                  name={iconName}
                  size={14}
                  color={color}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={{
                    fontSize: 13,
                    color: "#FFFFFF",
                  }}
                >
                  R${" "}
                  {Number(e.valor || 0).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </Text>
              </View>

              <Text
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.7)",
                  marginBottom: 2,
                }}
              >
                {formatDate(e.data)}
              </Text>

              {e.descricao ? (
                <Text
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.8)",
                  }}
                >
                  {e.descricao}
                </Text>
              ) : null}

              <View
                style={{
                  marginTop: 4,
                  alignSelf: "flex-start",
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: `${color}66`,
                  backgroundColor: `${color}22`,
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    color: color,
                  }}
                >
                  {label}
                </Text>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

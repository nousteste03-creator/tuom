// components/app/goals/InstallmentItem.tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Icon from "@/components/ui/Icon";

export type Installment = {
  id: string;
  numero_parcela: number;
  valor_parcela: number;
  vencimento: string;
  status: "paid" | "pending";
};

type Props = {
  installment: Installment;
  onPress?: () => void;
};

export function InstallmentItem({ installment, onPress }: Props) {
  const isPaid = installment.status === "paid";

  const bulletColor = isPaid ? "#00D27A" : "rgba(255,255,255,0.4)";
  const lineColor = "rgba(255,255,255,0.16)";

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={{
        flexDirection: "row",
        paddingVertical: 8,
      }}
    >
      {/* Bullet + linha vertical */}
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
            backgroundColor: bulletColor,
            shadowColor: bulletColor,
            shadowOpacity: isPaid ? 0.8 : 0,
            shadowRadius: isPaid ? 6 : 0,
            shadowOffset: { width: 0, height: 0 },
          }}
        />
        <View
          style={{
            flex: 1,
            width: 1,
            backgroundColor: lineColor,
            marginTop: 2,
          }}
        />
      </View>

      {/* Conteúdo */}
      <View
        style={{
          flex: 1,
          marginLeft: 8,
          borderBottomWidth: 1,
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
          <Text
            style={{
              flex: 1,
              fontSize: 13,
              color: "#FFFFFF",
            }}
          >
            {installment.numero_parcela}ª parcela
          </Text>
          {isPaid && (
            <View
              style={{
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: "#00D27Aaa",
                backgroundColor: "#00D27A33",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Icon
                name="check"
                size={12}
                color="#00D27A"
                style={{ marginRight: 4 }}
              />
              <Text
                style={{
                  fontSize: 10,
                  color: "#00D27A",
                }}
              >
                Pago
              </Text>
            </View>
          )}
        </View>

        <Text
          style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.8)",
            marginBottom: 2,
          }}
        >
          R${" "}
          {Number(installment.valor_parcela || 0).toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
          })}
        </Text>

        <Text
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.6)",
          }}
        >
          Vence em {formatDate(installment.vencimento)}
        </Text>
      </View>
    </TouchableOpacity>
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

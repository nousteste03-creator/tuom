// components/app/goals/IncomeCTA.tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Icon from "@/components/ui/Icon";
import { useRouter } from "expo-router";

type Props = {
  hasIncome: boolean;
  monthlyIncome: number;
  sources: any[];
  onPress?: () => void;  // <-- AQUI!!!
};

export default function IncomeCTA({
  hasIncome,
  monthlyIncome,
  sources,
  onPress,
}: Props) {
  const router = useRouter();

  function handlePress() {
    if (onPress) return onPress();
    router.push("/goals/income");
  }

  function format(v: number) {
    return v.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
    });
  }

  return (
    <View
      style={{
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.12)",
        backgroundColor: "rgba(255,255,255,0.04)",
        marginBottom: 18,
      }}
    >
      <Text
        style={{
          color: "#FFF",
          fontSize: 15,
          fontWeight: "600",
          marginBottom: 6,
        }}
      >
        {hasIncome ? "Suas rendas ativas" : "Adicione sua renda"}
      </Text>

      <Text
        style={{
          color: "rgba(255,255,255,0.6)",
          fontSize: 13,
          marginBottom: 14,
        }}
      >
        {hasIncome
          ? "Criamos projeções realistas com base no total mensal."
          : "Ative projeções inteligentes para estimar suas metas."}
      </Text>

      {/* Total */}
      {hasIncome && (
        <View style={{ marginBottom: 12 }}>
          <Text
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.6)",
            }}
          >
            Total mensal:
          </Text>

          <Text
            style={{
              fontSize: 17,
              fontWeight: "700",
              color: "#FFF",
            }}
          >
            R$ {format(monthlyIncome)}
          </Text>
        </View>
      )}

      {/* Resumo fontes */}
      {hasIncome &&
        sources.slice(0, 3).map((s) => (
          <Text
            key={s.id}
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.7)",
              marginBottom: 4,
            }}
          >
            • {s.tipo} — R$ {format(s.valor)}
          </Text>
        ))}

      {/* Botão */}
      <TouchableOpacity
        onPress={handlePress}
        style={{
          marginTop: 14,
          paddingVertical: 10,
          borderRadius: 999,
          backgroundColor: "#8A8FFF",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Icon name="add-circle-outline" size={16} color="#FFF" />
        <Text style={{ marginLeft: 8, color: "#FFF", fontWeight: "600" }}>
          {hasIncome ? "Gerenciar renda" : "Adicionar renda"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

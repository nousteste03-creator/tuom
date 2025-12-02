// components/app/goals/IncomeItem.tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Icon from "@/components/ui/Icon";
import type { IncomeSource } from "@/hooks/useIncomeSources";

/* ============================================================
   BADGE — tipo da renda
============================================================ */
function getTipoLabel(tipo: IncomeSource["tipo"]) {
  switch (tipo) {
    case "salario":
      return { label: "Fixo", color: "#8A8FFF" };
    case "servico":
      return { label: "Serviço", color: "#4DB5FF" };
    case "empresa":
      return { label: "Pro Labore", color: "#A1FFCE" };
    case "variavel":
      return { label: "Variável", color: "#FFB85C" };
    default:
      return { label: "Extra", color: "#C2C2C2" };
  }
}

/* ============================================================
   VALOR MENSAL — conversão pela recorrência
============================================================ */
function calcularValorMensal(source: IncomeSource) {
  const v = Number(source.valor) || 0;

  switch (source.recorrencia) {
    case "mensal":
      return v;
    case "semanal":
      return v * 4;
    case "quinzenal":
      return v * 2;
    case "unica":
      return v;
    default:
      return v;
  }
}

type Props = {
  source: IncomeSource;
  onEdit: () => void;
  onDelete: () => void;
};

/* ============================================================
   COMPONENTE
============================================================ */
export default function IncomeItem({ source, onEdit, onDelete }: Props) {
  const mensal = calcularValorMensal(source);
  const { label: tipoLabel, color: tipoColor } = getTipoLabel(source.tipo);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onEdit}
      style={{
        borderRadius: 20,
        padding: 16,
        marginBottom: 14,
        backgroundColor: "rgba(255,255,255,0.03)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
      }}
    >
      {/* =====================================================
         HEADER: título + botão deletar
      ===================================================== */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 6,
        }}
      >
        <Text
          style={{
            flex: 1,
            color: "#FFF",
            fontSize: 16,
            fontWeight: "600",
          }}
          numberOfLines={1}
        >
          {source.tipo === "salario"
            ? "Salário"
            : source.tipo === "servico"
            ? "Serviço"
            : source.tipo === "empresa"
            ? "Empresa"
            : source.tipo === "variavel"
            ? "Variável"
            : "Renda extra"}
        </Text>

        <TouchableOpacity onPress={onDelete} style={{ padding: 4, marginLeft: 4 }}>
          <Icon name="trash-outline" size={18} color="rgba(255,255,255,0.6)" />
        </TouchableOpacity>
      </View>

      {/* =====================================================
         VALOR MENSAL
      ===================================================== */}
      <Text
        style={{
          color: "#FFF",
          fontSize: 14,
          fontWeight: "500",
          marginBottom: 6,
        }}
      >
        R$ {mensal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>
          {" "}
          / mês
        </Text>
      </Text>

      {/* =====================================================
         BADGE + recorrência
      ===================================================== */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View
          style={{
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 999,
            backgroundColor: `${tipoColor}22`,
            borderWidth: 1,
            borderColor: `${tipoColor}55`,
            marginRight: 10,
          }}
        >
          <Text
            style={{
              color: tipoColor,
              fontSize: 11,
              fontWeight: "500",
            }}
          >
            {tipoLabel}
          </Text>
        </View>

        <Text
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.5)",
          }}
        >
          {source.recorrencia === "mensal"
            ? "Mensal"
            : source.recorrencia === "semanal"
            ? "Semanal"
            : source.recorrencia === "quinzenal"
            ? "Quinzenal"
            : "Única"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

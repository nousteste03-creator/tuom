// app/goals/income.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
} from "react-native";
import { useRouter } from "expo-router";

import Screen from "@/components/layout/Screen";
import Icon from "@/components/ui/Icon";

import { useIncomeSources } from "@/hooks/useIncomeSources";
import { IncomeInput } from "@/components/app/goals/IncomeInput";
import IncomeItem, {
  type IncomeSource,
} from "@/components/app/goals/IncomeItem";

const brandFont = Platform.select({
  ios: "SF Pro Display",
  default: "System",
});

// mesmo formato que o IncomeInput envia
type IncomeForm = {
  tipo: "salario" | "servico" | "empresa" | "variavel" | "extra";
  valor: string;
  recorrencia: "mensal" | "semanal" | "quinzenal" | "unica";
  data_inicio: string;
  data_fim?: string;
};

export default function IncomeScreen() {
  const router = useRouter();

  const {
    sources,
    loading,
    createIncomeSource,
    deleteIncomeSource,
    updateIncomeSource, // <= precisa existir no hook
  } = useIncomeSources();

  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<IncomeSource | null>(null);

  // abrir criação
  function openCreate() {
    setEditing(null);
    setModalVisible(true);
  }

  // abrir edição
  function openEdit(item: IncomeSource) {
    setEditing(item);
    setModalVisible(true);
  }

  // salvar (create/update)
  async function handleSubmit(form: IncomeForm) {
    try {
      if (editing) {
        await updateIncomeSource(editing.id, form);
      } else {
        await createIncomeSource(form);
      }

      setModalVisible(false);
      setEditing(null);
    } catch (e) {
      console.log("Erro ao salvar renda:", e);
    }
  }

  // helper de número (caso venha string do banco)
  function parseMoney(v: any): number {
    if (!v) return 0;
    if (typeof v === "number") return v;
    return Number(
      String(v)
        .replace(/\./g, "")
        .replace(",", ".")
    );
  }

  // total mensal
  const monthlyTotal = sources.reduce((acc: number, s: any) => {
    const valor = parseMoney(s.valor);
    const rec = (s.recorrencia || "").toLowerCase();

    if (rec === "mensal") return acc + valor;
    if (rec === "semanal") return acc + valor * 4;
    if (rec === "quinzenal") return acc + valor * 2;
    return acc + valor; // única
  }, 0);

  return (
    <Screen>
      {/* MODAL DE CRIAÇÃO/EDIÇÃO */}
      <IncomeInput
        visible={modalVisible}
        initial={
          editing
            ? {
                tipo: editing.tipo,
                valor: String(editing.valor),
                recorrencia: editing.recorrencia,
                data_inicio: editing.data_inicio,
                data_fim: editing.data_fim,
              }
            : undefined
        }
        onClose={() => {
          setModalVisible(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 14 }}>
          {/* HEADER */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.16)",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 10,
              }}
            >
              <Icon name="chevron-back" size={16} color="#FFF" />
            </TouchableOpacity>

            <Text
              style={{
                color: "#FFF",
                fontSize: 18,
                fontWeight: "600",
                fontFamily: brandFont,
              }}
            >
              Fontes de Renda
            </Text>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          >
            {/* PAINEL TOTAL */}
            <View
              style={{
                borderRadius: 20,
                padding: 16,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.12)",
                backgroundColor: "rgba(255,255,255,0.04)",
              }}
            >
              <Text
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontSize: 12,
                  marginBottom: 4,
                }}
              >
                Total mensal estimado
              </Text>

              <Text
                style={{
                  color: "#FFF",
                  fontSize: 22,
                  fontWeight: "700",
                }}
              >
                R$ {monthlyTotal.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </Text>
            </View>

            {/* LISTA DE RENDAS */}
            <View style={{ marginBottom: 30 }}>
              <Text
                style={{
                  color: "#FFF",
                  fontSize: 15,
                  fontWeight: "600",
                  marginBottom: 12,
                }}
              >
                Suas fontes de renda
              </Text>

              {loading && <ActivityIndicator color="#FFF" />}

              {!loading && sources.length === 0 && (
                <Text
                  style={{
                    color: "rgba(255,255,255,0.6)",
                    fontSize: 13,
                  }}
                >
                  Nenhuma renda cadastrada.
                </Text>
              )}

              {!loading &&
                sources.map((item: any) => (
                  <IncomeItem
                    key={item.id}
                    source={item}
                    onEdit={() => openEdit(item)}
                    onDelete={() => deleteIncomeSource(item.id)}
                  />
                ))}
            </View>
          </ScrollView>

          {/* BOTÃO ADICIONAR */}
          <TouchableOpacity
            onPress={openCreate}
            style={{
              position: "absolute",
              bottom: 20,
              left: 20,
              right: 20,
              paddingVertical: 14,
              borderRadius: 999,
              backgroundColor: "#8A8FFF",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: "#FFF",
                fontWeight: "600",
                fontSize: 15,
              }}
            >
              Adicionar renda
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

// app/finance/budget/edit-category.tsx
import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { BlurView } from "expo-blur";

import Screen from "@/components/layout/Screen";
import Icon from "@/components/ui/Icon";
// FinanceScreen
import { useBudget } from "@/context/BudgetContext";

const brandFont = Platform.select({
  ios: "SF Pro Display",
  default: "System",
});

export default function EditCategoryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const { categories, updateCategory, deleteCategory } = useBudget();

  // Categoria selecionada
  const category = categories.find((c) => c.id === id);

  const [title, setTitle] = useState("");
  const [limit, setLimit] = useState("");

  useEffect(() => {
    if (category) {
      setTitle(category.title);
      setLimit(
        category.limit_amount !== null &&
        category.limit_amount !== undefined
          ? String(category.limit_amount)
          : ""
      );
    }
  }, [category]);

  async function handleSave() {
    if (!title.trim()) return;

    const limit_amount = Number(limit.replace(",", "."));

    await updateCategory(String(id), {
      title: title.trim(),
      limit_amount: isNaN(limit_amount) ? 0 : limit_amount,
    });

    router.back();
  }

  async function handleDelete() {
    Alert.alert(
      "Excluir categoria",
      "Tem certeza que deseja remover esta categoria? Todos os gastos associados serão removidos.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            await deleteCategory(String(id));
            router.back();
          },
        },
      ]
    );
  }

  if (!category) {
    return (
      <Screen>
        <Text style={{ color: "#FFF", padding: 20 }}>
          Categoria não encontrada.
        </Text>
      </Screen>
    );
  }

  return (
    <Screen style={{ backgroundColor: "#0A0A0C" }}>
      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            padding: 22,
            paddingBottom: 180,
            gap: 32,
          }}
        >
          {/* HEADER ------------------------------------------------ */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginTop: 4,
            }}
          >
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text
                style={{
                  color: "rgba(255,255,255,0.35)",
                  fontSize: 12,
                  letterSpacing: 0.6,
                }}
              >
                Categoria
              </Text>

              <Text
                style={{
                  color: "#FFF",
                  fontSize: 26,
                  fontWeight: "700",
                  fontFamily: brandFont ?? undefined,
                  marginTop: 2,
                }}
              >
                Editar categoria
              </Text>

              <Text
                style={{
                  color: "rgba(255,255,255,0.45)",
                  fontSize: 13,
                  marginTop: 6,
                  lineHeight: 18,
                }}
              >
                Ajuste o nome e o limite definido para organizar seu orçamento.
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                width: 42,
                height: 42,
                borderRadius: 21,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "rgba(255,255,255,0.05)",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.08)",
              }}
            >
              <Icon name="close" color="#FFF" size={20} />
            </TouchableOpacity>
          </View>

          {/* FORM ------------------------------------------------ */}
          <BlurView
            intensity={28}
            tint="dark"
            style={{
              padding: 22,
              borderRadius: 22,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.06)",
              backgroundColor: "rgba(20,20,23,0.55)",
              gap: 28,
            }}
          >
            {/* NOME ------------------------------------------------ */}
            <View>
              <Text
                style={{
                  color: "#FFF",
                  fontSize: 15,
                  fontWeight: "600",
                  marginBottom: 8,
                }}
              >
                Nome da categoria
              </Text>

              <TextInput
                placeholder="Ex: Mercado, Casa..."
                placeholderTextColor="rgba(255,255,255,0.35)"
                value={title}
                onChangeText={setTitle}
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.08)",
                  padding: 16,
                  borderRadius: 14,
                  color: "#FFF",
                  fontSize: 16,
                  fontFamily: brandFont ?? undefined,
                }}
              />
            </View>

            {/* LIMITE ------------------------------------------------ */}
            <View>
              <Text
                style={{
                  color: "#FFF",
                  fontSize: 15,
                  fontWeight: "600",
                  marginBottom: 8,
                }}
              >
                Limite mensal (R$)
              </Text>

              <TextInput
                placeholder="0,00"
                placeholderTextColor="rgba(255,255,255,0.35)"
                value={limit}
                onChangeText={setLimit}
                keyboardType="numeric"
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.08)",
                  padding: 16,
                  borderRadius: 14,
                  color: "#FFF",
                  fontSize: 16,
                  fontFamily: brandFont ?? undefined,
                }}
              />
            </View>
          </BlurView>

          {/* BOTÃO SALVAR ----------------------------------------- */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleSave}
            disabled={!title.trim()}
            style={{
              marginTop: 6,
              padding: 18,
              borderRadius: 16,
              backgroundColor: title.trim()
                ? "#FFF"
                : "rgba(255,255,255,0.22)",
              alignItems: "center",
              shadowColor: "#000",
              shadowOpacity: title.trim() ? 0.25 : 0,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 4 },
            }}
          >
            <Text
              style={{
                color: title.trim() ? "#000" : "rgba(0,0,0,0.35)",
                fontSize: 16,
                fontWeight: "700",
              }}
            >
              Salvar alterações
            </Text>
          </TouchableOpacity>

          {/* BOTÃO EXCLUIR ----------------------------------------- */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleDelete}
            style={{
              marginTop: 12,
              padding: 16,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: "rgba(255,80,80,0.35)",
              backgroundColor: "rgba(255,50,50,0.12)",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: "#FCA5A5",
                fontSize: 15,
                fontWeight: "600",
              }}
            >
              Excluir categoria
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Screen>
  );
}

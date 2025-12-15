// app/finance/budget/new-category.tsx
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";

import Screen from "@/components/layout/Screen";
import Icon from "@/components/ui/Icon";
import { useBudget } from "@/context/BudgetContext";

const brandFont = Platform.select({
  ios: "SF Pro Display",
  default: "System",
});

export default function NewCategoryScreen() {
  const router = useRouter();
  const { createCategory } = useBudget();

  const [title, setTitle] = useState("");
  const [limit, setLimit] = useState("");

  async function handleSave() {
    if (!title.trim()) return;

    const limit_amount = Number(limit.replace(",", "."));

    await createCategory({
      title: title.trim(),
      limit_amount: isNaN(limit_amount) ? 0 : limit_amount,
    });

    router.back();
  }

  return (
    <Screen style={{ backgroundColor: "#0A0A0C" }}>
      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            padding: 22,
            paddingBottom: 140,
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
                Nova categoria
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
                Criar categoria
              </Text>

              <Text
                style={{
                  color: "rgba(255,255,255,0.45)",
                  fontSize: 13,
                  marginTop: 6,
                  lineHeight: 18,
                }}
              >
                Defina nome e limite opcional para acompanhamento mensal.
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
              padding: 24,
              borderRadius: 22,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.06)",
              backgroundColor: "rgba(20,20,23,0.55)",
              gap: 30,
            }}
          >
            {/* INPUT: NOME */}
            <View>
              <Text
                style={{
                  color: "#FFF",
                  fontSize: 15,
                  fontWeight: "600",
                  marginBottom: 10,
                }}
              >
                Nome da categoria
              </Text>

              <TextInput
                placeholder="Ex: Alimentação, Casa, Mercado..."
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

            {/* INPUT: LIMITE */}
            <View>
              <Text
                style={{
                  color: "#FFF",
                  fontSize: 15,
                  fontWeight: "600",
                  marginBottom: 10,
                }}
              >
                Limite mensal (opcional)
              </Text>

              <TextInput
                placeholder="R$ 0,00"
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

          {/* BOTÃO SALVAR ------------------------------------------------ */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleSave}
            disabled={!title.trim()}
            style={{
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
              Salvar categoria
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Screen>
  );
}

// app/finance/budget/new-expense.tsx
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

export default function NewExpenseScreen() {
  const router = useRouter();
  const { categories, addExpense } = useBudget();

  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  );
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (saving) return;
    if (!categoryId || !description.trim() || !amount.trim()) return;

    setSaving(true);

    try {
      const payload = {
        category_id: categoryId,
        description: description.trim(),
        amount: Number(amount.replace(",", ".")),
        date,
      };

      console.log("🧾 NewExpense.handleSave payload:", payload);

      const created = await addExpense(payload);

      if (!created) {
        console.log("❌ NewExpense: gasto NÃO foi criado");
        setSaving(false);
        return;
      }

      console.log("✅ NewExpense: gasto criado com sucesso", created);

      router.back();
    } catch (err) {
      console.log("🔥 ERROR/NewExpense.handleSave:", err);
      setSaving(false);
    }
  }

  return (
    <Screen>
      <View style={{ flex: 1, backgroundColor: "#000" }}>
        <ScrollView
          contentContainerStyle={{
            padding: 20,
            paddingBottom: 140,
            gap: 26,
          }}
        >
          {/* HEADER */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View>
              <Text style={{ color: "#9CA3AF", fontSize: 13 }}>
                Novo gasto
              </Text>

              <Text
                style={{
                  color: "#FFF",
                  fontSize: 22,
                  fontWeight: "700",
                  fontFamily: brandFont ?? undefined,
                  marginTop: 4,
                }}
              >
                Registrar gasto
              </Text>

              <Text
                style={{
                  color: "#4B5563",
                  fontSize: 12,
                  marginTop: 4,
                }}
              >
                Escolha a categoria e registre o valor.
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => router.back()}
              disabled={saving}
              style={{
                padding: 8,
                backgroundColor: "rgba(255,255,255,0.06)",
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.10)",
                opacity: saving ? 0.4 : 1,
              }}
            >
              <Icon name="close" color="#FFF" size={18} />
            </TouchableOpacity>
          </View>

          {/* FORM */}
          <BlurView
            intensity={22}
            tint="dark"
            style={{
              padding: 20,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.08)",
              backgroundColor: "rgba(15,15,15,0.35)",
              gap: 22,
            }}
          >
            {/* CATEGORY SELECT */}
            <View>
              <Text
                style={{
                  color: "#E5E7EB",
                  fontSize: 14,
                  marginBottom: 8,
                  fontWeight: "600",
                }}
              >
                Categoria
              </Text>

              <View style={{ gap: 10 }}>
                {categories
                  .filter((c) => c.id !== "builtin-subscriptions")
                  .map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      activeOpacity={0.85}
                      onPress={() => setCategoryId(cat.id)}
                      disabled={saving}
                      style={{
                        padding: 14,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor:
                          categoryId === cat.id
                            ? "#FFF"
                            : "rgba(255,255,255,0.08)",
                        backgroundColor:
                          categoryId === cat.id
                            ? "rgba(255,255,255,0.12)"
                            : "rgba(255,255,255,0.04)",
                        opacity: saving ? 0.6 : 1,
                      }}
                    >
                      <Text
                        style={{
                          color: "#FFF",
                          fontSize: 14,
                          fontWeight: "600",
                        }}
                      >
                        {cat.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
              </View>
            </View>

            {/* DESCRIPTION */}
            <View>
              <Text
                style={{
                  color: "#E5E7EB",
                  fontSize: 14,
                  marginBottom: 6,
                  fontWeight: "600",
                }}
              >
                Descrição
              </Text>

              <TextInput
                placeholder="Ex: Uber, mercado, farmácia..."
                placeholderTextColor="#6B7280"
                value={description}
                onChangeText={setDescription}
                editable={!saving}
                style={{
                  backgroundColor: "rgba(255,255,255,0.06)",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.10)",
                  padding: 14,
                  borderRadius: 12,
                  color: "#FFF",
                  fontSize: 15,
                }}
              />
            </View>

            {/* AMOUNT */}
            <View>
              <Text
                style={{
                  color: "#E5E7EB",
                  fontSize: 14,
                  marginBottom: 6,
                  fontWeight: "600",
                }}
              >
                Valor (R$)
              </Text>

              <TextInput
                placeholder="0,00"
                placeholderTextColor="#6B7280"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                editable={!saving}
                style={{
                  backgroundColor: "rgba(255,255,255,0.06)",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.10)",
                  padding: 14,
                  borderRadius: 12,
                  color: "#FFF",
                  fontSize: 15,
                }}
              />
            </View>

            {/* DATE */}
            <View>
              <Text
                style={{
                  color: "#E5E7EB",
                  fontSize: 14,
                  marginBottom: 6,
                  fontWeight: "600",
                }}
              >
                Data
              </Text>

              <TextInput
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#6B7280"
                editable={!saving}
                style={{
                  backgroundColor: "rgba(255,255,255,0.06)",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.10)",
                  padding: 14,
                  borderRadius: 12,
                  color: "#FFF",
                  fontSize: 15,
                }}
              />
            </View>
          </BlurView>

          {/* SAVE BUTTON */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleSave}
            disabled={
              saving || !categoryId || !description.trim() || !amount.trim()
            }
            style={{
              marginTop: 10,
              padding: 16,
              borderRadius: 12,
              backgroundColor:
                !saving && categoryId && description.trim() && amount.trim()
                  ? "#FFF"
                  : "rgba(255,255,255,0.25)",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color:
                  !saving && categoryId && description.trim() && amount.trim()
                    ? "#000"
                    : "rgba(0,0,0,0.4)",
                fontSize: 15,
                fontWeight: "700",
              }}
            >
              {saving ? "Salvando..." : "Registrar gasto"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Screen>
  );
}

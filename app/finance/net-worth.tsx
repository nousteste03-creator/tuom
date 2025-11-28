// app/finance/net-worth.tsx
import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput } from "react-native";
import Screen from "@/components/layout/Screen";
import Icon from "@/components/ui/Icon";
import { useNetWorth } from "@/hooks/useNetWorth";

export default function NetWorthScreen() {
  const { items, netWorth, totalAssets, totalDebts, addItem, removeItem } = useNetWorth();
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ title: "", amount: "", type: "asset" });

  function resetForm() {
    setForm({ title: "", amount: "", type: "asset" });
  }

  async function save() {
    if (!form.title || !form.amount) return;

    await addItem({
      title: form.title,
      amount: Number(form.amount),
      type: form.type as "asset" | "debt",
    });

    resetForm();
    setModalVisible(false);
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 120,
          gap: 26,
        }}
      >
        {/* HEADER */}
        <Text style={{ color: "#FFF", fontSize: 26, fontWeight: "700" }}>
          Patrimônio Líquido
        </Text>

        {/* VALORES */}
        <View
          style={{
            padding: 18,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.08)",
            backgroundColor: "rgba(255,255,255,0.03)",
          }}
        >
          <Text style={{ color: "#9CA3AF", fontSize: 13, marginBottom: 6 }}>
            Patrimônio atual
          </Text>

          <Text style={{ color: "#FFF", fontSize: 30, fontWeight: "700" }}>
            R$ {netWorth.toLocaleString("pt-BR")}
          </Text>

          <View style={{ marginTop: 12, gap: 6 }}>
            <Text style={{ color: "#A7F3D0" }}>
              Ativos: R$ {totalAssets.toLocaleString("pt-BR")}
            </Text>
            <Text style={{ color: "#FCA5A5" }}>
              Dívidas: R$ {totalDebts.toLocaleString("pt-BR")}
            </Text>
          </View>
        </View>

        {/* LISTA DE ITENS */}
        <View style={{ gap: 14 }}>
          {items.map((i) => (
            <TouchableOpacity
              key={i.id}
              activeOpacity={0.7}
              onLongPress={() => removeItem(i.id)}
              style={{
                padding: 16,
                borderRadius: 14,
                backgroundColor: "rgba(255,255,255,0.05)",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.08)",
              }}
            >
              <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "600" }}>
                {i.title}
              </Text>
              <Text
                style={{
                  color: i.type === "asset" ? "#A7F3D0" : "#FCA5A5",
                  marginTop: 4,
                }}
              >
                R$ {i.amount.toLocaleString("pt-BR")}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* BOTÃO ADD */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setModalVisible(true)}
          style={{
            padding: 14,
            borderRadius: 999,
            backgroundColor: "#FFF",
            marginTop: 20,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#000", fontWeight: "700" }}>Adicionar item</Text>
        </TouchableOpacity>

        {/* MODAL */}
        {modalVisible && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.8)",
              padding: 26,
              justifyContent: "center",
              gap: 12,
            }}
          >
            <TextInput
              placeholder="Título"
              placeholderTextColor="#666"
              value={form.title}
              onChangeText={(t) => setForm({ ...form, title: t })}
              style={{
                color: "#FFF",
                backgroundColor: "#111",
                padding: 12,
                borderRadius: 10,
              }}
            />

            <TextInput
              placeholder="Valor"
              placeholderTextColor="#666"
              keyboardType="numeric"
              value={form.amount}
              onChangeText={(t) => setForm({ ...form, amount: t })}
              style={{
                color: "#FFF",
                backgroundColor: "#111",
                padding: 12,
                borderRadius: 10,
              }}
            />

            <View style={{ flexDirection: "row", gap: 12 }}>
              {["asset", "debt"].map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setForm({ ...form, type: t })}
                  style={{
                    flex: 1,
                    padding: 12,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor:
                      form.type === t ? "#FFF" : "rgba(255,255,255,0.25)",
                  }}
                >
                  <Text
                    style={{
                      color: "#FFF",
                      textAlign: "center",
                      opacity: form.type === t ? 1 : 0.6,
                    }}
                  >
                    {t === "asset" ? "Ativo" : "Dívida"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={save}
              style={{
                padding: 14,
                backgroundColor: "#FFF",
                borderRadius: 10,
                marginTop: 10,
              }}
            >
              <Text style={{ textAlign: "center", color: "#000", fontWeight: "700" }}>
                Salvar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={{ marginTop: 10 }}
            >
              <Text style={{ textAlign: "center", color: "#FFF" }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

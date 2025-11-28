// app/finance/savings.tsx
import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput } from "react-native";
import Screen from "@/components/layout/Screen";
import { useSavings } from "@/hooks/useSavings";

export default function SavingsScreen() {
  const { entries, totalSaved, suggestion, addSaving } = useSavings();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");

  async function save() {
    if (!amount) return;
    await addSaving(Number(amount));
    setAmount("");
    setOpen(false);
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
        <Text style={{ color: "#FFF", fontSize: 26, fontWeight: "700" }}>
          Economia Automatizada
        </Text>

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
            Total guardado
          </Text>

          <Text style={{ color: "#FFF", fontSize: 28, fontWeight: "700" }}>
            R$ {totalSaved.toLocaleString("pt-BR")}
          </Text>

          <Text style={{ color: "#A5B4FC", marginTop: 10 }}>
            Sugestão da Pila: guardar R$ {suggestion} essa semana.
          </Text>
        </View>

        <View style={{ gap: 14 }}>
          {entries.map((e) => (
            <View
              key={e.id}
              style={{
                padding: 14,
                borderRadius: 12,
                backgroundColor: "rgba(255,255,255,0.05)",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.08)",
              }}
            >
              <Text style={{ color: "#FFF" }}>
                R$ {e.amount.toLocaleString("pt-BR")}
              </Text>
              <Text style={{ color: "#6B7280", fontSize: 12, marginTop: 4 }}>
                {new Date(e.created_at).toLocaleString("pt-BR")}
              </Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          onPress={() => setOpen(true)}
          style={{
            marginTop: 20,
            padding: 14,
            backgroundColor: "#FFF",
            borderRadius: 999,
          }}
        >
          <Text style={{ textAlign: "center", color: "#000", fontWeight: "700" }}>
            Guardar dinheiro
          </Text>
        </TouchableOpacity>

        {open && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.85)",
              justifyContent: "center",
              padding: 26,
              gap: 12,
            }}
          >
            <TextInput
              placeholder="Valor"
              placeholderTextColor="#666"
              keyboardType="numeric"
              style={{
                backgroundColor: "#111",
                padding: 14,
                borderRadius: 12,
                color: "#FFF",
              }}
              value={amount}
              onChangeText={setAmount}
            />

            <TouchableOpacity
              onPress={save}
              style={{
                padding: 14,
                backgroundColor: "#FFF",
                borderRadius: 12,
              }}
            >
              <Text style={{ textAlign: "center", color: "#000", fontWeight: "700" }}>
                Guardar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setOpen(false)}>
              <Text style={{ textAlign: "center", color: "#FFF", marginTop: 10 }}>
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

// components/app/finance/CategoryEditModal.tsx
import { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

type Props = {
  visible: boolean;
  category: any | null;
  onClose: () => void;
  onSave: (category: any) => void;
  onDelete: (id: string) => void;
};

export default function CategoryEditModal({
  visible,
  category,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"expense" | "income" | "goal">("expense");

  // sincroniza quando abrir
  useEffect(() => {
    if (category) {
      setTitle(category.title);
      setAmount(String(category.amount));
      setType(category.type);
    }
  }, [category]);

  if (!visible || !category) return null;

  function handleSave() {
    const updated = {
      ...category,
      title,
      type,
      amount: Number(amount) || 0,
    };
    onSave(updated);
    onClose();
  }

  function handleDelete() {
    onDelete(category.id);
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.65)",
          justifyContent: "center",
          paddingHorizontal: 20,
        }}
      >
        <ScrollView
          contentContainerStyle={{
            paddingVertical: 40,
            justifyContent: "center",
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={{
              backgroundColor: "rgba(12,12,12,0.92)",
              borderRadius: 22,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.10)",
              padding: 20,
            }}
          >
            <Text
              style={{
                color: "#FFF",
                fontSize: 16,
                fontWeight: "600",
                marginBottom: 12,
              }}
            >
              Editar categoria
            </Text>

            {/* Nome */}
            <View style={{ marginBottom: 14 }}>
              <Text style={{ color: "#9CA3AF", fontSize: 12 }}>Nome</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholderTextColor="#6B7280"
                style={{
                  marginTop: 6,
                  padding: 10,
                  borderRadius: 12,
                  backgroundColor: "rgba(255,255,255,0.05)",
                  color: "#FFF",
                }}
              />
            </View>

            {/* Valor */}
            <View style={{ marginBottom: 14 }}>
              <Text style={{ color: "#9CA3AF", fontSize: 12 }}>
                Valor mensal
              </Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholderTextColor="#6B7280"
                style={{
                  marginTop: 6,
                  padding: 10,
                  borderRadius: 12,
                  backgroundColor: "rgba(255,255,255,0.05)",
                  color: "#FFF",
                }}
              />
            </View>

            {/* Tipo */}
            <View style={{ marginBottom: 14 }}>
              <Text style={{ color: "#9CA3AF", fontSize: 12 }}>Tipo</Text>

              <View style={{ flexDirection: "row", marginTop: 8, gap: 6 }}>
                {(["expense", "income", "goal"] as const).map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    onPress={() => setType(opt)}
                    style={{
                      paddingVertical: 8,
                      paddingHorizontal: 14,
                      borderRadius: 12,
                      backgroundColor:
                        type === opt
                          ? "rgba(255,255,255,0.18)"
                          : "rgba(255,255,255,0.06)",
                      borderWidth: 1,
                      borderColor:
                        type === opt
                          ? "rgba(255,255,255,0.35)"
                          : "rgba(255,255,255,0.10)",
                    }}
                  >
                    <Text style={{ color: "#FFF", fontSize: 13 }}>
                      {opt === "expense"
                        ? "Despesa"
                        : opt === "income"
                        ? "Receita"
                        : "Meta"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Botões */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 20,
              }}
            >
              <TouchableOpacity
                onPress={handleDelete}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 12,
                  backgroundColor: "rgba(255,80,80,0.18)",
                  borderWidth: 1,
                  borderColor: "rgba(255,80,80,0.35)",
                }}
              >
                <Text style={{ color: "#FCA5A5", fontWeight: "600" }}>
                  Excluir
                </Text>
              </TouchableOpacity>

              <View style={{ flexDirection: "row", gap: 10 }}>
                <TouchableOpacity
                  onPress={onClose}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 18,
                    borderRadius: 12,
                    backgroundColor: "rgba(255,255,255,0.06)",
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.10)",
                  }}
                >
                  <Text style={{ color: "#FFF" }}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSave}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 18,
                    borderRadius: 12,
                    backgroundColor: "#FFF",
                  }}
                >
                  <Text style={{ color: "#000", fontWeight: "600" }}>
                    Salvar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

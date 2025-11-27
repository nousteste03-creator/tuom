// components/app/finance/CategoryCreateModal.tsx
import { useState } from "react";
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
import Icon from "@/components/ui/Icon";

type Props = {
  visible: boolean;
  onClose: () => void;
  onCreate: (category: any) => void;
};

export default function CategoryCreateModal({
  visible,
  onClose,
  onCreate,
}: Props) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"expense" | "income" | "goal">("expense");

  // fallback de ID sem crypto
  function generateId() {
    return "cat_" + Math.random().toString(36).substring(2, 10);
  }

  function handleSave() {
    if (!title.trim()) return;

    const newCat = {
      id: generateId(),
      title,
      type,
      amount: Number(amount) || 0,
    };

    onCreate(newCat);
    onClose();
    setTitle("");
    setAmount("");
    setType("expense");
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
              Criar categoria
            </Text>

            {/* Título */}
            <View style={{ marginBottom: 14 }}>
              <Text style={{ color: "#9CA3AF", fontSize: 12 }}>
                Nome da categoria
              </Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Ex: Alimentação"
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
                placeholder="0,00"
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
            <View style={{ marginBottom: 12 }}>
              <Text style={{ color: "#9CA3AF", fontSize: 12 }}>Tipo</Text>

              <View
                style={{
                  flexDirection: "row",
                  marginTop: 8,
                  gap: 6,
                }}
              >
                {([
                  { id: "expense", label: "Despesa" },
                  { id: "income", label: "Receita" },
                  { id: "goal", label: "Meta" },
                ] as const).map((opt) => (
                  <TouchableOpacity
                    key={opt.id}
                    onPress={() => setType(opt.id)}
                    style={{
                      paddingVertical: 8,
                      paddingHorizontal: 14,
                      borderRadius: 12,
                      backgroundColor:
                        type === opt.id
                          ? "rgba(255,255,255,0.18)"
                          : "rgba(255,255,255,0.06)",
                      borderWidth: 1,
                      borderColor:
                        type === opt.id
                          ? "rgba(255,255,255,0.35)"
                          : "rgba(255,255,255,0.10)",
                    }}
                  >
                    <Text
                      style={{
                        color: "#FFF",
                        fontSize: 13,
                        fontWeight: "500",
                      }}
                    >
                      {opt.label}
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
                marginTop: 18,
              }}
            >
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
                <Text style={{ color: "#000", fontWeight: "600" }}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

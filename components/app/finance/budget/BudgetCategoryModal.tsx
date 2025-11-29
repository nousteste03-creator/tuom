// components/app/finance/budget/BudgetCategoryModal.tsx
import { Modal, View, Text, TextInput, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";

export default function BudgetCategoryModal({
  visible,
  onClose,
  onSave,
  category,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (data: { title: string; limit: number }) => void;
  category?: { title: string; limit: number };
}) {
  const [title, setTitle] = useState("");
  const [limit, setLimit] = useState("");

  useEffect(() => {
    if (category) {
      setTitle(category.title);
      setLimit(String(category.limit));
    } else {
      setTitle("");
      setLimit("");
    }
  }, [category]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.7)",
          padding: 26,
          justifyContent: "center",
        }}
      >
        <View
          style={{
            backgroundColor: "rgba(255,255,255,0.06)",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.1)",
            padding: 20,
            borderRadius: 18,
          }}
        >
          <Text
            style={{
              color: "#FFF",
              fontSize: 17,
              fontWeight: "700",
              marginBottom: 16,
            }}
          >
            {category ? "Editar categoria" : "Criar categoria"}
          </Text>

          <TextInput
            placeholder="Nome da categoria"
            placeholderTextColor="#6B7280"
            value={title}
            onChangeText={setTitle}
            style={{
              color: "#FFF",
              backgroundColor: "rgba(255,255,255,0.04)",
              borderRadius: 12,
              padding: 12,
              marginBottom: 12,
            }}
          />

          <TextInput
            placeholder="Limite mensal"
            placeholderTextColor="#6B7280"
            keyboardType="numeric"
            value={limit}
            onChangeText={setLimit}
            style={{
              color: "#FFF",
              backgroundColor: "rgba(255,255,255,0.04)",
              borderRadius: 12,
              padding: 12,
              marginBottom: 20,
            }}
          />

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() =>
              onSave({
                title,
                limit: parseFloat(limit) || 0,
              })
            }
            style={{
              backgroundColor: "#FFF",
              padding: 12,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#000", fontWeight: "700" }}>Salvar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onClose}
            style={{ marginTop: 14, alignItems: "center" }}
          >
            <Text style={{ color: "#9CA3AF" }}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

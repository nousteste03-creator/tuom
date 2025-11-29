// components/app/finance/budget/AddBudgetExpenseModal.tsx
import { Modal, View, Text, TextInput, TouchableOpacity } from "react-native";
import { useState } from "react";

export default function AddBudgetExpenseModal({
  visible,
  onClose,
  onSave,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (data: { description: string; amount: number }) => void;
}) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

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
            Adicionar gasto
          </Text>

          <TextInput
            placeholder="Descrição"
            placeholderTextColor="#6B7280"
            value={description}
            onChangeText={setDescription}
            style={{
              color: "#FFF",
              backgroundColor: "rgba(255,255,255,0.04)",
              borderRadius: 12,
              padding: 12,
              marginBottom: 12,
            }}
          />

          <TextInput
            placeholder="Valor"
            placeholderTextColor="#6B7280"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
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
                description,
                amount: parseFloat(amount) || 0,
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

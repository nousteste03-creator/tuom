import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
} from "react-native";
import { BlurView } from "expo-blur";
import Icon from "@/components/ui/Icon";

type Props = {
  visible: boolean;
  onClose: () => void;
  category: {
    id: string;
    title: string;
    type: "income" | "expense" | "goal";
    amount: number;
    recurring: boolean;
  };
  onSave: (updated: any) => void;
  onDelete: (id: string) => void;
};

export default function EditCategoryModal({
  visible,
  onClose,
  category,
  onSave,
  onDelete,
}: Props) {
  const [title, setTitle] = useState(category.title);
  const [amount, setAmount] = useState(String(category.amount));
  const [recurring, setRecurring] = useState(category.recurring);
  const [type, setType] = useState(category.type);

  const handleSave = () => {
    onSave({
      ...category,
      title,
      amount: parseFloat(amount.replace(",", ".")),
      recurring,
      type,
    });

    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <BlurView
        tint="dark"
        intensity={50}
        style={{
          flex: 1,
          padding: 20,
          paddingTop: 70,
          backgroundColor: "rgba(0,0,0,0.75)",
        }}
      >
        <View
          style={{
            borderRadius: 22,
            padding: 20,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.12)",
            backgroundColor: "rgba(10,10,10,0.65)",
          }}
        >
          {/* HEADER */}
          <View
            style={{
              marginBottom: 20,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: "#FFF",
                fontSize: 18,
                fontWeight: "700",
              }}
            >
              Editar categoria
            </Text>

            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={22} color="#FFF" />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ maxHeight: "80%" }}>
            {/* CAMPOS — iguais ao Criar */}
            <Text style={{ color: "#9CA3AF", marginBottom: 6, fontSize: 13 }}>
              Nome
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Nome"
              placeholderTextColor="#6B7280"
              style={{
                borderRadius: 14,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.12)",
                padding: 12,
                marginBottom: 18,
                color: "#FFF",
              }}
            />

            <Text style={{ color: "#9CA3AF", marginBottom: 6, fontSize: 13 }}>
              Valor mensal
            </Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="Valor"
              placeholderTextColor="#6B7280"
              style={{
                borderRadius: 14,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.12)",
                padding: 12,
                marginBottom: 18,
                color: "#FFF",
              }}
            />

            {/* TIPO */}
            <Text style={{ color: "#9CA3AF", marginBottom: 6, fontSize: 13 }}>
              Tipo
            </Text>
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 18 }}>
              {[
                { key: "expense", label: "Despesa" },
                { key: "income", label: "Receita" },
                { key: "goal", label: "Meta" },
              ].map((item) => {
                const active = type === item.key;
                return (
                  <TouchableOpacity
                    key={item.key}
                    onPress={() => setType(item.key as any)}
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: active
                        ? "#FFF"
                        : "rgba(255,255,255,0.12)",
                      backgroundColor: active
                        ? "rgba(255,255,255,0.15)"
                        : "rgba(20,20,20,0.8)",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: active ? "#FFF" : "#9CA3AF",
                        fontSize: 13,
                        fontWeight: "600",
                      }}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* RECORRÊNCIA */}
            <TouchableOpacity
              onPress={() => setRecurring(!recurring)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                marginBottom: 20,
              }}
            >
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.2)",
                  backgroundColor: recurring
                    ? "#FFF"
                    : "rgba(255,255,255,0.04)",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {recurring && <Icon name="checkmark" size={14} color="#000" />}
              </View>

              <Text style={{ color: "#E5E7EB", fontSize: 13 }}>
                É recorrente todo mês?
              </Text>
            </TouchableOpacity>

            {/* BOTÃO SALVAR */}
            <TouchableOpacity
              onPress={handleSave}
              activeOpacity={0.9}
              style={{
                marginBottom: 10,
                backgroundColor: "#FFF",
                paddingVertical: 12,
                borderRadius: 14,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "#000",
                  fontSize: 14,
                  fontWeight: "700",
                }}
              >
                Salvar alterações
              </Text>
            </TouchableOpacity>

            {/* EXCLUIR */}
            <TouchableOpacity
              onPress={() => onDelete(category.id)}
              activeOpacity={0.9}
              style={{
                paddingVertical: 12,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: "#EF4444",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "#EF4444",
                  fontSize: 14,
                  fontWeight: "700",
                }}
              >
                Excluir categoria
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </BlurView>
    </Modal>
  );
}

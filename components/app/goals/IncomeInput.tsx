import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Platform,
  Pressable,
  Animated,
  Modal,
  KeyboardAvoidingView,
  StyleSheet,
} from "react-native";
import { BlurView } from "expo-blur";
import Icon from "@/components/ui/Icon";

type IncomeForm = {
  tipo: "salario" | "servico" | "empresa" | "variavel" | "extra";
  valor: string;
  recorrencia: "mensal" | "semanal" | "quinzenal" | "unica";
  data_inicio: string;
  data_fim?: string;
};

type Props = {
  visible: boolean;
  initial?: Partial<IncomeForm>;
  onClose: () => void;
  onSubmit: (form: IncomeForm) => void;
};

export function IncomeInput({ visible, initial, onClose, onSubmit }: Props) {
  const [anim] = useState(new Animated.Value(0));

  const [tipo, setTipo] = useState<IncomeForm["tipo"]>("salario");
  const [valor, setValor] = useState("");
  const [recorrencia, setRecorrencia] =
    useState<IncomeForm["recorrencia"]>("mensal");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  // ABRIR E FECHAR ANIMAÇÃO
  useEffect(() => {
    if (visible) {
      Animated.timing(anim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      setTipo(initial?.tipo || "salario");
      setValor(initial?.valor || "");
      setRecorrencia(initial?.recorrencia || "mensal");
      setDataInicio(
        initial?.data_inicio || new Date().toISOString().slice(0, 10)
      );
      setDataFim(initial?.data_fim || "");
    } else {
      Animated.timing(anim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  function handleSave() {
    if (!valor.trim() || !dataInicio.trim()) return;

    onSubmit({
      tipo,
      valor,
      recorrencia,
      data_inicio: dataInicio,
      data_fim: dataFim || undefined,
    });
  }

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={40}
        style={{ flex: 1, justifyContent: "flex-end" }}
      >
        {/* BACKDROP */}
        <Pressable
          onPress={onClose}
          style={StyleSheet.absoluteFillObject}
        >
          <BlurView
            intensity={55}
            tint="dark"
            style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)" }}
          />
        </Pressable>

        {/* BOTTOM SHEET */}
        <Animated.View
          style={{
            padding: 18,
            paddingBottom: Platform.OS === "ios" ? 40 : 18,
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            backgroundColor: "rgba(10,10,12,0.94)",
            borderTopWidth: 1,
            borderColor: "rgba(255,255,255,0.12)",
            transform: [
              {
                translateY: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [350, 0],
                }),
              },
            ],
          }}
        >
          {/* HEADER */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                flex: 1,
                fontSize: 17,
                fontWeight: "700",
                color: "#FFF",
              }}
            >
              Adicionar renda
            </Text>

            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Tipo */}
          <FieldLabel label="Tipo de renda" />
          <ChipGroup
            items={[
              { key: "salario", label: "Salário" },
              { key: "servico", label: "Serviço" },
              { key: "empresa", label: "Empresa" },
              { key: "variavel", label: "Variável" },
              { key: "extra", label: "Extra" },
            ]}
            value={tipo}
            onChange={setTipo}
          />

          {/* Valor */}
          <FieldLabel label="Valor" />
          <FieldInput
            value={valor}
            onChangeText={setValor}
            placeholder="R$ 0,00"
            keyboardType="numeric"
          />

          {/* Recorrência */}
          <FieldLabel label="Recorrência" />
          <ChipGroup
            items={[
              { key: "mensal", label: "Mensal" },
              { key: "semanal", label: "Semanal" },
              { key: "quinzenal", label: "Quinzenal" },
              { key: "unica", label: "Única" },
            ]}
            value={recorrencia}
            onChange={setRecorrencia}
          />

          {/* Datas */}
          <FieldLabel label="Data início" />
          <FieldInput
            value={dataInicio}
            onChangeText={setDataInicio}
            placeholder="AAAA-MM-DD"
          />

          <FieldLabel label="Data fim (opcional)" />
          <FieldInput
            value={dataFim}
            onChangeText={setDataFim}
            placeholder="AAAA-MM-DD"
          />

          {/* BOTÃO SALVAR */}
          <TouchableOpacity
            onPress={handleSave}
            style={{
              marginTop: 22,
              paddingVertical: 14,
              borderRadius: 999,
              backgroundColor: "#8A8FFF",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 15,
                fontWeight: "600",
                color: "#FFF",
              }}
            >
              Salvar
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/* --- SUB COMPONENTES --- */

function FieldLabel({ label }: { label: string }) {
  return (
    <Text
      style={{
        marginTop: 12,
        marginBottom: 4,
        fontSize: 12,
        color: "rgba(255,255,255,0.7)",
      }}
    >
      {label}
    </Text>
  );
}

function FieldInput({
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
}: {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "numeric";
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="rgba(255,255,255,0.35)"
      keyboardType={keyboardType}
      style={{
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.18)",
        paddingHorizontal: 14,
        paddingVertical: 10,
        color: "#FFF",
        fontSize: 15,
        backgroundColor: "rgba(255,255,255,0.05)",
      }}
    />
  );
}

function ChipGroup({
  items,
  value,
  onChange,
}: {
  items: { key: string; label: string }[];
  value: string;
  onChange: (v: any) => void;
}) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 4 }}>
      {items.map((item) => {
        const active = value === item.key;
        return (
          <TouchableOpacity
            key={item.key}
            onPress={() => onChange(item.key)}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: active
                ? "rgba(138,143,255,0.9)"
                : "rgba(255,255,255,0.18)",
              backgroundColor: active
                ? "rgba(138,143,255,0.20)"
                : "transparent",
              marginRight: 6,
              marginBottom: 6,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                color: active ? "#FFF" : "rgba(255,255,255,0.7)",
              }}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

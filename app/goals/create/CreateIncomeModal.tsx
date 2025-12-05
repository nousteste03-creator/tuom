import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Animated,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { BlurView } from "expo-blur";
import { useIncomeSources } from "@/hooks/useIncomeSources";

const brandFont = Platform.select({
  ios: "SF Pro Display",
  android: "Inter",
  default: "System",
});

/* ---------------------------------------------------------
   Normalização da data — aceita DD/MM/YYYY ou YYYY-MM-DD
----------------------------------------------------------*/
function normalizeDateForSupabase(input: string): string | null {
  if (!input) return null;

  const date = input.trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }

  const match = date.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (match) {
    let [_, d, m, y] = match;
    if (y.length === 2) y = "20" + y;

    return `${y.padStart(4, "0")}-${m.padStart(2, "0")}-${d.padStart(
      2,
      "0"
    )}`;
  }

  return null;
}

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function CreateIncomeModal({ visible, onClose }: Props) {
  const { createIncomeSource, reload } = useIncomeSources();

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState("monthly");
  const [nextDate, setNextDate] = useState("");

  // Erros Apple Wallet
  const [errors, setErrors] = useState<{ name?: string; amount?: string }>({});

  /* ------------------------------------------------------- */
  useEffect(() => {
    if (visible) setErrors({});
  }, [visible]);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fade, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(slide, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fade.setValue(0);
      slide.setValue(20);
    }
  }, [visible]);

  /* ------------------------------------------------------- */
  function validate() {
    const newErrors: any = {};

    if (!name.trim()) newErrors.name = "Preencha este campo";
    if (!amount.trim()) newErrors.amount = "Preencha este campo";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  /* ------------------------------------------------------- */
  const handleCreate = async () => {
    console.log("DEBUG/CreateIncomeModal → handleCreate() chamado");

    if (!validate()) return;

    const normalizedDate = normalizeDateForSupabase(nextDate);

    const payload = {
      name: name.trim(),
      amount: Number(amount.replace(",", ".")) || 0,
      frequency,
      nextDate: normalizedDate,
    };

    console.log("DEBUG/CreateIncomeModal → Enviando createIncomeSource()", payload);

    const id = await createIncomeSource(payload);
    console.log("DEBUG/CreateIncomeModal → createIncomeSource() retornou:", id);

    await reload();
    setTimeout(() => onClose(), 120);
  };

  const disabled = !name.trim() || !amount.trim();

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.overlay,
        { opacity: fade, transform: [{ translateY: slide }] },
      ]}
    >
      <BlurView intensity={40} tint="dark" style={styles.modalContainer}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{ padding: 22, paddingBottom: 44 }}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.header}>Adicionar Receita</Text>

            {/* Campo Nome */}
            <View
              style={[
                styles.card,
                errors.name && styles.cardErrorBorder,
              ]}
            >
              <Text style={styles.label}>Fonte de renda</Text>
              <TextInput
                placeholder="Ex: Salário, Freelance..."
                placeholderTextColor="rgba(255,255,255,0.3)"
                style={styles.input}
                value={name}
                onChangeText={setName}
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            {/* Valor */}
            <View
              style={[
                styles.card,
                errors.amount && styles.cardErrorBorder,
              ]}
            >
              <Text style={styles.label}>Valor</Text>
              <TextInput
                placeholder="0,00"
                keyboardType="numeric"
                placeholderTextColor="rgba(255,255,255,0.3)"
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
              />
              {errors.amount && (
                <Text style={styles.errorText}>{errors.amount}</Text>
              )}
            </View>

            {/* Frequência */}
            <View style={styles.card}>
              <Text style={styles.label}>Frequência</Text>
              <TextInput
                placeholder="monthly / weekly / once"
                placeholderTextColor="rgba(255,255,255,0.3)"
                style={styles.input}
                value={frequency}
                onChangeText={setFrequency}
              />
            </View>

            {/* Data próxima */}
            <View style={styles.card}>
              <Text style={styles.label}>Próximo pagamento (opcional)</Text>
              <TextInput
                placeholder="AAAA-MM-DD ou DD/MM/AAAA"
                placeholderTextColor="rgba(255,255,255,0.3)"
                style={styles.input}
                value={nextDate}
                onChangeText={setNextDate}
              />
            </View>

            {/* Botão Criar */}
            <TouchableOpacity
              onPress={handleCreate}
              disabled={disabled}
              style={[styles.button, disabled && { opacity: 0.4 }]}
            >
              <Text style={styles.buttonText}>Adicionar Receita</Text>
            </TouchableOpacity>

            {/* Fechar */}
            <TouchableOpacity
              onPress={onClose}
              style={{ marginTop: 18, alignSelf: "center" }}
            >
              <Text style={styles.cancel}>Cancelar</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </BlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    inset: 0,
    justifyContent: "flex-end",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  header: {
    color: "white",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 18,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  cardErrorBorder: {
    borderColor: "rgba(255,80,80,0.45)",
  },
  label: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    marginBottom: 6,
  },
  input: {
    color: "white",
    fontSize: 16,
    paddingVertical: 4,
  },
  errorText: {
    marginTop: 4,
    color: "rgba(255,70,70,0.85)",
    fontSize: 12,
  },
  button: {
    backgroundColor: "#d8eceeff",
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 16,
  },
  buttonText: {
    color: "636594ff",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 15,
  },
  cancel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
  },
});

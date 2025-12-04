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

  // Caso já esteja correto
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    console.log("normalizeDate → já normalizado:", date);
    return date;
  }

  // DD/MM/YYYY
  const match = date.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (match) {
    let [_, d, m, y] = match;

    if (y.length === 2) y = "20" + y;
    const normalized = `${y.padStart(4, "0")}-${m.padStart(
      2,
      "0"
    )}-${d.padStart(2, "0")}`;

    console.log("normalizeDate → convertido:", { original: date, normalized });
    return normalized;
  }

  console.log("normalizeDate → inválida:", date);
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
  const [frequency, setFrequency] = useState("monthly"); // padrão
  const [nextDate, setNextDate] = useState("");

  /* -------------------------------------------------------
     LOG: Abertura e fechamento
  --------------------------------------------------------*/
  useEffect(() => {
    if (visible) console.log("DEBUG/CreateIncomeModal → modal ABERTO");
    else console.log("DEBUG/CreateIncomeModal → modal FECHADO");
  }, [visible]);

  /* -------------------------------------------------------
     Animação do sheet modal (70% Apple)
  --------------------------------------------------------*/
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
      Animated.parallel([
        Animated.timing(fade, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(slide, {
          toValue: 20,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fade, slide]);

  /* -------------------------------------------------------
     SUBMIT — criar fonte de renda
  --------------------------------------------------------*/
  const handleCreate = async () => {
    console.log("DEBUG/CreateIncomeModal → handleCreate() chamado");

    if (!name || !amount) {
      console.log("DEBUG/CreateIncomeModal → campos inválidos", {
        name,
        amount,
        frequency,
        nextDate,
      });
      return;
    }

    const normalizedDate = normalizeDateForSupabase(nextDate);

    const payload = {
      name: name.trim(),
      amount: Number(amount.replace(",", ".")) || 0,
      frequency,
      nextDate: normalizedDate,
    };

    console.log("DEBUG/CreateIncomeModal → Enviando createIncomeSource()", payload);

    try {
      const id = await createIncomeSource(payload);
      console.log("DEBUG/CreateIncomeModal → createIncomeSource() retornou:", id);
    } catch (err) {
      console.log("ERROR/CreateIncomeModal → erro:", err);
    }

    await reload();
    onClose();
  };

  const disabled = !name || !amount;

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          opacity: fade,
          transform: [{ translateY: slide }],
        },
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

            {/* Campo nome */}
            <View style={styles.card}>
              <Text style={styles.label}>Fonte de renda</Text>
              <TextInput
                placeholder="Ex: Salário, Freelance..."
                placeholderTextColor="rgba(255,255,255,0.3)"
                style={styles.input}
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Valor */}
            <View style={styles.card}>
              <Text style={styles.label}>Valor</Text>
              <TextInput
                placeholder="0,00"
                keyboardType="numeric"
                placeholderTextColor="rgba(255,255,255,0.3)"
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
              />
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

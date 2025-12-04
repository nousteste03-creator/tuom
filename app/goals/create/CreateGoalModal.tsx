import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import { useGoals } from "@/hooks/useGoals";

type Props = {
  visible: boolean;
  onClose: () => void;
};

/* -----------------------------------------------------
   Função: converte DD/MM/YYYY → YYYY-MM-DD (Postgres)
------------------------------------------------------*/
function normalizeDateForSupabase(input: string): string | null {
  if (!input) return null;

  // Remove espaços
  const date = input.trim();

  // Caso já esteja no formato YYYY-MM-DD → retorna direto
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    console.log("DEBUG normalizeDate → já está correto:", date);
    return date;
  }

  // Tenta converter formato brasileiro
  const match = date.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (match) {
    let [_, d, m, y] = match;

    if (y.length === 2) y = "20" + y; // ex: 26 → 2026

    const normalized = `${y.padStart(4, "0")}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;

    console.log("DEBUG normalizeDate → convertido:", {
      original: date,
      normalized,
    });

    return normalized;
  }

  // Se não reconheceu, retorna null (Supabase aceita null)
  console.log("DEBUG normalizeDate → formato inválido:", date);
  return null;
}

export default function CreateGoalModal({ visible, onClose }: Props) {
  const { createGoal } = useGoals();

  // Campos
  const [title, setTitle] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [endDate, setEndDate] = useState("");

  // Animações
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;

  /* -----------------------------------------
     LOG — Abertura / fechamento do modal
  ------------------------------------------*/
  useEffect(() => {
    if (visible) {
      console.log("DEBUG/CreateGoalModal → modal ABERTO");
    } else {
      console.log("DEBUG/CreateGoalModal → modal FECHADO");
    }
  }, [visible]);

  /* -----------------------------------------
     Animações
  ------------------------------------------*/
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

  /* -----------------------------------------
     SUBMIT — Criar meta
  ------------------------------------------*/
  const handleCreate = async () => {
    console.log("DEBUG/CreateGoalModal → handleCreate() chamado");

    if (!title || !targetAmount) {
      console.log("DEBUG/CreateGoalModal → campos inválidos:", {
        title,
        targetAmount,
        currentAmount,
        endDate,
      });
      return;
    }

    const target = Number(targetAmount) || 0;
    const current = Number(currentAmount || 0);

    // NORMALIZAÇÃO DA DATA AQUI
    const normalizedEndDate = normalizeDateForSupabase(endDate);

    const payload = {
      type: "goal",
      title: title.trim(),
      targetAmount: target,
      currentAmount: current,
      endDate: normalizedEndDate,
    };

    console.log("DEBUG/CreateGoalModal → Enviando createGoal()", payload);

    try {
      const id = await createGoal(payload);

      console.log("DEBUG/CreateGoalModal → createGoal() retornou id:", id);
    } catch (err) {
      console.log("ERROR/CreateGoalModal → Erro ao criar meta:", err);
    }

    onClose();
  };

  const disabled = !title || !targetAmount;

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
            contentContainerStyle={{
              padding: 22,
              paddingBottom: 44,
            }}
            showsVerticalScrollIndicator={false}
          >
            {/* HEADER */}
            <Text style={styles.header}>Criar Meta</Text>

            {/* CARD — Nome */}
            <View style={styles.card}>
              <Text style={styles.label}>Nome da meta</Text>
              <TextInput
                placeholder="Ex: Viagem, Reserva..."
                placeholderTextColor="rgba(255,255,255,0.3)"
                style={styles.input}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            {/* CARD — Valor Atual */}
            <View style={styles.card}>
              <Text style={styles.label}>Quanto já tenho?</Text>
              <TextInput
                placeholder="0"
                keyboardType="numeric"
                placeholderTextColor="rgba(255,255,255,0.3)"
                style={styles.input}
                value={currentAmount}
                onChangeText={setCurrentAmount}
              />
            </View>

            {/* CARD — Valor Final */}
            <View style={styles.card}>
              <Text style={styles.label}>Valor desejado</Text>
              <TextInput
                placeholder="1000"
                keyboardType="numeric"
                placeholderTextColor="rgba(255,255,255,0.3)"
                style={styles.input}
                value={targetAmount}
                onChangeText={setTargetAmount}
              />
            </View>

            {/* CARD — Data Final */}
            <View style={styles.card}>
              <Text style={styles.label}>Data limite (opcional)</Text>
              <TextInput
                placeholder="AAAA-MM-DD"
                placeholderTextColor="rgba(255,255,255,0.3)"
                style={styles.input}
                value={endDate}
                onChangeText={setEndDate}
              />
            </View>

            {/* BOTÃO */}
            <TouchableOpacity
              onPress={handleCreate}
              disabled={disabled}
              style={[styles.button, disabled && { opacity: 0.4 }]}
            >
              <Text style={styles.buttonText}>Criar Meta</Text>
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

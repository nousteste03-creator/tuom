// app/goals/create/CreateDebtModal.tsx
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
import ModalPremiumPaywall from "@/components/app/common/ModalPremiumPaywall";

/* ===========================================================
   Normalização de datas
=========================================================== */
function normalizeDateForSupabase(input: string): string | null {
  if (!input) return null;
  const date = input.trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;

  const match = date.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (match) {
    let [_, d, m, y] = match;
    if (y.length === 2) y = "20" + y;

    return `${y.padStart(4, "0")}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  return null;
}

type Props = { visible: boolean; onClose: () => void };

export default function CreateDebtModal({ visible, onClose }: Props) {
  const { createGoal } = useGoals();

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;

  // Campos
  const [title, setTitle] = useState("");
  const [total, setTotal] = useState("");
  const [paid, setPaid] = useState("");
  const [installments, setInstallments] = useState("12");
  const [firstDate, setFirstDate] = useState("");

  // Estilo da dívida
  const [debtStyle, setDebtStyle] =
    useState<"loan" | "credit_card" | "financing">("loan");

  // PAYWALL
  const [showPaywall, setShowPaywall] = useState(false);

  /* LOG modal */
  useEffect(() => {
    console.log(`DEBUG/CreateDebtModal → modal ${visible ? "ABERTO" : "FECHADO"}`);
  }, [visible]);

  /* Animação */
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: visible ? 1 : 0,
        duration: visible ? 250 : 180,
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: visible ? 0 : 20,
        duration: visible ? 250 : 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible]);

  /* Submit */
  const handleCreate = async () => {
    console.log("DEBUG/CreateDebtModal → handleCreate() chamado");

    if (!title.trim()) return console.log("DEBUG → título vazio");
    if (!total) return console.log("DEBUG → total vazio");

    const totalValue = Number(total.replace(",", ".")) || 0;
    const paidValue = Number(paid.replace(",", ".")) || 0;
    const qty = Number(installments) || 1;

    const installmentAmount = (totalValue - paidValue) / qty;

    const normalizedFirstDate =
      normalizeDateForSupabase(firstDate) ?? new Date().toISOString();

    const payload = {
      type: "debt",
      title,
      targetAmount: totalValue,
      currentAmount: paidValue,
      debtStyle,
      installmentsCount: qty,
      installmentAmount,
      firstDueDate: normalizedFirstDate,
      startDate: new Date().toISOString(),
    };

    console.log("DEBUG/CreateDebtModal → payload FINAL:", payload);

    const id = await createGoal(payload);

    // PAYWALL DETECTADO
    if (id === "PAYWALL") {
      console.log("DEBUG/CreateDebtModal → PAYWALL DETECTADO");
      setShowPaywall(true);
      return;
    }

    console.log("DEBUG/CreateDebtModal → createGoal retornou:", id);

    onClose();
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[styles.overlay, { opacity: fade, transform: [{ translateY: slide }] }]}
    >
      <BlurView intensity={40} tint="dark" style={styles.modalContainer}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 22, paddingBottom: 44 }}
          >
            <Text style={styles.header}>Criar Dívida</Text>

            <View style={styles.card}>
              <Text style={styles.label}>Nome da dívida</Text>
              <TextInput
                placeholder="Ex: Empréstimo Banco Inter"
                placeholderTextColor="rgba(255,255,255,0.3)"
                style={styles.input}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={styles.card}>
              <Text style={styles.label}>Valor total</Text>
              <TextInput
                placeholder="0"
                keyboardType="numeric"
                placeholderTextColor="rgba(255,255,255,0.3)"
                style={styles.input}
                value={total}
                onChangeText={setTotal}
              />
            </View>

            <View style={styles.card}>
              <Text style={styles.label}>Já pago (opcional)</Text>
              <TextInput
                placeholder="0"
                keyboardType="numeric"
                placeholderTextColor="rgba(255,255,255,0.3)"
                style={styles.input}
                value={paid}
                onChangeText={setPaid}
              />
            </View>

            <View style={styles.card}>
              <Text style={styles.label}>Quantidade de parcelas</Text>
              <TextInput
                placeholder="12"
                keyboardType="numeric"
                placeholderTextColor="rgba(255,255,255,0.3)"
                style={styles.input}
                value={installments}
                onChangeText={setInstallments}
              />
            </View>

            <View style={styles.card}>
              <Text style={styles.label}>Primeira parcela</Text>
              <TextInput
                placeholder="05/01/2025"
                placeholderTextColor="rgba(255,255,255,0.3)"
                style={styles.input}
                value={firstDate}
                onChangeText={setFirstDate}
              />
            </View>

            <TouchableOpacity style={styles.button} onPress={handleCreate}>
              <Text style={styles.buttonText}>Criar Dívida</Text>
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

      {/* PAYWALL PREMIUM */}
      {showPaywall && (
        <ModalPremiumPaywall
          visible={showPaywall}
          onClose={() => setShowPaywall(false)}
          onUpgrade={() => console.log("DEBUG → Upgrade clicado")}
        />
      )}
    </Animated.View>
  );
}

/* ===========================================================
   Estilos
=========================================================== */
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
    backgroundColor: "#d8ecee",
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 16,
  },
  buttonText: {
    color: "#636594",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 15,
  },
  cancel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
  },
});

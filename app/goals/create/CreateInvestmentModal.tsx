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

/* -----------------------------------------------------
   Normaliza data DD/MM/YYYY → YYYY-MM-DD para Postgres
------------------------------------------------------*/
function normalizeDate(input: string): string | null {
  if (!input) return null;

  const date = input.trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;

  const m = date.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (m) {
    let [_, d, mm, y] = m;
    if (y.length === 2) y = "20" + y;

    const normalized = `${y.padStart(4, "0")}-${mm.padStart(
      2,
      "0"
    )}-${d.padStart(2, "0")}`;

    console.log("DEBUG normalizeDate → convertido:", {
      original: date,
      normalized,
    });

    return normalized;
  }

  console.log("DEBUG normalizeDate → formato inválido:", date);
  return null;
}

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function CreateInvestmentModal({ visible, onClose }: Props) {
  const { createGoal, reload, investments } = useGoals();

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;

  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("");
  const [current, setCurrent] = useState("");
  const [startDate, setStartDate] = useState("");
  const [monthly, setMonthly] = useState("");

  // NOVO → Estado para abrir o paywall
  const [showPaywall, setShowPaywall] = useState(false);

  /* LOG — mostrar abertura / fechamento */
  useEffect(() => {
    console.log(
      `DEBUG/CreateInvestmentModal → modal ${visible ? "ABERTO" : "FECHADO"}`
    );
  }, [visible]);

  /* ANIMAÇÃO */
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

  /* SUBMIT */
  async function handleCreate() {
    console.log("DEBUG CreateInvestmentModal → handleCreate() chamado");

    if (!title.trim()) {
      console.log("ERRO → título vazio");
      return;
    }

    const targetValue = Number(target.replace(",", ".")) || 0;
    const currentValue = Number(current.replace(",", ".")) || 0;
    const monthlyValue =
      monthly.trim().length > 0 ? Number(monthly.replace(",", ".")) : null;

    const normalizedStart =
      normalizeDate(startDate) ?? new Date().toISOString();

    const payload = {
      type: "investment",
      title: title.trim(),
      targetAmount: targetValue || null,
      currentAmount: currentValue,
      autoRuleMonthly: monthlyValue,
      startDate: normalizedStart,
    };

    console.log("DEBUG/CreateInvestmentModal → Enviando createGoal()", payload);

    const id = await createGoal(payload);

    // NOVO → Se o hook retornar PAYWALL, abrir modal premium
    if (id === "PAYWALL") {
      console.log("DEBUG → PAYWALL DETECTADO — abrindo modal premium");
      setShowPaywall(true);
      return; // Não fecha o modal original
    }

    console.log("DEBUG/CreateInvestmentModal → createGoal() retornou id:", id);

    await reload();
    setTimeout(() => onClose(), 120);
  }

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
            contentContainerStyle={{
              padding: 22,
              paddingBottom: 44,
            }}
            showsVerticalScrollIndicator={false}
          >
            {/* HEADER */}
            <Text style={styles.header}>Criar Investimento</Text>

            {/* LISTA EXISTENTE */}
            <Text style={styles.subheader}>Investimentos carregados:</Text>

            {investments.length === 0 ? (
              <Text style={styles.empty}>Nenhum investimento ainda.</Text>
            ) : (
              investments.map((i) => (
                <Text key={i.id} style={styles.loadedItem}>
                  • {i.title} → {i.currentAmount}
                </Text>
              ))
            )}

            {/* CAMPOS */}
            <View style={styles.card}>
              <Text style={styles.label}>Nome</Text>
              <TextInput
                placeholder="Tesouro Selic, Ações..."
                placeholderTextColor="rgba(255,255,255,0.3)"
                style={styles.input}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={styles.card}>
              <Text style={styles.label}>Valor atual (aporte inicial)</Text>
              <TextInput
                placeholder="0,00"
                keyboardType="numeric"
                placeholderTextColor="rgba(255,255,255,0.3)"
                style={styles.input}
                value={current}
                onChangeText={setCurrent}
              />
            </View>

            <View style={styles.card}>
              <Text style={styles.label}>Valor alvo (opcional)</Text>
              <TextInput
                placeholder="0,00"
                keyboardType="numeric"
                placeholderTextColor="rgba(255,255,255,0.3)"
                style={styles.input}
                value={target}
                onChangeText={setTarget}
              />
            </View>

            <View style={styles.card}>
              <Text style={styles.label}>Aporte mensal sugerido</Text>
              <TextInput
                placeholder="0,00"
                keyboardType="numeric"
                placeholderTextColor="rgba(255,255,255,0.3)"
                style={styles.input}
                value={monthly}
                onChangeText={setMonthly}
              />
            </View>

            <View style={styles.card}>
              <Text style={styles.label}>
                Data início (AAAA-MM-DD ou DD/MM/AAAA)
              </Text>
              <TextInput
                placeholder="2025-01-05"
                placeholderTextColor="rgba(255,255,255,0.3)"
                style={styles.input}
                value={startDate}
                onChangeText={setStartDate}
              />
            </View>

            {/* BOTÃO */}
            <TouchableOpacity style={styles.button} onPress={handleCreate}>
              <Text style={styles.buttonText}>Criar Investimento</Text>
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

      {/* -------------------------------------------
          PAYWALL PREMIUM — sobreposto ao modal
      -------------------------------------------- */}
      {showPaywall && (
        <ModalPremiumPaywall
          visible={showPaywall}
          onClose={() => setShowPaywall(false)}
          onUpgrade={() => {
            console.log("DEBUG → User clicou em Upgrade");
            // aqui você pode integrar com checkout no futuro
          }}
        />
      )}
    </Animated.View>
  );
}

/* ---------------------------------------------------------
   STYLES — não alterei nada
----------------------------------------------------------*/
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
  subheader: {
    color: "#ccc",
    fontSize: 14,
    marginBottom: 4,
  },
  empty: {
    color: "#777",
    marginBottom: 12,
  },
  loadedItem: {
    color: "#aaa",
    fontSize: 13,
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

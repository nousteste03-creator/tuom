// app/goals/investments/contribution.tsx
import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { BlurView } from "expo-blur";

import Screen from "@/components/layout/Screen";
import Icon from "@/components/ui/Icon";
import { useGoals } from "@/hooks/useGoals";
import { supabase } from "@/lib/supabase";

const { width } = Dimensions.get("window");
const INNER_WIDTH = width - 32;

const brandFont = Platform.select({
  ios: "SF Pro Display",
  android: "Inter",
  default: "System",
});

const STEP_COUNT = 3;

/* ============================================================
   HELPERS
============================================================ */

function formatCurrency(v: number) {
  if (!v || isNaN(v)) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(v);
}

/* ============================================================
   COMPONENT
============================================================ */

export default function InvestmentContributionScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const investmentId = id ?? null;

  const { investments, loading, reload } = useGoals();

  /* ---------------- STATES ---------------- */
  const [step, setStep] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;
  const stepOpacity = useRef(new Animated.Value(1)).current;
  const stepScale = useRef(new Animated.Value(1)).current;

  const [amountInput, setAmountInput] = useState("");
  const [dateInput] = useState(new Date().toISOString().slice(0, 10));
  const [submitting, setSubmitting] = useState(false);

  /* ---------------- INVESTMENT ---------------- */
  const investment = useMemo(
    () => investments.find((inv) => inv.id === investmentId),
    [investmentId, investments]
  );

  const parsedAmount = useMemo(() => {
    const normalized = amountInput
      .replace(/\./g, "")
      .replace(",", ".")
      .replace(/[^\d.]/g, "");
    const v = parseFloat(normalized);
    return isNaN(v) ? 0 : v;
  }, [amountInput]);

  const previewData = useMemo(() => {
    if (!investment) return null;
    const current = investment.currentAmount ?? 0;
    return {
      name: investment.title,
      current,
      projected: current + parsedAmount,
    };
  }, [investment, parsedAmount]);

  /* ---------------- ANIMATION ---------------- */
  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: -step * INNER_WIDTH,
        useNativeDriver: true,
        damping: 24,
        stiffness: 180,
        mass: 0.4,
      }),
      Animated.timing(stepOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.spring(stepScale, {
        toValue: 1,
        useNativeDriver: true,
        damping: 20,
        stiffness: 180,
        mass: 0.4,
      }),
    ]).start();
  }, [step]);

  /* ============================================================
     GUARDS
  ============================================================ */

  if (!investmentId) {
    return (
      <Screen>
        <View style={styles.center}>
          <Text style={styles.errorText}>Nenhum investimento selecionado.</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.linkText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </Screen>
    );
  }

  if (loading && !investment) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator color="#fff" />
          <Text style={styles.subtitle}>Carregando investimento...</Text>
        </View>
      </Screen>
    );
  }

  if (!investment) {
    return (
      <Screen>
        <View style={styles.center}>
          <Text style={styles.errorText}>Investimento não encontrado.</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.linkText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </Screen>
    );
  }

  /* ============================================================
     SUBMIT (CORRIGIDO)
  ============================================================ */

  async function handleSubmit() {
    try {
      setSubmitting(true);

      // 🔐 USUÁRIO AUTENTICADO (FONTE ÚNICA)
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        Alert.alert("Erro", "Usuário não autenticado.");
        return;
      }

      const payload = {
        goal_id: investment.id,
        user_id: user.id, // ✅ ESSENCIAL PARA O RLS
        amount: parsedAmount,
        due_date: dateInput,
        status: "paid",
        type: "investment_contribution",
      };

      const { error } = await supabase
        .from("goal_installments")
        .insert(payload);

      if (error) {
        console.error("[INVESTMENT CONTRIBUTION ERROR]", error);
        Alert.alert("Erro", "Não foi possível registrar o aporte.");
        return;
      }

      await reload();

      Alert.alert("Aporte registrado", "Seu aporte foi registrado.");
      router.replace(`/goals/investments/${investment.id}`);
    } finally {
      setSubmitting(false);
    }
  }

  /* ============================================================
     UI
  ============================================================ */

  const canSubmit = parsedAmount > 0;

  return (
    <Screen>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.root}>
          {/* HEADER */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() =>
                step > 0 ? setStep(step - 1) : router.back()
              }
              style={styles.iconButton}
            >
              <Icon name="chevron-back" size={20} color="#fff" />
            </TouchableOpacity>

            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>Novo aporte</Text>
              <Text style={styles.headerSubtitle}>{investment.title}</Text>
            </View>

            <Text style={styles.stepIndicator}>
              {step + 1}/{STEP_COUNT}
            </Text>
          </View>

          {/* PREVIEW */}
          {previewData && (
            <BlurView intensity={30} tint="dark" style={styles.previewCard}>
              <Text style={styles.previewTitle}>{previewData.name}</Text>
              <Text style={styles.previewValue}>
                Atual: {formatCurrency(previewData.current)}
              </Text>
              <Text style={styles.previewValue}>
                Após aporte: {formatCurrency(previewData.projected)}
              </Text>
            </BlurView>
          )}

          {/* INPUT */}
          <BlurView intensity={24} tint="dark" style={styles.card}>
            <Text style={styles.label}>Valor do aporte</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={amountInput}
              onChangeText={setAmountInput}
              placeholder="0,00"
              placeholderTextColor="#777"
            />
          </BlurView>

          {/* FOOTER */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.primaryButton,
                (!canSubmit || submitting) && styles.buttonDisabled,
              ]}
              disabled={!canSubmit || submitting}
              onPress={handleSubmit}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  Registrar aporte
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000", padding: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorText: { color: "#FF3B30", fontSize: 14, marginBottom: 6 },
  linkText: { color: "#0A84FF", fontSize: 15 },
  subtitle: { color: "#aaa", marginTop: 8 },

  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "600" },
  headerSubtitle: { color: "#8E8E93", fontSize: 13 },
  stepIndicator: { color: "#8E8E93", fontSize: 13 },

  previewCard: {
    padding: 16,
    borderRadius: 20,
    marginVertical: 10,
    backgroundColor: "rgba(18,18,18,0.9)",
  },
  previewTitle: { color: "#fff", fontSize: 16, fontWeight: "600" },
  previewValue: { color: "#aaa", fontSize: 14 },

  card: {
    marginTop: 10,
    padding: 16,
    borderRadius: 20,
    backgroundColor: "rgba(18,18,18,0.9)",
  },
  label: { color: "#aaa", fontSize: 13 },
  input: { color: "#fff", fontSize: 22, marginTop: 6 },

  footer: { marginTop: 20 },
  primaryButton: {
    height: 54,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonDisabled: { opacity: 0.4 },
});

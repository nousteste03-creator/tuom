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
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { BlurView } from "expo-blur";

import Screen from "@/components/layout/Screen";
import Icon from "@/components/ui/Icon";
import { useGoals } from "@/hooks/useGoals";
import { supabase } from "@/lib/supabase";

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

function formatDateLabel(dateIso: string) {
  const [y, m, d] = dateIso.split("-");
  return `${d}/${m}/${y}`;
}

/* ============================================================
   COMPONENT
============================================================ */

export default function InvestmentContributionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ goalId?: string }>();
  const goalId = params.goalId;

  const { investments, loading, reload } = useGoals();

  // HOOKS SEMPRE NO TOPO (SEM RETURNS ANTES DELES)
  const [step, setStep] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;

  const [amountInput, setAmountInput] = useState("");
  const [dateInput, setDateInput] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [submitting, setSubmitting] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  // Investment memo (safe)
  const investment = useMemo(
    () => investments.find((inv) => inv.id === goalId),
    [goalId, investments]
  );

  const parsedAmount = useMemo(() => {
    const normalized = amountInput
      .replace(/\./g, "")
      .replace(",", ".")
      .replace(/[^\d.]/g, "");
    const v = parseFloat(normalized);
    return isNaN(v) ? 0 : v;
  }, [amountInput]);

  const insightContext = useMemo(() => {
    if (!investment) return null;
    return {
      goalId: investment.id,
      name: investment.title ?? investment.name,
      amount: parsedAmount,
      date: dateInput,
      currentAmount: (investment as any).currentAmount ?? 0,
      autoRuleMonthly: (investment as any).autoRuleMonthly ?? null,
      targetAmount: (investment as any).targetAmount ?? null,
    };
  }, [investment, parsedAmount, dateInput]);

  useEffect(() => {
    if (!insightContext) return;
    console.log("[PILA] insightContext", insightContext);
  }, [insightContext]);

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: -step,
      duration: 230,
      useNativeDriver: true,
    }).start();
  }, [step]);

  /* ============================================================
     EARLY RETURNS (AGORA SEGUROS)
============================================================ */

  if (!goalId) {
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
     LÓGICA PRINCIPAL
============================================================ */

  const canNextStep1 = parsedAmount > 0;
  const canNextStep2 = !!dateInput;

  function goNext() {
    if (step === 0 && !canNextStep1) return;
    if (step === 1 && !canNextStep2) return;
    if (step < STEP_COUNT - 1) setStep(step + 1);
  }

  function goBackStep() {
    if (step > 0) setStep(step - 1);
    else router.back();
  }

  async function handleSubmit() {
    try {
      setSubmitting(true);
      setErrorText(null);

      const userId =
        (investment as any).userId ??
        (investment as any).user_id ??
        null;

      const payload: any = {
        goal_id: investment.id,
        amount: parsedAmount,
        due_date: dateInput,
        status: "paid",
        type: "investment_contribution",
        ...(userId ? { user_id: userId } : {}),
      };

      const { error } = await supabase
        .from("goal_installments")
        .insert(payload);

      if (error) {
        setErrorText(error.message);
        Alert.alert("Erro", "Não foi possível registrar o aporte.");
        return;
      }

      await reload();

      Alert.alert("Aporte registrado", "Seu aporte foi registrado.");
      router.back();
    } finally {
      setSubmitting(false);
    }
  }

  /* ============================================================
     STEPS
============================================================ */

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Quanto você quer aportar?</Text>

      <View style={styles.amountBox}>
        <Text style={styles.currencyPrefix}>R$</Text>
        <TextInput
          style={styles.amountInput}
          keyboardType="numeric"
          value={amountInput}
          onChangeText={setAmountInput}
          placeholder="0,00"
          placeholderTextColor="#555"
        />
      </View>

      <Text style={styles.helperText}>
        Valor atual:{" "}
        {formatCurrency((investment as any).currentAmount ?? 0)}
      </Text>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Quando esse aporte aconteceu?</Text>
      <TextInput
        style={styles.textInput}
        value={dateInput}
        onChangeText={setDateInput}
        keyboardType="numeric"
      />
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Confirmar aporte</Text>

      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Valor</Text>
          <Text style={styles.summaryValue}>
            {formatCurrency(parsedAmount)}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Data</Text>
          <Text style={styles.summaryValue}>
            {formatDateLabel(dateInput)}
          </Text>
        </View>
      </View>

      {/* INSIGHT PLACEHOLDER */}
      <View style={styles.insightCard}>
        <Text style={styles.insightTitle}>Insight da PILA</Text>
        <Text style={styles.insightSubtitle}>
          A IA analisará seu aporte e mostrará aqui.
        </Text>
      </View>

      {errorText && <Text style={styles.errorText}>{errorText}</Text>}
    </View>
  );

  const renderStep = () => {
    if (step === 0) return renderStep1();
    if (step === 1) return renderStep2();
    return renderStep3();
  };

  const translateAnimated = translateX.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, -400, -800],
  });

  /* ============================================================
     RENDER ROOT
============================================================ */

  return (
    <Screen>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.root}>
          {/* Header */}
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={goBackStep} style={styles.iconButton}>
              <Icon name="arrow-left" size={20} color="#fff" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>Novo aporte</Text>
              <Text style={styles.headerSubtitle}>
                {investment.title ?? investment.name}
              </Text>
            </View>

            <Text style={styles.stepIndicator}>
              {step + 1}/{STEP_COUNT}
            </Text>
          </View>

          {/* Wizard */}
          <BlurView intensity={40} tint="dark" style={styles.blurContainer}>
            <Animated.View
              style={[styles.stepsWrapper, { transform: [{ translateX: translateAnimated }] }]}
            >
              {renderStep()}
            </Animated.View>
          </BlurView>

          {/* Footer */}
          <View style={styles.footer}>
            {step < STEP_COUNT - 1 ? (
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  !(
                    (step === 0 && canNextStep1) ||
                    (step === 1 && canNextStep2)
                  ) && styles.buttonDisabled,
                ]}
                onPress={goNext}
                disabled={
                  (step === 0 && !canNextStep1) ||
                  (step === 1 && !canNextStep2)
                }
              >
                <Text style={styles.primaryButtonText}>Continuar</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  submitting && styles.buttonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={submitting || parsedAmount <= 0}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>
                    Registrar aporte
                  </Text>
                )}
              </TouchableOpacity>
            )}
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
  root: {
    flex: 1,
    backgroundColor: "#000",
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    color: "#FF3B30",
    fontFamily: brandFont,
    fontSize: 14,
    marginTop: 10,
  },
  linkText: {
    color: "#0A84FF",
    marginTop: 8,
    fontSize: 15,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconButton: {
    width: 36,
    height: 36,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerTitle: {
    color: "#fff",
    fontFamily: brandFont,
    fontSize: 20,
  },
  headerSubtitle: {
    color: "#8E8E93",
    marginTop: 2,
    fontSize: 13,
  },
  stepIndicator: {
    color: "#8E8E93",
    fontSize: 13,
  },
  blurContainer: {
    flex: 1,
    borderRadius: 26,
    borderWidth: 1,
    backgroundColor: "rgba(30,30,30,0.9)",
    borderColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  stepsWrapper: {
    flex: 1,
    width: "100%",
    padding: 20,
  },
  stepContainer: {
    width: "100%",
  },
  stepTitle: {
    color: "#fff",
    fontFamily: brandFont,
    fontSize: 22,
    marginBottom: 12,
  },
  stepSubtitle: {
    color: "#8E8E93",
    fontSize: 14,
    marginBottom: 20,
  },
  amountBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111",
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  currencyPrefix: {
    color: "#888",
    fontSize: 18,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    color: "#fff",
    fontSize: 26,
    fontFamily: brandFont,
  },
  helperText: {
    color: "#8E8E93",
    marginTop: 6,
  },
  textInput: {
    backgroundColor: "#111",
    borderRadius: 16,
    padding: 12,
    color: "#fff",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    fontSize: 16,
  },
  summaryCard: {
    padding: 16,
    marginTop: 16,
    backgroundColor: "#111",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  summaryLabel: {
    color: "#AAA",
  },
  summaryValue: {
    color: "#fff",
    fontWeight: "600",
  },
  insightCard: {
    marginTop: 20,
    padding: 16,
    borderRadius: 20,
    backgroundColor: "rgba(10,132,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(10,132,255,0.4)",
  },
  insightTitle: {
    color: "#0A84FF",
    fontSize: 15,
    marginBottom: 4,
  },
  insightSubtitle: {
    color: "#d0d0d0",
    fontSize: 13,
  },
  footer: {
    marginTop: 18,
  },
  primaryButton: {
    backgroundColor: "#0A84FF",
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  buttonDisabled: { opacity: 0.4 },
});

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
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { BlurView } from "expo-blur";

import Screen from "@/components/layout/Screen";
import Icon from "@/components/ui/Icon";
import { useGoals } from "@/hooks/useGoals";
import { supabase } from "@/lib/supabase";

const { width, height } = Dimensions.get("window");
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
  const stepOpacity = useRef(new Animated.Value(1)).current;
  const stepScale = useRef(new Animated.Value(1)).current;

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
      name: investment.title ?? (investment as any).name,
      amount: parsedAmount,
      date: dateInput,
      currentAmount: (investment as any).currentAmount ?? 0,
      autoRuleMonthly: (investment as any).autoRuleMonthly ?? null,
      targetAmount: (investment as any).targetAmount ?? null,
    };
  }, [investment, parsedAmount, dateInput]);

  // Preview: saldo atual + aporte = saldo projetado
  const previewData = useMemo(() => {
    if (!investment) return null;
    const current = (investment as any).currentAmount ?? 0;
    const monthly = (investment as any).autoRuleMonthly ?? null;
    const projected = current + (parsedAmount || 0);
    return {
      name: investment.title ?? (investment as any).name,
      current,
      monthly,
      projected,
    };
  }, [investment, parsedAmount]);

  useEffect(() => {
    if (!insightContext) return;
    console.log("[PILA] insightContext", insightContext);
  }, [insightContext]);

  // Animação estilo Apple – slide + fade + scale
  useEffect(() => {
    stepOpacity.setValue(0.7);
    stepScale.setValue(0.97);

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
     STEPS – NARRATIVA WEALTH ADVISOR
============================================================ */

  const renderStep1 = () => (
    <View style={styles.step}>
      <Text style={styles.stepTitle}>Defina o valor do aporte</Text>
      <Text style={styles.stepSubtitle}>
        Informe quanto será aportado neste investimento agora.
      </Text>

      <BlurView intensity={40} tint="dark" style={styles.amountGlass}>
        <Text style={styles.currencyPrefix}>R$</Text>
        <TextInput
          style={styles.amountInput}
          keyboardType="numeric"
          value={amountInput}
          onChangeText={setAmountInput}
          placeholder="0,00"
          placeholderTextColor="#777"
        />
      </BlurView>

      <Text style={styles.helperText}>
        Valor atual investido:{" "}
        {formatCurrency((investment as any).currentAmount ?? 0)}
      </Text>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.step}>
      <Text style={styles.stepTitle}>Defina a data do aporte</Text>
      <Text style={styles.stepSubtitle}>
        Use a data em que o aporte foi ou será efetivamente realizado.
      </Text>

      <BlurView intensity={40} tint="dark" style={styles.inputGlass}>
        <Text style={styles.inputLabel}>Data do aporte</Text>
        <Text style={styles.inputHelper}>Formato AAAA-MM-DD.</Text>
        <TextInput
          style={styles.textInput}
          value={dateInput}
          onChangeText={setDateInput}
          keyboardType="numeric"
          placeholder="2025-01-15"
          placeholderTextColor="#777"
        />
      </BlurView>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.step}>
      <Text style={styles.stepTitle}>Revise os detalhes do aporte</Text>
      <Text style={styles.stepSubtitle}>
        Verifique se o valor e a data refletem corretamente a movimentação.
      </Text>

      <BlurView intensity={30} tint="dark" style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Valor do aporte</Text>
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
      </BlurView>

      <View style={styles.insightCard}>
        <Text style={styles.insightTitle}>Visão da estratégia</Text>
        <Text style={styles.insightSubtitle}>
          Este aporte será considerado na evolução deste investimento e na análise consolidada da sua carteira.
        </Text>
      </View>

      {errorText && <Text style={styles.errorText}>{errorText}</Text>}
    </View>
  );

  const steps = [renderStep1(), renderStep2(), renderStep3()];

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
          {/* HEADER */}
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={goBackStep} style={styles.iconButton}>
              <Icon name="chevron-back" size={20} color="#fff" />
            </TouchableOpacity>

            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>Novo aporte</Text>
              <Text style={styles.headerSubtitle}>
                {investment.title ?? (investment as any).name}
              </Text>
            </View>

            <Text style={styles.stepIndicator}>
              {step + 1}/{STEP_COUNT}
            </Text>
          </View>

          {/* PROGRESS BAR */}
          <View style={styles.progressContainer}>
            <Animated.View
              style={[
                styles.progressBar,
                { width: `${((step + 1) / STEP_COUNT) * 100}%` },
              ]}
            />
          </View>

          {/* PREVIEW CARD – MINI PULSE */}
          {previewData && (
            <BlurView intensity={30} tint="dark" style={styles.previewCard}>
              <View style={styles.previewHeaderRow}>
                <Text style={styles.previewTitle}>
                  {previewData.name || "Investimento"}
                </Text>
                <Text style={styles.previewTag}>Preview</Text>
              </View>

              <View style={styles.previewValuesRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.previewLabel}>Atual</Text>
                  <Text style={styles.previewValue}>
                    {formatCurrency(previewData.current)}
                  </Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.previewLabel}>Após aporte</Text>
                  <Animated.Text
                    style={[
                      styles.previewValue,
                      {
                        transform: [
                          {
                            scale: parsedAmount > 0 ? stepScale : 1,
                          },
                        ],
                      },
                    ]}
                  >
                    {formatCurrency(previewData.projected)}
                  </Animated.Text>
                </View>
              </View>

              {previewData.monthly != null && (
                <Text style={styles.previewHelper}>
                  Aporte mensal planejado:{" "}
                  {formatCurrency(previewData.monthly)}
                </Text>
              )}

              <View style={styles.previewProgressTrack}>
                <Animated.View
                  style={[
                    styles.previewProgressFill,
                    {
                      width:
                        previewData.projected > 0
                          ? Math.min(
                              100,
                              (previewData.projected /
                                (previewData.projected * 1.2)) *
                                100
                            ) + "%"
                          : "8%",
                    },
                  ]}
                />
              </View>
            </BlurView>
          )}

          {/* WIZARD CARD */}
          <BlurView intensity={24} tint="dark" style={styles.wizardContainer}>
            <Animated.View
              style={[
                styles.stepsWrapper,
                {
                  transform: [{ translateX }, { scale: stepScale }],
                  opacity: stepOpacity,
                },
              ]}
            >
              {steps.map((stepContent, index) => (
                <View key={index} style={styles.stepWrapper}>
                  <ScrollView
                    contentContainerStyle={styles.stepScrollContent}
                    showsVerticalScrollIndicator={false}
                    bounces
                  >
                    {stepContent}
                  </ScrollView>
                </View>
              ))}
            </Animated.View>
          </BlurView>

          {/* FOOTER */}
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
                  (submitting || parsedAmount <= 0) && styles.buttonDisabled,
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
   STYLES – APPLE GLASS MID / WEALTH
============================================================ */

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000",
    paddingTop: 14,
    paddingHorizontal: 16,
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
    marginBottom: 10,
  },
  iconButton: {
    width: 36,
    height: 36,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerTitle: {
    color: "#fff",
    fontFamily: brandFont,
    fontSize: 20,
    fontWeight: "600",
  },
  headerSubtitle: {
    color: "#8E8E93",
    marginTop: 2,
    fontSize: 13,
    fontFamily: brandFont,
  },
  stepIndicator: {
    color: "#8E8E93",
    fontSize: 13,
    fontFamily: brandFont,
  },

  progressContainer: {
    height: 3,
    marginTop: 10,
    marginHorizontal: 4,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 10,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.35)",
  },

  previewCard: {
    marginTop: 14,
    marginBottom: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 22,
    backgroundColor: "rgba(18,18,18,0.9)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  previewHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  previewTitle: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    fontFamily: brandFont,
    fontWeight: "600",
  },
  previewTag: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    color: "#f5f5f7",
    fontSize: 11,
    fontFamily: brandFont,
  },
  previewValuesRow: {
    flexDirection: "row",
    marginTop: 6,
    marginBottom: 6,
    gap: 12,
  },
  previewLabel: {
    color: "#9b9b9d",
    fontSize: 12,
    fontFamily: brandFont,
  },
  previewValue: {
    color: "#fff",
    fontSize: 16,
    fontFamily: brandFont,
    marginTop: 2,
  },
  previewHelper: {
    color: "#8E8E93",
    fontSize: 12,
    marginTop: 4,
    fontFamily: brandFont,
  },
  previewProgressTrack: {
    height: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginTop: 10,
    overflow: "hidden",
  },
  previewProgressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.4)",
  },

  wizardContainer: {
    marginTop: 8,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(18,18,18,0.9)",
    maxHeight: height * 0.6,
    overflow: "hidden",
  },
  stepsWrapper: {
    flexDirection: "row",
    width: INNER_WIDTH * STEP_COUNT,
  },
  stepWrapper: {
    width: INNER_WIDTH,
  },
  stepScrollContent: {
    paddingHorizontal: 18,
    paddingVertical: 22,
  },

  step: {
    width: "100%",
  },
  stepTitle: {
    color: "#fff",
    fontFamily: brandFont,
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 10,
  },
  stepSubtitle: {
    color: "#9b9b9d",
    fontSize: 14,
    marginBottom: 20,
    fontFamily: brandFont,
  },

  amountGlass: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  currencyPrefix: {
    color: "#8E8E93",
    fontSize: 18,
    marginRight: 6,
    fontFamily: brandFont,
  },
  amountInput: {
    flex: 1,
    color: "#fff",
    fontSize: 26,
    fontFamily: brandFont,
  },
  helperText: {
    color: "#8E8E93",
    marginTop: 8,
    fontSize: 13,
    fontFamily: brandFont,
  },

  inputGlass: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  inputLabel: {
    color: "#d0d0d2",
    fontSize: 13,
    fontFamily: brandFont,
  },
  inputHelper: {
    color: "#8E8E93",
    fontSize: 12,
    marginTop: 2,
    marginBottom: 6,
    fontFamily: brandFont,
  },
  textInput: {
    backgroundColor: "transparent",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 0,
    color: "#fff",
    fontSize: 16,
    fontFamily: brandFont,
  },

  summaryCard: {
    padding: 18,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: 18,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  summaryLabel: {
    color: "#9b9b9d",
    fontSize: 13,
    fontFamily: brandFont,
  },
  summaryValue: {
    color: "#fff",
    fontSize: 15,
    fontFamily: brandFont,
    fontWeight: "600",
  },

  insightCard: {
    padding: 16,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  insightTitle: {
    color: "#fff",
    fontSize: 15,
    marginBottom: 4,
    fontFamily: brandFont,
    fontWeight: "500",
  },
  insightSubtitle: {
    color: "#9b9b9d",
    fontSize: 13,
    fontFamily: brandFont,
  },

  footer: {
    paddingTop: 18,
    paddingBottom: 16,
  },
  primaryButton: {
    backgroundColor: "rgba(255,255,255,0.14)",
    height: 54,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 18,
    borderColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: brandFont,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.4,
  },

  subtitle: { color: "#aaa", fontSize: 14, marginTop: 8 },
});

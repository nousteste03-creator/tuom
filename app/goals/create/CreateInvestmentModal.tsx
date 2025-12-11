// =======================
//  CreateInvestmentModal.tsx — IA CONECTADA
//  UI 100% preservada
// =======================

import React, { useState, useRef, useEffect, useMemo } from "react";
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
import { supabase } from "@/lib/supabase";
import { useUserPlan } from "@/hooks/useUserPlan";

/* -----------------------------------------------------
   NORMALIZAR DATA
------------------------------------------------------*/
function normalizeDate(input: string): string | null {
  if (!input) return null;
  const date = input.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;

  const m = date.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (!m) return null;

  let [_, d, mm, y] = m;
  if (y.length === 2) y = "20" + y;

  return `${y.padStart(4, "0")}-${mm.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

/* -----------------------------------------------------
   TAXAS REFERÊNCIA
------------------------------------------------------*/
const BASE_ANNUAL_RATE = 0.115;
const BASE_MONTHLY_RATE = Math.pow(1 + BASE_ANNUAL_RATE, 1 / 12) - 1;

const brandFont = Platform.select({
  ios: "SF Pro Display",
  android: "Inter",
  default: "System",
});

type Props = {
  visible: boolean;
  onClose: () => void;
};

const TOTAL_STEPS = 4;

/* -----------------------------------------------------
   CURRENCY HELPERS
------------------------------------------------------*/
function parseCurrencyToNumber(input: string): number | null {
  if (!input) return null;
  const normalized = input
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/[^\d.]/g, "");
  const v = parseFloat(normalized);
  return isNaN(v) ? null : v;
}

function formatCurrencyBRL(value: number) {
  if (!isFinite(value)) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/* -----------------------------------------------------
   PROJEÇÃO 12 MESES
------------------------------------------------------*/
function buildProjectionSeries(opts: {
  current: number;
  monthly: number;
  months?: number;
  monthlyRate?: number;
}): number[] {
  const { current, monthly, months = 12, monthlyRate = BASE_MONTHLY_RATE } =
    opts;

  const series: number[] = [];
  let balance = current;

  for (let i = 0; i < months; i++) {
    balance = balance * (1 + monthlyRate) + monthly;
    series.push(balance);
  }

  return series;
}

/* -----------------------------------------------------
   PAINEL PREMIUM — UI MANTIDA, SEM TEXTO LOCAL
------------------------------------------------------*/
function InvestmentInsightPanel({
  currentValue,
  monthlyValue,
  targetValue,
  projectionSeries,
  insightText,
  insightSource,
  insightLoading,
}: {
  currentValue: number;
  monthlyValue: number;
  targetValue: number | null;
  projectionSeries: number[];
  insightText: string | null;
  insightSource: "free" | "premium" | null;
  insightLoading: boolean;
}) {
  const safeCurrent = isFinite(currentValue) ? currentValue : 0;
  const safeMonthly = isFinite(monthlyValue) ? monthlyValue : 0;

  const monthlyRate = BASE_MONTHLY_RATE;
  const annualRate = BASE_ANNUAL_RATE;

  const series = projectionSeries;
  const finalValue = series[series.length - 1] || safeCurrent;

  const [min, max] = useMemo(() => {
    if (series.length === 0) return [0, 1];
    const minV = Math.min(...series);
    const maxV = Math.max(...series);
    if (minV === maxV) return [minV * 0.9, maxV * 1.1];
    return [minV, maxV];
  }, [series]);

  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    progressAnim.setValue(0);
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 450,
      useNativeDriver: true,
    }).start();
  }, [safeCurrent, safeMonthly, targetValue]);

  return (
    <View style={styles.panelContainer}>
      <View style={styles.rowBetween}>
        <View>
          <Text style={styles.panelTitle}>Estimativa de crescimento</Text>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              Projeção baseada em taxas de referência
            </Text>
          </View>
        </View>

        <Animated.View
          style={[
            styles.sparklineContainer,
            {
              opacity: progressAnim,
              transform: [
                {
                  translateY: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [6, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {series.map((v, idx) => {
            const t = max === min ? 0.5 : (v - min) / (max - min);
            const height = 8 + t * 24;
            const barOpacity = 0.3 + t * 0.7;

            return (
              <View
                key={idx}
                style={[styles.sparkBar, { height, opacity: barOpacity }]}
              />
            );
          })}
        </Animated.View>
      </View>

      <View style={[styles.rowBetween, { marginTop: 12 }]}>
        <View>
          <Text style={styles.panelLabel}>Rendimento mensal</Text>
          <Text style={styles.panelValue}>
            {(monthlyRate * 100).toFixed(2)}%
          </Text>
        </View>

        <View>
          <Text style={styles.panelLabel}>Rendimento anual</Text>
          <Text style={styles.panelValue}>
            {(annualRate * 100).toFixed(2)}%
          </Text>
        </View>
      </View>

      <Text style={[styles.panelLabel, { marginTop: 18 }]}>Em 12 meses</Text>
      <Text style={styles.panelValue}>
        {formatCurrencyBRL(safeCurrent)} → {formatCurrencyBRL(finalValue)}
      </Text>

      <Text style={[styles.panelLabel, { marginTop: 18 }]}>
        Interpretação da PILA
      </Text>

      <Text style={styles.panelAIText}>
        {insightLoading
          ? "Interpretando com a PILA..."
          : insightText || "Interpretando com a PILA..."}
      </Text>

      <Text style={styles.panelDescription}>
        A IA atua apenas na explicação. A matemática é fixa e baseada em taxas
        de referência do mercado.
      </Text>

      {insightSource && !insightLoading && (
        <Text
          style={[
            styles.panelDescription,
            { marginTop: 4, opacity: 0.7, fontSize: 11 },
          ]}
        >
          Fonte do texto:{" "}
          {insightSource === "premium"
            ? "PILA Pro (GPT-4o-mini)"
            : "PILA Free (DeepSeek-R1)"}
        </Text>
      )}
    </View>
  );
}

/* -----------------------------------------------------
   COMPONENTE PRINCIPAL
------------------------------------------------------*/
export default function CreateInvestmentModal({ visible, onClose }: Props) {
  const { createGoal, reload } = useGoals();
  const { plan } = useUserPlan();

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;

  const [step, setStep] = useState(0);

  const [title, setTitle] = useState("");
  const [current, setCurrent] = useState("");
  const [monthly, setMonthly] = useState("");
  const [target, setTarget] = useState("");
  const [startDate, setStartDate] = useState("");

  const [showPaywall, setShowPaywall] = useState(false);

  const [insightText, setInsightText] = useState<string | null>(null);
  const [insightSource, setInsightSource] =
    useState<"free" | "premium" | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);

  /* ANIMAÇÃO */
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fade, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.spring(slide, { toValue: 0, useNativeDriver: true }),
      ]).start();
    } else {
      fade.setValue(0);
      slide.setValue(20);
    }
  }, [visible]);

  /* INPUTS */
  const parsedCurrent = useMemo(
    () => parseCurrencyToNumber(current) ?? 0,
    [current]
  );

  const parsedMonthly = useMemo(
    () => parseCurrencyToNumber(monthly) ?? 0,
    [monthly]
  );

  const parsedTarget = useMemo(
    () => parseCurrencyToNumber(target),
    [target]
  );

  /* PROJEÇÃO */
  const projectionSeries = useMemo(
    () =>
      buildProjectionSeries({
        current: parsedCurrent,
        monthly: parsedMonthly,
        months: 12,
        monthlyRate: BASE_MONTHLY_RATE,
      }),
    [parsedCurrent, parsedMonthly]
  );

  /* IA REAL */
  useEffect(() => {
    if (!visible) return;
    if (!(step === 2 || step === 3)) return;

    const payload = {
      currentAmount: parsedCurrent,
      monthlyContribution: parsedMonthly,
      targetAmount: parsedTarget ?? null,
      months: 12,
    };

    let cancelled = false;

    async function runIA() {
      try {
        setInsightLoading(true);
        setInsightText(null);
        setInsightSource(null);

        const isPro = plan?.id === "PRO";

        const fnName = isPro
          ? "investment-goal-insights-premium"
          : "investment-goal-insights-free";

        const { data, error } = await supabase.functions.invoke(fnName, {
          body: payload,
        });

        if (cancelled) return;

        if (error) {
          console.log("ERRO IA:", error);
          setInsightText(null);
          return;
        }

        const text =
          data?.text || data?.insight || data?.message || null;

        if (!text || typeof text !== "string") {
          setInsightText(null);
          return;
        }

        setInsightText(text.trim());
        setInsightSource(isPro ? "premium" : "free");
      } catch (err) {
        console.log("ERRO IA:", err);
        if (!cancelled) setInsightText(null);
      } finally {
        if (!cancelled) setInsightLoading(false);
      }
    }

    runIA();
    return () => {
      cancelled = true;
    };
  }, [visible, step, parsedCurrent, parsedMonthly, parsedTarget, plan]);

  /* CREATE */
  async function handleCreate() {
    if (!title.trim()) return;

    const normalizedStart =
      normalizeDate(startDate) ?? new Date().toISOString();

    const payload = {
      type: "investment",
      title: title.trim(),
      targetAmount: parsedTarget ?? null,
      currentAmount: parsedCurrent || 0,
      autoRuleMonthly: parsedMonthly || null,
      startDate: normalizedStart,
    };

    console.log("DEBUG/CreateInvestmentModal payload:", payload);

    const id = await createGoal(payload);

    if (id === "PAYWALL") {
      setShowPaywall(true);
      return;
    }

    await reload();
    setTimeout(onClose, 120);
  }

  /* STEPS */
  const steps = [
    /* step 0 */
    <View style={styles.step} key="s1">
      <Text style={styles.stepTitle}>
        Como devemos chamar este investimento?
      </Text>
      <Text style={styles.stepSubtitle}>
        Use um nome que ajude você a lembrar o propósito deste capital.
      </Text>

      <View style={styles.inputGlass}>
        <TextInput
          placeholder="Ex: Reserva de emergência, Ações Brasil..."
          placeholderTextColor="#777"
          style={styles.input}
          value={title}
          onChangeText={setTitle}
        />
      </View>

      <Text style={styles.helperText}>
        Este nome aparecerá em relatórios e no painel principal.
      </Text>
    </View>,

    /* step 1 */
    <View style={styles.step} key="s2">
      <Text style={styles.stepTitle}>Valor já investido</Text>
      <Text style={styles.stepSubtitle}>
        Informe quanto já existe aplicado neste investimento hoje.
      </Text>

      <View style={styles.inputGlass}>
        <Text style={styles.label}>Valor atual</Text>
        <TextInput
          keyboardType="numeric"
          placeholder="0,00"
          placeholderTextColor="#777"
          style={styles.input}
          value={current}
          onChangeText={setCurrent}
        />
      </View>
    </View>,

    /* step 2 */
    <View style={styles.step} key="s3">
      <Text style={styles.stepTitle}>Aporte mensal planejado</Text>
      <Text style={styles.stepSubtitle}>
        Se houver um valor recorrente, ele será considerado no fluxo mensal.
      </Text>

      <View style={styles.inputGlass}>
        <Text style={styles.label}>Aporte mensal (opcional)</Text>
        <TextInput
          keyboardType="numeric"
          placeholder="0,00"
          placeholderTextColor="#777"
          style={styles.input}
          value={monthly}
          onChangeText={setMonthly}
        />
      </View>

      <Text style={styles.helperText}>
        Você poderá ajustar esse valor depois, conforme a estratégia evoluir.
      </Text>
    </View>,

    /* step 3 */
    <View style={styles.step} key="s4">
      <Text style={styles.stepTitle}>Meta financeira e início</Text>
      <Text style={styles.stepSubtitle}>
        Se fizer sentido, defina um valor alvo e uma data de início.
      </Text>

      <View style={styles.inputGlass}>
        <Text style={styles.label}>Valor alvo (opcional)</Text>
        <TextInput
          keyboardType="numeric"
          placeholder="0,00"
          placeholderTextColor="#777"
          style={styles.input}
          value={target}
          onChangeText={setTarget}
        />
      </View>

      <View style={styles.inputGlass}>
        <Text style={styles.label}>Data de início</Text>
        <TextInput
          placeholder="AAAA-MM-DD ou DD/MM/AAAA"
          placeholderTextColor="#777"
          style={styles.input}
          value={startDate}
          onChangeText={setStartDate}
        />
      </View>
    </View>,
  ];

  /* CONTROLES */
  const canNextFromStep0 = title.trim().length > 0;

  function handleNext() {
    if (step === 0 && !canNextFromStep0) return;
    if (step < TOTAL_STEPS - 1) setStep((s) => s + 1);
  }

  function handleBack() {
    if (step > 0) setStep((s) => s - 1);
    else onClose();
  }

  /* RENDER */
  if (!visible) return null;

  return (
    <Animated.View
      style={[styles.overlay, { opacity: fade, transform: [{ translateY: slide }] }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.fullscreenContainer}>
          {/* HEADER */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.closeBtn}>
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>

            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>Novo investimento</Text>
              <Text style={styles.headerSubtitle}>
                Estruture este investimento com clareza.
              </Text>
            </View>

            <Text style={styles.stepIndicator}>
              {step + 1}/{TOTAL_STEPS}
            </Text>
          </View>

          {/* PROGRESS */}
          <View style={styles.progressContainer}>
            <View
              style={[
                styles.progressBar,
                { width: `${((step + 1) / TOTAL_STEPS) * 100}%` },
              ]}
            />
          </View>

          {/* CONTENT */}
          <View style={styles.contentArea}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 180 }}
            >
              <BlurView intensity={30} tint="dark" style={styles.wizardContainer}>
                <View style={styles.stepScrollContent}>{steps[step]}</View>
              </BlurView>

              {(step === 2 || step === 3) && (
                <Animated.View style={[styles.panelWrapper]}>
                  <InvestmentInsightPanel
                    currentValue={parsedCurrent}
                    monthlyValue={parsedMonthly}
                    targetValue={parsedTarget ?? null}
                    projectionSeries={projectionSeries}
                    insightText={insightText}
                    insightSource={insightSource}
                    insightLoading={insightLoading}
                  />
                </Animated.View>
              )}
            </ScrollView>
          </View>

          {/* FOOTER */}
          <View style={styles.footer}>
            {step < TOTAL_STEPS - 1 ? (
              <TouchableOpacity
                onPress={handleNext}
                disabled={step === 0 && !canNextFromStep0}
                style={[
                  styles.primaryBtn,
                  step === 0 && !canNextFromStep0 && styles.buttonDisabled,
                ]}
              >
                <Text style={styles.primaryBtnText}>Continuar</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={handleCreate} style={styles.primaryBtn}>
                <Text style={styles.primaryBtnText}>Criar investimento</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={onClose} style={{ marginTop: 12 }}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* PAYWALL */}
      {showPaywall && (
        <ModalPremiumPaywall
          visible={showPaywall}
          onClose={() => setShowPaywall(false)}
          onUpgrade={() => setShowPaywall(false)}
        />
      )}
    </Animated.View>
  );
}

/* -----------------------------------------------------
   STYLES — 100% preservados
------------------------------------------------------*/
const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.65)",
  },
  fullscreenContainer: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  closeText: { color: "#fff", fontSize: 24 },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontFamily: brandFont,
    fontWeight: "600",
  },
  headerSubtitle: {
    color: "#777",
    fontSize: 13,
    fontFamily: brandFont,
  },
  stepIndicator: { color: "#aaa", fontSize: 14, marginLeft: 6 },
  progressContainer: {
    height: 3,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 16,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  contentArea: { flex: 1, paddingHorizontal: 16 },
  wizardContainer: {
    borderRadius: 26,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: 20,
  },
  stepScrollContent: { paddingHorizontal: 18, paddingVertical: 22 },
  step: { width: "100%" },
  stepTitle: {
    color: "#fff",
    fontSize: 22,
    fontFamily: brandFont,
    fontWeight: "600",
    marginBottom: 8,
  },
  stepSubtitle: {
    color: "#aaa",
    fontSize: 14,
    marginBottom: 18,
    fontFamily: brandFont,
  },
  inputGlass: {
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    marginBottom: 12,
  },
  label: {
    color: "#aaa",
    fontSize: 13,
    marginBottom: 4,
    fontFamily: brandFont,
  },
  input: { color: "#fff", fontSize: 17, fontFamily: brandFont },
  helperText: { marginTop: 6, color: "#666", fontSize: 12 },

  panelWrapper: { marginBottom: 20 },
  panelContainer: {
    borderRadius: 22,
    padding: 18,
    backgroundColor: "rgba(10,10,12,0.96)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  panelTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    fontFamily: brandFont,
    marginBottom: 4,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginTop: 4,
    marginBottom: 8,
  },
  badgeText: { color: "#bbb", fontSize: 11 },
  panelLabel: { color: "#bbb", fontSize: 13, marginBottom: 4 },
  panelValue: { color: "#fff", fontSize: 17, fontWeight: "600" },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  panelAIText: { color: "#ddd", fontSize: 14, marginTop: 6, lineHeight: 19 },
  panelDescription: {
    marginTop: 12,
    color: "#888",
    fontSize: 12,
    lineHeight: 17,
  },
  sparklineContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 3,
    marginLeft: 16,
  },
  sparkBar: {
    width: 4,
    borderRadius: 999,
    backgroundColor: "#3EC6FF",
  },
  footer: { padding: 20 },
  primaryBtn: {
    backgroundColor: "rgba(255,255,255,0.14)",
    height: 54,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
  },
  primaryBtnText: { color: "#fff", fontSize: 17, fontWeight: "600" },
  buttonDisabled: { opacity: 0.4 },
  cancelText: {
    color: "#888",
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
  },
});

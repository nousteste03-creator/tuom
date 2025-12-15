// app/goals/details/debt-edit.tsx

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  Animated,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

import Screen from "@/components/layout/Screen";
import { useGoals } from "@/context/GoalsContext";

const brandFont = Platform.select({
  ios: "SF Pro Display",
  android: "Inter",
  default: "System",
});

const TOTAL_STEPS = 4;

/* =====================================================================
   EDITAR DÍVIDA — Wizard Premium (BTG Wealth Style)
===================================================================== */
export default function DebtEditScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();

  const id = params?.id ?? null;

  const { loading, debts, updateGoal, reload } = useGoals();

  /* ------------------------------------------------------------------
     Buscar a dívida alvo
  ------------------------------------------------------------------ */
  const debt = React.useMemo(() => {
    if (!id) return null;
    return debts.find((d) => d.id === id) ?? null;
  }, [id, debts]);

  /* ------------------------------------------------------------------
     STATES DO FORMULÁRIO
  ------------------------------------------------------------------ */
  const [title, setTitle] = useState("");
  const [total, setTotal] = useState("");
  const [paid, setPaid] = useState("");
  const [debtStyle, setDebtStyle] = useState<
    "loan" | "credit_card" | "financing"
  >("loan");

  const [step, setStep] = useState(0);

  // animação suave a cada troca de step
  const stepOpacity = useRef(new Animated.Value(1)).current;
  const stepTranslate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (debt) {
      setTitle(debt.title);
      setTotal(String(debt.targetAmount ?? ""));
      setPaid(String(debt.currentAmount ?? ""));
      setDebtStyle(debt.debtStyle ?? "loan");
    }
  }, [debt]);

  useEffect(() => {
    stepOpacity.setValue(0.7);
    stepTranslate.setValue(12);

    Animated.parallel([
      Animated.timing(stepOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.spring(stepTranslate, {
        toValue: 0,
        useNativeDriver: true,
        damping: 22,
        stiffness: 180,
        mass: 0.4,
      }),
    ]).start();
  }, [step, stepOpacity, stepTranslate]);

  /* ------------------------------------------------------------------
     Loading / Not Found
  ------------------------------------------------------------------ */
  if (loading || !debt) {
    return (
      <Screen style={styles.center}>
        {loading ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : (
          <Text style={styles.notFound}>Dívida não encontrada.</Text>
        )}
      </Screen>
    );
  }

  /* ------------------------------------------------------------------
     DERIVADOS — Preview BTG
  ------------------------------------------------------------------ */
  const totalValue = Number(total.replace(",", ".")) || 0;
  const paidValue = Number(paid.replace(",", ".")) || 0;
  const remaining = Math.max(totalValue - paidValue, 0);

  const progress =
    totalValue > 0 ? Math.min(Math.max(paidValue / totalValue, 0), 1) : 0;

  const debtStyleLabel =
    debtStyle === "loan"
      ? "Empréstimo"
      : debtStyle === "credit_card"
      ? "Cartão de crédito"
      : "Financiamento";

  /* ------------------------------------------------------------------
     SALVAR
  ------------------------------------------------------------------ */
  const handleSave = async () => {
    const totalValueParsed = Number(total.replace(",", ".")) || 0;
    const paidValueParsed = Number(paid.replace(",", ".")) || 0;

    const payload = {
      title,
      targetAmount: totalValueParsed,
      currentAmount: paidValueParsed,
      debtStyle,
    };

    await updateGoal(debt.id, payload);
    await reload();
    router.back();
  };

  /* ------------------------------------------------------------------
     NAV
  ------------------------------------------------------------------ */
  const canNextFromStep0 = title.trim().length > 0;
  const canNextFromStep1 = total.trim().length > 0;

  function handleNext() {
    if (step === 0 && !canNextFromStep0) return;
    if (step === 1 && !canNextFromStep1) return;
    if (step < TOTAL_STEPS - 1) setStep((prev) => prev + 1);
  }

  function handleBack() {
    if (step > 0) setStep((prev) => prev - 1);
    else router.back();
  }

  /* ------------------------------------------------------------------
     COMPONENTE: Preview tipo BTG Wealth
  ------------------------------------------------------------------ */
  const DebtPreviewCard = () => (
    <View style={styles.previewCard}>
      <View style={styles.previewHeaderRow}>
        <View>
          <Text style={styles.previewTitle}>
            {title.trim() || debt.title}
          </Text>
          <Text style={styles.previewSubtitle}>
            {debtStyleLabel}
          </Text>
        </View>
        <View style={styles.previewPill}>
          <Text style={styles.previewPillText}>
            {Math.round(progress * 100)}%
          </Text>
        </View>
      </View>

      <View style={styles.previewRow}>
        <View style={styles.previewColumn}>
          <Text style={styles.previewLabel}>Total contratado</Text>
          <Text style={styles.previewValue}>
            {formatCurrency(totalValue || debt.targetAmount || 0)}
          </Text>
        </View>
        <View style={styles.previewColumn}>
          <Text style={styles.previewLabel}>Já pago</Text>
          <Text style={styles.previewValue}>
            {formatCurrency(paidValue || debt.currentAmount || 0)}
          </Text>
        </View>
        <View style={styles.previewColumn}>
          <Text style={styles.previewLabel}>Restante</Text>
          <Text style={styles.previewValue}>
            {formatCurrency(remaining)}
          </Text>
        </View>
      </View>

      <View style={styles.progressBarContainer}>
        <View style={styles.progressTrack} />
        <View
          style={[styles.progressFill, { width: `${progress * 100}%` }]}
        />
      </View>

      <Text style={styles.previewFooter}>
        Ajuste os dados abaixo para manter esta visão sempre atualizada.
      </Text>
    </View>
  );

  /* ------------------------------------------------------------------
     STEPS
  ------------------------------------------------------------------ */

  const Step1 = (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Como devemos chamar esta dívida?</Text>
      <Text style={styles.stepSubtitle}>
        Use um nome claro que ajude você a lembrar a origem e o propósito desta
        obrigação.
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>Nome da dívida</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Ex: Empréstimo Banco Inter"
          placeholderTextColor="rgba(255,255,255,0.35)"
          style={styles.input}
        />
      </View>

      <Text style={styles.helperText}>
        Este nome aparecerá em relatórios e na sua visão consolidada de dívidas.
      </Text>
    </View>
  );

  const Step2 = (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Quais são os valores principais?</Text>
      <Text style={styles.stepSubtitle}>
        Informe o valor total contratado e quanto já foi pago até agora.
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>Valor total da dívida</Text>
        <TextInput
          value={total}
          onChangeText={setTotal}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor="rgba(255,255,255,0.35)"
          style={styles.input}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Valor já pago</Text>
        <TextInput
          value={paid}
          onChangeText={setPaid}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor="rgba(255,255,255,0.35)"
          style={styles.input}
        />
      </View>
    </View>
  );

  const Step3 = (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Como você classifica esta dívida?</Text>
      <Text style={styles.stepSubtitle}>
        A categoria ajuda a analisar o impacto no seu fluxo financeiro.
      </Text>

      <View style={styles.typeRow}>
        {[
          { key: "loan", label: "Empréstimo" },
          { key: "credit_card", label: "Cartão" },
          { key: "financing", label: "Financiamento" },
        ].map((opt) => (
          <TouchableOpacity
            key={opt.key}
            style={[
              styles.typeBtn,
              debtStyle === opt.key && styles.typeBtnActive,
            ]}
            onPress={() =>
              setDebtStyle(
                opt.key as "loan" | "credit_card" | "financing"
              )
            }
          >
            <Text
              style={[
                styles.typeText,
                debtStyle === opt.key && styles.typeTextActive,
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const Step4 = (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Revise antes de salvar</Text>
      <Text style={styles.stepSubtitle}>
        Verifique se as informações refletem a situação atual desta dívida.
      </Text>

      <View style={styles.reviewCard}>
        <Row label="Nome" value={title || debt.title} />
        <Row
          label="Valor total"
          value={formatCurrency(totalValue || debt.targetAmount || 0)}
        />
        <Row
          label="Já pago"
          value={formatCurrency(paidValue || debt.currentAmount || 0)}
        />
        <Row label="Tipo" value={debtStyleLabel} />
        <Row
          label="Restante"
          value={formatCurrency(remaining)}
          highlight
        />
      </View>
    </View>
  );

  const steps = [Step1, Step2, Step3, Step4];

  const renderStep = () => steps[step];

  /* ------------------------------------------------------------------
     RENDER
  ------------------------------------------------------------------ */
  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1 }}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 120 }}
          >
            {/* HEADER */}
            <View style={styles.headerRow}>
              <TouchableOpacity onPress={handleBack} style={styles.iconBtn}>
                <Text style={styles.backIcon}>‹</Text>
              </TouchableOpacity>

              <View>
                <Text style={styles.titleHeader}>Editar dívida</Text>
                <Text style={styles.headerSubtitle}>
                  Ajuste os dados desta obrigação com precisão.
                </Text>
              </View>

              <Text style={styles.stepIndicator}>
                {step + 1}/{TOTAL_STEPS}
              </Text>
            </View>

            {/* PREVIEW EXECUTIVO (BTG) */}
            <DebtPreviewCard />

            {/* WIZARD STEP */}
            <Animated.View
              style={{
                opacity: stepOpacity,
                transform: [{ translateX: stepTranslate }],
              }}
            >
              {renderStep()}
            </Animated.View>
          </ScrollView>

          {/* FOOTER FIXO */}
          <View style={styles.footer}>
            {step < TOTAL_STEPS - 1 ? (
              <TouchableOpacity
                style={[
                  styles.saveBtn,
                  step === 0 && !canNextFromStep0 && styles.saveBtnDisabled,
                  step === 1 && !canNextFromStep1 && styles.saveBtnDisabled,
                ]}
                onPress={handleNext}
                disabled={
                  (step === 0 && !canNextFromStep0) ||
                  (step === 1 && !canNextFromStep1)
                }
              >
                <Text style={styles.saveBtnText}>Continuar</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>Salvar alterações</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

/* =====================================================================
   COMPONENTE AUXILIAR: linha de revisão
===================================================================== */
type RowProps = {
  label: string;
  value: string;
  highlight?: boolean;
};

function Row({ label, value, highlight }: RowProps) {
  return (
    <View style={styles.reviewRow}>
      <Text style={styles.reviewLabel}>{label}</Text>
      <Text
        style={[
          styles.reviewValue,
          highlight && styles.reviewValueHighlight,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

/* =====================================================================
   HELPERS
===================================================================== */
function formatCurrency(v: number) {
  if (!v || isNaN(v)) return "R$ 0,00";
  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    }).format(v);
  } catch {
    return `R$ ${Number(v || 0).toFixed(2)}`;
  }
}

/* =====================================================================
   STYLES
===================================================================== */
const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  notFound: {
    fontFamily: brandFont,
    fontSize: 18,
    color: "#fff",
  },

  headerRow: {
    paddingTop: 12,
    paddingBottom: 18,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
  },

  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  backIcon: {
    color: "#fff",
    fontSize: 24,
    marginTop: -2,
  },

  titleHeader: {
    fontFamily: brandFont,
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
  },
  headerSubtitle: {
    fontFamily: brandFont,
    fontSize: 12,
    color: "#8E8E93",
    marginTop: 2,
  },

  stepIndicator: {
    marginLeft: "auto",
    fontFamily: brandFont,
    fontSize: 14,
    color: "#8E8E93",
  },

  /* Preview BTG Style */
  previewCard: {
    marginHorizontal: 18,
    marginTop: 10,
    borderRadius: 18,
    backgroundColor: "rgba(12,12,14,0.95)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    padding: 16,
  },
  previewHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  previewTitle: {
    fontFamily: brandFont,
    fontSize: 17,
    fontWeight: "600",
    color: "#fff",
  },
  previewSubtitle: {
    fontFamily: brandFont,
    fontSize: 13,
    color: "#8E8E93",
    marginTop: 2,
  },
  previewPill: {
    marginLeft: "auto",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(129,199,132,0.16)",
    borderWidth: 1,
    borderColor: "rgba(129,199,132,0.5)",
  },
  previewPillText: {
    fontFamily: brandFont,
    fontSize: 12,
    color: "#B8F5C2",
  },
  previewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  previewColumn: {
    flex: 1,
  },
  previewLabel: {
    fontFamily: brandFont,
    fontSize: 11,
    color: "#8E8E93",
    marginBottom: 2,
  },
  previewValue: {
    fontFamily: brandFont,
    fontSize: 14,
    color: "#fff",
    fontWeight: "600",
  },
  progressBarContainer: {
    marginTop: 6,
    marginBottom: 6,
    height: 6,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  progressTrack: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "rgba(129,199,132,0.9)",
  },
  previewFooter: {
    fontFamily: brandFont,
    fontSize: 11,
    color: "#8E8E93",
    marginTop: 4,
  },

  /* Steps */
  stepContainer: {
    paddingHorizontal: 18,
    marginTop: 26,
  },

  stepTitle: {
    fontFamily: brandFont,
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 6,
  },

  stepSubtitle: {
    fontFamily: brandFont,
    fontSize: 13,
    color: "#9B9B9D",
    marginBottom: 16,
  },

  card: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  label: {
    fontFamily: brandFont,
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    marginBottom: 6,
  },

  input: {
    fontFamily: brandFont,
    color: "#fff",
    fontSize: 16,
    paddingVertical: 4,
  },

  helperText: {
    fontFamily: brandFont,
    fontSize: 12,
    color: "#8E8E93",
    marginTop: 4,
  },

  typeRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },

  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },

  typeBtnActive: {
    backgroundColor: "rgba(255,255,255,0.16)",
    borderColor: "rgba(255,255,255,0.4)",
  },

  typeText: {
    fontFamily: brandFont,
    color: "rgba(255,255,255,0.65)",
    fontSize: 13,
  },

  typeTextActive: {
    color: "#fff",
    fontWeight: "600",
  },

  reviewCard: {
    marginTop: 10,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  reviewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  reviewLabel: {
    fontFamily: brandFont,
    fontSize: 13,
    color: "#9B9B9D",
  },
  reviewValue: {
    fontFamily: brandFont,
    fontSize: 13,
    color: "#fff",
  },
  reviewValueHighlight: {
    color: "#B8F5C2",
    fontWeight: "600",
  },

  /* Footer */
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 18,
    paddingBottom: 18,
  },

  saveBtn: {
    backgroundColor: "rgba(255,255,255,0.14)",
    paddingVertical: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },

  saveBtnDisabled: {
    opacity: 0.45,
  },

  saveBtnText: {
    fontFamily: brandFont,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});

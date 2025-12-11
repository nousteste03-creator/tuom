// app/goals/create/CreateDebtModal.tsx
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

/* ===========================================================
   Helpers de data
=========================================================== */
function normalizeDateForSupabase(input: string): string | null {
  if (!input) return null;
  const date = input.trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;

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

function addMonthsToDate(isoDate: string, months: number): string {
  try {
    const d = new Date(isoDate);
    if (Number.isNaN(d.getTime())) return isoDate;

    const year = d.getFullYear();
    const month = d.getMonth();
    const day = d.getDate();

    const target = new Date(year, month + months, day);
    const yyyy = target.getFullYear();
    const mm = String(target.getMonth() + 1).padStart(2, "0");
    const dd = String(target.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  } catch {
    return isoDate;
  }
}

/* ===========================================================
   Tipagem
=========================================================== */
type Props = {
  visible: boolean;
  onClose: () => void;
};

type DebtStyle = "loan" | "credit_card" | "financing";

const brandFont = Platform.select({
  ios: "SF Pro Display",
  android: "Inter",
  default: "System",
});

const TOTAL_STEPS = 4;

/* ===========================================================
   Painel Matemático + Sparkline
=========================================================== */
function DebtProjectionPanel(props: {
  total: number | null;
  paid: number | null;
  installmentsCount: number | null;
  firstDueDateIso: string | null;
}) {
  const { total, paid, installmentsCount, firstDueDateIso } = props;

  const sanitizedTotal = total && total > 0 ? total : 0;
  const sanitizedPaid = paid && paid > 0 ? paid : 0;

  const remaining = Math.max(sanitizedTotal - sanitizedPaid, 0);
  const qty = installmentsCount && installmentsCount > 0 ? installmentsCount : 0;
  const installmentAmount = qty > 0 ? remaining / qty : 0;

  const hasProjection = remaining > 0 && qty > 0 && !!firstDueDateIso;

  const estimatedEnd = useMemo(() => {
    if (!hasProjection) return null;
    return addMonthsToDate(firstDueDateIso as string, qty - 1);
  }, [hasProjection, firstDueDateIso, qty]);

  const sparkPoints = useMemo(() => {
    if (!hasProjection) return [];
    const points: number[] = [];
    const steps = Math.min(qty, 10);

    for (let i = 0; i < steps; i++) {
      const ratio = 1 - i / (steps - 1 || 1);
      points.push(ratio);
    }
    return points;
  }, [hasProjection, qty]);

  return (
    <View style={styles.panelContainer}>
      <Text style={styles.panelTitle}>Projeção de quitação</Text>

      <View style={styles.panelBadge}>
        <Text style={styles.panelBadgeText}>
          Projeção baseada em matemática financeira
        </Text>
      </View>

      {/* Total + Saldo */}
      <View style={styles.rowBetween}>
        <View>
          <Text style={styles.panelLabel}>Valor total da dívida</Text>
          <Text style={styles.panelValue}>
            {sanitizedTotal > 0 ? `R$ ${sanitizedTotal.toFixed(2)}` : "—"}
          </Text>
        </View>

        <View>
          <Text style={styles.panelLabel}>Saldo devedor</Text>
          <Text style={styles.panelValue}>
            {remaining > 0 ? `R$ ${remaining.toFixed(2)}` : "—"}
          </Text>
        </View>
      </View>

      {/* Parcela + Meses */}
      <View style={[styles.rowBetween, { marginTop: 16 }]}>
        <View>
          <Text style={styles.panelLabel}>Parcela estimada</Text>
          <Text style={styles.panelValue}>
            {installmentAmount > 0 ? `R$ ${installmentAmount.toFixed(2)}` : "—"}
          </Text>
        </View>

        <View>
          <Text style={styles.panelLabel}>Meses até quitação</Text>
          <Text style={styles.panelValue}>{qty > 0 ? `${qty}x` : "—"}</Text>
        </View>
      </View>

      {/* Sparkline */}
      <View style={{ marginTop: 18 }}>
        <Text style={styles.panelLabel}>Saldo devedor ao longo do tempo</Text>
        <View style={styles.sparklineRow}>
          {sparkPoints.length === 0 ? (
            <Text style={styles.panelHint}>
              Preencha os campos para visualizar a curva.
            </Text>
          ) : (
            sparkPoints.map((ratio, i) => (
              <View
                key={i}
                style={[
                  styles.sparkBar,
                  { height: 8 + 24 * ratio, opacity: 0.4 + 0.5 * ratio },
                ]}
              />
            ))
          )}
        </View>
      </View>

      {/* Data estimada */}
      <View style={{ marginTop: 18 }}>
        <Text style={styles.panelLabel}>Quitação estimada</Text>
        <Text style={styles.panelValue}>
          {hasProjection && estimatedEnd ? estimatedEnd : "—"}
        </Text>
      </View>

      <Text style={styles.panelDescription}>
        Esta projeção é puramente matemática. Futuramente, a PILA poderá
        interpretar usando IA, sem alterar o resultado.
      </Text>
    </View>
  );
}

/* ===========================================================
   COMPONENTE PRINCIPAL
=========================================================== */
export default function CreateDebtModal({ visible, onClose }: Props) {
  const { createGoal } = useGoals();

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;

  const [step, setStep] = useState(0);

  const [title, setTitle] = useState("");
  const [total, setTotal] = useState("");
  const [paid, setPaid] = useState("");
  const [installments, setInstallments] = useState("12");
  const [firstDate, setFirstDate] = useState("");

  const [debtStyle, setDebtStyle] = useState<DebtStyle>("loan");
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 260, useNativeDriver: true }),
        Animated.spring(slide, { toValue: 0, useNativeDriver: true }),
      ]).start();
    } else {
      fade.setValue(0);
      slide.setValue(20);
    }
  }, [visible]);

  const parsedTotal = useMemo(() => {
    if (!total.trim()) return null;
    const n = Number(total.replace(/\./g, "").replace(",", "."));
    return Number.isNaN(n) ? null : n;
  }, [total]);

  const parsedPaid = useMemo(() => {
    if (!paid.trim()) return null;
    const n = Number(paid.replace(/\./g, "").replace(",", "."));
    return Number.isNaN(n) ? null : n;
  }, [paid]);

  const parsedInstallments = useMemo(() => {
    if (!installments.trim()) return null;
    const n = Number(installments);
    return Number.isNaN(n) ? null : n;
  }, [installments]);

  const normalizedFirstDate = useMemo(() => {
    if (!firstDate.trim()) return null;
    return normalizeDateForSupabase(firstDate);
  }, [firstDate]);

  async function handleCreate() {
    if (!title.trim()) return;
    if (!parsedTotal || parsedTotal <= 0) return;

    const paidValue = parsedPaid && parsedPaid > 0 ? parsedPaid : 0;
    const qty = parsedInstallments && parsedInstallments > 0 ? parsedInstallments : 1;

    const remaining = Math.max(parsedTotal - paidValue, 0);
    const installmentAmount = remaining / qty;

    const firstDue =
      normalizedFirstDate ?? new Date().toISOString().slice(0, 10);

    const payload = {
      type: "debt" as const,
      title: title.trim(),
      targetAmount: parsedTotal,
      currentAmount: paidValue,
      debtStyle,
      installmentsCount: qty,
      installmentAmount,
      firstDueDate: firstDue,
      startDate: new Date().toISOString(),
    };

    const id = await createGoal(payload);

    if (id === "PAYWALL") {
      setShowPaywall(true);
      return;
    }

    onClose();
  }

  if (!visible) return null;

  /* -------------------------------------------------------
     Steps (UI preservada)
  --------------------------------------------------------*/
  const canGoNextFromStep0 = title.trim().length > 0;

  const steps = [
    /* STEP 1 */ (
      <View style={styles.step} key="s1">
        <Text style={styles.stepTitle}>Qual é o tipo desta dívida?</Text>
        <Text style={styles.stepSubtitle}>
          Classificar a obrigação ajuda o painel a separar cartões, empréstimos e financiamentos.
        </Text>

        <View style={styles.segmentRow}>
          {[
            { key: "loan", label: "Empréstimo" },
            { key: "credit_card", label: "Cartão" },
            { key: "financing", label: "Financiamento" },
          ].map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={[
                styles.segmentItem,
                debtStyle === opt.key && styles.segmentItemActive,
              ]}
              onPress={() => setDebtStyle(opt.key as DebtStyle)}
            >
              <Text
                style={[
                  styles.segmentText,
                  debtStyle === opt.key && styles.segmentTextActive,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.inputGlass, { marginTop: 20 }]}>
          <Text style={styles.label}>Nome da dívida</Text>
          <TextInput
            placeholder="Ex: Cartão Nubank, Empréstimo Banco Inter…"
            placeholderTextColor="#777"
            style={styles.input}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <Text style={styles.helperText}>
          Use um nome claro. Ele aparecerá nos relatórios e timeline.
        </Text>
      </View>
    ),

    /* STEP 2 */ (
      <View style={styles.step} key="s2">
        <Text style={styles.stepTitle}>Valor e saldo da dívida</Text>
        <Text style={styles.stepSubtitle}>
          Informe o valor total contratado e, se houver, o que já foi amortizado.
        </Text>

        <View style={styles.inputGlass}>
          <Text style={styles.label}>Valor total</Text>
          <TextInput
            keyboardType="numeric"
            placeholder="0,00"
            placeholderTextColor="#777"
            style={styles.input}
            value={total}
            onChangeText={setTotal}
          />
        </View>

        <View style={styles.inputGlass}>
          <Text style={styles.label}>Já pago (opcional)</Text>
          <TextInput
            keyboardType="numeric"
            placeholder="0,00"
            placeholderTextColor="#777"
            style={styles.input}
            value={paid}
            onChangeText={setPaid}
          />
        </View>
      </View>
    ),

    /* STEP 3 */ (
      <View style={styles.step} key="s3">
        <Text style={styles.stepTitle}>Parcelas e primeira data</Text>
        <Text style={styles.stepSubtitle}>
          Defina quantas parcelas restam e quando a próxima cobrança acontece.
        </Text>

        <View style={styles.inputGlass}>
          <Text style={styles.label}>Quantidade de parcelas</Text>
          <TextInput
            keyboardType="numeric"
            placeholder="12"
            placeholderTextColor="#777"
            style={styles.input}
            value={installments}
            onChangeText={setInstallments}
          />
        </View>

        <View style={styles.inputGlass}>
          <Text style={styles.label}>Primeira parcela</Text>
          <TextInput
            placeholder="AAAA-MM-DD ou DD/MM/AAAA"
            placeholderTextColor="#777"
            style={styles.input}
            value={firstDate}
            onChangeText={setFirstDate}
          />
        </View>
      </View>
    ),

    /* STEP 4 */ (
      <View style={styles.step} key="s4">
        <Text style={styles.stepTitle}>Revise antes de criar</Text>
        <Text style={styles.stepSubtitle}>
          Confira os principais dados desta dívida antes de confirmar.
        </Text>

        <View style={styles.reviewCard}>
          <Text style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>Tipo: </Text>
            <Text style={styles.reviewValue}>
              {debtStyle === "loan"
                ? "Empréstimo"
                : debtStyle === "credit_card"
                ? "Cartão de crédito"
                : "Financiamento"}
            </Text>
          </Text>

          <Text style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>Nome: </Text>
            <Text style={styles.reviewValue}>{title || "—"}</Text>
          </Text>

          <Text style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>Valor total: </Text>
            <Text style={styles.reviewValue}>
              {parsedTotal ? `R$ ${parsedTotal.toFixed(2)}` : "—"}
            </Text>
          </Text>

          <Text style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>Já pago: </Text>
            <Text style={styles.reviewValue}>
              {parsedPaid ? `R$ ${parsedPaid.toFixed(2)}` : "—"}
            </Text>
          </Text>

          <Text style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>Parcelas: </Text>
            <Text style={styles.reviewValue}>
              {parsedInstallments ? `${parsedInstallments}x` : "—"}
            </Text>
          </Text>

          <Text style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>Primeira parcela: </Text>
            <Text style={styles.reviewValue}>{normalizedFirstDate || "—"}</Text>
          </Text>
        </View>
      </View>
    ),
  ];

  const showPanel = step === 1 || step === 2;

  /* -------------------------------------------------------
     RENDER FINAL (PATCH UNIVERSAL)
  --------------------------------------------------------*/
  return (
    <Animated.View
      style={[
        styles.overlay,
        { opacity: fade, transform: [{ translateY: slide }] },
      ]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.fullscreenContainer}>
          {/* HEADER */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => (step > 0 ? setStep(step - 1) : onClose())}
              style={styles.closeBtn}
            >
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>

            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>Nova dívida</Text>
              <Text style={styles.headerSubtitle}>
                Estruture esta obrigação financeira com clareza.
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
              contentContainerStyle={{ paddingBottom: 200 }}
            >
              <BlurView intensity={30} tint="dark" style={styles.wizardContainer}>
                <View style={styles.stepScrollContent}>{steps[step]}</View>
              </BlurView>

              {showPanel && (
                <View style={styles.panelWrapper}>
                  <DebtProjectionPanel
                    total={parsedTotal}
                    paid={parsedPaid}
                    installmentsCount={parsedInstallments}
                    firstDueDateIso={normalizedFirstDate}
                  />
                </View>
              )}
            </ScrollView>
          </View>

          {/* FOOTER */}
          <View style={styles.footer}>
            {step < TOTAL_STEPS - 1 ? (
              <TouchableOpacity
                onPress={() => {
                  if (step === 0 && !canGoNextFromStep0) return;
                  setStep((prev) => Math.min(prev + 1, TOTAL_STEPS - 1));
                }}
                style={[
                  styles.primaryBtn,
                  step === 0 && !canGoNextFromStep0 && styles.buttonDisabled,
                ]}
                disabled={step === 0 && !canGoNextFromStep0}
              >
                <Text style={styles.primaryBtnText}>Continuar</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={handleCreate} style={styles.primaryBtn}>
                <Text style={styles.primaryBtnText}>Criar dívida</Text>
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
          onUpgrade={() => {
            console.log("Upgrade");
            setShowPaywall(false);
          }}
        />
      )}
    </Animated.View>
  );
}

/* ===========================================================
   STYLES
=========================================================== */

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

  closeText: {
    color: "#fff",
    fontSize: 24,
  },

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

  stepIndicator: {
    color: "#aaa",
    fontSize: 14,
    marginLeft: 8,
    fontFamily: brandFont,
  },

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

  contentArea: {
    flex: 1,
    paddingHorizontal: 16,
  },

  wizardContainer: {
    borderRadius: 26,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: 20,
  },

  stepScrollContent: {
    paddingHorizontal: 18,
    paddingVertical: 22,
  },

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

  input: {
    color: "#fff",
    fontSize: 17,
    fontFamily: brandFont,
  },

  helperText: {
    marginTop: 6,
    color: "#666",
    fontSize: 12,
    fontFamily: brandFont,
  },

  /* Segmentos */
  segmentRow: {
    flexDirection: "row",
    gap: 8,
  },

  segmentItem: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
    justifyContent: "center",
  },

  segmentItemActive: {
    backgroundColor: "rgba(255,255,255,0.16)",
    borderColor: "rgba(255,255,255,0.35)",
  },

  segmentText: {
    color: "#aaa",
    fontSize: 13,
    fontFamily: brandFont,
  },

  segmentTextActive: {
    color: "#fff",
    fontWeight: "600",
  },

  panelWrapper: {
    marginBottom: 20,
  },

  panelContainer: {
    borderRadius: 22,
    padding: 20,
    backgroundColor: "rgba(10,10,12,0.94)",
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

  panelBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginBottom: 14,
  },

  panelBadgeText: {
    color: "#bbb",
    fontSize: 11,
    fontFamily: brandFont,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  panelLabel: {
    color: "#bbb",
    fontSize: 13,
    marginBottom: 4,
    fontFamily: brandFont,
  },

  panelValue: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
    fontFamily: brandFont,
  },

  sparklineRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 8,
    minHeight: 32,
  },

  sparkBar: {
    width: 8,
    borderRadius: 999,
    marginRight: 4,
    backgroundColor: "rgba(255,255,255,0.6)",
  },

  panelHint: {
    color: "#777",
    fontSize: 12,
    fontFamily: brandFont,
  },

  panelDescription: {
    marginTop: 14,
    color: "#888",
    fontSize: 12,
    lineHeight: 17,
    fontFamily: brandFont,
  },

  reviewCard: {
    marginTop: 14,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  reviewRow: {
    marginBottom: 6,
    fontSize: 14,
  },

  reviewLabel: {
    color: "#999",
    fontFamily: brandFont,
  },

  reviewValue: {
    color: "#fff",
    fontFamily: brandFont,
  },

  footer: {
    padding: 20,
  },

  primaryBtn: {
    backgroundColor: "rgba(255,255,255,0.14)",
    height: 54,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
  },

  primaryBtnText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
    fontFamily: brandFont,
  },

  buttonDisabled: {
    opacity: 0.4,
  },

  cancelText: {
    color: "#888",
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
    fontFamily: brandFont,
  },
});

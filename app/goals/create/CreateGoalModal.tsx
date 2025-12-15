// app/goals/create/CreateGoalModal.tsx
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
import { useGoals } from "@/context/GoalsContext";
import ModalPremiumPaywall from "@/components/app/common/ModalPremiumPaywall";

const brandFont = Platform.select({
  ios: "SF Pro Display",
  android: "Inter",
  default: "System",
});

/* -----------------------------------------------------
   Tipagem
------------------------------------------------------*/
type Props = {
  visible: boolean;
  onClose: () => void;
};

/* -----------------------------------------------------
   Normalização da data
------------------------------------------------------*/
function normalizeDate(input: string): string | null {
  if (!input) return null;

  const d = input.trim();

  // Já está em formato ISO
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;

  const m = d.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (!m) return null;

  let [_, day, month, year] = m;
  if (year.length === 2) year = "20" + year;

  return `${year.padStart(4, "0")}-${month.padStart(2, "0")}-${day.padStart(
    2,
    "0"
  )}`;
}

/* -----------------------------------------------------
   Painel matemático premium
------------------------------------------------------*/
function GoalInsightPanel({
  currentValue,
  targetValue,
  monthly,
  endDate,
}: {
  currentValue: number | null;
  targetValue: number | null;
  monthly: number | null;
  endDate: string | null;
}) {
  const safeCurrent = currentValue ?? 0;
  const safeTarget = targetValue ?? 0;
  const safeMonthly = monthly ?? 0;

  const missing = Math.max(safeTarget - safeCurrent, 0);

  let monthsToReach: number | null = null;
  if (safeMonthly > 0) {
    monthsToReach = Math.ceil(missing / safeMonthly);
  }

  let monthsUntilDeadline: number | null = null;
  if (endDate) {
    const now = new Date();
    const end = new Date(endDate);
    if (!Number.isNaN(end.getTime())) {
      const diff =
        (end.getFullYear() - now.getFullYear()) * 12 +
        (end.getMonth() - now.getMonth());
      monthsUntilDeadline = Math.max(diff, 0);
    }
  }

  let statusText = "";
  if (monthsToReach != null && monthsUntilDeadline != null) {
    if (monthsToReach < monthsUntilDeadline) {
      statusText = "Você está adiantado em relação ao prazo.";
    } else if (monthsToReach === monthsUntilDeadline) {
      statusText = "Você está alinhado ao prazo definido.";
    } else {
      statusText = `Existe um gap de ${
        monthsToReach - monthsUntilDeadline
      } meses entre o aporte atual e o prazo.`;
    }
  }

  return (
    <View style={styles.panelContainer}>
      <Text style={styles.panelTitle}>Projeção baseada em matemática financeira</Text>

      <View style={styles.badge}>
        <Text style={styles.badgeText}>Cálculo objetivo</Text>
      </View>

      <View style={styles.rowBetween}>
        <View>
          <Text style={styles.panelLabel}>Faltante</Text>
          <Text style={styles.panelValue}>R$ {missing.toFixed(2)}</Text>
        </View>

        <View>
          <Text style={styles.panelLabel}>Aporte mensal</Text>
          <Text style={styles.panelValue}>
            R$ {safeMonthly.toFixed(2)}
          </Text>
        </View>
      </View>

      {monthsToReach != null && (
        <>
          <Text style={[styles.panelLabel, { marginTop: 18 }]}>
            Tempo estimado para atingir sua meta
          </Text>
          <Text style={styles.panelValue}>{monthsToReach} meses</Text>
        </>
      )}

      {statusText ? (
        <Text style={[styles.panelAIText, { marginTop: 16 }]}>{statusText}</Text>
      ) : (
        <Text style={[styles.panelAIText, { marginTop: 16 }]}>
          Ajustes no aporte mensal podem melhorar o alinhamento com o prazo.
        </Text>
      )}
    </View>
  );
}

/* -----------------------------------------------------
   COMPONENTE PRINCIPAL
------------------------------------------------------*/
export default function CreateGoalModal({ visible, onClose }: Props) {
  const { createGoal } = useGoals();

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;
  const panelFade = useRef(new Animated.Value(0)).current;
  const panelTranslate = useRef(new Animated.Value(10)).current;

  const [step, setStep] = useState(0);

  const [title, setTitle] = useState("");
  const [current, setCurrent] = useState("");
  const [target, setTarget] = useState("");
  const [monthly, setMonthly] = useState("");
  const [endDate, setEndDate] = useState("");

  const [showPaywall, setShowPaywall] = useState(false);

  const TOTAL_STEPS = 4;

  /* -----------------------------------------------------
     Modal animation
  ------------------------------------------------------*/
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fade, {
          toValue: 1,
          duration: 240,
          useNativeDriver: true,
        }),
        Animated.spring(slide, {
          toValue: 0,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fade.setValue(0);
      slide.setValue(20);
    }
  }, [visible, fade, slide]);

  /* -----------------------------------------------------
     Panel animation
  ------------------------------------------------------*/
  useEffect(() => {
    if (step === 2 || step === 3) {
      Animated.parallel([
        Animated.timing(panelFade, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(panelTranslate, {
          toValue: 0,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      panelFade.setValue(0);
      panelTranslate.setValue(10);
    }
  }, [step, panelFade, panelTranslate]);

  /* -----------------------------------------------------
     Parsed fields
  ------------------------------------------------------*/
  const parsedCurrent = current
    ? Number(
        current
          .replace(/\./g, "")
          .replace(",", ".")
          .replace(/[^\d.]/g, "")
      ) || 0
    : 0;

  const parsedTarget = target
    ? Number(
        target
          .replace(/\./g, "")
          .replace(",", ".")
          .replace(/[^\d.]/g, "")
      ) || 0
    : 0;

  const parsedMonthly = monthly
    ? Number(
        monthly
          .replace(/\./g, "")
          .replace(",", ".")
          .replace(/[^\d.]/g, "")
      ) || 0
    : 0;

  /* -----------------------------------------------------
     SUBMIT
  ------------------------------------------------------*/
  async function handleCreate() {
    if (!title.trim()) return;
    if (!parsedTarget || parsedTarget <= 0) return;
    if (!endDate.trim()) return;

    const normalized = normalizeDate(endDate);
    if (!normalized) return;

    const payload = {
      type: "goal" as const,
      title: title.trim(),
      currentAmount: parsedCurrent,
      targetAmount: parsedTarget,
      autoRuleMonthly: parsedMonthly > 0 ? parsedMonthly : null,
      endDate: normalized,
    };

    console.log("DEBUG/CreateGoalModal payload:", payload);

    const id = await createGoal(payload);

    if (id === "PAYWALL") {
      setShowPaywall(true);
      return;
    }

    onClose();
  }

  if (!visible) return null;

  /* -----------------------------------------------------
     Steps
  ------------------------------------------------------*/
  const steps = [
    /* STEP 1 — Nome */
    <View style={styles.step} key="s1">
      <Text style={styles.stepTitle}>Como devemos chamar esta meta?</Text>

      <View style={styles.inputGlass}>
        <TextInput
          placeholder="Ex: Reserva, Viagem, Independência..."
          placeholderTextColor="#777"
          style={styles.input}
          value={title}
          onChangeText={setTitle}
        />
      </View>
    </View>,

    /* STEP 2 — Valores */
    <View style={styles.step} key="s2">
      <Text style={styles.stepTitle}>Valores principais</Text>

      <View style={styles.inputGlass}>
        <Text style={styles.label}>Quanto já tenho</Text>
        <TextInput
          keyboardType="numeric"
          placeholder="0,00"
          placeholderTextColor="#777"
          style={styles.input}
          value={current}
          onChangeText={setCurrent}
        />
      </View>

      <View style={styles.inputGlass}>
        <Text style={styles.label}>Valor desejado</Text>
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
    </View>,

    /* STEP 3 — Data final */
    <View style={styles.step} key="s3">
      <Text style={styles.stepTitle}>Data limite</Text>

      <View style={styles.inputGlass}>
        <Text style={styles.label}>Prazo final (obrigatório)</Text>
        <TextInput
          placeholder="AAAA-MM-DD ou DD/MM/AAAA"
          placeholderTextColor="#777"
          style={styles.input}
          value={endDate}
          onChangeText={setEndDate}
        />
      </View>
    </View>,

    /* STEP 4 — Revisão */
    <View style={styles.step} key="s4">
      <Text style={styles.stepTitle}>Revisão final</Text>

      <Text style={styles.reviewText}>Nome: {title || "—"}</Text>
      <Text style={styles.reviewText}>
        Atual: R$ {parsedCurrent.toFixed(2)}
      </Text>
      <Text style={styles.reviewText}>
        Meta: R$ {parsedTarget.toFixed(2)}
      </Text>
      <Text style={styles.reviewText}>
        Aporte mensal: R$ {parsedMonthly.toFixed(2)}
      </Text>
      <Text style={styles.reviewText}>Prazo: {endDate || "—"}</Text>
    </View>,
  ];

  const canNext =
    step === 0
      ? title.trim().length > 0
      : step === 1
      ? parsedTarget > 0
      : step === 2
      ? endDate.trim().length > 0
      : true;

  const showPanel = step === 2 || step === 3;

  /* -----------------------------------------------------
     RENDER — FULLSCREEN (igual investimento/dívida)
  ------------------------------------------------------*/
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
              <Text style={styles.headerTitle}>Nova meta</Text>
              <Text style={styles.headerSubtitle}>
                Estruture sua meta com clareza.
              </Text>
            </View>

            <Text style={styles.stepIndicator}>
              {step + 1}/{TOTAL_STEPS}
            </Text>
          </View>

          {/* PROGRESS BAR */}
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

              {showPanel && (
                <Animated.View
                  style={[
                    styles.panelWrapper,
                    {
                      opacity: panelFade,
                      transform: [{ translateY: panelTranslate }],
                    },
                  ]}
                >
                  <GoalInsightPanel
                    currentValue={parsedCurrent}
                    targetValue={parsedTarget}
                    monthly={parsedMonthly}
                    endDate={normalizeDate(endDate)}
                  />
                </Animated.View>
              )}
            </ScrollView>
          </View>

          {/* FOOTER */}
          <View style={styles.footer}>
            {step < TOTAL_STEPS - 1 ? (
              <TouchableOpacity
                disabled={!canNext}
                onPress={() => {
                  if (!canNext) return;
                  setStep((prev) => Math.min(prev + 1, TOTAL_STEPS - 1));
                }}
                style={[
                  styles.primaryBtn,
                  !canNext && styles.buttonDisabled,
                ]}
              >
                <Text style={styles.primaryBtnText}>Continuar</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={handleCreate} style={styles.primaryBtn}>
                <Text style={styles.primaryBtnText}>Criar meta</Text>
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
   STYLES — FULLSCREEN, sem vazamento
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

  step: {
    width: "100%",
  },

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
  },

  input: {
    color: "#fff",
    fontSize: 17,
    fontFamily: brandFont,
  },

  reviewText: {
    color: "#ccc",
    fontSize: 15,
    marginBottom: 8,
    fontFamily: brandFont,
  },

  panelWrapper: {
    marginBottom: 20,
  },

  panelContainer: {
    borderRadius: 22,
    padding: 22,
    backgroundColor: "rgba(10,10,12,0.92)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  panelTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 6,
    fontFamily: brandFont,
  },

  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginBottom: 14,
  },

  badgeText: {
    color: "#bbb",
    fontSize: 11,
    fontFamily: brandFont,
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

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  panelAIText: {
    color: "#ddd",
    fontSize: 14,
    lineHeight: 19,
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

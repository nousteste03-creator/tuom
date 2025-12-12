// app/goals/investments/edit.tsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import Screen from "@/components/layout/Screen";
import Icon from "@/components/ui/Icon";
import { useGoals } from "@/hooks/useGoals";
import { supabase } from "@/lib/supabase";

const { width } = Dimensions.get("window");
const INNER_WIDTH = width - 40;

const brandFont = Platform.select({
  ios: "SF Pro Display",
  android: "Inter",
  default: "System",
});

/* ---------------------------------------------------------
   HELPERS
--------------------------------------------------------- */
function fmtCurrency(n?: number | null) {
  if (!n || isNaN(n)) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(n);
}

/* ---------------------------------------------------------
   COMPONENTE
--------------------------------------------------------- */
export default function InvestmentEditScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const investmentId = id ?? null;

  const { investments, loading, reload, updateGoal } = useGoals();

  const investment = useMemo(
    () => investments.find((i) => i.id === investmentId),
    [investments, investmentId]
  );

  /* ---------------------------------------------------------
      STATES
  --------------------------------------------------------- */
  const [step, setStep] = useState(0);

  const translateX = useRef(new Animated.Value(0)).current;
  const stepOpacity = useRef(new Animated.Value(1)).current;
  const stepScale = useRef(new Animated.Value(1)).current;

  const [name, setName] = useState("");
  const [currentInput, setCurrentInput] = useState("");
  const [monthlyInput, setMonthlyInput] = useState("");
  const [deadline, setDeadline] = useState("");

  const [saving, setSaving] = useState(false);

  /* ---------------------------------------------------------
      LOAD INITIAL VALUES
  --------------------------------------------------------- */
  useEffect(() => {
    if (!investment) return;

    setName(investment.title ?? "");
    setCurrentInput(
      investment.currentAmount != null
        ? String(investment.currentAmount).replace(".", ",")
        : ""
    );
    setMonthlyInput(
      investment.autoRuleMonthly != null
        ? String(investment.autoRuleMonthly).replace(".", ",")
        : ""
    );
    setDeadline(investment.endDate ?? "");
  }, [investment]);

  /* ---------------------------------------------------------
      ANIMATION
  --------------------------------------------------------- */
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

  /* ---------------------------------------------------------
      PARSE INPUTS
  --------------------------------------------------------- */
  const parsedCurrent = useMemo(() => {
    const v = parseFloat(
      currentInput.replace(/\./g, "").replace(",", ".")
    );
    return isNaN(v) ? undefined : v;
  }, [currentInput]);

  const parsedMonthly = useMemo(() => {
    const v = parseFloat(
      monthlyInput.replace(/\./g, "").replace(",", ".")
    );
    return isNaN(v) ? undefined : v;
  }, [monthlyInput]);

  /* ---------------------------------------------------------
      GUARDS
  --------------------------------------------------------- */
  if (!investmentId) {
    return (
      <Screen style={styles.center}>
        <Text style={styles.err}>Investimento inválido.</Text>
      </Screen>
    );
  }

  if (loading && !investment) {
    return (
      <Screen style={styles.center}>
        <ActivityIndicator color="#fff" />
      </Screen>
    );
  }

  if (!investment) {
    return (
      <Screen style={styles.center}>
        <Text style={styles.err}>Investimento não encontrado.</Text>
      </Screen>
    );
  }

  /* ---------------------------------------------------------
      SAVE
  --------------------------------------------------------- */
  async function handleSave() {
    try {
      setSaving(true);

      await updateGoal(investment.id, {
        title: name.trim(),
        currentAmount: parsedCurrent,
        autoRuleMonthly: parsedMonthly,
        endDate: deadline || null,
      });

      await reload();

      Alert.alert("Pronto", "Investimento atualizado.");
      router.replace(`/goals/investments/${investment.id}`);
    } catch (e) {
      Alert.alert("Erro", "Erro inesperado.");
    } finally {
      setSaving(false);
    }
  }

  /* ---------------------------------------------------------
      DELETE
  --------------------------------------------------------- */
  function handleDelete() {
    Alert.alert(
      "Excluir investimento",
      "Essa ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            const { error } = await supabase
              .from("goals")
              .delete()
              .eq("id", investment.id);

            if (error) {
              Alert.alert("Erro", "Não foi possível excluir.");
              return;
            }

            await reload();
            router.replace("/goals");
          },
        },
      ]
    );
  }

  /* ---------------------------------------------------------
      BACK
  --------------------------------------------------------- */
  function back() {
    if (step > 0) {
      setStep(step - 1);
      return;
    }
    router.replace(`/goals/investments/${investment.id}`);
  }

  /* ---------------------------------------------------------
      STEPS (mantidos)
  --------------------------------------------------------- */
  const steps = [
    { title: "Nome", value: name, set: setName },
    { title: "Valor atual", value: currentInput, set: setCurrentInput },
    { title: "Aporte mensal", value: monthlyInput, set: setMonthlyInput },
    { title: "Prazo", value: deadline, set: setDeadline },
  ];

  /* ---------------------------------------------------------
      RENDER
  --------------------------------------------------------- */
  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={back} style={styles.backBtn}>
            <Icon name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Editar investimento</Text>

          <Text style={styles.stepIndicator}>{step + 1}/4</Text>
        </View>

        {/* PREVIEW */}
        <View style={styles.previewCard}>
          <Text style={styles.previewTitle}>{name || "Investimento"}</Text>
          <Text style={styles.previewValue}>
            Atual: {fmtCurrency(parsedCurrent ?? investment.currentAmount)}
          </Text>
          <Text style={styles.previewValue}>
            Mensal: {fmtCurrency(parsedMonthly ?? investment.autoRuleMonthly)}
          </Text>
        </View>

        {/* FORM */}
        <View style={styles.wizardContainer}>
          <Animated.View
            style={[
              styles.stepsWrapper,
              {
                width: INNER_WIDTH * 4,
                transform: [{ translateX }, { scale: stepScale }],
                opacity: stepOpacity,
              },
            ]}
          >
            {steps.map((s, i) => (
              <View key={i} style={{ width: INNER_WIDTH }}>
                <ScrollView
                  contentContainerStyle={styles.stepScrollContent}
                >
                  <Text style={styles.stepTitle}>{s.title}</Text>
                  <TextInput
                    style={styles.input}
                    value={s.value}
                    onChangeText={s.set}
                    placeholder="—"
                    placeholderTextColor="#777"
                  />
                </ScrollView>
              </View>
            ))}
          </Animated.View>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          {step < 3 ? (
            <TouchableOpacity
              onPress={() => setStep(step + 1)}
              style={styles.btn}
            >
              <Text style={styles.btnText}>Continuar</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleSave}
              style={[styles.btn, saving && { opacity: 0.4 }]}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>Salvar alterações</Text>
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={handleDelete}
            style={styles.deleteBtn}
          >
            <Text style={styles.deleteText}>Excluir investimento</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

/* ---------------------------------------------------------
   STYLES
--------------------------------------------------------- */
const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  err: { color: "#FF453A", fontSize: 16 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  headerTitle: {
    flex: 1,
    color: "#fff",
    fontSize: 20,
    fontFamily: brandFont,
    fontWeight: "600",
  },
  stepIndicator: {
    color: "#aaa",
    fontSize: 14,
    fontFamily: brandFont,
  },

  previewCard: {
    marginHorizontal: 18,
    marginBottom: 16,
    borderRadius: 22,
    padding: 18,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  previewTitle: {
    color: "#fff",
    fontSize: 18,
    fontFamily: brandFont,
    fontWeight: "600",
    marginBottom: 6,
  },
  previewValue: {
    color: "#aaa",
    fontSize: 14,
    fontFamily: brandFont,
  },

  wizardContainer: {
    flex: 1,
    marginHorizontal: 18,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  stepsWrapper: { flexDirection: "row" },
  stepScrollContent: { padding: 20, paddingBottom: 60 },

  stepTitle: {
    color: "#fff",
    fontSize: 22,
    fontFamily: brandFont,
    fontWeight: "600",
    marginBottom: 12,
  },
  input: {
    color: "#fff",
    fontSize: 18,
    fontFamily: brandFont,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.2)",
    paddingVertical: 6,
  },

  footer: { padding: 20 },
  btn: {
    height: 54,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  btnText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
    fontFamily: brandFont,
  },

  deleteBtn: {
    marginTop: 8,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "rgba(255, 69, 58, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(255, 69, 58, 0.3)",
    alignItems: "center",
  },
  deleteText: {
    color: "#FF453A",
    fontSize: 15,
    fontWeight: "600",
    fontFamily: brandFont,
  },
});

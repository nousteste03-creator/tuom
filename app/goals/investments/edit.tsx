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
function fmtName(n: string) {
  return n?.trim() || "Sem nome";
}
function fmtNum(n: number | null | undefined) {
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
  const { goalId } = useLocalSearchParams<{ goalId?: string }>();

  const { investments, loading, reload, updateGoal } = useGoals();

  const investment = useMemo(
    () => investments.find((i) => i.id === goalId),
    [investments, goalId]
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

    setName(investment.title ?? investment.name ?? "");

    setCurrentInput(
      investment.currentAmount
        ? String(investment.currentAmount).replace(".", ",")
        : ""
    );

    setMonthlyInput(
      investment.autoRuleMonthly
        ? String(investment.autoRuleMonthly).replace(".", ",")
        : ""
    );

    setDeadline(investment.endDate ?? "");
  }, [investment]);

  /* ---------------------------------------------------------
      ANIMAÇÃO
  --------------------------------------------------------- */
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

  /* ---------------------------------------------------------
      PARSE INPUTS
  --------------------------------------------------------- */
  const parsedCurrent = useMemo(() => {
    const v = parseFloat(
      currentInput.replace(/\./g, "").replace(",", ".")
    );
    return isNaN(v) ? null : v;
  }, [currentInput]);

  const parsedMonthly = useMemo(() => {
    const v = parseFloat(
      monthlyInput.replace(/\./g, "").replace(",", ".")
    );
    return isNaN(v) ? null : v;
  }, [monthlyInput]);

  /* ---------------------------------------------------------
      VALIDATION
  --------------------------------------------------------- */
  if (!goalId) {
    return (
      <Screen>
        <View style={styles.center}>
          <Text style={styles.err}>ID inválido</Text>
        </View>
      </Screen>
    );
  }

  if (loading && !investment) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator color="#fff" />
          <Text style={styles.subtitle}>Carregando...</Text>
        </View>
      </Screen>
    );
  }

  if (!investment) {
    return (
      <Screen>
        <View style={styles.center}>
          <Text style={styles.err}>Investimento não encontrado.</Text>
        </View>
      </Screen>
    );
  }

  /* ---------------------------------------------------------
      SAVE
  --------------------------------------------------------- */
  async function handleSave() {
    try {
      setSaving(true);

      await updateGoal(String(goalId), {
        title: name.trim(),
        currentAmount: parsedCurrent ?? undefined,
        autoRuleMonthly: parsedMonthly ?? undefined,
        endDate: deadline || null,
      });

      await reload();

      Alert.alert("Pronto", "Investimento atualizado.");
      router.replace(`/goals/${goalId}`);
    } catch (e) {
      console.error(e);
      Alert.alert("Erro", "Erro inesperado.");
    } finally {
      setSaving(false);
    }
  }

  /* ---------------------------------------------------------
      DELETE (CORRETO)
  --------------------------------------------------------- */
  async function handleDelete() {
    Alert.alert(
      "Excluir investimento",
      "Tem certeza que deseja excluir? Essa ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("goals")
                .delete()
                .eq("id", goalId);

              if (error) {
                console.error(error);
                Alert.alert("Erro", "Não foi possível excluir.");
                return;
              }

              await reload();
              Alert.alert("Pronto", "Investimento excluído.");

              router.replace("/goals");
            } catch (err) {
              console.error(err);
              Alert.alert("Erro", "Não foi possível excluir.");
            }
          },
        },
      ]
    );
  }

  /* ---------------------------------------------------------
      BACK (CORRIGIDO)
  --------------------------------------------------------- */
  function back() {
    if (step > 0) {
      setStep(step - 1);
      return;
    }

    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(`/goals/${goalId}`);
    }
  }

  /* ---------------------------------------------------------
      WIZARD STEPS
  --------------------------------------------------------- */
  const Step1 = (
    <View style={styles.step}>
      <Text style={styles.stepTitle}>Nome do investimento</Text>
      <Text style={styles.stepSub}>
        Título exibido no painel e relatórios.
      </Text>

      <View style={styles.glassInput}>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Ex: Ações Brasil, Long Term..."
          placeholderTextColor="#777"
        />
      </View>

      <Text style={styles.helper}>Ajude a identificar rapidamente.</Text>
    </View>
  );

  const Step2 = (
    <View style={styles.step}>
      <Text style={styles.stepTitle}>Valor atual</Text>
      <Text style={styles.stepSub}>Quanto há investido hoje?</Text>

      <View style={styles.glassInput}>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={currentInput}
          onChangeText={setCurrentInput}
          placeholder="0,00"
          placeholderTextColor="#777"
        />
      </View>

      <Text style={styles.helper}>
        Atual registrado: {fmtNum(investment.currentAmount)}
      </Text>
    </View>
  );

  const Step3 = (
    <View style={styles.step}>
      <Text style={styles.stepTitle}>Aporte mensal</Text>
      <Text style={styles.stepSub}>
        Defina um valor recorrente, se fizer sentido.
      </Text>

      <View style={styles.glassInput}>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={monthlyInput}
          onChangeText={setMonthlyInput}
          placeholder="0,00"
          placeholderTextColor="#777"
        />
      </View>

      <Text style={styles.helper}>Usado no fluxo mensal.</Text>
    </View>
  );

  const Step4 = (
    <View style={styles.step}>
      <Text style={styles.stepTitle}>Prazo alvo</Text>
      <Text style={styles.stepSub}>
        Opcional — quando deseja alcançar a meta.
      </Text>

      <View style={styles.glassInput}>
        <TextInput
          style={styles.input}
          value={deadline}
          onChangeText={setDeadline}
          placeholder="AAAA-MM-DD"
          placeholderTextColor="#777"
        />
      </View>

      <View style={styles.reviewBox}>
        <Text style={styles.reviewLine}>Nome: {fmtName(name)}</Text>
        <Text style={styles.reviewLine}>
          Valor atual: {currentInput || "—"}
        </Text>
        <Text style={styles.reviewLine}>
          Aporte mensal: {monthlyInput || "—"}
        </Text>
        <Text style={styles.reviewLine}>
          Prazo: {deadline || "Sem prazo definido"}
        </Text>
      </View>

      {/* BOTÃO DE EXCLUIR */}
      <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
        <Text style={styles.deleteText}>Excluir investimento</Text>
      </TouchableOpacity>
    </View>
  );

  const steps = [Step1, Step2, Step3, Step4];

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

        {/* PROGRESS BAR */}
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBar,
              { width: `${((step + 1) / 4) * 100}%` },
            ]}
          />
        </View>

        {/* PREVIEW */}
        <View style={styles.previewCard}>
          <Text style={styles.previewTitle}>{fmtName(name)}</Text>
          <Text style={styles.previewValue}>
            Atual: {fmtNum(parsedCurrent ?? investment.currentAmount)}
          </Text>
          <Text style={styles.previewValue}>
            Mensal: {fmtNum(parsedMonthly ?? investment.autoRuleMonthly)}
          </Text>
        </View>

        {/* WIZARD */}
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
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.stepScrollContent}
                >
                  {s}
                </ScrollView>
              </View>
            ))}
          </Animated.View>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          {step < 3 ? (
            <TouchableOpacity onPress={() => setStep(step + 1)} style={styles.btn}>
              <Text style={styles.btnText}>Continuar</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleSave}
              style={[styles.btn, saving && { opacity: 0.4 }]}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>Salvar alterações</Text>
              )}
            </TouchableOpacity>
          )}
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

  progressContainer: {
    height: 3,
    backgroundColor: "rgba(255,255,255,0.05)",
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 16,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.35)",
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
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  stepsWrapper: {
    flexDirection: "row",
  },
  stepScrollContent: {
    padding: 20,
    paddingBottom: 60,
  },

  step: {},
  stepTitle: {
    color: "#fff",
    fontSize: 22,
    fontFamily: brandFont,
    fontWeight: "600",
    marginBottom: 8,
  },
  stepSub: {
    color: "#999",
    fontSize: 14,
    marginBottom: 18,
    fontFamily: brandFont,
  },

  glassInput: {
    padding: 16,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    marginBottom: 16,
  },
  input: {
    color: "#fff",
    fontSize: 17,
    fontFamily: brandFont,
  },
  helper: {
    color: "#777",
    fontSize: 12,
    marginTop: -4,
    fontFamily: brandFont,
  },

  reviewBox: {
    marginTop: 20,
    padding: 18,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  reviewLine: {
    color: "#fff",
    opacity: 0.9,
    fontSize: 15,
    marginBottom: 10,
    fontFamily: brandFont,
  },

  deleteBtn: {
    marginTop: 26,
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

  footer: {
    padding: 20,
  },
  btn: {
    height: 54,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
    fontFamily: brandFont,
  },

  subtitle: { color: "#aaa", fontFamily: brandFont, marginTop: 8 },
});

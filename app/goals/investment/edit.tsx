// app/goals/investments/edit.tsx
import React, { useState, useEffect } from "react";
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
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import Screen from "@/components/layout/Screen";
import Icon from "@/components/ui/Icon";
import { useGoals } from "@/hooks/useGoals";
import { supabase } from "@/lib/supabase";

const brandFont = Platform.select({
  ios: "SF Pro Display",
  android: "Inter",
  default: "System",
});

function formatCurrency(value: number) {
  if (!value || isNaN(value)) return "R$ 0,00";
  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    }).format(value);
  } catch {
    return `R$ ${Number(value || 0).toFixed(2)}`;
  }
}

export default function InvestmentEditScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ goalId?: string }>();
  const goalId = params.goalId as string | undefined;

  const { investments, loading, reload } = useGoals();

  const investment = investments.find((inv) => inv.id === goalId);

  const [name, setName] = useState("");
  const [currentAmountInput, setCurrentAmountInput] = useState("");
  const [autoMonthlyInput, setAutoMonthlyInput] = useState("");
  const [deadlineInput, setDeadlineInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    if (investment) {
      setName((investment as any).title ?? (investment as any).name ?? "");
      const cur = (investment as any).currentAmount ?? 0;
      setCurrentAmountInput(
        cur ? String(cur).replace(".", ",") : ""
      );
      const auto = (investment as any).autoRuleMonthly ?? 0;
      setAutoMonthlyInput(
        auto ? String(auto).replace(".", ",") : ""
      );
      const deadline =
        (investment as any).deadlineIso ??
        (investment as any).deadline ??
        "";
      setDeadlineInput(deadline || "");
    }
  }, [investment]);

  if (!goalId) {
    return (
      <Screen>
        <View style={styles.center}>
          <Text style={styles.errorText}>
            Nenhum investimento selecionado (goalId ausente).
          </Text>
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
          <ActivityIndicator size="small" color="#fff" />
          <Text style={styles.subtitle}>
            Carregando investimento...
          </Text>
        </View>
      </Screen>
    );
  }

  if (!investment) {
    return (
      <Screen>
        <View style={styles.center}>
          <Text style={styles.errorText}>
            Investimento não encontrado para o id informado.
          </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.linkText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </Screen>
    );
  }

  const parsedCurrentAmount = (() => {
    const normalized = currentAmountInput
      .replace(/\./g, "")
      .replace(",", ".")
      .replace(/[^\d.]/g, "");
    const value = parseFloat(normalized);
    return isNaN(value) ? null : value;
  })();

  const parsedAutoMonthly = (() => {
    const normalized = autoMonthlyInput
      .replace(/\./g, "")
      .replace(",", ".")
      .replace(/[^\d.]/g, "");
    const value = parseFloat(normalized);
    return isNaN(value) ? null : value;
  })();

  async function handleSave() {
    try {
      setSaving(true);
      setErrorText(null);

      const payload: any = {};
      if (name.trim()) {
        payload.title = name.trim();
      }
      if (parsedCurrentAmount !== null) {
        payload.current_amount = parsedCurrentAmount;
      }
      if (parsedAutoMonthly !== null) {
        payload.auto_rule_monthly = parsedAutoMonthly;
      }
      if (deadlineInput.trim()) {
        payload.deadline = deadlineInput.trim(); // AAAA-MM-DD
      }

      console.log("[INVESTMENT] Atualizando investimento", {
        goalId,
        payload,
      });

      const { error } = await supabase
        .from("goals")
        .update(payload)
        .eq("id", goalId);

      if (error) {
        console.error(
          "[INVESTMENT] Erro ao atualizar investimento",
          error
        );
        setErrorText(error.message);
        Alert.alert(
          "Erro",
          "Não foi possível salvar as alterações."
        );
        return;
      }

      await reload();

      Alert.alert("Pronto", "Investimento atualizado.");
      router.back();
    } catch (err: any) {
      console.error("[INVESTMENT] Erro inesperado", err);
      setErrorText(err?.message ?? "Erro inesperado");
      Alert.alert("Erro", "Ocorreu um erro inesperado.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.root}>
          {/* Header */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.iconButton}
            >
              <Icon name="arrow-left" size={20} color="#fff" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>
                Editar investimento
              </Text>
              <Text style={styles.headerSubtitle}>
                {investment.title ?? investment.name}
              </Text>
            </View>
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.card}>
              {/* Nome */}
              <View style={styles.fieldBlock}>
                <Text style={styles.label}>Nome do investimento</Text>
                <TextInput
                  style={styles.textInput}
                  value={name}
                  onChangeText={setName}
                  placeholder="Ex: Ações, Fundo, Reserva..."
                  placeholderTextColor="#555"
                />
              </View>

              {/* Valor atual */}
              <View style={styles.fieldBlock}>
                <Text style={styles.label}>Valor atual (aprox.)</Text>
                <TextInput
                  style={styles.textInput}
                  value={currentAmountInput}
                  onChangeText={setCurrentAmountInput}
                  keyboardType="numeric"
                  placeholder="0,00"
                  placeholderTextColor="#555"
                />
                <Text style={styles.smallHint}>
                  Atual:{" "}
                  {formatCurrency(
                    (investment as any).currentAmount ?? 0
                  )}
                </Text>
              </View>

              {/* Aporte mensal automático */}
              <View style={styles.fieldBlock}>
                <Text style={styles.label}>
                  Aporte mensal automático
                </Text>
                <TextInput
                  style={styles.textInput}
                  value={autoMonthlyInput}
                  onChangeText={setAutoMonthlyInput}
                  keyboardType="numeric"
                  placeholder="0,00"
                  placeholderTextColor="#555"
                />
                <Text style={styles.smallHint}>
                  Usado na projeção mensal de metas.
                </Text>
              </View>

              {/* Deadline */}
              <View style={styles.fieldBlock}>
                <Text style={styles.label}>Prazo (opcional)</Text>
                <TextInput
                  style={styles.textInput}
                  value={deadlineInput}
                  onChangeText={setDeadlineInput}
                  placeholder="AAAA-MM-DD"
                  placeholderTextColor="#555"
                />
                <Text style={styles.smallHint}>
                  Se vazio, a meta não terá data limite fixa.
                </Text>
              </View>

              {errorText ? (
                <Text style={styles.errorText}>{errorText}</Text>
              ) : null}
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.primaryButton,
                saving && styles.buttonDisabled,
              ]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  Salvar alterações
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 12 : 8,
    paddingBottom: 16,
    backgroundColor: "#000000",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "#000",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    marginRight: 12,
  },
  headerTitle: {
    fontFamily: brandFont,
    fontSize: 20,
    color: "#fff",
  },
  headerSubtitle: {
    fontFamily: brandFont,
    fontSize: 13,
    color: "#8E8E93",
    marginTop: 2,
  },
  card: {
    borderRadius: 24,
    padding: 18,
    backgroundColor: "rgba(28,28,30,0.95)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
  },
  fieldBlock: {
    marginBottom: 16,
  },
  label: {
    fontFamily: brandFont,
    fontSize: 14,
    color: "#fff",
    marginBottom: 6,
  },
  textInput: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "rgba(0,0,0,0.8)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    color: "#fff",
    fontFamily: brandFont,
    fontSize: 15,
  },
  smallHint: {
    marginTop: 6,
    fontFamily: brandFont,
    fontSize: 12,
    color: "#8E8E93",
  },
  footer: {
    marginTop: 16,
  },
  primaryButton: {
    height: 52,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0A84FF",
  },
  primaryButtonText: {
    fontFamily: brandFont,
    fontSize: 16,
    color: "#fff",
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  errorText: {
    marginTop: 10,
    fontFamily: brandFont,
    fontSize: 13,
    color: "#FF453A",
  },
  linkText: {
    marginTop: 10,
    fontFamily: brandFont,
    fontSize: 14,
    color: "#0A84FF",
  },
  subtitle: {
    marginTop: 8,
    fontFamily: brandFont,
    fontSize: 13,
    color: "#8E8E93",
  },
});

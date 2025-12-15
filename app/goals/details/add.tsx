// app/goals/details/add.tsx
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { BlurView } from "expo-blur";

import Screen from "@/components/layout/Screen";
import { useGoals } from "@/context/GoalsContext";

const brandFont = Platform.select({
  ios: "SF Pro Display",
  android: "Inter",
  default: "System",
});

function parseCurrency(input: string): number {
  if (!input) return 0;
  const normalized = input
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const n = Number(normalized);
  return isNaN(n) ? 0 : n;
}

export default function AddGoalContributionScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const { goals, updateGoal } = useGoals();

  const goal = useMemo(
    () => goals.find((g) => g.id === id),
    [goals, id]
  );

  const [amountText, setAmountText] = useState("");
  const [saving, setSaving] = useState(false);

  if (!goal) {
    return (
      <Screen style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.loadingText}>Carregando meta...</Text>
        </View>
      </Screen>
    );
  }

  const current = goal.currentAmount;
  const target = goal.targetAmount;

  async function handleSave() {
    const value = parseCurrency(amountText);

    if (!value || value <= 0) {
      console.log("Valor inválido");
      return;
    }

    try {
      setSaving(true);

      const newCurrent = current + value;

      await updateGoal(goal.id, {
        currentAmount: newCurrent,
      });

      router.back();
    } catch (err) {
      console.log("ERROR/AddGoalContributionScreen:", err);
      setSaving(false);
    }
  }

  const projected = current + parseCurrency(amountText || "0");

  return (
    <Screen style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.title}>Registrar aporte</Text>
            <Text style={styles.subtitle}>{goal.title}</Text>
          </View>

          {/* CARD RESUMO */}
          <BlurView intensity={40} tint="dark" style={styles.card}>
            <Text style={styles.label}>Acumulado atual</Text>
            <Text style={styles.value}>
              R$ {current.toFixed(2).replace(".", ",")}
            </Text>

            <Text style={[styles.label, { marginTop: 8 }]}>Meta</Text>
            <Text style={styles.valueMuted}>
              R$ {target.toFixed(2).replace(".", ",")}
            </Text>

            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width:
                      target > 0
                        ? `${Math.min(100, (current / target) * 100)}%`
                        : "0%",
                  },
                ]}
              />
            </View>
          </BlurView>

          {/* INPUT DO APORTE */}
          <BlurView intensity={40} tint="dark" style={styles.card}>
            <Text style={styles.sectionTitle}>Quanto você está aportando?</Text>

            <View style={styles.amountRow}>
              <Text style={styles.currencyPrefix}>R$</Text>
              <TextInput
                style={styles.amountInput}
                value={amountText}
                onChangeText={setAmountText}
                placeholder="0,00"
                keyboardType="numeric"
                placeholderTextColor="rgba(255,255,255,0.3)"
              />
            </View>

            <View style={styles.projectedBox}>
              <Text style={styles.projectedLabel}>Novo acumulado (estimado)</Text>
              <Text style={styles.projectedValue}>
                R$ {projected.toFixed(2).replace(".", ",")}
              </Text>
            </View>
          </BlurView>

          {/* BOTÕES */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.primaryButtonText}>
                {saving ? "Salvando..." : "Registrar aporte"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => router.back()}
            >
              <Text style={styles.secondaryButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    fontFamily: brandFont,
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },

  title: {
    fontFamily: brandFont,
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  subtitle: {
    fontFamily: brandFont,
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
    marginTop: 2,
  },

  card: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 18,
    borderRadius: 22,
    backgroundColor: "rgba(20,20,20,0.7)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  label: {
    fontFamily: brandFont,
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
  },

  value: {
    fontFamily: brandFont,
    fontSize: 22,
    marginTop: 2,
    color: "#FFFFFF",
  },

  valueMuted: {
    fontFamily: brandFont,
    fontSize: 18,
    marginTop: 2,
    color: "rgba(255,255,255,0.85)",
  },

  progressBarBg: {
    height: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
    marginTop: 10,
  },

  progressBarFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#7DDC70",
  },

  sectionTitle: {
    fontFamily: brandFont,
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 12,
  },

  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  currencyPrefix: {
    fontFamily: brandFont,
    fontSize: 18,
    color: "rgba(255,255,255,0.7)",
    marginRight: 6,
  },

  amountInput: {
    flex: 1,
    fontFamily: brandFont,
    fontSize: 24,
    color: "#FFFFFF",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.18)",
  },

  projectedBox: {
    marginTop: 10,
    padding: 10,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.03)",
  },

  projectedLabel: {
    fontFamily: brandFont,
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
  },

  projectedValue: {
    fontFamily: brandFont,
    fontSize: 16,
    color: "#FFFFFF",
    marginTop: 2,
  },

  footer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  button: {
    paddingVertical: 13,
    borderRadius: 18,
    alignItems: "center",
  },

  primaryButton: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },

  primaryButtonText: {
    fontFamily: brandFont,
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  secondaryButton: {
    marginTop: 10,
    backgroundColor: "transparent",
  },

  secondaryButtonText: {
    fontFamily: brandFont,
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
  },
});

import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Alert,
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

function parseNumber(input: string): number {
  if (!input) return 0;
  const normalized = input
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const n = Number(normalized);
  return isNaN(n) ? 0 : n;
}

export default function EditGoalScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const { goals, updateGoal, setPrimaryGoal, deleteGoal } = useGoals();

  const goal = useMemo(
    () => goals.find((g) => g.id === id),
    [goals, id]
  );

  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState(goal?.title ?? "");
  const [targetText, setTargetText] = useState(
    goal ? goal.targetAmount.toFixed(2).replace(".", ",") : ""
  );
  const [endDate, setEndDate] = useState(goal?.endDate ?? "");
  const [notes, setNotes] = useState(goal?.notes ?? "");
  const [isPrimary, setIsPrimary] = useState<boolean>(goal?.isPrimary ?? false);

  if (!goal) {
    return (
      <Screen style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.loadingText}>Carregando meta...</Text>
        </View>
      </Screen>
    );
  }

  async function handleSave() {
    try {
      setSaving(true);

      const newTarget = parseNumber(targetText);

      await updateGoal(goal.id, {
        title,
        targetAmount: newTarget > 0 ? newTarget : goal.targetAmount,
        endDate: endDate || null,
        notes,
        isPrimary,
      });

      if (isPrimary && !goal.isPrimary) {
        await setPrimaryGoal(goal.id);
      }

      router.back();
    } catch (err) {
      console.log("ERROR/EditGoalScreen:", err);
      setSaving(false);
    }
  }

  function handleDelete() {
    Alert.alert(
      "Excluir meta",
      "Essa ação é permanente. Deseja realmente excluir esta meta?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteGoal(goal.id);
              router.back();
            } catch (err) {
              console.log("ERROR/DeleteGoal:", err);
            }
          },
        },
      ]
    );
  }

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
            <Text style={styles.title}>Editar meta</Text>
            <Text style={styles.subtitle}>{goal.title}</Text>
          </View>

          {/* CARD PRINCIPAL DE EDIÇÃO */}
          <BlurView intensity={40} tint="dark" style={styles.card}>
            <Text style={styles.label}>Nome da meta</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Minha meta"
              placeholderTextColor="rgba(255,255,255,0.3)"
            />

            <Text style={[styles.label, { marginTop: 14 }]}>Valor alvo</Text>
            <View style={styles.amountRow}>
              <Text style={styles.currencyPrefix}>R$</Text>
              <TextInput
                style={styles.amountInput}
                value={targetText}
                onChangeText={setTargetText}
                keyboardType="numeric"
                placeholder="0,00"
                placeholderTextColor="rgba(255,255,255,0.3)"
              />
            </View>

            <Text style={[styles.label, { marginTop: 14 }]}>
              Data final (opcional) — formato AAAA-MM-DD
            </Text>
            <TextInput
              style={styles.input}
              value={endDate ?? ""}
              onChangeText={setEndDate}
              placeholder="2025-12-31"
              placeholderTextColor="rgba(255,255,255,0.3)"
            />

            <Text style={[styles.label, { marginTop: 14 }]}>Notas</Text>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: "top" }]}
              value={notes ?? ""}
              onChangeText={setNotes}
              placeholder="Ex: guardar 200 por mês, bônus entra na meta..."
              placeholderTextColor="rgba(255,255,255,0.3)"
              multiline
            />

            <View style={styles.primaryRow}>
              <View>
                <Text style={styles.label}>Meta principal</Text>
                <Text style={styles.primaryHint}>
                  Se ligado, essa meta aparece em destaque na tela Metas.
                </Text>
              </View>
              <Switch
                value={isPrimary}
                onValueChange={setIsPrimary}
                thumbColor={isPrimary ? "#FFFFFF" : "#888"}
                trackColor={{
                  true: "rgba(255,255,255,0.4)",
                  false: "rgba(255,255,255,0.15)",
                }}
              />
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
                {saving ? "Salvando..." : "Salvar alterações"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => router.back()}
            >
              <Text style={styles.secondaryButtonText}>Cancelar</Text>
            </TouchableOpacity>

            {/* EXCLUIR META — ÚNICA ADIÇÃO */}
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={handleDelete}
            >
              <Text style={styles.secondaryButtonText}>Excluir meta</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingText: { fontFamily: brandFont, fontSize: 14, color: "rgba(255,255,255,0.7)" },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 },
  title: { fontFamily: brandFont, fontSize: 24, fontWeight: "700", color: "#FFFFFF" },
  subtitle: { fontFamily: brandFont, fontSize: 14, color: "rgba(255,255,255,0.6)", marginTop: 2 },
  card: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 18,
    borderRadius: 22,
    backgroundColor: "rgba(20,20,20,0.7)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  label: { fontFamily: brandFont, fontSize: 12, color: "rgba(255,255,255,0.65)" },
  input: {
    marginTop: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    fontFamily: brandFont,
    fontSize: 14,
    color: "#FFFFFF",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  amountRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  currencyPrefix: { fontFamily: brandFont, fontSize: 16, color: "rgba(255,255,255,0.7)", marginRight: 6 },
  amountInput: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    fontFamily: brandFont,
    fontSize: 16,
    color: "#FFFFFF",
    paddingHorizontal: 10,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  primaryRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 18 },
  primaryHint: { fontFamily: brandFont, fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 2, maxWidth: 230 },
  footer: { paddingHorizontal: 20, paddingTop: 20 },
  button: { paddingVertical: 13, borderRadius: 18, alignItems: "center" },
  primaryButton: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  primaryButtonText: { fontFamily: brandFont, fontSize: 14, fontWeight: "600", color: "#FFFFFF" },
  secondaryButton: { marginTop: 10, backgroundColor: "transparent" },
  secondaryButtonText: { fontFamily: brandFont, fontSize: 13, color: "rgba(255,255,255,0.6)" },
});

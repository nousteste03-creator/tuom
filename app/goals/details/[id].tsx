// app/goals/details/[id].tsx

import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { useGoals } from "@/hooks/useGoals";
import { BlurView } from "expo-blur";

const brandFont = Platform.select({
  ios: "SF Pro Display",
  android: "Inter",
  default: "System",
});

export default function GoalDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const {
    goals,
    nextInstallment,
    goalProgress,
    goalRemaining,
    markInstallmentPaid,
    updateGoal,
    reload,
  } = useGoals();

  const goal = goals.find((g) => g.id === id);

  useEffect(() => {
    reload();
  }, []);

  if (!goal) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "white" }}>Carregando...</Text>
      </View>
    );
  }

  const progress = goal.progressPercent / 100;
  const remaining = goalRemaining(goal.id);
  const upcoming = nextInstallment(goal.id);

  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <View style={{ padding: 20 }}>
        <Text style={styles.title}>{goal.title}</Text>
        <Text style={styles.subtitle}>Meta pessoal</Text>
      </View>

      {/* CARD PRINCIPAL */}
      <BlurView intensity={40} tint="dark" style={styles.card}>
        <Text style={styles.label}>Acumulado</Text>
        <Text style={styles.value}>R$ {goal.currentAmount.toFixed(2)}</Text>

        <Text style={styles.label}>Meta</Text>
        <Text style={styles.valueMuted}>
          R$ {goal.targetAmount.toFixed(2)}
        </Text>

        {/* Barra */}
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${goal.progressPercent}%` }]} />
        </View>

        <View style={styles.rowSpace}>
          <Text style={styles.percent}>{Math.round(goal.progressPercent)}%</Text>
          <Text style={styles.info}>Sem prazo definido</Text>
        </View>

        {/* Próxima parcela (se houver) */}
        {upcoming && (
          <View style={{ marginTop: 10 }}>
            <Text style={styles.label}>Próxima contribuição</Text>
            <Text style={styles.valueMuted}>R$ {upcoming.toFixed(2)}</Text>
          </View>
        )}

        {/* Ações */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              router.push(`/goals/details/edit?id=${goal.id}`)
            }
          >
            <Text style={styles.actionText}>Editar meta</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              router.push(`/goals/details/add?id=${goal.id}`)
            }
          >
            <Text style={styles.actionText}>Registrar aporte</Text>
          </TouchableOpacity>
        </View>
      </BlurView>

      {/* HISTÓRICO (placeholder) */}
      <View style={{ padding: 20 }}>
        <Text style={styles.sectionTitle}>Histórico</Text>
        <Text style={styles.placeholder}>
          Aqui virá o histórico de contribuições, parcelas e registros.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  title: {
    fontFamily: brandFont,
    fontSize: 26,
    fontWeight: "700",
    color: "white",
  },
  subtitle: {
    fontFamily: brandFont,
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
  },

  card: {
    margin: 16,
    padding: 20,
    borderRadius: 20,
    backgroundColor: "rgba(20,20,20,0.6)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },

  label: {
    fontFamily: brandFont,
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
  },

  value: {
    fontFamily: brandFont,
    color: "white",
    fontSize: 22,
    marginBottom: 12,
  },

  valueMuted: {
    fontFamily: brandFont,
    color: "rgba(255,255,255,0.8)",
    fontSize: 18,
    marginBottom: 12,
  },

  progressBarBg: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 4,
    overflow: "hidden",
    marginTop: 4,
    marginBottom: 6,
  },

  progressBarFill: {
    height: "100%",
    backgroundColor: "#7ddc70",
    borderRadius: 4,
  },

  rowSpace: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  percent: {
    color: "white",
    fontFamily: brandFont,
    fontSize: 14,
  },

  info: {
    color: "rgba(255,255,255,0.6)",
    fontFamily: brandFont,
    fontSize: 12,
  },

  actionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },

  actionButton: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },

  actionText: {
    color: "white",
    fontFamily: brandFont,
    fontSize: 13,
    fontWeight: "600",
  },

  sectionTitle: {
    color: "white",
    fontFamily: brandFont,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },

  placeholder: {
    color: "rgba(255,255,255,0.5)",
    fontFamily: brandFont,
  },
});

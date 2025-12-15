// app/goals/details/debt-settle.tsx

import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

import Screen from "@/components/layout/Screen";
import GoalDebtMainCard from "@/components/app/goals/GoalDebtMainCard";
import GoalInstallmentsTimeline from "@/components/app/goals/GoalInstallmentsTimeline";

import { useGoals } from "@/context/GoalsContext";

const brandFont = Platform.select({
  ios: "SF Pro Display",
  android: "Inter",
  default: "System",
});

/* ------------------------------------------------------------
   Helpers
------------------------------------------------------------ */
function formatCurrency(v: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(v);
}

export default function DebtSettleScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const id = params?.id ?? null;

  const { debts, updateGoal, updateInstallment, reload, loading } = useGoals();
  const [saving, setSaving] = useState(false);

  /* ------------------------------------------------------------
     Buscar dívida
  ------------------------------------------------------------ */
  const debt = useMemo(() => {
    return id ? debts.find((d) => d.id === id) ?? null : null;
  }, [id, debts]);

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

  const remaining = Math.max(debt.targetAmount - debt.currentAmount, 0);
  const installmentsAll = debt.installments ?? [];
  const hasInstallments = installmentsAll.length > 0;

  /* ------------------------------------------------------------
     QUITAR A DÍVIDA
  ------------------------------------------------------------ */
  const handleSettle = async () => {
    try {
      setSaving(true);

      // 1) Atualizar valor total pago
      await updateGoal(debt.id, {
        currentAmount: debt.targetAmount,
      });

      // 2) Marcar todas parcelas como pagas
      for (const inst of installmentsAll) {
        if (inst.status !== "paid") {
          await updateInstallment(inst.id, {
            status: "paid",
          });
        }
      }

      await reload();
      router.back();
    } catch (err) {
      console.log("ERROR/settle:", err);
    } finally {
      setSaving(false);
    }
  };

  /* ------------------------------------------------------------
     UI
  ------------------------------------------------------------ */
  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* HEADER */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>

          <Text style={styles.titleHeader}>Quitar Dívida</Text>

          <View style={{ width: 32 }} />
        </View>

        {/* CARD PRINCIPAL PREMIUM */}
        <GoalDebtMainCard debt={debt} showSettleButton={false} />

        {/* TIMELINE DE PARCELAS (pagas e futuras) */}
        {hasInstallments && (
          <View style={styles.timelineSection}>
            <Text style={styles.sectionTitle}>Parcelas</Text>
            <GoalInstallmentsTimeline installments={installmentsAll} />
          </View>
        )}

        {/* BLOCO DE RESUMO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo</Text>

          <View style={styles.card}>
            <Text style={styles.label}>Total da dívida</Text>
            <Text style={styles.value}>{formatCurrency(debt.targetAmount)}</Text>

            <Text style={[styles.label, { marginTop: 12 }]}>Já pago</Text>
            <Text style={styles.value}>{formatCurrency(debt.currentAmount)}</Text>

            <Text style={[styles.label, { marginTop: 12 }]}>Restante</Text>
            <Text style={styles.valueRemaining}>
              {formatCurrency(remaining)}
            </Text>
          </View>

          {/* BOTÃO QUITAR */}
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={handleSettle}
            disabled={saving || remaining <= 0}
          >
            <Text style={styles.primaryText}>
              {remaining <= 0
                ? "Dívida já quitada"
                : saving
                ? "Processando..."
                : "Quitar dívida agora"}
            </Text>
          </TouchableOpacity>

          {/* CANCELAR */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginTop: 18, alignSelf: "center" }}
          >
            <Text style={styles.cancel}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Screen>
  );
}

/* =============================================================
   Styles
============================================================= */
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
    justifyContent: "space-between",
    alignItems: "center",
  },

  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  backIcon: {
    color: "#fff",
    fontSize: 28,
    marginTop: -4,
  },

  titleHeader: {
    fontFamily: brandFont,
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
  },

  timelineSection: {
    marginTop: 10,
    paddingHorizontal: 18,
  },

  section: {
    marginTop: 28,
    paddingHorizontal: 18,
  },

  sectionTitle: {
    fontFamily: brandFont,
    fontSize: 17,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 12,
  },

  card: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },

  label: {
    fontFamily: brandFont,
    color: "rgba(255,255,255,0.55)",
    fontSize: 13,
  },

  value: {
    fontFamily: brandFont,
    color: "#fff",
    fontSize: 18,
    marginTop: 4,
  },

  valueRemaining: {
    fontFamily: brandFont,
    color: "#FF7A7A",
    fontSize: 20,
    fontWeight: "600",
    marginTop: 4,
  },

  primaryBtn: {
    backgroundColor: "#d8ecee",
    paddingVertical: 15,
    borderRadius: 14,
    marginTop: 10,
  },

  primaryText: {
    fontFamily: brandFont,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "700",
    color: "#6A6A99",
  },

  cancel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
  },
});

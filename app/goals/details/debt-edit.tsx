// app/goals/details/debt-edit.tsx

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

import Screen from "@/components/layout/Screen";
import GoalDebtMainCard from "@/components/app/goals/GoalDebtMainCard";
import { useGoals } from "@/hooks/useGoals";

const brandFont = Platform.select({
  ios: "SF Pro Display",
  android: "Inter",
  default: "System",
});

/* =====================================================================
   EDITAR DÍVIDA — Tela Premium Oficial
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

  /* ------------------------------------------------------------------
     Carregar valores iniciais
  ------------------------------------------------------------------ */
  useEffect(() => {
    if (debt) {
      setTitle(debt.title);
      setTotal(String(debt.targetAmount));
      setPaid(String(debt.currentAmount));
      setDebtStyle(debt.debtStyle ?? "loan");
    }
  }, [debt]);

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
     Validar e salvar
  ------------------------------------------------------------------ */
  const handleSave = async () => {
    const totalValue = Number(total.replace(",", ".")) || 0;
    const paidValue = Number(paid.replace(",", ".")) || 0;

    const payload = {
      title,
      targetAmount: totalValue,
      currentAmount: paidValue,
      debtStyle,
    };

    await updateGoal(debt.id, payload);
    await reload();

    router.back();
  };

  /* ------------------------------------------------------------------
     UI PREMIUM
  ------------------------------------------------------------------ */
  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* HEADER */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>

          <Text style={styles.titleHeader}>Editar Dívida</Text>

          <View style={{ width: 32 }} />
        </View>

        {/* HERO CARD PREMIUM */}
        <GoalDebtMainCard debt={debt} showSettleButton={false} />

        {/* FORMULÁRIO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações da dívida</Text>

          {/* Nome */}
          <View style={styles.card}>
            <Text style={styles.label}>Nome</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Ex: Empréstimo Banco Inter"
              placeholderTextColor="rgba(255,255,255,0.35)"
              style={styles.input}
            />
          </View>

          {/* Total */}
          <View style={styles.card}>
            <Text style={styles.label}>Valor total</Text>
            <TextInput
              value={total}
              onChangeText={setTotal}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="rgba(255,255,255,0.35)"
              style={styles.input}
            />
          </View>

          {/* Pago */}
          <View style={styles.card}>
            <Text style={styles.label}>Já pago</Text>
            <TextInput
              value={paid}
              onChangeText={setPaid}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="rgba(255,255,255,0.35)"
              style={styles.input}
            />
          </View>

          {/* Estilo da dívida */}
          <View style={styles.card}>
            <Text style={styles.label}>Tipo da dívida</Text>

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
                    setDebtStyle(opt.key as "loan" | "credit_card" | "financing")
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

          {/* SALVAR */}
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Salvar alterações</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Screen>
  );
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

  section: {
    marginTop: 26,
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
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  label: {
    fontFamily: brandFont,
    color: "rgba(255,255,255,0.55)",
    fontSize: 13,
    marginBottom: 6,
  },

  input: {
    fontFamily: brandFont,
    color: "#fff",
    fontSize: 16,
    paddingVertical: 4,
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
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },

  typeBtnActive: {
    backgroundColor: "rgba(255,255,255,0.16)",
    borderColor: "rgba(255,255,255,0.3)",
  },

  typeText: {
    fontFamily: brandFont,
    color: "rgba(255,255,255,0.55)",
  },

  typeTextActive: {
    color: "#fff",
    fontWeight: "600",
  },

  saveBtn: {
    marginTop: 10,
    backgroundColor: "#d8ecee",
    paddingVertical: 15,
    borderRadius: 14,
  },

  saveBtnText: {
    fontFamily: brandFont,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "700",
    color: "#6A6A99",
  },
});

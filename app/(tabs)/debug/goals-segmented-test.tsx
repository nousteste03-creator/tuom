import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { useGoals } from "@/hooks/useGoals";

export default function TestCreateDebtManualScreen() {
  const {
    createGoal,
    reload,
    debts,
    installmentsByGoal,
    goals,
  } = useGoals();

  /* ============================================================
     Função: criar dívida com log completo
  ============================================================ */
  const handleCreateDebt = async () => {
    console.log("==============================================");
    console.log("TESTE → Criar Dívida (Manual)");
    console.log("==============================================");

    const payload = {
      type: "debt",
      title: "Teste Dívida Manual",
      targetAmount: 1200,
      currentAmount: 200,
      debtStyle: "loan",
      startDate: new Date().toISOString(),

      // CAMPOS PARA GERAR PARCELAS
      installmentsCount: 4,
      installmentAmount: 250,
      firstDueDate: "2025-01-10",
    };

    console.log("ENVIO PARA createGoal():", payload);

    let goalId = null;

    try {
      goalId = await createGoal(payload);
      console.log("RETORNO createGoal():", goalId);
    } catch (err) {
      console.log("ERRO AO CHAMAR createGoal():", err);
    }

    if (!goalId) {
      console.log("❌ ERRO: goalId voltou NULL — dívida NÃO foi criada");
      return;
    }

    console.log("✔ meta criada com sucesso:", goalId);

    await reload();

    console.log("================================================");
    console.log("DEBT LIST APÓS CRIAÇÃO:", debts);
    console.log("================================================");

    const inst = installmentsByGoal(goalId);
    console.log("PARCELAS GERADAS:", inst);
  };

  /* ============================================================
     UI para visualizar resultados
  ============================================================ */
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.title}>TESTE: Criar Dívida Manual (com logs)</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={handleCreateDebt}
      >
        <Text style={styles.buttonText}>CRIAR DÍVIDA TESTE</Text>
      </TouchableOpacity>

      <Text style={styles.section}>Total de metas: {goals.length}</Text>
      <Text style={styles.section}>Total de dívidas: {debts.length}</Text>

      {debts.map((d) => (
        <View key={d.id} style={styles.card}>
          <Text style={styles.cardTitle}>{d.title}</Text>
          <Text style={styles.item}>ID: {d.id}</Text>
          <Text style={styles.item}>Total: {d.targetAmount}</Text>
          <Text style={styles.item}>Pago: {d.currentAmount}</Text>
          <Text style={styles.item}>Tipo: {d.debtStyle}</Text>

          <Text style={styles.subTitle}>Parcelas:</Text>
          {installmentsByGoal(d.id).map((i) => (
            <Text key={i.id} style={styles.item}>
              Parcela {i.sequence} — R${i.amount} — {i.dueDate}
            </Text>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#000", flex: 1 },
  title: { color: "white", fontSize: 20, fontWeight: "700", marginBottom: 20 },
  button: {
    backgroundColor: "#d8ecee",
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 20,
  },
  buttonText: {
    color: "#333",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 16,
  },
  section: { color: "white", fontSize: 16, marginTop: 10 },
  card: {
    backgroundColor: "rgba(255,255,255,0.06)",
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
  },
  cardTitle: { color: "white", fontSize: 18, fontWeight: "600" },
  item: { color: "rgba(255,255,255,0.8)", fontSize: 14 },
  subTitle: {
    marginTop: 10,
    marginBottom: 4,
    color: "rgba(255,255,255,0.6)",
  },
});

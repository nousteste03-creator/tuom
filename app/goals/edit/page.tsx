// app/goals/edit/page.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  TextInput,
  Alert,
  Animated,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { BlurView } from "expo-blur";

import Screen from "@/components/layout/Screen";
import Icon from "@/components/ui/Icon";

import { useGoals } from "@/hooks/useGoals";
import { useIncomeSources } from "@/hooks/useIncomeSources";

const brandFont = Platform.select({
  ios: "SF Pro Display",
  android: "Inter",
  default: "System",
});

export default function EditGoalScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const goalId = params.id as string | undefined;

  /* =============== LOGS ESSENCIAIS PARA DEBUG ================== */
  console.log("DEBUG EDIT → PARAMS:", params);
  console.log("DEBUG EDIT → goalId:", goalId);

  const { goals, debts, investments, updateGoal, deleteGoal } = useGoals();
  const { incomeSources, updateIncomeSource, deleteIncomeSource } =
    useIncomeSources();

  /* LOGS para confirmar dados carregados */
  console.log("DEBUG EDIT → goals:", goals);
  console.log("DEBUG EDIT → debts:", debts);
  console.log("DEBUG EDIT → investments:", investments);
  console.log("DEBUG EDIT → incomeSources:", incomeSources);

  /* -------------------------------------------------------
     Localizar o item
  ------------------------------------------------------- */
  const allItems = useMemo(
    () => [
      ...(goals ?? []),
      ...(debts ?? []),
      ...(investments ?? []),
      ...(incomeSources ?? []),
    ],
    [goals, debts, investments, incomeSources]
  );

  /* LOG do conjunto completo */
  console.log("DEBUG EDIT → allItems:", allItems);

  const item = allItems.find((i) => i.id === goalId);

  /* LOG do item encontrado */
  console.log("DEBUG EDIT → found item:", item);

  /* -------------------------------------------------------
     Estados locais FIXOS (nunca condicionais)
  ------------------------------------------------------- */
  const [title, setTitle] = useState("");
  const [current, setCurrent] = useState("");
  const [target, setTarget] = useState("");
  const [monthly, setMonthly] = useState("");
  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    if (!item) return;

    setTitle((item as any).title ?? "");

    if ("currentAmount" in item) {
      setCurrent(String((item as any).currentAmount ?? ""));
    } else if ("amount" in item) {
      setCurrent(String((item as any).amount ?? ""));
    } else {
      setCurrent("");
    }

    if ("targetAmount" in item) {
      setTarget(String((item as any).targetAmount ?? ""));
    } else {
      setTarget("");
    }

    if ("suggestedMonthly" in item) {
      setMonthly(String((item as any).suggestedMonthly ?? ""));
    } else {
      setMonthly("");
    }

    if ("remainingAmount" in item) {
      setRemaining(String((item as any).remainingAmount ?? ""));
    } else {
      setRemaining("");
    }
  }, [item]);

  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 280,
      useNativeDriver: true,
    }).start();
  }, []);

  const isDebt = item?.type === "debt";
  const isInvestment = item?.type === "investment";
  const isIncome = !!item && "frequency" in item;

  /* -------------------------------------------------------
     Salvar alterações
  ------------------------------------------------------- */
  const handleSave = async () => {
    if (!item) {
      Alert.alert("Erro", "Meta não encontrada.");
      return;
    }

    try {
      if (isIncome) {
        await updateIncomeSource(item.id, {
          name: title,
          amount: Number(current),
        });
      } else {
        await updateGoal(item.id, {
          title,
          current_amount: Number(current),
          target_amount: Number(target),
          suggestedMonthly: Number(monthly),
          remainingAmount: Number(remaining),
        });
      }

      router.back();
    } catch {
      Alert.alert("Erro", "Não foi possível salvar as alterações.");
    }
  };

  /* -------------------------------------------------------
     Excluir
  ------------------------------------------------------- */
  const handleDelete = () => {
    if (!item) {
      Alert.alert("Erro", "Meta não encontrada.");
      return;
    }

    Alert.alert(
      "Excluir",
      "Deseja realmente excluir? Essa ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              if (isIncome) {
                await deleteIncomeSource(item.id);
              } else {
                await deleteGoal(item.id);
              }
              router.back();
            } catch {
              Alert.alert("Erro", "Não foi possível excluir.");
            }
          },
        },
      ]
    );
  };

  /* -------------------------------------------------------
     Renderização quando não acha item
  ------------------------------------------------------- */
  if (!item) {
    return (
      <Screen>
        <View style={styles.center}>
          <Text style={styles.error}>Meta não encontrada.</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.linkText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </Screen>
    );
  }

  /* -------------------------------------------------------
     RENDER COMPLETO
  ------------------------------------------------------- */
  return (
    <Screen>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerBtn}
        >
          <Icon name="chevron-left" size={18} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {isIncome
            ? "Editar Receita"
            : isDebt
            ? "Editar Dívida"
            : isInvestment
            ? "Editar Investimento"
            : "Editar Meta"}
        </Text>

        <View style={{ width: 32 }} />
      </View>

      <Animated.View style={{ flex: 1, opacity: fade }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        >
          <BlurView intensity={40} tint="dark" style={styles.card}>
            <Text style={styles.label}>Título</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              style={styles.input}
              placeholder="Nome da meta"
            />

            {"currentAmount" in item || isIncome ? (
              <>
                <Text style={styles.label}>
                  {isIncome ? "Valor mensal" : "Acumulado"}
                </Text>
                <TextInput
                  value={current}
                  onChangeText={setCurrent}
                  keyboardType="numeric"
                  style={styles.input}
                />
              </>
            ) : null}

            {"targetAmount" in item && (
              <>
                <Text style={styles.label}>Meta</Text>
                <TextInput
                  value={target}
                  onChangeText={setTarget}
                  keyboardType="numeric"
                  style={styles.input}
                />
              </>
            )}

            {isInvestment && (
              <>
                <Text style={styles.label}>Aporte mensal</Text>
                <TextInput
                  value={monthly}
                  onChangeText={setMonthly}
                  keyboardType="numeric"
                  style={styles.input}
                />
              </>
            )}

            {isDebt && (
              <>
                <Text style={styles.label}>Restante</Text>
                <TextInput
                  value={remaining}
                  onChangeText={setRemaining}
                  keyboardType="numeric"
                  style={styles.input}
                />
              </>
            )}
          </BlurView>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Salvar alterações</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Text style={styles.deleteBtnText}>Excluir</Text>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    </Screen>
  );
}

/* Styles (inalterados) */
const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
    alignItems: "center",
  },
  headerBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontFamily: brandFont,
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  card: {
    padding: 18,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: 20,
  },
  label: {
    fontFamily: brandFont,
    fontSize: 13,
    color: "rgba(255,255,255,0.65)",
    marginTop: 10,
    marginBottom: 4,
  },
  input: {
    fontFamily: brandFont,
    fontSize: 15,
    color: "#ffffff",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  saveBtn: {
    marginTop: 4,
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
  },
  saveBtnText: {
    fontFamily: brandFont,
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },
  deleteBtn: {
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: "rgba(255,0,0,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,0,0,0.35)",
    alignItems: "center",
  },
  deleteBtnText: {
    fontFamily: brandFont,
    fontSize: 14,
    fontWeight: "600",
    color: "#ff6060",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  error: {
    fontFamily: brandFont,
    color: "#ffffff",
    fontSize: 15,
    marginBottom: 8,
  },
  linkText: {
    fontFamily: brandFont,
    fontSize: 13,
    color: "#87b4c7ff",
    fontWeight: "500",
  },
});

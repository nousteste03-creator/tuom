import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

import { useIncomeSources } from "@/hooks/useIncomeSources";
import { useUserPlan } from "@/hooks/useUserPlan";
import { useRouter } from "expo-router";

const brandFont = Platform.select({
  ios: "SF Pro Display",
  android: "Inter",
  default: "System",
});

export default function GoalsIncomeBlock() {
  const router = useRouter();
  const { isPro } = useUserPlan();

  const {
    incomeSources,
    totalMonthlyIncome,
    nextIncomeEvent,
  } = useIncomeSources();

  const currency = (v: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    }).format(v);

  return (
    <BlurView intensity={30} tint="dark" style={styles.card}>
      {/* TÍTULO */}
      <Text style={styles.title}>Receitas previstas</Text>

      {/* TOTAL MENSAL */}
      <View style={styles.monthlyRow}>
        <Text style={styles.label}>Projeção mensal</Text>
        <Text style={styles.value}>{currency(totalMonthlyIncome)}</Text>
      </View>

      {/* PRÓXIMO RECEBIMENTO */}
      <View style={styles.nextBlock}>
        <Text style={styles.subLabel}>Próximo recebimento</Text>

        {nextIncomeEvent ? (
          <Text style={styles.nextValue}>
            {nextIncomeEvent.name} • {currency(nextIncomeEvent.amount)}  
            {"  "}|{"  "}
            {new Date(nextIncomeEvent.date).toLocaleDateString("pt-BR")}
          </Text>
        ) : (
          <Text style={styles.nextMuted}>Nenhum recebimento previsto</Text>
        )}
      </View>

      {/* LISTA DE RECEITAS */}
      {isPro ? (
        <View style={{ marginTop: 12 }}>
          {incomeSources.slice(0, 4).map((src) => (
            <View key={src.id} style={styles.itemRow}>
              <View style={styles.bullet} />
              <Text style={styles.itemText}>
                {src.name} — {currency(src.amount)}
              </Text>
            </View>
          ))}

          {incomeSources.length === 0 && (
            <Text style={styles.nextMuted}>
              Nenhuma receita cadastrada.
            </Text>
          )}
        </View>
      ) : (
        <View style={{ marginTop: 10 }}>
          <Text style={styles.locked}>
            Lista detalhada disponível no plano PRO.
          </Text>
        </View>
      )}

      {/* BOTÃO */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => router.push("/goals/create?type=income")}
      >
        <LinearGradient
          colors={["#d8eceeff", "#636594ff"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Gerenciar Receitas</Text>
        </LinearGradient>
      </TouchableOpacity>
    </BlurView>
  );
}

/* ============================================================
   STYLES — Premium Apple Glass
============================================================ */

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 26,
    backgroundColor: "rgba(20,20,20,0.55)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },

  title: {
    fontFamily: brandFont,
    fontSize: 17,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 12,
  },

  monthlyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  label: {
    fontFamily: brandFont,
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
  },

  value: {
    fontFamily: brandFont,
    fontSize: 16,
    color: "#FFFFFF",
  },

  nextBlock: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
  },

  subLabel: {
    fontFamily: brandFont,
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    marginBottom: 4,
  },

  nextValue: {
    fontFamily: brandFont,
    fontSize: 13,
    color: "#FFFFFF",
    lineHeight: 18,
  },

  nextMuted: {
    fontFamily: brandFont,
    fontSize: 12,
    color: "rgba(255,255,255,0.45)",
  },

  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },

  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#8A8FFF",
    marginRight: 8,
  },

  itemText: {
    fontFamily: brandFont,
    fontSize: 13,
    color: "#FFFFFF",
  },

  locked: {
    fontFamily: brandFont,
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
  },

  button: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
  },

  buttonText: {
    fontFamily: brandFont,
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

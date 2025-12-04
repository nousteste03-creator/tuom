import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";

const brandFont = "SF Pro Display";

type DebtItem = {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  progressPercent: number; // 0–100
};

type GoalsDebtListProps = {
  debts: DebtItem[];
  onPress?: (id: string) => void;
};

export default function GoalsDebtList({ debts, onPress }: GoalsDebtListProps) {

  if (!debts || debts.length === 0) {
    return (
      <View style={{ paddingHorizontal: 16, marginTop: 10 }}>
        <BlurView intensity={20} tint="dark" style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Nenhuma dívida cadastrada</Text>
          <Text style={styles.emptyText}>
            Comece adicionando uma dívida para acompanhar parcelas e progresso.
          </Text>
        </BlurView>
      </View>
    );
  }

  return (
    <View style={{ paddingHorizontal: 16 }}>
      {debts.map((d) => (
        <TouchableOpacity
          key={d.id}
          activeOpacity={0.8}
          onPress={() => onPress?.(d.id)}
          style={{ marginBottom: 14 }}
        >
          <BlurView intensity={28} tint="dark" style={styles.card}>
            <Text style={styles.title}>{d.title}</Text>

            <Text style={styles.amount}>
              R$ {d.currentAmount.toFixed(2)}{" "}
              <Text style={styles.subAmount}>/ R$ {d.targetAmount.toFixed(2)}</Text>
            </Text>

            {/* Barra de progresso fina */}
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${d.progressPercent}%` },
                ]}
              />
            </View>
          </BlurView>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  title: {
    fontFamily: brandFont,
    fontSize: 16,
    color: "white",
    fontWeight: "600",
    marginBottom: 6,
  },

  amount: {
    fontFamily: brandFont,
    fontSize: 15,
    color: "white",
    marginBottom: 8,
  },

  subAmount: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 13,
  },

  progressTrack: {
    width: "100%",
    height: 6,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.12)",
    overflow: "hidden",
  },

  progressFill: {
    height: 6,
    backgroundColor: "#E74C3C",
  },

  /* Empty */
  emptyCard: {
    padding: 22,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
  },

  emptyTitle: {
    fontFamily: brandFont,
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginBottom: 4,
  },

  emptyText: {
    fontFamily: brandFont,
    fontSize: 13,
    textAlign: "center",
    color: "rgba(255,255,255,0.55)",
  },
});

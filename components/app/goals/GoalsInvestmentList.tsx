import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";

const brandFont = "SF Pro Display";

type InvestmentItem = {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  progressPercent: number; // 0–100
};

type GoalsInvestmentListProps = {
  investments: InvestmentItem[];
  isPro: boolean;
  onPress?: (id: string) => void;
  onPressUpgrade?: () => void;
};

export default function GoalsInvestmentList({
  investments,
  isPro,
  onPress,
  onPressUpgrade,
}: GoalsInvestmentListProps) {
  /* ===============================
     PAYWALL — FREE USER
  ================================= */
  if (!isPro) {
    return (
      <View style={{ paddingHorizontal: 16 }}>
        <BlurView intensity={25} tint="dark" style={styles.lockedCard}>
          <Text style={styles.lockedTitle}>Módulo Premium</Text>
          <Text style={styles.lockedSubtitle}>
            Acompanhe investimentos e patrimônio no plano PRO.
          </Text>

          <TouchableOpacity
            onPress={onPressUpgrade}
            style={styles.upgradeButton}
            activeOpacity={0.85}
          >
            <Text style={styles.upgradeButtonText}>Assinar PRO</Text>
          </TouchableOpacity>
        </BlurView>
      </View>
    );
  }

  /* ===============================
     LISTA REAL — USUÁRIO PRO
  ================================= */
  if (!investments || investments.length === 0) {
    return (
      <View style={{ paddingHorizontal: 16 }}>
        <BlurView intensity={20} tint="dark" style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Nenhum investimento cadastrado</Text>
          <Text style={styles.emptyText}>
            Comece adicionando uma meta de investimento.
          </Text>
        </BlurView>
      </View>
    );
  }

  return (
    <View style={{ paddingHorizontal: 16 }}>
      {investments.map((inv) => (
        <TouchableOpacity
          key={inv.id}
          activeOpacity={0.8}
          onPress={() => onPress?.(inv.id)}
          style={{ marginBottom: 14 }}
        >
          <BlurView intensity={28} tint="dark" style={styles.card}>
            <Text style={styles.title}>{inv.title}</Text>

            <Text style={styles.amount}>
              R$ {inv.currentAmount.toFixed(2)}{" "}
              <Text style={styles.subAmount}>
                / R$ {inv.targetAmount.toFixed(2)}
              </Text>
            </Text>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${inv.progressPercent}%` },
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
  /* ===== Cards ===== */

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
    backgroundColor: "#cff6c8ff",
  },

  /* ===== Empty ===== */

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

  /* ===== Paywall ===== */

  lockedCard: {
    padding: 26,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    alignItems: "center",
  },

  lockedTitle: {
    fontFamily: brandFont,
    fontSize: 17,
    fontWeight: "700",
    color: "white",
    marginBottom: 6,
  },

  lockedSubtitle: {
    fontFamily: brandFont,
    fontSize: 13,
    color: "rgba(255,255,255,0.55)",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 14,
  },

  upgradeButton: {
    backgroundColor: "#d8eceeff",
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 14,
  },

  upgradeButtonText: {
    fontFamily: brandFont,
    fontSize: 14,
    color: "d8eceeff",
    fontWeight: "600",
  },
});

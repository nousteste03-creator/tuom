// components/app/goals/GoalsDebtList.tsx
import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { BlurView } from "expo-blur";

const brandFont = Platform.select({
  ios: "SF Pro Display",
  android: "Inter",
  default: "System",
});

type DebtItem = {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  progressPercent: number;
};

type GoalsDebtListProps = {
  debts: DebtItem[];
  onPress?: (id: string) => void;
};

function formatCurrency(v: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(v || 0);
}

export default function GoalsDebtList({ debts, onPress }: GoalsDebtListProps) {
  if (!debts || debts.length === 0) {
    return (
      <View style={{ paddingHorizontal: 16, marginTop: 10 }}>
        <BlurView intensity={22} tint="dark" style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Nenhuma dívida cadastrada</Text>
          <Text style={styles.emptyText}>
            Adicione uma dívida para acompanhar parcelas e pagamentos.
          </Text>
        </BlurView>
      </View>
    );
  }

  return (
    <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
      {debts.map((d) => {
        const progress = Math.min(100, Math.max(0, d.progressPercent || 0));
        const remaining = Math.max(d.targetAmount - d.currentAmount, 0);
        const isNearFinish = d.targetAmount > 0 && remaining / d.targetAmount <= 0.2;

        return (
          <TouchableOpacity
            key={d.id}
            activeOpacity={0.85}
            onPress={() => onPress?.(d.id)}
            style={{ marginBottom: 14 }}
          >
            <BlurView intensity={30} tint="dark" style={styles.card}>
              <View style={styles.row}>
                <View style={styles.iconBadge}>
                  <Text style={styles.iconText}>
                    {d.title.charAt(0).toUpperCase()}
                  </Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.title} numberOfLines={1}>
                    {d.title}
                  </Text>

                  <Text style={styles.amountRow}>
                    {formatCurrency(d.currentAmount)}{" "}
                    <Text style={styles.subAmount}>/ {formatCurrency(d.targetAmount)}</Text>
                  </Text>

                  <Text style={styles.remainingText}>
                    Restante • {formatCurrency(remaining)}
                  </Text>

                  {/* Barra premium */}
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${progress}%`,
                          backgroundColor: isNearFinish ? "#FF7A7A" : "#f09191ff",
                        },
                      ]}
                    />
                  </View>
                </View>

                <Text style={styles.chevron}>›</Text>
              </View>

              {isNearFinish && (
                <Text style={styles.nearFinish}>
                  Quase quitada — falta pouco!
                </Text>
              )}
            </BlurView>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

/* ============================================================
   STYLES — Premium Apple/Glass NÖUS
============================================================ */
const styles = StyleSheet.create({
  card: {
    padding: 18,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(138,143,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  iconText: {
    fontFamily: brandFont,
    fontSize: 16,
    color: "#FFFFFF",
  },

  title: {
    fontFamily: brandFont,
    fontSize: 15,
    color: "#FFFFFF",
    fontWeight: "600",
  },

  amountRow: {
    fontFamily: brandFont,
    fontSize: 14,
    color: "#FFFFFF",
    marginTop: 3,
  },

  subAmount: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 13,
  },

  remainingText: {
    fontFamily: brandFont,
    fontSize: 12,
    marginTop: 2,
    color: "rgba(255,255,255,0.55)",
  },

  progressTrack: {
    width: "100%",
    height: 7,
    marginTop: 8,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.10)",
  },

  progressFill: {
    height: 7,
    borderRadius: 999,
  },

  chevron: {
    fontSize: 26,
    color: "rgba(255,255,255,0.45)",
    marginLeft: 8,
  },

  nearFinish: {
    marginTop: 10,
    fontFamily: brandFont,
    fontSize: 12,
    color: "#FF7A7A",
  },

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

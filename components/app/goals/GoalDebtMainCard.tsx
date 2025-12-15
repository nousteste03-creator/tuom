import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  Alert,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import type { GoalWithStats } from "@/hooks/useGoals";
import { useGoals } from "@/context/GoalsContext";

const brandFont = Platform.select({
  ios: "SF Pro Display",
  android: "Inter",
  default: "System",
});

/* -------------------------------------------------------------
   Helpers
------------------------------------------------------------- */
function formatCurrency(v: number) {
  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(v || 0);
  } catch {
    return `R$ ${Number(v || 0).toFixed(2)}`;
  }
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "--";
  const d = new Date(dateStr);
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${d.getFullYear()}`;
}

/* -------------------------------------------------------------
   Types
------------------------------------------------------------- */
type Props = {
  debt: GoalWithStats;

  onPressPay?: () => void;        // Registrar pagamento
  onPressEdit?: () => void;       // Editar dívida
  onPressSettle?: () => void;     // Quitar dívida (somente permissões)
  showSettleButton?: boolean;     // usado apenas na tela debt-pay
};

/* -------------------------------------------------------------
   Component
------------------------------------------------------------- */
export default function GoalDebtMainCard({
  debt,
  onPressPay,
  onPressEdit,
  onPressSettle,
  showSettleButton = false, // só fica true dentro de debt-pay
}: Props) {
  const { deleteGoal } = useGoals();

  const [barWidth, setBarWidth] = useState(0);
  const entry = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const progress = (debt.progressPercent || 0) / 100;

  /* animação de entrada */
  useEffect(() => {
    Animated.timing(entry, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, []);

  /* animação da barra */
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const animatedWidth =
    barWidth > 0
      ? progressAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, barWidth],
        })
      : 0;

  /* -------------------------------------------------------------
     Parcelas
  ------------------------------------------------------------- */
  const installments = debt.installments || [];
  const paidCount = installments.filter((i) => i.status === "paid").length;
  const totalCount = installments.length;

  const upcoming = installments
    .filter((i) => i.status !== "paid")
    .sort(
      (a, b) =>
        new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );

  const next = upcoming.length > 0 ? upcoming[0] : null;

  const isLate =
    next && new Date(next.dueDate).getTime() < new Date().getTime();

  /* -------------------------------------------------------------
     Quitar dívida: regras
     - Só aparece se showSettleButton === true
     - E se a dívida está >80% concluída (restante < 20%)
  ------------------------------------------------------------- */
  const remainingPercent = 100 - (debt.progressPercent || 0);
  const canSettle = showSettleButton && remainingPercent < 20;

  /* -------------------------------------------------------------
     Delete
  ------------------------------------------------------------- */
  function handleDelete() {
    Alert.alert(
      "Excluir dívida",
      "Essa ação é permanente. Deseja realmente excluir esta dívida?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteGoal(debt.id);
            } catch (err) {
              console.log("ERROR/DeleteDebt:", err);
            }
          },
        },
      ]
    );
  }

  /* -------------------------------------------------------------
     Render
  ------------------------------------------------------------- */
  return (
    <Animated.View
      style={{
        opacity: entry,
        transform: [
          {
            translateY: entry.interpolate({
              inputRange: [0, 1],
              outputRange: [16, 0],
            }),
          },
        ],
      }}
    >
      <BlurView intensity={42} tint="dark" style={styles.card}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.iconBadge}>
            <Text style={styles.iconText}>
              {debt.title.charAt(0).toUpperCase()}
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.title} numberOfLines={1}>
              {debt.title}
            </Text>
            <Text style={styles.subtitle}>Dívida</Text>
          </View>
        </View>

        {/* VALORES */}
        <View style={styles.valuesRow}>
          <View>
            <Text style={styles.label}>Pago</Text>
            <Text style={styles.valueWhite}>
              {formatCurrency(debt.currentAmount)}
            </Text>
          </View>

          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.label}>Total</Text>
            <Text style={styles.valueMuted}>
              {formatCurrency(debt.targetAmount)}
            </Text>
          </View>
        </View>

        {/* BARRA */}
        <View
          style={styles.progressWrapper}
          onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
        >
          <View style={styles.progressBg} />

          {barWidth > 0 && (
            <Animated.View
              style={{
                width: animatedWidth,
                height: 10,
                borderRadius: 999,
              }}
            >
              <LinearGradient
                colors={["#8e4242ff", "#b97272ff", "#925c5cff"]}
                locations={[0, 0.6, 1]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
          )}
        </View>

        {/* PORCENTAGEM */}
        <View style={styles.percentRow}>
          <Text style={styles.percentText}>
            {Math.round(progress * 100)}%
          </Text>
          <Text style={styles.percentInfo}>
            {paidCount}/{totalCount} parcelas
          </Text>
        </View>

        {/* PRÓXIMA PARCELA */}
        <View style={styles.nextBlock}>
          <Text style={styles.label}>Próxima parcela</Text>

          {next ? (
            <>
              <Text
                style={[
                  styles.nextValue,
                  isLate && { color: "#FF7A7A" },
                ]}
              >
                {formatCurrency(next.amount)}
              </Text>
              <Text
                style={[
                  styles.nextDate,
                  isLate && { color: "#FF7A7A" },
                ]}
              >
                vence em {formatDate(next.dueDate)}
              </Text>
            </>
          ) : (
            <Text style={styles.nextNone}>
              Todas as parcelas foram pagas
            </Text>
          )}
        </View>

        {/* AÇÕES */}
        <View style={styles.actionsRow}>
          {/* REGISTRAR PAGAMENTO */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={onPressPay}
          >
            <Text style={styles.primaryButtonText}>
              Registrar pagamento
            </Text>
          </TouchableOpacity>

          {/* EDITAR */}
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onPressEdit}
          >
            <Text style={styles.secondaryButtonText}>Editar</Text>
          </TouchableOpacity>
        </View>

        {/* EXCLUIR DÍVIDA */}
        <TouchableOpacity
          style={[styles.secondaryButton, { marginTop: 10 }]}
          onPress={handleDelete}
        >
          <Text style={styles.secondaryButtonText}>Excluir dívida</Text>
        </TouchableOpacity>

        {/* QUITAR DÍVIDA */}
        {canSettle && (
          <TouchableOpacity
            style={styles.settleButton}
            onPress={onPressSettle}
          >
            <Text style={styles.settleButtonText}>Quitar dívida</Text>
          </TouchableOpacity>
        )}
      </BlurView>
    </Animated.View>
  );
}

/* -------------------------------------------------------------
   Styles
------------------------------------------------------------- */
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

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  iconBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.13)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  iconText: {
    fontFamily: brandFont,
    fontSize: 16,
    color: "#fff",
  },

  title: {
    fontFamily: brandFont,
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },

  subtitle: {
    fontFamily: brandFont,
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
  },

  valuesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  label: {
    fontFamily: brandFont,
    fontSize: 12,
    color: "rgba(255,255,255,0.55)",
  },

  valueWhite: {
    fontFamily: brandFont,
    fontSize: 21,
    color: "#fff",
  },

  valueMuted: {
    fontFamily: brandFont,
    fontSize: 18,
    color: "rgba(255,255,255,0.7)",
  },

  progressWrapper: {
    height: 10,
    borderRadius: 999,
    marginBottom: 6,
    marginTop: 6,
    overflow: "hidden",
  },

  progressBg: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.1)",
  },

  percentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  percentText: {
    fontFamily: brandFont,
    fontSize: 13,
    color: "#fff",
  },

  percentInfo: {
    fontFamily: brandFont,
    fontSize: 12,
    color: "rgba(255,255,255,0.65)",
  },

  nextBlock: {
    marginBottom: 14,
  },

  nextValue: {
    fontFamily: brandFont,
    fontSize: 16,
    color: "#fff",
    marginTop: 4,
  },

  nextDate: {
    fontFamily: brandFont,
    fontSize: 13,
    color: "rgba(255,255,255,0.55)",
  },

  nextNone: {
    fontFamily: brandFont,
    color: "rgba(255,255,255,0.45)",
    fontSize: 14,
  },

  actionsRow: {
    flexDirection: "row",
    gap: 10,
  },

  primaryButton: {
    flex: 1.2,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
  },

  primaryButtonText: {
    fontFamily: brandFont,
    fontSize: 13,
    fontWeight: "600",
    color: "#e4dedeff",
  },

  secondaryButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
  },

  secondaryButtonText: {
    fontFamily: brandFont,
    fontSize: 13,
    color: "#e4dedeff",
  },

  settleButton: {
    marginTop: 14,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: "#f6f6f6ff",
    alignItems: "center",
  },

  settleButtonText: {
    fontFamily: brandFont,
    fontSize: 14,
    fontWeight: "700",
    color: "#1a1a1a",
  },
});

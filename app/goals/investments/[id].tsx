// app/goals/investments/[id].tsx
import React, { useMemo, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  StyleSheet,
} from "react-native";

import {
  useLocalSearchParams,
  useRouter,
  useFocusEffect,
} from "expo-router";

import Screen from "@/components/layout/Screen";
import Icon from "@/components/ui/Icon";

// INVESTIMENTO
import InvestmentMainBlock from "@/components/app/investments/InvestmentMainBlock";

// PARCELAS
import GoalInstallmentsTimeline from "@/components/app/goals/GoalInstallmentsTimeline";

// HOOKS
import { useGoals } from "@/hooks/useGoals";

/* ------------------------------------------------------------ */

const brandFont = Platform.select({
  ios: "SF Pro Display",
  android: "Inter",
  default: "System",
});

/* ------------------------------------------------------------ */

export default function InvestmentDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const investmentId = id && id !== "create" ? id : null;

  const { loading, investments, reload } = useGoals();

  /* ----------------------------------------------------------
     RELOAD AO FOCAR (PÓS-APORTE / EDIÇÃO)
  ---------------------------------------------------------- */
  useFocusEffect(
    useCallback(() => {
      if (!investmentId) return;
      reload();
    }, [investmentId, reload])
  );

  /* ----------------------------------------------------------
     LOCALIZAR INVESTIMENTO
  ---------------------------------------------------------- */
  const investment = useMemo(() => {
    if (!investmentId) return null;
    return investments.find((i) => i.id === investmentId) ?? null;
  }, [investmentId, investments]);

  const hasInstallments = (investment?.installments ?? []).length > 0;

  /* ----------------------------------------------------------
     LOADING / NOT FOUND
  ---------------------------------------------------------- */
  if (loading && !investment) {
    return (
      <Screen style={styles.center}>
        <ActivityIndicator size="large" color="#fff" />
      </Screen>
    );
  }

  if (!investment) {
    return (
      <Screen style={styles.center}>
        <Text style={styles.notFound}>Investimento não encontrado.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>
      </Screen>
    );
  }

  /* ----------------------------------------------------------
     RENDER
  ---------------------------------------------------------- */
  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        {/* HEADER */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <Icon name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.title}>{investment.title}</Text>

          <View style={{ width: 32 }} />
        </View>

        {/* INVESTIMENTO */}
        <View style={{ marginTop: 20, paddingHorizontal: 18 }}>
          <InvestmentMainBlock
            goal={investment}
            onPressAdd={() =>
              router.push(
                `/goals/investments/contribution?id=${investment.id}`
              )
            }
            onPressEdit={() =>
              router.push(`/goals/investments/edit?id=${investment.id}`)
            }
          />
        </View>

        {/* PARCELAS */}
        {hasInstallments && (
          <GoalInstallmentsTimeline installments={investment.installments} />
        )}
      </ScrollView>
    </Screen>
  );
}

/* ------------------------------------------------------------
   STYLES
------------------------------------------------------------ */

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  headerRow: {
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontFamily: brandFont,
    fontSize: 20,
    color: "#fff",
    fontWeight: "600",
  },

  notFound: {
    fontFamily: brandFont,
    fontSize: 18,
    color: "#fff",
    marginBottom: 14,
  },

  backBtn: {
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.10)",
  },

  backText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: brandFont,
  },
});

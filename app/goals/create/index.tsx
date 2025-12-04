// app/goals/create/index.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import Screen from "@/components/layout/Screen";

const brandFont = Platform.select({
  ios: "SF Pro Display",
  android: "Inter",
  default: "System",
});

type ModalType = "goal" | "debt" | "investment" | "income" | null;

export default function CreateGoalScreen() {
  const [modalType, setModalType] = useState<ModalType>(null);

  const openModal = (type: ModalType) => {
    console.log("DEBUG openModal:", type);
    setModalType(type);
  };

  return (
    <Screen edges={["top"]}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: 36,
          paddingBottom: 120,
        }}
      >
        <Text style={styles.header}>Criar Novo</Text>

        {/* CARD — META */}
        <TouchableOpacity onPress={() => openModal("goal")} activeOpacity={0.9}>
          <BlurView intensity={25} tint="dark" style={styles.card}>
            <Text style={styles.cardTitle}>Criar Meta</Text>
            <Text style={styles.cardDesc}>
              Defina um objetivo financeiro com valor alvo e prazo.
            </Text>
          </BlurView>
        </TouchableOpacity>

        {/* CARD — DÍVIDA */}
        <TouchableOpacity onPress={() => openModal("debt")} activeOpacity={0.9}>
          <BlurView intensity={25} tint="dark" style={styles.card}>
            <Text style={styles.cardTitle}>Criar Dívida</Text>
            <Text style={styles.cardDesc}>
              Registre financiamentos, cartões ou empréstimos.
            </Text>
          </BlurView>
        </TouchableOpacity>

        {/* CARD — INVESTIMENTO */}
        <TouchableOpacity
          onPress={() => openModal("investment")}
          activeOpacity={0.9}
        >
          <BlurView intensity={25} tint="dark" style={styles.card}>
            <Text style={styles.cardTitle}>Criar Investimento</Text>
            <Text style={styles.cardDesc}>
              Acompanhe aportes e evolução do seu patrimônio.
            </Text>
          </BlurView>
        </TouchableOpacity>

        {/* CARD — RECEITA */}
        <TouchableOpacity onPress={() => openModal("income")} activeOpacity={0.9}>
          <BlurView intensity={25} tint="dark" style={styles.card}>
            <Text style={styles.cardTitle}>Criar Receita</Text>
            <Text style={styles.cardDesc}>
              Adicione salário, freelance ou outras entradas.
            </Text>
          </BlurView>
        </TouchableOpacity>

        {/* Placeholder do Modal — será implementado no 8.2 */}
        {modalType && (
          <View style={styles.modalPlaceholder}>
            <Text style={styles.modalText}>
              Modal selecionado: {modalType.toUpperCase()}  
            </Text>

            <TouchableOpacity
              onPress={() => setModalType(null)}
              style={styles.closeButton}
            >
              <Text style={{ color: "#fff", fontSize: 14 }}>Fechar</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    fontFamily: brandFont,
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    marginLeft: 18,
    marginBottom: 20,
  },
  card: {
    marginHorizontal: 18,
    marginBottom: 16,
    padding: 20,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  cardTitle: {
    fontFamily: brandFont,
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  cardDesc: {
    fontFamily: brandFont,
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
  },
  modalPlaceholder: {
    marginTop: 40,
    marginHorizontal: 18,
    padding: 20,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  modalText: {
    color: "#fff",
    fontFamily: brandFont,
    fontSize: 15,
  },
  closeButton: {
    marginTop: 16,
    padding: 10,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 10,
    alignSelf: "flex-start",
  },
});

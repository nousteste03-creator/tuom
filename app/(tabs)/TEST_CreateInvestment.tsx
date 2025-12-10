import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Screen from "@/components/layout/Screen";

// IMPORTA SEU MODAL REAL
import CreateInvestmentModal from "@/app/goals/create/CreateInvestmentModal";

export default function TEST_CreateInvestmentScreen() {
  const [visible, setVisible] = useState(true);

  return (
    <Screen>
      <View style={styles.center}>
        <Text style={styles.title}>TESTE DO MODAL</Text>

        <TouchableOpacity style={styles.btn} onPress={() => setVisible(true)}>
          <Text style={styles.btnText}>Abrir Modal</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.btn, { marginTop: 10 }]} onPress={() => setVisible(false)}>
          <Text style={styles.btnText}>Fechar Modal</Text>
        </TouchableOpacity>
      </View>

      {/* MODAL FULLSCREEN */}
      <CreateInvestmentModal visible={visible} onClose={() => setVisible(false)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  title: {
    color: "white",
    fontSize: 22,
    marginBottom: 20,
  },
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 12,
  },
  btnText: {
    color: "white",
    fontSize: 16,
  },
});

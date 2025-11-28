// app/finance/credit-score.tsx
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import Screen from "@/components/layout/Screen";
import { useCreditScore } from "@/hooks/useCreditScore";

export default function CreditScoreScreen() {
  const { history, currentScore, runCheck, loading } = useCreditScore();

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 120,
          gap: 26,
        }}
      >
        <Text style={{ color: "#FFF", fontSize: 26, fontWeight: "700" }}>
          Pontuação de Crédito
        </Text>

        <View
          style={{
            padding: 18,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.08)",
            backgroundColor: "rgba(255,255,255,0.03)",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Text style={{ color: "#9CA3AF", fontSize: 13 }}>Sua pontuação atual</Text>

          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : currentScore ? (
            <Text style={{ color: "#FFF", fontSize: 32, fontWeight: "700" }}>
              {currentScore}
            </Text>
          ) : (
            <Text style={{ color: "#6B7280" }}>Nenhuma consulta ainda</Text>
          )}
        </View>

        <TouchableOpacity
          onPress={runCheck}
          style={{
            padding: 14,
            borderRadius: 999,
            backgroundColor: "#FFF",
          }}
        >
          <Text style={{ textAlign: "center", color: "#000", fontWeight: "700" }}>
            Consultar score agora
          </Text>
        </TouchableOpacity>

        <View style={{ gap: 14, marginTop: 20 }}>
          {history.map((h) => (
            <View
              key={h.id}
              style={{
                padding: 14,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.08)",
                backgroundColor: "rgba(255,255,255,0.05)",
              }}
            >
              <Text style={{ color: "#FFF" }}>{h.score}</Text>
              <Text style={{ color: "#6B7280", fontSize: 12, marginTop: 4 }}>
                {new Date(h.created_at).toLocaleString("pt-BR")}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

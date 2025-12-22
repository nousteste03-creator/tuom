// app/finance/credit-score/index.tsx
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import Screen from "@/components/layout/Screen";
import Icon from "@/components/ui/Icon";
import { useCreditScore } from "@/hooks/useCreditScore";

export default function CreditScoreScreen() {
  const router = useRouter();
  const { history, currentScore, loading, runCheck } = useCreditScore();

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 140,
          gap: 26,
        }}
      >
        {/* HEADER */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View>
            <Text style={{ color: "#9CA3AF", fontSize: 13 }}>
              Ferramentas Avançadas
            </Text>

            <Text
              style={{
                color: "#FFF",
                fontSize: 26,
                fontWeight: "700",
                marginTop: 4,
              }}
            >
              Pontuação de Crédito
            </Text>

            <Text
              style={{
                color: "#4B5563",
                fontSize: 12,
                marginTop: 4,
              }}
            >
              Acompanhe sua saúde financeira — powered by TUÖM.
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              padding: 8,
              backgroundColor: "rgba(255,255,255,0.06)",
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.10)",
            }}
          >
            <Icon name="close" color="#FFF" size={18} />
          </TouchableOpacity>
        </View>

        {/* SCORE ATUAL */}
        <BlurView
          intensity={22}
          tint="dark"
          style={{
            padding: 22,
            borderRadius: 22,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.08)",
            backgroundColor: "rgba(15,15,15,0.35)",
            alignItems: "center",
            gap: 12,
          }}
        >
          <Text
            style={{
              color: "#9CA3AF",
              fontSize: 14,
              marginBottom: 6,
            }}
          >
            Sua pontuação atual
          </Text>

          {loading ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : currentScore ? (
            <Text
              style={{
                color: "#FFF",
                fontSize: 42,
                fontWeight: "700",
                letterSpacing: 0.6,
              }}
            >
              {currentScore}
            </Text>
          ) : (
            <Text
              style={{
                color: "#6B7280",
                fontSize: 14,
              }}
            >
              Nenhuma consulta realizada
            </Text>
          )}
        </BlurView>

        {/* BOTÃO CONSULTAR */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={runCheck}
          style={{
            padding: 14,
            borderRadius: 999,
            backgroundColor: "#FFF",
            marginTop: 8,
          }}
        >
          <Text
            style={{
              textAlign: "center",
              color: "#000",
              fontWeight: "700",
              fontSize: 15,
            }}
          >
            Consultar score agora
          </Text>
        </TouchableOpacity>

        {/* HISTÓRICO */}
        <View style={{ marginTop: 20, gap: 14 }}>
          {history.length > 0 && (
            <Text
              style={{
                color: "#9CA3AF",
                fontSize: 13,
              }}
            >
              Histórico de consultas
            </Text>
          )}

          {history.length === 0 && (
            <Text
              style={{
                color: "#6B7280",
                fontSize: 13,
                marginTop: 6,
              }}
            >
              Nenhuma consulta realizada ainda.
            </Text>
          )}

          {history.map((h) => (
            <BlurView
              key={h.id}
              intensity={22}
              tint="dark"
              style={{
                padding: 16,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.08)",
                backgroundColor: "rgba(15,15,15,0.30)",
              }}
            >
              <Text
                style={{
                  color: "#FFF",
                  fontSize: 18,
                  fontWeight: "700",
                }}
              >
                {h.score}
              </Text>

              <Text
                style={{
                  color: "#6B7280",
                  fontSize: 12,
                  marginTop: 4,
                }}
              >
                {new Date(h.created_at).toLocaleString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </BlurView>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

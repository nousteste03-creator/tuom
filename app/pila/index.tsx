import { View, Text, TouchableOpacity, ScrollView, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";

const brandFont = Platform.select({
  ios: "SF Pro Display",
  default: "System",
});

// Tipografia da PILA no padrão TUÖM
const pilaFont = Platform.select({
  ios: "SF Pro Display",
  default: "System",
});

export default function PilaHome() {
  const suggestions = [
    "Explique minhas assinaturas",
    "Onde posso cortar gastos?",
    "Projete meu mês com folga",
    "Quais são meus maiores gastos?",
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#0B0B0C" }}>
      {/* HEADER com fade premium */}
      <Animated.View
        entering={FadeIn.duration(400)}
        style={{
          paddingTop: 60,
          paddingHorizontal: 20,
          paddingBottom: 12,
        }}
      >
        <Text
          style={{
            color: "#FFF",
            fontSize: 34,
            fontFamily: pilaFont ?? undefined,
            fontWeight: "600",
            letterSpacing: -0.5,
          }}
        >
          Pila
        </Text>
        <Text
          style={{
            color: "#9CA3AF",
            marginTop: 4,
            fontSize: 15,
            letterSpacing: 0.2,
          }}
        >
          Inteligência financeira da TUÖM
        </Text>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 30,
          paddingBottom: 60,
        }}
      >
        {/* HERO central com animação cinematográfica */}
        <Animated.View
          entering={FadeInUp.duration(500)}
          style={{
            alignItems: "center",
            marginBottom: 42,
          }}
        >
          <Text
            style={{
              color: "#EDEDED",
              fontSize: 28,
              lineHeight: 36,
              textAlign: "center",
              fontFamily: pilaFont ?? undefined,
              fontWeight: "500",
              letterSpacing: -0.3,
            }}
          >
            Seu dinheiro.  
            Explicado com clareza.
          </Text>

          <Text
            style={{
              marginTop: 12,
              color: "#9CA3AF",
              fontSize: 15,
              textAlign: "center",
              maxWidth: 300,
              lineHeight: 22,
            }}
          >
            Pergunte qualquer coisa sobre finanças, gastos, assinaturas ou hábitos.
          </Text>
        </Animated.View>

        {/* CHIPS refinados */}
        <View style={{ gap: 16 }}>
          {suggestions.map((s, index) => (
            <Animated.View
              key={s}
              entering={FadeInUp.delay(index * 90).duration(380)}
            >
              <BlurView
                intensity={28}
                tint="dark"
                style={{
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.07)",
                }}
              >
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() =>
                    router.push(`/pila/chat?prompt=${encodeURIComponent(s)}`)
                  }
                  style={{
                    paddingVertical: 14,
                    paddingHorizontal: 20,
                  }}
                >
                  <Text
                    style={{
                      color: "#F0F0F0",
                      fontSize: 15,
                      letterSpacing: 0.1,
                    }}
                  >
                    {s}
                  </Text>
                </TouchableOpacity>
              </BlurView>
            </Animated.View>
          ))}
        </View>

        {/* CTA principal com animação */}
        <Animated.View entering={FadeInUp.delay(380).duration(480)}>
          <TouchableOpacity
            onPress={() => router.push("/pila/chat")}
            activeOpacity={0.85}
            style={{
              marginTop: 42,
              backgroundColor: "rgba(255,255,255,0.10)",
              paddingVertical: 16,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.14)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: "#FFF",
                fontSize: 16,
                fontWeight: "600",
                fontFamily: pilaFont ?? undefined,
                letterSpacing: 0.3,
              }}
            >
              Abrir Chat com a Pila
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

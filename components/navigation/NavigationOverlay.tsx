import { View, Text, Pressable, Dimensions } from "react-native";
import { BlurView } from "expo-blur";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInUp,
  SlideOutDown,
} from "react-native-reanimated";

import { useNavigationOverlay } from "./useNavigationOverlay";
import Icon from "@/components/ui/Icon";

const { width } = Dimensions.get("window");

export default function NavigationOverlay() {
  const { isOpen, close } = useNavigationOverlay();

  if (!isOpen) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(180)}
      exiting={FadeOut.duration(180)}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 999,
      }}
    >
      {/* Fundo clicável */}
      <Pressable
        onPress={close}
        style={{
          position: "absolute",
          inset: 0,
        }}
      />

      {/* Painel */}
      <Animated.View
        entering={SlideInUp.springify().damping(18)}
        exiting={SlideOutDown.duration(180)}
        style={{
          position: "absolute",
          bottom: 24,
          alignSelf: "center",
          width: width - 32,
          borderRadius: 28,
          overflow: "hidden",
        }}
      >
        <BlurView
          intensity={30}
          tint="dark"
          style={{
            borderRadius: 28,
          }}
        >
          <View
            style={{
              padding: 24,
              backgroundColor: "rgba(0,0,0,0.55)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.08)",
              gap: 20,
            }}
          >
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 20,
                fontWeight: "600",
              }}
            >
              Navegação
            </Text>

            {/* GRID SIMPLES (placeholder) */}
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 16,
              }}
            >
              {NAV_ITEMS.map((item) => (
                <Pressable
                  key={item.label}
                  onPress={() => {
                    item.onPress();
                    close();
                  }}
                  style={{
                    width: "48%",
                    padding: 16,
                    borderRadius: 18,
                    backgroundColor: "rgba(255,255,255,0.06)",
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.08)",
                    gap: 8,
                  }}
                >
                  <Icon
                    name={item.icon}
                    size={22}
                    color="#E5E7EB"
                  />

                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontSize: 14,
                      fontWeight: "500",
                    }}
                  >
                    {item.label}
                  </Text>

                  <Text
                    style={{
                      color: "#9CA3AF",
                      fontSize: 12,
                    }}
                  >
                    {item.description}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </BlurView>
      </Animated.View>
    </Animated.View>
  );
}

/* ---------------------------------------
   ITENS (placeholder — rotas depois)
---------------------------------------- */

const NAV_ITEMS = [
  {
    label: "Home",
    description: "Visão geral",
    icon: "home",
    onPress: () => {},
  },
  {
    label: "Metas",
    description: "Objetivos financeiros",
    icon: "flag-outline",
    onPress: () => {},
  },
  {
    label: "Insights",
    description: "Análises inteligentes",
    icon: "book",
    onPress: () => {},
  },
  {
    label: "Finance",
    description: "Fluxo financeiro",
    icon: "stats-chart-outline",
    onPress: () => {},
  },
  {
    label: "PILA",
    description: "IA financeira",
    icon: "sparkles-outline",
    onPress: () => {},
  },
  {
    label: "Configurações",
    description: "Conta & preferências",
    icon: "settings-outline",
    onPress: () => {},
  },
];

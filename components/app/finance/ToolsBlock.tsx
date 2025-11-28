import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { BlurView } from "expo-blur";
import Icon from "@/components/ui/Icon";
import { useRouter } from "expo-router";

interface Props {
  isPremium: boolean;
}

export default function ToolsBlock({ isPremium }: Props) {
  const router = useRouter();

  return (
    <View
      style={{
        marginTop: 14,
        borderRadius: 24,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.07)",
      }}
    >
      <BlurView
        intensity={22}
        tint="dark"
        style={{
          padding: 18,
          backgroundColor: "rgba(15,15,15,0.45)",
        }}
      >
        {/* TÍTULO DA SEÇÃO */}
        <Text
          style={{
            color: "#FFF",
            fontSize: 16,
            fontWeight: "600",
            marginBottom: 4,
          }}
        >
          Ferramentas avançadas NÖUS
        </Text>

        <Text
          style={{
            color: "#9CA3AF",
            fontSize: 12,
            marginBottom: 20,
          }}
        >
          Recurso premium para controle financeiro completo.
        </Text>

        {/* CARDS */}
        <View style={{ gap: 16 }}>
          <ToolCard
            title="Patrimônio Líquido"
            description={
              isPremium
                ? "Acompanhe seus ativos, dívidas e evolução mensal."
                : "Veja seus ativos, dívidas e evolução no Premium."
            }
            icon="bar-chart-outline"
            locked={!isPremium}
            onPress={() => router.push("/finance/net-worth")}
          />

          <ToolCard
            title="Economia automatizada"
            description={
              isPremium
                ? "A Pila sugere valores semanais para guardar com segurança."
                : "A Pila sugere valores semanais (Premium)."
            }
            icon="sparkles-outline"
            locked={!isPremium}
            onPress={() => router.push("/finance/savings")}
          />

          <ToolCard
            title="Pontuação de crédito"
            description={
              isPremium
                ? "Acompanhe sua pontuação e receba alertas importantes."
                : "Veja sua pontuação de crédito no Premium."
            }
            icon="shield-outline"
            locked={!isPremium}
            onPress={() => router.push("/finance/credit-score")}
          />
        </View>
      </BlurView>
    </View>
  );
}

/* ---------------------------------------------------
   COMPONENTE DE CARD INDIVIDUAL
-----------------------------------------------------*/

interface CardProps {
  title: string;
  description: string;
  icon: string;
  locked?: boolean;
  onPress: () => void;
}

function ToolCard({ title, description, icon, locked, onPress }: CardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: locked
          ? "rgba(255,255,255,0.10)"
          : "rgba(255,255,255,0.18)",
        backgroundColor: "rgba(255,255,255,0.05)",
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: locked
            ? "rgba(255,255,255,0.06)"
            : "rgba(255,255,255,0.10)",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.10)",
        }}
      >
        <Icon
          name={icon}
          size={22}
          color={locked ? "#9CA3AF" : "#E5E7EB"}
        />
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: "#FFF",
            fontSize: 15,
            fontWeight: "600",
            marginBottom: 2,
          }}
        >
          {title}
        </Text>

        <Text
          style={{
            color: "#9CA3AF",
            fontSize: 12,
            lineHeight: 18,
          }}
        >
          {description}
        </Text>
      </View>

      {/* LOCK BADGE */}
      {locked && (
        <Icon
          name="lock-closed-outline"
          size={18}
          color="#9CA3AF"
        />
      )}
    </TouchableOpacity>
  );
}

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
        {/* HEADER */}
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
          Módulos completos para controle financeiro real.
        </Text>

        {/* LISTA */}
        <View style={{ gap: 16 }}>
          <ToolCard
            title="Patrimônio Líquido"
            description="Acompanhe ativos, dívidas e evolução."
            icon="bar-chart-outline"
            locked={!isPremium}
            onPress={() => router.push("/finance/net-worth")}
          />

          <ToolCard
            title="Economia Automatizada"
            description="Sugestões de economia baseadas no seu perfil."
            icon="sparkles-outline"
            locked={!isPremium}
            onPress={() => router.push("/finance/savings")}
          />

          <ToolCard
            title="Pontuação de Crédito"
            description="Veja sua pontuação e histórico."
            icon="shield-outline"
            locked={!isPremium}
            onPress={() => router.push("/finance/credit-score")}
          />

          <ToolCard
            title="Orçamento completo"
            description="Gerencie limites e gastos por categoria."
            icon="pie-chart-outline"
            locked={!isPremium}
            onPress={() => router.push("/finance/budget")}
          />
        </View>

        {/* CTA PARA UPSELL */}
        {!isPremium && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push("/premium")}
            style={{
              marginTop: 20,
              paddingVertical: 12,
              borderRadius: 999,
              backgroundColor: "#FFF",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: "#000",
                fontWeight: "700",
                fontSize: 14,
              }}
            >
              Desbloquear Ferramentas Premium
            </Text>
          </TouchableOpacity>
        )}
      </BlurView>
    </View>
  );
}

/* ---------------------------------------------------
   CARD INDIVIDUAL
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
      activeOpacity={locked ? 0.8 : 0.88}
      onPress={onPress}
      style={{
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: locked
          ? "rgba(255,255,255,0.10)"
          : "rgba(255,255,255,0.18)",
        backgroundColor: locked
          ? "rgba(255,255,255,0.04)"
          : "rgba(255,255,255,0.08)",
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        opacity: locked ? 0.55 : 1,
      }}
    >
      {/* ÍCONE */}
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: locked
            ? "rgba(255,255,255,0.06)"
            : "rgba(255,255,255,0.12)",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.12)",
        }}
      >
        <Icon name={icon} size={22} color={locked ? "#9CA3AF" : "#FFF"} />
      </View>

      {/* TEXTOS */}
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

      {/* Cadeado */}
      {locked && <Icon name="lock-closed-outline" size={18} color="#9CA3AF" />}
    </TouchableOpacity>
  );
}

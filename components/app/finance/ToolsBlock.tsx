import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { BlurView } from "expo-blur";
import Icon from "@/components/ui/Icon";
import { useRouter } from "expo-router";

export default function ToolsBlock({ isPremium }: { isPremium: boolean }) {
  const router = useRouter();

  return (
    <View
      style={{
        marginTop: 10,
        borderRadius: 28,
        overflow: "hidden",
        borderWidth: 0.4,
        borderColor: "rgba(255,255,255,0.05)",
      }}
    >
      <BlurView
        tint="dark"
        intensity={14} // Apple fino
        style={{
          padding: 22,
          backgroundColor: "rgba(0,0,0,0.72)", // preto Apple real + leve vidro
          gap: 22,
        }}
      >
        {/* ======================================================
            HEADER
        ====================================================== */}
        <Text
          style={{
            color: "#FFF",
            fontSize: 18,
            fontWeight: "700",
          }}
        >
          Ferramentas avançadas TUÖM
        </Text>

        <Text
          style={{
            color: "rgba(255,255,255,0.55)",
            fontSize: 13,
            marginTop: -6,
          }}
        >
          Módulos premium para controle financeiro real.
        </Text>

        {/* ======================================================
            APENAS *1* ITEM: Economia Automatizada
        ====================================================== */}
        <View style={{ gap: 16 }}>
          <Tool
            title="Economia Automatizada"
            desc="Sugestões inteligentes com base no seu perfil."
            icon="sparkles-outline"
            locked={!isPremium}
            onPress={() => router.push("/finance/savings")}
          />
        </View>

        {/* ======================================================
            CTA PARA PREMIUM (mantido)
        ====================================================== */}
        {!isPremium && (
          <TouchableOpacity
            onPress={() => router.push("/premium")}
            style={{
              marginTop: 10,
              paddingVertical: 12,
              borderRadius: 999,
              backgroundColor: "#FFFFFF",
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

/* ============================================================
   COMPONENTE TOOL – versão minimalista premium
============================================================ */
function Tool({ title, desc, icon, locked, onPress }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        padding: 16,
        borderRadius: 20,
        borderWidth: 0.4,
        borderColor: "rgba(255,255,255,0.06)",
        backgroundColor: "rgba(255,255,255,0.03)", // vidro escuro Apple
        flexDirection: "row",
        gap: 14,
        alignItems: "center",
        opacity: locked ? 0.55 : 1,
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 16,
          backgroundColor: "rgba(255,255,255,0.05)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Icon name={icon} size={22} color="#FFF" />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={{ color: "#FFF", fontSize: 15, fontWeight: "600" }}>
          {title}
        </Text>
        <Text style={{ color: "rgba(255,255,255,0.55)", fontSize: 12.5 }}>
          {desc}
        </Text>
      </View>

      {locked && (
        <Icon name="lock-closed-outline" size={18} color="rgba(255,255,255,0.40)" />
      )}
    </TouchableOpacity>
  );
}

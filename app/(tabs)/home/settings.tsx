import { useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  Switch,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import Constants from "expo-constants";

import Screen from "@/components/layout/Screen";
import Icon from "@/components/ui/Icon";
import { useUserSettings } from "@/context/UserSettingsContext";

const brandFont = Platform.select({
  ios: "SF Pro Display",
  default: "System",
});

/* -------------------------------------------------------
   Componentes auxiliares
-------------------------------------------------------- */

function SettingsCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={{ gap: 12 }}>
      <Text
        style={{
          color: "#9CA3AF",
          fontSize: 13,
          marginLeft: 4,
        }}
      >
        {title}
      </Text>

      <BlurView
        intensity={25}
        tint="dark"
        style={{
          borderRadius: 18,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            backgroundColor: "rgba(255,255,255,0.04)",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.08)",
            borderRadius: 18,
          }}
        >
          {children}
        </View>
      </BlurView>
    </View>
  );
}

function Row({
  label,
  description,
  right,
  onPress,
}: {
  label: string;
  description?: string;
  right?: React.ReactNode;
  onPress?: () => void;
}) {
  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255,255,255,0.06)",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 15,
            fontWeight: "500",
          }}
        >
          {label}
        </Text>

        {description && (
          <Text
            style={{
              color: "#9CA3AF",
              fontSize: 12,
              marginTop: 2,
            }}
          >
            {description}
          </Text>
        )}
      </View>

      {right}
    </Wrapper>
  );
}

/* -------------------------------------------------------
   Tela
-------------------------------------------------------- */

export default function SettingsScreen() {
  const router = useRouter();
  const { settings, loading, updateSetting } = useUserSettings();

  const appVersion =
    Constants.expoConfig?.version
      ? `${Constants.expoConfig.version} BETA`
      : "BETA";

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <Screen>
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#9CA3AF", fontSize: 14 }}>
            Carregando configurações…
          </Text>
        </View>
      </Screen>
    );
  }

  if (!settings) {
    return (
      <Screen>
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#EF4444", fontSize: 14 }}>
            Não foi possível carregar as configurações
          </Text>
        </View>
      </Screen>
    );
  }

  /* ================= TELA ================= */

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 80,
          gap: 28,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= HEADER ================= */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
          }}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <Icon name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>

          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 24,
              fontWeight: "700",
              fontFamily: brandFont,
            }}
          >
            Configurações
          </Text>
        </View>

        {/* ================= MODO DE OPERAÇÃO ================= */}
        <SettingsCard title="Modo de operação">
          <Row
            label="Modo manual"
            description="Você registra seus dados manualmente."
            right={
              <Switch
                value={settings.operation_mode === "manual"}
                onValueChange={() =>
                  updateSetting(
                    "operation_mode",
                    settings.operation_mode === "manual"
                      ? "automatic"
                      : "manual"
                  )
                }
              />
            }
          />

          <Row
            label="Modo automático"
            description="Sincronização automática (em breve)."
            right={
              <Text style={{ color: "#6B7280", fontSize: 13 }}>
                Em breve
              </Text>
            }
          />
        </SettingsCard>

        {/* ================= NOTIFICAÇÕES ================= */}
        <SettingsCard title="Notificações">
          <Row
            label="Ativar notificações"
            right={
              <Switch
                value={settings.notifications_enabled}
                onValueChange={(v) =>
                  updateSetting("notifications_enabled", v)
                }
              />
            }
          />

          <Row
            label="Modo silencioso"
            description="Desativa alertas temporariamente."
            right={
              <Switch
                value={settings.silent_mode}
                onValueChange={(v) => updateSetting("silent_mode", v)}
              />
            }
          />
        </SettingsCard>

        {/* ================= FINANCEIRO ================= */}
        <SettingsCard title="Financeiro & alertas">
          <Row
            label="Considerar investimentos no fluxo mensal"
            description="Inclui aportes no cálculo mensal."
            right={
              <Switch
                value={settings.consider_investments_in_cashflow}
                onValueChange={(v) =>
                  updateSetting("consider_investments_in_cashflow", v)
                }
              />
            }
          />
        </SettingsCard>

        {/* ================= INSIGHTS ================= */}
        <SettingsCard title="Insights inteligentes">
          <Row
            label="Insight diário"
            description="Resumo automático do dia."
            right={
              <Switch
                value={settings.smart_insights_daily}
                onValueChange={(v) =>
                  updateSetting("smart_insights_daily", v)
                }
              />
            }
          />

          <Row
            label="Insight semanal"
            description="Visão geral da semana."
            right={
              <Switch
                value={settings.smart_insights_weekly}
                onValueChange={(v) =>
                  updateSetting("smart_insights_weekly", v)
                }
              />
            }
          />
        </SettingsCard>

        {/* ================= CONTA ================= */}
        <SettingsCard title="Conta & plano">
          <Row
            label="Gerenciar assinatura"
            onPress={() => router.push("/home/subscription")}
            right={
              <Icon
                name="chevron-forward"
                size={18}
                color="#9CA3AF"
              />
            }
          />

          <Row
            label="Encerrar conta"
            right={
              <Text style={{ color: "#EF4444", fontSize: 14 }}>
                Ação permanente
              </Text>
            }
          />
        </SettingsCard>

        {/* ================= APP ================= */}
        <SettingsCard title="App">
          <Row
            label="Versão do app"
            right={
              <Text style={{ color: "#9CA3AF", fontSize: 13 }}>
                {appVersion}
              </Text>
            }
          />
        </SettingsCard>
      </ScrollView>
    </Screen>
  );
}

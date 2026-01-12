import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import type { Subscription } from "@/types/subscriptions";
import SubscriptionIcon from "@/components/ui/SubscriptionIcon";

type Props = {
  subscription: Subscription;
};

export default function SubscriptionCard({ subscription }: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push(`/subscriptions/${subscription.id}`)}
      style={{
        flexDirection: "row",
        alignItems: "center",
        padding: 14,
        borderRadius: 18,
        backgroundColor: "rgba(10,10,10,0.80)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.06)",
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
      }}
    >
      {/* Ícone */}
      <View style={{ marginRight: 12 }}>
        <SubscriptionIcon serviceName={subscription.service} />
      </View>

      {/* Texto */}
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: "#F9FAFB",
            fontSize: 15,
            fontWeight: "600",
          }}
          numberOfLines={1}
        >
          {subscription.service}
        </Text>

        <Text
          style={{
            color: "#9CA3AF",
            fontSize: 12,
            marginTop: 2,
          }}
        >
          {subscription.frequency === "monthly"
            ? "Mensal"
            : subscription.frequency === "yearly"
            ? "Anual"
            : "Semanal"}
          {subscription.next_billing
            ? ` • Próximo em ${subscription.next_billing}`
            : null}
        </Text>
      </View>

      {/* Preço */}
      <View style={{ marginLeft: 8, alignItems: "flex-end" }}>
        <Text
          style={{
            color: "#F9FAFB",
            fontSize: 16,
            fontWeight: "700",
          }}
        >
          R$ {subscription.price.toFixed(2)}
        </Text>
        <Text
          style={{
            color: "#6B7280",
            fontSize: 11,
            marginTop: 2,
          }}
        >
          {subscription.frequency === "monthly"
            ? "/mês"
            : subscription.frequency === "yearly"
            ? "/ano"
            : ""}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

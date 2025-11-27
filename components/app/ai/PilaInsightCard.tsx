// components/app/ai/PilaInsightCard.tsx
import { View, Text } from "react-native";
import Icon from "@/components/ui/Icon";

type PilaInsightCardProps = {
  title?: string;
  message: string;
};

export default function PilaInsightCard({
  title = "Pila está de olho nas suas finanças",
  message,
}: PilaInsightCardProps) {
  return (
    <View
      style={{
        borderRadius: 20,
        padding: 16,
        backgroundColor: "rgba(15,15,15,0.85)",
        borderWidth: 1,
        borderColor: "rgba(56,189,248,0.7)",
        marginTop: 4,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          gap: 10,
          alignItems: "flex-start",
          marginBottom: 8,
        }}
      >
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(56,189,248,0.16)",
          }}
        >
          <Icon name="sparkles-outline" size={18} color="#7DD3FC" />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: "#E5E7EB",
              fontSize: 14,
              fontWeight: "600",
              marginBottom: 2,
            }}
          >
            {title}
          </Text>
          <Text
            style={{
              color: "#9CA3AF",
              fontSize: 13,
            }}
          >
            {message}
          </Text>
        </View>
      </View>
    </View>
  );
}

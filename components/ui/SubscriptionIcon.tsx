// app/components/ui/SubscriptionIcon.tsx
import { Image, View, Text } from "react-native";
import { getSubscriptionIcon } from "@/constants/subscriptionIcons";

type Props = {
  serviceName: string;
};

export default function SubscriptionIcon({ serviceName }: Props) {
  const iconSource = getSubscriptionIcon(serviceName);

  if (!iconSource) {
    const initial = serviceName?.[0]?.toUpperCase() ?? "?";

    return (
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          backgroundColor: "rgba(255,255,255,0.06)",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.10)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: "#E5E7EB",
            fontSize: 14,
            fontWeight: "600",
          }}
        >
          {initial}
        </Text>
      </View>
    );
  }

  return (
    <Image
      source={iconSource}
      style={{
        width: 32,
        height: 32,
        borderRadius: 10,
      }}
      resizeMode="contain"
    />
  );
}

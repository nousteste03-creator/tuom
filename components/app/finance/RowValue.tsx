// components/app/finance/RowValue.tsx
import { View, Text } from "react-native";

export default function RowValue({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Text style={{ color: "#9CA3AF", fontSize: 12 }}>{label}</Text>

      <Text
        style={{
          color,
          fontSize: 14,
          fontWeight: "600",
        }}
      >
        {value}
      </Text>
    </View>
  );
}

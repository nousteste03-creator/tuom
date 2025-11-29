// components/app/finance/budget/MonthSwitcher.tsx
import { View, Text, TouchableOpacity } from "react-native";
import Icon from "@/components/ui/Icon";

export default function MonthSwitcher({
  month,
  onPrev,
  onNext,
}: {
  month: string;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 14,
      }}
    >
      <TouchableOpacity onPress={onPrev}>
        <Icon name="chevron-back" size={20} color="#9CA3AF" />
      </TouchableOpacity>

      <Text
        style={{
          color: "#FFF",
          fontSize: 15,
          fontWeight: "600",
        }}
      >
        {month}
      </Text>

      <TouchableOpacity onPress={onNext}>
        <Icon name="chevron-forward" size={20} color="#9CA3AF" />
      </TouchableOpacity>
    </View>
  );
}

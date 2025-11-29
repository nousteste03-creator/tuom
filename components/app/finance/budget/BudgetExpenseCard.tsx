// components/app/finance/budget/BudgetExpenseCard.tsx
import { View, Text, TouchableOpacity } from "react-native";
import Icon from "@/components/ui/Icon";

export default function BudgetExpenseCard({
  description,
  amount,
  date,
  onPress,
}: {
  description: string;
  amount: number;
  date: string;
  onPress?: () => void;
}) {
  const formatted = new Date(date).toLocaleDateString("pt-BR");

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={{
        padding: 14,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        backgroundColor: "rgba(255,255,255,0.04)",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <View>
        <Text
          style={{
            color: "#FFF",
            fontSize: 15,
            fontWeight: "600",
            marginBottom: 4,
          }}
        >
          {description}
        </Text>

        <Text style={{ color: "#9CA3AF", fontSize: 12 }}>{formatted}</Text>
      </View>

      <Text
        style={{
          color: "#FCA5A5",
          fontSize: 15,
          fontWeight: "700",
        }}
      >
        - R$ {amount.toFixed(2)}
      </Text>
    </TouchableOpacity>
  );
}

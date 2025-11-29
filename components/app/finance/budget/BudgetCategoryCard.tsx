// components/app/finance/budget/BudgetCategoryCard.tsx
import { View, Text, TouchableOpacity } from "react-native";
import Icon from "@/components/ui/Icon";
import ProgressBar from "./ProgressBar";

export default function BudgetCategoryCard({
  title,
  spent,
  limit,
  onPress,
}: {
  title: string;
  spent: number;
  limit: number;
  onPress?: () => void;
}) {
  const pct = limit > 0 ? Math.min(spent / limit, 1) : 0;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={{
        padding: 16,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        backgroundColor: "rgba(255,255,255,0.04)",
        gap: 10,
      }}
    >
      {/* TITLE */}
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text
          style={{
            color: "#FFF",
            fontSize: 15,
            fontWeight: "600",
          }}
        >
          {title}
        </Text>

        <Icon name="chevron-forward" size={16} color="#9CA3AF" />
      </View>

      {/* STATS */}
      <View
        style={{ flexDirection: "row", justifyContent: "space-between" }}
      >
        <Text style={{ color: "#9CA3AF", fontSize: 13 }}>
          Usado:{" "}
          <Text style={{ color: "#FFF", fontWeight: "600" }}>
            R$ {spent.toFixed(2)}
          </Text>
        </Text>

        <Text style={{ color: "#9CA3AF", fontSize: 13 }}>
          Limite:{" "}
          <Text style={{ color: "#FFF", fontWeight: "600" }}>
            R$ {limit.toFixed(2)}
          </Text>
        </Text>
      </View>

      <ProgressBar progress={pct} />
    </TouchableOpacity>
  );
}

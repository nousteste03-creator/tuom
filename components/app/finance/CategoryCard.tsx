// components/app/finance/CategoryCard.tsx
import { View, Text } from "react-native";
import { BlurView } from "expo-blur";

type Props = {
  title: string;
  amount: number;
  type: "expense" | "income" | "goal";
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export default function CategoryCard({ title, amount, type }: Props) {
  const color =
    type === "expense"
      ? "#F87171" // vermelho elegante
      : type === "income"
      ? "#4ADE80" // verde suave premium
      : "#60A5FA"; // azul metálico metabank / metas

  return (
    <View
      style={{
        borderRadius: 18,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        marginBottom: 10,
      }}
    >
      <BlurView intensity={28} tint="dark" style={{ padding: 14 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: "#E5E7EB",
              fontSize: 14,
              fontWeight: "500",
            }}
          >
            {title}
          </Text>

          <Text
            style={{
              color,
              fontSize: 14,
              fontWeight: "600",
            }}
          >
            {currencyFormatter.format(amount)}
          </Text>
        </View>
      </BlurView>
    </View>
  );
}

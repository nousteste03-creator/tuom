// components/app/finance/budget/ProgressBar.tsx
import { View } from "react-native";

export default function ProgressBar({ progress }: { progress: number }) {
  return (
    <View
      style={{
        height: 7,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.08)",
        overflow: "hidden",
      }}
    >
      <View
        style={{
          width: `${progress * 100}%`,
          height: "100%",
          backgroundColor: "#A5B4FC",
          borderRadius: 999,
        }}
      />
    </View>
  );
}

// components/layout/Screen.tsx
import { View, SafeAreaView, Platform } from "react-native";

export default function Screen({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#0B0B0C", // fundo global Apple dark
      }}
    >
      <View
        style={{
          flex: 1,
          width: "100%",
          alignSelf: "stretch",
          // NÃO usa paddingBottom (quebra o teclado)
        }}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}

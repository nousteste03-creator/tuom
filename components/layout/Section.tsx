// components/layout/Section.tsx
import { ReactNode } from "react";
import { View, Text } from "react-native";

type SectionProps = {
  title?: string;
  children: ReactNode;
};

export default function Section({ title, children }: SectionProps) {
  return (
    <View style={{ marginBottom: 24 }}>
      {title && (
        <Text
          style={{
            color: "white",
            fontSize: 16,
            fontWeight: "600",
            marginBottom: 8,
          }}
        >
          {title}
        </Text>
      )}
      {children}
    </View>
  );
}

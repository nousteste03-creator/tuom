// components/ui/SegmentedControl.tsx
import { View, Text, Pressable } from "react-native";

type Segment = {
  key: string;
  label: string;
};

type SegmentedControlProps = {
  segments: Segment[];
  value: string;
  onChange: (key: string) => void;
};

export default function SegmentedControl({
  segments,
  value,
  onChange,
}: SegmentedControlProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        borderRadius: 12,
        padding: 3,
        backgroundColor: "rgba(15,15,15,0.85)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.12)",
      }}
    >
      {segments.map((segment) => {
        const isActive = segment.key === value;

        return (
          <Pressable
            key={segment.key}
            onPress={() => onChange(segment.key)}
            style={({ pressed }) => ({
              flex: 1,
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 9,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: isActive
                ? "rgba(255,255,255,0.12)"
                : "transparent",
              transform: [
                {
                  scale: pressed ? 0.97 : 1,
                },
              ],
            })}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: isActive ? "#FFFFFF" : "rgba(229,231,235,0.75)",
              }}
            >
              {segment.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

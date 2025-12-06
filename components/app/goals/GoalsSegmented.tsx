// components/app/goals/GoalsSegmented.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
} from "react-native";
import { BlurView } from "expo-blur";

const brandFont = Platform.select({
  ios: "SF Pro Display",
  android: "Inter",
  default: "System",
});

// AGORA CADA ABA TEM LABEL + VALUE CORRETO
const TABS = [
  { label: "Metas", value: "goals" },
  { label: "Dívidas", value: "debts" },
  { label: "Investimentos", value: "investments" },
  { label: "Receitas", value: "income" },
];

type GoalsSegmentedProps = {
  value?: string;
  onChange?: (tab: string) => void;
};

export default function GoalsSegmented({ value, onChange }: GoalsSegmentedProps) {
  const initialIndex = Math.max(
    0,
    TABS.findIndex((t) => t.value === value)
  );

  const [selectedIndex, setSelectedIndex] = useState(initialIndex);
  const [containerWidth, setContainerWidth] = useState(0);

  const anim = useRef(new Animated.Value(initialIndex)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: selectedIndex,
      useNativeDriver: false,
      speed: 18,
      bounciness: 8,
    }).start();
  }, [selectedIndex]);

  const handlePress = (index: number) => {
    setSelectedIndex(index);
    onChange?.(TABS[index].value); // ← AQUI ESTÁ A CORREÇÃO
  };

  const indicatorWidth =
    containerWidth > 0 ? containerWidth / TABS.length : 0;

  const translateX =
    containerWidth > 0
      ? anim.interpolate({
          inputRange: TABS.map((_, i) => i),
          outputRange: TABS.map((_, i) => i * indicatorWidth),
        })
      : 0;

  return (
    <BlurView intensity={40} tint="dark" style={styles.wrapper}>
      <View
        style={styles.container}
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      >
        {containerWidth > 0 && (
          <Animated.View
            style={[
              styles.indicator,
              {
                width: indicatorWidth,
                transform: [{ translateX }],
              },
            ]}
          />
        )}

        {TABS.map((tab, index) => {
          const isActive = index === selectedIndex;
          return (
            <TouchableOpacity
              key={tab.value}
              style={styles.tabButton}
              onPress={() => handlePress(index)}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    paddingVertical: 10,
    backgroundColor: "rgba(10,10,10,0.9)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  container: {
    flexDirection: "row",
    marginHorizontal: 14,
    padding: 6,
    borderRadius: 20,
    backgroundColor: "rgba(25,25,25,0.35)",
    overflow: "hidden",
    position: "relative",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 6,
    alignItems: "center",
  },
  tabText: {
    fontSize: 13,
    fontFamily: brandFont,
    color: "#FFFFFF",
    opacity: 0.6,
  },
  tabTextActive: {
    opacity: 1,
    fontWeight: "600",
  },
  indicator: {
    position: "absolute",
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.14)",
    top: 4,
    left: 0,
  },
});

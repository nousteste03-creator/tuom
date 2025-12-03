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

const TABS = ["Metas", "Dívidas", "Investimentos", "Receitas"];

type GoalsSegmentedProps = {
  onChange?: (tab: string) => void;
};

export default function GoalsSegmented({ onChange }: GoalsSegmentedProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: selectedIndex,
      useNativeDriver: false,
      speed: 18,
      bounciness: 8,
    }).start();
  }, [selectedIndex, anim]);

  const handlePress = (index: number) => {
    setSelectedIndex(index);
    onChange?.(TABS[index]);
  };

  const indicatorBaseWidth =
    containerWidth > 0 ? containerWidth / TABS.length : 0;

  const translateX =
    containerWidth > 0
      ? anim.interpolate({
          inputRange: TABS.map((_, i) => i),
          outputRange: TABS.map((_, i) => i * indicatorBaseWidth),
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
                width: indicatorBaseWidth,
                transform: [{ translateX }],
              },
            ]}
          />
        )}

        {TABS.map((tab, index) => {
          const isActive = index === selectedIndex;
          return (
            <TouchableOpacity
              key={tab}
              style={styles.tabButton}
              activeOpacity={0.85}
              onPress={() => handlePress(index)}
            >
              <Text
                numberOfLines={1}
                ellipsizeMode="clip"
                style={[
                  styles.tabText,
                  isActive && styles.tabTextActive,
                ]}
              >
                {tab}
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
    justifyContent: "center",
  },
  tabText: {
    fontSize: 13,
    fontFamily: brandFont,
    color: "#FFFFFF",
    opacity: 0.6,
    letterSpacing: 0.2,
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

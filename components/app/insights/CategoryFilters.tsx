import React from "react";
import {
  ScrollView,
  Pressable,
  Text,
  StyleSheet,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";

interface Props {
  categories: string[];
  selected: string;
  onChange: (category: string) => void;
}

const CategoryFilters = ({ categories, selected, onChange }: Props) => {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {categories.map((cat) => {
          const isActive = cat === selected;

          return (
            <Pressable
              key={cat}
              onPress={() => {
                if (!isActive) {
                  Haptics.impactAsync(
                    Haptics.ImpactFeedbackStyle.Light
                  );
                  onChange(cat);
                }
              }}
              hitSlop={12}
              style={({ pressed }) => [
                styles.item,
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[
                  styles.text,
                  isActive && styles.activeText,
                ]}
              >
                {cat}
              </Text>

              {/* underline mais presente */}
              <View
                style={[
                  styles.underline,
                  isActive && styles.activeUnderline,
                ]}
              />
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default CategoryFilters;
const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 12,
  },

  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    gap: 20,
  },

  item: {
    alignItems: "center",
  },

  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },

  text: {
    fontSize: 15,
    fontWeight: "500",
    color: "rgba(255,255,255,0.5)",
    marginBottom: 6,
  },

  activeText: {
    color: "#fff",
    fontWeight: "700",
  },

  underline: {
    height: 2,
    width: "100%",
    backgroundColor: "transparent",
    borderRadius: 2,
  },

  activeUnderline: {
    height: 3,
    backgroundColor: "#fff",
  },
});

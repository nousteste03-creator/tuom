// components/app/goals/GoalsHeader.tsx
import { View, Text, StyleSheet, Platform } from "react-native";
import { BlurView } from "expo-blur";

const brandFont = Platform.select({
  ios: "SF Pro Display",
  android: "Inter",
  default: "System",
});

export default function GoalsHeader() {
  return (
    <BlurView intensity={30} tint="dark" style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.title}>Metas</Text>
        <Text style={styles.subtitle}>
          Organize seus objetivos, investimentos e dívidas
        </Text>
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingVertical: 22,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
    backgroundColor: "rgba(15,15,15,0.5)",
  },
  inner: {
    marginTop: Platform.OS === "ios" ? 10 : 0,
  },
  title: {
    fontSize: 32,
    fontWeight: "600",
    letterSpacing: -0.5,
    fontFamily: brandFont,
    color: "#FFFFFF",
  },
  subtitle: {
    marginTop: 4,
    fontSize: 15,
    opacity: 0.6,
    fontFamily: brandFont,
    color: "#FFFFFF",
  },
});

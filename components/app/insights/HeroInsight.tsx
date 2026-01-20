import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ImageSourcePropType,
} from "react-native";

interface HeroInsightProps {
  data: {
    title: string;
    image: ImageSourcePropType;
    category: string;
    impactLevel: "low" | "medium" | "high";
    publishedAt: string;
  };
}

const HeroInsight = ({ data }: HeroInsightProps) => {
  return (
    <View style={styles.container}>
      <Image
        source={data.image}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.overlay} />

      <View style={styles.content}>
        <Text style={styles.impact}>
          {data.impactLevel.toUpperCase()}
        </Text>

        <Text style={styles.title}>
          {data.title}
        </Text>

        <Text style={styles.meta}>
          {data.category} ·{" "}
          {new Date(data.publishedAt).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );
};

export default HeroInsight;

const styles = StyleSheet.create({
  container: {
    height: 320,
    backgroundColor: "#000",
    marginBottom: 16,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  content: {
    position: "absolute",
    bottom: 24,
    left: 16,
    right: 16,
  },
  impact: {
    color: "#fff",
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  meta: {
    color: "#aaa",
    fontSize: 12,
  },
});

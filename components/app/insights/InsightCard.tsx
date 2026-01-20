import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ImageSourcePropType,
} from "react-native";

const FALLBACK_IMAGE: ImageSourcePropType =
  require("../../../assets/images/insights-fallback.png");

interface InsightCardProps {
  data: {
    title: string;
    image: ImageSourcePropType;
    category: string;
    impactLevel: "low" | "medium" | "high";
    publishedAt: string;
  };
}

const InsightCard = ({ data }: InsightCardProps) => {
  const [imageSource, setImageSource] =
    useState<ImageSourcePropType>(FALLBACK_IMAGE);

  // mantém a imagem sincronizada quando o item muda
  useEffect(() => {
    if (data?.image) setImageSource(data.image);
  }, [data]);

  return (
    <View style={styles.container}>
      <Image
        source={imageSource}
        style={styles.image}
        resizeMode="cover"
        onError={() => setImageSource(FALLBACK_IMAGE)}
      />

      <View style={styles.text}>
        <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
          {data.title}
        </Text>

        <View style={styles.metaRow}>
          <Text style={styles.category}>{data.category.toUpperCase()}</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.impact}>{data.impactLevel}</Text>
        </View>
      </View>
    </View>
  );
};

export default InsightCard;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
  },

  image: {
    width: 84,
    height: 84,
    borderRadius: 10,
    backgroundColor: "#111",
  },

  text: {
    flex: 1,
    justifyContent: "center",
  },

  title: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
    marginBottom: 6,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  category: {
    color: "#aaa",
    fontSize: 12,
    letterSpacing: 0.5,
  },

  dot: {
    color: "#444",
    fontSize: 12,
  },

  impact: {
    color: "#777",
    fontSize: 12,
    textTransform: "capitalize",
  },
});

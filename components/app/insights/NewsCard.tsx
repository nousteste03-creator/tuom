// components/app/insights/NewsCard.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import type { RemoteNewsItem } from "@/lib/api/news";

type Props = {
  item: RemoteNewsItem;
  onPress?: () => void;
};

function formatTimeAgo(minutes?: number) {
  if (minutes == null || Number.isNaN(minutes)) return "";
  if (minutes < 60) return `${minutes}min`;

  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days >= 1) return `${days}d`;

  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h${remainingMinutes}`;
}

export const NewsCard: React.FC<Props> = ({ item, onPress }) => {
  const source =
    !item.source || item.source.toLowerCase().includes("desconhecid")
      ? "TUÖM Insights"
      : item.source;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.card}
      onPress={onPress}
    >
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.image} />
      ) : null}

      <View style={styles.headerRow}>
        <Text style={styles.source}>{source}</Text>
        <Text style={styles.time}>{formatTimeAgo(item.minutesAgo)}</Text>
      </View>

      <Text style={styles.title} numberOfLines={3}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 260,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 20,
    padding: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  image: {
    width: "100%",
    height: 120,
    borderRadius: 14,
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  source: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
  },
  time: {
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
  },
  title: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
  },
});

import React, { useEffect } from "react";
import { View, Text, Image, Dimensions, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  interpolate,
  SharedValue,
  Easing,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

interface CardData {
  logo: any;
  name: string;
  category: string;
}

interface ImmersiveHeaderProps {
  smallCards: CardData[];
  scrollY?: SharedValue<number>;
}

// Componente individual dos cards flutuantes
const ImmersiveCard: React.FC<{ card: CardData; index: number }> = ({ card, index }) => {
  const translateY = useSharedValue(20);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Animação de entrada
    translateY.value = withTiming(0, { duration: 500 + index * 120, easing: Easing.out(Easing.exp) });
    opacity.value = withTiming(1, { duration: 500 + index * 120 });

    // Flutuação contínua (loop)
    translateY.value = withRepeat(
      withTiming(4, { duration: 2000 + index * 200, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      <BlurView intensity={80} tint="dark" style={styles.blur}>
        <Image source={card.logo} style={styles.logo} />
        <Text style={styles.name}>{card.name}</Text>
        <Text style={styles.category}>{card.category}</Text>
      </BlurView>
    </Animated.View>
  );
};

export const ImmersiveHeader: React.FC<ImmersiveHeaderProps> = ({ smallCards, scrollY }) => {
  const translateY = useSharedValue(20);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.exp) });
    opacity.value = withTiming(1, { duration: 600 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const parallax = scrollY ? interpolate(scrollY.value, [0, 200], [0, -15]) : 0;
    return {
      transform: [{ translateY: translateY.value + parallax }],
      opacity: opacity.value,
    };
  });

  return (
    <View style={styles.container}>
      {/* Cards flutuantes */}
      <Animated.View style={animatedStyle}>
        <View style={styles.cardsContainer}>
          {smallCards.map((card, index) => (
            <ImmersiveCard key={index} card={card} index={index} />
          ))}
        </View>
      </Animated.View>
    </View>
  );
};

const CARD_SIZE = 100;
const CARD_MARGIN = 12;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#000",
    alignItems: "center",
    paddingVertical: 20,
  },
  cardsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "nowrap",
    gap: CARD_MARGIN,
  },
  card: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: 20,
    marginHorizontal: CARD_MARGIN / 2,
    shadowColor: "#0af",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    overflow: "hidden",
  },
  blur: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    padding: 8,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 12,
    marginBottom: 6,
  },
  name: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  category: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 10,
    textAlign: "center",
  },
});

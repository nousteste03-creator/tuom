import React, { useEffect, useRef } from "react";
import {
  View,
  Animated,
  Easing,
  StyleSheet,
  Image,
  Dimensions,
} from "react-native";

const { width } = Dimensions.get("window");

interface LogoRingLoaderProps {
  size?: number;       // tamanho da logo
  ringWidth?: number;  // largura do anel
  duration?: number;   // duração de uma volta completa
}

export const LogoRingLoader: React.FC<LogoRingLoaderProps> = ({
  size = 120,
  ringWidth = 4,
  duration = 1500,
}) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = () => {
      rotateAnim.setValue(0);
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: duration,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => loop());
    };
    loop();
  }, []);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Image
          source={require("@/assets/images/icon.png")}
          style={{ width: size, height: size }}
          resizeMode="contain"
        />

        {/* Linha circular girando */}
        <Animated.View
          style={[
            styles.ring,
            {
              width: size + ringWidth * 4,
              height: size + ringWidth * 4,
              borderWidth: ringWidth,
              borderRadius: (size + ringWidth * 4) / 2,
              transform: [{ rotate: rotateInterpolate }],
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    justifyContent: "center",
    alignItems: "center",
  },
  ring: {
    position: "absolute",
    borderColor: "#fff",
    borderStyle: "solid",
  },
});

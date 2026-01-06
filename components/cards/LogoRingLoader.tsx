import React, { useEffect, useRef } from "react";
import {
  View,
  Animated,
  StyleSheet,
  Image,
  Easing,
} from "react-native";

interface LogoRingLoaderProps {
  size?: number;
  ringWidth?: number;
  duration?: number;
}

export const LogoRingLoader: React.FC<LogoRingLoaderProps> = ({
  size = 120,
  ringWidth = 3,
  duration = 1200,
}) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    animation.start();

    return () => animation.stop();
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      <View style={styles.wrapper}>
        <Image
          source={require("@/assets/images/icon.png")}
          style={{ width: size, height: size }}
          resizeMode="contain"
        />

        <Animated.View
          style={[
            styles.ring,
            {
              width: size + 24,
              height: size + 24,
              borderRadius: (size + 24) / 2,
              borderWidth: ringWidth,
              transform: [{ rotate }],
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
  wrapper: {
    justifyContent: "center",
    alignItems: "center",
  },
  ring: {
    position: "absolute",
    borderTopColor: "#FFFFFF",
    borderRightColor: "transparent",
    borderBottomColor: "transparent",
    borderLeftColor: "transparent",
  },
});

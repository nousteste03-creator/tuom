import { useEffect, useState } from "react";
import { View, Text } from "react-native";

import { getHeroCopy } from "@/lib/getHeroCopy";
import { HERO_FALLBACK_PHRASES, HeroCopyContext } from "@/lib/heroCopy";

interface HomeHeroProps {
  moment?: HeroCopyContext["moment"]; // "onboarding" | "returning" | undefined
}

/**
 * HomeHero
 *
 * - Renderiza fallback imediatamente
 * - Atualiza quando IA responder
 * - Suporta contexto do usuário
 */
export default function HomeHero({ moment }: HomeHeroProps) {
  const [copy, setCopy] = useState<string>(() => {
    // fallback inicial baseado em contexto
    switch (moment) {
      case "onboarding":
        return HERO_FALLBACK_PHRASES[0];
      case "returning":
        return HERO_FALLBACK_PHRASES[1];
      default:
        return HERO_FALLBACK_PHRASES[
          Math.floor(Math.random() * HERO_FALLBACK_PHRASES.length)
        ];
    }
  });

  useEffect(() => {
    let isMounted = true;

    getHeroCopy({ moment }).then((text) => {
      if (!isMounted) return;
      if (!text) return;
      setCopy(text);
    });

    return () => {
      isMounted = false;
    };
  }, [moment]);

  return (
    <View
      style={{
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 12,
      }}
    >
      <Text
        style={{
          color: "#E5E7EB",
          fontSize: 24,
          fontWeight: "600",
          lineHeight: 32,
        }}
      >
        {copy}
      </Text>
    </View>
  );
}

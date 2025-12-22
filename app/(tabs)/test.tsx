// app/(tabs)/HomeSubscriptionsCardIconsTest.tsx
import React, { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, View, Text } from "react-native";
import { SvgXml } from "react-native-svg";
import { SERVICES_LIBRARY, ServiceItem } from "@/constants/services";

export default function HomeSubscriptionsCardIconsTest() {
  const [svgs, setSvgs] = useState<Record<string, string>>({});

  // Faz fetch de todos os SVGs via link
  useEffect(() => {
    SERVICES_LIBRARY.forEach(async (service: ServiceItem) => {
      if (!service.icon) return;

      try {
        const res = await fetch(service.icon);
        const text = await res.text();
        setSvgs((prev) => ({ ...prev, [service.id]: text }));
      } catch (err) {
        console.log("Erro ao carregar SVG:", service.id, err);
      }
    });
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {SERVICES_LIBRARY.map((service: ServiceItem) => (
          <View
            key={service.id}
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: "rgba(255,255,255,0.08)",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 12,
              }}
            >
              {svgs[service.id] ? (
                <SvgXml xml={svgs[service.id]} width={24} height={24} />
              ) : (
                <Text style={{ color: "#FFF", fontSize: 12 }}>?</Text>
              )}
            </View>
            <Text style={{ color: "#FFF" }}>{service.name}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

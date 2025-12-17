import { useEffect, useState } from "react";
import { Tabs, Redirect } from "expo-router";
import Icon from "@/components/ui/Icon";
import { colors } from "@/lib/colors";
import { supabase } from "@/lib/supabase";

export default function TabsLayout() {
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    let alive = true;

    const check = async () => {
      const { data } = await supabase.auth.getSession();
      if (!alive) return;

      setHasSession(!!data.session);
      setChecking(false);
    };

    check();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!alive) return;
      setHasSession(!!session);
    });

    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (checking) return null;

  if (!hasSession) {
    return <Redirect href="/lobby" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "rgba(255,255,255,0.04)",
          borderTopWidth: 0,
          height: 64,
        },
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.textSecondary,
      }}
    >
      {/* HOME */}
      <Tabs.Screen
        name="home"
        options={{
          title: "Início",
          tabBarIcon: ({ color }) => <Icon name="home" color={color} size={22} />,
        }}
      />

      {/* ASSINATURAS */}
      <Tabs.Screen
        name="subscriptions"
        options={{
          title: "Assinaturas",
          tabBarIcon: ({ color }) => (
            <Icon name="layers-outline" color={color} size={22} />
          ),
        }}
      />

      {/* METAS */}
      <Tabs.Screen
        name="goals"
        options={{
          title: "Metas",
          tabBarIcon: ({ color }) => (
            <Icon name="flag-outline" color={color} size={22} />
          ),
        }}
      />

      {/* INSIGHTS */}
      <Tabs.Screen
        name="insights"
        options={{
          title: "Insights",
          tabBarIcon: ({ color }) => <Icon name="book" color={color} size={22} />,
        }}
      />

      {/* FINANÇAS */}
      <Tabs.Screen
        name="finance"
        options={{
          title: "Finanças",
          tabBarIcon: ({ color }) => (
            <Icon name="stats-chart-outline" size={22} color={color} />
          ),
        }}
      />

      {/* PILA */}
      <Tabs.Screen
        name="pila"
        options={{
          title: "PILA",
          tabBarLabel: "PILA",
          tabBarIcon: ({ color }) => (
            <Icon name="sparkles-outline" size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

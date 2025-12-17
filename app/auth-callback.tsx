import { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { authLogger } from "@/lib/authLogger";

const brandFont = Platform.select({
  ios: "SF Pro Display",
  default: "System",
});

export default function AuthCallbackScreen() {
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    authLogger.info("AUTH_CALLBACK", "mounted");

    // ⏳ fallback duro (se nada acontecer)
    const fallbackTimer = setTimeout(async () => {
      if (!mounted) return;

      authLogger.warn("AUTH_CALLBACK", "fallback getSession");

      const { data } = await supabase.auth.getSession();

      if (data.session?.user) {
        router.replace("/home");
      } else {
        router.replace("/lobby");
      }
    }, 2500);

    // 🔐 Listener temporário de auth
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      authLogger.info("AUTH_CALLBACK", "event", event);

      // 🔑 Recovery
      if (event === "PASSWORD_RECOVERY") {
        clearTimeout(fallbackTimer);
        router.replace("/(auth)/reset");
        return;
      }

      // ✅ Login / OAuth OK
      if (session?.user) {
        clearTimeout(fallbackTimer);
        router.replace("/home");
        return;
      }
    });

    return () => {
      mounted = false;
      clearTimeout(fallbackTimer);
      subscription.unsubscribe();
      authLogger.info("AUTH_CALLBACK", "unmounted");
    };
  }, [router]);

  return (
    <View style={styles.root}>
      <ActivityIndicator size="large" color="#fff" />
      <Text style={styles.text}>Conectando sua conta…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    marginTop: 16,
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    fontFamily: brandFont,
  },
});

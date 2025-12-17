import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { authLogger } from "@/lib/authLogger";

// ✅ Versionamento oficial
import { TERMS_VERSION } from "@/lib/legalVersions";

const brandFont = Platform.select({
  ios: "SF Pro Display",
  default: "System",
});

export default function LegalAcceptanceScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔒 Segurança: se não houver usuário, volta ao lobby
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session?.user) {
        router.replace("/lobby");
      }
    };

    checkSession();
  }, [router]);

  async function handleAccept() {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !data.session?.user) {
        throw new Error("Sessão inválida");
      }

      const user = data.session.user;
      const acceptedAt = new Date().toISOString();

      authLogger.info("LEGAL", "accepting terms", {
        version: TERMS_VERSION,
      });

      const { error } = await supabase
        .from("user_legal_acceptances")
        .insert([
          {
            user_id: user.id,
            doc_type: "terms",
            version: TERMS_VERSION,
            accepted_at: acceptedAt,
            metadata: {
              accepted_from: "app",
              platform: Platform.OS,
            },
          },
          {
            user_id: user.id,
            doc_type: "privacy",
            version: TERMS_VERSION,
            accepted_at: acceptedAt,
            metadata: {
              accepted_from: "app",
              platform: Platform.OS,
            },
          },
        ]);

      if (error) throw error;

      authLogger.info("LEGAL", "accepted → /home");
      router.replace("/home");
    } catch (err) {
      console.error("[legal] accept error", err);
      setError("Não foi possível salvar seu aceite. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Antes de continuar</Text>
        <Text style={styles.subtitle}>
          Precisamos do seu aceite para seguir
        </Text>
      </View>

      {/* Texto legal */}
      <View style={styles.card}>
        <Text style={styles.text}>
          Para usar o NÖUS, é necessário concordar com nossos{" "}
          <Text style={styles.link} onPress={() => router.push("/terms")}>
            Termos de Uso
          </Text>{" "}
          e nossa{" "}
          <Text style={styles.link} onPress={() => router.push("/privacy")}>
            Política de Privacidade
          </Text>
          .
        </Text>

        <Text style={styles.small}>Versão: {TERMS_VERSION}</Text>
      </View>

      {/* Botão */}
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleAccept}
        disabled={loading}
        activeOpacity={0.85}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryButtonText}>
            Aceitar e continuar
          </Text>
        )}
      </TouchableOpacity>

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000",
    paddingHorizontal: 24,
    justifyContent: "center",
  },

  header: { marginBottom: 32 },
  title: {
    fontSize: 32,
    fontWeight: "600",
    color: "#fff",
    fontFamily: brandFont,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.6)",
    marginTop: 6,
    fontFamily: brandFont,
  },

  card: { marginBottom: 32 },
  text: {
    fontSize: 15,
    lineHeight: 22,
    color: "rgba(255,255,255,0.75)",
    fontFamily: brandFont,
  },
  link: {
    color: "rgba(255,255,255,0.9)",
    textDecorationLine: "underline",
  },
  small: {
    marginTop: 12,
    fontSize: 12,
    color: "rgba(255,255,255,0.45)",
    fontFamily: brandFont,
  },

  primaryButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },

  error: {
    marginTop: 16,
    color: "#ff6b6b",
    fontSize: 14,
    textAlign: "center",
  },
});

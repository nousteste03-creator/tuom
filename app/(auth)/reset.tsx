import { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { authLogger } from "@/lib/authLogger";

const brandFont = Platform.select({
  ios: "SF Pro Display",
  default: "System",
});

export default function ResetPasswordScreen() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isValid = useMemo(() => password.length >= 6, [password]);

  useEffect(() => {
    // Se o user cair aqui sem sessão de recovery, manda pro login.
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        authLogger.warn("RESET", "no session → login");
        router.replace("/(auth)/login");
      }
    };
    check();
  }, []);

  async function handleUpdate() {
    if (!isValid || loading) return;

    setLoading(true);
    setError(null);
    setInfo(null);

    try {
      authLogger.info("RESET", "updateUser started");

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        authLogger.warn("RESET", "updateUser failed", error);
        setError("Não foi possível atualizar. Tente novamente.");
        return;
      }

      setInfo("Senha atualizada com sucesso.");
      authLogger.info("RESET", "success → /home");
      router.replace("/home");
    } catch (e) {
      authLogger.error("RESET", "fatal", e);
      setError("Erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.root}>
      <TouchableOpacity
        style={styles.close}
        onPress={() => router.replace("/(auth)/login")}
        hitSlop={10}
      >
        <Text style={styles.closeText}>×</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>Nova senha</Text>
        <Text style={styles.subtitle}>
          Defina uma nova senha para sua conta.
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputBlock}>
          <Text style={styles.label}>Senha</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Senha (mín. 6 caracteres)"
            placeholderTextColor="rgba(255,255,255,0.3)"
            secureTextEntry
            style={styles.input}
          />
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, !isValid && styles.primaryButtonDisabled]}
          disabled={!isValid || loading}
          onPress={handleUpdate}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>Salvar</Text>
          )}
        </TouchableOpacity>

        {info && <Text style={styles.info}>{info}</Text>}
        {error && <Text style={styles.error}>{error}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000", paddingHorizontal: 24 },
  close: { position: "absolute", top: 56, right: 24, zIndex: 10 },
  closeText: { color: "rgba(255,255,255,0.6)", fontSize: 28, fontFamily: brandFont },

  header: { marginTop: 120, marginBottom: 40 },
  title: { fontSize: 34, fontWeight: "600", color: "#fff", fontFamily: brandFont },
  subtitle: { fontSize: 16, color: "rgba(255,255,255,0.6)", fontFamily: brandFont },

  form: { marginBottom: 32 },
  inputBlock: { marginBottom: 16 },
  label: { color: "rgba(255,255,255,0.6)", fontSize: 13, marginBottom: 6 },
  input: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 16,
    color: "#fff",
  },

  primaryButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  primaryButtonDisabled: { opacity: 0.4 },
  primaryButtonText: { color: "#fff", fontSize: 16, fontWeight: "500" },

  info: { marginTop: 12, color: "rgba(255,255,255,0.7)", fontSize: 14 },
  error: { marginTop: 12, color: "#ff6b6b", fontSize: 14 },
});

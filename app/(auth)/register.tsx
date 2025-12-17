import { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { authLogger } from "@/lib/authLogger";
import { featureFlags } from "@/lib/featureFlags";
import { Ionicons, AntDesign } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";

// ✅ AJUSTE LGPD — versionamento
import { TERMS_VERSION, PRIVACY_VERSION } from "@/lib/legalVersions";

WebBrowser.maybeCompleteAuthSession();

const brandFont = Platform.select({
  ios: "SF Pro Display",
  default: "System",
});

export default function RegisterScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<"google" | "apple" | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const isValid = useMemo(
    () => email.includes("@") && password.length >= 6 && acceptedTerms,
    [email, password, acceptedTerms]
  );

  /* -----------------------------------------------------
     EMAIL / PASSWORD — REGISTER
  ----------------------------------------------------- */
  async function handleRegister() {
    if (!isValid || loading) return;

    setLoading(true);
    setError(null);

    authLogger.info("REGISTER", "password register started");

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: "nouscore://auth-callback",
        data: {
          accepted_terms: true,
          accepted_terms_version: TERMS_VERSION,
          accepted_privacy_version: PRIVACY_VERSION,
          accepted_legal_at: new Date().toISOString(),
        },
      },
    });

    setLoading(false);

    if (error) {
      authLogger.warn("REGISTER", "signup failed", error);

      if (
        error.message?.toLowerCase().includes("already") ||
        error.message?.toLowerCase().includes("registered")
      ) {
        setError("Este email já está cadastrado.");
        return;
      }

      setError("Erro ao criar conta. Tente novamente.");
      return;
    }

    /**
     * 🔐 HARDENING CRÍTICO
     * Quando confirmação por email está ativa,
     * o Supabase NÃO retorna session.
     */
    if (!data.session) {
      authLogger.info(
        "REGISTER",
        "no session (email confirmation) → /verify"
      );
      router.replace(
        `/(auth)/verify?email=${encodeURIComponent(email.trim())}`
      );
      return;
    }

    authLogger.info("REGISTER", "success → /home");
    router.replace("/home");
  }

  /* -----------------------------------------------------
     GOOGLE OAUTH — REGISTER
  ----------------------------------------------------- */
  async function handleGoogleRegister() {
    if (socialLoading) return;

    setError(null);
    setSocialLoading("google");

    try {
      authLogger.info("GOOGLE_REGISTER", "start OAuth");

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: "nouscore://auth-callback",
        },
      });

      if (error || !data?.url) {
        authLogger.error("GOOGLE_REGISTER", "OAuth init failed", error);
        setError("Erro ao iniciar cadastro com Google");
        return;
      }

      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        "nouscore://auth-callback"
      );

      authLogger.info("GOOGLE_REGISTER", "browser result", result.type);

      if (result.type !== "success" || !result.url) {
        setError("Cadastro cancelado");
        return;
      }

      const hash = result.url.split("#")[1];
      const params = new URLSearchParams(hash);

      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");

      if (!access_token || !refresh_token) {
        authLogger.error("GOOGLE_REGISTER", "tokens missing");
        setError("Falha ao obter tokens");
        return;
      }

      const { error: sessionError } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (sessionError) {
        authLogger.error(
          "GOOGLE_REGISTER",
          "setSession failed",
          sessionError
        );
        setError("Erro ao salvar sessão");
        return;
      }

      authLogger.info("GOOGLE_REGISTER", "success → /legal");
      router.replace("/(auth)/legal");
    } catch (err) {
      authLogger.error("GOOGLE_REGISTER", "fatal error", err);
      setError("Erro inesperado no cadastro com Google");
    } finally {
      setSocialLoading(null);
    }
  }

  /* -----------------------------------------------------
     APPLE SIGN IN — STUB
  ----------------------------------------------------- */
  function handleApplePress() {
    if (!featureFlags.appleSignInEnabled) {
      setError("Apple Sign In estará disponível em breve.");
      return;
    }
  }

  return (
    <View style={styles.root}>
      {/* Close */}
      <TouchableOpacity
        style={styles.close}
        onPress={() => router.replace("/lobby")}
        hitSlop={10}
      >
        <Text style={styles.closeText}>×</Text>
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Criar conta</Text>
        <Text style={styles.subtitle}>
          Comece a organizar sua vida financeira hoje
        </Text>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <View style={styles.inputBlock}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor="rgba(255,255,255,0.3)"
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />
        </View>

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

        {/* Terms */}
        <TouchableOpacity
          style={styles.terms}
          onPress={() => setAcceptedTerms((v) => !v)}
          activeOpacity={0.8}
        >
          <View style={[styles.checkbox, acceptedTerms && styles.checkboxActive]}>
            {acceptedTerms && <Text style={styles.checkboxCheck}>✓</Text>}
          </View>
          <Text style={styles.termsText}>
            Li e aceito os{" "}
            <Text
              style={styles.legalLink}
              onPress={() => router.push("/terms")}
            >
              Termos
            </Text>{" "}
            e a{" "}
            <Text
              style={styles.legalLink}
              onPress={() => router.push("/privacy")}
            >
              Privacidade
            </Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.primaryButton,
            !isValid && styles.primaryButtonDisabled,
          ]}
          disabled={!isValid || loading}
          onPress={handleRegister}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>Criar conta</Text>
          )}
        </TouchableOpacity>

        {error && <Text style={styles.error}>{error}</Text>}
      </View>

      {/* Divider */}
      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={styles.or}>ou</Text>
        <View style={styles.line} />
      </View>

      {/* Social */}
      <View style={styles.social}>
        <TouchableOpacity
          style={[
            styles.socialButton,
            !featureFlags.appleSignInEnabled && { opacity: 0.4 },
          ]}
          onPress={handleApplePress}
        >
          <Ionicons name="logo-apple" size={18} color="#fff" />
          <Text style={styles.socialText}>Cadastrar com Apple</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.socialButton}
          onPress={handleGoogleRegister}
          disabled={socialLoading === "google"}
        >
          {socialLoading === "google" ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <AntDesign name="google" size={16} color="#fff" />
              <Text style={styles.socialText}>Cadastrar com Google</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
          <Text style={styles.footerLink}>
            Já tem conta? <Text style={styles.footerStrong}>Entrar</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* styles — espelhados do Login */
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000", paddingHorizontal: 24 },
  close: { position: "absolute", top: 56, right: 24, zIndex: 10 },
  closeText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 28,
    fontFamily: brandFont,
  },

  header: { marginTop: 120, marginBottom: 40 },
  title: {
    fontSize: 34,
    fontWeight: "600",
    color: "#fff",
    fontFamily: brandFont,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.6)",
    fontFamily: brandFont,
  },

  form: { marginBottom: 32 },
  inputBlock: { marginBottom: 16 },
  label: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    marginBottom: 6,
  },
  input: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 16,
    color: "#fff",
  },

  terms: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActive: {
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  checkboxCheck: {
    color: "#000",
    fontSize: 12,
    fontWeight: "700",
  },
  termsText: {
    flex: 1,
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    lineHeight: 18,
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
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },

  error: { marginTop: 12, color: "#ff6b6b", fontSize: 14 },

  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 28,
  },
  line: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.08)" },
  or: { marginHorizontal: 12, color: "rgba(255,255,255,0.4)" },

  social: { gap: 12 },
  socialButton: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  socialText: { color: "#fff", fontSize: 15 },

  footer: { marginTop: 32, alignItems: "center" },
  footerLink: { color: "rgba(255,255,255,0.6)" },
  footerStrong: { color: "#fff", fontWeight: "500" },

  legalLink: {
    color: "rgba(255,255,255,0.75)",
    textDecorationLine: "underline",
  },
});

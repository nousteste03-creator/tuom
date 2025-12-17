import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import LegalAcceptFooter from "@/components/app/common/LegalAcceptFooter";
import { PRIVACY_VERSION, SUPPORT_EMAIL, DPO_EMAIL } from "@/lib/legalVersions";

const brandFont = Platform.select({
  ios: "SF Pro Display",
  default: "System",
});

export default function PrivacyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ accept?: string }>();

  const acceptMode = useMemo(() => params.accept === "1", [params.accept]);

  const [accepted, setAccepted] = useState(false);
  const [saving, setSaving] = useState(false);

  async function onAccept() {
    setSaving(true);

    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;

    if (!user) {
      setSaving(false);
      Alert.alert("Faça login", "Você precisa estar logado para registrar o aceite.");
      return;
    }

    const { error } = await supabase.from("user_legal_acceptances").insert({
      user_id: user.id,
      doc_type: "privacy",
      version: PRIVACY_VERSION,
      metadata: { source: "screen" },
    });

    setSaving(false);

    if (error) {
      if (String(error.message || "").toLowerCase().includes("duplicate")) {
        router.back();
        return;
      }

      Alert.alert("Erro", "Não foi possível registrar o aceite. Tente novamente.");
      return;
    }

    router.back();
  }

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
          <Text style={styles.close}>×</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Política de Privacidade</Text>
        <Text style={styles.subtitle}>Versão {PRIVACY_VERSION}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.text}>
          Esta Política explica como tratamos dados pessoais no NÖUS, em conformidade com a Lei Geral de Proteção de Dados
          (Lei nº 13.709/2018 — LGPD).
        </Text>

        <Text style={styles.section}>1. Controlador e contato</Text>
        <Text style={styles.text}>
          Canal de suporte: {SUPPORT_EMAIL}{"\n"}
          Encarregado (DPO/LGPD): {DPO_EMAIL}
        </Text>

        <Text style={styles.section}>2. Quais dados coletamos</Text>
        <Text style={styles.text}>
          (a) Dados de conta: email e identificadores técnicos de autenticação.{"\n"}
          (b) Dados fornecidos por você: informações financeiras inseridas manualmente (ex.: metas, gastos, assinaturas).{"\n"}
          (c) Dados técnicos: logs essenciais de segurança, prevenção a fraude e diagnóstico (quando habilitado).
        </Text>

        <Text style={styles.section}>3. Finalidades e bases legais</Text>
        <Text style={styles.text}>
          Usamos dados para: (i) prestar o serviço, (ii) manter segurança e integridade, (iii) suporte, (iv) melhorias do app.
          Bases legais típicas: execução de contrato, legítimo interesse (segurança) e consentimento quando aplicável.
        </Text>

        <Text style={styles.section}>4. Compartilhamento</Text>
        <Text style={styles.text}>
          Não vendemos seus dados. Compartilhamos apenas quando necessário para operar o serviço (ex.: infraestrutura) ou por
          obrigação legal/ordem competente.
        </Text>

        <Text style={styles.section}>5. Retenção</Text>
        <Text style={styles.text}>
          Mantemos dados pelo tempo necessário para cumprir as finalidades do serviço e obrigações legais. Você pode solicitar
          exclusão/anonimização quando aplicável.
        </Text>

        <Text style={styles.section}>6. Segurança</Text>
        <Text style={styles.text}>
          Adotamos controles técnicos e organizacionais para proteger dados (ex.: criptografia em trânsito, controle de acesso,
          RLS no banco). Ainda assim, nenhum sistema é 100% imune.
        </Text>

        <Text style={styles.section}>7. Seus direitos (LGPD)</Text>
        <Text style={styles.text}>
          Você pode solicitar: confirmação de tratamento, acesso, correção, portabilidade, anonimização, bloqueio, eliminação,
          informação sobre compartilhamento e revogação de consentimento (quando aplicável).
        </Text>

        <Text style={styles.section}>8. Crianças e adolescentes</Text>
        <Text style={styles.text}>
          O NÖUS não é direcionado a menores. Se identificarmos uso indevido, poderemos restringir a conta.
        </Text>

        <Text style={styles.section}>9. Atualizações desta política</Text>
        <Text style={styles.text}>
          Podemos atualizar esta Política. Quando necessário, solicitaremos aceite de nova versão.
        </Text>

        <Text style={styles.footer}>Última atualização: {PRIVACY_VERSION}</Text>
      </ScrollView>

      {acceptMode ? (
        <LegalAcceptFooter
          accepted={accepted}
          setAccepted={setAccepted}
          loading={saving}
          buttonLabel="Aceito"
          onPressAccept={onAccept}
          helperText="Registramos versão e data do aceite."
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000", paddingHorizontal: 24 },
  header: { marginTop: 56, marginBottom: 16 },
  close: { fontSize: 28, color: "rgba(255,255,255,0.6)", marginBottom: 10, fontFamily: brandFont },
  title: { fontSize: 28, fontWeight: "600", color: "#fff", fontFamily: brandFont },
  subtitle: { marginTop: 6, fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: brandFont },
  content: { paddingBottom: 32 },
  section: { marginTop: 22, marginBottom: 8, fontSize: 16, fontWeight: "600", color: "#fff", fontFamily: brandFont },
  text: { fontSize: 14, lineHeight: 22, color: "rgba(255,255,255,0.65)", fontFamily: brandFont },
  footer: { marginTop: 28, fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: brandFont },
});

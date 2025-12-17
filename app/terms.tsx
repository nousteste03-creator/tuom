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
import { TERMS_VERSION, SUPPORT_EMAIL, DPO_EMAIL } from "@/lib/legalVersions";

const brandFont = Platform.select({
  ios: "SF Pro Display",
  default: "System",
});

export default function TermsScreen() {
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
      doc_type: "terms",
      version: TERMS_VERSION,
      metadata: { source: "screen" },
    });

    setSaving(false);

    if (error) {
      // duplicado é OK (idempotência manual)
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
        <Text style={styles.title}>Termos de Uso</Text>
        <Text style={styles.subtitle}>Versão {TERMS_VERSION}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.text}>
          Estes Termos regulam o uso do NÖUS. Ao utilizar o aplicativo, você declara que leu e concorda com as regras abaixo.
          Se você não concordar, não utilize o serviço.
        </Text>

        <Text style={styles.section}>1. Escopo do serviço</Text>
        <Text style={styles.text}>
          O NÖUS é uma plataforma de organização financeira pessoal: controle de gastos, metas, assinaturas, receitas,
          investimentos e conteúdos informativos. Alguns recursos podem exigir assinatura.
        </Text>

        <Text style={styles.section}>2. Não é consultoria</Text>
        <Text style={styles.text}>
          O NÖUS não presta consultoria financeira, jurídica ou contábil. Qualquer conteúdo, indicador, categorização ou insight
          é meramente informativo.
        </Text>

        <Text style={styles.section}>3. Responsabilidade do usuário</Text>
        <Text style={styles.text}>
          Você é responsável pela veracidade dos dados inseridos, pelas permissões concedidas e por suas decisões. O NÖUS não
          se responsabiliza por prejuízos decorrentes de escolhas baseadas em informações fornecidas pelo usuário.
        </Text>

        <Text style={styles.section}>4. Conta e segurança</Text>
        <Text style={styles.text}>
          Você deve manter suas credenciais seguras e notificar imediatamente em caso de uso indevido. O NÖUS pode bloquear
          acessos suspeitos para proteção da conta.
        </Text>

        <Text style={styles.section}>5. Conteúdos e propriedade intelectual</Text>
        <Text style={styles.text}>
          A marca, interface, textos e componentes do NÖUS são protegidos por direitos de propriedade intelectual. É proibida
          reprodução, engenharia reversa ou distribuição sem autorização.
        </Text>

        <Text style={styles.section}>6. Suspensão e encerramento</Text>
        <Text style={styles.text}>
          Podemos suspender ou encerrar contas em casos de fraude, abuso, violação destes Termos ou exigência legal.
        </Text>

        <Text style={styles.section}>7. Atualizações destes Termos</Text>
        <Text style={styles.text}>
          Estes Termos podem ser atualizados. Quando houver alteração relevante, você poderá ser solicitado a aceitar uma nova
          versão.
        </Text>

        <Text style={styles.section}>8. Contato</Text>
        <Text style={styles.text}>
          Suporte: {SUPPORT_EMAIL}{"\n"}
          Encarregado (DPO/LGPD): {DPO_EMAIL}
        </Text>

        <Text style={styles.footer}>Última atualização: {TERMS_VERSION}</Text>
      </ScrollView>

      {acceptMode ? (
        <LegalAcceptFooter
          accepted={accepted}
          setAccepted={setAccepted}
          loading={saving}
          buttonLabel="Aceito"
          onPressAccept={onAccept}
          helperText="Ao aceitar, registramos seu aceite de forma auditável."
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

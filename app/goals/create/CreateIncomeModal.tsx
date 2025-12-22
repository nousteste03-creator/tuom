// app/goals/create/CreateIncomeModal.tsx
import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Animated,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { BlurView } from "expo-blur";
import { useIncomeSources } from "@/hooks/useIncomeSources";
import { useUserPlan } from "@/hooks/useUserPlan";

/* ---------------------------------------------------------
   ENV – chamada às Edge Functions de insights
----------------------------------------------------------*/
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

async function callIncomeInsightsFunction(
  endpoint: "income-insights-free" | "income-insights-premium",
  payload: any
) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      "[CreateIncomeModal] Variáveis EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY não configuradas."
    );
  }

  const url = `${SUPABASE_URL}/functions/v1/${endpoint}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `[CreateIncomeModal] Erro HTTP em ${endpoint}: ${res.status} – ${text}`
    );
  }

  let json: any = null;
  try {
    json = await res.json();
  } catch {
    throw new Error(
      `[CreateIncomeModal] Resposta inválida de ${endpoint} (não é JSON).`
    );
  }

  return json;
}

const brandFont = Platform.select({
  ios: "SF Pro Display",
  android: "Inter",
  default: "System",
});

/* ---------------------------------------------------------
   Helpers
----------------------------------------------------------*/

// Normalização da data — aceita DD/MM/YYYY ou YYYY-MM-DD
function normalizeDateForSupabase(input: string): string | null {
  if (!input) return null;

  const date = input.trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }

  const match = date.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (match) {
    let [_, d, m, y] = match;
    if (y.length === 2) y = "20" + y;

    return `${y.padStart(4, "0")}-${m.padStart(2, "0")}-${d.padStart(
      2,
      "0"
    )}`;
  }

  return null;
}

function formatCurrency(value: number | null | undefined) {
  const v = typeof value === "number" ? value : 0;
  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    }).format(v);
  } catch {
    return `R$ ${v.toFixed(2)}`;
  }
}

function parseAmountInput(raw: string): number {
  if (!raw) return 0;
  const normalized = raw
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/[^\d.]/g, "");
  const v = parseFloat(normalized);
  return isNaN(v) ? 0 : v;
}

/* ---------------------------------------------------------
   Painel Inteligente (Step 3 / 4)
   Híbrido: heurística local + IA (free/premium)
----------------------------------------------------------*/

type IncomeInsightPanelProps = {
  name: string;
  frequency: string;
  amountNumber: number;
  normalizedNextDate: string | null;
  /** Texto vindo da IA (free/premium) ou null → usa heurística local */
  aiText?: string | null;
  /** Fonte do texto: local, free, premium ou error (para debug futuro) */
  aiSource?: "local" | "free" | "premium" | "error";
  /** Estado de loading enquanto IA está respondendo */
  loading?: boolean;
};

function IncomeInsightPanel({
  name,
  frequency,
  amountNumber,
  normalizedNextDate,
  aiText,
  aiSource,
  loading,
}: IncomeInsightPanelProps) {
  // renda mensal estimada
  const monthly = useMemo(() => {
    if (!amountNumber) return 0;
    switch (frequency) {
      case "weekly":
        return amountNumber * 4;
      case "biweekly":
        return amountNumber * 2;
      case "once":
        // aqui, por enquanto, consideramos 1x/mês
        return amountNumber;
      case "monthly":
      default:
        return amountNumber;
    }
  }, [amountNumber, frequency]);

  const yearly = monthly * 12;

  // dias até o próximo pagamento
  const { daysUntil, prettyDate } = useMemo(() => {
    if (!normalizedNextDate)
      return {
        daysUntil: null as number | null,
        prettyDate: null as string | null,
      };

    try {
      const today = new Date();
      const next = new Date(normalizedNextDate + "T00:00:00");
      const diffMs = next.getTime() - today.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      const [y, m, d] = normalizedNextDate.split("-");
      const pretty = `${d}/${m}/${y}`;

      return { daysUntil: diffDays, prettyDate: pretty };
    } catch {
      return {
        daysUntil: null as number | null,
        prettyDate: normalizedNextDate,
      };
    }
  }, [normalizedNextDate]);

  // texto heurístico local (backup)
  const localInsightText = useMemo(() => {
    if (!monthly) {
      return "Assim que você definir o valor desta renda, a TUÖM passa a projetar o impacto dela no seu mês.";
    }

    if (monthly >= 5000) {
      return "Esta é uma das principais forças do seu fluxo de caixa. Vale protegê-la e planejá-la com cuidado.";
    }

    if (monthly >= 2000) {
      return "Uma renda relevante, que já sustenta boa parte das despesas do mês.";
    }

    return "Uma boa fonte complementar. Com mais algumas rendas assim, sua base mensal fica bem mais estável.";
  }, [monthly]);

  // texto sobre data
  const dateText = useMemo(() => {
    if (!prettyDate) {
      return "Defina a data do próximo pagamento para ativar lembretes inteligentes.";
    }

    if (daysUntil === null) {
      return `Próximo pagamento previsto para ${prettyDate}.`;
    }

    if (daysUntil < 0) {
      return `Último pagamento estava previsto para ${prettyDate}. Assim que você atualizar a próxima data, a TUÖM recalcula tudo.`;
    }

    if (daysUntil === 0) {
      return "Pagamento previsto para hoje.";
    }

    if (daysUntil === 1) {
      return "Pagamento previsto para amanhã.";
    }

    return `Pagamento previsto para ${prettyDate} (em cerca de ${daysUntil} dias).`;
  }, [prettyDate, daysUntil]);

  // texto final mostrado no bloco "Como a TUÖM enxerga esta renda"
  const finalInsightText = useMemo(() => {
    if (loading) {
      return "Gerando uma leitura da PILA com base nos seus dados...";
    }

    if (aiText && aiText.trim().length > 0) {
      // texto vindo da IA (free/premium), já tratado no Edge Function
      return aiText;
    }

    // fallback para heurística local
    return `${localInsightText} No futuro, a PILA poderá refinar este texto usando OpenAI — sem alterar os cálculos reais.`;
  }, [aiText, loading, localInsightText]);

  return (
    <View style={styles.panelContainer}>
      <Text style={styles.panelTitle}>Visão desta renda</Text>

      {/* badge */}
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Projeção automática </Text>
      </View>

      {/* linha valores mensais / anuais */}
      <View style={styles.rowBetween}>
        <View>
          <Text style={styles.panelLabel}>Renda mensal estimada</Text>
          <Text style={styles.panelValue}>{formatCurrency(monthly)}</Text>
        </View>

        <View>
          <Text style={styles.panelLabel}>Renda anual aproximada</Text>
          <Text style={styles.panelValue}>{formatCurrency(yearly)}</Text>
        </View>
      </View>

      {/* mini “sparkline” textual (placeholder visual) */}
      <View style={styles.sparklineRow}>
        <View style={[styles.sparkBar, { height: 8, opacity: 0.4 }]} />
        <View style={[styles.sparkBar, { height: 14, opacity: 0.55 }]} />
        <View style={[styles.sparkBar, { height: 20, opacity: 0.7 }]} />
        <View style={[styles.sparkBar, { height: 26, opacity: 0.85 }]} />
        <View style={[styles.sparkBar, { height: 18, opacity: 0.65 }]} />
        <View style={[styles.sparkBar, { height: 22, opacity: 0.8 }]} />
      </View>

      {/* texto sobre data / notificações */}
      <Text style={[styles.panelLabel, { marginTop: 14 }]}>
        Próximo pagamento
      </Text>
      <Text style={styles.panelAIText}>{dateText}</Text>

      {/* insight da PILA (híbrido: IA + heurística) */}
      <Text style={[styles.panelLabel, { marginTop: 16 }]}>
        Como a TUÖM enxerga esta renda
      </Text>
      <Text style={styles.panelAIText}>{finalInsightText}</Text>

      {/* descrição final fixa */}
      <Text style={styles.panelDescription}>
        Esta projeção é baseada apenas no valor, frequência e data que você
        informou. Os cálculos são locais; a IA entra apenas para deixar a
        explicação mais clara.
      </Text>
    </View>
  );
}

/* ---------------------------------------------------------
   WIZARD PRINCIPAL
----------------------------------------------------------*/

type Props = {
  visible: boolean;
  onClose: () => void;
};

const TOTAL_STEPS = 4;

export default function CreateIncomeModal({ visible, onClose }: Props) {
  const { createIncomeSource, reload } = useIncomeSources();
  const { plan } = useUserPlan(); // FREE / PRO / etc.
  const isPro =
    plan === "PRO" || plan === "PREMIUM" || plan === "Premium" || plan === "pro";

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;

  const [step, setStep] = useState(0);

  const [name, setName] = useState("");
  const [incomeType, setIncomeType] = useState<
    "salary" | "freelance" | "commission" | "variable" | "other"
  >("salary");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState<
    "monthly" | "weekly" | "biweekly" | "once"
  >("monthly");
  const [nextDate, setNextDate] = useState("");

  const [errors, setErrors] = useState<{
    name?: string;
    amount?: string;
    nextDate?: string;
  }>({});

  // painel
  const panelFade = useRef(new Animated.Value(0)).current;
  const panelTranslate = useRef(new Animated.Value(10)).current;

  // estado da IA híbrida
  const [insightAIText, setInsightAIText] = useState<string | null>(null);
  const [insightSource, setInsightSource] = useState<
    "local" | "free" | "premium" | "error"
  >("local");
  const [insightLoading, setInsightLoading] = useState(false);

  /* ---------------------------------------------------------
     Reset de erros e estado de insight ao abrir
  ----------------------------------------------------------*/
  useEffect(() => {
    if (visible) {
      setErrors({});
      setStep(0);
      setInsightAIText(null);
      setInsightSource("local");
      setInsightLoading(false);
    }
  }, [visible]);

  /* ---------------------------------------------------------
     Animação de entrada do modal
  ----------------------------------------------------------*/
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fade, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(slide, {
          toValue: 0,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fade.setValue(0);
      slide.setValue(20);
    }
  }, [visible, fade, slide]);

  /* ---------------------------------------------------------
     Animação do painel inteligente (Step 3 e 4)
  ----------------------------------------------------------*/
  useEffect(() => {
    if (step === 2 || step === 3) {
      Animated.parallel([
        Animated.timing(panelFade, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(panelTranslate, {
          toValue: 0,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      panelFade.setValue(0);
      panelTranslate.setValue(10);
    }
  }, [step, panelFade, panelTranslate]);

  /* ---------------------------------------------------------
     Parsed values
  ----------------------------------------------------------*/
  const amountNumber = useMemo(() => parseAmountInput(amount), [amount]);
  const normalizedNextDate = useMemo(
    () => normalizeDateForSupabase(nextDate),
    [nextDate]
  );

  /* ---------------------------------------------------------
     IA HÍBRIDA – Income Insights (free + premium)
     - Usa mesmos dados do painel, sem alterar layout
  ----------------------------------------------------------*/
  useEffect(() => {
    // só roda se modal visível e painel em foco
    if (!visible) return;
    if (!(step === 2 || step === 3)) return;

    // precisa de valor + data válida para fazer sentido
    if (!amountNumber || amountNumber <= 0) return;
    if (!normalizedNextDate) return;

    const controller = new AbortController();
    const signal = controller.signal;

    async function runHybridInsights() {
      try {
        setInsightLoading(true);
        setInsightSource("local");
        setInsightAIText(null);

        // monta payload enxuto para a função
        // (mantendo coerência com as Edge Functions income-insights-*)
        const monthly =
          frequency === "weekly"
            ? amountNumber * 4
            : frequency === "biweekly"
            ? amountNumber * 2
            : amountNumber; // monthly/once -> amountNumber

        const payload = {
          name: name.trim() || null,
          incomeType,
          frequency,
          amount: amountNumber,
          monthly,
          nextDate: normalizedNextDate,
        };

        console.log(
          "[CreateIncomeModal] Chamando income-insights (hybrid), payload:",
          payload
        );

        let response: any = null;
        let source: "free" | "premium" | "error" = "free";

        // Usuário PRO → primeiro tenta premium, cai para free se falhar
        if (isPro) {
          try {
            response = await callIncomeInsightsFunction(
              "income-insights-premium",
              payload
            );
            source = "premium";
          } catch (err) {
            console.log(
              "[CreateIncomeModal] Erro em income-insights-premium, tentando FREE. Detalhe:",
              err
            );
          }
        }

        // FREE ou fallback do premium
        if (!response) {
          try {
            response = await callIncomeInsightsFunction(
              "income-insights-free",
              payload
            );
            if (source !== "premium") {
              source = "free";
            }
          } catch (err) {
            console.log(
              "[CreateIncomeModal] Erro em income-insights-free. Detalhe:",
              err
            );
            source = "error";
          }
        }

        if (signal.aborted) return;

        // tenta extrair o texto de forma resiliente
        const text =
          response?.insightText ||
          response?.insight_text ||
          response?.text ||
          null;

        if (text && typeof text === "string") {
          setInsightAIText(text);
          setInsightSource(source);
        } else {
          setInsightAIText(null);
          setInsightSource("error");
        }

        console.log(
          "[CreateIncomeModal] Resultado income-insights:",
          source,
          text
        );
      } catch (err) {
        if (signal.aborted) return;
        console.log(
          "[CreateIncomeModal] Erro inesperado em income-insights:",
          err
        );
        setInsightAIText(null);
        setInsightSource("error");
      } finally {
        if (!signal.aborted) {
          setInsightLoading(false);
        }
      }
    }

    runHybridInsights();

    return () => {
      controller.abort();
    };
  }, [
    visible,
    step,
    amountNumber,
    normalizedNextDate,
    frequency,
    name,
    incomeType,
    isPro,
  ]);

  /* ---------------------------------------------------------
     Validação por step
  ----------------------------------------------------------*/
  function validateStep(currentStep: number) {
    const newErrors: typeof errors = {};

    if (currentStep === 0) {
      if (!name.trim()) newErrors.name = "Preencha o nome da sua renda.";
    }

    if (currentStep === 1) {
      if (!amount.trim()) newErrors.amount = "Informe o valor desta renda.";
      if (!amountNumber || amountNumber <= 0) {
        newErrors.amount = "Valor precisa ser maior que zero.";
      }
    }

    if (currentStep === 2) {
      if (!nextDate.trim()) {
        newErrors.nextDate = "Defina a data do próximo pagamento.";
      } else if (!normalizedNextDate) {
        newErrors.nextDate = "Use o formato AAAA-MM-DD ou DD/MM/AAAA.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  /* ---------------------------------------------------------
     Navegação entre steps
  ----------------------------------------------------------*/
  function handleNext() {
    if (!validateStep(step)) return;
    if (step < TOTAL_STEPS - 1) {
      setStep((prev) => prev + 1);
    }
  }

  function handleBack() {
    if (step > 0) {
      setStep((prev) => prev - 1);
    } else {
      onClose();
    }
  }

  /* ---------------------------------------------------------
     CREATE
  ----------------------------------------------------------*/
  const handleCreate = async () => {
    // valida todos os steps críticos
    if (!validateStep(0) || !validateStep(1) || !validateStep(2)) {
      return;
    }

    const normalizedDate = normalizeDateForSupabase(nextDate);
    const payload = {
      name: name.trim(),
      amount: amountNumber || 0,
      frequency,
      nextDate: normalizedDate,
      // incomeType é meta-dado local — se no futuro você quiser salvar:
      // type: incomeType,
    };

    console.log("DEBUG/CreateIncomeModal → payload:", payload);

    const id = await createIncomeSource(payload);
    console.log(
      "DEBUG/CreateIncomeModal → createIncomeSource retornou:",
      id
    );

    await reload();
    setTimeout(onClose, 120);
  };

  if (!visible) return null;

  /* ---------------------------------------------------------
     Steps (UI)
  ----------------------------------------------------------*/

  const Steps = [
    // STEP 1 — Nome + Tipo
    <View style={styles.step} key="s1">
      <Text style={styles.stepTitle}>Como devemos chamar esta renda?</Text>
      <Text style={styles.stepSubtitle}>
        Use um nome claro — ele aparecerá em relatórios, projeções e
        notificações.
      </Text>

      <View
        style={[styles.inputGlass, errors.name && styles.cardErrorBorder]}
      >
        <Text style={styles.label}>Nome da fonte</Text>
        <TextInput
          placeholder="Ex: Salário CLT, Freelance, Comissão..."
          placeholderTextColor="#777"
          style={styles.input}
          value={name}
          onChangeText={setName}
        />
      </View>
      {errors.name && <Text style={styles.errorInline}>{errors.name}</Text>}

      <Text style={[styles.label, { marginTop: 18 }]}>Tipo de renda</Text>
      <View style={styles.typeRow}>
        {[
          { key: "salary", label: "Salário" },
          { key: "freelance", label: "Freelance" },
          { key: "commission", label: "Comissão" },
          { key: "variable", label: "Variável" },
          { key: "other", label: "Outras" },
        ].map((opt) => (
          <TouchableOpacity
            key={opt.key}
            style={[
              styles.typeChip,
              incomeType === opt.key && styles.typeChipActive,
            ]}
            onPress={() =>
              setIncomeType(
                opt.key as
                  | "salary"
                  | "freelance"
                  | "commission"
                  | "variable"
                  | "other"
              )
            }
          >
            <Text
              style={[
                styles.typeChipText,
                incomeType === opt.key && styles.typeChipTextActive,
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>,

    // STEP 2 — Valor + Frequência
    <View style={styles.step} key="s2">
      <Text style={styles.stepTitle}>Quanto você recebe?</Text>
      <Text style={styles.stepSubtitle}>
        Informe o valor bruto desta renda e a frequência em que ela acontece.
      </Text>

      <View
        style={[styles.inputGlass, errors.amount && styles.cardErrorBorder]}
      >
        <Text style={styles.label}>Valor</Text>
        <TextInput
          placeholder="0,00"
          keyboardType="numeric"
          placeholderTextColor="#777"
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
        />
      </View>
      {errors.amount && (
        <Text style={styles.errorInline}>{errors.amount}</Text>
      )}

      <Text style={[styles.label, { marginTop: 18 }]}>Frequência</Text>
      <View style={styles.typeRow}>
        {[
          { key: "monthly", label: "Mensal" },
          { key: "weekly", label: "Semanal" },
          { key: "biweekly", label: "Quinzenal" },
          { key: "once", label: "Única" },
        ].map((opt) => (
          <TouchableOpacity
            key={opt.key}
            style={[
              styles.typeChip,
              frequency === opt.key && styles.typeChipActive,
            ]}
            onPress={() =>
              setFrequency(
                opt.key as "monthly" | "weekly" | "biweekly" | "once"
              )
            }
          >
            <Text
              style={[
                styles.typeChipText,
                frequency === opt.key && styles.typeChipTextActive,
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>,

    // STEP 3 — Data obrigatória + painel
    <View style={styles.step} key="s3">
      <Text style={styles.stepTitle}>Quando você recebe?</Text>
      <Text style={styles.stepSubtitle}>
        A data do próximo pagamento ativa lembretes inteligentes e projeções de
        caixa.
      </Text>

      <View
        style={[styles.inputGlass, errors.nextDate && styles.cardErrorBorder]}
      >
        <Text style={styles.label}>Próximo pagamento</Text>
        <TextInput
          placeholder="AAAA-MM-DD ou DD/MM/AAAA"
          placeholderTextColor="#777"
          style={styles.input}
          value={nextDate}
          onChangeText={setNextDate}
        />
      </View>
      {errors.nextDate && (
        <Text style={styles.errorInline}>{errors.nextDate}</Text>
      )}

      <Text style={styles.helperText}>
        Usamos essa data para avisar quando o pagamento estiver chegando e para
        estimar sua renda do mês.
      </Text>
    </View>,

    // STEP 4 — Revisão
    <View style={styles.step} key="s4">
      <Text style={styles.stepTitle}>Revisar detalhes</Text>
      <Text style={styles.stepSubtitle}>
        Confirme se está tudo certo antes de adicionar esta renda ao seu
        painel.
      </Text>

      <View style={styles.reviewCard}>
        <View style={styles.reviewRow}>
          <Text style={styles.reviewLabel}>Nome</Text>
          <Text style={styles.reviewValue}>{name || "—"}</Text>
        </View>
        <View style={styles.reviewRow}>
          <Text style={styles.reviewLabel}>Tipo</Text>
          <Text style={styles.reviewValue}>
            {incomeType === "salary"
              ? "Salário"
              : incomeType === "freelance"
              ? "Freelance"
              : incomeType === "commission"
              ? "Comissão"
              : incomeType === "variable"
              ? "Variável"
              : "Outras"}
          </Text>
        </View>
        <View style={styles.reviewRow}>
          <Text style={styles.reviewLabel}>Valor</Text>
          <Text style={styles.reviewValue}>{formatCurrency(amountNumber)}</Text>
        </View>
        <View style={styles.reviewRow}>
          <Text style={styles.reviewLabel}>Frequência</Text>
          <Text style={styles.reviewValue}>
            {frequency === "monthly"
              ? "Mensal"
              : frequency === "weekly"
              ? "Semanal"
              : frequency === "biweekly"
              ? "Quinzenal"
              : "Única"}
          </Text>
        </View>
        <View style={styles.reviewRow}>
          <Text style={styles.reviewLabel}>Próximo pagamento</Text>
          <Text style={styles.reviewValue}>{nextDate || "—"}</Text>
        </View>
      </View>
    </View>,
  ];

  const canNextFromStep0 = name.trim().length > 0;

  /* ---------------------------------------------------------
     Render
  ----------------------------------------------------------*/
  return (
    <Animated.View
      style={[
        styles.overlay,
        { opacity: fade, transform: [{ translateY: slide }] },
      ]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.fullscreenContainer}>
          {/* HEADER */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.closeBtn}>
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>

            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>Nova receita</Text>
              <Text style={styles.headerSubtitle}>
                Cadastre uma fonte de renda para alimentar seu fluxo mensal.
              </Text>
            </View>

            <Text style={styles.stepIndicator}>
              {step + 1}/{TOTAL_STEPS}
            </Text>
          </View>

          {/* PROGRESS BAR */}
          <View style={styles.progressContainer}>
            <View
              style={[
                styles.progressBar,
                { width: `${((step + 1) / TOTAL_STEPS) * 100}%` },
              ]}
            />
          </View>

          {/* CONTEÚDO */}
          <View style={styles.contentArea}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 200 }}
            >
              <BlurView
                intensity={30}
                tint="dark"
                style={styles.wizardContainer}
              >
                <View style={styles.stepScrollContent}>{Steps[step]}</View>
              </BlurView>

              {(step === 2 || step === 3) && (
                <Animated.View
                  style={[
                    styles.panelWrapper,
                    {
                      opacity: panelFade,
                      transform: [{ translateY: panelTranslate }],
                    },
                  ]}
                >
                  <IncomeInsightPanel
                    name={name}
                    frequency={frequency}
                    amountNumber={amountNumber}
                    normalizedNextDate={normalizedNextDate}
                    aiText={insightAIText}
                    aiSource={insightSource}
                    loading={insightLoading}
                  />
                </Animated.View>
              )}
            </ScrollView>
          </View>

          {/* FOOTER */}
          <View style={styles.footer}>
            {step < TOTAL_STEPS - 1 ? (
              <TouchableOpacity
                onPress={handleNext}
                style={[
                  styles.primaryBtn,
                  step === 0 && !canNextFromStep0 && styles.buttonDisabled,
                ]}
                disabled={step === 0 && !canNextFromStep0}
              >
                <Text style={styles.primaryBtnText}>Continuar</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={handleCreate} style={styles.primaryBtn}>
                <Text style={styles.primaryBtnText}>Adicionar receita</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={onClose} style={{ marginTop: 12 }}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Animated.View>
  );
}

/* ---------------------------------------------------------
   STYLES — Imersivo, padrão wizard TUÖM
----------------------------------------------------------*/
const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.65)",
  },

  fullscreenContainer: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: "#000",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 10,
  },

  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  closeText: {
    color: "#fff",
    fontSize: 24,
  },

  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontFamily: brandFont,
    fontWeight: "600",
  },

  headerSubtitle: {
    color: "#777",
    fontSize: 13,
    fontFamily: brandFont,
  },

  stepIndicator: {
    color: "#aaa",
    fontSize: 14,
    marginLeft: 6,
    fontFamily: brandFont,
  },

  progressContainer: {
    height: 3,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 16,
  },

  progressBar: {
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.35)",
  },

  contentArea: {
    flex: 1,
    paddingHorizontal: 16,
  },

  wizardContainer: {
    borderRadius: 26,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: 20,
  },

  stepScrollContent: {
    paddingHorizontal: 18,
    paddingVertical: 22,
  },

  step: {
    width: "100%",
  },

  stepTitle: {
    color: "#fff",
    fontSize: 22,
    fontFamily: brandFont,
    fontWeight: "600",
    marginBottom: 8,
  },

  stepSubtitle: {
    color: "#aaa",
    fontSize: 14,
    marginBottom: 18,
    fontFamily: brandFont,
  },

  inputGlass: {
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    marginBottom: 12,
  },

  label: {
    color: "#aaa",
    fontSize: 13,
    marginBottom: 4,
    fontFamily: brandFont,
  },

  input: {
    color: "#fff",
    fontSize: 17,
    fontFamily: brandFont,
  },

  helperText: {
    marginTop: 6,
    color: "#666",
    fontSize: 12,
  },

  errorInline: {
    marginTop: 4,
    color: "rgba(255,70,70,0.9)",
    fontSize: 12,
    fontFamily: brandFont,
  },

  cardErrorBorder: {
    borderColor: "rgba(255,80,80,0.55)",
  },

  typeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    gap: 8,
  },

  typeChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.02)",
  },

  typeChipActive: {
    backgroundColor: "rgba(255,255,255,0.16)",
    borderColor: "rgba(255,255,255,0.45)",
  },

  typeChipText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontFamily: brandFont,
  },

  typeChipTextActive: {
    color: "#fff",
    fontWeight: "600",
  },

  reviewCard: {
    marginTop: 10,
    padding: 16,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  reviewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  reviewLabel: {
    color: "#aaa",
    fontSize: 13,
    fontFamily: brandFont,
  },

  reviewValue: {
    color: "#fff",
    fontSize: 14,
    fontFamily: brandFont,
  },

  /* Painel */

  panelWrapper: {
    marginBottom: 20,
  },

  panelContainer: {
    borderRadius: 22,
    padding: 22,
    backgroundColor: "rgba(10,10,12,0.92)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    minHeight: 150,
  },

  panelTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    fontFamily: brandFont,
    marginBottom: 6,
  },

  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginBottom: 14,
  },

  badgeText: {
    color: "#bbb",
    fontSize: 11,
    fontFamily: brandFont,
  },

  panelLabel: {
    color: "#bbb",
    fontSize: 13,
    marginBottom: 4,
    fontFamily: brandFont,
  },

  panelValue: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
    fontFamily: brandFont,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },

  sparklineRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 16,
    gap: 4,
  },

  sparkBar: {
    flex: 1,
    borderRadius: 999,
    backgroundColor: "rgba(120, 200, 255, 0.85)",
  },

  panelAIText: {
    color: "#ddd",
    fontSize: 14,
    marginTop: 4,
    lineHeight: 19,
    fontFamily: brandFont,
  },

  panelDescription: {
    marginTop: 14,
    color: "#888",
    fontSize: 12,
    lineHeight: 17,
    fontFamily: brandFont,
  },

  footer: {
    padding: 20,
  },

  primaryBtn: {
    backgroundColor: "rgba(255,255,255,0.14)",
    height: 54,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
  },

  primaryBtnText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
    fontFamily: brandFont,
  },

  buttonDisabled: {
    opacity: 0.4,
  },

  cancelText: {
    color: "#888",
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
    fontFamily: brandFont,
  },
});

// app/goals/details/debt-pay.tsx
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
  TextInput,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

import Screen from "@/components/layout/Screen";
import GoalDebtMainCard from "@/components/app/goals/GoalDebtMainCard";
import GoalInstallmentsTimeline from "@/components/app/goals/GoalInstallmentsTimeline";

import { useGoals } from "@/context/GoalsContext";

const brandFont = Platform.select({
  ios: "SF Pro Display",
  android: "Inter",
  default: "System",
});

/* ------------------------------------------------------------
   Helpers
------------------------------------------------------------ */
function formatCurrency(v: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(v);
}

function formatDateShort(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}`;
}

// Normaliza "DD/MM/AAAA" ou iso já válido para iso (YYYY-MM-DDTHH:MM:SSZ)
function normalizeDateForSupabase(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();

  // Já veio formato ISO completo
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    return new Date(trimmed).toISOString();
  }

  // DD/MM/AAAA ou D/M/AA
  const match = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (match) {
    let [, d, m, y] = match;
    if (y.length === 2) y = "20" + y;
    const isoBase = `${y.padStart(4, "0")}-${m.padStart(2, "0")}-${d.padStart(
      2,
      "0"
    )}T00:00:00.000Z`;
    return new Date(isoBase).toISOString();
  }

  return null;
}

export default function DebtPayScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const id = params?.id ?? null;

  const {
    debts,
    createInstallment,
    updateGoal,
    updateInstallment,
    reload,
    loading,
  } = useGoals();

  const [saving, setSaving] = useState(false);

  // Wizard manual
  const [manualMode, setManualMode] = useState<"idle" | "wizard">("idle");
  const [manualStep, setManualStep] = useState<1 | 2 | 3 | 4>(1);
  const [manualAmount, setManualAmount] = useState<string>("");
  const [manualDateInput, setManualDateInput] = useState<string>("");
  const [manualStatus, setManualStatus] = useState<"paid" | "upcoming">("paid");

  /* ------------------------------------------------------------
     Buscar dívida
  ------------------------------------------------------------ */
  const debt = useMemo(() => {
    if (!id) return null;
    return debts.find((d) => d.id === id) ?? null;
  }, [id, debts]);

  const installmentsAll = debt?.installments ?? [];
  const paidCount = installmentsAll.filter((i) => i.status === "paid").length;
  const totalCount = installmentsAll.length;

  const upcomingInstallments = installmentsAll.filter(
    (i) => i.status !== "paid"
  );

  const nextInstallment =
    upcomingInstallments.length > 0
      ? upcomingInstallments.reduce((acc, cur) => {
          const accTime = new Date(acc.dueDate).getTime();
          const curTime = new Date(cur.dueDate).getTime();
          return curTime < accTime ? cur : acc;
        })
      : null;

  const remaining = debt
    ? Math.max(debt.targetAmount - debt.currentAmount, 0)
    : 0;

  const progress =
    debt && debt.targetAmount > 0
      ? debt.currentAmount / debt.targetAmount
      : 0;

  const isNearFinish =
    debt && debt.targetAmount > 0 && remaining / debt.targetAmount <= 0.2;

  /* ------------------------------------------------------------
     Loading / Not Found
  ------------------------------------------------------------ */
  if (loading && !debt) {
    return (
      <Screen style={styles.center}>
        <ActivityIndicator size="large" color="#fff" />
      </Screen>
    );
  }

  if (!debt) {
    return (
      <Screen style={styles.center}>
        <Text style={styles.notFound}>Dívida não encontrada.</Text>

        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>
      </Screen>
    );
  }

  /* ------------------------------------------------------------
     PAGAR PRÓXIMA PARCELA AUTOMÁTICA
  ------------------------------------------------------------ */
  const handlePayNext = async () => {
    if (!nextInstallment) return;

    try {
      setSaving(true);

      await updateInstallment(nextInstallment.id, {
        status: "paid",
      });

      await updateGoal(debt.id, {
        currentAmount: debt.currentAmount + nextInstallment.amount,
      });

      await reload();
    } catch (err) {
      console.log("ERROR/handlePayNext:", err);
    } finally {
      setSaving(false);
    }
  };

  /* ------------------------------------------------------------
     PAGAR TODAS AS PARCELAS FUTURAS
  ------------------------------------------------------------ */
  const handlePayAllPending = async () => {
    if (upcomingInstallments.length === 0) return;

    try {
      setSaving(true);

      let totalPaid = 0;

      for (const inst of upcomingInstallments) {
        totalPaid += inst.amount;

        await updateInstallment(inst.id, {
          status: "paid",
        });
      }

      await updateGoal(debt.id, {
        currentAmount: debt.currentAmount + totalPaid,
      });

      await reload();
    } catch (err) {
      console.log("ERROR/handlePayAllPending:", err);
    } finally {
      setSaving(false);
    }
  };

  /* ------------------------------------------------------------
     WIZARD MANUAL — helpers
  ------------------------------------------------------------ */

  const startManualWizard = () => {
    // inicia wizard com defaults
    setManualMode("wizard");
    setManualStep(1);

    if (!manualAmount) {
      // sugestão: 10% do restante, só como default
      const suggested = remaining > 0 ? remaining * 0.1 : 0;
      if (suggested > 0) {
        setManualAmount(String(Math.round(suggested)));
      }
    }

    if (!manualDateInput) {
      const today = new Date();
      const d = String(today.getDate()).padStart(2, "0");
      const m = String(today.getMonth() + 1).padStart(2, "0");
      const y = String(today.getFullYear());
      setManualDateInput(`${d}/${m}/${y}`);
    }
  };

  const resetManualWizard = () => {
    setManualMode("idle");
    setManualStep(1);
    // mantém amount/date se você quiser continuidade, então não limpo aqui
  };

  const canGoNextStep = () => {
    if (manualStep === 1) {
      const num = Number(manualAmount.replace(",", "."));
      return !Number.isNaN(num) && num > 0;
    }
    if (manualStep === 2) {
      return !!manualDateInput.trim();
    }
    if (manualStep === 3) {
      return manualStatus === "paid" || manualStatus === "upcoming";
    }
    return true;
  };

  const goNext = () => {
    if (!canGoNextStep()) return;
    if (manualStep < 4) {
      setManualStep((prev) => (prev + 1) as 1 | 2 | 3 | 4);
    }
  };

  const goBackStep = () => {
    if (manualStep === 1) {
      resetManualWizard();
    } else {
      setManualStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
    }
  };

  const handleManualConfirm = async () => {
    try {
      setSaving(true);

      const amountNumber = Number(manualAmount.replace(",", "."));
      if (!amountNumber || amountNumber <= 0) {
        setSaving(false);
        return;
      }

      const normalizedDate =
        normalizeDateForSupabase(manualDateInput) ??
        new Date().toISOString();

await createInstallment(debt.id, {
  amount: amountNumber,
  dueDate: normalizedDate,
  status: manualStatus,
});

      if (manualStatus === "paid") {
        await updateGoal(debt.id, {
          currentAmount: debt.currentAmount + amountNumber,
        });
      }

      await reload();

      resetManualWizard();
    } catch (err) {
      console.log("ERROR/manualConfirm:", err);
    } finally {
      setSaving(false);
    }
  };

  /* ------------------------------------------------------------
     UI WIZARD — blocos por passo
  ------------------------------------------------------------ */

  const renderWizardStep = () => {
    if (manualMode !== "wizard") return null;

    return (
      <View style={styles.wizardWrapper}>
        <Text style={styles.wizardStepLabel}>Pagamento manual</Text>
        <Text style={styles.wizardStepSubtitle}>
          Passo {manualStep} de 4
        </Text>

        {/* PASSO 1 — VALOR */}
        {manualStep === 1 && (
          <View style={styles.wizardCard}>
            <Text style={styles.wizardLabel}>Quanto você quer pagar?</Text>
            <Text style={styles.wizardHint}>
              Saldo atual: {formatCurrency(remaining)} restante.
            </Text>

            <View style={styles.amountRow}>
              <Text style={styles.amountPrefix}>R$</Text>
              <TextInput
                value={manualAmount}
                onChangeText={setManualAmount}
                keyboardType="numeric"
                placeholder="0,00"
                placeholderTextColor="rgba(255,255,255,0.35)"
                style={styles.amountInput}
              />
            </View>

            <Text style={styles.wizardSmallInfo}>
              Você pode pagar qualquer valor, parcial ou total.
            </Text>
          </View>
        )}

        {/* PASSO 2 — DATA */}
        {manualStep === 2 && (
          <View style={styles.wizardCard}>
            <Text style={styles.wizardLabel}>Quando foi (ou será) o pagamento?</Text>

            <View style={styles.chipsRow}>
              <TouchableOpacity
                style={styles.chip}
                onPress={() => {
                  const t = new Date();
                  const d = String(t.getDate()).padStart(2, "0");
                  const m = String(t.getMonth() + 1).padStart(2, "0");
                  const y = String(t.getFullYear());
                  setManualDateInput(`${d}/${m}/${y}`);
                }}
              >
                <Text style={styles.chipText}>Hoje</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.chip}
                onPress={() => {
                  const t = new Date();
                  t.setDate(t.getDate() + 1);
                  const d = String(t.getDate()).padStart(2, "0");
                  const m = String(t.getMonth() + 1).padStart(2, "0");
                  const y = String(t.getFullYear());
                  setManualDateInput(`${d}/${m}/${y}`);
                }}
              >
                <Text style={styles.chipText}>Amanhã</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.wizardHint, { marginTop: 16 }]}>
              Ou escolha uma data:
            </Text>
            <TextInput
              value={manualDateInput}
              onChangeText={setManualDateInput}
              placeholder="DD/MM/AAAA"
              placeholderTextColor="rgba(255,255,255,0.35)"
              style={styles.input}
            />
          </View>
        )}

        {/* PASSO 3 — TIPO */}
        {manualStep === 3 && (
          <View style={styles.wizardCard}>
            <Text style={styles.wizardLabel}>Como esse pagamento entra?</Text>

            <Text style={styles.wizardHint}>
              Isso impacta a linha do tempo e o valor acumulado da dívida.
            </Text>

            <View style={styles.typeRow}>
              <TouchableOpacity
                style={[
                  styles.typeBtn,
                  manualStatus === "paid" && styles.typeBtnActive,
                ]}
                onPress={() => setManualStatus("paid")}
              >
                <Text
                  style={[
                    styles.typeText,
                    manualStatus === "paid" && styles.typeTextActive,
                  ]}
                >
                  Já pago
                </Text>
                <Text style={styles.typeSubText}>
                  Soma no valor pago imediatamente.
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeBtn,
                  manualStatus === "upcoming" && styles.typeBtnActive,
                ]}
                onPress={() => setManualStatus("upcoming")}
              >
                <Text
                  style={[
                    styles.typeText,
                    manualStatus === "upcoming" && styles.typeTextActive,
                  ]}
                >
                  Parcela futura
                </Text>
                <Text style={styles.typeSubText}>
                  Entra como parcela na timeline, ainda não paga.
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* PASSO 4 — CONFIRMAÇÃO */}
        {manualStep === 4 && (
          <View style={styles.wizardCard}>
            <Text style={styles.wizardLabel}>Confirmar pagamento</Text>

            <View style={{ marginTop: 10 }}>
              <Text style={styles.summaryLabel}>Valor</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(
                  Number(manualAmount.replace(",", ".")) || 0
                )}
              </Text>

              <Text style={[styles.summaryLabel, { marginTop: 10 }]}>
                Data
              </Text>
              <Text style={styles.summaryValue}>{manualDateInput}</Text>

              <Text style={[styles.summaryLabel, { marginTop: 10 }]}>
                Tipo
              </Text>
              <Text style={styles.summaryValue}>
                {manualStatus === "paid" ? "Já pago" : "Parcela futura"}
              </Text>

              {manualStatus === "paid" && (
                <>
                  <Text style={[styles.summaryLabel, { marginTop: 10 }]}>
                    Saldo após pagamento (estimado)
                  </Text>
                  <Text style={styles.summaryValueDanger}>
                    {formatCurrency(
                      Math.max(
                        remaining -
                          (Number(manualAmount.replace(",", ".")) || 0),
                        0
                      )
                    )}
                  </Text>
                </>
              )}
            </View>
          </View>
        )}

        {/* FOOTER WIZARD */}
        <View style={styles.wizardFooter}>
          <TouchableOpacity
            style={styles.wizardBackBtn}
            onPress={goBackStep}
            disabled={saving}
          >
            <Text style={styles.wizardBackText}>
              {manualStep === 1 ? "Cancelar" : "Voltar"}
            </Text>
          </TouchableOpacity>

          {manualStep < 4 ? (
            <TouchableOpacity
              style={[
                styles.wizardNextBtn,
                !canGoNextStep() && { opacity: 0.4 },
              ]}
              onPress={goNext}
              disabled={!canGoNextStep() || saving}
            >
              <Text style={styles.wizardNextText}>Continuar</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.wizardNextBtn}
              onPress={handleManualConfirm}
              disabled={saving}
            >
              <Text style={styles.wizardNextText}>
                {saving ? "Processando..." : "Registrar pagamento"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  /* ------------------------------------------------------------
     UI
  ------------------------------------------------------------ */
  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* HEADER */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>

        <Text style={styles.titleHeader}>Registrar Pagamento</Text>

          <View style={{ width: 32 }} />
        </View>

        {/* HERO CARD */}
        <GoalDebtMainCard
          debt={debt}
          showSettleButton
          onPressPay={handlePayNext}
          onPressEdit={() =>
            router.push(`/goals/details/debt-edit?id=${debt.id}`)
          }
          onPressSettle={() =>
            router.push(`/goals/details/debt-settle?id=${debt.id}`)
          }
        />

        {/* QUASE QUITADO */}
        {isNearFinish && (
          <View style={styles.nearFinishBox}>
            <Text style={styles.nearFinishTitle}>Falta pouco para quitar</Text>
            <Text style={styles.nearFinishText}>
              Restam {formatCurrency(remaining)} para encerrar essa dívida.
            </Text>
          </View>
        )}

        {/* AÇÕES RÁPIDAS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ações rápidas</Text>

          {/* Pagar próxima automática */}
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={handlePayNext}
            disabled={!nextInstallment || saving}
          >
            <Text style={styles.primaryText}>
              {nextInstallment
                ? `Registrar próxima parcela (${formatCurrency(
                    nextInstallment.amount
                  )})`
                : "Nenhuma parcela futura"}
            </Text>
          </TouchableOpacity>

          {/* Pagar todas futuras */}
          <TouchableOpacity
            style={[
              styles.secondaryBtn,
              upcomingInstallments.length === 0 && { opacity: 0.4 },
            ]}
            onPress={handlePayAllPending}
            disabled={upcomingInstallments.length === 0 || saving}
          >
            <Text style={styles.secondaryText}>
              Registrar todas as parcelas pendentes
            </Text>
          </TouchableOpacity>

          {/* PAGAMENTO MANUAL — abre WIZARD */}
          {manualMode === "idle" && (
            <TouchableOpacity
              style={styles.manualBtn}
              onPress={startManualWizard}
              disabled={saving}
            >
              <Text style={styles.manualBtnText}>
                Registrar pagamento manual
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* WIZARD MANUAL */}
        {renderWizardStep()}

        {/* RESUMO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo da dívida</Text>

          <View style={styles.card}>
            <Text style={styles.label}>Total da dívida</Text>
            <Text style={styles.value}>
              {formatCurrency(debt.targetAmount)}
            </Text>

            <Text style={[styles.label, { marginTop: 10 }]}>Já pago</Text>
            <Text style={styles.value}>
              {formatCurrency(debt.currentAmount)}
            </Text>

            <Text style={[styles.label, { marginTop: 10 }]}>Restante</Text>
            <Text style={styles.valueRemaining}>
              {formatCurrency(remaining)}
            </Text>

            <Text style={[styles.progressInfo, { marginTop: 10 }]}>
              Progresso: {Math.round(progress * 100)}%
            </Text>
          </View>
        </View>

        {/* TIMELINE */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Parcelas</Text>

          <GoalInstallmentsTimeline installments={installmentsAll} />

          <View style={styles.timelineFooterRow}>
            <Text style={styles.timelineFooterLeft}>
              {paidCount} de {totalCount} pagas
            </Text>

            {nextInstallment ? (
              <Text style={styles.timelineFooterRight}>
                Próxima: {formatCurrency(nextInstallment.amount)} •{" "}
                {formatDateShort(nextInstallment.dueDate)}
              </Text>
            ) : (
              <Text style={styles.timelineFooterRight}>
                Nenhuma parcela futura
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

/* =============================================================
   Styles
============================================================= */
const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  notFound: {
    fontFamily: brandFont,
    fontSize: 18,
    color: "#fff",
    marginBottom: 14,
  },

  backBtn: {
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  backText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: brandFont,
  },

  headerRow: {
    paddingTop: 12,
    paddingBottom: 18,
    paddingHorizontal: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: {
    color: "#fff",
    fontSize: 28,
    marginTop: -4,
  },
  titleHeader: {
    fontFamily: brandFont,
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
  },

  section: {
    marginTop: 26,
    paddingHorizontal: 18,
  },
  sectionTitle: {
    fontFamily: brandFont,
    fontSize: 17,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 12,
  },

  primaryBtn: {
    backgroundColor: "#d8ecee",
    paddingVertical: 15,
    borderRadius: 14,
    marginTop: 4,
  },
  primaryText: {
    fontFamily: brandFont,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "700",
    color: "#6A6A99",
  },

  secondaryBtn: {
    backgroundColor: "rgba(255,255,255,0.06)",
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    marginTop: 10,
  },
  secondaryText: {
    fontFamily: brandFont,
    textAlign: "center",
    fontSize: 14,
    color: "#FFFFFF",
  },

  manualBtn: {
    marginTop: 10,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  manualBtnText: {
    fontFamily: brandFont,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
    color: "#C7F1EF",
  },

  card: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    marginBottom: 18,
  },

  label: {
    fontFamily: brandFont,
    color: "rgba(255,255,255,0.55)",
    fontSize: 13,
  },
  value: {
    fontFamily: brandFont,
    color: "#fff",
    fontSize: 18,
    marginTop: 4,
  },
  valueRemaining: {
    fontFamily: brandFont,
    color: "#FF7A7A",
    fontSize: 20,
    fontWeight: "600",
    marginTop: 4,
  },
  progressInfo: {
    fontFamily: brandFont,
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
  },

  timelineFooterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  timelineFooterLeft: {
    fontFamily: brandFont,
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
  },
  timelineFooterRight: {
    fontFamily: brandFont,
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
  },

  nearFinishBox: {
    marginTop: 12,
    marginHorizontal: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "rgba(255,122,122,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,122,122,0.30)",
  },
  nearFinishTitle: {
    fontFamily: brandFont,
    fontSize: 13,
    fontWeight: "600",
    color: "#FF7A7A",
    marginBottom: 3,
  },
  nearFinishText: {
    fontFamily: brandFont,
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
  },

  /* WIZARD */
  wizardWrapper: {
    marginTop: 22,
    marginHorizontal: 18,
    padding: 18,
    borderRadius: 20,
    backgroundColor: "rgba(10,10,10,0.85)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  wizardStepLabel: {
    fontFamily: brandFont,
    fontSize: 14,
    fontWeight: "600",
    color: "#C7F1EF",
  },
  wizardStepSubtitle: {
    fontFamily: brandFont,
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    marginTop: 2,
    marginBottom: 12,
  },
  wizardCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  wizardLabel: {
    fontFamily: brandFont,
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  wizardHint: {
    fontFamily: brandFont,
    fontSize: 12,
    color: "rgba(255,255,255,0.65)",
    marginBottom: 10,
  },
  wizardSmallInfo: {
    fontFamily: brandFont,
    fontSize: 11,
    color: "rgba(255,255,255,0.55)",
    marginTop: 8,
  },

  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  amountPrefix: {
    fontFamily: brandFont,
    fontSize: 18,
    color: "rgba(255,255,255,0.8)",
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    fontFamily: brandFont,
    fontSize: 20,
    color: "#fff",
    paddingVertical: 4,
  },

  chipsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },
  chipText: {
    fontFamily: brandFont,
    fontSize: 12,
    color: "#fff",
  },

  input: {
    marginTop: 8,
    fontFamily: brandFont,
    color: "#fff",
    fontSize: 15,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.25)",
  },

  typeRow: {
    marginTop: 12,
    gap: 8,
  },
  typeBtn: {
    padding: 10,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: 8,
  },
  typeBtnActive: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderColor: "rgba(255,255,255,0.35)",
  },
  typeText: {
    fontFamily: brandFont,
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
  },
  typeTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  typeSubText: {
    fontFamily: brandFont,
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
    marginTop: 2,
  },

  summaryLabel: {
    fontFamily: brandFont,
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
  },
  summaryValue: {
    fontFamily: brandFont,
    fontSize: 14,
    color: "#fff",
    marginTop: 2,
  },
  summaryValueDanger: {
    fontFamily: brandFont,
    fontSize: 14,
    color: "#FF7A7A",
    marginTop: 2,
    fontWeight: "600",
  },

  wizardFooter: {
    flexDirection: "row",
    marginTop: 14,
    gap: 10,
  },
  wizardBackBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    backgroundColor: "rgba(255,255,255,0.03)",
    alignItems: "center",
  },
  wizardBackText: {
    fontFamily: brandFont,
    fontSize: 13,
    color: "#fff",
  },
  wizardNextBtn: {
    flex: 1.4,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: "#d8ecee",
    alignItems: "center",
  },
  wizardNextText: {
    fontFamily: brandFont,
    fontSize: 13,
    fontWeight: "700",
    color: "#6A6A99",
  },
});

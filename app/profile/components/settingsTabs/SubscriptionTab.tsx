import {
  AlertTriangle,
  ChevronRight,
  CreditCard,
  Crown,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface SubscriptionTabProps {
  currentPlan: string | null;
  handlePlanChange: () => void;
  handleCancelPlan: (reason?: string) => Promise<void>;
  isCanceling?: boolean;
  t: (key: string, opts?: Record<string, string>) => string;
}

const CANCEL_REASONS = [
  { id: "not_using", label: "Não estou usando com frequência" },
  { id: "too_expensive", label: "Está caro para mim" },
  { id: "missing_features", label: "Faltam funcionalidades" },
  { id: "bugs", label: "Problemas técnicos / bugs" },
  { id: "found_alternative", label: "Encontrei outra ferramenta" },
  { id: "testing", label: "Estava apenas testando" },
  { id: "other", label: "Outro motivo" },
];

export default function SubscriptionTab({
  currentPlan,
  handlePlanChange,
  handleCancelPlan,
  isCanceling,
  t,
}: SubscriptionTabProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"reason" | "confirm">("reason");
  const [selectedReason, setSelectedReason] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setStep("reason");
      setSelectedReason(null);
    }
  }, [open]);

  const confirmCancel = async () => {
    await handleCancelPlan(selectedReason || undefined);
    setOpen(false);
  };

  // Plan badge color
  const planBadgeStyle =
    currentPlan === "agency"
      ? {
          bg: "rgba(239,68,68,0.2)",
          text: "#f87171",
          border: "rgba(239,68,68,0.3)",
        }
      : currentPlan === "creator"
        ? {
            bg: "rgba(52,211,153,0.2)",
            text: "#34d399",
            border: "rgba(52,211,153,0.3)",
          }
        : {
            bg: "rgba(251,191,36,0.2)",
            text: "#fbbf24",
            border: "rgba(251,191,36,0.3)",
          };

  const planLabel =
    currentPlan === "agency"
      ? "Agency"
      : currentPlan === "creator"
        ? "Creator"
        : "Essential";

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <CreditCard size={18} color="#f4f4f5" />
        <View>
          <Text style={styles.title}>{t("currentPlan")}</Text>
          <Text style={styles.subtitle}>{t("managePlan")}</Text>
        </View>
      </View>

      <Text style={styles.planDetails}>{t("planDetails")}</Text>

      {/* Current plan row */}
      <View style={styles.planRow}>
        <View style={styles.planRowLeft}>
          <Text style={styles.planRowText}>
            {t("currentOnPlan", { plan: currentPlan || "free" })}
          </Text>
          {currentPlan !== "free" && (
            <View
              style={[
                styles.planBadge,
                {
                  backgroundColor: planBadgeStyle.bg,
                  borderColor: planBadgeStyle.border,
                },
              ]}
            >
              <Crown size={11} color={planBadgeStyle.text} />
              <Text
                style={[styles.planBadgeText, { color: planBadgeStyle.text }]}
              >
                {planLabel}
              </Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          onPress={handlePlanChange}
          style={styles.changePlanBtn}
          activeOpacity={0.8}
        >
          <Text style={styles.changePlanBtnText}>{t("changePlan")}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.separator} />

      {/* Cancel button */}
      <TouchableOpacity
        onPress={() => setOpen(true)}
        disabled={currentPlan === "free" || isCanceling}
        style={[
          styles.cancelBtn,
          (currentPlan === "free" || isCanceling) && styles.cancelBtnDisabled,
        ]}
        activeOpacity={0.7}
      >
        {isCanceling ? (
          <ActivityIndicator size="small" color="#f87171" />
        ) : (
          <Text style={styles.cancelBtnText}>{t("cancelPlan")}</Text>
        )}
      </TouchableOpacity>
      {currentPlan === "free" && (
        <Text style={styles.cantCancelNote}>{t("cantCancelFree")}</Text>
      )}

      {/* Cancel Modal (replaces AlertDialog) */}
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.dialogBackdrop}>
          <View style={styles.dialogSheet}>
            {step === "reason" ? (
              // ── Step 1: pick a reason ────────────────────────────────────
              <>
                <Text style={styles.dialogTitle}>Cancelar assinatura?</Text>
                <Text style={styles.dialogSubtitle}>
                  Antes de cancelar, conta pra gente o motivo.
                </Text>

                <View style={styles.reasonsCard}>
                  {CANCEL_REASONS.map((reason, i) => (
                    <TouchableOpacity
                      key={reason.id}
                      onPress={() => {
                        setSelectedReason(reason.id);
                        setStep("confirm");
                      }}
                      style={[
                        styles.reasonRow,
                        i < CANCEL_REASONS.length - 1 && styles.reasonRowBorder,
                      ]}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.reasonText}>{reason.label}</Text>
                      <ChevronRight size={16} color="#71717a" />
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  onPress={() => setOpen(false)}
                  style={styles.backBtn}
                  activeOpacity={0.7}
                >
                  <Text style={styles.backBtnText}>Voltar</Text>
                </TouchableOpacity>
              </>
            ) : (
              // ── Step 2: confirm ──────────────────────────────────────────
              <>
                <View style={styles.dangerIconCircle}>
                  <AlertTriangle size={32} color="#ef4444" />
                </View>
                <Text style={[styles.dialogTitle, styles.dangerTitle]}>
                  Confirmar cancelamento
                </Text>
                <Text style={styles.dialogSubtitle}>
                  Sua assinatura será cancelada ao final do período atual.
                </Text>

                <TouchableOpacity
                  onPress={confirmCancel}
                  disabled={isCanceling}
                  style={[styles.confirmBtn, isCanceling && styles.btnDisabled]}
                  activeOpacity={0.8}
                >
                  {isCanceling ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.confirmBtnText}>
                      Confirmar cancelamento
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setStep("reason")}
                  style={styles.backBtn}
                  activeOpacity={0.7}
                >
                  <Text style={styles.backBtnText}>Voltar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#f4f4f5",
  },
  subtitle: {
    fontSize: 13,
    color: "#d4d4d8",
    marginTop: 2,
  },
  planDetails: {
    fontSize: 13,
    color: "#a1a1aa",
  },
  planRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 10,
  },
  planRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
    flex: 1,
  },
  planRowText: {
    fontSize: 13,
    color: "#d4d4d8",
  },
  planBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
    borderWidth: 1,
  },
  planBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  changePlanBtn: {
    backgroundColor: "#db2777",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  changePlanBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  separator: {
    height: 1,
    backgroundColor: "#27272a",
  },
  cancelBtn: {
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.3)",
    backgroundColor: "rgba(239,68,68,0.05)",
  },
  cancelBtnDisabled: {
    opacity: 0.4,
  },
  cancelBtnText: {
    color: "#f87171",
    fontSize: 14,
    fontWeight: "500",
  },
  cantCancelNote: {
    fontSize: 11,
    color: "#71717a",
    textAlign: "center",
  },
  // Dialog
  dialogBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  dialogSheet: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "rgba(24,24,27,0.97)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(63,63,70,0.5)",
    padding: 20,
    gap: 12,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
  },
  dangerTitle: {
    color: "#ef4444",
  },
  dialogSubtitle: {
    fontSize: 13,
    color: "#a1a1aa",
    textAlign: "center",
  },
  dangerIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(239,68,68,0.15)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.3)",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  reasonsCard: {
    backgroundColor: "rgba(39,39,42,0.5)",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(63,63,70,0.5)",
  },
  reasonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  reasonRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(63,63,70,0.5)",
  },
  reasonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#fff",
    flex: 1,
    paddingRight: 8,
  },
  confirmBtn: {
    backgroundColor: "#ef4444",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  confirmBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  backBtn: {
    backgroundColor: "#27272a",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  backBtnText: {
    color: "#f4f4f5",
    fontSize: 14,
    fontWeight: "600",
  },
  btnDisabled: {
    opacity: 0.4,
  },
});

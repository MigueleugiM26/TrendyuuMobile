import { AlertTriangle, ChevronRight } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface DeleteTabProps {
  handleDeleteAccount: (reason?: string) => Promise<void>;
  t: (key: string, opts?: Record<string, string>) => string;
}

const DELETION_REASONS = [
  { id: "not-editing", label: "Não estou mais editando vídeos" },
  { id: "found-alternative", label: "Encontrei outra ferramenta" },
  { id: "too-expensive", label: "Muito caro para mim" },
  { id: "missing-features", label: "Falta de recursos que preciso" },
  { id: "technical-issues", label: "Problemas técnicos frequentes" },
  { id: "hard-to-use", label: "Difícil de usar" },
  { id: "other", label: "Outro motivo" },
];

function generateRandomString(len = 8) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let s = "";
  for (let i = 0; i < len; i++)
    s += chars.charAt(Math.floor(Math.random() * chars.length));
  return s;
}

export default function DeleteTab({ handleDeleteAccount, t }: DeleteTabProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);
  const [confirmString, setConfirmString] = useState("");
  const [confirmInput, setConfirmInput] = useState("");
  const [step, setStep] = useState<"reason" | "confirm">("reason");
  const [selectedReason, setSelectedReason] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setConfirmString(generateRandomString(8));
      setConfirmInput("");
      setStep("reason");
      setSelectedReason(null);
    }
  }, [open]);

  const match = confirmInput === confirmString && confirmString.length > 0;

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await handleDeleteAccount(selectedReason || undefined);
    } finally {
      setIsDeleting(false);
      setOpen(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.title}>{t("dangerZone")}</Text>
      <Text style={styles.subtitle}>{t("dangerDesc")}</Text>

      <View style={styles.separator} />

      {/* Delete trigger */}
      <TouchableOpacity
        onPress={() => setOpen(true)}
        disabled={isDeleting}
        style={[styles.deleteBtn, isDeleting && styles.btnDisabled]}
        activeOpacity={0.8}
      >
        {isDeleting ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.deleteBtnText}>{t("deleteAccount")}</Text>
        )}
      </TouchableOpacity>

      {/* Modal (replaces AlertDialog) */}
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => !isDeleting && setOpen(false)}
      >
        <View style={styles.dialogBackdrop}>
          <View style={styles.dialogSheet}>
            {step === "reason" ? (
              // ── Step 1: pick a reason ──────────────────────────────────────
              <>
                <Text style={styles.dialogTitle}>Vai nos deixar?</Text>
                <Text style={styles.dialogSubtitle}>
                  Sem problemas, mas gostaríamos de saber o motivo.
                </Text>

                <View style={styles.reasonsCard}>
                  {DELETION_REASONS.map((reason, i) => (
                    <TouchableOpacity
                      key={reason.id}
                      onPress={() => {
                        setSelectedReason(reason.id);
                        setStep("confirm");
                      }}
                      style={[
                        styles.reasonRow,
                        i < DELETION_REASONS.length - 1 &&
                          styles.reasonRowBorder,
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
                  <Text style={styles.backBtnText}>{t("cancel")}</Text>
                </TouchableOpacity>
              </>
            ) : (
              // ── Step 2: type confirmation code ─────────────────────────────
              <>
                <View style={styles.dangerIconCircle}>
                  <AlertTriangle size={32} color="#ef4444" />
                </View>

                <Text style={[styles.dialogTitle, styles.dangerTitle]}>
                  {t("warning")}
                </Text>
                <Text style={styles.dialogSubtitle}>{t("deleteConfirm")}</Text>

                <View style={styles.confirmCard}>
                  <Text style={styles.confirmCardLabel}>
                    {t("confirmTypeLabel")}
                  </Text>

                  {/* Code display + regenerate */}
                  <View style={styles.confirmCodeRow}>
                    <View style={styles.confirmCodeBox}>
                      <Text style={styles.confirmCodeText}>
                        {confirmString}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => setConfirmString(generateRandomString(8))}
                      disabled={isDeleting}
                      style={styles.regenBtn}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.regenBtnText}>{t("regenerate")}</Text>
                    </TouchableOpacity>
                  </View>

                  <TextInput
                    value={confirmInput}
                    onChangeText={setConfirmInput}
                    maxLength={8}
                    placeholder={t("confirmPlaceholder")}
                    placeholderTextColor="#52525b"
                    editable={!isDeleting}
                    style={[
                      styles.confirmInput,
                      match && styles.confirmInputMatch,
                    ]}
                  />

                  {!match && confirmInput.length > 0 && (
                    <Text style={styles.mismatchText}>
                      {t("confirmMismatch")}
                    </Text>
                  )}
                </View>

                <TouchableOpacity
                  onPress={confirmDelete}
                  disabled={!match || isDeleting}
                  style={[
                    styles.deleteBtn,
                    (!match || isDeleting) && styles.btnDisabled,
                  ]}
                  activeOpacity={0.8}
                >
                  {isDeleting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.deleteBtnText}>{t("delete")}</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setStep("reason")}
                  disabled={isDeleting}
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

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#f87171",
  },
  subtitle: {
    fontSize: 13,
    color: "#a1a1aa",
  },
  separator: {
    height: 1,
    backgroundColor: "#27272a",
  },
  deleteBtn: {
    backgroundColor: "#ef4444",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  btnDisabled: {
    opacity: 0.4,
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
  confirmCard: {
    backgroundColor: "rgba(39,39,42,0.5)",
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  confirmCardLabel: {
    fontSize: 13,
    color: "#d4d4d8",
  },
  confirmCodeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  confirmCodeBox: {
    flex: 1,
    backgroundColor: "#09090b",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#3f3f46",
    paddingVertical: 10,
    alignItems: "center",
  },
  confirmCodeText: {
    fontFamily: "monospace",
    fontSize: 15,
    letterSpacing: 4,
    color: "#f472b6",
  },
  regenBtn: {
    backgroundColor: "#27272a",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  regenBtnText: {
    color: "#a1a1aa",
    fontSize: 12,
  },
  confirmInput: {
    backgroundColor: "#09090b",
    borderWidth: 1,
    borderColor: "#3f3f46",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: "#fff",
    fontSize: 14,
  },
  confirmInputMatch: {
    borderColor: "#22c55e",
  },
  mismatchText: {
    fontSize: 12,
    color: "#fbbf24",
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
});

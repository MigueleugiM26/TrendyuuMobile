import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Coins,
  X,
} from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ── Types ──────────────────────────────────────────────────────────────────────

type ApplicablePlan = {
  plan: "essential" | "creator" | "agency";
  periodicity: "mensal" | "anual";
};

export type PromotionalCode = {
  code: string;
  max_uses: number;
  remaining_uses: number;
  expiry_date: string | null;
  discount: string | null;
  extra_credits: Record<string, unknown>;
  applicable_plans: ApplicablePlan[];
  is_claimable: boolean;
  is_on_demand: boolean;
  max_claims: number | null;
  claims_remaining: number | null;
};

// ── Constants ──────────────────────────────────────────────────────────────────

const PLAN_COLORS: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  essential: {
    bg: "rgba(234,179,8,0.15)",
    text: "#fbbf24",
    border: "rgba(234,179,8,0.3)",
  },
  creator: {
    bg: "rgba(52,211,153,0.15)",
    text: "#34d399",
    border: "rgba(52,211,153,0.3)",
  },
  agency: {
    bg: "rgba(239,68,68,0.15)",
    text: "#f87171",
    border: "rgba(239,68,68,0.3)",
  },
};
const PLAN_LABEL: Record<string, string> = {
  essential: "Essential",
  creator: "Creator",
  agency: "Agency",
};
const PERIOD_LABEL: Record<string, string> = {
  mensal: "Mensal",
  anual: "Anual",
};

// ── PlanBadge ──────────────────────────────────────────────────────────────────

function PlanBadge({ plan, periodicity }: ApplicablePlan) {
  const c = PLAN_COLORS[plan];
  return (
    <View
      style={[
        styles.planBadge,
        { backgroundColor: c.bg, borderColor: c.border },
      ]}
    >
      <Text style={[styles.planBadgeText, { color: c.text }]}>
        {PLAN_LABEL[plan]} · {PERIOD_LABEL[periodicity]}
      </Text>
    </View>
  );
}

// ── Credit line builder ────────────────────────────────────────────────────────

function buildCreditLines(ec: Record<string, unknown>): string[] {
  const clips = ec?.clipsCredits as Record<string, number> | undefined;
  const lines: string[] = [];
  if (ec?.credits) lines.push(`+${ec.credits} Créditos`);
  if (clips?.sg) lines.push(`+${clips.sg} Vídeos Short Generator`);
  if (clips?.ac) lines.push(`+${clips.ac} Minutos Autoclip`);
  if (!clips && ec?.sg) lines.push(`+${ec.sg} Vídeos Short Generator`);
  if (!clips && ec?.ac) lines.push(`+${ec.ac} Minutos Autoclip`);
  return lines;
}

// ── Main component ─────────────────────────────────────────────────────────────

export function PromotionalCodesSection({
  promoCodes,
  isLoadingCodes,
  activePromoTooltip,
  setActivePromoTooltip,
  backendUrl,
  onCodesChange,
}: {
  promoCodes: PromotionalCode[];
  isLoadingCodes: boolean;
  // On mobile: just a string (code) or null — no x/y coords needed
  activePromoTooltip: string | null;
  setActivePromoTooltip: (v: string | null) => void;
  backendUrl?: string;
  onCodesChange: (updated: PromotionalCode[]) => void;
}) {
  const [claimInput, setClaimInput] = useState("");
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimResult, setClaimResult] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);
  const [activating, setActivating] = useState<Set<string>>(new Set());
  // Accordion: which code's credit lines are expanded
  const [expandedCode, setExpandedCode] = useState<string | null>(null);

  function decrementCode(code: string) {
    const updated = promoCodes
      .map((p) =>
        p.code === code ? { ...p, remaining_uses: p.remaining_uses - 1 } : p,
      )
      .filter((p) => p.remaining_uses > 0);
    onCodesChange(updated);
  }

  async function handleClaim() {
    const code = claimInput.trim().toUpperCase();
    if (!code) return;
    setIsClaiming(true);
    setClaimResult(null);
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const res = await fetch(
        `${backendUrl}/api/stripe/claim-promotional-code/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ code }),
        },
      );
      const data = await res.json();
      if (res.ok && data.success) {
        setClaimResult({
          ok: true,
          message: data.message ?? "Código resgatado!",
        });
        setClaimInput("");
        decrementCode(code);
      } else {
        setClaimResult({
          ok: false,
          message: data.detail ?? data.error ?? "Erro ao resgatar código",
        });
      }
    } catch {
      setClaimResult({ ok: false, message: "Erro de conexão" });
    } finally {
      setIsClaiming(false);
    }
  }

  async function handleActivate(code: string) {
    setActivating((prev) => new Set(prev).add(code));
    setClaimResult(null);
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const res = await fetch(
        `${backendUrl}/api/stripe/claim-promotional-code/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ code }),
        },
      );
      const data = await res.json();
      if (res.ok && data.success) {
        setClaimResult({
          ok: true,
          message: data.message ?? "Créditos adicionados!",
        });
        decrementCode(code);
      } else {
        setClaimResult({
          ok: false,
          message: data.detail ?? data.error ?? "Erro ao ativar código",
        });
      }
    } catch {
      setClaimResult({ ok: false, message: "Erro de conexão" });
    } finally {
      setActivating((prev) => {
        const n = new Set(prev);
        n.delete(code);
        return n;
      });
    }
  }

  // Credit lines tooltip modal (replaces desktop portal + mouse hover)
  const tooltipPromo = activePromoTooltip
    ? promoCodes.find((p) => p.code === activePromoTooltip)
    : null;
  const tooltipLines = tooltipPromo
    ? buildCreditLines(tooltipPromo.extra_credits as Record<string, unknown>)
    : [];

  return (
    <View>
      <Text style={styles.sectionTitle}>Códigos Promocionais</Text>

      <View style={styles.card}>
        {isLoadingCodes ? (
          <View style={styles.centered}>
            <ActivityIndicator size="small" color="#71717a" />
          </View>
        ) : promoCodes.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.emptyText}>Nenhum código disponível</Text>
          </View>
        ) : (
          <ScrollView style={styles.codesList} nestedScrollEnabled>
            {promoCodes.map((promo, i) => {
              const ec = promo.extra_credits as Record<string, unknown>;
              const creditLines = buildCreditLines(ec);
              const isExpanded = expandedCode === promo.code;
              const isActivating = activating.has(promo.code);

              return (
                <View
                  key={promo.code}
                  style={[
                    styles.promoRow,
                    i < promoCodes.length - 1 && styles.promoRowBorder,
                  ]}
                >
                  {/* Top row */}
                  <View style={styles.promoTopRow}>
                    {/* Left: code + info icon */}
                    <View style={styles.promoLeft}>
                      <Text style={styles.promoCode} numberOfLines={1}>
                        {promo.code}
                      </Text>
                      {creditLines.length > 0 && (
                        <TouchableOpacity
                          onPress={() =>
                            setActivePromoTooltip(
                              activePromoTooltip === promo.code
                                ? null
                                : promo.code,
                            )
                          }
                          hitSlop={8}
                        >
                          <Coins size={14} color="#60a5fa" />
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* Right: meta + activate + expand */}
                    <View style={styles.promoRight}>
                      {promo.discount && (
                        <Text style={styles.discountText}>
                          {promo.discount}% off
                        </Text>
                      )}
                      <Text style={styles.usesText}>
                        {promo.remaining_uses}/{promo.max_uses} usos
                      </Text>
                      {promo.is_on_demand && (
                        <TouchableOpacity
                          onPress={() => handleActivate(promo.code)}
                          disabled={isActivating || promo.remaining_uses <= 0}
                          style={[
                            styles.activateBtn,
                            (isActivating || promo.remaining_uses <= 0) &&
                              styles.btnDisabled,
                          ]}
                          activeOpacity={0.7}
                        >
                          {isActivating ? (
                            <ActivityIndicator size="small" color="#f472b6" />
                          ) : (
                            <Text style={styles.activateBtnText}>Ativar</Text>
                          )}
                        </TouchableOpacity>
                      )}
                      {creditLines.length > 0 && (
                        <TouchableOpacity
                          onPress={() =>
                            setExpandedCode(isExpanded ? null : promo.code)
                          }
                          hitSlop={8}
                        >
                          {isExpanded ? (
                            <ChevronUp size={16} color="#71717a" />
                          ) : (
                            <ChevronDown size={16} color="#71717a" />
                          )}
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>

                  {/* Plan badges */}
                  {promo.applicable_plans?.length > 0 && (
                    <View style={styles.planBadgesRow}>
                      {promo.applicable_plans.map((ap, idx) => (
                        <PlanBadge key={idx} {...ap} />
                      ))}
                    </View>
                  )}

                  {/* Expiry */}
                  {promo.expiry_date && (
                    <Text style={styles.expiryText}>
                      Expira{" "}
                      {new Date(promo.expiry_date).toLocaleDateString("pt-BR")}
                    </Text>
                  )}

                  {/* Accordion: credit lines */}
                  {isExpanded && creditLines.length > 0 && (
                    <View style={styles.creditLines}>
                      {creditLines.map((line) => (
                        <Text key={line} style={styles.creditLineText}>
                          {line}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>
        )}

        {/* Claim input */}
        <View style={styles.claimSection}>
          <Text style={styles.claimLabel}>
            Tem um código secreto? Resgate aqui
          </Text>
          <View style={styles.claimRow}>
            <TextInput
              value={claimInput}
              onChangeText={(v) => {
                setClaimInput(v.toUpperCase());
                setClaimResult(null);
              }}
              onSubmitEditing={handleClaim}
              placeholder="SEUCÓDIGO"
              placeholderTextColor="#52525b"
              autoCapitalize="characters"
              style={styles.claimInput}
            />
            <TouchableOpacity
              onPress={handleClaim}
              disabled={isClaiming || !claimInput.trim()}
              style={[
                styles.claimBtn,
                (isClaiming || !claimInput.trim()) && styles.btnDisabled,
              ]}
              activeOpacity={0.8}
            >
              {isClaiming ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.claimBtnText}>Resgatar</Text>
              )}
            </TouchableOpacity>
          </View>

          {claimResult && (
            <View style={styles.claimResult}>
              {claimResult.ok ? (
                <CheckCircle size={14} color="#34d399" />
              ) : (
                <AlertCircle size={14} color="#f87171" />
              )}
              <Text
                style={[
                  styles.claimResultText,
                  { color: claimResult.ok ? "#34d399" : "#f87171" },
                ]}
              >
                {claimResult.message}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Credit lines tooltip modal (replaces desktop portal) */}
      <Modal
        visible={!!activePromoTooltip && tooltipLines.length > 0}
        transparent
        animationType="fade"
        onRequestClose={() => setActivePromoTooltip(null)}
      >
        <View style={styles.tooltipBackdrop}>
          <View style={styles.tooltipSheet}>
            <View style={styles.tooltipHeader}>
              <Text style={styles.tooltipCode}>{activePromoTooltip}</Text>
              <TouchableOpacity
                onPress={() => setActivePromoTooltip(null)}
                hitSlop={8}
              >
                <X size={16} color="#71717a" />
              </TouchableOpacity>
            </View>
            {tooltipLines.map((line) => (
              <Text key={line} style={styles.tooltipLine}>
                {line}
              </Text>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: "#71717a",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 8,
  },
  card: {
    backgroundColor: "rgba(24,24,27,0.5)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(39,39,42,0.6)",
    overflow: "hidden",
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 13,
    color: "#71717a",
  },
  codesList: {
    maxHeight: 256,
  },
  promoRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 6,
  },
  promoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(39,39,42,0.6)",
  },
  promoTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  promoLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
    minWidth: 0,
  },
  promoCode: {
    fontSize: 13,
    fontFamily: "monospace",
    fontWeight: "600",
    color: "#f472b6",
    letterSpacing: 1,
    flexShrink: 1,
  },
  promoRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  discountText: {
    fontSize: 11,
    color: "#34d399",
    fontWeight: "600",
  },
  usesText: {
    fontSize: 11,
    color: "#a1a1aa",
  },
  activateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "rgba(236,72,153,0.15)",
    borderWidth: 1,
    borderColor: "rgba(236,72,153,0.3)",
  },
  activateBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#f472b6",
  },
  btnDisabled: {
    opacity: 0.4,
  },
  planBadgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  planBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 9999,
    borderWidth: 1,
  },
  planBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  expiryText: {
    fontSize: 11,
    color: "#71717a",
  },
  creditLines: {
    borderLeftWidth: 2,
    borderLeftColor: "rgba(59,130,246,0.3)",
    paddingLeft: 8,
    gap: 4,
  },
  creditLineText: {
    fontSize: 11,
    color: "#60a5fa",
  },
  // Claim
  claimSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(39,39,42,0.6)",
    gap: 8,
  },
  claimLabel: {
    fontSize: 11,
    color: "#71717a",
    fontWeight: "500",
  },
  claimRow: {
    flexDirection: "row",
    gap: 8,
  },
  claimInput: {
    flex: 1,
    backgroundColor: "rgba(39,39,42,0.6)",
    borderWidth: 1,
    borderColor: "rgba(63,63,70,0.6)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    fontFamily: "monospace",
    color: "#f4f4f5",
  },
  claimBtn: {
    backgroundColor: "#ec4899",
    borderRadius: 8,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  claimBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  claimResult: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  claimResultText: {
    fontSize: 12,
    fontWeight: "500",
  },
  // Tooltip modal
  tooltipBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  tooltipSheet: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "#27272a",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(63,63,70,0.6)",
    padding: 14,
    gap: 8,
  },
  tooltipHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tooltipCode: {
    fontSize: 13,
    fontFamily: "monospace",
    fontWeight: "700",
    color: "#f472b6",
  },
  tooltipLine: {
    fontSize: 12,
    color: "#60a5fa",
  },
});

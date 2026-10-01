import { useUser } from "@/src/context/user-context";
import {
  CardField,
  StripeProvider,
  useConfirmPayment,
} from "@/src/hooks/stripe-native";
import { useTranslations } from "@/src/hooks/useTranslations";
import type { CustomerInfo, Plan } from "@/src/types/checkout";
import { getAffiliateInfo, type AffiliateInfo } from "@/src/utils/affiliates";
import {
  getDescontoPriceForRegion,
  getPriceForUserRegion,
} from "@/src/utils/pricing";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  CreditCard,
  Crown,
  Flame,
  Lock,
  Play,
  Shield,
  Star,
  Tag,
  TrendingUp,
  Users,
  Video,
  X,
} from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Svg, { G, Path } from "react-native-svg";

// ─── Types ────────────────────────────────────────────────────────────────────

type PaymentMethod = "card" | "pix";

export type PromoCodeOption = {
  code: string;
  discount: string | null;
  extra_credits: Record<string, unknown>;
  applicable_plans: { plan: string; periodicity: string }[];
  is_on_demand: boolean;
  remaining_uses: number;
};

interface CustomCheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: Plan | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const BASE_URL = process.env.EXPO_PUBLIC_TRENDYUU_URL_BACK;

const countryDialCodes: Record<string, string> = {
  AU: "61",
  BR: "55",
  CA: "1",
  GB: "44",
  US: "1",
  EU: "",
  ES: "34",
  FR: "33",
  DE: "49",
  IT: "39",
  JP: "81",
  MX: "52",
  AR: "54",
  CL: "56",
  CO: "57",
  KR: "82",
  SG: "65",
  NZ: "64",
  AE: "971",
  ZA: "27",
  OTHER: "",
};

const formatCPF = (value: string): string => {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9)
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
};

const validateCPF = (cpf: string): boolean => {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;
  let sum = 0,
    remainder;
  for (let i = 1; i <= 9; i++)
    sum += parseInt(digits.substring(i - 1, i)) * (11 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(digits.substring(9, 10))) return false;
  sum = 0;
  for (let i = 1; i <= 10; i++)
    sum += parseInt(digits.substring(i - 1, i)) * (12 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  return remainder === parseInt(digits.substring(10, 11));
};

const formatPhoneDisplay = (value: string, country: string): string => {
  const digits = value.replace(/\D/g, "");
  if (country === "BR") {
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  }
  if (country === "US" || country === "CA") {
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  }
  return digits.slice(0, 15);
};

const toE164 = (displayValue: string, country: string): string => {
  const digits = displayValue.replace(/\D/g, "");
  const dial = countryDialCodes[country] || "";
  if (!digits) return "";
  if (!dial) return `+${digits}`;
  return `+${dial}${digits}`;
};

const formatPostal = (value: string, country: string): string => {
  let val = value;
  if (country === "BR") {
    val = val.replace(/\D/g, "");
    if (val.length > 5) val = val.slice(0, 5) + "-" + val.slice(5, 8);
    if (val.length > 9) val = val.slice(0, 9);
  } else if (country === "US" || country === "AU") {
    val = val.replace(/\D/g, "").slice(0, 5);
  } else if (country === "CA") {
    val = val.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (val.length > 3) val = val.slice(0, 3) + " " + val.slice(3, 6);
    if (val.length > 7) val = val.slice(0, 7);
  } else if (country === "GB") {
    val = val.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (val.length > 3)
      val = val.slice(0, val.length - 3) + " " + val.slice(-3);
    if (val.length > 8) val = val.slice(0, 8);
  } else if (["ES", "FR", "DE", "IT", "EU"].includes(country)) {
    val = val.replace(/\D/g, "").slice(0, 5);
  } else if (country === "JP") {
    val = val.replace(/\D/g, "").slice(0, 7);
    if (val.length > 3) val = val.slice(0, 3) + "-" + val.slice(3, 7);
  } else if (["ZA", "NZ", "AE"].includes(country)) {
    val = val.replace(/\D/g, "").slice(0, 6);
  } else if (country === "SG" || country === "CO") {
    val = val.replace(/\D/g, "").slice(0, 6);
  } else if (["KR", "MX", "CL"].includes(country)) {
    val = val.replace(/\D/g, "").slice(0, 7);
  } else if (country === "AR") {
    val = val
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 8);
  } else {
    if (val.length > 20) val = val.slice(0, 20);
  }
  return val;
};

const isPostalValid = (country: string, postal: string): boolean => {
  if (!postal) return false;
  if (country === "OTHER") return postal.length > 0;
  switch (country) {
    case "BR":
      return postal.length === 9;
    case "US":
    case "AU":
      return postal.length === 5;
    case "CA":
      return postal.length === 7;
    case "GB":
      return postal.length >= 5 && postal.length <= 8;
    default:
      return postal.length > 0;
  }
};

// ─── Pix SVG Logo ─────────────────────────────────────────────────────────────

function PixLogo({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512" fill="currentColor">
      <G transform="scale(32)">
        <Path
          d="M11.917 11.71a2.046 2.046 0 0 1-1.454-.602l-2.1-2.1a.4.4 0 0 0-.551 0l-2.108 2.108a2.044 2.044 0 0 1-1.454.602h-.414l2.66 2.66c.83.83 2.177.83 3.007 0l2.667-2.668h-.253zM4.25 4.282c.55 0 1.066.214 1.454.602l2.108 2.108a.39.39 0 0 0 .552 0l2.1-2.1a2.044 2.044 0 0 1 1.453-.602h.253L9.503 1.623a2.127 2.127 0 0 0-3.007 0l-2.66 2.66h.414z"
          fill="white"
        />
        <Path
          d="m14.377 6.496-1.612-1.612a.307.307 0 0 1-.114.023h-.733c-.379 0-.75.154-1.017.422l-2.1 2.1a1.005 1.005 0 0 1-1.425 0L5.268 5.32a1.448 1.448 0 0 0-1.018-.422h-.9a.306.306 0 0 1-.109-.021L1.623 6.496c-.83.83-.83 2.177 0 3.008l1.618 1.618a.305.305 0 0 1 .108-.022h.901c.38 0 .75-.153 1.018-.421L7.375 8.57a1.034 1.034 0 0 1 1.426 0l2.1 2.1c.267.268.638.421 1.017.421h.733c.04 0 .079.01.114.024l1.612-1.612c.83-.83.83-2.178 0-3.008z"
          fill="white"
        />
      </G>
    </Svg>
  );
}

// ─── FormInput ────────────────────────────────────────────────────────────────

function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  autoCapitalize = "none",
  error,
  required = false,
  editable = true,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: any;
  autoCapitalize?: any;
  error?: string | null;
  required?: boolean;
  editable?: boolean;
}) {
  return (
    <View style={formStyles.group}>
      <Text style={formStyles.label}>
        {label}
        {required && " *"}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#52525b"
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        editable={editable}
        style={[formStyles.input, !!error && formStyles.inputError]}
      />
      {error ? <Text style={formStyles.errorText}>{error}</Text> : null}
    </View>
  );
}

// ─── CouponPicker ─────────────────────────────────────────────────────────────

function CouponPicker({
  selectedPlan,
  promoCodes,
  appliedCode,
  onApply,
  onRemove,
  onCodeClaimed,
}: {
  selectedPlan: Plan;
  promoCodes: PromoCodeOption[];
  appliedCode: PromoCodeOption | null;
  onApply: (code: PromoCodeOption) => void;
  onRemove: () => void;
  onCodeClaimed?: () => void;
}) {
  const t = useTranslations("Pricing");
  const [open, setOpen] = useState(false);
  const [claimInput, setClaimInput] = useState("");
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimResult, setClaimResult] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);

  const planType = selectedPlan.planType;
  const periodicity = selectedPlan.isAnnual ? "anual" : "mensal";

  const eligible = promoCodes.filter((p) => {
    if (p.is_on_demand || p.remaining_uses <= 0) return false;
    if (!p.applicable_plans || p.applicable_plans.length === 0) return true;
    return p.applicable_plans.some(
      (ap) => ap.plan === planType && ap.periodicity === periodicity,
    );
  });

  const creditLines = (ec: Record<string, unknown>): string[] => {
    const clips = ec?.clipsCredits as Record<string, number> | undefined;
    const lines: string[] = [];
    if (ec?.credits) lines.push(`+${ec.credits} ${t("coupon.credits")}`);
    if (clips?.sg) lines.push(`+${clips.sg} ${t("coupon.shortGen")}`);
    if (clips?.ac) lines.push(`+${clips.ac} ${t("coupon.autoclip")}`);
    return lines;
  };

  const handleClaim = async () => {
    const code = claimInput.trim().toUpperCase();
    if (!code) return;
    setIsClaiming(true);
    setClaimResult(null);
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const res = await fetch(
        `${BASE_URL}/api/stripe/claim-promotional-code/`,
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
        onCodeClaimed?.();
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
  };

  // Applied code view
  if (appliedCode) {
    const cl = creditLines(appliedCode.extra_credits);
    return (
      <View style={couponStyles.applied}>
        <View style={couponStyles.appliedRow}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Tag size={14} color="#f472b6" />
            <Text style={couponStyles.appliedCode}>{appliedCode.code}</Text>
            {appliedCode.discount && (
              <View style={couponStyles.discountBadge}>
                <Text style={couponStyles.discountBadgeText}>
                  -{appliedCode.discount}%
                </Text>
              </View>
            )}
          </View>
          <Pressable onPress={onRemove}>
            <Text style={couponStyles.removeText}>{t("coupon.remove")}</Text>
          </Pressable>
        </View>
        {cl.map((l) => (
          <Text key={l} style={couponStyles.creditLine}>
            {l}
          </Text>
        ))}
      </View>
    );
  }

  return (
    <View style={{ gap: 12 }}>
      {/* Eligible codes picker */}
      {eligible.length > 0 && (
        <View>
          <Pressable
            onPress={() => setOpen((v) => !v)}
            style={couponStyles.pickerBtn}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <Tag size={14} color="#f472b6" />
              <Text style={couponStyles.pickerBtnText}>
                {t("coupon.applyButton", { count: eligible.length })}
              </Text>
            </View>
            <ChevronDown
              size={14}
              color="#71717a"
              style={open ? { transform: [{ rotate: "180deg" }] } : {}}
            />
          </Pressable>

          {open && (
            <View style={couponStyles.dropdownList}>
              {eligible.map((p) => {
                const cl = creditLines(p.extra_credits);
                return (
                  <Pressable
                    key={p.code}
                    onPress={() => {
                      onApply(p);
                      setOpen(false);
                    }}
                    style={({ pressed }) => [
                      couponStyles.dropdownItem,
                      pressed && { backgroundColor: "#27272a" },
                    ]}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text style={couponStyles.dropdownCode}>{p.code}</Text>
                      {p.discount && (
                        <Text style={couponStyles.dropdownDiscount}>
                          -{p.discount}%
                        </Text>
                      )}
                    </View>
                    {cl.map((l) => (
                      <Text key={l} style={couponStyles.creditLine}>
                        {l}
                      </Text>
                    ))}
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
      )}

      {/* Claim input */}
      <View style={{ gap: 8 }}>
        <Text style={couponStyles.claimLabel}>
          Tem um código secreto? Resgate aqui
        </Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
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
            style={couponStyles.claimInput}
          />
          <Pressable
            onPress={handleClaim}
            disabled={isClaiming || !claimInput.trim()}
            style={[
              couponStyles.claimBtn,
              (isClaiming || !claimInput.trim()) && { opacity: 0.4 },
            ]}
          >
            {isClaiming ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={couponStyles.claimBtnText}>Resgatar</Text>
            )}
          </Pressable>
        </View>
        {claimResult && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            {claimResult.ok ? (
              <Check size={13} color="#34d399" />
            ) : (
              <X size={13} color="#f87171" />
            )}
            <Text
              style={[
                couponStyles.claimResult,
                { color: claimResult.ok ? "#34d399" : "#f87171" },
              ]}
            >
              {claimResult.message}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

// ─── CheckoutForm (Card) ──────────────────────────────────────────────────────

function CheckoutForm({
  selectedPlan,
  onSuccess,
  regionalPrice,
  affiliateInfo,
  promoCodes,
  onAppliedCodeChange,
  onCodeClaimed,
}: {
  selectedPlan: Plan;
  onClose: () => void;
  onSuccess: () => void;
  regionalPrice: { currency: string; displayPrice: string; symbol: string };
  affiliateInfo: AffiliateInfo | null;
  promoCodes: PromoCodeOption[];
  onAppliedCodeChange?: (code: PromoCodeOption | null) => void;
  onCodeClaimed?: () => void;
}) {
  const t = useTranslations("Pricing");
  const { user } = useUser();
  const { confirmPayment, loading: stripeLoading } = useConfirmPayment();

  const [isProcessing, setIsProcessing] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appliedCode, setAppliedCode] = useState<PromoCodeOption | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: user?.name || "",
    email: user?.email || "",
    country: user?.region || "BR",
    postal: "",
    phone: "",
    customCountry: "",
  });

  const hasOtherDiscount =
    selectedPlan.isDesconto ||
    ((selectedPlan.affiliateDiscount ?? 0) > 0 && !selectedPlan.isAnnual);

  const discountedPrice = useMemo(() => {
    if (!appliedCode?.discount) return null;
    const pct = parseFloat(appliedCode.discount);
    if (!pct) return null;
    const raw = regionalPrice.displayPrice
      .replace(/[^\d.,]/g, "")
      .replace(",", ".");
    const numeric = parseFloat(raw);
    if (isNaN(numeric)) return null;
    return `${regionalPrice.symbol}${(numeric * (1 - pct / 100)).toFixed(2)}`;
  }, [appliedCode, regionalPrice]);

  const displayedPrice = discountedPrice ?? regionalPrice.displayPrice;

  const handleSubmit = async () => {
    if (
      !cardComplete ||
      !isPostalValid(customerInfo.country, customerInfo.postal)
    )
      return;
    setIsProcessing(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem("accessToken");
      // 1. Create payment intent
      const res = await fetch(`${BASE_URL}/api/stripe/create_payment_intent/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          plano: selectedPlan.planType,
          periodicidade: selectedPlan.isAnnual ? "anual" : "mensal",
          userId: user?.id,
          name: customerInfo.name,
          email: customerInfo.email,
          phone: toE164(customerInfo.phone, customerInfo.country),
          postal: customerInfo.postal,
          country:
            customerInfo.country === "OTHER"
              ? customerInfo.customCountry
              : customerInfo.country,
          isDesconto: selectedPlan.isDesconto ?? false,
          promotional_code: appliedCode?.code ?? null,
        }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Failed to create payment intent");

      // 2. Confirm with Stripe RN SDK
      const { error: stripeError } = await confirmPayment(data.clientSecret, {
        paymentMethodType: "Card",
        paymentMethodData: {
          billingDetails: {
            name: customerInfo.name,
            email: customerInfo.email,
            address: { postalCode: customerInfo.postal },
          },
        },
      });
      if (stripeError) throw new Error(stripeError.message);
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsProcessing(false);
    }
  };

  const canSubmit =
    cardComplete &&
    isPostalValid(customerInfo.country, customerInfo.postal) &&
    !isProcessing;

  return (
    <View style={{ gap: 16 }}>
      {/* Card field — @stripe/stripe-react-native drop-in */}
      <View style={formStyles.group}>
        <Text style={formStyles.label}>{t("formLabels.cardDetails")}</Text>
        <CardField
          postalCodeEnabled={false}
          onCardChange={(details) => setCardComplete(details.complete)}
          style={cardStyles.field}
          cardStyle={cardStyles.cardStyle}
        />
      </View>

      <FormInput
        label={t("formLabels.fullName")}
        value={customerInfo.name}
        onChangeText={(v) => setCustomerInfo((p) => ({ ...p, name: v }))}
        autoCapitalize="words"
        required
      />
      <FormInput
        label={t("formLabels.email")}
        value={customerInfo.email}
        onChangeText={(v) => setCustomerInfo((p) => ({ ...p, email: v }))}
        keyboardType="email-address"
        required
      />
      <FormInput
        label={t("formLabels.phone")}
        value={formatPhoneDisplay(customerInfo.phone, customerInfo.country)}
        onChangeText={(v) => setCustomerInfo((p) => ({ ...p, phone: v }))}
        keyboardType="phone-pad"
      />
      <FormInput
        label={t("formLabels.postalCode")}
        value={customerInfo.postal}
        onChangeText={(v) =>
          setCustomerInfo((p) => ({ ...p, postal: formatPostal(v, p.country) }))
        }
        placeholder={t(`formLabels.postalPlaceholders.${customerInfo.country}`)}
        keyboardType="default"
        required
      />

      {!hasOtherDiscount && (
        <View>
          <Text style={formStyles.label}>{t("coupon.label")}</Text>
          <CouponPicker
            selectedPlan={selectedPlan}
            promoCodes={promoCodes}
            appliedCode={appliedCode}
            onApply={(code) => {
              setAppliedCode(code);
              onAppliedCodeChange?.(code);
            }}
            onRemove={() => {
              setAppliedCode(null);
              onAppliedCodeChange?.(null);
            }}
            onCodeClaimed={onCodeClaimed}
          />
        </View>
      )}

      {affiliateInfo && (
        <AffiliateBlock
          affiliateInfo={affiliateInfo}
          selectedPlan={selectedPlan}
          t={t}
        />
      )}

      {error && <ErrorBlock message={error} />}

      {/* Security notice */}
      <View style={styles.securityRow}>
        <Shield size={14} color="#71717a" />
        <Text style={styles.securityText}>
          {t("formLabels.securityNotice")}
        </Text>
      </View>

      {/* Submit */}
      <Pressable
        onPress={handleSubmit}
        disabled={!canSubmit}
        style={[styles.submitBtn, !canSubmit && { opacity: 0.4 }]}
      >
        {isProcessing ? (
          <>
            <ActivityIndicator size="small" color="#fff" />
            <Text style={styles.submitBtnText}>
              {t("buttons.processingPayment")}
            </Text>
          </>
        ) : (
          <>
            <Lock size={16} color="#fff" />
            <Text style={styles.submitBtnText}>
              {user?.stripeSubscriptionId
                ? t("buttons.update", {
                    planName: t(`plans.${selectedPlan.planType}.nome`),
                    price: displayedPrice,
                  })
                : t("buttons.subscribe", {
                    planName: t(`plans.${selectedPlan.planType}.nome`),
                    price: displayedPrice,
                  })}
            </Text>
          </>
        )}
      </Pressable>
    </View>
  );
}

// ─── PixPaymentForm ───────────────────────────────────────────────────────────

function PixPaymentForm({
  selectedPlan,
  regionalPrice,
  onPixGenerated,
  affiliateInfo,
  promoCodes,
  onAppliedCodeChange,
  onCodeClaimed,
}: {
  selectedPlan: Plan;
  regionalPrice: { currency: string; displayPrice: string; symbol: string };
  onPixGenerated: (qrCode: string, pixCode: string, paymentId: string) => void;
  affiliateInfo: AffiliateInfo | null;
  promoCodes: PromoCodeOption[];
  onAppliedCodeChange?: (code: PromoCodeOption | null) => void;
  onCodeClaimed?: () => void;
}) {
  const t = useTranslations("Pricing");
  const { user } = useUser();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cpfError, setCpfError] = useState<string | null>(null);
  const [appliedCode, setAppliedCode] = useState<PromoCodeOption | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: user?.name || "",
    email: user?.email || "",
    country: "BR",
    postal: "",
    phone: "",
    customCountry: "",
    cpf: "",
  });

  const hasOtherDiscount =
    selectedPlan.isDesconto ||
    ((selectedPlan.affiliateDiscount ?? 0) > 0 && !selectedPlan.isAnnual);

  const discountedPrice = useMemo(() => {
    if (!appliedCode?.discount) return null;
    const pct = parseFloat(appliedCode.discount);
    if (!pct) return null;
    const raw = regionalPrice.displayPrice
      .replace(/[^\d.,]/g, "")
      .replace(",", ".");
    const numeric = parseFloat(raw);
    if (isNaN(numeric)) return null;
    return `${regionalPrice.symbol}${(numeric * (1 - pct / 100)).toFixed(2)}`;
  }, [appliedCode, regionalPrice]);

  const displayedPrice = discountedPrice ?? regionalPrice.displayPrice;

  const handleSubmit = async () => {
    if (!customerInfo.cpf?.trim()) {
      setError("CPF é obrigatório para pagamentos PIX");
      return;
    }
    if (!validateCPF(customerInfo.cpf)) {
      setCpfError("CPF inválido");
      setError("Por favor, verifique o CPF informado");
      return;
    }
    if (!customerInfo.postal?.trim()) {
      setError(t("errors.postalRequired"));
      return;
    }
    setIsProcessing(true);
    setError(null);
    setCpfError(null);
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const response = await fetch(
        `${BASE_URL}/api/stripe/create_pix_payment/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            plano: selectedPlan.planType,
            periodicidade: selectedPlan.isAnnual ? "anual" : "mensal",
            userId: user?.id,
            name: customerInfo.name,
            email: customerInfo.email,
            phone: toE164(customerInfo.phone, customerInfo.country),
            postal: customerInfo.postal,
            cpf: customerInfo.cpf!.replace(/\D/g, ""),
            isDesconto: selectedPlan.isDesconto ?? false,
            promotional_code: appliedCode?.code ?? null,
          }),
        },
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Failed to generate Pix");
      if (result.qrCode && result.pixCode && result.paymentId) {
        onPixGenerated(result.qrCode, result.pixCode, result.paymentId);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsProcessing(false);
    }
  };

  const canSubmit =
    !isProcessing &&
    !!customerInfo.postal &&
    customerInfo.postal.length === 9 &&
    !!customerInfo.cpf &&
    customerInfo.cpf.replace(/\D/g, "").length === 11 &&
    validateCPF(customerInfo.cpf);

  return (
    <View style={{ gap: 16 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <CreditCard size={18} color="#ec4899" />
        <Text style={styles.sectionTitle}>{t("pixForm.title")}</Text>
      </View>

      <FormInput
        label={t("formLabels.fullName")}
        value={customerInfo.name}
        onChangeText={(v) => setCustomerInfo((p) => ({ ...p, name: v }))}
        autoCapitalize="words"
        required
      />
      <FormInput
        label={t("formLabels.email")}
        value={customerInfo.email}
        onChangeText={(v) => setCustomerInfo((p) => ({ ...p, email: v }))}
        keyboardType="email-address"
        required
      />
      <FormInput
        label={t("formLabels.phone")}
        value={formatPhoneDisplay(customerInfo.phone || "", "BR")}
        onChangeText={(v) => setCustomerInfo((p) => ({ ...p, phone: v }))}
        keyboardType="phone-pad"
      />

      {/* CPF */}
      <FormInput
        label="CPF"
        value={customerInfo.cpf || ""}
        onChangeText={(v) => {
          const formatted = formatCPF(v);
          setCustomerInfo((p) => ({ ...p, cpf: formatted }));
          if (formatted.replace(/\D/g, "").length === 11) {
            setCpfError(validateCPF(formatted) ? null : "CPF inválido");
          } else {
            setCpfError(null);
          }
        }}
        placeholder="000.000.000-00"
        keyboardType="numeric"
        error={cpfError}
        required
      />

      {/* CEP */}
      <FormInput
        label="CEP"
        value={customerInfo.postal || ""}
        onChangeText={(v) => {
          let val = v.replace(/\D/g, "");
          if (val.length > 5) val = val.slice(0, 5) + "-" + val.slice(5, 8);
          if (val.length > 9) val = val.slice(0, 9);
          setCustomerInfo((p) => ({ ...p, postal: val }));
        }}
        placeholder="12345-678"
        keyboardType="numeric"
        required
      />

      {!hasOtherDiscount && (
        <View>
          <Text style={formStyles.label}>{t("coupon.label")}</Text>
          <CouponPicker
            selectedPlan={selectedPlan}
            promoCodes={promoCodes}
            appliedCode={appliedCode}
            onApply={(code) => {
              setAppliedCode(code);
              onAppliedCodeChange?.(code);
            }}
            onRemove={() => {
              setAppliedCode(null);
              onAppliedCodeChange?.(null);
            }}
            onCodeClaimed={onCodeClaimed}
          />
        </View>
      )}

      {affiliateInfo && (
        <AffiliateBlock
          affiliateInfo={affiliateInfo}
          selectedPlan={selectedPlan}
          t={t}
        />
      )}
      {error && <ErrorBlock message={error} />}

      <Pressable
        onPress={handleSubmit}
        disabled={!canSubmit}
        style={[styles.submitBtn, !canSubmit && { opacity: 0.4 }]}
      >
        {isProcessing ? (
          <>
            <ActivityIndicator size="small" color="#fff" />
            <Text style={styles.submitBtnText}>{t("pixForm.generating")}</Text>
          </>
        ) : (
          <>
            <Lock size={16} color="#fff" />
            <Text style={styles.submitBtnText}>
              {t("pixForm.generateButton", { price: displayedPrice })}
            </Text>
          </>
        )}
      </Pressable>
    </View>
  );
}

// ─── PixDisplay ───────────────────────────────────────────────────────────────

function PixDisplay({
  qrCode,
  pixCode,
  paymentId,
  onSuccess,
}: {
  qrCode: string;
  pixCode: string;
  paymentId: string;
  onSuccess: () => void;
}) {
  const t = useTranslations("Pricing");
  const [copied, setCopied] = useState(false);
  const [checking, setChecking] = useState(false);

  const handleCopy = async () => {
    await Share.share({ message: pixCode });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      setChecking(true);
      try {
        const token = await AsyncStorage.getItem("accessToken");
        const response = await fetch(
          `${BASE_URL}/api/stripe/check_pix_status/?paymentId=${paymentId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const result = await response.json();
        if (result.paid) {
          clearInterval(interval);
          onSuccess();
        }
      } catch (err) {
        console.error("Error checking payment:", err);
      } finally {
        setChecking(false);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [paymentId, onSuccess]);

  return (
    <View style={{ gap: 20 }}>
      <View style={{ alignItems: "center" }}>
        <Text style={pixStyles.title}>{t("pixDisplay.title")}</Text>
        <Text style={pixStyles.subtitle}>{t("pixDisplay.subtitle")}</Text>
      </View>

      {/* QR Code */}
      <View style={pixStyles.qrWrapper}>
        <Image
          source={{ uri: qrCode }}
          style={pixStyles.qrImage}
          resizeMode="contain"
        />
      </View>

      {/* Copy pix code */}
      <View style={{ gap: 8 }}>
        <Text style={formStyles.label}>{t("pixDisplay.pixCodeLabel")}</Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TextInput
            value={pixCode}
            editable={false}
            style={[
              formStyles.input,
              { flex: 1, fontFamily: "monospace", fontSize: 11 },
            ]}
          />
          <Pressable onPress={handleCopy} style={pixStyles.copyBtn}>
            {copied ? (
              <Check size={16} color="#fff" />
            ) : (
              <Text style={pixStyles.copyBtnText}>
                {t("pixDisplay.copyButton")}
              </Text>
            )}
          </Pressable>
        </View>
      </View>

      {checking && (
        <View style={pixStyles.checkingRow}>
          <ActivityIndicator size="small" color="#facc15" />
          <Text style={pixStyles.checkingText}>
            {t("pixDisplay.checkingPayment")}
          </Text>
        </View>
      )}

      <View style={pixStyles.noticeBox}>
        <Text style={pixStyles.noticeText}>{t("pixDisplay.notice")}</Text>
      </View>
    </View>
  );
}

// ─── SuccessPopup ─────────────────────────────────────────────────────────────

function SuccessPopup({
  onClose,
  planName,
}: {
  onClose: () => void;
  planName: string;
}) {
  const t = useTranslations("Pricing");
  const scale = useRef(new Animated.Value(0.9)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        tension: 80,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const tips = [
    { Icon: Flame, text: t("success.tips.0") },
    { Icon: TrendingUp, text: t("success.tips.1") },
    { Icon: Video, text: t("success.tips.2") },
  ];

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={successStyles.backdrop} onPress={onClose}>
        <Animated.View
          style={[successStyles.card, { opacity, transform: [{ scale }] }]}
        >
          <Pressable onPress={() => {}} style={{ width: "100%" }}>
            {/* Check icon */}
            <View style={{ alignItems: "center", marginBottom: 24 }}>
              <View style={successStyles.checkRing}>
                <Check size={48} color="#f43f5e" />
              </View>
            </View>

            {/* Title */}
            <Text style={successStyles.title}>
              {t("success.title", { planName })}
            </Text>

            {/* Tips */}
            <View style={successStyles.tipsBox}>
              {tips.map(({ Icon, text }, i) => (
                <View key={i} style={successStyles.tipRow}>
                  <Icon size={18} color="#f43f5e" />
                  <Text style={successStyles.tipText}>{text}</Text>
                </View>
              ))}
            </View>

            {/* CTA */}
            <Pressable onPress={onClose} style={successStyles.ctaBtn}>
              <Text style={successStyles.ctaBtnText}>
                {t("success.button")}
              </Text>
              <ArrowRight size={16} color="#fff" />
            </Pressable>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function AffiliateBlock({
  affiliateInfo,
  selectedPlan,
  t,
}: {
  affiliateInfo: AffiliateInfo;
  selectedPlan: Plan;
  t: any;
}) {
  return (
    <View style={styles.affiliateBox}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Check size={14} color="#4ade80" />
        <Text style={styles.affiliateText}>
          {t("referredBy", { name: affiliateInfo.name })}
        </Text>
      </View>
      <Text style={styles.affiliateSub}>
        {t("affiliateCode", { code: affiliateInfo.code })}
      </Text>
      {affiliateInfo.userDiscount > 0 &&
        !selectedPlan.isDesconto &&
        !selectedPlan.isAnnual && (
          <Text style={styles.affiliateSub}>
            {t("affiliateDiscount", { discount: affiliateInfo.userDiscount })}
          </Text>
        )}
    </View>
  );
}

function ErrorBlock({ message }: { message: string }) {
  return (
    <View style={styles.errorBox}>
      <Text style={styles.errorBoxText}>{message}</Text>
    </View>
  );
}

// ─── CustomCheckout ───────────────────────────────────────────────────────────

export function CustomCheckout({
  isOpen,
  onClose,
  selectedPlan,
}: CustomCheckoutProps) {
  const t = useTranslations("Pricing");
  const router = useRouter();
  const { user, hasUsedAffiliateCoupon } = useUser();

  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showPlanSummary, setShowPlanSummary] = useState(false);
  const [affiliateInfo, setAffiliateInfo] = useState<AffiliateInfo | null>(
    null,
  );
  const [promoCodes, setPromoCodes] = useState<PromoCodeOption[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [pixQrCode, setPixQrCode] = useState<string | null>(null);
  const [pixCode, setPixCode] = useState<string | null>(null);
  const [pixPaymentId, setPixPaymentId] = useState<string | null>(null);
  const [appliedPromoCode, setAppliedPromoCode] =
    useState<PromoCodeOption | null>(null);

  useEffect(() => {
    if (!hasUsedAffiliateCoupon) getAffiliateInfo().then(setAffiliateInfo);
  }, [hasUsedAffiliateCoupon]);

  const fetchPromoCodes = useCallback(async () => {
    if (!user) return;
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const r = await fetch(`${BASE_URL}/api/stripe/get-promotional-codes/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await r.json();
      setPromoCodes(Array.isArray(data) ? data : []);
    } catch {
      setPromoCodes([]);
    }
  }, [user]);

  useEffect(() => {
    if (!isOpen || !user) return;
    fetchPromoCodes();
  }, [isOpen, user, fetchPromoCodes]);

  const regionalPrice = useMemo(() => {
    if (!selectedPlan)
      return { currency: "USD", displayPrice: "$0.00", symbol: "$" };
    if (selectedPlan.isDesconto) return getDescontoPriceForRegion(user?.region);
    const base = getPriceForUserRegion(
      selectedPlan.planType,
      selectedPlan.isAnnual || false,
      user?.region,
    );
    const discountPct = selectedPlan.affiliateDiscount ?? 0;
    if (discountPct > 0 && !selectedPlan.isAnnual) {
      const discountedDisplay = base.displayPrice.replace(
        /[\d.,]+/,
        (match) => {
          const lastComma = match.lastIndexOf(",");
          const lastDot = match.lastIndexOf(".");
          let num: number,
            isBrFormat = false;
          if (lastComma > lastDot) {
            isBrFormat = true;
            num = parseFloat(match.replace(/\./g, "").replace(",", "."));
          } else num = parseFloat(match.replace(/,/g, ""));
          const discounted = num * (1 - discountPct / 100);
          if (isBrFormat)
            return discounted.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });
          return lastDot >= 0
            ? discounted.toFixed(2)
            : String(Math.round(discounted));
        },
      );
      return { ...base, displayPrice: discountedDisplay };
    }
    return base;
  }, [selectedPlan, user?.region]);

  const topLevelDiscountedPrice = useMemo(() => {
    if (!appliedPromoCode?.discount) return null;
    const pct = parseFloat(appliedPromoCode.discount);
    if (!pct) return null;
    const raw = regionalPrice.displayPrice
      .replace(/[^\d.,]/g, "")
      .replace(",", ".");
    const numeric = parseFloat(raw);
    if (isNaN(numeric)) return null;
    return `${regionalPrice.symbol}${(numeric * (1 - pct / 100)).toFixed(2)}`;
  }, [appliedPromoCode, regionalPrice]);

  const handleSuccess = () => {
    onClose();
    setShowSuccessPopup(true);
  };

  if (!isOpen || !selectedPlan) return null;

  const planIcons = { essential: Play, creator: Users, agency: Crown };
  const PlanIcon =
    planIcons[selectedPlan.planType as keyof typeof planIcons] || Crown;

  return (
    <StripeProvider
      publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!}
    >
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={onClose}
        statusBarTranslucent
      >
        <Pressable style={styles.backdrop} onPress={onClose}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            {/* Close button */}
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <X size={14} color="#a1a1aa" />
            </Pressable>

            {/* Back button (mobile plan summary) */}
            {showPlanSummary && (
              <Pressable
                onPress={() => setShowPlanSummary(false)}
                style={styles.backBtn}
              >
                <ArrowLeft size={14} color="#a1a1aa" />
              </Pressable>
            )}

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.inner}>
                {/* ── Plan summary panel ── */}
                {showPlanSummary ? (
                  <View style={{ gap: 16 }}>
                    <View>
                      <Text style={styles.panelTitle}>
                        {t("sectionTitleCompleteOrder")}
                      </Text>
                      <Text style={styles.panelSubtitle}>
                        {t("sectionDescriptionSubscribing", {
                          planName: t(`plans.${selectedPlan.planType}.nome`),
                        })}
                      </Text>
                    </View>

                    {/* Plan details card */}
                    <View style={styles.planCard}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginBottom: 16,
                        }}
                      >
                        <View style={styles.planIconWrapper}>
                          <PlanIcon size={20} color="#ec4899" />
                        </View>
                        <View>
                          <Text style={styles.planName}>
                            {t(`plans.${selectedPlan.planType}.nome`)}
                          </Text>
                          <Text style={styles.planBilling}>
                            {t(
                              `labels.${selectedPlan.isAnnual ? "annualBilling" : "monthlyBilling"}`,
                            )}
                          </Text>
                        </View>
                      </View>

                      <View style={{ gap: 8, marginBottom: 16 }}>
                        {selectedPlan.features.map((_f: any, index: number) => (
                          <View
                            key={index}
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <Check size={14} color="#4ade80" />
                            <Text style={styles.featureText}>
                              {t(
                                `plans.${selectedPlan.planType}.recursos.${index}`,
                              )}
                            </Text>
                          </View>
                        ))}
                      </View>

                      <View style={styles.totalRow}>
                        {selectedPlan.isDesconto && (
                          <View style={styles.descontoBadge}>
                            <Text style={styles.descontoBadgeText}>
                              🎁 {t("desconto.badge")}
                            </Text>
                          </View>
                        )}
                        {(selectedPlan.affiliateDiscount ?? 0) > 0 &&
                          !selectedPlan.isDesconto &&
                          !selectedPlan.isAnnual && (
                            <View style={styles.affiliateBadge}>
                              <Text style={styles.affiliateBadgeText}>
                                {t("affiliate.badge", {
                                  discount: selectedPlan.affiliateDiscount ?? 0,
                                })}
                              </Text>
                            </View>
                          )}
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <Text style={styles.totalLabel}>
                            {t("formLabels.total")}
                          </Text>
                          {topLevelDiscountedPrice ? (
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              <Text style={styles.totalOriginal}>
                                {regionalPrice.displayPrice}
                              </Text>
                              <Text style={styles.totalDiscounted}>
                                {topLevelDiscountedPrice}
                              </Text>
                            </View>
                          ) : (
                            <Text style={styles.totalPrice}>
                              {regionalPrice.displayPrice}
                            </Text>
                          )}
                        </View>
                        {selectedPlan.isAnnual && !selectedPlan.isDesconto && (
                          <Text style={styles.savingsText}>
                            {t(`plans.${selectedPlan.planType}.economiaAnual`)}
                          </Text>
                        )}
                      </View>
                    </View>

                    {/* Trust indicators */}
                    <View style={{ gap: 8 }}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <Star size={14} color="#eab308" />
                        <Text style={styles.trustText}>
                          {t("trustIndicators.cancelAnytimeNoQuestions")}
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <Check size={14} color="#22c55e" />
                        <Text style={styles.trustText}>
                          {t("trustIndicators.instantAccess")}
                        </Text>
                      </View>
                    </View>

                    <Pressable
                      onPress={() => setShowPlanSummary(false)}
                      style={styles.backToPay}
                    >
                      <Text style={styles.backToPayText}>
                        Voltar ao Pagamento
                      </Text>
                    </Pressable>
                  </View>
                ) : (
                  <View style={{ gap: 16 }}>
                    {/* Mobile plan summary preview */}
                    <View style={styles.miniPlanCard}>
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <View style={styles.miniIconWrapper}>
                          <PlanIcon size={14} color="#ec4899" />
                        </View>
                        <View>
                          <Text style={styles.miniPlanName}>
                            {t(`plans.${selectedPlan.planType}.nome`)}
                          </Text>
                          <Text style={styles.miniPlanPrice}>
                            {regionalPrice.displayPrice}
                          </Text>
                        </View>
                      </View>
                      <Pressable onPress={() => setShowPlanSummary(true)}>
                        <Text style={styles.detailsLink}>Ver Detalhes</Text>
                      </Pressable>
                    </View>

                    {/* Payment method tabs (BR only) */}
                    {user?.region === "BR" && (
                      <View style={{ flexDirection: "row", gap: 8 }}>
                        {(["card", "pix"] as PaymentMethod[]).map((method) => (
                          <Pressable
                            key={method}
                            onPress={() => {
                              setPaymentMethod(method);
                              setAppliedPromoCode(null);
                            }}
                            style={[
                              styles.methodTab,
                              paymentMethod === method &&
                                styles.methodTabActive,
                            ]}
                          >
                            {method === "card" ? (
                              <CreditCard size={18} color="#fff" />
                            ) : (
                              <PixLogo size={18} />
                            )}
                            <Text style={styles.methodTabText}>
                              {t(`paymentTabs.${method}`)}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    )}

                    {/* Payment form */}
                    {pixQrCode && pixCode && pixPaymentId ? (
                      <PixDisplay
                        qrCode={pixQrCode}
                        pixCode={pixCode}
                        paymentId={pixPaymentId}
                        onSuccess={handleSuccess}
                      />
                    ) : paymentMethod === "pix" ? (
                      <PixPaymentForm
                        selectedPlan={selectedPlan}
                        regionalPrice={regionalPrice}
                        onPixGenerated={(qr, code, id) => {
                          setPixQrCode(qr);
                          setPixCode(code);
                          setPixPaymentId(id);
                        }}
                        affiliateInfo={affiliateInfo}
                        promoCodes={promoCodes}
                        onAppliedCodeChange={setAppliedPromoCode}
                        onCodeClaimed={fetchPromoCodes}
                      />
                    ) : (
                      <CheckoutForm
                        selectedPlan={selectedPlan}
                        onClose={onClose}
                        onSuccess={handleSuccess}
                        regionalPrice={regionalPrice}
                        affiliateInfo={affiliateInfo}
                        promoCodes={promoCodes}
                        onAppliedCodeChange={setAppliedPromoCode}
                        onCodeClaimed={fetchPromoCodes}
                      />
                    )}
                  </View>
                )}
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {showSuccessPopup && selectedPlan && (
        <SuccessPopup
          planName={t(`plans.${selectedPlan.planType}.nome`)}
          onClose={() => {
            setShowSuccessPopup(false);
            router.replace("/dashboard" as any);
          }}
        />
      )}
    </StripeProvider>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    padding: 8,
  },
  sheet: {
    backgroundColor: "#0f0f11",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#27272a",
    maxHeight: "95%",
    position: "relative",
    overflow: "hidden",
  },
  closeBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 50,
    width: 32,
    height: 32,
    borderRadius: 99,
    backgroundColor: "#27272a",
    alignItems: "center",
    justifyContent: "center",
  },
  backBtn: {
    position: "absolute",
    top: 12,
    left: 12,
    zIndex: 50,
    width: 32,
    height: 32,
    borderRadius: 99,
    backgroundColor: "#27272a",
    alignItems: "center",
    justifyContent: "center",
  },
  inner: { padding: 20, paddingTop: 52 },
  panelTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 6,
  },
  panelSubtitle: { fontSize: 13, color: "#a1a1aa" },
  planCard: {
    backgroundColor: "rgba(39,39,42,0.5)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#3f3f46",
  },
  planIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 99,
    backgroundColor: "rgba(236,72,153,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  planName: { fontSize: 17, fontWeight: "700", color: "#fff" },
  planBilling: { fontSize: 13, color: "#a1a1aa" },
  featureText: { fontSize: 13, color: "#d4d4d8", flex: 1 },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#3f3f46",
    paddingTop: 12,
    gap: 8,
  },
  totalLabel: { fontSize: 14, color: "#a1a1aa" },
  totalOriginal: {
    fontSize: 15,
    color: "#71717a",
    textDecorationLine: "line-through",
  },
  totalDiscounted: { fontSize: 18, fontWeight: "700", color: "#34d399" },
  totalPrice: { fontSize: 20, fontWeight: "700", color: "#fff" },
  savingsText: { fontSize: 12, color: "#4ade80" },
  descontoBadge: {
    backgroundColor: "rgba(236,72,153,0.15)",
    borderRadius: 99,
    borderWidth: 1,
    borderColor: "rgba(236,72,153,0.4)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  descontoBadgeText: { fontSize: 11, fontWeight: "700", color: "#f472b6" },
  affiliateBadge: {
    backgroundColor: "rgba(34,197,94,0.15)",
    borderRadius: 99,
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.4)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  affiliateBadgeText: { fontSize: 11, fontWeight: "700", color: "#4ade80" },
  trustText: { fontSize: 13, color: "#a1a1aa", flex: 1 },
  backToPay: {
    borderWidth: 1,
    borderColor: "#3f3f46",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  backToPayText: { fontSize: 14, color: "#d4d4d8" },
  miniPlanCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(39,39,42,0.5)",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#3f3f46",
  },
  miniIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 99,
    backgroundColor: "rgba(236,72,153,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  miniPlanName: { fontSize: 13, fontWeight: "700", color: "#fff" },
  miniPlanPrice: { fontSize: 12, color: "#a1a1aa" },
  detailsLink: { fontSize: 13, color: "#ec4899" },
  methodTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#27272a",
  },
  methodTabActive: { backgroundColor: "#ec4899" },
  methodTabText: { fontSize: 14, fontWeight: "600", color: "#fff" },
  sectionTitle: { fontSize: 15, fontWeight: "600", color: "#fff" },
  securityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  securityText: { fontSize: 12, color: "#71717a" },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#ec4899",
    borderRadius: 8,
    paddingVertical: 14,
  },
  submitBtnText: { fontSize: 14, fontWeight: "600", color: "#fff" },
  affiliateBox: {
    backgroundColor: "rgba(34,197,94,0.08)",
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.3)",
    borderRadius: 8,
    padding: 12,
    gap: 4,
  },
  affiliateText: { fontSize: 13, color: "#4ade80" },
  affiliateSub: {
    fontSize: 12,
    color: "rgba(74,222,128,0.7)",
    paddingLeft: 20,
  },
  errorBox: {
    backgroundColor: "rgba(239,68,68,0.08)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.3)",
    borderRadius: 8,
    padding: 12,
  },
  errorBoxText: { fontSize: 13, color: "#f87171" },
});

const formStyles = StyleSheet.create({
  group: { gap: 6 },
  label: { fontSize: 13, color: "#d4d4d8", fontWeight: "500" },
  input: {
    backgroundColor: "#27272a",
    borderWidth: 1,
    borderColor: "#3f3f46",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#fff",
    height: 44,
  },
  inputError: { borderColor: "#ef4444" },
  errorText: { fontSize: 12, color: "#f87171", marginTop: 4 },
});

const cardStyles = StyleSheet.create({
  field: { height: 44, marginVertical: 4 },
  cardStyle: {
    backgroundColor: "#27272a",
    borderWidth: 1,
    borderColor: "#3f3f46",
    borderRadius: 8,
    textColor: "#ffffff",
    placeholderColor: "#52525b",
  },
});

const couponStyles = StyleSheet.create({
  applied: {
    backgroundColor: "rgba(236,72,153,0.08)",
    borderWidth: 1,
    borderColor: "rgba(236,72,153,0.3)",
    borderRadius: 8,
    padding: 12,
    gap: 4,
  },
  appliedRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  appliedCode: {
    fontSize: 13,
    fontWeight: "700",
    color: "#f472b6",
    fontFamily: "monospace",
  },
  discountBadge: {
    backgroundColor: "rgba(236,72,153,0.15)",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  discountBadgeText: { fontSize: 11, fontWeight: "700", color: "#f9a8d4" },
  removeText: { fontSize: 12, color: "#71717a" },
  creditLine: { fontSize: 12, color: "#38bdf8", paddingLeft: 24 },
  pickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#27272a",
    borderWidth: 1,
    borderColor: "#3f3f46",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  pickerBtnText: { fontSize: 13, color: "#d4d4d8" },
  dropdownList: {
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#3f3f46",
    borderRadius: 12,
    marginTop: 4,
    overflow: "hidden",
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#27272a",
  },
  dropdownCode: {
    fontSize: 13,
    fontWeight: "700",
    color: "#f472b6",
    fontFamily: "monospace",
  },
  dropdownDiscount: { fontSize: 12, fontWeight: "700", color: "#34d399" },
  claimLabel: { fontSize: 12, color: "#71717a", fontWeight: "500" },
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
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  claimBtnText: { fontSize: 13, fontWeight: "600", color: "#fff" },
  claimResult: { fontSize: 12, fontWeight: "500" },
});

const pixStyles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: { fontSize: 13, color: "#a1a1aa", textAlign: "center" },
  qrWrapper: {
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
  },
  qrImage: { width: 240, height: 240 },
  copyBtn: {
    backgroundColor: "#27272a",
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  copyBtnText: { fontSize: 13, color: "#d4d4d8" },
  checkingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(234,179,8,0.08)",
    borderWidth: 1,
    borderColor: "rgba(234,179,8,0.3)",
    borderRadius: 8,
    padding: 12,
  },
  checkingText: { fontSize: 13, color: "#facc15" },
  noticeBox: {
    backgroundColor: "rgba(59,130,246,0.08)",
    borderWidth: 1,
    borderColor: "rgba(59,130,246,0.3)",
    borderRadius: 8,
    padding: 16,
  },
  noticeText: { fontSize: 13, color: "#60a5fa", textAlign: "center" },
});

const successStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  card: {
    backgroundColor: "#18181b",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#27272a",
    padding: 24,
    width: "100%",
    maxWidth: 440,
    alignItems: "center",
  },
  checkRing: {
    width: 80,
    height: 80,
    borderRadius: 99,
    backgroundColor: "rgba(244,63,94,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#f4f4f5",
    textAlign: "center",
    marginBottom: 20,
  },
  tipsBox: {
    backgroundColor: "rgba(39,39,42,0.5)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(63,63,70,0.5)",
    padding: 16,
    gap: 12,
    width: "100%",
    marginBottom: 24,
  },
  tipRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  tipText: { fontSize: 13, color: "#d4d4d8", flex: 1 },
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#f43f5e",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  ctaBtnText: { fontSize: 14, fontWeight: "500", color: "#fff" },
});

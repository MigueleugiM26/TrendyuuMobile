import { useUser } from "@/src/context/user-context";
import { userIds } from "@/src/hooks/posthogAnalytics";
import {
  CardField,
  StripeProvider,
  useConfirmPayment,
} from "@/src/hooks/stripe-native";
import { useTranslations } from "@/src/hooks/useTranslations";
import { getAvulsoPriceForUserRegion } from "@/src/utils/pricing";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store"; // replaces localStorage for token
import {
  ArrowLeft,
  Check,
  CreditCard,
  Lock,
  Shield,
  Sparkles,
  Star,
  X,
  Zap,
} from "lucide-react-native";
import { AnimatePresence, MotiView } from "moti";
import posthog from "posthog-react-native";
import type React from "react";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Clipboard,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface CreditPack {
  packType: string; // avulso_mini | avulso_basico | avulso_extra
  name: string;
  credits: number;
  autoclip: number;
  shortGenerator: number;
}

interface CreditCheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  pack: CreditPack | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const PACK_ICONS: Record<string, React.ElementType> = {
  avulso_mini: Zap,
  avulso_basico: Star,
  avulso_extra: Sparkles,
};

const PixLogo = ({ size = 20, color = "currentColor" }) => (
  // SVG paths are not supported in RN — render as a text label fallback.
  // Swap for an <Image> asset or a vector icon library if you have a Pix icon.
  <Text style={{ color, fontSize: size * 0.6, fontWeight: "700" }}>PIX</Text>
);

const isPostalValid = (country: string, postal: string) => {
  if (!postal) return false;
  if (country === "OTHER") return postal.length > 0;
  const rules: Record<string, number> = {
    BR: 9,
    US: 5,
    AU: 4,
    NZ: 4,
    ZA: 4,
    SG: 6,
    KR: 5,
    MX: 5,
  };
  if (rules[country]) return postal.length === rules[country];
  if (country === "CA") return postal.length === 7;
  if (country === "GB") return postal.length >= 5;
  return postal.length > 0;
};

const formatCPF = (v: string) => {
  const d = v.replace(/\D/g, "");
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9, 11)}`;
};

const validateCPF = (cpf: string): boolean => {
  const d = cpf.replace(/\D/g, "");
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  let s = 0;
  for (let i = 1; i <= 9; i++) s += parseInt(d[i - 1]) * (11 - i);
  let r = (s * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  if (r !== parseInt(d[9])) return false;
  s = 0;
  for (let i = 1; i <= 10; i++) s += parseInt(d[i - 1]) * (12 - i);
  r = (s * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  return r === parseInt(d[10]);
};

const COUNTRIES = [
  ["AU", "🇦🇺"],
  ["BR", "🇧🇷"],
  ["CA", "🇨🇦"],
  ["GB", "🇬🇧"],
  ["US", "🇺🇸"],
  ["EU", "🇪🇺"],
  ["ES", "🇪🇸"],
  ["FR", "🇫🇷"],
  ["DE", "🇩🇪"],
  ["IT", "🇮🇹"],
  ["JP", "🇯🇵"],
  ["MX", "🇲🇽"],
  ["AR", "🇦🇷"],
  ["CL", "🇨🇱"],
  ["CO", "🇨🇴"],
  ["KR", "🇰🇷"],
  ["SG", "🇸🇬"],
  ["NZ", "🇳🇿"],
  ["AE", "🇦🇪"],
  ["ZA", "🇿🇦"],
  ["OTHER", "🌍"],
] as const;

// ─── Shared field components ───────────────────────────────────────────────────
function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize,
  error,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "email-address" | "numeric";
  autoCapitalize?: "none" | "characters" | "words";
  error?: string | null;
}) {
  return (
    <View style={styles.fieldWrapper}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#6b7280"
        keyboardType={keyboardType ?? "default"}
        autoCapitalize={autoCapitalize ?? "words"}
        style={[styles.textInput, error ? styles.textInputError : null]}
      />
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

// ─── Card Form ────────────────────────────────────────────────────────────────
function CreditCardForm({
  pack,
  regionalPrice,
  onSuccess,
}: {
  pack: CreditPack;
  regionalPrice: { currency: string; displayPrice: string; symbol: string };
  onSuccess: () => void;
}) {
  const tP = useTranslations("Pricing");
  const tA = useTranslations("PricingAvulso");
  const { confirmPayment } = useConfirmPayment();
  const { user } = useUser();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: user?.name || "",
    email: user?.email || "",
    country: user?.region || "BR",
    postal: "",
    customCountry: "",
  });

  const handlePostalChange = (val: string) => {
    const c = customerInfo.country;
    if (c === "BR") {
      val = val.replace(/\D/g, "");
      if (val.length > 5) val = val.slice(0, 5) + "-" + val.slice(5, 8);
      if (val.length > 9) val = val.slice(0, 9);
    } else if (c === "US") {
      val = val.replace(/\D/g, "").slice(0, 5);
    } else if (["AU", "NZ"].includes(c)) {
      val = val.replace(/\D/g, "").slice(0, 4);
    } else if (c === "CA") {
      val = val.toUpperCase().replace(/[^A-Z0-9]/g, "");
      if (val.length > 3) val = val.slice(0, 3) + " " + val.slice(3, 6);
    } else if (c === "GB") {
      val = val.toUpperCase().replace(/[^A-Z0-9]/g, "");
      if (val.length > 3)
        val = val.slice(0, val.length - 3) + " " + val.slice(-3);
      if (val.length > 8) val = val.slice(0, 8);
    } else if (c === "JP") {
      val = val.replace(/\D/g, "").slice(0, 7);
      if (val.length > 3) val = val.slice(0, 3) + "-" + val.slice(3, 7);
    } else {
      if (val.length > 10) val = val.slice(0, 10);
    }
    setCustomerInfo((p) => ({ ...p, postal: val }));
  };

  const handleSubmit = async () => {
    if (!cardComplete) return;
    if (!customerInfo.postal.trim()) {
      setError(tP("errors.postalRequired"));
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const token = await SecureStore.getItemAsync("accessToken");
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_TRENDYUU_URL_BACK}/api/stripe/create_credit_checkout/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            packType: pack.packType,
            userId: user?.id,
            country:
              customerInfo.country === "OTHER"
                ? customerInfo.customCountry
                : customerInfo.country,
            postal: customerInfo.postal,
          }),
        },
      );

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || tP("errors.paymentFailed"));

      if (result.requiresAction && result.clientSecret) {
        const { error: confirmError } = await confirmPayment(
          result.clientSecret,
          { paymentMethodType: "Card" },
        );
        if (confirmError) throw new Error(confirmError.message);
      }

      if (result.success || result.status === "succeeded") {
        onSuccess();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : tP("errors.unknown"));
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedCountry = COUNTRIES.find(
    ([v]) => v === customerInfo.country,
  ) ?? ["OTHER", "🌍"];

  return (
    <View style={styles.form}>
      <View style={styles.formSectionHeader}>
        <CreditCard size={16} color="#ec4899" />
        <Text style={styles.formSectionTitle}>
          {tP("formLabels.billingInformation")}
        </Text>
      </View>

      <FormField
        label={tP("formLabels.fullName")}
        value={customerInfo.name}
        onChangeText={(v) => setCustomerInfo((p) => ({ ...p, name: v }))}
      />
      <FormField
        label={tP("formLabels.email")}
        value={customerInfo.email}
        onChangeText={(v) => setCustomerInfo((p) => ({ ...p, email: v }))}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Country picker */}
      <View style={styles.fieldWrapper}>
        <Text style={styles.fieldLabel}>{tP("formLabels.country")}</Text>
        <TouchableOpacity
          onPress={() => setShowCountryPicker(true)}
          style={styles.textInput}
          activeOpacity={0.7}
        >
          <Text style={styles.countryPickerText}>
            {selectedCountry[1]}{" "}
            {tP(`formLabels.countries.${customerInfo.country}`)}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Inline country picker modal */}
      <Modal
        visible={showCountryPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <View style={styles.pickerBackdrop}>
          <View style={styles.pickerSheet}>
            <ScrollView>
              {COUNTRIES.map(([v, flag]) => (
                <TouchableOpacity
                  key={v}
                  onPress={() => {
                    setCustomerInfo((p) => ({
                      ...p,
                      country: v,
                      postal: "",
                      customCountry: v === "OTHER" ? p.customCountry : "",
                    }));
                    setShowCountryPicker(false);
                  }}
                  style={[
                    styles.pickerOption,
                    customerInfo.country === v && styles.pickerOptionSelected,
                  ]}
                >
                  <Text style={styles.pickerOptionText}>
                    {flag} {tP(`formLabels.countries.${v}`)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {customerInfo.country === "OTHER" && (
        <FormField
          label={tP("formLabels.customCountry")}
          value={customerInfo.customCountry}
          onChangeText={(v) =>
            setCustomerInfo((p) => ({ ...p, customCountry: v }))
          }
        />
      )}

      {/* Stripe CardField — direct equivalent of CardElement */}
      <View style={styles.fieldWrapper}>
        <Text style={styles.fieldLabel}>
          {tP("formLabels.cardInformation")}
        </Text>
        <CardField
          postalCodeEnabled={false}
          onCardChange={(details) => setCardComplete(details.complete)}
          style={styles.cardField}
          cardStyle={{
            backgroundColor: "#27272a",
            textColor: "#ffffff",
            placeholderColor: "#6b7280",
            borderColor: "#3f3f46",
            borderWidth: 1,
            borderRadius: 8,
          }}
        />
      </View>

      <FormField
        label={tP(`formLabels.postal.${customerInfo.country}`)}
        value={customerInfo.postal}
        onChangeText={handlePostalChange}
        placeholder={tP(
          `formLabels.postalPlaceholders.${customerInfo.country}`,
        )}
        keyboardType="default"
      />

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.securityRow}>
        <Shield size={12} color="#71717a" />
        <Text style={styles.securityText}>
          {tP("formLabels.securityNotice")}
        </Text>
      </View>

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={
          isProcessing ||
          !cardComplete ||
          !isPostalValid(customerInfo.country, customerInfo.postal) ||
          (customerInfo.country === "OTHER" && !customerInfo.customCountry)
        }
        style={[
          styles.submitButton,
          (isProcessing ||
            !cardComplete ||
            !isPostalValid(customerInfo.country, customerInfo.postal)) &&
            styles.submitButtonDisabled,
        ]}
        activeOpacity={0.8}
      >
        {isProcessing ? (
          <View style={styles.submitButtonInner}>
            <ActivityIndicator size="small" color="#fff" />
            <Text style={styles.submitButtonText}>
              {tP("buttons.processingPayment")}
            </Text>
          </View>
        ) : (
          <View style={styles.submitButtonInner}>
            <Lock size={16} color="#fff" />
            <Text style={styles.submitButtonText}>
              {tA("buttons.buy")} — {regionalPrice.displayPrice}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

// ─── Pix Form ─────────────────────────────────────────────────────────────────
function CreditPixForm({
  pack,
  regionalPrice,
  onPixGenerated,
}: {
  pack: CreditPack;
  regionalPrice: { currency: string; displayPrice: string; symbol: string };
  onPixGenerated: (qrCode: string, pixCode: string, paymentId: string) => void;
}) {
  const tP = useTranslations("Pricing");
  const { user } = useUser();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cpfError, setCpfError] = useState<string | null>(null);
  const [info, setInfo] = useState({
    name: user?.name || "",
    email: user?.email || "",
    postal: "",
    cpf: "",
  });

  const handleSubmit = async () => {
    if (!validateCPF(info.cpf)) {
      setCpfError("CPF inválido");
      return;
    }
    if (!info.postal || info.postal.length !== 9) {
      setError(tP("errors.postalRequired"));
      return;
    }

    setIsProcessing(true);
    setError(null);
    setCpfError(null);

    try {
      const token = await SecureStore.getItemAsync("accessToken");
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_TRENDYUU_URL_BACK}/api/stripe/create_credit_pix/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            packType: pack.packType,
            userId: user?.id,
            name: info.name,
            email: info.email,
            postal: info.postal,
            cpf: info.cpf.replace(/\D/g, ""),
          }),
        },
      );

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Erro ao gerar Pix");
      if (result.qrCode && result.pixCode && result.paymentId) {
        onPixGenerated(result.qrCode, result.pixCode, result.paymentId);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.form}>
      <View style={styles.formSectionHeader}>
        <CreditCard size={16} color="#ec4899" />
        <Text style={styles.formSectionTitle}>{tP("pixForm.title")}</Text>
      </View>

      <FormField
        label={tP("formLabels.fullName")}
        value={info.name}
        onChangeText={(v) => setInfo((p) => ({ ...p, name: v }))}
      />
      <FormField
        label={tP("formLabels.email")}
        value={info.email}
        onChangeText={(v) => setInfo((p) => ({ ...p, email: v }))}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <View style={styles.fieldWrapper}>
        <Text style={styles.fieldLabel}>CPF</Text>
        <TextInput
          value={info.cpf}
          onChangeText={(v) => {
            const f = formatCPF(v);
            setInfo((p) => ({ ...p, cpf: f }));
            if (f.replace(/\D/g, "").length === 11) {
              setCpfError(validateCPF(f) ? null : "CPF inválido");
            } else {
              setCpfError(null);
            }
          }}
          placeholder="000.000.000-00"
          placeholderTextColor="#6b7280"
          keyboardType="numeric"
          style={[styles.textInput, cpfError ? styles.textInputError : null]}
        />
        {cpfError && <Text style={styles.fieldError}>{cpfError}</Text>}
      </View>

      <View style={styles.fieldWrapper}>
        <Text style={styles.fieldLabel}>CEP</Text>
        <TextInput
          value={info.postal}
          onChangeText={(val) => {
            val = val.replace(/\D/g, "");
            if (val.length > 5) val = val.slice(0, 5) + "-" + val.slice(5, 8);
            if (val.length > 9) val = val.slice(0, 9);
            setInfo((p) => ({ ...p, postal: val }));
          }}
          placeholder="12345-678"
          placeholderTextColor="#6b7280"
          keyboardType="numeric"
          style={styles.textInput}
        />
      </View>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={
          isProcessing ||
          info.postal.length !== 9 ||
          info.cpf.replace(/\D/g, "").length !== 11 ||
          !validateCPF(info.cpf)
        }
        style={[
          styles.submitButton,
          (isProcessing || info.postal.length !== 9) &&
            styles.submitButtonDisabled,
        ]}
        activeOpacity={0.8}
      >
        {isProcessing ? (
          <View style={styles.submitButtonInner}>
            <ActivityIndicator size="small" color="#fff" />
            <Text style={styles.submitButtonText}>
              {tP("pixForm.generating")}
            </Text>
          </View>
        ) : (
          <View style={styles.submitButtonInner}>
            <Lock size={16} color="#fff" />
            <Text style={styles.submitButtonText}>
              {tP("pixForm.generateButton", {
                price: regionalPrice.displayPrice,
              })}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

// ─── Pix Display ──────────────────────────────────────────────────────────────
function CreditPixDisplay({
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

  useEffect(() => {
    const interval = setInterval(async () => {
      setChecking(true);
      try {
        const token = await SecureStore.getItemAsync("accessToken");
        const res = await fetch(
          `${process.env.EXPO_PUBLIC_TRENDYUU_URL_BACK}/api/stripe/check_credit_pix_status/?paymentId=${paymentId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const result = await res.json();
        if (result.paid) {
          clearInterval(interval);
          onSuccess();
        }
      } catch (err) {
        console.error("Error checking credit pix:", err);
      } finally {
        setChecking(false);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [paymentId, onSuccess]);

  return (
    <View style={styles.pixDisplay}>
      <View style={styles.pixDisplayHeader}>
        <Text style={styles.pixDisplayTitle}>{t("pixDisplay.title")}</Text>
        <Text style={styles.pixDisplaySubtitle}>
          {t("pixDisplay.subtitle")}
        </Text>
      </View>

      {/* QR code rendered as an image from base64 URI or remote URL */}
      <View style={styles.qrWrapper}>
        <Image
          source={{ uri: qrCode }}
          style={styles.qrImage}
          resizeMode="contain"
        />
      </View>

      <View style={styles.pixCodeRow}>
        <TextInput
          value={pixCode}
          editable={false}
          style={styles.pixCodeInput}
          multiline
        />
        <TouchableOpacity
          onPress={() => {
            Clipboard.setString(pixCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          style={styles.copyButton}
          activeOpacity={0.7}
        >
          {copied ? (
            <Check size={16} color="#34d399" />
          ) : (
            <Text style={styles.copyButtonText}>
              {t("pixDisplay.copyButton")}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {checking && (
        <View style={styles.checkingBox}>
          <ActivityIndicator size="small" color="#fbbf24" />
          <Text style={styles.checkingText}>
            {t("pixDisplay.checkingPayment")}
          </Text>
        </View>
      )}

      <View style={styles.pixNoticeBox}>
        <Text style={styles.pixNoticeText}>{t("pixDisplay.notice")}</Text>
      </View>
    </View>
  );
}

// ─── Main CreditCheckout ──────────────────────────────────────────────────────
export function CreditCheckout({ isOpen, onClose, pack }: CreditCheckoutProps) {
  const tA = useTranslations("PricingAvulso");
  const tP = useTranslations("Pricing");
  const { user, refreshUser } = useUser();
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<"card" | "pix">("card");
  const [showSuccess, setShowSuccess] = useState(false);
  // On mobile the "pack detail" view is a navigable screen instead of a column
  const [showPackDetail, setShowPackDetail] = useState(false);
  const [pixQrCode, setPixQrCode] = useState<string | null>(null);
  const [pixCode, setPixCode] = useState<string | null>(null);
  const [pixPaymentId, setPixPaymentId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id && !userIds.includes(String(user?.id))) {
      posthog.capture("credits_checkout");
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setShowSuccess(false);
      setShowPackDetail(false);
      setPaymentMethod("card");
      setPixQrCode(null);
      setPixCode(null);
      setPixPaymentId(null);
    }
  }, [isOpen]);

  useEffect(() => {
    setShowSuccess(false);
    setShowPackDetail(false);
    setPaymentMethod("card");
    setPixQrCode(null);
    setPixCode(null);
    setPixPaymentId(null);
  }, [pack?.packType]);

  const regionalPrice = pack
    ? getAvulsoPriceForUserRegion(pack.packType, user?.region)
    : { currency: "USD", displayPrice: "$0.00", symbol: "$" };

  const PackIcon = pack ? (PACK_ICONS[pack.packType] ?? Zap) : Zap;

  const handleSuccess = async () => {
    try {
      await (refreshUser as () => Promise<void>)?.();
    } catch (error) {
      console.error(error);
    }
    setShowSuccess(true);
    setTimeout(() => {
      onClose();
      router.push("/success-credits"); // replaces window.location.href
    }, 2000);
  };

  if (!isOpen || !pack) return null;

  const packFeatures = pack
    ? [
        tA("checkout.credits", { credits: pack.credits.toLocaleString() }),
        tA("checkout.autoclip", { autoclip: pack.autoclip }),
        tA("checkout.shortGenerator", {
          shortGenerator: pack.shortGenerator,
        }),
        tA("trustIndicators.noExpiry"),
        tA("trustIndicators.noHiddenFees"),
      ]
    : [];

  return (
    <StripeProvider
      publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!}
    >
      <Modal
        visible={isOpen}
        transparent
        animationType="none"
        onRequestClose={onClose}
        statusBarTranslucent
      >
        <AnimatePresence>
          {isOpen && (
            <MotiView
              key="checkout-backdrop"
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "timing", duration: 200 }}
              style={styles.backdrop}
            >
              <TouchableOpacity
                style={StyleSheet.absoluteFill}
                onPress={onClose}
                activeOpacity={1}
              />

              <MotiView
                from={{ opacity: 0, scale: 0.9, translateY: 20 }}
                animate={{ opacity: 1, scale: 1, translateY: 0 }}
                exit={{ opacity: 0, scale: 0.9, translateY: 20 }}
                transition={{ type: "timing", duration: 300 }}
                style={styles.sheet}
              >
                {/* Close button */}
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeButton}
                  activeOpacity={0.7}
                >
                  <X size={16} color="#a1a1aa" />
                </TouchableOpacity>

                {/* Back button — shown when in pack detail view */}
                {showPackDetail && (
                  <TouchableOpacity
                    onPress={() => setShowPackDetail(false)}
                    style={styles.backButton}
                    activeOpacity={0.7}
                  >
                    <ArrowLeft size={16} color="#a1a1aa" />
                  </TouchableOpacity>
                )}

                <ScrollView
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  {showSuccess ? (
                    // ── Success screen ──────────────────────────────────────
                    <MotiView
                      from={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: "timing", duration: 300 }}
                      style={styles.successScreen}
                    >
                      <View style={styles.successIconWrapper}>
                        <Check size={40} color="#22c55e" />
                      </View>
                      <Text style={styles.successTitle}>
                        {tA("checkout.success.title")}
                      </Text>
                      <Text style={styles.successDescription}>
                        {tA("checkout.success.description", {
                          credits: pack.credits.toLocaleString(),
                          autoclip: pack.autoclip,
                          shortGenerator: pack.shortGenerator,
                        })}
                      </Text>
                      <View style={styles.redirectingRow}>
                        <ActivityIndicator size="small" color="#22c55e" />
                        <Text style={styles.redirectingText}>
                          {tA("checkout.success.redirecting")}
                        </Text>
                      </View>
                    </MotiView>
                  ) : showPackDetail ? (
                    // ── Pack detail screen (mobile-only, replaces left column) ──
                    <View style={styles.packDetail}>
                      <Text style={styles.packDetailTitle}>
                        {tA("checkout.title")}
                      </Text>
                      <Text style={styles.packDetailSubtitle}>
                        {tA("checkout.packSummary")}
                      </Text>

                      <View style={styles.packSummaryCard}>
                        <View style={styles.packSummaryHeader}>
                          <View style={styles.packIconCircle}>
                            <PackIcon size={20} color="#ec4899" />
                          </View>
                          <View>
                            <Text style={styles.packSummaryName}>
                              {pack.name}
                            </Text>
                            <Text style={styles.packSummaryCredits}>
                              {tA("checkout.credits", {
                                credits: pack.credits.toLocaleString(),
                              })}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.packFeaturesList}>
                          {packFeatures.map((feat) => (
                            <View key={feat} style={styles.packFeatureRow}>
                              <Check size={12} color="#22c55e" />
                              <Text style={styles.packFeatureText}>{feat}</Text>
                            </View>
                          ))}
                        </View>

                        <View style={styles.packSummaryTotal}>
                          <Text style={styles.packSummaryTotalLabel}>
                            {tP("formLabels.total")}
                          </Text>
                          <Text style={styles.packSummaryTotalPrice}>
                            {regionalPrice.displayPrice}
                          </Text>
                        </View>
                        <Text style={styles.packSummaryOneTime}>
                          {tA("checkout.oneTimePurchase")}
                        </Text>
                      </View>

                      <View style={styles.neverExpireRow}>
                        <Star size={12} color="#eab308" />
                        <Text style={styles.neverExpireText}>
                          {tA("checkout.neverExpire")}
                        </Text>
                      </View>

                      <TouchableOpacity
                        onPress={() => setShowPackDetail(false)}
                        style={styles.backToPaymentButton}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.backToPaymentText}>
                          Voltar ao pagamento
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    // ── Payment screen ──────────────────────────────────────
                    <View>
                      {/* Mini pack preview + "Ver detalhes" */}
                      <TouchableOpacity
                        onPress={() => setShowPackDetail(true)}
                        style={styles.miniPackPreview}
                        activeOpacity={0.7}
                      >
                        <View style={styles.miniPackLeft}>
                          <View style={styles.packIconCircle}>
                            <PackIcon size={16} color="#ec4899" />
                          </View>
                          <View>
                            <Text style={styles.miniPackName}>{pack.name}</Text>
                            <Text style={styles.miniPackPrice}>
                              {regionalPrice.displayPrice}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.miniPackDetails}>Ver detalhes</Text>
                      </TouchableOpacity>

                      {/* Card / Pix toggle — only for BR */}
                      {user?.region === "BR" && (
                        <View style={styles.paymentTabRow}>
                          {(["card", "pix"] as const).map((method) => (
                            <TouchableOpacity
                              key={method}
                              onPress={() => {
                                setPaymentMethod(method);
                                setPixQrCode(null);
                                setPixCode(null);
                                setPixPaymentId(null);
                              }}
                              style={[
                                styles.paymentTab,
                                paymentMethod === method &&
                                  styles.paymentTabActive,
                              ]}
                              activeOpacity={0.7}
                            >
                              {method === "card" ? (
                                <CreditCard
                                  size={18}
                                  color={
                                    paymentMethod === method
                                      ? "#fff"
                                      : "#9ca3af"
                                  }
                                />
                              ) : (
                                <PixLogo
                                  size={18}
                                  color={
                                    paymentMethod === method
                                      ? "#fff"
                                      : "#9ca3af"
                                  }
                                />
                              )}
                              <Text
                                style={[
                                  styles.paymentTabText,
                                  paymentMethod === method &&
                                    styles.paymentTabTextActive,
                                ]}
                              >
                                {method === "card"
                                  ? tP("paymentTabs.card")
                                  : tP("paymentTabs.pix")}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}

                      {/* Form area */}
                      {pixQrCode && pixCode && pixPaymentId ? (
                        <CreditPixDisplay
                          qrCode={pixQrCode}
                          pixCode={pixCode}
                          paymentId={pixPaymentId}
                          onSuccess={handleSuccess}
                        />
                      ) : paymentMethod === "pix" ? (
                        <CreditPixForm
                          pack={pack}
                          regionalPrice={regionalPrice}
                          onPixGenerated={(qr, code, id) => {
                            setPixQrCode(qr);
                            setPixCode(code);
                            setPixPaymentId(id);
                          }}
                        />
                      ) : (
                        <CreditCardForm
                          pack={pack}
                          regionalPrice={regionalPrice}
                          onSuccess={handleSuccess}
                        />
                      )}
                    </View>
                  )}
                </ScrollView>
              </MotiView>
            </MotiView>
          )}
        </AnimatePresence>
      </Modal>
    </StripeProvider>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.80)",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  sheet: {
    width: "100%",
    maxHeight: "95%",
    backgroundColor: "#18181b",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#27272a",
    overflow: "hidden",
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#3f3f46",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
  },
  backButton: {
    position: "absolute",
    top: 12,
    left: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#3f3f46",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 20,
  },
  // ── Success ─────────────────────────────────────────────────────────────────
  successScreen: {
    alignItems: "center",
    paddingVertical: 40,
  },
  successIconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(34,197,94,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
  },
  successDescription: {
    fontSize: 14,
    color: "#a1a1aa",
    textAlign: "center",
    marginBottom: 16,
  },
  redirectingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  redirectingText: {
    fontSize: 13,
    color: "#22c55e",
  },
  // ── Pack detail ─────────────────────────────────────────────────────────────
  packDetail: {
    gap: 16,
    paddingTop: 24,
  },
  packDetailTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  packDetailSubtitle: {
    fontSize: 13,
    color: "#a1a1aa",
  },
  packSummaryCard: {
    backgroundColor: "rgba(39,39,42,0.5)",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#3f3f46",
    gap: 12,
  },
  packSummaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  packIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(236,72,153,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  packSummaryName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  packSummaryCredits: {
    fontSize: 12,
    color: "#a1a1aa",
  },
  packFeaturesList: {
    gap: 6,
  },
  packFeatureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  packFeatureText: {
    fontSize: 13,
    color: "#d4d4d8",
    flex: 1,
  },
  packSummaryTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#3f3f46",
    paddingTop: 10,
  },
  packSummaryTotalLabel: {
    fontSize: 13,
    color: "#a1a1aa",
  },
  packSummaryTotalPrice: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
  },
  packSummaryOneTime: {
    fontSize: 11,
    color: "#71717a",
  },
  neverExpireRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  neverExpireText: {
    fontSize: 12,
    color: "#a1a1aa",
  },
  backToPaymentButton: {
    borderWidth: 1,
    borderColor: "#3f3f46",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  backToPaymentText: {
    color: "#d4d4d8",
    fontWeight: "600",
    fontSize: 14,
  },
  // ── Mini pack preview ────────────────────────────────────────────────────────
  miniPackPreview: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(39,39,42,0.5)",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#3f3f46",
    marginBottom: 16,
  },
  miniPackLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  miniPackName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
  },
  miniPackPrice: {
    fontSize: 12,
    color: "#a1a1aa",
  },
  miniPackDetails: {
    fontSize: 12,
    color: "#ec4899",
    fontWeight: "600",
  },
  // ── Payment tabs ─────────────────────────────────────────────────────────────
  paymentTabRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  paymentTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "#27272a",
  },
  paymentTabActive: {
    backgroundColor: "#ec4899",
  },
  paymentTabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9ca3af",
  },
  paymentTabTextActive: {
    color: "#fff",
  },
  // ── Pix display ──────────────────────────────────────────────────────────────
  pixDisplay: {
    gap: 16,
  },
  pixDisplayHeader: {
    alignItems: "center",
  },
  pixDisplayTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  pixDisplaySubtitle: {
    fontSize: 13,
    color: "#a1a1aa",
    textAlign: "center",
  },
  qrWrapper: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  qrImage: {
    width: 200,
    height: 200,
  },
  pixCodeRow: {
    flexDirection: "row",
    gap: 8,
  },
  pixCodeInput: {
    flex: 1,
    backgroundColor: "#27272a",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#3f3f46",
    color: "#fff",
    fontSize: 12,
    fontFamily: "monospace",
    padding: 10,
  },
  copyButton: {
    backgroundColor: "#27272a",
    borderWidth: 1,
    borderColor: "#3f3f46",
    borderRadius: 8,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  copyButtonText: {
    color: "#d4d4d8",
    fontSize: 12,
    fontWeight: "600",
  },
  checkingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(234,179,8,0.1)",
    borderWidth: 1,
    borderColor: "rgba(234,179,8,0.3)",
    borderRadius: 10,
    padding: 12,
  },
  checkingText: {
    color: "#fbbf24",
    fontSize: 13,
  },
  pixNoticeBox: {
    backgroundColor: "rgba(59,130,246,0.1)",
    borderWidth: 1,
    borderColor: "rgba(59,130,246,0.3)",
    borderRadius: 10,
    padding: 12,
  },
  pixNoticeText: {
    color: "#93c5fd",
    fontSize: 13,
    textAlign: "center",
  },
  // ── Form shared ──────────────────────────────────────────────────────────────
  form: {
    gap: 16,
  },
  formSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  formSectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  fieldWrapper: {
    gap: 4,
  },
  fieldLabel: {
    fontSize: 13,
    color: "#d4d4d8",
    marginBottom: 2,
  },
  textInput: {
    backgroundColor: "#27272a",
    borderWidth: 1,
    borderColor: "#3f3f46",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#fff",
    fontSize: 15,
  },
  textInputError: {
    borderColor: "#ef4444",
  },
  fieldError: {
    fontSize: 11,
    color: "#f87171",
    marginTop: 2,
  },
  countryPickerText: {
    color: "#fff",
    fontSize: 15,
    paddingVertical: 10,
  },
  cardField: {
    height: 50,
    marginTop: 4,
  },
  errorBox: {
    backgroundColor: "rgba(239,68,68,0.1)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.3)",
    borderRadius: 10,
    padding: 10,
  },
  errorText: {
    color: "#f87171",
    fontSize: 12,
  },
  securityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  securityText: {
    fontSize: 11,
    color: "#71717a",
  },
  submitButton: {
    backgroundColor: "#ec4899",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  // ── Country picker modal ─────────────────────────────────────────────────────
  pickerBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  pickerSheet: {
    backgroundColor: "#18181b",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: "#27272a",
    maxHeight: "60%",
    paddingVertical: 8,
  },
  pickerOption: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  pickerOptionSelected: {
    backgroundColor: "rgba(236,72,153,0.1)",
  },
  pickerOptionText: {
    fontSize: 15,
    color: "#f4f4f5",
  },
});

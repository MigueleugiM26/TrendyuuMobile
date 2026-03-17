import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useTranslations } from "../../hooks/useTranslations";
import { useUser } from "../../context/user-context";
import { getPriceForUserRegion } from "@/src/utils/pricing";

const { width } = Dimensions.get("window");

// Same REGION_CURRENCY_DISPLAY as web
const REGION_CURRENCY_DISPLAY: Record<string, string> = {
  BR: "BRL (R$)",
  US: "USD ($)",
  CA: "CAD (CA$)",
  GB: "GBP (£)",
  UK: "GBP (£)",
  AU: "AUD (A$)",
  ES: "EUR (€)",
  FR: "EUR (€)",
  DE: "EUR (€)",
  IT: "EUR (€)",
  EU: "EUR (€)",
  JP: "JPY (¥)",
  MX: "MXN ($)",
  CL: "CLP ($)",
  AR: "ARS ($)",
  CO: "COP ($)",
  KR: "KRW (₩)",
  SG: "SGD (S$)",
  NZ: "NZD (NZ$)",
  AE: "AED (د.إ)",
  ZA: "ZAR (R)",
};

// Same planos array as web
const PLANOS = [
  {
    nome: "starter",
    plano: "starter",
    popular: false,
    recursos: [
      "aiVoiceGeneration",
      "creditLimitStarter",
      "autoClipStarter",
      "shortGeneratorStarter",
      "caption",
      "watermark",
      "characterLimitStarter",
      "quality",
      "cloudStorage",
    ],
  },
  {
    nome: "creator",
    plano: "creator",
    popular: true,
    recursos: [
      "advancedImageAI",
      "audio",
      "creditLimitCreator",
      "autoClipCreator",
      "shortGeneratorCreator",
      "splitVideo",
      "cloudStorage",
    ],
  },
  {
    nome: "pro",
    plano: "pro",
    popular: false,
    recursos: [
      "nextGenVideoAI",
      "proImageAI",
      "creditLimitPro",
      "autoClipPro",
      "shortGeneratorPro",
      "effects",
      "quality",
      "cloudStorage",
    ],
  },
];

export default function PricingSection() {
  const t = useTranslations("Pricing");
  const router = useRouter();
  const { user, currentPlan } = useUser();

  const [isMensal, setIsMensal] = useState(true);

  const currencyDisplay =
    REGION_CURRENCY_DISPLAY[user?.region ?? "US"] ?? "USD ($)";

  // Same useMemo as web — recalculates when user.region changes
  const regionalPricing = useMemo(() => {
    const region = user?.region || "US";
    return {
      starter: {
        mensal: getPriceForUserRegion("starter", false, region),
        anual: getPriceForUserRegion("starter", true, region),
      },
      creator: {
        mensal: getPriceForUserRegion("creator", false, region),
        anual: getPriceForUserRegion("creator", true, region),
      },
      pro: {
        mensal: getPriceForUserRegion("pro", false, region),
        anual: getPriceForUserRegion("pro", true, region),
      },
    };
  }, [user?.region]);

  // Same handleBuyClick logic as web — redirects to login if no user
  const handleBuyClick = (plano: string, periodicidade: "mensal" | "anual") => {
    if (!user) {
      router.push("/login" as any);
      return;
    }

    const planPricing = regionalPricing[plano as keyof typeof regionalPricing];
    const priceData =
      periodicidade === "mensal" ? planPricing.mensal : planPricing.anual;
    const planoData = PLANOS.find((p) => p.plano === plano)!;

    // Navigate to checkout screen — pass plan data as params
    // Wire up app/checkout.tsx when ready
    router.push({
      pathname: "/checkout" as any,
      params: {
        name: t(`plans.${plano}.nome`),
        price: priceData.displayPrice,
        planType: plano,
        isAnnual: periodicidade === "anual" ? "1" : "0",
        features: JSON.stringify(
          planoData.recursos.map((_, i) => t(`plans.${plano}.recursos.${i}`)),
        ),
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* t("Pricing.sectionTitle") */}
      <Text style={styles.title}>{t("sectionTitle")}</Text>
      {/* t("Pricing.sectionDescription") */}
      <Text style={styles.description}>{t("sectionDescription")}</Text>

      {/* Toggle — t("Pricing.buttons.monthly") / t("Pricing.buttons.annual") */}
      <View style={styles.toggle}>
        <TouchableOpacity
          style={[styles.toggleBtn, isMensal && styles.toggleBtnActive]}
          onPress={() => setIsMensal(true)}
        >
          <Text
            style={[styles.toggleText, isMensal && styles.toggleTextActive]}
          >
            {t("buttons.monthly")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, !isMensal && styles.toggleBtnActive]}
          onPress={() => setIsMensal(false)}
        >
          <Text
            style={[styles.toggleText, !isMensal && styles.toggleTextActive]}
          >
            {t("buttons.annual")}
          </Text>
          {!isMensal && <Text style={styles.discountBadge}>-50%</Text>}
        </TouchableOpacity>
      </View>

      {PLANOS.map((plano) => {
        const planPricing =
          regionalPricing[plano.plano as keyof typeof regionalPricing];
        const currentPrice = isMensal ? planPricing.mensal : planPricing.anual;
        const isCurrentPlan = currentPlan === plano.plano;

        return (
          <View
            key={plano.plano}
            style={[styles.card, plano.popular && styles.cardPopular]}
          >
            {/* t("Pricing.labels.ping") */}
            {plano.popular && (
              <LinearGradient
                colors={["#ec4899", "#be185d"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.popularBanner}
              >
                <Text style={styles.popularText}>⭐ {t("labels.ping")}</Text>
              </LinearGradient>
            )}

            <View style={styles.cardHeader}>
              {/* t("Pricing.plans.{plano}.nome") */}
              <Text
                style={[
                  styles.planName,
                  plano.popular && styles.planNamePopular,
                ]}
              >
                {t(`plans.${plano.nome}.nome`)}
              </Text>
              {/* t("Pricing.plans.{plano}.descricao") */}
              <Text style={styles.planDesc}>
                {t(`plans.${plano.nome}.descricao`)}
              </Text>
            </View>

            {/* Real regional price — same as web currentPrice.displayPrice */}
            <View style={styles.priceRow}>
              <Text style={styles.price}>{currentPrice.displayPrice}</Text>
              <Text style={styles.pricePeriod}>
                /{t(`labels.${isMensal ? "month" : "year"}`)}
              </Text>
              {!isMensal && <Text style={styles.discountInline}>(-50%)</Text>}
            </View>

            {/* Features — t("Pricing.plans.{plano}.recursos.{idx}") */}
            <View style={styles.featuresList}>
              {plano.recursos.map((_, idx) => (
                <View key={idx} style={styles.featureRow}>
                  <Text style={styles.checkmark}>✓</Text>
                  <Text style={styles.featureText}>
                    {t(`plans.${plano.nome}.recursos.${idx}`)}
                  </Text>
                </View>
              ))}
            </View>

            {/* Subscribe / Current plan button */}
            <TouchableOpacity
              style={[
                styles.subscribeBtn,
                plano.popular && styles.subscribeBtnPopular,
                isCurrentPlan && styles.subscribeBtnDisabled,
              ]}
              onPress={() =>
                !isCurrentPlan &&
                handleBuyClick(plano.plano, isMensal ? "mensal" : "anual")
              }
              disabled={isCurrentPlan}
              activeOpacity={0.85}
            >
              {plano.popular && !isCurrentPlan ? (
                <LinearGradient
                  colors={["#ec4899", "#be185d"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.subscribeBtnGradient}
                >
                  <Text style={styles.subscribeBtnTextActive}>
                    {t("buttons.subscribe", {
                      planName: t(`plans.${plano.nome}.nome`),
                    })}
                  </Text>
                </LinearGradient>
              ) : (
                <Text style={styles.subscribeBtnText}>
                  {isCurrentPlan
                    ? t("buttons.currentPlan")
                    : t("buttons.subscribe", {
                        planName: t(`plans.${plano.nome}.nome`),
                      })}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        );
      })}

      {/* t("Pricing.labels.pricesIn") — only shown when region is known, same as web */}
      {user?.region && (
        <Text style={styles.currencyNote}>
          {t("labels.pricesIn")} {currencyDisplay}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width, paddingHorizontal: 24, paddingVertical: 60 },
  title: {
    fontSize: 32,
    fontWeight: "900",
    textAlign: "center",
    color: "#ec4899",
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: "#a1a1aa",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
    maxWidth: 300,
    alignSelf: "center",
  },
  toggle: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 100,
    padding: 4,
    alignSelf: "center",
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  toggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 100,
  },
  toggleBtnActive: { backgroundColor: "#ec4899" },
  toggleText: { color: "#71717a", fontSize: 14, fontWeight: "600" },
  toggleTextActive: { color: "#ffffff" },
  discountBadge: {
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "700",
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#27272a",
    backgroundColor: "rgba(255,255,255,0.03)",
    marginBottom: 16,
    overflow: "hidden",
  },
  cardPopular: {
    borderColor: "#ec4899",
    backgroundColor: "rgba(236,72,153,0.05)",
  },
  popularBanner: { paddingVertical: 8, alignItems: "center" },
  popularText: { color: "#ffffff", fontSize: 12, fontWeight: "700" },
  cardHeader: { padding: 20, paddingBottom: 0 },
  planName: {
    fontSize: 22,
    fontWeight: "900",
    color: "#ffffff",
    marginBottom: 4,
  },
  planNamePopular: { color: "#ec4899" },
  planDesc: { fontSize: 13, color: "#a1a1aa", marginBottom: 12 },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    paddingHorizontal: 20,
    marginBottom: 4,
    gap: 4,
  },
  price: {
    fontSize: 36,
    fontWeight: "900",
    color: "#ffffff",
    letterSpacing: -0.5,
  },
  pricePeriod: { fontSize: 13, color: "#71717a" },
  discountInline: { fontSize: 13, color: "#ec4899", fontWeight: "700" },
  featuresList: { padding: 20, gap: 10 },
  featureRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  checkmark: {
    color: "#ec4899",
    fontSize: 14,
    fontWeight: "700",
    width: 16,
    marginTop: 1,
  },
  featureText: { flex: 1, color: "#d4d4d8", fontSize: 14, lineHeight: 20 },
  subscribeBtn: {
    margin: 20,
    marginTop: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#3f3f46",
    overflow: "hidden",
  },
  subscribeBtnPopular: { borderColor: "#ec4899" },
  subscribeBtnDisabled: { opacity: 0.5 },
  subscribeBtnGradient: { paddingVertical: 14, alignItems: "center" },
  subscribeBtnTextActive: { color: "#ffffff", fontSize: 15, fontWeight: "700" },
  subscribeBtnText: {
    color: "#d4d4d8",
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
    paddingVertical: 14,
  },
  currencyNote: {
    textAlign: "center",
    marginTop: 16,
    fontSize: 13,
    color: "#71717a",
  },
});

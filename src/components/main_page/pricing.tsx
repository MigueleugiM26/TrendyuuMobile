import { useUser } from "@/src/context/user-context";
import { useLanguage, useTranslations } from "@/src/hooks/useTranslations";
import type { Plan } from "@/src/types/checkout";
import { getAffiliateInfo, type AffiliateInfo } from "@/src/utils/affiliates";
import {
  getDescontoPriceForRegion,
  getPriceForUserRegion,
} from "@/src/utils/pricing";
import { useRouter } from "expo-router";
import { Check, Star } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

// ─── Logo helpers (same as web) ───────────────────────────────────────────────

export const getAIVideoModelLogo = (modelId: string): string => {
  const logos: Record<string, string> = {
    veo3: "https://cdn-frontend.trendyuu.com/public/images/texttovideo/icons/googlenewlogo.webp",
    "veo3.1_lite":
      "https://cdn-frontend.trendyuu.com/public/images/texttovideo/icons/googlenewlogo.webp",
    "veo3.1_fast":
      "https://cdn-frontend.trendyuu.com/public/images/texttovideo/icons/googlenewlogo.webp",
    "wan-2.6":
      "https://cdn-frontend.trendyuu.com/public/images/texttovideo/icons/wan.webp",
    "wan-2.2-free":
      "https://cdn-frontend.trendyuu.com/public/images/texttovideo/icons/wan.webp",
    "wan-2.2-essential":
      "https://cdn-frontend.trendyuu.com/public/images/texttovideo/icons/wan.webp",
    "pixverse-v5-fast":
      "https://cdn-frontend.trendyuu.com/public/images/texttovideo/icons/pixverse.webp",
    "pixverse-v5-default":
      "https://cdn-frontend.trendyuu.com/public/images/texttovideo/icons/pixverse.webp",
    "pixverse-v5.5":
      "https://cdn-frontend.trendyuu.com/public/images/texttovideo/icons/pixverse.webp",
    "pika-turbo":
      "https://cdn-frontend.trendyuu.com/public/images/texttovideo/icons/pika.webp",
    "kling-2.5-turbo":
      "https://cdn-frontend.trendyuu.com/public/images/texttovideo/icons/kling.webp",
    "seedance-2.0-mini":
      "https://cdn-frontend.trendyuu.com/public/images/texttovideo/icons/seedance1.webp",
    "seedance-2.0":
      "https://cdn-frontend.trendyuu.com/public/images/texttovideo/icons/seedance1.webp",
    "seedance-2.5":
      "https://cdn-frontend.trendyuu.com/public/images/texttovideo/icons/seedance1.webp",
  };
  return (
    logos[modelId] ??
    "https://cdn-frontend.trendyuu.com/public/images/texttovideo/icons/googlenewlogo.webp"
  );
};

export const getAIImageModelLogo = (modelId: string): string => {
  const logos: Record<string, string> = {
    "flux-klein-free":
      "https://cdn-frontend.trendyuu.com/public/images/texttoimage/icons/flux.webp",
    "flux-klein-essential":
      "https://cdn-frontend.trendyuu.com/public/images/texttoimage/icons/flux.webp",
    "flux-dev":
      "https://cdn-frontend.trendyuu.com/public/images/texttoimage/icons/flux.webp",
    "flux-pro":
      "https://cdn-frontend.trendyuu.com/public/images/texttoimage/icons/flux.webp",
    "sd-3.5-medium":
      "https://cdn-frontend.trendyuu.com/public/images/texttoimage/icons/stability.webp",
    "sd-3.5-large":
      "https://cdn-frontend.trendyuu.com/public/images/texttoimage/icons/stability.webp",
    "gemini-2.5-flash":
      "https://cdn-frontend.trendyuu.com/public/images/texttoimage/icons/googlenewlogo.webp",
    "gemini-3-pro":
      "https://cdn-frontend.trendyuu.com/public/images/texttoimage/icons/googlenewlogo.webp",
    "gemini-3.1-flash":
      "https://cdn-frontend.trendyuu.com/public/images/texttoimage/icons/googlenewlogo.webp",
    imagen:
      "https://cdn-frontend.trendyuu.com/public/images/texttoimage/icons/imagen.webp",
    "gpt-1.0":
      "https://cdn-frontend.trendyuu.com/public/images/texttoimage/icons/openai.webp",
    "gpt-1-mini":
      "https://cdn-frontend.trendyuu.com/public/images/texttoimage/icons/openai.webp",
    "gpt-1.5":
      "https://cdn-frontend.trendyuu.com/public/images/texttoimage/icons/openai.webp",
    "gpt-2.0":
      "https://cdn-frontend.trendyuu.com/public/images/texttoimage/icons/openai.webp",
    "seedream-4.0":
      "https://cdn-frontend.trendyuu.com/public/images/texttovideo/icons/seedance1.webp",
    "seedream-4.5":
      "https://cdn-frontend.trendyuu.com/public/images/texttovideo/icons/seedance1.webp",
    "seedream-5.0-lite":
      "https://cdn-frontend.trendyuu.com/public/images/texttovideo/icons/seedance1.webp",
    "seedream-5.0-pro":
      "https://cdn-frontend.trendyuu.com/public/images/texttovideo/icons/seedance1.webp",
  };
  return (
    logos[modelId] ??
    "https://cdn-frontend.trendyuu.com/public/logos/logotrend2.webp"
  );
};

// ─── Price helpers (same logic as web) ────────────────────────────────────────

function doublePrice(displayPrice: string): string {
  return displayPrice.replace(/[\d.,]+/, (match) => {
    const lastComma = match.lastIndexOf(",");
    const lastDot = match.lastIndexOf(".");
    let num: number;
    let isBrFormat = false;
    if (lastComma > lastDot) {
      isBrFormat = true;
      num = parseFloat(match.replace(/\./g, "").replace(",", "."));
    } else {
      num = parseFloat(match.replace(/,/g, ""));
    }
    const doubled = num * 2;
    if (isBrFormat)
      return doubled.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    return lastDot >= 0 ? doubled.toFixed(2) : String(Math.round(doubled));
  });
}

function applyDiscountToPrice(
  displayPrice: string,
  discountPct: number,
): string {
  return displayPrice.replace(/[\d.,]+/, (match) => {
    const lastComma = match.lastIndexOf(",");
    const lastDot = match.lastIndexOf(".");
    let num: number;
    let isBrFormat = false;
    if (lastComma > lastDot) {
      isBrFormat = true;
      num = parseFloat(match.replace(/\./g, "").replace(",", "."));
    } else {
      num = parseFloat(match.replace(/,/g, ""));
    }
    const discounted = num * (1 - discountPct / 100);
    if (isBrFormat)
      return discounted.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    return lastDot >= 0
      ? discounted.toFixed(2)
      : String(Math.round(discounted));
  });
}

// ─── Plan models ──────────────────────────────────────────────────────────────

interface ModelItem {
  id: string;
  name: string;
  type: "image" | "video";
  badgeText: string;
}

const PLAN_MODELS: Record<string, ModelItem[]> = {
  essential: [
    {
      id: "gpt-1.5",
      name: "GPT Image 1.5",
      type: "image",
      badgeText: "IMAGEM",
    },
    {
      id: "seedream-4.0",
      name: "Seedream 4.0, 4.5, 5.0-lite",
      type: "image",
      badgeText: "IMAGEM",
    },
    {
      id: "seedance-2.0-mini",
      name: "Seedance 2.0 Mini, 2.0",
      type: "video",
      badgeText: "VÍDEO MINI",
    },
    {
      id: "gemini-2.5-flash",
      name: "NanoBanana",
      type: "image",
      badgeText: "IMAGEM",
    },
    {
      id: "veo3.1_lite",
      name: "Veo 3.1 Lite",
      type: "video",
      badgeText: "VÍDEO",
    },
    {
      id: "flux-2-flash",
      name: "Flux 2 Flash, Flux 2 Turbo, Flux Dev",
      type: "image",
      badgeText: "IMAGE",
    },
  ],
  creator: [
    {
      id: "gpt-2.0",
      name: "GPT Image 2.0",
      type: "image",
      badgeText: "IMAGEM",
    },
    {
      id: "flux-klein-free",
      name: "Flux Pro, Flux 2 Pro, Flux Pro Ultra",
      type: "image",
      badgeText: "IMAGE",
    },
    {
      id: "seedream-5.0-pro",
      name: "Seedream 5.0 Pro",
      type: "image",
      badgeText: "IMAGEM PRO",
    },
    {
      id: "seedance-2.5",
      name: "Seedance 2.5",
      type: "video",
      badgeText: "VÍDEO PRO",
    },
    {
      id: "gemini-3-pro",
      name: "NanoBanana Pro",
      type: "image",
      badgeText: "IMAGEM PRO",
    },
    {
      id: "veo3.1_fast",
      name: "Veo 3.1 Fast",
      type: "video",
      badgeText: "VÍDEO FAST",
    },
  ],
  agency: [],
};

const REGION_CURRENCY_DISPLAY: Record<string, string> = {
  BR: "BRL (R$)",
  US: "USD ($)",
  CA: "CAD (CA$)",
  GB: "GBP (£)",
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
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function PricingTable({
  onSelectPlan,
}: {
  onSelectPlan?: (plan: Plan) => void;
}) {
  const t = useTranslations("Pricing");
  const { tRaw } = useLanguage();
  const { user, currentPlan, hasUsedDiscount, hasUsedAffiliateCoupon } =
    useUser();
  const router = useRouter();

  const [isMensal, setIsMensal] = useState(true);
  const [affiliateInfo, setAffiliateInfo] = useState<AffiliateInfo | null>(
    null,
  );

  const isEligibleForDesconto = !hasUsedDiscount;
  const affiliateDiscount =
    !hasUsedAffiliateCoupon && (affiliateInfo?.userDiscount ?? 0) > 0
      ? affiliateInfo!.userDiscount
      : 0;
  const currencyDisplay =
    REGION_CURRENCY_DISPLAY[user?.region ?? "BR"] ?? "BRL (R$)";

  useEffect(() => {
    if (!hasUsedAffiliateCoupon) getAffiliateInfo().then(setAffiliateInfo);
  }, [hasUsedAffiliateCoupon]);

  const descontoPrice = useMemo(
    () => getDescontoPriceForRegion(user?.region),
    [user?.region],
  );
  const regionalPricing = useMemo(() => {
    const r = user?.region || "BR";
    return {
      essential: {
        mensal: getPriceForUserRegion("essential", false, r),
        anual: getPriceForUserRegion("essential", true, r),
      },
      creator: {
        mensal: getPriceForUserRegion("creator", false, r),
        anual: getPriceForUserRegion("creator", true, r),
      },
      agency: {
        mensal: getPriceForUserRegion("agency", false, r),
        anual: getPriceForUserRegion("agency", true, r),
      },
    };
  }, [user?.region]);

  const planos = [
    { nome: "essential", plano: "essential" },
    { nome: "creator", plano: "creator", popular: true },
    { nome: "agency", plano: "agency" },
  ];

  function handleBuyClick(plano: string, periodicidade: "mensal" | "anual") {
    if (!user) {
      router.push("/login");
      return;
    }
    const planPricing = regionalPricing[plano as keyof typeof regionalPricing];
    const priceData =
      periodicidade === "mensal" ? planPricing.mensal : planPricing.anual;
    const planForCheckout: Plan = {
      name: t(`plans.${plano}.nome`),
      price: priceData.displayPrice,
      planType: plano,
      features: tRaw(`Pricing.plans.${plano}.recursos`) as string[],
      isAnnual: periodicidade === "anual",
      isDesconto:
        plano === "essential" &&
        periodicidade === "mensal" &&
        isEligibleForDesconto,
      affiliateDiscount:
        periodicidade === "mensal" &&
        !(plano === "essential" && isEligibleForDesconto)
          ? affiliateDiscount
          : 0,
    };
    onSelectPlan?.(planForCheckout);
  }

  return (
    <View style={styles.root}>
      {/* Header */}
      <Text style={styles.sectionTitle}>{t("sectionTitle")}</Text>
      <Text style={styles.sectionDesc}>{t("sectionDescription")}</Text>

      {/* Toggle */}
      <View style={styles.toggle}>
        <Pressable
          onPress={() => setIsMensal(true)}
          style={[styles.toggleBtn, isMensal && styles.toggleBtnActive]}
        >
          <Text
            style={[styles.toggleText, isMensal && styles.toggleTextActive]}
          >
            {t("buttons.monthly")}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setIsMensal(false)}
          style={[styles.toggleBtn, !isMensal && styles.toggleBtnActive]}
        >
          <Text
            style={[styles.toggleText, !isMensal && styles.toggleTextActive]}
          >
            {t("buttons.annual")}
          </Text>
          {!isMensal && <Text style={styles.toggleDiscount}> -50%</Text>}
        </Pressable>
      </View>

      {/* Plan cards — vertical stack */}
      {planos.map((plano) => {
        const planPricing =
          regionalPricing[plano.plano as keyof typeof regionalPricing];
        const currentPrice = isMensal ? planPricing.mensal : planPricing.anual;
        const modelsList = PLAN_MODELS[plano.plano] || [];
        const destaque = plano.popular;

        const showDesconto =
          plano.plano === "essential" && isMensal && isEligibleForDesconto;
        const showAffiliate =
          isMensal &&
          affiliateDiscount > 0 &&
          !(plano.plano === "essential" && isEligibleForDesconto);

        return (
          <View
            key={plano.plano}
            style={[styles.planCard, destaque && styles.planCardFeatured]}
          >
            {destaque && (
              <View style={styles.popularBadge}>
                <Star size={12} color="#fff" fill="#fff" />
                <Text style={styles.popularBadgeText}>{t("labels.ping")}</Text>
              </View>
            )}

            <Text style={styles.planName}>{t(`plans.${plano.nome}.nome`)}</Text>
            <Text style={styles.planDesc}>
              {t(`plans.${plano.nome}.descricao`)}
            </Text>

            {/* Discount badge */}
            {showDesconto && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountBadgeText}>
                  🎁 {t("desconto.badge")}
                </Text>
              </View>
            )}
            {showAffiliate && (
              <View style={styles.affiliateBadge}>
                <Text style={styles.affiliateBadgeText}>
                  {t("affiliate.badge", { discount: affiliateDiscount })}
                </Text>
              </View>
            )}

            {/* Price */}
            <View style={styles.priceBlock}>
              {showDesconto ? (
                <>
                  <Text style={styles.priceStrike}>
                    {currentPrice.displayPrice}
                  </Text>
                  <Text style={styles.price}>
                    {descontoPrice.displayPrice}
                    <Text style={styles.pricePer}> /{t("labels.month")}</Text>
                  </Text>
                </>
              ) : showAffiliate ? (
                <>
                  <Text style={styles.priceStrike}>
                    {currentPrice.displayPrice}
                  </Text>
                  <Text style={styles.price}>
                    {applyDiscountToPrice(
                      currentPrice.displayPrice,
                      affiliateDiscount,
                    )}
                    <Text style={styles.pricePer}> /{t("labels.month")}</Text>
                  </Text>
                </>
              ) : (
                <>
                  {!isMensal && (
                    <Text style={styles.priceStrike}>
                      {doublePrice(currentPrice.displayPrice)}
                    </Text>
                  )}
                  <Text style={styles.price}>
                    {currentPrice.displayPrice}
                    <Text style={styles.pricePer}>
                      {" "}
                      /{t(`labels.${isMensal ? "month" : "year"}`)}
                    </Text>
                    {!isMensal && (
                      <Text style={styles.annualSaving}> (-50%)</Text>
                    )}
                  </Text>
                </>
              )}
            </View>

            {/* Features list */}
            <View style={styles.featuresList}>
              {(tRaw(`Pricing.plans.${plano.nome}.recursos`) as string[]).map(
                (recurso, idx) => (
                  <View key={idx} style={styles.featureRow}>
                    <Check size={14} color="#ec4899" />
                    <Text style={styles.featureText}>{recurso}</Text>
                  </View>
                ),
              )}
            </View>

            {/* Models */}
            {modelsList.length > 0 && (
              <View style={styles.modelsCard}>
                <Text style={styles.modelsTitle}>{t("models.title")}</Text>
                <Text style={styles.modelsSubtitle}>
                  {t("models.subtitle")}
                </Text>
                {modelsList.map((model, idx) => {
                  const logoUrl =
                    model.type === "video"
                      ? getAIVideoModelLogo(model.id)
                      : getAIImageModelLogo(model.id);
                  return (
                    <View key={idx} style={styles.modelRow}>
                      <View style={styles.modelLogoWrap}>
                        <Image
                          source={{ uri: logoUrl }}
                          style={styles.modelLogo}
                          resizeMode="contain"
                        />
                      </View>
                      <Text style={styles.modelName}>{model.name}</Text>
                    </View>
                  );
                })}
              </View>
            )}

            {/* CTA button */}
            <Pressable
              onPress={() =>
                handleBuyClick(plano.plano, isMensal ? "mensal" : "anual")
              }
              disabled={currentPlan === plano.plano}
              style={({ pressed }) => [
                styles.ctaBtn,
                destaque ? styles.ctaBtnFeatured : styles.ctaBtnDefault,
                (pressed || currentPlan === plano.plano) && { opacity: 0.6 },
              ]}
            >
              <Text style={styles.ctaBtnText}>
                {currentPlan === plano.plano
                  ? t("buttons.currentPlan")
                  : t("buttons.subscribe", {
                      planName: t(`plans.${plano.nome}.nome`),
                    })}
              </Text>
            </Pressable>
          </View>
        );
      })}

      {user?.region && (
        <Text style={styles.currencyNote}>
          {t("labels.pricesIn")} {currencyDisplay}
        </Text>
      )}
    </View>
  );
}

const PINK = "#ec4899";
const ZINC900 = "#18181b";
const ZINC800 = "#27272a";

const styles = StyleSheet.create({
  root: {
    paddingVertical: 40,
    paddingHorizontal: 16,
    gap: 16,
    backgroundColor: "#000",
  },

  sectionTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: PINK,
    textAlign: "center",
  },
  sectionDesc: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
    lineHeight: 22,
  },

  toggle: {
    flexDirection: "row",
    alignSelf: "center",
    backgroundColor: "rgba(24,24,27,0.7)",
    borderWidth: 1,
    borderColor: ZINC800,
    borderRadius: 999,
    padding: 4,
  },
  toggleBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
  },
  toggleBtnActive: { backgroundColor: PINK },
  toggleText: { fontSize: 13, fontWeight: "500", color: "#9ca3af" },
  toggleTextActive: { color: "#fff" },
  toggleDiscount: { fontSize: 11, fontWeight: "700", color: "#f9a8d4" },

  planCard: {
    backgroundColor: "rgba(24,24,27,0.6)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: ZINC800,
    padding: 24,
    gap: 12,
  },
  planCardFeatured: {
    backgroundColor: "rgba(131,24,67,0.25)",
    borderColor: PINK,
    shadowColor: PINK,
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
  },

  popularBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "center",
    backgroundColor: PINK,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  popularBadgeText: { fontSize: 11, fontWeight: "700", color: "#fff" },

  planName: { fontSize: 22, fontWeight: "700", color: "#fff" },
  planDesc: { fontSize: 13, color: "#9ca3af", lineHeight: 20 },

  discountBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(236,72,153,0.15)",
    borderWidth: 1,
    borderColor: "rgba(236,72,153,0.4)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  discountBadgeText: { fontSize: 11, fontWeight: "700", color: "#f9a8d4" },
  affiliateBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(22,163,74,0.15)",
    borderWidth: 1,
    borderColor: "rgba(22,163,74,0.4)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  affiliateBadgeText: { fontSize: 11, fontWeight: "700", color: "#86efac" },

  priceBlock: { gap: 2 },
  priceStrike: {
    fontSize: 14,
    color: "#6b7280",
    textDecorationLine: "line-through",
  },
  price: { fontSize: 32, fontWeight: "700", color: "#fff" },
  pricePer: { fontSize: 16, fontWeight: "400", color: "#9ca3af" },
  annualSaving: { fontSize: 13, fontWeight: "600", color: PINK },

  featuresList: { gap: 10 },
  featureRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  featureText: { flex: 1, fontSize: 13, color: "#d1d5db", lineHeight: 20 },

  modelsCard: {
    backgroundColor: "rgba(24,24,27,0.8)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(82,82,91,0.3)",
    padding: 14,
    gap: 8,
  },
  modelsTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: "#f9a8d4",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  modelsSubtitle: { fontSize: 10, color: "#71717a", marginBottom: 4 },
  modelRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  modelLogoWrap: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: ZINC900,
    borderWidth: 1,
    borderColor: ZINC800,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  modelLogo: { width: 16, height: 16 },
  modelName: { fontSize: 12, fontWeight: "500", color: "#e4e4e7", flex: 1 },

  ctaBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  ctaBtnFeatured: { backgroundColor: PINK },
  ctaBtnDefault: { backgroundColor: "#9d174d" },
  ctaBtnText: { fontSize: 15, fontWeight: "600", color: "#fff" },

  currencyNote: { fontSize: 12, color: "#6b7280", textAlign: "center" },
});

import { useUser } from "@/src/context/user-context";
import { userIds } from "@/src/hooks/posthogAnalytics";
import { useLanguage, useTranslations } from "@/src/hooks/useTranslations";
import type { Plan } from "@/src/types/checkout";
import { getAffiliateInfo, type AffiliateInfo } from "@/src/utils/affiliates";
import {
  getDescontoPriceForRegion,
  getPriceForUserRegion,
} from "@/src/utils/pricing";
import { AnimatePresence, MotiView } from "moti";
import posthog from "posthog-react-native";
import { memo, useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { CustomCheckout } from "./custom_checkout";

import {
  Check,
  ChevronDown,
  Crown,
  Play,
  Star,
  Users,
  X,
  Zap,
} from "lucide-react-native";

const { width } = Dimensions.get("window");

interface UpgradeModalProProps {
  isOpen: boolean;
  onClose: () => void;
}

// Defined outside component so it's never recreated on re-renders
const R2 = "https://cdn-frontend.trendyuu.com/modal_upgrade";
const carouselImages = [
  `${R2}/modal_upgrade_1.webp`,
  `${R2}/modal_upgrade_2.webp`,
  `${R2}/modal_upgrade_3.webp`,
];

interface PlanDef {
  name: string;
  displayName: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  gradientColors: [string, string];
  planType: string;
  popular?: boolean;
}

const plansDef: PlanDef[] = [
  {
    name: "essential",
    displayName: "Essential",
    icon: Play,
    gradientColors: ["#facc15", "#ca8a04"],
    planType: "essential",
  },
  {
    name: "creator",
    displayName: "Creator",
    icon: Users,
    gradientColors: ["#4ade80", "#16a34a"],
    planType: "creator",
    popular: true,
  },
  {
    name: "agency",
    displayName: "Agency",
    icon: Crown,
    gradientColors: ["#f87171", "#dc2626"],
    planType: "agency",
  },
];

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

    if (isBrFormat) {
      return doubled.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
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
    if (isBrFormat) {
      return discounted.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
    return lastDot >= 0
      ? discounted.toFixed(2)
      : String(Math.round(discounted));
  });
}

interface PlanAccordionProps {
  plan: PlanDef;
  isMonthly: boolean;
  isEligibleForDesconto: boolean;
  affiliateDiscount: number;
  currentPlan: string | undefined;
  planPeriod: string | undefined;
  expandedPlan: string | null;
  userRegion: string | undefined;
  onToggle: (name: string) => void;
  onUpgrade: (planType: string, planName: string, price: string) => void;
  t: ReturnType<typeof useTranslations>;
  tRaw: ReturnType<typeof useLanguage>["tRaw"];
}

const PlanAccordion = memo(function PlanAccordion({
  plan,
  isMonthly,
  isEligibleForDesconto,
  affiliateDiscount,
  currentPlan,
  planPeriod,
  expandedPlan,
  userRegion,
  onToggle,
  onUpgrade,
  t,
  tRaw,
}: PlanAccordionProps) {
  const priceForRegion = getPriceForUserRegion(
    plan.planType,
    !isMonthly,
    userRegion,
  );

  const currentPlanKey = `${currentPlan}_${planPeriod}`;
  const planKey = `${plan.planType}_${isMonthly ? "mensal" : "annual"}`;

  const isDescontoApplicable =
    plan.planType === "essential" && isMonthly && isEligibleForDesconto;

  const isAffiliateApplicable =
    isMonthly && affiliateDiscount > 0 && !isDescontoApplicable;

  const effectivePrice = isDescontoApplicable
    ? getDescontoPriceForRegion(userRegion)
    : priceForRegion;

  const isExpanded = expandedPlan === plan.name;
  const isCurrentPlan = currentPlanKey === planKey;
  const [bodyHeight, setBodyHeight] = useState(0);

  return (
    <MotiView
      key={plan.name}
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 300 }}
      style={[
        styles.accordionCard,
        plan.popular && styles.accordionCardPopular,
        isExpanded && styles.accordionCardExpanded,
      ]}
    >
      {/* Header row */}
      <TouchableOpacity
        onPress={() => onToggle(plan.name)}
        style={styles.accordionHeader}
        activeOpacity={0.7}
      >
        <View style={styles.accordionLeft}>
          {/* Icon circle — using backgroundColor for gradient approximation */}
          <View
            style={[
              styles.planIconCircle,
              { backgroundColor: plan.gradientColors[0] },
            ]}
          >
            <plan.icon size={24} color="#fff" />
          </View>

          <View style={styles.planMeta}>
            {/* Plan name + badges */}
            <View style={styles.planNameRow}>
              <Text
                style={[styles.planName, { color: plan.gradientColors[0] }]}
              >
                {t(`plans.${plan.planType}.nome`)}
              </Text>
              {plan.popular && (
                <View style={styles.badgePink}>
                  <Star size={10} color="#fff" />
                  <Text style={styles.badgeText}>{t("labels.ping")}</Text>
                </View>
              )}
              {isDescontoApplicable && (
                <View style={styles.badgeDescount}>
                  <Text style={styles.badgeDescountText}>
                    🎁 {t("desconto.badge")}
                  </Text>
                </View>
              )}
              {isAffiliateApplicable && (
                <View style={styles.badgeAffiliate}>
                  <Text style={styles.badgeAffiliateText}>
                    {t("affiliate.badge", { discount: affiliateDiscount })}
                  </Text>
                </View>
              )}
              {!isMonthly && (
                <View style={styles.badgeGreen}>
                  <Text style={styles.badgeText}>{t("labels.discount")}</Text>
                </View>
              )}
            </View>

            {/* Price */}
            <View style={styles.priceRow}>
              {(isDescontoApplicable || isAffiliateApplicable) && (
                <Text style={styles.priceStrikethrough}>
                  {priceForRegion.displayPrice}
                </Text>
              )}
              {!isMonthly && !isDescontoApplicable && (
                <Text style={styles.priceStrikethrough}>
                  {doublePrice(effectivePrice.displayPrice)}
                </Text>
              )}
              <Text style={styles.priceValue}>
                {isAffiliateApplicable
                  ? applyDiscountToPrice(
                      priceForRegion.displayPrice,
                      affiliateDiscount,
                    )
                  : effectivePrice.displayPrice}
                <Text style={styles.pricePeriod}>
                  /{isMonthly ? t("labels.month") : t("labels.year")}
                </Text>
              </Text>
            </View>
          </View>
        </View>

        {/* Chevron */}
        <MotiView
          animate={{ rotate: isExpanded ? "180deg" : "0deg" }}
          transition={{ type: "timing", duration: 300 }}
        >
          <ChevronDown size={20} color="#9ca3af" />
        </MotiView>
      </TouchableOpacity>

      {/* Expandable body — uses onLayout to measure real height, then animates to it */}
      <MotiView
        animate={{
          height: isExpanded ? bodyHeight : 0,
          opacity: isExpanded ? 1 : 0,
        }}
        transition={{ type: "timing", duration: 300 }}
        style={styles.accordionBody}
      >
        <View
          style={styles.accordionBodyInner}
          onLayout={(e) => setBodyHeight(e.nativeEvent.layout.height)}
        >
          <Text style={styles.planDescription}>
            {t(`plans.${plan.planType}.descricao`)}
          </Text>

          {!isMonthly && (
            <Text style={styles.annualSavings}>
              {t(`plans.${plan.planType}.economiaAnual`)}
            </Text>
          )}

          <View style={styles.featuresList}>
            {(tRaw(`Pricing.plans.${plan.planType}.recursos`) as string[]).map(
              (feature, featureIndex) => (
                <View key={featureIndex} style={styles.featureRow}>
                  <View style={styles.featureCheckCircle}>
                    <Check size={12} color="#22c55e" />
                  </View>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ),
            )}
          </View>

          <TouchableOpacity
            onPress={() =>
              onUpgrade(plan.planType, plan.name, effectivePrice.displayPrice)
            }
            disabled={isCurrentPlan}
            style={[
              styles.subscribeButton,
              isCurrentPlan && styles.subscribeButtonDisabled,
            ]}
            activeOpacity={0.8}
          >
            <plan.icon size={20} color="#fff" />
            <Text style={styles.subscribeButtonText}>
              {isCurrentPlan
                ? t("buttons.currentPlan")
                : `${priceForRegion.symbol} ${t("buttons.subscribe", { planName: plan.name })}`}
            </Text>
          </TouchableOpacity>
        </View>
      </MotiView>
    </MotiView>
  );
});

export function UpgradeModalPro({ isOpen, onClose }: UpgradeModalProProps) {
  const t = useTranslations("Pricing");
  const { tRaw } = useLanguage();
  const {
    user,
    currentPlan,
    planPeriod,
    hasUsedDiscount,
    hasUsedAffiliateCoupon,
  } = useUser();
  const isEligibleForDesconto = !hasUsedDiscount;
  const [isMonthly, setIsMonthly] = useState(true);
  const [showCustomCheckout, setShowCustomCheckout] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [affiliateInfo, setAffiliateInfo] = useState<AffiliateInfo | null>(
    null,
  );
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (user?.id && !userIds.includes(String(user?.id))) {
      posthog.capture("modal_upgrade");
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1,
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [isOpen]);

  const nextImage = useCallback(() => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1,
    );
  }, []);

  const prevImage = useCallback(() => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? carouselImages.length - 1 : prevIndex - 1,
    );
  }, []);

  useEffect(() => {
    if (hasUsedAffiliateCoupon) return;

    let isMounted = true;
    getAffiliateInfo().then((info) => {
      if (isMounted) setAffiliateInfo(info);
    });

    return () => {
      isMounted = false;
    };
  }, [hasUsedAffiliateCoupon]);

  const affiliateDiscount =
    !hasUsedAffiliateCoupon && (affiliateInfo?.userDiscount ?? 0) > 0
      ? affiliateInfo!.userDiscount
      : 0;

  const handleUpgrade = useCallback(
    async (planType: string, _planName: string, price: string) => {
      if (user?.id) {
        const plan: Plan = {
          name: t(`plans.${planType}.nome`),
          price: price,
          planType: planType,
          isAnnual: !isMonthly,
          features: tRaw(`Pricing.plans.${planType}.recursos`) as string[],
          isDesconto:
            planType === "essential" && isMonthly && isEligibleForDesconto,
          affiliateDiscount:
            isMonthly && !(planType === "essential" && isEligibleForDesconto)
              ? affiliateDiscount
              : 0,
        };

        setSelectedPlan(plan);
        setShowCustomCheckout(true);
      }
    },
    [user?.id, isMonthly, isEligibleForDesconto, affiliateDiscount, t],
  );

  const handleCheckoutClose = useCallback(() => {
    setShowCustomCheckout(false);
    setSelectedPlan(null);
  }, []);

  const toggleExpand = useCallback((planName: string) => {
    setExpandedPlan((prev) => (prev === planName ? null : planName));
  }, []);

  return (
    <>
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
              key="modal-backdrop"
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
                  <X size={20} color="#a1a1aa" />
                </TouchableOpacity>

                <ScrollView
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  {/* Header */}
                  <View style={styles.header}>
                    <Text style={styles.headerTitle}>{t("sectionTitle")}</Text>
                    <Text style={styles.headerDescription}>
                      {t("sectionDescription")}
                    </Text>
                  </View>

                  {/* Monthly/Annual Toggle */}
                  <View style={styles.toggleWrapper}>
                    <View style={styles.toggleContainer}>
                      <TouchableOpacity
                        onPress={() => setIsMonthly(true)}
                        style={styles.toggleButton}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.toggleText,
                            isMonthly && styles.toggleTextActive,
                          ]}
                        >
                          {t("buttons.monthly")}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setIsMonthly(false)}
                        style={styles.toggleButton}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.toggleText,
                            !isMonthly && styles.toggleTextActive,
                          ]}
                        >
                          {t("buttons.annual")}
                        </Text>
                      </TouchableOpacity>
                      {/* Sliding pill */}
                      <MotiView
                        animate={{
                          translateX: isMonthly ? 0 : (width * 0.9 - 8) / 2,
                        }}
                        transition={{ type: "timing", duration: 300 }}
                        style={styles.togglePill}
                      />
                    </View>
                  </View>

                  {/* Plans */}
                  <View style={styles.plansList}>
                    {plansDef.map((plan) => (
                      <PlanAccordion
                        key={plan.name}
                        plan={plan}
                        isMonthly={isMonthly}
                        isEligibleForDesconto={isEligibleForDesconto}
                        affiliateDiscount={affiliateDiscount}
                        currentPlan={currentPlan}
                        planPeriod={planPeriod}
                        expandedPlan={expandedPlan}
                        userRegion={user?.region}
                        onToggle={toggleExpand}
                        onUpgrade={handleUpgrade}
                        t={t}
                        tRaw={tRaw}
                      />
                    ))}
                  </View>

                  {/* Maybe Later */}
                  <View style={styles.maybeLaterWrapper}>
                    <TouchableOpacity
                      onPress={onClose}
                      style={styles.maybeLaterButton}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.maybeLaterText}>
                        {t("buttons.maybeLater")}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Trust indicators */}
                  <View style={styles.trustWrapper}>
                    <View style={styles.trustRow}>
                      <View style={styles.trustItem}>
                        <Star size={12} color="#eab308" />
                        <Text style={styles.trustText}>
                          {t("trustIndicators.cancelAnytime")}
                        </Text>
                      </View>
                      <View style={styles.trustItem}>
                        <Check size={12} color="#22c55e" />
                        <Text style={styles.trustText}>
                          {t("trustIndicators.noHiddenFees")}
                        </Text>
                      </View>
                      <View style={styles.trustItem}>
                        <Zap size={12} color="#3b82f6" />
                        <Text style={styles.trustText}>
                          {t("trustIndicators.instantAccess")}
                        </Text>
                      </View>
                    </View>
                  </View>
                </ScrollView>
              </MotiView>
            </MotiView>
          )}
        </AnimatePresence>
      </Modal>

      {/* Custom Checkout Modal */}
      <CustomCheckout
        isOpen={showCustomCheckout}
        onClose={handleCheckoutClose}
        selectedPlan={selectedPlan}
      />
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 16,
  },
  sheet: {
    width: "100%",
    maxHeight: "92%",
    backgroundColor: "#18181b", // zinc-900 approx
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#27272a", // zinc-800
    overflow: "hidden",
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#3f3f46", // zinc-700
    borderWidth: 1,
    borderColor: "#52525b",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 28,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#ec4899", // pink-500 — gradient fallback
    textAlign: "center",
    marginBottom: 8,
  },
  headerDescription: {
    fontSize: 14,
    color: "#d1d5db", // gray-300
    textAlign: "center",
  },
  toggleWrapper: {
    alignItems: "center",
    marginBottom: 40,
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#27272a", // zinc-900
    borderRadius: 9999,
    padding: 4,
    position: "relative",
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    zIndex: 1,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#9ca3af", // gray-400
  },
  toggleTextActive: {
    color: "#fff",
  },
  togglePill: {
    position: "absolute",
    top: 4,
    bottom: 4,
    left: 4,
    width: "50%",
    backgroundColor: "#ec4899", // pink-500
    borderRadius: 9999,
    zIndex: 0,
  },
  plansList: {
    gap: 16,
  },
  accordionCard: {
    borderRadius: 16,
    backgroundColor: "rgba(39,39,42,0.6)", // zinc-900/60
    borderWidth: 1,
    borderColor: "#3f3f46", // zinc-800
  },
  accordionCardPopular: {
    borderColor: "#ec4899", // pink-500
  },
  accordionCardExpanded: {
    borderColor: "#db2777", // pink-600
  },
  accordionHeader: {
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  accordionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    flex: 1,
  },
  planIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  planMeta: {
    flex: 1,
  },
  planNameRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 4,
  },
  planName: {
    fontSize: 18,
    fontWeight: "700",
  },
  badgePink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#9d174d", // pink-700
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  badgeGreen: {
    backgroundColor: "#15803d", // green-700
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  badgeDescount: {
    backgroundColor: "rgba(236,72,153,0.2)",
    borderWidth: 1,
    borderColor: "rgba(236,72,153,0.5)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  badgeDescountText: {
    color: "#f9a8d4", // pink-400
    fontSize: 10,
    fontWeight: "700",
  },
  badgeAffiliate: {
    backgroundColor: "rgba(74,222,128,0.2)",
    borderWidth: 1,
    borderColor: "rgba(74,222,128,0.5)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  badgeAffiliateText: {
    color: "#86efac", // green-300
    fontSize: 10,
    fontWeight: "700",
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  priceStrikethrough: {
    fontSize: 13,
    fontWeight: "400",
    color: "#6b7280", // gray-500
    textDecorationLine: "line-through",
  },
  priceValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  pricePeriod: {
    fontSize: 13,
    fontWeight: "400",
    color: "#d1d5db",
  },
  accordionBody: {
    overflow: "hidden",
  },
  accordionBodyInner: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 8,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(39,39,42,0.5)",
  },
  planDescription: {
    color: "#9ca3af",
    fontSize: 14,
  },
  annualSavings: {
    fontSize: 14,
    fontWeight: "500",
    color: "#22c55e",
  },
  featuresList: {
    gap: 8,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  featureCheckCircle: {
    backgroundColor: "rgba(34,197,94,0.2)",
    borderRadius: 9999,
    padding: 4,
    marginRight: 8,
    flexShrink: 0,
    marginTop: 1,
  },
  featureText: {
    fontSize: 14,
    color: "#e5e7eb",
    flex: 1,
    lineHeight: 20,
  },
  subscribeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#ec4899",
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 4,
  },
  subscribeButtonDisabled: {
    backgroundColor: "#3f3f46",
  },
  subscribeButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  maybeLaterWrapper: {
    alignItems: "center",
    marginTop: 24,
  },
  maybeLaterButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  maybeLaterText: {
    color: "#71717a",
    fontSize: 14,
  },
  trustWrapper: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "#27272a",
  },
  trustRow: {
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
  },
  trustItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  trustText: {
    fontSize: 12,
    color: "#71717a",
  },
});

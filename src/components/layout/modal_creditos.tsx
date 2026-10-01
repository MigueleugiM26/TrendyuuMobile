import { useUser } from "@/src/context/user-context";
import { userIds } from "@/src/hooks/posthogAnalytics";
import { useLanguage, useTranslations } from "@/src/hooks/useTranslations";
import { usePostHog } from "@/src/shims/posthog-react-native";
import { getAvulsoPriceForUserRegion } from "@/src/utils/pricing";
import { Check, Flame, ShoppingCart, X } from "lucide-react-native";
import { AnimatePresence, MotiView } from "moti";
import { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { CreditCheckout, type CreditPack } from "./credits_checkout";

interface ModalCreditosProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ModalCreditos({ isOpen, onClose }: ModalCreditosProps) {
  const t = useTranslations("PricingAvulso");
  const { tRaw } = useLanguage();
  const { user } = useUser();
  const [selectedPack, setSelectedPack] = useState<CreditPack | null>(null);
  // Tap-to-toggle replaces hover on mobile
  const [flippedPack, setFlippedPack] = useState<string | null>(null);
  const posthog = usePostHog();

  useEffect(() => {
    if (user?.id && !userIds.includes(String(user?.id))) {
      posthog.capture("modal_creditos");
    }
  }, []);

  const packs = [
    {
      key: "mini",
      packType: "avulso_mini",
      credits: 6000,
      autoclip: 60,
      shortGenerator: 2,
      iconColor: "#fbbf24", // amber-400
      icon: Flame,
    },
    {
      key: "basico",
      packType: "avulso_basico",
      credits: 15000,
      autoclip: 150,
      shortGenerator: 6,
      iconColor: "#34d399", // emerald-400
      icon: Flame,
      popular: true,
    },
    {
      key: "extra",
      packType: "avulso_extra",
      credits: 35000,
      autoclip: 350,
      shortGenerator: 14,
      iconColor: "#fb7185", // rose-400
      icon: Flame,
    },
  ];

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
                from={{ opacity: 0, scale: 0.95, translateY: 20 }}
                animate={{ opacity: 1, scale: 1, translateY: 0 }}
                exit={{ opacity: 0, scale: 0.95, translateY: 20 }}
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

                <ScrollView
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  {/* Header */}
                  <View style={styles.header}>
                    <View style={styles.headerIconWrapper}>
                      <ShoppingCart size={24} color="#d4d4d8" />
                    </View>
                    <Text style={styles.headerTitle}>{t("title")}</Text>
                    <Text style={styles.headerDescription}>
                      {t("description")}
                    </Text>
                  </View>

                  {/* Pack cards */}
                  <View style={styles.packsList}>
                    {packs.map((pack, index) => {
                      const priceForRegion = getAvulsoPriceForUserRegion(
                        pack.packType,
                        user?.region,
                      );
                      const isFlipped = flippedPack === pack.key;

                      return (
                        <MotiView
                          key={pack.key}
                          from={{ opacity: 0, translateY: 15 }}
                          animate={{ opacity: 1, translateY: 0 }}
                          transition={{
                            type: "timing",
                            duration: 300,
                            delay: index * 60,
                          }}
                          style={[
                            styles.packCard,
                            pack.popular && styles.packCardPopular,
                          ]}
                        >
                          {/* Default face */}
                          <View style={styles.packCardBody}>
                            <pack.icon
                              size={32}
                              color={pack.iconColor}
                              strokeWidth={1.5}
                            />
                            <Text style={styles.packCredits}>
                              {pack.credits.toLocaleString()}
                            </Text>
                            <Text style={styles.packCreditsLabel}>
                              {t("labels.credits")}
                            </Text>
                          </View>

                          {/* Tap-to-reveal overlay (replaces hover) */}
                          <AnimatePresence>
                            {isFlipped && (
                              <MotiView
                                key="flip-overlay"
                                from={{ opacity: 0, translateY: 10 }}
                                animate={{ opacity: 1, translateY: 0 }}
                                exit={{ opacity: 0, translateY: 10 }}
                                transition={{ type: "timing", duration: 200 }}
                                style={styles.packOverlay}
                              >
                                <Text
                                  style={[
                                    styles.packOverlayTitle,
                                    { color: pack.iconColor },
                                  ]}
                                >
                                  {t(`packs.${pack.key}.name`)}
                                </Text>

                                <View style={styles.featuresList}>
                                  {(
                                    tRaw(
                                      `PricingAvulso.packs.${pack.key}.features`,
                                    ) as string[]
                                  ).map((feature: string, fi: number) => (
                                    <View key={fi} style={styles.featureRow}>
                                      <Check
                                        size={12}
                                        color="#34d399"
                                        style={styles.featureIcon}
                                      />
                                      <Text style={styles.featureText}>
                                        {feature}
                                      </Text>
                                    </View>
                                  ))}
                                </View>

                                <Text style={styles.oneTimeOverlay}>
                                  {t("labels.oneTime")}
                                </Text>
                              </MotiView>
                            )}
                          </AnimatePresence>

                          {/* Card footer — always visible */}
                          <View style={styles.packFooter}>
                            <View>
                              <Text style={styles.packPrice}>
                                {priceForRegion.displayPrice}
                              </Text>
                              <Text style={styles.packOneTime}>
                                {t("labels.oneTime")}
                              </Text>
                            </View>

                            <View style={styles.footerActions}>
                              {/* Info toggle button */}
                              <TouchableOpacity
                                onPress={() =>
                                  setFlippedPack((prev) =>
                                    prev === pack.key ? null : pack.key,
                                  )
                                }
                                style={styles.infoButton}
                                activeOpacity={0.7}
                              >
                                <Text style={styles.infoButtonText}>
                                  {isFlipped ? "✕" : "i"}
                                </Text>
                              </TouchableOpacity>

                              {/* Buy button */}
                              <TouchableOpacity
                                onPress={() =>
                                  setSelectedPack({
                                    packType: pack.packType,
                                    name: t(`packs.${pack.key}.name`),
                                    credits: pack.credits,
                                    autoclip: pack.autoclip,
                                    shortGenerator: pack.shortGenerator,
                                  })
                                }
                                style={styles.buyButton}
                                activeOpacity={0.8}
                              >
                                <Text style={styles.buyButtonText}>
                                  {t("buttons.buy")}
                                </Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        </MotiView>
                      );
                    })}
                  </View>

                  {/* No subscription note */}
                  <Text style={styles.noSubscription}>
                    {t("labels.noSubscription")}
                  </Text>

                  {/* Maybe later */}
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
                        <Check size={12} color="#34d399" />
                        <Text style={styles.trustText}>
                          {t("trustIndicators.noExpiry")}
                        </Text>
                      </View>
                      <View style={styles.trustItem}>
                        <Flame size={12} color="#fbbf24" />
                        <Text style={styles.trustText}>
                          {t("trustIndicators.instantCredit")}
                        </Text>
                      </View>
                      <View style={styles.trustItem}>
                        <Check size={12} color="#34d399" />
                        <Text style={styles.trustText}>
                          {t("trustIndicators.noHiddenFees")}
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

      <CreditCheckout
        isOpen={!!selectedPack}
        onClose={() => setSelectedPack(null)}
        pack={selectedPack}
      />
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  sheet: {
    width: "100%",
    maxHeight: "90%",
    backgroundColor: "#18181b", // zinc-900
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(39,39,42,0.8)", // zinc-800/80
    overflow: "hidden",
  },
  closeButton: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(39,39,42,0.8)",
    borderWidth: 1,
    borderColor: "rgba(82,82,91,0.5)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  headerIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(39,39,42,0.6)",
    borderWidth: 1,
    borderColor: "rgba(82,82,91,0.4)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#f4f4f5", // zinc-100
    textAlign: "center",
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  headerDescription: {
    fontSize: 13,
    color: "#a1a1aa", // zinc-400
    textAlign: "center",
    paddingHorizontal: 8,
  },
  packsList: {
    gap: 12,
    marginBottom: 16,
  },
  packCard: {
    borderRadius: 14,
    backgroundColor: "rgba(9,9,11,0.8)", // zinc-950/80
    borderWidth: 1,
    borderColor: "rgba(39,39,42,0.8)",
    overflow: "hidden",
  },
  packCardPopular: {
    borderColor: "rgba(52,211,153,0.8)", // emerald-500/80
  },
  packCardBody: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
    gap: 4,
  },
  packCredits: {
    fontSize: 30,
    fontWeight: "800",
    color: "#f4f4f5",
    letterSpacing: -0.5,
    marginTop: 8,
  },
  packCreditsLabel: {
    fontSize: 11,
    color: "#a1a1aa",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  packOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    // stops above the footer (footer is ~70px)
    bottom: 70,
    backgroundColor: "rgba(9,9,11,0.97)",
    padding: 16,
    justifyContent: "space-between",
    zIndex: 10,
  },
  packOverlayTitle: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  featuresList: {
    gap: 6,
    flex: 1,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
  },
  featureIcon: {
    marginTop: 1,
    flexShrink: 0,
  },
  featureText: {
    fontSize: 11,
    color: "#d4d4d8",
    lineHeight: 16,
    flex: 1,
  },
  oneTimeOverlay: {
    fontSize: 10,
    color: "#71717a",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 8,
  },
  packFooter: {
    borderTopWidth: 1,
    borderTopColor: "rgba(39,39,42,0.6)",
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 20,
  },
  packPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: "#f4f4f5",
    letterSpacing: -0.3,
  },
  packOneTime: {
    fontSize: 10,
    color: "#71717a",
  },
  footerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(39,39,42,0.8)",
    borderWidth: 1,
    borderColor: "#52525b",
    alignItems: "center",
    justifyContent: "center",
  },
  infoButtonText: {
    color: "#a1a1aa",
    fontSize: 12,
    fontWeight: "700",
  },
  buyButton: {
    backgroundColor: "#db2777", // pink-600
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buyButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  noSubscription: {
    textAlign: "center",
    fontSize: 11,
    color: "#71717a",
    marginBottom: 12,
  },
  maybeLaterWrapper: {
    alignItems: "center",
    marginBottom: 16,
  },
  maybeLaterButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 9999,
  },
  maybeLaterText: {
    color: "#a1a1aa",
    fontSize: 12,
  },
  trustWrapper: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(39,39,42,0.6)",
  },
  trustRow: {
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
  },
  trustItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  trustText: {
    fontSize: 11,
    color: "#a1a1aa",
  },
});

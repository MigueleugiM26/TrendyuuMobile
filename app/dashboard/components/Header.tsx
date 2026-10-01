import LoginModal from "@/src/components/layout/loginmodal";
import { useUser } from "@/src/context/user-context";
import { useTranslations } from "@/src/hooks/useTranslations";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import {
  Building2,
  Crown,
  Info,
  LogOut,
  ShoppingBag,
  User,
} from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { NotificationMenu } from "./NotificationMenu";

// ─── Constants ────────────────────────────────────────────────────────────────

const PLAN_MAX_CREDITS: Record<string, number> = {
  free: 1800,
  essential: 28000,
  creator: 87500,
  agency: 280000,
};

const BASE_URL = process.env.EXPO_PUBLIC_TRENDYUU_URL_BACK;

async function authHeaders(): Promise<Record<string, string>> {
  const token = await AsyncStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface HeaderProps {
  onUpgrade?: () => void;
  setShowUpgradeModal?: (val: boolean) => void;
  setShowCreditsModal?: (val: boolean) => void;
  currentPlan?: string;
  userRegion?: string;
}

// ─── Header ───────────────────────────────────────────────────────────────────

export function Header({
  onUpgrade,
  setShowUpgradeModal,
  setShowCreditsModal,
}: HeaderProps) {
  const { user, currentPlan, loading, logout, userCredits } = useUser();
  const router = useRouter();
  const t = useTranslations("dashboard.header");

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [showBrandingNudge, setShowBrandingNudge] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const brandingCheckRan = useRef(false);
  const slideAnim = useRef(new Animated.Value(400)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const openMenu = () => {
    slideAnim.setValue(400);
    fadeAnim.setValue(0);
    setIsMenuVisible(true);
    setIsMenuOpen(true);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 400,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => setIsMenuVisible(false));
  };

  // ── Branding nudge check ─────────────────────────────────────────────────
  useEffect(() => {
    if (!user || loading) return;
    if (brandingCheckRan.current) return;
    brandingCheckRan.current = true;

    const checkBranding = async () => {
      try {
        const headers = await authHeaders();
        const res = await fetch(`${BASE_URL}/api/user-branding/get-branding`, {
          headers,
        });

        if (res.status === 404) {
          if (Math.random() < 0.1) setShowBrandingNudge(true);
          return;
        }
        if (!res.ok) return;

        const data = await res.json();
        const brandings: {
          is_available?: boolean;
          business_name?: string;
        }[] = data?.brandings ?? [];

        const hasAnyBrand = brandings.some(
          (b) => b.is_available !== false && b.business_name?.trim(),
        );

        if (!hasAnyBrand && Math.random() < 0.2) setShowBrandingNudge(true);
      } catch {
        // Silently ignore — nudge is non-critical
      }
    };

    checkBranding();
  }, [user, loading]);

  const handleSettings = () => {
    closeMenu();
    router.push("/profile");
  };

  const handleLogout = () => {
    closeMenu();
    logout();
    router.replace("/");
  };

  // ── Greeting (hidden on mobile web, kept for parity / future use) ────────
  const greeting = useMemo(() => {
    if (!user?.name) return "";
    const firstName = user.name.split(" ")[0];
    const hour = new Date().getHours();
    const period = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "night";
    const messages = {
      morning: [
        t("greetings.morning.1", { name: firstName }),
        t("greetings.morning.2", { name: firstName }),
        t("greetings.morning.3", { name: firstName }),
      ],
      afternoon: [
        t("greetings.afternoon.1", { name: firstName }),
        t("greetings.afternoon.2", { name: firstName }),
        t("greetings.afternoon.3", { name: firstName }),
      ],
      night: [
        t("greetings.night.1", { name: firstName }),
        t("greetings.night.2", { name: firstName }),
        t("greetings.night.3", { name: firstName }),
      ],
    };
    const idx = Math.floor(Math.random() * 3);
    return messages[period][idx];
  }, [user?.name, t]);

  // ── Credits ring values ───────────────────────────────────────────────────
  const planKey = currentPlan?.toLowerCase() ?? "free";
  const maxCredits = PLAN_MAX_CREDITS[planKey] ?? 0;
  const credits = userCredits ?? 0;
  const isFreeplan = maxCredits === 0;

  const usedPercent = isFreeplan
    ? 0
    : Math.min(100, Math.round(((maxCredits - credits) / maxCredits) * 100));
  const remainingPercent = 100 - usedPercent;

  const ringColor =
    remainingPercent > 50
      ? "#22c55e"
      : remainingPercent > 20
        ? "#eab308"
        : "#ef4444";

  const canBuyCredits =
    currentPlan === "essential" ||
    currentPlan === "creator" ||
    currentPlan === "agency";

  const planDisplayName = currentPlan
    ? currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)
    : "Free";

  const fmt = (n: number) => n.toLocaleString("pt-BR");

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.header}>
        {/* Left placeholder */}
        <View style={styles.skeletonText} />
        {/* Right placeholder */}
        <View style={styles.skeletonAvatar} />
      </View>
    );
  }

  // ── Avatar initials ───────────────────────────────────────────────────────
  const avatarInitial = user?.name?.charAt(0).toUpperCase() ?? "?";

  return (
    <>
      <View style={styles.header}>
        {/* Left — greeting hidden on mobile (same as web `hidden sm:block`) */}
        <View style={styles.headerLeft} />

        {/* Right side */}
        <View style={styles.headerRight}>
          {user ? (
            <>
              {/* Upgrade / Crown button (mobile: icon only, same as web `lg:hidden`) */}
              {currentPlan !== "agency" && (
                <Pressable
                  onPress={() => setShowUpgradeModal?.(true)}
                  style={styles.upgradeButton}
                >
                  <Crown size={16} color="#fff" />
                </Pressable>
              )}

              {/* Buy credits */}
              {canBuyCredits && (
                <Pressable
                  onPress={() => setShowCreditsModal?.(true)}
                  style={styles.iconButton}
                  accessibilityLabel={t("buyCredits")}
                >
                  <ShoppingBag size={20} color="#f4f4f5" />
                </Pressable>
              )}

              <NotificationMenu />

              {/* Avatar trigger — opens bottom-sheet menu */}
              <Pressable
                onPress={openMenu}
                style={styles.avatarWrapper}
                accessibilityLabel="Abrir menu do usuário"
              >
                {/* Credits ring (SVG circle approximated with border) */}
                <View
                  style={[
                    styles.avatarRing,
                    { borderColor: isFreeplan ? "#3f3f46" : ringColor },
                  ]}
                >
                  {user.image ? (
                    <Image
                      source={{ uri: user.image }}
                      style={styles.avatarImage}
                    />
                  ) : (
                    <View style={styles.avatarFallback}>
                      <Text style={styles.avatarInitial}>{avatarInitial}</Text>
                    </View>
                  )}
                </View>
              </Pressable>
            </>
          ) : (
            /* Sign-in button */
            <Pressable
              onPress={() => setIsLoginModalOpen(true)}
              style={styles.signInButton}
            >
              <Text style={styles.signInText}>{t("signIn")}</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* ── User menu modal (replaces DropdownMenu) ── */}
      <Modal
        visible={isMenuVisible}
        transparent
        animationType="none"
        onRequestClose={closeMenu}
      >
        <Pressable style={styles.modalBackdrop} onPress={closeMenu}>
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              styles.backdropFade,
              { opacity: fadeAnim },
            ]}
            pointerEvents="none"
          />
          {/* Bottom sheet */}
          <Animated.View
            style={[
              styles.menuSheet,
              { transform: [{ translateY: slideAnim }] },
            ]}
          >
            <Pressable style={{ flex: 1 }} onPress={() => {}}>
              {/* Handle */}
              <View style={styles.menuHandle} />

              {/* My account label */}
              <Text style={styles.menuAccountLabel}>{t("myAccount")}</Text>

              {/* Credits panel */}
              <View style={styles.creditsPanel}>
                <View style={styles.creditsPanelRow}>
                  <Text style={styles.creditsLabel}>
                    {t("availableCredits")}
                  </Text>
                  {!isFreeplan && (
                    <Text style={[styles.creditsPercent, { color: ringColor }]}>
                      {remainingPercent}% {t("remaining")}
                    </Text>
                  )}
                </View>

                {!isFreeplan && (
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${remainingPercent}%` as any,
                          backgroundColor: ringColor,
                        },
                      ]}
                    />
                  </View>
                )}

                <View style={styles.creditsAmountRow}>
                  <Text style={styles.creditsAmount}>{fmt(credits)}</Text>
                  <Text style={styles.creditsMax}>/ {fmt(maxCredits)} cr</Text>
                </View>
              </View>

              <View style={styles.menuDivider} />

              {/* Profile */}
              <Pressable onPress={handleSettings} style={styles.menuItem}>
                <User size={16} color="#d4d4d8" />
                <Text style={styles.menuItemText}>{t("profile")}</Text>
              </Pressable>

              {/* Buy credits */}
              {canBuyCredits && (
                <Pressable
                  onPress={() => {
                    closeMenu();
                    setShowCreditsModal?.(true);
                  }}
                  style={styles.menuItem}
                >
                  <ShoppingBag size={16} color="#d4d4d8" />
                  <Text style={styles.menuItemText}>{t("buyCredits")}</Text>
                </Pressable>
              )}

              {/* Upgrade (free plan only) */}
              {user?.plan === "free" && (
                <Pressable
                  onPress={() => {
                    closeMenu();
                    onUpgrade?.();
                  }}
                  style={styles.menuItem}
                >
                  <Crown size={16} color="#f472b6" />
                  <Text style={[styles.menuItemText, styles.menuItemPink]}>
                    {t("upgradeToAgency")}
                  </Text>
                </Pressable>
              )}

              <View style={styles.menuDivider} />

              {/* Sign out */}
              <Pressable onPress={handleLogout} style={styles.menuItem}>
                <LogOut size={16} color="#f87171" />
                <Text style={[styles.menuItemText, styles.menuItemRed]}>
                  {t("signOut")}
                </Text>
              </Pressable>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>

      {/* ── Branding nudge modal ── */}
      <Modal
        visible={showBrandingNudge}
        transparent
        animationType="fade"
        onRequestClose={() => setShowBrandingNudge(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setShowBrandingNudge(false)}
        >
          <Pressable style={styles.nudgeCard} onPress={() => {}}>
            {/* Banner image */}
            <Image
              source={{
                uri: "https://cdn-frontend.trendyuu.com/public/brand_trend.webp",
              }}
              style={styles.nudgeBanner}
              resizeMode="cover"
            />

            {/* Header */}
            <View style={styles.nudgeContent}>
              <Text style={styles.nudgeTitle}>Preencha sua marca!</Text>

              {/* Info rows */}
              <View style={styles.nudgeRow}>
                <Info size={20} color="#a1a1aa" />
                <View style={styles.nudgeRowText}>
                  <Text style={styles.nudgeRowTitle}>Por que preencher?</Text>
                  <Text style={styles.nudgeRowBody}>
                    Para personalizar sua identidade visual em todo o app
                  </Text>
                </View>
              </View>

              <View style={styles.nudgeRow}>
                <Building2 size={20} color="#a1a1aa" />
                <View style={styles.nudgeRowText}>
                  <Text style={styles.nudgeRowTitle}>
                    Você está no controle
                  </Text>
                  <Text style={styles.nudgeRowBody}>
                    Altere sua marca quando quiser no seu perfil
                  </Text>
                </View>
              </View>

              {/* CTA */}
              <Pressable
                onPress={() => {
                  setShowBrandingNudge(false);
                  router.push("/profile?tab=branding" as any);
                }}
                style={styles.nudgeCta}
              >
                <Text style={styles.nudgeCtaText}>Continuar</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Login modal ── */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Header bar — mirrors `h-14 bg-black flex items-center justify-between px-4`
  header: {
    height: 56,
    backgroundColor: "#000",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    zIndex: 10,
    flexShrink: 0,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  // Loading skeleton
  skeletonText: {
    height: 16,
    width: 96,
    backgroundColor: "#27272a",
    borderRadius: 4,
  },
  skeletonAvatar: {
    width: 32,
    height: 32,
    backgroundColor: "#27272a",
    borderRadius: 99,
  },

  // Upgrade icon button — mirrors `lg:hidden bg-gradient ... p-2 rounded-lg`
  upgradeButton: {
    backgroundColor: "#ec4899", // pink-500
    padding: 8,
    borderRadius: 8,
  },

  // Generic icon button — mirrors ghost button with `p-2`
  iconButton: {
    padding: 8,
  },

  // Avatar
  avatarWrapper: {
    padding: 2,
  },
  avatarRing: {
    width: 36,
    height: 36,
    borderRadius: 99,
    borderWidth: 2,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 99,
  },
  avatarFallback: {
    width: "100%",
    height: "100%",
    backgroundColor: "#ec4899", // pink-500
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },

  // Sign in button
  signInButton: {
    backgroundColor: "#ec4899",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  signInText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },

  // Modal backdrop
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdropFade: {
    backgroundColor: "rgba(0,0,0,0.6)",
  },

  // Bottom-sheet menu — replaces DropdownMenuContent `w-64 bg-zinc-900 border-zinc-800`
  menuSheet: {
    backgroundColor: "#18181b", // zinc-900
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 12,
  },
  menuHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#52525b",
    borderRadius: 99,
    alignSelf: "center",
    marginBottom: 16,
  },
  menuAccountLabel: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
    marginBottom: 12,
    paddingHorizontal: 4,
  },

  // Credits panel — mirrors the `mx-2 rounded-lg bg-zinc-800/60 px-3 py-2.5` block
  creditsPanel: {
    backgroundColor: "rgba(39,39,42,0.6)", // zinc-800/60
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginBottom: 4,
  },
  creditsPanelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  creditsLabel: {
    fontSize: 11,
    color: "#a1a1aa", // zinc-400
  },
  creditsPercent: {
    fontSize: 11,
    fontWeight: "600",
  },
  progressTrack: {
    height: 6,
    backgroundColor: "#3f3f46", // zinc-700
    borderRadius: 99,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 99,
  },
  creditsAmountRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  creditsAmount: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
  creditsMax: {
    fontSize: 11,
    color: "#71717a", // zinc-500
  },

  // Menu items
  menuDivider: {
    height: 1,
    backgroundColor: "#27272a", // zinc-800
    marginVertical: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  menuItemText: {
    fontSize: 14,
    color: "#d4d4d8", // zinc-300
  },
  menuItemPink: {
    color: "#f472b6", // pink-400
  },
  menuItemRed: {
    color: "#f87171", // red-400
  },

  // Branding nudge card
  nudgeCard: {
    backgroundColor: "#18181b",
    borderRadius: 20,
    overflow: "hidden",
    marginHorizontal: 16,
    marginBottom: 40,
  },
  nudgeBanner: {
    width: "100%",
    height: 128,
  },
  nudgeContent: {
    padding: 20,
    gap: 16,
  },
  nudgeTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  nudgeRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  nudgeRowText: {
    flex: 1,
    gap: 4,
  },
  nudgeRowTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  nudgeRowBody: {
    fontSize: 14,
    color: "#71717a", // zinc-500
    lineHeight: 20,
  },
  nudgeCta: {
    backgroundColor: "#ec4899", // pink-500
    borderRadius: 99,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 4,
  },
  nudgeCtaText: {
    color: "#000",
    fontWeight: "600",
    fontSize: 14,
  },
});

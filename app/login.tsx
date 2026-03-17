import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  ScrollView,
  Linking,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "expo-router";
import Svg, { Path, Rect } from "react-native-svg";
import { useTranslations } from "@/src/hooks/useTranslations";

const { width, height } = Dimensions.get("window");

// ─── Provider SVG icons — same as web ─────────────────────────────────────────

const GoogleIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <Path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <Path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <Path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </Svg>
);

const MicrosoftIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 23 23">
    <Rect x={0} y={0} width={10.5} height={10.5} fill="#f35325" />
    <Rect x={11.5} y={0} width={11.5} height={10.5} fill="#81bc06" />
    <Rect x={0} y={11.5} width={10.5} height={11.5} fill="#05a6f0" />
    <Rect x={11.5} y={11.5} width={11.5} height={11.5} fill="#ffba08" />
  </Svg>
);

const TwitterIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 300 300" fill="white">
    <Path d="M178.57 127.15 290.27 0h-26.46l-97.03 110.38L89.34 0H0l117.13 166.93L0 300.25h26.46l102.4-116.59 81.8 116.59h89.34M36.01 19.54H76.66l187.13 262.13h-40.66" />
  </Svg>
);

const XBadgeIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="white">
    <Path d="M22.46 6c-.77.35-1.6.58-2.46.69a4.29 4.29 0 001.88-2.37 8.56 8.56 0 01-2.72 1.04 4.27 4.27 0 00-7.27 3.9A12.13 12.13 0 013 4.79a4.27 4.27 0 001.32 5.7 4.24 4.24 0 01-1.94-.54v.05a4.27 4.27 0 003.43 4.18 4.28 4.28 0 01-1.93.07 4.27 4.27 0 003.99 2.97A8.57 8.57 0 012 19.54a12.07 12.07 0 006.56 1.92c7.88 0 12.19-6.53 12.19-12.19 0-.19 0-.39-.01-.58A8.7 8.7 0 0024 5.17a8.44 8.44 0 01-2.54.7z" />
  </Svg>
);

const TikTokIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="white">
    <Path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </Svg>
);

const InstagramIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="white">
    <Path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </Svg>
);

// ─── Providers — same list and order as web ────────────────────────────────────
const PROVIDERS = [
  {
    id: "google",
    name: "Google",
    icon: GoogleIcon,
    comingSoon: false,
    fullWidth: true,
  },
  {
    id: "microsoft",
    name: "Microsoft",
    icon: MicrosoftIcon,
    comingSoon: false,
    fullWidth: false,
  },
  {
    id: "twitter",
    name: "Twitter",
    icon: TwitterIcon,
    comingSoon: false,
    fullWidth: false,
    isTwitter: true,
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: TikTokIcon,
    comingSoon: false,
    fullWidth: false,
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: InstagramIcon,
    comingSoon: true,
    fullWidth: false,
  },
];

// ─── Main component ────────────────────────────────────────────────────────────
export default function LoginPage() {
  // Exact same namespaces as web
  const t = useTranslations("LoginPage");
  const tNav = useTranslations("Nav");

  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  // Entrance animations — mirrors framer-motion sequence from web
  const cardAnim = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(20)).current;
  const logoScale = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const subtitleAnim = useRef(new Animated.Value(0)).current;
  const dividerAnim = useRef(new Animated.Value(0)).current;
  const btnAnims = useRef(PROVIDERS.map(() => new Animated.Value(0))).current;
  const termsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Check existing token — same logic as web useEffect
    (async () => {
      const token = await AsyncStorage.getItem("accessToken");
      if (token) {
        try {
          const decoded: { exp: number } = jwtDecode(token);
          if (decoded.exp * 1000 > Date.now()) {
            router.replace("/");
            return;
          } else {
            await AsyncStorage.removeItem("accessToken");
            await AsyncStorage.removeItem("refreshToken");
          }
        } catch {
          await AsyncStorage.removeItem("accessToken");
          await AsyncStorage.removeItem("refreshToken");
        }
      }
    })();

    // Staggered entrance — mirrors framer-motion delays from web
    Animated.sequence([
      // Card fade in (delay 0)
      Animated.parallel([
        Animated.timing(cardAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(cardSlide, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      // Logo spring (delay 0.2)
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Title (delay 0.4), subtitle (0.6), divider (0.8)
    const delays = [
      Animated.timing(titleAnim, {
        toValue: 1,
        duration: 600,
        delay: 400,
        useNativeDriver: true,
      }),
      Animated.timing(subtitleAnim, {
        toValue: 1,
        duration: 600,
        delay: 600,
        useNativeDriver: true,
      }),
      Animated.timing(dividerAnim, {
        toValue: 1,
        duration: 600,
        delay: 800,
        useNativeDriver: true,
      }),
      // Buttons stagger (delay 1.0 + index * 0.1) — same as web
      ...btnAnims.map((anim, i) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 400,
          delay: 1000 + i * 100,
          useNativeDriver: true,
        }),
      ),
      Animated.timing(termsAnim, {
        toValue: 1,
        duration: 400,
        delay: 1400,
        useNativeDriver: true,
      }),
    ];
    Animated.parallel(delays).start();
  }, []);

  const handleOAuthLogin = async (providerId: string) => {
    setIsLoading(providerId);

    let affiliateParam = "";
    try {
      const affiliateData = await AsyncStorage.getItem("trendyuu_affiliate");
      if (affiliateData) {
        const parsed = JSON.parse(affiliateData);
        if (parsed?.code) {
          affiliateParam = `&affiliate=${encodeURIComponent(parsed.code)}`;
        }
      }
    } catch (err) {
      console.error("Invalid affiliate data:", err);
    }

    // process.env.EXPO_PUBLIC_* is substituted at bundle time by Metro.
    // If still undefined: stop Expo, check .env is at project root, run: npx expo start --clear
    const BASE_URL =
      process.env.EXPO_PUBLIC_TRENDYUU_URL_BACK ?? "http://localhost:8000";
    const redirectUrl =
      `${BASE_URL}/api/authentication/${providerId}/login` +
      `?next=${encodeURIComponent("trendyuu://auth/callback")}${affiliateParam}`;

    // Opens system browser — same redirect approach as web
    // ⚠️  You'll need deep linking configured to receive the token callback.
    //     See: https://docs.expo.dev/guides/linking/
    await Linking.openURL(redirectUrl);
    setIsLoading(null);
  };

  const btnLabel = (provider: (typeof PROVIDERS)[0]) => {
    if (provider.comingSoon) return t("comingSoon");
    if (isLoading === provider.id) return t("connecting");
    // t("LoginPage.continueWith", { provider: "Google" })
    return t("continueWith", { provider: provider.name });
  };

  return (
    <View style={styles.root}>
      {/* Background gradient — matches from-purple-900/20 via-black to-pink-900/20 */}
      <LinearGradient
        colors={["rgba(88,28,135,0.20)", "#000000", "rgba(131,24,67,0.20)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Card — matches w-full max-w-sm bg-zinc-900/80 backdrop-blur border-zinc-800 */}
        <Animated.View
          style={[
            styles.card,
            { opacity: cardAnim, transform: [{ translateY: cardSlide }] },
          ]}
        >
          {/* ── Logo + title ───────────────────────────────────────────────── */}
          <View style={styles.header}>
            <Animated.View
              style={[styles.logoRow, { transform: [{ scale: logoScale }] }]}
            >
              <Image
                source={require("../assets/logos/logotrend2.png")}
                style={styles.logoImage}
                resizeMode="contain"
                accessibilityLabel={tNav("logoAlt")}
              />
              <View>
                <Text style={styles.logoText}>
                  Trend<Text style={styles.logoAccent}>Yuu</Text>
                </Text>
              </View>
            </Animated.View>

            {/* t("LoginPage.welcome") */}
            <Animated.Text style={[styles.welcomeText, { opacity: titleAnim }]}>
              {t("welcome")}
            </Animated.Text>

            {/* t("LoginPage.subtitle") */}
            <Animated.Text
              style={[styles.subtitleText, { opacity: subtitleAnim }]}
            >
              {t("subtitle")}
            </Animated.Text>
          </View>

          {/* ── Divider — t("LoginPage.chooseOption") ──────────────────────── */}
          <Animated.View style={[styles.dividerRow, { opacity: dividerAnim }]}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t("chooseOption")}</Text>
            <View style={styles.dividerLine} />
          </Animated.View>

          {/* ── Provider buttons
                Web mobile layout:
                  [        Google        ]   ← full width
                  [ Microsoft ][ Twitter ]   ← 2-col row
                  [  TikTok  ][Instagram ]   ← 2-col row
          ────────────────────────────────── */}
          <View style={styles.providersGrid}>
            {/* Row 1 — Google full width */}
            {(() => {
              const google = PROVIDERS[0];
              const Icon = google.icon;
              return (
                <Animated.View
                  style={[styles.providerFull, { opacity: btnAnims[0] }]}
                >
                  <TouchableOpacity
                    style={styles.providerBtn}
                    onPress={() => !isLoading && handleOAuthLogin(google.id)}
                    disabled={!!isLoading}
                    activeOpacity={0.75}
                  >
                    <Icon />
                    <Text style={styles.providerBtnText} numberOfLines={1}>
                      {btnLabel(google)}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              );
            })()}

            {/* Rows 2–3 — remaining 4 providers in a 2-col grid */}
            <View style={styles.providersRow}>
              {PROVIDERS.slice(1).map((provider, i) => {
                const Icon = provider.icon;
                const index = i + 1; // offset for btnAnims
                return (
                  <Animated.View
                    key={provider.id}
                    style={[styles.providerHalf, { opacity: btnAnims[index] }]}
                  >
                    <TouchableOpacity
                      style={[
                        styles.providerBtn,
                        provider.comingSoon && styles.providerBtnDisabled,
                      ]}
                      onPress={() =>
                        !provider.comingSoon &&
                        !isLoading &&
                        handleOAuthLogin(provider.id)
                      }
                      disabled={!!provider.comingSoon || !!isLoading}
                      activeOpacity={0.75}
                    >
                      {provider.isTwitter ? (
                        <>
                          <XBadgeIcon />
                          <Text
                            style={styles.providerBtnText}
                            numberOfLines={1}
                          >
                            {btnLabel(provider)}
                          </Text>
                          <TwitterIcon />
                        </>
                      ) : (
                        <>
                          <Icon />
                          <Text
                            style={styles.providerBtnText}
                            numberOfLines={1}
                          >
                            {btnLabel(provider)}
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </View>
          </View>

          {/* ── Terms — t("LoginPage.terms/termsLink/and/privacyLink") ──────── */}
          <Animated.View style={[styles.termsRow, { opacity: termsAnim }]}>
            <Text style={styles.termsText}>
              {t("terms")}{" "}
              <Text
                style={styles.termsLink}
                onPress={() =>
                  Linking.openURL("https://trendyuu.com/policies/user-terms")
                }
              >
                {t("termsLink")}
              </Text>{" "}
              {t("and")}{" "}
              <Text
                style={styles.termsLink}
                onPress={() =>
                  Linking.openURL(
                    "https://trendyuu.com/policies/privacy-policy",
                  )
                }
              >
                {t("privacyLink")}
              </Text>
              .
            </Text>
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const CARD_MAX = 400;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000000",
  },
  scroll: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 24,
  },

  // Card — matches bg-zinc-900/80 backdrop-blur border border-zinc-800 rounded-2xl
  card: {
    width: "100%",
    maxWidth: CARD_MAX,
    backgroundColor: "rgba(24,24,27,0.92)", // zinc-900/80
    borderWidth: 1,
    borderColor: "#27272a", // zinc-800
    borderRadius: 16,
    padding: 20,
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 12,
  },

  // Header
  header: {
    alignItems: "center",
    gap: 8,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  logoImage: {
    width: 44,
    height: 44,
  },
  logoText: {
    fontSize: 26,
    fontWeight: "800",
    color: "#ffffff",
    lineHeight: 32,
  },
  logoAccent: {
    color: "#ec4899", // pink-500
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
    paddingHorizontal: 8,
  },
  subtitleText: {
    fontSize: 14,
    color: "#a1a1aa", // zinc-400
    textAlign: "center",
    paddingHorizontal: 8,
    lineHeight: 20,
  },

  // Divider
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#3f3f46", // zinc-700
  },
  dividerText: {
    color: "#a1a1aa",
    fontSize: 12,
    paddingHorizontal: 4,
  },

  // Providers grid — Google full width, then 2x2 grid below
  providersGrid: {
    gap: 8,
  },
  // Wrapping row for the 4 half-width buttons
  providersRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  providerFull: {
    width: "100%",
  },
  providerHalf: {
    // exactly half the grid minus the gap
    flexBasis: "48%",
    flexGrow: 1,
  },

  // Button base — matches bg-zinc-900 border border-zinc-800 rounded-2xl h-11
  providerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#18181b", // zinc-900
    borderWidth: 1,
    borderColor: "#27272a", // zinc-800
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 12,
  },
  providerBtnDisabled: {
    opacity: 0.5,
  },
  providerBtnTwitter: {
    backgroundColor: "#18181b",
  },
  providerBtnText: {
    flex: 1,
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },

  // Terms
  termsRow: {
    marginTop: 4,
  },
  termsText: {
    fontSize: 11,
    color: "#71717a", // zinc-400
    textAlign: "center",
    lineHeight: 18,
  },
  termsLink: {
    textDecorationLine: "underline",
    color: "#a1a1aa",
  },
});

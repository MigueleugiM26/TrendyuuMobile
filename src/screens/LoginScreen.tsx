import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ExpoLinking from "expo-linking";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { jwtDecode } from "jwt-decode";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useTranslations } from "../hooks/useTranslations";
import { notifyLoginSuccess } from "../lib/auth-utils";
import { setAuthToken } from "../lib/axiosConfig";
import { toastError } from "../lib/toast";
import { getBufferedAffiliateCode } from "../utils/affiliates";

// ─── Constants ────────────────────────────────────────────────────────────────

const BACKEND = process.env.EXPO_PUBLIC_TRENDYUU_URL_BACK;

// Must match the scheme in your app.json + the deep link registered on the backend
const MOBILE_CALLBACK_SCHEME = "trendyuu";
const MOBILE_CALLBACK_PATH = "auth/callback";

const slides = [
  {
    image: {
      uri: "https://cdn-frontend.trendyuu.com/public/fundo_login.webp",
    },
    titleKey: "LoginPage.slides.slide1.title",
    highlightKey: "LoginPage.slides.slide1.highlight",
    descriptionKey: "LoginPage.slides.slide1.description",
    subDescriptionKey: "LoginPage.slides.slide1.subDescription",
  },
  {
    image: {
      uri: "https://cdn-frontend.trendyuu.com/public/fundo_login2.webp",
    },
    titleKey: "LoginPage.slides.slide2.title",
    highlightKey: "LoginPage.slides.slide2.highlight",
    descriptionKey: "LoginPage.slides.slide2.description",
    subDescriptionKey: "LoginPage.slides.slide2.subDescription",
  },
  {
    image: {
      uri: "https://cdn-frontend.trendyuu.com/public/fundo_login3.webp",
    },
    titleKey: "LoginPage.slides.slide3.title",
    highlightKey: "LoginPage.slides.slide3.highlight",
    descriptionKey: "LoginPage.slides.slide3.description",
    subDescriptionKey: "LoginPage.slides.slide3.subDescription",
  },
];

// ─── Provider definitions ─────────────────────────────────────────────────────

const GoogleIcon = () => (
  <Image
    source={{
      uri: "https://cdn-frontend.trendyuu.com/public/logos/google.png",
    }}
    style={styles.providerIcon}
  />
);

// SVG icons are inlined as small PNGs hosted on your CDN, or you can use
// react-native-svg if you prefer. The X / Twitter icon below uses a text glyph
// since it's a simple shape.
const providers = [
  { id: "google", name: "Google", fullRow: true, Icon: GoogleIcon },
  {
    id: "microsoft",
    name: "Microsoft",
    fullRow: false,
    Icon: () => (
      <View style={styles.msGrid}>
        <View style={[styles.msCell, { backgroundColor: "#f35325" }]} />
        <View style={[styles.msCell, { backgroundColor: "#81bc06" }]} />
        <View style={[styles.msCell, { backgroundColor: "#05a6f0" }]} />
        <View style={[styles.msCell, { backgroundColor: "#ffba08" }]} />
      </View>
    ),
  },
  {
    id: "twitter",
    name: "X",
    fullRow: false,
    Icon: () => <Text style={styles.xIcon}>𝕏</Text>,
  },
  {
    id: "tiktok",
    name: "TikTok",
    fullRow: false,
    Icon: () => (
      <Image
        source={{
          uri: "https://cdn-frontend.trendyuu.com/public/logos/tiktok.png",
        }}
        style={styles.providerIcon}
      />
    ),
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    fullRow: false,
    Icon: () => (
      <Image
        source={{
          uri: "https://cdn-frontend.trendyuu.com/public/logos/linkedin.png",
        }}
        style={styles.providerIcon}
      />
    ),
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function LoginScreen() {
  const t = useTranslations();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);

  // Fade animation for slide transitions
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // ── Redirect if already logged in ─────────────────────────────────────────
  useEffect(() => {
    AsyncStorage.getItem("accessToken").then((token) => {
      if (!token) return;
      try {
        const decoded: { exp: number } = jwtDecode(token);
        if (decoded.exp * 1000 > Date.now()) {
          router.replace("/dashboard");
        } else {
          AsyncStorage.multiRemove(["accessToken", "refreshToken"]);
        }
      } catch {
        AsyncStorage.multiRemove(["accessToken", "refreshToken"]);
      }
    });
  }, []);

  // ── Auto-advance slides ────────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      goToSlide((slideIndex + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slideIndex]);

  // ── Deep-link listener — receives tokens after OAuth ──────────────────────
  useEffect(() => {
    const subscription = Linking.addEventListener("url", ({ url }) => {
      handleOAuthCallback(url);
    });
    // Handle the case where the app was cold-started by the deep link
    ExpoLinking.getInitialURL().then((url) => {
      if (url) handleOAuthCallback(url);
    });
    return () => subscription.remove();
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────────────

  function goToSlide(index: number) {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
    ]).start();
    setTimeout(() => setSlideIndex(index), 300);
  }

  async function handleOAuthCallback(url: string) {
    const parsed = ExpoLinking.parse(url);
    if (parsed.path !== MOBILE_CALLBACK_PATH) return;

    const { access, refresh } = parsed.queryParams as Record<string, string>;

    if (access && refresh) {
      await AsyncStorage.multiSet([
        ["accessToken", access],
        ["refreshToken", refresh],
      ]);
      setAuthToken(access);
      notifyLoginSuccess();
      setIsLoading(null);
      router.replace("/dashboard");
    } else {
      setIsLoading(null);
      toastError(t("LoginPage.loginFailed"));
    }
  }

  async function handleOAuthLogin(providerId: string) {
    setIsLoading(providerId);

    // Append buffered affiliate code if present
    const affiliateCode = await getBufferedAffiliateCode();
    const affiliateParam = affiliateCode
      ? `&affiliate=${encodeURIComponent(affiliateCode)}`
      : "";

    // The mobile callback deep link — must be registered in your backend's
    // ALLOWED_REDIRECT_URLS (or equivalent). Add MOBILE_FRONTEND_URL env var
    // pointing to "trendyuu://auth/callback" on the backend side.
    const mobileCallback = ExpoLinking.createURL(MOBILE_CALLBACK_PATH);
    const next = encodeURIComponent(mobileCallback);

    const oauthUrl = `${BACKEND}/api/authentication/${providerId}/login?next=${next}${affiliateParam}`;

    // Opens in an in-app browser tab; on iOS uses SFSafariViewController,
    // on Android uses Chrome Custom Tabs. No new page / external browser.
    await WebBrowser.openAuthSessionAsync(oauthUrl, mobileCallback);

    // If the user dismissed the browser without completing auth, reset loading
    setIsLoading(null);
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const slide = slides[slideIndex];

  return (
    <View style={styles.root}>
      {/* Background image */}
      <Animated.Image
        source={slide.image}
        style={[StyleSheet.absoluteFill, styles.bgImage, { opacity: fadeAnim }]}
        resizeMode="cover"
      />

      {/* Dark overlay */}
      <View style={[StyleSheet.absoluteFill, styles.overlay]} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Slide text ─────────────────────────────────────── */}
        <Animated.View style={[styles.slideText, { opacity: fadeAnim }]}>
          <Text style={styles.slideTitle}>
            {t(slide.titleKey)}{" "}
            <Text style={styles.slideHighlight}>{t(slide.highlightKey)}</Text>
          </Text>
          <Text style={styles.slideDesc}>{t(slide.descriptionKey)}</Text>
          <Text style={styles.slideSubDesc}>{t(slide.subDescriptionKey)}</Text>
        </Animated.View>

        {/* ── Slide indicators ───────────────────────────────── */}
        <View style={styles.indicators}>
          {slides.map((_, i) => (
            <Pressable
              key={i}
              onPress={() => goToSlide(i)}
              style={[
                styles.indicator,
                i === slideIndex
                  ? styles.indicatorActive
                  : styles.indicatorInactive,
              ]}
            />
          ))}
        </View>

        {/* ── Card ───────────────────────────────────────────── */}
        <View style={styles.card}>
          {/* Logo */}
          <View style={styles.logoRow}>
            <Image
              source={{
                uri: "https://cdn-frontend.trendyuu.com/public/logos/logotrend2.webp",
              }}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.logoText}>
              Trend<Text style={styles.logoPink}>Yuu</Text>
            </Text>
          </View>

          <Text style={styles.welcome}>{t("LoginPage.welcome")}</Text>
          <Text style={styles.subtitle}>{t("LoginPage.subtitle")}</Text>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>
              {t("LoginPage.chooseOption")}
            </Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Provider buttons */}
          <View style={styles.providersGrid}>
            {providers.map((provider) => {
              const loading = isLoading === provider.id;
              const anyLoading = isLoading !== null;

              return (
                <Pressable
                  key={provider.id}
                  onPress={() => !anyLoading && handleOAuthLogin(provider.id)}
                  disabled={anyLoading}
                  style={({ pressed }) => [
                    styles.providerBtn,
                    provider.fullRow && styles.providerBtnFull,
                    pressed && styles.providerBtnPressed,
                    anyLoading && styles.providerBtnDisabled,
                  ]}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <provider.Icon />
                  )}
                  <Text style={styles.providerText} numberOfLines={1}>
                    {loading
                      ? t("LoginPage.connecting")
                      : t("LoginPage.continueWith", {
                          provider: provider.name,
                        })}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Terms */}
          <Text style={styles.terms}>
            {t("LoginPage.terms")}{" "}
            <Text
              style={styles.termsLink}
              onPress={() =>
                WebBrowser.openBrowserAsync(
                  "https://trendyuu.com/policies/user-terms",
                )
              }
            >
              {t("LoginPage.termsLink")}
            </Text>{" "}
            {t("LoginPage.and")}{" "}
            <Text
              style={styles.termsLink}
              onPress={() =>
                WebBrowser.openBrowserAsync(
                  "https://trendyuu.com/policies/privacy-policy",
                )
              }
            >
              {t("LoginPage.privacyLink")}
            </Text>
            .
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000",
  },
  bgImage: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "flex-end",
    padding: 20,
    paddingBottom: 36,
  },

  // ── Slide text
  slideText: {
    marginBottom: 16,
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    lineHeight: 34,
  },
  slideHighlight: {
    color: "#ec4899",
  },
  slideDesc: {
    color: "#d4d4d8",
    fontSize: 15,
    marginTop: 8,
    lineHeight: 22,
  },
  slideSubDesc: {
    color: "#a1a1aa",
    fontSize: 13,
    marginTop: 4,
  },

  // ── Indicators
  indicators: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 20,
  },
  indicator: {
    height: 4,
    borderRadius: 2,
  },
  indicatorActive: {
    width: 32,
    backgroundColor: "#ec4899",
  },
  indicatorInactive: {
    width: 16,
    backgroundColor: "#52525b",
  },

  // ── Card
  card: {
    backgroundColor: "rgba(24,24,27,0.92)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#27272a",
    padding: 24,
  },

  // ── Logo
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  logo: {
    width: 44,
    height: 44,
    marginRight: 10,
  },
  logoText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
  },
  logoPink: {
    color: "#ec4899",
  },

  welcome: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#a1a1aa",
    textAlign: "center",
    marginBottom: 20,
  },

  // ── Divider
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#3f3f46",
  },
  dividerText: {
    color: "#71717a",
    fontSize: 12,
  },

  // ── Provider buttons
  providersGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  providerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#27272a",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 8,
    // Half width minus half the gap = ~47% so two fit per row
    width: "47%",
  },
  providerBtnFull: {
    width: "100%",
  },
  providerBtnPressed: {
    backgroundColor: "#27272a",
  },
  providerBtnDisabled: {
    opacity: 0.5,
  },
  providerText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    flexShrink: 1,
  },
  providerIcon: {
    width: 18,
    height: 18,
    resizeMode: "contain",
  },

  // ── Microsoft grid icon
  msGrid: {
    width: 18,
    height: 18,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 1,
  },
  msCell: {
    width: 8,
    height: 8,
  },

  // ── X / Twitter icon
  xIcon: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  // ── Terms
  terms: {
    color: "#71717a",
    fontSize: 11,
    textAlign: "center",
    lineHeight: 18,
  },
  termsLink: {
    textDecorationLine: "underline",
    color: "#a1a1aa",
  },
});

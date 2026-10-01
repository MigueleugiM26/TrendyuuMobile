import { useTranslations } from "@/src/hooks/useTranslations";
import { notifyLoginSuccess } from "@/src/lib/auth-utils";
import { setAuthToken } from "@/src/lib/axiosConfig";
import { toastError } from "@/src/lib/toast";
import { getBufferedAffiliateCode } from "@/src/utils/affiliates";
import { FontAwesome5 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ExpoLinking from "expo-linking";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { jwtDecode } from "jwt-decode";
import { X } from "lucide-react-native";
import { AnimatePresence, MotiView } from "moti";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

// ─── Constants ────────────────────────────────────────────────────────────────

const BACKEND = process.env.EXPO_PUBLIC_TRENDYUU_URL_BACK;
const MOBILE_CALLBACK_SCHEME = "trendyuu";
const MOBILE_CALLBACK_PATH = "auth/callback";

// ─── Provider definitions (reused from login-page.tsx) ───────────────────────

const providers = [
  {
    id: "google",
    name: "Google",
    Icon: () => <FontAwesome5 name="google" size={18} color="#fff" />,
  },
  {
    id: "microsoft",
    name: "Microsoft",
    Icon: () => <FontAwesome5 name="windows" size={18} color="#fff" />,
  },
  {
    id: "twitter",
    name: "X",
    Icon: () => <Text style={styles.xIcon}>𝕏</Text>,
  },
  {
    id: "tiktok",
    name: "TikTok",
    Icon: () => <FontAwesome5 name="tiktok" size={18} color="#fff" />,
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    Icon: () => <FontAwesome5 name="linkedin" size={18} color="#fff" />,
  },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const t = useTranslations();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  // ── Redirect if already logged in (reused from login-page.tsx) ────────────
  useEffect(() => {
    if (!isOpen) return;

    AsyncStorage.getItem("accessToken").then((token) => {
      if (!token) return;
      try {
        const decoded: { exp: number } = jwtDecode(token);
        if (decoded.exp * 1000 > Date.now()) {
          onClose();
          router.replace("/dashboard");
        } else {
          AsyncStorage.multiRemove(["accessToken", "refreshToken"]);
        }
      } catch {
        AsyncStorage.multiRemove(["accessToken", "refreshToken"]);
      }
    });
  }, [isOpen]);

  // ── Deep-link listener (reused from login-page.tsx) ───────────────────────
  useEffect(() => {
    if (!isOpen) return;

    const subscription = Linking.addEventListener("url", ({ url }) => {
      handleOAuthCallback(url);
    });
    ExpoLinking.getInitialURL().then((url) => {
      if (url) handleOAuthCallback(url);
    });
    return () => subscription.remove();
  }, [isOpen]);

  // ── Helpers (reused from login-page.tsx) ──────────────────────────────────

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
      onClose();
      router.replace("/dashboard");
    } else {
      setIsLoading(null);
      toastError(t("LoginPage.loginFailed"));
    }
  }

  async function handleOAuthLogin(providerId: string) {
    setIsLoading(providerId);

    const affiliateCode = await getBufferedAffiliateCode();
    const affiliateParam = affiliateCode
      ? `&affiliate=${encodeURIComponent(affiliateCode)}`
      : "";

    const mobileCallback = Platform.select({
      web: `${window.location.origin}/auth/callback`,
      default: `${MOBILE_CALLBACK_SCHEME}://${MOBILE_CALLBACK_PATH}`,
    });

    if (Platform.OS === "web") {
      const next = encodeURIComponent(mobileCallback!);
      window.location.href = `${BACKEND}/api/authentication/${providerId}/login?next=${next}${affiliateParam}`;
      return;
    }

    const next = encodeURIComponent(mobileCallback!);
    const oauthUrl = `${BACKEND}/api/authentication/${providerId}/login?next=${next}${affiliateParam}`;
    await WebBrowser.openAuthSessionAsync(oauthUrl, mobileCallback!);
    setIsLoading(null);
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
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
            key="login-modal-backdrop"
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "timing", duration: 200 }}
            style={styles.backdrop}
          >
            {/* Dismiss on backdrop tap */}
            <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

            <MotiView
              from={{ opacity: 0, scale: 0.9, translateY: 20 }}
              animate={{ opacity: 1, scale: 1, translateY: 0 }}
              exit={{ opacity: 0, scale: 0.9, translateY: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              style={styles.sheet}
            >
              {/* Close button */}
              <Pressable
                onPress={onClose}
                style={styles.closeButton}
                hitSlop={8}
              >
                <X size={20} color="#a1a1aa" />
              </Pressable>

              {/* Logo + Title */}
              <MotiView
                from={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 200, type: "spring" }}
                style={styles.logoRow}
              >
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
              </MotiView>

              <MotiView
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ type: "timing", duration: 300, delay: 400 }}
              >
                <Text style={styles.welcome}>{t("LoginPage.welcome")}</Text>
              </MotiView>

              <MotiView
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ type: "timing", duration: 300, delay: 600 }}
              >
                <Text style={styles.subtitle}>{t("LoginPage.subtitle")}</Text>
              </MotiView>

              {/* Divider */}
              <MotiView
                from={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ type: "timing", duration: 300, delay: 800 }}
                style={styles.dividerRow}
              >
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>
                  {t("LoginPage.chooseOption")}
                </Text>
                <View style={styles.dividerLine} />
              </MotiView>

              {/* Provider buttons */}
              <View style={styles.providersGrid}>
                {providers.map((provider, index) => {
                  const loading = isLoading === provider.id;
                  const anyLoading = isLoading !== null;

                  return (
                    <MotiView
                      key={provider.id}
                      from={{ opacity: 0, translateX: -20 }}
                      animate={{ opacity: 1, translateX: 0 }}
                      transition={{
                        type: "timing",
                        duration: 300,
                        delay: 1000 + index * 100,
                      }}
                    >
                      <Pressable
                        onPress={() =>
                          !anyLoading && handleOAuthLogin(provider.id)
                        }
                        disabled={anyLoading}
                        style={({ pressed }) => [
                          styles.providerBtn,
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
                    </MotiView>
                  );
                })}
              </View>

              {/* Terms */}
              <MotiView
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ type: "timing", duration: 300, delay: 1400 }}
              >
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
              </MotiView>
            </MotiView>
          </MotiView>
        )}
      </AnimatePresence>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.80)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  sheet: {
    width: "100%",
    maxWidth: 480,
    backgroundColor: "rgba(24,24,27,0.97)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#27272a",
    padding: 24,
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
    zIndex: 10,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    marginTop: 8,
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
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#a1a1aa",
    textAlign: "center",
    marginBottom: 16,
  },
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
  providersGrid: {
    flexDirection: "column",
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
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 10,
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
  xIcon: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
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

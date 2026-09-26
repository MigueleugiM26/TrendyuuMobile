import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { jwtDecode } from "jwt-decode";
import { usePostHog } from "posthog-react-native";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Path, Rect } from "react-native-svg";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_TRENDYUU_URL_BACK ?? "http://localhost:8000";

// ---------------------------------------------------------------------------
// Inline strings
// ---------------------------------------------------------------------------
const t = {
  welcome: "Bem-vindo de volta!",
  subtitle: "Faça login para continuar criando vídeos incríveis",
  chooseOption: "escolha uma opção",
  continueWith: (provider: string) => `Continuar com ${provider}`,
  connecting: "Conectando...",
  comingSoon: "Em breve",
  terms: "Ao continuar, você concorda com nossos",
  termsLink: "Termos de Uso",
  and: "e",
  privacyLink: "Política de Privacidade",
};

// ---------------------------------------------------------------------------
// SVG Icons
// ---------------------------------------------------------------------------
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

const XIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 300 300" fill="white">
    <Path d="M178.57 127.15 290.27 0h-26.46l-97.03 110.38L89.34 0H0l117.13 166.93L0 300.25h26.46l102.4-116.59 81.8 116.59h89.34M36.01 19.54H76.66l187.13 262.13h-40.66" />
  </Svg>
);

const TikTokIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="white">
    <Path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </Svg>
);

const LinkedInIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="#0A66C2">
    <Path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </Svg>
);

// ---------------------------------------------------------------------------
// Provider config
// ---------------------------------------------------------------------------
type Provider = {
  id: string;
  name: string;
  icon: React.ReactNode;
  fullWidth?: boolean;
};

const providers: Provider[] = [
  { id: "google", name: "Google", icon: <GoogleIcon />, fullWidth: true },
  { id: "microsoft", name: "Microsoft", icon: <MicrosoftIcon /> },
  { id: "twitter", name: "X", icon: <XIcon /> },
  { id: "tiktok", name: "TikTok", icon: <TikTokIcon /> },
  { id: "linkedin", name: "LinkedIn", icon: <LinkedInIcon /> },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function LoginScreen() {
  const router = useRouter();
  const posthog = usePostHog();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  // Animated values
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(30)).current;
  const logoScale = useRef(new Animated.Value(0)).current;

  // Mount animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideUp, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) return;
      try {
        const decoded: { exp: number } = jwtDecode(token);
        if (decoded.exp * 1000 > Date.now()) {
          router.replace("/(tabs)/dashboard");
        } else {
          await AsyncStorage.multiRemove(["accessToken", "refreshToken"]);
        }
      } catch {
        await AsyncStorage.multiRemove(["accessToken", "refreshToken"]);
      }
    };
    checkToken();
  }, []);

  // PostHog: signup_started
  useEffect(() => {
    posthog?.capture("signup_started");
  }, []);

  // ---------------------------------------------------------------------------
  // OAuth login — opens the system browser; deep link callback handled in _layout
  // ---------------------------------------------------------------------------
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

    // The backend redirects back to your app via a deep link scheme,
    // e.g. trendyuu://auth/callback?access=...&refresh=...
    // Configure your deep link scheme in app.json under "scheme".
    const redirectUrl = `${API_BASE_URL}/api/authentication/${providerId}/login?next=${encodeURIComponent(
      "trendyuu://auth/callback",
    )}${affiliateParam}`;

    try {
      await Linking.openURL(redirectUrl);
    } catch (err) {
      console.error("Failed to open OAuth URL:", err);
    } finally {
      // Reset loading state after a short delay; the actual success is handled
      // by the deep-link callback in _layout.tsx
      setTimeout(() => setIsLoading(null), 3000);
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <View style={styles.root}>
      {/* Background gradient blobs */}
      <View style={[styles.blob, styles.blobTopLeft]} />
      <View style={[styles.blob, styles.blobBottomRight]} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.card,
            { opacity: fadeIn, transform: [{ translateY: slideUp }] },
          ]}
        >
          {/* Logo */}
          <Animated.View
            style={[styles.logoRow, { transform: [{ scale: logoScale }] }]}
          >
            <Image
              source={{
                uri: "https://cdn-frontend.trendyuu.com/public/logos/logotrend2.webp",
              }}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.logoText}>
              Trend<Text style={styles.logoAccent}>Yuu</Text>
            </Text>
          </Animated.View>

          {/* Headline */}
          <Text style={styles.welcome}>{t.welcome}</Text>
          <Text style={styles.subtitle}>{t.subtitle}</Text>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t.chooseOption}</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Provider buttons */}
          <View style={styles.providerGrid}>
            {providers.map((provider) => (
              <Pressable
                key={provider.id}
                onPress={() => handleOAuthLogin(provider.id)}
                disabled={isLoading !== null}
                style={({ pressed }) => [
                  styles.providerBtn,
                  provider.fullWidth && styles.providerBtnFull,
                  pressed && styles.providerBtnPressed,
                  isLoading !== null && styles.providerBtnDisabled,
                ]}
              >
                <View style={styles.providerBtnInner}>
                  {isLoading === provider.id ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    provider.icon
                  )}
                  <Text style={styles.providerBtnText}>
                    {isLoading === provider.id
                      ? t.connecting
                      : t.continueWith(provider.name)}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>

          {/* Terms */}
          <Text style={styles.terms}>
            {t.terms}{" "}
            <Text
              style={styles.termsLink}
              onPress={() =>
                Linking.openURL(`${API_BASE_URL}/policies/user-terms`)
              }
            >
              {t.termsLink}
            </Text>{" "}
            {t.and}{" "}
            <Text
              style={styles.termsLink}
              onPress={() =>
                Linking.openURL(`${API_BASE_URL}/policies/privacy-policy`)
              }
            >
              {t.privacyLink}
            </Text>
            .
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000",
  },
  blob: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.15,
  },
  blobTopLeft: {
    top: -80,
    left: -80,
    backgroundColor: "#7c3aed", // purple-700
  },
  blobBottomRight: {
    bottom: -80,
    right: -80,
    backgroundColor: "#be185d", // pink-700
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "rgba(24,24,27,0.85)", // zinc-900/85
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#27272a", // zinc-800
    padding: 28,
    gap: 20,
    // subtle shadow
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
      },
      android: { elevation: 12 },
    }),
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  logoImage: {
    width: 52,
    height: 52,
  },
  logoText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#fff",
  },
  logoAccent: {
    color: "#ec4899", // pink-500
  },
  welcome: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#a1a1aa", // zinc-400
    textAlign: "center",
    lineHeight: 20,
  },
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
  providerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  providerBtn: {
    // Half-width minus half the gap
    width: "47%",
    backgroundColor: "#18181b", // zinc-900
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#27272a",
    height: 52,
    justifyContent: "center",
    alignItems: "center",
  },
  providerBtnFull: {
    width: "100%",
  },
  providerBtnPressed: {
    backgroundColor: "#27272a",
  },
  providerBtnDisabled: {
    opacity: 0.6,
  },
  providerBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 8,
  },
  providerBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  terms: {
    fontSize: 11,
    color: "#71717a", // zinc-500
    textAlign: "center",
    lineHeight: 16,
  },
  termsLink: {
    textDecorationLine: "underline",
    color: "#a1a1aa",
  },
});

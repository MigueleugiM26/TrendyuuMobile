import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Linking } from "react-native";
import { authEvents } from "./auth-events";

const CALLBACK_PATH = "auth/callback";

/**
 * Parses the tokens from a deep link URL and stores them.
 * Returns true if tokens were found and stored.
 */
async function handleDeepLink(url: string): Promise<boolean> {
  // e.g. trendyuu://auth/callback?access=xxx&refresh=yyy
  if (!url.includes(CALLBACK_PATH)) return false;

  const queryString = url.split("?")[1] ?? "";
  const params: Record<string, string> = {};
  queryString.split("&").forEach((pair) => {
    const [key, val] = pair.split("=");
    if (key && val) params[key] = decodeURIComponent(val);
  });

  const { access, refresh } = params;

  if (access && refresh) {
    await AsyncStorage.setItem("accessToken", access);
    await AsyncStorage.setItem("refreshToken", refresh);

    // Notify UserProvider to re-fetch the user
    authEvents.emit("userLoggedIn");

    // Navigate to the main app after a short delay
    setTimeout(() => {
      router.replace("/dashboard");
    }, 150);

    return true;
  } else {
    // Login failed — go back to login
    console.warn("OAuth callback missing tokens");
    router.replace("/login");
    return false;
  }
}

/**
 * Registers the Linking listener and handles any initial URL (app opened via deep link).
 * Call this once in your root _layout.tsx useEffect.
 * Returns a cleanup function.
 */
export function initAuthCallbackHandler(): () => void {
  // Handle deep links while the app is already open
  const subscription = Linking.addEventListener("url", ({ url }) => {
    handleDeepLink(url);
  });

  // Handle the case where the app was opened FROM the deep link (cold start)
  Linking.getInitialURL().then((url) => {
    if (url) handleDeepLink(url);
  });

  return () => subscription.remove();
}

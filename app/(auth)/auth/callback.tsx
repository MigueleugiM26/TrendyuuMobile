import { notifyLoginSuccess } from "@/src/lib/auth-utils";
import { setAuthToken } from "@/src/lib/axiosConfig";
import { toastError } from "@/src/lib/toast";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function AuthCallbackScreen() {
  const router = useRouter();
  // On native, tokens arrive as Expo Router search params.
  // On web, they arrive in the URL which Expo Router also parses the same way.
  const params = useLocalSearchParams<{
    access?: string;
    refresh?: string;
  }>();

  useEffect(() => {
    async function handleCallback() {
      let access = params.access;
      let refresh = params.refresh;

      // On web, useLocalSearchParams may lag one render — read directly from
      // window.location.search as a fallback.
      if (Platform.OS === "web" && (!access || !refresh)) {
        const search = new URLSearchParams(window.location.search);
        access = search.get("access") ?? undefined;
        refresh = search.get("refresh") ?? undefined;
      }

      if (access && refresh) {
        await AsyncStorage.multiSet([
          ["accessToken", access],
          ["refreshToken", refresh],
        ]);
        setAuthToken(access);
        notifyLoginSuccess();
        router.replace("/dashboard");
      } else {
        toastError("Login failed. Please try again.");
        router.replace("/login");
      }
    }

    handleCallback();
  }, [params.access, params.refresh]);

  return (
    <View style={styles.root}>
      <ActivityIndicator size="large" color="#ec4899" />
      <Text style={styles.text}>Autenticando...</Text>
      <Text style={styles.sub}>Aguarde um momento</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  text: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  sub: {
    color: "#71717a",
    fontSize: 14,
  },
});

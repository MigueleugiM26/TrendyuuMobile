import { notifyLoginSuccess } from "@/src/lib/auth-utils";
import { setAuthToken } from "@/src/lib/axiosConfig";
import { toastError } from "@/src/lib/toast";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function AuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    access?: string;
    refresh?: string;
  }>();

  useEffect(() => {
    async function handleCallback() {
      const { access, refresh } = params;

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
  }, []);

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

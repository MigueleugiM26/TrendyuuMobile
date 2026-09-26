import { UserProvider } from "@/src/context/user-context";
import { LanguageProvider } from "@/src/hooks/useTranslations";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <LanguageProvider>
      <UserProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="login" options={{ presentation: "modal" }} />
          <Stack.Screen name="auth/callback" options={{ headerShown: false }} />
        </Stack>
      </UserProvider>
    </LanguageProvider>
  );
}

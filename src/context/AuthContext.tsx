import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";
import { login } from "../lib/api";
import { notifyLoginSuccess, notifyLogout } from "../lib/auth-utils";
import { clearAuthToken, setAuthToken } from "../lib/axiosConfig";

interface AuthContextType {
  user: { email: string } | null;
  loginUser: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  accessToken: string | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshTokenValue, setRefreshTokenValue] = useState<string | null>(
    null,
  );
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on app launch
  useEffect(() => {
    async function restoreSession() {
      try {
        const [storedToken, storedRefresh, storedEmail] =
          await AsyncStorage.multiGet([
            "accessToken",
            "refreshToken",
            "userEmail",
          ]);

        const token = storedToken[1];
        const refresh = storedRefresh[1];
        const email = storedEmail[1];

        if (token) {
          setAccessToken(token);
          setAuthToken(token);
        }
        if (refresh) setRefreshTokenValue(refresh);
        if (email) setUser({ email });
      } catch (error) {
        console.error("Failed to restore session:", error);
      } finally {
        setIsLoading(false);
      }
    }

    restoreSession();
  }, []);

  async function loginUser(email: string, password: string) {
    const tokens = await login(email, password);

    setAccessToken(tokens.access);
    setRefreshTokenValue(tokens.refresh);
    setUser({ email });

    // Sync to axios interceptor and auth events
    setAuthToken(tokens.access);
    notifyLoginSuccess();

    // Persist across sessions
    await AsyncStorage.multiSet([
      ["accessToken", tokens.access],
      ["refreshToken", tokens.refresh],
      ["userEmail", email],
    ]);
  }

  async function logout() {
    setAccessToken(null);
    setRefreshTokenValue(null);
    setUser(null);

    clearAuthToken();
    notifyLogout();

    await AsyncStorage.multiRemove([
      "accessToken",
      "refreshToken",
      "userEmail",
    ]);
  }

  return (
    <AuthContext.Provider
      value={{ user, loginUser, logout, accessToken, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve estar dentro de <AuthProvider>");
  return context;
}

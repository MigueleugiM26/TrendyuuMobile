import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import type { DecodedToken, TotalVideoData, User } from "@/src/types/user";

// ─── Token storage keys — same names as web localStorage keys ────────────────
const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

// ─── Module-level cache (same pattern as web) ─────────────────────────────────
let refreshPromise: Promise<string | null> | null = null;
let globalUser: (User & { accessToken: string }) | null = null;
let globalCredits: { value: number; nextRenewal: Date | null } | null = null;

// ─── Helpers — AsyncStorage drop-in wrappers ──────────────────────────────────
const storage = {
  get: (key: string) => AsyncStorage.getItem(key),
  set: (key: string, value: string) => AsyncStorage.setItem(key, value),
  remove: (key: string) => AsyncStorage.removeItem(key),
};

const refreshAccessToken = async (
  refreshToken: string,
): Promise<string | null> => {
  if (refreshPromise) return refreshPromise;

  refreshPromise = fetch(
    `${process.env.EXPO_PUBLIC_TRENDYUU_URL_BACK}/api/authentication/refresh`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    },
  )
    .then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json();
        console.log("Refresh failed:", errorData);
        throw new Error("Refresh token invalid or expired");
      }
      const data = await response.json();
      // AsyncStorage instead of localStorage
      await storage.set(ACCESS_TOKEN_KEY, data.access);
      await storage.set(REFRESH_TOKEN_KEY, data.refresh);
      return data.access as string;
    })
    .catch((err) => {
      console.error("Refresh error:", err);
      return null;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};

// ─── Context type — identical to web ─────────────────────────────────────────
type UserContextType = {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => void;
  userCredits: number | null;
  clipsCredits?: { autoclip: number; shortGenerator: number } | null;
  nextRenewalDate: Date | null;
  refreshCredits: () => Promise<void>;
  subtractCredits: (amount: number) => void;
  subtractClipsCredits: (delta: {
    autoclip?: number;
    shortGenerator?: number;
  }) => void;
  isLoadingCredits: boolean;
  refreshVideoData: () => Promise<void>;
  currentPlan: string;
  planPeriod: string;
  isFreeTrialActive: boolean;
  freeTrialEndDate: string;
  region: string;
  dev: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────
export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(globalUser);
  const [loading, setLoading] = useState(!globalUser);
  const [userCredits, setUserCredits] = useState<number | null>(null);
  const [clipsCredits, setClipsCredits] = useState<{
    autoclip: number;
    shortGenerator: number;
  } | null>(globalUser?.clipsCredits ?? null);
  const [isLoadingCredits, setIsLoadingCredits] = useState(false);
  const [nextRenewalDate, setNextRenewalDate] = useState<Date | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string>("free");
  const [planPeriod, setPlanPeriod] = useState<string>("mensal");
  const [isFreeTrialActive, setIsFreeTrialActive] = useState(false);
  const [freeTrialEndDate, setFreeTrialEndDate] = useState("");
  const [region, setRegion] = useState("US");
  const [dev, setDev] = useState(false);

  // ── logout ──────────────────────────────────────────────────────────────────
  const logout = async () => {
    // AsyncStorage instead of localStorage.removeItem
    await storage.remove(ACCESS_TOKEN_KEY);
    await storage.remove(REFRESH_TOKEN_KEY);
    setUser(null);
    setUserCredits(null);
    setClipsCredits(null);
    setCurrentPlan("free");
    setPlanPeriod("mensal");
    setIsFreeTrialActive(false);
    setFreeTrialEndDate("");
    setNextRenewalDate(null);
    setRegion("US");
    setDev(false);
    globalUser = null;
    globalCredits = null;
  };

  // ── refreshCredits ──────────────────────────────────────────────────────────
  const refreshCredits = async () => {
    setIsLoadingCredits(true);
    try {
      const token = await storage.get(ACCESS_TOKEN_KEY);
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_TRENDYUU_URL_BACK}/api/stripe/credits/get_credits/`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!response.ok) throw new Error("Failed to fetch credits");

      const data: { available?: number; nextRenewal?: string } =
        await response.json();
      const credits = data.available ?? 0;
      const renewal = data.nextRenewal ? new Date(data.nextRenewal) : null;

      setUserCredits(credits);
      setNextRenewalDate(renewal);
      globalCredits = { value: credits, nextRenewal: renewal };
    } catch (err) {
      console.error("Error fetching credits:", err);
      setUserCredits(0);
      globalCredits = { value: 0, nextRenewal: null };
    } finally {
      setIsLoadingCredits(false);
    }
  };

  // ── fetchUser ───────────────────────────────────────────────────────────────
  const fetchUser = async () => {
    // AsyncStorage is async — await both reads
    let accessToken = await storage.get(ACCESS_TOKEN_KEY);
    const refreshToken = await storage.get(REFRESH_TOKEN_KEY);

    if (!accessToken || !refreshToken) {
      await logout();
      return;
    }

    try {
      const decoded: DecodedToken = jwtDecode(accessToken);
      const isExpired = decoded.exp * 1000 < Date.now();

      if (isExpired) {
        accessToken = await refreshAccessToken(refreshToken);
        if (!accessToken) {
          await logout();
          return;
        }
      }

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_TRENDYUU_URL_BACK}/api/authentication/users/${decoded.user_id}`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      if (!response.ok) throw new Error("Failed to fetch user");

      const data: User = await response.json();
      const userWithToken = { ...data, accessToken };

      setUser(userWithToken);
      globalUser = userWithToken;

      setCurrentPlan(data.currentPlan || "free");
      setUserCredits(data.credits || 0);
      setClipsCredits(data.clipsCredits ?? { autoclip: 0, shortGenerator: 0 });
      setPlanPeriod(data.planPeriod || "mensal");
      setIsFreeTrialActive(data.isFreeTrialActive || false);
      setFreeTrialEndDate(data.freeTrialEndDate || "");
      setRegion(data.region || "US");
      setDev(data.dev || false);

      if (!globalCredits) await refreshCredits();
    } catch (err) {
      console.error("Error fetching user:", err);
      await logout();
    }
  };

  // ── refreshVideoData ────────────────────────────────────────────────────────
  const refreshVideoData = async () => {
    if (!user) return;
    setIsLoadingCredits(true);
    try {
      const token = await storage.get(ACCESS_TOKEN_KEY);
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_TRENDYUU_URL_BACK}/api/authentication/users/${user.id}/partial`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!response.ok) throw new Error("Failed to fetch video data");

      const data: { totalVideoData?: Partial<TotalVideoData> } =
        await response.json();
      if (data.totalVideoData) {
        setUser((prev) =>
          prev
            ? {
                ...prev,
                totalVideoData: {
                  ...prev.totalVideoData,
                  ...data.totalVideoData,
                },
              }
            : prev,
        );
      }
    } catch (err) {
      console.error("Error fetching video data:", err);
    } finally {
      setIsLoadingCredits(false);
    }
  };

  // ── subtractCredits / subtractClipsCredits — identical to web ───────────────
  const subtractCredits = (amount: number) => {
    setUserCredits((prev) => {
      const newVal = prev !== null ? Math.max(prev - amount, 0) : 0;
      globalCredits = { value: newVal, nextRenewal: nextRenewalDate };
      return newVal;
    });
  };

  const subtractClipsCredits = (delta: {
    autoclip?: number;
    shortGenerator?: number;
  }) => {
    setClipsCredits((prev) => {
      const current = prev ??
        user?.clipsCredits ?? { autoclip: 0, shortGenerator: 0 };
      const newVal = {
        autoclip: Math.max(current.autoclip - (delta.autoclip ?? 0), 0),
        shortGenerator: Math.max(
          current.shortGenerator - (delta.shortGenerator ?? 0),
          0,
        ),
      };
      setUser((u) => (u ? { ...u, clipsCredits: newVal } : u));
      if (globalUser) globalUser = { ...globalUser, clipsCredits: newVal };
      return newVal;
    });
  };

  // ── Bootstrap on mount ──────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const accessToken = await storage.get(ACCESS_TOKEN_KEY);
      const refreshToken = await storage.get(REFRESH_TOKEN_KEY);

      if (!accessToken || !refreshToken) {
        if (user || globalUser) await logout();
        setLoading(false);
        return;
      }

      // Cache hit — same token still valid
      if (globalUser && globalUser.accessToken === accessToken) {
        setUser(globalUser);
        setCurrentPlan(globalUser.currentPlan || "free");
        setPlanPeriod(globalUser.planPeriod || "mensal");
        setIsFreeTrialActive(globalUser.isFreeTrialActive || false);
        setFreeTrialEndDate(globalUser.freeTrialEndDate || "");
        setRegion(globalUser.region || "US");
        setDev(globalUser.dev || false);
        setClipsCredits(
          globalUser.clipsCredits ?? { autoclip: 0, shortGenerator: 0 },
        );
        if (globalCredits) {
          setUserCredits(globalCredits.value);
          setNextRenewalDate(globalCredits.nextRenewal);
        } else {
          await refreshCredits();
        }
        setLoading(false);
        return;
      }

      // Token changed or no cache — refetch
      globalUser = null;
      globalCredits = null;
      setLoading(true);
      await fetchUser();
      setLoading(false);
    })();
  }, []);
  // Note: No window.addEventListener needed — mobile has no multi-tab scenario

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        refreshUser: fetchUser,
        logout,
        userCredits,
        clipsCredits,
        nextRenewalDate,
        refreshCredits,
        subtractCredits,
        subtractClipsCredits,
        isLoadingCredits,
        refreshVideoData,
        currentPlan,
        planPeriod,
        isFreeTrialActive,
        freeTrialEndDate,
        region,
        dev,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside a UserProvider");
  return ctx;
};

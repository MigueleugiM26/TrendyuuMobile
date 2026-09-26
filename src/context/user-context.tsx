import type {
  DecodedToken,
  TotalTemplateData,
  TotalVideoData,
  User,
} from "@/src/types/user";
import { authEvents } from "@/src/utils/auth-events";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const API_BASE_URL = process.env.EXPO_PUBLIC_TRENDYUU_URL_BACK;

// ---------------------------------------------------------------------------
// Module-level cache (survives re-renders, cleared on logout)
// ---------------------------------------------------------------------------
let refreshPromise: Promise<string | null> | null = null;
let globalUser: (User & { accessToken: string }) | null = null;
let globalCredits: { value: number; nextRenewal: Date | null } | null = null;

// ---------------------------------------------------------------------------
// Token helpers
// ---------------------------------------------------------------------------
const refreshAccessToken = async (
  refreshToken: string,
): Promise<string | null> => {
  if (refreshPromise) return refreshPromise;

  refreshPromise = fetch(`${API_BASE_URL}/api/authentication/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: refreshToken }),
  })
    .then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json();
        console.log("Refresh failed:", errorData);
        throw new Error("Refresh token invalid or expired");
      }
      const data = await response.json();
      // AsyncStorage writes are fire-and-forget here; errors logged below
      await Promise.all([
        AsyncStorage.setItem("accessToken", data.access),
        AsyncStorage.setItem("refreshToken", data.refresh),
      ]);
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

// ---------------------------------------------------------------------------
// Context type
// ---------------------------------------------------------------------------
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
  hasUsedDiscount: boolean;
  hasUsedAffiliateCoupon: boolean;
  totalVideoData: TotalVideoData | undefined;
  totalTemplateData: TotalTemplateData | undefined;
  subscriptionCancelAtPeriodEnd: boolean;
  stripeSubscriptionStatus: string;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export const UserProvider = ({ children }: { children: ReactNode }) => {
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
  const [isFreeTrialActive, setIsFreeTrialActive] = useState<boolean>(false);
  const [totalVideoData, setTotalVideoData] = useState<
    TotalVideoData | undefined
  >();
  const [totalTemplateData, setTotalTemplateData] = useState<
    TotalTemplateData | undefined
  >();
  const [freeTrialEndDate, setFreeTrialEndDate] = useState<string>("");
  const [region, setRegion] = useState<string>("US");
  const [dev, setDev] = useState<boolean>(false);
  const [hasUsedDiscount, setHasUsedDiscount] = useState<boolean>(
    globalUser?.hasUsedDiscount ?? false,
  );
  const [hasUsedAffiliateCoupon, setHasUsedAffiliateCoupon] = useState<boolean>(
    globalUser?.hasUsedAffiliateCoupon ?? false,
  );
  const [subscriptionCancelAtPeriodEnd, setSubscriptionCancelAtPeriodEnd] =
    useState<boolean>(globalUser?.subscriptionCancelAtPeriodEnd ?? false);
  const [stripeSubscriptionStatus, setStripeSubscriptionStatus] =
    useState<string>(globalUser?.stripeSubscriptionStatus ?? "");

  const TOKEN_REFRESH_INTERVAL = 3 * 60 * 1000; // 3 minutes
  const TOKEN_EXPIRY_BUFFER = 3 * 60 * 1000;
  const isRefreshingRef = useRef(false);

  // -------------------------------------------------------------------------
  // logout
  // -------------------------------------------------------------------------
  const logout = useCallback(() => {
    // Fire-and-forget; we don't need to await these for UI to update
    AsyncStorage.multiRemove(["accessToken", "refreshToken"]);

    setUser(null);
    setUserCredits(null);
    setClipsCredits(null);
    setCurrentPlan("free");
    setPlanPeriod("mensal");
    setIsFreeTrialActive(false);
    setTotalVideoData(undefined);
    setTotalTemplateData(undefined);
    setFreeTrialEndDate("");
    setNextRenewalDate(null);
    setRegion("US");
    setDev(false);
    setHasUsedDiscount(false);
    setHasUsedAffiliateCoupon(false);
    setSubscriptionCancelAtPeriodEnd(false);
    setStripeSubscriptionStatus("");
    globalUser = null;
    globalCredits = null;
  }, []);

  // -------------------------------------------------------------------------
  // refreshCredits
  // -------------------------------------------------------------------------
  const refreshCredits = useCallback(async () => {
    setIsLoadingCredits(true);
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(
        `${API_BASE_URL}/api/stripe/credits/get_credits/`,
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
  }, []);

  // -------------------------------------------------------------------------
  // fetchUser
  // -------------------------------------------------------------------------
  const fetchUser = useCallback(async () => {
    // AsyncStorage reads are async — key difference from the web version
    let accessToken = await AsyncStorage.getItem("accessToken");
    const refreshToken = await AsyncStorage.getItem("refreshToken");

    if (!accessToken || !refreshToken) {
      logout();
      return;
    }

    try {
      const decoded: DecodedToken = jwtDecode(accessToken);
      const isExpired = decoded.exp * 1000 < Date.now();

      if (isExpired) {
        accessToken = await refreshAccessToken(refreshToken);
        if (!accessToken) {
          logout();
          return;
        }
      }

      const response = await fetch(
        `${API_BASE_URL}/api/authentication/users/${decoded.user_id}`,
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
      setTotalVideoData(data.totalVideoData);
      setTotalTemplateData(data.totalTemplateData);
      setFreeTrialEndDate(data.freeTrialEndDate || "");
      setRegion(data.region || "BR");
      setDev(data.dev || false);
      setHasUsedDiscount(data.hasUsedDiscount ?? false);
      setHasUsedAffiliateCoupon(data.hasUsedAffiliateCoupon ?? false);
      setSubscriptionCancelAtPeriodEnd(
        data.subscriptionCancelAtPeriodEnd ?? false,
      );
      setStripeSubscriptionStatus(data.stripeSubscriptionStatus ?? "");

      if (!globalCredits) await refreshCredits();
    } catch (err) {
      console.error("Error fetching user:", err);
      logout();
    }
  }, [logout, refreshCredits]);

  // -------------------------------------------------------------------------
  // refreshVideoData
  // -------------------------------------------------------------------------
  const refreshVideoData = useCallback(async () => {
    if (!user) return;
    setIsLoadingCredits(true);
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(
        `${API_BASE_URL}/api/authentication/users/${user.id}/partial`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (!response.ok) throw new Error("Failed to fetch data");

      const data = await response.json();
      setTotalVideoData(data.totalVideoData || {});
      setTotalTemplateData(data.totalTemplateData || {});
      setUser((prev) =>
        prev
          ? {
              ...prev,
              totalVideoData: data.totalVideoData || {},
              totalTemplateData: data.totalTemplateData || {},
            }
          : prev,
      );
    } catch (err) {
      console.error("Error fetching video data:", err);
    } finally {
      setIsLoadingCredits(false);
    }
  }, [user]);

  // -------------------------------------------------------------------------
  // subtractCredits / subtractClipsCredits
  // -------------------------------------------------------------------------
  const subtractCredits = useCallback(
    (amount: number) => {
      setUserCredits((prev) => {
        const newVal = prev !== null ? Math.max(prev - amount, 0) : 0;
        globalCredits = { value: newVal, nextRenewal: nextRenewalDate };
        return newVal;
      });
    },
    [nextRenewalDate],
  );

  const subtractClipsCredits = useCallback(
    (delta: { autoclip?: number; shortGenerator?: number }) => {
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
    },
    [user],
  );

  // -------------------------------------------------------------------------
  // Proactive token refresh interval
  // -------------------------------------------------------------------------
  const checkAndRefreshToken = useCallback(async () => {
    const accessToken = await AsyncStorage.getItem("accessToken");
    const refreshToken = await AsyncStorage.getItem("refreshToken");

    if (!accessToken || !refreshToken) return;

    try {
      const decoded: DecodedToken = jwtDecode(accessToken);
      const expiresIn = decoded.exp * 1000 - Date.now();

      if (expiresIn < TOKEN_EXPIRY_BUFFER && !isRefreshingRef.current) {
        isRefreshingRef.current = true;
        const newToken = await refreshAccessToken(refreshToken);
        isRefreshingRef.current = false;

        if (newToken && globalUser) {
          globalUser = { ...globalUser, accessToken: newToken };
          setUser((prev) => (prev ? { ...prev, accessToken: newToken } : prev));
        }
      }
    } catch (error) {
      console.error("Error checking token:", error);
      isRefreshingRef.current = false;
    }
  }, []);

  useEffect(() => {
    checkAndRefreshToken();
    const intervalId = setInterval(
      checkAndRefreshToken,
      TOKEN_REFRESH_INTERVAL,
    );
    return () => clearInterval(intervalId);
  }, [checkAndRefreshToken]);

  // -------------------------------------------------------------------------
  // Initial load
  // -------------------------------------------------------------------------
  useEffect(() => {
    const init = async () => {
      const accessToken = await AsyncStorage.getItem("accessToken");
      const refreshToken = await AsyncStorage.getItem("refreshToken");

      if (!accessToken || !refreshToken) {
        if (user || globalUser) logout();
        setLoading(false);
        return;
      }

      if (globalUser && globalUser.accessToken !== accessToken) {
        globalUser = null;
        globalCredits = null;
      }

      if (globalUser && globalUser.accessToken === accessToken) {
        setUser(globalUser);
        setCurrentPlan(globalUser.currentPlan || "free");
        setPlanPeriod(globalUser.planPeriod || "mensal");
        setIsFreeTrialActive(globalUser.isFreeTrialActive || false);
        setTotalVideoData(globalUser.totalVideoData);
        setTotalTemplateData(globalUser.totalTemplateData);
        setFreeTrialEndDate(globalUser.freeTrialEndDate || "");
        setRegion(globalUser.region || "BR");
        setDev(globalUser.dev || false);
        setHasUsedDiscount(globalUser.hasUsedDiscount ?? false);
        setHasUsedAffiliateCoupon(globalUser.hasUsedAffiliateCoupon ?? false);
        setClipsCredits(
          globalUser.clipsCredits ?? { autoclip: 0, shortGenerator: 0 },
        );
        setSubscriptionCancelAtPeriodEnd(
          globalUser.subscriptionCancelAtPeriodEnd || false,
        );
        setStripeSubscriptionStatus(globalUser.stripeSubscriptionStatus || "");

        if (globalCredits) {
          setUserCredits(globalCredits.value);
          setNextRenewalDate(globalCredits.nextRenewal);
        } else {
          await refreshCredits();
        }

        setLoading(false);
        return;
      }

      setLoading(true);
      await fetchUser();
      setLoading(false);
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------------------------------------------------------------------------
  // Listen for post-login events (replaces window "userLoggedIn" event)
  // Call authEvents.emit("userLoggedIn") after storing tokens on OAuth/login.
  // -------------------------------------------------------------------------
  useEffect(() => {
    const unsubscribe = authEvents.on("userLoggedIn", () => {
      globalUser = null;
      globalCredits = null;
      setLoading(true);
      fetchUser().finally(() => setLoading(false));
    });

    return unsubscribe;
  }, [fetchUser]);

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
        hasUsedDiscount,
        hasUsedAffiliateCoupon,
        totalVideoData,
        totalTemplateData,
        subscriptionCancelAtPeriodEnd,
        stripeSubscriptionStatus,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside a UserProvider");
  return ctx;
};

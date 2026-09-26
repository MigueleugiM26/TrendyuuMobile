import axios from "axios";
import rateLimit from "axios-rate-limit";

// ─── Token cache ──────────────────────────────────────────────────────────────
// AsyncStorage is async, so we can't call it inside a sync interceptor.
// Call setAuthToken(token) right after login, and clearAuthToken() on logout.

let cachedToken: string | null = null;

export function setAuthToken(token: string | null): void {
  cachedToken = token;
}

export function clearAuthToken(): void {
  cachedToken = null;
}

// ─── Axios instance ───────────────────────────────────────────────────────────

const axiosConnection = axios.create({
  baseURL: process.env.EXPO_PUBLIC_TRENDYUU_URL_BACK,
  // withCredentials is a browser/cookie concept — not used in React Native.
  // Auth is handled via the Authorization header below.
  timeout: 600000,
  headers: {
    "Content-Type": "application/json",
  },
});

const axiosInstance = rateLimit(axiosConnection, {
  maxRequests: 5,
  perMilliseconds: 1000,
});

axiosInstance.interceptors.request.use(
  (config) => {
    if (cachedToken) {
      config.headers.Authorization = `Bearer ${cachedToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export default axiosInstance;

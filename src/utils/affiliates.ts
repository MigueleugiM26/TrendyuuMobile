import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AffiliateData {
  code: string;
  capturedAt: number;
  source?: string;
}

export interface AffiliateInfo {
  name: string;
  code: string;
  userDiscount: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const AFFILIATE_KEY = "trendyuu_affiliate";

/**
 * How long we keep the code in AsyncStorage while the user hasn't logged in yet.
 * Once synced to the backend this buffer is cleared automatically.
 */
const BUFFER_DAYS = 7;

// ─── Local capture (pre-login buffer) ─────────────────────────────────────────

/**
 * Called on app launch (e.g. inside your root component or App.tsx).
 * Reads ?ref= or ?affiliate= from the initial deep link URL and saves it
 * to AsyncStorage. If a code is already buffered, it is kept — first touch wins.
 */
export async function captureAffiliateCode(): Promise<void> {
  // Don't overwrite an existing buffered code
  const existing = await getBufferedAffiliateCode();
  if (existing) return;

  try {
    const initialUrl = await Linking.getInitialURL();
    if (!initialUrl) return;

    const parsed = Linking.parse(initialUrl);
    const code =
      (parsed.queryParams?.ref as string) ||
      (parsed.queryParams?.affiliate as string);
    if (!code) return;

    const data: AffiliateData = {
      code,
      capturedAt: Date.now(),
      source: "deep_link",
    };

    await AsyncStorage.setItem(AFFILIATE_KEY, JSON.stringify(data));
  } catch {
    // Storage error or invalid URL — silently ignore
  }
}

/**
 * Call this in your deep-link handler to capture affiliate codes from
 * links opened while the app is already running.
 */
export async function captureAffiliatCodeFromUrl(url: string): Promise<void> {
  const existing = await getBufferedAffiliateCode();
  if (existing) return;

  try {
    const parsed = Linking.parse(url);
    const code =
      (parsed.queryParams?.ref as string) ||
      (parsed.queryParams?.affiliate as string);
    if (!code) return;

    const data: AffiliateData = {
      code,
      capturedAt: Date.now(),
      source: "deep_link",
    };

    await AsyncStorage.setItem(AFFILIATE_KEY, JSON.stringify(data));
  } catch {
    // silently ignore
  }
}

/**
 * Returns the affiliate code currently buffered in AsyncStorage, or null if
 * it doesn't exist / has expired.
 */
export async function getBufferedAffiliateCode(): Promise<string | null> {
  try {
    const raw = await AsyncStorage.getItem(AFFILIATE_KEY);
    if (!raw) return null;

    const data: AffiliateData = JSON.parse(raw);
    const expiresAt = data.capturedAt + BUFFER_DAYS * 24 * 60 * 60 * 1000;

    if (Date.now() > expiresAt) {
      await AsyncStorage.removeItem(AFFILIATE_KEY);
      return null;
    }

    return data.code;
  } catch {
    return null;
  }
}

/** Removes the local buffer (call after a successful backend sync). */
export async function clearBufferedAffiliateCode(): Promise<void> {
  await AsyncStorage.removeItem(AFFILIATE_KEY);
}

// ─── Backend sync ─────────────────────────────────────────────────────────────

/**
 * Syncs the locally buffered affiliate code to the backend.
 *
 * Call this as soon as you know the user is authenticated.
 *
 * Behaviour:
 *  - If there is no buffered code, does nothing.
 *  - POSTs the code to /api/affiliates/set-referral.
 *  - The backend sets the code only if the user has no referral yet.
 *  - On success (or 409 "already has referral"), clears the local buffer.
 */
export async function syncAffiliateCodeToBackend(): Promise<void> {
  const code = await getBufferedAffiliateCode();
  if (!code) return;

  const token = await AsyncStorage.getItem("accessToken");
  if (!token) return;

  try {
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_TRENDYUU_URL_BACK}/api/affiliates/set-referral`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code }),
      }
    );

    // 200 = code was set, 409 = user already had a referral → both are fine
    if (response.ok || response.status === 409) {
      await clearBufferedAffiliateCode();
    }
  } catch (error) {
    // Network error — leave the buffer in place so we can retry next session
    console.error("Failed to sync affiliate code to backend:", error);
  }
}

// ─── Backend read ──────────────────────────────────────────────────────────────

/**
 * Fetches the affiliate info (name, code, user_discount) for the referral
 * linked to the currently authenticated user.
 *
 * Returns null if the user has no referral or the request fails.
 */
export async function getAffiliateInfo(): Promise<AffiliateInfo | null> {
  const token = await AsyncStorage.getItem("accessToken");
  if (!token) return null;

  try {
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_TRENDYUU_URL_BACK}/api/affiliates/my-referral`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    if (data.referral === null) return null;

    return {
      name: data.name,
      code: data.code,
      userDiscount: data.user_discount,
    };
  } catch (error) {
    console.error("Failed to fetch affiliate info:", error);
    return null;
  }
}

// ─── Legacy shim ──────────────────────────────────────────────────────────────

/** @deprecated Use getBufferedAffiliateCode() */
export const getAffiliateCode = getBufferedAffiliateCode;

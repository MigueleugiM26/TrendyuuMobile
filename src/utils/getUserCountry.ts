/**
 * getUserCountry — React Native / Expo version
 *
 * The web version was a Next.js API Route that read Cloudflare/Vercel
 * headers server-side. On mobile we simply call the backend endpoint
 * (which still does the same header inspection) from the client.
 *
 * Usage:
 *   const country = await getUserCountry(); // e.g. "BR", "US"
 */

const FALLBACK_COUNTRY = "BR";

/**
 * Fetches the user's country code from your backend.
 * Falls back to FALLBACK_COUNTRY on any error.
 */
export async function getUserCountry(): Promise<string> {
  try {
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_TRENDYUU_URL_BACK}/api/get-country`
    );

    if (!response.ok) return FALLBACK_COUNTRY;

    const data = await response.json();
    return (data.country as string) || FALLBACK_COUNTRY;
  } catch (error) {
    console.error("Failed to fetch user country:", error);
    return FALLBACK_COUNTRY;
  }
}

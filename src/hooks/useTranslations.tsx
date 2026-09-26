import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

// ─── Translation files ──────────────────────
import ar from "../i18n/ar.json";
import de from "../i18n/de.json";
import en from "../i18n/en.json";
import es from "../i18n/es.json";
import fr from "../i18n/fr.json";
import it from "../i18n/it.json";
import jp from "../i18n/jp.json";
import kr from "../i18n/kr.json";
import pt from "../i18n/pt.json";
import ru from "../i18n/ru.json";

export type Lang =
  | "en"
  | "pt"
  | "es"
  | "fr"
  | "de"
  | "it"
  | "jp"
  | "ar"
  | "kr"
  | "ru";

const STORAGE_KEY = "user-lang-pref";

const messageMap: Record<Lang, Record<string, unknown>> = {
  en,
  pt,
  es,
  fr,
  de,
  it,
  jp,
  ar,
  kr,
  ru,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resolvePath(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object") {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

function interpolate(
  str: string,
  values?: Record<string, string | number>,
): string {
  if (!values) return str;
  return Object.entries(values).reduce(
    (acc, [k, v]) => acc.replace(new RegExp(`\\{${k}\\}`, "g"), String(v)),
    str,
  );
}

// ─── Language Context ─────────────────────────────────────────────────────────

interface LangContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

const LangContext = createContext<LangContextValue>({
  lang: "en",
  setLang: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  // Restore saved language on app launch (replaces reading the cookie on web)
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored && stored in messageMap) {
        setLangState(stored as Lang);
      }
    });
  }, []);

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    AsyncStorage.setItem(STORAGE_KEY, newLang); // persist (replaces setCookie)
  }, []);

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  );
}

// ─── useTranslations  ─────────────────────────────────────

/**
 * const t = useTranslations("Pricing")
 * t("sectionTitle")
 * t("metrics.speed", { count: "10" })
 */
export function useTranslations(namespace?: string) {
  const { lang } = useContext(LangContext);
  const messages = messageMap[lang] ?? messageMap.en;

  const t = useCallback(
    (key: string, values?: Record<string, string | number>): string => {
      const fullKey = namespace ? `${namespace}.${key}` : key;
      const result = resolvePath(messages, fullKey);
      if (typeof result === "string") return interpolate(result, values);
      return fullKey; // visible placeholder when key is missing
    },
    [namespace, lang],
  );

  return t;
}

// ─── useLanguage — mirrors your web hook exactly ──────────────────────────────

/**
 * const { lang, changeLanguage, tRaw } = useLanguage()
 *
 * changeLanguage("pt")            → saves to AsyncStorage, re-renders instantly
 *                                   (no window.location.reload() needed)
 * tRaw("mainPage.faq.items")      → returns raw array / object
 */
export function useLanguage() {
  const { lang, setLang } = useContext(LangContext);
  const messages = messageMap[lang] ?? messageMap.en;

  const changeLanguage = useCallback(
    (newLang: Lang) => {
      setLang(newLang);
    },
    [setLang],
  );

  const tRaw = useCallback(
    (key: string): unknown[] | Record<string, unknown> => {
      try {
        const value = resolvePath(messages, key);
        if (Array.isArray(value) || (value && typeof value === "object")) {
          return value as unknown[] | Record<string, unknown>;
        }
        return [];
      } catch {
        console.warn(`⚠️ tRaw: missing key "${key}"`);
        return [];
      }
    },
    [lang],
  );

  return { lang, changeLanguage, tRaw };
}

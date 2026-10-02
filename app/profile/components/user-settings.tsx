import { UpgradeModalPro } from "@/src/components/layout/modal_upgrade";
import { useUser } from "@/src/context/user-context";
import { useLanguage, useTranslations } from "@/src/hooks/useTranslations";
import { forceUserRefresh, notifyLogout } from "@/src/lib/auth-utils";
import { toastError, toastSuccess } from "@/src/lib/toast";
import { ConnectedAccount } from "@/src/types/user";
import { FontAwesome5 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from "expo-blur";
import * as Crypto from "expo-crypto";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import {
  AlertTriangle,
  BarChart2,
  Bell,
  Building2,
  ChevronDown,
  ChevronRight,
  CreditCard,
  Crown,
  Eye,
  EyeOff,
  Globe,
  Heart,
  Lock,
  LogOut,
  Plus,
  Scissors,
  Trash2,
  User,
  X,
} from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { BrandingTab } from "./settingsTabs/BrandingTab";
import {
  PromotionalCode,
  PromotionalCodesSection,
} from "./settingsTabs/PromotionalCodesSection";
import { UserStatsTab } from "./settingsTabs/UserStatsTab";

const BACKEND = process.env.EXPO_PUBLIC_TRENDYUU_URL_BACK;

// ─── Constants ────────────────────────────────────────────────────────────────

const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", nativeName: "English", flag: "🇺🇸" },
  { code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇧🇷" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italian", nativeName: "Italiano", flag: "🇮🇹" },
  { code: "jp", name: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇦🇪" },
  { code: "kr", name: "Korean", nativeName: "한국어", flag: "🇰🇷" },
  { code: "ru", name: "Russian", nativeName: "Русский", flag: "🇷🇺" },
];

const CANCEL_REASONS = [
  { id: "not_using", labelKey: "cancelReasonNotUsing" },
  { id: "too_expensive", labelKey: "cancelReasonTooExpensive" },
  { id: "missing_features", labelKey: "cancelReasonMissingFeatures" },
  { id: "bugs", labelKey: "cancelReasonBugs" },
  { id: "found_alternative", labelKey: "cancelReasonFoundAlternative" },
  { id: "testing", labelKey: "cancelReasonTesting" },
  { id: "other", labelKey: "cancelReasonOther" },
];

const DELETION_REASONS = [
  { id: "not-editing", labelKey: "deletionReasonNotEditing" },
  { id: "found-alternative", labelKey: "deletionReasonFoundAlternative" },
  { id: "too-expensive", labelKey: "deletionReasonTooExpensive" },
  { id: "missing-features", labelKey: "deletionReasonMissingFeatures" },
  { id: "technical-issues", labelKey: "deletionReasonTechnicalIssues" },
  { id: "hard-to-use", labelKey: "deletionReasonHardToUse" },
  { id: "other", labelKey: "deletionReasonOther" },
];

type SocialPlatform =
  | "youtube"
  | "tiktok"
  | "instagram"
  | "twitter"
  | "facebook"
  | "kwai"
  | "linkedin"
  | "google_drive";

type Tab =
  | "account"
  | "branding"
  | "notifications"
  | "subscription"
  | "language"
  | "nsfw"
  | "stats"
  | "delete";

type DeletePasswordType = "password" | "pin" | "pattern";

type Video = {
  id: string;
  name: string;
  uploader_name: string;
  uploader_pfp: string;
  thumbnail?: string;
  nsfw?: boolean;
  duration: number;
  size: string;
  created_at: number;
  views: number;
  likes: number;
};

// ─── Nav items ────────────────────────────────────────────────────────────────

// Icon colors are resolved at render time based on active/danger state
const NAV_ITEMS: {
  id: Tab;
  icon: (color: string) => React.ReactElement;
  labelKey: string;
}[] = [
  {
    id: "account",
    icon: (c) => <User size={16} color={c} />,
    labelKey: "navAccount",
  },
  {
    id: "branding",
    icon: (c) => <Building2 size={16} color={c} />,
    labelKey: "navBranding",
  },
  {
    id: "notifications",
    icon: (c) => <Bell size={16} color={c} />,
    labelKey: "navNotifications",
  },
  {
    id: "subscription",
    icon: (c) => <CreditCard size={16} color={c} />,
    labelKey: "navSubscription",
  },
  {
    id: "language",
    icon: (c) => <Globe size={16} color={c} />,
    labelKey: "navLanguage",
  },
  {
    id: "stats",
    icon: (c) => <BarChart2 size={16} color={c} />,
    labelKey: "navStats",
  },
  {
    id: "nsfw",
    icon: (c) => <EyeOff size={16} color={c} />,
    labelKey: "navNsfw",
  },
  {
    id: "delete",
    icon: (c) => <Trash2 size={16} color={c} />,
    labelKey: "navDelete",
  },
];

// ─── Platforms ────────────────────────────────────────────────────────────────

const platforms = [
  {
    key: "youtube" as SocialPlatform,
    name: "YouTube",
    color: "#ff0000",
    icon: <FontAwesome5 name="youtube" size={20} color="#ff0000" />,
    comingSoon: false,
  },
  {
    key: "tiktok" as SocialPlatform,
    name: "TikTok",
    color: "#ffffff",
    icon: <FontAwesome5 name="tiktok" size={20} color="#ffffff" />,
    comingSoon: false,
  },
  {
    key: "instagram" as SocialPlatform,
    name: "Instagram",
    color: "#e1306c",
    icon: <FontAwesome5 name="instagram" size={20} color="#e1306c" />,
    comingSoon: false,
  },
  {
    key: "twitter" as SocialPlatform,
    name: "Twitter / X",
    color: "#ffffff",
    icon: (
      <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>𝕏</Text>
    ),
    comingSoon: false,
  },
  {
    key: "facebook" as SocialPlatform,
    name: "Facebook",
    color: "#1877f2",
    icon: <FontAwesome5 name="facebook" size={20} color="#1877f2" />,
    comingSoon: false,
  },
  {
    key: "linkedin" as SocialPlatform,
    name: "LinkedIn",
    color: "#0a66c2",
    icon: <FontAwesome5 name="linkedin" size={20} color="#0a66c2" />,
    comingSoon: false,
  },
  {
    key: "google_drive" as SocialPlatform,
    name: "Google Drive",
    color: "#4285f4",
    icon: <FontAwesome5 name="google-drive" size={20} color="#4285f4" />,
    comingSoon: false,
  },
  {
    key: "kwai" as SocialPlatform,
    name: "Kwai",
    color: "#ffb300",
    icon: <FontAwesome5 name="video" size={20} color="#ffb300" />,
    comingSoon: true,
  },
];

// ─── SettingRow ───────────────────────────────────────────────────────────────

function SettingRow({
  label,
  description,
  value,
  onPress,
  danger,
  children,
}: {
  label: string;
  description?: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={styles.settingRow}
    >
      <View style={styles.settingRowLeft}>
        <Text style={[styles.settingRowLabel, danger && styles.dangerText]}>
          {label}
        </Text>
        {description && (
          <Text style={styles.settingRowDesc}>{description}</Text>
        )}
      </View>
      {children ? (
        <View style={styles.settingRowRight}>{children}</View>
      ) : value ? (
        <Text style={styles.settingRowValue} numberOfLines={1}>
          {value}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function UserSettings() {
  const t = useTranslations("Profile");
  const { lang, changeLanguage } = useLanguage();
  const {
    user,
    loading,
    userCredits,
    clipsCredits,
    isLoadingCredits,
    nextRenewalDate,
    refreshUser,
    logout,
  } = useUser() as any;
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>("account");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [isReactivating, setIsReactivating] = useState(false);
  const [currentLocale, setCurrentLocale] = useState<string>(lang);
  // Keep in sync if lang changes externally (context update after storage read)
  useEffect(() => {
    setCurrentLocale(lang);
  }, [lang]);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [nsfwOption, setNsfwOption] = useState<"No" | "Blurred" | "Yes">("No");
  const [website, setWebsite] = useState("");
  const [initialWebsite, setInitialWebsite] = useState("");
  const [initialName, setInitialName] = useState(user?.name || "");
  const [connectedAccounts, setConnectedAccounts] = useState<
    ConnectedAccount[]
  >([]);
  const [connectingPlatform, setConnectingPlatform] =
    useState<SocialPlatform | null>(null);
  const [disconnectingAccountId, setDisconnectingAccountId] = useState<
    string | null
  >(null);
  const [notificationPrefs, setNotificationPrefs] = useState<
    Record<string, boolean>
  >({});
  const [showAddAccountDialog, setShowAddAccountDialog] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelStep, setCancelStep] = useState<"reason" | "confirm">("reason");
  const [cancelReason, setCancelReason] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteStep, setDeleteStep] = useState<
    "reason" | "password" | "confirm"
  >("reason");
  const [deleteReason, setDeleteReason] = useState<string | null>(null);
  const [confirmString, setConfirmString] = useState("");
  const [confirmInput, setConfirmInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletePasswordInput, setDeletePasswordInput] = useState("");
  const [deletePasswordError, setDeletePasswordError] = useState("");
  const [showDeletePasswordInput, setShowDeletePasswordInput] = useState(false);
  const [hasDeletePassword, setHasDeletePassword] = useState(false);
  const [configuredPasswordType, setConfiguredPasswordType] =
    useState<DeletePasswordType>("password");
  const [deletePasswordDialog, setDeletePasswordDialog] = useState<
    "set" | "change" | "remove" | null
  >(null);
  const [deletePasswordType, setDeletePasswordType] =
    useState<DeletePasswordType>("password");
  const [deletePasswordValue, setDeletePasswordValue] = useState("");
  const [deletePasswordConfirm, setDeletePasswordConfirm] = useState("");
  const [deletePasswordCurrent, setDeletePasswordCurrent] = useState("");
  const [deletePasswordLoading, setDeletePasswordLoading] = useState(false);
  const [showDeletePasswordValue, setShowDeletePasswordValue] = useState(false);
  const [showDeletePasswordConfirm, setShowDeletePasswordConfirm] =
    useState(false);
  const [showDeletePasswordCurrent, setShowDeletePasswordCurrent] =
    useState(false);
  const [promoCodes, setPromoCodes] = useState<PromotionalCode[]>([]);
  const [isLoadingCodes, setIsLoadingCodes] = useState(false);
  const [activePromoTooltip, setActivePromoTooltip] = useState<string | null>(
    null,
  );
  const [videoStates, setVideoStates] = useState<
    Record<
      string,
      { liked: boolean; viewed: boolean; views: number; likes: number }
    >
  >({});

  const NOTIFICATION_TYPES = useMemo(
    () => [
      { key: "videoViews", label: t("videoViews") },
      { key: "videoLikes", label: t("videoLikes") },
      { key: "fileDeletion", label: t("fileDeletion") },
      { key: "fileApproval", label: t("fileApproval") },
      { key: "fileNotApproved", label: t("fileNotApproved") },
      { key: "TemplateViews", label: t("templateViews") },
      { key: "TemplateLikes", label: t("templateLikes") },
      { key: "templateApproval", label: t("templateApproval") },
      { key: "templateNotApproved", label: t("templateNotApproved") },
      { key: "pixPayoutApproved", label: t("pixPayoutApproved") },
      { key: "pixPayoutRejected", label: t("pixPayoutRejected") },
      { key: "visitors", label: t("visitors") },
      { key: "newFeature", label: t("newFeature") },
      { key: "brandingApproval", label: t("brandingApproval") },
      { key: "brandingRejected", label: t("brandingRejected") },
    ],
    [t],
  );

  const VISIBLE_NOTIFICATION_TYPES = useMemo(() => {
    if (user?.region === "BR") return NOTIFICATION_TYPES;
    return NOTIFICATION_TYPES.filter(
      (n) => n.key !== "pixPayoutApproved" && n.key !== "pixPayoutRejected",
    );
  }, [user?.region, NOTIFICATION_TYPES]);

  // ── helpers ────────────────────────────────────────────────────────────────

  function generateRandomString(len = 8) {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let s = "";
    for (let i = 0; i < len; i++)
      s += chars.charAt(Math.floor(Math.random() * chars.length));
    return s;
  }

  async function generateCodeVerifier(length = 64) {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
    let result = "";
    for (let i = 0; i < length; i++)
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    return result;
  }

  async function generateCodeChallenge(verifier: string) {
    // expo-crypto replaces crypto.subtle (not available in RN)
    const digest = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      verifier,
      { encoding: Crypto.CryptoEncoding.BASE64 },
    );
    return digest.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  const getVideoState = (video: Video) =>
    videoStates[video.id] ?? {
      liked: false,
      viewed: false,
      views: video.views,
      likes: video.likes,
    };

  const handleLikeClick = (video: Video) => {
    setVideoStates((prev) => {
      const s = prev[video.id] ?? {
        liked: false,
        viewed: false,
        views: video.views,
        likes: video.likes,
      };
      return {
        ...prev,
        [video.id]: {
          ...s,
          liked: !s.liked,
          likes: s.liked ? s.likes - 1 : s.likes + 1,
        },
      };
    });
  };

  const formatRenewalDate = (date: Date | null) => {
    if (!date) return t("notAvailable");
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const isDataChanged = () =>
    name !== initialName || website !== initialWebsite;

  // ── fetch connected accounts ───────────────────────────────────────────────

  const fetchConnectedAccounts = useCallback(async () => {
    if (!user?.id) return;
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const res = await fetch(`${BACKEND}/api/socials/connected-accounts/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setConnectedAccounts(await res.json());
    } catch {}
  }, [user?.id]);

  // ── effects ────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setInitialName(user.name || "");
      const w = user.socialMediaLinks?.website || "";
      setWebsite(w);
      setInitialWebsite(w);
      fetchConnectedAccounts();
    }
  }, [user, fetchConnectedAccounts]);

  useEffect(() => {
    if (!user?.id) return;
    AsyncStorage.getItem("seeNSFW").then((v) => {
      if (v) setNsfwOption(v as "No" | "Blurred" | "Yes");
    });
    // Load notification prefs
    AsyncStorage.getItem("accessToken").then((token) => {
      fetch(`${BACKEND}/api/video/get-user-config/?key=notificationPrefs`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.value && typeof data.value === "object") {
            setNotificationPrefs(data.value as Record<string, boolean>);
          } else {
            const def: Record<string, boolean> = {};
            VISIBLE_NOTIFICATION_TYPES.forEach((n) => (def[n.key] = true));
            setNotificationPrefs(def);
          }
        })
        .catch(() => {
          const def: Record<string, boolean> = {};
          VISIBLE_NOTIFICATION_TYPES.forEach((n) => (def[n.key] = true));
          setNotificationPrefs(def);
        });
    });
  }, [user?.id]);

  useEffect(() => {
    if (activeTab !== "subscription" || promoCodes.length > 0) return;
    setIsLoadingCodes(true);
    AsyncStorage.getItem("accessToken").then((token) => {
      fetch(`${BACKEND}/api/stripe/get-promotional-codes/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => setPromoCodes(Array.isArray(data) ? data : []))
        .catch(() => setPromoCodes([]))
        .finally(() => setIsLoadingCodes(false));
    });
  }, [activeTab]);

  const loadDeletePasswordStatus = useCallback(async () => {
    if (!user?.id) return;
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const res = await fetch(
        `${BACKEND}/api/authentication/user-password/check`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        },
      );
      if (res.ok) {
        const data = await res.json();
        setHasDeletePassword(Boolean(data.has_password));
        if (data.password_type)
          setConfiguredPasswordType(data.password_type as DeletePasswordType);
      }
    } catch {}
  }, [user?.id]);

  useEffect(() => {
    if (activeTab === "delete") loadDeletePasswordStatus();
  }, [activeTab]);
  useEffect(() => {
    if (deleteOpen) {
      setConfirmString(generateRandomString(8));
      setConfirmInput("");
      setDeletePasswordInput("");
      setDeletePasswordError("");
      setDeleteStep("reason");
      setDeleteReason(null);
      loadDeletePasswordStatus();
    }
  }, [deleteOpen]);
  useEffect(() => {
    if (cancelOpen) {
      setCancelStep("reason");
      setCancelReason(null);
    }
  }, [cancelOpen]);

  // ── actions ────────────────────────────────────────────────────────────────

  const handleNsfwChange = async (option: "No" | "Blurred" | "Yes") => {
    setNsfwOption(option);
    await AsyncStorage.setItem("seeNSFW", option); // replaces document.cookie
  };

  const handleNotificationChange = (type: string, value: boolean) => {
    setNotificationPrefs((prev) => {
      const updated = { ...prev, [type]: value };
      AsyncStorage.getItem("accessToken").then((token) => {
        fetch(`${BACKEND}/api/video/save-user-config/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ key: "notificationPrefs", value: updated }),
        }).catch(() => {});
      });
      return updated;
    });
  };

  const handleLanguageChange = (code: string) => {
    changeLanguage(code as any); // persists via AsyncStorage in useLanguage
    setCurrentLocale(code);
    setShowLangPicker(false);
    const selected = SUPPORTED_LANGUAGES.find((l) => l.code === code);
    toastSuccess(t("languageChanged", { lang: selected?.nativeName ?? "" }));
    // No window.location.reload() needed — RN re-renders on context change
  };

  const handleLogout = () => {
    logout();
    notifyLogout();
    forceUserRefresh();
    router.replace("/");
  };

  const handleApply = async () => {
    if (!user?.id) return;
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const res = await fetch(
        `${BACKEND}/api/authentication/users/${user.id}/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name, socialMediaLinks: { website } }),
        },
      );
      if (!res.ok) throw new Error("Failed");
      toastSuccess("Changes applied successfully!");
      setInitialName(name);
      setInitialWebsite(website);
      setIsEditing(false);
      await refreshUser();
    } catch {
      toastError("Failed to save changes. Please try again.");
    }
  };

  const confirmCancelPlan = async (reason?: string) => {
    if (!user?.email) return;
    setIsCanceling(true);
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const res = await fetch(`${BACKEND}/api/stripe/cancel_sub/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: user.email,
          reason: reason || "Motivo não informado",
        }),
      });
      if (!res.ok) throw new Error("Failed");
      toastSuccess(t("cancelSuccess"));
      setCancelOpen(false);
      await refreshUser();
    } catch {
      toastError(t("cancelError"));
    } finally {
      setIsCanceling(false);
    }
  };

  const handleReactivate = async () => {
    if (!user?.email) return;
    setIsReactivating(true);
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const res = await fetch(`${BACKEND}/api/stripe/reactivate_sub/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: user.email }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed");
      }
      toastSuccess(t("reactivateSuccess"));
      await refreshUser();
    } catch (err: any) {
      toastError(err.message ?? t("reactivateError"));
    } finally {
      setIsReactivating(false);
    }
  };

  const handleDeletePasswordSubmit = async () => {
    setDeletePasswordLoading(true);
    setDeletePasswordError("");
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const baseUrl = `${BACKEND}/api/authentication/user-password`;
      if (deletePasswordDialog === "set" || deletePasswordDialog === "change") {
        if (
          deletePasswordType !== "pattern" &&
          deletePasswordValue !== deletePasswordConfirm
        ) {
          setDeletePasswordError(t("deletePasswordMismatch"));
          return;
        }
        const res = await fetch(
          `${baseUrl}/${deletePasswordDialog === "set" ? "set" : "change"}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(
              deletePasswordDialog === "set"
                ? {
                    password_type: deletePasswordType,
                    password_value: deletePasswordValue,
                  }
                : {
                    current_password: deletePasswordCurrent,
                    password_type: deletePasswordType,
                    password_value: deletePasswordValue,
                  },
            ),
          },
        );
        const data = await res.json().catch(() => ({}));
        if (!res.ok)
          throw new Error(data.detail || t("deletePasswordSaveError"));
        resetDeletePasswordDialog();
        toastSuccess(
          deletePasswordDialog === "set"
            ? t("deletePasswordSaved")
            : t("deletePasswordChanged"),
        );
      } else if (deletePasswordDialog === "remove") {
        const res = await fetch(baseUrl, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ current_password: deletePasswordCurrent }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok)
          throw new Error(data.detail || t("deletePasswordRemoveError"));
        setHasDeletePassword(false);
        resetDeletePasswordDialog();
        toastSuccess(t("deletePasswordRemoved"));
      }
    } catch (err) {
      setDeletePasswordError(
        err instanceof Error ? err.message : t("deletePasswordSaveError"),
      );
    } finally {
      setDeletePasswordLoading(false);
    }
  };

  const resetDeletePasswordDialog = () => {
    setDeletePasswordDialog(null);
    setDeletePasswordValue("");
    setDeletePasswordConfirm("");
    setDeletePasswordCurrent("");
    setDeletePasswordError("");
    setDeletePasswordType("password");
    setShowDeletePasswordCurrent(false);
    setShowDeletePasswordValue(false);
    setShowDeletePasswordConfirm(false);
    setShowDeletePasswordInput(false);
  };

  const handleDeleteAccount = async (reason?: string) => {
    if (!user?.email) return;
    setIsDeleting(true);
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const res = await fetch(`${BACKEND}/api/authentication/deleteaccount`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason,
          password: hasDeletePassword ? deletePasswordInput : undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to delete account");
      await AsyncStorage.multiRemove(["accessToken", "refreshToken"]);
    } catch {
      toastError("Failed to delete account. Please try again.");
    } finally {
      setIsDeleting(false);
      setDeleteOpen(false);
      logout();
      router.replace("/");
    }
  };

  const handleConnectPlatform = async (platform: SocialPlatform) => {
    if (!user?.id) return;
    setConnectingPlatform(platform);
    try {
      const token = await AsyncStorage.getItem("accessToken");
      let queryParams = "";
      if (platform === "tiktok") {
        const verifier = await generateCodeVerifier();
        const challenge = await generateCodeChallenge(verifier);
        await AsyncStorage.setItem("tiktok_code_verifier", verifier); // replaces sessionStorage
        queryParams = `?code_challenge=${challenge}&code_challenge_method=S256`;
      }
      const res = await fetch(
        `${BACKEND}/api/socials/${platform}/connect${queryParams}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      // Open OAuth in in-app browser instead of window.open
      await WebBrowser.openAuthSessionAsync(data.authUrl);
      await fetchConnectedAccounts();
    } catch {
      toastError("Failed to connect account. Please try again.");
    } finally {
      setConnectingPlatform(null);
      setShowAddAccountDialog(false);
    }
  };

  const handleDisconnectPlatform = async (accountId: string) => {
    if (!user?.id) return;
    setDisconnectingAccountId(accountId);
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const res = await fetch(
        `${BACKEND}/api/socials/disconnect/${accountId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) throw new Error("Failed");
      setConnectedAccounts((prev) =>
        prev.filter((acc) => acc.id !== accountId),
      );
      toastSuccess("Account disconnected successfully!");
    } catch {
      toastError("Failed to disconnect account. Please try again.");
    } finally {
      setDisconnectingAccountId(null);
    }
  };

  // ── Tab content ────────────────────────────────────────────────────────────

  const renderContent = () => {
    switch (activeTab) {
      // ── Account ────────────────────────────────────────────────────────────
      case "account":
        return (
          <View style={styles.tabContent}>
            <SectionTitle>{t("accountInformation")}</SectionTitle>
            <View style={styles.card}>
              <SettingRow label={t("email")} value={user.email} />
              <SettingRow
                label={t("nameLabel")}
                value={user.name || t("defaultUser")}
                onPress={() => setIsEditing(true)}
              />
              <SettingRow
                label={t("websiteLabel")}
                value={website || "—"}
                onPress={() => setIsEditing(true)}
              />
              <SettingRow
                label={t("accountRegion")}
                description={t("accountRegionDescription")}
                value={user?.region || "Brasil"}
              />
            </View>

            {isEditing && (
              <View style={styles.editCard}>
                <Text style={styles.editCardTitle}>{t("editInformation")}</Text>
                <View style={styles.fieldWrapper}>
                  <Text style={styles.fieldLabel}>{t("nameLabel")}</Text>
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    style={styles.textInput}
                    placeholderTextColor="#71717a"
                  />
                </View>
                <View style={styles.fieldWrapper}>
                  <Text style={styles.fieldLabel}>{t("websiteLabel")}</Text>
                  <TextInput
                    value={website}
                    onChangeText={setWebsite}
                    placeholder="https://example.com"
                    style={styles.textInput}
                    placeholderTextColor="#71717a"
                    autoCapitalize="none"
                  />
                </View>
                <View style={styles.editActions}>
                  <TouchableOpacity
                    onPress={handleApply}
                    disabled={!isDataChanged()}
                    style={[
                      styles.btnPrimary,
                      !isDataChanged() && styles.btnDisabled,
                    ]}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.btnPrimaryText}>{t("save")}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setName(initialName);
                      setWebsite(initialWebsite);
                      setIsEditing(false);
                    }}
                    style={styles.btnGhost}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.btnGhostText}>{t("cancel")}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View style={styles.sectionHeaderRow}>
              <SectionTitle>{t("connectedAccounts")}</SectionTitle>
              <TouchableOpacity
                onPress={() => setShowAddAccountDialog(true)}
                style={styles.addAccountBtn}
                activeOpacity={0.7}
              >
                <Plus size={14} color="#f472b6" />
                <Text style={styles.addAccountText}>{t("addAccount")}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.card}>
              {connectedAccounts.length === 0 ? (
                <View style={styles.emptyAccounts}>
                  <Text style={styles.emptyAccountsTitle}>
                    {t("noAccountsConnected")}
                  </Text>
                  <Text style={styles.emptyAccountsDesc}>
                    {t("connectSocialsToStart")}
                  </Text>
                </View>
              ) : (
                connectedAccounts.map((account) => {
                  const pInfo = platforms.find(
                    (p) => p.key === account.platform,
                  );
                  if (!pInfo) return null;
                  return (
                    <View key={account.id} style={styles.connectedAccountRow}>
                      <View style={styles.connectedAccountLeft}>
                        {pInfo.icon}
                        <View>
                          <Text style={styles.connectedAccountName}>
                            {pInfo.name}
                          </Text>
                          <Text style={styles.connectedAccountUsername}>
                            @{account.username}
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleDisconnectPlatform(account.id)}
                        disabled={disconnectingAccountId === account.id}
                        activeOpacity={0.7}
                      >
                        {disconnectingAccountId === account.id ? (
                          <ActivityIndicator size="small" color="#71717a" />
                        ) : (
                          <X size={16} color="#71717a" />
                        )}
                      </TouchableOpacity>
                    </View>
                  );
                })
              )}
            </View>
          </View>
        );

      // ── Branding ───────────────────────────────────────────────────────────
      case "branding":
        return <BrandingTab userId={user.id} currentPlan={user.currentPlan} />;

      // ── Notifications ──────────────────────────────────────────────────────
      case "notifications":
        return (
          <View style={styles.tabContent}>
            <SectionTitle>{t("notificationPreferences")}</SectionTitle>
            <View style={styles.card}>
              {VISIBLE_NOTIFICATION_TYPES.map((notif) => {
                const isEnabled = !!notificationPrefs[notif.key];
                return (
                  <View key={notif.key} style={styles.settingRow}>
                    <Text style={styles.settingRowLabel}>{notif.label}</Text>
                    <Switch
                      value={isEnabled}
                      onValueChange={(v) =>
                        handleNotificationChange(notif.key, v)
                      }
                      trackColor={{ false: "#3f3f46", true: "#db2777" }}
                      thumbColor="#fff"
                    />
                  </View>
                );
              })}
            </View>
          </View>
        );

      // ── Subscription ───────────────────────────────────────────────────────
      case "subscription": {
        const isCancelingSubscription =
          user.stripeSubscriptionStatus === "cancel_at_period_end";
        return (
          <View style={styles.tabContent}>
            <SectionTitle>{t("currentPlanTitle")}</SectionTitle>
            <View style={styles.card}>
              <SettingRow label={t("plan")} description={t("managePlan")}>
                <View style={styles.planBadgeRow}>
                  {user.currentPlan !== "free" && (
                    <View
                      style={[
                        styles.planBadge,
                        user.currentPlan === "agency"
                          ? styles.planBadgeRed
                          : user.currentPlan === "creator"
                            ? styles.planBadgeGreen
                            : styles.planBadgeYellow,
                      ]}
                    >
                      <Crown
                        size={12}
                        color={
                          user.currentPlan === "agency"
                            ? "#f87171"
                            : user.currentPlan === "creator"
                              ? "#34d399"
                              : "#fbbf24"
                        }
                      />
                      <Text
                        style={[
                          styles.planBadgeText,
                          user.currentPlan === "agency"
                            ? styles.planBadgeTextRed
                            : user.currentPlan === "creator"
                              ? styles.planBadgeTextGreen
                              : styles.planBadgeTextYellow,
                        ]}
                      >
                        {user.currentPlan === "agency"
                          ? "Agency"
                          : user.currentPlan === "creator"
                            ? "Creator"
                            : "Essential"}
                      </Text>
                    </View>
                  )}
                  {isCancelingSubscription && (
                    <View style={[styles.planBadge, styles.planBadgeRed]}>
                      <AlertTriangle size={12} color="#f87171" />
                      <Text
                        style={[styles.planBadgeText, styles.planBadgeTextRed]}
                      >
                        {t("canceling")}
                      </Text>
                    </View>
                  )}
                  <TouchableOpacity
                    onPress={() => setShowUpgradeModal(true)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.changePlanText}>{t("changePlan")}</Text>
                  </TouchableOpacity>
                </View>
              </SettingRow>
              {nextRenewalDate && user.currentPlan !== "free" && (
                <SettingRow
                  label={
                    isCancelingSubscription
                      ? t("cancelsOn")
                      : t("nextRenewalLabel")
                  }
                  value={formatRenewalDate(nextRenewalDate)}
                />
              )}
              {isCancelingSubscription && (
                <Text style={styles.cancelWarning}>
                  {t("subscriptionWillCancel")}
                </Text>
              )}
              <SettingRow
                label={
                  isCancelingSubscription
                    ? t("reactivateSubscription")
                    : t("cancelSubscription")
                }
                description={
                  isCancelingSubscription
                    ? t("reactivateDescription")
                    : t("cancelAtEndOfPeriod")
                }
                danger={!isCancelingSubscription}
              >
                {isCancelingSubscription ? (
                  <TouchableOpacity
                    onPress={handleReactivate}
                    disabled={isReactivating || isCanceling}
                    activeOpacity={0.7}
                  >
                    {isReactivating ? (
                      <ActivityIndicator size="small" color="#34d399" />
                    ) : (
                      <Text style={styles.reactivateText}>
                        {t("reactivate")}
                      </Text>
                    )}
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={() => setCancelOpen(true)}
                    disabled={
                      user.currentPlan === "free" ||
                      isCanceling ||
                      isReactivating
                    }
                    activeOpacity={0.7}
                  >
                    {isCanceling ? (
                      <ActivityIndicator size="small" color="#f87171" />
                    ) : (
                      <Text style={[styles.dangerText, { fontSize: 14 }]}>
                        {t("cancel")}
                      </Text>
                    )}
                  </TouchableOpacity>
                )}
              </SettingRow>
            </View>
            <PromotionalCodesSection
              promoCodes={promoCodes}
              isLoadingCodes={isLoadingCodes}
              activePromoTooltip={activePromoTooltip}
              setActivePromoTooltip={setActivePromoTooltip}
              backendUrl={BACKEND}
              onCodesChange={setPromoCodes}
            />
          </View>
        );
      }

      // ── Language ───────────────────────────────────────────────────────────
      case "language": {
        // Keep currentLocale in sync with the context value (covers the case
        // where lang changed from another screen or on first mount)
        const selectedLang =
          SUPPORTED_LANGUAGES.find((l) => l.code === currentLocale) ??
          SUPPORTED_LANGUAGES.find((l) => l.code === lang) ??
          SUPPORTED_LANGUAGES[0];
        return (
          <View style={styles.tabContent}>
            <SectionTitle>{t("languageAndRegion")}</SectionTitle>
            <View style={styles.langCard}>
              <Text style={styles.fieldLabel}>{t("language")}</Text>
              <TouchableOpacity
                onPress={() => setShowLangPicker(true)}
                style={styles.langPickerBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.langPickerText}>
                  {selectedLang.flag} {selectedLang.nativeName}
                </Text>
                <ChevronDown size={16} color="#71717a" />
              </TouchableOpacity>
              <Text style={styles.langNote}>{t("progressInfo")}</Text>
              <Text style={[styles.langNote, { color: "#52525b" }]}>
                {t("reloadInfo")}
              </Text>
            </View>

            {/* Language picker modal — Pressable backdrop closes on outside tap */}
            <Modal
              visible={showLangPicker}
              transparent
              animationType="none"
              onRequestClose={() => setShowLangPicker(false)}
            >
              <Pressable
                style={styles.pickerBackdrop}
                onPress={() => setShowLangPicker(false)}
              >
                <Pressable style={styles.pickerSheet} onPress={() => {}}>
                  <ScrollView>
                    {SUPPORTED_LANGUAGES.map((l) => (
                      <TouchableOpacity
                        key={l.code}
                        onPress={() => handleLanguageChange(l.code)}
                        style={[
                          styles.pickerOption,
                          selectedLang.code === l.code &&
                            styles.pickerOptionSelected,
                        ]}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.pickerOptionText}>
                          {l.flag} {l.nativeName}
                        </Text>
                        <Text style={styles.pickerOptionSub}>{l.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </Pressable>
              </Pressable>
            </Modal>
          </View>
        );
      }

      // ── NSFW ───────────────────────────────────────────────────────────────
      case "nsfw": {
        const nsfwMockVideos: Video[] = [
          {
            id: "1",
            name: "Fishing Day!.mp4",
            uploader_name: "Alice",
            uploader_pfp:
              "https://cdn-frontend.trendyuu.com/public/profile_videos_mockup/alice.webp",
            thumbnail:
              "https://cdn-frontend.trendyuu.com/public/profile_videos_mockup/fishingDay.webp",
            nsfw: false,
            duration: 120,
            size: "25MB",
            created_at: Date.now() / 1000,
            views: 230,
            likes: 50,
          },
          {
            id: "2",
            name: "Spicy Content.mp4",
            uploader_name: "Bob",
            uploader_pfp:
              "https://cdn-frontend.trendyuu.com/public/profile_videos_mockup/default-avatar.webp",
            thumbnail:
              "https://cdn-frontend.trendyuu.com/public/profile_videos_mockup/spicyContent.webp",
            nsfw: true,
            duration: 90,
            size: "18MB",
            created_at: Date.now() / 1000 - 86400,
            views: 420,
            likes: 123,
          },
          {
            id: "3",
            name: "Cooking Tips.mp4",
            uploader_name: "ChefMaster",
            uploader_pfp:
              "https://cdn-frontend.trendyuu.com/public/profile_videos_mockup/chefMaster.webp",
            thumbnail:
              "https://cdn-frontend.trendyuu.com/public/profile_videos_mockup/cookingTips.webp",
            nsfw: false,
            duration: 200,
            size: "40MB",
            created_at: Date.now() / 1000 - 172800,
            views: 150,
            likes: 35,
          },
          {
            id: "4",
            name: "Nature Walk.mp4",
            uploader_name: "Traveler",
            uploader_pfp:
              "https://cdn-frontend.trendyuu.com/public/profile_videos_mockup/traveler.webp",
            thumbnail:
              "https://cdn-frontend.trendyuu.com/public/profile_videos_mockup/natureWalk.webp",
            nsfw: false,
            duration: 300,
            size: "60MB",
            created_at: Date.now() / 1000 - 259200,
            views: 600,
            likes: 210,
          },
        ];
        const labels = {
          No: t("hideAll"),
          Blurred: t("blurThumbnail"),
          Yes: t("showAll"),
        };
        const descs = {
          No: t("nsfwHideDesc"),
          Blurred: t("nsfwBlurDesc"),
          Yes: t("nsfwShowDesc"),
        };
        return (
          <View style={styles.tabContent}>
            <SectionTitle>{t("nsfwModeration")}</SectionTitle>
            <View style={styles.card}>
              {(["No", "Blurred", "Yes"] as const).map((opt) => (
                <TouchableOpacity
                  key={opt}
                  onPress={() => handleNsfwChange(opt)}
                  style={styles.nsfwOption}
                  activeOpacity={0.7}
                >
                  <View style={styles.nsfwOptionText}>
                    <Text style={styles.settingRowLabel}>{labels[opt]}</Text>
                    <Text style={styles.settingRowDesc}>{descs[opt]}</Text>
                  </View>
                  <View
                    style={[
                      styles.radioCircle,
                      nsfwOption === opt && styles.radioCircleActive,
                    ]}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Preview gallery */}
            <Text style={styles.fieldLabel}>{t("previewDescription")}</Text>
            <View style={styles.nsfwGrid}>
              {nsfwMockVideos
                .filter((v) => !(v.nsfw && nsfwOption === "No"))
                .map((video) => {
                  const state = getVideoState(video);
                  const isBlurred = video.nsfw && nsfwOption === "Blurred";
                  return (
                    <View key={video.id} style={styles.nsfwCard}>
                      {/* Thumbnail */}
                      {video.thumbnail && (
                        <Image
                          source={{ uri: video.thumbnail }}
                          style={StyleSheet.absoluteFill}
                          resizeMode="cover"
                        />
                      )}

                      {/* BlurView sits on top of the image only, below the UI chips */}
                      {isBlurred && (
                        <BlurView
                          intensity={80}
                          style={StyleSheet.absoluteFill}
                        />
                      )}

                      {/* Uploader chip — top-left, always visible */}
                      <View style={styles.nsfwUploaderChip}>
                        {video.uploader_pfp ? (
                          <Image
                            source={{ uri: video.uploader_pfp }}
                            style={styles.nsfwUploaderAvatar}
                          />
                        ) : (
                          <View style={styles.nsfwUploaderAvatarFallback}>
                            <User size={8} color="#a1a1aa" />
                          </View>
                        )}
                        <Text style={styles.nsfwUploaderName} numberOfLines={1}>
                          {video.uploader_name}
                        </Text>
                      </View>

                      {/* Stats overlay — bottom-right, always visible */}
                      <View style={styles.nsfwOverlay}>
                        <TouchableOpacity
                          onPress={() => handleLikeClick(video)}
                          style={styles.nsfwStat}
                        >
                          <Heart
                            size={11}
                            color={state.liked ? "#ec4899" : "#fff"}
                          />
                          <Text style={styles.nsfwStatText}>{state.likes}</Text>
                        </TouchableOpacity>
                        <View style={styles.nsfwStat}>
                          <Eye size={11} color="#fff" />
                          <Text style={styles.nsfwStatText}>{state.views}</Text>
                        </View>
                      </View>

                      {/* NSFW badge — bottom-left, only in "Yes" mode */}
                      {video.nsfw && nsfwOption === "Yes" && (
                        <View style={styles.nsfwBadge}>
                          <Text style={styles.nsfwBadgeText}>NSFW</Text>
                        </View>
                      )}
                    </View>
                  );
                })}
            </View>
          </View>
        );
      }

      // ── Stats ──────────────────────────────────────────────────────────────
      case "stats":
        return <UserStatsTab userId={user.id} />;

      // ── Delete ─────────────────────────────────────────────────────────────
      case "delete":
        return (
          <View style={styles.tabContent}>
            <SectionTitle>{t("deletePasswordSection")}</SectionTitle>
            <View style={styles.card}>
              <SettingRow
                label={t("deletePasswordTitle")}
                description={
                  hasDeletePassword
                    ? t("deletePasswordConfigured")
                    : t("deletePasswordNotConfigured")
                }
              >
                {hasDeletePassword ? (
                  <View style={{ flexDirection: "row", gap: 12 }}>
                    <TouchableOpacity
                      onPress={() => setDeletePasswordDialog("change")}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.mutedActionText}>
                        {t("changePassword")}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setDeletePasswordDialog("remove")}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.dangerText}>
                        {t("removePassword")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => setDeletePasswordDialog("set")}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.pinkActionText}>
                      {t("addPassword")}
                    </Text>
                  </TouchableOpacity>
                )}
              </SettingRow>
            </View>

            <SectionTitle>{t("dangerZone")}</SectionTitle>
            <View style={[styles.card, styles.dangerCard]}>
              <SettingRow
                label={t("deleteAccountTitle")}
                description={t("deleteAccountDescription")}
                danger
              >
                <TouchableOpacity
                  onPress={() => setDeleteOpen(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dangerText}>{t("delete")}</Text>
                </TouchableOpacity>
              </SettingRow>
            </View>
            <Text style={styles.deleteExtra}>{t("deleteAccountExtra")}</Text>
          </View>
        );
    }
  };

  // ── loading / unauthenticated ──────────────────────────────────────────────

  if (loading)
    return (
      <View style={styles.centeredFill}>
        <ActivityIndicator size="large" color="#ec4899" />
      </View>
    );

  if (!user)
    return (
      <View style={styles.centeredFill}>
        <Text style={styles.unauthText}>{t("notAuthenticated")}</Text>
        <TouchableOpacity
          onPress={() => router.replace("/login")}
          style={styles.btnPrimary}
          activeOpacity={0.8}
        >
          <Text style={styles.btnPrimaryText}>{t("goToLogin")}</Text>
        </TouchableOpacity>
      </View>
    );

  const activeNavItem = NAV_ITEMS.find((n) => n.id === activeTab)!;

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <View style={styles.root}>
        {/* ── Mobile top bar ──────────────────────────────────────────────── */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => router.replace("/dashboard")}
            style={styles.topBarLogo}
            activeOpacity={0.7}
          >
            <Image
              source={{
                uri: "https://cdn-frontend.trendyuu.com/public/logos/logotrend2.webp",
              }}
              style={styles.topBarLogoImg}
              resizeMode="contain"
            />
            <Text style={styles.topBarLogoText}>
              Trend<Text style={styles.logoPink}>Yuu</Text>
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSidebarOpen(true)}
            style={styles.topBarTabBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.topBarTabText}>
              {t(activeNavItem.labelKey)}
            </Text>
            <ChevronRight size={14} color="#71717a" />
          </TouchableOpacity>
        </View>

        {/* ── Main scroll ─────────────────────────────────────────────────── */}
        <ScrollView
          style={styles.mainScroll}
          contentContainerStyle={styles.mainScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.pageTitle}>{t(activeNavItem.labelKey)}</Text>
          {renderContent()}
        </ScrollView>
      </View>

      {/* ── Sidebar drawer ──────────────────────────────────────────────────── */}
      <Modal
        visible={sidebarOpen}
        transparent
        animationType="none"
        onRequestClose={() => setSidebarOpen(false)}
      >
        <Pressable
          style={styles.drawerBackdrop}
          onPress={() => setSidebarOpen(false)}
        >
          <Pressable style={styles.drawer} onPress={() => {}}>
            {/* User mini profile */}
            <View style={styles.drawerProfile}>
              <View style={styles.avatarCircle}>
                {user.image ? (
                  <Image
                    source={{ uri: user.image }}
                    style={styles.avatarImg}
                  />
                ) : (
                  <Scissors size={18} color="#fff" />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.drawerProfileName} numberOfLines={1}>
                  {user.name || t("defaultUser")}
                </Text>
                <Text style={styles.drawerProfileEmail} numberOfLines={1}>
                  {user.email}
                </Text>
              </View>
            </View>

            {/* Credits */}
            <View style={styles.creditsRow}>
              <View style={styles.creditBadgePink}>
                <Text style={styles.creditBadgeTextPink}>
                  {isLoadingCredits ? "…" : `${userCredits ?? 0} AI`}
                </Text>
              </View>
              <View style={styles.creditBadgeBlue}>
                <Text style={styles.creditBadgeTextBlue}>
                  {isLoadingCredits
                    ? "…"
                    : `${clipsCredits?.autoclip ?? 0} Clips`}
                </Text>
              </View>
              <View style={styles.creditBadgePurple}>
                <Text style={styles.creditBadgeTextPurple}>
                  {isLoadingCredits
                    ? "…"
                    : `${clipsCredits?.shortGenerator ?? 0} Shorts`}
                </Text>
              </View>
            </View>

            {/* Nav */}
            <ScrollView style={styles.drawerNav}>
              {NAV_ITEMS.map((item) => {
                const isActive = activeTab === item.id;
                const isDanger = item.id === "delete";
                const iconColor = isDanger
                  ? "rgba(239,68,68,0.8)"
                  : isActive
                    ? "#f472b6"
                    : "#a1a1aa";
                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => {
                      setActiveTab(item.id);
                      setSidebarOpen(false);
                    }}
                    style={[
                      styles.navItem,
                      isActive &&
                        (isDanger
                          ? styles.navItemActiveDanger
                          : styles.navItemActive),
                    ]}
                    activeOpacity={0.7}
                  >
                    <View>{item.icon(iconColor)}</View>
                    <Text
                      style={[
                        styles.navItemText,
                        isActive &&
                          (isDanger
                            ? styles.navItemTextDanger
                            : styles.navItemTextActive),
                        !isActive && isDanger && styles.navItemTextDanger,
                      ]}
                    >
                      {t(item.labelKey)}
                    </Text>
                    {isActive && (
                      <View
                        style={[styles.navDot, isDanger && styles.navDotDanger]}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Logout */}
            <TouchableOpacity
              onPress={handleLogout}
              style={styles.logoutBtn}
              activeOpacity={0.7}
            >
              <LogOut size={16} color="#71717a" />
              <Text style={styles.logoutText}>{t("logout")}</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Cancel Plan Modal ─────────────────────────────────────────────────── */}
      <Modal
        visible={cancelOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setCancelOpen(false)}
      >
        <View style={styles.dialogBackdrop}>
          <View style={styles.dialogSheet}>
            {cancelStep === "reason" ? (
              <>
                <Text style={styles.dialogTitle}>
                  {t("cancelSubscriptionQuestion")}
                </Text>
                <Text style={styles.dialogSubtitle}>
                  {t("cancelReasonPrompt")}
                </Text>
                {CANCEL_REASONS.map((r) => (
                  <TouchableOpacity
                    key={r.id}
                    onPress={() => {
                      setCancelReason(r.id);
                      setCancelStep("confirm");
                    }}
                    style={styles.reasonRow}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.reasonText}>{t(r.labelKey)}</Text>
                    <ChevronRight size={16} color="#71717a" />
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  onPress={() => setCancelOpen(false)}
                  style={styles.btnSecondary}
                  activeOpacity={0.7}
                >
                  <Text style={styles.btnSecondaryText}>{t("back")}</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.dangerIconCircle}>
                  <AlertTriangle size={28} color="#ef4444" />
                </View>
                <Text style={[styles.dialogTitle, styles.dangerText]}>
                  {t("confirmCancellation")}
                </Text>
                <Text style={styles.dialogSubtitle}>
                  {t("subscriptionWillCancel")}
                </Text>
                <TouchableOpacity
                  onPress={() => confirmCancelPlan(cancelReason || undefined)}
                  disabled={isCanceling}
                  style={[styles.btnDanger, isCanceling && styles.btnDisabled]}
                  activeOpacity={0.8}
                >
                  {isCanceling ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.btnDangerText}>{t("cancel")}</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setCancelStep("reason")}
                  style={styles.btnGhost}
                  activeOpacity={0.7}
                >
                  <Text style={styles.btnGhostText}>{t("back")}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* ── Delete Account Modal ──────────────────────────────────────────────── */}
      <Modal
        visible={deleteOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteOpen(false)}
      >
        <View style={styles.dialogBackdrop}>
          <ScrollView contentContainerStyle={styles.dialogSheet}>
            {deleteStep === "reason" ? (
              <>
                <Text style={styles.dialogTitle}>{t("whyDelete")}</Text>
                <Text style={styles.dialogSubtitle}>
                  {t("deleteReasonPrompt")}
                </Text>
                {DELETION_REASONS.map((r) => (
                  <TouchableOpacity
                    key={r.id}
                    onPress={() => {
                      setDeleteReason(r.id);
                      setDeleteStep(hasDeletePassword ? "password" : "confirm");
                    }}
                    style={styles.reasonRow}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.reasonText}>{t(r.labelKey)}</Text>
                    <ChevronRight size={16} color="#71717a" />
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  onPress={() => setDeleteOpen(false)}
                  style={styles.btnSecondary}
                  activeOpacity={0.7}
                >
                  <Text style={styles.btnSecondaryText}>{t("back")}</Text>
                </TouchableOpacity>
              </>
            ) : deleteStep === "password" ? (
              <>
                <Text style={styles.dialogTitle}>
                  {t("enterDeletePassword")}
                </Text>
                <View style={styles.fieldWrapper}>
                  <TextInput
                    value={deletePasswordInput}
                    onChangeText={setDeletePasswordInput}
                    secureTextEntry={!showDeletePasswordInput}
                    style={styles.textInput}
                    placeholderTextColor="#71717a"
                    keyboardType={
                      configuredPasswordType === "pin" ? "numeric" : "default"
                    }
                  />
                  <TouchableOpacity
                    onPress={() => setShowDeletePasswordInput((v) => !v)}
                    style={styles.eyeBtn}
                  >
                    {showDeletePasswordInput ? (
                      <EyeOff size={16} color="#71717a" />
                    ) : (
                      <Eye size={16} color="#71717a" />
                    )}
                  </TouchableOpacity>
                </View>
                {deletePasswordError ? (
                  <Text style={styles.errorText}>{deletePasswordError}</Text>
                ) : null}
                <TouchableOpacity
                  disabled={!deletePasswordInput}
                  onPress={async () => {
                    try {
                      const token = await AsyncStorage.getItem("accessToken");
                      const res = await fetch(
                        `${BACKEND}/api/authentication/user-password/check`,
                        {
                          method: "POST",
                          headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            password_value: deletePasswordInput,
                          }),
                        },
                      );
                      const data = await res.json();
                      if (!res.ok || !data.valid) {
                        setDeletePasswordError(t("deletePasswordIncorrect"));
                        return;
                      }
                      setDeletePasswordError("");
                      setDeleteStep("confirm");
                    } catch {
                      setDeletePasswordError(t("deletePasswordCheckError"));
                    }
                  }}
                  style={[
                    styles.btnDanger,
                    !deletePasswordInput && styles.btnDisabled,
                  ]}
                  activeOpacity={0.8}
                >
                  <Text style={styles.btnDangerText}>{t("continue")}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setDeleteStep("reason")}
                  style={styles.btnGhost}
                  activeOpacity={0.7}
                >
                  <Text style={styles.btnGhostText}>{t("back")}</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.dangerIconCircle}>
                  <AlertTriangle size={28} color="#ef4444" />
                </View>
                <Text style={[styles.dialogTitle, styles.dangerText]}>
                  {t("attention")}
                </Text>
                <Text style={styles.dialogSubtitle}>
                  {t("deleteDescription")}
                </Text>
                <Text style={styles.fieldLabel}>{t("typeCode")}</Text>
                <View style={styles.confirmCodeRow}>
                  <View style={styles.confirmCodeBox}>
                    <Text style={styles.confirmCodeText}>{confirmString}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setConfirmString(generateRandomString(8))}
                    style={styles.confirmCodeRefreshBtn}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.confirmCodeRefreshText}>
                      {t("new")}
                    </Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  value={confirmInput}
                  onChangeText={setConfirmInput}
                  maxLength={8}
                  placeholder={t("typeCodePlaceholder")}
                  placeholderTextColor="#52525b"
                  style={styles.textInput}
                />
                {confirmInput.length > 0 && confirmInput !== confirmString && (
                  <Text style={styles.warnText}>{t("incorrectCode")}</Text>
                )}
                <TouchableOpacity
                  onPress={() => handleDeleteAccount(deleteReason || undefined)}
                  disabled={confirmInput !== confirmString || isDeleting}
                  style={[
                    styles.btnDanger,
                    (confirmInput !== confirmString || isDeleting) &&
                      styles.btnDisabled,
                  ]}
                  activeOpacity={0.8}
                >
                  {isDeleting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.btnDangerText}>
                      {t("deleteAccount")}
                    </Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    setDeleteStep(hasDeletePassword ? "password" : "reason")
                  }
                  style={styles.btnGhost}
                  activeOpacity={0.7}
                >
                  <Text style={styles.btnGhostText}>{t("back")}</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* ── Delete Password Dialog ────────────────────────────────────────────── */}
      <Modal
        visible={!!deletePasswordDialog}
        transparent
        animationType="fade"
        onRequestClose={resetDeletePasswordDialog}
      >
        <View style={styles.dialogBackdrop}>
          <ScrollView contentContainerStyle={styles.dialogSheet}>
            <Text style={styles.dialogTitle}>
              {deletePasswordDialog === "set"
                ? t("addPassword")
                : deletePasswordDialog === "change"
                  ? t("changePassword")
                  : t("removePassword")}
            </Text>
            <Text style={styles.dialogSubtitle}>
              {deletePasswordDialog === "remove"
                ? t("removePasswordDescription")
                : t("deletePasswordDialogDescription")}
            </Text>

            {(deletePasswordDialog === "change" ||
              deletePasswordDialog === "remove") && (
              <View style={styles.fieldWrapper}>
                <Text style={styles.fieldLabel}>{t("currentPassword")}</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    value={deletePasswordCurrent}
                    onChangeText={setDeletePasswordCurrent}
                    secureTextEntry={!showDeletePasswordCurrent}
                    style={[styles.textInput, { flex: 1 }]}
                    placeholderTextColor="#71717a"
                    keyboardType={
                      configuredPasswordType === "pin" ? "numeric" : "default"
                    }
                  />
                  <TouchableOpacity
                    onPress={() => setShowDeletePasswordCurrent((v) => !v)}
                    style={styles.eyeBtn}
                  >
                    {showDeletePasswordCurrent ? (
                      <EyeOff size={16} color="#71717a" />
                    ) : (
                      <Eye size={16} color="#71717a" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {deletePasswordDialog !== "remove" && (
              <>
                <View style={styles.fieldWrapper}>
                  <Text style={styles.fieldLabel}>{t("passwordType")}</Text>
                  {/* HTML <select> → TouchableOpacity that cycles through options */}
                  {(["password", "pin", "pattern"] as DeletePasswordType[]).map(
                    (type) => (
                      <TouchableOpacity
                        key={type}
                        onPress={() => {
                          setDeletePasswordType(type);
                          setDeletePasswordValue("");
                          setDeletePasswordConfirm("");
                        }}
                        style={[
                          styles.typeOption,
                          deletePasswordType === type &&
                            styles.typeOptionActive,
                        ]}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.typeOptionText,
                            deletePasswordType === type &&
                              styles.typeOptionTextActive,
                          ]}
                        >
                          {type === "password"
                            ? t("passwordTypePassword")
                            : type === "pin"
                              ? t("passwordTypePin")
                              : t("passwordTypePattern")}
                        </Text>
                      </TouchableOpacity>
                    ),
                  )}
                </View>
                <View style={styles.fieldWrapper}>
                  <Text style={styles.fieldLabel}>{t("newPassword")}</Text>
                  <View style={styles.inputRow}>
                    <TextInput
                      value={deletePasswordValue}
                      onChangeText={setDeletePasswordValue}
                      secureTextEntry={!showDeletePasswordValue}
                      style={[styles.textInput, { flex: 1 }]}
                      placeholderTextColor="#71717a"
                      keyboardType={
                        deletePasswordType === "pin" ? "numeric" : "default"
                      }
                    />
                    <TouchableOpacity
                      onPress={() => setShowDeletePasswordValue((v) => !v)}
                      style={styles.eyeBtn}
                    >
                      {showDeletePasswordValue ? (
                        <EyeOff size={16} color="#71717a" />
                      ) : (
                        <Eye size={16} color="#71717a" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
                {deletePasswordType !== "pattern" && (
                  <View style={styles.fieldWrapper}>
                    <Text style={styles.fieldLabel}>
                      {t("confirmPassword")}
                    </Text>
                    <View style={styles.inputRow}>
                      <TextInput
                        value={deletePasswordConfirm}
                        onChangeText={setDeletePasswordConfirm}
                        secureTextEntry={!showDeletePasswordConfirm}
                        style={[styles.textInput, { flex: 1 }]}
                        placeholderTextColor="#71717a"
                        keyboardType={
                          deletePasswordType === "pin" ? "numeric" : "default"
                        }
                      />
                      <TouchableOpacity
                        onPress={() => setShowDeletePasswordConfirm((v) => !v)}
                        style={styles.eyeBtn}
                      >
                        {showDeletePasswordConfirm ? (
                          <EyeOff size={16} color="#71717a" />
                        ) : (
                          <Eye size={16} color="#71717a" />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </>
            )}

            {deletePasswordError ? (
              <Text style={styles.errorText}>{deletePasswordError}</Text>
            ) : null}
            <TouchableOpacity
              onPress={handleDeletePasswordSubmit}
              disabled={deletePasswordLoading}
              style={[
                styles.btnPrimary,
                deletePasswordLoading && styles.btnDisabled,
              ]}
              activeOpacity={0.8}
            >
              {deletePasswordLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.btnPrimaryText}>{t("save")}</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={resetDeletePasswordDialog}
              style={styles.btnGhost}
              activeOpacity={0.7}
            >
              <Text style={styles.btnGhostText}>{t("cancel")}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* ── Add Account Modal ─────────────────────────────────────────────────── */}
      <Modal
        visible={showAddAccountDialog}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddAccountDialog(false)}
      >
        <View style={styles.dialogBackdrop}>
          <View style={styles.dialogSheet}>
            <Text style={styles.dialogTitle}>{t("connectAccountTitle")}</Text>
            <View style={styles.platformGrid}>
              {platforms.map(({ key, icon, name, comingSoon }) => (
                <View key={key} style={{ width: "48%" }}>
                  <TouchableOpacity
                    onPress={() => {
                      if (!comingSoon) handleConnectPlatform(key);
                    }}
                    disabled={comingSoon || connectingPlatform === key}
                    style={[
                      styles.platformBtn,
                      comingSoon && styles.platformBtnDisabled,
                    ]}
                    activeOpacity={0.7}
                  >
                    {icon}
                    <Text style={styles.platformBtnText}>{name}</Text>
                    {connectingPlatform === key && (
                      <ActivityIndicator size="small" color="#ec4899" />
                    )}
                  </TouchableOpacity>
                  {comingSoon && (
                    <View style={styles.comingSoonOverlay}>
                      <Lock size={14} color="#ec4899" />
                      <Text style={styles.comingSoonText}>Em breve</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
            <TouchableOpacity
              onPress={() => setShowAddAccountDialog(false)}
              style={styles.btnGhost}
              activeOpacity={0.7}
            >
              <Text style={styles.btnGhostText}>{t("cancel")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <UpgradeModalPro
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#09090b" },
  centeredFill: {
    flex: 1,
    backgroundColor: "#09090b",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  unauthText: { color: "#f4f4f5", fontSize: 16 },

  // Top bar
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(39,39,42,0.6)",
    backgroundColor: "rgba(9,9,11,0.95)",
  },
  topBarLogo: { flexDirection: "row", alignItems: "center", gap: 8 },
  topBarLogoImg: { width: 28, height: 28 },
  topBarLogoText: { fontSize: 16, fontWeight: "700", color: "#fff" },
  logoPink: { color: "#ec4899" },
  topBarTabBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  topBarTabText: { fontSize: 12, color: "#71717a" },

  // Main scroll
  mainScroll: { flex: 1 },
  mainScrollContent: { padding: 20, paddingBottom: 40 },
  pageTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#f4f4f5",
    marginBottom: 20,
  },

  // Drawer
  drawerBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    flexDirection: "row",
  },
  drawer: {
    width: 260,
    backgroundColor: "#09090b",
    borderRightWidth: 1,
    borderRightColor: "#27272a",
    paddingBottom: 24,
  },
  drawerProfile: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#27272a",
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#db2777",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImg: { width: 36, height: 36, borderRadius: 18 },
  drawerProfileName: { fontSize: 13, fontWeight: "600", color: "#f4f4f5" },
  drawerProfileEmail: { fontSize: 11, color: "#71717a" },
  creditsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#27272a",
  },
  creditBadgePink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(236,72,153,0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  creditBadgeTextPink: { fontSize: 10, fontWeight: "700", color: "#f472b6" },
  creditBadgeBlue: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(59,130,246,0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  creditBadgeTextBlue: { fontSize: 10, fontWeight: "700", color: "#60a5fa" },
  creditBadgePurple: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(168,85,247,0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  creditBadgeTextPurple: { fontSize: 10, fontWeight: "700", color: "#c084fc" },
  drawerNav: { flex: 1, paddingHorizontal: 8, paddingTop: 8 },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 2,
  },
  navItemActive: { backgroundColor: "rgba(236,72,153,0.15)" },
  navItemActiveDanger: { backgroundColor: "rgba(239,68,68,0.15)" },
  navItemText: { fontSize: 13, color: "#a1a1aa", flex: 1 },
  navItemTextActive: { color: "#f472b6" },
  navItemTextDanger: { color: "rgba(239,68,68,0.8)" },
  navDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#ec4899" },
  navDotDanger: { backgroundColor: "#ef4444" },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderTopWidth: 1,
    borderTopColor: "#27272a",
    marginTop: 8,
  },
  logoutText: { fontSize: 13, color: "#71717a" },

  // Tab content
  tabContent: { gap: 16 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#71717a",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 8,
  },

  // Card
  card: {
    backgroundColor: "rgba(24,24,27,0.5)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(39,39,42,0.6)",
    overflow: "hidden",
  },
  dangerCard: { borderColor: "rgba(239,68,68,0.2)" },

  // Setting row
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(39,39,42,0.6)",
  },
  settingRowLeft: { flex: 1, paddingRight: 12 },
  settingRowLabel: { fontSize: 14, fontWeight: "500", color: "#f4f4f5" },
  settingRowDesc: {
    fontSize: 12,
    color: "#71717a",
    marginTop: 2,
    lineHeight: 18,
  },
  settingRowRight: { maxWidth: "50%" },
  settingRowValue: { fontSize: 13, color: "#a1a1aa", maxWidth: 160 },
  dangerText: { color: "#f87171", fontSize: 13, fontWeight: "500" },

  // Edit card
  editCard: {
    backgroundColor: "rgba(24,24,27,0.7)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#3f3f46",
    padding: 16,
    gap: 12,
  },
  editCardTitle: { fontSize: 13, fontWeight: "600", color: "#d4d4d8" },
  editActions: { flexDirection: "row", gap: 8, marginTop: 4 },

  // Section header row
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  addAccountBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  addAccountText: { fontSize: 12, color: "#f472b6" },

  // Connected accounts
  emptyAccounts: { padding: 24, alignItems: "center" },
  emptyAccountsTitle: { fontSize: 13, color: "#71717a" },
  emptyAccountsDesc: { fontSize: 11, color: "#52525b", marginTop: 4 },
  connectedAccountRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(39,39,42,0.6)",
  },
  connectedAccountLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  connectedAccountName: { fontSize: 13, fontWeight: "600", color: "#f4f4f5" },
  connectedAccountUsername: { fontSize: 11, color: "#71717a" },

  // Plan badges
  planBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  planBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  planBadgeRed: { backgroundColor: "rgba(239,68,68,0.2)" },
  planBadgeGreen: { backgroundColor: "rgba(52,211,153,0.2)" },
  planBadgeYellow: { backgroundColor: "rgba(251,191,36,0.2)" },
  planBadgeText: { fontSize: 11, fontWeight: "700" },
  planBadgeTextRed: { color: "#f87171" },
  planBadgeTextGreen: { color: "#34d399" },
  planBadgeTextYellow: { color: "#fbbf24" },
  changePlanText: { fontSize: 13, color: "#f472b6" },
  cancelWarning: {
    fontSize: 13,
    color: "#fbbf24",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  reactivateText: { fontSize: 13, color: "#34d399" },

  // Language
  langCard: {
    backgroundColor: "rgba(24,24,27,0.5)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(39,39,42,0.6)",
    overflow: "hidden",
    padding: 16,
    gap: 8,
  },
  langPickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#27272a",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#3f3f46",
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
  },
  langPickerText: { fontSize: 14, color: "#fff" },
  langNote: { fontSize: 11, color: "#f87171", marginTop: 4 },

  // NSFW
  nsfwOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(39,39,42,0.6)",
  },
  nsfwOptionText: { flex: 1, paddingRight: 12 },
  radioCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#52525b",
  },
  radioCircleActive: { backgroundColor: "#db2777", borderColor: "#db2777" },
  nsfwGrid: { flexDirection: "row", flexWrap: "wrap", gap: 4 },

  nsfwUploaderChip: {
    position: "absolute",
    top: 4,
    left: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderRadius: 9999,
    maxWidth: "70%",
  },
  nsfwUploaderAvatar: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  nsfwUploaderAvatarFallback: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#3f3f46",
    alignItems: "center",
    justifyContent: "center",
  },
  nsfwUploaderName: {
    fontSize: 9,
    color: "#fff",
    flexShrink: 1,
  },
  nsfwCard: {
    width: "48%",
    aspectRatio: 1,
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: "#27272a",
    position: "relative",
  },
  nsfwOverlay: {
    position: "absolute",
    bottom: 4,
    right: 4,
    flexDirection: "row",
    gap: 4,
  },
  nsfwStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  nsfwStatText: { color: "#fff", fontSize: 10 },
  nsfwBadge: {
    position: "absolute",
    bottom: 4,
    left: 4,
    backgroundColor: "rgba(239,68,68,0.8)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  nsfwBadgeText: { color: "#fee2e2", fontSize: 9, fontWeight: "700" },

  // Delete tab
  mutedActionText: { fontSize: 13, color: "#d4d4d8" },
  pinkActionText: { fontSize: 13, color: "#f472b6", fontWeight: "600" },
  deleteExtra: { fontSize: 11, color: "#3f3f46", paddingHorizontal: 4 },

  // Fields
  fieldWrapper: { gap: 4, marginBottom: 8 },
  fieldLabel: { fontSize: 12, color: "#d4d4d8", marginBottom: 4 },
  textInput: {
    backgroundColor: "#27272a",
    borderWidth: 1,
    borderColor: "#3f3f46",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#fff",
    fontSize: 14,
  },
  inputRow: { flexDirection: "row", alignItems: "center" },
  eyeBtn: { padding: 8 },
  errorText: { fontSize: 12, color: "#f87171" },
  warnText: { fontSize: 12, color: "#fbbf24" },

  // Password type selector
  typeOption: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#3f3f46",
    marginBottom: 4,
  },
  typeOptionActive: {
    borderColor: "#ec4899",
    backgroundColor: "rgba(236,72,153,0.1)",
  },
  typeOptionText: { fontSize: 13, color: "#a1a1aa" },
  typeOptionTextActive: { color: "#f472b6" },

  // Buttons
  btnPrimary: {
    backgroundColor: "#db2777",
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPrimaryText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  btnSecondary: {
    backgroundColor: "#27272a",
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 4,
  },
  btnSecondaryText: { color: "#f4f4f5", fontWeight: "600", fontSize: 14 },
  btnGhost: { paddingVertical: 13, alignItems: "center", marginTop: 4 },
  btnGhostText: { color: "#71717a", fontSize: 14 },
  btnDanger: {
    backgroundColor: "#ef4444",
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  btnDangerText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  btnDisabled: { opacity: 0.4 },

  // Dialogs
  dialogBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  dialogSheet: {
    width: "100%",
    maxWidth: 480,
    backgroundColor: "rgba(24,24,27,0.97)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#27272a",
    padding: 20,
    gap: 12,
  },
  dialogTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },
  dialogSubtitle: {
    fontSize: 13,
    color: "#a1a1aa",
    textAlign: "center",
    marginBottom: 4,
  },
  reasonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#27272a",
  },
  reasonText: { fontSize: 14, color: "#f4f4f5" },
  dangerIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(239,68,68,0.2)",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },

  // Confirm code
  confirmCodeRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  confirmCodeBox: {
    flex: 1,
    backgroundColor: "#09090b",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#3f3f46",
    paddingVertical: 10,
    alignItems: "center",
  },
  confirmCodeText: {
    fontFamily: "monospace",
    fontSize: 16,
    letterSpacing: 4,
    color: "#f472b6",
  },
  confirmCodeRefreshBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: "#27272a",
  },
  confirmCodeRefreshText: { fontSize: 12, color: "#a1a1aa" },

  // Platform grid
  platformGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  platformBtn: {
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#27272a",
    backgroundColor: "#18181b",
  },
  platformBtnDisabled: { opacity: 0.4 },
  platformBtnText: { fontSize: 12, fontWeight: "600", color: "#fff" },
  comingSoonOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    gap: 4,
  } as any,
  comingSoonText: { fontSize: 11, fontWeight: "700", color: "#fff" },

  // Picker modal
  pickerBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  pickerSheet: {
    backgroundColor: "#18181b",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: "#27272a",
    maxHeight: "60%",
    paddingVertical: 8,
  },
  pickerOption: { paddingVertical: 14, paddingHorizontal: 20 },
  pickerOptionSelected: { backgroundColor: "rgba(236,72,153,0.1)" },
  pickerOptionText: { fontSize: 15, color: "#f4f4f5" },
  pickerOptionSub: { fontSize: 12, color: "#71717a", marginTop: 2 },

  // Section header row
  sectionHeaderRow_unused: {},
});

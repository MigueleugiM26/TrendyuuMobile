import { useUser } from "@/src/context/user-context";
import { useTranslations } from "@/src/hooks/useTranslations";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Bell } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DeletionFile {
  name: string;
  type: string;
}

interface NotificationParams {
  video?: string;
  audio?: string;
  views?: number;
  likes?: number;
  file?: string;
  videos?: DeletionFile[];
  type?: string;
  template?: string;
  brand?: string;
  amount?: number | string;
  weeklySocialViews?: number;
  message?: string;
  [key: string]: unknown;
}

interface Notification {
  id: number;
  notif_type: string;
  params: NotificationParams;
  read: boolean;
  created_at: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const NOTIFICATION_TYPES = [
  { key: "videoViews" },
  { key: "videoLikes" },
  { key: "fileDeletion" },
  { key: "fileApproval" },
  { key: "fileNotApproved" },
  { key: "visitors" },
  { key: "pixPayoutApproved" },
  { key: "pixPayoutRejected" },
  { key: "newFeature" },
  { key: "systemMessage" },
  { key: "TemplateViews" },
  { key: "TemplateLikes" },
  { key: "templateApproval" },
  { key: "templateNotApproved" },
  { key: "brandingApproval" },
  { key: "brandingRejected" },
];

const BASE_URL = process.env.EXPO_PUBLIC_TRENDYUU_URL_BACK;

// ─── Notification text builder ────────────────────────────────────────────────
// Returns { text, boldWord } — on RN we bold the key word inline
// instead of using dangerouslySetInnerHTML

interface NotifContent {
  text: string;
  boldWord?: string;
  color?: string; // override text color for special types
}

function buildContent(
  notif: Notification,
  t: ReturnType<typeof useTranslations>,
): NotifContent {
  switch (notif.notif_type) {
    case "videoViews": {
      const videoName = notif.params.video ?? "";
      const views = notif.params.views ?? 0;
      return {
        text: t("videoViews", { video: videoName, views }),
        boldWord: videoName,
      };
    }
    case "videoLikes": {
      const videoName = notif.params.video ?? "";
      const likes = notif.params.likes ?? 0;
      return {
        text: t("videoLikes", { video: videoName, likes }),
        boldWord: videoName,
      };
    }
    case "fileDeletion": {
      const videos = notif.params.videos ?? [];
      const file = videos.length
        ? videos.map((v) => `${v.name}.${v.type}`).join(", ")
        : (notif.params.file ?? "");
      return { text: t("fileDeletion", { file }), boldWord: file };
    }
    case "fileApproval": {
      const audioName = notif.params.audio ?? "";
      const videoName = notif.params.video ?? "";
      const isAudio = notif.params.type === "mp3";
      const name = isAudio ? audioName : videoName;
      const text = isAudio
        ? t("fileApproval.audio", { audio: audioName })
        : t("fileApproval.video", { video: videoName });
      return { text, boldWord: name };
    }
    case "fileNotApproved": {
      const audioName = notif.params.audio ?? "";
      const videoName = notif.params.video ?? "";
      const isAudio = notif.params.type === "mp3";
      const name = isAudio ? audioName : videoName;
      const text = isAudio
        ? t("fileNotApproved.audio", { audio: audioName })
        : t("fileNotApproved.video", { video: videoName });
      return { text, boldWord: name };
    }
    case "pixPayoutApproved":
      return {
        text: t("pixPayoutApproved", { amount: notif.params.amount ?? 0 }),
      };
    case "pixPayoutRejected":
      return {
        text: t("pixPayoutRejected", { amount: notif.params.amount ?? 0 }),
      };
    case "visitors":
      return {
        text: t("visitors", { visitors: notif.params.weeklySocialViews ?? 0 }),
      };
    case "newFeature":
      return {
        text: t("newFeature", { message: notif.params.message ?? "" }),
        color: "#93c5fd",
      };
    case "systemMessage":
      return {
        text: t("systemMessage", { message: notif.params.message ?? "" }),
        color: "#fef08a",
      };
    case "TemplateViews": {
      const templateName = notif.params.template ?? "";
      const views = notif.params.views ?? 0;
      return {
        text: t("templateViews", { template: templateName, views }),
        boldWord: templateName,
      };
    }
    case "TemplateLikes": {
      const templateName = notif.params.template ?? "";
      const likes = notif.params.likes ?? 0;
      return {
        text: t("templateLikes", { template: templateName, likes }),
        boldWord: templateName,
      };
    }
    case "templateApproval": {
      const templateName = notif.params.template ?? "";
      return {
        text: t("templateApproval", { template: templateName }),
        boldWord: templateName,
      };
    }
    case "templateNotApproved": {
      const templateName = notif.params.template ?? "";
      return {
        text: t("templateNotApproved", { template: templateName }),
        boldWord: templateName,
      };
    }
    case "brandingApproval": {
      const brandName = notif.params.brand ?? "";
      return {
        text: t("brandingApproval", { brand: brandName }),
        boldWord: brandName,
      };
    }
    case "brandingRejected": {
      const brandName = notif.params.brand ?? "";
      return {
        text: t("brandingRejected", { brand: brandName }),
        boldWord: brandName,
      };
    }
    default:
      return { text: JSON.stringify(notif.params) };
  }
}

// ─── NotificationItem ─────────────────────────────────────────────────────────
// Renders text with the boldWord bolded — replaces dangerouslySetInnerHTML

function NotificationItem({
  notif,
  isLast,
  shouldHighlight,
  t,
}: {
  notif: Notification;
  isLast: boolean;
  shouldHighlight: boolean;
  t: ReturnType<typeof useTranslations>;
}) {
  const { text, boldWord, color } = buildContent(notif, t);

  // Split text around boldWord so we can render it bold inline
  const parts = boldWord && boldWord.length > 0 ? text.split(boldWord) : [text];

  const textColor = color
    ? color
    : shouldHighlight
      ? "#f9a8d4" // pink-300
      : "#d4d4d8"; // zinc-300

  return (
    <View>
      <View
        style={[styles.notifRow, shouldHighlight && styles.notifRowHighlight]}
      >
        <Text
          style={[styles.notifText, { color: textColor }]}
          textBreakStrategy="simple"
        >
          {parts.map((part, i) => (
            <Text key={i}>
              {part}
              {i < parts.length - 1 && boldWord ? (
                <Text style={styles.notifBold}>{boldWord}</Text>
              ) : null}
            </Text>
          ))}
        </Text>
      </View>

      {/* Divider between items — mirrors `h-px w-1/2 bg-zinc-800 my-1` */}
      {!isLast && (
        <View style={styles.itemDividerWrapper}>
          <View style={styles.itemDivider} />
        </View>
      )}
    </View>
  );
}

// ─── NotificationMenu ─────────────────────────────────────────────────────────

export function NotificationMenu() {
  const { user } = useUser();
  const t = useTranslations("dashboard.notifications");

  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationPrefs, setNotificationPrefs] = useState<
    Record<string, boolean>
  >({});
  const [displayedAsUnread, setDisplayedAsUnread] = useState<Set<number>>(
    new Set(),
  );

  const prefsFetchedRef = useRef(false);
  const notificationsFetchedRef = useRef(false);

  // ── Fetch prefs (once) ───────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.id || prefsFetchedRef.current) return;
    prefsFetchedRef.current = true;

    const fetchPrefs = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        const res = await fetch(
          `${BASE_URL}/api/video/get-user-config/?key=notificationPrefs`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const data = res.ok ? await res.json() : null;
        if (data?.value && typeof data.value === "object") {
          setNotificationPrefs(data.value as Record<string, boolean>);
        } else {
          const def: Record<string, boolean> = {};
          NOTIFICATION_TYPES.forEach((n) => (def[n.key] = true));
          setNotificationPrefs(def);
        }
      } catch {
        const def: Record<string, boolean> = {};
        NOTIFICATION_TYPES.forEach((n) => (def[n.key] = true));
        setNotificationPrefs(def);
      }
    };

    fetchPrefs();
  }, [user?.id]);

  // ── Fetch notifications ──────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const res = await fetch(
        `${BASE_URL}/api/video/notifications/?user_id=${user.id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!res.ok) throw new Error("Failed to fetch notifications");
      const data = await res.json();

      const filtered = (data.notifications || []).filter(
        (n: Notification) => notificationPrefs[n.notif_type] !== false,
      );
      setNotifications(filtered);

      const unreadIds = new Set<number>(
        filtered
          .filter((n: Notification) => !n.read)
          .map((n: Notification) => n.id),
      );
      setDisplayedAsUnread(unreadIds);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, notificationPrefs]);

  useEffect(() => {
    if (!user?.id || Object.keys(notificationPrefs).length === 0) return;
    if (notificationsFetchedRef.current) return;
    notificationsFetchedRef.current = true;

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user?.id, notificationPrefs, fetchNotifications]);

  // ── Mark all as read ─────────────────────────────────────────────────────
  const markAllAsRead = useCallback(async () => {
    if (!notifications.length || !user?.id) return;
    try {
      const token = await AsyncStorage.getItem("accessToken");
      await fetch(`${BASE_URL}/api/video/notifications/?user_id=${user.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          notification_id: "all",
          user_id: user.id,
          read: true,
        }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("Error marking notifications as read:", err);
    }
  }, [notifications.length, user?.id]);

  const handleOpen = () => {
    setIsOpen(true);
    markAllAsRead();
  };

  const handleClose = () => {
    setIsOpen(false);
    setDisplayedAsUnread(new Set());
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      {/* Bell trigger — mirrors `relative … rounded-md p-2` */}
      <Pressable
        onPress={handleOpen}
        style={styles.trigger}
        accessibilityLabel="Notifications"
      >
        <Bell size={16} color="#d4d4d8" />

        {/* Unread badge — mirrors `absolute -top-1 -right-1 w-5 h-5 bg-pink-500` */}
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {unreadCount > 9 ? "9+" : String(unreadCount)}
            </Text>
          </View>
        )}
      </Pressable>

      {/* Dropdown modal — mirrors `DropdownMenuContent w-80 … bg-zinc-900 border-zinc-800` */}
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
      >
        <Pressable style={styles.backdrop} onPress={handleClose}>
          <Pressable style={styles.panel} onPress={() => {}}>
            {/* Header — mirrors `DropdownMenuLabel … sticky top-0 bg-zinc-900` */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>{t("title")}</Text>
            </View>
            <View style={styles.headerDivider} />

            {/* List — mirrors `max-h-[60vh] sm:max-h-80 overflow-y-auto` */}
            <ScrollView
              style={styles.list}
              showsVerticalScrollIndicator={false}
            >
              {loading ? (
                <View style={styles.centerBox}>
                  <ActivityIndicator color="#ec4899" />
                  <Text style={styles.centerText}>{t("loading")}</Text>
                </View>
              ) : notifications.length === 0 ? (
                <View style={styles.centerBox}>
                  <Text style={styles.centerText}>{t("noNotifications")}</Text>
                </View>
              ) : (
                notifications.map((notif, index) => (
                  <NotificationItem
                    key={notif.id}
                    notif={notif}
                    isLast={index === notifications.length - 1}
                    shouldHighlight={displayedAsUnread.has(notif.id)}
                    t={t}
                  />
                ))
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Bell trigger — mirrors `relative text-zinc-300 hover:text-white rounded-md p-2`
  trigger: {
    padding: 8,
    borderRadius: 6,
    position: "relative",
  },

  // Unread badge — mirrors `absolute -top-1 -right-1 w-5 h-5 p-0 bg-pink-500`
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 99,
    backgroundColor: "#ec4899",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
  },

  // Backdrop
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    // Align to top-right, same as `align="end"` on DropdownMenuContent
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 56, // below header
    paddingRight: 12,
  },

  // Panel — mirrors `w-80 bg-zinc-900 border-zinc-800 rounded-xl`
  panel: {
    width: 320,
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#27272a",
    borderRadius: 12,
    overflow: "hidden",
    maxHeight: "60%",
  },

  // Header — mirrors `DropdownMenuLabel sticky top-0 bg-zinc-900 z-10`
  header: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#18181b",
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  headerDivider: {
    height: 1,
    backgroundColor: "#27272a",
  },

  // Scrollable list — mirrors `max-h-[60vh] sm:max-h-80 overflow-y-auto`
  list: {
    maxHeight: 320,
  },

  // Notification row — mirrors `DropdownMenuItem text-sm py-2 px-3 leading-snug`
  notifRow: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  notifRowHighlight: {
    backgroundColor: "rgba(236,72,153,0.15)",
    borderWidth: 1,
    borderColor: "rgba(236,72,153,0.3)",
    borderRadius: 6,
    marginHorizontal: 4,
    marginVertical: 2,
  },
  notifText: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
    color: "#d4d4d8",
  },
  notifBold: {
    fontWeight: "600",
    color: "#fff",
  },

  // Divider between items — mirrors `h-px w-1/2 bg-zinc-800 my-1`
  itemDividerWrapper: {
    alignItems: "center",
    marginVertical: 4,
  },
  itemDivider: {
    height: 1,
    width: "50%",
    backgroundColor: "#27272a",
  },

  centerBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    gap: 8,
  },
  centerText: {
    fontSize: 14,
    color: "#a1a1aa",
    textAlign: "center",
  },
});

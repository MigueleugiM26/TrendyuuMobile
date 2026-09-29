import { useUser } from "@/src/context/user-context";
import { useTranslations } from "@/src/hooks/useTranslations";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Bell } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface Notification {
  id: number;
  notif_type: string;
  params: Record<string, unknown>;
  read: boolean;
  created_at: string;
}

const BASE = process.env.EXPO_PUBLIC_TRENDYUU_URL_BACK;

async function authHeader() {
  const token = await AsyncStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function NotificationMenu() {
  const t = useTranslations("dashboard.notifications");
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const fetched = useRef(false);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const headers = await authHeader();
      const res = await fetch(
        `${BASE}/api/video/notifications/?user_id=${user.id}`,
        { headers },
      );
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications ?? []);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id || fetched.current) return;
    fetched.current = true;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user?.id, fetchNotifications]);

  async function markAllRead() {
    if (!user?.id || !notifications.length) return;
    try {
      const headers = await authHeader();
      await fetch(`${BASE}/api/video/notifications/?user_id=${user.id}`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          notification_id: "all",
          user_id: user.id,
          read: true,
        }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {}
  }

  function handleOpen() {
    setOpen(true);
    markAllRead();
  }

  const unread = notifications.filter((n) => !n.read).length;

  function renderContent(notif: Notification): string {
    const p = notif.params;
    switch (notif.notif_type) {
      case "videoViews":
        return t("videoViews", { video: p.video ?? "", views: p.views ?? 0 });
      case "videoLikes":
        return t("videoLikes", { video: p.video ?? "", likes: p.likes ?? 0 });
      case "fileDeletion":
        return t("fileDeletion", { file: p.file ?? "" });
      case "visitors":
        return t("visitors", { visitors: p.weeklySocialViews ?? 0 });
      case "newFeature":
        return t("newFeature", { message: p.message ?? "" });
      case "systemMessage":
        return t("systemMessage", { message: p.message ?? "" });
      case "pixPayoutApproved":
        return t("pixPayoutApproved", { amount: p.amount ?? 0 });
      case "pixPayoutRejected":
        return t("pixPayoutRejected", { amount: p.amount ?? 0 });
      default:
        return JSON.stringify(p);
    }
  }

  return (
    <>
      <Pressable onPress={handleOpen} style={styles.btn}>
        <Bell size={20} color="#a1a1aa" />
        {unread > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unread > 9 ? "9+" : unread}</Text>
          </View>
        )}
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
        <View style={styles.panel}>
          <Text style={styles.title}>{t("title")}</Text>
          <ScrollView
            style={{ maxHeight: 400 }}
            showsVerticalScrollIndicator={false}
          >
            {loading ? (
              <Text style={styles.empty}>{t("loading")}</Text>
            ) : notifications.length === 0 ? (
              <Text style={styles.empty}>{t("noNotifications")}</Text>
            ) : (
              notifications.map((n, i) => (
                <View
                  key={n.id}
                  style={[styles.notif, !n.read && styles.notifUnread]}
                >
                  <Text style={styles.notifText}>{renderContent(n)}</Text>
                  {i < notifications.length - 1 && <View style={styles.sep} />}
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "#ec4899",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: { color: "#fff", fontSize: 9, fontWeight: "700" },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  panel: {
    position: "absolute",
    top: 60,
    right: 12,
    width: 300,
    backgroundColor: "#09090b",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#27272a",
    padding: 16,
  },
  title: { fontSize: 14, fontWeight: "600", color: "#fff", marginBottom: 12 },
  empty: {
    fontSize: 13,
    color: "#71717a",
    textAlign: "center",
    paddingVertical: 16,
  },
  notif: { paddingVertical: 10 },
  notifUnread: {
    backgroundColor: "rgba(236,72,153,0.06)",
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  notifText: {
    fontSize: 13,
    color: "#d4d4d8",
    lineHeight: 18,
    textAlign: "center",
  },
  sep: { height: 1, backgroundColor: "#18181b", marginTop: 10 },
});

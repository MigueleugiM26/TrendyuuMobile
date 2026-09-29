import { useUser } from "@/src/context/user-context";
import { useTranslations } from "@/src/hooks/useTranslations";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { usePathname, useRouter } from "expo-router";
import {
  Archive,
  BarChart3,
  Building2,
  CircleDollarSign,
  FolderOpen,
  Gamepad2,
  Globe,
  LayoutGrid,
  MessageCircle,
  Mic,
  Music,
  Plus,
  Speech,
  Video,
  Volume2,
} from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavItem {
  id: string;
  labelKey: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  href: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const CREATE_ITEMS = [
  {
    id: "text-to-video",
    labelKey: "tools.textToVideo",
    icon: Video,
    href: "/ai-tools/text-to-video",
  },
  {
    id: "text-to-image",
    labelKey: "tools.textToImage",
    icon: LayoutGrid,
    href: "/ai-tools/text-to-image",
  },
  {
    id: "smart-image",
    labelKey: "tools.smartImage",
    icon: LayoutGrid,
    href: "/ai-tools/smart-image-generator",
  },
  {
    id: "smart-video",
    labelKey: "tools.smartVideoGenerator",
    icon: Video,
    href: "/ai-tools/smart-video-generator",
  },
  {
    id: "voice-gen",
    labelKey: "tools.voicegenerator",
    icon: Speech,
    href: "/ai-tools/voicegenerator",
  },
  {
    id: "trend-music",
    labelKey: "tools.trendMusic",
    icon: Music,
    href: "/ai-tools/trend-music",
  },
  {
    id: "sound-effects",
    labelKey: "tools.soundEffects",
    icon: Volume2,
    href: "/ai-tools/sound-effects",
  },
  {
    id: "voice-changer",
    labelKey: "tools.voiceChanger",
    icon: Mic,
    href: "/ai-tools/voice-changer",
  },
];

const LIBRARY_ITEMS: NavItem[] = [
  {
    id: "my-projects",
    labelKey: "myProjects",
    icon: FolderOpen,
    href: "/my-projects",
  },
  {
    id: "user-gallery",
    labelKey: "tools.userGallery",
    icon: Archive,
    href: "/user-gallery",
  },
  {
    id: "public-gallery",
    labelKey: "tools.publicGallery",
    icon: Globe,
    href: "/public-gallery",
  },
];

const EXTRA_ITEMS: NavItem[] = [
  {
    id: "studio",
    labelKey: "trendyuuStudio",
    icon: BarChart3,
    href: "/trendyuu-studio",
  },
  {
    id: "affiliates",
    labelKey: "affiliates",
    icon: CircleDollarSign,
    href: "/dashboard/affiliateDashboard",
  },
  {
    id: "brands",
    labelKey: "brands",
    icon: Building2,
    href: "/discover-brands",
  },
  {
    id: "support",
    labelKey: "supportChat",
    icon: MessageCircle,
    href: "/support-chat",
  },
  { id: "games", labelKey: "games", icon: Gamepad2, href: "/minigames" },
];

// ─── Create Sheet ─────────────────────────────────────────────────────────────

function CreateSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const t = useTranslations("dashboard.sidebar");
  const router = useRouter();
  const slideAnim = useRef(new Animated.Value(400)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 0,
        speed: 20,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 400,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  function navigate(href: string) {
    onClose();
    setTimeout(() => router.push(href as any), 220);
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable style={sheet.backdrop} onPress={onClose} />
      <Animated.View
        style={[sheet.panel, { transform: [{ translateY: slideAnim }] }]}
      >
        <SafeAreaView>
          <View style={sheet.handle} />
          <Text style={sheet.title}>{t("create")}</Text>
          <View style={sheet.grid}>
            {CREATE_ITEMS.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => navigate(item.href)}
                style={({ pressed }) => [
                  sheet.gridItem,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <View style={sheet.gridIcon}>
                  <item.icon size={18} color="#ec4899" />
                </View>
                <Text style={sheet.gridLabel}>{t(item.labelKey)}</Text>
              </Pressable>
            ))}
          </View>
        </SafeAreaView>
      </Animated.View>
    </Modal>
  );
}

const sheet = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  panel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#0e0e10",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#3f3f46",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
    paddingVertical: 12,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  gridItem: {
    width: "22%",
    alignItems: "center",
    paddingVertical: 12,
    gap: 6,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  gridIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(236,72,153,0.1)",
    borderWidth: 1,
    borderColor: "rgba(236,72,153,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  gridLabel: {
    fontSize: 9,
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    fontWeight: "500",
  },
});

// ─── More Sheet ───────────────────────────────────────────────────────────────

function MoreSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const t = useTranslations("dashboard.sidebar");
  const router = useRouter();
  const pathname = usePathname();
  const slideAnim = useRef(new Animated.Value(400)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 0,
        speed: 20,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 400,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  function navigate(href: string) {
    onClose();
    setTimeout(() => router.push(href as any), 220);
  }

  const allItems = [...LIBRARY_ITEMS, ...EXTRA_ITEMS];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable style={sheet.backdrop} onPress={onClose} />
      <Animated.View
        style={[sheet.panel, { transform: [{ translateY: slideAnim }] }]}
      >
        <SafeAreaView>
          <View style={sheet.handle} />
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ maxHeight: 480 }}
          >
            {allItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => navigate(item.href)}
                  style={({ pressed }) => [
                    more.item,
                    isActive && more.itemActive,
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <item.icon
                    size={18}
                    color={isActive ? "#ec4899" : "#a1a1aa"}
                  />
                  <Text style={[more.label, isActive && more.labelActive]}>
                    {t(item.labelKey)}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </SafeAreaView>
      </Animated.View>
    </Modal>
  );
}

const more = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.04)",
  },
  itemActive: { backgroundColor: "rgba(236,72,153,0.08)", borderRadius: 12 },
  label: { fontSize: 15, color: "#d4d4d8", fontWeight: "500" },
  labelActive: { color: "#ec4899" },
});

// ─── Bottom Tab Bar ───────────────────────────────────────────────────────────

export function BottomTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [showCreate, setShowCreate] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useUser();
  const t = useTranslations("dashboard.sidebar");

  useEffect(() => {
    if (!user?.id) return;
    async function fetchUnread() {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        const res = await fetch(
          `${process.env.EXPO_PUBLIC_TRENDYUU_URL_BACK}/api/video/get-unread-count`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const data = await res.json();
        if (data.unread_count !== undefined) setUnreadCount(data.unread_count);
      } catch {}
    }
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const tabs = [
    {
      id: "home",
      label: t("dashboard"),
      icon: (active: boolean) => (
        <Image
          source={{
            uri: "https://cdn-frontend.trendyuu.com/public/logos/logotrend2.webp",
          }}
          style={[tab.icon, { opacity: active ? 1 : 0.5 }]}
        />
      ),
      onPress: () => router.push("/dashboard"),
      active: pathname === "/dashboard",
    },
    {
      id: "tools",
      label: t("toolsSection"),
      icon: (active: boolean) => (
        <LayoutGrid size={22} color={active ? "#ec4899" : "#71717a"} />
      ),
      onPress: () => router.push("/ai-tools/text-to-video"),
      active: pathname?.startsWith("/ai-tools"),
    },
    {
      id: "create",
      label: t("create"),
      icon: (_active: boolean) => (
        <View style={tab.plusWrap}>
          <Plus size={22} color="#fff" />
        </View>
      ),
      onPress: () => setShowCreate(true),
      active: false,
    },
    {
      id: "support",
      label: t("supportChat"),
      icon: (active: boolean) => (
        <View>
          <MessageCircle size={22} color={active ? "#ec4899" : "#71717a"} />
          {unreadCount > 0 && (
            <View style={tab.badge}>
              <Text style={tab.badgeText}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </Text>
            </View>
          )}
        </View>
      ),
      onPress: () => router.push("/support-chat"),
      active: pathname === "/support-chat",
    },
    {
      id: "more",
      label: t("moreTools"),
      icon: (active: boolean) => (
        <View style={{ gap: 3 }}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={[
                tab.dot,
                { backgroundColor: active ? "#ec4899" : "#71717a" },
              ]}
            />
          ))}
        </View>
      ),
      onPress: () => setShowMore(true),
      active: false,
    },
  ];

  return (
    <>
      <View style={tab.bar}>
        {tabs.map((t_) => (
          <Pressable
            key={t_.id}
            onPress={t_.onPress}
            style={({ pressed }) => [tab.item, pressed && { opacity: 0.7 }]}
          >
            {t_.icon(t_.active)}
            <Text style={[tab.label, t_.active && tab.labelActive]}>
              {t_.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <CreateSheet visible={showCreate} onClose={() => setShowCreate(false)} />
      <MoreSheet visible={showMore} onClose={() => setShowMore(false)} />
    </>
  );
}

const tab = StyleSheet.create({
  bar: {
    flexDirection: "row",
    backgroundColor: "#09090b",
    borderTopWidth: 1,
    borderTopColor: "#27272a",
    paddingBottom: 20,
    paddingTop: 10,
  },
  item: { flex: 1, alignItems: "center", gap: 4 },
  label: { fontSize: 10, color: "#71717a" },
  labelActive: { color: "#ec4899" },
  icon: { width: 22, height: 22, borderRadius: 11 },
  plusWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#ec4899",
    alignItems: "center",
    justifyContent: "center",
    marginTop: -16,
    shadowColor: "#ec4899",
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -6,
    backgroundColor: "#ec4899",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: { color: "#fff", fontSize: 9, fontWeight: "700" },
  dot: { width: 4, height: 4, borderRadius: 2 },
});

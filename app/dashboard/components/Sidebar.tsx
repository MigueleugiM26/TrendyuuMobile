import { ShortGeneratorIcon } from "@/src/components/icons/ShortGenerator";
import { TextToImageIcon } from "@/src/components/icons/TextToImageIcon";
import { useUser } from "@/src/context/user-context";
import { useTranslations } from "@/src/hooks/useTranslations";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { usePathname, useRouter } from "expo-router";
import {
  Archive,
  Banknote,
  BarChart3,
  Building2,
  CircleDollarSign,
  Clapperboard,
  Film,
  FolderOpen,
  Gamepad2,
  Globe,
  ImagePlay,
  Images,
  LayoutGrid,
  Menu,
  MessageCircle,
  MessagesSquare,
  Mic,
  Mic2,
  MonitorPlay,
  Music,
  Plus,
  Receipt,
  ScanEye,
  Scissors,
  Sparkles,
  Speech,
  SquareDashedMousePointer,
  Video,
  VideoIcon,
  Volume2,
  X,
} from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ChatsModal, type AiChat } from "./ChatsModal";
import { RecentProjects } from "./RecentProjects";

// ─── Inline icons ─────────────────────────────────────────────────────────────

function SmartImageIcon() {
  return (
    <Image
      source={{
        uri: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAACXBIWXMAAAsTAAALEwEAmpwYAAABLUlEQVR4nO2WMU7DQBBFHwV1oEFBgYukoAal4zKUuEiQkADTmCa5ASlSoOQI3CNwAArc0CxaaSxt7LHjDbsWRZ70FcvR/qeZbQxxSCWd0gO+gRw47kp6BMwAI5nJu6g8y5SmlDz22tMasV37U9PBEfCpHNwWO2mBXevU+W8qd97Ixw7SIgtg6MhzmbR8v3fApCw2ATJ01v5Y6p8AP5INuVvwBgyAM2DpIZ4rmzyU37EjHteJrbDg3HPqBzk/kOcX4MCZekMaUqzlVdmEKl6K3EpXge4/BU62iWOmQojSDDiVZF2Jb5XOm7+KM6DfMElCPcmuYq30vaVU667QVnrvKfUWJzUlX55SL3HSUHIBXHtIvcShMf9ebCIm6IdA26yrWriKLF8Dl5p4zx5C8gs4lnJi0hVFswAAAABJRU5ErkJggg==",
      }}
      style={{ width: 16, height: 16, tintColor: "#fff" }}
    />
  );
}

function SmartVideoIcon() {
  return (
    <Image
      source={{
        uri: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAACXBIWXMAAAsTAAALEwEAmpwYAAABFklEQVR4nO2UPW7CQBCFvxClDjQ0oSN9aHEDJVHuwRE4AU4DwVRp4AZwCVJxDuAIWJFoFq00ljbG/NheL1LgSU9refX208yOFopRIHaqZ2ALhEDFFbQMTAElnsq/QjWWKlXM4bm2fwCbhOA5v0g+OALWbR+dAq8zQLUHxhm6rRNjbyJ3flIqh+eAZ8BDqTR+v5+AbxMc2TPa/hU73wd2Yt82WFce15OsfQPctw3WHgI1GTr9/Q08GFX/gaYBt4E3YJkiM7MxXJEegR7we2EuAKo2wJHqwCJHnsxBoAR0jzwghYIjNa8F9m6i1a/Aj8vhKqWoUtkAt4BGygdE2QDn9YHuYOUKvHYAXSWB3wuGr4BOEviu/6k9y1bscVHTQroAAAAASUVORK5CYII=",
      }}
      style={{ width: 16, height: 16, tintColor: "#fff" }}
    />
  );
}

// ─── StartModal ───────────────────────────────────────────────────────────────

const CREATE_ITEMS = [
  {
    id: "shortEditor",
    href: "/short-editor",
    icon: Film,
    label: "shortEditor",
    sub: "shortEditorSub",
    tag: null,
  },
  {
    id: "autoclip",
    href: "/ai-tools/autoclip",
    icon: Scissors,
    label: "autoclip",
    sub: "autoclipSub",
    tag: "IA",
  },
  {
    id: "canvasStudio",
    href: "/canvas",
    icon: SquareDashedMousePointer,
    label: "canvasStudio",
    sub: "canvasStudioSub",
    tag: null,
  },
  {
    id: "trendyuuFlow",
    href: "/ai-tools/trendyuu-flow",
    icon: VideoIcon,
    label: "trendyuuFlow",
    sub: "trendyuuFlowSub",
    tag: null,
  },
  {
    id: "smartVideo",
    href: "/ai-tools/smart-video-generator",
    icon: Sparkles,
    label: "smartVideo",
    sub: "smartVideoSub",
    tag: "IA",
  },
  {
    id: "shortGenerator",
    href: "/ai-tools/short-generator",
    icon: Clapperboard,
    label: "shortGenerator",
    sub: "shortGeneratorSub",
    tag: "IA",
  },
  {
    id: "carouselGenerator",
    href: "/ai-tools/carousel-generator",
    icon: LayoutGrid,
    label: "carouselGenerator",
    sub: "carouselGeneratorSub",
    tag: "IA",
  },
  {
    id: "textToVideo",
    href: "/ai-tools/text-to-video",
    icon: MonitorPlay,
    label: "textToVideo",
    sub: "textToVideoSub",
    tag: "IA",
  },
  {
    id: "voiceGenerator",
    href: "/ai-tools/voicegenerator",
    icon: Mic2,
    label: "voiceGenerator",
    sub: "voiceGeneratorSub",
    tag: "IA",
  },
  {
    id: "smartImage",
    href: "/ai-tools/smart-image-generator",
    icon: ImagePlay,
    label: "smartImage",
    sub: "smartImageSub",
    tag: "IA",
  },
];

function StartModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const t = useTranslations("dashboard.startModal");

  const handlePick = (href: string) => {
    onClose();
    router.push(href as any);
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={startStyles.backdrop} onPress={onClose}>
        <Pressable style={startStyles.card} onPress={() => {}}>
          {/* Header */}
          <View style={startStyles.header}>
            <View>
              <Text style={startStyles.title}>{t("title")}</Text>
              <Text style={startStyles.subtitle}>{t("subtitle")}</Text>
            </View>
            <Pressable onPress={onClose} style={startStyles.closeBtn}>
              <X size={16} color="rgba(255,255,255,0.4)" />
            </Pressable>
          </View>

          <View style={startStyles.divider} />

          {/* 4-col grid */}
          <View style={startStyles.grid}>
            {CREATE_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => handlePick(item.href)}
                  style={({ pressed }) => [
                    startStyles.gridItem,
                    pressed && startStyles.gridItemPressed,
                  ]}
                >
                  <View style={startStyles.iconBox}>
                    <Icon size={16} color="#f472b6" />
                  </View>
                  <View style={startStyles.gridItemMeta}>
                    <Text style={startStyles.gridItemLabel} numberOfLines={2}>
                      {t(item.label)}
                    </Text>
                    {item.tag && (
                      <View style={startStyles.tagBadge}>
                        <Text style={startStyles.tagText}>{item.tag}</Text>
                      </View>
                    )}
                  </View>
                  {item.sub && (
                    <Text style={startStyles.gridItemSub} numberOfLines={2}>
                      {t(item.sub)}
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </View>

          <View style={startStyles.footer}>
            <Text style={startStyles.footerText}>{t("footer")}</Text>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── SidebarProps ─────────────────────────────────────────────────────────────

interface SidebarProps {
  chats?: AiChat[];
  loadingChats?: boolean;
  activeChatId?: string | null;
  onSelectChat?: (chat: AiChat) => void;
  onDeleteChat?: (chatIds: string[]) => void;
  onNewChat?: () => void;
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export function Sidebar({
  chats = [],
  loadingChats = false,
  activeChatId,
  onSelectChat,
  onDeleteChat,
  onNewChat,
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-320)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isOpen ? 0 : -320,
      duration: 280,
      useNativeDriver: true,
    }).start();
  }, [isOpen]);
  const [isProjectsModalOpen, setIsProjectsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isChatsModalOpen, setIsChatsModalOpen] = useState(false);
  const [showAllTools, setShowAllTools] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [payoutsCount, setPayoutsCount] = useState(0);
  const [brandingCount, setBrandingCount] = useState(0);

  const { user } = useUser();
  const t = useTranslations("dashboard.sidebar");
  const router = useRouter();
  const pathname = usePathname();

  // ── Fetch badge counts (same 30s interval as web) ────────────────────────
  useEffect(() => {
    const fetchCounts = async () => {
      if (!user?.id) return;
      const token = await AsyncStorage.getItem("accessToken");
      try {
        const res = await fetch(
          `${process.env.EXPO_PUBLIC_TRENDYUU_URL_BACK}/api/video/get-unread-count`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const data = await res.json();
        if (data.unread_count !== undefined) setUnreadCount(data.unread_count);
        if (data.review_count !== undefined) setReviewCount(data.review_count);
        if (data.payouts_count !== undefined)
          setPayoutsCount(data.payouts_count);
        if (data.branding_count !== undefined)
          setBrandingCount(data.branding_count);
      } catch (e) {
        console.error("Error fetching counts:", e);
      }
    };
    fetchCounts();
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // ── Tools list ────────────────────────────────────────────────────────────
  const tools = [
    {
      id: "text-to-video",
      label: t("tools.textToVideo"),
      icon: Video,
      href: "/ai-tools/text-to-video",
    },
    {
      id: "text-to-image",
      label: t("tools.textToImage"),
      icon: TextToImageIcon,
      href: "/ai-tools/text-to-image",
    },
    {
      id: "canvas",
      label: t("tools.canvas"),
      icon: SquareDashedMousePointer,
      href: "/canvas",
    },
    {
      id: "smart-image",
      label: t("tools.smartImage"),
      icon: SmartImageIcon,
      href: "/ai-tools/smart-image-generator",
    },
    {
      id: "smart-video",
      label: t("tools.smartVideoGenerator"),
      icon: SmartVideoIcon,
      href: "/ai-tools/smart-video-generator",
    },
    {
      id: "short-generator",
      label: t("tools.shortGenerator"),
      icon: ShortGeneratorIcon,
      href: "/ai-tools/short-generator",
    },
    {
      id: "trend-music",
      label: t("tools.trendMusic"),
      icon: Music,
      href: "/ai-tools/trend-music",
    },
    {
      id: "voice-generator",
      label: t("tools.voicegenerator"),
      icon: Speech,
      href: "/ai-tools/voicegenerator",
    },
    {
      id: "sound-effects",
      label: t("tools.soundEffects"),
      icon: Volume2,
      href: "/ai-tools/sound-effects",
    },
    {
      id: "voice-changer",
      label: t("tools.voiceChanger"),
      icon: Mic,
      href: "/ai-tools/voice-changer",
    },
  ];

  const isActiveRoute = (href: string) => {
    const clean = (s: string) => s.replace(/^\//, "");
    const p = clean(pathname ?? "");
    const h = clean(href);
    return p === h || p.startsWith(h + "/");
  };

  const handleNavigation = (href: string) => {
    setIsOpen(false);
    router.push(href as any);
  };

  const handleProjectsClick = () => {
    setIsOpen(false);
    setIsProjectsModalOpen(true);
  };

  const handleCreateClick = () => {
    setIsOpen(false);
    setIsCreateModalOpen(true);
  };

  const handleChatsClick = () => {
    setIsOpen(false);
    setIsChatsModalOpen(true);
  };

  // ── Drawer content ────────────────────────────────────────────────────────
  const DrawerContent = () => (
    <View style={drawerStyles.container}>
      {/* ── Header row (logo + close) */}
      <View style={drawerStyles.headerRow}>
        <Pressable
          style={drawerStyles.logoRow}
          onPress={() => {
            setIsOpen(false);
            router.push("/dashboard" as any);
          }}
        >
          <Image
            source={{
              uri: "https://cdn-frontend.trendyuu.com/public/logos/logotrend2.webp",
            }}
            style={drawerStyles.logoImage}
          />
          <Text style={drawerStyles.logoText}>
            Trend<Text style={drawerStyles.logoAccent}>Yuu</Text>
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setIsOpen(false)}
          style={drawerStyles.closeBtn}
        >
          <X size={20} color="#a1a1aa" />
        </Pressable>
      </View>

      <ScrollView
        style={drawerStyles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── TrendYuu Studio */}
        <NavItem
          icon={
            <BarChart3
              size={16}
              color={isActiveRoute("/trendyuu-studio") ? "#f472b6" : "#e4e4e7"}
            />
          }
          label={t("trendyuuStudio")}
          active={isActiveRoute("/trendyuu-studio")}
          onPress={() => handleNavigation("/trendyuu-studio")}
        />

        {/* ── Create button (mobile gradient, same as web `isMobile` branch) */}
        <View style={drawerStyles.section}>
          <Pressable
            onPress={handleCreateClick}
            style={({ pressed }) => [
              drawerStyles.createBtn,
              pressed && { opacity: 0.85 },
            ]}
          >
            <Plus size={16} color="#fff" />
            <Text style={drawerStyles.createBtnText}>{t("create")}</Text>
          </Pressable>
        </View>

        {/* ── Tools section */}
        <SectionLabel label={t("toolsSection")} />
        {tools.slice(0, showAllTools ? tools.length : 5).map((tool) => {
          const active = isActiveRoute(tool.href);
          const Icon = tool.icon as any;
          return (
            <NavItem
              key={tool.id}
              icon={<Icon size={16} color={active ? "#f472b6" : "#e4e4e7"} />}
              label={tool.label}
              active={active}
              onPress={() => handleNavigation(tool.href)}
            />
          );
        })}
        <NavItem
          icon={<LayoutGrid size={16} color="#71717a" />}
          label={showAllTools ? t("lessTools") : t("moreTools")}
          active={false}
          muted
          onPress={() => setShowAllTools((p) => !p)}
        />

        <Separator />

        {/* ── Library */}
        <SectionLabel label={t("library")} />

        {onSelectChat && chats.length > 0 && (
          <NavItem
            icon={<MessagesSquare size={16} color="#f472b6" />}
            label={t("chats")}
            active={false}
            badge={chats.length > 0 ? String(chats.length) : undefined}
            badgeMuted
            onPress={handleChatsClick}
          />
        )}

        <NavItem
          icon={
            <FolderOpen
              size={16}
              color={isActiveRoute("/my-projects") ? "#f472b6" : "#e4e4e7"}
            />
          }
          label={t("myProjects")}
          active={isActiveRoute("/my-projects")}
          onPress={handleProjectsClick}
        />
        <NavItem
          icon={
            <Archive
              size={16}
              color={isActiveRoute("/user-gallery") ? "#f472b6" : "#a1a1aa"}
            />
          }
          label={t("tools.userGallery")}
          active={isActiveRoute("/user-gallery")}
          onPress={() => handleNavigation("/user-gallery")}
        />
        <NavItem
          icon={
            <Globe
              size={16}
              color={isActiveRoute("/public-gallery") ? "#f472b6" : "#a1a1aa"}
            />
          }
          label={t("tools.publicGallery")}
          active={isActiveRoute("/public-gallery")}
          onPress={() => handleNavigation("/public-gallery")}
        />

        {/* Dev-only items */}
        {user?.dev && (
          <NavItem
            icon={
              <ScanEye
                size={16}
                color={isActiveRoute("/review-videos") ? "#f472b6" : "#e4e4e7"}
              />
            }
            label="Review de Vídeos (Dev)"
            active={isActiveRoute("/review-videos")}
            badge={
              reviewCount > 0
                ? reviewCount > 99
                  ? "99+"
                  : String(reviewCount)
                : undefined
            }
            onPress={() => handleNavigation("/review-videos")}
          />
        )}
        {user?.dev && (
          <NavItem
            icon={
              <Images
                size={16}
                color={isActiveRoute("/all-videos") ? "#f472b6" : "#e4e4e7"}
              />
            }
            label="Todos os vídeos (Dev)"
            active={isActiveRoute("/all-videos")}
            onPress={() => handleNavigation("/all-videos")}
          />
        )}

        <Separator />

        {/* ── Affiliates */}
        <SectionLabel label={t("affiliatesSection")} />
        <NavItem
          icon={
            <CircleDollarSign
              size={16}
              color={
                isActiveRoute("/dashboard/affiliateDashboard")
                  ? "#f472b6"
                  : "#e4e4e7"
              }
            />
          }
          label={t("affiliates")}
          active={isActiveRoute("/dashboard/affiliateDashboard")}
          onPress={() => handleNavigation("/dashboard/affiliateDashboard")}
        />
        <NavItem
          icon={
            <Building2
              size={16}
              color={isActiveRoute("/discover-brands") ? "#f472b6" : "#e4e4e7"}
            />
          }
          label={t("brands")}
          active={isActiveRoute("/discover-brands")}
          onPress={() => handleNavigation("/discover-brands")}
        />

        {user?.dev && (
          <NavItem
            icon={
              <Banknote
                size={16}
                color={isActiveRoute("/review-payouts") ? "#f472b6" : "#e4e4e7"}
              />
            }
            label="Review de Pagamentos (Dev)"
            active={isActiveRoute("/review-payouts")}
            badge={
              payoutsCount > 0
                ? payoutsCount > 99
                  ? "99+"
                  : String(payoutsCount)
                : undefined
            }
            onPress={() => handleNavigation("/review-payouts")}
          />
        )}
        {user?.dev && (
          <NavItem
            icon={
              <Receipt
                size={16}
                color={isActiveRoute("/coupon-manager") ? "#f472b6" : "#e4e4e7"}
              />
            }
            label="Gerenciar Cupons (Dev)"
            active={isActiveRoute("/coupon-manager")}
            onPress={() => handleNavigation("/coupon-manager")}
          />
        )}
        {user?.dev && (
          <NavItem
            icon={
              <ScanEye
                size={16}
                color={
                  isActiveRoute("/review-branding") ? "#f472b6" : "#e4e4e7"
                }
              />
            }
            label="Review de Branding (Dev)"
            active={isActiveRoute("/review-branding")}
            badge={
              brandingCount > 0
                ? brandingCount > 99
                  ? "99+"
                  : String(brandingCount)
                : undefined
            }
            onPress={() => handleNavigation("/review-branding")}
          />
        )}

        <Separator />

        {/* ── Games */}
        <SectionLabel label={t("gameSection")} />
        <NavItem
          icon={
            <Gamepad2
              size={16}
              color={isActiveRoute("/minigames") ? "#f472b6" : "#e4e4e7"}
            />
          }
          label={t("games")}
          active={isActiveRoute("/minigames")}
          onPress={() => handleNavigation("/minigames")}
        />

        <Separator />

        {/* ── Support */}
        <SectionLabel label={t("supportSection")} />
        <NavItem
          icon={
            <MessageCircle
              size={16}
              color={isActiveRoute("/support-chat") ? "#f472b6" : "#e4e4e7"}
            />
          }
          label={t("supportChat")}
          active={isActiveRoute("/support-chat")}
          badge={
            unreadCount > 0
              ? unreadCount > 99
                ? "99+"
                : String(unreadCount)
              : undefined
          }
          onPress={() => handleNavigation("/support-chat")}
        />
      </ScrollView>
    </View>
  );

  return (
    <>
      {/* ── Hamburger button — fixed top-left, same position as web `fixed top-3 left-4` */}
      <Pressable
        onPress={() => setIsOpen(true)}
        style={styles.menuTrigger}
        accessibilityLabel="Abrir menu"
      >
        <Menu size={20} color="#fff" />
        {unreadCount > 0 && (
          <View style={styles.menuBadge}>
            <Text style={styles.menuBadgeText}>
              {unreadCount > 9 ? "9+" : String(unreadCount)}
            </Text>
          </View>
        )}
      </Pressable>

      {/* ── Drawer modal */}
      <Modal
        visible={isOpen}
        transparent
        animationType="none"
        onRequestClose={() => setIsOpen(false)}
      >
        <View style={styles.drawerWrapper}>
          {/* Backdrop */}
          <Pressable
            style={styles.drawerBackdrop}
            onPress={() => setIsOpen(false)}
          />
          {/* Sheet — slides in from left, w-80 = 320px */}
          <Animated.View
            style={[
              styles.drawerSheet,
              { transform: [{ translateX: slideAnim }] },
            ]}
          >
            <DrawerContent />
          </Animated.View>
        </View>
      </Modal>

      {/* ── Projects modal */}
      <Modal
        visible={isProjectsModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsProjectsModalOpen(false)}
      >
        <View style={styles.fullscreenModal}>
          <View style={styles.fullscreenModalCard}>
            <Pressable
              style={styles.fullscreenModalClose}
              onPress={() => setIsProjectsModalOpen(false)}
            >
              <X size={16} color="#a1a1aa" />
            </Pressable>
            <RecentProjects />
          </View>
        </View>
      </Modal>

      {/* ── Create modal */}
      {isCreateModalOpen && (
        <StartModal onClose={() => setIsCreateModalOpen(false)} />
      )}

      {/* ── Chats modal */}
      <ChatsModal
        isOpen={isChatsModalOpen}
        onClose={() => setIsChatsModalOpen(false)}
        chats={chats}
        loading={loadingChats}
        activeChatId={activeChatId}
        onSelectChat={(chat) => onSelectChat?.(chat)}
        onDeleteChat={onDeleteChat}
        onNewChat={onNewChat}
      />
    </>
  );
}

// ─── Small shared sub-components ─────────────────────────────────────────────

function SectionLabel({ label }: { label: string }) {
  return <Text style={drawerStyles.sectionLabel}>{label}</Text>;
}

function Separator() {
  return <View style={drawerStyles.separator} />;
}

function NavItem({
  icon,
  label,
  active,
  muted = false,
  badge,
  badgeMuted = false,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  muted?: boolean;
  badge?: string;
  badgeMuted?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        drawerStyles.navItem,
        active && drawerStyles.navItemActive,
        pressed && drawerStyles.navItemPressed,
      ]}
    >
      {icon}
      <Text
        style={[
          drawerStyles.navItemLabel,
          active && drawerStyles.navItemLabelActive,
          muted && drawerStyles.navItemLabelMuted,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
      {badge && (
        <View
          style={[drawerStyles.badge, badgeMuted && drawerStyles.badgeMuted]}
        >
          <Text style={drawerStyles.badgeText}>{badge}</Text>
        </View>
      )}
    </Pressable>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Hamburger trigger — mirrors `fixed top-3 left-4 z-50 bg-black/80 border border-zinc-800`
  menuTrigger: {
    position: "absolute",
    top: 12,
    left: 16,
    zIndex: 50,
    backgroundColor: "rgba(0,0,0,0.8)",
    borderWidth: 1,
    borderColor: "#27272a",
    borderRadius: 8,
    padding: 8,
  },
  menuBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#ec4899",
    borderRadius: 99,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  menuBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },

  // Drawer wrapper
  drawerWrapper: {
    flex: 1,
    flexDirection: "row",
  },
  drawerBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  // Sheet slides from the left — w-80 = 320px, same as web `w-80`
  drawerSheet: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: 320,
    backgroundColor: "#000",
    borderRightWidth: 1,
    borderRightColor: "#27272a",
  },

  // Full-screen modals (projects)
  fullscreenModal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    padding: 16,
  },
  fullscreenModalCard: {
    backgroundColor: "#09090b",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#27272a",
    maxHeight: "85%",
    padding: 24,
  },
  fullscreenModalClose: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 8,
    borderRadius: 8,
  },
});

const drawerStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(24,24,27,0.7)", // zinc-900/70
  },

  // Header — mirrors `p-4 flex-shrink-0 bg-zinc-900/70`
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "rgba(24,24,27,0.7)",
    flexShrink: 0,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logoImage: {
    width: 40,
    height: 40,
    borderRadius: 99,
  },
  logoText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  logoAccent: {
    color: "#ec4899",
  },
  closeBtn: {
    padding: 8,
    borderRadius: 8,
  },

  scroll: {
    flex: 1,
    paddingHorizontal: 8,
  },

  section: {
    paddingHorizontal: 4,
    paddingTop: 8,
    paddingBottom: 4,
  },

  // Create button — mirrors `linear-gradient(135deg, #e91e8c, #f43f5e)` mobile branch
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#e91e8c",
    // Gradient approximated — swap for expo-linear-gradient if needed
  },
  createBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },

  sectionLabel: {
    fontSize: 11,
    color: "#71717a",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  separator: {
    height: 1,
    backgroundColor: "#27272a",
    marginVertical: 4,
    marginHorizontal: 4,
  },

  // Nav item — mirrors `text-base py-4 justify-start gap-3` (isMobile branch)
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 1,
  },
  navItemActive: {
    backgroundColor: "rgba(236,72,153,0.1)", // pink-500/10
  },
  navItemPressed: {
    backgroundColor: "#27272a",
  },
  navItemLabel: {
    flex: 1,
    fontSize: 15,
    color: "#e4e4e7",
  },
  navItemLabelActive: {
    color: "#f472b6",
  },
  navItemLabelMuted: {
    color: "#71717a",
  },
  badge: {
    backgroundColor: "#ec4899",
    borderRadius: 99,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  badgeMuted: {
    backgroundColor: "transparent",
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
});

const startStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.72)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#0e0e10",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  subtitle: {
    fontSize: 11,
    color: "rgba(255,255,255,0.3)",
    marginTop: 2,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    marginHorizontal: 24,
  },
  // 4-col grid — mirrors `grid grid-cols-4 gap-2 p-2`
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 8,
    gap: 8,
  },
  gridItem: {
    width: "22%",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 12,
  },
  gridItemPressed: {
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(233,30,140,0.1)",
    borderWidth: 1,
    borderColor: "rgba(233,30,140,0.15)",
  },
  gridItemMeta: {
    alignItems: "center",
    gap: 2,
  },
  gridItemLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
  },
  tagBadge: {
    backgroundColor: "rgba(233,30,140,0.15)",
    borderRadius: 99,
    borderWidth: 1,
    borderColor: "rgba(244,114,182,0.2)",
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tagText: {
    fontSize: 8,
    fontWeight: "700",
    color: "#f472b6",
  },
  gridItemSub: {
    fontSize: 10,
    color: "rgba(255,255,255,0.3)",
    textAlign: "center",
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.04)",
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  footerText: {
    fontSize: 10,
    color: "rgba(255,255,255,0.2)",
  },
});

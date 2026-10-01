import { ModalCreditos } from "@/src/components/layout/modal_creditos";
import { UpgradeModalPro } from "@/src/components/layout/modal_upgrade";
import SplashScreen from "@/src/components/layout/splash-screen";
import { useUser } from "@/src/context/user-context";
import { useTranslations } from "@/src/hooks/useTranslations";
import { toastInfo } from "@/src/lib/toast";
import { UserPlan } from "@/src/types/user";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { Tool } from "../types/user";
import { DiscordPopup } from "./DiscordPopup";
import { FeedbackPopup } from "./FeedbackPopup";
import { Header } from "./Header";
import { HeroDashboard } from "./HeroDashboard";
import { Sidebar } from "./Sidebar";
import { TemplateGallerySection } from "./TemplateGallery";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(seconds: number) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (days > 0) return `${days}d ${hours}h`;
  else if (hours > 0) return `${hours}h ${minutes}m`;
  else if (minutes > 0) return `${minutes}m ${secs}s`;
  else return `${secs}s`;
}

function formatStorage(mb: number) {
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  if (mb < 1) return `${(mb * 1024).toFixed(0)} KB`;
  return `${mb.toFixed(1)} MB`;
}

// ─── ToolCard ─────────────────────────────────────────────────────────────────

function ToolCard({
  tool,
  onPress,
}: {
  tool: Tool;
  onPress: (t: Tool) => void;
}) {
  const isDisabled = tool.disabled;

  return (
    <Pressable
      onPress={() => !isDisabled && onPress(tool)}
      style={({ pressed }) => [
        styles.toolCard,
        isDisabled && styles.toolCardDisabled,
        pressed && !isDisabled && styles.toolCardPressed,
      ]}
    >
      {/* Thumbnail */}
      <View style={styles.toolImageWrapper}>
        {tool.image && (
          <Image
            source={{ uri: tool.image }}
            style={styles.toolImage}
            resizeMode="cover"
          />
        )}

        {/* Coming Soon badge */}
        {isDisabled && (
          <View style={styles.comingSoonBadge}>
            <Text style={styles.comingSoonText}>Em breve</Text>
          </View>
        )}
      </View>

      {/* Name */}
      <View style={styles.toolMeta}>
        <Text style={styles.toolName}>{tool.name}</Text>
        <Text style={styles.toolDescription}>{tool.description}</Text>
      </View>
    </Pressable>
  );
}

// ─── CategorySection ──────────────────────────────────────────────────────────

function CategorySection({
  label,
  tools,
  onPress,
}: {
  label: string;
  tools: Tool[];
  onPress: (t: Tool) => void;
}) {
  return (
    <View style={styles.categorySection}>
      {/* Section header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{label}</Text>
        <View style={styles.sectionDivider} />
      </View>

      {/* 2-column grid */}
      <View style={styles.toolGrid}>
        {tools.map((tool) => (
          <View key={tool.id} style={styles.toolGridItem}>
            <ToolCard tool={tool} onPress={onPress} />
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── ToolsCarousel ────────────────────────────────────────────────────────────

function ToolsCarousel({
  tools,
  onPress,
}: {
  tools: Tool[];
  onPress: (t: Tool) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const lastNavRef = useRef(0);
  const NAV_COOLDOWN = 350;
  const ITEMS_PER_VIEW = 1; // mobile shows 1 at a time

  const totalPages = Math.ceil(tools.length / ITEMS_PER_VIEW);
  const maxIndex = totalPages - 1;

  const tryNavigate = (dir: 1 | -1) => {
    const now = Date.now();
    if (now - lastNavRef.current < NAV_COOLDOWN) return;
    lastNavRef.current = now;
    setCurrentIndex((prev) => {
      const next = prev + dir;
      if (next < 0 || next > maxIndex) return prev;
      return next;
    });
  };

  const getPageTools = (pageIndex: number) => {
    const start = pageIndex * ITEMS_PER_VIEW;
    return tools.slice(start, start + ITEMS_PER_VIEW);
  };

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === maxIndex;

  return (
    <View style={styles.carouselWrapper}>
      {/* Slide pages */}
      <View style={styles.carouselViewport}>
        {getPageTools(currentIndex).map((tool) => (
          <ToolCard key={tool.id} tool={tool} onPress={onPress} />
        ))}
      </View>

      {/* Prev / Next arrows */}
      {totalPages > 1 && (
        <>
          <Pressable
            onPress={() => tryNavigate(-1)}
            disabled={isFirst}
            style={[
              styles.carouselArrow,
              styles.carouselArrowLeft,
              isFirst && styles.carouselArrowDisabled,
            ]}
            accessibilityLabel="Anterior"
          >
            <ChevronLeft size={20} color="#fff" />
          </Pressable>

          <Pressable
            onPress={() => tryNavigate(1)}
            disabled={isLast}
            style={[
              styles.carouselArrow,
              styles.carouselArrowRight,
              isLast && styles.carouselArrowDisabled,
            ]}
            accessibilityLabel="Próximo"
          >
            <ChevronRight size={20} color="#fff" />
          </Pressable>
        </>
      )}

      {/* Dot indicators */}
      {totalPages > 1 && (
        <View style={styles.dotsRow}>
          {Array.from({ length: totalPages }).map((_, index) => (
            <Pressable
              key={index}
              onPress={() => setCurrentIndex(index)}
              style={[
                styles.dot,
                index === currentIndex ? styles.dotActive : styles.dotInactive,
              ]}
              accessibilityLabel={`Ir para página ${index + 1}`}
            />
          ))}
        </View>
      )}
    </View>
  );
}

// ─── Main Dashboard Screen ─────────────────────────────────────────────────────

export default function Dashboard() {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [showAllTools, setShowAllTools] = useState(false);
  const [showSplash, setShowSplash] = useState(false);

  const { user, loading, currentPlan, refreshVideoData } = useUser();
  const userPlanTyped = (currentPlan?.toLowerCase() || "free") as UserPlan;
  const [isLoading, setIsLoading] = useState(true);
  const t = useTranslations("dashboard");
  const router = useRouter();
  const hasInitialized = useRef(false);
  const scrollRef = useRef<ScrollView>(null);
  const R2 = "https://cdn-frontend.trendyuu.com/dashboard-thumbnails";

  // Check splash on mount
  useEffect(() => {
    AsyncStorage.getItem("splashShown").then((val) => {
      if (!val) setShowSplash(true);
    });
  }, []);

  useEffect(() => {
    if (!user && !loading) {
      AsyncStorage.multiRemove(["accessToken", "refreshToken"]);
      router.replace("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    const init = async () => {
      try {
        await refreshVideoData();
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [refreshVideoData]);

  // ── All tools ────────────────────────────────────────────────────────────────
  const allTools: Tool[] = [
    {
      id: "auto-clip",
      name: t("tools.autoClip.name"),
      description: t("tools.autoClip.description"),
      image: `${R2}/thumb_black_autoclip.webp`,
      category: "text",
      group: "start",
      href: "/ai-tools/autoclip",
    },
    {
      id: "canvas",
      name: t("tools.canvas.name"),
      description: t("tools.canvas.description"),
      image: `${R2}/thumbnail_canvas_v3.webp`,
      category: "editor",
      group: "start",
      href: "/canvas",
    },
    {
      id: "trendyuu-flow",
      name: t("tools.trendyuuFlow.name"),
      description: t("tools.trendyuuFlow.description"),
      image: `${R2}/thumb_trendyuu_flow.webp`,
      category: "editor",
      group: "start",
      href: "/ai-tools/trendyuu-flow",
    },
    {
      id: "text-to-video",
      name: t("tools.textToVideo.name"),
      description: t("tools.textToVideo.description"),
      image: `${R2}/thumb_black_text_video.webp`,
      category: "ai",
      group: "media",
      href: "/ai-tools/text-to-video",
    },
    {
      id: "text-to-image",
      name: t("tools.textToImage.name"),
      description: t("tools.textToImage.description"),
      image: `${R2}/thumb_black_text_image.webp`,
      category: "ai",
      group: "media",
      href: "/ai-tools/text-to-image",
    },
    {
      id: "smart-image",
      name: t("tools.smartImageGenerator.name"),
      description: t("tools.smartImageGenerator.description"),
      image: `${R2}/thumbnail_sig_v4.webp`,
      category: "ai",
      group: "media",
      href: "/ai-tools/smart-image-generator",
    },
    {
      id: "smart-video",
      name: t("tools.smartVideoGenerator.name"),
      description: t("tools.smartVideoGenerator.description"),
      image: `${R2}/thumbnail_svg_v2.webp`,
      category: "ai",
      group: "media",
      href: "/ai-tools/smart-video-generator",
    },
    {
      id: "carousel-generator",
      name: t("tools.carouselGenerator.name"),
      description: t("tools.carouselGenerator.description"),
      image: `${R2}/thumb_black_carrosel.webp`,
      category: "ai",
      group: "media",
      href: "/ai-tools/carousel-generator",
    },
    {
      id: "short-generator",
      name: t("tools.shortGenerator.name"),
      description: t("tools.shortGenerator.description"),
      image: `${R2}/nova_thumb_do_short_generator.webp`,
      category: "ai",
      group: "media",
      href: "/ai-tools/short-generator",
    },
    {
      id: "voice-generator",
      name: t("tools.voiceAIGenerator.name"),
      description: t("tools.voiceAIGenerator.description"),
      image: `${R2}/thumb_black_voice_generator.webp`,
      category: "audio",
      group: "audio",
      href: "/ai-tools/voicegenerator",
    },
    {
      id: "sound-effects",
      name: t("tools.soundEffects.name"),
      description: t("tools.soundEffects.description"),
      image: `${R2}/thumb_black_sound_effect.webp`,
      category: "audio",
      group: "audio",
      href: "/ai-tools/sound-effects",
    },
    {
      id: "trend-music",
      name: t("tools.musicGenerator.name"),
      description: t("tools.musicGenerator.description"),
      image: `${R2}/thumb_black_music.webp`,
      category: "audio",
      group: "audio",
      href: "/ai-tools/trend-music",
    },
    {
      id: "voice-changer",
      name: t("tools.voiceChanger.name"),
      description: t("tools.voiceChanger.description"),
      image: `${R2}/thumb_black_change_voice.webp`,
      category: "audio",
      group: "audio",
      href: "/ai-tools/voice-changer",
    },
    {
      id: "variations",
      name: t("tools.variations.name"),
      description: t("tools.variations.description"),
      image: `${R2}/thumb_variations.webp`,
      category: "ai",
      group: "media",
      href: "/ai-tools/variations",
    },
    {
      id: "short-editor",
      name: t("tools.shortEditor.name"),
      description: t("tools.shortEditor.description"),
      image: `${R2}/thumbnail_short_editor_v3.webp`,
      category: "editor",
      group: "start",
      href: "/short-editor",
    },
    {
      id: "text-tools",
      name: t("tools.textTools.name"),
      description: t("tools.textTools.description"),
      image: `${R2}/thumbnail-text-tools.webp`,
      category: "text",
      group: "text",
      href: "ai-tools/text-tools/script-generator",
    },
    {
      id: "audio-translator",
      name: t("tools.audioTranslator.name"),
      description: t("tools.audioTranslator.description"),
      image: `${R2}/thumbnail-audio-translator.webp`,
      category: "audio",
      group: "audio",
      href: "ai-tools/audio-tools/audio-translator",
    },
    {
      id: "brand-builder",
      name: t("tools.brandBuilder.name"),
      description: t("tools.brandBuilder.description"),
      image: `${R2}/thumbnail-brand-builder.webp`,
      category: "ai",
      group: "media",
      href: "ai-tools/image-tools/brand-builder",
    },
  ];

  // Initial 6 cards for the carousel
  const initialTools = allTools.filter(
    (t) =>
      t.id === "canvas" ||
      t.id === "smart-image" ||
      t.id === "smart-video" ||
      t.id === "variations" ||
      t.id === "short-editor",
  );

  // Tools by category (for "show all" view)
  const startTools = allTools.filter((t) => t.group === "start");
  const mediaTools = allTools.filter((t) => t.group === "media");
  const audioTools = allTools.filter((t) => t.group === "audio");
  const textTools = allTools.filter((t) => t.group === "text");

  const handleToolPress = (tool: Tool) => {
    if (tool.disabled) {
      toastInfo("Em breve", "Este recurso estará disponível em breve!");
      return;
    }
    if (tool.isPremium && user?.plan === "free") {
      toastInfo(
        t("premiumFeatureTitle"),
        t("premiumFeatureDescription", { tool: tool.name }),
      );
      return;
    }
    if (tool.href) {
      router.push(tool.href as any);
      return;
    }
    toastInfo(
      t("toolSelectedTitle"),
      t("toolSelectedDescription", { tool: tool.name }),
    );
  };

  const handleUpgrade = () => {
    toastInfo(t("upgradeTitle"), t("upgradeDescription"));
  };

  const handleSplashFinish = async () => {
    await AsyncStorage.setItem("splashShown", "1");
    setShowSplash(false);
  };

  // Stats array
  const stats = user
    ? [
        {
          label: t("videosCreated"),
          value: user?.totalVideoData?.videos_created ?? 0,
        },
        {
          label: t("timeSaved"),
          value: formatTime(user?.totalVideoData?.time_saved ?? 0),
        },
        {
          label: t("totalViews"),
          value: user?.totalVideoData?.total_views ?? 0,
        },
      ]
    : [];

  if (showSplash || loading || isLoading) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <View style={styles.root}>
      <Sidebar />

      <View style={styles.content}>
        <Header
          onUpgrade={handleUpgrade}
          currentPlan={user?.plan}
          setShowUpgradeModal={setShowUpgradeModal}
          setShowCreditsModal={setShowCreditsModal}
          userRegion={user?.region}
        />

        <ScrollView
          ref={scrollRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Stats ─────────────────────────────────────────────────────── */}
          {user && (
            <View style={styles.statsRow}>
              {stats.map((s) => (
                <View key={s.label} style={styles.statCard}>
                  <Text
                    style={styles.statLabel}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.5}
                  >
                    {s.label.toUpperCase()}
                  </Text>
                  <Text style={styles.statValue}>{String(s.value)}</Text>
                </View>
              ))}
            </View>
          )}

          {/* ── Hero ──────────────────────────────────────────────────────── */}
          <HeroDashboard
            user={user}
            userPlan={userPlanTyped}
            userCredits={user?.credits}
            formatTime={formatTime}
            formatStorage={formatStorage}
            t={t}
          />

          {/* ── Tools section ─────────────────────────────────────────────── */}
          {!showAllTools ? (
            <View style={styles.toolsSection}>
              {/* Section header + "Ver todas" button */}
              <View style={styles.toolsSectionHeader}>
                <View style={styles.toolsSectionTitleRow}>
                  <Text style={styles.sectionTitle}>Comece por aqui</Text>
                  <View style={styles.sectionDivider} />
                </View>

                <Pressable
                  onPress={() => setShowAllTools(true)}
                  style={styles.seeAllButton}
                >
                  <Text style={styles.seeAllText}>
                    Ver todas as {allTools.length} ferramentas
                  </Text>
                  <ChevronRight size={16} color="#a1a1aa" />
                </Pressable>
              </View>

              {/* Carousel */}
              <ToolsCarousel tools={initialTools} onPress={handleToolPress} />
            </View>
          ) : (
            <>
              {/* "Mostrar menos" button */}
              <View style={styles.showLessRow}>
                <Pressable
                  onPress={() => setShowAllTools(false)}
                  style={styles.showLessButton}
                >
                  <ChevronLeft size={12} color="#a1a1aa" />
                  <Text style={styles.showLessText}>Mostrar menos</Text>
                </Pressable>
              </View>

              <CategorySection
                label={t("steps.startHere")}
                tools={startTools}
                onPress={handleToolPress}
              />

              <CategorySection
                label={t("steps.createMedia")}
                tools={mediaTools}
                onPress={handleToolPress}
              />

              <CategorySection
                label={t("steps.audioTools")}
                tools={audioTools}
                onPress={handleToolPress}
              />

              <CategorySection
                label={t("steps.textTools")}
                tools={textTools}
                onPress={handleToolPress}
              />
            </>
          )}

          <TemplateGallerySection scrollContainerRef={scrollRef} />
        </ScrollView>

        <UpgradeModalPro
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
        />

        <ModalCreditos
          isOpen={showCreditsModal}
          onClose={() => setShowCreditsModal(false)}
        />
      </View>

      <FeedbackPopup />
      <DiscordPopup />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const styles = StyleSheet.create({
  // Layout
  root: {
    flex: 1,
    backgroundColor: "#000",
    flexDirection: "row",
    ...(Platform.OS === "web" ? { height: "100vh" as any } : {}),
  },
  content: {
    flex: 1,
    flexDirection: "column",
    minWidth: 0,
    position: "relative",
  },
  scrollView: {
    flex: 1,
    ...(Platform.OS === "web" ? { overflow: "auto" as any } : {}),
  },
  scrollContent: {
    padding: 12,
    gap: 24,
    paddingBottom: 40,
  },

  // Stats row — mirrors the `sm:hidden grid grid-cols-3` block
  statsRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 4,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#18181b", // zinc-900
    borderWidth: 1,
    borderColor: "#27272a", // zinc-800
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  statLabel: {
    width: "100%",
    fontSize: 9,
    color: "#71717a",
    letterSpacing: 0.8,
    marginBottom: 4,
    textAlign: "center",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },

  // Section header
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  sectionDivider: {
    flex: 1,
    height: 1,
    backgroundColor: "#27272a", // zinc-800
  },

  // Category section
  categorySection: {
    gap: 4,
  },

  // 2-column tool grid (mirrors `grid-cols-2`)
  toolGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  toolGridItem: {
    width: (SCREEN_WIDTH - 12 * 2 - 12) / 2, // 2 cols with gap
  },

  // ToolCard
  toolCard: {
    flexDirection: "column",
  },
  toolCardDisabled: {
    opacity: 0.6,
  },
  toolCardPressed: {
    transform: [{ scale: 0.97 }],
  },
  toolImageWrapper: {
    borderRadius: 16,
    overflow: "hidden",
    aspectRatio: 16 / 9,
    position: "relative",
  },
  toolImage: {
    width: "100%",
    height: "100%",
  },
  comingSoonBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 99,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  comingSoonText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#d4d4d8", // zinc-300
  },
  toolMeta: {
    paddingTop: 8,
    paddingHorizontal: 4,
    alignItems: "center",
  },
  toolName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
  },
  toolDescription: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
    marginTop: 4,
  },

  // Tools section (carousel view)
  toolsSection: {
    gap: 12,
  },
  toolsSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  toolsSectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  seeAllText: {
    fontSize: 14,
    color: "#a1a1aa", // zinc-400
    flexShrink: 1,
  },

  // Show less
  showLessRow: {
    alignItems: "flex-end",
  },
  showLessButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  showLessText: {
    fontSize: 14,
    color: "#a1a1aa",
  },

  // Carousel
  carouselWrapper: {
    position: "relative",
  },
  carouselViewport: {
    width: "100%",
  },
  carouselArrow: {
    position: "absolute",
    top: "40%",
    zIndex: 10,
    padding: 8,
    borderRadius: 99,
    backgroundColor: "rgba(0,0,0,0.8)",
    borderWidth: 1,
    borderColor: "#3f3f46", // zinc-700
  },
  carouselArrowLeft: {
    left: -8,
  },
  carouselArrowRight: {
    right: -8,
  },
  carouselArrowDisabled: {
    opacity: 0.4,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
  },
  dot: {
    height: 8,
    borderRadius: 99,
  },
  dotActive: {
    width: 32,
    backgroundColor: "#fff",
  },
  dotInactive: {
    width: 8,
    backgroundColor: "#52525b", // zinc-600
  },
});

import { Sidebar } from "@/app/dashboard/components/Sidebar";
import { UpgradeModalPro } from "@/src/components/layout/modal_upgrade";
import { useUser } from "@/src/context/user-context";
import { useTranslations } from "@/src/hooks/useTranslations";
import { UserPlan } from "@/src/types/user";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Calendar,
  ChevronDown,
  Filter,
  Lock,
  RefreshCw,
  Sparkles,
} from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaInstagram, FaTiktok, FaTwitter, FaYoutube } from "react-icons/fa";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AccountSelector } from "./account-selector";
import { MetricsOverview } from "./metrics-overview";
import { PostsGrid } from "./posts-grid";

// ─── Types ────────────────────────────────────────────────────────────────────
export type SocialPlatform =
  | "youtube"
  | "tiktok"
  | "instagram"
  | "twitter"
  | "all";

export interface ConnectedAccount {
  id: string;
  platform: SocialPlatform;
  username: string;
  displayName?: string;
  profileImage?: string;
  followers?: number;
  isConnected: boolean;
}

export interface SocialPost {
  id: string;
  platform: SocialPlatform;
  title: string;
  thumbnail?: string;
  publishedAt: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  duration?: number;
  url?: string;
}

export interface GlobalMetrics {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalFollowers: number;
  totalPosts: number;
  viewsGrowth: number;
  likesGrowth: number;
  followersGrowth: number;
}

type YouTubeChannelResponse = {
  id: string;
  title: string;
  subscribers: number;
};

type YouTubeVideoResponse = {
  id: string;
  title: string;
  thumbnail: string | null;
  publishedAt: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  duration: number;
  isShort: boolean;
  url: string;
};

type YouTubeVideosApiResponse = {
  channel: YouTubeChannelResponse;
  videos: YouTubeVideoResponse[];
  error?: string;
};

type ConnectedAccountResponse = {
  id: string;
  platform: string;
  username: string;
  platformUserId: string;
  connectedAt: string;
  expiresAt: string | null;
  isExpired: boolean;
};

type ConnectedAccountsApiResponse = {
  accounts: ConnectedAccountResponse[];
};

// ─── Platform Config ──────────────────────────────────────────────────────────

export const PLATFORM_CONFIG: Record<
  Exclude<SocialPlatform, "all">,
  {
    label: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    borderColor: string;
  }
> = {
  youtube: {
    label: "YouTube",
    icon: <FaYoutube size={16} color="#ef4444" />,
    color: "#ef4444",
    bgColor: "rgba(239,68,68,0.1)",
    borderColor: "rgba(239,68,68,0.2)",
  },
  tiktok: {
    label: "TikTok",
    icon: <FaTiktok size={16} color="#ffffff" />,
    color: "#ffffff",
    bgColor: "rgba(39,39,42,0.5)",
    borderColor: "#3f3f46",
  },
  instagram: {
    label: "Instagram",
    icon: <FaInstagram size={16} color="#ec4899" />,
    color: "#ec4899",
    bgColor: "rgba(236,72,153,0.1)",
    borderColor: "rgba(236,72,153,0.2)",
  },
  twitter: {
    label: "X (Twitter)",
    icon: <FaTwitter size={16} color="#60a5fa" />,
    color: "#60a5fa",
    bgColor: "rgba(59,130,246,0.1)",
    borderColor: "rgba(59,130,246,0.2)",
  },
};

// ─── Upgrade Gate ─────────────────────────────────────────────────────────────

function UpgradeGate({
  t,
  onUpgrade,
}: {
  t: ReturnType<typeof useTranslations>;
  onUpgrade: () => void;
}) {
  return (
    <View style={styles.upgradeGate}>
      <View style={styles.upgradeInner}>
        {/* Icon */}
        <View style={styles.upgradeIconWrap}>
          <Lock size={36} color="#f472b6" />
        </View>

        {/* Copy */}
        <View style={styles.upgradeTextWrap}>
          <Text style={styles.upgradeTitle}>{t("upgrade.title")}</Text>
          <Text style={styles.upgradeDescription}>
            {t("upgrade.description")}
          </Text>
        </View>

        {/* Plan badges */}
        <View style={styles.upgradeBadges}>
          {(["creator", "agency"] as const).map((plan) => (
            <View key={plan} style={styles.upgradeBadge}>
              <Sparkles size={12} color="#f472b6" />
              <Text style={styles.upgradeBadgeText}>{plan}</Text>
            </View>
          ))}
        </View>

        {/* Feature bullets */}
        <View style={styles.upgradeFeatures}>
          {(["feature1", "feature2", "feature3"] as const).map((key) => (
            <View key={key} style={styles.upgradeFeatureRow}>
              <View style={styles.upgradeBulletWrap}>
                <View style={styles.upgradeBullet} />
              </View>
              <Text style={styles.upgradeFeatureText}>
                {t(`upgrade.${key}`)}
              </Text>
            </View>
          ))}
        </View>

        {/* CTA */}
        <TouchableOpacity style={styles.upgradeCta} onPress={onUpgrade}>
          <Sparkles size={16} color="#fff" />
          <Text style={styles.upgradeCtaText}>{t("upgrade.cta")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function TrendyuuStudio() {
  const t = useTranslations("TrendyuuStudio");
  const { currentPlan, loading: isUserLoading } = useUser();
  const userPlanTyped = (currentPlan?.toLowerCase() || "free") as UserPlan;
  const canUseStudio =
    userPlanTyped === "creator" || userPlanTyped === "agency";

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const [connectedAccounts, setConnectedAccounts] = useState<
    ConnectedAccount[]
  >([]);
  const [selectedPlatform, setSelectedPlatform] =
    useState<SocialPlatform>("all");
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d" | "all">(
    "30d",
  );
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);

  const selectedPlatformRef = useRef(selectedPlatform);
  const dateRangeRef = useRef(dateRange);

  useEffect(() => {
    selectedPlatformRef.current = selectedPlatform;
  }, [selectedPlatform]);
  useEffect(() => {
    dateRangeRef.current = dateRange;
  }, [dateRange]);

  const fetchPostsForAccounts = useCallback(
    async (accounts: ConnectedAccount[]) => {
      const platform = selectedPlatformRef.current;
      const range = dateRangeRef.current;

      const wantYoutube = platform === "all" || platform === "youtube";

      const youtubeAccounts = wantYoutube
        ? accounts.filter((a) => a.platform === "youtube")
        : [];

      if (youtubeAccounts.length === 0) {
        setPosts([]);
        return;
      }

      setIsLoadingPosts(true);
      const apiUrl = process.env.EXPO_PUBLIC_TRENDYUU_URL_BACK;
      if (!apiUrl) {
        setPosts([]);
        setIsLoadingPosts(false);
        return;
      }

      const allPosts: SocialPost[] = [];
      const followerUpdates: Record<string, number> = {};
      const token = await AsyncStorage.getItem("accessToken");
      const authHeaders: Record<string, string> = token
        ? { Authorization: `Bearer ${token}` }
        : {};

      for (const acc of youtubeAccounts) {
        try {
          const params = new URLSearchParams({
            date_range: range,
            account_id: acc.id,
          });
          const res = await fetch(
            `${apiUrl}/api/socials/youtube/videos?${params}`,
            { headers: authHeaders },
          );

          if (res.status === 403) {
            setShowUpgradeModal(true);
            continue;
          }

          if (!res.ok) continue;

          const data: YouTubeVideosApiResponse = await res.json();

          if (data.channel?.subscribers) {
            followerUpdates[acc.id] = data.channel.subscribers;
          }

          const mapped: SocialPost[] = (data.videos ?? []).map((v) => ({
            id: v.id,
            platform: "youtube" as const,
            title: v.title,
            thumbnail: v.thumbnail ?? undefined,
            publishedAt: v.publishedAt,
            views: v.views,
            likes: v.likes,
            comments: v.comments,
            shares: v.shares,
            duration: v.duration,
            url: v.url,
          }));

          allPosts.push(...mapped);
        } catch {
          // Network error — skip this account silently
        }
      }

      if (Object.keys(followerUpdates).length > 0) {
        setConnectedAccounts((prev) =>
          prev.map((a) =>
            followerUpdates[a.id] !== undefined
              ? { ...a, followers: followerUpdates[a.id] }
              : a,
          ),
        );
      }

      setPosts(allPosts);
      setIsLoadingPosts(false);
    },
    [],
  );

  const fetchConnectedAccounts = useCallback(async () => {
    setIsLoadingAccounts(true);
    const apiUrl = process.env.EXPO_PUBLIC_TRENDYUU_URL_BACK;
    if (!apiUrl) {
      setIsLoadingAccounts(false);
      return;
    }

    const token = await AsyncStorage.getItem("accessToken");

    try {
      const res = await fetch(`${apiUrl}/api/socials/connected`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.status === 403) {
        setShowUpgradeModal(true);
        setIsLoadingAccounts(false);
        return;
      }

      if (!res.ok) {
        setIsLoadingAccounts(false);
        return;
      }

      const data: ConnectedAccountsApiResponse = await res.json();
      const accounts: ConnectedAccount[] = (data.accounts ?? []).map((a) => ({
        id: a.id,
        platform: a.platform as SocialPlatform,
        username: a.username,
        isConnected: !a.isExpired,
      }));

      setConnectedAccounts(accounts);
      setIsLoadingAccounts(false);
      await fetchPostsForAccounts(accounts);
    } catch {
      setIsLoadingAccounts(false);
    }
  }, [fetchPostsForAccounts]);

  const fetchPosts = useCallback(async () => {
    await fetchPostsForAccounts(connectedAccounts);
  }, [fetchPostsForAccounts, connectedAccounts]);

  useEffect(() => {
    if (isUserLoading) return;
    if (canUseStudio) {
      fetchConnectedAccounts();
    } else {
      setIsLoadingAccounts(false);
    }
  }, [isUserLoading, canUseStudio, fetchConnectedAccounts]);

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (canUseStudio) fetchPosts();
  }, [selectedPlatform, dateRange]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRefresh = async () => {
    if (!canUseStudio) {
      setShowUpgradeModal(true);
      return;
    }
    setIsRefreshing(true);
    await fetchConnectedAccounts();
    await new Promise((r) => setTimeout(r, 1000));
    setIsRefreshing(false);
  };

  const metrics: GlobalMetrics = useMemo(
    () => ({
      totalViews: posts.reduce((a, p) => a + p.views, 0),
      totalLikes: posts.reduce((a, p) => a + p.likes, 0),
      totalComments: posts.reduce((a, p) => a + p.comments, 0),
      totalShares: posts.reduce((a, p) => a + p.shares, 0),
      totalFollowers: connectedAccounts
        .filter(
          (a) => selectedPlatform === "all" || a.platform === selectedPlatform,
        )
        .reduce((a, acc) => a + (acc.followers || 0), 0),
      totalPosts: posts.length,
      viewsGrowth: 0,
      likesGrowth: 0,
      followersGrowth: 0,
    }),
    [posts, connectedAccounts, selectedPlatform],
  );

  const dateLabel =
    dateRange === "7d"
      ? t("last7Days")
      : dateRange === "30d"
        ? t("last30Days")
        : dateRange === "90d"
          ? t("last90Days")
          : t("allPeriod");

  return (
    <View style={styles.container}>
      <Sidebar />

      <View style={styles.content}>
        {/* ── Header ── */}
        <View style={styles.header}>
          {canUseStudio && (
            <View style={styles.headerActions}>
              {/* Date range dropdown */}
              <TouchableOpacity
                style={styles.outlineButton}
                onPress={() => setShowDateDropdown(true)}
              >
                <Calendar size={16} color="#a1a1aa" />
                <Text style={styles.outlineButtonText}>{dateLabel}</Text>
                <ChevronDown size={16} color="#a1a1aa" />
              </TouchableOpacity>

              <Modal
                transparent
                visible={showDateDropdown}
                animationType="fade"
                onRequestClose={() => setShowDateDropdown(false)}
              >
                <Pressable
                  style={styles.modalOverlay}
                  onPress={() => setShowDateDropdown(false)}
                >
                  <View style={styles.dropdownContent}>
                    {[
                      { key: "7d", label: t("last7Days") },
                      { key: "30d", label: t("last30Days") },
                      { key: "90d", label: t("last90Days") },
                      { key: "all", label: t("allPeriod") },
                    ].map((item) => (
                      <TouchableOpacity
                        key={item.key}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setDateRange(item.key as typeof dateRange);
                          setShowDateDropdown(false);
                        }}
                      >
                        <Text style={styles.dropdownItemText}>
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </Pressable>
              </Modal>

              {/* Refresh */}
              <TouchableOpacity
                style={styles.outlineButton}
                onPress={handleRefresh}
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <ActivityIndicator size={16} color="#a1a1aa" />
                ) : (
                  <RefreshCw size={16} color="#a1a1aa" />
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ── Body ── */}
        {!canUseStudio || isUserLoading ? (
          <UpgradeGate t={t} onUpgrade={() => setShowUpgradeModal(true)} />
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <AccountSelector
              accounts={connectedAccounts}
              selectedPlatform={selectedPlatform}
              onSelectPlatform={setSelectedPlatform}
              isLoading={isLoadingAccounts}
              t={t}
            />

            <MetricsOverview
              metrics={metrics}
              selectedPlatform={selectedPlatform}
              isLoading={isLoadingAccounts || isLoadingPosts}
              t={t}
            />

            {/* Posts section */}
            <View style={styles.postsSection}>
              <View style={styles.postsSectionHeader}>
                <View>
                  <Text style={styles.postsSectionTitle}>{t("yourPosts")}</Text>
                  <Text style={styles.postsSectionSubtitle}>
                    {t("postsCount", { count: posts.length })}
                    {selectedPlatform !== "all" &&
                      ` ${t("inPlatform", {
                        platform:
                          PLATFORM_CONFIG[
                            selectedPlatform as Exclude<SocialPlatform, "all">
                          ]?.label,
                      })}`}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.outlineButton}
                  onPress={() => setShowSortDropdown(true)}
                >
                  <Filter size={16} color="#a1a1aa" />
                  <Text style={styles.outlineButtonText}>{t("sort")}</Text>
                  <ChevronDown size={16} color="#a1a1aa" />
                </TouchableOpacity>

                <Modal
                  transparent
                  visible={showSortDropdown}
                  animationType="fade"
                  onRequestClose={() => setShowSortDropdown(false)}
                >
                  <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setShowSortDropdown(false)}
                  >
                    <View style={styles.dropdownContent}>
                      {[
                        t("mostRecent"),
                        t("mostViews"),
                        t("mostLikes"),
                        t("mostComments"),
                      ].map((label, i) => (
                        <TouchableOpacity
                          key={i}
                          style={styles.dropdownItem}
                          onPress={() => setShowSortDropdown(false)}
                        >
                          <Text style={styles.dropdownItemText}>{label}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </Pressable>
                </Modal>
              </View>

              <PostsGrid posts={posts} isLoading={isLoadingPosts} t={t} />
            </View>
          </ScrollView>
        )}
      </View>

      <UpgradeModalPro
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#000",
  },
  content: {
    flex: 1,
    flexDirection: "column",
  },
  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    height: 64,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(39,39,42,0.6)",
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  outlineButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#27272a",
    backgroundColor: "rgba(24,24,27,0.5)",
  },
  outlineButtonText: {
    fontSize: 13,
    color: "#a1a1aa",
  },
  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    gap: 24,
  },
  // Posts section
  postsSection: {
    gap: 16,
  },
  postsSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  postsSectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  postsSectionSubtitle: {
    fontSize: 13,
    color: "#71717a",
  },
  // Modal / dropdown
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownContent: {
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#27272a",
    borderRadius: 12,
    minWidth: 180,
    overflow: "hidden",
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownItemText: {
    fontSize: 14,
    color: "#a1a1aa",
  },
  // Upgrade gate
  upgradeGate: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  upgradeInner: {
    maxWidth: 400,
    width: "100%",
    alignItems: "center",
    gap: 24,
  },
  upgradeIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(233,30,140,0.15)",
    borderWidth: 1,
    borderColor: "rgba(233,30,140,0.25)",
  },
  upgradeTextWrap: {
    alignItems: "center",
    gap: 8,
  },
  upgradeTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },
  upgradeDescription: {
    fontSize: 13,
    color: "#a1a1aa",
    textAlign: "center",
    lineHeight: 20,
  },
  upgradeBadges: {
    flexDirection: "row",
    gap: 12,
  },
  upgradeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(233,30,140,0.12)",
    borderWidth: 1,
    borderColor: "rgba(233,30,140,0.3)",
  },
  upgradeBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#f472b6",
    textTransform: "capitalize",
  },
  upgradeFeatures: {
    alignSelf: "stretch",
    gap: 10,
  },
  upgradeFeatureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  upgradeBulletWrap: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "rgba(236,72,153,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  upgradeBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#f472b6",
  },
  upgradeFeatureText: {
    flex: 1,
    fontSize: 13,
    color: "#d4d4d8",
    lineHeight: 20,
  },
  upgradeCta: {
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#e91e8c",
  },
  upgradeCtaText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
});

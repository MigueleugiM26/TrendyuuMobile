import { useTranslations } from "@/src/hooks/useTranslations";
import {
  BarChart3,
  Calendar,
  Clock,
  ExternalLink,
  Eye,
  Heart,
  MessageCircle,
  Play,
  Share2,
  TrendingUp,
  X,
} from "lucide-react-native";
import { FaInstagram, FaTiktok, FaTwitter, FaYoutube } from "react-icons/fa";
import {
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { SocialPlatform, SocialPost } from "./trendyuu-studio";
import { PLATFORM_CONFIG } from "./trendyuu-studio";

// ─── Helper Functions ─────────────────────────────────────────────────────────

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function formatDuration(seconds?: number): string {
  if (!seconds) return "N/A";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatFullDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

// ─── Platform Icon Component ──────────────────────────────────────────────────

function PlatformIcon({
  platform,
  size = 20,
}: {
  platform: SocialPlatform;
  size?: number;
}) {
  const config = PLATFORM_CONFIG[platform as Exclude<SocialPlatform, "all">];
  if (!config || platform === "all") return null;
  const icons: Record<Exclude<SocialPlatform, "all">, React.ReactNode> = {
    youtube: <FaYoutube size={size} color={config.color} />,
    tiktok: <FaTiktok size={size} color={config.color} />,
    instagram: <FaInstagram size={size} color={config.color} />,
    twitter: <FaTwitter size={size} color={config.color} />,
  };
  return icons[platform] || null;
}

// ─── Stat Card Component ──────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  growth?: number;
}

function StatCard({
  label,
  value,
  icon,
  iconBg,
  iconColor,
  growth,
}: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIconWrap, { backgroundColor: iconBg }]}>
        {icon}
      </View>
      <View style={styles.statCardBody}>
        <Text style={styles.statValue}>{formatNumber(value)}</Text>
        <View style={styles.statLabelRow}>
          <Text style={styles.statLabel}>{label}</Text>
          {growth !== undefined && (
            <View
              style={[
                styles.growthBadge,
                {
                  backgroundColor:
                    growth >= 0
                      ? "rgba(16,185,129,0.1)"
                      : "rgba(239,68,68,0.1)",
                },
              ]}
            >
              <Text
                style={[
                  styles.growthText,
                  { color: growth >= 0 ? "#34d399" : "#f87171" },
                ]}
              >
                {growth >= 0 ? "+" : ""}
                {growth}%
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface PostDetailModalProps {
  post: SocialPost | null;
  allPosts: SocialPost[];
  isOpen: boolean;
  onClose: () => void;
  t: ReturnType<typeof useTranslations>;
}

export function PostDetailModal({
  post,
  allPosts,
  isOpen,
  onClose,
  t,
}: PostDetailModalProps) {
  if (!post) return null;

  const config =
    PLATFORM_CONFIG[post.platform as Exclude<SocialPlatform, "all">];
  if (!config) return null;

  const otherPosts = allPosts.filter(
    (p) => p.id !== post.id && p.platform === post.platform,
  );

  const viewsMedian = getMedian(otherPosts.map((p) => p.views));
  const likesMedian = getMedian(otherPosts.map((p) => p.likes));
  const commentsMedian = getMedian(otherPosts.map((p) => p.comments));
  const sharesMedian = getMedian(otherPosts.map((p) => p.shares));

  const calcGrowth = (current: number, median: number): number => {
    if (median === 0) return 0;
    return Math.round(((current - median) / median) * 100);
  };

  const viewsGrowth = calcGrowth(post.views, viewsMedian);
  const likesGrowth = calcGrowth(post.likes, likesMedian);
  const commentsGrowth = calcGrowth(post.comments, commentsMedian);
  const sharesGrowth = calcGrowth(post.shares, sharesMedian);

  const engagementRate = (
    ((post.likes + post.comments + post.shares) / (post.views || 1)) *
    100
  ).toFixed(2);

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderLeft}>
              <View
                style={[
                  styles.platformIconWrap,
                  {
                    backgroundColor: config.bgColor,
                    borderColor: config.borderColor,
                  },
                ]}
              >
                <PlatformIcon platform={post.platform} size={20} />
              </View>
              <View>
                <Text style={styles.modalTitle}>{t("postDetails")}</Text>
                <Text style={styles.modalSubtitle}>{config.label}</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <X size={20} color="#a1a1aa" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Thumbnail */}
            <View style={styles.thumbnailWrap}>
              {post.thumbnail ? (
                <Image
                  source={{ uri: post.thumbnail }}
                  style={styles.thumbnailImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.thumbnailPlaceholder}>
                  <Play size={64} color="#3f3f46" />
                </View>
              )}
              {!!post.duration && (
                <View style={styles.durationBadge}>
                  <Clock size={16} color="#a1a1aa" />
                  <Text style={styles.durationText}>
                    {formatDuration(post.duration)}
                  </Text>
                </View>
              )}
            </View>

            {/* Meta */}
            <View style={styles.metaSection}>
              <Text style={styles.postTitle}>{post.title}</Text>
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Calendar size={16} color="#71717a" />
                  <Text style={styles.metaText}>
                    {formatFullDate(post.publishedAt)}
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <BarChart3 size={16} color="#71717a" />
                  <Text style={styles.metaText}>
                    {engagementRate}% {t("engagement")}
                  </Text>
                </View>
              </View>
            </View>

            {/* Stats */}
            <View style={styles.statsGrid}>
              <StatCard
                label={t("views")}
                value={post.views}
                icon={<Eye size={20} color="#60a5fa" />}
                iconBg="rgba(59,130,246,0.1)"
                iconColor="#60a5fa"
                growth={viewsGrowth}
              />
              <StatCard
                label={t("likes")}
                value={post.likes}
                icon={<Heart size={20} color="#f472b6" />}
                iconBg="rgba(236,72,153,0.1)"
                iconColor="#f472b6"
                growth={likesGrowth}
              />
              <StatCard
                label={t("comments")}
                value={post.comments}
                icon={<MessageCircle size={20} color="#c084fc" />}
                iconBg="rgba(168,85,247,0.1)"
                iconColor="#c084fc"
                growth={commentsGrowth}
              />
              <StatCard
                label={t("shares")}
                value={post.shares}
                icon={<Share2 size={20} color="#34d399" />}
                iconBg="rgba(16,185,129,0.1)"
                iconColor="#34d399"
                growth={sharesGrowth}
              />
            </View>

            {/* Comparison block */}
            <View style={styles.comparisonBlock}>
              <View style={styles.comparisonHeader}>
                <TrendingUp size={20} color="#34d399" />
                <Text style={styles.comparisonTitle}>
                  {t("comparisonMedian")}
                </Text>
              </View>
              <View style={styles.comparisonList}>
                <View style={styles.comparisonItem}>
                  <Text style={styles.bulletViews}>•</Text>
                  <Text style={styles.comparisonText}>
                    {t("comparisonText", {
                      metric: t("views"),
                      direction: viewsGrowth >= 0 ? t("above") : t("below"),
                      percent: Math.abs(viewsGrowth),
                    })}
                  </Text>
                </View>
                <View style={styles.comparisonItem}>
                  <Text style={styles.bulletLikes}>•</Text>
                  <Text style={styles.comparisonText}>
                    {t("comparisonText", {
                      metric: t("likes"),
                      direction: likesGrowth >= 0 ? t("above") : t("below"),
                      percent: Math.abs(likesGrowth),
                    })}
                  </Text>
                </View>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              {post.url && (
                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={() => Linking.openURL(post.url!)}
                >
                  <ExternalLink size={16} color="#fff" />
                  <Text style={styles.primaryBtnText}>
                    {t("viewOn", { platform: config.label })}
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.outlineBtn} onPress={onClose}>
                <Text style={styles.outlineBtnText}>{t("close")}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#18181b",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: "#27272a",
    maxHeight: "90%",
  },
  // Header
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#27272a",
  },
  modalHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  platformIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  modalSubtitle: {
    fontSize: 12,
    color: "#71717a",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(39,39,42,0.5)",
  },
  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    gap: 24,
  },
  // Thumbnail
  thumbnailWrap: {
    aspectRatio: 16 / 9,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },
  thumbnailPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#18181b",
  },
  durationBadge: {
    position: "absolute",
    bottom: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  durationText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#fff",
  },
  // Meta
  metaSection: {
    gap: 12,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  metaRow: {
    gap: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: "#71717a",
  },
  // Stats
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#27272a",
    backgroundColor: "rgba(24,24,27,0.3)",
    // Use flex basis instead of fixed % so padding doesn't cause overflow
    flexBasis: "47%",
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  statCardBody: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  statLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  statLabel: {
    fontSize: 11,
    color: "#71717a",
    flexShrink: 1,
  },
  growthBadge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 999,
    flexShrink: 0,
  },
  growthText: {
    fontSize: 10,
    fontWeight: "500",
  },
  // Comparison
  comparisonBlock: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#27272a",
    backgroundColor: "rgba(24,24,27,0.5)",
    gap: 12,
  },
  comparisonHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  comparisonTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  comparisonList: {
    gap: 8,
  },
  comparisonItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  bulletViews: {
    color: "#34d399",
    fontSize: 14,
    marginTop: 2,
  },
  bulletLikes: {
    color: "#f472b6",
    fontSize: 14,
    marginTop: 2,
  },
  comparisonText: {
    flex: 1,
    fontSize: 13,
    color: "#a1a1aa",
    lineHeight: 20,
  },
  // Actions
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  primaryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#e91e8c",
  },
  primaryBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  outlineBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#3f3f46",
    backgroundColor: "transparent",
  },
  outlineBtnText: {
    fontSize: 14,
    color: "#a1a1aa",
  },
});

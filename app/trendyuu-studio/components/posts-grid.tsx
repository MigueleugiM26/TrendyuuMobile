import { useTranslations } from "@/src/hooks/useTranslations";
import {
  Clock,
  ExternalLink,
  Eye,
  Heart,
  MessageCircle,
  Play,
  Share2,
} from "lucide-react-native";
import { useState } from "react";
import { FaInstagram, FaTiktok, FaTwitter, FaYoutube } from "react-icons/fa";
import {
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { PostDetailModal } from "./post-detail-modal";
import type { SocialPlatform, SocialPost } from "./trendyuu-studio";
import { PLATFORM_CONFIG } from "./trendyuu-studio";

// ─── Helper Functions ─────────────────────────────────────────────────────────

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function formatDuration(seconds?: number): string {
  if (!seconds) return "";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor(
    Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays === 0) return "Hoje";
  if (diffDays === 1) return "Ontem";
  if (diffDays < 7) return `${diffDays} dias atrás`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} semanas atrás`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} meses atrás`;
  return `${Math.floor(diffDays / 365)} anos atrás`;
}

// ─── Shimmer Skeleton ─────────────────────────────────────────────────────────

function Shimmer({ style }: { style?: object }) {
  return <View style={[styles.shimmer, style]} />;
}

// ─── Post Card Skeleton ───────────────────────────────────────────────────────

function PostCardSkeleton() {
  return (
    <View style={styles.postCard}>
      {/* Thumbnail area */}
      <View style={styles.thumbnail}>
        <Shimmer style={StyleSheet.absoluteFillObject} />
        {/* Platform badge */}
        <View style={styles.thumbnailTopLeft}>
          <Shimmer style={styles.shimmerBadge} />
        </View>
        {/* Duration badge */}
        <View style={styles.thumbnailBottomRight}>
          <Shimmer style={styles.shimmerDuration} />
        </View>
      </View>
      {/* Content */}
      <View style={styles.postCardContent}>
        <View style={styles.shimmerTitleBlock}>
          <Shimmer style={styles.shimmerTitleLine1} />
          <Shimmer style={styles.shimmerTitleLine2} />
        </View>
        <Shimmer style={styles.shimmerDate} />
        <View style={styles.statsRow}>
          {[0, 1, 2, 3].map((i) => (
            <Shimmer key={i} style={styles.shimmerStat} />
          ))}
        </View>
      </View>
    </View>
  );
}

// ─── Platform Icon Component ──────────────────────────────────────────────────

function PlatformIcon({
  platform,
  size = 14,
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

// ─── Post Card Component ──────────────────────────────────────────────────────

interface PostCardProps {
  post: SocialPost;
  onClick: () => void;
}

function PostCard({ post, onClick }: PostCardProps) {
  const config =
    PLATFORM_CONFIG[post.platform as Exclude<SocialPlatform, "all">];
  if (!config) return null;

  return (
    <TouchableOpacity
      onPress={onClick}
      style={styles.postCard}
      activeOpacity={0.8}
    >
      {/* Thumbnail */}
      <View style={styles.thumbnail}>
        {post.thumbnail ? (
          <Image
            source={{ uri: post.thumbnail }}
            style={styles.thumbnailImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.thumbnailPlaceholder}>
            <Play size={48} color="#3f3f46" />
          </View>
        )}

        {/* Platform badge */}
        <View style={styles.thumbnailTopLeft}>
          <View
            style={[
              styles.platformBadge,
              {
                backgroundColor: config.bgColor,
                borderColor: config.borderColor,
              },
            ]}
          >
            <PlatformIcon platform={post.platform} size={14} />
            <Text style={styles.platformBadgeText}>{config.label}</Text>
          </View>
        </View>

        {/* Duration badge */}
        {!!post.duration && (
          <View style={styles.thumbnailBottomRight}>
            <View style={styles.durationBadge}>
              <Clock size={12} color="#a1a1aa" />
              <Text style={styles.durationText}>
                {formatDuration(post.duration)}
              </Text>
            </View>
          </View>
        )}

        {/* External link */}
        {post.url && (
          <TouchableOpacity
            style={styles.externalLinkBtn}
            onPress={() => Linking.openURL(post.url!)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <ExternalLink size={16} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      <View style={styles.postCardContent}>
        <Text style={styles.postTitle} numberOfLines={2}>
          {post.title}
        </Text>
        <Text style={styles.postDate}>{formatDate(post.publishedAt)}</Text>
        <View style={styles.statsRow}>
          <StatItem
            icon={<Eye size={14} color="#71717a" />}
            value={post.views}
          />
          <StatItem
            icon={<Heart size={14} color="#71717a" />}
            value={post.likes}
          />
          <StatItem
            icon={<MessageCircle size={14} color="#71717a" />}
            value={post.comments}
          />
          <StatItem
            icon={<Share2 size={14} color="#71717a" />}
            value={post.shares}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Stat Item Component ──────────────────────────────────────────────────────

function StatItem({ icon, value }: { icon: React.ReactNode; value: number }) {
  return (
    <View style={styles.statItem}>
      {icon}
      <Text style={styles.statValue}>{formatNumber(value)}</Text>
    </View>
  );
}

// ─── Empty State Component ────────────────────────────────────────────────────

type EmptyStateProps = {
  t: ReturnType<typeof useTranslations>;
};

function EmptyState({ t }: EmptyStateProps) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconWrap}>
        <Play size={32} color="#52525b" />
      </View>
      <Text style={styles.emptyTitle}>{t("noPostsFound")}</Text>
      <Text style={styles.emptyDescription}>{t("noPostsDescription")}</Text>
    </View>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface PostsGridProps {
  posts: SocialPost[];
  isLoading?: boolean;
  t: ReturnType<typeof useTranslations>;
}

export function PostsGrid({ posts, isLoading = false, t }: PostsGridProps) {
  const [selectedPost, setSelectedPost] = useState<SocialPost | null>(null);

  if (isLoading) {
    return (
      <View style={styles.grid}>
        <PostCardSkeleton />
        <PostCardSkeleton />
        <PostCardSkeleton />
      </View>
    );
  }

  if (posts.length === 0) {
    return <EmptyState t={t} />;
  }

  return (
    <>
      <View style={styles.grid}>
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onClick={() => setSelectedPost(post)}
          />
        ))}
      </View>
      <PostDetailModal
        post={selectedPost}
        allPosts={posts}
        isOpen={!!selectedPost}
        onClose={() => setSelectedPost(null)}
        t={t}
      />
    </>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: 16,
  },
  // Post card
  postCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#27272a",
    backgroundColor: "rgba(24,24,27,0.3)",
    overflow: "hidden",
  },
  thumbnail: {
    aspectRatio: 16 / 9,
    backgroundColor: "#09090b",
    position: "relative",
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
  thumbnailTopLeft: {
    position: "absolute",
    top: 8,
    left: 8,
  },
  thumbnailBottomRight: {
    position: "absolute",
    bottom: 8,
    right: 8,
  },
  platformBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  platformBadgeText: {
    fontSize: 10,
    fontWeight: "500",
    color: "#fff",
  },
  durationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  durationText: {
    fontSize: 10,
    fontWeight: "500",
    color: "#fff",
  },
  externalLinkBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  postCardContent: {
    padding: 16,
    gap: 12,
  },
  postTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#fff",
    lineHeight: 20,
  },
  postDate: {
    fontSize: 12,
    color: "#71717a",
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: "rgba(39,39,42,0.3)",
  },
  statValue: {
    fontSize: 11,
    fontWeight: "500",
    color: "#d4d4d8",
  },
  // Shimmer
  shimmer: {
    backgroundColor: "rgba(39,39,42,0.6)",
    borderRadius: 6,
  },
  shimmerBadge: {
    height: 24,
    width: 80,
    borderRadius: 8,
  },
  shimmerDuration: {
    height: 20,
    width: 48,
    borderRadius: 6,
  },
  shimmerTitleBlock: {
    gap: 6,
  },
  shimmerTitleLine1: {
    height: 14,
    width: "100%",
    borderRadius: 4,
  },
  shimmerTitleLine2: {
    height: 14,
    width: "75%",
    borderRadius: 4,
  },
  shimmerDate: {
    height: 12,
    width: 80,
    borderRadius: 4,
  },
  shimmerStat: {
    flex: 1,
    height: 48,
    borderRadius: 8,
  },
  // Empty
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#27272a",
    backgroundColor: "rgba(24,24,27,0.2)",
    gap: 8,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: "rgba(39,39,42,0.5)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  emptyDescription: {
    fontSize: 13,
    color: "#71717a",
    textAlign: "center",
    maxWidth: 320,
  },
});

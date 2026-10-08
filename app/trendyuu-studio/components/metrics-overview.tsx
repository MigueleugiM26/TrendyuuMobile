import { useTranslations } from "@/src/hooks/useTranslations";
import {
  Eye,
  Heart,
  MessageCircle,
  Play,
  Share2,
  Users,
} from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import type { GlobalMetrics, SocialPlatform } from "./trendyuu-studio";

// ─── Helper Functions ─────────────────────────────────────────────────────────

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

// ─── Shimmer Skeleton ─────────────────────────────────────────────────────────

function Shimmer({ style }: { style?: object }) {
  return <View style={[styles.shimmer, style]} />;
}

// ─── Metric Card Skeleton ─────────────────────────────────────────────────────

function MetricCardSkeleton() {
  return (
    <View style={styles.metricCard}>
      <Shimmer style={styles.shimmerIcon} />
      <View style={styles.metricCardBody}>
        <Shimmer style={styles.shimmerValue} />
        <Shimmer style={styles.shimmerLabel} />
      </View>
    </View>
  );
}

// ─── Glass Card Component ─────────────────────────────────────────────────────

function GlassCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: object;
}) {
  return <View style={[styles.glassCard, style]}>{children}</View>;
}

// ─── Metric Card Component ────────────────────────────────────────────────────

interface MetricCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}

function MetricCard({
  label,
  value,
  icon,
  iconBg,
  iconColor,
}: MetricCardProps) {
  return (
    <GlassCard style={styles.metricCard}>
      <View style={[styles.metricIconWrap, { backgroundColor: iconBg }]}>
        <View style={{ color: iconColor } as any}>{icon}</View>
      </View>
      <View style={styles.metricCardBody}>
        <Text style={styles.metricValue}>{formatNumber(value)}</Text>
        <Text style={styles.metricLabel}>{label}</Text>
      </View>
    </GlassCard>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface MetricsOverviewProps {
  metrics: GlobalMetrics;
  selectedPlatform: SocialPlatform;
  isLoading?: boolean;
  t: ReturnType<typeof useTranslations>;
}

export function MetricsOverview({
  metrics,
  selectedPlatform,
  isLoading = false,
  t,
}: MetricsOverviewProps) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>{t("overviewTitle")}</Text>
          <Text style={styles.sectionSubtitle}>
            {selectedPlatform === "all"
              ? t("combinedMetrics")
              : t("selectedPlatformMetrics")}
          </Text>
        </View>
      </View>

      <View style={styles.grid}>
        {isLoading ? (
          <>
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
          </>
        ) : (
          <>
            <MetricCard
              label={t("views")}
              value={metrics.totalViews}
              icon={<Eye size={20} color="#60a5fa" />}
              iconBg="rgba(59,130,246,0.1)"
              iconColor="#60a5fa"
            />
            <MetricCard
              label={t("likes")}
              value={metrics.totalLikes}
              icon={<Heart size={20} color="#f472b6" />}
              iconBg="rgba(236,72,153,0.1)"
              iconColor="#f472b6"
            />
            <MetricCard
              label={t("comments")}
              value={metrics.totalComments}
              icon={<MessageCircle size={20} color="#c084fc" />}
              iconBg="rgba(168,85,247,0.1)"
              iconColor="#c084fc"
            />
            <MetricCard
              label={t("shares")}
              value={metrics.totalShares}
              icon={<Share2 size={20} color="#34d399" />}
              iconBg="rgba(16,185,129,0.1)"
              iconColor="#34d399"
            />
            <MetricCard
              label={t("followers")}
              value={metrics.totalFollowers}
              icon={<Users size={20} color="#fbbf24" />}
              iconBg="rgba(245,158,11,0.1)"
              iconColor="#fbbf24"
            />
            <MetricCard
              label={t("posts")}
              value={metrics.totalPosts}
              icon={<Play size={20} color="#22d3ee" />}
              iconBg="rgba(6,182,212,0.1)"
              iconColor="#22d3ee"
            />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#71717a",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  glassCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.04)",
    padding: 16,
    width: "47%",
  },
  metricCard: {
    gap: 12,
  },
  metricIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  metricCardBody: {
    gap: 4,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
  },
  metricLabel: {
    fontSize: 12,
    color: "#71717a",
  },
  // Shimmer
  shimmer: {
    backgroundColor: "rgba(39,39,42,0.6)",
    borderRadius: 6,
  },
  shimmerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
  },
  shimmerValue: {
    height: 28,
    width: 80,
    borderRadius: 4,
  },
  shimmerLabel: {
    height: 12,
    width: 96,
    borderRadius: 4,
    marginTop: 4,
  },
});

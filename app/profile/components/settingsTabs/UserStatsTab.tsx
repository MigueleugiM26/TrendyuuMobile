import { useTranslations } from "@/src/hooks/useTranslations";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  BarChart2,
  Clock,
  Eye,
  Film,
  Folder,
  Heart,
  Layers,
  LayoutTemplate,
  Scissors,
  Users,
  Zap,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

const BACKEND = process.env.EXPO_PUBLIC_TRENDYUU_URL_BACK;

// ─── Types ────────────────────────────────────────────────────────────────────

type VideoData = {
  videos_created: number;
  time_saved: number;
  total_views: number;
  total_likes: number;
  total_storage_mb: number;
  images_created: number;
  audios_created: number;
};

type TemplateData = {
  templates_created: number;
  template_views: number;
  template_likes: number;
  template_used_by_others: number;
};

type StatsPayload = {
  totalVideoData: VideoData;
  totalTemplateData: TemplateData;
  credits: number;
  points: number;
  clipsCredits: number;
  shortsCredits: number;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
}

function formatStorage(mb: number): string {
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  if (mb < 1) return `${(mb * 1024).toFixed(0)} KB`;
  return `${mb.toFixed(1)} MB`;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

// ─── Accent map ───────────────────────────────────────────────────────────────

const ACCENT: Record<string, { icon: string; bg: string; ring: string }> = {
  pink: {
    icon: "#f472b6",
    bg: "rgba(236,72,153,0.10)",
    ring: "rgba(236,72,153,0.20)",
  },
  blue: {
    icon: "#60a5fa",
    bg: "rgba(59,130,246,0.10)",
    ring: "rgba(59,130,246,0.20)",
  },
  purple: {
    icon: "#c084fc",
    bg: "rgba(168,85,247,0.10)",
    ring: "rgba(168,85,247,0.20)",
  },
  emerald: {
    icon: "#34d399",
    bg: "rgba(52,211,153,0.10)",
    ring: "rgba(52,211,153,0.20)",
  },
  amber: {
    icon: "#fbbf24",
    bg: "rgba(251,191,36,0.10)",
    ring: "rgba(251,191,36,0.20)",
  },
};

// ─── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  accent = "pink",
}: {
  icon: React.ReactElement;
  label: string;
  value: string | number;
  accent?: keyof typeof ACCENT;
}) {
  const a = ACCENT[accent];
  return (
    <View style={styles.statCard}>
      <View
        style={[
          styles.statIconCircle,
          { backgroundColor: a.bg, borderColor: a.ring },
        ]}
      >
        {React.cloneElement(icon as React.ReactElement<any>, {
          size: 18,
          color: a.icon,
        })}
      </View>
      <View style={styles.statText}>
        <Text style={styles.statLabel} numberOfLines={1}>
          {label}
        </Text>
        <Text style={styles.statValue}>{value}</Text>
      </View>
    </View>
  );
}

// ─── SectionHeader ────────────────────────────────────────────────────────────

function SectionHeader({ label }: { label: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{label}</Text>
      <View style={styles.sectionHeaderLine} />
    </View>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function UserStatsTab({ userId }: { userId: string }) {
  const t = useTranslations("Profile");
  const [stats, setStats] = useState<StatsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        const res = await fetch(
          `${BACKEND}/api/authentication/users/${userId}/partial`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (!res.ok) throw new Error("Failed");
        setStats(await res.json());
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [userId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="small" color="#71717a" />
        <Text style={styles.centeredText}>{t("statsLoading")}</Text>
      </View>
    );
  }

  if (error || !stats) {
    return (
      <View style={styles.centered}>
        <BarChart2 size={32} color="#3f3f46" />
        <Text style={styles.centeredText}>{t("statsError")}</Text>
      </View>
    );
  }

  const v = stats.totalVideoData ?? {};
  const tpl = stats.totalTemplateData ?? {};

  return (
    <View style={styles.container}>
      {/* Content Production */}
      <SectionHeader label={t("statsContentProduction")} />
      <View style={styles.grid}>
        <StatCard
          icon={<Folder />}
          label={t("statsVideosCreated")}
          value={formatNumber(v.videos_created ?? 0)}
          accent="pink"
        />
        <StatCard
          icon={<Clock />}
          label={t("statsTimeSaved")}
          value={formatTime(v.time_saved ?? 0)}
          accent="emerald"
        />
      </View>

      {/* Reach & Engagement */}
      <SectionHeader label={t("statsReachEngagement")} />
      <View style={styles.grid}>
        <StatCard
          icon={<Eye />}
          label={t("statsTotalViews")}
          value={formatNumber(v.total_views ?? 0)}
          accent="pink"
        />
        <StatCard
          icon={<Heart />}
          label={t("statsTotalLikes")}
          value={formatNumber(v.total_likes ?? 0)}
          accent="pink"
        />
        <StatCard
          icon={<Layers />}
          label={t("statsStorageUsed")}
          value={formatStorage(v.total_storage_mb ?? 0)}
          accent="amber"
        />
      </View>

      {/* Templates */}
      <SectionHeader label={t("statsTemplates")} />
      <View style={styles.grid}>
        <StatCard
          icon={<LayoutTemplate />}
          label={t("statsTemplatesCreated")}
          value={formatNumber(tpl.templates_created ?? 0)}
          accent="blue"
        />
        <StatCard
          icon={<Eye />}
          label={t("statsTemplateViews")}
          value={formatNumber(tpl.template_views ?? 0)}
          accent="blue"
        />
        <StatCard
          icon={<Heart />}
          label={t("statsTemplateLikes")}
          value={formatNumber(tpl.template_likes ?? 0)}
          accent="blue"
        />
        <StatCard
          icon={<Users />}
          label={t("statsTemplateUsedByOthers")}
          value={formatNumber(tpl.template_used_by_others ?? 0)}
          accent="purple"
        />
      </View>

      {/* Account Resources */}
      <SectionHeader label={t("statsAccountResources")} />
      <View style={styles.grid}>
        <StatCard
          icon={<Zap />}
          label={t("statsCredits")}
          value={formatNumber(stats.credits ?? 0)}
          accent="pink"
        />
        <StatCard
          icon={<Scissors />}
          label={t("statsClipsCredits")}
          value={stats.clipsCredits ?? 0}
          accent="blue"
        />
        <StatCard
          icon={<Film />}
          label={t("statsShortsCredits")}
          value={stats.shortsCredits ?? 0}
          accent="purple"
        />
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    gap: 8,
  },
  centeredText: {
    fontSize: 13,
    color: "#71717a",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 8,
  },
  sectionHeaderText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#71717a",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  sectionHeaderLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(39,39,42,0.6)",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statCard: {
    width: "48%",
    backgroundColor: "rgba(24,24,27,0.5)",
    borderWidth: 1,
    borderColor: "rgba(39,39,42,0.6)",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    flexShrink: 0,
  },
  statText: {
    flex: 1,
    minWidth: 0,
  },
  statLabel: {
    fontSize: 11,
    color: "#71717a",
    marginBottom: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#f4f4f5",
    lineHeight: 22,
  },
});

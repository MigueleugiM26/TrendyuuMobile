import { useTranslations } from "@/src/hooks/useTranslations";
import { useRouter } from "expo-router";
import { CheckCircle, Plus, Settings } from "lucide-react-native";
import { FaInstagram, FaTiktok, FaTwitter, FaYoutube } from "react-icons/fa";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { ConnectedAccount, SocialPlatform } from "./trendyuu-studio";
import { PLATFORM_CONFIG } from "./trendyuu-studio";

// ─── Helper Functions ─────────────────────────────────────────────────────────

function formatFollowers(num?: number): string {
  if (!num) return "0";
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

// ─── Shimmer Skeleton ─────────────────────────────────────────────────────────

function Shimmer({ style }: { style?: object }) {
  return <View style={[styles.shimmer, style]} />;
}

// ─── Account Card Skeleton ────────────────────────────────────────────────────

function AccountCardSkeleton() {
  return (
    <View style={styles.accountCard}>
      <Shimmer style={styles.shimmerIcon} />
      <View style={styles.accountCardBody}>
        <View style={styles.shimmerRow}>
          <Shimmer style={styles.shimmerName} />
          <Shimmer style={styles.shimmerCheck} />
        </View>
        <Shimmer style={styles.shimmerSubtitle} />
      </View>
    </View>
  );
}

// ─── Platform Pill Skeleton ───────────────────────────────────────────────────

function PillSkeleton({ width }: { width: number }) {
  return <Shimmer style={[styles.pillSkeleton, { width }]} />;
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
  if (!config) return null;
  const icons: Record<Exclude<SocialPlatform, "all">, React.ReactNode> = {
    youtube: <FaYoutube size={size} color={config.color} />,
    tiktok: <FaTiktok size={size} color={config.color} />,
    instagram: <FaInstagram size={size} color={config.color} />,
    twitter: <FaTwitter size={size} color={config.color} />,
  };
  if (platform === "all") return null;
  return icons[platform] || null;
}

// ─── Account Card Component ───────────────────────────────────────────────────

interface AccountCardProps {
  account: ConnectedAccount;
  isSelected: boolean;
  onSelect: () => void;
  t: ReturnType<typeof useTranslations>;
}

function AccountCard({ account, isSelected, onSelect, t }: AccountCardProps) {
  const config =
    PLATFORM_CONFIG[account.platform as Exclude<SocialPlatform, "all">];
  if (!config) return null;

  return (
    <TouchableOpacity
      onPress={onSelect}
      style={[
        styles.accountCard,
        isSelected ? styles.accountCardSelected : styles.accountCardDefault,
      ]}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.accountIconWrap,
          {
            backgroundColor: config.bgColor,
            borderColor: config.borderColor,
          },
        ]}
      >
        <PlatformIcon platform={account.platform} size={20} />
      </View>
      <View style={styles.accountCardBody}>
        <View style={styles.accountCardNameRow}>
          <Text style={styles.accountCardName} numberOfLines={1}>
            {account.displayName || account.username}
          </Text>
          {account.isConnected && <CheckCircle size={14} color="#34d399" />}
        </View>
        <Text style={styles.accountCardSubtitle} numberOfLines={1}>
          @{account.username} · {formatFollowers(account.followers)}{" "}
          {t("followers")}
        </Text>
      </View>
      {isSelected && <View style={styles.accountCardDot} />}
    </TouchableOpacity>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface AccountSelectorProps {
  accounts: ConnectedAccount[];
  selectedPlatform: SocialPlatform;
  onSelectPlatform: (platform: SocialPlatform) => void;
  isLoading: boolean;
  t: ReturnType<typeof useTranslations>;
}

export function AccountSelector({
  accounts,
  selectedPlatform,
  onSelectPlatform,
  isLoading,
  t,
}: AccountSelectorProps) {
  const router = useRouter();

  const accountsByPlatform = accounts.reduce(
    (acc, account) => {
      if (!acc[account.platform]) acc[account.platform] = [];
      acc[account.platform].push(account);
      return acc;
    },
    {} as Record<SocialPlatform, ConnectedAccount[]>,
  );

  const connectedPlatforms = Object.keys(
    accountsByPlatform,
  ) as SocialPlatform[];

  return (
    <View style={styles.section}>
      {/* Header */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionHeaderText}>
          <Text style={styles.sectionTitle}>{t("connectedAccounts")}</Text>
          <Text style={styles.sectionSubtitle}>{t("selectPlatform")}</Text>
        </View>
        <TouchableOpacity
          style={styles.outlineButton}
          onPress={() => router.push("/profile")}
        >
          <Settings size={16} color="#a1a1aa" />
          <Text style={styles.outlineButtonText}>{t("manageAccounts")}</Text>
        </TouchableOpacity>
      </View>

      {/* Platform Filter Pills */}
      {isLoading ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.pillsRow}
        >
          <PillSkeleton width={144} />
          <View style={styles.pillGap} />
          <PillSkeleton width={112} />
          <View style={styles.pillGap} />
          <PillSkeleton width={96} />
        </ScrollView>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.pillsRow}
        >
          <TouchableOpacity
            onPress={() => onSelectPlatform("all")}
            style={[
              styles.pill,
              selectedPlatform === "all"
                ? styles.pillSelected
                : styles.pillDefault,
            ]}
          >
            <Text
              style={[
                styles.pillText,
                selectedPlatform === "all"
                  ? styles.pillTextSelected
                  : styles.pillTextDefault,
              ]}
            >
              {t("allPlatforms")}
            </Text>
          </TouchableOpacity>
          {connectedPlatforms.map((platform) => {
            const config =
              PLATFORM_CONFIG[platform as Exclude<SocialPlatform, "all">];
            if (!config) return null;
            const count = accountsByPlatform[platform]?.length || 0;
            return (
              <TouchableOpacity
                key={platform}
                onPress={() => onSelectPlatform(platform)}
                style={[
                  styles.pill,
                  styles.pillWithIcon,
                  selectedPlatform === platform
                    ? styles.pillSelected
                    : styles.pillDefault,
                ]}
              >
                <PlatformIcon platform={platform} size={16} />
                <Text
                  style={[
                    styles.pillText,
                    selectedPlatform === platform
                      ? styles.pillTextSelected
                      : styles.pillTextDefault,
                  ]}
                >
                  {config.label}
                </Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{count}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Account Cards */}
      {isLoading ? (
        <View style={styles.accountsGrid}>
          <AccountCardSkeleton />
          <AccountCardSkeleton />
          <AccountCardSkeleton />
        </View>
      ) : accounts.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconWrap}>
            <Plus size={32} color="#52525b" />
          </View>
          <Text style={styles.emptyTitle}>{t("noAccountsTitle")}</Text>
          <Text style={styles.emptyDescription}>
            {t("noAccountsDescription")}
          </Text>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => router.push("/profile")}
          >
            <Plus size={16} color="#fff" />
            <Text style={styles.ctaButtonText}>{t("connectAccount")}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.accountsGrid}>
          {accounts
            .filter(
              (acc) =>
                selectedPlatform === "all" || acc.platform === selectedPlatform,
            )
            .map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                isSelected={
                  selectedPlatform === account.platform ||
                  selectedPlatform === "all"
                }
                onSelect={() => onSelectPlatform(account.platform)}
                t={t}
              />
            ))}
        </View>
      )}
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
    gap: 12,
  },
  sectionHeaderText: {
    flex: 1,
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
  // Pills
  pillsRow: {
    flexDirection: "row",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 8,
  },
  pillWithIcon: {
    gap: 8,
  },
  pillSelected: {
    borderColor: "rgba(236,72,153,0.5)",
    backgroundColor: "rgba(236,72,153,0.1)",
  },
  pillDefault: {
    borderColor: "#27272a",
    backgroundColor: "rgba(24,24,27,0.3)",
  },
  pillText: {
    fontSize: 14,
    fontWeight: "500",
  },
  pillTextSelected: {
    color: "#f472b6",
  },
  pillTextDefault: {
    color: "#71717a",
  },
  pillGap: {
    width: 8,
  },
  pillSkeleton: {
    height: 36,
    borderRadius: 999,
    marginRight: 8,
  },
  badge: {
    backgroundColor: "#27272a",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 0,
  },
  badgeText: {
    fontSize: 10,
    color: "#71717a",
  },
  // Account cards
  accountsGrid: {
    gap: 12,
  },
  accountCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  accountCardSelected: {
    borderColor: "rgba(236,72,153,0.5)",
    backgroundColor: "rgba(236,72,153,0.05)",
  },
  accountCardDefault: {
    borderColor: "#27272a",
    backgroundColor: "rgba(24,24,27,0.3)",
  },
  accountIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  accountCardBody: {
    flex: 1,
    gap: 4,
  },
  accountCardNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  accountCardName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#fff",
    flex: 1,
  },
  accountCardSubtitle: {
    fontSize: 12,
    color: "#71717a",
  },
  accountCardDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ec4899",
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
  shimmerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  shimmerName: {
    height: 14,
    width: 112,
    borderRadius: 4,
  },
  shimmerCheck: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  shimmerSubtitle: {
    height: 12,
    width: 144,
    borderRadius: 4,
  },
  // Empty state
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
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
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#e91e8c",
    marginTop: 8,
  },
  ctaButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
});

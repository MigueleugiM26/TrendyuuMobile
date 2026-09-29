import { useUser } from "@/src/context/user-context";
import { useTranslations } from "@/src/hooks/useTranslations";
import { useRouter } from "expo-router";
import { Crown, LogOut, ShoppingBag, User } from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { NotificationMenu } from "./NotificationMenu";

// ─── Constants ────────────────────────────────────────────────────────────────

const PLAN_MAX_CREDITS: Record<string, number> = {
  free: 1800,
  essential: 28000,
  creator: 87500,
  agency: 280000,
};

// ─── User Menu Modal ──────────────────────────────────────────────────────────

function UserMenu({
  visible,
  onClose,
  onUpgrade,
  onBuyCredits,
}: {
  visible: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  onBuyCredits: () => void;
}) {
  const t = useTranslations("dashboard.header");
  const { user, currentPlan, logout, userCredits } = useUser();
  const router = useRouter();
  const slideAnim = useRef(new Animated.Value(300)).current;

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
        toValue: 300,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const planKey = currentPlan?.toLowerCase() ?? "free";
  const maxCredits = PLAN_MAX_CREDITS[planKey] ?? 0;
  const credits = userCredits ?? 0;
  const remainingPercent =
    maxCredits > 0
      ? Math.min(100, Math.round((credits / maxCredits) * 100))
      : 0;
  const ringColor =
    remainingPercent > 50
      ? "#22c55e"
      : remainingPercent > 20
        ? "#eab308"
        : "#ef4444";
  const canBuyCredits = ["essential", "creator", "agency"].includes(planKey);
  const fmt = (n: number) => n.toLocaleString("pt-BR");

  function handleLogout() {
    onClose();
    logout();
    router.replace("/");
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable style={menu.backdrop} onPress={onClose} />
      <Animated.View
        style={[menu.panel, { transform: [{ translateX: slideAnim }] }]}
      >
        {/* User info */}
        <View style={menu.userRow}>
          {user?.image ? (
            <Image source={{ uri: user.image }} style={menu.avatar} />
          ) : (
            <View style={[menu.avatar, menu.avatarFallback]}>
              <Text style={menu.avatarLetter}>
                {user?.name?.[0]?.toUpperCase()}
              </Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={menu.userName} numberOfLines={1}>
              {user?.name}
            </Text>
            <Text style={menu.userEmail} numberOfLines={1}>
              {user?.email}
            </Text>
          </View>
        </View>

        {/* Credits bar */}
        {maxCredits > 0 && (
          <View style={menu.creditsCard}>
            <View style={menu.creditsRow}>
              <Text style={menu.creditsLabel}>{t("availableCredits")}</Text>
              <Text style={[menu.creditsPercent, { color: ringColor }]}>
                {remainingPercent}% {t("remaining")}
              </Text>
            </View>
            <View style={menu.progressBg}>
              <View
                style={[
                  menu.progressFill,
                  {
                    width: `${remainingPercent}%` as any,
                    backgroundColor: ringColor,
                  },
                ]}
              />
            </View>
            <Text style={menu.creditNums}>
              {fmt(credits)}{" "}
              <Text style={menu.creditMax}>/ {fmt(maxCredits)} cr</Text>
            </Text>
          </View>
        )}

        {/* Menu items */}
        <View style={menu.items}>
          <Pressable
            onPress={() => {
              onClose();
              router.push("/profile");
            }}
            style={({ pressed }) => [menu.item, pressed && menu.itemPressed]}
          >
            <User size={16} color="#a1a1aa" />
            <Text style={menu.itemText}>{t("profile")}</Text>
          </Pressable>

          {canBuyCredits && (
            <Pressable
              onPress={() => {
                onClose();
                onBuyCredits();
              }}
              style={({ pressed }) => [menu.item, pressed && menu.itemPressed]}
            >
              <ShoppingBag size={16} color="#a1a1aa" />
              <Text style={menu.itemText}>{t("buyCredits")}</Text>
            </Pressable>
          )}

          {planKey === "free" && (
            <Pressable
              onPress={() => {
                onClose();
                onUpgrade();
              }}
              style={({ pressed }) => [menu.item, pressed && menu.itemPressed]}
            >
              <Crown size={16} color="#ec4899" />
              <Text style={[menu.itemText, { color: "#ec4899" }]}>
                {t("upgradeToAgency")}
              </Text>
            </Pressable>
          )}

          <View style={menu.divider} />

          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => [menu.item, pressed && menu.itemPressed]}
          >
            <LogOut size={16} color="#f87171" />
            <Text style={[menu.itemText, { color: "#f87171" }]}>
              {t("signOut")}
            </Text>
          </Pressable>
        </View>
      </Animated.View>
    </Modal>
  );
}

const menu = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  panel: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: 280,
    backgroundColor: "#09090b",
    borderLeftWidth: 1,
    borderLeftColor: "#27272a",
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "#ec4899",
  },
  avatarFallback: {
    backgroundColor: "#ec4899",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter: { color: "#fff", fontWeight: "700", fontSize: 18 },
  userName: { fontSize: 14, fontWeight: "600", color: "#fff" },
  userEmail: { fontSize: 12, color: "#71717a", marginTop: 2 },
  creditsCard: {
    backgroundColor: "#18181b",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#27272a",
    padding: 12,
    marginBottom: 12,
    gap: 8,
  },
  creditsRow: { flexDirection: "row", justifyContent: "space-between" },
  creditsLabel: { fontSize: 11, color: "#71717a" },
  creditsPercent: { fontSize: 11, fontWeight: "600" },
  progressBg: {
    height: 6,
    backgroundColor: "#27272a",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 3 },
  creditNums: { fontSize: 14, fontWeight: "700", color: "#fff" },
  creditMax: { fontSize: 11, fontWeight: "400", color: "#52525b" },
  items: { gap: 2 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  itemPressed: { backgroundColor: "#18181b" },
  itemText: { fontSize: 14, color: "#d4d4d8" },
  divider: { height: 1, backgroundColor: "#27272a", marginVertical: 4 },
});

// ─── Header ───────────────────────────────────────────────────────────────────

interface HeaderProps {
  onUpgrade: () => void;
  onBuyCredits: () => void;
}

export function Header({ onUpgrade, onBuyCredits }: HeaderProps) {
  const t = useTranslations("dashboard.header");
  const { user, loading, currentPlan } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);

  const greeting = useMemo(() => {
    if (!user?.name) return "";
    const firstName = user.name.split(" ")[0];
    const hour = new Date().getHours();
    const period = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "night";
    const keys = [
      t(`greetings.${period}.1`, { name: firstName }),
      t(`greetings.${period}.2`, { name: firstName }),
      t(`greetings.${period}.3`, { name: firstName }),
    ];
    return keys[Math.floor(Math.random() * keys.length)];
  }, [user?.name]);

  const planKey = currentPlan?.toLowerCase() ?? "free";
  const planDisplayName = currentPlan
    ? currentPlan[0].toUpperCase() + currentPlan.slice(1)
    : "Free";

  if (loading) {
    return (
      <View style={styles.root}>
        <View style={[styles.skeleton, { width: 160, height: 16 }]} />
        <View
          style={[styles.skeleton, { width: 32, height: 32, borderRadius: 16 }]}
        />
      </View>
    );
  }

  return (
    <>
      <View style={styles.root}>
        {/* Greeting */}
        <View style={{ flex: 1 }}>
          {user && (
            <Text style={styles.greeting} numberOfLines={1}>
              {greeting}
            </Text>
          )}
        </View>

        {/* Right side */}
        <View style={styles.right}>
          {/* Upgrade button for non-agency */}
          {user && planKey !== "agency" && (
            <Pressable
              onPress={onUpgrade}
              style={({ pressed }) => [
                styles.upgradeBtn,
                pressed && { opacity: 0.85 },
              ]}
            >
              <Crown size={12} color="#fff" />
              <Text style={styles.upgradeBtnText}>{planDisplayName}</Text>
            </Pressable>
          )}

          <NotificationMenu />

          {/* Avatar */}
          {user && (
            <Pressable onPress={() => setMenuOpen(true)}>
              {user.image ? (
                <Image source={{ uri: user.image }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarFallback]}>
                  <Text style={styles.avatarLetter}>
                    {user.name?.[0]?.toUpperCase()}
                  </Text>
                </View>
              )}
            </Pressable>
          )}
        </View>
      </View>

      <UserMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        onUpgrade={onUpgrade}
        onBuyCredits={onBuyCredits}
      />
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#000",
    borderBottomWidth: 1,
    borderBottomColor: "#18181b",
  },
  greeting: { fontSize: 16, fontWeight: "600", color: "#fff" },
  right: { flexDirection: "row", alignItems: "center", gap: 8 },
  upgradeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(236,72,153,0.7)",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "rgba(236,72,153,0.5)",
  },
  upgradeBtnText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: "#ec4899",
  },
  avatarFallback: {
    backgroundColor: "#ec4899",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter: { color: "#fff", fontWeight: "700", fontSize: 14 },
  skeleton: { backgroundColor: "#18181b", borderRadius: 4 },
});

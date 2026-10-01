import { useTranslations } from "@/src/hooks/useTranslations";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { X } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

// ─── Discord SVG path (inline, no external asset needed) ─────────────────────
// Rendered via react-native-svg Svg + Path

import Svg, { Path } from "react-native-svg";

// ─── Constants ────────────────────────────────────────────────────────────────

const DISCORD_URL = "https://discord.gg/ESMmfTanCJ";
const SHOW_AFTER_MS = 20 * 60 * 1000; // 20 minutes
const IDLE_CUTOFF_MS = 5 * 60 * 1000; // 5 minutes idle = don't count
const CHECK_INTERVAL = 10_000; // 10 seconds

const KEYS = {
  shown: "discordPopupShown",
  totalTime: "discordTotalTimeSpent",
  lastActive: "discordLastActiveTime",
} as const;

function DiscordLogo({
  size = 36,
  color = "#fff",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </Svg>
  );
}

// ─── DiscordPopup ─────────────────────────────────────────────────────────────

export function DiscordPopup() {
  const t = useTranslations("discordPopup");
  const [isVisible, setIsVisible] = useState(false);

  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.9)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(20)).current;
  const iconScale = useRef(new Animated.Value(0)).current;

  // ── Time tracking (identical logic to web) ────────────────────────────────

  const getTotalTimeSpent = async (): Promise<number> => {
    const stored = await AsyncStorage.getItem(KEYS.totalTime);
    return stored ? parseInt(stored, 10) : 0;
  };

  const updateTotalTime = async () => {
    const lastActive = await AsyncStorage.getItem(KEYS.lastActive);
    const now = Date.now();
    if (lastActive) {
      const timeSince = now - parseInt(lastActive, 10);
      if (timeSince < IDLE_CUTOFF_MS) {
        const current = await getTotalTimeSpent();
        await AsyncStorage.setItem(
          KEYS.totalTime,
          (current + timeSince).toString(),
        );
      }
    }
    await AsyncStorage.setItem(KEYS.lastActive, now.toString());
  };

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;
    let cancelled = false;

    const init = async () => {
      const hasShown = await AsyncStorage.getItem(KEYS.shown);
      if (hasShown) return;

      await updateTotalTime();
      if ((await getTotalTimeSpent()) >= SHOW_AFTER_MS) {
        if (!cancelled) setIsVisible(true);
        return;
      }

      intervalId = setInterval(async () => {
        await updateTotalTime();
        if ((await getTotalTimeSpent()) >= SHOW_AFTER_MS && !cancelled) {
          setIsVisible(true);
          clearInterval(intervalId);
        }
      }, CHECK_INTERVAL);
    };

    init();

    return () => {
      cancelled = true;
      clearInterval(intervalId);
      updateTotalTime();
    };
  }, []);

  // ── Animate in ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isVisible) return;
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.spring(cardScale, {
        toValue: 1,
        tension: 80,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.spring(cardTranslateY, {
        toValue: 0,
        tension: 80,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
    setTimeout(() => {
      Animated.spring(iconScale, {
        toValue: 1,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }, 200);
  }, [isVisible]);

  // ── Animate out ───────────────────────────────────────────────────────────

  const animateOut = (onDone: () => void) => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(cardScale, {
        toValue: 0.9,
        tension: 80,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.spring(cardTranslateY, {
        toValue: 20,
        tension: 80,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start(() => {
      backdropOpacity.setValue(0);
      cardScale.setValue(0.9);
      cardOpacity.setValue(0);
      cardTranslateY.setValue(20);
      iconScale.setValue(0);
      onDone();
    });
  };

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleClose = () => {
    animateOut(async () => {
      setIsVisible(false);
      await AsyncStorage.setItem(KEYS.shown, "true");
    });
  };

  const handleMaybeLater = () => {
    animateOut(async () => {
      setIsVisible(false);
      await AsyncStorage.multiRemove([KEYS.totalTime, KEYS.lastActive]);
    });
  };

  const handleJoinDiscord = async () => {
    handleClose();
    const canOpen = await Linking.canOpenURL(DISCORD_URL);
    if (canOpen) Linking.openURL(DISCORD_URL);
  };

  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={handleMaybeLater}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
      </Animated.View>

      {/* Card */}
      <View style={styles.centered} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.card,
            {
              opacity: cardOpacity,
              transform: [{ scale: cardScale }, { translateY: cardTranslateY }],
            },
          ]}
        >
          {/* Indigo/violet overlay — mirrors `from-indigo-500/10 to-violet-500/10` */}
          <View style={styles.gradientOverlay} pointerEvents="none" />

          {/* Close */}
          <Pressable onPress={handleClose} style={styles.closeBtn} hitSlop={8}>
            <X size={20} color="#a1a1aa" />
          </Pressable>

          {/* Content */}
          <View style={styles.content}>
            {/* Discord icon — mirrors `w-16 h-16 bg-[#5865F2] rounded-full` */}
            <Animated.View
              style={[
                styles.iconWrapper,
                { transform: [{ scale: iconScale }] },
              ]}
            >
              <DiscordLogo size={36} color="#fff" />
            </Animated.View>

            {/* Title + description */}
            <View style={styles.textGroup}>
              <Text style={styles.title}>{t("title")}</Text>
              <Text style={styles.description}>{t("description")}</Text>
            </View>

            {/* Buttons */}
            <View style={styles.buttonsRow}>
              <Pressable
                onPress={handleMaybeLater}
                style={({ pressed }) => [
                  styles.laterBtn,
                  pressed && styles.btnPressed,
                ]}
              >
                <Text style={styles.laterBtnText}>{t("maybeLater")}</Text>
              </Pressable>

              <Pressable
                onPress={handleJoinDiscord}
                style={({ pressed }) => [
                  styles.discordBtn,
                  pressed && styles.btnPressed,
                ]}
              >
                <DiscordLogo size={16} color="#fff" />
                <Text style={styles.discordBtnText}>{t("joinServer")}</Text>
              </Pressable>
            </View>

            {/* Don't show again */}
            <Pressable onPress={handleClose} hitSlop={8}>
              <Text style={styles.dismissText}>{t("dontShowAgain")}</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  card: {
    width: "100%",
    maxWidth: 448,
    backgroundColor: "#0a0a0c",
    borderWidth: 1,
    borderColor: "rgba(63,63,70,0.5)",
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  // Mirrors `from-indigo-500/10 via-transparent to-violet-500/10 opacity-50`
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(99,102,241,0.06)",
  },
  closeBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 4,
    borderRadius: 99,
  },
  content: {
    padding: 32,
    alignItems: "center",
    gap: 24,
  },
  // Mirrors `w-16 h-16 bg-[#5865F2] rounded-full`
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 99,
    backgroundColor: "#5865F2",
    alignItems: "center",
    justifyContent: "center",
  },
  textGroup: {
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: "#a1a1aa",
    lineHeight: 20,
    textAlign: "center",
  },
  buttonsRow: {
    width: "100%",
    gap: 12,
    paddingTop: 8,
  },
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  // Mirrors `bg-zinc-800 … py-3 px-6 rounded-lg`
  laterBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#27272a",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  laterBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  // Mirrors `bg-[#5865F2] … py-3 px-6 rounded-lg`
  discordBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#5865F2",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  discordBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  dismissText: {
    fontSize: 12,
    color: "#71717a",
  },
});

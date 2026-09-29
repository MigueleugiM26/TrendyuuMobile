import { useTranslations } from "@/src/hooks/useTranslations";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as WebBrowser from "expo-web-browser";
import { X } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const DISCORD_URL = "https://discord.gg/ESMmfTanCJ";
const SHOW_AFTER_MS = 20 * 60 * 1000; // 20 minutes
const IDLE_MAX_MS = 5 * 60 * 1000;
const CHECK_EVERY_MS = 10_000;

const KEYS = {
  shown: "discordPopupShown",
  totalTime: "discordTotalTimeSpent",
  lastActive: "discordLastActiveTime",
} as const;

// Discord logo as inline SVG path rendered via View+Text fallback
// We use the FA5 icon brand name "discord" — or draw it manually here
function DiscordLogo({ size = 36 }: { size?: number }) {
  return <Text style={{ fontSize: size * 0.8, color: "#fff" }}>⌘</Text>;
}

export function DiscordPopup() {
  const t = useTranslations("discordPopup");
  const [visible, setVisible] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    async function init() {
      const hasShown = await AsyncStorage.getItem(KEYS.shown);
      if (hasShown) return;

      await updateTime();
      const total = await getTotal();
      if (total >= SHOW_AFTER_MS) {
        show();
        return;
      }

      interval = setInterval(async () => {
        await updateTime();
        const curr = await getTotal();
        if (curr >= SHOW_AFTER_MS) {
          show();
          clearInterval(interval);
        }
      }, CHECK_EVERY_MS);
    }

    init();
    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          bounciness: 6,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  async function getTotal(): Promise<number> {
    const s = await AsyncStorage.getItem(KEYS.totalTime);
    return s ? parseInt(s) : 0;
  }

  async function updateTime() {
    const lastStr = await AsyncStorage.getItem(KEYS.lastActive);
    const now = Date.now();
    if (lastStr) {
      const diff = now - parseInt(lastStr);
      if (diff < IDLE_MAX_MS) {
        const current = await getTotal();
        await AsyncStorage.setItem(KEYS.totalTime, (current + diff).toString());
      }
    }
    await AsyncStorage.setItem(KEYS.lastActive, now.toString());
  }

  function show() {
    setVisible(true);
  }

  async function handleClose() {
    setVisible(false);
    await AsyncStorage.setItem(KEYS.shown, "true");
  }

  async function handleMaybeLater() {
    setVisible(false);
    await AsyncStorage.multiRemove([KEYS.totalTime, KEYS.lastActive]);
  }

  function handleJoin() {
    handleClose();
    WebBrowser.openBrowserAsync(DISCORD_URL);
  }

  if (!visible) return null;

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.backdrop} onPress={handleClose} />
      <View style={styles.center}>
        <Animated.View
          style={[
            styles.card,
            { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
          ]}
        >
          {/* Indigo glow */}
          <View style={styles.glow} />

          {/* Close */}
          <Pressable onPress={handleClose} style={styles.closeBtn}>
            <X size={18} color="#a1a1aa" />
          </Pressable>

          {/* Discord icon */}
          <View style={styles.iconWrap}>
            {/* FontAwesome5 "discord" works if installed */}
            <Text style={styles.discordEmoji}>💬</Text>
          </View>

          {/* Text */}
          <Text style={styles.title}>{t("title")}</Text>
          <Text style={styles.desc}>{t("description")}</Text>

          {/* Buttons */}
          <View style={styles.btnRow}>
            <Pressable
              onPress={handleMaybeLater}
              style={({ pressed }) => [
                styles.laterBtn,
                pressed && { opacity: 0.8 },
              ]}
            >
              <Text style={styles.laterText}>{t("maybeLater")}</Text>
            </Pressable>
            <Pressable
              onPress={handleJoin}
              style={({ pressed }) => [
                styles.joinBtn,
                pressed && { opacity: 0.85 },
              ]}
            >
              <Text style={styles.joinText}>{t("joinServer")}</Text>
            </Pressable>
          </View>

          <Pressable onPress={handleClose} style={styles.dismissBtn}>
            <Text style={styles.dismissText}>{t("dontShowAgain")}</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#09090b",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#27272a",
    padding: 28,
    alignItems: "center",
    gap: 12,
    overflow: "hidden",
  },
  glow: {
    position: "absolute",
    inset: 0,
    borderRadius: 24,
    backgroundColor: "rgba(88,101,242,0.06)",
  },
  closeBtn: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#5865F2",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    shadowColor: "#5865F2",
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  discordEmoji: { fontSize: 30 },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginTop: 4,
  },
  desc: {
    fontSize: 14,
    color: "#a1a1aa",
    textAlign: "center",
    lineHeight: 22,
  },
  btnRow: { flexDirection: "row", gap: 10, marginTop: 8, width: "100%" },
  laterBtn: {
    flex: 1,
    backgroundColor: "#27272a",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  laterText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  joinBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#5865F2",
    borderRadius: 12,
    paddingVertical: 14,
  },
  joinText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  dismissBtn: { paddingVertical: 8 },
  dismissText: { fontSize: 12, color: "#52525b" },
});

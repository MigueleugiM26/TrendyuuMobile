import { useTranslations } from "@/src/hooks/useTranslations";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";
import { Heart, Send, X } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const STORAGE_KEYS = {
  shown: "feedbackPopupShown",
  totalTime: "totalTimeSpent",
  lastActive: "lastActiveTime",
} as const;

const SHOW_AFTER_MS = 60 * 60 * 1000; // 1 hour
const IDLE_MAX_MS = 5 * 60 * 1000; // 5 min idle = don't count
const CHECK_EVERY_MS = 10_000;

export function FeedbackPopup() {
  const t = useTranslations("feedbackPopup");
  const [visible, setVisible] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    async function init() {
      const hasShown = await AsyncStorage.getItem(STORAGE_KEYS.shown);
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
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.totalTime);
    return stored ? parseInt(stored) : 0;
  }

  async function updateTime() {
    const lastStr = await AsyncStorage.getItem(STORAGE_KEYS.lastActive);
    const now = Date.now();
    if (lastStr) {
      const diff = now - parseInt(lastStr);
      if (diff < IDLE_MAX_MS) {
        const current = await getTotal();
        await AsyncStorage.setItem(
          STORAGE_KEYS.totalTime,
          (current + diff).toString(),
        );
      }
    }
    await AsyncStorage.setItem(STORAGE_KEYS.lastActive, now.toString());
  }

  function show() {
    setVisible(true);
  }

  async function handleClose() {
    setVisible(false);
    await AsyncStorage.setItem(STORAGE_KEYS.shown, "true");
  }

  async function handleMaybeLater() {
    setVisible(false);
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.totalTime,
      STORAGE_KEYS.lastActive,
    ]);
  }

  function handleFeedback() {
    handleClose();
    Linking.openURL(
      "mailto:evovince.co@gmail.com?subject=Feedback%20for%20EvoVince",
    );
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
          {/* Glow overlay */}
          <View style={styles.glow} />

          {/* Close */}
          <Pressable onPress={handleClose} style={styles.closeBtn}>
            <X size={18} color="#a1a1aa" />
          </Pressable>

          {/* Icon */}
          <View style={styles.iconWrap}>
            <Heart size={32} color="#fff" fill="#fff" />
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
              onPress={handleFeedback}
              style={({ pressed }) => [
                styles.sendBtn,
                pressed && { opacity: 0.85 },
              ]}
            >
              <Send size={16} color="#fff" />
              <Text style={styles.sendText}>{t("sendFeedback")}</Text>
            </Pressable>
          </View>

          {/* Dismiss forever */}
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
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
    borderRadius: 24,
    // Approximate gradient overlay with opacity
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
    backgroundColor: "#ec4899",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    shadowColor: "#ec4899",
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
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
  sendBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#ec4899",
    borderRadius: 12,
    paddingVertical: 14,
  },
  sendText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  dismissBtn: { paddingVertical: 8 },
  dismissText: { fontSize: 12, color: "#52525b" },
});

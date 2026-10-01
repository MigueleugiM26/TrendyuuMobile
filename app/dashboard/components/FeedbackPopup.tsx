import { useTranslations } from "@/src/hooks/useTranslations";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Heart, Send, X } from "lucide-react-native";
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

const SHOWN_KEY = "feedbackPopupShown";
const TOTAL_TIME_KEY = "totalTimeSpent";
const LAST_ACTIVE_KEY = "lastActiveTime";
const THRESHOLD_MS = 3_600_000;
const IDLE_CUTOFF_MS = 300_000;
const CHECK_INTERVAL = 10_000;

export function FeedbackPopup() {
  const t = useTranslations("feedbackPopup");
  const [isVisible, setIsVisible] = useState(false);

  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.9)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(20)).current;
  const iconScale = useRef(new Animated.Value(0)).current;

  const getTotalTimeSpent = async (): Promise<number> => {
    const stored = await AsyncStorage.getItem(TOTAL_TIME_KEY);
    return stored ? parseInt(stored, 10) : 0;
  };

  const updateTotalTime = async () => {
    const lastActive = await AsyncStorage.getItem(LAST_ACTIVE_KEY);
    const now = Date.now();
    if (lastActive) {
      const timeSince = now - parseInt(lastActive, 10);
      if (timeSince < IDLE_CUTOFF_MS) {
        const current = await getTotalTimeSpent();
        await AsyncStorage.setItem(
          TOTAL_TIME_KEY,
          (current + timeSince).toString(),
        );
      }
    }
    await AsyncStorage.setItem(LAST_ACTIVE_KEY, now.toString());
  };

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;
    let cancelled = false;

    const init = async () => {
      const hasShown = await AsyncStorage.getItem(SHOWN_KEY);
      if (hasShown) return;

      await updateTotalTime();
      const totalTime = await getTotalTimeSpent();
      if (totalTime >= THRESHOLD_MS) {
        if (!cancelled) setIsVisible(true);
        return;
      }

      intervalId = setInterval(async () => {
        await updateTotalTime();
        const current = await getTotalTimeSpent();
        if (current >= THRESHOLD_MS && !cancelled) {
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

  const handleClose = () => {
    animateOut(async () => {
      setIsVisible(false);
      await AsyncStorage.setItem(SHOWN_KEY, "true");
    });
  };

  const handleMaybeLater = () => {
    animateOut(async () => {
      setIsVisible(false);
      await AsyncStorage.multiRemove([TOTAL_TIME_KEY, LAST_ACTIVE_KEY]);
    });
  };

  const handleFeedbackClick = async () => {
    handleClose();
    const url =
      "mailto:evovince.co@gmail.com?subject=Feedback%20for%20EvoVince";
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) Linking.openURL(url);
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

      {/* Centered card */}
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
          <View style={styles.gradientOverlay} pointerEvents="none" />

          {/* Close */}
          <Pressable onPress={handleClose} style={styles.closeBtn} hitSlop={8}>
            <X size={20} color="#a1a1aa" />
          </Pressable>

          {/* Content */}
          <View style={styles.content}>
            {/* Icon */}
            <Animated.View
              style={[
                styles.iconWrapper,
                { transform: [{ scale: iconScale }] },
              ]}
            >
              <Heart size={32} color="#fff" fill="#fff" />
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
                onPress={handleFeedbackClick}
                style={({ pressed }) => [
                  styles.feedbackBtn,
                  pressed && styles.btnPressed,
                ]}
              >
                <Send size={16} color="#fff" />
                <Text style={styles.feedbackBtnText}>{t("sendFeedback")}</Text>
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
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(236,72,153,0.06)",
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
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 99,
    backgroundColor: "#ec4899",
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
  feedbackBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#ec4899",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  feedbackBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  dismissText: {
    fontSize: 12,
    color: "#71717a",
  },
});

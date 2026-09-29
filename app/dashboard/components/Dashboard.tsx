import { useUser } from "@/src/context/user-context";
import { useTranslations } from "@/src/hooks/useTranslations";
import { syncAffiliateCodeToBackend } from "@/src/utils/affiliates";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { DiscordPopup } from "./DiscordPopup";
import { FeedbackPopup } from "./FeedbackPopup";
import { Header } from "./Header";
import { HeroDashboard } from "./HeroDashboard";
import { RecentProjects } from "./RecentProjects";
import { TemplateGallery } from "./TemplateGallery";
import { ToolsCarousel } from "./ToolsCarousel";

// ─── Upgrade Modal ────────────────────────────────────────────────────────────

function UpgradeModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const t = useTranslations("dashboard");
  const router = useRouter();
  const slideAnim = useRef(new Animated.Value(600)).current;

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
        toValue: 600,
        duration: 220,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable style={upgrade.backdrop} onPress={onClose} />
      <Animated.View
        style={[upgrade.panel, { transform: [{ translateY: slideAnim }] }]}
      >
        <View style={upgrade.handle} />
        <Text style={upgrade.title}>{t("upgradeModal.title")}</Text>
        <Text style={upgrade.desc}>{t("upgradeModal.description")}</Text>
        <Pressable
          onPress={() => {
            onClose();
            router.push("/#pricing-section");
          }}
          style={({ pressed }) => [upgrade.btn, pressed && { opacity: 0.85 }]}
        >
          <Text style={upgrade.btnText}>{t("upgradeModal.cta")}</Text>
        </Pressable>
        <Pressable onPress={onClose} style={upgrade.cancelBtn}>
          <Text style={upgrade.cancelText}>{t("upgradeModal.cancel")}</Text>
        </Pressable>
      </Animated.View>
    </Modal>
  );
}

const upgrade = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  panel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#09090b",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: "#27272a",
    padding: 24,
    paddingBottom: 40,
    gap: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#3f3f46",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },
  desc: {
    fontSize: 14,
    color: "#a1a1aa",
    textAlign: "center",
    lineHeight: 22,
  },
  btn: {
    backgroundColor: "#ec4899",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 4,
  },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  cancelBtn: { alignItems: "center", paddingVertical: 12 },
  cancelText: { color: "#71717a", fontSize: 14 },
});

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showBuyCredits, setShowBuyCredits] = useState(false);
  const [showRecentProjects, setShowRecentProjects] = useState(false);

  // Sync affiliate code after login
  useEffect(() => {
    if (user?.id) {
      syncAffiliateCodeToBackend();
    }
  }, [user?.id]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading]);

  if (!user) return null;

  return (
    <SafeAreaView style={styles.root}>
      {/* Fixed header */}
      <Header
        onUpgrade={() => setShowUpgrade(true)}
        onBuyCredits={() => setShowBuyCredits(true)}
      />

      {/* Scrollable content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero — AI generation prompt bar */}
        <HeroDashboard />

        {/* Tools carousel */}
        <ToolsCarousel />

        {/* Recent projects button */}
        <Pressable
          onPress={() => setShowRecentProjects(true)}
          style={({ pressed }) => [
            styles.recentBtn,
            pressed && { opacity: 0.85 },
          ]}
        >
          <Text style={styles.recentBtnText}>Meus projetos recentes →</Text>
        </Pressable>

        {/* Template gallery */}
        <TemplateGallery />
      </ScrollView>

      {/* Timed popups */}
      <FeedbackPopup />
      <DiscordPopup />

      {/* Modals */}
      <UpgradeModal
        visible={showUpgrade}
        onClose={() => setShowUpgrade(false)}
      />

      <RecentProjects
        visible={showRecentProjects}
        onClose={() => setShowRecentProjects(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000" },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 24 },
  recentBtn: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 8,
    paddingVertical: 10,
  },
  recentBtnText: { color: "#ec4899", fontSize: 14, fontWeight: "600" },
});

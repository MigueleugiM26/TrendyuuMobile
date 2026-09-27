import { useUser } from "@/src/context/user-context";
import { useTranslations } from "@/src/hooks/useTranslations";
import { useRouter } from "expo-router";
import {
  BookOpen,
  Camera,
  Clapperboard,
  Handshake,
  ImageIcon,
  Images,
  Laptop,
  Menu,
  Minus,
  Plus,
  Store,
  Video,
  X,
} from "lucide-react-native";
import { useRef, useState } from "react";
import {
  Animated,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

// ─── Data ─────────────────────────────────────────────────────────────────────

const resourceItems = [
  {
    key: "imageGeneration",
    title: "Gerador de Imagens com IA",
    description: "Crie imagens profissionais a partir de texto",
    Icon: ImageIcon,
    href: "/features/image-generation",
  },
  {
    key: "videoGeneration",
    title: "Gerador de Vídeos com IA",
    description: "Crie vídeos a partir de texto ou imagem",
    Icon: Video,
    href: "/features/video-generation",
  },
  {
    key: "variations",
    title: "Gerador de Variações com IA",
    description: "Gere variações de uma imagem existente",
    Icon: Images,
    href: "/features/variations",
  },
  {
    key: "productVideo",
    title: "Vídeo de Produto com IA",
    description: "Crie vídeos de produto com presets, sem prompt",
    Icon: Clapperboard,
    href: "/features/product-video",
  },
  {
    key: "productPhoto",
    title: "Gerador de Fotos de Produto",
    description: "Crie fotos profissionais de produtos com IA",
    Icon: Camera,
    href: "/features/photo-product",
  },
];

const solutionItems = [
  {
    key: "empreendedor",
    titleKey: "solutions.empreendedor.title",
    descKey: "solutions.empreendedor.desc",
    Icon: Laptop,
    href: "/solucoes/empreendedor-digital",
  },
  {
    key: "afiliados",
    titleKey: "solutions.afiliados.title",
    descKey: "solutions.afiliados.desc",
    Icon: Handshake,
    href: "/solucoes/afiliados",
  },
  {
    key: "infoprodutores",
    titleKey: "solutions.infoprodutores.title",
    descKey: "solutions.infoprodutores.desc",
    Icon: BookOpen,
    href: "/solucoes/infoprodutos",
  },
  {
    key: "loja",
    titleKey: "solutions.loja.title",
    descKey: "solutions.loja.desc",
    Icon: Store,
    href: "/solucoes/loja-online",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function Navbar() {
  const t = useTranslations("Nav");
  const { user, loading } = useUser();
  const router = useRouter();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);

  // Slide-in animation for the drawer
  const slideAnim = useRef(new Animated.Value(-400)).current;

  function openDrawer() {
    setDrawerOpen(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 0,
      speed: 20,
    }).start();
  }

  function closeDrawer() {
    Animated.timing(slideAnim, {
      toValue: -400,
      duration: 220,
      useNativeDriver: true,
    }).start(() => setDrawerOpen(false));
  }

  function toggleSection(key: string) {
    setOpenSection((prev) => (prev === key ? null : key));
  }

  function navigate(path: string) {
    closeDrawer();
    setTimeout(() => router.push(path as any), 240);
  }

  return (
    <>
      {/* ── Floating pill nav ─────────────────────────────────────────────── */}
      <View style={styles.navWrap} pointerEvents="box-none">
        <View style={styles.pill}>
          {/* Logo */}
          <Pressable onPress={() => router.push("/")} style={styles.logoBtn}>
            <Image
              source={{
                uri: "https://cdn-frontend.trendyuu.com/public/logos/logotrend2.webp",
              }}
              style={styles.logoImg}
              resizeMode="contain"
            />
          </Pressable>

          {/* Hamburger */}
          <Pressable onPress={openDrawer} style={styles.menuBtn}>
            <Menu size={22} color="#fff" />
          </Pressable>
        </View>
      </View>

      {/* ── Sidebar drawer ────────────────────────────────────────────────── */}
      {drawerOpen && (
        <Modal transparent animationType="none" onRequestClose={closeDrawer}>
          {/* Backdrop */}
          <Pressable style={styles.backdrop} onPress={closeDrawer} />

          {/* Drawer panel */}
          <Animated.View
            style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}
          >
            <SafeAreaView style={{ flex: 1 }}>
              {/* Header */}
              <View style={styles.drawerHeader}>
                <Image
                  source={{
                    uri: "https://cdn-frontend.trendyuu.com/public/logos/logotrend2.webp",
                  }}
                  style={styles.drawerLogo}
                  resizeMode="contain"
                />
                <Pressable onPress={closeDrawer} style={styles.closeBtn}>
                  <X size={22} color="#fff" />
                </Pressable>
              </View>

              {/* User info */}
              {user?.name && (
                <View style={styles.userRow}>
                  {user.image ? (
                    <Image
                      source={{ uri: user.image }}
                      style={styles.userAvatar}
                    />
                  ) : (
                    <View style={styles.userAvatarFallback}>
                      <Text style={styles.userAvatarLetter}>
                        {user.name[0].toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userEmail}>{user.email}</Text>
                  </View>
                </View>
              )}

              {/* Nav links */}
              <ScrollView
                style={styles.drawerScroll}
                showsVerticalScrollIndicator={false}
              >
                {/* Home */}
                <Pressable
                  onPress={() => navigate("/")}
                  style={({ pressed }) => [
                    styles.navItem,
                    pressed && styles.navItemPressed,
                  ]}
                >
                  <Text style={styles.navItemText}>{t("menu.home")}</Text>
                </Pressable>

                {/* Solutions accordion */}
                <Pressable
                  onPress={() => toggleSection("solutions")}
                  style={({ pressed }) => [
                    styles.navItem,
                    pressed && styles.navItemPressed,
                  ]}
                >
                  <Text style={styles.navItemText}>{t("menu.solutions")}</Text>
                  {openSection === "solutions" ? (
                    <Minus size={16} color="#ec4899" />
                  ) : (
                    <Plus size={16} color="#ec4899" />
                  )}
                </Pressable>
                {openSection === "solutions" && (
                  <View style={styles.subItems}>
                    {solutionItems.map((item) => (
                      <Pressable
                        key={item.key}
                        onPress={() => navigate(item.href)}
                        style={({ pressed }) => [
                          styles.subItem,
                          pressed && styles.navItemPressed,
                        ]}
                      >
                        <item.Icon size={16} color="#ec4899" />
                        <Text style={styles.subItemText}>
                          {t(item.titleKey)}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                )}

                {/* Features accordion */}
                <Pressable
                  onPress={() => toggleSection("resources")}
                  style={({ pressed }) => [
                    styles.navItem,
                    pressed && styles.navItemPressed,
                  ]}
                >
                  <Text style={styles.navItemText}>{t("menu.features")}</Text>
                  {openSection === "resources" ? (
                    <Minus size={16} color="#ec4899" />
                  ) : (
                    <Plus size={16} color="#ec4899" />
                  )}
                </Pressable>
                {openSection === "resources" && (
                  <View style={styles.subItems}>
                    {resourceItems.map((item) => (
                      <Pressable
                        key={item.key}
                        onPress={() => navigate(item.href)}
                        style={({ pressed }) => [
                          styles.subItem,
                          pressed && styles.navItemPressed,
                        ]}
                      >
                        <item.Icon size={16} color="#ec4899" />
                        <Text style={styles.subItemText}>{item.title}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}

                {/* Pricing */}
                <Pressable
                  onPress={() => navigate("/#pricing-section")}
                  style={({ pressed }) => [
                    styles.navItem,
                    pressed && styles.navItemPressed,
                  ]}
                >
                  <Text style={styles.navItemText}>{t("menu.pricing")}</Text>
                </Pressable>
              </ScrollView>

              {/* CTA at the bottom */}
              {!user && (
                <View style={styles.drawerFooter}>
                  <Pressable
                    onPress={() => navigate("/login")}
                    style={({ pressed }) => [
                      styles.ctaBtn,
                      pressed && { opacity: 0.85 },
                    ]}
                  >
                    <Text style={styles.ctaBtnText}>{t("cta.getStarted")}</Text>
                  </Pressable>
                </View>
              )}
            </SafeAreaView>
          </Animated.View>
        </Modal>
      )}
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // ── Floating pill
  navWrap: {
    position: "absolute",
    top: 30,
    left: 0,
    right: 0,
    zIndex: 50,
    alignItems: "center",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: "rgba(0,0,0,0.75)",
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    backdropFilter: "blur(20px)" as any,
  },
  logoBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  logoImg: { width: 28, height: 28 },
  menuBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Drawer
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  drawer: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: "85%",
    maxWidth: 380,
    backgroundColor: "#000",
    borderRightWidth: 1,
    borderRightColor: "rgba(236,72,153,0.2)",
  },
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(236,72,153,0.2)",
  },
  drawerLogo: { width: 40, height: 40 },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(236,72,153,0.1)",
    borderWidth: 1,
    borderColor: "rgba(236,72,153,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },

  // ── User row
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    margin: 16,
    padding: 14,
    backgroundColor: "rgba(39,39,42,0.5)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(236,72,153,0.2)",
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#ec4899",
  },
  userAvatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ec4899",
    alignItems: "center",
    justifyContent: "center",
  },
  userAvatarLetter: { color: "#fff", fontWeight: "700", fontSize: 16 },
  userName: { fontSize: 14, fontWeight: "600", color: "#fff" },
  userEmail: { fontSize: 12, color: "#a1a1aa", marginTop: 2 },

  // ── Nav links
  drawerScroll: { flex: 1, paddingHorizontal: 12, paddingTop: 8 },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 10,
  },
  navItemPressed: { backgroundColor: "rgba(39,39,42,0.5)" },
  navItemText: { fontSize: 17, fontWeight: "700", color: "#fff" },

  subItems: { paddingLeft: 10, gap: 2, marginBottom: 4 },
  subItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
  },
  subItemText: { fontSize: 14, color: "#d4d4d8" },

  // ── CTA
  drawerFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(236,72,153,0.2)",
  },
  ctaBtn: {
    backgroundColor: "#ec4899",
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: "center",
  },
  ctaBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});

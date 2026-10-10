import { useUser } from "@/src/context/user-context";
import { useTranslations } from "@/src/hooks/useTranslations";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  ExternalLink,
  Eye,
  Globe,
  Heart,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  Tag,
  Type,
  X,
  Zap,
} from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BrandDetail {
  id: number;
  business_name: string;
  bio: string;
  logo_url: string | null;
  banner_url: string | null;
  product_images: string[];
  niche: string;
  tags: string[];
  locations: string[];
  color_palette: string[];
  typography: string;
  website: string;
  social_links: Record<string, string>;
  contact_links: Record<string, string>;
  views_count: number;
  likes_count: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BASE_URL = process.env.EXPO_PUBLIC_TRENDYUU_URL_BACK;

const SOCIAL_ICONS: Record<string, string> = {
  instagram: "📸",
  tiktok: "🎵",
  youtube: "▶️",
  twitter: "🐦",
  linkedin: "💼",
  facebook: "👥",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function authHeaders(): Promise<Record<string, string>> {
  const token = await AsyncStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function contactUrl(key: string, value: string): string {
  if (key === "email") return `mailto:${value}`;
  if (key === "phone" || key === "whatsapp")
    return `https://wa.me/${value.replace(/\D/g, "")}`;
  return value.startsWith("http") ? value : `https://${value}`;
}

// ─── Image Grid ───────────────────────────────────────────────────────────────
// Computes an equal-cell grid: 4 images → 2×2, 3/6/9 → 3 cols, else 2 cols.

function ImageGrid({
  images,
  brandName,
  onPress,
}: {
  images: string[];
  brandName: string;
  onPress: (uri: string) => void;
}) {
  const count = images.length;
  const cols = count === 2 || count === 4 ? 2 : 3;
  const gap = 8;

  // Use onLayout to measure the actual available width instead of SCREEN_WIDTH,
  // so the grid stays within the section padding and never overflows.
  const [containerWidth, setContainerWidth] = useState(0);
  const cellSize =
    containerWidth > 0 ? (containerWidth - gap * (cols - 1)) / cols : 0;

  const rows: string[][] = [];
  for (let i = 0; i < images.length; i += cols) {
    rows.push(images.slice(i, i + cols));
  }

  return (
    <View
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      style={{ gap }}
    >
      {containerWidth > 0 &&
        rows.map((row, rIdx) => (
          <View key={rIdx} style={{ flexDirection: "row", gap }}>
            {row.map((uri, cIdx) => (
              <TouchableOpacity
                key={cIdx}
                onPress={() => onPress(uri)}
                activeOpacity={0.85}
                style={{
                  width: cellSize,
                  height: cellSize * 0.75, // 4:3 landscape ratio
                  borderRadius: 12,
                  overflow: "hidden",
                  borderWidth: 1,
                  borderColor: "#27272a",
                  backgroundColor: "#18181b",
                }}
              >
                <Image
                  source={{ uri }}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="cover"
                  accessibilityLabel={`${brandName} product ${rIdx * cols + cIdx + 1}`}
                />
              </TouchableOpacity>
            ))}
          </View>
        ))}
    </View>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      {icon}
      <Text style={styles.sectionHeaderText}>{label.toUpperCase()}</Text>
    </View>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BrandDetailPage() {
  const t = useTranslations("DiscoverBrands.detail");
  const { user, loading: loadingUser } = useUser();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [brand, setBrand] = useState<BrandDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [liked, setLiked] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Auth guard
  useEffect(() => {
    if (!loadingUser && !user) router.replace("/login");
  }, [loadingUser, user, router]);

  // ── Load brand detail ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!user || !id) return;
    setLoading(true);

    (async () => {
      const headers = await authHeaders();
      try {
        const [brandRes, configRes] = await Promise.all([
          fetch(`${BASE_URL}/api/user-branding/get-brand/${id}`, { headers }),
          fetch(
            `${BASE_URL}/api/video/get-user-config/?key=brand-interactions`,
            { headers },
          ).then((r) => (r.ok ? r.json() : null)),
        ]);

        if (brandRes.status === 404) {
          setNotFound(true);
          return;
        }

        const brandData = await brandRes.json();
        setBrand(brandData.brand);

        const v = configRes?.value as { liked?: number[] } | undefined;
        if (v?.liked?.includes(Number(id))) setLiked(true);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [user, id]);

  // ── Like toggle ───────────────────────────────────────────────────────────
  const handleLike = useCallback(async () => {
    if (!brand) return;
    const next = !liked;
    setLiked(next);
    setBrand((prev) =>
      prev
        ? { ...prev, likes_count: prev.likes_count + (next ? 1 : -1) }
        : prev,
    );

    const headers = await authHeaders();

    const configRes = await fetch(
      `${BASE_URL}/api/video/get-user-config/?key=brand-interactions`,
      { headers },
    )
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null);

    const current =
      (configRes?.value as { liked?: number[]; viewed?: number[] }) ?? {};
    const likedSet = new Set<number>(current.liked ?? []);
    if (next) likedSet.add(brand.id);
    else likedSet.delete(brand.id);

    fetch(`${BASE_URL}/api/video/save-user-config/`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        key: "brand-interactions",
        value: { ...current, liked: [...likedSet] },
      }),
    }).catch(() => {});

    fetch(`${BASE_URL}/api/user-branding/like-brand/${brand.id}`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ liked: next }),
    }).catch(() => {});
  }, [brand, liked]);

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loadingUser || loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="small" color="#71717a" />
      </View>
    );
  }

  // ── Not found state ───────────────────────────────────────────────────────
  if (notFound || !brand) {
    return (
      <View style={styles.centered}>
        <Text style={styles.notFoundText}>{t("notFound")}</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.goBackBtn}
        >
          <ArrowLeft size={16} color="#f472b6" />
          <Text style={styles.goBackText}>{t("goBack")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const hasSocial = Object.keys(brand.social_links).length > 0;
  const hasContact = Object.keys(brand.contact_links).length > 0;
  const accentColor = brand.color_palette?.[0] ?? null;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      {/* ── Top bar / back button ── */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ArrowLeft size={16} color="#a1a1aa" />
          <Text style={styles.backBtnText}>{t("back")}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero: banner + logo + title ── */}
        <View style={styles.hero}>
          {/* Banner */}
          <View style={styles.banner}>
            {brand.banner_url ? (
              <Image
                source={{ uri: brand.banner_url }}
                style={StyleSheet.absoluteFillObject}
                resizeMode="cover"
              />
            ) : (
              <View
                style={[
                  StyleSheet.absoluteFillObject,
                  {
                    backgroundColor:
                      brand.color_palette.length >= 2
                        ? brand.color_palette[0]
                        : "#27272a",
                  },
                ]}
              />
            )}

            {/* Palette dots on banner */}
            {brand.color_palette.length > 0 && (
              <View style={styles.paletteDots}>
                {brand.color_palette.map((c, i) => (
                  <View
                    key={i}
                    style={[styles.paletteDot, { backgroundColor: c }]}
                  />
                ))}
              </View>
            )}
          </View>

          {/* Logo + name block */}
          <View style={styles.logoNameBlock}>
            {/* Logo */}
            <View style={styles.logoWrap}>
              {brand.logo_url ? (
                <Image
                  source={{ uri: brand.logo_url }}
                  style={styles.logoImage}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={[
                    styles.logoFallback,
                    accentColor
                      ? { backgroundColor: accentColor + "33" }
                      : undefined,
                  ]}
                >
                  <Text style={styles.logoFallbackText}>
                    {brand.business_name[0]?.toUpperCase()}
                  </Text>
                </View>
              )}
            </View>

            {/* Title area */}
            <View style={styles.titleBlock}>
              <View style={styles.titleRow}>
                {/* Name + niche/typography */}
                <View style={styles.titleLeft}>
                  <Text style={styles.brandName} numberOfLines={1}>
                    {brand.business_name}
                  </Text>
                  <View style={styles.metaRow}>
                    {!!brand.niche && (
                      <View style={styles.metaItem}>
                        <Zap size={13} color="#ec4899" />
                        <Text style={styles.metaText}>{brand.niche}</Text>
                      </View>
                    )}
                    {!!brand.typography && (
                      <View style={styles.metaItem}>
                        <Type size={11} color="#71717a" />
                        <Text style={styles.metaTextSmall}>
                          {brand.typography}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Like + views */}
                <View style={styles.titleRight}>
                  <View style={styles.viewsRow}>
                    <Eye size={14} color="#71717a" />
                    <Text style={styles.viewsText}>
                      {brand.views_count.toLocaleString()}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={handleLike}
                    style={[styles.likeBtn, liked && styles.likeBtnActive]}
                  >
                    <Heart
                      size={14}
                      color={liked ? "#f472b6" : "#a1a1aa"}
                      fill={liked ? "#ec4899" : "none"}
                    />
                    <Text
                      style={[
                        styles.likeBtnText,
                        liked && styles.likeBtnTextActive,
                      ]}
                    >
                      {brand.likes_count.toLocaleString()}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ── Bio ── */}
        {!!brand.bio && (
          <View style={styles.section}>
            <Text style={styles.bioText}>{brand.bio}</Text>
          </View>
        )}

        {/* ── Details: website + locations ── */}
        <View style={styles.detailsGrid}>
          {!!brand.website && (
            <View style={styles.detailBlock}>
              <SectionHeader
                icon={<Globe size={13} color="#71717a" />}
                label={t("website")}
              />
              <TouchableOpacity
                style={styles.linkRow}
                onPress={() => Linking.openURL(brand.website)}
              >
                <Text style={styles.linkText} numberOfLines={1}>
                  {brand.website}
                </Text>
                <ExternalLink size={13} color="#f472b6" />
              </TouchableOpacity>
            </View>
          )}

          {brand.locations.length > 0 && (
            <View style={styles.detailBlock}>
              <SectionHeader
                icon={<MapPin size={13} color="#71717a" />}
                label={t("locations")}
              />
              <View style={styles.pillsWrap}>
                {brand.locations.map((loc) => (
                  <View key={loc} style={styles.pill}>
                    <Text style={styles.pillText}>{loc}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* ── Tags ── */}
        {brand.tags.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              icon={<Tag size={13} color="#71717a" />}
              label={t("tags")}
            />
            <View style={styles.pillsWrap}>
              {brand.tags.map((tag) => (
                <View key={tag} style={styles.pill}>
                  <Text style={styles.pillText}>#{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Social + Contact ── */}
        {(hasSocial || hasContact) && (
          <View style={styles.section}>
            {hasSocial && (
              <View style={styles.subSection}>
                <Text style={styles.subSectionLabel}>{t("socials")}</Text>
                <View style={styles.pillsWrap}>
                  {Object.entries(brand.social_links).map(([platform, url]) => (
                    <TouchableOpacity
                      key={platform}
                      style={styles.pill}
                      onPress={() => Linking.openURL(url)}
                    >
                      <Text style={styles.pillEmoji}>
                        {SOCIAL_ICONS[platform] ?? "🔗"}
                      </Text>
                      <Text style={styles.pillText}>
                        {platform.charAt(0).toUpperCase() + platform.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {hasContact && (
              <View style={styles.subSection}>
                <Text style={styles.subSectionLabel}>{t("contact")}</Text>
                <View style={styles.pillsWrap}>
                  {Object.entries(brand.contact_links).map(([key, value]) => (
                    <TouchableOpacity
                      key={key}
                      style={styles.pill}
                      onPress={() => Linking.openURL(contactUrl(key, value))}
                    >
                      {key === "email" && <Mail size={13} color="#a1a1aa" />}
                      {key === "phone" && <Phone size={13} color="#a1a1aa" />}
                      {key === "whatsapp" && (
                        <MessageCircle size={13} color="#a1a1aa" />
                      )}
                      {key === "telegram" && <Send size={13} color="#a1a1aa" />}
                      <Text style={styles.pillText}>
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </Text>
                      <Text style={styles.pillSubText} numberOfLines={1}>
                        {value}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {/* ── Product images ── */}
        {brand.product_images.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.subSectionLabel}>{t("productImages")}</Text>
            <ImageGrid
              images={brand.product_images}
              brandName={brand.business_name}
              onPress={setSelectedImage}
            />
          </View>
        )}
      </ScrollView>

      {/* ── Lightbox ── */}
      <Modal
        visible={!!selectedImage}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setSelectedImage(null)}
      >
        <Pressable
          style={styles.lightboxOverlay}
          onPress={() => setSelectedImage(null)}
        >
          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              style={styles.lightboxImage}
              resizeMode="contain"
            />
          )}
          <TouchableOpacity
            style={styles.lightboxClose}
            onPress={() => setSelectedImage(null)}
          >
            <X size={18} color="#d4d4d8" />
          </TouchableOpacity>
        </Pressable>
      </Modal>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  centered: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  notFoundText: {
    fontSize: 16,
    color: "#a1a1aa",
  },
  goBackBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  goBackText: {
    fontSize: 14,
    color: "#f472b6",
  },

  // ── Top bar
  topBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(39,39,42,0.6)",
    backgroundColor: "rgba(0,0,0,0.85)",
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
  },
  backBtnText: {
    fontSize: 14,
    color: "#a1a1aa",
  },

  // ── Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 48,
    gap: 28,
  },

  // ── Hero
  hero: {
    gap: 0,
  },
  banner: {
    height: 160,
    backgroundColor: "#27272a",
    position: "relative",
  },
  paletteDots: {
    position: "absolute",
    bottom: 10,
    right: 14,
    flexDirection: "row",
    gap: 5,
  },
  paletteDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.5)",
  },
  logoNameBlock: {
    paddingHorizontal: 16,
    paddingTop: 0,
    marginTop: -36,
    gap: 12,
  },
  logoWrap: {
    width: 72,
    height: 72,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#000",
    backgroundColor: "#fff",
  },
  logoImage: {
    width: "100%",
    height: "100%",
  },
  logoFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#27272a",
  },
  logoFallbackText: {
    fontSize: 26,
    fontWeight: "700",
    color: "rgba(255,255,255,0.5)",
  },
  titleBlock: {
    paddingTop: 4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  titleLeft: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  brandName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 2,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: "#a1a1aa",
  },
  metaTextSmall: {
    fontSize: 11,
    color: "#71717a",
  },
  titleRight: {
    alignItems: "flex-end",
    gap: 8,
    flexShrink: 0,
    paddingTop: 4,
  },
  viewsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  viewsText: {
    fontSize: 13,
    color: "#71717a",
  },
  likeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#3f3f46",
    backgroundColor: "#18181b",
  },
  likeBtnActive: {
    borderColor: "rgba(236,72,153,0.6)",
    backgroundColor: "rgba(219,39,119,0.15)",
  },
  likeBtnText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#a1a1aa",
  },
  likeBtnTextActive: {
    color: "#f472b6",
  },

  // ── Sections
  section: {
    paddingHorizontal: 16,
    gap: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  sectionHeaderText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#71717a",
    letterSpacing: 1,
  },
  bioText: {
    fontSize: 14,
    color: "#d4d4d8",
    lineHeight: 22,
  },

  // ── Details grid
  detailsGrid: {
    paddingHorizontal: 16,
    gap: 20,
  },
  detailBlock: {
    gap: 8,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  linkText: {
    fontSize: 13,
    color: "#f472b6",
    flex: 1,
  },

  // ── Pills
  pillsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#3f3f46",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pillText: {
    fontSize: 13,
    color: "#d4d4d8",
  },
  pillSubText: {
    fontSize: 11,
    color: "#71717a",
    maxWidth: 120,
  },
  pillEmoji: {
    fontSize: 13,
  },

  // ── Sub-sections (social / contact)
  subSection: {
    gap: 8,
  },
  subSectionLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#71717a",
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  // ── Lightbox
  lightboxOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.92)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  lightboxImage: {
    width: "100%",
    aspectRatio: 4 / 3,
    borderRadius: 12,
  },
  lightboxClose: {
    position: "absolute",
    top: 48,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#27272a",
    borderWidth: 1,
    borderColor: "#3f3f46",
    alignItems: "center",
    justifyContent: "center",
  },
});

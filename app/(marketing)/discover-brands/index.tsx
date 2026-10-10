import { Sidebar } from "@/app/dashboard/components/Sidebar";
import { useUser } from "@/src/context/user-context";
import { useTranslations } from "@/src/hooks/useTranslations";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import {
  Eye,
  Flame,
  Heart,
  MapPin,
  Plus,
  Search,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Types ────────────────────────────────────────────────────────────────────

type ViewMode = "browse" | "liked";
type SortKey = "most_viewed" | "most_liked" | "newest";

interface BrandCard {
  id: number;
  business_name: string;
  bio: string;
  logo_url: string | null;
  banner_url: string | null;
  niche: string;
  tags: string[];
  locations: string[];
  color_palette: string[];
  typography: string;
  views_count: number;
  likes_count: number;
  website: string;
}

interface BrandsResponse {
  brands: BrandCard[];
  has_more: boolean;
  current_page: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BASE_URL = process.env.EXPO_PUBLIC_TRENDYUU_URL_BACK;
const PAGE_SIZE = 18;

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function authHeaders(): Promise<Record<string, string>> {
  const token = await AsyncStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// ─── Brand Card Component ─────────────────────────────────────────────────────

function BrandCardItem({
  brand,
  liked,
  onPress,
  onLike,
}: {
  brand: BrandCard;
  liked: boolean;
  onPress: () => void;
  onLike: () => void;
}) {
  const accentColor = brand.color_palette?.[0] ?? null;

  // Banner background: gradient from palette or fallback
  const bannerStyle = !brand.banner_url
    ? brand.color_palette.length >= 2
      ? {
          // LinearGradient not available inline — use first color as bg
          // wrap with expo-linear-gradient if desired
          backgroundColor: brand.color_palette[0],
        }
      : { backgroundColor: "#27272a" }
    : undefined;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={styles.card}
    >
      {/* Banner */}
      <View style={styles.cardBanner}>
        {brand.banner_url ? (
          <Image
            source={{ uri: brand.banner_url }}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />
        ) : (
          <View style={[StyleSheet.absoluteFillObject, bannerStyle]} />
        )}

        {/* Palette dots */}
        {brand.color_palette.length > 0 && (
          <View style={styles.paletteDots}>
            {brand.color_palette.slice(0, 5).map((c, i) => (
              <View
                key={i}
                style={[styles.paletteDot, { backgroundColor: c }]}
              />
            ))}
          </View>
        )}
      </View>

      {/* Logo overlapping banner */}
      <View style={styles.logoRow}>
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
      </View>

      {/* Body */}
      <View style={styles.cardBody}>
        {/* Name + niche */}
        <View style={styles.cardNameBlock}>
          <Text style={styles.cardName} numberOfLines={1}>
            {brand.business_name}
          </Text>
          {!!brand.niche && (
            <View style={styles.nicheRow}>
              <Zap size={11} color="#ec4899" />
              <Text style={styles.nicheText}>{brand.niche}</Text>
            </View>
          )}
        </View>

        {/* Bio */}
        {!!brand.bio && (
          <Text style={styles.cardBio} numberOfLines={2}>
            {brand.bio}
          </Text>
        )}

        {/* Tags */}
        {brand.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {brand.tags.slice(0, 4).map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
            {brand.tags.length > 4 && (
              <Text style={styles.tagOverflow}>+{brand.tags.length - 4}</Text>
            )}
          </View>
        )}

        {/* Footer: location + views + like */}
        <View style={styles.cardFooter}>
          {brand.locations.length > 0 ? (
            <View style={styles.locationRow}>
              <MapPin size={11} color="#71717a" />
              <Text style={styles.locationText} numberOfLines={1}>
                {brand.locations[0]}
                {brand.locations.length > 1
                  ? ` +${brand.locations.length - 1}`
                  : ""}
              </Text>
            </View>
          ) : (
            <View />
          )}

          <View style={styles.cardActions}>
            <View style={styles.viewsRow}>
              <Eye size={11} color="#71717a" />
              <Text style={styles.viewsText}>
                {brand.views_count.toLocaleString()}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onLike}
              style={[styles.likeBtn, liked && styles.likeBtnActive]}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Heart
                size={11}
                color={liked ? "#f472b6" : "#a1a1aa"}
                fill={liked ? "#ec4899" : "none"}
              />
              <Text
                style={[styles.likeBtnText, liked && styles.likeBtnTextActive]}
              >
                {brand.likes_count}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({
  search,
  t,
}: {
  search: string;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconWrap}>
        <Search size={28} color="#52525b" />
      </View>
      <Text style={styles.emptyTitle}>
        {search ? t("noResults") : t("empty")}
      </Text>
      <Text style={styles.emptyHint}>
        {search ? t("noResultsHint") : t("emptyHint")}
      </Text>
    </View>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DiscoverBrandsPage() {
  const t = useTranslations("DiscoverBrands");
  const { user, loading: loadingUser } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loadingUser && !user) router.replace("/login");
  }, [loadingUser, user, router]);

  // ── State ──────────────────────────────────────────────────────────────────
  const [brands, setBrands] = useState<BrandCard[]>([]);
  const [fetching, setFetching] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortKey>("most_viewed");
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput, 350);
  const [mode, setMode] = useState<ViewMode>("browse");
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set());
  const [viewedIds, setViewedIds] = useState<Set<number>>(new Set());
  const [likedBrands, setLikedBrands] = useState<BrandCard[]>([]);
  const [fetchingLiked, setFetchingLiked] = useState(false);

  const fetchingRef = useRef(false);

  // ── Load interactions ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    (async () => {
      const headers = await authHeaders();
      fetch(`${BASE_URL}/api/video/get-user-config/?key=brand-interactions`, {
        headers,
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (!data?.value) return;
          const v = data.value as { liked?: number[]; viewed?: number[] };
          if (v.liked) setLikedIds(new Set(v.liked));
          if (v.viewed) setViewedIds(new Set(v.viewed));
        })
        .catch(() => {});
    })();
  }, [user]);

  // ── Persist interactions ───────────────────────────────────────────────────
  const persistInteractions = useCallback(
    async (liked: Set<number>, viewed: Set<number>) => {
      const headers = await authHeaders();
      fetch(`${BASE_URL}/api/video/save-user-config/`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "brand-interactions",
          value: { liked: [...liked], viewed: [...viewed] },
        }),
      }).catch(() => {});
    },
    [],
  );

  // ── Fetch brands ───────────────────────────────────────────────────────────
  const fetchBrands = useCallback(
    async (pageNum: number = 1, reset = false) => {
      if (fetchingRef.current || (!reset && !hasMore)) return;
      fetchingRef.current = true;
      setFetching(true);
      try {
        const headers = await authHeaders();
        const params = new URLSearchParams({
          page: pageNum.toString(),
          page_size: PAGE_SIZE.toString(),
          sort,
          ...(search ? { q: search } : {}),
        });
        const res = await fetch(
          `${BASE_URL}/api/user-branding/list-brands?${params}`,
          { headers },
        );
        if (!res.ok) throw new Error();
        const data: BrandsResponse = await res.json();
        setBrands((prev) => {
          if (reset) return data.brands;
          const existingIds = new Set(prev.map((b) => b.id));
          const fresh = data.brands.filter((b) => !existingIds.has(b.id));
          return [...prev, ...fresh];
        });
        setHasMore(data.has_more);
        setPage(pageNum + 1);
      } catch {
        /* silently fail */
      } finally {
        fetchingRef.current = false;
        setFetching(false);
      }
    },
    [hasMore, sort, search],
  );

  // Reset on sort/search change
  useEffect(() => {
    if (!user || mode === "liked") return;
    setBrands([]);
    setPage(1);
    setHasMore(true);
    fetchBrands(1, true);
  }, [sort, search, user, mode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch liked brands when switching to liked mode
  useEffect(() => {
    if (!user || mode !== "liked") return;
    if (likedIds.size === 0) {
      setLikedBrands([]);
      return;
    }
    setFetchingLiked(true);
    (async () => {
      const headers = await authHeaders();
      const params = new URLSearchParams({
        page: "1",
        page_size: "100",
        ids: [...likedIds].join(","),
      });
      fetch(`${BASE_URL}/api/user-branding/list-brands?${params}`, { headers })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.brands) setLikedBrands(data.brands);
        })
        .catch(() => {})
        .finally(() => setFetchingLiked(false));
    })();
  }, [user, mode, likedIds]);

  // ── Card click ─────────────────────────────────────────────────────────────
  const handleCardPress = useCallback(
    async (brand: BrandCard) => {
      if (!viewedIds.has(brand.id)) {
        const next = new Set(viewedIds).add(brand.id);
        setViewedIds(next);
        persistInteractions(likedIds, next);
        const headers = await authHeaders();
        fetch(`${BASE_URL}/api/user-branding/view-brand/${brand.id}`, {
          method: "POST",
          headers,
        }).catch(() => {});
        setBrands((prev) =>
          prev.map((b) =>
            b.id === brand.id ? { ...b, views_count: b.views_count + 1 } : b,
          ),
        );
      }
      router.push({
        pathname: "/discover-brands/[id]" as any,
        params: { id: brand.id },
      });
    },
    [viewedIds, likedIds, persistInteractions, router],
  );

  // ── Like toggle ────────────────────────────────────────────────────────────
  const handleLike = useCallback(
    async (brand: BrandCard) => {
      const isLiked = likedIds.has(brand.id);
      const next = new Set(likedIds);
      if (isLiked) next.delete(brand.id);
      else next.add(brand.id);
      setLikedIds(next);
      persistInteractions(next, viewedIds);
      setBrands((prev) =>
        prev.map((b) =>
          b.id === brand.id
            ? { ...b, likes_count: b.likes_count + (isLiked ? -1 : 1) }
            : b,
        ),
      );
      const headers = await authHeaders();
      fetch(`${BASE_URL}/api/user-branding/like-brand/${brand.id}`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ liked: !isLiked }),
      }).catch(() => {});
    },
    [likedIds, viewedIds, persistInteractions],
  );

  // ── Loading guard ──────────────────────────────────────────────────────────
  if (loadingUser || !user) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="small" color="#71717a" />
      </View>
    );
  }

  const SORT_OPTIONS: {
    key: SortKey;
    icon: React.ReactNode;
    labelKey: string;
  }[] = [
    {
      key: "most_viewed",
      icon: (
        <TrendingUp
          size={13}
          color={sort === "most_viewed" ? "#f9a8d4" : "#a1a1aa"}
        />
      ),
      labelKey: "sortViewed",
    },
    {
      key: "most_liked",
      icon: (
        <Flame
          size={13}
          color={sort === "most_liked" ? "#f9a8d4" : "#a1a1aa"}
        />
      ),
      labelKey: "sortLiked",
    },
    {
      key: "newest",
      icon: (
        <Sparkles size={13} color={sort === "newest" ? "#f9a8d4" : "#a1a1aa"} />
      ),
      labelKey: "sortNewest",
    },
  ];

  const activeBrands = mode === "liked" ? likedBrands : brands;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <Sidebar />

      <View style={styles.main}>
        {/* ── Top bar ── */}
        <View style={styles.topBar}>
          {/* Row 1: search + submit */}
          <View style={styles.topBarRow1}>
            <View style={styles.searchWrap}>
              <Search size={15} color="#71717a" />
              <TextInput
                value={searchInput}
                onChangeText={setSearchInput}
                placeholder={t("searchPlaceholder")}
                placeholderTextColor="#52525b"
                style={styles.searchInput}
              />
            </View>

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={() => router.push("/profile?tab=branding")}
            >
              <Plus size={16} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Row 2: mode toggle + sort chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.topBarRow2}
            contentContainerStyle={styles.topBarRow2Content}
          >
            {/* Mode toggle */}
            <View style={styles.modeToggle}>
              <TouchableOpacity
                onPress={() => setMode("browse")}
                style={[
                  styles.modeBtn,
                  mode === "browse" && styles.modeBtnActive,
                ]}
              >
                <Text
                  style={[
                    styles.modeBtnText,
                    mode === "browse" && styles.modeBtnTextActive,
                  ]}
                >
                  {t("modeBrowse")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setMode("liked")}
                style={[
                  styles.modeBtn,
                  styles.modeBtnBorderLeft,
                  mode === "liked" && styles.modeBtnActiveLiked,
                ]}
              >
                <Heart
                  size={11}
                  color={mode === "liked" ? "#f9a8d4" : "#a1a1aa"}
                  fill={mode === "liked" ? "#f472b6" : "none"}
                />
                <Text
                  style={[
                    styles.modeBtnText,
                    mode === "liked" && styles.modeBtnTextLiked,
                  ]}
                >
                  {t("modeLiked")}
                </Text>
                {likedIds.size > 0 && (
                  <Text style={styles.likedCount}>({likedIds.size})</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Sort chips */}
            {mode === "browse" && (
              <View style={styles.sortChips}>
                {SORT_OPTIONS.map(({ key, icon, labelKey }) => (
                  <TouchableOpacity
                    key={key}
                    onPress={() => setSort(key)}
                    style={[
                      styles.sortChip,
                      sort === key && styles.sortChipActive,
                    ]}
                  >
                    {icon}
                    <Text
                      style={[
                        styles.sortChipText,
                        sort === key && styles.sortChipTextActive,
                      ]}
                    >
                      {t(labelKey)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>
        </View>

        {/* ── Content ── */}
        {mode === "liked" && fetchingLiked ? (
          <View style={styles.centerLoader}>
            <ActivityIndicator size="small" color="#71717a" />
          </View>
        ) : mode === "liked" && likedIds.size === 0 ? (
          <View style={styles.noLikedState}>
            <View style={styles.emptyIconWrap}>
              <Heart size={28} color="#3f3f46" />
            </View>
            <Text style={styles.emptyTitle}>{t("noLikedTitle")}</Text>
            <Text style={styles.emptyHint}>{t("noLikedHint")}</Text>
            <TouchableOpacity onPress={() => setMode("browse")}>
              <Text style={styles.browseNowLink}>{t("browseNow")}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={activeBrands}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.gridContent}
            renderItem={({ item }) => (
              <BrandCardItem
                brand={item}
                liked={likedIds.has(item.id)}
                onPress={() => handleCardPress(item)}
                onLike={() => handleLike(item)}
              />
            )}
            ListHeaderComponent={
              search && !fetching && brands.length > 0 ? (
                <Text style={styles.searchResultHint}>
                  {t("showingResultsFor")}{" "}
                  <Text style={styles.searchResultQuery}>
                    &quot;{search}&quot;
                  </Text>
                </Text>
              ) : null
            }
            ListEmptyComponent={
              !fetching ? <EmptyState search={search} t={t} /> : null
            }
            ListFooterComponent={
              <>
                {fetching && (
                  <View style={styles.centerLoader}>
                    <ActivityIndicator size="small" color="#71717a" />
                  </View>
                )}
                {!hasMore && brands.length > 0 && (
                  <Text style={styles.endOfResults}>{t("endOfResults")}</Text>
                )}
              </>
            }
            onEndReached={() => {
              if (mode === "browse" && hasMore && !fetching) {
                fetchBrands(page);
              }
            }}
            onEndReachedThreshold={0.3}
          />
        )}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#000",
  },
  main: {
    flex: 1,
    backgroundColor: "#000",
  },
  loadingScreen: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Top bar
  topBar: {
    backgroundColor: "rgba(0,0,0,0.9)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(39,39,42,0.6)",
  },
  topBarRow1: {
    flexDirection: "row",
    alignItems: "center",
    // paddingLeft: leave space for the Sidebar floating button (~56px)
    paddingLeft: 60,
    paddingRight: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#3f3f46",
    borderRadius: 8,
    height: 36,
    paddingHorizontal: 10,
    gap: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: "#fff",
    height: "100%",
  },
  submitBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#db2777",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  // ── Row 2
  topBarRow2: {
    paddingBottom: 10,
  },
  topBarRow2Content: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 8,
  },
  modeToggle: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#3f3f46",
    borderRadius: 8,
    overflow: "hidden",
    flexShrink: 0,
  },
  modeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  modeBtnBorderLeft: {
    borderLeftWidth: 1,
    borderLeftColor: "#3f3f46",
  },
  modeBtnActive: {
    backgroundColor: "#3f3f46",
  },
  modeBtnActiveLiked: {
    backgroundColor: "#3f3f46",
  },
  modeBtnText: {
    fontSize: 12,
    color: "#a1a1aa",
  },
  modeBtnTextActive: {
    color: "#fff",
  },
  modeBtnTextLiked: {
    color: "#f9a8d4",
  },
  likedCount: {
    fontSize: 10,
    color: "#71717a",
    marginLeft: 2,
  },
  sortChips: {
    flexDirection: "row",
    gap: 6,
  },
  sortChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#3f3f46",
    backgroundColor: "#18181b",
  },
  sortChipActive: {
    borderColor: "rgba(236,72,153,0.6)",
    backgroundColor: "rgba(219,39,119,0.15)",
  },
  sortChipText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#a1a1aa",
  },
  sortChipTextActive: {
    color: "#f9a8d4",
  },

  // ── Grid
  gridContent: {
    padding: 12,
    gap: 10,
  },

  // ── Brand card
  card: {
    flex: 1,
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#27272a",
    borderRadius: 16,
    overflow: "hidden",
  },
  cardBanner: {
    height: 72,
    backgroundColor: "#27272a",
    position: "relative",
  },
  paletteDots: {
    position: "absolute",
    bottom: 6,
    right: 6,
    flexDirection: "row",
    gap: 3,
  },
  paletteDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.4)",
  },
  logoRow: {
    paddingHorizontal: 12,
    marginTop: -20,
    zIndex: 10,
  },
  logoWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#18181b",
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
    fontSize: 16,
    fontWeight: "700",
    color: "rgba(255,255,255,0.6)",
  },
  cardBody: {
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 12,
    gap: 6,
  },
  cardNameBlock: {
    gap: 2,
  },
  cardName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  nicheRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  nicheText: {
    fontSize: 11,
    color: "#a1a1aa",
  },
  cardBio: {
    fontSize: 11,
    color: "#a1a1aa",
    lineHeight: 16,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  tag: {
    backgroundColor: "#27272a",
    borderWidth: 1,
    borderColor: "rgba(63,63,70,0.6)",
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tagText: {
    fontSize: 10,
    color: "#a1a1aa",
  },
  tagOverflow: {
    fontSize: 10,
    color: "#52525b",
    alignSelf: "center",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
    gap: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    flex: 1,
    minWidth: 0,
  },
  locationText: {
    fontSize: 11,
    color: "#71717a",
    flex: 1,
  },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 0,
  },
  viewsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  viewsText: {
    fontSize: 11,
    color: "#71717a",
  },
  likeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#3f3f46",
    backgroundColor: "#27272a",
  },
  likeBtnActive: {
    borderColor: "rgba(236,72,153,0.6)",
    backgroundColor: "rgba(219,39,119,0.15)",
  },
  likeBtnText: {
    fontSize: 11,
    color: "#a1a1aa",
  },
  likeBtnTextActive: {
    color: "#f472b6",
  },

  // ── Empty / no-liked states
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    gap: 10,
  },
  noLikedState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    gap: 10,
  },
  emptyIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#27272a",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#d4d4d8",
  },
  emptyHint: {
    fontSize: 13,
    color: "#71717a",
    textAlign: "center",
    maxWidth: 280,
  },
  browseNowLink: {
    fontSize: 12,
    color: "#f472b6",
    textDecorationLine: "underline",
    marginTop: 4,
  },

  // ── Misc
  searchResultHint: {
    fontSize: 12,
    color: "#71717a",
    marginBottom: 12,
  },
  searchResultQuery: {
    color: "#d4d4d8",
  },
  centerLoader: {
    paddingVertical: 40,
    alignItems: "center",
  },
  endOfResults: {
    textAlign: "center",
    fontSize: 11,
    color: "#52525b",
    paddingVertical: 24,
  },
});

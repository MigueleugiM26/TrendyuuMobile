import { Sidebar } from "@/app/dashboard/components/Sidebar";
import { useUser } from "@/src/context/user-context";
import { useTranslations } from "@/src/hooks/useTranslations";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams } from "expo-router";
import {
  Clock,
  Eye,
  FileImage,
  Filter,
  Heart,
  Image as ImageIcon,
  Layers,
  LayoutGrid,
  Music,
  Play,
  Search,
  User,
  Video,
  X,
} from "lucide-react-native";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  InlineSocialLinksBar,
  VideoPreviewModal,
} from "./video-preview-modal-public-gallery";

// ─── Types ────────────────────────────────────────────────────────────────────

type SocialLinks = {
  youtube?: string;
  instagram?: string;
  twitter?: string;
  tiktok?: string;
  twitch?: string;
  facebook?: string;
  kwai?: string;
  website?: string;
};

type TotalVideoData = {
  liked_videos?: string[];
  viewed_videos?: string[];
  viewed_users?: string[];
};

type AiMetadata = {
  tool?: string;
  text?: string;
  voice_id?: number;
  voice_name?: string;
  target_voice_id?: number;
  target_voice_name?: string;
  source_filename?: string;
  source_language?: string;
  target_language?: string;
  use_original_voice?: boolean;
  prompt?: string;
  prompt_influence?: number;
  duration_seconds?: number;
  model?: string;
  resolution?: string;
  aspect_ratio?: string;
  credits_used?: number;
  stability?: number;
  style?: number;
  similarity_boost?: number;
};

type PublicVideo = {
  id: number;
  user_id: string;
  name: string;
  size: string;
  created_at: number;
  thumbnail: string | null;
  uploader_pfp: string | null;
  uploader_name: string | null;
  socials: SocialLinks | null;
  views: number;
  likes: number;
  duration: number;
  format: string;
  type:
    | "Video"
    | "Audio"
    | "AI_Video"
    | "AI_Audio"
    | "AI_Music"
    | "AI_Image"
    | "AI_Text"
    | "AI_VoiceChanged"
    | "AI_TranslatedAudio"
    | "AI_SoundEffect"
    | "Presentation";
  nsfw: boolean;
  dev: boolean;
  public_url: string;
  ai_metadata?: AiMetadata | null;
};

type ContentTab = "all" | "videos" | "audios" | "images" | "templates";
type GalleryTab = "explore" | "history" | "liked";
type SortBy = "date" | "likes" | "views" | "name" | "size" | "duration";
type Order = "asc" | "desc";

interface FilterState {
  sortBy: SortBy;
  order: Order;
  formatFilter: string;
  typeFilter: string;
  dateFrom: string;
  dateTo: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BASE_URL = process.env.EXPO_PUBLIC_TRENDYUU_URL_BACK;
const PAGE_SIZE = 12;
const CARD_GAP = 2;
const NUM_COLS = 3;

// ─── Auth helper ──────────────────────────────────────────────────────────────

async function authHeaders(): Promise<Record<string, string>> {
  const token = await AsyncStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resolveThumbnailUrl(thumbnail: string | null): string | null {
  if (!thumbnail) return null;
  if (thumbnail.startsWith("http://") || thumbnail.startsWith("https://"))
    return thumbnail;
  return `${BASE_URL}${thumbnail.startsWith("/") ? "" : "/"}${thumbnail}`;
}

function formatStat(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);
}

function removeDuplicates(arr: PublicVideo[]): PublicVideo[] {
  const seen = new Set<number>();
  return arr.filter((v) => {
    if (seen.has(v.id)) return false;
    seen.add(v.id);
    return true;
  });
}

function getTabFilters(tab: ContentTab): { format: string; type: string } {
  switch (tab) {
    case "videos":
      return { format: "mp4", type: "all" };
    case "audios":
      return { format: "mp3", type: "all" };
    case "images":
      return { format: "png", type: "all" };
    case "templates":
      return { format: "all", type: "AI_Video" };
    default:
      return { format: "all", type: "all" };
  }
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function VideoCardSkeleton() {
  return <View style={styles.cardSkeleton} />;
}

// ─── Media icon helpers ───────────────────────────────────────────────────────

function getMediaIcon(video: PublicVideo, size = 12) {
  const color = "#fff";
  if (video.format === "png" || video.type === "AI_Image")
    return <ImageIcon size={size} color={color} />;
  if (
    video.format === "mp3" ||
    video.type === "Audio" ||
    video.type === "AI_Audio" ||
    video.type === "AI_Music" ||
    video.type === "AI_VoiceChanged" ||
    video.type === "AI_TranslatedAudio" ||
    video.type === "AI_SoundEffect"
  )
    return <Music size={size} color={color} />;
  return <Play size={size} color={color} />;
}

function getPlaceholderIcon(video: PublicVideo) {
  const color = "#52525b";
  if (video.format === "png" || video.type === "AI_Image")
    return <ImageIcon size={32} color={color} />;
  if (
    video.format === "mp3" ||
    video.type === "Audio" ||
    video.type === "AI_Audio" ||
    video.type === "AI_Music"
  )
    return <Music size={32} color={color} />;
  return <Play size={32} color={color} />;
}

// ─── FilterSheet ──────────────────────────────────────────────────────────────

function FilterSheet({
  visible,
  draft: d,
  onChangeDraft,
  onApply,
  onClose,
  t,
}: {
  visible: boolean;
  draft: FilterState;
  onChangeDraft: (patch: Partial<FilterState>) => void;
  onApply: () => void;
  onClose: () => void;
  t: ReturnType<typeof useTranslations>;
}) {
  const sections: {
    label: string;
    key: keyof FilterState;
    options: { value: string; label: string }[];
  }[] = [
    {
      label: t("filters.sortBy.date"),
      key: "sortBy",
      options: [
        { value: "date", label: t("filters.sortBy.date") },
        { value: "likes", label: t("filters.sortBy.likes") },
        { value: "views", label: t("filters.sortBy.views") },
        { value: "name", label: t("filters.sortBy.name") },
        { value: "size", label: t("filters.sortBy.size") },
        { value: "duration", label: t("filters.sortBy.duration") },
      ],
    },
    {
      label: t("filters.order.descending"),
      key: "order",
      options: [
        { value: "desc", label: t("filters.order.descending") },
        { value: "asc", label: t("filters.order.ascending") },
      ],
    },
    {
      label: t("filters.format.all"),
      key: "formatFilter",
      options: [
        { value: "all", label: t("filters.format.all") },
        { value: "video", label: t("filters.format.groupVideo") },
        { value: "mp4", label: "MP4" },
        { value: "mov", label: "MOV" },
        { value: "mkv", label: "MKV" },
        { value: "webm", label: "WEBM" },
        { value: "audio", label: t("filters.format.groupAudio") },
        { value: "mp3", label: "MP3" },
        { value: "wav", label: "WAV" },
        { value: "aac", label: "AAC" },
        { value: "image", label: t("filters.format.groupImage") },
        { value: "jpg", label: "JPG" },
        { value: "png", label: "PNG" },
        { value: "gif", label: "GIF" },
        { value: "webp", label: "WEBP" },
      ],
    },
    {
      label: t("filters.type.all"),
      key: "typeFilter",
      options: [
        { value: "all", label: t("filters.type.all") },
        { value: "Video", label: t("filters.type.video") },
        { value: "Audio", label: t("filters.type.audio") },
        { value: "AI_Video", label: t("filters.type.aiVideo") },
        { value: "AI_Audio", label: t("filters.type.aiAudio") },
        { value: "AI_Music", label: t("filters.type.aiMusic") },
        { value: "AI_Image", label: t("filters.type.aiImage") },
        { value: "AI_Text", label: t("filters.type.aiText") },
        { value: "AI_VoiceChanged", label: t("filters.type.aiVoiceChanged") },
        {
          value: "AI_TranslatedAudio",
          label: t("filters.type.aiTranslatedAudio"),
        },
        { value: "AI_SoundEffect", label: t("filters.type.aiSoundEffect") },
        { value: "Presentation", label: t("filters.type.presentation") },
      ],
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable style={styles.filterBackdrop} onPress={onClose}>
        <Pressable style={styles.filterSheet} onPress={() => {}}>
          <View style={styles.filterSheetHeader}>
            <Text style={styles.filterSheetTitle}>{t("filters.label")}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <X size={20} color="#71717a" />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {sections.map((sec) => (
              <View key={sec.key} style={styles.filterSection}>
                <Text style={styles.filterSectionLabel}>{sec.label}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.filterChipRow}>
                    {sec.options.map((opt) => {
                      const active = d[sec.key] === opt.value;
                      return (
                        <TouchableOpacity
                          key={opt.value}
                          onPress={() =>
                            onChangeDraft({ [sec.key]: opt.value })
                          }
                          style={[
                            styles.filterChip,
                            active && styles.filterChipActive,
                          ]}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.filterChipText,
                              active && styles.filterChipTextActive,
                            ]}
                          >
                            {opt.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity
            onPress={onApply}
            style={styles.filterApplyBtn}
            activeOpacity={0.8}
          >
            <Text style={styles.filterApplyText}>
              {t("filters.applyFilters")}
            </Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── PublicVideoCard ──────────────────────────────────────────────────────────

function PublicVideoCard({
  video,
  cardSize,
  seeNsfw,
  liked,
  viewed,
  isUserProfile,
  failedImages,
  onPlay,
  onImageError,
  t,
}: {
  video: PublicVideo;
  cardSize: number;
  seeNsfw: "No" | "Blurred" | "Yes";
  liked: Set<number>;
  viewed: Set<number>;
  isUserProfile: boolean;
  failedImages: Set<string>;
  onPlay: (video: PublicVideo) => void;
  onImageError: (id: string) => void;
  t: ReturnType<typeof useTranslations>;
}) {
  const isLiked = liked.has(video.id);
  const isViewed = viewed.has(video.id);
  const isNsfwHidden = video.nsfw && seeNsfw === "No";

  const thumbUrl = resolveThumbnailUrl(video.thumbnail);
  const hasThumb = !!thumbUrl && !failedImages.has(`thumb-${video.id}`);

  if (isNsfwHidden) {
    return (
      <View style={[styles.card, { width: cardSize, height: cardSize }]}>
        <View style={styles.cardPlaceholder}>
          <Text style={styles.nsfwLabel}>{t("nsfw")}</Text>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity
      onPress={() => onPlay(video)}
      activeOpacity={0.85}
      style={[styles.card, { width: cardSize, height: cardSize }]}
    >
      {/* Thumbnail */}
      {hasThumb ? (
        <Image
          source={{ uri: thumbUrl! }}
          style={[
            StyleSheet.absoluteFill,
            video.nsfw && seeNsfw === "Blurred" && styles.blurred,
          ]}
          resizeMode="cover"
          onError={() => onImageError(`thumb-${video.id}`)}
        />
      ) : (
        <View style={styles.cardPlaceholder}>{getPlaceholderIcon(video)}</View>
      )}

      {/* TOP LEFT: uploader info (non-profile mode) */}
      {!isUserProfile && (
        <View style={styles.cardUploaderRow}>
          {!video.uploader_pfp || failedImages.has(video.id.toString()) ? (
            <View style={styles.cardPfpFallback}>
              <User size={10} color="#71717a" />
            </View>
          ) : (
            <Image
              source={{ uri: video.uploader_pfp }}
              style={styles.cardPfp}
              onError={() => onImageError(video.id.toString())}
            />
          )}
          {video.dev && (
            <View style={styles.cardDevBadge}>
              <Text style={styles.cardDevText}>{t("devBadge")}</Text>
            </View>
          )}
        </View>
      )}

      {/* TOP RIGHT: media type icon + NSFW */}
      <View style={styles.cardTopRight}>
        {video.nsfw && seeNsfw === "Yes" && (
          <View style={styles.nsfwBadge}>
            <Text style={styles.nsfwBadgeText}>{t("nsfw")}</Text>
          </View>
        )}
        <View style={styles.cardIconBadge}>{getMediaIcon(video)}</View>
      </View>

      {/* BOTTOM LEFT: viewed / liked indicator */}
      {isViewed ? (
        <View style={styles.cardBottomIndicator}>
          <Eye size={10} color="#a1a1aa" />
        </View>
      ) : isLiked ? (
        <View style={styles.cardBottomIndicator}>
          <Heart size={10} color="#ec4899" fill="#ec4899" />
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

// ─── ProfileHeader ────────────────────────────────────────────────────────────

function ProfileHeader({
  profileUser,
  activeTab,
  tabs,
  onTabChange,
  failedImages,
  onImageError,
  user,
  selectedUserId,
  t,
}: {
  profileUser: {
    name: string;
    pfp: string;
    socials: SocialLinks;
    totalViews: number;
    totalLikes: number;
    videoCount: number;
    dev: boolean;
  };
  activeTab: ContentTab;
  tabs: { id: ContentTab; label: string; icon: React.ReactNode }[];
  onTabChange: (id: ContentTab) => void;
  failedImages: Set<string>;
  onImageError: (id: string) => void;
  user: { id?: string; totalVideoData?: TotalVideoData } | null;
  selectedUserId: string | null;
  t: ReturnType<typeof useTranslations>;
}) {
  const [pfpError, setPfpError] = useState(false);

  const stats = [
    {
      value: profileUser.videoCount,
      label: t("profile.videos"),
      color: "#f4f4f5",
    },
    {
      value: profileUser.totalViews,
      label: t("profile.views"),
      color: "#f4f4f5",
    },
    {
      value: profileUser.totalLikes,
      label: t("profile.likes"),
      color: "#ec4899",
    },
  ];

  return (
    <View style={styles.profileCard}>
      {/* Avatar */}
      <View style={{ alignItems: "center", marginTop: 24, marginBottom: 8 }}>
        <View style={{ position: "relative" }}>
          {!profileUser.pfp || pfpError ? (
            <View style={styles.profilePfpFallback}>
              <User size={32} color="#52525b" />
            </View>
          ) : (
            <Image
              source={{ uri: profileUser.pfp }}
              style={styles.profilePfp}
              onError={() => setPfpError(true)}
            />
          )}
          <View style={styles.profilePfpRing} pointerEvents="none" />
          {profileUser.dev && (
            <View style={styles.profileDevBadge}>
              <Text style={styles.profileDevText}>{t("devBadge")}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Name */}
      <Text style={styles.profileName}>{profileUser.name}</Text>

      {/* Social links */}
      {Object.keys(profileUser.socials || {}).length > 0 && (
        <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
          <InlineSocialLinksBar
            socials={profileUser.socials}
            user_id={user?.id}
            user_viewData={user?.totalVideoData}
            uploaderId={selectedUserId || ""}
          />
        </View>
      )}

      {/* Stats */}
      <View style={styles.profileStats}>
        {stats.map(({ value, label, color }) => (
          <View key={label} style={styles.profileStatItem}>
            <Text style={[styles.profileStatValue, { color }]}>
              {formatStat(value)}
            </Text>
            <Text style={styles.profileStatLabel}>{label}</Text>
          </View>
        ))}
      </View>

      {/* Content tabs */}
      <View style={styles.contentTabRow}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => onTabChange(tab.id)}
            style={[
              styles.contentTabBtn,
              activeTab === tab.id && styles.contentTabBtnActive,
            ]}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.contentTabText,
                activeTab === tab.id && styles.contentTabTextActive,
              ]}
            >
              {tab.label}
            </Text>
            {activeTab === tab.id && (
              <View style={styles.contentTabUnderline} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PublicGallery() {
  const t = useTranslations("PublicGallery");
  const params = useLocalSearchParams<{ uploader_id?: string }>();
  const selectedUserId = params.uploader_id || null;

  const { user, loading } = useUser() as {
    user: {
      id: string;
      name?: string;
      email: string;
      totalVideoData?: TotalVideoData;
    };
    loading: boolean;
  };

  // ── Image error tracking ────────────────────────────────────────
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const handleImageError = (id: string) =>
    setFailedImages((prev) => new Set(prev).add(id));

  const pendingViewsRef = useRef<Set<number>>(new Set());

  // ── Filter state ────────────────────────────────────────────────
  const [formatFilter, setFormatFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [order, setOrder] = useState<Order>("desc");

  // Draft filters (filter sheet)
  const [draftFilters, setDraftFilters] = useState<FilterState>({
    sortBy: "date",
    order: "desc",
    formatFilter: "all",
    typeFilter: "all",
    dateFrom: "",
    dateTo: "",
  });
  const [showFilterSheet, setShowFilterSheet] = useState(false);

  // ── Gallery state ───────────────────────────────────────────────
  const [videos, setVideos] = useState<PublicVideo[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const hasMoreRef = useRef(true);
  const isFetchingRef = useRef(false);
  const pageRef = useRef(1);

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [activeTab, setActiveTab] = useState<ContentTab>("all");
  const [galleryTab, setGalleryTab] = useState<GalleryTab>("explore");
  const [searchExpanded, setSearchExpanded] = useState(false);
  const searchInputRef = useRef<TextInput>(null);

  const [profileUserId, setProfileUserId] = useState<string>(
    selectedUserId || "",
  );
  const isUserProfile = !!profileUserId;

  const [profileUser, setProfileUser] = useState<{
    name: string;
    pfp: string;
    socials: SocialLinks;
    totalViews: number;
    totalLikes: number;
    videoCount: number;
    dev: boolean;
  } | null>(null);

  const [liked, setLiked] = useState<Set<number>>(new Set());
  const [viewed, setViewed] = useState<Set<number>>(new Set());
  const [seeNsfw] = useState<"No" | "Blurred" | "Yes">("No");

  // Grid layout
  const [cardSize, setCardSize] = useState(120);
  const flatListRef = useRef<FlatList>(null);
  const containerHeightRef = useRef(0);
  const contentHeightRef = useRef(0);

  // ── Filter count ────────────────────────────────────────────────
  const activeFilterCount = [
    sortBy !== "date" ? 1 : 0,
    order !== "desc" ? 1 : 0,
    formatFilter !== "all" ? 1 : 0,
    typeFilter !== "all" ? 1 : 0,
    dateFrom || dateTo ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  // ── Init ────────────────────────────────────────────────────────
  useEffect(() => {
    if (user?.totalVideoData) {
      setLiked(new Set((user.totalVideoData.liked_videos || []).map(Number)));
      setViewed(new Set((user.totalVideoData.viewed_videos || []).map(Number)));
    }
  }, [user]);

  useEffect(() => {
    setProfileUserId(selectedUserId || "");
    if (!selectedUserId) setProfileUser(null);
  }, [selectedUserId]);

  // ── Fetch ───────────────────────────────────────────────────────
  const fetchVideos = useCallback(
    async (pageNum: number, reset = false) => {
      if (!reset && (isFetchingRef.current || !hasMoreRef.current)) return;
      isFetchingRef.current = true;
      setLoadingGallery(true);
      try {
        const tabFilters = getTabFilters(activeTab);
        const headers = await authHeaders();

        const params = new URLSearchParams({
          page: pageNum.toString(),
          page_size: PAGE_SIZE.toString(),
          sort_by: sortBy,
          order,
          search: activeSearch,
          format: isUserProfile ? tabFilters.format : formatFilter,
          type: isUserProfile ? tabFilters.type : typeFilter,
          ...(dateFrom ? { date_from: dateFrom } : {}),
          ...(dateTo ? { date_to: dateTo } : {}),
        });

        if (isUserProfile) {
          params.append("uploader_name", profileUserId);
          params.append("profile_mode", "true");
        }

        if (galleryTab === "liked") {
          if (liked.size === 0) {
            setVideos([]);
            setHasMore(false);
            hasMoreRef.current = false;
            setLoadingGallery(false);
            isFetchingRef.current = false;
            return;
          }
          params.append("ids", Array.from(liked).join(","));
        } else if (galleryTab === "history") {
          if (viewed.size === 0) {
            setVideos([]);
            setHasMore(false);
            hasMoreRef.current = false;
            setLoadingGallery(false);
            isFetchingRef.current = false;
            return;
          }
          params.append("ids", Array.from(viewed).join(","));
        }

        const res = await fetch(
          `${BASE_URL}/api/video/get-public-gallery/?${params}`,
          { headers },
        );
        const data = await res.json();
        const newVideos: PublicVideo[] = removeDuplicates(data.videos || []);

        setVideos((prev) =>
          removeDuplicates(reset ? newVideos : [...prev, ...newVideos]),
        );
        const more = newVideos.length === PAGE_SIZE;
        setHasMore(more);
        hasMoreRef.current = more;
        pageRef.current = pageNum + 1;

        if (isUserProfile && newVideos.length > 0 && reset) {
          const first = newVideos[0];
          setProfileUser({
            name: first.uploader_name || "Unknown User",
            pfp: first.uploader_pfp || "",
            socials: first.socials || {},
            totalViews: newVideos.reduce((s, v) => s + v.views, 0),
            totalLikes: newVideos.reduce((s, v) => s + v.likes, 0),
            videoCount: data.total_videos || newVideos.length,
            dev: first.dev || false,
          });
        }
      } catch (err) {
        console.error("Failed to load public gallery:", err);
      } finally {
        setLoadingGallery(false);
        isFetchingRef.current = false;
        setTimeout(() => {
          if (
            hasMoreRef.current &&
            !isFetchingRef.current &&
            contentHeightRef.current <= containerHeightRef.current
          ) {
            fetchVideos(pageRef.current);
          }
        }, 100);
      }
    },
    [
      sortBy,
      order,
      activeSearch,
      formatFilter,
      typeFilter,
      dateFrom,
      dateTo,
      isUserProfile,
      profileUserId,
      activeTab,
      galleryTab,
      liked,
      viewed,
    ],
  );

  useEffect(() => {
    if (loading || !user) return;
    isFetchingRef.current = false;
    setVideos([]);
    pageRef.current = 1;
    hasMoreRef.current = true;
    setHasMore(true);
    fetchVideos(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeSearch,
    formatFilter,
    typeFilter,
    dateFrom,
    dateTo,
    sortBy,
    order,
    activeTab,
    galleryTab,
    profileUserId,
    loading,
    user,
  ]);

  // ── Displayed videos ────────────────────────────────────────────
  const allDisplayed = useMemo(
    () => videos.filter((v) => !(seeNsfw === "No" && v.nsfw)),
    [videos, seeNsfw],
  );

  const displayedVideos = useMemo(() => {
    if (galleryTab === "history")
      return allDisplayed.filter((v) => viewed.has(v.id));
    if (galleryTab === "liked")
      return allDisplayed.filter((v) => liked.has(v.id));
    return allDisplayed;
  }, [allDisplayed, galleryTab, viewed, liked]);

  // ── Modal nav ───────────────────────────────────────────────────
  const selectedVideo =
    selectedIndex !== null ? (displayedVideos[selectedIndex] ?? null) : null;
  const hasPrev = selectedIndex !== null && selectedIndex > 0;
  const hasNext =
    selectedIndex !== null && selectedIndex < displayedVideos.length - 1;
  const handlePrev = useCallback(
    () => setSelectedIndex((i) => (i !== null && i > 0 ? i - 1 : i)),
    [],
  );
  const handleNext = useCallback(
    () =>
      setSelectedIndex((i) =>
        i !== null && i < displayedVideos.length - 1 ? i + 1 : i,
      ),
    [displayedVideos.length],
  );
  const handleCloseModal = useCallback(() => setSelectedIndex(null), []);

  // ── Like ────────────────────────────────────────────────────────
  const handleToggleLike = async (video: PublicVideo) => {
    const isAlreadyLiked = liked.has(video.id);
    const endpoint = isAlreadyLiked
      ? `${BASE_URL}/api/video/remove-like/${video.id}`
      : `${BASE_URL}/api/video/add-like/${video.id}`;
    const prevLiked = liked;
    const newLiked = new Set(prevLiked);
    const delta = isAlreadyLiked ? -1 : 1;
    try {
      if (isAlreadyLiked) newLiked.delete(video.id);
      else newLiked.add(video.id);
      setLiked(newLiked);
      setVideos((prev) =>
        prev.map((v) =>
          v.id === video.id ? { ...v, likes: Math.max(0, v.likes + delta) } : v,
        ),
      );
      if (user?.totalVideoData)
        user.totalVideoData.liked_videos = [...newLiked].map(String);
      const headers = await authHeaders();
      const res = await fetch(endpoint, { method: "POST", headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (typeof data.likes === "number")
        setVideos((prev) =>
          prev.map((v) =>
            v.id === video.id ? { ...v, likes: data.likes } : v,
          ),
        );
    } catch {
      setLiked(prevLiked);
      setVideos((prev) =>
        prev.map((v) =>
          v.id === video.id ? { ...v, likes: Math.max(0, v.likes - delta) } : v,
        ),
      );
      if (user?.totalVideoData)
        user.totalVideoData.liked_videos = [...prevLiked].map(String);
    }
  };

  const handlePlay = useCallback(
    (video: PublicVideo) => {
      const idx = displayedVideos.findIndex((v) => v.id === video.id);
      setVideoUrl(video.public_url);
      setSelectedIndex(idx);
    },
    [displayedVideos],
  );

  // ── View tracking ───────────────────────────────────────────────
  useEffect(() => {
    if (!selectedVideo) return;
    setVideoUrl(selectedVideo.public_url);
    if (
      viewed.has(selectedVideo.id) ||
      pendingViewsRef.current.has(selectedVideo.id)
    )
      return;
    pendingViewsRef.current.add(selectedVideo.id);
    let cancelled = false;
    (async () => {
      try {
        const headers = await authHeaders();
        const res = await fetch(
          `${BASE_URL}/api/video/add-view/${selectedVideo.id}`,
          { method: "POST", headers },
        );
        if (cancelled || !res.ok) return;
        setVideos((prev) =>
          prev.map((v) =>
            v.id === selectedVideo.id ? { ...v, views: v.views + 1 } : v,
          ),
        );
        const newViewed = new Set([...viewed, selectedVideo.id]);
        setViewed(newViewed);
        if (user?.totalVideoData)
          user.totalVideoData.viewed_videos = [...newViewed].map(String);
      } finally {
        pendingViewsRef.current.delete(selectedVideo.id);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedVideo, viewed, user]);

  // ── Filters ─────────────────────────────────────────────────────
  const openFilterSheet = () => {
    setDraftFilters({
      sortBy,
      order,
      formatFilter,
      typeFilter,
      dateFrom,
      dateTo,
    });
    setShowFilterSheet(true);
  };

  const applyFilters = () => {
    setSortBy(draftFilters.sortBy);
    setOrder(draftFilters.order);
    setFormatFilter(draftFilters.formatFilter);
    setTypeFilter(draftFilters.typeFilter);
    setDateFrom(draftFilters.dateFrom);
    setDateTo(draftFilters.dateTo);
    setShowFilterSheet(false);
  };

  // ── Search ──────────────────────────────────────────────────────
  const handleSearchIconPress = () => {
    setSearchExpanded(true);
    setTimeout(() => searchInputRef.current?.focus(), 50);
  };

  const handleSearchBlur = () => setSearchExpanded(false);

  const handleSearchClear = () => {
    setSearch("");
    setActiveSearch("");
    setSearchExpanded(false);
  };

  const handleSearchSubmit = () => {
    setActiveSearch(search);
    setSearchExpanded(false);
  };

  // ── Tabs ────────────────────────────────────────────────────────
  const contentTabs: {
    id: ContentTab;
    label: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: "all",
      label: t("tabs.all"),
      icon: <LayoutGrid size={13} color="#71717a" />,
    },
    {
      id: "videos",
      label: t("tabs.videos"),
      icon: <Video size={13} color="#71717a" />,
    },
    {
      id: "audios",
      label: t("tabs.audios"),
      icon: <Music size={13} color="#71717a" />,
    },
    {
      id: "images",
      label: t("tabs.images"),
      icon: <FileImage size={13} color="#71717a" />,
    },
    {
      id: "templates",
      label: t("tabs.templates"),
      icon: <Layers size={13} color="#71717a" />,
    },
  ];

  const emptyMessage = () => {
    if (galleryTab === "history") return t("noVideos.history");
    if (galleryTab === "liked") return t("noVideos.liked");
    return isUserProfile
      ? t("noVideos.user", { name: profileUser?.name || "this user" })
      : t("noVideos.general");
  };

  // ── Render ──────────────────────────────────────────────────────
  const renderItem = useCallback(
    ({ item }: { item: PublicVideo }) => (
      <PublicVideoCard
        video={item}
        cardSize={cardSize}
        seeNsfw={seeNsfw}
        liked={liked}
        viewed={viewed}
        isUserProfile={isUserProfile}
        failedImages={failedImages}
        onPlay={handlePlay}
        onImageError={handleImageError}
        t={t}
      />
    ),
    [
      cardSize,
      seeNsfw,
      liked,
      viewed,
      isUserProfile,
      failedImages,
      handlePlay,
      t,
    ],
  );

  const renderFooter = () => {
    if (!loadingGallery) return <View style={{ height: 40 }} />;
    return (
      <View style={styles.skeletonGrid}>
        {Array.from({ length: 9 }).map((_, i) => (
          <VideoCardSkeleton key={i} />
        ))}
      </View>
    );
  };

  const onEndReached = useCallback(() => {
    if (hasMoreRef.current && !isFetchingRef.current)
      fetchVideos(pageRef.current);
  }, [fetchVideos]);

  const onLayout = (e: any) => {
    const w = e.nativeEvent.layout.width;
    setCardSize(Math.floor((w - CARD_GAP * (NUM_COLS - 1)) / NUM_COLS));
  };

  // ── Header (non-profile) ────────────────────────────────────────
  const renderListHeader = () => (
    <>
      {/* Profile header */}
      {isUserProfile && profileUser && (
        <ProfileHeader
          profileUser={profileUser}
          activeTab={activeTab}
          tabs={contentTabs}
          onTabChange={(id) => setActiveTab(id)}
          failedImages={failedImages}
          onImageError={handleImageError}
          user={user}
          selectedUserId={selectedUserId}
          t={t}
        />
      )}

      {/* Section label for history/liked (non-profile) */}
      {!isUserProfile && galleryTab === "history" && (
        <View style={styles.sectionLabel}>
          <Clock size={16} color="#71717a" />
          <Text style={styles.sectionLabelText}>{t("sections.history")}</Text>
        </View>
      )}
      {!isUserProfile && galleryTab === "liked" && (
        <View style={styles.sectionLabel}>
          <Heart size={16} color="#ec4899" />
          <Text style={styles.sectionLabelText}>{t("sections.liked")}</Text>
        </View>
      )}

      {isUserProfile && <View style={{ height: 8 }} />}
    </>
  );

  return (
    <View style={styles.root}>
      {/* ── Title row ──────────────────────────────────────────── */}
      <View style={styles.titleRow}>
        <Sidebar />
        {!isUserProfile && <Text style={styles.pageTitle}>{t("title")}</Text>}
        {isUserProfile && profileUser && (
          <Text style={styles.pageTitle}>{profileUser.name}</Text>
        )}
      </View>

      {/* ── Gallery tabs (non-profile) ─────────────────────────── */}
      {!isUserProfile && (
        <View style={styles.galleryTabRow}>
          {(
            [
              {
                id: "explore" as GalleryTab,
                label: t("galleryTabs.explore"),
                icon: (
                  <LayoutGrid
                    size={13}
                    color={galleryTab === "explore" ? "#fff" : "#71717a"}
                  />
                ),
              },
              {
                id: "history" as GalleryTab,
                label: t("galleryTabs.history"),
                icon: (
                  <Clock
                    size={13}
                    color={galleryTab === "history" ? "#fff" : "#71717a"}
                  />
                ),
              },
              {
                id: "liked" as GalleryTab,
                label: t("galleryTabs.liked"),
                icon: (
                  <Heart
                    size={13}
                    color={galleryTab === "liked" ? "#fff" : "#71717a"}
                  />
                ),
              },
            ] as const
          ).map((tab) => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setGalleryTab(tab.id)}
              style={[
                styles.galleryTab,
                galleryTab === tab.id && styles.galleryTabActive,
              ]}
              activeOpacity={0.7}
            >
              {tab.icon}
              <Text
                style={[
                  styles.galleryTabText,
                  galleryTab === tab.id && styles.galleryTabTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* ── Search + filter row (explore only) ────────────────── */}
      {galleryTab === "explore" && !isUserProfile && (
        <View style={styles.toolRow}>
          {searchExpanded ? (
            <View style={styles.searchBarExpanded}>
              <Search size={14} color="#f9a8d4" />
              <TextInput
                ref={searchInputRef}
                value={search}
                onChangeText={setSearch}
                onSubmitEditing={handleSearchSubmit}
                onBlur={handleSearchBlur}
                returnKeyType="search"
                placeholder={t("search.video")}
                placeholderTextColor="#52525b"
                style={styles.searchInput}
              />
              <TouchableOpacity onPress={handleSearchClear} hitSlop={6}>
                <X size={13} color="#71717a" />
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <TouchableOpacity
                onPress={handleSearchIconPress}
                style={[
                  styles.topBarIconBtn,
                  activeSearch && styles.topBarIconBtnActive,
                ]}
                activeOpacity={0.7}
              >
                <Search
                  size={16}
                  color={activeSearch ? "#f9a8d4" : "#a1a1aa"}
                />
              </TouchableOpacity>

              <View style={{ flex: 1 }} />

              <TouchableOpacity
                onPress={openFilterSheet}
                style={[
                  styles.topBarIconBtn,
                  activeFilterCount > 0 && styles.topBarIconBtnActive,
                ]}
                activeOpacity={0.7}
              >
                <Filter
                  size={16}
                  color={activeFilterCount > 0 ? "#f9a8d4" : "#a1a1aa"}
                />
                {activeFilterCount > 0 && (
                  <View style={styles.filterBadge}>
                    <Text style={styles.filterBadgeText}>
                      {activeFilterCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      )}

      {/* ── Grid ──────────────────────────────────────────────── */}
      <FlatList
        ref={flatListRef}
        data={displayedVideos}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        numColumns={NUM_COLS}
        columnWrapperStyle={{ gap: CARD_GAP }}
        ItemSeparatorComponent={() => <View style={{ height: CARD_GAP }} />}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={
          !loadingGallery ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>{emptyMessage()}</Text>
            </View>
          ) : null
        }
        ListFooterComponent={renderFooter}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.4}
        onLayout={(e) => {
          onLayout(e);
          containerHeightRef.current = e.nativeEvent.layout.height;
        }}
        onContentSizeChange={(_, h) => {
          contentHeightRef.current = h;
        }}
        contentContainerStyle={{ paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
      />

      {/* ── Filter sheet ──────────────────────────────────────── */}
      <FilterSheet
        visible={showFilterSheet}
        draft={draftFilters}
        onChangeDraft={(patch) =>
          setDraftFilters((prev) => ({ ...prev, ...patch }))
        }
        onApply={applyFilters}
        onClose={() => setShowFilterSheet(false)}
        t={t}
      />

      {/* ── Video preview modal (owns its own Modal internally) ── */}
      {selectedVideo && (
        <VideoPreviewModal
          isOpen={!!selectedVideo}
          onClose={handleCloseModal}
          videoUrl={videoUrl || ""}
          videoName={selectedVideo.name}
          likes={
            displayedVideos.find((v) => v.id === selectedVideo.id)?.likes ??
            selectedVideo.likes
          }
          views={
            displayedVideos.find((v) => v.id === selectedVideo.id)?.views ??
            selectedVideo.views
          }
          isLiked={liked.has(selectedVideo.id)}
          onLike={() => handleToggleLike(selectedVideo)}
          uploaderName={selectedVideo.uploader_name || "Unknown User"}
          uploaderPfp={selectedVideo.uploader_pfp || ""}
          uploaderDev={selectedVideo.dev || false}
          uploaderId={selectedVideo.user_id || ""}
          socials={selectedVideo.socials || null}
          user_id={user?.id}
          user_viewData={user?.totalVideoData}
          format={selectedVideo.format || "mp4"}
          type={selectedVideo.type}
          ai_metadata={selectedVideo.ai_metadata ?? undefined}
          onPrev={handlePrev}
          onNext={handleNext}
          hasPrev={hasPrev}
          hasNext={hasNext}
        />
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#09090b",
  },

  // ── Title row
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 6,
    backgroundColor: "#09090b",
    position: "relative",
  },
  pageTitle: {
    left: 0,
    right: 0,
    flex: 1,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "700",
    color: "#f4f4f5",
    pointerEvents: "none",
    marginBottom: 12,
  },

  // ── Gallery tabs (explore / history / liked)
  galleryTabRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingBottom: 10,
    backgroundColor: "#09090b",
  },
  galleryTab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 9999,
  },
  galleryTabActive: {
    backgroundColor: "#be185d",
  },
  galleryTabText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#71717a",
  },
  galleryTabTextActive: {
    color: "#fff",
  },

  // ── Tool row (search / filter)
  toolRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 10,
    backgroundColor: "#09090b",
    borderBottomWidth: 1,
    borderBottomColor: "#18181b",
    gap: 8,
  },

  // ── Icon buttons (search icon, filter icon)
  topBarIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: "#27272a",
    backgroundColor: "#18181b",
    alignItems: "center",
    justifyContent: "center",
  },
  topBarIconBtnActive: {
    borderColor: "#ec4899",
    backgroundColor: "rgba(236,72,153,0.1)",
  },
  filterBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#ec4899",
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadgeText: {
    fontSize: 9,
    color: "#fff",
    fontWeight: "700",
  },

  // ── Search expanded
  searchBarExpanded: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#18181b",
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: "#ec4899",
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  searchInput: {
    flex: 1,
    color: "#f4f4f5",
    fontSize: 13,
    padding: 0,
  },

  // ── Grid cards
  card: {
    backgroundColor: "#18181b",
    borderRadius: 4,
    overflow: "hidden",
  },
  cardPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#27272a",
  },
  blurred: {
    opacity: 0.15,
  },
  nsfwLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#71717a",
    textTransform: "uppercase",
  },

  // ── Card overlays
  cardUploaderRow: {
    position: "absolute",
    top: 5,
    left: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    zIndex: 10,
  },
  cardPfp: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  cardPfpFallback: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardDevBadge: {
    backgroundColor: "#be185d",
    borderRadius: 3,
    paddingHorizontal: 3,
    paddingVertical: 1,
  },
  cardDevText: {
    fontSize: 7,
    fontWeight: "700",
    color: "#fff",
  },
  cardTopRight: {
    position: "absolute",
    top: 5,
    right: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    zIndex: 10,
  },
  cardIconBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  nsfwBadge: {
    backgroundColor: "rgba(239,68,68,0.8)",
    borderRadius: 9999,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  nsfwBadgeText: {
    fontSize: 8,
    fontWeight: "700",
    color: "#fef2f2",
  },
  cardBottomIndicator: {
    position: "absolute",
    bottom: 5,
    left: 5,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },

  // ── Skeleton
  cardSkeleton: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: "#27272a",
    borderRadius: 4,
  },
  skeletonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: CARD_GAP,
    padding: 12,
  },

  // ── Empty state
  emptyState: {
    paddingVertical: 80,
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 14,
    color: "#71717a",
  },

  // ── Section label (history / liked headers)
  sectionLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  sectionLabelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#f4f4f5",
  },

  // ── Profile card
  profileCard: {
    backgroundColor: "#09090b",
    borderWidth: 1,
    borderColor: "rgba(39,39,42,0.7)",
    borderRadius: 16,
    marginHorizontal: 12,
    marginBottom: 12,
    marginTop: 4,
    overflow: "hidden",
  },
  profilePfp: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: "#09090b",
  },
  profilePfpFallback: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#27272a",
    borderWidth: 3,
    borderColor: "#09090b",
    alignItems: "center",
    justifyContent: "center",
  },
  profilePfpRing: {
    position: "absolute",
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 38,
    borderWidth: 2,
    borderColor: "rgba(236,72,153,0.4)",
  },
  profileDevBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#be185d",
    borderRadius: 9999,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderWidth: 2,
    borderColor: "#09090b",
  },
  profileDevText: {
    fontSize: 8,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  profileName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
    marginBottom: 6,
  },
  profileStats: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 16,
    marginTop: 4,
  },
  profileStatItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 12,
  },
  profileStatValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  profileStatLabel: {
    fontSize: 9,
    color: "#71717a",
    marginTop: 3,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // ── Content tabs (profile mode)
  contentTabRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#27272a",
  },
  contentTabBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    position: "relative",
  },
  contentTabBtnActive: {},
  contentTabText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#71717a",
  },
  contentTabTextActive: {
    color: "#fff",
  },
  contentTabUnderline: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "#ec4899",
  },

  // ── Filter sheet
  filterBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  filterSheet: {
    backgroundColor: "#09090b",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingBottom: 32,
    maxHeight: "85%",
  },
  filterSheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  filterSheetTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#f4f4f5",
  },
  filterSection: {
    paddingHorizontal: 16,
    marginBottom: 14,
    gap: 8,
  },
  filterSectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#71717a",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  filterChipRow: {
    flexDirection: "row",
    gap: 6,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: "#27272a",
    backgroundColor: "#18181b",
  },
  filterChipActive: {
    borderColor: "#ec4899",
    backgroundColor: "rgba(236,72,153,0.1)",
  },
  filterChipText: {
    fontSize: 13,
    color: "#a1a1aa",
  },
  filterChipTextActive: {
    color: "#f9a8d4",
    fontWeight: "500",
  },
  filterApplyBtn: {
    marginHorizontal: 16,
    marginTop: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#be185d",
    alignItems: "center",
  },
  filterApplyText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
});

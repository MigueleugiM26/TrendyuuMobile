import { Eye, EyeOff, Heart, Music, Play, User } from "lucide-react-native";
import { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Video = {
  id: string;
  name: string;
  uploader_name: string;
  uploader_pfp: string;
  thumbnail?: string;
  nsfw?: boolean;
  duration: number;
  size: string;
  created_at: number;
  views: number;
  likes: number;
};

interface NsfwTabProps {
  nsfwOption: "No" | "Blurred" | "Yes";
  handleNsfwChange: (option: "No" | "Blurred" | "Yes") => void;
  t: (key: string, opts?: Record<string, string>) => string;
}

const videos: Video[] = [
  {
    id: "1",
    name: "Fishing Day!.mp4",
    uploader_name: "Alice",
    uploader_pfp:
      "https://cdn-frontend.trendyuu.com/public/profile_videos_mockup/alice.webp",
    thumbnail:
      "https://cdn-frontend.trendyuu.com/public/profile_videos_mockup/fishingDay.webp",
    nsfw: false,
    duration: 120,
    size: "25MB",
    created_at: Date.now() / 1000,
    views: 230,
    likes: 50,
  },
  {
    id: "2",
    name: "Spicy Content.mp4",
    uploader_name: "Bob",
    uploader_pfp:
      "https://cdn-frontend.trendyuu.com/public/profile_videos_mockup/default-avatar.webp",
    thumbnail:
      "https://cdn-frontend.trendyuu.com/public/profile_videos_mockup/spicyContent.webp",
    nsfw: true,
    duration: 90,
    size: "18MB",
    created_at: Date.now() / 1000 - 86400,
    views: 420,
    likes: 123,
  },
  {
    id: "3",
    name: "Cooking Tips.mp4",
    uploader_name: "ChefMaster",
    uploader_pfp:
      "https://cdn-frontend.trendyuu.com/public/profile_videos_mockup/chefMaster.webp",
    thumbnail:
      "https://cdn-frontend.trendyuu.com/public/profile_videos_mockup/cookingTips.webp",
    nsfw: false,
    duration: 200,
    size: "40MB",
    created_at: Date.now() / 1000 - 172800,
    views: 150,
    likes: 35,
  },
  {
    id: "4",
    name: "Nature Walk.mp4",
    uploader_name: "Traveler",
    uploader_pfp:
      "https://cdn-frontend.trendyuu.com/public/profile_videos_mockup/traveler.webp",
    thumbnail:
      "https://cdn-frontend.trendyuu.com/public/profile_videos_mockup/natureWalk.webp",
    nsfw: false,
    duration: 300,
    size: "60MB",
    created_at: Date.now() / 1000 - 259200,
    views: 600,
    likes: 210,
  },
];

export default function NsfwTab({
  nsfwOption,
  handleNsfwChange,
  t,
}: NsfwTabProps) {
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [videoStates, setVideoStates] = useState<
    Record<
      string,
      { liked: boolean; viewed: boolean; views: number; likes: number }
    >
  >({});

  const getVideoState = (video: Video) =>
    videoStates[video.id] ?? {
      liked: false,
      viewed: false,
      views: video.views,
      likes: video.likes,
    };

  const handleCardPress = (video: Video) => {
    setVideoStates((prev) => {
      const s = getVideoState(video);
      if (s.viewed) return prev;
      return {
        ...prev,
        [video.id]: { ...s, viewed: true, views: s.views + 1 },
      };
    });
  };

  const handleLikePress = (video: Video) => {
    setVideoStates((prev) => {
      const s = getVideoState(video);
      if (s.liked) return prev;
      return { ...prev, [video.id]: { ...s, liked: true, likes: s.likes + 1 } };
    });
  };

  const isVideo = (name: string) => name.toLowerCase().endsWith(".mp4");
  const OPTIONS: ("No" | "Blurred" | "Yes")[] = ["No", "Blurred", "Yes"];
  const OPTION_LABELS: Record<string, string> = {
    No: t("hideAll"),
    Blurred: t("blurThumbnail"),
    Yes: t("showAll"),
  };

  return (
    <View style={styles.container}>
      {/* Toggle buttons */}
      <View style={styles.toggleCard}>
        <Text style={styles.sectionTitle}>{t("nsfwModeration")}</Text>
        <View style={styles.toggleRow}>
          {OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt}
              onPress={() => handleNsfwChange(opt)}
              style={[
                styles.toggleBtn,
                nsfwOption === opt && styles.toggleBtnActive,
              ]}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.toggleBtnText,
                  nsfwOption === opt && styles.toggleBtnTextActive,
                ]}
              >
                {OPTION_LABELS[opt]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Preview gallery — 2-column grid (matches mobile grid-cols-2) */}
      <View style={styles.grid}>
        {videos
          .filter((v) => !(v.nsfw && nsfwOption === "No"))
          .map((video) => {
            const state = getVideoState(video);
            const isBlurred = video.nsfw && nsfwOption === "Blurred";
            const pfpFailed = failedImages.has(video.id);

            return (
              <TouchableOpacity
                key={video.id}
                onPress={() => handleCardPress(video)}
                style={styles.card}
                activeOpacity={0.9}
              >
                {/* Thumbnail */}
                {video.thumbnail ? (
                  <Image
                    source={{ uri: video.thumbnail }}
                    style={[
                      StyleSheet.absoluteFill,
                      isBlurred && styles.blurred,
                    ]}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.placeholderBg}>
                    {isVideo(video.name) ? (
                      <Play size={32} color="#52525b" />
                    ) : (
                      <Music size={32} color="#52525b" />
                    )}
                  </View>
                )}

                {/* Blur overlay */}
                {isBlurred && (
                  <View style={styles.blurOverlay}>
                    <EyeOff size={20} color="#71717a" />
                  </View>
                )}

                {/* Stats overlay */}
                <View style={styles.statsOverlay}>
                  <View style={styles.statsRow}>
                    <View
                      style={[
                        styles.statItem,
                        state.viewed && styles.statItemActive,
                      ]}
                    >
                      <Eye
                        size={11}
                        color={state.viewed ? "#ec4899" : "#fff"}
                      />
                      <Text style={styles.statText}>{state.views}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleLikePress(video)}
                      style={[
                        styles.statItem,
                        state.liked && styles.statItemActive,
                      ]}
                    >
                      <Heart
                        size={11}
                        color={state.liked ? "#ec4899" : "#fff"}
                      />
                      <Text style={styles.statText}>{state.likes}</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.durationText}>
                    {video.duration}s · {video.name.slice(-3).toUpperCase()}
                  </Text>
                </View>

                {/* Uploader badge — top left */}
                <View style={styles.uploaderBadge}>
                  {!video.uploader_pfp || pfpFailed ? (
                    <View style={styles.avatarFallback}>
                      <User size={10} color="#a1a1aa" />
                    </View>
                  ) : (
                    <Image
                      source={{ uri: video.uploader_pfp }}
                      style={styles.avatar}
                      onError={() =>
                        setFailedImages((prev) => new Set(prev).add(video.id))
                      }
                    />
                  )}
                  <Text style={styles.uploaderName}>{video.uploader_name}</Text>
                </View>

                {/* Type icon — top right */}
                <View style={styles.typeIcon}>
                  {isVideo(video.name) ? (
                    <Play size={10} color="#fff" fill="#fff" />
                  ) : (
                    <Music size={10} color="#fff" />
                  )}
                </View>

                {/* NSFW badge */}
                {video.nsfw && nsfwOption === "Yes" && (
                  <View style={styles.nsfwBadge}>
                    <Text style={styles.nsfwBadgeText}>NSFW</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  // Toggle card
  toggleCard: {
    backgroundColor: "rgba(9,9,11,0.8)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#27272a",
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#f4f4f5",
  },
  toggleRow: {
    flexDirection: "row",
    gap: 8,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#52525b",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  toggleBtnActive: {
    backgroundColor: "#db2777",
    borderColor: "#db2777",
  },
  toggleBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#a1a1aa",
  },
  toggleBtnTextActive: {
    color: "#fff",
  },
  // Grid — 2 columns matching mobile grid-cols-2
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  card: {
    width: "49%",
    aspectRatio: 1,
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: "#18181b",
    position: "relative",
  },
  placeholderBg: {
    flex: 1,
    backgroundColor: "#27272a",
    alignItems: "center",
    justifyContent: "center",
  },
  // Blur
  blurred: {
    opacity: 0.08,
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center",
    justifyContent: "center",
  } as any,
  // Stats overlay — always visible on mobile (no hover)
  statsOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 6,
    paddingVertical: 5,
    gap: 2,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  statItemActive: {},
  statText: {
    fontSize: 10,
    color: "#fff",
  },
  durationText: {
    fontSize: 9,
    color: "#d4d4d8",
  },
  // Uploader badge
  uploaderBadge: {
    position: "absolute",
    top: 5,
    left: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  avatar: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  avatarFallback: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#27272a",
    alignItems: "center",
    justifyContent: "center",
  },
  uploaderName: {
    fontSize: 9,
    color: "#fff",
  },
  // Type icon
  typeIcon: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(0,0,0,0.65)",
    borderRadius: 9999,
    padding: 3,
  },
  // NSFW badge
  nsfwBadge: {
    position: "absolute",
    bottom: 38,
    left: 5,
    backgroundColor: "rgba(239,68,68,0.8)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  nsfwBadgeText: {
    color: "#fee2e2",
    fontSize: 9,
    fontWeight: "700",
  },
});

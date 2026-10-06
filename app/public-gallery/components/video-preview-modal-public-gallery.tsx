import { useTranslations } from "@/src/hooks/useTranslations";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio, AVPlaybackStatus, ResizeMode, Video } from "expo-av";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import {
  Download,
  ExternalLink,
  Eye,
  Film,
  Globe,
  Heart,
  ImageIcon,
  Languages,
  Mic,
  Pause,
  Play,
  Sparkles,
  User,
  Volume2,
  VolumeX,
  Wand2,
  X,
} from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Types ────────────────────────────────────────────────────────────────────

type SocialLinks = {
  youtube?: string | string[];
  instagram?: string | string[];
  twitter?: string | string[];
  tiktok?: string | string[];
  twitch?: string | string[];
  facebook?: string | string[];
  kwai?: string | string[];
  website?: string | string[];
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

export type VideoPreviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  videoName: string;
  likes: number;
  views: number;
  isLiked: boolean;
  onLike: () => void;
  uploaderName: string;
  uploaderPfp?: string;
  uploaderId: string;
  uploaderDev?: boolean;
  socials?: SocialLinks | null;
  user_id: string | undefined;
  user_viewData?: TotalVideoData;
  format: string;
  type?: string;
  ai_metadata?: AiMetadata;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const BASE_URL = process.env.EXPO_PUBLIC_TRENDYUU_URL_BACK;
const WAVEFORM_SEGMENTS = 42;
const EDGE_HEIGHTS = [8, 12, 14, 16];
const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".gif", ".webp"];

// ─── Language helpers ─────────────────────────────────────────────────────────

const LANG_NAMES: Record<string, string> = {
  "pt-BR": "Portuguese (BR)",
  "en-US": "English (US)",
  "es-ES": "Spanish (ES)",
  "de-DE": "German",
  "fr-FR": "French",
  "nl-NL": "Dutch",
  "ru-RU": "Russian",
  "it-IT": "Italian",
  "ja-JP": "Japanese",
  "zh-CN": "Chinese (Simplified)",
};
const langName = (code: string) => LANG_NAMES[code] ?? code;

// ─── Auth helper ──────────────────────────────────────────────────────────────

async function authHeaders(): Promise<Record<string, string>> {
  const token = await AsyncStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(time: number): string {
  if (!time || isNaN(time)) return "0:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function extractHandle(url: string, key?: string): string {
  const match = url.match(/@[\w-]+/);
  if (match) return match[0];
  if (key === "website") {
    try {
      const { hostname } = new URL(url);
      return hostname.replace(/^www\./, "");
    } catch {
      return url;
    }
  }
  const parts = url.split("/");
  return parts[parts.length - 1] || url;
}

async function trackSocialView(
  user_id: string | undefined,
  uploader_id: string | undefined,
  user_viewData: TotalVideoData | undefined,
) {
  if (
    !user_id ||
    !uploader_id ||
    !user_viewData ||
    (user_viewData.viewed_users &&
      user_viewData.viewed_users.includes(uploader_id))
  )
    return;
  try {
    const headers = await authHeaders();
    await fetch(`${BASE_URL}/api/video/social-view/`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ uploader_id }),
    });
  } catch {}
}

// ─── Social platform config ───────────────────────────────────────────────────

const SOCIAL_COLORS: Record<string, { bg: string; text: string }> = {
  youtube: { bg: "rgba(239,68,68,0.15)", text: "#ef4444" },
  instagram: { bg: "rgba(236,72,153,0.15)", text: "#ec4899" },
  twitter: { bg: "rgba(56,189,248,0.15)", text: "#38bdf8" },
  tiktok: { bg: "rgba(63,63,70,0.5)", text: "#f4f4f5" },
  twitch: { bg: "rgba(168,85,247,0.15)", text: "#a855f7" },
  facebook: { bg: "rgba(59,130,246,0.15)", text: "#3b82f6" },
  kwai: { bg: "rgba(249,115,22,0.15)", text: "#f97316" },
  website: { bg: "rgba(34,197,94,0.15)", text: "#22c55e" },
};

const PLATFORM_KEYS = [
  "youtube",
  "instagram",
  "twitter",
  "tiktok",
  "twitch",
  "facebook",
  "kwai",
  "website",
] as const;

// ─── AiMetadataPanel — single horizontal strip ────────────────────────────────

function AiMetadataPanel({
  metadata: m,
  type,
}: {
  metadata: AiMetadata;
  type?: string;
}) {
  const tool =
    m.tool ??
    (type === "AI_Image"
      ? "ai_image"
      : type === "AI_Video"
        ? "ai_video"
        : type === "AI_Audio"
          ? "ai_audio"
          : type === "AI_VoiceChanged"
            ? "voice_changer"
            : type === "AI_TranslatedAudio"
              ? "audio_translator"
              : type === "AI_SoundEffect"
                ? "sound_effects"
                : undefined);

  const chips: string[] = [];
  if (tool === "voice_changer") {
    if (m.target_voice_name) chips.push(m.target_voice_name);
    if (m.stability != null) chips.push(`Stability ${m.stability}`);
    if (m.style != null) chips.push(`Style ${m.style}`);
  } else if (tool === "audio_translator") {
    if (m.source_language && m.target_language)
      chips.push(
        `${langName(m.source_language)} → ${langName(m.target_language)}`,
      );
    if (m.use_original_voice) chips.push("Original Voice");
  } else if (tool === "sound_effects") {
    if (m.duration_seconds != null) chips.push(`${m.duration_seconds}s`);
    if (m.prompt_influence != null)
      chips.push(`Influence ${m.prompt_influence}`);
  } else {
    if (m.model) chips.push(m.model);
    if (m.resolution) chips.push(m.resolution);
    if (m.aspect_ratio) chips.push(m.aspect_ratio);
    if (!m.model) {
      if (m.voice_name) chips.push(m.voice_name);
      if (m.stability != null) chips.push(`Stability ${m.stability}`);
      if (m.style != null) chips.push(`Style ${m.style}`);
    }
  }
  if (chips.length === 0) return null;

  const toolLabel =
    tool === "voice_changer"
      ? "Voice Changer"
      : tool === "music_generator"
        ? "Music Generator"
        : tool === "audio_translator"
          ? "Translator"
          : tool === "sound_effects"
            ? "Sound Effects"
            : tool === "ai_image"
              ? "AI Image"
              : tool === "ai_video"
                ? "AI Video"
                : tool === "ai_audio"
                  ? "AI Audio"
                  : "AI";

  const ToolIcon =
    tool === "voice_changer" ? (
      <Mic size={11} color="#f472b6" />
    ) : tool === "audio_translator" ? (
      <Languages size={11} color="#f472b6" />
    ) : tool === "sound_effects" ? (
      <Wand2 size={11} color="#f472b6" />
    ) : tool === "ai_image" ? (
      <ImageIcon size={11} color="#f472b6" />
    ) : tool === "ai_video" || tool === "ai_audio" ? (
      <Film size={11} color="#f472b6" />
    ) : (
      <Sparkles size={11} color="#f472b6" />
    );

  // Single horizontal strip: [icon label] [chip] [chip] …
  return (
    <View style={styles.aiStrip}>
      <View style={styles.aiLabelGroup}>
        {ToolIcon}
        <Text style={styles.aiToolLabel}>{toolLabel}</Text>
      </View>
      {chips.map((chip) => (
        <View key={chip} style={styles.aiChip}>
          <Text style={styles.aiChipText} numberOfLines={1}>
            {chip}
          </Text>
        </View>
      ))}
    </View>
  );
}

// ─── InlineSocialLinksBar ─────────────────────────────────────────────────────

export function InlineSocialLinksBar({
  socials,
  user_id,
  user_viewData,
  uploaderId,
}: {
  socials: SocialLinks | null | undefined;
  user_id: string | undefined;
  user_viewData?: TotalVideoData;
  uploaderId: string;
}) {
  if (!socials) return null;

  const items = PLATFORM_KEYS.flatMap((key) => {
    const value = socials[key as keyof SocialLinks];
    if (!value) return [];
    const urls = Array.isArray(value) ? value : [value];
    return urls.map((url, index) => ({ key, url, index }));
  });

  if (items.length === 0) return null;

  return (
    <View style={styles.inlineSocialRow}>
      {items.map(({ key, url, index }) => {
        const colors = SOCIAL_COLORS[key] ?? { bg: "#27272a", text: "#a1a1aa" };
        const handle = extractHandle(url, key);
        return (
          <TouchableOpacity
            key={`${key}-${index}`}
            onPress={async () => {
              await trackSocialView(user_id, uploaderId, user_viewData);
              await Linking.openURL(url);
            }}
            style={[styles.inlineSocialBtn, { backgroundColor: colors.bg }]}
            activeOpacity={0.7}
          >
            <Globe size={12} color={colors.text} />
            <Text
              style={[styles.inlineSocialText, { color: colors.text }]}
              numberOfLines={1}
            >
              {handle}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── SocialLinksBar (full-width list) ────────────────────────────────────────

export function SocialLinksBar({
  socials,
  user_id,
  user_viewData,
  uploaderId,
}: {
  socials: SocialLinks | null | undefined;
  user_id: string | undefined;
  user_viewData?: TotalVideoData;
  uploaderId: string;
}) {
  if (!socials) return null;

  const items = PLATFORM_KEYS.flatMap((key) => {
    const value = socials[key as keyof SocialLinks];
    if (!value) return [];
    const urls = Array.isArray(value) ? value : [value];
    return urls.map((url, index) => ({ key, url, index }));
  });

  if (items.length === 0) return null;

  return (
    <View style={styles.socialBarColumn}>
      {items.map(({ key, url, index }) => {
        const colors = SOCIAL_COLORS[key] ?? { bg: "#27272a", text: "#a1a1aa" };
        const handle = extractHandle(url, key);
        return (
          <TouchableOpacity
            key={`${key}-${index}`}
            onPress={async () => {
              await trackSocialView(user_id, uploaderId, user_viewData);
              await Linking.openURL(url);
            }}
            style={[styles.socialBarBtn, { backgroundColor: colors.bg }]}
            activeOpacity={0.7}
          >
            <Globe size={16} color={colors.text} />
            <Text
              style={[styles.socialBtnHandle, { color: colors.text }]}
              numberOfLines={1}
            >
              {handle}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── VideoScrubber — progress bar with thumb ──────────────────────────────────

function VideoScrubber({
  currentTime,
  duration,
  onSeek,
}: {
  currentTime: number;
  duration: number;
  onSeek: (t: number) => void;
}) {
  const widthRef = useRef(1);
  const progress = duration > 0 ? Math.min(1, currentTime / duration) : 0;

  const seek = (locationX: number) => {
    if (!duration || duration <= 0 || widthRef.current <= 0) return;
    const t = (Math.max(0, locationX) / widthRef.current) * duration;
    if (isFinite(t)) onSeek(Math.min(t, duration));
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => seek(e.nativeEvent.locationX),
      onPanResponderMove: (e) => seek(e.nativeEvent.locationX),
    }),
  ).current;

  return (
    <View
      style={styles.videoScrubberHitArea}
      onLayout={(e) => {
        widthRef.current = e.nativeEvent.layout.width || 1;
      }}
      {...panResponder.panHandlers}
    >
      <View style={styles.videoScrubberTrack}>
        <View
          style={[
            styles.videoScrubberFill,
            { width: `${progress * 100}%` as any },
          ]}
        />
        <View
          style={[
            styles.videoScrubberThumb,
            { left: `${progress * 100}%` as any },
          ]}
        />
      </View>
    </View>
  );
}

// ─── AudioScrubber — waveform bars ───────────────────────────────────────────

function AudioScrubber({
  currentTime,
  duration,
  onSeek,
}: {
  currentTime: number;
  duration: number;
  onSeek: (t: number) => void;
}) {
  const widthRef = useRef(1);
  const fill = duration > 0 ? (currentTime / duration) * WAVEFORM_SEGMENTS : 0;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        const x = e.nativeEvent.locationX;
        onSeek(
          Math.max(0, Math.min(duration, (x / widthRef.current) * duration)),
        );
      },
      onPanResponderMove: (e) => {
        const x = e.nativeEvent.locationX;
        onSeek(
          Math.max(0, Math.min(duration, (x / widthRef.current) * duration)),
        );
      },
    }),
  ).current;

  return (
    <View
      style={styles.scrubberWrapper}
      onLayout={(e) => {
        widthRef.current = e.nativeEvent.layout.width || 1;
      }}
      {...panResponder.panHandlers}
    >
      {Array.from({ length: WAVEFORM_SEGMENTS }).map((_, i) => {
        let h: number;
        if (i < 4) h = EDGE_HEIGHTS[i];
        else if (i >= WAVEFORM_SEGMENTS - 4)
          h = EDGE_HEIGHTS[WAVEFORM_SEGMENTS - 1 - i];
        else h = 16;
        const filled = i < fill;
        return (
          <View
            key={i}
            style={{
              width: 3,
              height: h,
              borderRadius: 2,
              backgroundColor: filled ? "#fff" : "rgba(255,255,255,0.3)",
            }}
          />
        );
      })}
    </View>
  );
}

// ─── VideoPlayer ──────────────────────────────────────────────────────────────

function VideoPlayer({
  videoUrl,
  isVisible,
}: {
  videoUrl: string;
  isVisible: boolean;
}) {
  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleHide = useCallback(() => {
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    hideTimeout.current = setTimeout(() => setShowControls(false), 3000);
  }, []);

  useEffect(() => {
    if (isPlaying) scheduleHide();
    else {
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
      setShowControls(true);
    }
    return () => {
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
    };
  }, [isPlaying, scheduleHide]);

  useEffect(() => {
    if (!isVisible) videoRef.current?.pauseAsync();
  }, [isVisible]);

  const handleStatus = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;
    setCurrentTime(status.positionMillis / 1000);
    setDuration((status.durationMillis ?? 0) / 1000);
    setIsPlaying(status.isPlaying);
    if (isLoading) setIsLoading(false);
    if (status.didJustFinish) {
      setIsPlaying(false);
      setCurrentTime(0);
      setShowControls(true);
    }
  };

  const handleTap = async () => {
    if (!videoRef.current) return;
    if (showControls && isPlaying) {
      await videoRef.current.pauseAsync();
    } else if (showControls && !isPlaying) {
      await videoRef.current.playAsync();
      scheduleHide();
    } else {
      setShowControls(true);
      if (isPlaying) scheduleHide();
    }
  };

  const handlePlayPause = async () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      await videoRef.current.pauseAsync();
    } else {
      await videoRef.current.playAsync();
      scheduleHide();
    }
  };

  const handleSeek = async (t: number) => {
    if (!videoRef.current || !isFinite(t) || t < 0) return;
    setCurrentTime(t);
    await videoRef.current.setPositionAsync(Math.round(t * 1000));
  };

  const handleMuteToggle = async () => {
    if (!videoRef.current) return;
    const next = !isMuted;
    await videoRef.current.setIsMutedAsync(next);
    setIsMuted(next);
  };

  return (
    <TouchableOpacity
      onPress={handleTap}
      activeOpacity={1}
      style={styles.videoBox}
    >
      <Video
        ref={videoRef}
        source={{ uri: videoUrl }}
        style={styles.videoEl}
        resizeMode={ResizeMode.CONTAIN}
        useNativeControls={false}
        onPlaybackStatusUpdate={handleStatus}
      />

      {isLoading && (
        <View style={styles.videoLoader}>
          <ActivityIndicator size="large" color="#ec4899" />
        </View>
      )}

      {/* Centre play overlay — shown when paused */}
      {!isPlaying && !isLoading && (
        <View style={styles.videoPlayOverlay} pointerEvents="none">
          <View style={styles.videoPlayCircle}>
            <Play size={26} color="#fff" />
          </View>
        </View>
      )}

      {/* Bottom controls bar */}
      {showControls && !isLoading && (
        <View style={styles.videoControls}>
          <VideoScrubber
            currentTime={currentTime}
            duration={duration}
            onSeek={handleSeek}
          />
          <View style={styles.videoControlsRow}>
            <TouchableOpacity
              onPress={handlePlayPause}
              hitSlop={8}
              activeOpacity={0.7}
            >
              {isPlaying ? (
                <Pause size={18} color="#fff" />
              ) : (
                <Play size={18} color="#fff" />
              )}
            </TouchableOpacity>
            <Text style={styles.videoTimeText}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </Text>
            <View style={{ flex: 1 }} />
            <TouchableOpacity
              onPress={handleMuteToggle}
              hitSlop={8}
              activeOpacity={0.7}
            >
              {isMuted ? (
                <VolumeX size={16} color="rgba(255,255,255,0.7)" />
              ) : (
                <Volume2 size={16} color="rgba(255,255,255,0.7)" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─── AudioPlayer ──────────────────────────────────────────────────────────────

function AudioPlayer({
  videoUrl,
  displayTitle,
  isVisible,
}: {
  videoUrl: string;
  displayTitle: string;
  isVisible: boolean;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const soundRef = useRef<Audio.Sound | null>(null);
  // Prevent status update callbacks from resetting position while a seek is in flight
  const isSeekingRef = useRef(false);

  useEffect(() => {
    let sound: Audio.Sound | null = null;
    (async () => {
      try {
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
        const { sound: s } = await Audio.Sound.createAsync(
          { uri: videoUrl },
          { shouldPlay: false },
          (status: AVPlaybackStatus) => {
            if (!status.isLoaded) return;
            // Skip position update while we're seeking so it doesn't snap back
            if (!isSeekingRef.current) {
              setCurrentTime(status.positionMillis / 1000);
            }
            setDuration((status.durationMillis ?? 0) / 1000);
            setIsPlaying(status.isPlaying);
            if (isLoading) setIsLoading(false);
            if (status.didJustFinish) {
              setIsPlaying(false);
              setCurrentTime(0);
            }
          },
        );
        sound = s;
        soundRef.current = s;
        setIsLoading(false);
      } catch {}
    })();
    return () => {
      sound?.unloadAsync();
      soundRef.current = null;
    };
  }, [videoUrl]);

  useEffect(() => {
    if (!isVisible) soundRef.current?.pauseAsync();
  }, [isVisible]);

  const handlePlayPause = async () => {
    if (!soundRef.current) return;
    if (isPlaying) await soundRef.current.pauseAsync();
    else await soundRef.current.playAsync();
  };

  const handleSeek = async (t: number) => {
    if (!soundRef.current || !isFinite(t) || t < 0) return;
    isSeekingRef.current = true;
    setCurrentTime(t); // instant UI feedback
    await soundRef.current.setPositionAsync(Math.round(t * 1000));
    // Allow status updates again after the seek position has propagated
    setTimeout(() => {
      isSeekingRef.current = false;
    }, 300);
  };

  return (
    <View style={styles.audioBox}>
      <TouchableOpacity
        onPress={handlePlayPause}
        style={styles.audioPlayBtn}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : isPlaying ? (
          <Pause size={28} color="#fff" />
        ) : (
          <Play size={28} color="#fff" />
        )}
      </TouchableOpacity>
      <Text style={styles.audioTitle} numberOfLines={2}>
        {displayTitle}
      </Text>
      <Text style={styles.audioTime}>
        {formatTime(currentTime)} / {formatTime(duration)}
      </Text>
      <AudioScrubber
        currentTime={currentTime}
        duration={duration}
        onSeek={handleSeek}
      />
    </View>
  );
}

// ─── VideoPreviewModal ────────────────────────────────────────────────────────

export function VideoPreviewModal({
  isOpen,
  onClose,
  videoUrl,
  videoName,
  likes,
  views,
  isLiked,
  onLike,
  uploaderName,
  uploaderPfp,
  uploaderId,
  uploaderDev,
  socials,
  user_id,
  user_viewData,
  format,
  type,
  ai_metadata,
  onPrev,
  onNext,
  hasPrev = false,
  hasNext = false,
}: VideoPreviewModalProps) {
  const t = useTranslations("PublicGallery.VideoPreview");
  const router = useRouter();

  const isMP3 =
    videoUrl.toLowerCase().endsWith(".mp3") || format?.toLowerCase() === "mp3";

  const isImage =
    IMAGE_EXTENSIONS.some((ext) => videoUrl.toLowerCase().endsWith(ext)) ||
    IMAGE_EXTENSIONS.includes(`.${format?.toLowerCase()}`);

  const [pfpError, setPfpError] = useState(false);

  // Reset pfp error when video changes
  useEffect(() => {
    setPfpError(false);
  }, [videoUrl]);

  const displayTitle =
    ai_metadata?.prompt ??
    ai_metadata?.text ??
    videoName.replace(/ - Made With TrendYuu/g, "").slice(0, -4);

  // Show raw filename as subtitle when the title was overridden by prompt/text
  const subtitle = ai_metadata?.prompt || ai_metadata?.text ? videoName : null;

  const handleDownload = async () => {
    const downloadUrl = `${BASE_URL}/api/video/download-video/?r2_url=${encodeURIComponent(videoUrl)}&download_name=${encodeURIComponent(videoName)}`;
    await Linking.openURL(downloadUrl);
  };

  const handleViewProfile = () => {
    onClose();
    router.push({
      pathname: "/public-gallery",
      params: { uploader_id: uploaderId },
    } as any);
  };

  const hasSocials =
    !!socials &&
    Object.values(socials).some(
      (v) => v && (Array.isArray(v) ? v.length > 0 : v.length > 0),
    );

  // ── Swipe gesture for prev / next ──────────────────────────────
  const SWIPE_THRESHOLD = 60;
  const SWIPE_MAX_X = 60;
  const swipeHandled = useRef(false);

  const swipePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dy) > 12 && Math.abs(gs.dy) > Math.abs(gs.dx) * 1.5,
      onPanResponderGrant: () => {
        swipeHandled.current = false;
      },
      onPanResponderMove: (_, gs) => {
        if (swipeHandled.current) return;
        if (Math.abs(gs.dx) > SWIPE_MAX_X) return;
        if (gs.dy <= -SWIPE_THRESHOLD && hasNext) {
          swipeHandled.current = true;
          onNext?.();
        } else if (gs.dy >= SWIPE_THRESHOLD && hasPrev) {
          swipeHandled.current = true;
          onPrev?.();
        }
      },
      onPanResponderRelease: () => {
        swipeHandled.current = false;
      },
    }),
  ).current;

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        {/* Tapping the dark area closes the modal */}
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        {/* Two-card container — swipe up/down to navigate */}
        <ScrollView
          style={styles.dialogScroll}
          contentContainerStyle={styles.dialogContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
          {...swipePanResponder.panHandlers}
        >
          {/* ── Card 1: media + info ─────────────────────────── */}
          <View style={styles.mediaCard}>
            {/* Close button on the card */}
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              hitSlop={8}
            >
              <X size={18} color="#71717a" />
            </TouchableOpacity>

            {/* Media */}
            {isImage ? (
              <View style={styles.imageBox}>
                <Image
                  source={{ uri: videoUrl }}
                  style={styles.imageEl}
                  resizeMode="contain"
                />
              </View>
            ) : isMP3 ? (
              <AudioPlayer
                videoUrl={videoUrl}
                displayTitle={displayTitle}
                isVisible={isOpen}
              />
            ) : (
              <VideoPlayer videoUrl={videoUrl} isVisible={isOpen} />
            )}

            {/* Info */}
            <View style={styles.cardInfo}>
              {/* Title + subtitle */}
              <View style={styles.titleBlock}>
                <Text style={styles.title} numberOfLines={2}>
                  {displayTitle}
                </Text>
                {subtitle && (
                  <Text style={styles.subtitle} numberOfLines={1}>
                    {subtitle}
                  </Text>
                )}
              </View>

              {/* Stats + download */}
              <View style={styles.statsRow}>
                <View style={styles.statsLeft}>
                  <View style={styles.statItem}>
                    <Eye size={13} color="#71717a" />
                    <Text style={styles.statText}>
                      {views.toLocaleString("pt-BR")}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={onLike}
                    style={styles.statItem}
                    activeOpacity={0.7}
                  >
                    <Heart
                      size={13}
                      color={isLiked ? "#ec4899" : "#71717a"}
                      fill={isLiked ? "#ec4899" : "transparent"}
                    />
                    <Text
                      style={[styles.statText, isLiked && { color: "#ec4899" }]}
                    >
                      {likes.toLocaleString("pt-BR")}
                    </Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  onPress={handleDownload}
                  style={styles.downloadIconBtn}
                  activeOpacity={0.7}
                  hitSlop={8}
                >
                  <Download size={16} color="#a1a1aa" />
                </TouchableOpacity>
              </View>

              {/* AI strip */}
              {ai_metadata && (
                <AiMetadataPanel metadata={ai_metadata} type={type} />
              )}
            </View>
          </View>

          {/* ── Card 2: uploader + socials ────────────────────── */}
          <View style={styles.userCard}>
            {/* Uploader row */}
            <TouchableOpacity
              onPress={handleViewProfile}
              style={styles.uploaderRow}
              activeOpacity={0.75}
            >
              <View style={styles.uploaderLeft}>
                <View style={{ position: "relative" }}>
                  {!pfpError && uploaderPfp ? (
                    <Image
                      source={{ uri: uploaderPfp }}
                      style={styles.pfp}
                      onError={() => setPfpError(true)}
                    />
                  ) : (
                    <View style={styles.pfpFallback}>
                      <User size={20} color="#71717a" />
                    </View>
                  )}
                  {uploaderDev && (
                    <View style={styles.devBadge}>
                      <Text style={styles.devBadgeText}>{t("devBadge")}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.uploaderMeta}>
                  <Text style={styles.uploaderName} numberOfLines={1}>
                    {uploaderName}
                  </Text>
                  <Text style={styles.uploaderSub}>
                    {t("profile.viewProfile")}
                  </Text>
                </View>
              </View>

              <ExternalLink size={18} color="#71717a" />
            </TouchableOpacity>

            {/* Socials */}
            {hasSocials && (
              <View style={styles.socialsSection}>
                <Text style={styles.socialsTitle}>
                  {t("socialLinks.title")}
                </Text>
                <Text style={styles.socialsDescription}>
                  {t("socialLinks.description")}
                </Text>
                <InlineSocialLinksBar
                  socials={socials}
                  user_id={user_id}
                  user_viewData={user_viewData}
                  uploaderId={uploaderId}
                />
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  // Scrollable area that holds both cards, centered vertically
  dialogScroll: {
    width: "95%",
    maxHeight: "92%",
    flexGrow: 0,
  },
  dialogContent: {
    gap: 8,
    paddingVertical: 16,
  },
  // Card 1 — media + info
  mediaCard: {
    width: "100%",
    backgroundColor: "#18181b",
    borderRadius: 16,
    overflow: "hidden",
  },
  // Card 2 — uploader + socials
  userCard: {
    width: "100%",
    backgroundColor: "#18181b",
    borderRadius: 16,
    overflow: "hidden",
    padding: 14,
    gap: 12,
  },
  closeBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 20,
    padding: 5,
    backgroundColor: "rgba(9,9,11,0.75)",
    borderRadius: 9999,
  },
  // Info inside Card 1
  cardInfo: {
    padding: 14,
    gap: 10,
  },

  // ── Image
  imageBox: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
  },
  imageEl: {
    width: "100%",
    height: "100%",
  },

  // ── Video player
  videoBox: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
    overflow: "hidden",
  },
  videoEl: {
    width: "100%",
    height: "100%",
  },
  videoLoader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  videoPlayOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
    zIndex: 3,
  },
  videoPlayCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  videoControls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingBottom: 10,
    paddingTop: 24,
    backgroundColor: "rgba(0,0,0,0)",
    backgroundImage:
      "linear-gradient(to top, rgba(0,0,0,0.8), transparent)" as any,
    zIndex: 4,
  },
  videoControlsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  videoTimeText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
    fontVariant: ["tabular-nums"],
  },
  videoScrubberHitArea: {
    width: "100%",
    height: 16,
    justifyContent: "center",
  },
  videoScrubberTrack: {
    width: "100%",
    height: 3,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 9999,
    overflow: "visible",
  },
  videoScrubberFill: {
    height: 3,
    backgroundColor: "#fff",
    borderRadius: 9999,
  },
  videoScrubberThumb: {
    position: "absolute",
    top: -4,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: "#fff",
    marginLeft: -5,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },

  // ── Audio player
  audioBox: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#831843", // pink-900 (matches web gradient midpoint)
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 10,
  },
  audioPlayBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  audioTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#fff",
    textAlign: "center",
    maxWidth: "85%",
  },
  audioTime: {
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
  },
  scrubberWrapper: {
    width: "80%",
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  titleBlock: {
    gap: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#f4f4f5",
  },
  subtitle: {
    fontSize: 11,
    color: "#52525b",
    marginTop: 2,
  },

  // ── Stats row
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statsLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 13,
    color: "#71717a",
  },
  downloadIconBtn: {
    padding: 4,
  },

  // ── AI strip — single horizontal row
  aiStrip: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#27272a",
  },
  aiLabelGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  aiToolLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#f472b6",
  },
  aiChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
    backgroundColor: "#27272a",
    borderWidth: 1,
    borderColor: "rgba(63,63,70,0.5)",
  },
  aiChipText: {
    fontSize: 11,
    color: "#d4d4d8",
  },

  // ── Uploader row (inside Card 2, no nested card background)
  uploaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  uploaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  pfp: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "#3f3f46",
  },
  pfpFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#27272a",
    borderWidth: 2,
    borderColor: "#3f3f46",
    alignItems: "center",
    justifyContent: "center",
  },
  devBadge: {
    position: "absolute",
    top: -4,
    left: -8,
    backgroundColor: "#be185d",
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  devBadgeText: {
    fontSize: 8,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.5,
  },
  uploaderMeta: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  uploaderName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#f4f4f5",
  },
  uploaderSub: {
    fontSize: 12,
    color: "#71717a",
  },

  // ── Socials section
  socialsSection: {
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "#27272a",
    paddingTop: 12,
  },
  socialsTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#f4f4f5",
  },
  socialsDescription: {
    fontSize: 12,
    color: "#71717a",
  },
  inlineSocialRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  inlineSocialBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
  },
  inlineSocialText: {
    fontSize: 12,
    fontWeight: "500",
  },
  socialBarColumn: {
    gap: 6,
  },
  socialBarBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  socialBtnHandle: {
    fontSize: 13,
    fontWeight: "500",
  },
});

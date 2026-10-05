import { useUser } from "@/src/context/user-context";
import { useTranslations } from "@/src/hooks/useTranslations";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio, AVPlaybackStatus, ResizeMode, Video } from "expo-av";
import * as Linking from "expo-linking";
import {
  AlertCircle,
  Check,
  Crown,
  Download,
  Eye,
  Film,
  Heart,
  ImageIcon,
  Languages,
  Mic,
  Pause,
  Play,
  Share2,
  Sparkles,
  Trash2,
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
import type { VideoStatus } from "./video";

// ─── Types ─────────────────────────────────────────────────────────────────────

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

type Platform =
  | "youtube"
  | "tiktok"
  | "instagram"
  | "twitter"
  | "facebook"
  | "kwai"
  | "linkedin";

type TiktokCreatorInfo = {
  creator_username: string;
  creator_nickname: string;
  privacy_level_options: string[];
  comment_disabled: boolean;
  duet_disabled: boolean;
  stitch_disabled: boolean;
  max_video_post_duration_sec: number;
};

export type VideoPreviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  videoName: string;
  likes: number;
  views: number;
  id: number;
  thumbnail?: string;
  size?: string;
  duration: number;
  is_public: boolean;
  requires_review: boolean;
  user_id: string | undefined;
  created_at: string | number;
  path: string;
  onStatusChange?: (newStatus: VideoStatus) => void;
  format: string;
  type?: string;
  onDelete?: (videoId: number) => void;
  ai_metadata?: AiMetadata;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const BASE_URL = process.env.EXPO_PUBLIC_TRENDYUU_URL_BACK;
const POLLING_INTERVAL_MS = 2000;
const WAVEFORM_SEGMENTS = 42;
const EDGE_HEIGHTS = [8, 12, 14, 16];

const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".gif", ".webp"];
const PLATFORM_CAPABILITIES: Record<string, { supportsImage: boolean }> = {
  youtube: { supportsImage: false },
  tiktok: { supportsImage: false },
  linkedin: { supportsImage: true },
  instagram: { supportsImage: false },
  twitter: { supportsImage: false },
  facebook: { supportsImage: false },
  kwai: { supportsImage: false },
};

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

const SHARE_PLATFORMS: {
  name: Platform;
  label: string;
  color: string;
  textColor: string;
}[] = [
  {
    name: "youtube",
    label: "YouTube",
    color: "rgba(239,68,68,0.15)",
    textColor: "#ef4444",
  },
  {
    name: "tiktok",
    label: "TikTok",
    color: "rgba(63,63,70,0.6)",
    textColor: "#f4f4f5",
  },
  {
    name: "linkedin",
    label: "LinkedIn",
    color: "rgba(59,130,246,0.15)",
    textColor: "#60a5fa",
  },
];

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

function cleanName(name: string): string {
  return name.replace(/ - Made With TrendYuu/g, "").replace(/\.[^.]+$/, "");
}

// ─── AiMetadataPanel ─────────────────────────────────────────────────────────

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

  return (
    <View style={styles.aiPanel}>
      <View style={styles.aiToolRow}>
        {ToolIcon}
        <Text style={styles.aiToolLabel}>{toolLabel}</Text>
      </View>
      <View style={styles.aiChipRow}>
        {chips.map((chip) => (
          <View key={chip} style={styles.aiChip}>
            <Text style={styles.aiChipText} numberOfLines={1}>
              {chip}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── AudioScrubber ────────────────────────────────────────────────────────────
// Waveform bars that are also a touch scrubber via PanResponder.

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
        const t = Math.max(
          0,
          Math.min(duration, (x / widthRef.current) * duration),
        );
        onSeek(t);
      },
      onPanResponderMove: (e) => {
        const x = e.nativeEvent.locationX;
        const t = Math.max(
          0,
          Math.min(duration, (x / widthRef.current) * duration),
        );
        onSeek(t);
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

// ─── UploadProgressModal (inline, simplified) ─────────────────────────────────
// The web version uses a dedicated UploadProgressModal component; we implement
// it inline here since it doesn't exist in the mobile project yet.

type UploadTask = {
  taskId: string | null;
  platform: Platform | null;
  progress: number;
  message: string;
  isComplete: boolean;
  isFailed: boolean;
};

function UploadProgressOverlay({
  visible,
  task,
  onDone,
}: {
  visible: boolean;
  task: UploadTask;
  onDone: () => void;
}) {
  if (!visible) return null;
  return (
    <Modal visible transparent animationType="fade" onRequestClose={() => {}}>
      <View style={styles.uploadOverlayBg}>
        <View style={styles.uploadOverlayCard}>
          {task.isComplete ? (
            <>
              <Check size={36} color="#22c55e" />
              <Text style={styles.uploadTitle}>Uploaded!</Text>
              <Text style={styles.uploadSub}>{task.platform ?? ""}</Text>
              <TouchableOpacity
                onPress={onDone}
                style={styles.uploadBtn}
                activeOpacity={0.8}
              >
                <Text style={styles.uploadBtnText}>Done</Text>
              </TouchableOpacity>
            </>
          ) : task.isFailed ? (
            <>
              <X size={36} color="#ef4444" />
              <Text style={styles.uploadTitle}>Upload failed</Text>
              <Text style={styles.uploadSub}>{task.message}</Text>
              <TouchableOpacity
                onPress={onDone}
                style={styles.uploadBtn}
                activeOpacity={0.8}
              >
                <Text style={styles.uploadBtnText}>Close</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <ActivityIndicator size="large" color="#ec4899" />
              <Text style={styles.uploadTitle}>
                Uploading to {task.platform ?? "…"}
              </Text>
              <Text style={styles.uploadSub}>{task.message}</Text>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${task.progress}%` as any },
                  ]}
                />
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function VideoPreviewModal({
  isOpen,
  onClose,
  videoUrl,
  videoName,
  likes,
  views,
  duration,
  is_public,
  requires_review,
  user_id,
  id,
  path,
  onStatusChange,
  format,
  type,
  onDelete,
  ai_metadata,
}: VideoPreviewModalProps) {
  const { user } = useUser();
  const t = useTranslations("UserGallery.VideoPreview");

  const isMP3 =
    videoUrl.toLowerCase().endsWith(".mp3") || format?.toLowerCase() === "mp3";
  const isImage =
    IMAGE_EXTENSIONS.some((ext) => videoUrl.toLowerCase().endsWith(ext)) ||
    IMAGE_EXTENSIONS.includes(`.${format?.toLowerCase()}`);

  // ── Playback ──────────────────────────────────────────────────────────────
  const videoRef = useRef<any>(null);
  const audioRef = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1.0);
  const [mediaBoxSize, setMediaBoxSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  // Load audio object for MP3
  useEffect(() => {
    if (!isOpen || !isMP3) return;
    let sound: Audio.Sound;
    (async () => {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      const { sound: s } = await Audio.Sound.createAsync(
        { uri: videoUrl },
        { shouldPlay: false, volume },
        (status: AVPlaybackStatus) => {
          if (!status.isLoaded) return;
          setCurrentTime(status.positionMillis / 1000);
          if (status.didJustFinish) setIsPlaying(false);
        },
      );
      audioRef.current = s;
      sound = s;
    })();
    return () => {
      sound?.unloadAsync();
      audioRef.current = null;
    };
  }, [isOpen, videoUrl, isMP3]);

  const handlePlayPause = async () => {
    if (isMP3) {
      const s = audioRef.current;
      if (!s) return;
      if (isPlaying) {
        await s.pauseAsync();
        setIsPlaying(false);
      } else {
        await s.playAsync();
        setIsPlaying(true);
      }
    } else {
      if (!videoRef.current) return;
      if (isPlaying) {
        await videoRef.current.pauseAsync();
        setIsPlaying(false);
      } else {
        await videoRef.current.playAsync();
        setIsPlaying(true);
      }
    }
  };

  const handleSeek = async (t: number) => {
    if (isMP3) {
      await audioRef.current?.setPositionAsync(t * 1000);
      setCurrentTime(t);
    } else {
      await videoRef.current?.setPositionAsync(t * 1000);
      setCurrentTime(t);
    }
  };

  // ── Status ────────────────────────────────────────────────────────────────
  const getInitialStatus = useCallback((): VideoStatus => {
    if (requires_review) return "requires_review";
    if (is_public) return "public";
    return "private";
  }, [requires_review, is_public]);

  const [videoStatus, setVideoStatus] = useState<VideoStatus>(getInitialStatus);

  useEffect(() => {
    if (isOpen) setVideoStatus(getInitialStatus());
    if (!isOpen) setConfirmingDelete(false);
  }, [isOpen, getInitialStatus]);

  const statusDisplay = {
    requires_review: { color: "#eab308", label: t("status.underReview") },
    public: { color: "#22c55e", label: t("status.public") },
    private: { color: "#71717a", label: t("status.private") },
  }[videoStatus];

  const handleTogglePublic = async () => {
    const headers = await authHeaders();
    await fetch(`${BASE_URL}/api/video/toggle-public`, {
      method: "POST",
      headers,
      body: new URLSearchParams({ video_name: videoName, video_path: path }),
    });
    let next: VideoStatus;
    if (videoStatus === "private") next = "requires_review";
    else if (videoStatus === "requires_review") next = "private";
    else next = "private";
    setVideoStatus(next);
    onStatusChange?.(next);
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const handleDelete = async () => {
    const headers = await authHeaders();
    const res = await fetch(`${BASE_URL}/api/video/delete-gallery/`, {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        video_id: String(id),
        format: String(format),
      }),
    });
    if (res.ok) {
      onClose();
      onDelete?.(id);
    }
  };

  // ── Download ─────────────────────────────────────────────────────────────
  const downloadVideo = async () => {
    const url = `${BASE_URL}/api/video/download-video/?r2_url=${encodeURIComponent(videoUrl)}&download_name=${encodeURIComponent(videoName)}`;
    await Linking.openURL(url);
  };

  // ── Share ─────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<"manual" | "automatized">(
    "manual",
  );
  const [showConnectAccounts, setShowConnectAccounts] = useState(false);
  const [selectedAccountsForAuto, setSelectedAccountsForAuto] = useState<
    string[]
  >([]);
  const [isFetchingCreatorInfo, setIsFetchingCreatorInfo] = useState(false);
  const [tiktokCreatorInfoMap, setTiktokCreatorInfoMap] = useState<
    Record<string, TiktokCreatorInfo | null>
  >({});

  const isPremiumFeature =
    (user?.currentPlan === "free" || user?.currentPlan === "essential") &&
    !user?.isFreeTrialActive;

  const toggleAccountSelection = (platform: string, username: string) => {
    const key = `${platform}-${username}`;
    setSelectedAccountsForAuto((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  // ── Upload polling ────────────────────────────────────────────────────────
  const [isUploading, setIsUploading] = useState(false);
  const [uploadTask, setUploadTask] = useState<UploadTask>({
    taskId: null,
    platform: null,
    progress: 0,
    message: "",
    isComplete: false,
    isFailed: false,
  });
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => () => stopPolling(), [stopPolling]);

  const startPolling = useCallback(
    (taskId: string, platform: Platform) => {
      stopPolling();
      pollRef.current = setInterval(async () => {
        try {
          const headers = await authHeaders();
          const res = await fetch(
            `${BASE_URL}/api/socials/task/upload-status/${taskId}`,
            { headers },
          );
          if (!res.ok) return;
          const data = await res.json();
          const state: string = data.state ?? data.status ?? "";
          const info = data.info ?? data.result ?? {};
          const progress: number =
            data.progress ?? info.progress ?? (state === "SUCCESS" ? 100 : 0);
          const message: string = data.message ?? info.message ?? "";
          setUploadTask((prev) => ({ ...prev, progress, message }));
          if (state === "SUCCESS") {
            stopPolling();
            setUploadTask((prev) => ({
              ...prev,
              progress: 100,
              isComplete: true,
            }));
          } else if (state === "FAILURE") {
            stopPolling();
            setUploadTask((prev) => ({ ...prev, isFailed: true }));
          }
        } catch {
          /* keep polling */
        }
      }, POLLING_INTERVAL_MS);
    },
    [stopPolling],
  );

  const handleShareClick = async (platform: Platform, username: string) => {
    if (!user_id) return;
    // Fetch TikTok creator info if needed
    if (platform === "tiktok") {
      setIsFetchingCreatorInfo(true);
      try {
        const headers = await authHeaders();
        const res = await fetch(
          `${BASE_URL}/api/authentication/creator-info-tiktok`,
          {
            method: "POST",
            headers: { ...headers, "Content-Type": "application/json" },
            body: JSON.stringify({ account_username: username }),
          },
        );
        const data = await res.json();
        if (data.success)
          setTiktokCreatorInfoMap((prev) => ({
            ...prev,
            [username]: data.creator_info,
          }));
      } catch {
        /* silent */
      } finally {
        setIsFetchingCreatorInfo(false);
      }
    }

    try {
      const headers = await authHeaders();
      const res = await fetch(`${BASE_URL}/api/socials/${platform}/upload`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id,
          video_name: videoName,
          video_url: videoUrl,
          account_username: username,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || t("errors.shareFailed"));
      if (data.task_id) {
        setIsUploading(true);
        setUploadTask({
          taskId: data.task_id,
          platform,
          progress: 1,
          message: "Starting upload…",
          isComplete: false,
          isFailed: false,
        });
        startPolling(data.task_id, platform);
      }
    } catch (e: any) {
      // silent — show alert if desired
    }
  };

  const handleProceedToMultiPlatform = async () => {
    if (selectedAccountsForAuto.length === 0) return;
    if (!user_id) return;
    const headers = await authHeaders();
    for (const accountKey of selectedAccountsForAuto) {
      const [platform, ...rest] = accountKey.split("-");
      const username = rest.join("-");
      const res = await fetch(`${BASE_URL}/api/socials/${platform}/upload`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id,
          video_name: videoName,
          video_url: videoUrl,
          account_username: username,
        }),
      });
      // Fire-and-forget for multi; could poll each task similarly
    }
  };

  const handleConnectPlatform = async (platform: Platform) => {
    const headers = await authHeaders();
    try {
      const res = await fetch(
        `${BASE_URL}/api/authentication/connect-${platform}`,
        {
          method: "POST",
          headers,
        },
      );
      const data = await res.json();
      if (data.auth_url) await Linking.openURL(data.auth_url);
    } catch {
      /* silent */
    }
  };

  // ── Display name ──────────────────────────────────────────────────────────
  const displayName =
    ai_metadata?.prompt ?? ai_metadata?.text ?? cleanName(videoName);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <Modal
        visible={isOpen && !isUploading}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.backdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

          <View style={styles.sheet}>
            {/* Close btn */}
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              hitSlop={8}
            >
              <X size={18} color="#71717a" />
            </TouchableOpacity>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {/* ── Media area ─────────────────────────────────────────── */}
              <View
                style={styles.mediaBox}
                onLayout={(e) => {
                  const { width, height } = e.nativeEvent.layout;
                  setMediaBoxSize({ width, height });
                }}
              >
                {isImage ? (
                  <Image
                    source={{ uri: videoUrl }}
                    style={styles.mediaImage}
                    resizeMode="contain"
                  />
                ) : isMP3 ? (
                  /* Audio player */
                  <View style={styles.audioPlayer}>
                    <TouchableOpacity
                      onPress={handlePlayPause}
                      style={styles.audioPlayBtn}
                      activeOpacity={0.8}
                    >
                      {isPlaying ? (
                        <Pause size={28} color="#fff" />
                      ) : (
                        <Play size={28} color="#fff" />
                      )}
                    </TouchableOpacity>
                    <Text style={styles.audioTitle} numberOfLines={2}>
                      {displayName}
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
                ) : (
                  /* Video player */
                  <View style={styles.videoWrapper}>
                    <Video
                      ref={videoRef}
                      source={{ uri: videoUrl }}
                      style={[
                        styles.video,
                        mediaBoxSize
                          ? {
                              width: mediaBoxSize.width,
                              height: mediaBoxSize.height,
                            }
                          : undefined,
                      ]}
                      resizeMode={ResizeMode.CONTAIN}
                      shouldPlay={false}
                      onPlaybackStatusUpdate={(status: AVPlaybackStatus) => {
                        if (!status.isLoaded) return;
                        setCurrentTime(status.positionMillis / 1000);
                        if (status.didJustFinish) setIsPlaying(false);
                      }}
                    />
                    {/* Play overlay when paused */}
                    {!isPlaying && (
                      <TouchableOpacity
                        style={styles.videoPlayOverlay}
                        onPress={handlePlayPause}
                        activeOpacity={0.8}
                      >
                        <View style={styles.videoPlayBtn}>
                          <Play size={26} color="#fff" />
                        </View>
                      </TouchableOpacity>
                    )}
                    {/* Tap to pause when playing */}
                    {isPlaying && (
                      <TouchableOpacity
                        style={StyleSheet.absoluteFill as any}
                        onPress={handlePlayPause}
                        activeOpacity={1}
                      />
                    )}
                    {/* Controls bar */}
                    <View style={styles.videoControls}>
                      <View style={styles.videoScrubTrack}>
                        <View
                          style={[
                            styles.videoScrubFill,
                            {
                              width:
                                `${duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0}%` as any,
                            },
                          ]}
                        />
                        <View
                          style={[
                            styles.videoScrubHandle,
                            {
                              left: `${duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0}%` as any,
                            },
                          ]}
                        />
                      </View>
                      <View style={styles.videoControlsRow}>
                        <TouchableOpacity onPress={handlePlayPause} hitSlop={6}>
                          {isPlaying ? (
                            <Pause size={18} color="#fff" />
                          ) : (
                            <Play size={18} color="#fff" />
                          )}
                        </TouchableOpacity>
                        <Text style={styles.videoTime}>
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>

              {/* ── Info row ──────────────────────────────────────────────── */}
              <View style={styles.infoSection}>
                {/* Title + status toggle */}
                <View style={styles.infoTitleRow}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.infoTitle} numberOfLines={2}>
                      {displayName}
                    </Text>
                    {(ai_metadata?.prompt || ai_metadata?.text) && (
                      <Text style={styles.infoSubtitle} numberOfLines={1}>
                        {cleanName(videoName)}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={handleTogglePublic}
                    style={[
                      styles.statusBtn,
                      {
                        backgroundColor: statusDisplay.color + "33",
                        borderColor: statusDisplay.color + "66",
                      },
                    ]}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: statusDisplay.color },
                      ]}
                    />
                    <Text
                      style={[
                        styles.statusBtnText,
                        { color: statusDisplay.color },
                      ]}
                    >
                      {statusDisplay.label}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Views/likes + actions */}
                <View style={styles.infoActionsRow}>
                  <View style={styles.infoStats}>
                    <Eye size={13} color="#71717a" />
                    <Text style={styles.infoStatText}>
                      {views.toLocaleString()}
                    </Text>
                    <Heart size={13} color="#71717a" />
                    <Text style={styles.infoStatText}>
                      {likes.toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.infoActions}>
                    {confirmingDelete ? (
                      <>
                        <TouchableOpacity
                          onPress={handleDelete}
                          style={styles.iconBtn}
                          hitSlop={6}
                        >
                          <Check size={16} color="#22c55e" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => setConfirmingDelete(false)}
                          style={styles.iconBtn}
                          hitSlop={6}
                        >
                          <X size={16} color="#f87171" />
                        </TouchableOpacity>
                      </>
                    ) : (
                      <>
                        <TouchableOpacity
                          onPress={downloadVideo}
                          style={styles.iconBtn}
                          hitSlop={6}
                        >
                          <Download size={16} color="#a1a1aa" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => setConfirmingDelete(true)}
                          style={styles.iconBtn}
                          hitSlop={6}
                        >
                          <Trash2 size={16} color="#f87171" />
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </View>

                {/* AI metadata chips */}
                {ai_metadata && (
                  <AiMetadataPanel metadata={ai_metadata} type={type} />
                )}
              </View>

              {/* ── Share section ─────────────────────────────────────────── */}
              <View style={styles.shareSection}>
                <Text style={styles.shareSectionTitle}>{t("Share.title")}</Text>
                <Text style={styles.shareSectionSub}>
                  {t("Share.description")}
                </Text>

                {/* MP3 / image warning */}
                {isMP3 && (
                  <View
                    style={[
                      styles.warningBanner,
                      {
                        borderColor: "rgba(234,179,8,0.3)",
                        backgroundColor: "rgba(234,179,8,0.1)",
                      },
                    ]}
                  >
                    <AlertCircle size={15} color="#eab308" />
                    <Text style={[styles.warningText, { color: "#fde68a" }]}>
                      {t("Share.mp3Warning")}
                    </Text>
                  </View>
                )}
                {isImage && (
                  <View
                    style={[
                      styles.warningBanner,
                      {
                        borderColor: "rgba(59,130,246,0.3)",
                        backgroundColor: "rgba(59,130,246,0.1)",
                      },
                    ]}
                  >
                    <AlertCircle size={15} color="#60a5fa" />
                    <Text style={[styles.warningText, { color: "#bfdbfe" }]}>
                      {t("Share.imageLinkedInOnly")}
                    </Text>
                  </View>
                )}

                {/* Tabs */}
                <View style={styles.tabs}>
                  <TouchableOpacity
                    onPress={() => setActiveTab("manual")}
                    style={[
                      styles.tab,
                      activeTab === "manual" && styles.tabActive,
                    ]}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.tabText,
                        activeTab === "manual" && styles.tabTextActive,
                      ]}
                    >
                      {t("Share.tabs.manual")}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      if (!isMP3 && !isImage) setActiveTab("automatized");
                    }}
                    style={[
                      styles.tab,
                      activeTab === "automatized" && styles.tabActive,
                      (isMP3 || isImage) && { opacity: 0.4 },
                    ]}
                    activeOpacity={0.8}
                    disabled={isMP3 || isImage}
                  >
                    <Text
                      style={[
                        styles.tabText,
                        activeTab === "automatized" && styles.tabTextActive,
                      ]}
                    >
                      {t("Share.tabs.automatized")}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Tab content */}
                {showConnectAccounts ? (
                  /* Connect accounts */
                  <View style={styles.connectSection}>
                    <Text style={styles.connectTitle}>
                      {t("Share.connectAccounts.title")}
                    </Text>
                    <Text style={styles.connectSub}>
                      {t("Share.connectAccounts.description")}
                    </Text>
                    <View style={styles.platformGrid}>
                      {SHARE_PLATFORMS.map((p) => (
                        <TouchableOpacity
                          key={p.name}
                          onPress={() => handleConnectPlatform(p.name)}
                          style={[
                            styles.platformTile,
                            {
                              backgroundColor: p.color,
                              borderColor: p.textColor + "33",
                            },
                          ]}
                          activeOpacity={0.8}
                        >
                          <Share2 size={20} color={p.textColor} />
                          <Text
                            style={[
                              styles.platformTileText,
                              { color: p.textColor },
                            ]}
                          >
                            {p.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <TouchableOpacity
                      onPress={() => setShowConnectAccounts(false)}
                      style={styles.backBtn}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.backBtnText}>
                        {t("Share.connectAccounts.backButton")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : activeTab === "manual" ? (
                  /* Manual tab */
                  user?.connectedAccounts &&
                  user.connectedAccounts.length > 0 ? (
                    <View style={{ gap: 8 }}>
                      {user.connectedAccounts.map((account) => {
                        const p = SHARE_PLATFORMS.find(
                          (sp) => sp.name === account.platform,
                        );
                        if (!p) return null;
                        const caps = PLATFORM_CAPABILITIES[
                          account.platform
                        ] ?? { supportsImage: false };
                        const unsupported =
                          isMP3 || (isImage && !caps.supportsImage);
                        return (
                          <TouchableOpacity
                            key={`${account.platform}-${account.username}`}
                            onPress={() =>
                              !unsupported &&
                              handleShareClick(
                                account.platform as Platform,
                                account.username,
                              )
                            }
                            disabled={unsupported || isFetchingCreatorInfo}
                            style={[
                              styles.accountRow,
                              {
                                backgroundColor: p.color,
                                borderColor: p.textColor + "33",
                              },
                              unsupported && { opacity: 0.4 },
                            ]}
                            activeOpacity={0.8}
                          >
                            <Share2 size={16} color={p.textColor} />
                            <View style={{ flex: 1 }}>
                              <Text
                                style={[
                                  styles.accountPlatform,
                                  { color: p.textColor },
                                ]}
                              >
                                {account.platform}
                              </Text>
                              <Text style={styles.accountUsername}>
                                @{account.username}
                              </Text>
                            </View>
                            <Share2 size={13} color={p.textColor + "88"} />
                          </TouchableOpacity>
                        );
                      })}
                      <TouchableOpacity
                        onPress={() => setShowConnectAccounts(true)}
                        style={styles.addMoreBtn}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.addMoreBtnText}>
                          {t("Share.manual.addMore")}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    /* No accounts */
                    <View style={styles.noAccountsSection}>
                      <Text style={styles.connectTitle}>
                        {t("Share.automatized.title")}
                      </Text>
                      <Text style={styles.connectSub}>
                        {t("Share.automatized.description")}
                      </Text>
                      <View style={styles.platformGrid}>
                        {SHARE_PLATFORMS.map((p) => (
                          <TouchableOpacity
                            key={p.name}
                            onPress={() => setShowConnectAccounts(true)}
                            style={[
                              styles.platformTile,
                              {
                                backgroundColor: p.color,
                                borderColor: p.textColor + "33",
                              },
                            ]}
                            activeOpacity={0.8}
                          >
                            <Share2 size={18} color={p.textColor} />
                            <Text
                              style={[
                                styles.platformTileText,
                                { color: p.textColor },
                              ]}
                            >
                              {p.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                      <TouchableOpacity
                        onPress={() => setShowConnectAccounts(true)}
                        style={styles.connectBtn}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.connectBtnText}>
                          {t("Share.automatized.connectButton")}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )
                ) : (
                  /* Automatized tab */
                  <View style={{ gap: 10 }}>
                    {isPremiumFeature || isMP3 || isImage ? (
                      /* Premium gate */
                      <View style={styles.premiumGate}>
                        <Crown size={28} color="#10b981" />
                        <Text style={styles.premiumTitle}>
                          {t("Share.automatized.premium.title")}
                        </Text>
                        <Text style={styles.premiumSub}>
                          {t("Share.automatized.premium.description")}
                        </Text>
                      </View>
                    ) : user?.connectedAccounts &&
                      user.connectedAccounts.length > 0 ? (
                      <>
                        <Text style={styles.autoSelectLabel}>
                          {t("Share.automatized.selectAccounts")}
                        </Text>
                        {user.connectedAccounts.map((account) => {
                          const p = SHARE_PLATFORMS.find(
                            (sp) => sp.name === account.platform,
                          );
                          if (!p) return null;
                          const key = `${account.platform}-${account.username}`;
                          const selected =
                            selectedAccountsForAuto.includes(key);
                          return (
                            <TouchableOpacity
                              key={key}
                              onPress={() =>
                                toggleAccountSelection(
                                  account.platform,
                                  account.username,
                                )
                              }
                              style={[
                                styles.accountRow,
                                selected
                                  ? {
                                      backgroundColor: "rgba(236,72,153,0.1)",
                                      borderColor: "rgba(236,72,153,0.4)",
                                    }
                                  : {
                                      backgroundColor: "#18181b",
                                      borderColor: "#27272a",
                                    },
                              ]}
                              activeOpacity={0.8}
                            >
                              <View
                                style={[
                                  styles.autoCheckbox,
                                  selected && styles.autoCheckboxSelected,
                                ]}
                              >
                                {selected && <Check size={11} color="#fff" />}
                              </View>
                              <Share2 size={14} color={p.textColor} />
                              <View style={{ flex: 1 }}>
                                <Text style={styles.accountPlatform}>
                                  {account.platform}
                                </Text>
                                <Text style={styles.accountUsername}>
                                  @{account.username}
                                </Text>
                              </View>
                            </TouchableOpacity>
                          );
                        })}
                        {selectedAccountsForAuto.length > 0 && (
                          <TouchableOpacity
                            onPress={handleProceedToMultiPlatform}
                            style={styles.connectBtn}
                            activeOpacity={0.8}
                          >
                            <Text style={styles.connectBtnText}>
                              {t("Share.automatized.continueButton", {
                                count: selectedAccountsForAuto.length,
                                account: selectedAccountsForAuto.length,
                              })}
                            </Text>
                          </TouchableOpacity>
                        )}
                      </>
                    ) : (
                      <TouchableOpacity
                        onPress={() => setShowConnectAccounts(true)}
                        style={styles.connectBtn}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.connectBtnText}>
                          {t("Share.automatized.connectButton")}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Upload progress overlay — stays mounted after modal closes so polling continues */}
      <UploadProgressOverlay
        visible={isUploading}
        task={uploadTask}
        onDone={() => {
          stopPolling();
          setIsUploading(false);
          setUploadTask({
            taskId: null,
            platform: null,
            progress: 0,
            message: "",
            isComplete: false,
            isFailed: false,
          });
          onClose();
        }}
      />
    </>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#09090b",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "95%",
    overflow: "hidden",
  },
  scrollContent: {
    paddingBottom: 40,
    gap: 0,
  },
  closeBtn: {
    position: "absolute",
    top: 14,
    right: 14,
    zIndex: 10,
    padding: 4,
  },

  // ── Media
  mediaBox: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
    overflow: "hidden",
    flexDirection: "column",
  },
  mediaImage: {
    width: "100%",
    height: "100%",
  },
  audioPlayer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 24,
    // web: from-purple-900 via-pink-900 to-red-900 — approximated as deep pink
    backgroundColor: "#4a0d2e",
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
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
  },
  audioTime: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
  },
  scrubberWrapper: {
    width: "80%",
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 3,
  },
  videoWrapper: {
    flex: 1,
    backgroundColor: "#000",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  video: {
    width: "100%",
    height: "100%",
    objectFit: "contain" as any,
  },
  videoPlayOverlay: {
    ...(StyleSheet.absoluteFillObject as any),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  videoPlayBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
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
    paddingTop: 20,
    backgroundColor: "rgba(0,0,0,0)",
    backgroundImage: undefined,
    // Gradient via overlay
  },
  videoScrubTrack: {
    height: 3,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 2,
    marginBottom: 8,
    position: "relative",
  },
  videoScrubFill: {
    height: 3,
    backgroundColor: "#fff",
    borderRadius: 2,
  },
  videoScrubHandle: {
    position: "absolute",
    top: -4,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: "#fff",
    marginLeft: -5,
  },
  videoControlsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  videoTime: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
    fontVariant: ["tabular-nums"],
  },

  // ── Info
  infoSection: {
    padding: 16,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#18181b",
  },
  infoTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#f4f4f5",
    lineHeight: 20,
  },
  infoSubtitle: {
    fontSize: 11,
    color: "#52525b",
    marginTop: 2,
  },
  statusBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
    borderWidth: 1,
    flexShrink: 0,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusBtnText: {
    fontSize: 11,
    fontWeight: "600",
  },
  infoActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  infoStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoStatText: {
    fontSize: 12,
    color: "#71717a",
  },
  infoActions: {
    flexDirection: "row",
    gap: 4,
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 9999,
    backgroundColor: "#18181b",
    alignItems: "center",
    justifyContent: "center",
  },

  // ── AI metadata
  aiPanel: {
    borderTopWidth: 1,
    borderTopColor: "rgba(63,63,70,0.4)",
    paddingTop: 10,
    gap: 6,
  },
  aiToolRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  aiToolLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#f472b6",
  },
  aiChipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
  },
  aiChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: "#27272a",
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: "rgba(63,63,70,0.5)",
  },
  aiChipText: {
    fontSize: 10,
    color: "#d4d4d8",
  },

  // ── Share
  shareSection: {
    padding: 16,
    gap: 12,
  },
  shareSectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#f4f4f5",
  },
  shareSectionSub: {
    fontSize: 12,
    color: "#71717a",
    marginTop: -6,
  },
  warningBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  warningText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 17,
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: "#18181b",
    borderRadius: 10,
    padding: 3,
    gap: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: "#27272a",
  },
  tabText: {
    fontSize: 13,
    color: "#71717a",
    fontWeight: "500",
  },
  tabTextActive: {
    color: "#f4f4f5",
  },
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  accountPlatform: {
    fontSize: 13,
    fontWeight: "600",
    color: "#f4f4f5",
    textTransform: "capitalize",
  },
  accountUsername: {
    fontSize: 11,
    color: "#71717a",
  },
  addMoreBtn: {
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#3f3f46",
    alignItems: "center",
  },
  addMoreBtnText: {
    fontSize: 13,
    color: "#71717a",
  },
  connectSection: {
    gap: 12,
    alignItems: "center",
  },
  connectTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#f4f4f5",
    textAlign: "center",
  },
  connectSub: {
    fontSize: 12,
    color: "#71717a",
    textAlign: "center",
    lineHeight: 17,
  },
  platformGrid: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  platformTile: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    gap: 6,
  },
  platformTileText: {
    fontSize: 11,
    fontWeight: "500",
  },
  backBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#3f3f46",
  },
  backBtnText: {
    fontSize: 13,
    color: "#71717a",
  },
  connectBtn: {
    width: "100%",
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#be185d",
    alignItems: "center",
  },
  connectBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  noAccountsSection: {
    gap: 12,
    alignItems: "center",
  },
  autoSelectLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#a1a1aa",
    textAlign: "center",
  },
  autoCheckbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#52525b",
    alignItems: "center",
    justifyContent: "center",
  },
  autoCheckboxSelected: {
    backgroundColor: "#be185d",
    borderColor: "#be185d",
  },
  premiumGate: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 20,
  },
  premiumTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#f4f4f5",
    textAlign: "center",
  },
  premiumSub: {
    fontSize: 12,
    color: "#71717a",
    textAlign: "center",
    lineHeight: 17,
  },

  // ── Upload overlay
  uploadOverlayBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadOverlayCard: {
    width: 300,
    backgroundColor: "#18181b",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#27272a",
    padding: 28,
    alignItems: "center",
    gap: 12,
  },
  uploadTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#f4f4f5",
    textAlign: "center",
  },
  uploadSub: {
    fontSize: 12,
    color: "#71717a",
    textAlign: "center",
  },
  uploadBtn: {
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#be185d",
    marginTop: 4,
  },
  uploadBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  progressTrack: {
    width: "100%",
    height: 6,
    backgroundColor: "#3f3f46",
    borderRadius: 9999,
    overflow: "hidden",
  },
  progressFill: {
    height: 6,
    backgroundColor: "#ec4899",
    borderRadius: 9999,
  },
});

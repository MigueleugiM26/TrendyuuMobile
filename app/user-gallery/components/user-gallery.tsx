import { Sidebar } from "@/app/dashboard/components/Sidebar";
import { useUser } from "@/src/context/user-context";
import { useTranslations } from "@/src/hooks/useTranslations";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";
import {
  Archive,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Database,
  Download,
  ExternalLink,
  FileText,
  Filter,
  Image as ImageIcon,
  Music,
  Play,
  Presentation,
  Search,
  Trash2,
  X,
  XCircle,
} from "lucide-react-native";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";
import type { VideoStatus } from "./video";
import { VideoPreviewModal } from "./video-preview-modal-user-gallery";

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

type UserVideo = {
  id: number;
  user_id: string;
  name: string;
  size: string;
  created_at: number;
  thumbnail: string | null;
  views: number;
  likes: number;
  duration: number;
  format: "mp3" | "mp4" | "png" | "pptx" | "txt";
  type:
    | "Video"
    | "Audio"
    | "AI_Video"
    | "AI_Audio"
    | "AI_Music"
    | "AI_Image"
    | "Presentation"
    | "AI_Text"
    | "AI_VoiceChanged"
    | "AI_TranslatedAudio"
    | "AI_SoundEffect";
  is_public: boolean;
  requires_review: boolean;
  file_path: string;
  public_url: string;
  s3_key: string;
  text_preview?: string | null;
  ai_metadata?: AiMetadata | null;
};

type ZipProgress = {
  total: number;
  downloaded: number;
  currentFile: string;
  done: boolean;
  error?: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const BASE_URL = process.env.EXPO_PUBLIC_TRENDYUU_URL_BACK;
const PAGE_SIZE = 12;
const CARD_GAP = 2;
const NUM_COLS = 3;

// ─── AI_Text path → tool page mapping ────────────────────────────────────────

const AI_TEXT_PATH_MAP: Record<string, string> = {
  "/AI_Text/prompts": "/ai-tools/text-tools/prompt-engineer",
  "/AI_Text/scripts": "/ai-tools/text-tools/script-generator",
  "/AI_Text/storyboards": "/ai-tools/text-tools/storyboard-writer",
  "/AI_Text/content-edits": "/ai-tools/text-tools/content-editor",
  "/AI_Text/content-reuses": "/ai-tools/text-tools/content-reuser",
  "/AI_Text/asset-briefings": "/ai-tools/text-tools/asset-briefing",
  "/AI_Text/content-plans": "/ai-tools/text-tools/content-planner",
};

function getTextToolPage(s3Key: string): string | null {
  for (const [folder, page] of Object.entries(AI_TEXT_PATH_MAP)) {
    if (s3Key.includes(folder + "/") || s3Key.endsWith(folder)) return page;
  }
  return null;
}

// ─── Auth helper ──────────────────────────────────────────────────────────────

async function authHeaders(): Promise<Record<string, string>> {
  const token = await AsyncStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getMediaIcon(video: UserVideo, size = 12) {
  const color = "#fff";
  if (video.type === "AI_Text" || video.format === "txt")
    return <FileText size={size} color={color} />;
  if (video.type === "Presentation" || video.format === "pptx")
    return <Presentation size={size} color={color} />;
  if (video.format === "png" || video.type === "AI_Image")
    return <ImageIcon size={size} color={color} />;
  if (
    video.format === "mp3" ||
    video.type === "Audio" ||
    video.type === "AI_Audio" ||
    video.type === "AI_Music"
  )
    return <Music size={size} color={color} />;
  return <Play size={size} color={color} />;
}

function getPlaceholderIcon(video: UserVideo) {
  const color = "#52525b";
  if (video.type === "AI_Text" || video.format === "txt")
    return <FileText size={32} color={color} />;
  if (video.type === "Presentation" || video.format === "pptx")
    return <Presentation size={32} color={color} />;
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

function getAiMetadataSummary(video: UserVideo): string | null {
  const m = video.ai_metadata;
  if (!m) return null;
  if (video.type === "AI_SoundEffect" && m.prompt) return m.prompt;
  if (video.type === "AI_VoiceChanged" && m.target_voice_name)
    return `Voice: ${m.target_voice_name}`;
  if (
    video.type === "AI_TranslatedAudio" &&
    m.source_language &&
    m.target_language
  )
    return `${m.source_language.split("-")[0].toUpperCase()} → ${m.target_language.split("-")[0].toUpperCase()}`;
  if (video.type === "AI_Video" && m.model) return `Model: ${m.model}`;
  if (m.text) return m.text.length > 40 ? m.text.slice(0, 40) + "…" : m.text;
  if (m.voice_name) return `Voice: ${m.voice_name}`;
  if (m.prompt)
    return m.prompt.length > 40 ? m.prompt.slice(0, 40) + "…" : m.prompt;
  return null;
}

// ─── VideoCardSkeleton ────────────────────────────────────────────────────────

function VideoCardSkeleton() {
  return <View style={styles.cardSkeleton} />;
}

// ─── TextThumbnail ────────────────────────────────────────────────────────────

function TextThumbnail({ video }: { video: UserVideo }) {
  const [preview, setPreview] = useState<string | null>(
    video.text_preview ?? null,
  );

  useEffect(() => {
    if (preview !== null) return;
    fetch(video.public_url)
      .then((r) => r.text())
      .then((text) => setPreview(text.slice(0, 300)))
      .catch(() => setPreview(""));
  }, [video.public_url]);

  return (
    <View style={styles.textThumbnail}>
      {preview === null ? (
        <ActivityIndicator size="small" color="#52525b" />
      ) : preview === "" ? (
        <FileText size={28} color="#52525b" />
      ) : (
        <Text style={styles.textThumbnailText} numberOfLines={12}>
          {preview}
        </Text>
      )}
    </View>
  );
}

// ─── TextFileModal ────────────────────────────────────────────────────────────

function TextFileModal({
  video,
  onClose,
  onDelete,
}: {
  video: UserVideo;
  onClose: () => void;
  onDelete: (id: number) => void;
}) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const t = useTranslations("UserGallery");

  const toolPage = getTextToolPage(video.s3_key || video.file_path || "");

  useEffect(() => {
    setLoading(true);
    fetch(video.public_url)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.text();
      })
      .then((text) => {
        setContent(text);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [video.public_url]);

  const handleDownload = async () => {
    const downloadUrl = `${BASE_URL}/api/video/download-video/?r2_url=${encodeURIComponent(video.public_url)}&download_name=${encodeURIComponent(video.name)}`;
    await Linking.openURL(downloadUrl);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const headers = await authHeaders();
      const formData = new FormData();
      formData.append("video_id", String(video.id));
      const res = await fetch(`${BASE_URL}/api/video/delete-gallery/`, {
        method: "POST",
        headers,
        body: formData,
      });
      if (res.ok) {
        onDelete(video.id);
        onClose();
      }
    } catch {
      // silent
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  };

  const handleOpenInTool = async () => {
    if (!toolPage) return;
    const webUrl = `${BASE_URL}${toolPage}`;
    await Linking.openURL(webUrl);
  };

  return (
    <View style={styles.modalInner}>
      {/* Header */}
      <View style={styles.modalHeader}>
        <View style={styles.modalHeaderLeft}>
          <FileText size={16} color="#f472b6" />
          <Text style={styles.modalHeaderTitle} numberOfLines={1}>
            {video.name}
          </Text>
          <Text style={styles.modalHeaderSub}>{video.size}</Text>
        </View>
        <View style={styles.modalHeaderActions}>
          {toolPage && (
            <TouchableOpacity
              onPress={handleOpenInTool}
              style={[styles.modalBtn, styles.modalBtnPink]}
              activeOpacity={0.7}
            >
              <ExternalLink size={12} color="#fff" />
              <Text style={styles.modalBtnText}>{t("textFile.open")}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={handleDownload}
            style={[styles.modalBtn, styles.modalBtnGray]}
            activeOpacity={0.7}
          >
            <Download size={12} color="#fff" />
            <Text style={styles.modalBtnText}>{t("textFile.download")}</Text>
          </TouchableOpacity>
          {!confirmDelete ? (
            <TouchableOpacity
              onPress={() => setConfirmDelete(true)}
              style={[styles.modalBtn, styles.modalBtnGray]}
              activeOpacity={0.7}
            >
              <Trash2 size={12} color="#f87171" />
              <Text style={[styles.modalBtnText, { color: "#f87171" }]}>
                {t("textFile.delete")}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={{ flexDirection: "row", gap: 4 }}>
              <TouchableOpacity
                onPress={handleDelete}
                disabled={isDeleting}
                style={[styles.modalBtn, { backgroundColor: "#dc2626" }]}
                activeOpacity={0.7}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalBtnText}>
                    {t("textFile.confirmDelete")}
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setConfirmDelete(false)}
                style={[styles.modalBtn, styles.modalBtnGray]}
                activeOpacity={0.7}
              >
                <Text style={styles.modalBtnText}>{t("textFile.cancel")}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Body */}
      {loading && (
        <View style={styles.modalCentered}>
          <ActivityIndicator size="large" color="#71717a" />
        </View>
      )}
      {error && (
        <View style={styles.modalCentered}>
          <FileText size={40} color="#3f3f46" />
          <Text style={styles.modalEmptyText}>{t("textFile.loadError")}</Text>
        </View>
      )}
      {content !== null && !loading && (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
          <Text style={styles.textFileContent}>{content}</Text>
        </ScrollView>
      )}
    </View>
  );
}

// ─── PptxSlidesModal ──────────────────────────────────────────────────────────
// PPTX rendering requires a canvas / DOM — not available in RN.
// We show a download prompt instead, matching the web fallback.

function PptxSlidesModal({
  video,
  onClose,
}: {
  video: UserVideo;
  onClose: () => void;
}) {
  const handleDownload = async () => {
    await Linking.openURL(video.public_url);
  };

  return (
    <View style={styles.modalInner}>
      <View style={styles.modalHeader}>
        <View style={styles.modalHeaderLeft}>
          <Presentation size={16} color="#a78bfa" />
          <Text style={styles.modalHeaderTitle} numberOfLines={1}>
            {video.name}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleDownload}
          style={[styles.modalBtn, { backgroundColor: "#7c3aed" }]}
          activeOpacity={0.7}
        >
          <Download size={12} color="#fff" />
          <Text style={styles.modalBtnText}>Download</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.modalCentered}>
        <Presentation size={48} color="#3f3f46" />
        <Text style={styles.modalEmptyText}>
          Presentations can&apos;t be previewed on mobile.
        </Text>
        <TouchableOpacity
          onPress={handleDownload}
          style={[
            styles.modalBtn,
            { backgroundColor: "#3f3f46", marginTop: 8 },
          ]}
          activeOpacity={0.7}
        >
          <Download size={12} color="#fff" />
          <Text style={styles.modalBtnText}>Download to view</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── FilterRow ────────────────────────────────────────────────────────────────

type SortBy = "date" | "likes" | "views" | "name" | "size" | "duration";
type Order = "asc" | "desc";
type StatusFilter = "all" | "private" | "underReview" | "public";
type FormatFilter =
  | "all"
  | "audio"
  | "video"
  | "image"
  | "mp3"
  | "mp4"
  | "mov"
  | "mkv"
  | "avi"
  | "webm"
  | "wav"
  | "aac"
  | "flac"
  | "m4a"
  | "jpg"
  | "jpeg"
  | "png"
  | "gif"
  | "webp"
  | "bmp"
  | "pptx"
  | "txt";
type TypeFilter =
  | "all"
  | "Video"
  | "Audio"
  | "AI_Video"
  | "AI_Audio"
  | "AI_Music"
  | "AI_Image"
  | "Presentation"
  | "AI_Text"
  | "AI_VoiceChanged"
  | "AI_TranslatedAudio"
  | "AI_SoundEffect";

interface FilterState {
  sortBy: SortBy;
  order: Order;
  statusFilter: StatusFilter;
  formatFilter: FormatFilter;
  typeFilter: TypeFilter;
  dateFrom: string;
  dateTo: string;
}

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
      label: t("filters.order.desc"),
      key: "order",
      options: [
        { value: "desc", label: t("filters.order.desc") },
        { value: "asc", label: t("filters.order.asc") },
      ],
    },
    {
      label: t("filters.status.all"),
      key: "statusFilter",
      options: [
        { value: "all", label: t("filters.status.all") },
        { value: "private", label: t("filters.status.private") },
        { value: "underReview", label: t("filters.status.underReview") },
        { value: "public", label: t("filters.status.public") },
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
        { value: "avi", label: "AVI" },
        { value: "webm", label: "WEBM" },
        { value: "audio", label: t("filters.format.groupAudio") },
        { value: "mp3", label: "MP3" },
        { value: "wav", label: "WAV" },
        { value: "aac", label: "AAC" },
        { value: "flac", label: "FLAC" },
        { value: "m4a", label: "M4A" },
        { value: "image", label: t("filters.format.groupImage") },
        { value: "jpg", label: "JPG" },
        { value: "png", label: "PNG" },
        { value: "gif", label: "GIF" },
        { value: "webp", label: "WEBP" },
        { value: "bmp", label: "BMP" },
        { value: "txt", label: "TXT" },
        { value: "pptx", label: "PPTX" },
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

// ─── VideoCard ────────────────────────────────────────────────────────────────

function VideoCard({
  video,
  cardSize,
  selectionMode,
  selectedVideoIds,
  onPress,
  onLongPress,
  t,
}: {
  video: UserVideo;
  cardSize: number;
  selectionMode: boolean;
  selectedVideoIds: Set<number>;
  onPress: (v: UserVideo) => void;
  onLongPress: (v: UserVideo) => void;
  t: ReturnType<typeof useTranslations>;
}) {
  const isSelected = selectedVideoIds.has(video.id);
  const isLocked = selectionMode && (video.is_public || video.requires_review);

  const statusColor = video.requires_review
    ? "rgba(234,179,8,0.8)"
    : video.is_public
      ? "rgba(34,197,94,0.8)"
      : "rgba(113,113,122,0.8)";

  const statusLabel = video.requires_review
    ? t("VideoPreview.status.underReview")
    : video.is_public
      ? t("VideoPreview.status.public")
      : t("VideoPreview.status.private");

  const aiSummary = getAiMetadataSummary(video);

  return (
    <TouchableOpacity
      onPress={() => onPress(video)}
      onLongPress={() => onLongPress(video)}
      delayLongPress={500}
      activeOpacity={0.85}
      style={[
        styles.card,
        { width: cardSize, height: cardSize },
        isLocked && { opacity: 0.5 },
      ]}
    >
      {/* Thumbnail */}
      {video.type === "AI_Text" || video.format === "txt" ? (
        <TextThumbnail video={video} />
      ) : video.thumbnail ? (
        <Image
          source={{ uri: video.thumbnail }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.cardPlaceholder}>{getPlaceholderIcon(video)}</View>
      )}

      {/* Selection overlay */}
      {selectionMode && (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: isLocked
                ? "rgba(24,24,27,0.6)"
                : isSelected
                  ? "rgba(236,72,153,0.35)"
                  : "rgba(0,0,0,0.15)",
              borderWidth: isSelected ? 3 : 0,
              borderColor: "#ec4899",
              borderRadius: 4,
            },
          ]}
        >
          <View style={styles.cardCheckContainer}>
            {isLocked ? (
              <View style={styles.cardCheckLocked}>
                <Text
                  style={{ color: "#71717a", fontSize: 10, fontWeight: "700" }}
                >
                  ✕
                </Text>
              </View>
            ) : isSelected ? (
              <CheckCircle2 size={26} color="#ec4899" />
            ) : (
              <View style={styles.cardCheckEmpty} />
            )}
          </View>
        </View>
      )}

      {/* Normal mode overlays */}
      {!selectionMode && (
        <>
          {/* Media type icon — top right */}
          <View style={styles.cardIconBadge}>{getMediaIcon(video)}</View>

          {/* Status badge — bottom left (not for text/pptx) */}
          {video.type !== "Presentation" &&
            video.format !== "pptx" &&
            video.type !== "AI_Text" &&
            video.format !== "txt" && (
              <View
                style={[
                  styles.cardStatusBadge,
                  { backgroundColor: statusColor },
                ]}
              >
                <Text style={styles.cardStatusText}>{statusLabel}</Text>
              </View>
            )}

          {/* AI metadata chip — top left */}
          {aiSummary && (
            <View style={styles.cardAiBadge}>
              <Text style={styles.cardAiText} numberOfLines={1}>
                {aiSummary}
              </Text>
            </View>
          )}
        </>
      )}
    </TouchableOpacity>
  );
}

// ─── StorageBar ───────────────────────────────────────────────────────────────

function StorageBar({
  storageUsed,
  maxStorage,
  breakdown,
  expanded,
  onToggle,
  t,
}: {
  storageUsed: number;
  maxStorage: number;
  breakdown: { type: string; format: string; size_mb: number; count: number }[];
  expanded: boolean;
  onToggle: () => void;
  t: ReturnType<typeof useTranslations>;
}) {
  const ratio = storageUsed / (maxStorage || 1);
  const barColor =
    ratio > 0.8 ? "#ef4444" : ratio > 0.6 ? "#eab308" : "#ec4899";

  // Aggregate by type
  const byType = useMemo(() => {
    const map: Record<
      string,
      { size_mb: number; count: number; formats: typeof breakdown }
    > = {};
    for (const row of breakdown) {
      if (!map[row.type]) map[row.type] = { size_mb: 0, count: 0, formats: [] };
      map[row.type].size_mb += row.size_mb;
      map[row.type].count += row.count;
      map[row.type].formats.push(row);
    }
    return Object.entries(map).sort(([, a], [, b]) => b.size_mb - a.size_mb);
  }, [breakdown]);

  const total = storageUsed || 1;

  return (
    <View style={styles.storageBar}>
      <TouchableOpacity
        onPress={onToggle}
        style={styles.storageBarRow}
        activeOpacity={0.7}
      >
        <Database size={14} color="#71717a" />
        <View style={styles.storageBarTrack}>
          <View
            style={[
              styles.storageBarFill,
              {
                width: `${Math.min(100, ratio * 100)}%` as any,
                backgroundColor: barColor,
              },
            ]}
          />
        </View>
        <Text style={styles.storageBarText}>
          {t("storageUsed", {
            used: storageUsed.toFixed(2),
            max: maxStorage,
          })}
        </Text>
        {expanded ? (
          <ChevronDown size={14} color="#52525b" />
        ) : (
          <ChevronUp size={14} color="#52525b" />
        )}
      </TouchableOpacity>

      {expanded && byType.length > 0 && (
        <View style={styles.storageBreakdown}>
          {byType.map(([type, data]) => (
            <View key={type} style={{ gap: 4 }}>
              <View style={styles.storageBreakdownRow}>
                <Text style={styles.storageBreakdownType} numberOfLines={1}>
                  {type}
                </Text>
                <View style={styles.storageBreakdownTrack}>
                  <View
                    style={[
                      styles.storageBreakdownFill,
                      {
                        width:
                          `${Math.min(100, (data.size_mb / total) * 100)}%` as any,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.storageBreakdownMeta}>
                  {data.size_mb.toFixed(1)} MB · {data.count} file
                  {data.count !== 1 ? "s" : ""}
                </Text>
              </View>
              {data.formats.length > 1 &&
                data.formats.map((fmt) => (
                  <View
                    key={fmt.format}
                    style={[styles.storageBreakdownRow, { paddingLeft: 12 }]}
                  >
                    <Text
                      style={[
                        styles.storageBreakdownType,
                        { color: "#52525b", fontSize: 10 },
                      ]}
                    >
                      .{fmt.format}
                    </Text>
                    <View style={styles.storageBreakdownTrack}>
                      <View
                        style={[
                          styles.storageBreakdownFill,
                          {
                            width:
                              `${Math.min(100, (fmt.size_mb / total) * 100)}%` as any,
                            backgroundColor: "#52525b",
                          },
                        ]}
                      />
                    </View>
                    <Text
                      style={[
                        styles.storageBreakdownMeta,
                        { color: "#3f3f46" },
                      ]}
                    >
                      {fmt.size_mb.toFixed(1)} MB · {fmt.count}
                    </Text>
                  </View>
                ))}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function UserGallery() {
  const { user, loading } = useUser() as {
    user: {
      id: string;
      name?: string;
      email: string;
      currentPlan: string;
      isFreeTrialActive: boolean;
    };
    loading: boolean;
  };
  const t = useTranslations("UserGallery");

  // Gallery data
  const [videos, setVideos] = useState<UserVideo[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(1); // ref avoids stale closure in onEndReached
  const hasMoreRef = useRef(true);
  const isFetchingRef = useRef(false);

  // Filters (committed)
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [order, setOrder] = useState<Order>("desc");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [formatFilter, setFormatFilter] = useState<FormatFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Draft filters (filter sheet, only committed on Apply)
  const [draftFilters, setDraftFilters] = useState<FilterState>({
    sortBy: "date",
    order: "desc",
    statusFilter: "all",
    formatFilter: "all",
    typeFilter: "all",
    dateFrom: "",
    dateTo: "",
  });
  const [showFilterSheet, setShowFilterSheet] = useState(false);

  // Search
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  // Modals
  const [selectedVideo, setSelectedVideo] = useState<UserVideo | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [selectedPptx, setSelectedPptx] = useState<UserVideo | null>(null);
  const [selectedText, setSelectedText] = useState<UserVideo | null>(null);
  const [, setVideoStatus] = useState<VideoStatus>("private");

  // Selection / batch delete
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedVideoIds, setSelectedVideoIds] = useState<Set<number>>(
    new Set(),
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState<{
    total: number;
    deleted: number;
    skipped: number;
    failed: number;
    done: boolean;
  } | null>(null);
  const [confirmDeleteCount, setConfirmDeleteCount] = useState<number | null>(
    null,
  );

  // Zip
  const [zipProgress, setZipProgress] = useState<ZipProgress | null>(null);
  const zipAbortRef = useRef<AbortController | null>(null);

  // Storage
  const [storageUsed, setStorageUsed] = useState(0);
  const [storageBreakdown, setStorageBreakdown] = useState<
    { type: string; format: string; size_mb: number; count: number }[]
  >([]);
  const [showStorageBreakdown, setShowStorageBreakdown] = useState(false);

  // Grid layout
  const [cardSize, setCardSize] = useState(120);
  const flatListRef = useRef<FlatList>(null);
  const containerHeightRef = useRef(0);
  const contentHeightRef = useRef(0);

  const maxStorage = useMemo(() => {
    switch (user?.currentPlan) {
      case "essential":
        return 100;
      case "creator":
        return 300;
      case "agency":
        return 500;
      case "free":
      default:
        return 50;
    }
  }, [user?.currentPlan]);

  // ── Data fetching ───────────────────────────────────────────────────────────

  const fetchVideos = useCallback(
    async (userId: string, pageNum: number, reset = false) => {
      if (!userId || isFetchingRef.current) return;
      isFetchingRef.current = true;
      setLoadingGallery(true);
      try {
        const headers = await authHeaders();
        const params = new URLSearchParams({
          page: String(pageNum),
          page_size: String(PAGE_SIZE),
          sort_by: sortBy,
          order,
          search: activeSearch,
          format: formatFilter,
          status: statusFilter,
          type: typeFilter,
          ...(dateFrom ? { date_from: dateFrom } : {}),
          ...(dateTo ? { date_to: dateTo } : {}),
        });
        const res = await fetch(
          `${BASE_URL}/api/video/get-gallery/?${params}`,
          { headers },
        );
        const data = await res.json();
        const newVideos: UserVideo[] = data.videos || [];
        setVideos((prev) => (reset ? newVideos : [...prev, ...newVideos]));
        setStorageUsed(data.storage_used_mb || 0);
        if (data.storage_breakdown) setStorageBreakdown(data.storage_breakdown);
        const more = newVideos.length === PAGE_SIZE;
        setHasMore(more);
        hasMoreRef.current = more;
        pageRef.current = pageNum + 1;
      } catch (err) {
        console.error("Failed to load user gallery:", err);
      } finally {
        setLoadingGallery(false);
        isFetchingRef.current = false;
        // If the fetched content doesn't fill the visible area yet, fetch next page
        setTimeout(() => {
          if (
            hasMoreRef.current &&
            !isFetchingRef.current &&
            contentHeightRef.current <= containerHeightRef.current
          ) {
            if (userId) fetchVideos(userId, pageRef.current);
          }
        }, 100);
      }
    },
    [
      sortBy,
      order,
      activeSearch,
      formatFilter,
      statusFilter,
      typeFilter,
      dateFrom,
      dateTo,
    ],
  );

  useEffect(() => {
    if (loading || !user?.id) return;
    setVideos([]);
    pageRef.current = 1;
    hasMoreRef.current = true;
    setHasMore(true);
    isFetchingRef.current = false;
    fetchVideos(user.id, 1, true);
  }, [
    activeSearch,
    formatFilter,
    statusFilter,
    typeFilter,
    sortBy,
    order,
    dateFrom,
    dateTo,
    fetchVideos,
    loading,
    user?.id,
  ]);

  // Update video status when selected
  useEffect(() => {
    if (!selectedVideo) return;
    if (selectedVideo.requires_review) setVideoStatus("requires_review");
    else if (selectedVideo.is_public) setVideoStatus("public");
    else setVideoStatus("private");
  }, [selectedVideo]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handlePlay = (video: UserVideo) => {
    if (selectionMode) {
      toggleVideoSelection(video.id);
      return;
    }
    if (video.type === "AI_Text" || video.format === "txt") {
      setSelectedText(video);
    } else if (video.type === "Presentation" || video.format === "pptx") {
      setSelectedPptx(video);
    } else {
      setVideoUrl(video.public_url);
      setSelectedVideo(video);
    }
  };

  const handleLongPress = (video: UserVideo) => {
    if (video.is_public || video.requires_review) return;
    if (!selectionMode) {
      setSelectionMode(true);
      setSelectedVideoIds(new Set([video.id]));
      Vibration.vibrate(50);
    }
  };

  const toggleVideoSelection = (videoId: number) => {
    const video = videos.find((v) => v.id === videoId);
    if (!video || video.is_public || video.requires_review) return;
    setSelectedVideoIds((prev) => {
      const next = new Set(prev);
      if (next.has(videoId)) next.delete(videoId);
      else next.add(videoId);
      return next;
    });
  };

  const toggleSelectionMode = () => {
    setSelectionMode((v) => !v);
    setSelectedVideoIds(new Set());
  };

  const selectAll = () => {
    setSelectedVideoIds(
      new Set(
        videos
          .filter((v) => !v.is_public && !v.requires_review)
          .map((v) => v.id),
      ),
    );
  };
  const deselectAll = () => setSelectedVideoIds(new Set());

  const handleStatusChange = (newStatus: VideoStatus) => {
    if (!selectedVideo) return;
    setVideos((prev) =>
      prev.map((v) =>
        v.id === selectedVideo.id
          ? {
              ...v,
              requires_review: newStatus === "requires_review",
              is_public: newStatus === "public",
            }
          : v,
      ),
    );
    setVideoStatus(newStatus);
  };

  const handleSearch = () => setActiveSearch(search);

  const openFilterSheet = () => {
    setDraftFilters({
      sortBy,
      order,
      statusFilter,
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
    setStatusFilter(draftFilters.statusFilter);
    setFormatFilter(draftFilters.formatFilter);
    setTypeFilter(draftFilters.typeFilter);
    setDateFrom(draftFilters.dateFrom);
    setDateTo(draftFilters.dateTo);
    setShowFilterSheet(false);
  };

  const activeFilterCount = [
    sortBy !== "date" ? 1 : 0,
    order !== "desc" ? 1 : 0,
    statusFilter !== "all" ? 1 : 0,
    formatFilter !== "all" ? 1 : 0,
    typeFilter !== "all" ? 1 : 0,
    dateFrom || dateTo ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  // ── Batch delete ─────────────────────────────────────────────────────────────

  const handleBatchDelete = () => {
    if (selectedVideoIds.size === 0) return;
    setConfirmDeleteCount(selectedVideoIds.size);
  };

  const executeBatchDelete = async () => {
    setConfirmDeleteCount(null);
    const total = selectedVideoIds.size;
    const idsToDelete = new Set(selectedVideoIds);
    const previousVideos = videos;
    setVideos((prev) => prev.filter((v) => !idsToDelete.has(v.id)));
    setSelectedVideoIds(new Set());
    setSelectionMode(false);
    setDeleteProgress({
      total,
      deleted: 0,
      skipped: 0,
      failed: 0,
      done: false,
    });
    setIsDeleting(true);

    try {
      const headers = await authHeaders();
      const formData = new FormData();
      formData.append("video_ids", Array.from(idsToDelete).join(","));
      const res = await fetch(`${BASE_URL}/api/video/batch-delete-gallery/`, {
        method: "POST",
        body: formData,
        headers,
      });
      const data = await res.json();
      if (res.ok) {
        const deleted: number = data.deleted_count ?? 0;
        const skipped: number = data.skipped_ids?.length ?? 0;
        const failed: number = data.failed_ids?.length ?? 0;
        setDeleteProgress({ total, deleted, skipped, failed, done: true });
        if (failed > 0 || skipped > 0) {
          const toRestore = new Set([
            ...(data.failed_ids ?? []),
            ...(data.skipped_ids ?? []),
          ]);
          const items = previousVideos.filter((v) => toRestore.has(v.id));
          if (items.length > 0) {
            setVideos((prev) => {
              const existing = new Set(prev.map((v) => v.id));
              return [...items.filter((v) => !existing.has(v.id)), ...prev];
            });
          }
        }
        if (user) fetchVideos(user.id, 1, true);
      } else {
        setVideos(previousVideos);
        setDeleteProgress({
          total,
          deleted: 0,
          skipped: 0,
          failed: total,
          done: true,
        });
      }
    } catch {
      setVideos(previousVideos);
      setDeleteProgress({
        total,
        deleted: 0,
        skipped: 0,
        failed: total,
        done: true,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // ── ZIP download (links to public URLs — no JSZip in RN) ────────────────────

  const handleZipDownload = async () => {
    // On mobile, open each file URL individually (no blob zip)
    const selected = videos.filter((v) => selectedVideoIds.has(v.id));
    for (const v of selected) {
      await Linking.openURL(v.public_url);
    }
  };

  const cancelZip = () => {
    zipAbortRef.current?.abort();
    setZipProgress(null);
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  const renderItem = useCallback(
    ({ item }: { item: UserVideo }) => (
      <VideoCard
        video={item}
        cardSize={cardSize}
        selectionMode={selectionMode}
        selectedVideoIds={selectedVideoIds}
        onPress={handlePlay}
        onLongPress={handleLongPress}
        t={t}
      />
    ),
    [cardSize, selectionMode, selectedVideoIds, t],
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
    if (hasMoreRef.current && !isFetchingRef.current && user?.id) {
      fetchVideos(user.id, pageRef.current);
    }
  }, [fetchVideos, user?.id]);

  const onLayout = (e: any) => {
    const w = e.nativeEvent.layout.width;
    setCardSize(Math.floor((w - CARD_GAP * (NUM_COLS - 1)) / NUM_COLS));
  };

  const [searchExpanded, setSearchExpanded] = useState(false);
  const searchInputRef = useRef<import("react-native").TextInput>(null);

  const handleSearchIconPress = () => {
    setSearchExpanded(true);
    setTimeout(() => searchInputRef.current?.focus(), 50);
  };

  const handleSearchBlur = () => {
    // Always collapse on blur — text is preserved and shown as icon highlight
    setSearchExpanded(false);
  };

  const handleSearchClear = () => {
    setSearch("");
    setActiveSearch("");
    setSearchExpanded(false);
  };

  const handleSearchSubmit = () => {
    handleSearch();
    setSearchExpanded(false); // collapse after submitting, text stays for the active filter
  };

  return (
    <View style={styles.root}>
      {/* ── Title row ───────────────────────────────────────────────────────── */}
      <View style={styles.titleRow}>
        {/* Sidebar */}
        <Sidebar />

        {/* Title — absolutely centered */}
        <Text style={styles.pageTitle}>{t("title")}</Text>
      </View>

      {/* ── Search + filter row OR selection buttons ────────────────────────── */}
      <View style={styles.toolRow}>
        {selectionMode ? (
          /* Selection mode: 5 equal-width buttons filling the whole row */
          <>
            <TouchableOpacity
              onPress={selectAll}
              style={styles.selectionBtn}
              activeOpacity={0.7}
            >
              <CheckCircle2 size={14} color="#a1a1aa" />
              <Text style={styles.selectionBtnText}>{t("selection.all")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={deselectAll}
              style={styles.selectionBtn}
              activeOpacity={0.7}
            >
              <XCircle size={14} color="#a1a1aa" />
              <Text style={styles.selectionBtnText}>{t("selection.none")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleZipDownload}
              disabled={selectedVideoIds.size === 0}
              style={[
                styles.selectionBtn,
                selectedVideoIds.size === 0 && { opacity: 0.4 },
              ]}
              activeOpacity={0.7}
            >
              <Archive size={14} color="#a1a1aa" />
              <Text style={styles.selectionBtnText}>
                {t("selection.zipShort")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleBatchDelete}
              disabled={selectedVideoIds.size === 0 || isDeleting}
              style={[
                styles.selectionBtn,
                {
                  backgroundColor:
                    selectedVideoIds.size > 0
                      ? "rgba(220,38,38,0.15)"
                      : undefined,
                },
                (selectedVideoIds.size === 0 || isDeleting) && { opacity: 0.4 },
              ]}
              activeOpacity={0.7}
            >
              <Trash2 size={14} color="#f87171" />
              {selectedVideoIds.size > 0 && (
                <Text style={[styles.selectionBtnText, { color: "#f87171" }]}>
                  {selectedVideoIds.size}
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={toggleSelectionMode}
              style={styles.selectionBtn}
              activeOpacity={0.7}
            >
              <X size={14} color="#a1a1aa" />
              <Text style={styles.selectionBtnText}>
                {t("selection.cancel")}
              </Text>
            </TouchableOpacity>
          </>
        ) : searchExpanded ? (
          /* Expanded search — takes full width, filter/select hidden */
          <View style={[styles.searchBarExpanded]}>
            <Search size={14} color="#f9a8d4" />
            <TextInput
              ref={searchInputRef}
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={handleSearchSubmit}
              onBlur={handleSearchBlur}
              returnKeyType="search"
              placeholder={t("search")}
              placeholderTextColor="#52525b"
              style={styles.searchInput}
            />
            <TouchableOpacity onPress={handleSearchClear} hitSlop={6}>
              <X size={13} color="#71717a" />
            </TouchableOpacity>
          </View>
        ) : (
          /* Normal: icon-only search + filter + select */
          <>
            {/* Search icon — highlighted when there's an active search */}
            <TouchableOpacity
              onPress={handleSearchIconPress}
              style={[
                styles.topBarIconBtn,
                activeSearch && styles.topBarIconBtnActive,
              ]}
              activeOpacity={0.7}
            >
              <Search size={16} color={activeSearch ? "#f9a8d4" : "#a1a1aa"} />
            </TouchableOpacity>

            <View style={{ flex: 1 }} />

            {/* Filter btn */}
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

            {/* Select btn */}
            <TouchableOpacity
              onPress={toggleSelectionMode}
              style={styles.selectBtn}
              activeOpacity={0.8}
            >
              <Text style={styles.selectBtnText}>{t("select")}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* ── Grid ────────────────────────────────────────────────────────────── */}
      <FlatList
        ref={flatListRef}
        data={videos}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        numColumns={NUM_COLS}
        columnWrapperStyle={{ gap: CARD_GAP }}
        ItemSeparatorComponent={() => <View style={{ height: CARD_GAP }} />}
        ListEmptyComponent={
          !loadingGallery ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>{t("noVideos")}</Text>
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

      {/* ── Storage bar ─────────────────────────────────────────────────────── */}
      <StorageBar
        storageUsed={storageUsed}
        maxStorage={maxStorage}
        breakdown={storageBreakdown}
        expanded={showStorageBreakdown}
        onToggle={() => setShowStorageBreakdown((v) => !v)}
        t={t}
      />

      {/* ── Filter sheet ────────────────────────────────────────────────────── */}
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

      {/* ── Video preview modal ──────────────────────────────────────────────── */}
      <Modal
        visible={!!selectedVideo}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedVideo(null)}
      >
        {selectedVideo && (
          <VideoPreviewModal
            isOpen={!!selectedVideo}
            onClose={() => setSelectedVideo(null)}
            onDelete={(deletedId) => {
              setVideos((prev) => prev.filter((v) => v.id !== deletedId));
              setSelectedVideo(null);
            }}
            videoUrl={videoUrl || ""}
            videoName={selectedVideo.name}
            likes={
              videos.find((v) => v.id === selectedVideo.id)?.likes ??
              selectedVideo.likes ??
              0
            }
            views={
              videos.find((v) => v.id === selectedVideo.id)?.views ??
              selectedVideo.views ??
              0
            }
            id={selectedVideo.id}
            is_public={selectedVideo.is_public}
            requires_review={selectedVideo.requires_review}
            user_id={selectedVideo.user_id}
            thumbnail={selectedVideo.thumbnail || undefined}
            size={selectedVideo.size}
            duration={selectedVideo.duration}
            created_at={String(selectedVideo.created_at)}
            path={selectedVideo.file_path}
            onStatusChange={handleStatusChange}
            format={selectedVideo.format}
            type={selectedVideo.type}
            ai_metadata={selectedVideo.ai_metadata ?? undefined}
          />
        )}
      </Modal>

      {/* ── PPTX modal ──────────────────────────────────────────────────────── */}
      <Modal
        visible={!!selectedPptx}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedPptx(null)}
      >
        <View style={styles.fullModal}>
          <View style={styles.fullModalCard}>
            <TouchableOpacity
              onPress={() => setSelectedPptx(null)}
              style={styles.fullModalClose}
              hitSlop={8}
            >
              <X size={18} color="#71717a" />
            </TouchableOpacity>
            {selectedPptx && (
              <PptxSlidesModal
                video={selectedPptx}
                onClose={() => setSelectedPptx(null)}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* ── Text file modal ──────────────────────────────────────────────────── */}
      <Modal
        visible={!!selectedText}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedText(null)}
      >
        <View style={styles.fullModal}>
          <View style={styles.fullModalCard}>
            <TouchableOpacity
              onPress={() => setSelectedText(null)}
              style={styles.fullModalClose}
              hitSlop={8}
            >
              <X size={18} color="#71717a" />
            </TouchableOpacity>
            {selectedText && (
              <TextFileModal
                video={selectedText}
                onClose={() => setSelectedText(null)}
                onDelete={(deletedId) => {
                  setVideos((prev) => prev.filter((v) => v.id !== deletedId));
                  setSelectedText(null);
                }}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* ── Confirm delete modal ─────────────────────────────────────────────── */}
      <Modal
        visible={confirmDeleteCount !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmDeleteCount(null)}
      >
        <View style={styles.alertBackdrop}>
          <View style={styles.alertCard}>
            <Trash2 size={36} color="#ec4899" />
            <Text style={styles.alertTitle}>
              Delete {confirmDeleteCount} file
              {confirmDeleteCount !== 1 ? "s" : ""}?
            </Text>
            <Text style={styles.alertSub}>This action cannot be undone.</Text>
            <View style={styles.alertBtns}>
              <TouchableOpacity
                onPress={() => setConfirmDeleteCount(null)}
                style={[styles.alertBtn, styles.alertBtnGray]}
                activeOpacity={0.7}
              >
                <Text style={styles.alertBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={executeBatchDelete}
                style={[styles.alertBtn, { backgroundColor: "#ec4899" }]}
                activeOpacity={0.7}
              >
                <Text style={styles.alertBtnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Delete progress modal ────────────────────────────────────────────── */}
      <Modal
        visible={!!deleteProgress}
        transparent
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.alertBackdrop}>
          <View style={styles.alertCard}>
            {!deleteProgress?.done ? (
              <>
                <ActivityIndicator size="large" color="#ec4899" />
                <Text style={styles.alertTitle}>Deleting files…</Text>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width:
                          `${Math.round(((deleteProgress?.deleted ?? 0) / (deleteProgress?.total ?? 1)) * 100)}%` as any,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.alertSub}>
                  {deleteProgress?.deleted} / {deleteProgress?.total} deleted
                </Text>
              </>
            ) : (
              <>
                <CheckCircle2 size={36} color="#22c55e" />
                <Text style={styles.alertTitle}>Done!</Text>
                <Text style={[styles.alertSub, { color: "#4ade80" }]}>
                  {deleteProgress?.deleted} deleted
                </Text>
                {(deleteProgress?.skipped ?? 0) > 0 && (
                  <Text style={[styles.alertSub, { color: "#facc15" }]}>
                    {deleteProgress?.skipped} skipped
                  </Text>
                )}
                {(deleteProgress?.failed ?? 0) > 0 && (
                  <Text style={[styles.alertSub, { color: "#f87171" }]}>
                    {deleteProgress?.failed} failed
                  </Text>
                )}
                <TouchableOpacity
                  onPress={() => setDeleteProgress(null)}
                  style={[
                    styles.alertBtn,
                    { backgroundColor: "#ec4899", marginTop: 4 },
                  ]}
                  activeOpacity={0.8}
                >
                  <Text style={styles.alertBtnText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* ── ZIP progress modal ───────────────────────────────────────────────── */}
      <Modal
        visible={!!zipProgress}
        transparent
        animationType="fade"
        onRequestClose={cancelZip}
      >
        <View style={styles.alertBackdrop}>
          <View style={styles.alertCard}>
            {!zipProgress?.done ? (
              <>
                <Archive size={36} color="#ec4899" />
                <Text style={styles.alertTitle}>Building ZIP…</Text>
                {zipProgress?.currentFile ? (
                  <Text style={styles.alertSub} numberOfLines={1}>
                    {zipProgress.currentFile}
                  </Text>
                ) : null}
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width:
                          `${Math.round(((zipProgress?.downloaded ?? 0) / (zipProgress?.total ?? 1)) * 100)}%` as any,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.alertSub}>
                  {zipProgress?.downloaded} / {zipProgress?.total} files
                </Text>
                <TouchableOpacity
                  onPress={cancelZip}
                  style={[styles.alertBtn, styles.alertBtnGray]}
                  activeOpacity={0.7}
                >
                  <Text style={styles.alertBtnText}>Cancel</Text>
                </TouchableOpacity>
              </>
            ) : zipProgress?.error ? (
              <>
                <XCircle size={36} color="#ef4444" />
                <Text style={styles.alertTitle}>Failed</Text>
                <Text style={styles.alertSub}>{zipProgress.error}</Text>
                <TouchableOpacity
                  onPress={() => setZipProgress(null)}
                  style={[styles.alertBtn, styles.alertBtnGray]}
                  activeOpacity={0.7}
                >
                  <Text style={styles.alertBtnText}>Close</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <CheckCircle2 size={36} color="#22c55e" />
                <Text style={styles.alertTitle}>Download started!</Text>
                <Text style={styles.alertSub}>
                  {zipProgress?.total} file{zipProgress?.total !== 1 ? "s" : ""}{" "}
                  opened.
                </Text>
                <TouchableOpacity
                  onPress={() => setZipProgress(null)}
                  style={[styles.alertBtn, { backgroundColor: "#ec4899" }]}
                  activeOpacity={0.8}
                >
                  <Text style={styles.alertBtnText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

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
  sidebarBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  hamburgerLine: {
    width: 20,
    height: 2,
    borderRadius: 1,
    backgroundColor: "#a1a1aa",
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

  // ── Tool row (search / filter / select / selection buttons)
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

  // ── Selection mode buttons
  selectionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 8,
    borderRadius: 9999,
    backgroundColor: "#27272a",
  },
  selectionBtnText: {
    fontSize: 11,
    color: "#a1a1aa",
    fontWeight: "500",
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
  selectBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 9999,
    backgroundColor: "#be185d",
  },
  selectBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },

  // ── Search (expanded full-width)
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
    ...(StyleSheet.absoluteFillObject as any),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#27272a",
  },
  cardIconBadge: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardStatusBadge: {
    position: "absolute",
    bottom: 5,
    left: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  cardStatusText: {
    fontSize: 9,
    fontWeight: "600",
    color: "#fff",
  },
  cardAiBadge: {
    position: "absolute",
    top: 5,
    left: 5,
    backgroundColor: "rgba(236,72,153,0.25)",
    borderWidth: 1,
    borderColor: "rgba(236,72,153,0.3)",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    maxWidth: "70%",
  },
  cardAiText: {
    fontSize: 8,
    color: "#f9a8d4",
  },
  cardCheckContainer: {
    position: "absolute",
    top: 6,
    left: 6,
  },
  cardCheckEmpty: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
  },
  cardCheckLocked: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#3f3f46",
    alignItems: "center",
    justifyContent: "center",
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

  // ── Empty
  emptyState: {
    paddingVertical: 80,
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 14,
    color: "#71717a",
  },

  // ── Text thumbnail
  textThumbnail: {
    ...(StyleSheet.absoluteFillObject as any),
    backgroundColor: "#18181b",
    padding: 6,
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  textThumbnailText: {
    fontSize: 7,
    color: "#71717a",
    fontFamily: "monospace",
    lineHeight: 10,
  },

  // ── Modals (fullscreen overlay)
  fullModal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "flex-end",
  },
  fullModalCard: {
    backgroundColor: "#09090b",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
    maxHeight: "90%",
  },
  fullModalClose: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 10,
    padding: 4,
  },
  modalInner: {
    flex: 1,
    minHeight: 300,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#27272a",
    flexWrap: "wrap",
    gap: 8,
  },
  modalHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
  modalHeaderTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#e4e4e7",
    flex: 1,
  },
  modalHeaderSub: {
    fontSize: 11,
    color: "#52525b",
    flexShrink: 0,
  },
  modalHeaderActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  modalBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  modalBtnPink: { backgroundColor: "#be185d" },
  modalBtnGray: { backgroundColor: "#27272a" },
  modalBtnText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "500",
  },
  modalCentered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
  },
  modalEmptyText: {
    fontSize: 13,
    color: "#71717a",
    textAlign: "center",
  },
  textFileContent: {
    fontSize: 13,
    color: "#d4d4d8",
    fontFamily: "monospace",
    lineHeight: 20,
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

  // ── Alert modals
  alertBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  alertCard: {
    width: 300,
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#27272a",
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    gap: 12,
  },
  alertTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#f4f4f5",
    textAlign: "center",
  },
  alertSub: {
    fontSize: 13,
    color: "#71717a",
    textAlign: "center",
  },
  alertBtns: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  alertBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  alertBtnGray: { backgroundColor: "#27272a" },
  alertBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },

  // ── Progress bar
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

  // ── Storage bar
  storageBar: {
    backgroundColor: "#09090b",
    borderTopWidth: 1,
    borderTopColor: "#18181b",
  },
  storageBarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  storageBarTrack: {
    flex: 1,
    height: 4,
    backgroundColor: "#27272a",
    borderRadius: 9999,
    overflow: "hidden",
  },
  storageBarFill: {
    height: 4,
    borderRadius: 9999,
  },
  storageBarText: {
    fontSize: 11,
    color: "#71717a",
    flexShrink: 0,
  },
  storageBreakdown: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 6,
  },
  storageBreakdownRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  storageBreakdownType: {
    fontSize: 11,
    color: "#a1a1aa",
    fontWeight: "500",
    width: 90,
  },
  storageBreakdownTrack: {
    flex: 1,
    height: 4,
    backgroundColor: "#27272a",
    borderRadius: 9999,
    overflow: "hidden",
  },
  storageBreakdownFill: {
    height: 4,
    backgroundColor: "#ec4899",
    borderRadius: 9999,
  },
  storageBreakdownMeta: {
    fontSize: 10,
    color: "#52525b",
    width: 110,
    textAlign: "right",
  },
});

import { ASPECT_RATIO_OPTIONS_IMAGE } from "@/src/constants/aspect-ratio-options";
import { Translator, useTranslations } from "@/src/hooks/useTranslations";
import {
  AI_IMAGE_MODELS,
  AI_QUALITY_MODELS,
  AI_VIDEO_MODELS,
  AIImageModelConfig,
  AIModelPlan,
  AIVideoModelConfig,
  AspectRatioImageAI,
  AspectRatioVideoAI,
  getAIImageModelLogo,
  getAIVideoModelLogo,
  ImageModeVideoAI,
  QualityLevel,
  QualityVideoAI,
} from "@/src/types/aiModels";
import { UserPlan } from "@/src/types/user";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Check, Lock, X } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AIImageModel {
  id: string;
  name: string;
  logo: string;
  locked?: boolean;
  hasQuality?: boolean;
  maxImages?: number;
  plan: AIModelPlan;
  status: string;
  baseCredits: number;
}

interface AIVideoModel {
  id: string;
  name: string;
  logo: string;
  locked?: boolean;
  hasQuality?: boolean;
  maxImages?: number;
  duration: AIVideoModelConfig["duration"];
  supportsAudio: boolean;
  plan: AIModelPlan;
  status: string;
  baseCredits: number;
}

interface PickedImage {
  uri: string;
  name: string;
  type: string;
  base64?: string;
}

interface HeroDashboardProps {
  user?: { id?: string; plan?: string } | null;
  userPlan: UserPlan;
  userCredits?: number;
  formatTime: (s: number) => string;
  formatStorage: (mb: number) => string;
  t: Translator;
  mode?: "image" | "video";
  onModeChange?: (mode: "image" | "video") => void;
  isPlanUpgradeRequired?: boolean;
  hasGoogleDrive?: boolean;
  onUpgradeRequired?: () => void;
  onImportFromDrive?: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PLAN_HIERARCHY: Record<UserPlan, number> = {
  free: 0,
  essential: 1,
  creator: 2,
  agency: 3,
};

function isImageModelLocked(
  model: AIImageModelConfig,
  userPlan: UserPlan,
): boolean {
  if (model.status === "blocked") return true;
  return PLAN_HIERARCHY[userPlan] < PLAN_HIERARCHY[model.plan as UserPlan];
}

function isVideoModelLocked(
  model: AIVideoModelConfig,
  userPlan: UserPlan,
): boolean {
  if (model.status === "blocked") return true;
  return PLAN_HIERARCHY[userPlan] < PLAN_HIERARCHY[model.plan as UserPlan];
}

function doesImageModelSupportReference(modelId: string): boolean {
  return AI_IMAGE_MODELS[modelId]?.supportsReferenceImage ?? false;
}

function getVisibleImageModels(userPlan: UserPlan): AIImageModelConfig[] {
  return Object.values(AI_IMAGE_MODELS).filter((m) => m.status !== "blocked");
}

function getVisibleVideoModels(userPlan: UserPlan): AIVideoModelConfig[] {
  return Object.values(AI_VIDEO_MODELS).filter((m) => m.status !== "blocked");
}

function calculateImageCredits(
  modelId: string,
  quality: QualityLevel,
  numRefs = 0,
  qty = 1,
): number {
  const model = AI_IMAGE_MODELS[modelId];
  if (!model) return 0;
  if (model.perExtraReference !== undefined) {
    return (model.baseCredits + model.perExtraReference * numRefs) * qty;
  }
  const qualityMap = AI_QUALITY_MODELS[modelId];
  const qualityBonus = qualityMap ? (qualityMap[quality] ?? 0) : 0;
  return (model.baseCredits + qualityBonus) * qty;
}

function calculateVideoCredits(
  modelId: string,
  duration: number,
  images: PickedImage[],
  hasAudio: boolean,
  userPlan: UserPlan,
): number {
  const model = AI_VIDEO_MODELS[modelId];
  if (!model) return 0;
  let credits = model.baseCredits;
  if (model.duration.type === "slider" && model.duration.min) {
    const effectiveDuration =
      userPlan === "free" && model.freeLimitations?.forceDuration
        ? model.freeLimitations.forceDuration
        : duration;
    credits = model.baseCredits * effectiveDuration;
  } else if (model.duration.type === "selection" && model.duration.options) {
    if (model.pricingMap)
      credits = model.pricingMap[duration] ?? model.baseCredits;
    else if (model.id === "kling-2.5-turbo")
      credits = duration === 10 ? 3200 : 1600;
    else if (model.id === "wan-2.6") credits = model.baseCredits * duration;
  }
  if (images.length > 0)
    credits += images.length * (model.images.costPerImage || 0);
  if (hasAudio && model.audio.accepts) credits += model.audio.costPerAudio || 0;
  return Math.round(credits);
}

function getPlanBadgeColor(plan: AIModelPlan): string {
  switch (plan) {
    case "free":
      return "#52525b";
    case "essential":
      return "#92400e";
    case "creator":
      return "#166534";
    case "agency":
      return "#ec4899";
    default:
      return "#52525b";
  }
}

const ASPECT_RATIO_OPTIONS_VIDEO: {
  value: AspectRatioVideoAI;
  label: string;
  shortLabel: string;
}[] = [
  { value: "16:9", label: "widescreenLabel", shortLabel: "widescreen" },
  { value: "9:16", label: "storyLabel", shortLabel: "story" },
  { value: "1:1", label: "squareLabel", shortLabel: "square" },
];

// ─── ModelDropdown ────────────────────────────────────────────────────────────

function ModelDropdown({
  isOpen,
  onClose,
  selectedModelId,
  onSelectModel,
  models,
  isImageMode,
  t,
  getModelDescription,
}: {
  isOpen: boolean;
  onClose: () => void;
  selectedModelId: string;
  onSelectModel: (id: string) => void;
  models: (AIImageModel | AIVideoModel)[];
  isImageMode: boolean;
  t: Translator;
  getModelDescription: (id: string) => string;
}) {
  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={dropdownStyles.backdrop} onPress={onClose}>
        <Pressable style={dropdownStyles.panel} onPress={() => {}}>
          {/* Header */}
          <View style={dropdownStyles.header}>
            <View>
              <Text style={dropdownStyles.headerTitle}>
                {isImageMode ? t("selectImageModel") : t("selectVideoModel")}
              </Text>
              <Text style={dropdownStyles.headerSubtitle}>
                {t("chooseBestModel")}
              </Text>
            </View>
            <Pressable onPress={onClose} style={dropdownStyles.closeBtn}>
              <X size={16} color="#a1a1aa" />
            </Pressable>
          </View>

          <ScrollView
            style={dropdownStyles.list}
            showsVerticalScrollIndicator={false}
          >
            {models.map((model) => {
              const locked = model.locked || false;
              const blocked = model.status === "blocked";
              const isSelected = selectedModelId === model.id;
              const logo = isImageMode
                ? getAIImageModelLogo(model.id)
                : getAIVideoModelLogo(model.id);

              return (
                <Pressable
                  key={model.id}
                  onPress={() => {
                    if (!blocked) {
                      onSelectModel(model.id);
                      onClose();
                    }
                  }}
                  disabled={blocked}
                  style={[
                    dropdownStyles.modelRow,
                    isSelected && dropdownStyles.modelRowSelected,
                    blocked && { opacity: 0.5 },
                  ]}
                >
                  <View style={dropdownStyles.modelLogoBox}>
                    <Image
                      source={{ uri: logo }}
                      style={dropdownStyles.modelLogo}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={dropdownStyles.modelInfo}>
                    <View style={dropdownStyles.modelNameRow}>
                      <Text style={dropdownStyles.modelName} numberOfLines={1}>
                        {model.name}
                      </Text>
                      {blocked && (
                        <View
                          style={[
                            dropdownStyles.badge,
                            { backgroundColor: "rgba(234,179,8,0.2)" },
                          ]}
                        >
                          <Text
                            style={[
                              dropdownStyles.badgeText,
                              { color: "#facc15" },
                            ]}
                          >
                            {t("comingSoon")}
                          </Text>
                        </View>
                      )}
                      {locked && !blocked && <Lock size={12} color="#eab308" />}
                      {model.plan && (
                        <View
                          style={[
                            dropdownStyles.badge,
                            { backgroundColor: getPlanBadgeColor(model.plan) },
                          ]}
                        >
                          <Text style={dropdownStyles.badgeText}>
                            {model.plan}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={dropdownStyles.modelDesc} numberOfLines={1}>
                      {getModelDescription(model.id)}
                    </Text>
                    <Text style={dropdownStyles.modelCredits}>
                      {model.baseCredits} {t("credits")}
                    </Text>
                  </View>
                  {isSelected && <Check size={16} color="#f472b6" />}
                </Pressable>
              );
            })}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── HeroDashboard ────────────────────────────────────────────────────────────

export function HeroDashboard({
  user,
  userPlan = "free",
  userCredits = 0,
  isPlanUpgradeRequired = false,
  hasGoogleDrive = false,
  onUpgradeRequired,
  onImportFromDrive,
  mode: controlledMode,
  onModeChange,
}: HeroDashboardProps) {
  const router = useRouter();
  const t = useTranslations("dashboard.HeroDashboard");

  const getModelDescription = (modelId: string): string => {
    const key = `modelDescriptions.${modelId.replace(/[.-]/g, "")}`;
    const desc = t(key);
    if (desc === key)
      return t(`modelPicker.modelDescriptions.${modelId.replace(/[.-]/g, "")}`);
    return desc;
  };

  // ── Mode ─────────────────────────────────────────────────────────────────
  const [internalMode, setInternalMode] = useState<"image" | "video">("image");
  const mode = controlledMode ?? internalMode;
  const setMode = (m: "image" | "video") => {
    controlledMode !== undefined ? onModeChange?.(m) : setInternalMode(m);
  };

  // ── State ─────────────────────────────────────────────────────────────────
  const [prompt, setPrompt] = useState("");
  const [images, setImages] = useState<PickedImage[]>([]);
  const [isGenerating] = useState(false);
  const [audioFile, setAudioFile] = useState<{
    uri: string;
    name: string;
  } | null>(null);

  // ── Models ────────────────────────────────────────────────────────────────
  const availableImageModels = useMemo<AIImageModel[]>(
    () =>
      getVisibleImageModels(userPlan).map((m) => ({
        id: m.id,
        name: m.name,
        logo: getAIImageModelLogo(m.id),
        locked: isImageModelLocked(m, userPlan),
        hasQuality: !!AI_QUALITY_MODELS[m.id],
        maxImages: m.max_generation_images || 1,
        plan: m.plan,
        status: m.status,
        baseCredits: m.baseCredits,
      })),
    [userPlan],
  );

  const availableVideoModels = useMemo<AIVideoModel[]>(
    () =>
      getVisibleVideoModels(userPlan).map((m) => ({
        id: m.id,
        name: m.name,
        logo: getAIVideoModelLogo(m.id),
        locked: isVideoModelLocked(m, userPlan),
        hasQuality: !!m.qualities?.length,
        maxImages: m.images.max || 1,
        duration: m.duration,
        supportsAudio: m.audio.accepts,
        plan: m.plan,
        status: m.status,
        baseCredits: m.baseCredits,
      })),
    [userPlan],
  );

  const getDefaultImageModel = () => {
    const unlocked = Object.values(AI_IMAGE_MODELS).filter(
      (m) => !isImageModelLocked(m, userPlan) && m.status !== "blocked",
    );
    if (!unlocked.length) return availableImageModels[0]?.id ?? "default";
    return unlocked.reduce((best, m) =>
      m.baseCredits > best.baseCredits ? m : best,
    ).id;
  };

  const getDefaultVideoModel = () => {
    const unlocked = Object.values(AI_VIDEO_MODELS).filter(
      (m) => !isVideoModelLocked(m, userPlan) && m.status !== "blocked",
    );
    if (!unlocked.length) return availableVideoModels[0]?.id ?? "";
    return unlocked.reduce((best, m) =>
      m.baseCredits > best.baseCredits ? m : best,
    ).id;
  };

  const [selectedImageModelId, setSelectedImageModelId] =
    useState(getDefaultImageModel);
  const [selectedVideoModelId, setSelectedVideoModelId] =
    useState(getDefaultVideoModel);

  const FAVORITE_IMAGE_MODEL_KEY = "favorite-image-model";
  const FAVORITE_VIDEO_MODEL_KEY = "favorite-video-model";
  const BASE_URL = process.env.EXPO_PUBLIC_TRENDYUU_URL_BACK;

  const fetchFavoriteModel = async (
    key: string,
    defaultId: string,
    validate: (id: string) => boolean,
  ): Promise<string> => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) return defaultId;
      const res = await fetch(
        `${BASE_URL}/api/video/get-user-config/?key=${key}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!res.ok) return defaultId;
      const data = await res.json();
      const savedId: string | undefined =
        data?.value?.favorite_image_model ?? data?.value?.favorite_video_model;
      if (!savedId || !validate(savedId)) return defaultId;
      return savedId;
    } catch {
      return defaultId;
    }
  };

  const saveFavoriteModel = async (
    key: string,
    valueKey: string,
    modelId: string,
  ) => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) return;
      await fetch(`${BASE_URL}/api/video/save-user-config/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key, value: { [valueKey]: modelId } }),
      });
    } catch (err) {
      console.error("Failed to save favorite model:", err);
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    fetchFavoriteModel(FAVORITE_IMAGE_MODEL_KEY, selectedImageModelId, (id) => {
      const m = AI_IMAGE_MODELS[id];
      return !!m && m.status !== "blocked" && !isImageModelLocked(m, userPlan);
    }).then(setSelectedImageModelId);
    fetchFavoriteModel(FAVORITE_VIDEO_MODEL_KEY, selectedVideoModelId, (id) => {
      const m = AI_VIDEO_MODELS[id];
      return !!m && m.status !== "blocked" && !isVideoModelLocked(m, userPlan);
    }).then(setSelectedVideoModelId);
  }, [user?.id]);

  const selectedImageModel = useMemo(
    () =>
      availableImageModels.find((m) => m.id === selectedImageModelId) ??
      availableImageModels[0],
    [availableImageModels, selectedImageModelId],
  );
  const selectedVideoModel = useMemo(
    () =>
      availableVideoModels.find((m) => m.id === selectedVideoModelId) ??
      availableVideoModels[0],
    [availableVideoModels, selectedVideoModelId],
  );
  const selectedModel =
    mode === "image" ? selectedImageModel : selectedVideoModel;
  const selectedModelId =
    mode === "image" ? selectedImageModelId : selectedVideoModelId;

  const setSelectedModelId = (id: string) => {
    if (mode === "image") {
      setSelectedImageModelId(id);
      saveFavoriteModel(FAVORITE_IMAGE_MODEL_KEY, "favorite_image_model", id);
    } else {
      setSelectedVideoModelId(id);
      saveFavoriteModel(FAVORITE_VIDEO_MODEL_KEY, "favorite_video_model", id);
    }
  };

  // ── Specific states ───────────────────────────────────────────────────────
  const [selectedQualityId, setSelectedQualityId] =
    useState<QualityLevel>("medium");
  const [format, setFormat] = useState<AspectRatioImageAI | AspectRatioVideoAI>(
    "1:1",
  );
  const [numImages, setNumImages] = useState(1);
  const [duration, setDuration] = useState(5);
  const [videoQuality, setVideoQuality] = useState<QualityVideoAI>("720p");
  const [imageMode, setImageMode] = useState<ImageModeVideoAI>("reference");
  const [seed, setSeed] = useState("");

  // ── Dropdown visibility ───────────────────────────────────────────────────
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [showQualityDropdown, setShowQualityDropdown] = useState(false);
  const [showAspectDropdown, setShowAspectDropdown] = useState(false);
  const [showDurationDropdown, setShowDurationDropdown] = useState(false);
  const [showCreditsPopup, setShowCreditsPopup] = useState(false);

  // ── Reference image support ───────────────────────────────────────────────
  const supportsReferenceImages = useMemo(
    () =>
      mode === "image"
        ? doesImageModelSupportReference(selectedImageModelId)
        : false,
    [mode, selectedImageModelId],
  );

  useEffect(() => {
    if (mode === "image" && !supportsReferenceImages) setImages([]);
  }, [mode, supportsReferenceImages]);

  // ── Sync aspect ratio when model changes ─────────────────────────────────
  useEffect(() => {
    const modelConfig =
      mode === "image"
        ? AI_IMAGE_MODELS[selectedImageModelId]
        : AI_VIDEO_MODELS[selectedVideoModelId];
    const available = modelConfig?.aspectRatios || [];
    if (available.length > 0 && !available.includes(format))
      setFormat(available[0]);
  }, [selectedImageModelId, selectedVideoModelId, mode]);

  // ── Credits ───────────────────────────────────────────────────────────────
  const creditsCost = useMemo(() => {
    if (mode === "image")
      return calculateImageCredits(
        selectedImageModelId,
        selectedQualityId,
        images.length,
        numImages,
      );
    return calculateVideoCredits(
      selectedVideoModelId,
      duration,
      images,
      !!audioFile,
      userPlan,
    );
  }, [
    mode,
    selectedImageModelId,
    selectedQualityId,
    numImages,
    selectedVideoModelId,
    duration,
    images,
    audioFile,
    userPlan,
  ]);

  const needsUpgrade = useMemo(() => {
    if (isPlanUpgradeRequired) return true;
    if (mode === "image") {
      const m = Object.values(AI_IMAGE_MODELS).find(
        (m) => m.id === selectedImageModelId,
      );
      return m ? isImageModelLocked(m, userPlan) : false;
    }
    const m = Object.values(AI_VIDEO_MODELS).find(
      (m) => m.id === selectedVideoModelId,
    );
    return m ? isVideoModelLocked(m, userPlan) : false;
  }, [
    mode,
    selectedImageModelId,
    selectedVideoModelId,
    userPlan,
    isPlanUpgradeRequired,
  ]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleImagePick = async () => {
    const max = selectedModel?.maxImages ?? 1;
    if (images.length >= max) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    const newImage: PickedImage = {
      uri: asset.uri,
      name: asset.fileName ?? "image.jpg",
      type: asset.mimeType ?? "image/jpeg",
      base64: asset.base64 ?? undefined,
    };
    setImages((prev) => [...prev, newImage].slice(0, max));
  };

  const handleAudioPick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "audio/*",
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      setAudioFile({
        uri: file.uri,
        name: file.name ?? "audio.mp3",
      });
    } catch (error) {
      console.error("Error picking audio:", error);
    }
  };

  const removeImage = (index: number) =>
    setImages((prev) => prev.filter((_, i) => i !== index));
  const removeAudio = () => setAudioFile(null);
  const randomizeSeed = () =>
    setSeed(Math.floor(Math.random() * 999999999).toString());

  const handleSubmit = async () => {
    if (needsUpgrade) {
      onUpgradeRequired?.();
      return;
    }
    if (!prompt.trim() || isGenerating) return;

    await AsyncStorage.setItem("pendingToolPrompt", prompt.trim());

    if (mode === "image") {
      await AsyncStorage.setItem(
        "pendingHeroConfig",
        JSON.stringify({
          mode: "image",
          modelId: selectedImageModelId,
          quality: selectedQualityId,
          aspectRatio: format,
          numImages,
          images: images.map((img) => ({
            name: img.name,
            type: img.type,
            data: img.base64 ?? "",
          })),
        }),
      );
      router.push("/ai-tools/text-to-image" as any);
    } else {
      await AsyncStorage.setItem(
        "pendingHeroConfig",
        JSON.stringify({
          mode: "video",
          modelId: selectedVideoModelId,
          quality: videoQuality,
          aspectRatio: format,
          duration,
          imageMode,
          seed: seed || undefined,
          images: images.map((img) => ({
            name: img.name,
            type: img.type,
            data: img.base64 ?? "",
          })),
        }),
      );
      router.push("/ai-tools/text-to-video" as any);
    }
  };

  // ── Aspect ratio options for current model ────────────────────────────────
  const allAspectOptions =
    mode === "image" ? ASPECT_RATIO_OPTIONS_IMAGE : ASPECT_RATIO_OPTIONS_VIDEO;
  const modelConfig =
    mode === "image"
      ? AI_IMAGE_MODELS[selectedImageModelId]
      : AI_VIDEO_MODELS[selectedVideoModelId];
  const availableRatios = modelConfig?.aspectRatios || [];
  const aspectOptions = allAspectOptions.filter((o) =>
    availableRatios.includes(o.value),
  );
  const selectedAspect =
    aspectOptions.find((o) => o.value === format) ?? aspectOptions[0];

  const videoModel = AI_VIDEO_MODELS[selectedVideoModelId];

  // ─────────────────────────────────────────────────────────────────────────
  // NOTE: On web, the HeroDashboard is wrapped in `hidden sm:block` — it is
  // intentionally NOT shown on mobile. On mobile (this app) we render it as a
  // compact prompt box without the decorative hero title, matching the
  // functional elements that are visible at the sm breakpoint on a small
  // physical device when rotated, or on tablet.
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <View style={styles.root}>
      {/*
      <View style={styles.modeToggleRow}>
        <View style={styles.modeToggle}>
          {(["image", "video"] as const).map((m) => (
            <Pressable
              key={m}
              onPress={() => setMode(m)}
              style={[styles.modeBtn, mode === m && styles.modeBtnActive]}
            >
              {m === "image" ? (
                <ImageIcon size={14} color={mode === m ? "#fff" : "#a1a1aa"} />
              ) : (
                <Video size={14} color={mode === m ? "#fff" : "#a1a1aa"} />
              )}
              <Text
                style={[
                  styles.modeBtnText,
                  mode === m && styles.modeBtnTextActive,
                ]}
              >
                {t(m === "image" ? "imageMode" : "videoMode")}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.box}>
        <View style={styles.controlsBar}>
          {mode === "image" && supportsReferenceImages && (
            <Pressable
              onPress={handleImagePick}
              disabled={images.length >= (selectedModel?.maxImages ?? 1)}
              style={[
                styles.iconBtn,
                styles.iconBtnDashed,
                images.length >= (selectedModel?.maxImages ?? 1) && {
                  opacity: 0.4,
                },
              ]}
              accessibilityLabel={t("addReferenceImage")}
            >
              <ImageIcon size={16} color="#71717a" />
            </Pressable>
          )}

          {images.length > 0 && (
            <View style={styles.previewsRow}>
              {images.map((img, index) => (
                <View key={index} style={styles.previewWrapper}>
                  <Image
                    source={{ uri: img.uri }}
                    style={styles.previewImg}
                    resizeMode="cover"
                  />
                  <Pressable
                    onPress={() => removeImage(index)}
                    style={styles.previewRemove}
                  >
                    <X size={10} color="#d4d4d8" />
                  </Pressable>
                </View>
              ))}
            </View>
          )}

          <View style={{ flex: 1 }} />

          <Pressable
            onPress={() => setShowModelPicker(true)}
            style={styles.modelTrigger}
          >
            {selectedModel?.locked && <Lock size={12} color="#71717a" />}
            <View style={styles.modelLogoBox}>
              <Image
                source={{ uri: selectedModel?.logo ?? "" }}
                style={styles.modelLogoImg}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.modelTriggerText} numberOfLines={1}>
              {selectedModel?.name}
            </Text>
            <ChevronDown size={12} color="#a1a1aa" />
          </Pressable>

          {mode === "image" && selectedModel?.hasQuality && (
            <>
              <Pressable
                onPress={() => setShowQualityDropdown(true)}
                style={styles.pillBtn}
              >
                <Text style={styles.pillBtnText}>{selectedQualityId}</Text>
                <ChevronDown size={12} color="#a1a1aa" />
              </Pressable>
              <Modal
                visible={showQualityDropdown}
                transparent
                animationType="fade"
                onRequestClose={() => setShowQualityDropdown(false)}
              >
                <Pressable
                  style={styles.dropdownBackdrop}
                  onPress={() => setShowQualityDropdown(false)}
                >
                  <View style={styles.dropdownCard}>
                    <Text style={styles.dropdownLabel}>{t("quality")}</Text>
                    {(["low", "medium", "high"] as QualityLevel[]).map((q) => (
                      <Pressable
                        key={q}
                        onPress={() => {
                          setSelectedQualityId(q);
                          setShowQualityDropdown(false);
                        }}
                        style={[
                          styles.dropdownItem,
                          selectedQualityId === q && styles.dropdownItemActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.dropdownItemText,
                            selectedQualityId === q &&
                              styles.dropdownItemTextActive,
                          ]}
                        >
                          {q}
                        </Text>
                        {selectedQualityId === q && (
                          <Check size={12} color="#fff" />
                        )}
                      </Pressable>
                    ))}
                  </View>
                </Pressable>
              </Modal>
            </>
          )}

          {aspectOptions.length > 0 && (
            <>
              <Pressable
                onPress={() => setShowAspectDropdown(true)}
                style={styles.pillBtn}
              >
                <Text style={styles.pillBtnText}>
                  {selectedAspect?.shortLabel ?? format}
                </Text>
                <ChevronDown size={12} color="#a1a1aa" />
              </Pressable>
              <Modal
                visible={showAspectDropdown}
                transparent
                animationType="fade"
                onRequestClose={() => setShowAspectDropdown(false)}
              >
                <Pressable
                  style={styles.dropdownBackdrop}
                  onPress={() => setShowAspectDropdown(false)}
                >
                  <View style={styles.dropdownCard}>
                    {aspectOptions.map((option) => (
                      <Pressable
                        key={option.value}
                        onPress={() => {
                          setFormat(option.value);
                          setShowAspectDropdown(false);
                        }}
                        style={[
                          styles.dropdownItem,
                          styles.dropdownItemRow,
                          format === option.value && styles.dropdownItemActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.dropdownItemText,
                            format === option.value &&
                              styles.dropdownItemTextActive,
                          ]}
                        >
                          {option.label ?? option.shortLabel}
                        </Text>
                        <Text style={styles.dropdownItemMono}>
                          {option.value}
                        </Text>
                        {format === option.value && (
                          <Check size={12} color="#fff" />
                        )}
                      </Pressable>
                    ))}
                  </View>
                </Pressable>
              </Modal>
            </>
          )}

          {mode === "video" && videoModel && (
            <>
              {videoModel.duration.type === "selection" &&
                videoModel.duration.options && (
                  <>
                    <Pressable
                      onPress={() => setShowDurationDropdown(true)}
                      style={styles.pillBtn}
                    >
                      <Clock size={12} color="#a1a1aa" />
                      <Text style={styles.pillBtnText}>{duration}s</Text>
                      <ChevronDown size={12} color="#a1a1aa" />
                    </Pressable>
                    <Modal
                      visible={showDurationDropdown}
                      transparent
                      animationType="fade"
                      onRequestClose={() => setShowDurationDropdown(false)}
                    >
                      <Pressable
                        style={styles.dropdownBackdrop}
                        onPress={() => setShowDurationDropdown(false)}
                      >
                        <View style={styles.dropdownCard}>
                          <Text style={styles.dropdownLabel}>
                            {t("duration")}
                          </Text>
                          {videoModel.duration.options.map((dur) => (
                            <Pressable
                              key={dur}
                              onPress={() => {
                                setDuration(dur);
                                setShowDurationDropdown(false);
                              }}
                              style={[
                                styles.dropdownItem,
                                styles.dropdownItemRow,
                                duration === dur && styles.dropdownItemActive,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.dropdownItemText,
                                  duration === dur &&
                                    styles.dropdownItemTextActive,
                                ]}
                              >
                                {dur}s
                              </Text>
                              {duration === dur && (
                                <Check size={12} color="#fff" />
                              )}
                            </Pressable>
                          ))}
                        </View>
                      </Pressable>
                    </Modal>
                  </>
                )}

              {videoModel.duration.type === "fixed" &&
                videoModel.duration.value && (
                  <Text style={styles.fixedDuration}>
                    {videoModel.duration.value}s
                  </Text>
                )}

              {videoModel.qualities && videoModel.qualities.length > 0 && (
                <>
                  <Pressable
                    onPress={() => setShowQualityDropdown(true)}
                    style={styles.pillBtn}
                  >
                    <Text style={styles.pillBtnText}>{videoQuality}</Text>
                    <ChevronDown size={12} color="#a1a1aa" />
                  </Pressable>
                  <Modal
                    visible={showQualityDropdown}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setShowQualityDropdown(false)}
                  >
                    <Pressable
                      style={styles.dropdownBackdrop}
                      onPress={() => setShowQualityDropdown(false)}
                    >
                      <View style={styles.dropdownCard}>
                        <Text style={styles.dropdownLabel}>{t("quality")}</Text>
                        {videoModel.qualities.map((q) => (
                          <Pressable
                            key={q}
                            onPress={() => {
                              setVideoQuality(q);
                              setShowQualityDropdown(false);
                            }}
                            style={[
                              styles.dropdownItem,
                              styles.dropdownItemRow,
                              videoQuality === q && styles.dropdownItemActive,
                            ]}
                          >
                            <Text
                              style={[
                                styles.dropdownItemText,
                                videoQuality === q &&
                                  styles.dropdownItemTextActive,
                              ]}
                            >
                              {q}
                            </Text>
                            {videoQuality === q && (
                              <Check size={12} color="#fff" />
                            )}
                          </Pressable>
                        ))}
                      </View>
                    </Pressable>
                  </Modal>
                </>
              )}

              {videoModel.images.type === "mode-selector" && (
                <View style={styles.imageModeRow}>
                  {(["reference", "first-last"] as ImageModeVideoAI[]).map(
                    (m) => (
                      <Pressable
                        key={m}
                        onPress={() => setImageMode(m)}
                        style={[
                          styles.imageModeBtn,
                          imageMode === m && styles.imageModeBtnActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.imageModeBtnText,
                            imageMode === m && styles.imageModeBtnTextActive,
                          ]}
                        >
                          {m === "reference" ? t("reference") : t("firstLast")}
                        </Text>
                      </Pressable>
                    ),
                  )}
                </View>
              )}

              {videoModel.audio.accepts && (
                <View style={styles.audioRow}>
                  <Pressable
                    onPress={handleAudioPick}
                    disabled={!!audioFile}
                    style={[styles.iconBtn, !!audioFile && { opacity: 0.4 }]}
                  >
                    <Music size={16} color="#71717a" />
                  </Pressable>
                  {audioFile && (
                    <View style={styles.audioTag}>
                      <Music size={12} color="#ec4899" />
                      <Text style={styles.audioTagText} numberOfLines={1}>
                        {audioFile.name}
                      </Text>
                      <Pressable onPress={removeAudio}>
                        <X size={12} color="#a1a1aa" />
                      </Pressable>
                    </View>
                  )}
                </View>
              )}

              {videoModel.seed && (
                <View style={styles.seedRow}>
                  <TextInput
                    value={seed}
                    onChangeText={setSeed}
                    placeholder={t("seedPlaceholder")}
                    placeholderTextColor="#3f3f46"
                    style={styles.seedInput}
                    keyboardType="numeric"
                  />
                  <Pressable onPress={randomizeSeed} style={styles.seedBtn}>
                    <Shuffle size={12} color="#71717a" />
                  </Pressable>
                </View>
              )}
            </>
          )}

          {mode === "image" && (selectedModel?.maxImages ?? 1) > 1 && (
            <>
              <View style={styles.dividerV} />
              <View style={styles.qtyRow}>
                <Pressable
                  onPress={() => setNumImages((n) => Math.max(1, n - 1))}
                  disabled={numImages <= 1}
                  style={[styles.qtyBtn, numImages <= 1 && { opacity: 0.4 }]}
                >
                  <Text style={styles.qtyBtnText}>−</Text>
                </Pressable>
                <Text style={styles.qtyValue}>{numImages}</Text>
                <Pressable
                  onPress={() =>
                    setNumImages((n) =>
                      Math.min(selectedModel?.maxImages ?? 1, n + 1),
                    )
                  }
                  disabled={numImages >= (selectedModel?.maxImages ?? 1)}
                  style={[
                    styles.qtyBtn,
                    numImages >= (selectedModel?.maxImages ?? 1) && {
                      opacity: 0.4,
                    },
                  ]}
                >
                  <Text style={styles.qtyBtnText}>+</Text>
                </Pressable>
              </View>
            </>
          )}
        </View>

        <TextInput
          value={prompt}
          onChangeText={setPrompt}
          placeholder={
            mode === "image" ? t("describeImage") : t("describeVideo")
          }
          placeholderTextColor="#3f3f46"
          multiline
          style={styles.promptInput}
          blurOnSubmit={false}
        />

        <View style={styles.footerRow}>
          <Pressable
            onPress={() => setShowCreditsPopup(true)}
            style={styles.creditsBtn}
          >
            <Text style={styles.creditsCost}>
              {creditsCost.toLocaleString()}
            </Text>
            <Text style={styles.creditsSep}>/</Text>
            <Text style={styles.creditsAvailable}>
              {userCredits.toLocaleString()}
            </Text>
            <Text style={styles.creditsLabel}>{t("creditsLabel")}</Text>
            <Info size={12} color="#52525b" />
          </Pressable>

          <Pressable
            onPress={handleSubmit}
            disabled={(!prompt.trim() && !needsUpgrade) || isGenerating}
            style={[
              styles.submitBtn,
              ((!prompt.trim() && !needsUpgrade) || isGenerating) && {
                opacity: 0.4,
              },
            ]}
          >
            {isGenerating ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : needsUpgrade ? (
              <Lock size={14} color="#fff" />
            ) : (
              <ArrowUp size={14} color="#fff" />
            )}
          </Pressable>
        </View>
      </View>
      */}

      {/* Credits popup */}
      <Modal
        visible={showCreditsPopup}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCreditsPopup(false)}
      >
        <Pressable
          style={styles.dropdownBackdrop}
          onPress={() => setShowCreditsPopup(false)}
        >
          <View style={styles.creditsPopup}>
            <View style={styles.creditsPopupRow}>
              <Text style={styles.creditsPopupMuted}>
                {mode === "image" ? t("imageMode") : t("videoMode")}
              </Text>
            </View>
            {mode === "image" &&
              AI_IMAGE_MODELS[selectedImageModelId]?.perExtraReference !==
                undefined &&
              images.length > 0 &&
              (() => {
                const m = AI_IMAGE_MODELS[selectedImageModelId];
                const refCost =
                  m.perExtraReference! * images.length * numImages;
                const baseCost = m.baseCredits * numImages;
                return (
                  <>
                    <View style={styles.creditsPopupRow}>
                      <Text style={styles.creditsPopupMuted}>Base</Text>
                      <Text style={styles.creditsPopupVal}>{baseCost}</Text>
                    </View>
                    <View style={styles.creditsPopupRow}>
                      <Text style={styles.creditsPopupMuted}>
                        References (×{images.length})
                      </Text>
                      <Text
                        style={[styles.creditsPopupVal, { color: "#f472b6" }]}
                      >
                        +{refCost}
                      </Text>
                    </View>
                  </>
                );
              })()}
            <View style={[styles.creditsPopupRow, styles.creditsPopupTotal]}>
              <Text style={styles.creditsPopupTotalLabel}>{t("total")}:</Text>
              <View style={{ flexDirection: "row", gap: 2 }}>
                <Text
                  style={{ color: "#ec4899", fontWeight: "600", fontSize: 12 }}
                >
                  {creditsCost.toLocaleString()}
                </Text>
                <Text style={{ color: "#a1a1aa", fontSize: 12 }}>/</Text>
                <Text
                  style={{ color: "#4ade80", fontWeight: "600", fontSize: 12 }}
                >
                  {userCredits.toLocaleString()}
                </Text>
                <Text style={{ color: "#a1a1aa", fontSize: 12 }}>
                  {" "}
                  {t("creditsLabel")}
                </Text>
              </View>
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* Model picker */}
      <ModelDropdown
        isOpen={showModelPicker}
        onClose={() => setShowModelPicker(false)}
        selectedModelId={selectedModelId}
        onSelectModel={setSelectedModelId}
        models={mode === "image" ? availableImageModels : availableVideoModels}
        isImageMode={mode === "image"}
        t={t}
        getModelDescription={getModelDescription}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    gap: 12,
  },

  // Mode toggle — mirrors `flex items-center gap-1 rounded-full bg-zinc-800/60 p-0.5 border border-zinc-700/50`
  modeToggleRow: {
    alignItems: "center",
  },
  modeToggle: {
    flexDirection: "row",
    backgroundColor: "rgba(39,39,42,0.6)",
    borderRadius: 99,
    padding: 2,
    borderWidth: 1,
    borderColor: "rgba(63,63,70,0.5)",
  },
  modeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 99,
  },
  modeBtnActive: {
    backgroundColor: "#db2777", // pink-600
  },
  modeBtnText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#a1a1aa",
  },
  modeBtnTextActive: {
    color: "#fff",
  },

  // Prompt box — mirrors `rounded-3xl border border-zinc-800/60 bg-zinc-900/80`
  box: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(39,39,42,0.6)",
    backgroundColor: "rgba(24,24,27,0.8)",
    overflow: "hidden",
  },

  // Controls bar — mirrors `flex flex-wrap items-center gap-3 px-4 py-2`
  controlsBar: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  // Image reference button
  iconBtn: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
  },
  iconBtnDashed: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#52525b",
  },

  // Image previews
  previewsRow: {
    flexDirection: "row",
    gap: 6,
  },
  previewWrapper: {
    position: "relative",
  },
  previewImg: {
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#3f3f46",
  },
  previewRemove: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 16,
    height: 16,
    borderRadius: 99,
    backgroundColor: "#27272a",
    alignItems: "center",
    justifyContent: "center",
  },

  // Model trigger — mirrors `flex items-center gap-2 rounded-md bg-zinc-800/60 px-2.5 py-1.5 text-xs`
  modelTrigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(39,39,42,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    maxWidth: 140,
  },
  modelLogoBox: {
    width: 18,
    height: 18,
    borderRadius: 99,
    overflow: "hidden",
    backgroundColor: "#3f3f46",
    alignItems: "center",
    justifyContent: "center",
  },
  modelLogoImg: {
    width: 16,
    height: 16,
  },
  modelTriggerText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#a1a1aa",
    flex: 1,
  },

  // Generic pill button — mirrors `rounded-full bg-zinc-800/60 px-2.5 py-1.5 text-xs`
  pillBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(39,39,42,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 99,
  },
  pillBtnText: {
    fontSize: 11,
    color: "#d4d4d8",
    textTransform: "capitalize",
  },

  // Divider
  dividerV: {
    width: 1,
    height: 16,
    backgroundColor: "rgba(39,39,42,0.5)",
  },

  // Qty counter
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#27272a",
    backgroundColor: "rgba(39,39,42,0.6)",
    overflow: "hidden",
  },
  qtyBtn: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyBtnText: {
    fontSize: 16,
    color: "#a1a1aa",
    fontWeight: "300",
  },
  qtyValue: {
    minWidth: 20,
    textAlign: "center",
    fontSize: 11,
    fontWeight: "600",
    color: "#e4e4e7",
  },

  // Video controls
  imageModeRow: {
    flexDirection: "row",
    backgroundColor: "rgba(39,39,42,0.6)",
    borderRadius: 6,
    padding: 2,
  },
  imageModeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  imageModeBtnActive: {
    backgroundColor: "#db2777",
  },
  imageModeBtnText: {
    fontSize: 10,
    fontWeight: "500",
    color: "#a1a1aa",
  },
  imageModeBtnTextActive: {
    color: "#fff",
  },
  audioRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  audioTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#27272a",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    maxWidth: 100,
  },
  audioTagText: {
    fontSize: 10,
    color: "#d4d4d8",
    flex: 1,
  },
  seedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  seedInput: {
    width: 64,
    backgroundColor: "rgba(39,39,42,0.6)",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 4,
    fontSize: 10,
    color: "#d4d4d8",
    borderWidth: 1,
    borderColor: "transparent",
  },
  seedBtn: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(39,39,42,0.6)",
    borderRadius: 4,
  },
  fixedDuration: {
    fontSize: 10,
    color: "#71717a",
  },

  // Prompt input — mirrors `min-h-[44px] max-h-[200px] px-4 py-4 text-sm`
  promptInput: {
    minHeight: 44,
    maxHeight: 200,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 14,
    color: "#fff",
    lineHeight: 22,
  },

  // Footer row — mirrors `flex items-center justify-end gap-3 px-4 py-2.5 bg-zinc-900/25 rounded-b-3xl`
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "rgba(24,24,27,0.25)",
  },
  creditsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  creditsCost: {
    fontSize: 12,
    fontWeight: "500",
    color: "#ec4899",
  },
  creditsSep: {
    fontSize: 12,
    color: "#a1a1aa",
  },
  creditsAvailable: {
    fontSize: 12,
    fontWeight: "500",
    color: "#4ade80",
  },
  creditsLabel: {
    fontSize: 12,
    color: "#71717a",
  },
  submitBtn: {
    width: 32,
    height: 32,
    borderRadius: 99,
    backgroundColor: "#db2777",
    alignItems: "center",
    justifyContent: "center",
  },

  // Dropdown shared
  dropdownBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  dropdownCard: {
    backgroundColor: "#18181b",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(63,63,70,0.6)",
    minWidth: 192,
    overflow: "hidden",
  },
  dropdownLabel: {
    fontSize: 10,
    color: "#71717a",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dropdownItemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  dropdownItemActive: {
    backgroundColor: "#27272a",
  },
  dropdownItemText: {
    fontSize: 12,
    color: "#a1a1aa",
    textTransform: "capitalize",
    flex: 1,
  },
  dropdownItemTextActive: {
    color: "#fff",
  },
  dropdownItemMono: {
    fontSize: 10,
    color: "#52525b",
    fontVariant: ["tabular-nums"],
  },

  // Credits popup
  creditsPopup: {
    backgroundColor: "#18181b",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#27272a",
    padding: 12,
    minWidth: 208,
    gap: 8,
  },
  creditsPopupRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  creditsPopupMuted: {
    fontSize: 11,
    color: "#a1a1aa",
  },
  creditsPopupVal: {
    fontSize: 11,
    fontWeight: "500",
    color: "#fff",
  },
  creditsPopupTotal: {
    borderTopWidth: 1,
    borderTopColor: "#27272a",
    paddingTop: 8,
    marginTop: 4,
  },
  creditsPopupTotalLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#fff",
  },
});

const dropdownStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: 16,
  },
  panel: {
    backgroundColor: "#18181b",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(63,63,70,0.5)",
    overflow: "hidden",
    maxHeight: "70%",
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#f4f4f5",
  },
  headerSubtitle: {
    fontSize: 11,
    color: "#71717a",
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
  },
  list: {
    padding: 8,
  },
  modelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "transparent",
    marginBottom: 2,
  },
  modelRowSelected: {
    backgroundColor: "rgba(39,39,42,0.8)",
  },
  modelLogoBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(63,63,70,0.6)",
    backgroundColor: "rgba(39,39,42,0.8)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  modelLogo: {
    width: 28,
    height: 28,
    borderRadius: 8,
  },
  modelInfo: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  modelNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  modelName: {
    fontSize: 13,
    fontWeight: "500",
    color: "#e4e4e7",
  },
  badge: {
    borderRadius: 99,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "600",
    color: "#fff",
  },
  modelDesc: {
    fontSize: 11,
    color: "#71717a",
    lineHeight: 16,
  },
  modelCredits: {
    fontSize: 11,
    color: "#ec4899",
  },
});

import { useUser } from "@/src/context/user-context";
import { useTranslations } from "@/src/hooks/useTranslations";
import {
  AI_IMAGE_MODELS,
  AI_QUALITY_MODELS,
  AI_VIDEO_MODELS,
  AIImageModelConfig,
  AIVideoModelConfig,
  AspectRatioImageAI,
  AspectRatioVideoAI,
  getAIImageModelLogo,
  getAIVideoModelLogo,
  ImageModeVideoAI,
  QualityLevel,
  QualityVideoAI,
} from "@/src/types/aiModels";
import type { UserPlan } from "@/src/types/user";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import {
  ArrowUp,
  Check,
  ChevronDown,
  Clock,
  Image as ImageIcon,
  Lock,
  RectangleHorizontal,
  RectangleVertical,
  Shuffle,
  Square,
  Video,
  X,
} from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

// ─── Constants ────────────────────────────────────────────────────────────────

const BACKEND = process.env.EXPO_PUBLIC_TRENDYUU_URL_BACK;
const FAVORITE_IMAGE_MODEL_KEY = "favorite-image-model";
const FAVORITE_VIDEO_MODEL_KEY = "favorite-video-model";

const ASPECT_RATIO_OPTIONS_VIDEO: {
  value: AspectRatioVideoAI;
  label: string;
  Icon: typeof RectangleHorizontal;
}[] = [
  { value: "16:9", label: "16:9", Icon: RectangleHorizontal },
  { value: "9:16", label: "9:16", Icon: RectangleVertical },
  { value: "1:1", label: "1:1", Icon: Square },
];

const ASPECT_RATIO_OPTIONS_IMAGE: {
  value: AspectRatioImageAI;
  label: string;
  Icon: typeof RectangleHorizontal;
}[] = [
  { value: "16:9", label: "16:9", Icon: RectangleHorizontal },
  { value: "9:16", label: "9:16", Icon: RectangleVertical },
  { value: "1:1", label: "1:1", Icon: Square },
  { value: "4:3", label: "4:3", Icon: RectangleHorizontal },
  { value: "3:4", label: "3:4", Icon: RectangleVertical },
];

// ─── Plan helpers ─────────────────────────────────────────────────────────────

const PLAN_HIERARCHY: Record<string, number> = {
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
  return (PLAN_HIERARCHY[userPlan] ?? 0) < (PLAN_HIERARCHY[model.plan] ?? 0);
}

function isVideoModelLocked(
  model: AIVideoModelConfig,
  userPlan: UserPlan,
): boolean {
  if (model.status === "blocked") return true;
  return (PLAN_HIERARCHY[userPlan] ?? 0) < (PLAN_HIERARCHY[model.plan] ?? 0);
}

function getPlanBadgeColor(plan: string): string {
  switch (plan) {
    case "essential":
      return "#ca8a04";
    case "creator":
      return "#16a34a";
    case "agency":
      return "#ec4899";
    default:
      return "#52525b";
  }
}

// ─── Credit helpers ───────────────────────────────────────────────────────────

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
  const bonus = qualityMap ? (qualityMap[quality] ?? 0) : 0;
  return (model.baseCredits + bonus) * qty;
}

function calculateVideoCredits(
  modelId: string,
  duration: number,
  numImages: number,
  hasAudio: boolean,
  userPlan: UserPlan,
): number {
  const model = AI_VIDEO_MODELS[modelId];
  if (!model) return 0;
  let credits = model.baseCredits;
  if (model.duration.type === "slider" && model.duration.min) {
    const eff =
      userPlan === "free" && model.freeLimitations?.forceDuration
        ? model.freeLimitations.forceDuration
        : duration;
    credits = model.baseCredits * eff;
  } else if (model.duration.type === "selection" && model.pricingMap) {
    credits = model.pricingMap[duration] ?? model.baseCredits;
  }
  if (numImages > 0) credits += numImages * (model.images.costPerImage || 0);
  if (hasAudio && model.audio.accepts) credits += model.audio.costPerAudio || 0;
  return Math.round(credits);
}

// ─── Model Picker Sheet ───────────────────────────────────────────────────────

function ModelPickerSheet({
  visible,
  onClose,
  mode,
  selectedId,
  onSelect,
  userPlan,
}: {
  visible: boolean;
  onClose: () => void;
  mode: "image" | "video";
  selectedId: string;
  onSelect: (id: string) => void;
  userPlan: UserPlan;
}) {
  const t = useTranslations("dashboard.HeroDashboard");
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

  const models =
    mode === "image"
      ? Object.values(AI_IMAGE_MODELS).filter((m) => m.status !== "blocked")
      : Object.values(AI_VIDEO_MODELS).filter((m) => m.status !== "blocked");

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable style={pickerStyles.backdrop} onPress={onClose} />
      <Animated.View
        style={[pickerStyles.panel, { transform: [{ translateY: slideAnim }] }]}
      >
        <View style={pickerStyles.handle} />
        <Text style={pickerStyles.title}>
          {mode === "image" ? t("selectImageModel") : t("selectVideoModel")}
        </Text>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ maxHeight: 480 }}
        >
          {models.map((model) => {
            const locked =
              mode === "image"
                ? isImageModelLocked(model as AIImageModelConfig, userPlan)
                : isVideoModelLocked(model as AIVideoModelConfig, userPlan);
            const isSelected = selectedId === model.id;
            const logoUrl =
              mode === "image"
                ? getAIImageModelLogo(model.id)
                : getAIVideoModelLogo(model.id);

            return (
              <Pressable
                key={model.id}
                onPress={() => {
                  if (!locked) {
                    onSelect(model.id);
                    onClose();
                  }
                }}
                style={({ pressed }) => [
                  pickerStyles.item,
                  isSelected && pickerStyles.itemSelected,
                  pressed && !locked && pickerStyles.itemPressed,
                  locked && pickerStyles.itemLocked,
                ]}
              >
                <View style={pickerStyles.logo}>
                  <Image
                    source={{ uri: logoUrl }}
                    style={{ width: 28, height: 28 }}
                    resizeMode="contain"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={pickerStyles.nameRow}>
                    <Text style={pickerStyles.modelName}>{model.name}</Text>
                    {locked && <Lock size={12} color="#eab308" />}
                    <View
                      style={[
                        pickerStyles.planBadge,
                        { backgroundColor: getPlanBadgeColor(model.plan) },
                      ]}
                    >
                      <Text style={pickerStyles.planBadgeText}>
                        {model.plan}
                      </Text>
                    </View>
                  </View>
                  <Text style={pickerStyles.credits}>
                    {model.baseCredits} {t("credits")}
                  </Text>
                </View>
                {isSelected && <Check size={16} color="#ec4899" />}
              </Pressable>
            );
          })}
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

const pickerStyles = StyleSheet.create({
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
    padding: 16,
    paddingBottom: 40,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#3f3f46",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
    marginBottom: 12,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },
  itemSelected: {
    backgroundColor: "rgba(236,72,153,0.08)",
    borderColor: "rgba(236,72,153,0.25)",
  },
  itemPressed: { backgroundColor: "#18181b" },
  itemLocked: { opacity: 0.5 },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#27272a",
    alignItems: "center",
    justifyContent: "center",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  modelName: { fontSize: 13, fontWeight: "500", color: "#e4e4e7" },
  credits: { fontSize: 11, color: "#ec4899", marginTop: 2 },
  planBadge: { borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 },
  planBadgeText: { fontSize: 9, fontWeight: "700", color: "#fff" },
});

// ─── Main Component ───────────────────────────────────────────────────────────

export function HeroDashboard() {
  const t = useTranslations("dashboard.HeroDashboard");
  const { user, currentPlan, userCredits } = useUser();
  const router = useRouter();
  const userPlan = (currentPlan?.toLowerCase() ?? "free") as UserPlan;

  // ── Mode ──────────────────────────────────────────────────────────────────
  const [mode, setMode] = useState<"image" | "video">("image");
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // ── Models ────────────────────────────────────────────────────────────────
  const defaultImageModelId = useMemo(() => {
    const unlocked = Object.values(AI_IMAGE_MODELS).filter(
      (m) => !isImageModelLocked(m, userPlan) && m.status !== "blocked",
    );
    if (!unlocked.length) return Object.keys(AI_IMAGE_MODELS)[0];
    return unlocked.reduce((best, m) =>
      m.baseCredits > best.baseCredits ? m : best,
    ).id;
  }, [userPlan]);

  const defaultVideoModelId = useMemo(() => {
    const unlocked = Object.values(AI_VIDEO_MODELS).filter(
      (m) => !isVideoModelLocked(m, userPlan) && m.status !== "blocked",
    );
    if (!unlocked.length) return Object.keys(AI_VIDEO_MODELS)[0];
    return unlocked.reduce((best, m) =>
      m.baseCredits > best.baseCredits ? m : best,
    ).id;
  }, [userPlan]);

  const [selectedImageModelId, setSelectedImageModelId] =
    useState(defaultImageModelId);
  const [selectedVideoModelId, setSelectedVideoModelId] =
    useState(defaultVideoModelId);
  const [showModelPicker, setShowModelPicker] = useState(false);

  const selectedModelId =
    mode === "image" ? selectedImageModelId : selectedVideoModelId;
  const selectedModel =
    mode === "image"
      ? AI_IMAGE_MODELS[selectedImageModelId]
      : AI_VIDEO_MODELS[selectedVideoModelId];
  const selectedLogoUrl =
    mode === "image"
      ? getAIImageModelLogo(selectedImageModelId)
      : getAIVideoModelLogo(selectedVideoModelId);

  // ── Fetch saved favorites ─────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return;
    async function fetchFavorites() {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) return;
      const headers = { Authorization: `Bearer ${token}` };
      try {
        const [imgRes, vidRes] = await Promise.all([
          fetch(
            `${BACKEND}/api/video/get-user-config/?key=${FAVORITE_IMAGE_MODEL_KEY}`,
            { headers },
          ),
          fetch(
            `${BACKEND}/api/video/get-user-config/?key=${FAVORITE_VIDEO_MODEL_KEY}`,
            { headers },
          ),
        ]);
        if (imgRes.ok) {
          const d = await imgRes.json();
          const id = d?.value?.favorite_image_model;
          if (
            id &&
            AI_IMAGE_MODELS[id] &&
            !isImageModelLocked(AI_IMAGE_MODELS[id], userPlan)
          )
            setSelectedImageModelId(id);
        }
        if (vidRes.ok) {
          const d = await vidRes.json();
          const id = d?.value?.favorite_video_model;
          if (
            id &&
            AI_VIDEO_MODELS[id] &&
            !isVideoModelLocked(AI_VIDEO_MODELS[id], userPlan)
          )
            setSelectedVideoModelId(id);
        }
      } catch {}
    }
    fetchFavorites();
  }, [user?.id]);

  async function saveFavorite(modelId: string) {
    const token = await AsyncStorage.getItem("accessToken");
    if (!token) return;
    const key =
      mode === "image" ? FAVORITE_IMAGE_MODEL_KEY : FAVORITE_VIDEO_MODEL_KEY;
    const valueKey =
      mode === "image" ? "favorite_image_model" : "favorite_video_model";
    fetch(`${BACKEND}/api/video/save-user-config/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ key, value: { [valueKey]: modelId } }),
    }).catch(() => {});
  }

  function handleSelectModel(id: string) {
    if (mode === "image") setSelectedImageModelId(id);
    else setSelectedVideoModelId(id);
    saveFavorite(id);
  }

  // ── Image quality ─────────────────────────────────────────────────────────
  const [quality, setQuality] = useState<QualityLevel>("medium");
  const [showQualityPicker, setShowQualityPicker] = useState(false);
  const hasQuality =
    mode === "image" && !!AI_QUALITY_MODELS[selectedImageModelId];

  // ── Aspect ratio ──────────────────────────────────────────────────────────
  const [aspectRatio, setAspectRatio] = useState<
    AspectRatioImageAI | AspectRatioVideoAI
  >("1:1");
  const [showAspectPicker, setShowAspectPicker] = useState(false);

  const availableAspectRatios = useMemo(() => {
    const model =
      mode === "image"
        ? AI_IMAGE_MODELS[selectedImageModelId]
        : AI_VIDEO_MODELS[selectedVideoModelId];
    const supported = model?.aspectRatios ?? [];
    const all =
      mode === "image"
        ? ASPECT_RATIO_OPTIONS_IMAGE
        : ASPECT_RATIO_OPTIONS_VIDEO;
    return all.filter((o) => supported.includes(o.value));
  }, [mode, selectedImageModelId, selectedVideoModelId]);

  useEffect(() => {
    if (
      availableAspectRatios.length &&
      !availableAspectRatios.find((o) => o.value === aspectRatio)
    ) {
      setAspectRatio(availableAspectRatios[0].value);
    }
  }, [availableAspectRatios]);

  const AspectIcon =
    availableAspectRatios.find((o) => o.value === aspectRatio)?.Icon ?? Square;

  // ── Num images ────────────────────────────────────────────────────────────
  const [numImages, setNumImages] = useState(1);
  const maxImages =
    AI_IMAGE_MODELS[selectedImageModelId]?.max_generation_images ?? 1;

  // ── Reference images ──────────────────────────────────────────────────────
  const supportsRef =
    mode === "image" &&
    !!AI_IMAGE_MODELS[selectedImageModelId]?.supportsReferenceImage;
  const [refImages, setRefImages] = useState<string[]>([]); // local URIs

  async function pickRefImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      const uris = result.assets.map((a) => a.uri);
      const maxRef =
        AI_IMAGE_MODELS[selectedImageModelId]?.max_generation_images ?? 1;
      setRefImages((prev) => [...prev, ...uris].slice(0, maxRef));
    }
  }

  useEffect(() => {
    if (!supportsRef) setRefImages([]);
  }, [supportsRef]);

  // ── Video controls ────────────────────────────────────────────────────────
  const videoModel = AI_VIDEO_MODELS[selectedVideoModelId];
  const [duration, setDuration] = useState(5);
  const [videoQuality, setVideoQuality] = useState<QualityVideoAI>("720p");
  const [imageMode, setImageMode] = useState<ImageModeVideoAI>("reference");
  const [seed, setSeed] = useState("");
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const [showVideoQualityPicker, setShowVideoQualityPicker] = useState(false);

  // ── Credits ───────────────────────────────────────────────────────────────
  const creditsCost = useMemo(() => {
    if (mode === "image")
      return calculateImageCredits(
        selectedImageModelId,
        quality,
        refImages.length,
        numImages,
      );
    return calculateVideoCredits(
      selectedVideoModelId,
      duration,
      refImages.length,
      false,
      userPlan,
    );
  }, [
    mode,
    selectedImageModelId,
    quality,
    numImages,
    refImages.length,
    selectedVideoModelId,
    duration,
    userPlan,
  ]);

  const needsUpgrade = useMemo(() => {
    if (mode === "image")
      return isImageModelLocked(
        AI_IMAGE_MODELS[selectedImageModelId],
        userPlan,
      );
    return isVideoModelLocked(AI_VIDEO_MODELS[selectedVideoModelId], userPlan);
  }, [mode, selectedImageModelId, selectedVideoModelId, userPlan]);

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleSubmit() {
    if (!prompt.trim() || isGenerating || needsUpgrade) return;
    setIsGenerating(true);
    try {
      const config =
        mode === "image"
          ? {
              mode: "image",
              modelId: selectedImageModelId,
              quality,
              aspectRatio,
              numImages,
            }
          : {
              mode: "video",
              modelId: selectedVideoModelId,
              quality: videoQuality,
              aspectRatio,
              duration,
              imageMode,
              seed: seed || undefined,
            };
      await AsyncStorage.setItem("pendingToolPrompt", prompt.trim());
      await AsyncStorage.setItem("pendingHeroConfig", JSON.stringify(config));
      router.push(
        mode === "image"
          ? "/ai-tools/text-to-image"
          : "/ai-tools/text-to-video",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <View style={styles.root}>
      {/* Mode toggle */}
      <View style={styles.modeToggle}>
        {(["image", "video"] as const).map((m) => (
          <Pressable
            key={m}
            onPress={() => setMode(m)}
            style={[styles.modeBtn, mode === m && styles.modeBtnActive]}
          >
            {m === "image" ? (
              <ImageIcon size={14} color={mode === m ? "#fff" : "#71717a"} />
            ) : (
              <Video size={14} color={mode === m ? "#fff" : "#71717a"} />
            )}
            <Text
              style={[
                styles.modeBtnText,
                mode === m && styles.modeBtnTextActive,
              ]}
            >
              {t(`${m}Mode`)}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Main card */}
      <View style={styles.card}>
        {/* Top toolbar */}
        <View style={styles.toolbar}>
          {/* Model picker */}
          <Pressable
            onPress={() => setShowModelPicker(true)}
            style={styles.toolbarChip}
          >
            <Image
              source={{ uri: selectedLogoUrl }}
              style={styles.modelLogo}
              resizeMode="contain"
            />
            <Text style={styles.toolbarChipText} numberOfLines={1}>
              {selectedModel?.name}
            </Text>
            <ChevronDown size={12} color="#71717a" />
          </Pressable>

          <View style={{ flex: 1 }} />

          {/* Aspect ratio */}
          {availableAspectRatios.length > 0 && (
            <Pressable
              onPress={() => setShowAspectPicker(true)}
              style={styles.toolbarChip}
            >
              <AspectIcon size={13} color="#a1a1aa" />
              <Text style={styles.toolbarChipText}>{aspectRatio}</Text>
              <ChevronDown size={12} color="#71717a" />
            </Pressable>
          )}

          {/* Quality (image only) */}
          {hasQuality && (
            <Pressable
              onPress={() => setShowQualityPicker(true)}
              style={styles.toolbarChip}
            >
              <Text style={styles.toolbarChipText}>{quality}</Text>
              <ChevronDown size={12} color="#71717a" />
            </Pressable>
          )}

          {/* Duration (video only, selection type) */}
          {mode === "video" && videoModel?.duration.type === "selection" && (
            <Pressable
              onPress={() => setShowDurationPicker(true)}
              style={styles.toolbarChip}
            >
              <Clock size={12} color="#a1a1aa" />
              <Text style={styles.toolbarChipText}>{duration}s</Text>
              <ChevronDown size={12} color="#71717a" />
            </Pressable>
          )}

          {/* Video quality */}
          {mode === "video" && videoModel?.qualities?.length && (
            <Pressable
              onPress={() => setShowVideoQualityPicker(true)}
              style={styles.toolbarChip}
            >
              <Text style={styles.toolbarChipText}>{videoQuality}</Text>
              <ChevronDown size={12} color="#71717a" />
            </Pressable>
          )}
        </View>

        {/* Duration slider (video only, slider type) */}
        {mode === "video" &&
          videoModel?.duration.type === "slider" &&
          videoModel.duration.min && (
            <View style={styles.sliderRow}>
              <Text style={styles.sliderLabel}>
                {t("duration")}: {duration}s
              </Text>
            </View>
          )}

        {/* Image mode selector (video only) */}
        {mode === "video" && videoModel?.images.type === "mode-selector" && (
          <View style={styles.imageModeRow}>
            {(["reference", "first-last"] as ImageModeVideoAI[]).map((m) => (
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
                  {t(m === "reference" ? "reference" : "firstLast")}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Seed (video only) */}
        {mode === "video" && videoModel?.seed && (
          <View style={styles.seedRow}>
            <TextInput
              value={seed}
              onChangeText={setSeed}
              placeholder={t("seedPlaceholder")}
              placeholderTextColor="#52525b"
              style={styles.seedInput}
              keyboardType="numeric"
            />
            <Pressable
              onPress={() =>
                setSeed(Math.floor(Math.random() * 999999999).toString())
              }
              style={styles.seedBtn}
            >
              <Shuffle size={14} color="#a1a1aa" />
            </Pressable>
          </View>
        )}

        {/* Reference image previews */}
        {supportsRef && refImages.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.refScroll}
          >
            {refImages.map((uri, i) => (
              <View key={i} style={styles.refImageWrap}>
                <Image source={{ uri }} style={styles.refImage} />
                <Pressable
                  onPress={() =>
                    setRefImages((p) => p.filter((_, idx) => idx !== i))
                  }
                  style={styles.refImageRemove}
                >
                  <X size={10} color="#fff" />
                </Pressable>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Prompt textarea */}
        <TextInput
          value={prompt}
          onChangeText={setPrompt}
          placeholder={
            mode === "image" ? t("describeImage") : t("describeVideo")
          }
          placeholderTextColor="#52525b"
          style={styles.textarea}
          multiline
          numberOfLines={3}
        />

        {/* Bottom bar */}
        <View style={styles.bottomBar}>
          {/* Ref image add button */}
          {supportsRef && (
            <Pressable
              onPress={pickRefImage}
              disabled={refImages.length >= maxImages}
              style={styles.iconBtn}
            >
              <ImageIcon
                size={16}
                color={refImages.length >= maxImages ? "#3f3f46" : "#a1a1aa"}
              />
            </Pressable>
          )}

          {/* Num images counter */}
          {mode === "image" && maxImages > 1 && (
            <View style={styles.counter}>
              <Pressable
                onPress={() => setNumImages((n) => Math.max(1, n - 1))}
                style={styles.counterBtn}
              >
                <Text style={styles.counterBtnText}>−</Text>
              </Pressable>
              <Text style={styles.counterValue}>{numImages}</Text>
              <Pressable
                onPress={() => setNumImages((n) => Math.min(maxImages, n + 1))}
                style={styles.counterBtn}
              >
                <Text style={styles.counterBtnText}>+</Text>
              </Pressable>
            </View>
          )}

          <View style={{ flex: 1 }} />

          {/* Credits display */}
          <Text style={styles.credits}>
            <Text style={styles.creditsCost}>
              {creditsCost.toLocaleString("pt-BR")}
            </Text>
            {" / "}
            <Text style={styles.creditsAvailable}>
              {(userCredits ?? 0).toLocaleString("pt-BR")}
            </Text>
            {" cr"}
          </Text>

          {/* Submit */}
          <Pressable
            onPress={handleSubmit}
            disabled={(!prompt.trim() && !needsUpgrade) || isGenerating}
            style={({ pressed }) => [
              styles.submitBtn,
              pressed && { opacity: 0.85 },
              ((!prompt.trim() && !needsUpgrade) || isGenerating) &&
                styles.submitBtnDisabled,
            ]}
          >
            {isGenerating ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : needsUpgrade ? (
              <Lock size={16} color="#fff" />
            ) : (
              <ArrowUp size={16} color="#fff" />
            )}
          </Pressable>
        </View>
      </View>

      {/* ── Pickers ────────────────────────────────────────────────── */}
      <ModelPickerSheet
        visible={showModelPicker}
        onClose={() => setShowModelPicker(false)}
        mode={mode}
        selectedId={selectedModelId}
        onSelect={handleSelectModel}
        userPlan={userPlan}
      />

      {/* Aspect ratio picker */}
      <Modal
        visible={showAspectPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAspectPicker(false)}
      >
        <Pressable
          style={dropStyles.backdrop}
          onPress={() => setShowAspectPicker(false)}
        />
        <View style={dropStyles.panel}>
          <Text style={dropStyles.title}>{t("aspectRatio")}</Text>
          {availableAspectRatios.map((o) => (
            <Pressable
              key={o.value}
              onPress={() => {
                setAspectRatio(o.value);
                setShowAspectPicker(false);
              }}
              style={[
                dropStyles.item,
                aspectRatio === o.value && dropStyles.itemSelected,
              ]}
            >
              <o.Icon
                size={16}
                color={aspectRatio === o.value ? "#ec4899" : "#a1a1aa"}
              />
              <Text
                style={[
                  dropStyles.itemText,
                  aspectRatio === o.value && dropStyles.itemTextSelected,
                ]}
              >
                {o.value}
              </Text>
              {aspectRatio === o.value && <Check size={14} color="#ec4899" />}
            </Pressable>
          ))}
        </View>
      </Modal>

      {/* Quality picker */}
      <Modal
        visible={showQualityPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowQualityPicker(false)}
      >
        <Pressable
          style={dropStyles.backdrop}
          onPress={() => setShowQualityPicker(false)}
        />
        <View style={dropStyles.panel}>
          <Text style={dropStyles.title}>{t("quality")}</Text>
          {(["low", "medium", "high"] as QualityLevel[]).map((q) => (
            <Pressable
              key={q}
              onPress={() => {
                setQuality(q);
                setShowQualityPicker(false);
              }}
              style={[
                dropStyles.item,
                quality === q && dropStyles.itemSelected,
              ]}
            >
              <Text
                style={[
                  dropStyles.itemText,
                  quality === q && dropStyles.itemTextSelected,
                ]}
              >
                {q}
              </Text>
              {quality === q && <Check size={14} color="#ec4899" />}
            </Pressable>
          ))}
        </View>
      </Modal>

      {/* Duration picker */}
      <Modal
        visible={showDurationPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDurationPicker(false)}
      >
        <Pressable
          style={dropStyles.backdrop}
          onPress={() => setShowDurationPicker(false)}
        />
        <View style={dropStyles.panel}>
          <Text style={dropStyles.title}>{t("duration")}</Text>
          {(videoModel?.duration.options ?? []).map((d) => (
            <Pressable
              key={d}
              onPress={() => {
                setDuration(d);
                setShowDurationPicker(false);
              }}
              style={[
                dropStyles.item,
                duration === d && dropStyles.itemSelected,
              ]}
            >
              <Text
                style={[
                  dropStyles.itemText,
                  duration === d && dropStyles.itemTextSelected,
                ]}
              >
                {d}s
              </Text>
              {duration === d && <Check size={14} color="#ec4899" />}
            </Pressable>
          ))}
        </View>
      </Modal>

      {/* Video quality picker */}
      <Modal
        visible={showVideoQualityPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowVideoQualityPicker(false)}
      >
        <Pressable
          style={dropStyles.backdrop}
          onPress={() => setShowVideoQualityPicker(false)}
        />
        <View style={dropStyles.panel}>
          <Text style={dropStyles.title}>{t("quality")}</Text>
          {(videoModel?.qualities ?? []).map((q) => (
            <Pressable
              key={q}
              onPress={() => {
                setVideoQuality(q);
                setShowVideoQualityPicker(false);
              }}
              style={[
                dropStyles.item,
                videoQuality === q && dropStyles.itemSelected,
              ]}
            >
              <Text
                style={[
                  dropStyles.itemText,
                  videoQuality === q && dropStyles.itemTextSelected,
                ]}
              >
                {q}
              </Text>
              {videoQuality === q && <Check size={14} color="#ec4899" />}
            </Pressable>
          ))}
        </View>
      </Modal>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { padding: 16, gap: 12 },

  modeToggle: {
    flexDirection: "row",
    alignSelf: "center",
    backgroundColor: "rgba(24,24,27,0.8)",
    borderRadius: 999,
    padding: 3,
    borderWidth: 1,
    borderColor: "#27272a",
    gap: 2,
  },
  modeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
  },
  modeBtnActive: { backgroundColor: "#ec4899" },
  modeBtnText: { fontSize: 13, fontWeight: "500", color: "#71717a" },
  modeBtnTextActive: { color: "#fff" },

  card: {
    backgroundColor: "#0e0e12",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    overflow: "hidden",
  },

  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  toolbarChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  toolbarChipText: { fontSize: 12, color: "#d4d4d8", fontWeight: "500" },
  modelLogo: { width: 16, height: 16 },

  sliderRow: { paddingHorizontal: 14, paddingVertical: 8 },
  sliderLabel: { fontSize: 12, color: "#71717a" },

  imageModeRow: {
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 14,
    paddingBottom: 8,
  },
  imageModeBtn: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  imageModeBtnActive: { backgroundColor: "#ec4899" },
  imageModeBtn_text: { fontSize: 11, color: "#71717a" },
  imageModeBtnText: { fontSize: 11, color: "#71717a" },
  imageModeBtnTextActive: { color: "#fff" },

  seedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingBottom: 8,
  },
  seedInput: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    color: "#d4d4d8",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  seedBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },

  refScroll: { paddingHorizontal: 14, paddingBottom: 8 },
  refImageWrap: { marginRight: 8 },
  refImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#27272a",
  },
  refImageRemove: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#3f3f46",
    alignItems: "center",
    justifyContent: "center",
  },

  textarea: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 14,
    color: "#fff",
    minHeight: 80,
    textAlignVertical: "top",
    lineHeight: 22,
  },

  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },

  counter: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#27272a",
  },
  counterBtn: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  counterBtnText: { color: "#a1a1aa", fontSize: 16 },
  counterValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
    paddingHorizontal: 4,
  },

  credits: { fontSize: 12, color: "#71717a" },
  creditsCost: { color: "#ec4899", fontWeight: "600" },
  creditsAvailable: { color: "#22c55e", fontWeight: "600" },

  submitBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ec4899",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#ec4899",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  submitBtnDisabled: { opacity: 0.4, shadowOpacity: 0 },
});

const dropStyles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  panel: {
    position: "absolute",
    top: "30%",
    left: "10%",
    right: "10%",
    backgroundColor: "#0e0e12",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#27272a",
    padding: 8,
  },
  title: {
    fontSize: 12,
    fontWeight: "600",
    color: "#71717a",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  itemSelected: { backgroundColor: "rgba(236,72,153,0.1)" },
  itemText: { flex: 1, fontSize: 14, color: "#d4d4d8" },
  itemTextSelected: { color: "#ec4899", fontWeight: "600" },
});

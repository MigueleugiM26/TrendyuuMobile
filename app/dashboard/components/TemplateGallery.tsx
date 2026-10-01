import { useUser } from "@/src/context/user-context";
import { Translator, useTranslations } from "@/src/hooks/useTranslations";
import {
  AI_IMAGE_MODELS,
  AIImageModelConfig,
  AIModelPlan,
  AspectRatioImageAI,
  getAIImageModelLogo,
} from "@/src/types/aiModels";
import { PLAN_HIERARCHY, UserPlan } from "@/src/types/user";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import {
  CheckCircle,
  Eye,
  Heart,
  Info,
  Lock,
  PenLine,
  RotateCcw,
  Send,
  Share2,
  Tag,
  Upload,
  X,
} from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  CANVAS_TEMPLATES,
  TEMPLATE_CATEGORIES,
  type CanvasTemplate,
} from "../types/templates";

// ─── Types ────────────────────────────────────────────────────────────────────

type EditTarget = "personagem" | "fundo" | "texto" | "estilo" | "cores";
type InputKind = "text" | "image";

interface EditParam {
  id: EditTarget;
  label: string;
  kind: InputKind;
  description: string;
  placeholder: string;
  sendLabel: string;
}

interface ParamState {
  textValue: string;
  imageUri: string | null;
}

function isModelLocked(model: AIImageModelConfig, userPlan: UserPlan): boolean {
  if (model.status === "blocked") return true;
  return PLAN_HIERARCHY[userPlan] < PLAN_HIERARCHY[model.plan as UserPlan];
}

function getPlanBadgeColor(plan: AIModelPlan): string {
  switch (plan) {
    case "free":
      return "#52525b";
    case "essential":
      return "#854d0e";
    case "creator":
      return "#166534";
    case "agency":
      return "#ec4899";
    default:
      return "#52525b";
  }
}

function emptyParamState(): ParamState {
  return { textValue: "", imageUri: null };
}

function isParamFilled(ps: ParamState, kind: InputKind): boolean {
  if (kind === "text") return ps.textValue.trim().length > 0;
  return ps.imageUri !== null;
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const SHUFFLED_TEMPLATES = shuffleArray(CANVAS_TEMPLATES);

// ─── Verified Badge ───────────────────────────────────────────────────────────

function VerifiedBadge({ size = 12, src }: { size?: number; src?: string }) {
  const uri =
    src || "https://cdn-frontend.trendyuu.com/public/brands/verificado.webp";
  return (
    <Image
      source={{ uri }}
      style={{ width: size, height: size }}
      resizeMode="contain"
    />
  );
}

// ─── AI Prompt Customizer ─────────────────────────────────────────────────────

function AIPromptCustomizer({
  template,
  t,
}: {
  template: CanvasTemplate;
  t: Translator;
}) {
  const { userCredits, currentPlan } = useUser();
  const router = useRouter();
  const userPlan = (currentPlan?.toLowerCase() || "free") as UserPlan;

  const EDIT_PARAMS: EditParam[] = useMemo(
    () => [
      {
        id: "personagem",
        label: t("editParams.personagem.label"),
        kind: "image",
        description: t("editParams.personagem.description"),
        placeholder: t("editParams.personagem.placeholder"),
        sendLabel: t("editParams.personagem.sendLabel"),
      },
      {
        id: "fundo",
        label: t("editParams.fundo.label"),
        kind: "text",
        description: t("editParams.fundo.description"),
        placeholder: t("editParams.fundo.placeholder"),
        sendLabel: t("editParams.fundo.sendLabel"),
      },
      {
        id: "texto",
        label: t("editParams.texto.label"),
        kind: "text",
        description: t("editParams.texto.description"),
        placeholder: t("editParams.texto.placeholder"),
        sendLabel: t("editParams.texto.sendLabel"),
      },
      {
        id: "estilo",
        label: t("editParams.estilo.label"),
        kind: "text",
        description: t("editParams.estilo.description"),
        placeholder: t("editParams.estilo.placeholder"),
        sendLabel: t("editParams.estilo.sendLabel"),
      },
      {
        id: "cores",
        label: t("editParams.cores.label"),
        kind: "text",
        description: t("editParams.cores.description"),
        placeholder: t("editParams.cores.placeholder"),
        sendLabel: t("editParams.cores.sendLabel"),
      },
    ],
    [t],
  );

  const FAVORITE_MODEL_CONFIG_KEY = "favorite-image-model";

  const getDefaultModel = (plan: UserPlan): string => {
    const unlocked = Object.values(AI_IMAGE_MODELS).filter(
      (m) => !isModelLocked(m, plan) && m.status !== "blocked",
    );
    if (!unlocked.length) return Object.values(AI_IMAGE_MODELS)[0].id;
    return unlocked.reduce((best, m) =>
      m.baseCredits > best.baseCredits ? m : best,
    ).id;
  };

  async function fetchFavoriteModel(
    defaultId: string,
    plan: UserPlan,
  ): Promise<string> {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) return defaultId;
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_TRENDYUU_URL_BACK}/api/video/get-user-config/?key=${FAVORITE_MODEL_CONFIG_KEY}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!res.ok) return defaultId;
      const data = await res.json();
      const savedId: string | undefined = data?.value?.favorite_image_model;
      if (!savedId) return defaultId;
      const model = AI_IMAGE_MODELS[savedId];
      if (!model || model.status === "blocked" || isModelLocked(model, plan))
        return defaultId;
      return savedId;
    } catch {
      return defaultId;
    }
  }

  async function saveFavoriteModel(modelId: string): Promise<void> {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) return;
      await fetch(
        `${process.env.EXPO_PUBLIC_TRENDYUU_URL_BACK}/api/video/save-user-config/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            key: FAVORITE_MODEL_CONFIG_KEY,
            value: { favorite_image_model: modelId },
          }),
        },
      );
    } catch (err) {
      console.error("Failed to save favorite image model:", err);
    }
  }

  const [selectedTarget, setSelectedTarget] = useState<EditTarget>("estilo");
  const [paramStates, setParamStates] = useState<
    Record<EditTarget, ParamState>
  >(
    () =>
      Object.fromEntries(
        EDIT_PARAMS.map((p) => [p.id, emptyParamState()]),
      ) as Record<EditTarget, ParamState>,
  );
  const [selectedModelId, setSelectedModelId] = useState(() =>
    getDefaultModel(userPlan),
  );
  const [aspectRatio, setAspectRatio] = useState<AspectRatioImageAI>(
    (template.aspectRatio as AspectRatioImageAI) ?? "9:16",
  );
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showCreditsPopup, setShowCreditsPopup] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);

  useEffect(() => {
    const defaultId = getDefaultModel(userPlan);
    fetchFavoriteModel(defaultId, userPlan).then(setSelectedModelId);
  }, [userPlan]);

  const selectedModel = AI_IMAGE_MODELS[selectedModelId];
  const locked = isModelLocked(selectedModel, userPlan);
  const credits = selectedModel?.baseCredits ?? 0;
  const currentParam = EDIT_PARAMS.find((p) => p.id === selectedTarget)!;
  const currentState = paramStates[selectedTarget];
  const availableRatios = selectedModel?.aspectRatios ?? [
    "16:9",
    "9:16",
    "1:1",
  ];

  const updateParamState = (target: EditTarget, patch: Partial<ParamState>) => {
    setParamStates((prev) => ({
      ...prev,
      [target]: { ...prev[target], ...patch },
    }));
  };

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      updateParamState(selectedTarget, { imageUri: result.assets[0].uri });
    }
  };

  const buildPrompt = useMemo(() => {
    const changes: string[] = [];
    if (paramStates.personagem.imageUri)
      changes.push(
        "Replace the main character / person with the uploaded reference image (keep exact pose, lighting and style from the template)",
      );
    if (paramStates.fundo.textValue.trim())
      changes.push(
        `Change the background / scene to: "${paramStates.fundo.textValue}"`,
      );
    if (paramStates.texto.textValue.trim())
      changes.push(
        `Replace all visible text in the image with: "${paramStates.texto.textValue}" (keep same font, size and position)`,
      );
    if (paramStates.estilo.textValue.trim())
      changes.push(
        `Apply this exact artistic style to the entire image: ${paramStates.estilo.textValue}`,
      );
    if (paramStates.cores.textValue.trim())
      changes.push(
        `Change the color palette of the whole image to: ${paramStates.cores.textValue}`,
      );
    if (changes.length === 0)
      return "No changes requested. Return the original template image unchanged.";
    return `You are an expert image editor.\n\nEdit ONLY the provided template image by applying these exact changes:\n\n${changes.map((c, i) => `${i + 1}. ${c}`).join("\n")}\n\n- Keep the original composition, layout, lighting, and proportions.\n- Do not add new elements or remove anything unless specified.\n- Output only the final edited image in the chosen aspect ratio.`;
  }, [paramStates]);

  const hasAnyFilled = useMemo(
    () =>
      EDIT_PARAMS.some((param) =>
        isParamFilled(paramStates[param.id], param.kind),
      ),
    [paramStates, EDIT_PARAMS],
  );

  const handleSend = useCallback(async () => {
    if (!hasAnyFilled || locked) return;
    // Store template for canvas-studio
    // On RN: use AsyncStorage instead of sessionStorage
    await AsyncStorage.setItem(
      "pendingCanvasTemplate",
      JSON.stringify({
        id: template.id,
        name: template.name,
        baseImageUrl: template.baseImageUrl,
        layers: template.layers,
        settings: template.settings,
        aspectRatio: template.aspectRatio,
        width: template.width,
        height: template.height,
      }),
    );
    const hasPersonagem = paramStates.personagem.imageUri !== null;
    const hasTextPrompt = [
      paramStates.fundo.textValue,
      paramStates.texto.textValue,
      paramStates.estilo.textValue,
      paramStates.cores.textValue,
    ].some((v) => v.trim().length > 0);
    if (hasPersonagem || hasTextPrompt) {
      await AsyncStorage.setItem(
        "pendingCanvasSetup",
        JSON.stringify({
          templateImageUrl: template.baseImageUrl,
          personagemPreview: paramStates.personagem.imageUri ?? null,
          prompt: buildPrompt,
          model: selectedModelId,
          aspectRatio,
        }),
      );
    }
    router.push("/ai-tools/canvas-studio" as any);
  }, [
    hasAnyFilled,
    locked,
    paramStates,
    buildPrompt,
    template,
    selectedModelId,
    aspectRatio,
    router,
  ]);

  return (
    <View style={aiStyles.root}>
      <Text style={aiStyles.sectionLabel}>{t("personalizeWithAI")}</Text>

      {/* Tab grid — mirrors `grid grid-cols-3 gap-1.5` */}
      <View style={aiStyles.tabGrid}>
        {EDIT_PARAMS.map((param) => {
          const ps = paramStates[param.id];
          const filled = isParamFilled(ps, param.kind);
          const isSelected = selectedTarget === param.id;
          return (
            <Pressable
              key={param.id}
              onPress={() => setSelectedTarget(param.id)}
              style={[
                aiStyles.tab,
                isSelected && filled && aiStyles.tabSelectedFilled,
                isSelected && !filled && aiStyles.tabSelected,
                !isSelected && filled && aiStyles.tabFilledOnly,
                !isSelected && !filled && aiStyles.tabDefault,
              ]}
            >
              {filled && <View style={aiStyles.filledDot} />}
              <Text
                style={[
                  aiStyles.tabLabel,
                  isSelected && aiStyles.tabLabelActive,
                ]}
              >
                {param.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Input box */}
      <View style={aiStyles.inputBox}>
        {/* Header row */}
        <View style={aiStyles.inputHeader}>
          <Text style={aiStyles.inputParamLabel}>{currentParam.label}</Text>
          <View
            style={[
              aiStyles.kindBadge,
              currentParam.kind === "image"
                ? aiStyles.kindBadgeImage
                : aiStyles.kindBadgeText,
            ]}
          >
            <Text
              style={[
                aiStyles.kindBadgeLabel,
                currentParam.kind === "image"
                  ? aiStyles.kindTextImage
                  : aiStyles.kindTextText,
              ]}
            >
              {currentParam.kind === "image" ? t("upload") : t("text")}
            </Text>
          </View>
        </View>
        <Text style={aiStyles.inputDescription}>
          {currentParam.description}
        </Text>

        {currentParam.kind === "text" ? (
          <TextInput
            value={currentState.textValue}
            onChangeText={(v) =>
              updateParamState(selectedTarget, { textValue: v })
            }
            placeholder={currentParam.placeholder}
            placeholderTextColor="#3f3f46"
            multiline
            numberOfLines={2}
            style={aiStyles.textInput}
          />
        ) : currentState.imageUri ? (
          <View style={aiStyles.imagePreviewWrapper}>
            <Image
              source={{ uri: currentState.imageUri }}
              style={aiStyles.imagePreview}
              resizeMode="cover"
            />
            <Pressable
              onPress={() =>
                updateParamState(selectedTarget, { imageUri: null })
              }
              style={aiStyles.removeImageBtn}
            >
              <X size={12} color="#d4d4d8" />
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={handleImagePick} style={aiStyles.uploadBtn}>
            <Upload size={14} color="#71717a" />
            <Text style={aiStyles.uploadBtnText}>
              {currentParam.placeholder}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Send section */}
      <View style={aiStyles.sendSection}>
        <View style={aiStyles.sendRow}>
          {/* Model selector */}
          <Pressable
            onPress={() => setShowModelDropdown((v) => !v)}
            style={aiStyles.modelBtn}
          >
            <Image
              source={{ uri: getAIImageModelLogo(selectedModelId) }}
              style={aiStyles.modelLogo}
              resizeMode="contain"
            />
            <Text style={aiStyles.modelName}>{selectedModel?.name}</Text>
            {locked && <Lock size={12} color="#52525b" />}
            <View
              style={[
                aiStyles.planBadge,
                { backgroundColor: getPlanBadgeColor(selectedModel?.plan) },
              ]}
            >
              <Text style={aiStyles.planBadgeText}>{selectedModel?.plan}</Text>
            </View>
          </Pressable>

          {/* Credits info */}
          <Pressable
            onPress={() => setShowCreditsPopup((v) => !v)}
            style={aiStyles.creditsBtn}
          >
            <Info size={12} color="#52525b" />
            <Text style={aiStyles.creditsBtnText}>
              {t("creditsLabel", { credits })}
            </Text>
          </Pressable>

          {/* Send */}
          <Pressable
            onPress={handleSend}
            disabled={!hasAnyFilled || locked}
            style={[
              aiStyles.sendBtn,
              hasAnyFilled && !locked
                ? aiStyles.sendBtnActive
                : aiStyles.sendBtnDisabled,
            ]}
          >
            <Send
              size={14}
              color={hasAnyFilled && !locked ? "#fff" : "#52525b"}
            />
          </Pressable>
        </View>

        {/* Aspect ratio */}
        <View style={aiStyles.ratioRow}>
          <Text style={aiStyles.ratioLabel}>{t("proportion")}</Text>
          <View style={aiStyles.ratioOptions}>
            {availableRatios.map((ratio) => (
              <Pressable
                key={ratio}
                onPress={() => setAspectRatio(ratio)}
                style={[
                  aiStyles.ratioPill,
                  aspectRatio === ratio && aiStyles.ratioPillActive,
                ]}
              >
                <Text
                  style={[
                    aiStyles.ratioPillText,
                    aspectRatio === ratio && aiStyles.ratioPillTextActive,
                  ]}
                >
                  {ratio}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      {/* Model dropdown modal */}
      <Modal
        visible={showModelDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModelDropdown(false)}
      >
        <Pressable
          style={aiStyles.dropdownBackdrop}
          onPress={() => setShowModelDropdown(false)}
        >
          <View style={aiStyles.dropdownCard}>
            {Object.values(AI_IMAGE_MODELS).map((model) => {
              const isLocked = isModelLocked(model, userPlan);
              const isSelected = model.id === selectedModelId;
              return (
                <Pressable
                  key={model.id}
                  onPress={() => {
                    setSelectedModelId(model.id);
                    saveFavoriteModel(model.id);
                    setShowModelDropdown(false);
                  }}
                  style={[
                    aiStyles.dropdownItem,
                    isSelected && aiStyles.dropdownItemSelected,
                    isLocked && { opacity: 0.5 },
                  ]}
                >
                  <Image
                    source={{ uri: getAIImageModelLogo(model.id) }}
                    style={aiStyles.modelLogo}
                    resizeMode="contain"
                  />
                  <Text style={aiStyles.dropdownItemName}>{model.name}</Text>
                  {isLocked && <Lock size={12} color="#52525b" />}
                  <View
                    style={[
                      aiStyles.planBadge,
                      { backgroundColor: getPlanBadgeColor(model.plan) },
                    ]}
                  >
                    <Text style={aiStyles.planBadgeText}>{model.plan}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>

      {/* Credits popup modal */}
      <Modal
        visible={showCreditsPopup}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCreditsPopup(false)}
      >
        <Pressable
          style={aiStyles.dropdownBackdrop}
          onPress={() => setShowCreditsPopup(false)}
        >
          <View style={aiStyles.creditsPopup}>
            <Text style={aiStyles.creditsPopupText}>
              {t("creditsPopup", { credits, userCredits: userCredits ?? 0 })}
            </Text>
          </View>
        </Pressable>
      </Modal>

      {/* View prompt modal */}
      <Pressable
        onPress={() => setShowPromptModal(true)}
        style={aiStyles.viewPromptBtn}
      >
        <Eye size={16} color="#a1a1aa" />
        <Text style={aiStyles.viewPromptText}>{t("viewFullPrompt")}</Text>
      </Pressable>

      <Modal
        visible={showPromptModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPromptModal(false)}
      >
        <Pressable
          style={aiStyles.dropdownBackdrop}
          onPress={() => setShowPromptModal(false)}
        >
          <View style={aiStyles.promptModal}>
            <View style={aiStyles.promptModalHeader}>
              <Text style={aiStyles.promptModalTitle}>
                {t("promptSentToAI")}
              </Text>
              <Pressable onPress={() => setShowPromptModal(false)}>
                <X size={20} color="#a1a1aa" />
              </Pressable>
            </View>
            <ScrollView style={aiStyles.promptScrollView}>
              <Text style={aiStyles.promptText}>{buildPrompt}</Text>
            </ScrollView>
            <Pressable
              onPress={() => setShowPromptModal(false)}
              style={aiStyles.promptCloseBtn}
            >
              <Text style={aiStyles.promptCloseBtnText}>{t("close")}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

// ─── Template Modal ───────────────────────────────────────────────────────────

function TemplateModal({
  template,
  onClose,
  views,
  likes,
  isViewed,
  isLiked,
  onLike,
}: {
  template: CanvasTemplate | null;
  onClose: () => void;
  views: number;
  likes: number;
  isViewed: boolean;
  isLiked: boolean;
  onLike: () => void;
}) {
  const t = useTranslations("dashboard.TemplateGallery");
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!template) return;
    setGeneratedUrl(null);
  }, [template?.id]);

  const openCanvas = useCallback(async () => {
    if (!template) return;
    setIsApplying(true);
    await AsyncStorage.setItem(
      "pendingCanvasTemplate",
      JSON.stringify({
        id: template.id,
        name: template.name,
        baseImageUrl: template.baseImageUrl,
        layers: template.layers,
        settings: template.settings,
        aspectRatio: template.aspectRatio,
        width: template.width,
        height: template.height,
      }),
    );
    router.push("/ai-tools/canvas-studio" as any);
    setIsApplying(false);
  }, [template, router]);

  const handleShare = useCallback(async () => {
    if (!template) return;
    try {
      await Share.share({
        message: `https://trendyuu.com/dashboard?template=${template.id}`,
      });
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch {}
  }, [template]);

  if (!template) return null;

  const templateName =
    template.category === "UserPublic"
      ? template.name
      : t(`templates.${template.id}.name`);
  const templateDescription =
    template.category === "UserPublic"
      ? template.description
      : t(`templates.${template.id}.description`);

  return (
    <Modal
      visible={!!template}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={modalStyles.backdrop} onPress={onClose}>
        {/* Bottom sheet — on mobile the modal is full height, matching web's full-screen modal feel */}
        <Pressable style={modalStyles.sheet} onPress={() => {}}>
          {/* Close */}
          <Pressable onPress={onClose} style={modalStyles.closeBtn}>
            <X size={14} color="#a1a1aa" />
          </Pressable>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Template image */}
            <View style={modalStyles.imageWrapper}>
              <Image
                source={{ uri: generatedUrl ?? template.baseImageUrl }}
                style={modalStyles.templateImage}
                resizeMode="contain"
              />
              {generatedUrl && (
                <Pressable
                  onPress={() => setGeneratedUrl(null)}
                  style={modalStyles.resetBtn}
                >
                  <RotateCcw size={12} color="#a1a1aa" />
                  <Text style={modalStyles.resetBtnText}>Original</Text>
                </Pressable>
              )}
            </View>

            {/* Info */}
            <View style={modalStyles.infoSection}>
              <Text style={modalStyles.templateName}>{templateName}</Text>
              <Text style={modalStyles.templateDesc}>
                {templateDescription}
              </Text>

              {/* Creator */}
              <View style={modalStyles.creatorRow}>
                <Image
                  source={{
                    uri: template.creator.avatar || "/default-avatar.png",
                  }}
                  style={modalStyles.creatorAvatar}
                />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={modalStyles.creatorName} numberOfLines={1}>
                    {template.creator.name}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Text style={modalStyles.creatorHandle} numberOfLines={1}>
                      {template.creator.handle}
                    </Text>
                    <VerifiedBadge
                      size={10}
                      src={template.creator.verifiedBadge}
                    />
                  </View>
                </View>
              </View>

              {/* Tags */}
              <View style={modalStyles.tagsRow}>
                {template.tags.map((tag) => (
                  <View key={tag} style={modalStyles.tag}>
                    <Tag size={10} color="#52525b" />
                    <Text style={modalStyles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>

              {/* Views / Likes (UserPublic only) */}
              {template.category === "UserPublic" && (
                <View style={modalStyles.statsRow}>
                  <View
                    style={[
                      modalStyles.statCard,
                      isViewed && modalStyles.statCardViewed,
                    ]}
                  >
                    <Eye size={16} color={isViewed ? "#3b82f6" : "#a1a1aa"} />
                    <View>
                      <Text style={modalStyles.statCardLabel}>
                        Visualizações
                      </Text>
                      <Text style={modalStyles.statCardValue}>
                        {views.toLocaleString()}
                      </Text>
                    </View>
                  </View>
                  <Pressable
                    onPress={onLike}
                    style={[
                      modalStyles.statCard,
                      isLiked && modalStyles.statCardLiked,
                    ]}
                  >
                    <Heart
                      size={16}
                      color={isLiked ? "#ec4899" : "#a1a1aa"}
                      fill={isLiked ? "#ec4899" : "none"}
                    />
                    <View>
                      <Text style={modalStyles.statCardLabel}>Curtidas</Text>
                      <Text style={modalStyles.statCardValue}>
                        {likes.toLocaleString()}
                      </Text>
                    </View>
                  </Pressable>
                </View>
              )}
            </View>

            <View style={modalStyles.divider} />

            {/* AI Prompt Customizer */}
            <View style={modalStyles.aiSection}>
              <AIPromptCustomizer template={template} t={t} />
            </View>
          </ScrollView>

          {/* Footer actions */}
          <View style={modalStyles.footer}>
            {/* Save */}
            <Pressable
              onPress={() => setSaved((v) => !v)}
              style={[
                modalStyles.iconActionBtn,
                saved && modalStyles.iconActionBtnSaved,
              ]}
            >
              <Heart
                size={16}
                color={saved ? "#f472b6" : "#71717a"}
                fill={saved ? "#f472b6" : "none"}
              />
            </Pressable>

            {/* Share */}
            <Pressable
              onPress={handleShare}
              style={[
                modalStyles.iconActionBtn,
                shareCopied && modalStyles.iconActionBtnShared,
              ]}
            >
              {shareCopied ? (
                <CheckCircle size={16} color="#4ade80" />
              ) : (
                <Share2 size={16} color="#71717a" />
              )}
            </Pressable>

            {/* Open in Canvas */}
            <Pressable
              onPress={openCanvas}
              disabled={isApplying}
              style={[
                modalStyles.openCanvasBtn,
                isApplying && { opacity: 0.4 },
              ]}
            >
              {isApplying ? (
                <ActivityIndicator size="small" color="#a1a1aa" />
              ) : (
                <PenLine size={14} color="#a1a1aa" />
              )}
              <Text style={modalStyles.openCanvasBtnText}>
                {t("openInCanvas")}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Pagination constants ─────────────────────────────────────────────────────

const INITIAL_LOAD_SIZE = 12;
const PAGE_SIZE = 12;
const R2_TEMPLATES = "https://pub-2c4c0866f48e4f24bb5d6a99ce9007ef.r2.dev";
const COLUMNS = 2; // mobile is always 2 columns

// ─── Template Gallery Section ─────────────────────────────────────────────────

interface TemplateGallerySectionProps {
  scrollContainerRef: React.RefObject<ScrollView | null>;
}

export function TemplateGallerySection({
  scrollContainerRef,
}: TemplateGallerySectionProps) {
  const t = useTranslations("dashboard.TemplateGallery");
  const { totalTemplateData, refreshVideoData } = useUser();

  const likedTemplates = useMemo(
    () => new Set(totalTemplateData?.liked_templates || []),
    [totalTemplateData],
  );
  const viewedTemplates = useMemo(
    () => new Set(totalTemplateData?.viewed_templates || []),
    [totalTemplateData],
  );

  const [activeCategory, setActiveCategory] = useState<string>("Todos");
  const [selectedTemplate, setSelectedTemplate] =
    useState<CanvasTemplate | null>(null);
  const [allTemplates, setAllTemplates] = useState<CanvasTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [visibleTemplates, setVisibleTemplates] = useState<CanvasTemplate[]>(
    [],
  );
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const isLoadingMoreRef = useRef(false);
  const loadedCountRef = useRef(0);
  const [userTemplates] = useState<CanvasTemplate[]>([]);

  const BASE_URL = process.env.EXPO_PUBLIC_TRENDYUU_URL_BACK;

  const fetchUserTemplates = useCallback(async () => {
    try {
      setIsLoadingTemplates(true);
      const res = await fetch(`${BASE_URL}/api/imagens/get-user-template/`);
      if (!res.ok) return;
      const data = await res.json();
      const formatted: CanvasTemplate[] = data.templates.map((t: any) => ({
        id: t.id,
        kind: "prompt" as const,
        name: t.name,
        description: t.description || "Template público",
        category: "UserPublic" as const,
        tags: t.tags || [],
        baseImageUrl: t.baseImageUrl
          ? `${R2_TEMPLATES}/${t.baseImageUrl}`.replace(/([^:])\/\/+/g, "$1/")
          : "",
        aiPrompt: t.ai_prompt || "",
        aspectRatio: t.aspect_ratio || "1:1",
        width: 1024,
        height: 1024,
        layers: [],
        views: t.views || 0,
        likes: t.likes || 0,
        creator: {
          name: t.uploader?.name || "Usuário",
          handle: t.uploader?.handle || "@user",
          avatar: t.uploader?.avatar || "/default-avatar.png",
          verifiedBadge: undefined,
        },
        settings: {
          brightness: 100,
          contrast: 100,
          saturation: 100,
          blur: 0,
          hueRotate: 0,
          grayscale: 0,
          sepia: 0,
        },
      }));
      setAllTemplates(shuffleArray([...SHUFFLED_TEMPLATES, ...formatted]));
    } catch (err) {
      console.error("Failed to fetch user templates:", err);
      setAllTemplates(shuffleArray(SHUFFLED_TEMPLATES));
    } finally {
      setIsLoadingTemplates(false);
    }
  }, [BASE_URL]);

  useEffect(() => {
    fetchUserTemplates();
  }, [fetchUserTemplates]);

  const registerTemplateView = useCallback(
    async (templateId: string) => {
      const token = await AsyncStorage.getItem("accessToken");
      const currentlyViewed = viewedTemplates.has(templateId);
      try {
        await fetch(`${BASE_URL}/api/imagens/add-view-template/${templateId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!currentlyViewed) {
          setAllTemplates((prev) =>
            prev.map((t) =>
              t.id === templateId ? { ...t, views: (t.views ?? 0) + 1 } : t,
            ),
          );
          setSelectedTemplate((prev) =>
            prev && prev.id === templateId
              ? { ...prev, views: (prev.views ?? 0) + 1 }
              : prev,
          );
        }
        await refreshVideoData?.();
      } catch (err) {
        console.error("Failed to register view:", err);
      }
    },
    [BASE_URL, refreshVideoData, viewedTemplates],
  );

  const handleTemplateLike = useCallback(
    async (templateId: string) => {
      const token = await AsyncStorage.getItem("accessToken");
      const currentlyLiked = likedTemplates.has(templateId);
      try {
        await fetch(`${BASE_URL}/api/imagens/add-like-template/${templateId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const delta = currentlyLiked ? -1 : 1;
        setAllTemplates((prev) =>
          prev.map((t) =>
            t.id === templateId ? { ...t, likes: (t.likes ?? 0) + delta } : t,
          ),
        );
        setSelectedTemplate((prev) =>
          prev && prev.id === templateId
            ? { ...prev, likes: (prev.likes ?? 0) + delta }
            : prev,
        );
        await refreshVideoData?.();
      } catch (err) {
        console.error("Failed to toggle like:", err);
      }
    },
    [BASE_URL, refreshVideoData, likedTemplates],
  );

  const getFilteredTemplates = useCallback(() => {
    if (activeCategory === "Todos") return allTemplates;
    if (activeCategory === "UserPublic")
      return allTemplates.filter((t) => t.category === "UserPublic");
    return allTemplates.filter((t) => t.category === activeCategory);
  }, [activeCategory, allTemplates]);

  const fetchBatch = useCallback(
    (offset: number, limit: number) => {
      const all = getFilteredTemplates();
      const batch = all.slice(offset, offset + limit);
      return { batch, hasMore: offset + batch.length < all.length };
    },
    [getFilteredTemplates],
  );

  useEffect(() => {
    const { batch, hasMore: more } = fetchBatch(0, INITIAL_LOAD_SIZE);
    setVisibleTemplates(batch);
    loadedCountRef.current = batch.length;
    setHasMore(more);
  }, [fetchBatch]);

  const loadMoreTemplates = useCallback(() => {
    if (!hasMore || isLoadingMoreRef.current) return;
    isLoadingMoreRef.current = true;
    setIsLoadingMore(true);
    setTimeout(() => {
      const { batch, hasMore: more } = fetchBatch(
        loadedCountRef.current,
        PAGE_SIZE,
      );
      setVisibleTemplates((prev) => {
        const existingIds = new Set(prev.map((t) => t.id));
        return [...prev, ...batch.filter((t) => !existingIds.has(t.id))];
      });
      loadedCountRef.current += batch.length;
      setHasMore(more);
      isLoadingMoreRef.current = false;
      setIsLoadingMore(false);
    }, 700);
  }, [hasMore, fetchBatch]);

  const totalFiltered = getFilteredTemplates().length;

  // Build 2-column arrays (mirrors `columnArrays` on web)
  const columnArrays = useMemo(() => {
    const cols: CanvasTemplate[][] = [[], []];
    visibleTemplates.forEach((t, i) => cols[i % COLUMNS].push(t));
    return cols;
  }, [visibleTemplates]);

  const { width: SCREEN_WIDTH } = Dimensions.get("window");
  const CARD_WIDTH = (SCREEN_WIDTH - 12 * 2 - 8) / 2; // 2 cols, gap 8

  return (
    <View style={galleryStyles.section}>
      {/* Section header */}
      <View style={galleryStyles.header}>
        <Text style={galleryStyles.headerTitle}>{t("sectionTitle")}</Text>
        <View style={galleryStyles.headerDivider} />
        <Text style={galleryStyles.headerCount}>
          {t("templateCount", { count: totalFiltered })}
        </Text>
      </View>

      {/* Category filter pills — horizontal scroll, mirrors `flex gap-1.5 overflow-x-auto` */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={galleryStyles.categoryRow}
      >
        {TEMPLATE_CATEGORIES.map((cat) => {
          const active = activeCategory === cat;
          return (
            <Pressable
              key={cat}
              onPress={() => setActiveCategory(cat)}
              style={[
                galleryStyles.categoryPill,
                active && galleryStyles.categoryPillActive,
              ]}
            >
              <Text
                style={[
                  galleryStyles.categoryPillText,
                  active && galleryStyles.categoryPillTextActive,
                ]}
              >
                {t(`categories.${cat}`)}
              </Text>
              {cat === "UserPublic" && userTemplates.length > 0 && (
                <View style={galleryStyles.categoryBadge}>
                  <Text style={galleryStyles.categoryBadgeText}>
                    {userTemplates.length}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Loading spinner */}
      {isLoadingTemplates && (
        <View style={galleryStyles.spinnerWrapper}>
          <ActivityIndicator size="large" color="#f472b6" />
        </View>
      )}

      {/* 2-column masonry grid (mirrors `flex w-full` + `flex-1 flex-col`) */}
      {!isLoadingTemplates && (
        <View style={galleryStyles.grid}>
          {columnArrays.map((col, colIdx) => (
            <View key={colIdx} style={galleryStyles.column}>
              {col.map((template) => (
                <Pressable
                  key={template.id}
                  onPress={() => {
                    setSelectedTemplate(template);
                    if (template.category === "UserPublic")
                      registerTemplateView(template.id);
                  }}
                  style={({ pressed }) => [
                    galleryStyles.card,
                    pressed && galleryStyles.cardPressed,
                  ]}
                >
                  {/* Views / Likes overlay (UserPublic) */}
                  {template.category === "UserPublic" && (
                    <View style={galleryStyles.cardOverlay}>
                      <View style={galleryStyles.cardStat}>
                        <Eye
                          size={12}
                          color={
                            viewedTemplates.has(template.id)
                              ? "#60a5fa"
                              : "#d4d4d8"
                          }
                        />
                        <Text style={galleryStyles.cardStatText}>
                          {(template.views ?? 0).toLocaleString()}
                        </Text>
                      </View>
                      <View style={galleryStyles.cardStat}>
                        <Heart
                          size={12}
                          color={
                            likedTemplates.has(template.id)
                              ? "#ec4899"
                              : "#d4d4d8"
                          }
                          fill={
                            likedTemplates.has(template.id) ? "#ec4899" : "none"
                          }
                        />
                        <Text style={galleryStyles.cardStatText}>
                          {(template.likes ?? 0).toLocaleString()}
                        </Text>
                      </View>
                    </View>
                  )}

                  <Image
                    source={{ uri: template.baseImageUrl }}
                    style={[
                      galleryStyles.cardImage,
                      {
                        width: CARD_WIDTH,
                        height: CARD_WIDTH * (template.height / template.width),
                      },
                    ]}
                    resizeMode="cover"
                  />

                  {/* Creator row — mirrors `flex items-center gap-2.5 bg-zinc-950 px-3 py-2.5` */}
                  <View style={galleryStyles.cardFooter}>
                    <Image
                      source={{
                        uri: template.creator.avatar || "/default-avatar.png",
                      }}
                      style={galleryStyles.creatorAvatar}
                    />
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text
                        style={galleryStyles.cardTemplateName}
                        numberOfLines={1}
                      >
                        {template.category === "UserPublic"
                          ? template.name
                          : t(`templates.${template.id}.name`)}
                      </Text>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 2,
                        }}
                      >
                        <Text
                          style={galleryStyles.cardHandle}
                          numberOfLines={1}
                        >
                          {template.creator.handle}
                        </Text>
                        <VerifiedBadge
                          size={10}
                          src={template.creator.verifiedBadge}
                        />
                      </View>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          ))}
        </View>
      )}

      {/* Load more spinner */}
      {isLoadingMore && (
        <View style={galleryStyles.loadMoreSpinner}>
          <ActivityIndicator size="small" color="#f472b6" />
        </View>
      )}

      {/* End of list */}
      {!hasMore && !isLoadingMore && visibleTemplates.length > 0 && (
        <Text style={galleryStyles.endText}>All templates loaded</Text>
      )}

      {/* Load more trigger button (replaces scroll-based loading) */}
      {hasMore && !isLoadingMore && (
        <Pressable
          onPress={loadMoreTemplates}
          style={galleryStyles.loadMoreBtn}
        >
          <Text style={galleryStyles.loadMoreBtnText}>Carregar mais</Text>
        </Pressable>
      )}

      <TemplateModal
        template={selectedTemplate}
        onClose={() => setSelectedTemplate(null)}
        views={selectedTemplate?.views ?? 0}
        likes={selectedTemplate?.likes ?? 0}
        isViewed={
          selectedTemplate ? viewedTemplates.has(selectedTemplate.id) : false
        }
        isLiked={
          selectedTemplate ? likedTemplates.has(selectedTemplate.id) : false
        }
        onLike={() =>
          selectedTemplate && handleTemplateLike(selectedTemplate.id)
        }
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const aiStyles = StyleSheet.create({
  root: { gap: 0 },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    color: "#52525b",
    marginBottom: 10,
  },
  // Tab grid — mirrors `grid grid-cols-3 gap-1.5`
  tabGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 12 },
  tab: {
    flexBasis: "31%",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 99,
    borderWidth: 1,
    position: "relative",
  },
  tabDefault: {
    borderColor: "rgba(39,39,42,0.5)",
    backgroundColor: "rgba(24,24,27,0.5)",
  },
  tabSelected: {
    borderColor: "rgba(236,72,153,0.3)",
    backgroundColor: "rgba(236,72,153,0.1)",
  },
  tabSelectedFilled: {
    borderColor: "rgba(236,72,153,0.5)",
    backgroundColor: "rgba(236,72,153,0.15)",
  },
  tabFilledOnly: {
    borderColor: "rgba(236,72,153,0.4)",
    backgroundColor: "rgba(236,72,153,0.1)",
  },
  tabLabel: { fontSize: 10, fontWeight: "500", color: "#71717a" },
  tabLabelActive: { color: "#f472b6" },
  filledDot: {
    position: "absolute",
    right: 8,
    top: 6,
    width: 6,
    height: 6,
    borderRadius: 99,
    backgroundColor: "#ec4899",
  },
  // Input box
  inputBox: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(39,39,42,0.6)",
    backgroundColor: "rgba(24,24,27,0.8)",
    marginBottom: 16,
  },
  inputHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(39,39,42,0.4)",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputParamLabel: { fontSize: 11, fontWeight: "600", color: "#d4d4d8" },
  kindBadge: { borderRadius: 99, paddingHorizontal: 6, paddingVertical: 2 },
  kindBadgeImage: { backgroundColor: "rgba(59,130,246,0.1)" },
  kindBadgeText: { backgroundColor: "rgba(16,185,129,0.1)" },
  kindBadgeLabel: { fontSize: 8, fontWeight: "500" },
  kindTextImage: { color: "#60a5fa" },
  kindTextText: { color: "#34d399" },
  inputDescription: {
    fontSize: 9,
    color: "#52525b",
    paddingHorizontal: 12,
    paddingTop: 4,
    lineHeight: 14,
  },
  textInput: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 12,
    color: "#e4e4e7",
    minHeight: 60,
  },
  imagePreviewWrapper: {
    margin: 10,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  imagePreview: { width: "100%", height: 96, borderRadius: 8 },
  removeImageBtn: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 99,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    margin: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(63,63,70,0.6)",
    borderStyle: "dashed",
    backgroundColor: "rgba(39,39,42,0.3)",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  uploadBtnText: { fontSize: 11, color: "#71717a" },
  // Send section
  sendSection: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(39,39,42,0.6)",
    backgroundColor: "rgba(24,24,27,0.8)",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sendRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  modelBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(39,39,42,0.6)",
    backgroundColor: "rgba(24,24,27,0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  modelLogo: { width: 14, height: 14 },
  modelName: { fontSize: 10, color: "#a1a1aa" },
  planBadge: { borderRadius: 99, paddingHorizontal: 6, paddingVertical: 2 },
  planBadgeText: { fontSize: 8, fontWeight: "500", color: "#fff" },
  creditsBtn: { flexDirection: "row", alignItems: "center", gap: 4, flex: 1 },
  creditsBtnText: { fontSize: 10, color: "#52525b" },
  sendBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnActive: { backgroundColor: "#ec4899" },
  sendBtnDisabled: { backgroundColor: "rgba(39,39,42,0.6)" },
  ratioRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(39,39,42,0.4)",
    marginTop: 16,
    paddingTop: 16,
  },
  ratioLabel: { fontSize: 10, color: "#52525b", flexShrink: 0 },
  ratioOptions: { flexDirection: "row", gap: 4 },
  ratioPill: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 99 },
  ratioPillActive: { backgroundColor: "rgba(236,72,153,0.2)" },
  ratioPillText: { fontSize: 9, color: "#52525b" },
  ratioPillTextActive: { color: "#f472b6" },
  // Dropdowns
  dropdownBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  dropdownCard: {
    backgroundColor: "#09090b",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#27272a",
    width: 208,
    overflow: "hidden",
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dropdownItemSelected: { backgroundColor: "rgba(39,39,42,0.8)" },
  dropdownItemName: { flex: 1, fontSize: 11, color: "#d4d4d8" },
  creditsPopup: {
    backgroundColor: "#09090b",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#27272a",
    padding: 12,
    width: 192,
  },
  creditsPopupText: { fontSize: 10, color: "#a1a1aa" },
  // Prompt modal
  promptModal: {
    backgroundColor: "#18181b",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#3f3f46",
    padding: 24,
    width: "100%",
    maxWidth: 440,
  },
  promptModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  promptModalTitle: { fontWeight: "600", color: "#f4f4f5", fontSize: 14 },
  promptScrollView: {
    maxHeight: 240,
    backgroundColor: "#09090b",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  promptText: {
    fontSize: 11,
    fontFamily: "monospace",
    color: "#d4d4d8",
    lineHeight: 18,
  },
  promptCloseBtn: {
    backgroundColor: "#ec4899",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  promptCloseBtnText: { fontSize: 14, fontWeight: "500", color: "#fff" },
  // View prompt button
  viewPromptBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(63,63,70,0.6)",
    backgroundColor: "rgba(24,24,27,0.6)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 16,
  },
  viewPromptText: { fontSize: 11, color: "#a1a1aa" },
});

const modalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#0f0f10",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(39,39,42,0.6)",
    maxHeight: "92%",
    flex: 1,
  },
  closeBtn: {
    position: "absolute",
    right: 12,
    top: 12,
    zIndex: 10,
    width: 28,
    height: 28,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: "#27272a",
    backgroundColor: "rgba(24,24,27,0.8)",
    alignItems: "center",
    justifyContent: "center",
  },
  imageWrapper: {
    padding: 16,
    alignItems: "center",
    backgroundColor: "rgba(9,9,11,0.6)",
  },
  templateImage: { width: "100%", height: 300 },
  resetBtn: {
    position: "absolute",
    bottom: 24,
    right: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: "#27272a",
    backgroundColor: "rgba(24,24,27,0.8)",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  resetBtnText: { fontSize: 10, color: "#a1a1aa" },
  infoSection: { padding: 16, gap: 12 },
  templateName: { fontSize: 14, fontWeight: "600", color: "#f4f4f5" },
  templateDesc: {
    fontSize: 11,
    color: "#71717a",
    lineHeight: 16,
    marginTop: 4,
  },
  creatorRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  creatorAvatar: {
    width: 28,
    height: 28,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: "#27272a",
    flexShrink: 0,
  },
  creatorName: { fontSize: 11, fontWeight: "500", color: "#d4d4d8" },
  creatorHandle: { fontSize: 10, color: "#52525b" },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(24,24,27,0.8)",
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: "rgba(39,39,42,0.6)",
  },
  tagText: { fontSize: 10, color: "#52525b" },
  statsRow: { flexDirection: "row", gap: 12 },
  statCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#27272a",
    backgroundColor: "rgba(39,39,42,0.5)",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  statCardViewed: {
    borderColor: "rgba(59,130,246,0.5)",
    backgroundColor: "rgba(59,130,246,0.1)",
  },
  statCardLiked: {
    borderColor: "rgba(236,72,153,0.5)",
    backgroundColor: "rgba(236,72,153,0.1)",
  },
  statCardLabel: { fontSize: 10, color: "#71717a" },
  statCardValue: { fontSize: 14, fontWeight: "600", color: "#fff" },
  divider: {
    height: 1,
    backgroundColor: "rgba(39,39,42,0.6)",
    marginHorizontal: 16,
  },
  aiSection: { padding: 16 },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(39,39,42,0.5)",
    backgroundColor: "#0f0f10",
    padding: 16,
  },
  iconActionBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#27272a",
    backgroundColor: "rgba(24,24,27,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconActionBtnSaved: {
    borderColor: "rgba(236,72,153,0.3)",
    backgroundColor: "rgba(236,72,153,0.1)",
  },
  iconActionBtnShared: {
    borderColor: "rgba(74,222,128,0.3)",
    backgroundColor: "rgba(74,222,128,0.1)",
  },
  openCanvasBtn: {
    flex: 1,
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(63,63,70,0.6)",
    backgroundColor: "rgba(24,24,27,0.6)",
  },
  openCanvasBtnText: { fontSize: 12, fontWeight: "500", color: "#a1a1aa" },
});

const galleryStyles = StyleSheet.create({
  section: { gap: 0 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  headerTitle: { fontSize: 16, fontWeight: "600", color: "#fff" },
  headerDivider: { flex: 1, height: 1, backgroundColor: "#27272a" },
  headerCount: { fontSize: 12, color: "#52525b" },
  categoryRow: { flexDirection: "row", gap: 6, paddingVertical: 12 },
  categoryPill: {
    flexShrink: 0,
    borderRadius: 99,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#27272a",
    backgroundColor: "#18181b",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  categoryPillActive: { backgroundColor: "#ec4899", borderColor: "#ec4899" },
  categoryPillText: { fontSize: 12, fontWeight: "500", color: "#71717a" },
  categoryPillTextActive: { color: "#fff" },
  categoryBadge: {
    backgroundColor: "#3f3f46",
    borderRadius: 99,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  categoryBadgeText: { fontSize: 10, color: "#fff" },
  spinnerWrapper: { alignItems: "center", paddingVertical: 48 },
  // 2-column grid — mirrors web's `flex w-full`
  grid: { flexDirection: "row", gap: 8 },
  column: { flex: 1, gap: 0 },
  card: {
    backgroundColor: "#18181b",
    marginBottom: 8,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  cardPressed: { transform: [{ scale: 0.98 }] },
  cardOverlay: {
    position: "absolute",
    top: 8,
    left: 8,
    zIndex: 10,
    flexDirection: "row",
    gap: 4,
  },
  cardStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 99,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  cardStatText: { fontSize: 10, color: "#d4d4d8" },
  cardImage: { aspectRatio: undefined, height: undefined },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#09090b",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  creatorAvatar: {
    width: 26,
    height: 26,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: "#27272a",
    backgroundColor: "#27272a",
    flexShrink: 0,
  },
  cardTemplateName: { fontSize: 12, fontWeight: "600", color: "#e4e4e7" },
  cardHandle: { fontSize: 10, color: "#52525b" },
  loadMoreSpinner: { alignItems: "center", paddingVertical: 24 },
  loadMoreBtn: { alignItems: "center", paddingVertical: 12, marginTop: 8 },
  loadMoreBtnText: { fontSize: 14, color: "#a1a1aa" },
  endText: {
    textAlign: "center",
    fontSize: 12,
    color: "#52525b",
    paddingVertical: 16,
  },
});

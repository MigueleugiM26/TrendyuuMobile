import { useUser } from "@/src/context/user-context";
import { useTranslations } from "@/src/hooks/useTranslations";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import {
  Check,
  Eye,
  Heart,
  PenLine,
  Send,
  Share2,
  Tag,
  Upload,
  X,
} from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
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

// ─── Constants ────────────────────────────────────────────────────────────────

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const NUM_COLS = 2;
const COL_WIDTH = (SCREEN_WIDTH - 16 * 2 - 8) / NUM_COLS;
const INITIAL_LOAD = 12;
const PAGE_SIZE = 12;
const BASE_URL = process.env.EXPO_PUBLIC_TRENDYUU_URL_BACK;
const R2_TEMPLATES = "https://pub-2c4c0866f48e4f24bb5d6a99ce9007ef.r2.dev";

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const SHUFFLED = shuffleArray(CANVAS_TEMPLATES);

// ─── AI Customizer ────────────────────────────────────────────────────────────

type EditTarget = "personagem" | "fundo" | "texto" | "estilo" | "cores";

function AICustomizer({ template }: { template: CanvasTemplate }) {
  const t = useTranslations("dashboard.TemplateGallery");
  const { userCredits, currentPlan } = useUser();
  const router = useRouter();

  const PARAMS: {
    id: EditTarget;
    label: string;
    kind: "text" | "image";
    placeholder: string;
  }[] = [
    {
      id: "personagem",
      label: t("editParams.personagem.label"),
      kind: "image",
      placeholder: t("editParams.personagem.placeholder"),
    },
    {
      id: "fundo",
      label: t("editParams.fundo.label"),
      kind: "text",
      placeholder: t("editParams.fundo.placeholder"),
    },
    {
      id: "texto",
      label: t("editParams.texto.label"),
      kind: "text",
      placeholder: t("editParams.texto.placeholder"),
    },
    {
      id: "estilo",
      label: t("editParams.estilo.label"),
      kind: "text",
      placeholder: t("editParams.estilo.placeholder"),
    },
    {
      id: "cores",
      label: t("editParams.cores.label"),
      kind: "text",
      placeholder: t("editParams.cores.placeholder"),
    },
  ];

  const [selected, setSelected] = useState<EditTarget>("estilo");
  const [texts, setTexts] = useState<Record<EditTarget, string>>({
    personagem: "",
    fundo: "",
    texto: "",
    estilo: "",
    cores: "",
  });
  const [imageUri, setImageUri] = useState<string | null>(null);

  const currentParam = PARAMS.find((p) => p.id === selected)!;
  const hasAny =
    selected === "personagem"
      ? !!imageUri
      : !!texts[selected].trim() ||
        Object.entries(texts).some(
          ([k, v]) => k !== "personagem" && v.trim(),
        ) ||
        !!imageUri;

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  }

  async function handleSend() {
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
    const hasTextPrompt = Object.entries(texts).some(([, v]) => v.trim());
    if (imageUri || hasTextPrompt) {
      await AsyncStorage.setItem(
        "pendingCanvasSetup",
        JSON.stringify({
          templateImageUrl: template.baseImageUrl,
          personagemPreview: imageUri ?? null,
          prompt: buildPrompt(),
          aspectRatio: template.aspectRatio ?? "9:16",
        }),
      );
    }
    router.push("/ai-tools/canvas-studio");
  }

  function buildPrompt(): string {
    const changes: string[] = [];
    if (imageUri)
      changes.push(
        "Replace the main character / person with the uploaded reference image",
      );
    if (texts.fundo.trim())
      changes.push(`Change the background to: "${texts.fundo}"`);
    if (texts.texto.trim())
      changes.push(`Replace all visible text with: "${texts.texto}"`);
    if (texts.estilo.trim())
      changes.push(`Apply this artistic style: ${texts.estilo}`);
    if (texts.cores.trim())
      changes.push(`Change the color palette to: ${texts.cores}`);
    if (!changes.length) return "No changes requested.";
    return `Edit the template image:\n${changes.map((c, i) => `${i + 1}. ${c}`).join("\n")}`;
  }

  return (
    <View style={ai.root}>
      <Text style={ai.label}>{t("personalizeWithAI")}</Text>

      {/* Param tabs */}
      <View style={ai.tabs}>
        {PARAMS.map((p) => {
          const filled = p.kind === "image" ? !!imageUri : !!texts[p.id].trim();
          const isActive = selected === p.id;
          return (
            <Pressable
              key={p.id}
              onPress={() => setSelected(p.id)}
              style={[ai.tab, isActive && ai.tabActive, filled && ai.tabFilled]}
            >
              {filled && <View style={ai.filledDot} />}
              <Text
                style={[ai.tabText, (isActive || filled) && ai.tabTextActive]}
              >
                {p.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Input */}
      <View style={ai.inputCard}>
        <Text style={ai.inputLabel}>{currentParam.label}</Text>
        {currentParam.kind === "text" ? (
          <TextInput
            value={texts[selected as EditTarget]}
            onChangeText={(v) => setTexts((p) => ({ ...p, [selected]: v }))}
            placeholder={currentParam.placeholder}
            placeholderTextColor="#52525b"
            style={ai.textarea}
            multiline
            numberOfLines={2}
          />
        ) : imageUri ? (
          <View style={ai.imagePreviewWrap}>
            <Image source={{ uri: imageUri }} style={ai.imagePreview} />
            <Pressable onPress={() => setImageUri(null)} style={ai.imageRemove}>
              <X size={10} color="#fff" />
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={pickImage} style={ai.uploadBtn}>
            <Upload size={14} color="#71717a" />
            <Text style={ai.uploadText}>{currentParam.placeholder}</Text>
          </Pressable>
        )}
      </View>

      {/* Send */}
      <Pressable
        onPress={handleSend}
        disabled={!hasAny}
        style={({ pressed }) => [
          ai.sendBtn,
          !hasAny && ai.sendBtnDisabled,
          pressed && { opacity: 0.85 },
        ]}
      >
        <Send size={14} color="#fff" />
        <Text style={ai.sendBtnText}>{t("openInCanvas")}</Text>
      </Pressable>
    </View>
  );
}

const ai = StyleSheet.create({
  root: { gap: 12, padding: 16 },
  label: {
    fontSize: 9,
    fontWeight: "600",
    color: "#52525b",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  tabs: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tab: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#27272a",
    backgroundColor: "#09090b",
  },
  tabActive: {
    borderColor: "rgba(236,72,153,0.4)",
    backgroundColor: "rgba(236,72,153,0.1)",
  },
  tabFilled: {
    borderColor: "rgba(236,72,153,0.4)",
    backgroundColor: "rgba(236,72,153,0.1)",
  },
  filledDot: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#ec4899",
  },
  tabText: { fontSize: 10, fontWeight: "500", color: "#71717a" },
  tabTextActive: { color: "#f9a8d4" },
  inputCard: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#27272a",
    overflow: "hidden",
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#a1a1aa",
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 4,
  },
  textarea: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    fontSize: 13,
    color: "#fff",
    minHeight: 60,
    textAlignVertical: "top",
  },
  imagePreviewWrap: { margin: 10 },
  imagePreview: { width: "100%", height: 80, borderRadius: 8 },
  imageRemove: {
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
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    margin: 10,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#27272a",
    borderStyle: "dashed",
  },
  uploadText: { fontSize: 11, color: "#52525b" },
  sendBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#ec4899",
    borderRadius: 10,
    paddingVertical: 12,
  },
  sendBtnDisabled: { opacity: 0.3 },
  sendBtnText: { fontSize: 13, fontWeight: "600", color: "#fff" },
});

// ─── Template Modal ───────────────────────────────────────────────────────────

function TemplateModal({
  template,
  onClose,
  isLiked,
  views,
  likes,
  onLike,
}: {
  template: CanvasTemplate;
  onClose: () => void;
  isLiked: boolean;
  views: number;
  likes: number;
  onLike: () => void;
}) {
  const t = useTranslations("dashboard.TemplateGallery");
  const router = useRouter();
  const [shareCopied, setShareCopied] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  async function openCanvas() {
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
    router.push("/ai-tools/canvas-studio");
    setIsApplying(false);
    onClose();
  }

  async function handleShare() {
    try {
      await Share.share({
        message: `${template.name} | TrendYuu`,
        url: `https://trendyuu.com/dashboard?template=${template.id}`,
      });
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch {}
  }

  const templateName =
    template.category === "UserPublic"
      ? template.name
      : t(`templates.${template.id}.name`);
  const templateDesc =
    template.category === "UserPublic"
      ? template.description
      : t(`templates.${template.id}.description`);

  return (
    <Modal
      visible
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="pageSheet"
    >
      <View style={modal.root}>
        {/* Header */}
        <View style={modal.header}>
          <Pressable onPress={onClose} style={modal.closeBtn}>
            <X size={18} color="#fff" />
          </Pressable>
          <Text style={modal.headerTitle} numberOfLines={1}>
            {templateName}
          </Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Preview image */}
          <Image
            source={{ uri: template.baseImageUrl }}
            style={[
              modal.previewImage,
              { aspectRatio: template.width / template.height },
            ]}
            resizeMode="contain"
          />

          {/* Info */}
          <View style={modal.section}>
            <Text style={modal.templateName}>{templateName}</Text>
            <Text style={modal.templateDesc}>{templateDesc}</Text>

            {/* Creator */}
            <View style={modal.creatorRow}>
              <Image
                source={{ uri: template.creator.avatar }}
                style={modal.creatorAvatar}
              />
              <View>
                <Text style={modal.creatorName}>{template.creator.name}</Text>
                <Text style={modal.creatorHandle}>
                  {template.creator.handle}
                </Text>
              </View>
            </View>

            {/* Tags */}
            <View style={modal.tags}>
              {template.tags.map((tag) => (
                <View key={tag} style={modal.tag}>
                  <Tag size={10} color="#52525b" />
                  <Text style={modal.tagText}>{tag}</Text>
                </View>
              ))}
            </View>

            {/* Stats — only for public templates */}
            {template.category === "UserPublic" && (
              <View style={modal.statsRow}>
                <View style={modal.stat}>
                  <Eye size={14} color="#a1a1aa" />
                  <Text style={modal.statText}>
                    {views.toLocaleString("pt-BR")}
                  </Text>
                </View>
                <Pressable onPress={onLike} style={modal.stat}>
                  <Heart
                    size={14}
                    color={isLiked ? "#ec4899" : "#a1a1aa"}
                    fill={isLiked ? "#ec4899" : "transparent"}
                  />
                  <Text
                    style={[modal.statText, isLiked && { color: "#ec4899" }]}
                  >
                    {likes.toLocaleString("pt-BR")}
                  </Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* AI Customizer */}
          <AICustomizer template={template} />
        </ScrollView>

        {/* Footer actions */}
        <View style={modal.footer}>
          <Pressable
            onPress={handleShare}
            style={[modal.footerBtn, shareCopied && modal.footerBtnSuccess]}
          >
            {shareCopied ? (
              <Check size={16} color="#22c55e" />
            ) : (
              <Share2 size={16} color="#a1a1aa" />
            )}
          </Pressable>
          <Pressable
            onPress={openCanvas}
            disabled={isApplying}
            style={({ pressed }) => [
              modal.openBtn,
              pressed && { opacity: 0.85 },
              isApplying && { opacity: 0.5 },
            ]}
          >
            {isApplying ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <PenLine size={14} color="#fff" />
            )}
            <Text style={modal.openBtnText}>{t("openInCanvas")}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const modal = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#09090b" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#18181b",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#18181b",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
    marginHorizontal: 8,
  },
  previewImage: { width: "100%", backgroundColor: "#000" },
  section: { padding: 16, gap: 10 },
  templateName: { fontSize: 18, fontWeight: "700", color: "#fff" },
  templateDesc: { fontSize: 13, color: "#71717a", lineHeight: 20 },
  creatorRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  creatorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#27272a",
  },
  creatorName: { fontSize: 13, fontWeight: "500", color: "#d4d4d8" },
  creatorHandle: { fontSize: 11, color: "#52525b" },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#18181b",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#27272a",
  },
  tagText: { fontSize: 10, color: "#52525b" },
  statsRow: { flexDirection: "row", gap: 16 },
  stat: { flexDirection: "row", alignItems: "center", gap: 6 },
  statText: { fontSize: 13, color: "#a1a1aa" },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#18181b",
  },
  footerBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#27272a",
    backgroundColor: "#18181b",
    alignItems: "center",
    justifyContent: "center",
  },
  footerBtnSuccess: {
    borderColor: "rgba(34,197,94,0.3)",
    backgroundColor: "rgba(34,197,94,0.1)",
  },
  openBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#ec4899",
    borderRadius: 12,
    paddingVertical: 14,
  },
  openBtnText: { fontSize: 14, fontWeight: "600", color: "#fff" },
});

// ─── Gallery ──────────────────────────────────────────────────────────────────

export function TemplateGallery() {
  const t = useTranslations("dashboard.TemplateGallery");
  const { totalTemplateData, refreshVideoData } = useUser();
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [allTemplates, setAllTemplates] = useState<CanvasTemplate[]>(SHUFFLED);
  const [visible, setVisible] = useState<CanvasTemplate[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingInit, setLoadingInit] = useState(true);
  const [selectedTemplate, setSelectedTemplate] =
    useState<CanvasTemplate | null>(null);
  const loadedRef = useRef(0);

  const likedSet = useMemo(
    () => new Set(totalTemplateData?.liked_templates ?? []),
    [totalTemplateData],
  );
  const viewedSet = useMemo(
    () => new Set(totalTemplateData?.viewed_templates ?? []),
    [totalTemplateData],
  );

  // Fetch user public templates
  useEffect(() => {
    async function fetchPublic() {
      try {
        const res = await fetch(`${BASE_URL}/api/imagens/get-user-template/`);
        if (!res.ok) return;
        const data = await res.json();
        const formatted: CanvasTemplate[] = data.templates.map((tpl: any) => ({
          id: tpl.id,
          kind: "prompt" as const,
          name: tpl.name,
          description: tpl.description || "Template público",
          category: "UserPublic" as const,
          tags: tpl.tags || [],
          baseImageUrl: tpl.baseImageUrl
            ? `${R2_TEMPLATES}/${tpl.baseImageUrl}`.replace(
                /([^:])\/{2,}/g,
                "$1/",
              )
            : "",
          aiPrompt: tpl.ai_prompt || "",
          aspectRatio: tpl.aspect_ratio || "1:1",
          width: 1024,
          height: 1024,
          layers: [],
          views: tpl.views || 0,
          likes: tpl.likes || 0,
          creator: {
            name: tpl.uploader?.name || "Usuário",
            handle: tpl.uploader?.handle || "@user",
            avatar: tpl.uploader?.avatar || "",
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
        setAllTemplates(shuffleArray([...SHUFFLED, ...formatted]));
      } catch {
      } finally {
        setLoadingInit(false);
      }
    }
    fetchPublic();
  }, []);

  const filtered = useMemo(() => {
    if (activeCategory === "Todos") return allTemplates;
    if (activeCategory === "UserPublic")
      return allTemplates.filter((t) => t.category === "UserPublic");
    return allTemplates.filter((t) => t.category === activeCategory);
  }, [allTemplates, activeCategory]);

  // Reset on category/filter change
  useEffect(() => {
    const batch = filtered.slice(0, INITIAL_LOAD);
    setVisible(batch);
    loadedRef.current = batch.length;
    setHasMore(filtered.length > batch.length);
    setLoadingInit(false);
  }, [filtered]);

  function loadMore() {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    setTimeout(() => {
      const batch = filtered.slice(
        loadedRef.current,
        loadedRef.current + PAGE_SIZE,
      );
      setVisible((prev) => {
        const ids = new Set(prev.map((t) => t.id));
        return [...prev, ...batch.filter((t) => !ids.has(t.id))];
      });
      loadedRef.current += batch.length;
      setHasMore(loadedRef.current < filtered.length);
      setLoadingMore(false);
    }, 600);
  }

  async function registerView(templateId: string) {
    const token = await AsyncStorage.getItem("accessToken");
    if (!token) return;
    fetch(`${BASE_URL}/api/imagens/add-view-template/${templateId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }).catch(() => {});
    setAllTemplates((prev) =>
      prev.map((t) =>
        t.id === templateId ? { ...t, views: (t.views ?? 0) + 1 } : t,
      ),
    );
    await refreshVideoData?.();
  }

  async function handleLike(templateId: string) {
    const token = await AsyncStorage.getItem("accessToken");
    if (!token) return;
    const isLiked = likedSet.has(templateId);
    fetch(`${BASE_URL}/api/imagens/add-like-template/${templateId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }).catch(() => {});
    setAllTemplates((prev) =>
      prev.map((t) =>
        t.id === templateId
          ? { ...t, likes: (t.likes ?? 0) + (isLiked ? -1 : 1) }
          : t,
      ),
    );
    await refreshVideoData?.();
  }

  // Split into 2 columns for masonry
  const leftCol = visible.filter((_, i) => i % 2 === 0);
  const rightCol = visible.filter((_, i) => i % 2 !== 0);

  function renderCard(template: CanvasTemplate) {
    const name =
      template.category === "UserPublic"
        ? template.name
        : t(`templates.${template.id}.name`);
    return (
      <Pressable
        key={template.id}
        onPress={() => {
          setSelectedTemplate(template);
          if (template.category === "UserPublic") registerView(template.id);
        }}
        style={({ pressed }) => [gallery.card, pressed && { opacity: 0.85 }]}
      >
        <Image
          source={{ uri: template.baseImageUrl }}
          style={[
            gallery.cardImage,
            { aspectRatio: template.width / template.height },
          ]}
          resizeMode="cover"
        />
        {template.category === "UserPublic" && (
          <View style={gallery.statsOverlay}>
            <View style={gallery.statChip}>
              <Eye
                size={9}
                color={viewedSet.has(template.id) ? "#60a5fa" : "#d4d4d8"}
              />
              <Text style={gallery.statText}>
                {(template.views ?? 0).toLocaleString("pt-BR")}
              </Text>
            </View>
            <View style={gallery.statChip}>
              <Heart
                size={9}
                color={likedSet.has(template.id) ? "#ec4899" : "#d4d4d8"}
                fill={likedSet.has(template.id) ? "#ec4899" : "transparent"}
              />
              <Text style={gallery.statText}>
                {(template.likes ?? 0).toLocaleString("pt-BR")}
              </Text>
            </View>
          </View>
        )}
        <View style={gallery.cardFooter}>
          <Image
            source={{ uri: template.creator.avatar }}
            style={gallery.creatorAvatar}
          />
          <View style={{ flex: 1 }}>
            <Text style={gallery.cardName} numberOfLines={1}>
              {name}
            </Text>
            <Text style={gallery.creatorHandle} numberOfLines={1}>
              {template.creator.handle}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <View style={gallery.root}>
      {/* Header */}
      <View style={gallery.header}>
        <Text style={gallery.title}>{t("sectionTitle")}</Text>
        <Text style={gallery.count}>
          {t("templateCount", { count: filtered.length })}
        </Text>
      </View>

      {/* Category filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={gallery.categoryScroll}
      >
        {TEMPLATE_CATEGORIES.map((cat) => (
          <Pressable
            key={cat}
            onPress={() => setActiveCategory(cat)}
            style={[
              gallery.categoryChip,
              activeCategory === cat && gallery.categoryChipActive,
            ]}
          >
            <Text
              style={[
                gallery.categoryText,
                activeCategory === cat && gallery.categoryTextActive,
              ]}
            >
              {t(`categories.${cat}`)}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Masonry grid */}
      {loadingInit ? (
        <View style={gallery.loader}>
          <ActivityIndicator size="large" color="#ec4899" />
        </View>
      ) : (
        <View style={gallery.masonry}>
          <View style={gallery.col}>{leftCol.map(renderCard)}</View>
          <View style={gallery.col}>{rightCol.map(renderCard)}</View>
        </View>
      )}

      {/* Load more */}
      {loadingMore && (
        <View style={gallery.loader}>
          <ActivityIndicator size="small" color="#ec4899" />
        </View>
      )}
      {hasMore && !loadingMore && (
        <Pressable onPress={loadMore} style={gallery.loadMoreBtn}>
          <Text style={gallery.loadMoreText}>Carregar mais</Text>
        </Pressable>
      )}
      {!hasMore && visible.length > 0 && (
        <Text style={gallery.endText}>Todos os templates carregados</Text>
      )}

      {/* Template modal */}
      {selectedTemplate && (
        <TemplateModal
          template={selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
          isLiked={likedSet.has(selectedTemplate.id)}
          views={selectedTemplate.views ?? 0}
          likes={selectedTemplate.likes ?? 0}
          onLike={() => handleLike(selectedTemplate.id)}
        />
      )}
    </View>
  );
}

const gallery = StyleSheet.create({
  root: { paddingHorizontal: 16, paddingTop: 24 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  title: { fontSize: 16, fontWeight: "600", color: "#fff", flex: 1 },
  count: { fontSize: 12, color: "#52525b" },
  categoryScroll: { gap: 6, paddingBottom: 12 },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#27272a",
    backgroundColor: "#09090b",
  },
  categoryChipActive: { backgroundColor: "#ec4899", borderColor: "#ec4899" },
  categoryText: { fontSize: 12, fontWeight: "500", color: "#71717a" },
  categoryTextActive: { color: "#fff" },
  masonry: { flexDirection: "row", gap: 8 },
  col: { flex: 1, gap: 8 },
  card: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#09090b",
    borderWidth: 1,
    borderColor: "#18181b",
  },
  cardImage: { width: "100%" },
  statsOverlay: {
    position: "absolute",
    top: 6,
    left: 6,
    flexDirection: "row",
    gap: 4,
  },
  statChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(0,0,0,0.65)",
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  statText: { fontSize: 9, color: "#d4d4d8" },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#09090b",
    paddingHorizontal: 8,
    paddingVertical: 7,
  },
  creatorAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#27272a",
  },
  cardName: { fontSize: 11, fontWeight: "600", color: "#e4e4e7" },
  creatorHandle: { fontSize: 9, color: "#52525b" },
  loader: { paddingVertical: 24, alignItems: "center" },
  loadMoreBtn: {
    marginVertical: 12,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#27272a",
    borderRadius: 10,
  },
  loadMoreText: { fontSize: 13, color: "#a1a1aa" },
  endText: {
    fontSize: 11,
    color: "#3f3f46",
    textAlign: "center",
    paddingVertical: 16,
  },
});

import { useTranslations } from "@/src/hooks/useTranslations";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import {
  AlertCircle,
  Building2,
  Check,
  ChevronDown,
  Clock,
  Crown,
  Globe,
  ImagePlus,
  Lock,
  MapPin,
  MessageSquare,
  Mic2,
  Palette,
  Pencil,
  Phone,
  Plus,
  Tag,
  Trash2,
  Type,
  Upload,
  X,
  Zap,
} from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type BrandingStatus = "draft" | "under_review" | "approved" | "rejected";

export interface UserBranding {
  id?: number;
  slot?: number;
  is_available?: boolean;
  business_name: string;
  bio: string;
  logo_url: string | null;
  banner_url: string | null;
  product_images: string[];
  locations: string[];
  tags: string[];
  website: string;
  social_links: Record<string, string>;
  contact_links: Record<string, string>;
  is_public: boolean;
  niche: string;
  color_palette: string[];
  typography: string;
  status?: BrandingStatus;
  rejection_note?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
}

interface BrandingPrivateConfig {
  voice_tone: string;
  hooks: string[];
  prompts: string[];
}

const PLAN_LIMITS: Record<string, number> = {
  free: 1,
  essential: 2,
  creator: 5,
  agency: 10,
};

const EMPTY_BRANDING: UserBranding = {
  business_name: "",
  bio: "",
  logo_url: null,
  banner_url: null,
  product_images: [],
  locations: [],
  tags: [],
  website: "",
  social_links: {},
  contact_links: {},
  is_public: false,
  niche: "",
  color_palette: [],
  typography: "",
};

const EMPTY_PRIVATE: BrandingPrivateConfig = {
  voice_tone: "",
  hooks: [],
  prompts: [],
};

// ─── Niche suggestions ─────────────────────────────────────────────────────────

interface NicheSuggestion {
  label: string;
  palette: string[];
  font: string;
}

const NICHE_SUGGESTIONS: NicheSuggestion[] = [
  {
    label: "E-commerce",
    palette: ["#FF6B6B", "#FF8E53", "#FFC300", "#2ECC71", "#1A1A2E"],
    font: "Inter",
  },
  {
    label: "Fashion & Apparel",
    palette: ["#1C1C1C", "#D4AF37", "#F5F5F0", "#8B7355", "#C41E3A"],
    font: "Playfair Display",
  },
  {
    label: "Food & Beverage",
    palette: ["#FF4500", "#FF8C00", "#228B22", "#8B4513", "#FFF8DC"],
    font: "Nunito",
  },
  {
    label: "Gym & Fitness",
    palette: ["#FF0000", "#1A1A1A", "#FF6600", "#FFFFFF", "#333333"],
    font: "Barlow Condensed",
  },
  {
    label: "Beauty & Skincare",
    palette: ["#FFB6C1", "#FF69B4", "#FFF0F5", "#C71585", "#8B0057"],
    font: "Cormorant Garamond",
  },
  {
    label: "Technology",
    palette: ["#0078D4", "#00BCF2", "#1A1A2E", "#E8F4FD", "#50E6FF"],
    font: "Roboto",
  },
  {
    label: "Finance & Banking",
    palette: ["#003087", "#0070CC", "#FFFFFF", "#1A1A1A", "#C8960C"],
    font: "Merriweather",
  },
  {
    label: "Real Estate",
    palette: ["#2C3E50", "#E74C3C", "#ECF0F1", "#27AE60", "#F39C12"],
    font: "Lato",
  },
  {
    label: "Health & Wellness",
    palette: ["#4CAF50", "#8BC34A", "#F1F8E9", "#1B5E20", "#FFFFFF"],
    font: "Poppins",
  },
  {
    label: "Education",
    palette: ["#3F51B5", "#2196F3", "#FFC107", "#FFFFFF", "#1A237E"],
    font: "Source Sans Pro",
  },
  {
    label: "Travel & Tourism",
    palette: ["#00ACC1", "#00796B", "#FF7043", "#FFF9C4", "#1A237E"],
    font: "Montserrat",
  },
  {
    label: "Entertainment",
    palette: ["#9C27B0", "#E91E63", "#FF5722", "#212121", "#FFC107"],
    font: "Bebas Neue",
  },
  {
    label: "Legal & Professional",
    palette: ["#1A237E", "#37474F", "#B0BEC5", "#FFFFFF", "#C8960C"],
    font: "Libre Baskerville",
  },
  {
    label: "Photography",
    palette: ["#212121", "#FAFAFA", "#FF6F00", "#9E9E9E", "#1A1A1A"],
    font: "Josefin Sans",
  },
  {
    label: "Non-profit / NGO",
    palette: ["#FF5722", "#4CAF50", "#2196F3", "#FFFFFF", "#37474F"],
    font: "Open Sans",
  },
  {
    label: "Pet & Veterinary",
    palette: ["#FF9800", "#4CAF50", "#FFFFFF", "#8D6E63", "#FFF3E0"],
    font: "Nunito",
  },
  {
    label: "Automotive",
    palette: ["#B71C1C", "#212121", "#9E9E9E", "#FFFFFF", "#D32F2F"],
    font: "Rajdhani",
  },
  {
    label: "SaaS / Software",
    palette: ["#6C63FF", "#3ECFCF", "#1A1A2E", "#FFFFFF", "#FF6584"],
    font: "Inter",
  },
  {
    label: "Sustainable / Eco",
    palette: ["#2E7D32", "#A5D6A7", "#F9FBE7", "#6D4C41", "#FFFFFF"],
    font: "Quicksand",
  },
  {
    label: "Kids & Toys",
    palette: ["#F44336", "#2196F3", "#FFEB3B", "#4CAF50", "#FF9800"],
    font: "Fredoka One",
  },
];

const FONT_OPTIONS = [
  "Inter",
  "Roboto",
  "Poppins",
  "Montserrat",
  "Lato",
  "Open Sans",
  "Nunito",
  "Raleway",
  "Playfair Display",
  "Merriweather",
  "Source Sans Pro",
  "Barlow Condensed",
  "Bebas Neue",
  "Cormorant Garamond",
  "Josefin Sans",
  "Quicksand",
  "Libre Baskerville",
  "Rajdhani",
  "Fredoka One",
  "Rubik",
];

const SOCIAL_PLATFORMS = [
  {
    key: "instagram",
    label: "instagram",
    placeholder: "instagram_placeholder",
  },
  { key: "tiktok", label: "tiktok", placeholder: "tiktok_placeholder" },
  { key: "youtube", label: "youtube", placeholder: "youtube_placeholder" },
  { key: "twitter", label: "twitter", placeholder: "twitter_placeholder" },
  { key: "linkedin", label: "linkedin", placeholder: "linkedin_placeholder" },
  { key: "facebook", label: "facebook", placeholder: "facebook_placeholder" },
];

const CONTACT_CHANNELS: {
  key: string;
  label: string;
  placeholder: string;
  keyboardType: "default" | "email-address" | "phone-pad" | "url";
  icon: string;
}[] = [
  {
    key: "email",
    label: "email",
    placeholder: "email_placeholder",
    keyboardType: "email-address",
    icon: "✉️",
  },
  {
    key: "phone",
    label: "phone",
    placeholder: "phone_placeholder",
    keyboardType: "phone-pad",
    icon: "📞",
  },
  {
    key: "whatsapp",
    label: "whatsapp",
    placeholder: "whatsapp_placeholder",
    keyboardType: "phone-pad",
    icon: "💬",
  },
  {
    key: "telegram",
    label: "telegram",
    placeholder: "telegram_placeholder",
    keyboardType: "url",
    icon: "✈️",
  },
  {
    key: "wechat",
    label: "wechat",
    placeholder: "wechat_placeholder",
    keyboardType: "default",
    icon: "🟢",
  },
  {
    key: "line",
    label: "line",
    placeholder: "line_placeholder",
    keyboardType: "url",
    icon: "📗",
  },
];

const BASE_URL = process.env.EXPO_PUBLIC_TRENDYUU_URL_BACK;
const USER_CONFIG_KEY = "user-branding";
const MAX_PRODUCT_IMAGES = 6;
const MAX_TAGS = 15;
const MAX_LOCATIONS = 5;
const MAX_BIO = 500;
const MAX_HOOKS = 20;
const MAX_PROMPTS = 20;

// ─── Helpers ───────────────────────────────────────────────────────────────────

async function authHeaders(): Promise<HeadersInit> {
  const token = await AsyncStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function uploadMedia(
  uri: string,
  slot: "logo" | "banner" | "product",
  brandId: number,
): Promise<string | null> {
  const headers = await authHeaders();
  const fd = new FormData();
  const filename = uri.split("/").pop() ?? "upload.jpg";
  const ext = filename.split(".").pop()?.toLowerCase() ?? "jpg";
  const mime =
    ext === "png" ? "image/png" : ext === "gif" ? "image/gif" : "image/jpeg";
  (fd as any).append("file", { uri, name: filename, type: mime } as any);
  fd.append("slot", slot);
  fd.append("brand_id", String(brandId));
  const res = await fetch(
    `${BASE_URL}/api/user-branding/upload-branding-media`,
    {
      method: "POST",
      headers,
      body: fd,
    },
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.url ?? null;
}

async function fetchPrivateConfig(): Promise<BrandingPrivateConfig> {
  try {
    const headers = await authHeaders();
    const res = await fetch(
      `${BASE_URL}/api/video/get-user-config/?key=${USER_CONFIG_KEY}`,
      { headers },
    );
    if (!res.ok) return EMPTY_PRIVATE;
    const data = await res.json();
    return (data.value as BrandingPrivateConfig) ?? EMPTY_PRIVATE;
  } catch {
    return EMPTY_PRIVATE;
  }
}

async function savePrivateConfig(
  value: BrandingPrivateConfig,
): Promise<boolean> {
  try {
    const headers = await authHeaders();
    const res = await fetch(`${BASE_URL}/api/video/save-user-config/`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ key: USER_CONFIG_KEY, value }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function pickImage(): Promise<string | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return null;
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: false,
    quality: 0.9,
  });
  if (result.canceled || !result.assets?.[0]?.uri) return null;
  return result.assets[0].uri;
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({
  status,
  rejectionNote,
}: {
  status?: BrandingStatus;
  rejectionNote?: string | null;
}) {
  const t = useTranslations("ProfileTabs.BrandingTab.status");
  if (!status || status === "draft") return null;

  const cfg = {
    under_review: {
      containerStyle: {
        backgroundColor: "rgba(250,204,21,0.1)",
        borderColor: "rgba(250,204,21,0.2)",
      },
      textColor: "#facc15",
      icon: <Clock size={13} color="#facc15" />,
      label: t("under_review"),
    },
    approved: {
      containerStyle: {
        backgroundColor: "rgba(52,211,153,0.1)",
        borderColor: "rgba(52,211,153,0.2)",
      },
      textColor: "#34d399",
      icon: <Check size={13} color="#34d399" />,
      label: t("approved"),
    },
    rejected: {
      containerStyle: {
        backgroundColor: "rgba(248,113,113,0.1)",
        borderColor: "rgba(248,113,113,0.2)",
      },
      textColor: "#f87171",
      icon: <AlertCircle size={13} color="#f87171" />,
      label: t("rejected"),
    },
  }[status];

  return (
    <View style={styles.statusWrapper}>
      <View style={[styles.statusBadge, cfg.containerStyle]}>
        {cfg.icon}
        <Text style={[styles.statusBadgeText, { color: cfg.textColor }]}>
          {cfg.label}
        </Text>
      </View>
      {status === "rejected" && rejectionNote && (
        <View
          style={[
            styles.rejectionNote,
            {
              backgroundColor: "rgba(248,113,113,0.1)",
              borderColor: "rgba(248,113,113,0.2)",
            },
          ]}
        >
          <Text style={styles.rejectionNoteText}>{rejectionNote}</Text>
        </View>
      )}
    </View>
  );
}

function ImageUploadSlot({
  label,
  url,
  onUpload,
  onRemove,
  uploading,
  aspect = "square",
}: {
  label: string;
  url: string | null;
  onUpload: () => void;
  onRemove: () => void;
  uploading: boolean;
  aspect?: "square" | "wide";
}) {
  const t = useTranslations("ProfileTabs.BrandingTab.upload");
  const slotStyle =
    aspect === "wide" ? styles.imageSlotWide : styles.imageSlotSquare;

  return (
    <View style={styles.imageSlotWrapper}>
      {!!label && <Text style={styles.fieldLabel}>{label}</Text>}
      <TouchableOpacity
        onPress={onUpload}
        disabled={uploading}
        activeOpacity={0.75}
        style={[styles.imageSlot, slotStyle]}
      >
        {url ? (
          <>
            <Image
              source={{ uri: url }}
              style={styles.imageSlotImg}
              resizeMode="cover"
            />
            <View style={styles.imageSlotOverlay}>
              <TouchableOpacity
                onPress={(e) => {
                  onRemove();
                }}
                style={styles.imageSlotBtnRed}
                hitSlop={6}
              >
                <Trash2 size={13} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onUpload}
                style={styles.imageSlotBtnGray}
                hitSlop={6}
              >
                <Upload size={13} color="#fff" />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.imageSlotEmpty}>
            {uploading ? (
              <ActivityIndicator size="small" color="#ec4899" />
            ) : (
              <ImagePlus size={18} color="#71717a" />
            )}
            <Text style={styles.imageSlotEmptyText}>
              {uploading ? t("uploading") : t("upload")}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

function TagInput({
  values,
  onChange,
  max,
  placeholder,
}: {
  values: string[];
  onChange: (v: string[]) => void;
  max: number;
  placeholder: string;
}) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim().replace(/^#/, "");
    if (!v || values.includes(v) || values.length >= max) return;
    onChange([...values, v]);
    setDraft("");
  };

  return (
    <View style={styles.tagInputWrapper}>
      <View style={styles.tagInputRow}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={add}
          placeholder={placeholder}
          placeholderTextColor="#52525b"
          editable={values.length < max}
          style={[styles.textInput, styles.tagTextInput]}
        />
        <TouchableOpacity
          onPress={add}
          disabled={!draft.trim() || values.length >= max}
          style={styles.addIconBtn}
          activeOpacity={0.7}
        >
          <Plus size={16} color="#f4f4f5" />
        </TouchableOpacity>
      </View>
      {values.length > 0 && (
        <View style={styles.tagsRow}>
          {values.map((v) => (
            <View key={v} style={styles.tagChip}>
              <Text style={styles.tagChipText}>{v}</Text>
              <TouchableOpacity
                onPress={() => onChange(values.filter((x) => x !== v))}
                hitSlop={4}
              >
                <X size={11} color="#71717a" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
      <Text style={styles.counterText}>
        {values.length}/{max}
      </Text>
    </View>
  );
}

function ListEditor({
  values,
  onChange,
  max,
  placeholder,
}: {
  values: string[];
  onChange: (v: string[]) => void;
  max: number;
  placeholder: string;
  addLabel: string;
}) {
  const [draft, setDraft] = useState("");
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editVal, setEditVal] = useState("");

  const add = () => {
    const v = draft.trim();
    if (!v || values.length >= max) return;
    onChange([...values, v]);
    setDraft("");
  };
  const saveEdit = (idx: number) => {
    const v = editVal.trim();
    if (!v) return;
    const next = [...values];
    next[idx] = v;
    onChange(next);
    setEditIdx(null);
  };

  return (
    <View style={styles.listEditorWrapper}>
      <View style={styles.tagInputRow}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder={placeholder}
          placeholderTextColor="#52525b"
          multiline
          numberOfLines={2}
          editable={values.length < max}
          style={[styles.textInput, styles.listEditorTextarea]}
        />
        <TouchableOpacity
          onPress={add}
          disabled={!draft.trim() || values.length >= max}
          style={[styles.addIconBtn, { alignSelf: "flex-end" }]}
          activeOpacity={0.7}
        >
          <Plus size={16} color="#f4f4f5" />
        </TouchableOpacity>
      </View>
      <Text style={styles.counterText}>
        {values.length}/{max} · Enter to add
      </Text>
      {values.length > 0 && (
        <View style={{ gap: 8 }}>
          {values.map((v, i) => (
            <View key={i} style={styles.listItem}>
              {editIdx === i ? (
                <View style={styles.tagInputRow}>
                  <TextInput
                    value={editVal}
                    onChangeText={setEditVal}
                    multiline
                    numberOfLines={2}
                    autoFocus
                    style={[styles.textInput, { flex: 1 }]}
                  />
                  <View style={{ gap: 4 }}>
                    <TouchableOpacity
                      onPress={() => saveEdit(i)}
                      style={[
                        styles.addIconBtn,
                        { backgroundColor: "#be185d" },
                      ]}
                      activeOpacity={0.7}
                    >
                      <Check size={13} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setEditIdx(null)}
                      style={styles.addIconBtn}
                      activeOpacity={0.7}
                    >
                      <X size={13} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.listItemRow}>
                  <Text style={styles.listItemText} numberOfLines={3}>
                    {v}
                  </Text>
                  <View style={styles.listItemActions}>
                    <TouchableOpacity
                      onPress={() => {
                        setEditIdx(i);
                        setEditVal(v);
                      }}
                      style={styles.listItemActionBtn}
                      hitSlop={4}
                    >
                      <Pencil size={12} color="#a1a1aa" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => onChange(values.filter((_, j) => j !== i))}
                      style={styles.listItemActionBtn}
                      hitSlop={4}
                    >
                      <Trash2 size={12} color="#f87171" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function PaletteEditor({
  colors,
  onChange,
}: {
  colors: string[];
  onChange: (c: string[]) => void;
}) {
  const t = useTranslations("ProfileTabs.BrandingTab.identity");
  const MAX_COLORS = 6;

  const addColor = () => {
    if (colors.length >= MAX_COLORS) return;
    onChange([...colors, "#FFFFFF"]);
  };
  const removeColor = (idx: number) => {
    onChange(colors.filter((_, i) => i !== idx));
  };

  return (
    <View style={styles.paletteWrapper}>
      <View style={styles.paletteRow}>
        {colors.map((c, i) => (
          <View key={i} style={styles.paletteSlot}>
            <View style={[styles.paletteColor, { backgroundColor: c }]} />
            <Text style={styles.paletteHex}>{c.toUpperCase()}</Text>
            <TouchableOpacity
              onPress={() => removeColor(i)}
              style={styles.paletteRemoveBtn}
              hitSlop={2}
            >
              <X size={9} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}
        {colors.length < MAX_COLORS && (
          <TouchableOpacity
            onPress={addColor}
            style={styles.paletteAddBtn}
            activeOpacity={0.7}
          >
            <Plus size={16} color="#71717a" />
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.counterText}>{t("palette_hint")}</Text>
    </View>
  );
}

function PrivateSectionHeader({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.privateSectionHeader}>
      <View style={{ marginTop: 2 }}>{icon}</View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={styles.privateSectionTitleRow}>
          <Text style={styles.privateSectionTitle}>{title}</Text>
          <View style={styles.privateBadge}>
            <Lock size={9} color="#71717a" />
            <Text style={styles.privateBadgeText}> Private</Text>
          </View>
        </View>
        <Text style={styles.privateSectionDesc}>{description}</Text>
      </View>
    </View>
  );
}

// ─── Brand Tabs ────────────────────────────────────────────────────────────────

function BrandTabs({
  brands,
  activeBrandId,
  onSelect,
  onAdd,
  onDelete,
  limit,
  plan,
}: {
  brands: UserBranding[];
  activeBrandId: number | null;
  onSelect: (id: number) => void;
  onAdd: () => void;
  onDelete: (id: number) => void;
  limit: number;
  plan: string;
}) {
  const t = useTranslations("ProfileTabs.BrandingTab");
  const availableBrands = brands.filter((b) => b.is_available !== false);
  const lockedBrands = brands.filter((b) => b.is_available === false);
  const canAdd = availableBrands.length < limit;

  return (
    <View style={{ gap: 8 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.brandTabsRow}>
          {brands.map((brand) => {
            const isLocked = brand.is_available === false;
            const isActive = brand.id === activeBrandId;
            return (
              <View key={brand.id} style={{ position: "relative" }}>
                <TouchableOpacity
                  onPress={() => !isLocked && brand.id && onSelect(brand.id)}
                  disabled={isLocked}
                  activeOpacity={0.75}
                  style={[
                    styles.brandTab,
                    isLocked
                      ? styles.brandTabLocked
                      : isActive
                        ? styles.brandTabActive
                        : styles.brandTabInactive,
                  ]}
                >
                  {isLocked && <Lock size={12} color="#52525b" />}
                  <Text
                    style={[
                      styles.brandTabText,
                      isLocked
                        ? { color: "#52525b" }
                        : isActive
                          ? { color: "#f9a8d4" }
                          : { color: "#a1a1aa" },
                    ]}
                    numberOfLines={1}
                  >
                    {brand.business_name || t("tabs.untitled")}
                  </Text>
                  {isLocked && (
                    <Text style={styles.brandTabLockedText}>
                      {t("tabs.locked")}
                    </Text>
                  )}
                </TouchableOpacity>
                {!isLocked && availableBrands.length > 1 && (
                  <TouchableOpacity
                    onPress={() => brand.id && onDelete(brand.id)}
                    style={styles.brandTabDeleteBtn}
                    hitSlop={2}
                  >
                    <X size={9} color="#fff" />
                  </TouchableOpacity>
                )}
              </View>
            );
          })}

          {canAdd ? (
            <TouchableOpacity
              onPress={onAdd}
              style={styles.brandTabAdd}
              activeOpacity={0.7}
            >
              <Plus size={13} color="#a1a1aa" />
              <Text style={styles.brandTabAddText}>{t("tabs.add_brand")}</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.brandTabLimit}>
              <Crown size={13} color="#eab308" />
              <Text style={styles.brandTabLimitText}>
                {t("tabs.limit_reached", { plan, limit: String(limit) })}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {lockedBrands.length > 0 && (
        <View style={styles.lockedNotice}>
          <Lock size={12} color="#eab308" />
          <Text style={styles.lockedNoticeText}>
            {t("tabs.locked_notice", { count: String(lockedBrands.length) })}
          </Text>
        </View>
      )}
    </View>
  );
}

// ─── Brand Form (single brand editor) ────────────────────────────────────────

interface BrandFormProps {
  branding: UserBranding;
  saving: boolean;
  dirty: boolean;
  uploadingLogo: boolean;
  uploadingBanner: boolean;
  uploadingProduct: number | null;
  nicheOpen: boolean;
  nicheSearch: string;
  filteredNiches: NicheSuggestion[];
  onPatch: <K extends keyof UserBranding>(
    key: K,
    value: UserBranding[K],
  ) => void;
  onPatchSocial: (platform: string, value: string) => void;
  onPatchContact: (channel: string, value: string) => void;
  onApplyNiche: (n: NicheSuggestion) => void;
  onSetNicheOpen: (o: boolean) => void;
  onSetNicheSearch: (s: string) => void;
  onLogoUpload: () => void;
  onBannerUpload: () => void;
  onProductUpload: (idx: number) => void;
  onRemoveProductImage: (idx: number) => void;
  onSave: () => void;
}

function BrandForm({
  branding,
  saving,
  dirty,
  uploadingLogo,
  uploadingBanner,
  uploadingProduct,
  nicheOpen,
  nicheSearch,
  filteredNiches,
  onPatch,
  onPatchSocial,
  onPatchContact,
  onApplyNiche,
  onSetNicheOpen,
  onSetNicheSearch,
  onLogoUpload,
  onBannerUpload,
  onProductUpload,
  onRemoveProductImage,
  onSave,
}: BrandFormProps) {
  const t = useTranslations("ProfileTabs.BrandingTab");
  const tUpload = useTranslations("ProfileTabs.BrandingTab.upload");
  const tSocial = useTranslations("ProfileTabs.BrandingTab.social");
  const tTags = useTranslations("ProfileTabs.BrandingTab.tags");
  const tLoc = useTranslations("ProfileTabs.BrandingTab.locations");
  const tId = useTranslations("ProfileTabs.BrandingTab.identity");
  const tContact = useTranslations("ProfileTabs.BrandingTab.contact");
  const tCommon = useTranslations("ProfileTabs.common");

  return (
    <View style={{ gap: 32 }}>
      {/* Status badge */}
      <StatusBadge
        status={branding.status}
        rejectionNote={branding.rejection_note}
      />

      {/* ── Media ──────────────────────────────────────────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("media.title")}</Text>
        <ImageUploadSlot
          label={tUpload("banner_label")}
          url={branding.banner_url}
          onUpload={onBannerUpload}
          onRemove={() => onPatch("banner_url", null)}
          uploading={uploadingBanner}
          aspect="wide"
        />
        <ImageUploadSlot
          label={tUpload("logo_label")}
          url={branding.logo_url}
          onUpload={onLogoUpload}
          onRemove={() => onPatch("logo_url", null)}
          uploading={uploadingLogo}
          aspect="square"
        />
        <View style={{ gap: 8 }}>
          <Text style={styles.fieldLabel}>
            {tUpload("product_images_label", {
              max: String(MAX_PRODUCT_IMAGES),
            })}
          </Text>
          <View style={styles.productImagesGrid}>
            {Array.from({ length: MAX_PRODUCT_IMAGES }).map((_, i) => (
              <ImageUploadSlot
                key={i}
                label=""
                url={branding.product_images[i] ?? null}
                onUpload={() => onProductUpload(i)}
                onRemove={() => onRemoveProductImage(i)}
                uploading={uploadingProduct === i}
                aspect="square"
              />
            ))}
          </View>
        </View>
      </View>

      {/* ── Basic Info ─────────────────────────────────────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("basic_info.title")}</Text>
        <View style={styles.fieldWrapper}>
          <Text style={styles.fieldLabel}>
            {t("basic_info.business_name")}{" "}
            <Text style={{ color: "#ec4899" }}>*</Text>
          </Text>
          <TextInput
            value={branding.business_name}
            onChangeText={(v) => onPatch("business_name", v)}
            placeholder={t("basic_info.business_name_placeholder")}
            placeholderTextColor="#52525b"
            maxLength={100}
            style={styles.textInput}
          />
        </View>
        <View style={styles.fieldWrapper}>
          <View style={styles.fieldLabelRow}>
            <Text style={styles.fieldLabel}>{t("basic_info.bio")}</Text>
            <Text style={styles.counterText}>
              {branding.bio.length}/{MAX_BIO}
            </Text>
          </View>
          <TextInput
            value={branding.bio}
            onChangeText={(v) => onPatch("bio", v.slice(0, MAX_BIO))}
            placeholder={t("basic_info.bio_placeholder")}
            placeholderTextColor="#52525b"
            multiline
            numberOfLines={4}
            style={[styles.textInput, styles.textarea]}
          />
        </View>
        <View style={styles.fieldWrapper}>
          <View style={styles.fieldLabelRow}>
            <Globe size={13} color="#d4d4d8" />
            <Text style={styles.fieldLabel}>{t("basic_info.website")}</Text>
          </View>
          <TextInput
            value={branding.website}
            onChangeText={(v) => onPatch("website", v)}
            placeholder={t("basic_info.website_placeholder")}
            placeholderTextColor="#52525b"
            keyboardType="url"
            autoCapitalize="none"
            style={styles.textInput}
          />
        </View>
      </View>

      {/* ── Niche ──────────────────────────────────────────────────────────── */}
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <Zap size={15} color="#ec4899" />
          <Text style={styles.sectionTitle}>{tId("niche_title")}</Text>
        </View>
        <Text style={styles.sectionDesc}>{tId("niche_description")}</Text>
        <View style={styles.tagInputRow}>
          <TextInput
            value={branding.niche}
            onChangeText={(v) => onPatch("niche", v)}
            placeholder={tId("niche_placeholder")}
            placeholderTextColor="#52525b"
            style={[styles.textInput, { flex: 1 }]}
          />
          <TouchableOpacity
            onPress={() => onSetNicheOpen(!nicheOpen)}
            style={styles.addIconBtn}
            activeOpacity={0.7}
          >
            <ChevronDown
              size={16}
              color="#f4f4f5"
              style={{ transform: [{ rotate: nicheOpen ? "180deg" : "0deg" }] }}
            />
          </TouchableOpacity>
        </View>
        {nicheOpen && (
          <View style={styles.nicheDropdown}>
            <TextInput
              value={nicheSearch}
              onChangeText={onSetNicheSearch}
              placeholder={tId("niche_search_placeholder")}
              placeholderTextColor="#52525b"
              style={[styles.textInput, { margin: 8, marginBottom: 0 }]}
              autoFocus
            />
            <ScrollView style={{ maxHeight: 220 }} nestedScrollEnabled>
              {filteredNiches.length === 0 ? (
                <Text
                  style={[
                    styles.counterText,
                    { textAlign: "center", padding: 16 },
                  ]}
                >
                  {tId("niche_no_results")}
                </Text>
              ) : (
                filteredNiches.map((n) => (
                  <TouchableOpacity
                    key={n.label}
                    onPress={() => onApplyNiche(n)}
                    style={styles.nicheItem}
                    activeOpacity={0.7}
                  >
                    <View style={styles.nichePaletteRow}>
                      {n.palette.map((c, i) => (
                        <View
                          key={i}
                          style={[
                            styles.nichePaletteChip,
                            i === 0 && {
                              borderTopLeftRadius: 3,
                              borderBottomLeftRadius: 3,
                            },
                            i === n.palette.length - 1 && {
                              borderTopRightRadius: 3,
                              borderBottomRightRadius: 3,
                            },
                            { backgroundColor: c },
                          ]}
                        />
                      ))}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.nicheLabel}>{n.label}</Text>
                      <Text style={styles.nicheFont}>{n.font}</Text>
                    </View>
                    {branding.niche === n.label && (
                      <Check size={13} color="#ec4899" />
                    )}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        )}
      </View>

      {/* ── Color Palette ──────────────────────────────────────────────────── */}
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <Palette size={15} color="#ec4899" />
          <Text style={styles.sectionTitle}>{tId("palette_title")}</Text>
        </View>
        <Text style={styles.sectionDesc}>{tId("palette_description")}</Text>
        <PaletteEditor
          colors={branding.color_palette}
          onChange={(c) => onPatch("color_palette", c)}
        />
      </View>

      {/* ── Typography ─────────────────────────────────────────────────────── */}
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <Type size={15} color="#ec4899" />
          <Text style={styles.sectionTitle}>{tId("typography_title")}</Text>
        </View>
        <Text style={styles.sectionDesc}>{tId("typography_description")}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.fontRow}>
            {FONT_OPTIONS.map((font) => (
              <TouchableOpacity
                key={font}
                onPress={() => onPatch("typography", font)}
                activeOpacity={0.7}
                style={[
                  styles.fontChip,
                  branding.typography === font
                    ? styles.fontChipActive
                    : styles.fontChipInactive,
                ]}
              >
                <Text
                  style={[
                    styles.fontChipText,
                    branding.typography === font
                      ? { color: "#f9a8d4" }
                      : { color: "#a1a1aa" },
                  ]}
                >
                  {font}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        <View style={styles.fieldLabelRow}>
          <Text style={styles.counterText}>{tId("typography_custom")}</Text>
          <TextInput
            value={
              FONT_OPTIONS.includes(branding.typography)
                ? ""
                : branding.typography
            }
            onChangeText={(v) => onPatch("typography", v)}
            placeholder="e.g. DM Sans"
            placeholderTextColor="#52525b"
            style={[styles.textInput, { flex: 1 }]}
          />
        </View>
        {!!branding.typography && (
          <Text style={[styles.typographyPreview]}>
            {branding.business_name || "Your Brand Name"}
          </Text>
        )}
      </View>

      {/* ── Locations ──────────────────────────────────────────────────────── */}
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <MapPin size={15} color="#ec4899" />
          <Text style={styles.sectionTitle}>{tLoc("title")}</Text>
        </View>
        <TagInput
          values={branding.locations}
          onChange={(v) => onPatch("locations", v)}
          max={MAX_LOCATIONS}
          placeholder={tLoc("placeholder")}
        />
      </View>

      {/* ── Tags ───────────────────────────────────────────────────────────── */}
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <Tag size={15} color="#ec4899" />
          <Text style={styles.sectionTitle}>{tTags("title")}</Text>
        </View>
        <TagInput
          values={branding.tags}
          onChange={(v) => onPatch("tags", v)}
          max={MAX_TAGS}
          placeholder={tTags("placeholder")}
        />
      </View>

      {/* ── Social ─────────────────────────────────────────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{tSocial("title")}</Text>
        <View style={{ gap: 12 }}>
          {SOCIAL_PLATFORMS.map(({ key, label, placeholder }) => (
            <View key={key} style={styles.fieldWrapper}>
              <Text style={styles.fieldLabel}>{tSocial(label)}</Text>
              <TextInput
                value={branding.social_links[key] ?? ""}
                onChangeText={(v) => onPatchSocial(key, v)}
                placeholder={tSocial(placeholder)}
                placeholderTextColor="#52525b"
                keyboardType="url"
                autoCapitalize="none"
                style={styles.textInput}
              />
            </View>
          ))}
        </View>
      </View>

      {/* ── Contact ────────────────────────────────────────────────────────── */}
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <Phone size={15} color="#ec4899" />
          <Text style={styles.sectionTitle}>{tContact("title")}</Text>
        </View>
        <Text style={styles.sectionDesc}>{tContact("description")}</Text>
        <View style={{ gap: 12 }}>
          {CONTACT_CHANNELS.map(
            ({ key, label, placeholder, keyboardType, icon }) => (
              <View key={key} style={styles.fieldWrapper}>
                <Text style={styles.fieldLabel}>
                  {icon} {tContact(label)}
                </Text>
                <TextInput
                  value={branding.contact_links[key] ?? ""}
                  onChangeText={(v) => onPatchContact(key, v)}
                  placeholder={tContact(placeholder)}
                  placeholderTextColor="#52525b"
                  keyboardType={keyboardType}
                  autoCapitalize="none"
                  style={styles.textInput}
                />
              </View>
            ),
          )}
        </View>
      </View>

      {/* ── Visibility ─────────────────────────────────────────────────────── */}
      <View style={styles.visibilityRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.visibilityTitle}>{t("visibility.title")}</Text>
          <Text style={styles.sectionDesc}>{t("visibility.description")}</Text>
        </View>
        <TouchableOpacity
          onPress={() => onPatch("is_public", !branding.is_public)}
          activeOpacity={0.8}
          style={[
            styles.toggle,
            branding.is_public ? styles.toggleOn : styles.toggleOff,
          ]}
        >
          <View
            style={[
              styles.toggleThumb,
              branding.is_public ? styles.toggleThumbOn : styles.toggleThumbOff,
            ]}
          />
        </TouchableOpacity>
      </View>

      {/* ── Review notice ──────────────────────────────────────────────────── */}
      <View style={styles.reviewNotice}>
        <Clock
          size={13}
          color="#eab308"
          style={{ marginTop: 2, flexShrink: 0 }}
        />
        <Text style={styles.reviewNoticeText}>
          {t("review_notice.part1")}{" "}
          <Text style={{ color: "#d4d4d8", fontWeight: "600" }}>
            {t("review_notice.part2")}
          </Text>{" "}
          {t("review_notice.part3")}
        </Text>
      </View>

      {/* ── Save button ────────────────────────────────────────────────────── */}
      <View style={styles.saveRow}>
        <TouchableOpacity
          onPress={onSave}
          disabled={saving || !dirty}
          activeOpacity={0.8}
          style={[styles.saveBtn, (saving || !dirty) && { opacity: 0.5 }]}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>{t("save_button")}</Text>
          )}
        </TouchableOpacity>
        {!!branding.updated_at && (
          <Text style={styles.counterText}>
            {t("last_saved")} {new Date(branding.updated_at).toLocaleString()}
          </Text>
        )}
      </View>
    </View>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

interface BrandingTabProps {
  userId: string;
  currentPlan: string;
}

export function BrandingTab({ userId, currentPlan }: BrandingTabProps) {
  const t = useTranslations("ProfileTabs.BrandingTab");
  const tPriv = useTranslations("ProfileTabs.BrandingTab.private");
  const tCommon = useTranslations("ProfileTabs.common");

  const brandLimit = PLAN_LIMITS[currentPlan] ?? 1;

  const [brands, setBrands] = useState<UserBranding[]>([]);
  const [activeBrandId, setActiveBrandId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [branding, setBranding] = useState<UserBranding>(EMPTY_BRANDING);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [nicheOpen, setNicheOpen] = useState(false);
  const [nicheSearch, setNicheSearch] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingProduct, setUploadingProduct] = useState<number | null>(null);
  const [priv, setPriv] = useState<BrandingPrivateConfig>(EMPTY_PRIVATE);
  const [privDirty, setPrivDirty] = useState(false);
  const [savingPriv, setSavingPriv] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const headers = await authHeaders();
      const [brandRes, privRes] = await Promise.all([
        fetch(`${BASE_URL}/api/user-branding/get-branding`, { headers })
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null),
        fetchPrivateConfig(),
      ]);
      if (!cancelled) {
        const loadedBrands: UserBranding[] = brandRes?.brandings ?? [];
        setBrands(loadedBrands);
        const firstAvailable = loadedBrands.find(
          (b) => b.is_available !== false,
        );
        if (firstAvailable?.id) {
          setActiveBrandId(firstAvailable.id);
          setBranding(firstAvailable);
        }
        setPriv(privRes);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const handleSelectBrand = useCallback(
    (id: number) => {
      setActiveBrandId(id);
      setIsCreatingNew(false);
      const found = brands.find((b) => b.id === id);
      if (found) {
        setBranding(found);
        setDirty(false);
      }
    },
    [brands],
  );

  const patch = useCallback(
    <K extends keyof UserBranding>(key: K, value: UserBranding[K]) => {
      setBranding((prev) => ({ ...prev, [key]: value }));
      setDirty(true);
    },
    [],
  );

  const patchSocial = (platform: string, value: string) => {
    const next = { ...branding.social_links };
    if (value) next[platform] = value;
    else delete next[platform];
    patch("social_links", next);
  };

  const patchContact = (channel: string, value: string) => {
    const next = { ...branding.contact_links };
    if (value) next[channel] = value;
    else delete next[channel];
    patch("contact_links", next);
  };

  const patchPriv = useCallback(
    <K extends keyof BrandingPrivateConfig>(
      key: K,
      value: BrandingPrivateConfig[K],
    ) => {
      setPriv((prev) => ({ ...prev, [key]: value }));
      setPrivDirty(true);
    },
    [],
  );

  const applyNiche = (suggestion: NicheSuggestion) => {
    setBranding((prev) => ({
      ...prev,
      niche: suggestion.label,
      color_palette: suggestion.palette,
      typography: suggestion.font,
    }));
    setDirty(true);
    setNicheOpen(false);
    setNicheSearch("");
  };

  const filteredNiches = nicheSearch.trim()
    ? NICHE_SUGGESTIONS.filter((n) =>
        n.label.toLowerCase().includes(nicheSearch.toLowerCase()),
      )
    : NICHE_SUGGESTIONS;

  const handleAddBrand = () => {
    setBranding({ ...EMPTY_BRANDING });
    setActiveBrandId(null);
    setIsCreatingNew(true);
    setDirty(true);
  };

  const handleDeleteBrand = async (id: number) => {
    Alert.alert(t("tabs.delete_confirm"), undefined, [
      { text: tCommon("cancel"), style: "cancel" },
      {
        text: tCommon("confirm"),
        style: "destructive",
        onPress: async () => {
          const headers = await authHeaders();
          const res = await fetch(
            `${BASE_URL}/api/user-branding/delete-branding/${id}`,
            { method: "DELETE", headers },
          );
          if (!res.ok) return;
          const next = brands.filter((b) => b.id !== id);
          setBrands(next);
          const nextAvailable = next.find((b) => b.is_available !== false);
          if (nextAvailable?.id) {
            setActiveBrandId(nextAvailable.id);
            setBranding(nextAvailable);
          } else {
            setActiveBrandId(null);
            setBranding(EMPTY_BRANDING);
          }
          setIsCreatingNew(false);
          setDirty(false);
        },
      },
    ]);
  };

  const requireBrandId = (): number | null => {
    if (activeBrandId) return activeBrandId;
    Alert.alert(t("toast.save_first"));
    return null;
  };

  const handleLogoUpload = async () => {
    const id = requireBrandId();
    if (!id) return;
    const uri = await pickImage();
    if (!uri) return;
    setUploadingLogo(true);
    try {
      const url = await uploadMedia(uri, "logo", id);
      if (url) patch("logo_url", url);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleBannerUpload = async () => {
    const id = requireBrandId();
    if (!id) return;
    const uri = await pickImage();
    if (!uri) return;
    setUploadingBanner(true);
    try {
      const url = await uploadMedia(uri, "banner", id);
      if (url) patch("banner_url", url);
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleProductUpload = async (idx: number) => {
    const id = requireBrandId();
    if (!id) return;
    const uri = await pickImage();
    if (!uri) return;
    setUploadingProduct(idx);
    try {
      const url = await uploadMedia(uri, "product", id);
      if (url) {
        const next = [...branding.product_images];
        if (idx < next.length) next[idx] = url;
        else next.push(url);
        patch("product_images", next);
      }
    } finally {
      setUploadingProduct(null);
    }
  };

  const removeProductImage = (idx: number) => {
    patch(
      "product_images",
      branding.product_images.filter((_, i) => i !== idx),
    );
  };

  const handleSave = async () => {
    if (!branding.business_name.trim()) {
      Alert.alert(t("toast.name_required"));
      return;
    }
    setSaving(true);
    try {
      const headers = await authHeaders();
      const body = activeBrandId
        ? { ...branding, brand_id: activeBrandId }
        : branding;
      const res = await fetch(`${BASE_URL}/api/user-branding/save-branding`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) return;
      const data = await res.json();
      const saved: UserBranding = data.branding;
      setBrands((prev) => {
        const exists = prev.find((b) => b.id === saved.id);
        if (exists) return prev.map((b) => (b.id === saved.id ? saved : b));
        return [...prev, saved];
      });
      setActiveBrandId(saved.id ?? null);
      setBranding(saved);
      setDirty(false);
      setIsCreatingNew(false);
    } finally {
      setSaving(false);
    }
  };

  const handleSavePrivate = async () => {
    setSavingPriv(true);
    await savePrivateConfig(priv);
    setSavingPriv(false);
    setPrivDirty(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingWrapper}>
        <ActivityIndicator size="small" color="#a1a1aa" />
        <Text style={styles.loadingText}>{t("loading")}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View>
        <View style={styles.sectionTitleRow}>
          <Building2 size={16} color="#ec4899" />
          <Text style={styles.pageTitle}>{t("title")}</Text>
        </View>
        <Text style={styles.sectionDesc}>{t("subtitle")}</Text>
      </View>

      {/* ── Brand tabs ─────────────────────────────────────────────────────── */}
      <BrandTabs
        brands={brands}
        activeBrandId={activeBrandId}
        onSelect={handleSelectBrand}
        onAdd={handleAddBrand}
        onDelete={handleDeleteBrand}
        limit={brandLimit}
        plan={currentPlan}
      />

      {/* ── Brand form or empty state ───────────────────────────────────────── */}
      {brands.filter((b) => b.is_available !== false).length === 0 &&
      activeBrandId === null &&
      !isCreatingNew ? (
        <View style={styles.emptyState}>
          <Building2 size={40} color="#3f3f46" />
          <Text style={styles.emptyStateText}>{t("tabs.no_brands")}</Text>
          <TouchableOpacity
            onPress={handleAddBrand}
            style={styles.saveBtn}
            activeOpacity={0.8}
          >
            <Plus size={16} color="#fff" />
            <Text style={styles.saveBtnText}>{t("tabs.add_first_brand")}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <BrandForm
          branding={branding}
          saving={saving}
          dirty={dirty}
          uploadingLogo={uploadingLogo}
          uploadingBanner={uploadingBanner}
          uploadingProduct={uploadingProduct}
          nicheOpen={nicheOpen}
          nicheSearch={nicheSearch}
          filteredNiches={filteredNiches}
          onPatch={patch}
          onPatchSocial={patchSocial}
          onPatchContact={patchContact}
          onApplyNiche={applyNiche}
          onSetNicheOpen={setNicheOpen}
          onSetNicheSearch={setNicheSearch}
          onLogoUpload={handleLogoUpload}
          onBannerUpload={handleBannerUpload}
          onProductUpload={handleProductUpload}
          onRemoveProductImage={removeProductImage}
          onSave={handleSave}
        />
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          PRIVATE SECTION
      ══════════════════════════════════════════════════════════════════════ */}
      <View style={styles.privateSection}>
        <View style={styles.privateNoticeRow}>
          <Lock size={13} color="#71717a" />
          <Text style={styles.counterText}>{tPriv("section_note")}</Text>
        </View>

        <View style={styles.section}>
          <PrivateSectionHeader
            icon={<Mic2 size={16} color="#ec4899" />}
            title={tPriv("voice_tone_title")}
            description={tPriv("voice_tone_description")}
          />
          <TextInput
            value={priv.voice_tone}
            onChangeText={(v) => patchPriv("voice_tone", v)}
            placeholder={tPriv("voice_tone_placeholder")}
            placeholderTextColor="#52525b"
            multiline
            numberOfLines={4}
            style={[styles.textInput, styles.textarea]}
          />
        </View>

        <View style={styles.section}>
          <PrivateSectionHeader
            icon={<Zap size={16} color="#ec4899" />}
            title={tPriv("hooks_title")}
            description={tPriv("hooks_description")}
          />
          <ListEditor
            values={priv.hooks}
            onChange={(v) => patchPriv("hooks", v)}
            max={MAX_HOOKS}
            placeholder={tPriv("hooks_placeholder")}
            addLabel={tPriv("hooks_add")}
          />
        </View>

        <View style={styles.section}>
          <PrivateSectionHeader
            icon={<MessageSquare size={16} color="#ec4899" />}
            title={tPriv("prompts_title")}
            description={tPriv("prompts_description")}
          />
          <ListEditor
            values={priv.prompts}
            onChange={(v) => patchPriv("prompts", v)}
            max={MAX_PROMPTS}
            placeholder={tPriv("prompts_placeholder")}
            addLabel={tPriv("prompts_add")}
          />
        </View>

        <View style={styles.saveRow}>
          <TouchableOpacity
            onPress={handleSavePrivate}
            disabled={savingPriv || !privDirty}
            activeOpacity={0.8}
            style={[
              styles.saveBtn,
              styles.saveBtnGray,
              (savingPriv || !privDirty) && { opacity: 0.5 },
            ]}
          >
            {savingPriv ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveBtnText}>{tPriv("save_button")}</Text>
            )}
          </TouchableOpacity>
          <View style={styles.saveNoteRow}>
            <Lock size={12} color="#71717a" />
            <Text style={styles.counterText}>{tPriv("save_note")}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    gap: 32,
    paddingBottom: 40,
  },
  loadingWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    color: "#a1a1aa",
  },
  pageTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#f4f4f5",
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "500",
    color: "#d4d4d8",
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sectionDesc: {
    fontSize: 12,
    color: "#71717a",
  },
  fieldWrapper: {
    gap: 6,
  },
  fieldLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12,
    color: "#a1a1aa",
  },
  textInput: {
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#27272a",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#fff",
    fontSize: 14,
  },
  textarea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  counterText: {
    fontSize: 11,
    color: "#52525b",
  },
  // Status
  statusWrapper: {
    gap: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  rejectionNote: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  rejectionNoteText: {
    fontSize: 12,
    color: "#f87171",
  },
  // Image upload
  imageSlotWrapper: {
    gap: 6,
  },
  imageSlot: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#3f3f46",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "rgba(9,9,11,0.5)",
  },
  imageSlotWide: {
    width: "100%",
    height: 120,
  },
  imageSlotSquare: {
    width: 108,
    height: 108,
  },
  imageSlotImg: {
    width: "100%",
    height: "100%",
  },
  imageSlotOverlay: {
    ...(StyleSheet.absoluteFillObject as any),
    backgroundColor: "rgba(0,0,0,0.5)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  imageSlotBtnRed: {
    padding: 7,
    borderRadius: 9999,
    backgroundColor: "rgba(239,68,68,0.8)",
  },
  imageSlotBtnGray: {
    padding: 7,
    borderRadius: 9999,
    backgroundColor: "rgba(63,63,70,0.8)",
  },
  imageSlotEmpty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  imageSlotEmptyText: {
    fontSize: 11,
    color: "#71717a",
  },
  productImagesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  // Tag input
  tagInputWrapper: {
    gap: 8,
  },
  tagInputRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  tagTextInput: {
    flex: 1,
  },
  addIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: "#27272a",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tagChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#27272a",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  tagChipText: {
    fontSize: 12,
    color: "#d4d4d8",
  },
  // List editor
  listEditorWrapper: {
    gap: 8,
  },
  listEditorTextarea: {
    flex: 1,
    minHeight: 60,
    textAlignVertical: "top",
  },
  listItem: {
    borderWidth: 1,
    borderColor: "rgba(63,63,70,0.6)",
    borderRadius: 8,
    backgroundColor: "rgba(24,24,27,0.6)",
    padding: 10,
  },
  listItemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  listItemText: {
    flex: 1,
    fontSize: 13,
    color: "#d4d4d8",
    lineHeight: 19,
  },
  listItemActions: {
    flexDirection: "row",
    gap: 4,
    flexShrink: 0,
  },
  listItemActionBtn: {
    padding: 5,
    borderRadius: 6,
    backgroundColor: "#27272a",
  },
  // Palette
  paletteWrapper: {
    gap: 8,
  },
  paletteRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    alignItems: "center",
  },
  paletteSlot: {
    alignItems: "center",
    gap: 3,
    position: "relative",
  },
  paletteColor: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#3f3f46",
  },
  paletteHex: {
    fontSize: 9,
    color: "#71717a",
    fontFamily: "monospace",
  },
  paletteRemoveBtn: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 15,
    height: 15,
    borderRadius: 9999,
    backgroundColor: "#dc2626",
    alignItems: "center",
    justifyContent: "center",
  },
  paletteAddBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#3f3f46",
    alignItems: "center",
    justifyContent: "center",
  },
  // Niche dropdown
  nicheDropdown: {
    borderWidth: 1,
    borderColor: "#3f3f46",
    borderRadius: 12,
    backgroundColor: "#09090b",
    overflow: "hidden",
  },
  nicheItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(39,39,42,0.6)",
  },
  nichePaletteRow: {
    flexDirection: "row",
    flexShrink: 0,
  },
  nichePaletteChip: {
    width: 13,
    height: 18,
  },
  nicheLabel: {
    fontSize: 13,
    color: "#d4d4d8",
  },
  nicheFont: {
    fontSize: 11,
    color: "#52525b",
  },
  // Typography
  fontRow: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
  },
  fontChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  fontChipActive: {
    borderColor: "#ec4899",
    backgroundColor: "rgba(236,72,153,0.1)",
  },
  fontChipInactive: {
    borderColor: "#27272a",
    backgroundColor: "rgba(24,24,27,0.6)",
  },
  fontChipText: {
    fontSize: 13,
  },
  typographyPreview: {
    fontSize: 18,
    color: "#d4d4d8",
    marginTop: 4,
  },
  // Visibility toggle
  visibilityRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(9,9,11,0.5)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(39,39,42,0.6)",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  visibilityTitle: {
    fontSize: 13,
    fontWeight: "500",
    color: "#f4f4f5",
  },
  toggle: {
    width: 42,
    height: 24,
    borderRadius: 9999,
    justifyContent: "center",
    flexShrink: 0,
  },
  toggleOn: {
    backgroundColor: "#db2777",
  },
  toggleOff: {
    backgroundColor: "#3f3f46",
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 9999,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  toggleThumbOn: {
    alignSelf: "flex-end",
    marginRight: 2,
  },
  toggleThumbOff: {
    alignSelf: "flex-start",
    marginLeft: 2,
  },
  // Review notice
  reviewNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "rgba(9,9,11,0.4)",
    borderWidth: 1,
    borderColor: "rgba(39,39,42,0.6)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  reviewNoticeText: {
    flex: 1,
    fontSize: 12,
    color: "#71717a",
    lineHeight: 18,
  },
  // Save
  saveRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#be185d",
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 22,
  },
  saveBtnGray: {
    backgroundColor: "#3f3f46",
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  // Brand tabs
  brandTabsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 2,
  },
  brandTab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  brandTabActive: {
    borderColor: "#ec4899",
    backgroundColor: "rgba(236,72,153,0.1)",
  },
  brandTabInactive: {
    borderColor: "#27272a",
    backgroundColor: "rgba(24,24,27,0.6)",
  },
  brandTabLocked: {
    borderColor: "rgba(39,39,42,0.5)",
    backgroundColor: "rgba(9,9,11,0.3)",
  },
  brandTabText: {
    fontSize: 13,
    fontWeight: "500",
    maxWidth: 120,
  },
  brandTabLockedText: {
    fontSize: 10,
    color: "#52525b",
  },
  brandTabDeleteBtn: {
    position: "absolute",
    top: -5,
    right: -5,
    width: 16,
    height: 16,
    borderRadius: 9999,
    backgroundColor: "#dc2626",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  brandTabAdd: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#3f3f46",
  },
  brandTabAddText: {
    fontSize: 13,
    color: "#71717a",
  },
  brandTabLimit: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
  },
  brandTabLimitText: {
    fontSize: 11,
    color: "#52525b",
  },
  lockedNotice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(9,9,11,0.4)",
    borderWidth: 1,
    borderColor: "rgba(39,39,42,0.5)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  lockedNoticeText: {
    fontSize: 12,
    color: "#71717a",
  },
  // Empty state
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyStateText: {
    fontSize: 13,
    color: "#71717a",
  },
  // Private section
  privateSection: {
    paddingTop: 16,
    borderTopWidth: 2,
    borderStyle: "dashed",
    borderColor: "#27272a",
    gap: 28,
  },
  privateNoticeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  privateSectionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(39,39,42,0.6)",
  },
  privateSectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  privateSectionTitle: {
    fontSize: 13,
    fontWeight: "500",
    color: "#d4d4d8",
  },
  privateBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#27272a",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  privateBadgeText: {
    fontSize: 10,
    color: "#71717a",
  },
  privateSectionDesc: {
    fontSize: 12,
    color: "#52525b",
    marginTop: 2,
  },
  saveNoteRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
});

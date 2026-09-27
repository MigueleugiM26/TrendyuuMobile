import { useTranslations } from "@/src/hooks/useTranslations";
import {
  Bookmark,
  Camera,
  Check,
  Crown,
  Moon,
  Palette,
  Sparkles,
  Sun,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.72;

export default function AutoPresetDemoPreview() {
  const t = useTranslations("mainPage.autoPresetDemo");

  const CONFIG_STEPS = [
    {
      step: "estilo",
      label: t("steps.style"),
      value: t("stepValues.style"),
      Icon: Crown,
      color: "#60a5fa",
    },
    {
      step: "fundo",
      label: t("steps.background"),
      value: t("stepValues.background"),
      Icon: Palette,
      color: "#34d399",
    },
    {
      step: "iluminacao",
      label: t("steps.lighting"),
      value: t("stepValues.lighting"),
      Icon: Sun,
      color: "#fbbf24",
    },
    {
      step: "clima",
      label: t("steps.mood"),
      value: t("stepValues.mood"),
      Icon: Moon,
      color: "#fb7185",
    },
    {
      step: "angulo",
      label: t("steps.angle"),
      value: t("stepValues.angle"),
      Icon: Camera,
      color: "#818cf8",
    },
  ];

  const PRESETS_GRID = [
    { id: "limpo", name: t("presets.clean"), emoji: "🪞" },
    { id: "aconchegante", name: t("presets.cozy"), emoji: "🏠" },
    { id: "premium", name: t("presets.premium"), emoji: "👑", active: true },
    { id: "brincalhao", name: t("presets.playful"), emoji: "🎨" },
    { id: "elegante", name: t("presets.elegant"), emoji: "🌸" },
    { id: "energetico", name: t("presets.energetic"), emoji: "⚡" },
    { id: "ousado", name: t("presets.bold"), emoji: "🔥" },
    { id: "misterioso", name: t("presets.mysterious"), emoji: "🔲" },
  ];

  const GENERATED_OUTPUTS = [
    {
      url: "https://cdn-frontend.trendyuu.com/public/demo_produto_1.webp",
      title: t("results.outputs.0.title"),
      tagline: t("results.outputs.0.tagline"),
    },
    {
      url: "https://cdn-frontend.trendyuu.com/public/demo_produto_2.webp",
      title: t("results.outputs.1.title"),
      tagline: t("results.outputs.1.tagline"),
    },
    {
      url: "https://cdn-frontend.trendyuu.com/public/demo_produto_3.webp",
      title: t("results.outputs.2.title"),
      tagline: t("results.outputs.2.tagline"),
    },
  ];

  const [activeStepIndex, setActiveStepIndex] = useState(-1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Fade animation between editor and results
  const fadeAnim = useRef(new Animated.Value(1)).current;

  function crossfadeTo(next: () => void) {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
    setTimeout(next, 250);
  }

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (!showResults && !isGenerating) {
      if (activeStepIndex < CONFIG_STEPS.length - 1) {
        timer = setTimeout(() => setActiveStepIndex((p) => p + 1), 500);
      } else {
        timer = setTimeout(() => setIsGenerating(true), 600);
      }
    }
    if (isGenerating) {
      timer = setTimeout(() => {
        crossfadeTo(() => {
          setIsGenerating(false);
          setShowResults(true);
        });
      }, 2400);
    }
    if (showResults) {
      timer = setTimeout(() => {
        crossfadeTo(() => {
          setShowResults(false);
          setActiveStepIndex(-1);
        });
      }, 5500);
    }

    return () => clearTimeout(timer);
  }, [activeStepIndex, isGenerating, showResults]);

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headline}>
          {t("headline.main")} {t("headline.highlight")}
        </Text>
        <Text style={styles.subtitle}>{t("subtitle")}</Text>
      </View>

      {/* Main container */}
      <View style={styles.container}>
        <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
          {!showResults ? (
            <View style={styles.editorUI}>
              {/* Step badges */}
              <View style={styles.stepBadges}>
                {CONFIG_STEPS.map((item, idx) => {
                  const isSelected = idx <= activeStepIndex;
                  return (
                    <View
                      key={item.step}
                      style={[
                        styles.badge,
                        isSelected ? styles.badgeActive : styles.badgeInactive,
                      ]}
                    >
                      {isSelected && <Check size={10} color="#f9a8d4" />}
                      <Text
                        style={[
                          styles.badgeText,
                          isSelected
                            ? styles.badgeTextActive
                            : styles.badgeTextInactive,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </View>
                  );
                })}
              </View>

              {/* Saved presets row */}
              <View style={styles.savedPresetsRow}>
                <Text style={styles.presetsLabel}>{t("presets.title")}</Text>
                <View style={styles.savedPresetChip}>
                  <Bookmark size={10} color="#ec4899" />
                  <Text style={styles.savedPresetText}>
                    {t("savedPresets.eyewearCampaign")}
                  </Text>
                </View>
                <View
                  style={[styles.savedPresetChip, styles.savedPresetChipDim]}
                >
                  <Text style={styles.savedPresetTextDim}>
                    {t("savedPresets.creativeTest")}
                  </Text>
                </View>
              </View>

              {/* Presets grid — 4 cols */}
              <View style={styles.presetsGrid}>
                {PRESETS_GRID.map((card, idx) => {
                  const isHighlighted = activeStepIndex >= 0 && idx === 2;
                  return (
                    <View
                      key={card.id}
                      style={[
                        styles.presetCard,
                        isHighlighted && styles.presetCardActive,
                      ]}
                    >
                      <Text style={styles.presetEmoji}>{card.emoji}</Text>
                      <Text style={styles.presetName}>{card.name}</Text>
                    </View>
                  );
                })}
              </View>

              {/* Config panel */}
              <View style={styles.configPanel}>
                <Text style={styles.configTitle}>
                  {t("configuration.title")}
                </Text>
                <View style={styles.configGrid}>
                  {CONFIG_STEPS.map((config, idx) => {
                    const isFilled = idx <= activeStepIndex;
                    const { Icon } = config;
                    return (
                      <View
                        key={config.step}
                        style={[
                          styles.configCell,
                          config.step === "angulo" && styles.configCellFull,
                          !isFilled && styles.configCellDim,
                        ]}
                      >
                        <Icon
                          size={12}
                          color={isFilled ? config.color : "#52525b"}
                        />
                        <View>
                          <Text style={styles.configCellLabel}>
                            {config.label}
                          </Text>
                          <Text style={styles.configCellValue}>
                            {isFilled ? config.value : "—"}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>

                {/* Generate button */}
                <View style={styles.generateBtn}>
                  <View style={styles.generateBtnLeft}>
                    {isGenerating ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Sparkles size={14} color="#fff" fill="#fff" />
                    )}
                    <Text style={styles.generateBtnText}>
                      {isGenerating
                        ? t("configuration.processingButton")
                        : t("configuration.generateButton")}
                    </Text>
                  </View>
                  <Text style={styles.generateBtnCredits}>
                    {t("configuration.credits")}
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            /* Results: horizontal carousel matching screenshot */
            <View>
              <FlatList
                data={GENERATED_OUTPUTS}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={CARD_WIDTH + 12}
                decelerationRate="fast"
                contentContainerStyle={styles.carousel}
                keyExtractor={(_, i) => String(i)}
                renderItem={({ item }) => (
                  <View style={styles.resultCard}>
                    <View style={styles.resultBadge}>
                      <Text style={styles.resultBadgeText}>
                        {t("results.presetActive")}
                      </Text>
                    </View>
                    <Image
                      source={{ uri: item.url }}
                      style={styles.resultImage}
                      resizeMode="cover"
                    />
                    <View style={styles.resultOverlay}>
                      <Text style={styles.resultTitle}>{item.title}</Text>
                      <Text style={styles.resultTagline}>{item.tagline}</Text>
                    </View>
                  </View>
                )}
              />
            </View>
          )}
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: "#09090b",
    paddingVertical: 40,
    paddingHorizontal: 16,
  },
  header: { marginBottom: 24, gap: 12 },
  headline: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 14,
    color: "#a1a1aa",
    textAlign: "center",
    lineHeight: 22,
  },

  container: {
    backgroundColor: "#0d0d11",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    padding: 16,
    minHeight: 420,
  },

  editorUI: { gap: 14 },

  stepBadges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeActive: {
    backgroundColor: "rgba(236,72,153,0.1)",
    borderColor: "rgba(236,72,153,0.5)",
  },
  badgeInactive: {
    backgroundColor: "rgba(24,24,27,0.8)",
    borderColor: "#27272a",
  },
  badgeText: { fontSize: 11, fontWeight: "500" },
  badgeTextActive: { color: "#f9a8d4" },
  badgeTextInactive: { color: "#71717a" },

  savedPresetsRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  presetsLabel: {
    fontSize: 9,
    fontFamily: "monospace",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#71717a",
  },
  savedPresetChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#27272a",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  savedPresetChipDim: {
    backgroundColor: "rgba(24,24,27,0.5)",
    borderColor: "rgba(39,39,42,0.6)",
  },
  savedPresetText: { fontSize: 11, color: "#d4d4d8" },
  savedPresetTextDim: { fontSize: 11, color: "#71717a" },

  presetsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  presetCard: {
    width: "22%",
    aspectRatio: 1,
    backgroundColor: "rgba(24,24,27,0.4)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#27272a",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    padding: 6,
  },
  presetCardActive: {
    borderColor: "#ec4899",
    backgroundColor: "rgba(131,24,67,0.15)",
  },
  presetEmoji: { fontSize: 18 },
  presetName: {
    fontSize: 9,
    color: "#e4e4e7",
    textAlign: "center",
    fontWeight: "500",
  },

  configPanel: {
    backgroundColor: "#18181b",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    padding: 14,
    gap: 12,
  },
  configTitle: {
    fontSize: 9,
    fontFamily: "monospace",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    color: "#a1a1aa",
    textAlign: "center",
  },
  configGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  configCell: {
    width: "47%",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(24,24,27,0.9)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(63,63,70,0.8)",
    padding: 10,
  },
  configCellFull: { width: "100%" },
  configCellDim: { opacity: 0.3 },
  configCellLabel: { fontSize: 9, color: "#71717a", fontFamily: "monospace" },
  configCellValue: { fontSize: 11, fontWeight: "600", color: "#f4f4f5" },

  generateBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ec4899",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  generateBtnLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  generateBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
    letterSpacing: 0.5,
  },
  generateBtnCredits: {
    fontSize: 9,
    color: "rgba(255,255,255,0.7)",
    fontFamily: "monospace",
  },

  carousel: { paddingHorizontal: 4, gap: 12 },
  resultCard: {
    width: CARD_WIDTH,
    height: 320,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#27272a",
  },
  resultBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    zIndex: 2,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  resultBadgeText: { fontSize: 9, color: "#d4d4d8", fontFamily: "monospace" },
  resultImage: { width: "100%", height: "100%", position: "absolute" },
  resultOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
    backgroundColor: "rgba(0,0,0,0.7)",
    gap: 2,
  },
  resultTitle: {
    fontSize: 9,
    fontFamily: "monospace",
    color: "#ec4899",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  resultTagline: {
    fontSize: 11,
    fontWeight: "600",
    color: "#fff",
    lineHeight: 16,
  },
});

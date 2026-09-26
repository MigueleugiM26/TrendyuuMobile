import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTranslations } from "../../hooks/useTranslations";

const { width } = Dimensions.get("window");

// Same feature types as web
const FEATURE_TYPES = [
  "voices",
  "textToVideo",
  "clips",
  "captions",
  "filters",
  "template",
  "autoShort",
] as const;

// Feature images — same paths as web
const FEATURE_IMAGES: Record<string, any> = {
  clips: require("../../../assets/features_page/podcast_feature.jpeg"),
  captions: require("../../../assets/features_page/captions_feature.png"),
  filters: require("../../../assets/features_page/filtro_feature.png"),
  template: require("../../../assets/features_page/filtro_feature.png"),
  autoShort: require("../../../assets/features_page/filtro_feature.png"),
};

export default function FeaturesSection() {
  // Same namespace as web: "mainPage.featuresSection"
  const t = useTranslations("mainPage.featuresSection");
  const [activeIndex, setActiveIndex] = useState(0);
  const contentFade = useRef(new Animated.Value(1)).current;

  const selectFeature = (i: number) => {
    Animated.sequence([
      Animated.timing(contentFade, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(contentFade, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
    setActiveIndex(i);
  };

  const activeType = FEATURE_TYPES[activeIndex];
  const featureImage = FEATURE_IMAGES[activeType];

  return (
    <View style={styles.container}>
      {/* Feature selector — same as the vertical button list on web */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsRow}
        style={styles.tabsScroll}
      >
        {FEATURE_TYPES.map((type, i) => (
          <TouchableOpacity
            key={type}
            onPress={() => selectFeature(i)}
            style={[styles.tab, activeIndex === i && styles.tabActive]}
            activeOpacity={0.8}
          >
            {/* Exact key: t("mainPage.featuresSection.features.{type}.title") */}
            {activeIndex === i && <View style={styles.tabDot} />}
            <Text
              style={[
                styles.tabText,
                activeIndex === i && styles.tabTextActive,
              ]}
            >
              {t(`features.${type}.title`)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Feature detail */}
      <Animated.View style={[styles.detail, { opacity: contentFade }]}>
        {/* Number + subtitle header */}
        <View style={styles.detailHeader}>
          <Text style={styles.detailNumber}>
            {String(activeIndex + 1).padStart(2, "0")}
          </Text>
          <View style={styles.detailTitles}>
            <Text style={styles.detailTitle}>
              {t(`features.${activeType}.title`)}
            </Text>
            <Text style={styles.detailSubtitle}>
              {t(`features.${activeType}.subtitle`)}
            </Text>
          </View>
        </View>

        {/* Description */}
        <Text style={styles.detailDescription}>
          {t(`features.${activeType}.description`)}
        </Text>

        {/* Extra features (voices + templates have them) */}
        {activeType === "voices" && (
          <View style={styles.extras}>
            {[1, 2, 3].map((n) => (
              <View key={n} style={styles.extraBadge}>
                <Text style={styles.extraText}>
                  {t(`features.voices.extraFeatures.feature${n}`)}
                </Text>
              </View>
            ))}
          </View>
        )}
        {activeType === "template" && (
          <View style={styles.extras}>
            {[1, 2, 3, 4].map((n) => (
              <View key={n} style={styles.extraBadge}>
                <Text style={styles.extraText}>
                  {t(`features.templates.features.feature${n}`)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Feature image if available */}
        {featureImage && (
          <Image
            source={featureImage}
            style={styles.featureImage}
            resizeMode="cover"
          />
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width,
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  tabsScroll: {
    marginLeft: -24,
    marginRight: -24,
    marginBottom: 32,
  },
  tabsRow: {
    paddingHorizontal: 24,
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 36,
    paddingRight: 20,
    paddingVertical: 12,
    borderRadius: 100,
    position: "relative",
  },
  tabActive: {},
  tabDot: {
    position: "absolute",
    left: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ffffff",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#52525b", // zinc-600 / inactive
    opacity: 0.6,
  },
  tabTextActive: {
    color: "#ffffff",
    opacity: 1,
  },
  detail: {
    gap: 16,
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
    marginBottom: 8,
  },
  detailNumber: {
    fontSize: 64,
    fontWeight: "900",
    color: "#3f3f46", // zinc-700
    lineHeight: 70,
  },
  detailTitles: {
    flex: 1,
    paddingTop: 8,
  },
  detailTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 4,
  },
  detailSubtitle: {
    fontSize: 14,
    color: "#a1a1aa",
  },
  detailDescription: {
    fontSize: 15,
    color: "#a1a1aa",
    lineHeight: 24,
  },
  extras: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  extraBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#3f3f46",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  extraText: {
    color: "#d4d4d8",
    fontSize: 13,
  },
  featureImage: {
    width: "100%",
    height: 260,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#27272a",
    marginTop: 8,
  },
});

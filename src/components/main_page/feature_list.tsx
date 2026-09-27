import { useTranslations } from "@/src/hooks/useTranslations";
import { ResizeMode, Video } from "expo-av";
import { Image, StyleSheet, Text, View } from "react-native";

interface FeatureItem {
  id: string;
  titleKey: string;
  descKey: string;
  mediaType: "image" | "video";
  mediaSrc: string;
  posterSrc?: string;
}

export default function FeatureGridSection() {
  const t = useTranslations("mainPage.features");

  const features: FeatureItem[] = [
    {
      id: "1",
      titleKey: "items.trendAds.title",
      descKey: "items.trendAds.description",
      mediaType: "video",
      mediaSrc: "https://cdn-frontend.trendyuu.com/public/video_anuncio.webm",
      posterSrc:
        "https://images.unsplash.com/photo-1536240478700-b869070f9279?q=80&w=1000&auto=format&fit=crop",
    },
    {
      id: "2",
      titleKey: "items.trendEcommerce.title",
      descKey: "items.trendEcommerce.description",
      mediaType: "image",
      mediaSrc:
        "https://cdn-frontend.trendyuu.com/public/product_showcase.webp",
    },
    {
      id: "3",
      titleKey: "items.trendProduct.title",
      descKey: "items.trendProduct.description",
      mediaType: "video",
      mediaSrc:
        "https://cdn-frontend.trendyuu.com/public/product_showcase_tenis.webm",
    },
  ];

  return (
    <View style={styles.root}>
      <Text style={styles.titleLine1}>{t("header.titleLine1")}</Text>
      <Text style={styles.titleLine2}>{t("header.titleLine2")}</Text>

      {/* Vertical stack of cards */}
      {features.map((feature) => (
        <View key={feature.id} style={styles.card}>
          <View style={styles.media}>
            {feature.mediaType === "video" ? (
              <Video
                source={{ uri: feature.mediaSrc }}
                posterSource={
                  feature.posterSrc ? { uri: feature.posterSrc } : undefined
                }
                resizeMode={ResizeMode.COVER}
                shouldPlay
                isLooping
                isMuted
                style={StyleSheet.absoluteFill}
              />
            ) : (
              <Image
                source={{ uri: feature.mediaSrc }}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
              />
            )}
          </View>
          <Text style={styles.cardTitle}>{t(feature.titleKey)}</Text>
          <Text style={styles.cardDesc}>{t(feature.descKey)}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingVertical: 40,
    paddingHorizontal: 16,
    gap: 12,
    backgroundColor: "#000",
  },
  titleLine1: {
    fontSize: 26,
    fontWeight: "500",
    color: "#fff",
    lineHeight: 34,
  },
  titleLine2: {
    fontSize: 26,
    fontWeight: "500",
    color: "#fff",
    lineHeight: 34,
    marginBottom: 12,
  },

  card: {
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#09090b",
    borderWidth: 1,
    borderColor: "#27272a",
  },
  media: { width: "100%", aspectRatio: 4 / 3 },

  cardTitle: {
    fontSize: 17,
    fontWeight: "500",
    color: "#fff",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
    lineHeight: 24,
  },
  cardDesc: {
    fontSize: 13,
    color: "#a1a1aa",
    paddingHorizontal: 16,
    paddingBottom: 16,
    lineHeight: 20,
  },
});

import { Image, StyleSheet, Text, View } from "react-native";
import { getAIImageModelLogo, getAIVideoModelLogo } from "./pricing";

interface ProviderCard {
  id: string;
  name: string;
  bgImage: string;
  logoKey: string;
  isVideoLogo?: boolean;
  imageModels: string[];
  videoModels: string[];
}

const PROVIDERS: ProviderCard[] = [
  {
    id: "bytedance",
    name: "ByteDance",
    bgImage:
      "https://cdn-frontend.trendyuu.com/public/Image_seedream_trend.webp",
    logoKey: "seedream-4.0",
    imageModels: [
      "Seedream 4.0",
      "Seedream 4.5",
      "Seedream 5.0 Lite",
      "Seedream 5.0 Pro",
    ],
    videoModels: ["Seedance 2.0 Mini", "Seedance 2.0", "Seedance 2.5"],
  },
  {
    id: "google",
    name: "Google",
    bgImage: "https://cdn-frontend.trendyuu.com/public/Image_google_trend.webp",
    logoKey: "gemini-3-pro",
    imageModels: ["NanoBanana", "NanoBanana Pro"],
    videoModels: ["Veo 3.1 Lite", "Veo 3.1 Fast", "Veo 3.1"],
  },
  {
    id: "openai",
    name: "OpenAI",
    bgImage: "https://cdn-frontend.trendyuu.com/public/Image_gpt_trend.webp",
    logoKey: "gpt-2.0",
    imageModels: ["GPT Image 1.0", "GPT Image 1.5", "GPT Image 2.0"],
    videoModels: [],
  },
  {
    id: "blackforest",
    name: "Black Forest Labs",
    bgImage: "https://cdn-frontend.trendyuu.com/public/Image_flux_trend.webp",
    logoKey: "flux-pro",
    imageModels: [
      "Flux Schnell",
      "Flux 2 Klein",
      "Flux Pro",
      "Flux 2 Pro",
      "Flux Pro Ultra",
    ],
    videoModels: [],
  },
];

export default function LLMModels() {
  return (
    <View style={styles.root}>
      <Text style={styles.title}>
        Todos os melhores modelos das melhores empresas em um lugar só!
      </Text>

      {PROVIDERS.map((provider) => {
        const logoUrl = provider.isVideoLogo
          ? getAIVideoModelLogo(provider.logoKey)
          : getAIImageModelLogo(provider.logoKey);

        return (
          <View key={provider.id} style={styles.card}>
            {/* Background image */}
            <Image
              source={{ uri: provider.bgImage }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
            {/* Overlay */}
            <View style={[StyleSheet.absoluteFill, styles.overlay]} />

            {/* Top row — logo + name */}
            <View style={styles.cardTop}>
              <Image
                source={{ uri: logoUrl }}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.cardTopName}>{provider.name}</Text>
            </View>

            {/* Bottom — provider name + model columns */}
            <View style={styles.cardBottom}>
              <Text style={styles.cardName}>{provider.name}</Text>
              <View style={styles.modelDivider} />
              <View style={styles.modelCols}>
                {provider.imageModels.length > 0 && (
                  <View style={styles.modelCol}>
                    <Text style={styles.modelColLabel}>IMAGEM</Text>
                    {provider.imageModels.map((m) => (
                      <Text key={m} style={styles.modelItem}>
                        {m}
                      </Text>
                    ))}
                  </View>
                )}
                {provider.videoModels.length > 0 && (
                  <View style={styles.modelCol}>
                    <Text style={styles.modelColLabel}>VÍDEO</Text>
                    {provider.videoModels.map((m) => (
                      <Text key={m} style={styles.modelItem}>
                        {m}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingVertical: 40,
    paddingHorizontal: 16,
    gap: 14,
    backgroundColor: "#000",
  },
  title: {
    fontSize: 26,
    fontWeight: "500",
    color: "#fff",
    textAlign: "center",
    lineHeight: 34,
    marginBottom: 8,
  },

  card: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    minHeight: 220,
    padding: 16,
    justifyContent: "space-between",
  },
  overlay: { backgroundColor: "rgba(9,9,11,0.45)" },

  cardTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  logo: { width: 18, height: 18 },
  cardTopName: { color: "#fff", fontWeight: "600", fontSize: 13 },

  cardBottom: { gap: 6 },
  cardName: { color: "#fff", fontWeight: "700", fontSize: 17 },
  modelDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    marginVertical: 6,
  },
  modelCols: { flexDirection: "row", gap: 24 },
  modelCol: { gap: 3 },
  modelColLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  modelItem: { fontSize: 12, color: "#cbd5e1" },
});

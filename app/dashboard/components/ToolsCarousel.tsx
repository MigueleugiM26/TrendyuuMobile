import { useUser } from "@/src/context/user-context";
import { useTranslations } from "@/src/hooks/useTranslations";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import {
  Camera,
  Clapperboard,
  Images,
  Layers,
  Mic,
  Music,
  Scissors,
  Speech,
  Video,
  Volume2,
  Workflow,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { Tool } from "../types/user";

// ─── Data ─────────────────────────────────────────────────────────────────────

const TOOLS: Tool[] = [
  {
    id: "1",
    name: "Gerador de Vídeos",
    description: "Crie vídeos com IA a partir de texto ou imagem",
    image: "https://cdn-frontend.trendyuu.com/public/tools/text-to-video.webp",
    href: "/ai-tools/text-to-video",
    category: "video",
    isNew: false,
    isPremium: false,
    icon: Video,
  },
  {
    id: "2",
    name: "Gerador de Imagens",
    description: "Gere imagens profissionais com os melhores modelos de IA",
    image: "https://cdn-frontend.trendyuu.com/public/tools/text-to-image.webp",
    href: "/ai-tools/text-to-image",
    category: "image",
    isNew: false,
    isPremium: false,
    icon: Images,
  },
  {
    id: "3",
    name: "Smart Image",
    description: "Gerador de imagens de produto com presets avançados",
    image: "https://cdn-frontend.trendyuu.com/public/tools/smart-image.webp",
    href: "/ai-tools/smart-image-generator",
    category: "image",
    isNew: true,
    isPremium: false,
    icon: Camera,
  },
  {
    id: "4",
    name: "Smart Video",
    description: "Gerador de vídeos de produto com presets sem prompt",
    image: "https://cdn-frontend.trendyuu.com/public/tools/smart-video.webp",
    href: "/ai-tools/smart-video-generator",
    category: "video",
    isNew: true,
    isPremium: true,
    icon: Clapperboard,
  },
  {
    id: "5",
    name: "Fake Text",
    description: "Crie conversas de texto fictícias para conteúdo",
    image: "https://cdn-frontend.trendyuu.com/public/tools/fake-text.webp",
    href: "/ai-tools/fake-text",
    category: "content",
    isNew: false,
    isPremium: false,
    icon: Scissors,
  },
  {
    id: "6",
    name: "Canvas Studio",
    description: "Editor visual com nós para criação de conteúdo",
    image: "https://cdn-frontend.trendyuu.com/public/tools/canvas.webp",
    href: "/ai-tools/canvas-studio",
    category: "editor",
    isNew: false,
    isPremium: false,
    icon: Workflow,
  },
  {
    id: "7",
    name: "Gerador de Voz",
    description: "Converta texto em voz natural com IA",
    image: "https://cdn-frontend.trendyuu.com/public/tools/voicegenerator.webp",
    href: "/ai-tools/voicegenerator",
    category: "audio",
    isNew: false,
    isPremium: false,
    icon: Speech,
  },
  {
    id: "8",
    name: "Trend Music",
    description: "Gere músicas originais com inteligência artificial",
    image: "https://cdn-frontend.trendyuu.com/public/tools/trend-music.webp",
    href: "/ai-tools/trend-music",
    category: "audio",
    isNew: true,
    isPremium: true,
    icon: Music,
  },
  {
    id: "9",
    name: "Efeitos Sonoros",
    description: "Crie efeitos sonoros únicos para seus vídeos",
    image: "https://cdn-frontend.trendyuu.com/public/tools/sound-effects.webp",
    href: "/ai-tools/sound-effects",
    category: "audio",
    isNew: false,
    isPremium: false,
    icon: Volume2,
  },
  {
    id: "10",
    name: "Modificador de Voz",
    description: "Altere e transforme vozes com IA",
    image: "https://cdn-frontend.trendyuu.com/public/tools/voice-changer.webp",
    href: "/ai-tools/voice-changer",
    category: "audio",
    isNew: false,
    isPremium: false,
    icon: Mic,
  },
  {
    id: "11",
    name: "Variações com IA",
    description: "Gere variações de imagens existentes",
    image: "https://cdn-frontend.trendyuu.com/public/tools/variations.webp",
    href: "/ai-tools/variations",
    category: "image",
    isNew: false,
    isPremium: false,
    icon: Layers,
  },
];

// ─── Single Tool Card ─────────────────────────────────────────────────────────

function ToolCard({ tool, onPress }: { tool: Tool; onPress: () => void }) {
  const isAudio = tool.category === "audio";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [card.root, pressed && card.rootPressed]}
    >
      {/* Thumbnail */}
      <View style={card.imageWrap}>
        <Image
          source={{ uri: tool.image }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
        {/* Audio waveform overlay */}
        {isAudio && (
          <View style={card.waveformOverlay}>
            <View style={card.waveform}>
              {Array.from({ length: 16 }).map((_, i) => {
                const heights = [
                  12, 20, 16, 28, 18, 32, 22, 26, 14, 30, 24, 18, 28, 16, 22,
                  20,
                ];
                return (
                  <View
                    key={i}
                    style={[
                      card.waveBar,
                      {
                        height: heights[i],
                        backgroundColor:
                          i < 6 ? "#ec4899" : "rgba(255,255,255,0.2)",
                      },
                    ]}
                  />
                );
              })}
            </View>
          </View>
        )}
        {/* Badges */}
        <View style={card.badgeRow}>
          {tool.isNew && (
            <View style={card.badgeNew}>
              <Text style={card.badgeText}>New</Text>
            </View>
          )}
          {tool.isPremium && (
            <View style={card.badgePremium}>
              <Text style={card.badgeText}>Premium</Text>
            </View>
          )}
        </View>
      </View>

      {/* Info */}
      <View style={card.info}>
        <Text style={card.name} numberOfLines={1}>
          {tool.name}
        </Text>
        <Text style={card.desc} numberOfLines={2}>
          {tool.description}
        </Text>
        <View style={card.categoryChip}>
          <Text style={card.categoryText}>{tool.category}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const card = StyleSheet.create({
  root: {
    width: 160,
    backgroundColor: "#09090b",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#27272a",
    overflow: "hidden",
  },
  rootPressed: { opacity: 0.8, borderColor: "rgba(236,72,153,0.3)" },
  imageWrap: { width: "100%", height: 120, backgroundColor: "#18181b" },
  waveformOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  waveform: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 2,
    height: 32,
  },
  waveBar: { width: 3, borderRadius: 2 },
  badgeRow: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
    gap: 4,
  },
  badgeNew: {
    backgroundColor: "rgba(236,72,153,0.85)",
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgePremium: {
    backgroundColor: "rgba(202,138,4,0.85)",
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: { fontSize: 9, fontWeight: "700", color: "#fff" },
  info: { padding: 12, gap: 4 },
  name: { fontSize: 13, fontWeight: "700", color: "#fff" },
  desc: { fontSize: 11, color: "#71717a", lineHeight: 16 },
  categoryChip: {
    alignSelf: "flex-start",
    backgroundColor: "#27272a",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 4,
  },
  categoryText: { fontSize: 10, color: "#71717a", textTransform: "capitalize" },
});

// ─── Carousel ─────────────────────────────────────────────────────────────────

export function ToolsCarousel() {
  const t = useTranslations("dashboard");
  const { user, currentPlan } = useUser();
  const router = useRouter();
  const [recentToolIds, setRecentToolIds] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem("recentTools").then((stored) => {
      if (stored) setRecentToolIds(JSON.parse(stored));
    });
  }, []);

  async function handleToolPress(tool: Tool) {
    // Track recently used
    const updated = [
      tool.id,
      ...recentToolIds.filter((id) => id !== tool.id),
    ].slice(0, 5);
    setRecentToolIds(updated);
    await AsyncStorage.setItem("recentTools", JSON.stringify(updated));
    router.push(tool.href as any);
  }

  // Sort: recent first, then rest
  const sortedTools = [
    ...recentToolIds
      .map((id) => TOOLS.find((t) => t.id === id))
      .filter(Boolean),
    ...TOOLS.filter((t) => !recentToolIds.includes(t.id)),
  ] as Tool[];

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("toolsSection") ?? "Ferramentas"}</Text>
        <Pressable onPress={() => router.push("/ai-tools/text-to-video")}>
          <Text style={styles.seeAll}>Ver todas →</Text>
        </Pressable>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {sortedTools.map((tool) => (
          <ToolCard
            key={tool.id}
            tool={tool}
            onPress={() => handleToolPress(tool)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { paddingTop: 24 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: { fontSize: 16, fontWeight: "600", color: "#fff" },
  seeAll: { fontSize: 13, color: "#ec4899" },
  scroll: { paddingHorizontal: 16, gap: 10, paddingBottom: 4 },
});

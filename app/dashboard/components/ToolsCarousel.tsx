import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import type { Tool } from "../types/user";

interface ToolCardProps {
  tool: Tool;
  onClick: (tool: Tool) => void;
}

// ─── Waveform bars (audio tools) ─────────────────────────────────────────────
// Mirrors the 32-bar waveform + play button + progress bar

const WAVEFORM_HEIGHTS = [
  12, 20, 16, 28, 24, 32, 18, 26, 22, 30, 14, 24, 28, 20, 32, 26, 18, 24, 30,
  16, 28, 22, 32, 20, 26, 18, 24, 28, 16, 30, 22, 26,
];

function AudioPreview() {
  return (
    <View style={audioStyles.wrapper}>
      {/* Play button — mirrors `w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full` */}
      <View style={audioStyles.playBtn}>
        {/* Triangle play icon */}
        <View style={audioStyles.playTriangle} />
      </View>

      {/* Waveform + timeline */}
      <View style={audioStyles.waveformGroup}>
        {/* Bars */}
        <View style={audioStyles.barsRow}>
          {WAVEFORM_HEIGHTS.map((h, i) => {
            const isActive = i < 12;
            return (
              <View
                key={i}
                style={[
                  audioStyles.bar,
                  { height: h },
                  isActive ? audioStyles.barActive : audioStyles.barInactive,
                ]}
              />
            );
          })}
        </View>

        {/* Timeline — mirrors `flex justify-between items-center mt-2 text-xs text-zinc-400` */}
        <View style={audioStyles.timeline}>
          <Text style={audioStyles.timeText}>0:23</Text>
          <View style={audioStyles.progressTrack}>
            <View style={audioStyles.progressFill} />
          </View>
          <Text style={audioStyles.timeText}>1:15</Text>
        </View>
      </View>
    </View>
  );
}

// ─── ToolCard ─────────────────────────────────────────────────────────────────

export function ToolCard({ tool, onClick }: ToolCardProps) {
  const showHalo = tool.id === "5"; // Fake Text only
  const isAudio = tool.category?.toLowerCase() === "audio";

  return (
    <Pressable
      onPress={() => onClick(tool)}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      {/* Image area — mirrors `w-full h-40 relative mb-4 rounded-xl overflow-hidden` */}
      <View style={[styles.imageWrapper, showHalo && styles.imageWrapperHalo]}>
        {/* Halo glow (tool id === "5") — approximated with a blurred tinted View */}
        {showHalo && <View style={styles.halo} pointerEvents="none" />}

        <Image
          source={{ uri: tool.image || "/placeholder-image.jpg" }}
          style={styles.toolImage}
          resizeMode="contain"
        />
      </View>

      {/* Audio preview — mirrors the waveform block for audio category */}
      {isAudio && <AudioPreview />}

      {/* Text content — mirrors `flex-grow` block */}
      <View style={styles.textGroup}>
        <Text style={styles.name}>{tool.name}</Text>
        <Text style={styles.description} numberOfLines={3}>
          {tool.description}
        </Text>
      </View>

      {/* Footer — mirrors `flex justify-between items-center mt-4 pt-4 border-t border-zinc-700` */}
      <View style={styles.footer}>
        <View style={styles.badges}>
          {tool.isNew && (
            <View style={[styles.badge, styles.badgeNew]}>
              <Text style={[styles.badgeText, styles.badgeTextNew]}>New</Text>
            </View>
          )}
          {tool.isPremium && (
            <View style={[styles.badge, styles.badgePremium]}>
              <Text style={[styles.badgeText, styles.badgeTextPremium]}>
                Premium
              </Text>
            </View>
          )}
        </View>

        {/* Category chip — mirrors `text-xs text-zinc-500 capitalize bg-zinc-800 px-2 py-1 rounded` */}
        {tool.category && (
          <View style={styles.categoryChip}>
            <Text style={styles.categoryText}>{tool.category}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Card — mirrors `bg-zinc-900/50 border-zinc-800 hover:border-pink-500/30 … h-full`
  card: {
    backgroundColor: "rgba(24,24,27,0.5)",
    borderWidth: 1,
    borderColor: "#27272a",
    borderRadius: 12,
    padding: 24,
    flex: 1,
  },
  cardPressed: {
    borderColor: "rgba(236,72,153,0.3)",
    transform: [{ scale: 0.98 }],
  },

  // Image wrapper — mirrors `w-full h-40 relative mb-4 rounded-xl overflow-hidden`
  imageWrapper: {
    width: "100%",
    height: 160,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  imageWrapperHalo: {
    overflow: "visible", // mirrors `overflow-visible` for showHalo
  },
  halo: {
    position: "absolute",
    width: "220%",
    height: "220%",
    borderRadius: 9999,
    backgroundColor: "rgba(0,0,0,0.1)",
    // RN doesn't support CSS blur; shadowRadius approximates the glow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.28,
    shadowRadius: 28,
  },
  toolImage: {
    width: "100%",
    height: "100%",
    padding: 16,
  },

  // Text group — mirrors `flex-grow`
  textGroup: {
    flex: 1,
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#a1a1aa",
    lineHeight: 20,
  },

  // Footer — mirrors `flex justify-between items-center mt-4 pt-4 border-t border-zinc-700`
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#3f3f46",
  },
  badges: {
    flexDirection: "row",
    gap: 8,
  },
  badge: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
  },
  // New badge — mirrors `bg-pink-500/20 text-pink-400 border-pink-500/30`
  badgeNew: {
    backgroundColor: "rgba(236,72,153,0.2)",
    borderColor: "rgba(236,72,153,0.3)",
  },
  badgeTextNew: {
    color: "#f472b6",
  },
  // Premium badge — mirrors `bg-yellow-500/20 text-yellow-400 border-yellow-500/30`
  badgePremium: {
    backgroundColor: "rgba(234,179,8,0.2)",
    borderColor: "rgba(234,179,8,0.3)",
  },
  badgeTextPremium: {
    color: "#facc15",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "500",
  },
  // Category chip — mirrors `text-xs text-zinc-500 capitalize bg-zinc-800 px-2 py-1 rounded`
  categoryChip: {
    backgroundColor: "#27272a",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  categoryText: {
    fontSize: 11,
    color: "#71717a",
    textTransform: "capitalize",
  },
});

const audioStyles = StyleSheet.create({
  // Mirrors `w-full mt-4 p-3 bg-gradient-to-r from-zinc-900/80 to-zinc-800/80 rounded-xl border border-zinc-700/50`
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 16,
    padding: 12,
    backgroundColor: "rgba(24,24,27,0.8)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(63,63,70,0.5)",
  },
  // Play button — mirrors `w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full`
  playBtn: {
    width: 48,
    height: 48,
    borderRadius: 99,
    backgroundColor: "#ec4899",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  // Triangle play icon — mirrors `border-l-[14px] border-l-white border-t-[8px] border-b-[8px]`
  playTriangle: {
    width: 0,
    height: 0,
    marginLeft: 3,
    borderLeftWidth: 14,
    borderLeftColor: "#fff",
    borderTopWidth: 8,
    borderTopColor: "transparent",
    borderBottomWidth: 8,
    borderBottomColor: "transparent",
  },
  waveformGroup: {
    flex: 1,
  },
  // Bars row — mirrors `flex items-end justify-center gap-1 h-8 px-2`
  barsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    height: 32,
    gap: 2,
  },
  bar: {
    width: 3,
    borderRadius: 99,
  },
  // Active (progressed) bars — mirrors `bg-gradient-to-t from-pink-600 to-pink-400`
  barActive: {
    backgroundColor: "#ec4899",
  },
  // Inactive bars — mirrors `bg-zinc-600`
  barInactive: {
    backgroundColor: "#52525b",
  },
  // Timeline row — mirrors `flex justify-between items-center mt-2 text-xs text-zinc-400`
  timeline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  timeText: {
    fontSize: 11,
    color: "#a1a1aa",
  },
  // Progress track — mirrors `flex-1 mx-3 h-1 bg-zinc-700 rounded-full overflow-hidden`
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: "#3f3f46",
    borderRadius: 99,
    overflow: "hidden",
    marginHorizontal: 12,
  },
  // Progress fill — mirrors `h-full w-1/3 bg-gradient-to-r from-pink-500 to-pink-400`
  progressFill: {
    height: "100%",
    width: "33%",
    backgroundColor: "#ec4899",
    borderRadius: 99,
  },
});

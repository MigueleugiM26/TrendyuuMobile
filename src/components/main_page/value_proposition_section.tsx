import { useTranslations } from "@/src/hooks/useTranslations";
import { Image, StyleSheet, Text, View } from "react-native";

export default function ValueProposition() {
  const t = useTranslations("mainPage.valueProposition");

  // Skeleton rows for the product studio card
  const SkeletonRows = () => (
    <View style={styles.skeletonRows}>
      {[
        [
          ["#f97316", "#fbbf24"],
          ["#fbbf24", "#34d399"],
        ],
        [
          ["#ec4899", "#a855f7"],
          ["#3b82f6", "#6366f1"],
        ],
        [
          ["#34d399", "#14b8a6"],
          ["#fb7185", "#ec4899"],
        ],
      ].map((row, i) => (
        <View
          key={i}
          style={[styles.skeletonRow, i === 1 && styles.skeletonRowActive]}
        >
          <View style={styles.skeletonText}>
            <View style={[styles.skeletonLine, { width: i === 1 ? 80 : 64 }]} />
            <View
              style={[
                styles.skeletonLine,
                styles.skeletonLineSm,
                { width: i === 1 ? 112 : 96 },
              ]}
            />
          </View>
          <View style={styles.skeletonDots}>
            <View
              style={[styles.skeletonDot, { backgroundColor: row[0][0] }]}
            />
            <View
              style={[
                styles.skeletonDot,
                { backgroundColor: row[0][1], marginLeft: -4 },
              ]}
            />
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.root}>
      {/* Section header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t("title")}</Text>
        <Text style={styles.subtitle}>{t("subtitle")}</Text>
      </View>

      {/* Main card — Canvas Workflow */}
      <View style={styles.mainCard}>
        <Text style={styles.mainCardTitle}>{t("mainCard.title")}</Text>
        <Text style={styles.mainCardDesc}>{t("mainCard.description")}</Text>
        <View style={styles.mainCardImage}>
          <Image
            source={{
              uri: "https://cdn-frontend.trendyuu.com/public/images/value_canvas.webp",
            }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        </View>
      </View>

      {/* Feature card 1 — Product Studio */}
      <View style={styles.featureCard}>
        <Text style={styles.featureTitle}>{t("feature1.title")}</Text>
        <Text style={styles.featureDesc}>{t("feature1.description")}</Text>
        <View style={styles.featureRow}>
          <SkeletonRows />
          <View style={styles.featureImageWrap}>
            <Image
              source={{
                uri: "https://cdn-frontend.trendyuu.com/public/images/photo_shot_card.webp",
              }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
          </View>
        </View>
      </View>

      {/* Feature card 2 — Brand DNA */}
      <View style={[styles.featureCard, styles.brandDnaCard]}>
        <Text style={styles.brandDnaBadge}>{t("brandDna.badge")}</Text>
        <Text style={styles.brandDnaTitle}>{t("brandDna.title")}</Text>
        <Text style={styles.brandDnaDesc}>{t("brandDna.description")}</Text>

        {/* Brand DNA config card */}
        <View style={styles.dnaCard}>
          <View style={styles.dnaCardHeader}>
            <View style={styles.dnaCardIcon}>
              <Text style={styles.dnaCardIconText}>◈</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.dnaCardTitle}>{t("brandDna.cardTitle")}</Text>
              <Text style={styles.dnaCardSynced}>
                {t("brandDna.statusSynced")}
              </Text>
            </View>
            <View style={styles.dnaStatusRow}>
              <View style={styles.dnaStatusDot} />
              <Text style={styles.dnaStatusText}>
                {t("brandDna.statusActive")}
              </Text>
            </View>
          </View>
          <View style={styles.dnaDivider} />
          {[
            [t("brandDna.typography"), t("brandDna.typographyValue"), null],
            [
              t("brandDna.primaryColor"),
              t("brandDna.primaryColorHex"),
              "#ec4899",
            ],
            [t("brandDna.toneOfVoice"), t("brandDna.toneOfVoiceValue"), null],
            [t("brandDna.visualStyle"), t("brandDna.visualStyleValue"), null],
            [t("brandDna.masterPrompt"), t("brandDna.masterPromptValue"), null],
          ].map(([label, value, color], i) => (
            <View key={i} style={styles.dnaRow}>
              <Text style={styles.dnaRowLabel}>{label}</Text>
              <View style={styles.dnaRowValue}>
                {color && (
                  <View
                    style={[
                      styles.colorDot,
                      { backgroundColor: color as string },
                    ]}
                  />
                )}
                <Text style={styles.dnaRowValueText}>{value}</Text>
              </View>
            </View>
          ))}
          <View style={styles.dnaFooter}>
            <Text style={styles.dnaFooterText}>{t("brandDna.footerNote")}</Text>
          </View>
        </View>
      </View>

      {/* Variations card */}
      <View style={styles.featureCard}>
        <Text style={styles.featureTitle}>{t("variations.title")}</Text>
        <Text style={styles.featureDesc}>{t("variations.description")}</Text>
        <View style={styles.variationsRow}>
          {[
            {
              uri: "https://cdn-frontend.trendyuu.com/public/images/value_variation1.webp",
              w: 90,
              h: 130,
              z: 1,
            },
            {
              uri: "https://cdn-frontend.trendyuu.com/public/images/value_variation2.webp",
              w: 100,
              h: 150,
              z: 2,
            },
            {
              uri: "https://cdn-frontend.trendyuu.com/public/images/value_variation3.webp",
              w: 115,
              h: 175,
              z: 3,
            },
          ].map((img, i) => (
            <View
              key={i}
              style={[
                styles.varImage,
                {
                  width: img.w,
                  height: img.h,
                  zIndex: img.z,
                  marginLeft: i > 0 ? -20 : 0,
                },
              ]}
            >
              <Image
                source={{ uri: img.uri }}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
              />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: "#000",
    paddingVertical: 40,
    paddingHorizontal: 16,
    gap: 16,
  },

  header: { alignItems: "center", gap: 12, marginBottom: 8 },
  title: {
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

  mainCard: {
    borderRadius: 20,
    backgroundColor: "#09090b",
    borderWidth: 1,
    borderColor: "#27272a",
    padding: 20,
    gap: 10,
    overflow: "hidden",
  },
  mainCardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    lineHeight: 28,
  },
  mainCardDesc: { fontSize: 13, color: "#a1a1aa", lineHeight: 20 },
  mainCardImage: {
    width: "100%",
    height: 200,
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 8,
  },

  featureCard: {
    borderRadius: 20,
    backgroundColor: "#09090b",
    borderWidth: 1,
    borderColor: "#27272a",
    padding: 20,
    gap: 10,
  },
  featureTitle: { fontSize: 17, fontWeight: "700", color: "#fff" },
  featureDesc: { fontSize: 13, color: "#a1a1aa", lineHeight: 20 },
  featureRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    marginTop: 8,
  },

  skeletonRows: { flex: 1, gap: 8 },
  skeletonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    borderRadius: 10,
    backgroundColor: "rgba(24,24,27,0.7)",
    borderWidth: 1,
    borderColor: "rgba(63,63,70,0.8)",
  },
  skeletonRowActive: {
    backgroundColor: "rgba(24,24,27,0.9)",
    borderColor: "#3f3f46",
    transform: [{ scale: 1.02 }],
  },
  skeletonText: { gap: 4, flex: 1 },
  skeletonLine: { height: 7, backgroundColor: "#52525b", borderRadius: 99 },
  skeletonLineSm: { height: 5, backgroundColor: "#3f3f46" },
  skeletonDots: { flexDirection: "row" },
  skeletonDot: { width: 14, height: 14, borderRadius: 7 },

  featureImageWrap: {
    width: 120,
    height: 160,
    borderRadius: 16,
    overflow: "hidden",
  },

  brandDnaCard: { gap: 12 },
  brandDnaBadge: {
    fontSize: 9,
    fontWeight: "500",
    color: "rgba(255,255,255,0.6)",
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  brandDnaTitle: {
    fontSize: 26,
    fontWeight: "600",
    color: "#fff",
    lineHeight: 32,
  },
  brandDnaDesc: {
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    lineHeight: 20,
  },

  dnaCard: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    padding: 16,
    gap: 10,
    marginTop: 4,
  },
  dnaCardHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  dnaCardIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
    justifyContent: "center",
  },
  dnaCardIconText: { color: "#fff", fontSize: 14 },
  dnaCardTitle: { fontSize: 13, fontWeight: "500", color: "#fff" },
  dnaCardSynced: { fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2 },
  dnaStatusRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  dnaStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#34d399",
  },
  dnaStatusText: {
    fontSize: 8,
    color: "#6ee7b7",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    fontWeight: "600",
  },
  dnaDivider: { height: 1, backgroundColor: "rgba(255,255,255,0.1)" },
  dnaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dnaRowLabel: { fontSize: 11, color: "rgba(255,255,255,0.4)" },
  dnaRowValue: { flexDirection: "row", alignItems: "center", gap: 5 },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  dnaRowValueText: { fontSize: 11, color: "#fff", fontWeight: "500" },
  dnaFooter: {
    backgroundColor: "rgba(255,255,255,0.025)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    padding: 10,
    alignItems: "center",
  },
  dnaFooterText: {
    fontSize: 10,
    color: "rgba(255,255,255,0.75)",
    fontWeight: "500",
    textAlign: "center",
  },

  variationsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    marginTop: 12,
  },
  varImage: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#27272a",
  },
});

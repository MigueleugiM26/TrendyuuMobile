import { useTranslations } from "@/src/hooks/useTranslations";
import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { Send } from "lucide-react-native";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

const SOCIAL_LINKS: { label: string; icon: string; url: string }[] = [
  {
    label: "Instagram",
    icon: "instagram",
    url: "https://www.instagram.com/usetrendyuu/",
  },
  {
    label: "TikTok",
    icon: "tiktok",
    url: "https://www.tiktok.com/@trendyuuofficial",
  },
  {
    label: "YouTube",
    icon: "youtube",
    url: "https://www.youtube.com/@TrendYuuOficial",
  },
  {
    label: "LinkedIn",
    icon: "linkedin",
    url: "https://www.linkedin.com/company/evovince/",
  },
  { label: "Discord", icon: "discord", url: "https://discord.gg/QqNF2ErqWE" },
];

export default function Footer() {
  const t = useTranslations("footer");
  const router = useRouter();
  const openUrl = (url: string) => WebBrowser.openBrowserAsync(url);

  const productLinks = [
    { nameKey: "products.imageGeneration", href: "/features/image-generation" },
    { nameKey: "products.videoGeneration", href: "/features/video-generation" },
    { nameKey: "products.variations", href: "/features/variations" },
    { nameKey: "products.productVideo", href: "/features/product-video" },
    { nameKey: "products.canvasStudio", href: "/features/canvas" },
    { nameKey: "products.productPhoto", href: "/features/photo-product" },
  ];

  const legalLinks = [
    {
      nameKey: "legal.privacy",
      url: "https://trendyuu.com/policies/privacy-policy",
    },
    { nameKey: "legal.terms", url: "https://trendyuu.com/policies/user-terms" },
    {
      nameKey: "legal.cookies",
      url: "https://trendyuu.com/policies/cookie-policy",
    },
    {
      nameKey: "legal.refund",
      url: "https://trendyuu.com/policies/refund-policy",
    },
  ];

  return (
    <View style={styles.root}>
      <View style={styles.card}>
        {/* Brand + socials */}
        <View style={styles.brand}>
          <View style={styles.brandRow}>
            <Image
              source={{
                uri: "https://cdn-frontend.trendyuu.com/public/logos/evovince_white_logo.webp",
              }}
              style={styles.brandLogo}
              resizeMode="contain"
            />
            <Text style={styles.brandName}>EvoVince</Text>
          </View>
          <Text style={styles.brandTagline}>{t("company.tagline")}</Text>
          <View style={styles.socials}>
            {SOCIAL_LINKS.map((s) => (
              <Pressable
                key={s.label}
                onPress={() => openUrl(s.url)}
                style={({ pressed }) => [
                  styles.socialBtn,
                  pressed && { opacity: 0.6 },
                ]}
              >
                <FontAwesome5 name={s.icon} size={20} color="#a1a1aa" />
              </Pressable>
            ))}
          </View>
        </View>

        {/* Links grid */}
        <View style={styles.linksGrid}>
          <View style={styles.linkCol}>
            <Text style={styles.colTitle}>{t("products.title")}</Text>
            {productLinks.map((l) => (
              <Pressable
                key={l.nameKey}
                onPress={() => router.push(l.href as any)}
                style={({ pressed }) => pressed && { opacity: 0.6 }}
              >
                <Text style={styles.link}>{t(l.nameKey)}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.linkCol}>
            <Text style={styles.colTitle}>{t("legal.title")}</Text>
            {legalLinks.map((l) => (
              <Pressable
                key={l.nameKey}
                onPress={() => openUrl(l.url)}
                style={({ pressed }) => pressed && { opacity: 0.6 }}
              >
                <Text style={styles.link}>{t(l.nameKey)}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Feedback */}
        <View style={styles.feedback}>
          <Text style={styles.colTitle}>{t("feedback.title")}</Text>
          <Text style={styles.feedbackDesc}>{t("feedback.description")}</Text>
          <Pressable
            onPress={() => openUrl("https://www.trendyuu.com/support-chat")}
            style={({ pressed }) => [
              styles.feedbackBtn,
              pressed && { opacity: 0.85 },
            ]}
          >
            <Send size={16} color="#fff" />
            <Text style={styles.feedbackBtnText}>{t("feedback.button")}</Text>
          </Pressable>
        </View>

        {/* Copyright */}
        <View style={styles.divider} />
        <Text style={styles.copyright}>
          {t("copyright", { year: new Date().getFullYear() })}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { paddingVertical: 40, paddingHorizontal: 16, backgroundColor: "#000" },
  card: {
    backgroundColor: "#09090b",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#27272a",
    padding: 24,
    gap: 28,
  },
  brand: { gap: 10, alignItems: "center" },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandLogo: { width: 36, height: 36, borderRadius: 8 },
  brandName: { fontSize: 18, fontWeight: "700", color: "#fff" },
  brandTagline: {
    fontSize: 13,
    color: "#a1a1aa",
    lineHeight: 20,
    textAlign: "center",
  },
  socials: {
    flexDirection: "row",
    gap: 18,
    marginTop: 4,
    justifyContent: "center",
  },
  socialBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  socialIcon: { width: 20, height: 20 },
  linksGrid: { flexDirection: "row", gap: 24 },
  linkCol: { flex: 1, gap: 8, alignItems: "center" },
  colTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#e4e4e7",
    marginBottom: 4,
    textAlign: "center",
  },
  link: { fontSize: 13, color: "#a1a1aa", lineHeight: 22, textAlign: "center" },
  feedback: { gap: 10, alignItems: "center" },
  feedbackDesc: {
    fontSize: 13,
    color: "#a1a1aa",
    lineHeight: 20,
    textAlign: "center",
  },
  feedbackBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#ec4899",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 4,
  },
  feedbackBtnText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  divider: { height: 1, backgroundColor: "#27272a" },
  copyright: { fontSize: 12, color: "#71717a", textAlign: "center" },
});

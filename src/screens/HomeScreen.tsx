import { useRouter } from "expo-router";
import {
  BookmarkCheck,
  ChevronRight,
  Cpu,
  Layers,
  PuzzleIcon,
  ShieldCheck,
  Star,
  UserCheck,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useUser } from "../context/user-context";
import { useLanguage, useTranslations } from "../hooks/useTranslations";
import { getAIImageModelLogo, getAIVideoModelLogo } from "../types/aiModels";
import { captureAffiliateCode } from "../utils/affiliates";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Testimonial {
  quoteKey: string;
  authorKey: string;
  roleKey: string;
  companyKey: string;
  avatar: string;
  rating: number;
}

interface ProviderCard {
  id: string;
  name: string;
  bgImage: string;
  logoKey: string;
  isVideoLogo?: boolean;
  imageModels: string[];
  videoModels: string[];
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const TESTIMONIALS: Testimonial[] = [
  {
    quoteKey: "angeloQuote",
    authorKey: "angeloAuthor",
    roleKey: "angeloRole",
    companyKey: "angeloCompany",
    avatar: "https://cdn-frontend.trendyuu.com/public/images/angelofoto13.webp",
    rating: 5,
  },
  {
    quoteKey: "kauaQuote",
    authorKey: "kauaAuthor",
    roleKey: "kauaRole",
    companyKey: "kauaCompany",
    avatar: "https://cdn-frontend.trendyuu.com/public/images/kauafoto.webp",
    rating: 5,
  },
];

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

const FEATURES = [
  {
    mediaSrc: "https://cdn-frontend.trendyuu.com/public/product_showcase.webp",
    titleKey: "mainPage.features.items.trendEcommerce.title",
    descKey: "mainPage.features.items.trendEcommerce.description",
  },
  {
    mediaSrc:
      "https://cdn-frontend.trendyuu.com/public/product_showcase_tenis.webp",
    titleKey: "mainPage.features.items.trendProduct.title",
    descKey: "mainPage.features.items.trendProduct.description",
  },
];

const DIFFERENTIALS = [
  {
    Icon: ShieldCheck,
    titleKey: "mainPage.differentials.items.productFidelity.title",
    descKey: "mainPage.differentials.items.productFidelity.description",
  },
  {
    Icon: BookmarkCheck,
    titleKey: "mainPage.differentials.items.smartNodes.title",
    descKey: "mainPage.differentials.items.smartNodes.description",
  },
  {
    Icon: PuzzleIcon,
    titleKey: "mainPage.differentials.items.stylePresets.title",
    descKey: "mainPage.differentials.items.stylePresets.description",
  },
  {
    Icon: UserCheck,
    titleKey: "mainPage.differentials.items.characterLocking.title",
    descKey: "mainPage.differentials.items.characterLocking.description",
  },
  {
    Icon: Cpu,
    titleKey: "mainPage.differentials.items.multiEngine.title",
    descKey: "mainPage.differentials.items.multiEngine.description",
  },
  {
    Icon: Layers,
    titleKey: "mainPage.differentials.items.batchGeneration.title",
    descKey: "mainPage.differentials.items.batchGeneration.description",
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function HeroSection() {
  const t = useTranslations();
  const { user, loading } = useUser();
  const router = useRouter();

  return (
    <View style={styles.heroContainer}>
      <Image
        source={{
          uri: "https://cdn-frontend.trendyuu.com/public/novo_fundo_trend.webp",
        }}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      <View style={[StyleSheet.absoluteFill, styles.heroOverlay]} />

      <View style={styles.heroContent}>
        {/* Logo */}
        <View style={styles.logoRow}>
          <Image
            source={{
              uri: "https://cdn-frontend.trendyuu.com/public/logos/logotrend2.webp",
            }}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.logoText}>
            Trend<Text style={styles.logoPink}>Yuu</Text>
          </Text>
        </View>

        {/* Headline */}
        <Text style={styles.heroTitle}>
          {t("mainPage.hero.titleLine1")}
          {"\n"}
          <Text style={styles.heroTitlePink}>
            {t("mainPage.hero.titleLine2")}
          </Text>
        </Text>

        <Text style={styles.heroSubtitle}>{t("mainPage.hero.subtitle")}</Text>

        {/* CTA */}
        {user?.name ? (
          <Pressable
            onPress={() => router.push("/dashboard")}
            disabled={loading}
            style={({ pressed }) => [
              styles.ctaBtn,
              pressed && styles.ctaBtnPressed,
            ]}
          >
            <Text style={styles.ctaBtnText}>Dashboard</Text>
            <ChevronRight size={18} color="#fff" />
          </Pressable>
        ) : (
          <Pressable
            onPress={() => router.push("/login")}
            disabled={loading}
            style={({ pressed }) => [
              styles.ctaBtnWhite,
              pressed && styles.ctaBtnPressed,
            ]}
          >
            <Text style={styles.ctaBtnWhiteText}>{t("mainPage.hero.cta")}</Text>
          </Pressable>
        )}

        {/* Social proof badge */}
        <View style={styles.badge}>
          <View style={styles.badgeAvatars}>
            {["produto1", "produto_2", "produto_3"].map((img) => (
              <Image
                key={img}
                source={{
                  uri: `https://cdn-frontend.trendyuu.com/public/provas/${img}.webp`,
                }}
                style={styles.badgeAvatar}
              />
            ))}
          </View>
          <View>
            <Text style={styles.badgeCount}>
              {t("mainPage.hero.badge.count")}
            </Text>
            <Text style={styles.badgeLabel}>
              {t("mainPage.hero.badge.label")}
            </Text>
            <Text style={styles.badgeLabel}>
              {t("mainPage.hero.badge.subLabel")}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function FeaturesSection() {
  const t = useTranslations();
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        {t("mainPage.features.header.titleLine1")}
      </Text>
      <Text style={styles.sectionTitle}>
        {t("mainPage.features.header.titleLine2")}
      </Text>
      {FEATURES.map((f, i) => (
        <View key={i} style={styles.featureCard}>
          <Image
            source={{ uri: f.mediaSrc }}
            style={styles.featureImage}
            resizeMode="cover"
          />
          <Text style={styles.featureTitle}>{t(f.titleKey)}</Text>
          <Text style={styles.featureDesc}>{t(f.descKey)}</Text>
        </View>
      ))}
    </View>
  );
}

function LLMModelsSection() {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        Todos os melhores modelos das melhores empresas em um lugar só!
      </Text>
      <View style={styles.providersGrid}>
        {PROVIDERS.map((p) => {
          const logoUrl = p.isVideoLogo
            ? getAIVideoModelLogo(p.logoKey)
            : getAIImageModelLogo(p.logoKey);
          return (
            <View key={p.id} style={styles.providerCard}>
              <Image
                source={{ uri: p.bgImage }}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
              />
              <View style={[StyleSheet.absoluteFill, styles.providerOverlay]} />
              <View style={styles.providerTop}>
                <Image
                  source={{ uri: logoUrl }}
                  style={styles.providerLogo}
                  resizeMode="contain"
                />
                <Text style={styles.providerName}>{p.name}</Text>
              </View>
              <View style={styles.providerModels}>
                {p.imageModels.length > 0 && (
                  <View style={styles.providerModelCol}>
                    <Text style={styles.providerModelLabel}>Imagem</Text>
                    {p.imageModels.map((m) => (
                      <Text key={m} style={styles.providerModelItem}>
                        {m}
                      </Text>
                    ))}
                  </View>
                )}
                {p.videoModels.length > 0 && (
                  <View style={styles.providerModelCol}>
                    <Text style={styles.providerModelLabel}>Vídeo</Text>
                    {p.videoModels.map((m) => (
                      <Text key={m} style={styles.providerModelItem}>
                        {m}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function DifferentialsSection() {
  const t = useTranslations();
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        {t("mainPage.differentials.header.title")}
      </Text>
      <Text style={styles.sectionSubtitle}>
        {t("mainPage.differentials.header.subtitle")}
      </Text>
      <View style={styles.differentialsGrid}>
        {DIFFERENTIALS.map(({ Icon, titleKey, descKey }, i) => (
          <View key={i} style={styles.differentialItem}>
            <Icon size={20} color="#a1a1aa" />
            <Text style={styles.differentialTitle}>{t(titleKey)}</Text>
            <Text style={styles.differentialDesc}>{t(descKey)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function TestimonialsSection() {
  const t = useTranslations();
  const [selected, setSelected] = useState(0);
  const active = TESTIMONIALS[selected];

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { textAlign: "center" }]}>
        {t("TestimonialsSection.sectionTitle")}
      </Text>

      {/* Avatar selector */}
      <View style={styles.testimonialAvatars}>
        {TESTIMONIALS.map((item, i) => (
          <Pressable key={i} onPress={() => setSelected(i)}>
            <Image
              source={{ uri: item.avatar }}
              style={[
                styles.testimonialAvatar,
                i === selected
                  ? styles.testimonialAvatarActive
                  : styles.testimonialAvatarInactive,
              ]}
            />
          </Pressable>
        ))}
      </View>

      {/* Card */}
      <View style={styles.testimonialCard}>
        <Text style={styles.testimonialQuote}>
          &quot;{t(`TestimonialsSection.${active.quoteKey}`)}&quot;
        </Text>
        <View style={styles.testimonialDivider} />
        <Text style={styles.testimonialAuthor}>
          {t(`TestimonialsSection.${active.authorKey}`)}
        </Text>
        <Text style={styles.testimonialRole}>
          {t(`TestimonialsSection.${active.roleKey}`)},{" "}
          {t(`TestimonialsSection.${active.companyKey}`)}
        </Text>
        <View style={styles.testimonialStars}>
          {Array.from({ length: active.rating }).map((_, i) => (
            <Star key={i} size={14} color="#ec4899" fill="#ec4899" />
          ))}
        </View>
      </View>
    </View>
  );
}

function FAQSection() {
  const t = useTranslations();
  const { tRaw } = useLanguage();
  const [open, setOpen] = useState<number | null>(null);
  const faqs = tRaw("mainPage.faq.items") as {
    question: string;
    answer: string;
  }[];

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        {t("mainPage.faq.mainPageTitle")}
        {"\n"}
        <Text style={{ color: "#f472b6" }}>
          {t("mainPage.faq.subtitleHighlight")}
        </Text>
        {"\n"}
        {t("mainPage.faq.subtitle")}
      </Text>
      <Text style={[styles.sectionSubtitle, { marginBottom: 20 }]}>
        {t("mainPage.faq.description")}
      </Text>

      <View style={styles.faqList}>
        {(Array.isArray(faqs) ? faqs : []).map((faq, i) => (
          <View key={i} style={styles.faqItem}>
            <Pressable
              onPress={() => setOpen(open === i ? null : i)}
              style={styles.faqQuestion}
            >
              <Text style={styles.faqQuestionText}>{faq.question}</Text>
              <Text style={styles.faqChevron}>{open === i ? "−" : "+"}</Text>
            </Pressable>
            {open === i && <Text style={styles.faqAnswer}>{faq.answer}</Text>}
          </View>
        ))}
      </View>
    </View>
  );
}

function CTASection() {
  const t = useTranslations("StartNow");
  const router = useRouter();
  return (
    <View style={styles.ctaSection}>
      <View style={styles.ctaGlow1} />
      <View style={styles.ctaGlow2} />
      <Text style={styles.ctaTitle}>{t("sectionTitle")}</Text>
      <Text style={styles.ctaDesc}>{t("sectionDescription")}</Text>
      <Pressable
        onPress={() => router.push("/login")}
        style={({ pressed }) => [
          styles.ctaWhiteBtn,
          pressed && { opacity: 0.85 },
        ]}
      >
        <Text style={styles.ctaWhiteBtnText}>{t("buttonText")} →</Text>
      </Pressable>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function HomeScreen() {
  useEffect(() => {
    captureAffiliateCode();
  }, []);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <HeroSection />
      <FeaturesSection />
      <LLMModelsSection />
      <DifferentialsSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const PINK = "#ec4899";
const ZINC900 = "#18181b";
const ZINC800 = "#27272a";
const ZINC400 = "#a1a1aa";
const ZINC700 = "#3f3f46";

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000" },
  content: { paddingBottom: 40 },

  // ── Hero
  heroContainer: {
    height: 600,
    justifyContent: "flex-end",
  },
  heroOverlay: {
    backgroundColor: "rgba(0,0,0,0.62)",
  },
  heroContent: {
    padding: 24,
    paddingBottom: 36,
    gap: 12,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  logo: { width: 36, height: 36, marginRight: 8 },
  logoText: { fontSize: 22, fontWeight: "700", color: "#fff" },
  logoPink: { color: PINK },
  heroTitle: {
    fontSize: 34,
    fontWeight: "800",
    color: "#fff",
    lineHeight: 40,
  },
  heroTitlePink: { color: PINK },
  heroSubtitle: {
    fontSize: 15,
    color: ZINC400,
    lineHeight: 22,
    fontWeight: "600",
    maxWidth: 320,
  },
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: PINK,
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 28,
    gap: 6,
    marginTop: 4,
  },
  ctaBtnPressed: { opacity: 0.85 },
  ctaBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  ctaBtnWhite: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 28,
    marginTop: 4,
  },
  ctaBtnWhiteText: { color: "#000", fontWeight: "700", fontSize: 15 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 12,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    marginTop: 4,
  },
  badgeAvatars: { flexDirection: "row" },
  badgeAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: -8,
    borderWidth: 2,
    borderColor: "#000",
  },
  badgeCount: { color: "#fff", fontWeight: "800", fontSize: 16 },
  badgeLabel: { color: "#d4d4d8", fontSize: 11 },

  // ── Shared section styles
  section: {
    padding: 24,
    paddingVertical: 40,
    borderTopWidth: 1,
    borderTopColor: ZINC800,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#fff",
    lineHeight: 34,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: ZINC400,
    lineHeight: 22,
    marginBottom: 24,
  },

  // ── Features
  featureCard: {
    marginTop: 24,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: ZINC900,
    borderWidth: 1,
    borderColor: ZINC800,
  },
  featureImage: {
    width: "100%",
    height: 200,
  },
  featureTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#fff",
    padding: 16,
    paddingBottom: 8,
  },
  featureDesc: {
    fontSize: 13,
    color: ZINC400,
    paddingHorizontal: 16,
    paddingBottom: 16,
    lineHeight: 20,
  },

  // ── LLM Models
  providersGrid: { gap: 12, marginTop: 20 },
  providerCard: {
    minHeight: 200,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    padding: 16,
    justifyContent: "space-between",
  },
  providerOverlay: { backgroundColor: "rgba(9,9,11,0.45)" },
  providerTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    zIndex: 1,
  },
  providerLogo: { width: 18, height: 18 },
  providerName: { color: "#fff", fontWeight: "600", fontSize: 13, zIndex: 1 },
  providerModels: {
    flexDirection: "row",
    gap: 16,
    zIndex: 1,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
    paddingTop: 10,
  },
  providerModelCol: { flex: 1, gap: 3 },
  providerModelLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: ZINC400,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  providerModelItem: { fontSize: 11, color: "#cbd5e1" },

  // ── Differentials
  differentialsGrid: { gap: 28, marginTop: 24 },
  differentialItem: { gap: 6 },
  differentialTitle: { fontSize: 15, fontWeight: "600", color: "#f4f4f5" },
  differentialDesc: { fontSize: 13, color: ZINC400, lineHeight: 20 },

  // ── Testimonials
  testimonialAvatars: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
    marginBottom: 20,
    marginTop: 12,
  },
  testimonialAvatar: {
    width: 72,
    height: 88,
    borderRadius: 12,
    borderWidth: 2,
  },
  testimonialAvatarActive: {
    borderColor: PINK,
    opacity: 1,
  },
  testimonialAvatarInactive: {
    borderColor: "transparent",
    opacity: 0.5,
  },
  testimonialCard: {
    backgroundColor: "rgba(24,24,27,0.8)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: ZINC800,
    padding: 24,
    gap: 12,
  },
  testimonialQuote: {
    fontSize: 16,
    color: "#e4e4e7",
    lineHeight: 26,
    fontWeight: "300",
  },
  testimonialDivider: {
    height: 1,
    backgroundColor: ZINC700,
    borderStyle: "dashed",
  },
  testimonialAuthor: { fontSize: 15, fontWeight: "700", color: "#f4f4f5" },
  testimonialRole: { fontSize: 12, color: ZINC400 },
  testimonialStars: { flexDirection: "row", gap: 3 },

  // ── FAQ
  faqList: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: ZINC800,
    backgroundColor: "rgba(24,24,27,0.6)",
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: ZINC800,
  },
  faqQuestion: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  faqQuestionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#fff",
    flex: 1,
    paddingRight: 12,
  },
  faqChevron: { fontSize: 22, color: PINK, fontWeight: "700" },
  faqAnswer: {
    paddingHorizontal: 20,
    paddingBottom: 18,
    fontSize: 13,
    color: ZINC400,
    lineHeight: 20,
  },

  // ── CTA
  ctaSection: {
    margin: 16,
    borderRadius: 24,
    backgroundColor: "#080508",
    padding: 32,
    overflow: "hidden",
    gap: 16,
  },
  ctaGlow1: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(255,55,170,0.35)",
    top: -80,
    left: -60,
    opacity: 0.8,
  },
  ctaGlow2: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(220,30,150,0.3)",
    bottom: -60,
    right: -40,
    opacity: 0.8,
  },
  ctaTitle: {
    fontSize: 36,
    fontWeight: "800",
    color: "#fff",
    lineHeight: 44,
    letterSpacing: -0.5,
    zIndex: 1,
  },
  ctaDesc: {
    fontSize: 15,
    color: "rgba(255,255,255,0.85)",
    lineHeight: 24,
    zIndex: 1,
  },
  ctaWhiteBtn: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 24,
    zIndex: 1,
  },
  ctaWhiteBtnText: {
    color: PINK,
    fontWeight: "700",
    fontSize: 15,
  },
});

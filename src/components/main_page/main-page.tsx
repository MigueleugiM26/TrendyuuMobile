import { useUser } from "@/src/context/user-context";
import { useTranslations } from "@/src/hooks/useTranslations";
import { captureAffiliateCode } from "@/src/utils/affiliates";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { useEffect } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import type { Plan } from "@/src/types/checkout";
import DiferenciaisGrid from "./diferenciais";
import FAQSection from "./faq_section";
import FeatureGridSection from "./feature_list";
import Footer from "./footer";
import LLMModels from "./llm_models";
import PricingTable from "./pricing";
import AutoPresetDemoPreview from "./ProductGenerationDemo";
import CTASection from "./start_now";
import TestimonialsSection from "./testimonials_section";
import ValueProposition from "./value_proposition_section";

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroSection() {
  const t = useTranslations();
  const { user, loading } = useUser();
  const router = useRouter();

  return (
    <View style={hero.root}>
      {/* bg-[position:75%_center]: position the image so its 75% x-point is at screen center,
          revealing the right portion (the face). Achieved by offsetting left by -50% of the
          image's extra width. We render it at 150% screen width anchored to the right. */}
      <Image
        source={{
          uri: "https://cdn-frontend.trendyuu.com/public/novo_fundo_trend.webp",
        }}
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          right: 0,
          width: "235%",
          height: "100%",
        }}
        resizeMode="cover"
      />
      {/* 105deg gradient: top-left dark → bottom-right transparent */}
      <LinearGradient
        colors={[
          "rgba(0,0,0,0.72)",
          "rgba(0,0,0,0.50)",
          "rgba(0,0,0,0.15)",
          "rgba(0,0,0,0.0)",
        ]}
        locations={[0, 0.38, 0.62, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Bottom-to-top: dark at bottom fading up */}
      <LinearGradient
        colors={["rgba(0,0,0,0.70)", "rgba(0,0,0,0.20)", "rgba(0,0,0,0)"]}
        locations={[0, 0.35, 0.65]}
        start={{ x: 0, y: 1 }}
        end={{ x: 0, y: 0 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={hero.content}>
        <Text style={hero.title}>
          {t("mainPage.hero.titleLine1")}
          {"\n"}
          <Text style={hero.titlePink}>{t("mainPage.hero.titleLine2")}</Text>
        </Text>

        <Text style={hero.subtitle}>{t("mainPage.hero.subtitle")}</Text>

        {user?.name ? (
          <Pressable
            onPress={() => router.push("/dashboard")}
            disabled={loading}
            style={({ pressed }) => [
              hero.ctaBtn,
              hero.ctaPink,
              pressed && { opacity: 0.85 },
            ]}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Text style={hero.ctaText}>Dashboard</Text>
                <ChevronRight size={18} color="#fff" />
              </>
            )}
          </Pressable>
        ) : (
          <Pressable
            onPress={() => router.push("/login")}
            disabled={loading}
            style={({ pressed }) => [
              hero.ctaBtn,
              hero.ctaWhite,
              pressed && { opacity: 0.85 },
            ]}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Text style={hero.ctaTextDark}>{t("mainPage.hero.cta")}</Text>
            )}
          </Pressable>
        )}
      </View>
    </View>
  );
}

const hero = StyleSheet.create({
  root: { height: 846, justifyContent: "flex-start", overflow: "hidden" },

  content: { padding: 24, paddingBottom: 0, paddingTop: 256, gap: 16 },
  title: { fontSize: 36, fontWeight: "800", color: "#fff", lineHeight: 44 },
  titlePink: { color: "#ec4899" },
  subtitle: {
    fontSize: 16,
    color: "#9ca3af",
    lineHeight: 26,
    fontWeight: "700",
    maxWidth: 320,
  },
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingVertical: 16,
    paddingHorizontal: 28,
  },
  ctaPink: { backgroundColor: "#ec4899" },
  ctaWhite: { backgroundColor: "#fff" },
  ctaText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  ctaTextDark: { color: "#000", fontWeight: "700", fontSize: 16 },
});

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function MainPage() {
  useEffect(() => {
    captureAffiliateCode();
  }, []);

  // Checkout is handled in the pricing section — pass a handler if you have a
  // modal. For now we navigate to /dashboard/checkout with the plan in params.
  const router = useRouter();
  function handleSelectPlan(plan: Plan) {
    router.push({
      pathname: "/checkout",
      params: { plan: JSON.stringify(plan) },
    });
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      {/* 1. Hero */}
      <HeroSection />

      {/* 2. ProductGenerationDemo */}
      <AutoPresetDemoPreview />

      {/* 3. Value Proposition */}
      <ValueProposition />

      {/* 4. Feature list */}
      <FeatureGridSection />

      {/* 5. LLM Models */}
      <LLMModels />

      {/* 6. Differentials */}
      <DiferenciaisGrid />

      {/* 7. Testimonials */}
      <TestimonialsSection />

      {/* 8. Pricing */}
      <PricingTable onSelectPlan={handleSelectPlan} />

      {/* 9. FAQ */}
      <FAQSection />

      {/* 10. CTA */}
      <CTASection />

      {/* 11. Footer */}
      <Footer />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000" },
  content: { paddingBottom: 0 },
});

import React from "react";
import { ScrollView, StyleSheet, View, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import { useUser } from "../context/user-context";

import HeroSection from "../components/home/HeroSection";
import BrandsSection from "../components/home/BrandsSection";
import ValuePropositionSection from "../components/home/ValuePropositionSection";
import FeaturesSection from "../components/home/FeaturesSection";
import PricingSection from "../components/home/PricingSection";
import TestimonialsSection from "../components/home/TestimonialsSection";
import FAQSection from "../components/home/FAQSection";
import CTASection from "../components/home/CTASection";
import FooterSection from "../components/home/FooterSection";

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useUser();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <HeroSection
          user={user}
          onLoginPress={() => router.push("/login")}
          onDashboardPress={() => router.push("/")}
        />
        <BrandsSection />
        <ValuePropositionSection />
        <FeaturesSection />
        <PricingSection />
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
        <FooterSection />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000000" },
  scroll: { flex: 1 },
  content: { alignItems: "center" },
});

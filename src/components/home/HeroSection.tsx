import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  ImageBackground,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslations } from "../../hooks/useTranslations";

const { width, height } = Dimensions.get("window");

import type { User } from "../../types/user";

interface Props {
  user?: User | null;
  onLoginPress?: () => void;
  onDashboardPress?: () => void;
}

export default function HeroSection({
  user,
  onLoginPress,
  onDashboardPress,
}: Props) {
  const t = useTranslations("mainPage.hero");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const btnAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 60,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 60,
          friction: 10,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(btnAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../../assets/hero_main_photo.jpg")}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay} />

        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          {/* t("mainPage.hero.title") */}
          <Text style={styles.headline}>{t("titleLine1")}</Text>
          <Text style={styles.headline}>{t("titleLine2")}</Text>

          {/* t("mainPage.hero.subtitle") */}
          <Text style={styles.subheadline}>{t("subtitle")}</Text>

          <Animated.View style={{ opacity: btnAnim }}>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={user ? onDashboardPress : onLoginPress}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={["#ec4899", "#be185d"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaGradient}
              >
                <Text style={styles.ctaText}>
                  {user ? "Dashboard" : t("cta")}
                </Text>
                <Text style={styles.ctaArrow}>›</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width, height },
  background: { flex: 1, justifyContent: "center", alignItems: "center" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.65)",
  },
  content: { paddingHorizontal: 24, alignItems: "center", gap: 24 },
  headline: {
    fontSize: 52,
    fontWeight: "900",
    color: "#ffffff",
    textAlign: "center",
    lineHeight: 60,
    letterSpacing: -1,
  },
  subheadline: {
    fontSize: 18,
    color: "rgba(255,255,255,0.75)",
    textAlign: "center",
    lineHeight: 28,
    maxWidth: 300,
  },
  ctaButton: {
    borderRadius: 16,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#ec4899",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
  },
  ctaGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 18,
    gap: 8,
  },
  ctaText: { color: "#ffffff", fontSize: 18, fontWeight: "700" },
  ctaArrow: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "300",
    lineHeight: 24,
  },
});

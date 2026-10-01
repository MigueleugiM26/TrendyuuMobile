import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

export default function SplashScreen({ onFinish }: { onFinish?: () => void }) {
  // ── Animated values ────────────────────────────────────────────────────────
  const glowAnim = useRef(new Animated.Value(0)).current;
  const logoTranslateY = useRef(new Animated.Value(-250)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateX = useRef(new Animated.Value(-15)).current;
  const dotsOpacity = useRef(new Animated.Value(0)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;
  const footerTransY = useRef(new Animated.Value(10)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;
  const containerScale = useRef(new Animated.Value(1)).current;

  // Bouncing dots
  const dot1Y = useRef(new Animated.Value(0)).current;
  const dot2Y = useRef(new Animated.Value(0)).current;
  const dot3Y = useRef(new Animated.Value(0)).current;

  const [startText, setStartText] = useState(false);

  const bounceDot = (anim: Animated.Value, delay: number) =>
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: -6,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    );

  useEffect(() => {
    // 1. Glow fade in
    Animated.timing(glowAnim, {
      toValue: 1,
      duration: 1200,
      delay: 500,
      useNativeDriver: true,
    }).start();

    // 2. Logo drop in (spring-like via sequence)
    Animated.parallel([
      Animated.spring(logoTranslateY, {
        toValue: 0,
        tension: 140,
        friction: 15,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 400,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 140,
        friction: 15,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // 3. After logo lands, show text + dots
      setStartText(true);

      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateX, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(dotsOpacity, {
          toValue: 1,
          duration: 300,
          delay: 600,
          useNativeDriver: true,
        }),
        Animated.timing(footerOpacity, {
          toValue: 1,
          duration: 600,
          delay: 800,
          useNativeDriver: true,
        }),
        Animated.timing(footerTransY, {
          toValue: 0,
          duration: 600,
          delay: 800,
          useNativeDriver: true,
        }),
      ]).start();

      // Start bouncing dots
      bounceDot(dot1Y, 0).start();
      bounceDot(dot2Y, 150).start();
      bounceDot(dot3Y, 300).start();
    });

    // 4. After 4s, fade out the whole container then call onFinish
    const exitTimer = setTimeout(() => {
      // Stop dots
      dot1Y.stopAnimation();
      dot2Y.stopAnimation();
      dot3Y.stopAnimation();

      Animated.parallel([
        Animated.timing(containerOpacity, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(containerScale, {
          toValue: 1.05,
          duration: 900,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onFinish?.();
      });
    }, 4000);

    return () => clearTimeout(exitTimer);
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: containerOpacity,
          transform: [{ scale: containerScale }],
        },
      ]}
    >
      {/* Glow */}
      <Animated.View style={[styles.glow, { opacity: glowAnim }]} />

      {/* Center */}
      <View style={styles.centerContainer}>
        <View style={styles.logoRow}>
          {/* Logo */}
          <Animated.View
            style={[
              styles.logoWrapper,
              {
                opacity: logoOpacity,
                transform: [
                  { translateY: logoTranslateY },
                  { scale: logoScale },
                ],
              },
            ]}
          >
            <View style={styles.logoPulse} />
            <Image
              source={{
                uri: "https://cdn-frontend.trendyuu.com/public/logos/logotrend2.webp",
              }}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animated.View>

          {/* Brand text */}
          {startText && (
            <Animated.View
              style={[
                styles.brandTextRow,
                {
                  opacity: textOpacity,
                  transform: [{ translateX: textTranslateX }],
                },
              ]}
            >
              <Text style={styles.brandTextWhite}>Trend</Text>
              <Text style={styles.brandTextPink}>Yuu</Text>
            </Animated.View>
          )}
        </View>

        {/* Bouncing dots */}
        {startText && (
          <Animated.View
            style={[styles.dotsContainer, { opacity: dotsOpacity }]}
          >
            <View style={styles.dotsRow}>
              <Animated.View
                style={[styles.dot, { transform: [{ translateY: dot1Y }] }]}
              />
              <Animated.View
                style={[styles.dot, { transform: [{ translateY: dot2Y }] }]}
              />
              <Animated.View
                style={[styles.dot, { transform: [{ translateY: dot3Y }] }]}
              />
            </View>
          </Animated.View>
        )}
      </View>

      {/* Footer */}
      <Animated.View
        style={[
          styles.footer,
          {
            opacity: footerOpacity,
            transform: [{ translateY: footerTransY }],
          },
        ]}
      >
        <Text style={styles.footerFrom}>from</Text>
        <View style={styles.footerBadge}>
          <Image
            source={{
              uri: "https://cdn-frontend.trendyuu.com/public/logos/evovince_white_logo.webp",
            }}
            style={styles.evovinceLogo}
            resizeMode="contain"
          />
          <Text style={styles.evovinceText}>EvoVince</Text>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    width,
    height,
    zIndex: 9999,
    backgroundColor: "#09090b",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 56,
    overflow: "hidden",
  },
  glow: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 400,
    height: 400,
    marginTop: -200,
    marginLeft: -200,
    backgroundColor: "rgba(236,72,153,0.10)",
    borderRadius: 200,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  logoWrapper: {
    zIndex: 20,
    flexShrink: 0,
  },
  logoPulse: {
    position: "absolute",
    top: -12,
    left: -12,
    right: -12,
    bottom: -12,
    backgroundColor: "rgba(236,72,153,0.20)",
    borderRadius: 9999,
  },
  logo: {
    width: 70,
    height: 70,
  },
  brandTextRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  brandTextWhite: {
    color: "#ffffff",
    fontSize: 36,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  brandTextPink: {
    color: "#ec4899",
    fontSize: 36,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  dotsContainer: {
    marginTop: 32,
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    backgroundColor: "#ec4899",
    borderRadius: 3,
  },
  footer: {
    alignItems: "center",
    gap: 8,
    zIndex: 10,
  },
  footerFrom: {
    fontSize: 10,
    fontWeight: "600",
    color: "#71717a",
    letterSpacing: 4,
    textTransform: "uppercase",
  },
  footerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 9999,
    backgroundColor: "rgba(24,24,27,0.80)",
    borderWidth: 1,
    borderColor: "rgba(39,39,42,0.80)",
  },
  evovinceLogo: {
    width: 16,
    height: 16,
    opacity: 0.8,
  },
  evovinceText: {
    color: "#d4d4d8",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
});

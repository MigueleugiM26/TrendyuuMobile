import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, Animated, Dimensions, ScrollView, Image,
} from 'react-native';
import { useTranslations } from '../../hooks/useTranslations';

const { width } = Dimensions.get('window');

// Same brand images as web — place them in assets/brands/
const BRANDS = [
  { src: require('../../../assets/brands/instagramlogo.png'), alt: 'Instagram' },
  { src: require('../../../assets/brands/kwailogo.png'),      alt: 'Kwai' },
  { src: require('../../../assets/brands/tiktoklogo1.png'),   alt: 'TikTok' },
  { src: require('../../../assets/brands/youtubelogo.png'),   alt: 'YouTube' },
  { src: require('../../../assets/brands/pinterestlogo.png'), alt: 'Pinterest' },
  { src: require('../../../assets/brands/snaplogo.png'),      alt: 'Snapchat' },
  { src: require('../../../assets/brands/facebooklogo.png'),  alt: 'Facebook' },
];

export default function BrandsSection() {
  // Exact key: t("mainPage.brands.title")
  const t = useTranslations('mainPage.brands');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* py-20 text-center */}
      <Text style={styles.title}>{t('title')}</Text>

      {/* Brand logos row — same gap-10 layout as web */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {BRANDS.map((brand, i) => (
          <View key={i} style={styles.logoWrapper}>
            <Image
              source={brand.src}
              style={styles.logo}
              resizeMode="contain"
              accessibilityLabel={brand.alt}
            />
          </View>
        ))}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width,
    paddingVertical: 60,       // py-20
    paddingHorizontal: 4,      // px-1
  },
  title: {
    color: '#f3f4f6',           // text-gray-100
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,           // mb-6
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 32,                    // gap-10 ≈ 40px, slightly tighter on mobile
  },
  logoWrapper: {
    flexShrink: 0,
  },
  logo: {
    height: 40,                 // h-12 → slightly smaller on mobile
    width: 100,
  },
});

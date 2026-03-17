import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Dimensions, Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslations } from '../../hooks/useTranslations';

const { width } = Dimensions.get('window');

export default function CTASection() {
  // Same namespace as web: "StartNow"
  const t = useTranslations('StartNow');

  return (
    <View style={styles.wrapper}>
      <LinearGradient
        // Matches: bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600
        colors={['#ec4899', '#f43f5e', '#db2777']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        {/* Decorative blurs */}
        <View style={styles.decorTR} />
        <View style={styles.decorBL} />

        {/* Sparkle dots */}
        <View style={[styles.sparkle, { top: 24, right: '28%' }]} />
        <View style={[styles.sparkle, { top: 48, right: '40%', width: 4, height: 4, opacity: 0.5 }]} />
        <View style={[styles.sparkle, { bottom: 40, left: '28%', opacity: 0.7 }]} />

        <View style={styles.content}>
          {/* t("StartNow.sectionTitle") */}
          <Text style={styles.title}>{t('sectionTitle')}</Text>

          {/* t("StartNow.sectionDescription") */}
          <Text style={styles.description}>{t('sectionDescription')}</Text>

          {/* t("StartNow.buttonText") */}
          <TouchableOpacity
            style={styles.button}
            onPress={() => Linking.openURL('https://trendyuu.com/login')}
            activeOpacity={0.9}
          >
            <Text style={styles.buttonText}>{t('buttonText')}</Text>
            <Text style={styles.buttonArrow}>›</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  container: {
    borderRadius: 24,
    overflow: 'hidden',
    paddingVertical: 56,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  decorTR: {
    position: 'absolute',
    top: -60, right: -60,
    width: 200, height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  decorBL: {
    position: 'absolute',
    bottom: -80, left: -80,
    width: 220, height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(219,39,119,0.2)',
  },
  sparkle: {
    position: 'absolute',
    width: 6, height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  content: { alignItems: 'center', zIndex: 1 },
  title: {
    fontSize: 40, fontWeight: '900', color: '#ffffff',
    textAlign: 'center', letterSpacing: -0.5, marginBottom: 16,
  },
  description: {
    fontSize: 16, color: 'rgba(255,255,255,0.9)',
    textAlign: 'center', lineHeight: 26,
    marginBottom: 36, maxWidth: 300,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    borderRadius: 100,
    paddingHorizontal: 28,
    paddingVertical: 16,
    shadowColor: 'rgba(255,255,255,0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonText:  { color: '#db2777', fontSize: 16, fontWeight: '700' },
  buttonArrow: { color: '#db2777', fontSize: 20, fontWeight: '300', lineHeight: 22 },
});

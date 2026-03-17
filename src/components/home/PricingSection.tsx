import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Dimensions, Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslations } from '../../hooks/useTranslations';

const { width } = Dimensions.get('window');

// Same plan structure as web
const PLANS = [
  {
    plano: 'starter',
    recursos: [
      'aiVoiceGeneration', 'creditLimitStarter', 'autoClipStarter',
      'shortGeneratorStarter', 'caption', 'watermark',
      'characterLimitStarter', 'quality', 'cloudStorage',
    ],
    popular: false,
  },
  {
    plano: 'creator',
    recursos: [
      'advancedImageAI', 'audio', 'creditLimitCreator', 'autoClipCreator',
      'shortGeneratorCreator', 'splitVideo', 'cloudStorage',
    ],
    popular: true,
  },
  {
    plano: 'pro',
    recursos: [
      'nextGenVideoAI', 'proImageAI', 'creditLimitPro', 'autoClipPro',
      'shortGeneratorPro', 'effects', 'quality', 'cloudStorage',
    ],
    popular: false,
  },
];

export default function PricingSection() {
  // Same namespace as web: "Pricing"
  const t = useTranslations('Pricing');
  const [isMensal, setIsMensal] = useState(true);

  return (
    <View style={styles.container}>
      {/* t("Pricing.sectionTitle") */}
      <Text style={styles.title}>{t('sectionTitle')}</Text>
      {/* t("Pricing.sectionDescription") */}
      <Text style={styles.description}>{t('sectionDescription')}</Text>

      {/* Toggle — t("Pricing.buttons.monthly") / t("Pricing.buttons.annual") */}
      <View style={styles.toggle}>
        <TouchableOpacity
          style={[styles.toggleBtn, isMensal && styles.toggleBtnActive]}
          onPress={() => setIsMensal(true)}
        >
          <Text style={[styles.toggleText, isMensal && styles.toggleTextActive]}>
            {t('buttons.monthly')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, !isMensal && styles.toggleBtnActive]}
          onPress={() => setIsMensal(false)}
        >
          <Text style={[styles.toggleText, !isMensal && styles.toggleTextActive]}>
            {t('buttons.annual')}
          </Text>
          {!isMensal && (
            <Text style={styles.discountBadge}>-50%</Text>
          )}
        </TouchableOpacity>
      </View>

      {PLANS.map((plan, i) => (
        <View
          key={plan.plano}
          style={[
            styles.card,
            plan.popular && styles.cardPopular,
          ]}
        >
          {/* t("Pricing.labels.ping") */}
          {plan.popular && (
            <LinearGradient
              colors={['#ec4899', '#be185d']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.popularBanner}
            >
              <Text style={styles.popularText}>⭐ {t('labels.ping')}</Text>
            </LinearGradient>
          )}

          <View style={styles.cardHeader}>
            {/* t("Pricing.plans.{plano}.nome") */}
            <Text style={[styles.planName, plan.popular && styles.planNamePopular]}>
              {t(`plans.${plan.plano}.nome`)}
            </Text>
            {/* t("Pricing.plans.{plano}.descricao") */}
            <Text style={styles.planDesc}>{t(`plans.${plan.plano}.descricao`)}</Text>
          </View>

          {/* Price — hardcoded for now; wire up getPriceForUserRegion later */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>
              {isMensal ? '–' : '–'}
            </Text>
            <Text style={styles.pricePeriod}>
              /{t(`labels.${isMensal ? 'month' : 'year'}`)}
            </Text>
            {!isMensal && <Text style={styles.discountInline}>(-50%)</Text>}
          </View>

          {/* Features — t("Pricing.plans.{plano}.recursos.{idx}") */}
          <View style={styles.featuresList}>
            {plan.recursos.map((_, idx) => (
              <View key={idx} style={styles.featureRow}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.featureText}>
                  {t(`plans.${plan.plano}.recursos.${idx}`)}
                </Text>
              </View>
            ))}
          </View>

          {/* Subscribe button — t("Pricing.buttons.subscribe") */}
          <TouchableOpacity
            style={[styles.subscribeBtn, plan.popular && styles.subscribeBtnPopular]}
            onPress={() => Linking.openURL('https://trendyuu.com/login')}
            activeOpacity={0.85}
          >
            {plan.popular ? (
              <LinearGradient
                colors={['#ec4899', '#be185d']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.subscribeBtnGradient}
              >
                <Text style={styles.subscribeBtnTextActive}>
                  {t('buttons.subscribe', { planName: t(`plans.${plan.plano}.nome`) })}
                </Text>
              </LinearGradient>
            ) : (
              <Text style={styles.subscribeBtnText}>
                {t('buttons.subscribe', { planName: t(`plans.${plan.plano}.nome`) })}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width, paddingHorizontal: 24, paddingVertical: 60 },
  title: {
    fontSize: 32, fontWeight: '900', textAlign: 'center',
    color: '#ec4899', marginBottom: 12,
  },
  description: {
    fontSize: 15, color: '#a1a1aa', textAlign: 'center',
    lineHeight: 22, marginBottom: 32, maxWidth: 300, alignSelf: 'center',
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 100,
    padding: 4,
    alignSelf: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 100,
  },
  toggleBtnActive: { backgroundColor: '#ec4899' },
  toggleText:       { color: '#71717a', fontSize: 14, fontWeight: '600' },
  toggleTextActive: { color: '#ffffff' },
  discountBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#27272a',
    backgroundColor: 'rgba(255,255,255,0.03)',
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardPopular: {
    borderColor: '#ec4899',
    backgroundColor: 'rgba(236,72,153,0.05)',
  },
  popularBanner: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  popularText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
  cardHeader:  { padding: 20, paddingBottom: 0 },
  planName: {
    fontSize: 22, fontWeight: '900', color: '#ffffff', marginBottom: 4,
  },
  planNamePopular: { color: '#ec4899' },
  planDesc: { fontSize: 13, color: '#a1a1aa', marginBottom: 12 },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: 20,
    marginBottom: 4,
    gap: 4,
  },
  price:         { fontSize: 36, fontWeight: '900', color: '#ffffff', letterSpacing: -0.5 },
  pricePeriod:   { fontSize: 13, color: '#71717a' },
  discountInline:{ fontSize: 13, color: '#ec4899', fontWeight: '700' },
  featuresList:  { padding: 20, gap: 10 },
  featureRow:    { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  checkmark:     { color: '#ec4899', fontSize: 14, fontWeight: '700', width: 16, marginTop: 1 },
  featureText:   { flex: 1, color: '#d4d4d8', fontSize: 14, lineHeight: 20 },
  subscribeBtn: {
    margin: 20,
    marginTop: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3f3f46',
    overflow: 'hidden',
  },
  subscribeBtnPopular: { borderColor: '#ec4899' },
  subscribeBtnGradient:{ paddingVertical: 14, alignItems: 'center' },
  subscribeBtnTextActive:{ color: '#ffffff', fontSize: 15, fontWeight: '700' },
  subscribeBtnText: {
    color: '#d4d4d8', fontSize: 15, fontWeight: '700',
    textAlign: 'center', paddingVertical: 14,
  },
});

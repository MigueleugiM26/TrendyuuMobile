import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Dimensions, Animated, Image,
} from 'react-native';
import { useTranslations } from '../../hooks/useTranslations';

const { width } = Dimensions.get('window');

export default function ValuePropositionSection() {
  // Exact namespace: "mainPage.valueProposition"
  const t = useTranslations('mainPage.valueProposition');

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  // Animated counters — same as web (10x, 1_000_000)
  const [count1, setCount1] = useState(0);
  const [count2, setCount2] = useState(0);
  const hasStarted = useRef(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 10, useNativeDriver: true }),
    ]).start(() => {
      if (hasStarted.current) return;
      hasStarted.current = true;
      const end1 = 10, end2 = 1000000;
      const duration = 2000, stepTime = 16;
      const totalSteps = duration / stepTime;
      let step = 0;
      const timer = setInterval(() => {
        step++;
        const progress = step / totalSteps;
        setCount1(Math.floor(progress * end1));
        setCount2(Math.floor(progress * end2));
        if (step >= totalSteps) {
          clearInterval(timer);
          setCount1(end1);
          setCount2(end2);
        }
      }, stepTime);
    });
  }, []);

  return (
    <Animated.View style={[styles.container, {
      opacity: fadeAnim,
      transform: [{ translateY: slideAnim }],
    }]}>

      {/* Title + subtitle — exact keys */}
      <Text style={styles.title}>{t('title')}</Text>
      <Text style={styles.subtitle}>{t('subtitle')}</Text>

      {/* Main card — t("mainPage.valueProposition.mainCard.*") */}
      <View style={styles.mainCard}>
        <View style={styles.mainCardText}>
          <Text style={styles.mainCardTitle}>{t('mainCard.title')}</Text>
          <Text style={styles.mainCardDescription}>{t('mainCard.description')}</Text>
        </View>
        {/* img1_proposal.png — place in assets/images/ */}
        <Image
          source={require('../../../assets/images/img1_proposal.png')}
          style={styles.mainCardImage}
          resizeMode="cover"
        />
      </View>

      {/* Feature cards — t("mainPage.valueProposition.feature1/2/3.*") */}
      <View style={styles.featuresGrid}>
        {[1, 2, 3].map((n) => (
          <View key={n} style={styles.featureCard}>
            <Text style={styles.featureTitle}>{t(`feature${n}.title`)}</Text>
            <Text style={styles.featureDescription}>{t(`feature${n}.description`)}</Text>
            <Image
              source={
                n === 1 ? require('../../../assets/images/img4_proposal.png')
                : n === 2 ? require('../../../assets/images/img3_proposal.png')
                : require('../../../assets/images/img2_proposal.png')
              }
              style={styles.featureImage}
              resizeMode="cover"
            />
          </View>
        ))}
      </View>

      {/* Metrics — t("mainPage.valueProposition.metrics.*") */}
      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricNumber}>
            {t('metrics.speed', { count: count1.toString() })}
          </Text>
          <Text style={styles.metricLabel}>{t('metrics.speedSubtitle')}</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricNumber}>
            {t('metrics.processed', { count: count2.toLocaleString() })}
          </Text>
          <Text style={styles.metricLabel}>{t('metrics.processedSubtitle')}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width,
    paddingHorizontal: 20,
    paddingVertical: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
    lineHeight: 42,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: '#a1a1aa',     // zinc-400
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  // Main card — matches the top full-width card
  mainCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#27272a',   // zinc-800
    backgroundColor: '#18181b', // zinc-900
    marginBottom: 2,
  },
  mainCardText: {
    padding: 24,
  },
  mainCardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  mainCardDescription: {
    fontSize: 14,
    color: '#a1a1aa',
    lineHeight: 22,
  },
  mainCardImage: {
    width: '100%',
    height: 220,
  },
  // 3 feature cards stacked vertically on mobile
  featuresGrid: {
    borderWidth: 1,
    borderColor: '#27272a',
    marginBottom: 48,
  },
  featureCard: {
    backgroundColor: '#18181b',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  featureTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: '#a1a1aa',
    lineHeight: 22,
    marginBottom: 16,
  },
  featureImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  metricCard: {
    flex: 1,
    alignItems: 'center',
  },
  metricNumber: {
    fontSize: 36,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -1,
    marginBottom: 4,
    textAlign: 'center',
  },
  metricLabel: {
    fontSize: 13,
    color: '#71717a',   // zinc-500
    textAlign: 'center',
    lineHeight: 18,
  },
});

import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Dimensions, ScrollView,
  TouchableOpacity, Image,
} from 'react-native';
import { useTranslations } from '../../hooks/useTranslations';

const { width } = Dimensions.get('window');

// Same testimonials array as web
const TESTIMONIALS = [
  {
    quote:   'angeloQuote',
    author:  'angeloAuthor',
    role:    'angeloRole',
    company: 'angeloCompany',
    avatar:  require('../../../assets/images/angelofoto13.jpg'),
  },
  {
    quote:   'kauaQuote',
    author:  'kauaAuthor',
    role:    'kauaRole',
    company: 'kauaCompany',
    avatar:  require('../../../assets/images/kauafoto.jpg'),
  },
];

export default function TestimonialsSection() {
  // Same namespace as web: "TestimonialsSection"
  const t = useTranslations('TestimonialsSection');
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const CARD_WIDTH = width - 48;

  const handleScroll = (e: any) => {
    const x = e.nativeEvent.contentOffset.x;
    setActiveIndex(Math.round(x / (CARD_WIDTH + 16)));
  };

  return (
    <View style={styles.container}>
      {/* t("TestimonialsSection.sectionTitle") */}
      <Text style={styles.title}>{t('sectionTitle')}</Text>
      {/* t("TestimonialsSection.subtitle") */}
      <Text style={styles.subtitle}>{t('subtitle')}</Text>
      {/* t("TestimonialsSection.sectionDescription") */}
      <Text style={styles.description}>{t('sectionDescription')}</Text>

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + 16}
        snapToAlignment="start"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.cardsRow}
        style={styles.cardsScroll}
      >
        {TESTIMONIALS.map((item, i) => (
          <View key={i} style={[styles.card, { width: CARD_WIDTH }]}>
            {/* Quote — t("TestimonialsSection.{item.quote}") */}
            <Text style={styles.quote}>"{t(item.quote)}"</Text>

            <View style={styles.footer}>
              <Image source={item.avatar} style={styles.avatar} />
              <View style={styles.authorInfo}>
                {/* t("TestimonialsSection.{item.author}") */}
                <Text style={styles.authorName}>{t(item.author)}</Text>
                {/* t("TestimonialsSection.{item.role}") / t("TestimonialsSection.{item.company}") */}
                <Text style={styles.authorRole}>
                  {t(item.role)} / {t(item.company)}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Dots */}
      <View style={styles.dots}>
        {TESTIMONIALS.map((_, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => {
              scrollRef.current?.scrollTo({ x: i * (CARD_WIDTH + 16), animated: true });
              setActiveIndex(i);
            }}
          >
            <View style={[styles.dot, activeIndex === i && styles.dotActive]} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width, paddingVertical: 48, paddingHorizontal: 24 },
  title: {
    fontSize: 28, fontWeight: '900', color: '#ffffff',
    letterSpacing: -0.5, marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16, color: '#ec4899', fontWeight: '600',
    textAlign: 'center', marginBottom: 8,
  },
  description: {
    fontSize: 14, color: '#a1a1aa', textAlign: 'center',
    lineHeight: 22, marginBottom: 28,
  },
  cardsScroll:  { marginLeft: -24, marginRight: -24 },
  cardsRow:     { paddingHorizontal: 24, gap: 16 },
  card: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 16,
    padding: 24,
  },
  quote: {
    fontSize: 16, color: '#d4d4d8', lineHeight: 26,
    marginBottom: 24, fontStyle: 'italic',
  },
  footer:     { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar:     { width: 40, height: 40, borderRadius: 20, backgroundColor: '#3f3f46' },
  authorInfo: { flex: 1 },
  authorName: { fontSize: 14, fontWeight: '700', color: '#f4f4f5', marginBottom: 2 },
  authorRole: { fontSize: 12, color: '#71717a' },
  dots:       { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 20 },
  dot:        { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.2)' },
  dotActive:  { width: 20, backgroundColor: '#ec4899' },
});

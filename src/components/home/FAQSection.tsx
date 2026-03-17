import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Dimensions,
  LayoutAnimation, Platform, UIManager, Animated,
} from 'react-native';
import { useTranslations, useLanguage } from '../../hooks/useTranslations';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const { width } = Dimensions.get('window');

function FAQItem({
  question, answer, isOpen, onToggle,
}: { question: string; answer: string; isOpen: boolean; onToggle: () => void }) {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Animated.timing(rotateAnim, {
      toValue: isOpen ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    onToggle();
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  return (
    <View style={styles.item}>
      <TouchableOpacity style={styles.question} onPress={toggle} activeOpacity={0.8}>
        <Text style={styles.questionText}>{question}</Text>
        <Animated.Text style={[styles.plus, { transform: [{ rotate }] }]}>+</Animated.Text>
      </TouchableOpacity>
      {isOpen && (
        <View style={styles.answer}>
          <Text style={styles.answerText}>{answer}</Text>
        </View>
      )}
    </View>
  );
}

export default function FAQSection() {
  // Same keys as web — t("mainPage.faq.*")
  const t = useTranslations('mainPage.faq');
  // tRaw mirrors your web useLanguage hook for array data
  const { tRaw } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Same pattern as web: tRaw("mainPage.faq.items") returns the array
  const items = Array.isArray(tRaw('mainPage.faq.items'))
    ? (tRaw('mainPage.faq.items') as Array<{ question: string; answer: string }>)
    : [];

  return (
    <View style={styles.container}>
      {/* Left column from web — stacked vertically on mobile */}
      <Text style={styles.title}>
        {t('mainPageTitle')}{'\n'}
        <Text style={styles.titleHighlight}>{t('subtitleHighlight')}</Text>
        {'\n'}{t('subtitle')}
      </Text>

      <Text style={styles.description}>{t('description')}</Text>

      {/* FAQ Accordion — exact same data source */}
      <View style={styles.accordion}>
        {items.map((faq, i) => (
          <FAQItem
            key={i}
            question={faq.question}
            answer={faq.answer}
            isOpen={openIndex === i}
            onToggle={() => setOpenIndex(openIndex === i ? null : i)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width, paddingHorizontal: 24, paddingVertical: 60 },
  title: {
    fontSize: 36, fontWeight: '900', color: '#ffffff',
    lineHeight: 46, marginBottom: 16,
  },
  titleHighlight: { color: '#f472b6' },  // text-pink-400
  description: {
    fontSize: 15, color: '#a1a1aa',
    lineHeight: 24, marginBottom: 32,
  },
  accordion: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#27272a',
    backgroundColor: 'rgba(24,24,27,0.6)',
    overflow: 'hidden',
  },
  item: {
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  question: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  questionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    paddingRight: 12,
    lineHeight: 22,
  },
  plus: {
    color: '#f472b6',  // text-pink-400
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 28,
  },
  answer: { paddingHorizontal: 20, paddingBottom: 20 },
  answerText: { fontSize: 15, color: '#a1a1aa', lineHeight: 24 },
});

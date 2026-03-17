import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Linking } from 'react-native';

const { width } = Dimensions.get('window');

const LINKS = [
  { label: 'Privacy Policy', url: 'https://trendyuu.com/policies/privacy' },
  { label: 'Terms',          url: 'https://trendyuu.com/policies/terms' },
  { label: 'Support',        url: 'https://trendyuu.com/support-chat' },
];

export default function FooterSection() {
  return (
    <View style={styles.container}>
      <View style={styles.divider} />
      <Text style={styles.logo}>Trend<Text style={styles.logoAccent}>Yuu</Text></Text>
      <View style={styles.links}>
        {LINKS.map((l, i) => (
          <TouchableOpacity key={i} onPress={() => Linking.openURL(l.url)}>
            <Text style={styles.link}>{l.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.copy}>© {new Date().getFullYear()} TrendYuu. All rights reserved.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { width, paddingHorizontal: 24, paddingBottom: 48, alignItems: 'center' },
  divider:    { width: '100%', height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginBottom: 28 },
  logo:       { fontSize: 26, fontWeight: '900', color: '#ffffff', marginBottom: 16 },
  logoAccent: { color: '#ec4899' },
  links:      { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6, marginBottom: 16 },
  link:       { color: 'rgba(255,255,255,0.4)', fontSize: 13, paddingHorizontal: 6, paddingVertical: 4 },
  copy:       { color: 'rgba(255,255,255,0.2)', fontSize: 12 },
});

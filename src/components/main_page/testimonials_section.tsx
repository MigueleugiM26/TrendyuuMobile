import { useTranslations } from "@/src/hooks/useTranslations";
import { Star } from "lucide-react-native";
import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

interface Testimonial {
  quoteKey: string;
  authorKey: string;
  roleKey: string;
  companyKey: string;
  avatar: string;
  rating: number;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quoteKey: "angeloQuote",
    authorKey: "angeloAuthor",
    roleKey: "angeloRole",
    companyKey: "angeloCompany",
    avatar: "https://cdn-frontend.trendyuu.com/public/images/angelofoto13.webp",
    rating: 5,
  },
  {
    quoteKey: "kauaQuote",
    authorKey: "kauaAuthor",
    roleKey: "kauaRole",
    companyKey: "kauaCompany",
    avatar: "https://cdn-frontend.trendyuu.com/public/images/kauafoto.webp",
    rating: 5,
  },
];

export default function TestimonialsSection() {
  const t = useTranslations("TestimonialsSection");
  const [selected, setSelected] = useState(0);
  const active = TESTIMONIALS[selected];

  return (
    <View style={styles.root}>
      <Text style={styles.title}>{t("sectionTitle")}</Text>

      {/* Avatar selector */}
      <View style={styles.avatars}>
        {TESTIMONIALS.map((item, i) => (
          <Pressable key={i} onPress={() => setSelected(i)}>
            <Image
              source={{ uri: item.avatar }}
              style={[
                styles.avatar,
                i === selected ? styles.avatarActive : styles.avatarInactive,
              ]}
            />
          </Pressable>
        ))}
      </View>

      {/* Quote card */}
      <View style={styles.card}>
        <Text style={styles.bigQuote}>"</Text>
        <Text style={styles.quote}>"{t(active.quoteKey)}"</Text>
        <View style={styles.divider} />
        <View style={styles.footer}>
          <View>
            <Text style={styles.author}>{t(active.authorKey)}</Text>
            <Text style={styles.role}>
              {t(active.roleKey)}, {t(active.companyKey)}
            </Text>
          </View>
          <View style={styles.stars}>
            {Array.from({ length: active.rating }).map((_, i) => (
              <Star key={i} size={14} color="#ec4899" fill="#ec4899" />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingVertical: 40,
    paddingHorizontal: 16,
    backgroundColor: "#000",
    gap: 20,
  },
  title: {
    fontSize: 26,
    color: "#f4f4f5",
    textAlign: "center",
    lineHeight: 34,
  },

  avatars: { flexDirection: "row", justifyContent: "center", gap: 14 },
  avatar: { width: 96, height: 120, borderRadius: 16, borderWidth: 2 },
  avatarActive: { borderColor: "#ec4899", opacity: 1 },
  avatarInactive: { borderColor: "transparent", opacity: 0.5 },

  card: {
    backgroundColor: "rgba(24,24,27,0.6)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#27272a",
    padding: 24,
    gap: 16,
    overflow: "hidden",
  },
  bigQuote: {
    position: "absolute",
    right: 16,
    top: 8,
    fontSize: 80,
    color: "rgba(63,63,70,0.4)",
    fontFamily: "serif",
  },
  quote: { fontSize: 17, fontWeight: "300", color: "#e4e4e7", lineHeight: 28 },
  divider: { height: 1, backgroundColor: "#3f3f46", borderStyle: "dashed" },
  footer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  author: { fontSize: 15, fontWeight: "600", color: "#f4f4f5" },
  role: { fontSize: 12, color: "#a1a1aa", marginTop: 2 },
  stars: { flexDirection: "row", gap: 2 },
});

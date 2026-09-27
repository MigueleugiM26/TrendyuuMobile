import { useLanguage, useTranslations } from "@/src/hooks/useTranslations";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function FAQSection() {
  const t = useTranslations();
  const { tRaw } = useLanguage();
  const [open, setOpen] = useState<number | null>(null);
  const faqs = tRaw("mainPage.faq.items") as {
    question: string;
    answer: string;
  };

  return (
    <View style={styles.root}>
      <Text style={styles.title}>
        {t("mainPage.faq.mainPageTitle")}
        {"\n"}
        <Text style={styles.titleHighlight}>
          {t("mainPage.faq.subtitleHighlight")}
        </Text>
        {"\n"}
        {t("mainPage.faq.subtitle")}
      </Text>
      <Text style={styles.desc}>{t("mainPage.faq.description")}</Text>

      <View style={styles.list}>
        {(Array.isArray(faqs) ? faqs : []).map((faq, i) => (
          <View
            key={i}
            style={[styles.item, i < faqs.length - 1 && styles.itemBorder]}
          >
            <Pressable
              onPress={() => setOpen(open === i ? null : i)}
              style={styles.question}
            >
              <Text style={styles.questionText}>{faq.question}</Text>
              <Text style={styles.chevron}>{open === i ? "−" : "+"}</Text>
            </Pressable>
            {open === i && <Text style={styles.answer}>{faq.answer}</Text>}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingVertical: 40,
    paddingHorizontal: 16,
    backgroundColor: "#000",
    gap: 16,
  },
  title: { fontSize: 28, fontWeight: "800", color: "#fff", lineHeight: 38 },
  titleHighlight: { color: "#f472b6" },
  desc: { fontSize: 14, color: "#9ca3af", lineHeight: 22 },

  list: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#27272a",
    backgroundColor: "rgba(24,24,27,0.6)",
  },
  item: {},
  itemBorder: { borderBottomWidth: 1, borderBottomColor: "#27272a" },
  question: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  questionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "#fff",
    paddingRight: 12,
  },
  chevron: { fontSize: 22, color: "#ec4899", fontWeight: "700" },
  answer: {
    paddingHorizontal: 20,
    paddingBottom: 18,
    fontSize: 13,
    color: "#9ca3af",
    lineHeight: 20,
  },
});

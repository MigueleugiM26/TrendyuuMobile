import { useTranslations } from "@/src/hooks/useTranslations";
import {
  BookmarkCheck,
  Cpu,
  Layers,
  PuzzleIcon,
  ShieldCheck,
  UserCheck,
} from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

export default function DiferenciaisGrid() {
  const t = useTranslations();

  const features = [
    {
      Icon: ShieldCheck,
      titleKey: "mainPage.differentials.items.productFidelity.title",
      descKey: "mainPage.differentials.items.productFidelity.description",
    },
    {
      Icon: BookmarkCheck,
      titleKey: "mainPage.differentials.items.smartNodes.title",
      descKey: "mainPage.differentials.items.smartNodes.description",
    },
    {
      Icon: PuzzleIcon,
      titleKey: "mainPage.differentials.items.stylePresets.title",
      descKey: "mainPage.differentials.items.stylePresets.description",
    },
    {
      Icon: UserCheck,
      titleKey: "mainPage.differentials.items.characterLocking.title",
      descKey: "mainPage.differentials.items.characterLocking.description",
    },
    {
      Icon: Cpu,
      titleKey: "mainPage.differentials.items.multiEngine.title",
      descKey: "mainPage.differentials.items.multiEngine.description",
    },
    {
      Icon: Layers,
      titleKey: "mainPage.differentials.items.batchGeneration.title",
      descKey: "mainPage.differentials.items.batchGeneration.description",
    },
  ];

  return (
    <View style={styles.root}>
      <Text style={styles.title}>
        {t("mainPage.differentials.header.title")}
      </Text>
      <Text style={styles.subtitle}>
        {t("mainPage.differentials.header.subtitle")}
      </Text>

      <View style={styles.grid}>
        {features.map(({ Icon, titleKey, descKey }, i) => (
          <View key={i} style={styles.item}>
            <Icon size={20} color="#a1a1aa" strokeWidth={1.5} />
            <Text style={styles.itemTitle}>{t(titleKey)}</Text>
            <Text style={styles.itemDesc}>{t(descKey)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingVertical: 48,
    paddingHorizontal: 24,
    backgroundColor: "#000",
    gap: 16,
  },
  title: { fontSize: 28, fontWeight: "600", color: "#fff", lineHeight: 36 },
  subtitle: { fontSize: 14, color: "#a1a1aa", lineHeight: 22, marginBottom: 8 },
  grid: { gap: 28 },
  item: { gap: 6 },
  itemTitle: { fontSize: 15, fontWeight: "500", color: "#f4f4f5" },
  itemDesc: { fontSize: 13, color: "#a1a1aa", lineHeight: 20 },
});

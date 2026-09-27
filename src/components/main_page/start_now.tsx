import { useTranslations } from "@/src/hooks/useTranslations";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function CTASection() {
  const t = useTranslations("StartNow");
  const router = useRouter();

  return (
    <View style={styles.root}>
      {/* Glow blobs */}
      <View style={styles.glow1} />
      <View style={styles.glow2} />

      <Text style={styles.title}>{t("sectionTitle")}</Text>
      <Text style={styles.desc}>{t("sectionDescription")}</Text>

      <Pressable
        onPress={() => router.push("/login")}
        style={({ pressed }) => [styles.btn, pressed && { opacity: 0.85 }]}
      >
        <Text style={styles.btnText}>{t("buttonText")} →</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    margin: 16,
    borderRadius: 24,
    backgroundColor: "#080508",
    padding: 32,
    overflow: "hidden",
    gap: 16,
    alignItems: "flex-start",
  },
  glow1: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(255,55,170,0.35)",
    top: -100,
    left: -80,
  },
  glow2: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(220,30,150,0.3)",
    bottom: -80,
    right: -60,
  },
  title: {
    fontSize: 38,
    fontWeight: "800",
    color: "#fff",
    lineHeight: 46,
    letterSpacing: -0.5,
    zIndex: 1,
  },
  desc: {
    fontSize: 15,
    color: "rgba(255,255,255,0.85)",
    lineHeight: 24,
    zIndex: 1,
  },
  btn: {
    backgroundColor: "#fff",
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 24,
    zIndex: 1,
  },
  btnText: {
    color: "#ec4899",
    fontWeight: "700",
    fontSize: 15,
  },
});

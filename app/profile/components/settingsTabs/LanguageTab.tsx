import { ChevronDown, Globe } from "lucide-react-native";
import { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Language = {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
};

interface LanguageTabProps {
  currentLocale: string;
  SUPPORTED_LANGUAGES: Language[];
  handleLanguageChange: (newLocale: string) => void;
  t: (key: string, opts?: Record<string, string>) => string;
}

export default function LanguageTab({
  currentLocale,
  SUPPORTED_LANGUAGES,
  handleLanguageChange,
  t,
}: LanguageTabProps) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const selected =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLocale) ??
    SUPPORTED_LANGUAGES[0];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Globe size={18} color="#f4f4f5" />
        <View>
          <Text style={styles.title}>{t("languageRegion")}</Text>
          <Text style={styles.subtitle}>{t("chooseLanguage")}</Text>
        </View>
      </View>

      {/* Picker trigger */}
      <View style={styles.fieldWrapper}>
        <Text style={styles.fieldLabel}>{t("language")}</Text>
        <TouchableOpacity
          onPress={() => setPickerOpen(true)}
          style={styles.pickerTrigger}
          activeOpacity={0.7}
        >
          <View style={styles.pickerTriggerLeft}>
            <Text style={styles.pickerFlag}>{selected.flag}</Text>
            <Text style={styles.pickerNativeName}>{selected.nativeName}</Text>
          </View>
          <ChevronDown size={16} color="#71717a" />
        </TouchableOpacity>
        <Text style={styles.noteRed}>{t("progressInfo")}</Text>
        <Text style={styles.noteGray}>{t("reloadInfo")}</Text>
      </View>

      {/* Bottom-sheet picker (replaces shadcn Select) */}
      <Modal
        visible={pickerOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerOpen(false)}
      >
        <View style={styles.pickerBackdrop}>
          <View style={styles.pickerSheet}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {SUPPORTED_LANGUAGES.map((lang) => {
                const isSelected = lang.code === currentLocale;
                return (
                  <TouchableOpacity
                    key={lang.code}
                    onPress={() => {
                      handleLanguageChange(lang.code);
                      setPickerOpen(false);
                    }}
                    style={[
                      styles.pickerOption,
                      isSelected && styles.pickerOptionSelected,
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.pickerOptionFlag}>{lang.flag}</Text>
                    <View>
                      <Text style={styles.pickerOptionNative}>
                        {lang.nativeName}
                      </Text>
                      <Text style={styles.pickerOptionName}>{lang.name}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#f4f4f5",
  },
  subtitle: {
    fontSize: 13,
    color: "#d4d4d8",
    marginTop: 2,
  },
  fieldWrapper: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    color: "#d4d4d8",
  },
  pickerTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#27272a",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  pickerTriggerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pickerFlag: {
    fontSize: 20,
  },
  pickerNativeName: {
    fontSize: 14,
    color: "#fff",
  },
  noteRed: {
    fontSize: 11,
    color: "#f87171",
  },
  noteGray: {
    fontSize: 11,
    color: "#a1a1aa",
  },
  // Picker modal
  pickerBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  pickerSheet: {
    backgroundColor: "#18181b",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: "#27272a",
    maxHeight: "60%",
    paddingVertical: 8,
  },
  pickerOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  pickerOptionSelected: {
    backgroundColor: "rgba(236,72,153,0.1)",
  },
  pickerOptionFlag: {
    fontSize: 22,
  },
  pickerOptionNative: {
    fontSize: 14,
    color: "#f4f4f5",
  },
  pickerOptionName: {
    fontSize: 12,
    color: "#71717a",
    marginTop: 1,
  },
});

import { Bell, X } from "lucide-react-native";
import { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type NotificationType = { key: string; label: string; exampleKey: string };

interface NotificationsTabProps {
  NOTIFICATION_TYPES: NotificationType[];
  notificationPrefs: Record<string, boolean>;
  handleNotificationChange: (type: string, value: boolean) => void;
  t: (key: string, opts?: Record<string, string>) => string;
}

export default function NotificationsTab({
  NOTIFICATION_TYPES,
  notificationPrefs,
  handleNotificationChange,
  t,
}: NotificationsTabProps) {
  // Tooltip → long-press modal (no hover in RN)
  const [tooltip, setTooltip] = useState<{ key: string; text: string } | null>(
    null,
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Bell size={18} color="#f4f4f5" />
        <Text style={styles.title}>{t("notifications.title")}</Text>
      </View>

      {/* Notification toggles */}
      <View style={styles.grid}>
        {NOTIFICATION_TYPES.map((notif) => {
          const isEnabled = !!notificationPrefs[notif.key];
          return (
            <TouchableOpacity
              key={notif.key}
              onPress={() => handleNotificationChange(notif.key, !isEnabled)}
              onLongPress={() =>
                setTooltip({
                  key: notif.key,
                  text: t(`notifications.examples.${notif.exampleKey}`),
                })
              }
              style={[
                styles.notifBtn,
                isEnabled ? styles.notifBtnActive : styles.notifBtnInactive,
              ]}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.notifLabel,
                  !isEnabled && styles.notifLabelDisabled,
                ]}
              >
                {notif.label}
              </Text>
              <View
                style={[
                  styles.radioCircle,
                  isEnabled && styles.radioCircleActive,
                ]}
              />
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Tooltip modal (replaces shadcn Tooltip) */}
      <Modal
        visible={!!tooltip}
        transparent
        animationType="fade"
        onRequestClose={() => setTooltip(null)}
      >
        <Pressable
          style={styles.tooltipBackdrop}
          onPress={() => setTooltip(null)}
        >
          <View style={styles.tooltipBox}>
            <View style={styles.tooltipHeader}>
              <Text style={styles.tooltipTitle}>
                {NOTIFICATION_TYPES.find((n) => n.key === tooltip?.key)?.label}
              </Text>
              <TouchableOpacity onPress={() => setTooltip(null)} hitSlop={8}>
                <X size={16} color="#71717a" />
              </TouchableOpacity>
            </View>
            <Text style={styles.tooltipText}>{tooltip?.text}</Text>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#f4f4f5",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  notifBtn: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  notifBtnActive: {
    backgroundColor: "rgba(157,23,77,0.2)",
    borderColor: "rgba(236,72,153,0.4)",
  },
  notifBtnInactive: {
    backgroundColor: "rgba(24,24,27,0.6)",
    borderColor: "#27272a",
    opacity: 0.6,
  },
  notifLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#fff",
    flex: 1,
    paddingRight: 8,
  },
  notifLabelDisabled: {
    color: "#a1a1aa",
  },
  radioCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#71717a",
    flexShrink: 0,
  },
  radioCircleActive: {
    backgroundColor: "#db2777",
    borderColor: "#db2777",
  },
  // Tooltip modal
  tooltipBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  tooltipBox: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#27272a",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#3f3f46",
    padding: 16,
    gap: 8,
  },
  tooltipHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tooltipTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
  },
  tooltipText: {
    fontSize: 13,
    color: "#d4d4d8",
    lineHeight: 20,
  },
});

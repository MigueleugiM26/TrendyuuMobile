import { ConnectedAccount } from "@/src/types/user";
import { FontAwesome5 } from "@expo/vector-icons";
import {
  CheckCircle,
  Film,
  Globe,
  IdCard,
  Lock,
  Plus,
  X,
} from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type SocialPlatform =
  | "youtube"
  | "tiktok"
  | "instagram"
  | "twitter"
  | "facebook"
  | "kwai"
  | "linkedin";

interface PersonalInfoTabProps {
  name: string;
  setName: (name: string) => void;
  email: string;
  website: string;
  setWebsite: (url: string) => void;
  connectedAccounts: ConnectedAccount[];
  isEditing: boolean;
  setIsEditing: (val: boolean) => void;
  handleCancelEdit: () => void;
  isDataChanged: () => boolean;
  handleApply: () => void;
  onConnectPlatform: (platform: SocialPlatform) => void;
  onDisconnectPlatform: (accountId: string) => void;
  connectingPlatform: SocialPlatform | null;
  t: (key: string, opts?: Record<string, string>) => string;
}

const platforms = [
  {
    key: "youtube" as SocialPlatform,
    name: "YouTube",
    icon: <FontAwesome5 name="youtube" size={20} color="#ff0000" />,
    color: "#ff0000",
    comingSoon: false,
  },
  {
    key: "tiktok" as SocialPlatform,
    name: "TikTok",
    icon: <FontAwesome5 name="tiktok" size={20} color="#fff" />,
    color: "#fff",
    comingSoon: false,
  },
  {
    key: "instagram" as SocialPlatform,
    name: "Instagram",
    icon: <FontAwesome5 name="instagram" size={20} color="#e1306c" />,
    color: "#e1306c",
    comingSoon: true,
  },
  {
    key: "twitter" as SocialPlatform,
    name: "X (Twitter)",
    icon: <FontAwesome5 name="twitter" size={20} color="#60a5fa" />,
    color: "#60a5fa",
    comingSoon: true,
  },
  {
    key: "facebook" as SocialPlatform,
    name: "Facebook",
    icon: <FontAwesome5 name="facebook" size={20} color="#1877f2" />,
    color: "#1877f2",
    comingSoon: true,
  },
  {
    key: "kwai" as SocialPlatform,
    name: "Kwai",
    icon: <Film size={20} color="#f97316" />,
    color: "#f97316",
    comingSoon: true,
  },
];

export default function PersonalInfoTab({
  name,
  setName,
  email,
  website,
  setWebsite,
  connectedAccounts,
  isEditing,
  setIsEditing,
  handleCancelEdit,
  isDataChanged,
  handleApply,
  onConnectPlatform,
  onDisconnectPlatform,
  connectingPlatform,
  t,
}: PersonalInfoTabProps) {
  const [showAddAccountDialog, setShowAddAccountDialog] = useState(false);
  const [disconnectingAccountId, setDisconnectingAccountId] = useState<
    string | null
  >(null);

  const getPlatformInfo = (key: SocialPlatform) =>
    platforms.find((p) => p.key === key);

  return (
    <>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <IdCard size={18} color="#f4f4f5" />
            <Text style={styles.cardTitle}>{t("personalInfo")}</Text>
          </View>
          <TouchableOpacity
            onPress={() =>
              isEditing ? handleCancelEdit() : setIsEditing(true)
            }
            style={styles.editBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.editBtnText}>
              {isEditing ? t("cancel") : t("edit")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Fields */}
        <View style={styles.fieldsGrid}>
          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>{t("fullName")}</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              editable={isEditing}
              style={[styles.textInput, !isEditing && styles.textInputDisabled]}
              placeholderTextColor="#71717a"
            />
          </View>

          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>{t("email")}</Text>
            <TextInput
              value={email}
              editable={false}
              style={[styles.textInput, styles.textInputDisabled]}
              placeholderTextColor="#71717a"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.fieldWrapper}>
            <View style={styles.fieldLabelRow}>
              <Globe size={14} color="#d4d4d8" />
              <Text style={styles.fieldLabel}>Website</Text>
            </View>
            <TextInput
              value={website}
              onChangeText={setWebsite}
              editable={isEditing}
              placeholder="https://example.com"
              placeholderTextColor="#71717a"
              autoCapitalize="none"
              style={[styles.textInput, !isEditing && styles.textInputDisabled]}
            />
          </View>
        </View>

        {/* Apply button */}
        {isEditing && isDataChanged() && (
          <TouchableOpacity
            onPress={handleApply}
            style={styles.applyBtn}
            activeOpacity={0.8}
          >
            <Text style={styles.applyBtnText}>Apply</Text>
          </TouchableOpacity>
        )}

        {/* Connected accounts header */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionSubtitle}>
            {t("connectedAccountsTitle")}
          </Text>
          <TouchableOpacity
            onPress={() => setShowAddAccountDialog(true)}
            style={styles.addBtn}
            activeOpacity={0.7}
          >
            <Plus size={14} color="#f472b6" />
            <Text style={styles.addBtnText}>{t("addAccountButton")}</Text>
          </TouchableOpacity>
        </View>

        {/* Accounts list */}
        {connectedAccounts.length === 0 ? (
          <View style={styles.emptyAccounts}>
            <Text style={styles.emptyAccountsText}>{t("noAccounts")}</Text>
            <Text style={styles.emptyAccountsSubtext}>
              {t("noAccountsDescription")}
            </Text>
          </View>
        ) : (
          <View style={styles.accountsList}>
            {connectedAccounts.map((account) => {
              const pInfo = getPlatformInfo(account.platform);
              if (!pInfo) return null;
              const isDisconnecting = disconnectingAccountId === account.id;
              return (
                <View key={account.id} style={styles.accountRow}>
                  <View style={styles.accountLeft}>
                    {pInfo.icon}
                    <View>
                      <Text style={styles.accountName}>{pInfo.name}</Text>
                      <Text style={styles.accountUsername}>
                        @{account.username}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.accountRight}>
                    <View style={styles.connectedBadge}>
                      <CheckCircle size={11} color="#34d399" />
                      <Text style={styles.connectedBadgeText}>
                        {t("connectedBadge")}
                      </Text>
                    </View>
                    <TouchableOpacity
                      disabled={isDisconnecting}
                      onPress={async () => {
                        setDisconnectingAccountId(account.id);
                        try {
                          await onDisconnectPlatform(account.id);
                        } finally {
                          setDisconnectingAccountId(null);
                        }
                      }}
                      hitSlop={8}
                    >
                      {isDisconnecting ? (
                        <ActivityIndicator size="small" color="#f87171" />
                      ) : (
                        <X size={16} color="#f87171" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* Add Account Modal (replaces Dialog) */}
      <Modal
        visible={showAddAccountDialog}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddAccountDialog(false)}
      >
        <View style={styles.dialogBackdrop}>
          <View style={styles.dialogSheet}>
            <Text style={styles.dialogTitle}>{t("title")}</Text>
            <View style={styles.platformGrid}>
              {platforms.map(({ key, icon, name, comingSoon }) => {
                const isConnecting = connectingPlatform === key;
                return (
                  <View key={key} style={{ width: "48%" }}>
                    <TouchableOpacity
                      onPress={() => {
                        if (!comingSoon) {
                          setShowAddAccountDialog(false);
                          onConnectPlatform(key);
                        }
                      }}
                      disabled={comingSoon || isConnecting}
                      style={[
                        styles.platformBtn,
                        comingSoon && styles.platformBtnDisabled,
                      ]}
                      activeOpacity={0.7}
                    >
                      {icon}
                      <Text style={styles.platformBtnText}>{name}</Text>
                      {isConnecting && (
                        <ActivityIndicator size="small" color="#ec4899" />
                      )}
                    </TouchableOpacity>
                    {comingSoon && (
                      <View style={styles.comingSoonOverlay}>
                        <Lock size={14} color="#ec4899" />
                        <Text style={styles.comingSoonTitle}>
                          {t("comingSoonTitle")}
                        </Text>
                        <Text style={styles.comingSoonSubtitle}>
                          {t("comingSoonSubtitle")}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
            <TouchableOpacity
              onPress={() => setShowAddAccountDialog(false)}
              style={styles.cancelBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelBtnText}>{t("cancel")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#f4f4f5",
  },
  editBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#52525b",
  },
  editBtnText: {
    fontSize: 12,
    color: "#a1a1aa",
  },
  fieldsGrid: {
    gap: 12,
  },
  fieldWrapper: {
    gap: 4,
  },
  fieldLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  fieldLabel: {
    fontSize: 13,
    color: "#d4d4d8",
  },
  textInput: {
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#27272a",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#fff",
    fontSize: 14,
  },
  textInputDisabled: {
    opacity: 0.5,
  },
  applyBtn: {
    backgroundColor: "#db2777",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  applyBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: "500",
    color: "#d4d4d8",
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#27272a",
    backgroundColor: "#18181b",
  },
  addBtnText: {
    fontSize: 12,
    color: "#f472b6",
  },
  emptyAccounts: {
    backgroundColor: "#18181b",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#27272a",
    paddingVertical: 32,
    alignItems: "center",
    gap: 4,
  },
  emptyAccountsText: {
    fontSize: 13,
    color: "#a1a1aa",
  },
  emptyAccountsSubtext: {
    fontSize: 11,
    color: "#71717a",
  },
  accountsList: {
    gap: 8,
  },
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#18181b",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#27272a",
    padding: 14,
  },
  accountLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  accountName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
  },
  accountUsername: {
    fontSize: 11,
    color: "#71717a",
  },
  accountRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexShrink: 0,
  },
  connectedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(52,211,153,0.15)",
    borderWidth: 1,
    borderColor: "rgba(52,211,153,0.3)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  connectedBadgeText: {
    fontSize: 10,
    color: "#34d399",
    fontWeight: "600",
  },
  // Dialog
  dialogBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  dialogSheet: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#09090b",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#27272a",
    padding: 20,
    gap: 16,
  },
  dialogTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
  },
  platformGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  platformBtn: {
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#27272a",
    backgroundColor: "#18181b",
  },
  platformBtnDisabled: {
    opacity: 0.4,
  },
  platformBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
  },
  comingSoonOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  } as any,
  comingSoonTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
  },
  comingSoonSubtitle: {
    fontSize: 10,
    color: "#a1a1aa",
    textAlign: "center",
    paddingHorizontal: 4,
  },
  cancelBtn: {
    backgroundColor: "#27272a",
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
  },
  cancelBtnText: {
    color: "#f4f4f5",
    fontSize: 14,
    fontWeight: "600",
  },
});

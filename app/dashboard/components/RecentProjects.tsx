import { useTranslations } from "@/src/hooks/useTranslations";
import type { CloudProjectSummary } from "@/src/lib/projectsAPI";
import {
  deleteProject,
  listProjects,
  loadProject,
} from "@/src/lib/projectsAPI";
import { toastError, toastSuccess } from "@/src/lib/toast";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Calendar, Check, Clock, Folder, Trash2, X } from "lucide-react-native";
import { AnimatePresence, MotiView } from "moti";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Password prompt (Android-safe replacement for window.prompt) ─────────────

function PasswordPromptModal({
  visible,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  onConfirm: (password: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState("");

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.promptBackdrop}>
        <View style={styles.promptSheet}>
          <Text style={styles.promptTitle}>Protected Project</Text>
          <Text style={styles.promptSubtitle}>
            This project is password-protected. Enter password:
          </Text>
          <TextInput
            value={value}
            onChangeText={setValue}
            secureTextEntry
            autoFocus
            style={styles.promptInput}
            placeholderTextColor="#71717a"
            placeholder="Password"
          />
          <View style={styles.promptActions}>
            <TouchableOpacity
              onPress={() => {
                setValue("");
                onCancel();
              }}
              style={styles.promptCancelBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.promptCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                const v = value;
                setValue("");
                onConfirm(v);
              }}
              style={styles.promptConfirmBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.promptConfirmText}>Open</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function RecentProjects() {
  const t = useTranslations("Projects");
  const router = useRouter();

  const [projects, setProjects] = useState<CloudProjectSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingProject, setDeletingProject] = useState<string | null>(null);
  const [loadingProject, setLoadingProject] = useState<string | null>(null);

  // Password prompt state (replaces window.prompt)
  const [passwordPrompt, setPasswordPrompt] = useState<{
    projectId: string;
  } | null>(null);

  useEffect(() => {
    listProjects("short_editor")
      .then(setProjects)
      .catch(() => toastError(t("messages.loadError")))
      .finally(() => setIsLoading(false));
  }, []);

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffDays = Math.ceil(
      Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays === 1) return t("project.today");
    if (diffDays === 2) return t("project.yesterday");
    if (diffDays <= 7) return t("project.daysAgo", { days: diffDays - 1 });
    return date.toLocaleDateString();
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await deleteProject(projectId);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      toastSuccess(t("messages.deleteSuccess"));
    } catch {
      toastError(t("messages.deleteError"));
    } finally {
      setDeletingProject(null);
    }
  };

  const doLoadProject = async (projectId: string, password?: string) => {
    if (loadingProject) return;
    try {
      setLoadingProject(projectId);
      const project = await loadProject(projectId, password);

      await AsyncStorage.multiSet([
        ["currentProjectToLoad", projectId],
        [
          "currentProjectData",
          JSON.stringify({ ...project.project_data, id: projectId }),
        ],
      ]);

      router.push("/short-editor");
    } catch (err) {
      const e = err as Record<string, unknown>;
      if (e?.passwordRequired) {
        toastError("Password required to open this project.");
      } else if (e?.wrongPassword) {
        toastError("Incorrect password.");
      } else {
        toastError(t("messages.loadError"));
      }
    } finally {
      setLoadingProject(null);
    }
  };

  const handleLoadProject = (projectId: string) => {
    if (loadingProject) return;
    const meta = projects.find((p) => p.id === projectId);

    if (meta?.has_password && !meta.is_owner) {
      if (Platform.OS === "ios") {
        // iOS supports Alert.prompt natively
        Alert.prompt(
          "Protected Project",
          "This project is password-protected. Enter password:",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Open",
              onPress: (password) => {
                if (password) doLoadProject(projectId, password);
              },
            },
          ],
          "secure-text",
        );
      } else {
        // Android: use the custom modal
        setPasswordPrompt({ projectId });
      }
      return;
    }

    doLoadProject(projectId);
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f472b6" />
      </View>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Password prompt modal (Android) */}
      <PasswordPromptModal
        visible={!!passwordPrompt}
        onConfirm={(password) => {
          const id = passwordPrompt!.projectId;
          setPasswordPrompt(null);
          doLoadProject(id, password);
        }}
        onCancel={() => setPasswordPrompt(null)}
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t("title") || "All Projects"}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {projects.length === 0 ? (
          // ── Empty state ──────────────────────────────────────────────────
          <View style={styles.emptyState}>
            <Folder size={64} color="#3f3f46" />
            <Text style={styles.emptyText}>{t("emptyState.description")}</Text>
          </View>
        ) : (
          // ── Project grid ─────────────────────────────────────────────────
          <>
            <View style={styles.grid}>
              <AnimatePresence>
                {projects.map((project, i) => (
                  <MotiView
                    key={project.id}
                    from={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{
                      type: "timing",
                      duration: 200,
                      delay: i * 30,
                    }}
                    style={styles.card}
                  >
                    <TouchableOpacity
                      onPress={() =>
                        deletingProject !== project.id &&
                        handleLoadProject(project.id)
                      }
                      activeOpacity={0.8}
                      style={styles.cardInner}
                    >
                      {/* Thumbnail */}
                      <View style={styles.thumbnail}>
                        {project.thumbnail ? (
                          <Image
                            source={{ uri: project.thumbnail }}
                            style={StyleSheet.absoluteFill}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={styles.thumbnailPlaceholder}>
                            <Folder size={48} color="rgba(244,114,182,0.4)" />
                          </View>
                        )}

                        {/* Gradient overlay */}
                        <View style={styles.thumbnailGradient} />

                        {/* Loading overlay */}
                        {loadingProject === project.id && (
                          <View style={styles.loadingOverlay}>
                            <ActivityIndicator size="large" color="#f472b6" />
                          </View>
                        )}
                      </View>

                      {/* Info */}
                      <View style={styles.cardInfo}>
                        <Text style={styles.projectName} numberOfLines={1}>
                          {project.name}
                        </Text>
                        <View style={styles.metaRow}>
                          <View style={styles.metaItem}>
                            <Calendar size={12} color="#71717a" />
                            <Text style={styles.metaText}>
                              {formatDate(project.updated_at)}
                            </Text>
                          </View>
                          {project.timeline_limit > 0 && (
                            <>
                              <View style={styles.metaDot} />
                              <View style={styles.metaItem}>
                                <Clock size={12} color="#71717a" />
                                <Text style={styles.metaText}>
                                  {project.timeline_limit} min
                                </Text>
                              </View>
                            </>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>

                    {/* Delete controls — always visible on mobile (no hover) */}
                    <View style={styles.deleteControls}>
                      {deletingProject === project.id ? (
                        <>
                          <TouchableOpacity
                            onPress={() => setDeletingProject(null)}
                            style={[styles.iconBtn, styles.iconBtnRed]}
                            activeOpacity={0.7}
                          >
                            <X size={14} color="#f87171" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleDeleteProject(project.id)}
                            style={[styles.iconBtn, styles.iconBtnGreen]}
                            activeOpacity={0.7}
                          >
                            <Check size={14} color="#4ade80" />
                          </TouchableOpacity>
                        </>
                      ) : (
                        <TouchableOpacity
                          onPress={() => setDeletingProject(project.id)}
                          style={[styles.iconBtn, styles.iconBtnRed]}
                          activeOpacity={0.7}
                        >
                          <Trash2 size={14} color="#f87171" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </MotiView>
                ))}
              </AnimatePresence>
            </View>

            <Text style={styles.allLoadedText}>All projects loaded</Text>
          </>
        )}
      </ScrollView>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const CARD_GAP = 12;

const styles = StyleSheet.create({
  // ── Loading ────────────────────────────────────────────────────────────────
  loadingContainer: {
    flex: 1,
    backgroundColor: "#09090b",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#27272a",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 128,
  },
  // ── Header ─────────────────────────────────────────────────────────────────
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#27272a",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  // ── Scroll ─────────────────────────────────────────────────────────────────
  scrollContent: {
    padding: 12,
    paddingBottom: 24,
  },
  // ── Empty ──────────────────────────────────────────────────────────────────
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    gap: 12,
  },
  emptyText: {
    color: "#71717a",
    fontSize: 14,
    textAlign: "center",
  },
  // ── Grid — 2 columns ───────────────────────────────────────────────────────
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: CARD_GAP,
  },
  card: {
    // ~2 columns with gap
    width: `${(100 - CARD_GAP / 4) / 2}%`,
    backgroundColor: "rgba(24,24,27,0.7)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#27272a",
    overflow: "hidden",
  },
  cardInner: {
    flex: 1,
  },
  // ── Thumbnail ──────────────────────────────────────────────────────────────
  thumbnail: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#18181b",
    overflow: "hidden",
    position: "relative",
  },
  thumbnailPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#27272a",
  },
  thumbnailGradient: {
    ...StyleSheet.absoluteFillObject,
    // Simulates `bg-gradient-to-t from-black/70 via-black/20 to-transparent`
    // RN doesn't support CSS gradients natively; use expo-linear-gradient for the full effect
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  // ── Card info ──────────────────────────────────────────────────────────────
  cardInfo: {
    padding: 10,
    gap: 4,
  },
  projectName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  metaText: {
    fontSize: 11,
    color: "#71717a",
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#52525b",
  },
  // ── Delete controls ────────────────────────────────────────────────────────
  deleteControls: {
    position: "absolute",
    top: 6,
    left: 6,
    flexDirection: "row",
    gap: 4,
  },
  iconBtn: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBtnRed: {
    backgroundColor: "rgba(239,68,68,0.2)",
  },
  iconBtnGreen: {
    backgroundColor: "rgba(74,222,128,0.2)",
  },
  // ── Footer ─────────────────────────────────────────────────────────────────
  allLoadedText: {
    textAlign: "center",
    fontSize: 11,
    color: "#3f3f46",
    paddingVertical: 16,
  },
  // ── Password prompt modal ──────────────────────────────────────────────────
  promptBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  promptSheet: {
    width: "100%",
    backgroundColor: "#18181b",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#27272a",
    padding: 20,
    gap: 12,
  },
  promptTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  promptSubtitle: {
    fontSize: 13,
    color: "#a1a1aa",
  },
  promptInput: {
    backgroundColor: "#27272a",
    borderWidth: 1,
    borderColor: "#3f3f46",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#fff",
    fontSize: 15,
  },
  promptActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 4,
  },
  promptCancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#27272a",
  },
  promptCancelText: {
    color: "#a1a1aa",
    fontWeight: "600",
    fontSize: 14,
  },
  promptConfirmBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#ec4899",
  },
  promptConfirmText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});

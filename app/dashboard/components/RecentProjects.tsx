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
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

function formatDate(iso: string, t: (k: string, p?: any) => string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffDays = Math.ceil(
    Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays === 1) return t("project.today");
  if (diffDays === 2) return t("project.yesterday");
  if (diffDays <= 7) return t("project.daysAgo", { days: diffDays - 1 });
  return date.toLocaleDateString("pt-BR");
}

export function RecentProjects({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const t = useTranslations("Projects");
  const router = useRouter();
  const slideAnim = useRef(new Animated.Value(800)).current;

  const [projects, setProjects] = useState<CloudProjectSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 0,
        speed: 20,
      }).start();
      fetchProjects();
    } else {
      Animated.timing(slideAnim, {
        toValue: 800,
        duration: 220,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  async function fetchProjects() {
    setIsLoading(true);
    try {
      const data = await listProjects("short_editor");
      setProjects(data);
    } catch {
      toastError(t("messages.loadError"));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(projectId: string) {
    try {
      await deleteProject(projectId);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      toastSuccess(t("messages.deleteSuccess"));
    } catch {
      toastError(t("messages.deleteError"));
    } finally {
      setDeletingId(null);
    }
  }

  async function handleLoad(projectId: string) {
    if (loadingId) return;
    setLoadingId(projectId);
    try {
      const meta = projects.find((p) => p.id === projectId);
      let password: string | undefined;

      if (meta?.has_password && !meta.is_owner) {
        // On mobile we can't use window.prompt — show a simple alert or skip
        // For now, skip password-protected projects and inform the user
        toastError("Password-protected projects can't be opened here yet.");
        return;
      }

      const project = await loadProject(projectId, password);
      await AsyncStorage.multiSet([
        ["currentProjectToLoad", projectId],
        [
          "currentProjectData",
          JSON.stringify({ ...project.project_data, id: projectId }),
        ],
      ]);
      onClose();
      router.push("/short-editor");
    } catch (err: any) {
      if (err?.passwordRequired)
        toastError("Password required to open this project.");
      else if (err?.wrongPassword) toastError("Incorrect password.");
      else toastError(t("messages.loadError"));
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />
      <Animated.View
        style={[styles.panel, { transform: [{ translateY: slideAnim }] }]}
      >
        <SafeAreaView style={{ flex: 1 }}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{t("title") || "Meus Projetos"}</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#fff" />
            </Pressable>
          </View>

          {/* Content */}
          {isLoading ? (
            <View style={styles.loaderWrap}>
              <ActivityIndicator size="large" color="#ec4899" />
            </View>
          ) : projects.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Folder size={48} color="#27272a" />
              <Text style={styles.emptyText}>
                {t("emptyState.description")}
              </Text>
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={styles.grid}
              showsVerticalScrollIndicator={false}
            >
              {projects.map((project) => (
                <Pressable
                  key={project.id}
                  onPress={() =>
                    deletingId !== project.id && handleLoad(project.id)
                  }
                  style={({ pressed }) => [
                    styles.card,
                    pressed && styles.cardPressed,
                  ]}
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
                      <View style={styles.thumbnailFallback}>
                        <Folder size={28} color="rgba(236,72,153,0.4)" />
                      </View>
                    )}
                    <View style={styles.thumbnailOverlay} />

                    {/* Loading overlay */}
                    {loadingId === project.id && (
                      <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="small" color="#ec4899" />
                      </View>
                    )}
                  </View>

                  {/* Info */}
                  <View style={styles.info}>
                    <Text style={styles.projectName} numberOfLines={1}>
                      {project.name}
                    </Text>
                    <View style={styles.metaRow}>
                      <Calendar size={10} color="#71717a" />
                      <Text style={styles.metaText}>
                        {formatDate(project.updated_at, t)}
                      </Text>
                      {project.timeline_limit > 0 && (
                        <>
                          <View style={styles.dot} />
                          <Clock size={10} color="#71717a" />
                          <Text style={styles.metaText}>
                            {project.timeline_limit} min
                          </Text>
                        </>
                      )}
                    </View>
                  </View>

                  {/* Delete controls */}
                  <View style={styles.deleteWrap}>
                    {deletingId === project.id ? (
                      <View style={styles.deleteConfirmRow}>
                        <Pressable
                          onPress={(e) => {
                            setDeletingId(null);
                          }}
                          style={styles.deleteConfirmBtn}
                        >
                          <X size={14} color="#f87171" />
                        </Pressable>
                        <Pressable
                          onPress={() => handleDelete(project.id)}
                          style={[
                            styles.deleteConfirmBtn,
                            styles.deleteConfirmBtnGreen,
                          ]}
                        >
                          <Check size={14} color="#4ade80" />
                        </Pressable>
                      </View>
                    ) : (
                      <Pressable
                        onPress={() => setDeletingId(project.id)}
                        style={styles.deleteBtn}
                      >
                        <Trash2 size={14} color="#f87171" />
                      </Pressable>
                    )}
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </SafeAreaView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  panel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    top: "15%",
    backgroundColor: "#09090b",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: "#27272a",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#18181b",
  },
  title: { fontSize: 18, fontWeight: "700", color: "#fff" },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#18181b",
    alignItems: "center",
    justifyContent: "center",
  },
  loaderWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  emptyText: { fontSize: 14, color: "#52525b", textAlign: "center" },
  grid: { padding: 16, gap: 12 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#0e0e12",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1a1a1f",
    overflow: "hidden",
  },
  cardPressed: { borderColor: "rgba(236,72,153,0.3)" },
  thumbnail: {
    width: 80,
    height: 60,
    backgroundColor: "#18181b",
  },
  thumbnailFallback: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#18181b",
  },
  thumbnailOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  info: { flex: 1, gap: 4, paddingVertical: 12 },
  projectName: { fontSize: 13, fontWeight: "600", color: "#fff" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 10, color: "#71717a" },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: "#3f3f46" },
  deleteWrap: { paddingRight: 12 },
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(248,113,113,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteConfirmRow: { flexDirection: "row", gap: 4 },
  deleteConfirmBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(248,113,113,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteConfirmBtnGreen: { backgroundColor: "rgba(74,222,128,0.15)" },
});

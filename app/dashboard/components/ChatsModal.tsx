import { MoreHorizontal, Search, Trash2, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AiChat {
  id: string;
  type: "image" | "video";
  created_at: string;
  updated_at: string;
  last_message?: string;
}

interface ChatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  chats: AiChat[];
  loading?: boolean;
  activeChatId?: string | null;
  onSelectChat: (chat: AiChat) => void;
  onDeleteChat?: (chatIds: string[]) => void;
  onNewChat?: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  return `${days} day${days !== 1 ? "s" : ""} ago`;
}

// ─── Row action sheet (replaces ContextMenu) ─────────────────────────────────

function RowActionSheet({
  visible,
  onClose,
  onSelect,
  onDelete,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: () => void;
  onDelete: () => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={actionStyles.backdrop} onPress={onClose}>
        <Pressable style={actionStyles.sheet} onPress={() => {}}>
          {/* Handle */}
          <View style={actionStyles.handle} />

          {/* Select */}
          <Pressable
            onPress={() => {
              onSelect();
              onClose();
            }}
            style={actionStyles.item}
          >
            <View style={actionStyles.checkbox} />
            <Text style={actionStyles.itemText}>Select</Text>
          </Pressable>

          <View style={actionStyles.divider} />

          {/* Delete */}
          <Pressable
            onPress={() => {
              onDelete();
              onClose();
            }}
            style={actionStyles.item}
          >
            <Trash2 size={16} color="#f87171" />
            <Text style={[actionStyles.itemText, actionStyles.itemTextRed]}>
              Delete
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── ChatRow ──────────────────────────────────────────────────────────────────

interface ChatRowProps {
  chat: AiChat;
  isActive: boolean;
  isSelected: boolean;
  isSelecting: boolean;
  onOpen: () => void;
  onToggleSelect: (id: string) => void;
  onDelete?: (id: string) => void;
}

function ChatRow({
  chat,
  isActive,
  isSelected,
  isSelecting,
  onOpen,
  onToggleSelect,
  onDelete,
}: ChatRowProps) {
  const [actionSheetOpen, setActionSheetOpen] = useState(false);

  const title = chat.last_message
    ? chat.last_message.slice(0, 72) +
      (chat.last_message.length > 72 ? "…" : "")
    : `Chat ${chat.id.slice(0, 8)}`;

  const handleRowPress = () => {
    if (isSelecting) onToggleSelect(chat.id);
    else onOpen();
  };

  return (
    <>
      <Pressable
        onPress={handleRowPress}
        style={({ pressed }) => [
          rowStyles.row,
          isSelected && rowStyles.rowSelected,
          isActive && !isSelected && rowStyles.rowActive,
          pressed && rowStyles.rowPressed,
        ]}
      >
        {/* Checkbox — always visible while selecting, hidden otherwise */}
        <Pressable
          onPress={() => onToggleSelect(chat.id)}
          style={[
            rowStyles.checkbox,
            isSelected && rowStyles.checkboxSelected,
            !isSelected && !isSelecting && rowStyles.checkboxHidden,
          ]}
          hitSlop={8}
        >
          {isSelected && (
            <View style={rowStyles.checkMark}>
              {/* Simple checkmark using two rotated views */}
              <Text style={rowStyles.checkText}>✓</Text>
            </View>
          )}
        </Pressable>

        {/* Text */}
        <View style={rowStyles.textGroup}>
          <Text
            style={[
              rowStyles.title,
              (isActive || isSelected) && rowStyles.titleActive,
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>
          <Text style={rowStyles.subtitle}>
            Last message {timeAgo(chat.updated_at)}
          </Text>
        </View>

        {/* Three dots — hidden in selection mode */}
        {!isSelecting && (
          <Pressable
            onPress={() => setActionSheetOpen(true)}
            style={rowStyles.dotsBtn}
            hitSlop={8}
          >
            <MoreHorizontal size={16} color="#a1a1aa" />
          </Pressable>
        )}
      </Pressable>

      <RowActionSheet
        visible={actionSheetOpen}
        onClose={() => setActionSheetOpen(false)}
        onSelect={() => onToggleSelect(chat.id)}
        onDelete={() => onDelete?.(chat.id)}
      />
    </>
  );
}

// ─── ChatsModal ───────────────────────────────────────────────────────────────

export function ChatsModal({
  isOpen,
  onClose,
  chats,
  loading = false,
  activeChatId,
  onSelectChat,
  onDeleteChat,
  onNewChat,
}: ChatsModalProps) {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const isSelecting = selectedIds.size > 0;

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setSearch("");
      setSelectedIds(new Set());
    }
  }, [isOpen]);

  const filtered = chats.filter((c) => {
    const title = c.last_message || c.id;
    return title.toLowerCase().includes(search.toLowerCase());
  });

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDeleteSelected = () => {
    onDeleteChat?.(Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  const handleDeleteSingle = (id: string) => {
    onDeleteChat?.([id]);
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={() => {
        if (isSelecting) setSelectedIds(new Set());
        else onClose();
      }}
    >
      {/* Backdrop — tap outside to close (unless selecting) */}
      <Pressable
        style={styles.backdrop}
        onPress={() => {
          if (!isSelecting) onClose();
        }}
      >
        {/* Card — mirrors `max-w-xl rounded-2xl … maxHeight: "75vh"` */}
        <Pressable style={styles.card} onPress={() => {}}>
          {/* ── Selection mode header ── */}
          {isSelecting ? (
            <View style={styles.selectionHeader}>
              {/* Indeterminate checkbox */}
              <Pressable
                onPress={() => setSelectedIds(new Set())}
                style={styles.indeterminateBox}
              >
                <View style={styles.indeterminateLine} />
              </Pressable>

              <Text style={styles.selectionCount}>
                {selectedIds.size} selected
              </Text>

              {/* Delete selected */}
              <Pressable
                onPress={handleDeleteSelected}
                style={styles.headerIconBtn}
              >
                <Trash2 size={16} color="#a1a1aa" />
              </Pressable>

              {/* Cancel */}
              <Pressable
                onPress={() => setSelectedIds(new Set())}
                style={styles.headerIconBtn}
              >
                <X size={16} color="#a1a1aa" />
              </Pressable>
            </View>
          ) : (
            <>
              {/* ── Normal header ── */}
              <View style={styles.normalHeader}>
                <Text style={styles.headerTitle}>Chats</Text>
                <View style={styles.headerActions}>
                  {onNewChat && (
                    <Pressable
                      onPress={() => {
                        onNewChat();
                        onClose();
                      }}
                      style={styles.newBtn}
                    >
                      <Text style={styles.newBtnText}>New</Text>
                    </Pressable>
                  )}
                  <Pressable onPress={onClose} style={styles.headerIconBtn}>
                    <X size={16} color="#a1a1aa" />
                  </Pressable>
                </View>
              </View>

              {/* ── Search ── */}
              <View style={styles.searchWrapper}>
                <Search size={16} color="#71717a" style={styles.searchIcon} />
                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search your chats..."
                  placeholderTextColor="#71717a"
                  style={styles.searchInput}
                  autoFocus
                />
              </View>

              {/* ── Subtitle ── */}
              <Text style={styles.subtitle}>Your chats with TrendYuu AI</Text>

              <View style={styles.divider} />
            </>
          )}

          {/* ── List ── */}
          <ScrollView
            style={styles.list}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {loading ? (
              <View style={styles.centerBox}>
                <ActivityIndicator color="#ec4899" />
              </View>
            ) : filtered.length === 0 ? (
              <View style={styles.centerBox}>
                <Text style={styles.emptyText}>No chats found</Text>
              </View>
            ) : (
              filtered.map((chat, index) => (
                <View key={chat.id}>
                  <ChatRow
                    chat={chat}
                    isActive={chat.id === activeChatId}
                    isSelected={selectedIds.has(chat.id)}
                    isSelecting={isSelecting}
                    onOpen={() => {
                      onSelectChat(chat);
                      onClose();
                    }}
                    onToggleSelect={toggleSelect}
                    onDelete={handleDeleteSingle}
                  />
                  {index < filtered.length - 1 && (
                    <View style={styles.rowDivider} />
                  )}
                </View>
              ))
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default ChatsModal;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Backdrop — mirrors `fixed inset-0 … bg-black/65 backdrop-blur`
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 64,
    paddingHorizontal: 16,
  },

  // Card — mirrors `max-w-xl rounded-2xl … maxHeight: "75vh"`
  card: {
    width: "100%",
    maxWidth: 560,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#111113",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    maxHeight: "75%",
  },

  // Normal header — mirrors `px-5 pt-5 pb-4 flex items-center justify-between`
  normalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  newBtn: {
    height: 28,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#ec4899",
    alignItems: "center",
    justifyContent: "center",
  },
  newBtnText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#fff",
  },
  headerIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  // Selection mode header — mirrors `px-4 py-3.5 flex items-center gap-3 border-b border-zinc-800`
  selectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#27272a",
  },
  indeterminateBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: "#ec4899",
    borderWidth: 1,
    borderColor: "#ec4899",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  indeterminateLine: {
    width: 10,
    height: 2,
    backgroundColor: "#fff",
    borderRadius: 99,
  },
  selectionCount: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "#fff",
  },

  // Search — mirrors `relative` wrapper + `pl-9 pr-4 py-2.5 text-sm bg-zinc-800/60 border border-zinc-700/60 rounded-xl`
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: "rgba(39,39,42,0.6)",
    borderWidth: 1,
    borderColor: "rgba(63,63,70,0.6)",
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchIcon: {
    flexShrink: 0,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: "#e4e4e7",
  },

  subtitle: {
    fontSize: 12,
    color: "#71717a",
    paddingHorizontal: 20,
    paddingBottom: 8,
  },

  divider: {
    height: 1,
    backgroundColor: "#27272a",
  },

  list: {
    flex: 1,
  },

  rowDivider: {
    height: 1,
    backgroundColor: "rgba(39,39,42,0.5)",
    marginHorizontal: 0,
  },

  centerBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 14,
    color: "#71717a",
  },
});

const rowStyles = StyleSheet.create({
  // Row — mirrors `flex items-center gap-3 px-4 py-3.5`
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowSelected: {
    backgroundColor: "#27272a",
  },
  rowActive: {
    backgroundColor: "rgba(39,39,42,0.6)",
  },
  rowPressed: {
    backgroundColor: "rgba(39,39,42,0.4)",
  },

  // Checkbox — mirrors `w-4 h-4 rounded border flex-shrink-0`
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#71717a",
    backgroundColor: "transparent",
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    backgroundColor: "#ec4899",
    borderColor: "#ec4899",
  },
  checkboxHidden: {
    opacity: 0,
    // keep space so layout doesn't shift
  },
  checkMark: {
    alignItems: "center",
    justifyContent: "center",
  },
  checkText: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "700",
    lineHeight: 14,
  },

  textGroup: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 14,
    fontWeight: "500",
    color: "#e4e4e7",
  },
  titleActive: {
    color: "#fff",
  },
  subtitle: {
    fontSize: 12,
    color: "#71717a",
    marginTop: 2,
  },

  dotsBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
});

const actionStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  // Bottom sheet — replaces fixed ContextMenu
  sheet: {
    backgroundColor: "#18181b",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(63,63,70,0.6)",
    paddingBottom: 32,
    paddingTop: 8,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: "#3f3f46",
    borderRadius: 99,
    alignSelf: "center",
    marginBottom: 12,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  itemText: {
    fontSize: 14,
    color: "#e4e4e7",
  },
  itemTextRed: {
    color: "#f87171",
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#71717a",
    flexShrink: 0,
  },
  divider: {
    height: 1,
    backgroundColor: "#27272a",
    marginHorizontal: 20,
  },
});

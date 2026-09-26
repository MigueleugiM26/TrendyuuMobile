import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as VideoThumbnails from "expo-video-thumbnails";
import { EventEmitter } from "eventemitter3";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RecentVideo {
  id: string;
  name: string;
  size: number;
  type: string;
  duration?: number;
  thumbnail?: string;
  createdAt: number;
  /** Local file:// URI where the video copy is stored */
  localUri?: string;
}

// ─── Event emitter (replaces window.dispatchEvent) ───────────────────────────

export const videoStorageEvents = new EventEmitter();
/** Emitted whenever the recent-videos list changes. */
export const VIDEO_STORAGE_CHANGED = "videoStorageChanged";

// ─── Constants ────────────────────────────────────────────────────────────────

const RECENT_VIDEOS_KEY = "recentVideos";
const VIDEO_DIR = `${FileSystem.documentDirectory}trendyuu_videos/`;
const MAX_STORED_VIDEOS = 20;

// ─── Directory helpers ────────────────────────────────────────────────────────

async function ensureVideoDir(): Promise<void> {
  const info = await FileSystem.getInfoAsync(VIDEO_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(VIDEO_DIR, { intermediates: true });
  }
}

// ─── Video file storage ───────────────────────────────────────────────────────

/**
 * Copies a video from its temporary URI (e.g. from the image picker) to the
 * app's document directory so it persists across sessions.
 */
async function saveVideoFile(
  videoId: string,
  sourceUri: string
): Promise<string> {
  await ensureVideoDir();
  const destUri = `${VIDEO_DIR}${videoId}.mp4`;
  await FileSystem.copyAsync({ from: sourceUri, to: destUri });
  return destUri;
}

async function removeVideoFile(localUri: string): Promise<void> {
  try {
    const info = await FileSystem.getInfoAsync(localUri);
    if (info.exists) {
      await FileSystem.deleteAsync(localUri, { idempotent: true });
    }
  } catch (error) {
    console.error("Error removing video file:", error);
  }
}

/**
 * Returns the local file URI for a video, or null if it no longer exists.
 */
export async function getVideoLocalUri(videoId: string): Promise<string | null> {
  const uri = `${VIDEO_DIR}${videoId}.mp4`;
  const info = await FileSystem.getInfoAsync(uri);
  return info.exists ? uri : null;
}

// ─── Metadata storage (AsyncStorage) ─────────────────────────────────────────

export const getVideosFromLocalStorage = async (): Promise<RecentVideo[]> => {
  try {
    const stored = await AsyncStorage.getItem(RECENT_VIDEOS_KEY);
    if (stored) return JSON.parse(stored) as RecentVideo[];
    return [];
  } catch (error) {
    console.error("Error retrieving videos:", error);
    return [];
  }
};

/**
 * Saves a video to persistent storage.
 *
 * @param sourceUri  The temporary URI returned by expo-image-picker or
 *                   expo-document-picker.
 * @param meta       Name, size, type and optional duration of the file.
 * @param thumbnailUri  Optional thumbnail URI (from generateVideoThumbnail).
 */
export const saveVideoToLocalStorage = async (
  sourceUri: string,
  meta: { name: string; size: number; type: string; duration?: number },
  thumbnailUri?: string
): Promise<RecentVideo> => {
  try {
    const videoId = `video_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 9)}`;

    const localUri = await saveVideoFile(videoId, sourceUri);

    const videoObject: RecentVideo = {
      id: videoId,
      name: meta.name,
      size: meta.size,
      type: meta.type,
      duration: meta.duration,
      thumbnail: thumbnailUri,
      createdAt: Date.now(),
      localUri,
    };

    const existing = await getVideosFromLocalStorage();
    const updated = [videoObject, ...existing].slice(0, MAX_STORED_VIDEOS);

    await AsyncStorage.setItem(RECENT_VIDEOS_KEY, JSON.stringify(updated));
    videoStorageEvents.emit(VIDEO_STORAGE_CHANGED);

    return videoObject;
  } catch (error) {
    console.error("Error saving video:", error);
    throw new Error("Could not save video to local storage");
  }
};

export const removeVideoFromLocalStorage = async (
  videoId: string
): Promise<boolean> => {
  try {
    const videos = await getVideosFromLocalStorage();
    const target = videos.find((v) => v.id === videoId);

    if (target?.localUri) {
      await removeVideoFile(target.localUri);
    }

    const updated = videos.filter((v) => v.id !== videoId);
    await AsyncStorage.setItem(RECENT_VIDEOS_KEY, JSON.stringify(updated));
    videoStorageEvents.emit(VIDEO_STORAGE_CHANGED);

    return true;
  } catch (error) {
    console.error("Error removing video:", error);
    return false;
  }
};

// ─── Thumbnail generation ─────────────────────────────────────────────────────

/**
 * Generates a thumbnail for a local video URI using expo-video-thumbnails.
 * Returns a local file URI for the thumbnail image.
 */
export const generateVideoThumbnail = async (
  videoUri: string,
  timeMs = 1000
): Promise<string> => {
  const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
    time: timeMs,
    quality: 0.5,
  });
  return uri;
};

// ─── Duration formatting ──────────────────────────────────────────────────────

/** Formats a duration in seconds to MM:SS string */
export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

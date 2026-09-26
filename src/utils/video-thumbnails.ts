import * as VideoThumbnails from "expo-video-thumbnails";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface VideoThumbnail {
  /** Time in seconds this thumbnail represents */
  time: number;
  /** Local file:// URI for the thumbnail image */
  uri: string;
}

// ─── Cache ────────────────────────────────────────────────────────────────────

const thumbnailCache = new Map<string, VideoThumbnail[]>();

function getCacheKey(videoUri: string, count: number): string {
  return `${videoUri}-${count}`;
}

// ─── Generation ───────────────────────────────────────────────────────────────

/**
 * Generates multiple evenly-spaced thumbnails for a local video URI.
 *
 * Replaces the DOM-based version that used <video> + <canvas>.
 *
 * @param videoUri   Local file:// URI of the video (from expo-image-picker etc.)
 * @param duration   Video duration in seconds
 * @param count      Number of thumbnails to generate (default 10)
 */
export async function generateVideoThumbnails(
  videoUri: string,
  duration: number,
  count = 10
): Promise<VideoThumbnail[]> {
  const cacheKey = getCacheKey(videoUri, count);
  const cached = thumbnailCache.get(cacheKey);
  if (cached) return cached;

  const thumbnails: VideoThumbnail[] = [];

  for (let i = 0; i < count; i++) {
    // Spread thumbnails evenly across the video duration
    const timeSeconds = count === 1 ? 0 : (i / (count - 1)) * duration;
    const timeMs = Math.round(timeSeconds * 1000);

    try {
      const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
        time: timeMs,
        quality: 0.5,
      });
      thumbnails.push({ time: timeSeconds, uri });
    } catch (error) {
      console.warn(`Failed to generate thumbnail at ${timeSeconds}s:`, error);
    }
  }

  thumbnailCache.set(cacheKey, thumbnails);
  return thumbnails;
}

// ─── Helpers (unchanged from web version) ────────────────────────────────────

/**
 * Filters and remaps thumbnails for a specific timeline segment.
 */
export function getThumbnailsForSegment(
  thumbnails: VideoThumbnail[],
  segmentStartTime: number,
  segmentDuration: number,
  trimStart = 0,
  trimEnd?: number
): VideoThumbnail[] {
  const effectiveTrimEnd = trimEnd ?? segmentDuration;
  const trimmedDuration = effectiveTrimEnd - trimStart;

  return thumbnails
    .filter((thumb) => {
      const relativeTime = thumb.time - trimStart;
      return relativeTime >= 0 && relativeTime <= trimmedDuration;
    })
    .map((thumb) => ({
      ...thumb,
      time: thumb.time - trimStart + segmentStartTime,
    }));
}

/**
 * Clears the in-memory thumbnail cache.
 * Unlike the web version, expo-video-thumbnails writes to the OS temp
 * directory and handles its own cleanup, so we only need to clear the map.
 */
export function clearThumbnailCache(): void {
  thumbnailCache.clear();
}

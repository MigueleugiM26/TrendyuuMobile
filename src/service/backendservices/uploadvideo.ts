import axiosInstance from "@/src/lib/axiosConfig";
import { isAxiosError } from "axios";

export interface VideoUploadResponse {
  success: boolean;
  message: string;
  file_path?: string;
  preview_url?: string;
  metadata?: {
    width: number;
    height: number;
    duration: number;
    format: string;
    size: number;
    thumbnail_url: string;
  };
  error?: string;
}

export type UploadProgressCallback = (progress: number) => void;

/**
 * Uploads a video file to the server
 * @param file The video file to upload
 * @param onProgress Optional callback for tracking upload progress
 * @returns Promise with the upload response
 */
export async function uploadVideo(
  file: File,
  onProgress?: UploadProgressCallback,
): Promise<VideoUploadResponse> {
  try {
    // Create form data for the API request
    const formData = new FormData();
    formData.append("file", file);

    // Make API request to upload the video
    const response = await axiosInstance.post<VideoUploadResponse>(
      "/api/upload_video",
      formData,
      {
        // Updated endpoint
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const progress = Math.round(
              (progressEvent.loaded / progressEvent.total) * 100,
            );
            onProgress(progress);
          }
        },
      },
    );

    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      // Return the error response from the server if available
      return error.response.data as VideoUploadResponse;
    } else {
      // Create a generic error response
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "An unknown error occurred during upload",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

/**
 * Gets information about a video by its ID
 * @param videoId The ID of the video to get information for
 * @returns Promise with the video information
 */
export async function getVideoInfo(
  videoId: string,
): Promise<VideoUploadResponse> {
  try {
    const response = await axiosInstance.get<VideoUploadResponse>(
      `/video/${videoId}`,
    );
    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      return error.response.data as VideoUploadResponse;
    } else {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "An unknown error occurred",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

/**
 * Example usage:
 *
 * import { uploadVideo } from '@/services/upload_video';
 *
 * const handleUpload = async (file: File) => {
 *   setIsUploading(true);
 *   setUploadProgress(0);
 *
 *   try {
 *     const result = await uploadVideo(file, (progress) => {
 *       setUploadProgress(progress);
 *     });
 *
 *     if (result.success) {
 *       // Handle successful upload
 *       console.log("Video uploaded:", result.preview_url);
 *     } else {
 *       // Handle upload error
 *       console.error("Upload failed:", result.message);
 *     }
 *   } catch (error) {
 *     console.error("Upload error:", error);
 *   } finally {
 *     setIsUploading(false);
 *   }
 * };
 */

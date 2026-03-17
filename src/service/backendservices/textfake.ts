import axiosIntance from "@/lib/axiosConfig";
import axios, { type AxiosError } from "axios";

export interface WhatsAppMessage {
  id: string;
  text: string;
  isSender: boolean;
  timestamp: string;
}

export interface TextToSpeechRequest {
  texto: string;
  voz: number;
  output_file: string;
  credits: number;
}

export interface CreateVideoRequest {
  image_urls: string[];
  audio_urls: string[];
  output_filename?: string;
  background_video_url?: string;
  user_id?: string;
  types: number[];
  app: number;
  notifSoundsEnabled: boolean;
}

const API_BASE_URL = "api/video";

const textFakeService = {
  // Convert text to audio using the backend API
  convertTextToAudio: async (
    text: string,
    voiceIndex: number,
    filename: string,
    requiredCredits: number
  ): Promise<{ success: boolean; message: string; output_file?: string }> => {
    try {
      const token = localStorage.getItem("accessToken");

      console.log(
        `Converting text to audio: "${text}" using voice ${voiceIndex}`
      );

      const requestData: TextToSpeechRequest = {
        texto: text,
        voz: voiceIndex,
        output_file: filename,
        credits: requiredCredits,
      };

      const formData = new FormData();
      formData.append("data", JSON.stringify(requestData));

      const response = await axiosIntance.post(
        `/api/audio/converter-texto-em-audio`,
        formData,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Text-to-speech response:", response.data);

      return {
        success: true,
        message: "Audio generated successfully",
        output_file: response.data.output_file,
      };
    } catch (error: unknown) {
      console.error("Error converting text to audio:", error);

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;

        if (axiosError.response) {
          console.error("Error response data:", axiosError.response.data);
          console.error("Error response status:", axiosError.response.status);
          return {
            success: false,
            message: `Server error: ${
              axiosError.response.status
            } - ${JSON.stringify(axiosError.response.data)}`,
          };
        } else if (axiosError.request) {
          console.error("No response received:", axiosError.request);
          return {
            success: false,
            message: "No response received from server",
          };
        }
      }

      return {
        success: false,
        message:
          "Failed to convert text to audio: " +
          (error instanceof Error ? error.message : "Unknown error"),
      };
    }
  },

  // Create a video from images and audio files
  createVideo: async (
    imageUrls: string[],
    audioUrls: string[],
    types: number[],
    app: number,
    notifSoundsEnabled: boolean,
    outputFilename?: string,
    backgroundVideoUrl?: string,
    user_id?: string
  ): Promise<{
    success: boolean;
    message: string;
    video_url?: string;
    task_id?: string;
    path?: string;
    added_to_gallery?: boolean;
  }> => {
    try {
      const requestData: CreateVideoRequest = {
        image_urls: imageUrls,
        audio_urls: audioUrls,
        output_filename: outputFilename,
        background_video_url: backgroundVideoUrl,
        user_id: user_id,
        types,
        app,
        notifSoundsEnabled,
      };

      const token = localStorage.getItem("accessToken");

      const response = await axiosIntance.post(
        "/api/video/create-whatsapp-video",
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.task_id) {
        return {
          success: true,
          message: response.data.message || "Video generation started",
          task_id: response.data.task_id,
        };
      } else if (response.data.success) {
        return {
          success: true,
          message: "Video generated successfully",
          video_url: response.data.video_url,
          path: response.data.path,
          added_to_gallery: response.data.added_to_gallery,
        };
      } else {
        console.error("❌ API returned unsuccessful response");
        return {
          success: false,
          message: response.data.message || "Unknown error",
        };
      }
    } catch (error: unknown) {
      console.error("❌ Error generating video:", error);
      if (axios.isAxiosError(error) && error.response) {
        console.error("Error response:", error.response.data);
      }
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },

  saveCanvasImage: async (
    canvas: HTMLCanvasElement
  ): Promise<{ success: boolean; message: string; image_url?: string }> => {
    try {
      console.log("Starting to save WhatsApp canvas image...");

      const dataUrl = canvas.toDataURL("image/png");
      console.log("Canvas converted to data URL");

      console.log("Data URL preview:", dataUrl.substring(0, 100) + "...");

      console.log("Sending request to /api/video/save-whatsapp-canvas-image");
      const response = await axiosIntance.post(
        `${API_BASE_URL}/save-whatsapp-canvas-image`,
        {
          imageData: dataUrl,
        }
      );

      console.log("Response received:", response.status);
      console.log("Response data:", response.data);

      return response.data;
    } catch (error: unknown) {
      console.error("Error saving WhatsApp canvas image:", error);

      // Type guard to check if error is an AxiosError
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;

        if (axiosError.response) {
          console.error("Error response data:", axiosError.response.data);
          console.error("Error response status:", axiosError.response.status);
          return {
            success: false,
            message: `Server error: ${
              axiosError.response.status
            } - ${JSON.stringify(axiosError.response.data)}`,
          };
        } else if (axiosError.request) {
          console.error("No response received:", axiosError.request);
          return {
            success: false,
            message: "No response received from server",
          };
        }
      } else if (error instanceof Error) {
        console.error("Error message:", error.message);
      }

      return {
        success: false,
        message:
          "Failed to save image: " +
          (error instanceof Error ? error.message : "Unknown error"),
      };
    }
  },

  saveMultipleCanvasImages: async (
    canvases: HTMLCanvasElement[]
  ): Promise<{ success: boolean; message: string; image_urls?: string[] }> => {
    try {
      console.log(
        `Starting to save ${canvases.length} WhatsApp canvas images...`
      );

      const results = [];

      for (let i = 0; i < canvases.length; i++) {
        const canvas = canvases[i];

        const dataUrl = canvas.toDataURL("image/png");
        console.log(`Canvas ${i + 1}/${canvases.length} converted to data URL`);

        console.log(
          `Sending request ${i + 1}/${
            canvases.length
          } to /api/video/save-whatsapp-canvas-image`
        );
        const response = await axiosIntance.post(
          `${API_BASE_URL}/save-whatsapp-canvas-image`,
          {
            imageData: dataUrl,
          }
        );

        console.log(`Response ${i + 1} received:`, response.status);

        if (response.data.success && response.data.image_url) {
          results.push(response.data.image_url);
        }
      }

      return {
        success: results.length > 0,
        message: `Successfully saved ${results.length}/${canvases.length} images`,
        image_urls: results,
      };
    } catch (error: unknown) {
      console.error("Error saving multiple WhatsApp canvas images:", error);

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;

        if (axiosError.response) {
          console.error("Error response data:", axiosError.response.data);
          console.error("Error response status:", axiosError.response.status);
          return {
            success: false,
            message: `Server error: ${
              axiosError.response.status
            } - ${JSON.stringify(axiosError.response.data)}`,
          };
        } else if (axiosError.request) {
          console.error("No response received:", axiosError.request);
          return {
            success: false,
            message: "No response received from server",
          };
        }
      } else if (error instanceof Error) {
        console.error("Error message:", error.message);
      }

      return {
        success: false,
        message:
          "Failed to save images: " +
          (error instanceof Error ? error.message : "Unknown error"),
      };
    }
  },

  uploadVideo: async (
    videoFile: File | null,
    filename: string,
    user_id: string | undefined
  ): Promise<{
    success: boolean;
    message: string;
    video_url?: string;
    download_url?: string;
  }> => {
    try {
      const token = localStorage.getItem("accessToken");

      if (!videoFile)
        return {
          success: true,
          message: "No video to upload",
          video_url: "",
          download_url: "",
        };
      console.log("Uploading video file:", videoFile.name);

      const formData = new FormData();
      if (videoFile) formData.append("video", videoFile);

      formData.append("filename", filename);
      formData.append("user_id", user_id || "");

      const response = await axiosIntance.post(
        `/api/video/upload-background-video`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Video upload response:", response.data);

      return {
        success: true,
        message: "Video uploaded successfully",
        video_url: response.data.download_url,
        download_url: response.data.download_url,
      };
    } catch (error: unknown) {
      console.error("Error uploading video:", error);

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;

        if (axiosError.response) {
          console.error("Error response data:", axiosError.response.data);
          console.error("Error response status:", axiosError.response.status);
          return {
            success: false,
            message: `Server error: ${
              axiosError.response.status
            } - ${JSON.stringify(axiosError.response.data)}`,
          };
        } else if (axiosError.request) {
          console.error("No response received:", axiosError.request);
          return {
            success: false,
            message: "No response received from server",
          };
        }
      }

      return {
        success: false,
        message:
          "Failed to upload video: " +
          (error instanceof Error ? error.message : "Unknown error"),
      };
    }
  },
};

export default textFakeService;

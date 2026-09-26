import axiosInstance from "@/src/lib/axiosConfig";
import axios from "axios";

const RedditService = {
  generateAudio: async (
    text: string,
    voiceIndex: number,
    filename: string,
    requiredCredits: number,
  ) => {
    try {
      const token = localStorage.getItem("accessToken");

      console.log("Generating audio for text:", text.substring(0, 100) + "...");
      console.log("Using voice index:", voiceIndex);

      const formData = new FormData();
      formData.append(
        "data",
        JSON.stringify({
          texto: text,
          voz: voiceIndex,
          output_file: filename,
          credits: requiredCredits,
        }),
      );

      const response = await axiosInstance.post<{ output_file?: string }>(
        "/api/audio/converter-texto-em-audio",
        formData,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      console.log("Audio generation response:", response.data);

      if (response.data.output_file) {
        const baseUrl = process.env.EXPO_PUBLIC_TRENDYUU_URL_BACK;
        const audioUrl = response.data.output_file.startsWith("http")
          ? response.data.output_file
          : `${baseUrl}${response.data.output_file}`;
        return {
          success: true,
          audio_url: audioUrl,
        };
      } else {
        throw new Error(
          "Output file not found in response: " + JSON.stringify(response.data),
        );
      }
    } catch (error: unknown) {
      console.error("Error generating audio:", error);
      throw new Error(
        `Failed to generate audio: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  },

  getRedditPostFromUrl: async (url: string) => {
    try {
      console.log("Fetching Reddit post from URL:", url);

      if (!url.match(/^https?:\/\/(www\.)?reddit\.com/)) {
        return {
          success: false,
          message:
            "Invalid Reddit URL. Please provide a valid Reddit post URL.",
        };
      }

      const response = await axiosInstance.get<{
        success: boolean;
        data?: {
          autor: string;
          autor_avatar?: string;
          titulo: string;
          corpo?: string;
          thumbnail?: string;
          upvotes: number;
          num_comments: number;
          created_utc: number;
          post_url: string;
        };
        error?: string;
      }>("/api/video/url_reddit", {
        params: { url },
      });

      console.log("Reddit API response:", response.data);

      if (response.data.success && response.data.data) {
        const data = response.data.data;

        return {
          success: true,
          data: {
            username: data.autor,
            userAvatar: data.autor_avatar,
            title: data.titulo,
            description: data.corpo || data.titulo,
            content: data.corpo || data.titulo,
            thumbnail: data.thumbnail,
            upvotes: data.upvotes,
            numComments: data.num_comments,
            createdAt: data.created_utc,
            postUrl: data.post_url,
          },
        };
      } else {
        return {
          success: false,
          message: response.data.error || "Failed to fetch Reddit post data",
        };
      }
    } catch (error: unknown) {
      console.error("Error fetching Reddit post:", error);

      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;
        const responseData = error.response.data as Record<string, unknown>;
        const message =
          (responseData.detail as string) ||
          (responseData.error as string) ||
          "API error";

        if (status === 400) {
          return {
            success: false,
            message: `Invalid request: ${message}`,
          };
        } else if (status === 500) {
          return {
            success: false,
            message: "Server error. Please try again later.",
          };
        }
      }

      return {
        success: false,
        message:
          "Failed to fetch Reddit post: " +
          (error instanceof Error ? error.message : "Unknown error"),
      };
    }
  },
};

export default RedditService;

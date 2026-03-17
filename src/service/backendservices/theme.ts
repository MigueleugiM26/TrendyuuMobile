import axiosIntance from "@/lib/axiosConfig"
import axios, { type AxiosError } from "axios"

export interface Theme {
  type: "simple" | "social" | "custom"
  text: string
  backgroundColor: string
  textColor?: string
  username?: string
  handle?: string
  photoUrl?: string
  emoji?: string
  accentColor?: string
  borderRadius?: number
  borderWidth?: number
  borderColor?: string
  shadowSize?: number
  fontStyle?: string
  backgroundImage?: string
}

interface ThemeResponse {
  status: string
  message: string
  file_path: string
}

interface VideoOverlayResponse {
  success: boolean
  message: string
  video_url?: string
  video_path?: string
}

const ThemeService = {
  saveTheme: async (theme: Theme): Promise<ThemeResponse> => {
    try {
      console.log("Theme data (not sending to backend):", theme)
      // Since the endpoint doesn't exist, we'll just return a mock response
      // This allows the rest of the flow to continue
      return {
        status: "success",
        message: "Theme processed locally",
        file_path: "",
      }
    } catch (error) {
      console.error("Error with theme:", error)
      throw error
    }
  },

  saveCanvasImage: async (
    canvas: HTMLCanvasElement,
  ): Promise<{ success: boolean; message: string; image_url?: string }> => {
    try {
      console.log("Starting to save theme canvas image...")

      // Convert canvas to base64 data URL
      const dataUrl = canvas.toDataURL("image/png")
      console.log("Canvas converted to data URL")

      // Log the first 100 characters of the data URL for debugging
      console.log("Data URL preview:", dataUrl.substring(0, 100) + "...")

      // Send the image data to the backend
      console.log("Sending request to /api/video/save-theme-canvas-image")
      const response = await axiosIntance.post("/api/video/save-theme-canvas-image", {
        imageData: dataUrl,
      })

      console.log("Response received:", response.status)
      console.log("Response data:", response.data)

      return response.data
    } catch (error: unknown) {
      console.error("Error saving theme canvas image:", error)

      // Type guard to check if error is an AxiosError
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError

        if (axiosError.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error("Error response data:", axiosError.response.data)
          console.error("Error response status:", axiosError.response.status)
        } else if (axiosError.request) {
          // The request was made but no response was received
          console.error("No response received:", axiosError.request)
        }
      } else if (error instanceof Error) {
        // For regular Error objects
        console.error("Error message:", error.message)
      }

      // Return a fallback response instead of throwing
      return {
        success: false,
        message: "Failed to save image: " + (error instanceof Error ? error.message : "Unknown error"),
      }
    }
  },

  overlayVideoOnTheme: async (video: File | string, themeImageUrl: string): Promise<VideoOverlayResponse> => {
    try {
      console.log("Starting to overlay video on theme...")

      // Create a FormData object to send to the backend
      const formData = new FormData()

      // Add the video to the FormData
      if (typeof video === "string") {
        // If video is a URL or path
        formData.append("video_url", video)
        console.log("Added video URL to form data:", video.substring(0, 100) + "...")
      } else {
        // If video is a File object
        formData.append("video", video)
        console.log("Added video file to form data:", video.name)
      }

      // Add the theme image URL
      formData.append("theme_image_url", themeImageUrl)
      console.log("Added theme image URL to form data:", themeImageUrl)

      // Send the request to the backend - FIXED PATH HERE
      console.log("Sending request to /api/video/overlay-video-on-theme")
      const response = await axiosIntance.post<VideoOverlayResponse>("/api/video/overlay-video-on-theme", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      console.log("Response received:", response.status)
      console.log("Response data:", response.data)

      return response.data
    } catch (error: unknown) {
      console.error("Error overlaying video on theme:", error)

      // Type guard to check if error is an AxiosError
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError

        if (axiosError.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error("Error response data:", axiosError.response.data)
          console.error("Error response status:", axiosError.response.status)
        } else if (axiosError.request) {
          // The request was made but no response was received
          console.error("No response received:", axiosError.request)
        }
      } else if (error instanceof Error) {
        // For regular Error objects
        console.error("Error message:", error.message)
      }

      // Return a fallback response instead of throwing
      return {
        success: false,
        message: "Failed to overlay video on theme: " + (error instanceof Error ? error.message : "Unknown error"),
      }
    }
  },
}

export default ThemeService


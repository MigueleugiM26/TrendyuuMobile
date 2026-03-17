// Create this file to handle text and subtitle operations

import axiosIntance from "@/lib/axiosConfig"

interface SubtitleTemplate {
  id: string
  preview: string
  className: string
  type: string
}

interface SubtitleResponse {
  status: string
  message: string
  video_path?: string
  preview_url?: string
  video_id?: string
}

const TextService = {
  /**
   * Get available subtitle templates
   */
  async getTemplates(): Promise<SubtitleTemplate[]> {
    try {
      const response = await axiosIntance.get("/api/video/subtitle-templates")
      return response.data.templates
    } catch (error) {
      console.error("Error fetching subtitle templates:", error)
      throw new Error("Failed to fetch subtitle templates")
    }
  },

  /**
   * Add subtitle to a video
   */
  async addSubtitle(template: SubtitleTemplate, customText: string, animate: boolean): Promise<SubtitleResponse> {
    try {
      const response = await axiosIntance.post("/api/video/add-subtitles/", {
        template,
        customText,
        animate,
      })

      return response.data
    } catch (error) {
      console.error("Error adding subtitle:", error)
      throw new Error("Failed to add subtitle to video")
    }
  },
}

export default TextService


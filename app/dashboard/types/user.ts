export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  plan: "free" | "agency" | "premium";
  usage: {
    videosGenerated: number;
    maxVideos: number;
    storageUsed: number;
    maxStorage: number;
  };
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  image: string;
  category: "ai" | "editor" | "audio" | "background" | "text" | "community";
  group: "video" | "image" | "audio" | "media" | "start" | "text";
  isNew?: boolean;
  isPremium?: boolean;
  href?: string;
  disabled?: boolean;
}
export interface Project {
  id: string;
  name: string;
  type: "video" | "image" | "audio" | "text";
  thumbnail: string;
  duration: string;
  lastModified: Date;
  status: "draft" | "in-progress" | "completed";
}

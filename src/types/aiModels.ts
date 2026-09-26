export type AIModelPlan = "free" | "essential" | "creator" | "agency";

// ================== VIDEOS ===================
export type AspectRatioVideoAI =
  | "16:9"
  | "9:16"
  | "1:1"
  | "4:3"
  | "3:4"
  | "3:2"
  | "2:3";
export type QualityVideoAI = "360p" | "480p" | "540p" | "720p" | "1080p";
export type ImageModeVideoAI = "first-last" | "reference" | "referenceImages";

export interface AIVideoMetadata {
  model: string;
  prompt: string;
  aspect_ratio: AspectRatioVideoAI;
  duration: number;
  credits_used: number;
  quality?: QualityVideoAI;
}

export interface AIVideo {
  id: number;
  user_id: string;
  name: string;
  size: string;
  created_at: number;
  thumbnail: string | null;
  format: "mp4";
  type: "AI_Video";
  public_url: string;
  s3_key: string;
  duration: number;
  ai_metadata: AIVideoMetadata | null;
}

export interface AIVideoModelConfig {
  id: string;
  name: string;
  plan: AIModelPlan;
  status: "available" | "blocked";
  baseCredits: number;
  pricingMap?: Record<number, number>;
  aspectRatios: AspectRatioVideoAI[];
  qualities?: QualityVideoAI[];
  description?: string;
  duration: {
    type: "fixed" | "slider" | "selection";
    value?: number;
    min?: number;
    max?: number;
    options?: number[];
  };
  images: {
    max: number;
    type: "first-frame" | "first-last" | "reference" | "mode-selector";
    costPerImage: number;
  };
  audio: {
    accepts: boolean;
    costPerAudio: number;
  };
  seed: boolean;
  toggles: {
    soundEffects?: { cost: number };
    voice?: { cost: number };
    audio?: { cost: number };
    multiShot?: { cost: number };
  };
  freeLimitations?: {
    forceQuality?: QualityVideoAI;
    forceDuration?: number;
  };
  duration_switch?: "free" | "linked";
  /** Veo Fast / Preview: 2-3 images in "reference" mode silently upgrades to "referenceImages" */
  supportsReferenceImages?: boolean;
}

export const AI_VIDEO_MODELS: Record<string, AIVideoModelConfig> = {
  // FREE MODELS
  "pixverse-v5-fast": {
    id: "pixverse-v5-fast",
    name: "PixVerse V5 Fast",
    plan: "free",
    status: "blocked",
    baseCredits: 30,
    aspectRatios: ["16:9", "4:3", "1:1", "3:4", "9:16"],
    qualities: ["360p", "540p"],
    duration: { type: "slider", min: 1, max: 6 },
    images: { max: 1, type: "first-frame", costPerImage: 10 },
    audio: { accepts: false, costPerAudio: 0 },
    seed: true,
    toggles: {},
    freeLimitations: { forceQuality: "360p", forceDuration: 1 },
  },
  "wan-2.2-free": {
    id: "wan-2.2-free",
    name: "Wan AI 2.2",
    plan: "free",
    status: "blocked",
    baseCredits: 50,
    aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4"],
    qualities: ["480p", "1080p"],
    duration: { type: "fixed", value: 5 },
    images: { max: 2, type: "first-last", costPerImage: 10 },
    audio: { accepts: true, costPerAudio: 20 },
    seed: false,
    toggles: {},
    freeLimitations: { forceQuality: "480p" },
  },

  // ESSENTIAL MODELS
  "pixverse-v5-default": {
    id: "pixverse-v5-default",
    name: "PixVerse V5 Default",
    plan: "essential",
    status: "blocked",
    baseCredits: 200,
    aspectRatios: ["16:9", "4:3", "1:1", "3:4", "9:16"],
    qualities: ["360p", "540p"],
    duration: { type: "slider", min: 1, max: 6 },
    images: { max: 1, type: "first-frame", costPerImage: 35 },
    audio: { accepts: false, costPerAudio: 0 },
    seed: true,
    toggles: {
      soundEffects: { cost: 15 },
      voice: { cost: 25 },
    },
  },
  "pika-turbo": {
    id: "pika-turbo",
    name: "Pika AI Turbo",
    plan: "essential",
    status: "blocked",
    baseCredits: 1100,
    aspectRatios: ["16:9", "9:16", "1:1"],
    duration: { type: "fixed", value: 5 },
    images: { max: 0, type: "first-frame", costPerImage: 0 },
    audio: { accepts: false, costPerAudio: 0 },
    seed: false,
    toggles: {},
  },
  "wan-2.2-essential": {
    id: "wan-2.2-essential",
    name: "Wan AI 2.2",
    plan: "essential",
    status: "blocked",
    baseCredits: 1100,
    aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4"],
    qualities: ["480p", "1080p"],
    duration: { type: "fixed", value: 5 },
    images: { max: 2, type: "first-last", costPerImage: 40 },
    audio: { accepts: true, costPerAudio: 20 },
    seed: false,
    toggles: {},
  },
  "seedance-2.0-mini": {
    id: "seedance-2.0-mini",
    name: "Seedance 2.0 Mini",
    plan: "essential",
    status: "available",
    baseCredits: 800,
    pricingMap: { 5: 4000, 10: 8000 },
    aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4"],
    qualities: ["480p", "720p"],
    duration: { type: "selection", options: [5, 10] },
    images: { max: 12, type: "first-frame", costPerImage: 30 },
    audio: { accepts: false, costPerAudio: 0 },
    seed: false,
    toggles: {},
    freeLimitations: { forceQuality: "480p" },
  },
  "seedance-2.0": {
    id: "seedance-2.0",
    name: "Seedance 2.0",
    plan: "essential",
    status: "available",
    baseCredits: 1550,
    pricingMap: { 5: 7750, 10: 15500 },
    aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4"],
    qualities: ["720p", "1080p"],
    duration: { type: "selection", options: [5, 10] },
    images: { max: 9, type: "first-frame", costPerImage: 60 },
    audio: { accepts: false, costPerAudio: 0 },
    seed: false,
    toggles: {},
  },
  "veo3.1_lite": {
    id: "veo3.1_lite",
    name: "Veo 3.1 Lite",
    plan: "essential",
    status: "available",
    baseCredits: 3600,
    pricingMap: { 4: 1800, 6: 2700, 8: 3600 },
    aspectRatios: ["16:9", "9:16"],
    qualities: ["720p", "1080p"],
    duration: { type: "selection", options: [4, 6, 8] },
    duration_switch: "linked",
    images: { max: 1, type: "mode-selector", costPerImage: 70 },
    audio: { accepts: false, costPerAudio: 0 },
    seed: false,
    toggles: {},
  },

  // CREATOR MODELS
  "pixverse-v5.5": {
    id: "pixverse-v5.5",
    name: "PixVerse V5.5",
    plan: "creator",
    status: "blocked",
    baseCredits: 500,
    aspectRatios: ["16:9", "4:3", "1:1", "3:4", "9:16"],
    qualities: ["360p", "540p"],
    duration: { type: "slider", min: 1, max: 6 },
    images: { max: 1, type: "first-frame", costPerImage: 50 },
    audio: { accepts: false, costPerAudio: 0 },
    seed: true,
    toggles: {
      audio: { cost: 20 },
      multiShot: { cost: 50 },
    },
  },
  "kling-2.5-turbo": {
    id: "kling-2.5-turbo",
    name: "Kling Video 2.5 Turbo",
    plan: "creator",
    status: "blocked",
    baseCredits: 1600,
    aspectRatios: ["16:9", "9:16", "1:1"],
    duration: { type: "selection", options: [5, 10] },
    images: { max: 2, type: "first-last", costPerImage: 70 },
    audio: { accepts: false, costPerAudio: 0 },
    seed: false,
    toggles: {
      soundEffects: { cost: 15 },
    },
  },
  "seedance-2.5": {
    id: "seedance-2.5",
    name: "Seedance 2.5",
    plan: "creator",
    status: "available",
    baseCredits: 2400,
    pricingMap: { 5: 12000, 10: 24000 },
    aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4"],
    qualities: ["720p", "1080p"],
    duration: { type: "selection", options: [5, 10] },
    images: { max: 50, type: "first-frame", costPerImage: 100 },
    audio: { accepts: false, costPerAudio: 0 },
    seed: false,
    toggles: {},
  },
  "veo3.1_fast": {
    id: "veo3.1_fast",
    name: "Veo 3.1 Fast",
    plan: "creator",
    status: "available",
    baseCredits: 6750,
    pricingMap: { 4: 3375, 6: 5060, 8: 6750 },
    aspectRatios: ["16:9", "9:16"],
    qualities: ["720p", "1080p"],
    duration: { type: "selection", options: [4, 6, 8] },
    duration_switch: "linked",
    images: { max: 3, type: "mode-selector", costPerImage: 90 },
    audio: { accepts: false, costPerAudio: 0 },
    seed: false,
    toggles: {},
    supportsReferenceImages: true,
  },
  "veo3.1-preview": {
    id: "veo3.1-preview",
    name: "Veo 3.1",
    plan: "creator",
    status: "available",
    baseCredits: 18000,
    pricingMap: { 4: 9000, 6: 13500, 8: 18000 },
    aspectRatios: ["16:9", "9:16"],
    qualities: ["720p", "1080p"],
    duration: { type: "selection", options: [4, 6, 8] },
    duration_switch: "linked",
    images: { max: 3, type: "mode-selector", costPerImage: 110 },
    audio: { accepts: false, costPerAudio: 0 },
    seed: false,
    toggles: {},
    supportsReferenceImages: true,
  },

  // AGENCY MODELS
  "wan-2.6": {
    id: "wan-2.6",
    name: "Wan AI 2.6",
    plan: "agency",
    status: "blocked",
    baseCredits: 650,
    aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4"],
    qualities: ["480p", "1080p"],
    duration: { type: "selection", options: [5, 10, 15] },
    images: { max: 2, type: "first-last", costPerImage: 120 },
    audio: { accepts: true, costPerAudio: 20 },
    seed: false,
    toggles: {
      multiShot: { cost: 50 },
    },
  },
};

export const getAIVideoModelLogo = (modelId: string) => {
  const logos: Record<string, string> = {
    veo3: "https://cdn-frontend.trendyuu.com/public/images/texttovideo/icons/googlenewlogo.webp",
    "wan-2.6":
      "https://cdn-frontend.trendyuu.com/public/images/texttovideo/icons/wan.webp",
    "wan-2.2-free":
      "https://cdn-frontend.trendyuu.com/public/images/texttovideo/icons/wan.webp",
    "wan-2.2-essential":
      "https://cdn-frontend.trendyuu.com/public/images/texttovideo/icons/wan.webp",
    "pixverse-v5-fast":
      "https://cdn-frontend.trendyuu.com/public/images/texttovideo/icons/pixverse.webp",
    "pixverse-v5-default":
      "https://cdn-frontend.trendyuu.com/public/images/texttovideo/icons/pixverse.webp",
    "pixverse-v5.5":
      "https://cdn-frontend.trendyuu.com/public/images/texttovideo/icons/pixverse.webp",
    "pika-turbo":
      "https://cdn-frontend.trendyuu.com/public/images/texttovideo/icons/pika.webp",
    "kling-2.5-turbo":
      "https://cdn-frontend.trendyuu.com/public/images/texttovideo/icons/kling.webp",
    "seedance-2.0-mini":
      "https://cdn-frontend.trendyuu.com/public/images/texttovideo/icons/seedance1.webp",
    "seedance-2.0":
      "https://cdn-frontend.trendyuu.com/public/images/texttovideo/icons/seedance1.webp",
    "seedance-2.5":
      "https://cdn-frontend.trendyuu.com/public/images/texttovideo/icons/seedance1.webp",
  };

  return (
    logos[modelId] ||
    "https://cdn-frontend.trendyuu.com/public/images/texttovideo/icons/googlenewlogo.webp"
  );
};

export const getPlanBadgeColor = (plan: AIModelPlan) => {
  const m: Record<AIModelPlan, string> = {
    free: "bg-zinc-600",
    essential: "bg-yellow-600",
    creator: "bg-emerald-600",
    agency: "bg-gradient-to-r from-pink-500 to-rose-600",
  };
  return m[plan] ?? "bg-zinc-600";
};

export const getPlanLabel = (plan: AIModelPlan) => {
  const m: Record<AIModelPlan, string> = {
    free: "Free",
    essential: "Essential",
    creator: "Creator",
    agency: "Agency",
  };
  return m[plan] ?? plan;
};

// ================== IMAGENS ===================
export type AspectRatioImageAI = "16:9" | "9:16" | "1:1" | "4:3" | "3:4";

export interface AIImageMetadata {
  model: string;
  prompt: string;
  aspect_ratio: AspectRatioImageAI;
  credits_used: number;
}

export interface AIImage {
  id: number;
  user_id: string;
  name: string;
  size: string;
  created_at: number;
  thumbnail: string | null;
  format: "png";
  type: "AI_Image";
  public_url: string;
  s3_key: string;
  ai_metadata: AIImageMetadata | null;
}

export type ImageResolutionTier = "1K" | "2K" | "4K";

export interface AIImageModelConfig {
  id: string;
  name: string;
  plan: AIModelPlan;
  status: "available" | "blocked";
  baseCredits: number;
  perExtraReference?: number;
  aspectRatios?: AspectRatioImageAI[];
  supportsReferenceImage: boolean;
  imageCount?: number;
  max_generation_images?: number;
  storagePath?: string;
  maxReferenceImages?: number;
  supportsSeed?: boolean;
  supportsSteps?: boolean;
  supportsGuidanceScale?: boolean;
  supportsRawMode?: boolean;
  supportsTransparentBg?: boolean;
  resolutionTiers?: ImageResolutionTier[];
  resolutionCreditMultipliers?: Partial<Record<ImageResolutionTier, number>>;
}

export type QualityLevel = "low" | "medium" | "high";
export type Quality = Record<QualityLevel, number>;

export const AI_QUALITY_MODELS: Record<string, Quality> = {
  "gpt-1.0": {
    low: 0,
    medium: 50,
    high: 70,
  },
  "gpt-1-mini": {
    low: 0,
    medium: 30,
    high: 50,
  },
  "gpt-1.5": {
    low: 0,
    medium: 70,
    high: 100,
  },
  "gpt-2.0": {
    low: 0,
    medium: 100,
    high: 120,
  },
  "gpt-2.5-flare": {
    low: 0,
    medium: 50,
    high: 100,
  },
  "gpt-2.5-sunburst": {
    low: 0,
    medium: 50,
    high: 100,
  },
};

export const AI_IMAGE_MODELS: Record<string, AIImageModelConfig> = {
  // FREE MODELS
  "flux-schnell": {
    id: "flux-schnell",
    name: "Flux Schnell",
    plan: "free",
    status: "available",
    baseCredits: 200,
    aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4"],
    supportsReferenceImage: false,
    storagePath: "FLUX",
    supportsSeed: true,
    supportsSteps: true,
    supportsGuidanceScale: true,
    max_generation_images: 4,
  },
  "flux-2-klein": {
    id: "flux-2-klein",
    name: "Flux 2 Klein",
    plan: "free",
    status: "available",
    baseCredits: 240,
    aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4"],
    supportsReferenceImage: true,
    storagePath: "FLUX2",
    supportsSeed: true,
    supportsSteps: true,
    supportsGuidanceScale: true,
    max_generation_images: 4,
    maxReferenceImages: 4,
  },
  "flux-2": {
    id: "flux-2",
    name: "Flux 2",
    plan: "free",
    status: "available",
    baseCredits: 250,
    aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4"],
    supportsReferenceImage: false,
    storagePath: "FLUX2",
    supportsSeed: true,
    supportsSteps: true,
    supportsGuidanceScale: true,
    max_generation_images: 4,
  },
  "gpt-1-mini": {
    id: "gpt-1-mini",
    name: "GPT 1 Mini",
    plan: "free",
    status: "available",
    baseCredits: 225,
    aspectRatios: ["16:9", "9:16", "1:1"],
    max_generation_images: 4,
    supportsReferenceImage: true,
    storagePath: "Gpt",
    maxReferenceImages: 16,
  },

  // ESSENTIAL MODELS
  "flux-2-flash": {
    id: "flux-2-flash",
    name: "Flux 2 Flash",
    plan: "essential",
    status: "available",
    baseCredits: 220,
    aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4"],
    supportsReferenceImage: true,
    storagePath: "Flux2",
    supportsSeed: true,
    supportsSteps: true,
    supportsGuidanceScale: true,
    max_generation_images: 4,
    maxReferenceImages: 4,
  },
  "flux-2-turbo": {
    id: "flux-2-turbo",
    name: "Flux 2 Turbo",
    plan: "essential",
    status: "available",
    baseCredits: 230,
    aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4"],
    supportsReferenceImage: true,
    storagePath: "Flux2",
    supportsSeed: true,
    supportsSteps: true,
    supportsGuidanceScale: true,
    max_generation_images: 4,
    maxReferenceImages: 4,
  },
  "flux-dev": {
    id: "flux-dev",
    name: "FLUX 2 Dev",
    plan: "essential",
    status: "available",
    baseCredits: 270,
    aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4"],
    supportsReferenceImage: false,
    storagePath: "Flux",
    supportsSeed: true,
    supportsSteps: true,
    supportsGuidanceScale: true,
    max_generation_images: 4,
  },
  "gemini-2.5-flash": {
    id: "gemini-2.5-flash",
    name: "NanoBanana",
    plan: "essential",
    status: "available",
    baseCredits: 350,
    aspectRatios: ["16:9", "9:16", "1:1", "3:4"],
    max_generation_images: 4,
    supportsReferenceImage: true,
    storagePath: "NanoBanana",
    maxReferenceImages: 14,
  },
  "gpt-1.0": {
    id: "gpt-1.0",
    name: "GPT Image 1.0",
    plan: "essential",
    status: "available",
    baseCredits: 300,
    aspectRatios: ["16:9", "9:16", "1:1"],
    max_generation_images: 4,
    supportsReferenceImage: true,
    storagePath: "Gpt",
    maxReferenceImages: 16,
    supportsTransparentBg: true,
  },
  "gpt-1.5": {
    id: "gpt-1.5",
    name: "GPT Image 1.5",
    plan: "essential",
    status: "available",
    baseCredits: 350,
    aspectRatios: ["16:9", "9:16", "1:1"],
    max_generation_images: 4,
    supportsReferenceImage: true,
    storagePath: "Gpt",
    maxReferenceImages: 16,
    supportsTransparentBg: true,
  },
  "sd-3.5-medium": {
    id: "sd-3.5-medium",
    name: "SD 3.5 Medium",
    plan: "essential",
    status: "blocked",
    baseCredits: 450,
    aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4"],
    supportsReferenceImage: true,
    storagePath: "StableDiffusion",
  },
  "seedream-4.0": {
    id: "seedream-4.0",
    name: "Seedream 4.0",
    plan: "essential",
    status: "available",
    baseCredits: 400,
    aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4"],
    max_generation_images: 6,
    supportsReferenceImage: true,
    storagePath: "Seedream",
    maxReferenceImages: 8,
    supportsSeed: true,
    resolutionTiers: ["1K", "2K", "4K"],
  },
  "seedream-5.0-lite": {
    id: "seedream-5.0-lite",
    name: "Seedream 5.0 Lite",
    plan: "essential",
    status: "available",
    baseCredits: 460,
    aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4"],
    max_generation_images: 6,
    supportsReferenceImage: true,
    storagePath: "Seedream",
    maxReferenceImages: 10,
    supportsSeed: true,
    resolutionTiers: ["1K", "2K", "4K"],
  },
  "seedream-4.5": {
    id: "seedream-4.5",
    name: "Seedream 4.5",
    plan: "essential",
    status: "available",
    baseCredits: 520,
    aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4"],
    max_generation_images: 6,
    supportsReferenceImage: true,
    storagePath: "Seedream",
    maxReferenceImages: 10,
    supportsSeed: true,
    resolutionTiers: ["1K", "2K", "4K"],
  },

  // CREATOR MODELS
  "flux-pro": {
    id: "flux-pro",
    name: "Flux Pro",
    plan: "creator",
    status: "available",
    baseCredits: 500,
    aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4"],
    supportsReferenceImage: false,
    storagePath: "Flux",
    supportsSeed: true,
    max_generation_images: 4,
  },
  "flux-2-pro": {
    id: "flux-2-pro",
    name: "Flux 2 Pro",
    plan: "creator",
    status: "available",
    baseCredits: 520,
    aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4"],
    supportsReferenceImage: true,
    supportsSeed: true,
    supportsGuidanceScale: true,
    max_generation_images: 4,
  },
  "flux-pro-v1.1-ultra": {
    id: "flux-pro-v1.1-ultra",
    name: "Flux Pro Ultra",
    plan: "creator",
    status: "available",
    baseCredits: 820,
    aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4"],
    supportsReferenceImage: false,
    storagePath: "Flux",
    supportsSeed: true,
    supportsGuidanceScale: true,
    supportsRawMode: true,
    max_generation_images: 4,
  },
  "gemini-3.1-flash": {
    id: "gemini-3.1-flash",
    name: "NanoBanana 3",
    plan: "creator",
    status: "available",
    baseCredits: 550,
    aspectRatios: ["16:9", "9:16", "1:1", "3:4"],
    max_generation_images: 4,
    supportsReferenceImage: true,
    imageCount: 2,
    storagePath: "NanoBanana",
    maxReferenceImages: 14,
    resolutionTiers: ["1K", "2K", "4K"],
  },
  "gemini-3-pro": {
    id: "gemini-3-pro",
    name: "NanoBanana 3 Pro",
    plan: "creator",
    status: "available",
    baseCredits: 700,
    aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4"],
    max_generation_images: 4,
    supportsReferenceImage: true,
    imageCount: 2,
    storagePath: "NanoBanana",
    maxReferenceImages: 14,
    resolutionTiers: ["1K", "2K", "4K"],
  },
  "gpt-2.0": {
    id: "gpt-2.0",
    name: "GPT Image 2.0",
    plan: "creator",
    status: "available",
    baseCredits: 425,
    aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4"],
    max_generation_images: 4,
    supportsReferenceImage: true,
    storagePath: "Gpt",
    maxReferenceImages: 16,
  },
  "gpt-2.5-flare": {
    id: "gpt-2.5-flare",
    name: "GPT Image 2.5 Flare",
    plan: "creator",
    status: "available",
    baseCredits: 500,
    aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4"],
    max_generation_images: 4,
    supportsReferenceImage: true,
    storagePath: "Gpt",
    maxReferenceImages: 14,
  },
  "gpt-2.5-sunburst": {
    id: "gpt-2.5-sunburst",
    name: "GPT Image 2.5 Sunburst",
    plan: "creator",
    status: "available",
    baseCredits: 600,
    aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4"],
    max_generation_images: 4,
    supportsReferenceImage: true,
    storagePath: "Gpt",
    maxReferenceImages: 14,
    supportsTransparentBg: true,
  },
  "seedream-5.0-pro": {
    id: "seedream-5.0-pro",
    name: "Seedream 5.0 Pro",
    plan: "creator",
    status: "available",
    baseCredits: 850,
    perExtraReference: 60,
    aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4"],
    max_generation_images: 6,
    supportsReferenceImage: true,
    storagePath: "Seedream",
    maxReferenceImages: 14,
    supportsSeed: true,
    resolutionTiers: ["1K", "2K", "4K"],
    resolutionCreditMultipliers: { "1K": 1, "2K": 1, "4K": 2 },
  },

  // AGENCY MODELS
  "sd-3.5-large": {
    id: "sd-3.5-large",
    name: "SD 3.5 Large",
    plan: "agency",
    status: "blocked",
    baseCredits: 700,
    aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4"],
    supportsReferenceImage: true,
    storagePath: "StableDiffusion",
  },
};

export const getAIImageModelLogo = (modelId: string) => {
  const prefixLogoMap = new Map<string, string>([
    [
      "flux",
      "https://cdn-frontend.trendyuu.com/public/images/texttoimage/icons/flux.webp",
    ],
    [
      "sd-3.5",
      "https://cdn-frontend.trendyuu.com/public/images/texttoimage/icons/stability.webp",
    ],
    [
      "gemini",
      "https://cdn-frontend.trendyuu.com/public/images/texttoimage/icons/googlenewlogo.webp",
    ],
    [
      "gpt",
      "https://cdn-frontend.trendyuu.com/public/images/texttoimage/icons/openai.webp",
    ],
    [
      "seedream",
      "https://cdn-frontend.trendyuu.com/public/images/texttovideo/icons/seedance1.webp",
    ],
  ]);

  for (const [prefix, logo] of prefixLogoMap) {
    if (modelId.startsWith(prefix)) {
      return logo;
    }
  }

  return "https://cdn-frontend.trendyuu.com/public/logos/logotrend2.webp";
};

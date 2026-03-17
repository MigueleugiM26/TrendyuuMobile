export interface DecodedToken {
  user_id: string;
  exp: number;
  iat: number;
}

export interface TotalVideoData {
  videos_created: number;
  time_saved: number;
  total_views: number;
  storage_used: number;
  liked_videos: string[];
  viewed_videos: string[];
  viewed_users: string[];
}

type SocialPlatform =
  | "youtube"
  | "tiktok"
  | "instagram"
  | "twitter"
  | "facebook"
  | "kwai";

export interface ConnectedAccount {
  id: string;
  platform: SocialPlatform;
  username: string;
  platformUserId: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
  connectedAt: string;
  isExpired: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  credits: number;
  clipsCredits?: { autoclip: number; shortGenerator: number };
  stripeSubscriptionId: string;
  plan?: string;
  totalVideoData: TotalVideoData;
  socialMediaLinks: Record<string, string>;
  weeklySocialViews: number;
  status?: string;
  currentPlan: string;
  planPeriod: string;
  connectedAccounts: ConnectedAccount[];
  isFreeTrialActive: boolean;
  freeTrialEndDate: string;
  region: string;
  dev?: boolean;
}

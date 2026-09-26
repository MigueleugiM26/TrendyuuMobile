// types/user.ts
// No web dependencies — safe to use as-is in React Native.

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

export interface TotalTemplateData {
  viewed_templates: string[];
  liked_templates: string[];
}

type SocialPlatform =
  | "youtube"
  | "tiktok"
  | "instagram"
  | "twitter"
  | "facebook"
  | "kwai"
  | "linkedin";

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
  totalTemplateData: TotalTemplateData;
  socialMediaLinks: Record<string, string>;
  weeklySocialViews: number;
  status?: string;
  currentPlan: string;
  planPeriod: string;
  connectedAccounts: ConnectedAccount[];
  isFreeTrialActive: boolean;
  freeTrialEndDate: string;
  hasUsedDiscount: boolean;
  hasUsedAffiliateCoupon: boolean;
  region: string;
  dev?: boolean;
  subscriptionCancelAtPeriodEnd: boolean;
  stripeSubscriptionStatus: string;
}

export type UserPlan = "free" | "essential" | "creator" | "agency";

export const PLAN_HIERARCHY: Record<UserPlan, number> = {
  free: 0,
  essential: 1,
  creator: 2,
  agency: 3,
};

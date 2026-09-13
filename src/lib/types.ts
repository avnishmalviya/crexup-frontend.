export type RecommendationTier =
  | "HIGHLY_RECOMMENDED"
  | "RECOMMENDED"
  | "GOOD_CHOICE"
  | "REVIEW"
  | "NOT_RECOMMENDED";

export interface InstagramProfile {
  id: string;
  profilePictureUrl: string | null;
  bio: string | null;
  followers: number;
  following: number;
  totalPosts: number;
  avgReelViews: number;
  avgLikes: number;
  avgComments: number;
  engagementRate: number;
  postingFrequency: number;
  accountType: "PERSONAL" | "CREATOR" | "BUSINESS";
  verificationBadge: boolean;
  audienceCountry: Record<string, number> | null;
  audienceCity: Record<string, number> | null;
  audienceGender: Record<string, number> | null;
  audienceAge: Record<string, number> | null;
  dataSource: string;
  lastFetchedAt: string | null;
}

export interface CreatorScore {
  creatorScore: number;
  engagementScore: number;
  consistencyScore: number;
  audienceQualityScore: number;
  reliabilityScore: number;
  fakeFollowerRisk: number;
  brandFriendlyScore: number;
  growthScore: number;
  recommendationTier: RecommendationTier | null;
}

export interface CreatorPerformance {
  totalCampaigns: number;
  avgViews: number;
  avgReach: number;
  avgEngagement: number;
  completionRate: number;
  onTimeDeliveryRate: number;
  acceptanceRate: number;
  brandRatingAvg: number;
  adminRatingAvg: number;
}

export type ReliabilityRating = "EXCELLENT" | "GOOD" | "AVERAGE" | "POOR";

export interface CreatorRating {
  contentQuality: number;
  communication: number;
  onTimeDelivery: number;
  campaignPerformance: number;
  brandFit: number;
  overallScore: number;
  reliability: ReliabilityRating;
  description: string | null;
  lastReviewedAt: string;
}

export interface CreatorNote {
  id: string;
  category: "POSITIVE" | "NEGATIVE";
  text: string;
  createdAt: string;
  admin?: { name: string };
  campaign?: { name: string } | null;
}

export interface Creator {
  id: string;
  creatorCode: string;
  fullName: string;
  instagramUsername: string;
  instagramUrl: string | null;
  mobileNumber: string;
  whatsappNumber: string;
  email: string;
  gender: string | null;
  state: string;
  city: string;
  language: string;
  contentCategory: string;
  contentNiche: string;
  verificationStatus: "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED";
  availabilityStatus: "AVAILABLE" | "BUSY" | "ON_CAMPAIGN" | "UNAVAILABLE";
  collaborationStatus: string;
  createdAt: string;
  updatedAt: string;
  instagramProfile: InstagramProfile | null;
  scores: CreatorScore | null;
  performance: CreatorPerformance | null;
  rating: CreatorRating | null;
  notes?: CreatorNote[];
  recommendation?: { matchScore: number; tier: RecommendationTier; label: string };
}

export type CampaignStage =
  | "DRAFT"
  | "CREATOR_SHORTLISTED"
  | "INVITATION_SENT"
  | "CREATOR_ACCEPTED"
  | "ADDRESS_SUBMITTED"
  | "PRODUCT_SHIPPED"
  | "DELIVERED"
  | "CONTENT_SUBMITTED"
  | "REVISION_REQUIRED"
  | "APPROVED"
  | "POSTED"
  | "COMPLETED"
  | "CANCELLED";

export interface Campaign {
  id: string;
  campaignCode: string;
  name: string;
  brandName: string;
  product: string;
  goal: string | null;
  budget: number | null;
  deliverables: string | null;
  deadline: string | null;
  stage: CampaignStage;
  createdAt: string;
  _count?: { creators: number };
}

export interface CampaignCreator {
  id: string;
  status: string;
  recommendationScore: number | null;
  recommendationTier: string | null;
  creator: Creator;
}

export interface DashboardSummary {
  totalCreators: number;
  verifiedCreators: number;
  activeCampaigns: number;
  campaignCompletionRate: number;
  averageEngagement: number;
  creatorsAddedThisMonth: number;
  recentRegistrations: Array<{
    id: string;
    fullName: string;
    instagramUsername: string;
    creatorCode: string;
    createdAt: string;
    verificationStatus: string;
  }>;
  campaignTimeline: Array<{
    id: string;
    campaignCode: string;
    name: string;
    brandName: string;
    stage: CampaignStage;
    deadline: string | null;
    createdAt: string;
  }>;
}

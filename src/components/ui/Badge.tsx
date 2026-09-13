import { cn } from "@/lib/cn";
import { ReactNode } from "react";

type Tone = "neutral" | "teal" | "amber" | "red" | "indigo" | "ink";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-white/5 text-ink",
  teal: "bg-teal-soft text-teal",
  amber: "bg-amber-soft text-[#8a6110]",
  red: "bg-red-soft text-red",
  indigo: "bg-indigo-soft text-indigo",
  ink: "bg-ink text-white",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

const RECOMMENDATION_TONE: Record<string, Tone> = {
  HIGHLY_RECOMMENDED: "teal",
  RECOMMENDED: "teal",
  GOOD_CHOICE: "indigo",
  REVIEW: "amber",
  NOT_RECOMMENDED: "red",
};

const RECOMMENDATION_LABEL: Record<string, string> = {
  HIGHLY_RECOMMENDED: "⭐⭐⭐⭐⭐ Highly Recommended",
  RECOMMENDED: "⭐⭐⭐⭐ Recommended",
  GOOD_CHOICE: "⭐⭐ Good Choice",
  REVIEW: "⚠ Review Before Selecting",
  NOT_RECOMMENDED: "❌ Not Recommended",
};

export function RecommendationBadge({ tier }: { tier: string | null | undefined }) {
  if (!tier) return null;
  return <Badge tone={RECOMMENDATION_TONE[tier] || "neutral"}>{RECOMMENDATION_LABEL[tier] || tier}</Badge>;
}

const STAGE_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  CREATOR_SHORTLISTED: "Shortlisted",
  INVITATION_SENT: "Invitation Sent",
  CREATOR_ACCEPTED: "Accepted",
  ADDRESS_SUBMITTED: "Address Submitted",
  PRODUCT_SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CONTENT_SUBMITTED: "Content Submitted",
  REVISION_REQUIRED: "Revision Required",
  APPROVED: "Approved",
  POSTED: "Posted",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export function StageBadge({ stage }: { stage: string }) {
  const tone: Tone = stage === "COMPLETED" ? "teal" : stage === "CANCELLED" || stage === "REVISION_REQUIRED" ? "red" : "indigo";
  return <Badge tone={tone}>{STAGE_LABEL[stage] || stage}</Badge>;
}
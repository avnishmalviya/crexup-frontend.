"use client";

import { cn } from "@/lib/cn";

export function StarRating({
  value,
  onChange,
  readOnly = false,
  size = "md",
}: {
  value: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: "sm" | "md";
}) {
  const stars = [1, 2, 3, 4, 5];
  const textSize = size === "sm" ? "text-sm" : "text-lg";

  return (
    <div className="flex items-center gap-0.5" role={readOnly ? undefined : "radiogroup"}>
      {stars.map((star) => {
        const filled = star <= value;
        return (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
            onClick={() => onChange?.(star)}
            className={cn(
              textSize,
              "leading-none transition-transform",
              readOnly ? "cursor-default" : "cursor-pointer hover:scale-110",
              filled ? "text-amber-500" : "text-line"
            )}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}

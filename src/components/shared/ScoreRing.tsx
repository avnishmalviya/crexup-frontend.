"use client";

import { cn } from "@/lib/cn";

/**
 * ScoreRing — Crexup's signature visual device.
 *
 * Every creator is reduced to one 0-100 number the admin has to trust in a
 * split second before messaging them. Rather than a bar or a badge, the
 * score is drawn as a partial ring whose color travels red -> amber -> teal
 * as it fills, so quality reads at a glance from color alone, and the exact
 * number is still there for anyone comparing two similar creators.
 */

interface ScoreRingProps {
  score: number; // 0-100
  size?: number; // px
  strokeWidth?: number;
  label?: string;
  className?: string;
}

function colorForScore(score: number) {
  if (score >= 70) return "var(--teal)";
  if (score >= 45) return "var(--amber)";
  return "var(--red)";
}

export function ScoreRing({ score, size = 64, strokeWidth = 6, label, className }: ScoreRingProps) {
  const clamped = Math.max(0, Math.min(100, score));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);
  const color = colorForScore(clamped);

  return (
    <div className={cn("inline-flex flex-col items-center gap-1", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="var(--line)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.6s ease, stroke 0.3s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display font-semibold" style={{ fontSize: size * 0.28 }}>
            {Math.round(clamped)}
          </span>
        </div>
      </div>
      {label && <span className="text-xs text-muted">{label}</span>}
    </div>
  );
}

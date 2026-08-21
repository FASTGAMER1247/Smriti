"use client";

import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { DOMAIN_META, T } from "@/lib/constants";

export default function WellbeingRing({ domain, trend, size = 114 }) {
  const meta = DOMAIN_META[domain] || { label: domain, color: T.pine, icon: Minus };
  const pct = trend.recentAvg ?? 0;
  const strokeWidth = 10;
  const radius = size / 2 - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    trend.recentAvg == null ? circumference : circumference - (pct / 100) * circumference;

  const Icon = meta.icon;

  const trendBadge = () => {
    if (trend.status === "declining") {
      return (
        <span className="flex items-center gap-0.5 text-xs font-bold text-clay bg-clay-light px-2 py-0.5 rounded-full">
          <TrendingDown className="w-3.5 h-3.5" />
          <span>Needs Care</span>
        </span>
      );
    }
    if (trend.status === "improving") {
      return (
        <span className="flex items-center gap-0.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Improving</span>
        </span>
      );
    }
    if (trend.status === "stable") {
      return (
        <span className="flex items-center gap-0.5 text-xs font-medium text-ink-soft bg-sage-light px-2 py-0.5 rounded-full">
          <Minus className="w-3.5 h-3.5" />
          <span>Stable</span>
        </span>
      );
    }
    return (
      <span className="text-xs text-ink-muted bg-sage-light px-2 py-0.5 rounded-full">
        Ready
      </span>
    );
  };

  return (
    <div className="flex flex-col items-center bg-white p-4 rounded-3xl border border-sage/70 shadow-gentle hover:shadow-card transition-all duration-300 flex-1 min-w-[150px] max-w-[200px]">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#EBF2E8"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={meta.color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <Icon className="w-5 h-5 mb-0.5" style={{ color: meta.color }} />
          <span className="font-display text-xl font-bold text-ink">
            {trend.recentAvg == null ? "—" : `${trend.recentAvg}%`}
          </span>
        </div>
      </div>

      <div className="mt-3 flex flex-col items-center text-center gap-1.5 w-full">
        <span className="font-display text-base font-bold text-ink">
          {meta.label}
        </span>
        {trendBadge()}
      </div>
    </div>
  );
}

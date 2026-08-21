"use client";

import React from "react";
import { Award, ArrowRight, Sparkles, Heart } from "lucide-react";
import { DOMAIN_META, T } from "@/lib/constants";

export default function ResultsScreen({ result, onDone }) {
  const meta = DOMAIN_META[result?.domain] || {
    label: "Cognitive Exercise",
    color: T.pine,
  };

  const score = result?.score ?? 80;

  const getEncouragement = (s) => {
    if (s >= 85) return "Brilliant effort! Your mind was sharp and steady.";
    if (s >= 65) return "Well done! Daily consistency is the secret to good memory.";
    return "Great effort! Taking part every day keeps our neural connections active.";
  };

  return (
    <div className="max-w-md mx-auto pt-10 pb-16 text-center animate-in zoom-in-95 duration-300">
      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-sage/80 shadow-card flex flex-col items-center">
        {/* Badge */}
        <div
          className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6 shadow-gentle transition-transform hover:scale-105"
          style={{ background: `${meta.color}18` }}
        >
          <Award className="w-12 h-12" style={{ color: meta.color }} />
        </div>

        <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-sage-light text-pine mb-2">
          {meta.label} Complete
        </span>

        <h2 className="font-display text-3xl font-bold text-ink">
          {score >= 80 ? "Wonderful Job!" : "Activity Finished!"}
        </h2>

        {/* Score Ring / Text */}
        <div className="my-6 p-6 rounded-2xl bg-ivory border border-sage/80 w-full flex flex-col items-center">
          <span className="text-xs font-bold uppercase text-ink-soft mb-1">
            Session Score
          </span>
          <span
            className="font-display text-5xl font-extrabold tracking-tight"
            style={{ color: meta.color }}
          >
            {score}%
          </span>
          <p className="text-sm text-ink-soft mt-3 font-medium">
            {getEncouragement(score)}
          </p>
        </div>

        {result?.trend?.status === "declining" && (
          <div className="mb-6 p-4 rounded-2xl bg-clay-light border border-clay/30 text-xs text-clay text-left flex items-center gap-3">
            <Heart className="w-5 h-5 flex-shrink-0" />
            <span>
              Your caregiver has been gently notified with your recent trend so they can support your daily routine.
            </span>
          </div>
        )}

        <button
          onClick={onDone}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-display text-base font-bold text-white shadow-card hover:shadow-floating transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: T.pine }}
        >
          <span>Return to Home</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

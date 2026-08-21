"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";
import MemoryMatch from "./MemoryMatch";
import PatternPath from "./PatternPath";
import DailyRoutine from "./DailyRoutine";
import { T } from "@/lib/constants";

export default function GameRunner({ game, difficulty = {}, onExit, onComplete }) {
  const level = difficulty[game] || 1;

  return (
    <div className="pt-6 pb-12">
      {/* Navigation & Context */}
      <div className="max-w-xl mx-auto mb-6 flex items-center justify-between">
        <button
          onClick={onExit}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-sage text-sm font-semibold text-ink-soft hover:text-ink hover:bg-sage-light transition shadow-gentle"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <div className="text-xs font-semibold text-ink-soft px-3 py-1 rounded-full bg-sage-light">
          Difficulty: Level {level} of 3
        </div>
      </div>

      {/* Active Game */}
      <div>
        {game === "memory" && (
          <MemoryMatch
            level={level}
            onComplete={(score) => onComplete("memory", score, level)}
          />
        )}
        {game === "attention" && (
          <PatternPath
            level={level}
            onComplete={(score) => onComplete("attention", score, level)}
          />
        )}
        {game === "recall" && (
          <DailyRoutine
            level={level}
            onComplete={(score) => onComplete("recall", score, level)}
          />
        )}
      </div>
    </div>
  );
}

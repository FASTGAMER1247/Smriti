"use client";

import React, { useState } from "react";
import { T } from "@/lib/constants";
import { getLocalizedRoutine } from "@/lib/nerCulture";
import { Play, Check, RotateCcw, ListChecks } from "lucide-react";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function DailyRoutine({ level = 1, onComplete, language = "en" }) {
  const itemCount = level === 1 ? 4 : level === 2 ? 5 : 6;
  const [orderedItems, setOrderedItems] = useState([]);
  const [shuffledPool, setShuffledPool] = useState([]);
  const [chosenSequence, setChosenSequence] = useState([]);
  const [phase, setPhase] = useState("intro"); // intro | showing | input | done

  const pool = getLocalizedRoutine(language);

  const startGame = () => {
    const subset = pool.slice(0, itemCount);
    setOrderedItems(subset);
    setShuffledPool(shuffle(subset));
    setChosenSequence([]);
    setPhase("showing");

    // Show ordered list for 3.6 seconds
    setTimeout(() => {
      setPhase("input");
    }, 3600);
  };

  const handlePick = (item) => {
    if (chosenSequence.find((c) => c.id === item.id)) return;

    const next = [...chosenSequence, item];
    setChosenSequence(next);

    if (next.length === orderedItems.length) {
      const correctCount = next.filter(
        (val, i) => val.id === orderedItems[i].id
      ).length;
      const score = Math.round((correctCount / orderedItems.length) * 100);

      setPhase("done");
      setTimeout(() => {
        onComplete(score);
      }, 700);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 sm:p-8 rounded-3xl border border-sage shadow-card">
      <div className="flex items-center justify-between border-b border-sage/60 pb-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-2xl font-bold text-ink">
              Daily Routine · দৈনন্দিন সূচী
            </h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-clay/20 text-clay">
              Level {level}
            </span>
          </div>
          <p className="text-sm text-ink-soft mt-1">
            {phase === "intro" && "Remember the chronological order of traditional morning habits."}
            {phase === "showing" && "Look closely at the morning order before it hides..."}
            {phase === "input" && `Tap the steps in the chronological order (${chosenSequence.length} of ${itemCount})`}
            {phase === "done" && "Great effort! Checking your recall..."}
          </p>
        </div>
        {phase === "input" && (
          <button
            onClick={startGame}
            className="p-2.5 rounded-xl border border-sage text-ink-soft hover:text-pine hover:bg-sage-light transition"
            title="Restart"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        )}
      </div>

      {phase === "intro" ? (
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-clay/15 flex items-center justify-center text-clay">
            <ListChecks className="w-10 h-10 animate-bounce" />
          </div>
          <div className="max-w-md">
            <h3 className="font-display text-xl font-bold text-ink">
              Routine & Temporal Recall
            </h3>
            <p className="text-sm text-ink-soft mt-2">
              We will display a series of {itemCount} traditional morning habits. Remember what comes first, next, and last!
            </p>
          </div>
          <button
            onClick={startGame}
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl font-display text-lg font-bold text-white shadow-card hover:scale-105 transition-all"
            style={{ background: T.pine }}
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Start Activity</span>
          </button>
        </div>
      ) : phase === "showing" ? (
        <div className="space-y-3 py-2 animate-in fade-in duration-300">
          {orderedItems.map((item, idx) => (
            <div
              key={item.id}
              className="flex items-center gap-4 p-4 rounded-2xl bg-ivory border border-sage shadow-gentle"
            >
              <div className="w-8 h-8 rounded-full bg-pine text-white flex items-center justify-center font-bold text-sm">
                {idx + 1}
              </div>
              <span className="text-3xl">{item.emoji}</span>
              <span className="text-lg font-semibold text-ink">{item.label}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Picked order sequence */}
          <div className="p-4 rounded-2xl bg-sage-light/60 border border-sage/80 min-h-[70px] flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-ink-soft uppercase mr-1">Your Order:</span>
            {chosenSequence.length === 0 ? (
              <span className="text-xs text-ink-muted italic">Select step 1 below...</span>
            ) : (
              chosenSequence.map((c, i) => (
                <span
                  key={c.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-sage text-sm font-semibold text-ink shadow-sm"
                >
                  <strong className="text-pine font-bold">{i + 1}.</strong>
                  <span>{c.emoji}</span>
                  <span>{c.label}</span>
                </span>
              ))
            )}
          </div>

          {/* Selection buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {shuffledPool.map((item) => {
              const isSelected = chosenSequence.some((c) => c.id === item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => handlePick(item)}
                  disabled={isSelected}
                  className={`flex items-center gap-3 p-4 rounded-2xl border transition-all text-left select-none ${
                    isSelected
                      ? "bg-sage/40 border-sage/50 opacity-40 shadow-none scale-95"
                      : "bg-white border-sage/90 hover:border-clay hover:shadow-card hover:-translate-y-0.5 active:scale-95 shadow-gentle text-ink"
                  }`}
                >
                  <span className="text-3xl">{item.emoji}</span>
                  <span className="text-base font-semibold">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

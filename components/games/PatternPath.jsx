"use client";

import React, { useState, useEffect } from "react";
import { T } from "@/lib/constants";
import { Play, RotateCcw, Sparkles } from "lucide-react";

export default function PatternPath({ level = 1, onComplete }) {
  const sequenceLength = 2 + level; // Level 1: 3, Level 2: 4, Level 3: 5
  const tiles = [
    { id: 0, color: T.pine, label: "Forest Green" },
    { id: 1, color: T.marigold, label: "Marigold Gold" },
    { id: 2, color: T.clay, label: "Terracotta Clay" },
    { id: 3, color: T.sageDeep, label: "River Sage" },
  ];

  const [sequence, setSequence] = useState([]);
  const [activeTileIndex, setActiveTileIndex] = useState(-1);
  const [phase, setPhase] = useState("intro"); // intro | showing | input | done
  const [userSequence, setUserSequence] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);

  const startRound = () => {
    const newSeq = Array.from({ length: sequenceLength }, () =>
      Math.floor(Math.random() * 4)
    );
    setSequence(newSeq);
    setUserSequence([]);
    setPhase("showing");
    setCurrentStep(0);
  };

  // Playback sequence
  useEffect(() => {
    if (phase !== "showing" || sequence.length === 0) return;

    let step = 0;
    setActiveTileIndex(sequence[0]);

    const interval = setInterval(() => {
      step++;
      if (step >= sequence.length) {
        clearInterval(interval);
        setTimeout(() => {
          setActiveTileIndex(-1);
          setPhase("input");
        }, 600);
      } else {
        setActiveTileIndex(sequence[step]);
      }
    }, 900);

    return () => clearInterval(interval);
  }, [phase, sequence]);

  const handleTileClick = (index) => {
    if (phase !== "input") return;

    const nextUserSeq = [...userSequence, index];
    setUserSequence(nextUserSeq);

    // Quick visual blink for clicked tile
    setActiveTileIndex(index);
    setTimeout(() => setActiveTileIndex(-1), 250);

    if (nextUserSeq.length === sequence.length) {
      // Completed full sequence
      const correctCount = nextUserSeq.filter(
        (val, i) => val === sequence[i]
      ).length;
      const score = Math.round((correctCount / sequence.length) * 100);

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
              Pattern Path
            </h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-marigold/20 text-marigold-deep">
              Level {level}
            </span>
          </div>
          <p className="text-sm text-ink-soft mt-1">
            {phase === "intro" && "Watch the colored tiles light up, then repeat the exact order."}
            {phase === "showing" && "Watch closely as the pattern illuminates..."}
            {phase === "input" && `Now tap the tiles in order (${userSequence.length} of ${sequenceLength})`}
            {phase === "done" && "Pattern completed! Evaluating your score..."}
          </p>
        </div>
        {phase === "input" && (
          <button
            onClick={startRound}
            className="p-2.5 rounded-xl border border-sage text-ink-soft hover:text-pine hover:bg-sage-light transition"
            title="Try Again"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        )}
      </div>

      {phase === "intro" ? (
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-marigold/15 flex items-center justify-center text-marigold-deep">
            <Sparkles className="w-10 h-10 animate-bounce" />
          </div>
          <div className="max-w-md">
            <h3 className="font-display text-xl font-bold text-ink">
              Focus & Attention Training
            </h3>
            <p className="text-sm text-ink-soft mt-2">
              A sequence of {sequenceLength} lights will flash one by one. Remember the rhythm and colors!
            </p>
          </div>
          <button
            onClick={startRound}
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl font-display text-lg font-bold text-white shadow-card hover:scale-105 transition-all"
            style={{ background: T.pine }}
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Start Activity</span>
          </button>
        </div>
      ) : (
        <div className="py-4">
          <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
            {tiles.map((tile) => {
              const isActive = activeTileIndex === tile.id;
              return (
                <button
                  key={tile.id}
                  onClick={() => handleTileClick(tile.id)}
                  disabled={phase !== "input"}
                  className={`aspect-square rounded-3xl transition-all duration-200 border-4 select-none ${
                    isActive
                      ? "scale-105 shadow-floating border-white ring-4 ring-marigold brightness-125"
                      : phase === "showing"
                      ? "opacity-35 border-transparent scale-95"
                      : "opacity-90 border-transparent hover:opacity-100 hover:scale-100 shadow-gentle active:scale-95"
                  }`}
                  style={{ background: tile.color }}
                  aria-label={tile.label}
                />
              );
            })}
          </div>

          {phase === "input" && (
            <div className="mt-8 flex justify-center items-center gap-2">
              {sequence.map((_, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full transition-colors ${
                    i < userSequence.length
                      ? "bg-pine scale-110"
                      : "bg-sage border border-sage-deep"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

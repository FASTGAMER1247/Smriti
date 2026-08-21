"use client";

import React, { useState, useEffect } from "react";
import { Brain, Check, ArrowRight, RotateCcw, Sparkles, Heart, ShieldCheck, Play } from "lucide-react";
import { T } from "@/lib/constants";

export default function OnboardingAssessment({ patientName = "Ratna Devi", onComplete, onSkip }) {
  const [step, setStep] = useState(0); // 0: intro, 1: memory, 2: attention, 3: recall, 4: summary
  const [scores, setScores] = useState({ memoryScore: 0, attentionScore: 0, recallScore: 0 });

  // ── Step 1: Memory (2 pairs) ──
  const [memFlipped, setMemFlipped] = useState([]);
  const [memMatched, setMemMatched] = useState([]);
  const [memMoves, setMemMoves] = useState(0);
  const memCards = [
    { id: 0, val: "🌸" },
    { id: 1, val: "🍵" },
    { id: 2, val: "🌸" },
    { id: 3, val: "🍵" },
  ];

  const handleMemClick = (idx) => {
    if (memFlipped.length === 2 || memFlipped.includes(idx) || memMatched.includes(idx)) return;
    const nextFlipped = [...memFlipped, idx];
    setMemFlipped(nextFlipped);

    if (nextFlipped.length === 2) {
      setMemMoves((m) => m + 1);
      const [a, b] = nextFlipped;
      if (memCards[a].val === memCards[b].val) {
        const nextMatched = [...memMatched, a, b];
        setMemMatched(nextMatched);
        setTimeout(() => setMemFlipped([]), 300);

        if (nextMatched.length === 4) {
          const score = Math.max(70, 100 - (memMoves) * 10);
          setScores((prev) => ({ ...prev, memoryScore: score }));
          setTimeout(() => setStep(2), 700);
        }
      } else {
        setTimeout(() => setMemFlipped([]), 600);
      }
    }
  };

  // ── Step 2: Attention (3 sequence lights) ──
  const [attPhase, setAttPhase] = useState("ready"); // ready | showing | input | done
  const [attActive, setAttActive] = useState(-1);
  const [attUserSeq, setAttUserSeq] = useState([]);
  const attSeq = [0, 2, 1]; // Pine -> Clay -> Marigold

  const startAttentionTest = () => {
    setAttPhase("showing");
    setAttUserSeq([]);
    let i = 0;
    setAttActive(attSeq[0]);

    const timer = setInterval(() => {
      i++;
      if (i >= attSeq.length) {
        clearInterval(timer);
        setTimeout(() => {
          setAttActive(-1);
          setAttPhase("input");
        }, 500);
      } else {
        setAttActive(attSeq[i]);
      }
    }, 850);
  };

  const handleAttTap = (tileId) => {
    if (attPhase !== "input") return;
    const next = [...attUserSeq, tileId];
    setAttUserSeq(next);
    setAttActive(tileId);
    setTimeout(() => setAttActive(-1), 200);

    if (next.length === attSeq.length) {
      const correct = next.filter((v, idx) => v === attSeq[idx]).length;
      const score = Math.round((correct / attSeq.length) * 100);
      setScores((prev) => ({ ...prev, attentionScore: Math.max(60, score) }));
      setAttPhase("done");
      setTimeout(() => setStep(3), 700);
    }
  };

  // ── Step 3: Recall (Order 3 items) ──
  const routineItems = [
    { id: "wake", label: "Wake up at sunrise", emoji: "🌅" },
    { id: "water", label: "Drink warm water", emoji: "💧" },
    { id: "tea", label: "Morning Assam tea", emoji: "🍵" },
  ];
  const [routinePicked, setRoutinePicked] = useState([]);

  const handleRoutinePick = (item) => {
    if (routinePicked.some((p) => p.id === item.id)) return;
    const next = [...routinePicked, item];
    setRoutinePicked(next);

    if (next.length === routineItems.length) {
      const correctCount = next.filter((item, idx) => item.id === routineItems[idx].id).length;
      const score = Math.round((correctCount / routineItems.length) * 100);
      const finalScore = Math.max(60, score);
      setScores((prev) => {
        const finalScores = { ...prev, recallScore: finalScore };
        setTimeout(() => setStep(4), 600);
        return finalScores;
      });
    }
  };

  const handleFinish = () => {
    onComplete(scores);
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-pine text-marigold flex items-center justify-center font-bold text-sm">
            {step === 0 ? "★" : step === 4 ? "✓" : step}
          </div>
          <span className="text-sm font-bold text-ink">
            {step === 0 && "Welcome Assessment"}
            {step === 1 && "Step 1 of 3: Memory Check"}
            {step === 2 && "Step 2 of 3: Attention Rhythm"}
            {step === 3 && "Step 3 of 3: Routine Order"}
            {step === 4 && "Baseline Assessment Complete"}
          </span>
        </div>

        {step > 0 && step < 4 && (
          <button
            onClick={onSkip}
            className="text-xs font-semibold text-ink-soft hover:text-pine transition"
          >
            Skip for now
          </button>
        )}
      </div>

      {/* ── STEP 0: INTRO ────────────────────────────────────────────── */}
      {step === 0 && (
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-sage shadow-card text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-pine/10 mx-auto flex items-center justify-center text-pine">
            <Brain className="w-10 h-10 text-marigold" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-sage-light text-pine">
              Personalized Setup
            </span>
            <h1 className="font-display text-3xl font-bold text-ink mt-3">
              Welcome to Smriti, {patientName.split(" ")[0]}
            </h1>
            <p className="text-base text-ink-soft mt-2 max-w-md mx-auto leading-relaxed">
              Let's complete a gentle 2-minute baseline assessment. This helps our AI personalize exercise difficulty and track your mental wellbeing.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-left p-4 rounded-2xl bg-ivory border border-sage/60 text-xs">
            <div className="p-2">
              <strong className="block text-pine text-sm font-bold">1. Memory</strong>
              <span className="text-ink-soft">Match 2 symbol pairs</span>
            </div>
            <div className="p-2 border-l border-sage/60">
              <strong className="block text-marigold-deep text-sm font-bold">2. Attention</strong>
              <span className="text-ink-soft">Repeat a 3-light pattern</span>
            </div>
            <div className="p-2 border-l border-sage/60">
              <strong className="block text-clay text-sm font-bold">3. Recall</strong>
              <span className="text-ink-soft">Order 3 morning steps</span>
            </div>
          </div>

          <button
            onClick={() => setStep(1)}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-display text-lg font-bold text-white shadow-card hover:shadow-floating transition-all hover:scale-[1.02]"
            style={{ background: T.pine }}
          >
            <span>Begin Quick Assessment</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* ── STEP 1: MEMORY ────────────────────────────────────────────── */}
      {step === 1 && (
        <div className="bg-white p-8 rounded-3xl border border-sage shadow-card">
          <div className="mb-6">
            <span className="text-xs font-bold uppercase text-pine px-2.5 py-0.5 rounded-full bg-pine/10">
              Part 1 · Visual Memory
            </span>
            <h2 className="font-display text-2xl font-bold text-ink mt-2">
              Tap cards to match the 2 pairs
            </h2>
            <p className="text-sm text-ink-soft mt-1">
              Find the matching flowers and tea cups.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto my-6">
            {memCards.map((card, idx) => {
              const isUp = memFlipped.includes(idx) || memMatched.includes(idx);
              return (
                <button
                  key={card.id}
                  onClick={() => handleMemClick(idx)}
                  disabled={isUp || memFlipped.length === 2}
                  className={`aspect-square rounded-3xl text-4xl flex items-center justify-center transition-all duration-300 border-2 select-none ${
                    isUp
                      ? "bg-ivory border-marigold shadow-gentle scale-100"
                      : "bg-pine border-transparent text-transparent hover:scale-105 active:scale-95 shadow-card"
                  }`}
                >
                  {isUp ? card.val : <Sparkles className="w-6 h-6 text-sage/40" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── STEP 2: ATTENTION ─────────────────────────────────────────── */}
      {step === 2 && (
        <div className="bg-white p-8 rounded-3xl border border-sage shadow-card text-center">
          <div className="mb-6 text-left">
            <span className="text-xs font-bold uppercase text-marigold-deep px-2.5 py-0.5 rounded-full bg-marigold/15">
              Part 2 · Attention & Focus
            </span>
            <h2 className="font-display text-2xl font-bold text-ink mt-2">
              Follow the light rhythm
            </h2>
            <p className="text-sm text-ink-soft mt-1">
              {attPhase === "ready" && "Press Start, watch the 3 tiles illuminate, then repeat the same sequence."}
              {attPhase === "showing" && "Watch carefully as the pattern flashes..."}
              {attPhase === "input" && "Now tap the 3 tiles in the exact order!"}
              {attPhase === "done" && "Great rhythm!"}
            </p>
          </div>

          {attPhase === "ready" ? (
            <div className="py-8">
              <button
                onClick={startAttentionTest}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-display text-lg font-bold text-white shadow-card hover:scale-105 transition"
                style={{ background: T.marigoldDeep }}
              >
                <Play className="w-5 h-5 fill-current" />
                <span>Show Light Sequence</span>
              </button>
            </div>
          ) : (
            <div className="py-4">
              <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
                {[
                  { id: 0, color: T.pine, label: "Green" },
                  { id: 1, color: T.marigold, label: "Gold" },
                  { id: 2, color: T.clay, label: "Terracotta" },
                ].map((tile) => {
                  const isActive = attActive === tile.id;
                  return (
                    <button
                      key={tile.id}
                      onClick={() => handleAttTap(tile.id)}
                      disabled={attPhase !== "input"}
                      className={`aspect-square rounded-2xl border-4 transition-all duration-200 ${
                        isActive
                          ? "border-white ring-4 ring-marigold brightness-125 scale-105 shadow-floating"
                          : attPhase === "showing"
                          ? "opacity-40 border-transparent"
                          : "opacity-90 border-transparent hover:opacity-100 hover:scale-100 shadow-gentle active:scale-95"
                      }`}
                      style={{ background: tile.color }}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── STEP 3: RECALL ────────────────────────────────────────────── */}
      {step === 3 && (
        <div className="bg-white p-8 rounded-3xl border border-sage shadow-card">
          <div className="mb-6">
            <span className="text-xs font-bold uppercase text-clay px-2.5 py-0.5 rounded-full bg-clay/15">
              Part 3 · Temporal Routine Recall
            </span>
            <h2 className="font-display text-2xl font-bold text-ink mt-2">
              Order your morning sequence
            </h2>
            <p className="text-sm text-ink-soft mt-1">
              Tap the 3 actions in chronological order from first to last.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-sage-light/60 border border-sage/80 min-h-[60px] flex items-center gap-2 mb-6">
            <span className="text-xs font-bold text-ink-soft uppercase mr-1">Your Order:</span>
            {routinePicked.length === 0 ? (
              <span className="text-xs text-ink-muted italic">Select step 1 below...</span>
            ) : (
              routinePicked.map((p, i) => (
                <span
                  key={p.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-sage text-sm font-semibold text-ink shadow-sm"
                >
                  <strong className="text-pine">{i + 1}.</strong> {p.emoji} {p.label}
                </span>
              ))
            )}
          </div>

          <div className="space-y-3">
            {[
              { id: "water", label: "Drink warm water", emoji: "💧" },
              { id: "wake", label: "Wake up at sunrise", emoji: "🌅" },
              { id: "tea", label: "Morning Assam tea", emoji: "🍵" },
            ].map((item) => {
              const isSelected = routinePicked.some((p) => p.id === item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => handleRoutinePick(item)}
                  disabled={isSelected}
                  className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-all text-left ${
                    isSelected
                      ? "bg-sage/40 border-sage/50 opacity-40 shadow-none"
                      : "bg-white border-sage/90 hover:border-clay hover:shadow-card hover:-translate-y-0.5 text-ink shadow-gentle"
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

      {/* ── STEP 4: SUMMARY & MIND MAP CREATED ─────────────────────────── */}
      {step === 4 && (
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-sage shadow-card text-center space-y-6 animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 rounded-3xl bg-emerald-50 mx-auto flex items-center justify-center text-emerald-600 shadow-gentle">
            <ShieldCheck className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
              Cognitive Profile Ready
            </span>
            <h2 className="font-display text-3xl font-bold text-ink mt-3">
              Mind Map Created Successfully!
            </h2>
            <p className="text-sm text-ink-soft mt-1.5 max-w-md mx-auto">
              We have calibrated your baseline across all 3 key cognitive domains. Daily exercises will now adapt automatically.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 p-5 rounded-2xl bg-ivory border border-sage/80">
            <div>
              <p className="text-xs text-ink-soft">Memory</p>
              <p className="font-display text-2xl font-bold text-pine mt-0.5">
                {scores.memoryScore}%
              </p>
            </div>
            <div className="border-l border-sage/60">
              <p className="text-xs text-ink-soft">Attention</p>
              <p className="font-display text-2xl font-bold text-marigold-deep mt-0.5">
                {scores.attentionScore}%
              </p>
            </div>
            <div className="border-l border-sage/60">
              <p className="text-xs text-ink-soft">Routine Recall</p>
              <p className="font-display text-2xl font-bold text-clay mt-0.5">
                {scores.recallScore}%
              </p>
            </div>
          </div>

          <button
            onClick={handleFinish}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-display text-lg font-bold text-white shadow-card hover:shadow-floating transition-all hover:scale-[1.02]"
            style={{ background: T.pine }}
          >
            <span>Enter Smriti Care Platform</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}

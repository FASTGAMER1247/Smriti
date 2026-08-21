"use client";

import React, { useState, useEffect } from "react";
import { T, EMOJI_SET } from "@/lib/constants";
import { Sparkles, RotateCcw } from "lucide-react";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function MemoryMatch({ level = 1, onComplete }) {
  const pairsCount = level === 1 ? 3 : level === 2 ? 4 : 6;
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);

  const initGame = () => {
    const chosen = EMOJI_SET.slice(0, pairsCount);
    const deck = shuffle([...chosen, ...chosen]).map((emoji, index) => ({
      id: `${emoji}_${index}_${Math.random()}`,
      emoji,
    }));
    setCards(deck);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
  };

  useEffect(() => {
    initGame();
  }, [level]);

  // Flip logic
  useEffect(() => {
    if (flipped.length === 2) {
      const [idxA, idxB] = flipped;
      setMoves((m) => m + 1);

      if (cards[idxA]?.emoji === cards[idxB]?.emoji) {
        setMatched((prev) => [...prev, idxA, idxB]);
        setTimeout(() => setFlipped([]), 350);
      } else {
        setTimeout(() => setFlipped([]), 700);
      }
    }
  }, [flipped, cards]);

  // Win condition
  useEffect(() => {
    if (cards.length > 0 && matched.length === cards.length) {
      const idealMoves = pairsCount;
      const penalty = Math.max(0, (moves - idealMoves) * 5);
      const score = Math.max(30, Math.min(100, 100 - penalty));
      const timer = setTimeout(() => {
        onComplete(score);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [matched, cards.length, moves, pairsCount, onComplete]);

  const gridCols =
    pairsCount <= 3 ? "grid-cols-3" : pairsCount === 4 ? "grid-cols-4" : "grid-cols-4 sm:grid-cols-4";

  return (
    <div className="max-w-xl mx-auto bg-white p-6 sm:p-8 rounded-3xl border border-sage shadow-card">
      <div className="flex items-center justify-between border-b border-sage/60 pb-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-2xl font-bold text-ink">
              Memory Match
            </h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-pine/10 text-pine">
              Level {level}
            </span>
          </div>
          <p className="text-sm text-ink-soft mt-1">
            Tap cards to turn them over and find identical pairs.
          </p>
        </div>
        <button
          onClick={initGame}
          className="p-2.5 rounded-xl border border-sage text-ink-soft hover:text-pine hover:bg-sage-light transition"
          title="Restart Game"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center justify-between text-sm font-semibold text-ink-soft mb-6 px-1">
        <span>Moves Made: <strong className="text-ink text-base">{moves}</strong></span>
        <span>
          Matched: <strong className="text-pine text-base">{matched.length / 2}</strong> / {pairsCount}
        </span>
      </div>

      {/* Cards Grid */}
      <div className={`grid ${gridCols} gap-3 sm:gap-4`}>
        {cards.map((card, idx) => {
          const isFlipped = flipped.includes(idx) || matched.includes(idx);
          const isMatched = matched.includes(idx);

          return (
            <button
              key={card.id}
              disabled={isFlipped || flipped.length === 2}
              onClick={() => setFlipped((prev) => [...prev, idx])}
              className={`aspect-square rounded-2xl sm:rounded-3xl flex items-center justify-center text-3xl sm:text-4xl transition-all duration-300 transform select-none ${
                isMatched
                  ? "bg-sage/50 border-2 border-pine text-opacity-100 scale-95 shadow-none"
                  : isFlipped
                  ? "bg-ivory border-2 border-marigold text-opacity-100 shadow-gentle scale-100"
                  : "bg-pine hover:bg-pine-light text-transparent active:scale-95 shadow-card"
              }`}
              style={{ minHeight: "75px" }}
            >
              {isFlipped ? (
                <span className="transition-transform duration-300 animate-in zoom-in-50">
                  {card.emoji}
                </span>
              ) : (
                <Sparkles className="w-5 h-5 text-sage/40" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

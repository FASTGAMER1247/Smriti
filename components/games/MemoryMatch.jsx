"use client";

import React, { useState, useEffect } from "react";
import { T } from "@/lib/constants";
import { NER_CULTURAL_MOTIFS } from "@/lib/nerCulture";
import { Sparkles, RotateCcw, MapPin } from "lucide-react";

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
  const [lastMatchedMotif, setLastMatchedMotif] = useState(null);

  const initGame = () => {
    const chosen = NER_CULTURAL_MOTIFS.slice(0, pairsCount);
    const deck = shuffle([...chosen, ...chosen]).map((motif, index) => ({
      id: `${motif.id}_${index}_${Math.random()}`,
      motif,
    }));
    setCards(deck);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setLastMatchedMotif(null);
  };

  useEffect(() => {
    initGame();
  }, [level]);

  // Flip logic
  useEffect(() => {
    if (flipped.length === 2) {
      const [idxA, idxB] = flipped;
      setMoves((m) => m + 1);

      if (cards[idxA]?.motif.id === cards[idxB]?.motif.id) {
        const motif = cards[idxA].motif;
        setLastMatchedMotif(motif);
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
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [matched, cards.length, moves, pairsCount, onComplete]);

  const gridCols =
    pairsCount <= 3 ? "grid-cols-3" : pairsCount === 4 ? "grid-cols-4" : "grid-cols-3 sm:grid-cols-4";

  return (
    <div className="max-w-xl mx-auto bg-white p-6 sm:p-8 rounded-3xl border border-sage shadow-card">
      <div className="flex items-center justify-between border-b border-sage/60 pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-2xl font-bold text-ink">
              Memory Match · স্মৃতি খেল
            </h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-pine/10 text-pine">
              Level {level}
            </span>
          </div>
          <p className="text-sm text-ink-soft mt-1">
            Match traditional North Eastern symbols, orchids, tea & wildlife.
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

      {/* Cultural discovery banner upon match */}
      {lastMatchedMotif && (
        <div className="mb-4 p-3 rounded-2xl bg-sage-light border border-sage flex items-center justify-between text-xs animate-in fade-in-50 slide-in-from-top-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">{lastMatchedMotif.emoji}</span>
            <div>
              <p className="font-bold text-ink">{lastMatchedMotif.name}</p>
              <p className="text-ink-soft text-[11px]">{lastMatchedMotif.desc}</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 font-semibold text-pine text-[11px] px-2 py-0.5 rounded-full bg-white">
            <MapPin className="w-3 h-3" />
            {lastMatchedMotif.region}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between text-sm font-semibold text-ink-soft mb-5 px-1">
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
              className={`aspect-square rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center transition-all duration-300 transform select-none ${
                isMatched
                  ? "bg-sage/40 border-2 border-pine scale-95 shadow-none"
                  : isFlipped
                  ? "bg-ivory border-2 border-marigold shadow-gentle scale-100"
                  : "bg-pine hover:bg-pine-light active:scale-95 shadow-card"
              }`}
              style={{ minHeight: "80px" }}
            >
              {isFlipped ? (
                <div className="flex flex-col items-center animate-in zoom-in-50">
                  <span className="text-3xl sm:text-4xl">{card.motif.emoji}</span>
                  <span className="text-[10px] font-bold text-ink mt-1 truncate max-w-[80px]">
                    {card.motif.name.split(" ")[0]}
                  </span>
                </div>
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

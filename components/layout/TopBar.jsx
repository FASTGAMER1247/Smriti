"use client";

import React from "react";
import { Brain, Users, Activity, Sparkles, Wifi } from "lucide-react";
import { T } from "@/lib/constants";

export default function TopBar({ role, setRole, setScreen }) {
  return (
    <header className="w-full shadow-sm sticky top-0 z-50" style={{ background: T.pine }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
        {/* Brand & North East Mission */}
        <div 
          onClick={() => setScreen("home")}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/10 group-hover:bg-white/15 transition">
            <Brain className="w-6 h-6 text-marigold animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-2xl font-bold tracking-tight text-white">
                Smriti
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/15 text-sage-deep">
                স্মৃতি
              </span>
            </div>
            <p className="text-xs text-sage-deep hidden sm:block">
              Cognitive Care & Memory Assistance · North East India
            </p>
          </div>
        </div>

        {/* Status indicator & Role switcher */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/20 text-xs text-sage font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Offline Ready</span>
          </div>

          <div 
            className="flex p-1 rounded-full gap-1 border border-white/10" 
            style={{ background: T.pineDark }}
          >
            <button
              onClick={() => {
                setRole("patient");
                setScreen("home");
              }}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 ${
                role === "patient"
                  ? "bg-marigold text-pine-dark shadow-sm"
                  : "text-sage hover:text-white"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Patient View</span>
            </button>
            <button
              onClick={() => {
                setRole("caregiver");
                setScreen("home");
              }}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 ${
                role === "caregiver"
                  ? "bg-marigold text-pine-dark shadow-sm"
                  : "text-sage hover:text-white"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Caregiver View</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

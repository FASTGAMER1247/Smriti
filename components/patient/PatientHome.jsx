"use client";

import React from "react";
import { Sparkles, Grid3x3, ListChecks, ArrowRight, HeartHandshake, Mic } from "lucide-react";
import { DOMAIN_META, T, PATIENT_NAME } from "@/lib/constants";
import { computeTrend } from "@/lib/cognitiveEngine";
import WellbeingRing from "./WellbeingRing";
import ReminderList from "./ReminderList";

export default function PatientHome({ state, onPlay, onToggleReminder }) {
  const declining = Object.keys(DOMAIN_META).find(
    (d) => computeTrend(state?.sessions || [], d).status === "declining"
  );

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const patientFirstName = state?.patient?.name?.split(" ")[0] || PATIENT_NAME.split(" ")[0];

  return (
    <div className="pt-6 pb-12 space-y-10">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white/70 backdrop-blur-sm p-6 sm:p-8 rounded-3xl border border-sage/60 shadow-gentle">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sage-light text-pine text-xs font-semibold mb-2">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Gentle Daily Exercise</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink tracking-tight">
            {getGreeting()}, {patientFirstName}
          </h1>
          <p className="text-base sm:text-lg text-ink-soft mt-1">
            Let's gently exercise your mind and preserve cherished memories today.
          </p>
        </div>

        {/* Quick Voice Prompt (Ready for voice module step) */}
        <div className="flex items-center gap-2 bg-ivory border border-sage p-3 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-pine flex items-center justify-center text-marigold">
            <Mic className="w-5 h-5" />
          </div>
          <div className="text-xs">
            <p className="font-bold text-ink">Voice Assistant</p>
            <p className="text-ink-soft">Tap an activity below or speak</p>
          </div>
        </div>
      </div>

      {/* Gentle Intervention Alert (if declining) */}
      {declining && (
        <div className="rounded-3xl p-5 sm:p-6 flex items-center gap-4 bg-clay-light border border-clay/30 shadow-gentle">
          <div className="w-12 h-12 rounded-2xl bg-clay/15 flex items-center justify-center text-clay flex-shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-ink">
              Focus of the Day: {DOMAIN_META[declining]?.label}
            </h3>
            <p className="text-sm text-ink-soft mt-0.5">
              Let's spend a few relaxed minutes on a {DOMAIN_META[declining]?.label.toLowerCase()} activity today. A little daily practice keeps memory resilient.
            </p>
          </div>
        </div>
      )}

      {/* Wellbeing Overview */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-ink">
              Your Cognitive Wellbeing
            </h2>
            <p className="text-sm text-ink-soft">
              Based on recent memory, attention, and daily recall exercises
            </p>
          </div>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 sm:overflow-visible">
          {Object.keys(DOMAIN_META).map((domain) => (
            <WellbeingRing
              key={domain}
              domain={domain}
              trend={computeTrend(state?.sessions || [], domain)}
            />
          ))}
        </div>
      </section>

      {/* Daily Cognitive Activities */}
      <section>
        <div className="mb-4">
          <h2 className="font-display text-2xl font-bold text-ink">
            Today's Activities
          </h2>
          <p className="text-sm text-ink-soft">
            Designed to support focus, recognition, and daily memory
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <ActivityCard
            title="Memory Match"
            desc="Match regional symbols, flowers & tea garden icons"
            domain="Memory"
            level={state?.difficulty?.memory || 1}
            icon={Grid3x3}
            color={T.pine}
            bgAccent="bg-pine/10"
            onClick={() => onPlay("memory")}
          />
          <ActivityCard
            title="Pattern Path"
            desc="Watch the rhythmic sequence and tap in order"
            domain="Attention"
            level={state?.difficulty?.attention || 1}
            icon={Sparkles}
            color={T.marigoldDeep}
            bgAccent="bg-marigold/15"
            onClick={() => onPlay("attention")}
          />
          <ActivityCard
            title="Daily Routine"
            desc="Reconstruct the steps of a healthy morning"
            domain="Routine Recall"
            level={state?.difficulty?.recall || 1}
            icon={ListChecks}
            color={T.clay}
            bgAccent="bg-clay/15"
            onClick={() => onPlay("recall")}
          />
        </div>
      </section>

      {/* Daily Routine Reminders */}
      <section className="bg-white/60 p-6 rounded-3xl border border-sage/60">
        <ReminderList
          reminders={state?.reminders || []}
          onToggleReminder={onToggleReminder}
        />
      </section>
    </div>
  );
}

function ActivityCard({ title, desc, domain, level, icon: Icon, color, bgAccent, onClick }) {
  return (
    <div
      onClick={onClick}
      className="group relative bg-white p-6 rounded-3xl border border-sage/80 shadow-gentle hover:shadow-floating hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className={`w-14 h-14 rounded-2xl ${bgAccent} flex items-center justify-center transition-transform group-hover:scale-105`}>
            <Icon className="w-7 h-7" style={{ color }} />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-sage-light text-pine">
            Level {level}
          </span>
        </div>

        <h3 className="font-display text-xl font-bold text-ink group-hover:text-pine transition-colors">
          {title}
        </h3>
        <p className="text-sm text-ink-soft mt-2 leading-relaxed">
          {desc}
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-sage/40 flex items-center justify-between">
        <span className="text-xs font-semibold text-ink-soft">
          {domain} Training
        </span>
        <button
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-transform group-hover:translate-x-1"
          style={{ background: color }}
        >
          <span>Play Now</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

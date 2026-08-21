"use client";

import React from "react";
import { Sparkles, Grid3x3, ListChecks, ArrowRight, HeartHandshake, Mic, Zap, TrendingDown, Star, AlertCircle } from "lucide-react";
import { DOMAIN_META, T, PATIENT_NAME } from "@/lib/constants";
import { computeTrend, getSmartRecommendation } from "@/lib/cognitiveEngine";
import { getTranslation } from "@/lib/nerCulture";
import WellbeingRing from "./WellbeingRing";
import ReminderList from "./ReminderList";

/* Maps domain key → game card config */
const GAME_CONFIG = {
  memory: {
    title: "Memory Match · স্মৃতি খেল",
    desc: "Match regional symbols, Kopou orchids, rhinos & tea garden icons",
    icon: Grid3x3,
    color: T.pine,
    bgAccent: "bg-pine/10",
    domainLabel: "Memory",
  },
  attention: {
    title: "Pattern Path · ছন্দৰ সুৰ",
    desc: "Watch the rhythmic Cheraw bamboo sequence and tap in order",
    icon: Sparkles,
    color: T.marigoldDeep,
    bgAccent: "bg-marigold/15",
    domainLabel: "Attention",
  },
  recall: {
    title: "Daily Routine · দৈনন্দিন সূচী",
    desc: "Reconstruct the steps of a healthy traditional morning",
    icon: ListChecks,
    color: T.clay,
    bgAccent: "bg-clay/15",
    domainLabel: "Routine Recall",
  },
};

/* Badge styling per urgency level */
const BADGE_STYLE = {
  high:   { bg: "bg-clay-light border border-clay/40 text-clay",               icon: TrendingDown },
  medium: { bg: "bg-marigold/15 border border-marigold/40 text-marigold-deep", icon: Star },
  low:    { bg: "bg-emerald-50 border border-emerald-300 text-emerald-700",    icon: Zap },
  normal: { bg: "bg-sage-light border border-sage text-pine",                  icon: AlertCircle },
};

export default function PatientHome({ state, onPlay, onToggleReminder, onStartAssessment, language = "en" }) {
  const sessions = state?.sessions || [];
  const profile = state?.profile || {};
  const streakDays = profile.streakDays || 1;
  const overallIndex = profile.overallIndex || 80;

  // ── The core loop: engine picks the priority exercise ──
  const recommendation = getSmartRecommendation(sessions);
  const badgeStyle = BADGE_STYLE[recommendation.urgency] || BADGE_STYLE.normal;
  const BadgeIcon = badgeStyle.icon;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return getTranslation(language, "goodMorning");
    if (hour < 17) return getTranslation(language, "goodAfternoon");
    return getTranslation(language, "goodEvening");
  };

  const patientFirstName = state?.patient?.name?.split(" ")[0] || PATIENT_NAME.split(" ")[0];

  return (
    <div className="pt-6 pb-12 space-y-10">

      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white/70 backdrop-blur-sm p-6 sm:p-8 rounded-3xl border border-sage/60 shadow-gentle">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-sage-light text-pine text-xs font-semibold">
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Gentle Daily Care</span>
            </div>
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
              <span>🔥 {streakDays} {getTranslation(language, "streak")}</span>
            </div>
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
              <span>{getTranslation(language, "mindIndex")}: {overallIndex}%</span>
            </div>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink tracking-tight">
            {getGreeting()}, {patientFirstName}
          </h1>
          <p className="text-base sm:text-lg text-ink-soft mt-1">
            {getTranslation(language, "welcomeSubtitle")}
          </p>
        </div>

        {/* Action badges: Voice assistant + Baseline Assessment */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <button
            onClick={onStartAssessment}
            className="flex items-center gap-2.5 bg-ivory hover:bg-sage-light border border-sage p-3 rounded-2xl transition text-left"
            title="Calibrate your initial baseline across memory, attention & recall"
          >
            <div className="w-10 h-10 rounded-xl bg-pine flex items-center justify-center text-marigold flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="text-xs">
              <p className="font-bold text-ink">{getTranslation(language, "baselineMap")}</p>
              <p className="text-ink-soft">{getTranslation(language, "baselineRetake")}</p>
            </div>
          </button>
        </div>
      </div>

      {/* ── SMART RECOMMENDATION BANNER ─────────────────────────────── */}
      <div className={`rounded-3xl p-5 sm:p-6 flex items-center gap-4 shadow-gentle ${badgeStyle.bg}`}>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 bg-white/50">
          <BadgeIcon className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-xs font-bold uppercase tracking-wider opacity-70">
            {getTranslation(language, recommendation.badge === "Needs Attention" ? "needsAttention" : recommendation.badge === "New Activity" ? "newActivity" : recommendation.badge === "On a Roll" ? "onARoll" : "recommended")}
          </span>
          <h3 className="font-display text-lg font-bold text-ink leading-snug mt-0.5">
            {recommendation.headline}
          </h3>
          <p className="text-sm opacity-80 mt-0.5">
            {recommendation.subtext}
          </p>
        </div>
        <button
          onClick={() => onPlay(recommendation.domain)}
          className="flex-shrink-0 flex items-center gap-1.5 px-5 py-2.5 rounded-2xl text-sm font-bold text-white shadow-gentle hover:shadow-card transition-all hover:scale-105 active:scale-95"
          style={{ background: DOMAIN_META[recommendation.domain]?.color || T.pine }}
        >
          <span>{getTranslation(language, "start")}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Wellbeing Rings */}
      <section>
        <div className="mb-4">
          <h2 className="font-display text-2xl font-bold text-ink">
            {getTranslation(language, "wellbeingTitle")}
          </h2>
          <p className="text-sm text-ink-soft">
            {getTranslation(language, "wellbeingSubtitle")}
          </p>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 sm:overflow-visible">
          {Object.keys(DOMAIN_META).map((domain) => (
            <WellbeingRing
              key={domain}
              domain={domain}
              trend={computeTrend(sessions, domain)}
            />
          ))}
        </div>
      </section>

      {/* ── TODAY'S ACTIVITIES (driven by recommendation) ───────────── */}
      <section>
        <div className="mb-4">
          <h2 className="font-display text-2xl font-bold text-ink">
            {getTranslation(language, "todaysActivities")}
          </h2>
          <p className="text-sm text-ink-soft">
            {getTranslation(language, "activitiesSubtitle")}
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {Object.entries(GAME_CONFIG).map(([domainKey, cfg]) => (
            <ActivityCard
              key={domainKey}
              {...cfg}
              level={state?.difficulty?.[domainKey] || 1}
              isRecommended={recommendation.domain === domainKey}
              recommendedBadge={getTranslation(language, "recommended")}
              playNowText={getTranslation(language, "playNow")}
              levelText={getTranslation(language, "level")}
              onClick={() => onPlay(domainKey)}
            />
          ))}
        </div>
      </section>

      {/* Daily Reminders */}
      <section className="bg-white/60 p-6 rounded-3xl border border-sage/60">
        <ReminderList
          reminders={state?.reminders || []}
          onToggleReminder={onToggleReminder}
          language={language}
        />
      </section>
    </div>
  );
}

function ActivityCard({
  title, desc, domainLabel, level, icon: Icon, color, bgAccent,
  onClick, isRecommended, recommendedBadge, playNowText = "Play Now", levelText = "Level",
}) {
  return (
    <div
      onClick={onClick}
      className={`group relative bg-white p-6 rounded-3xl shadow-gentle hover:shadow-floating hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between ${
        isRecommended
          ? "border-2"
          : "border border-sage/80"
      }`}
      style={isRecommended ? { borderColor: color } : {}}
    >
      {/* Recommended badge ribbon */}
      {isRecommended && (
        <div
          className="absolute -top-3 left-5 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white shadow-gentle"
          style={{ background: color }}
        >
          <Zap className="w-3 h-3 fill-current" />
          {recommendedBadge}
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-4 mt-1">
          <div className={`w-14 h-14 rounded-2xl ${bgAccent} flex items-center justify-center transition-transform group-hover:scale-105`}>
            <Icon className="w-7 h-7" style={{ color }} />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-sage-light text-pine">
            {levelText} {level}
          </span>
        </div>

        <h3 className="font-display text-xl font-bold text-ink group-hover:text-pine transition-colors">
          {title}
        </h3>
        <p className="text-sm text-ink-soft mt-2 leading-relaxed">{desc}</p>
      </div>

      <div className="mt-6 pt-4 border-t border-sage/40 flex items-center justify-between">
        <span className="text-xs font-semibold text-ink-soft">{domainLabel}</span>
        <button
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-transform group-hover:translate-x-1"
          style={{ background: color }}
        >
          <span>{playNowText}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

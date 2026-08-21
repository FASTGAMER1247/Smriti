import { DOMAIN_META } from "./constants";

export function avg(arr) {
  if (!arr || !arr.length) return 0;
  return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
}

/**
 * Computes clinical trend based on recent and historical cognitive scores
 */
export function computeTrend(sessions, domain) {
  if (!sessions || !Array.isArray(sessions)) {
    return { status: "insufficient", recentAvg: null, priorAvg: null, diff: 0 };
  }

  const list = sessions
    .filter((s) => s.domain === domain)
    .sort((a, b) => a.timestamp - b.timestamp);

  if (list.length < 3) {
    return {
      status: "insufficient",
      recentAvg: list.length ? avg(list.slice(-3).map((s) => s.score)) : null,
      priorAvg: null,
      diff: 0,
    };
  }

  const recent = list.slice(-3);
  const prior = list.slice(-6, -3).length > 0 ? list.slice(-6, -3) : list.slice(0, -3);

  const recentAvg = avg(recent.map((s) => s.score));
  const priorAvg = avg(prior.map((s) => s.score));
  const diff = recentAvg - priorAvg;

  let status = "stable";
  if (diff <= -12) {
    status = "declining";
  } else if (diff >= 10) {
    status = "improving";
  }

  return { status, recentAvg, priorAvg, diff };
}

/**
 * Calculates adaptive difficulty adjustment
 */
export function calculateNextDifficulty(currentDifficulty, domain, score) {
  const current = currentDifficulty?.[domain] || 1;
  if (score >= 85 && current < 3) {
    return current + 1;
  }
  if (score < 50 && current > 1) {
    return current - 1;
  }
  return current;
}

/**
 * Checks for clinical decline alerts
 */
export function generateInterventionAlert(sessions, currentAlerts, domain) {
  const trend = computeTrend(sessions, domain);
  if (trend.status !== "declining") return currentAlerts;

  const THREE_DAYS_MS = 1000 * 60 * 60 * 24 * 3;
  const alreadyFlagged = currentAlerts.some(
    (a) => a.domain === domain && Date.now() - a.timestamp < THREE_DAYS_MS
  );

  if (alreadyFlagged) return currentAlerts;

  const domainLabel = DOMAIN_META[domain]?.label || domain;
  const newAlert = {
    id: `alert_${Date.now()}`,
    domain,
    severity: "warning",
    message: `${domainLabel} scores showed a notable drop from ~${trend.priorAvg}% to ~${trend.recentAvg}%. Recommended: check in with patient or schedule a gentle recall session.`,
    timestamp: Date.now(),
  };

  return [newAlert, ...currentAlerts];
}

/**
 * SMART RECOMMENDATION ENGINE — closes the Assess→Personalize loop.
 *
 * Priority hierarchy:
 *   1. DECLINING domain  → urgent, prevent further deterioration
 *   2. INSUFFICIENT data → we need a profile for this domain
 *   3. WEAKEST measured  → targeted improvement
 *   4. All stable/improving → balanced maintenance rotation
 *
 * Returns: { domain, reason, urgency, headline, subtext, gameKey }
 */
export function getSmartRecommendation(sessions, domains = ["memory", "attention", "recall"]) {
  const assessed = domains.map((domain) => ({
    domain,
    trend: computeTrend(sessions, domain),
  }));

  // ── Priority 1: Declining domains ───────────────────────────────────────
  const declining = assessed.filter((a) => a.trend.status === "declining");
  if (declining.length > 0) {
    // Pick the one with the lowest recent average (worst off)
    const worst = declining.sort((a, b) => (a.trend.recentAvg ?? 0) - (b.trend.recentAvg ?? 0))[0];
    return {
      domain: worst.domain,
      urgency: "high",
      reason: "declining",
      headline: `Let's gently work on ${DOMAIN_META[worst.domain]?.label}`,
      subtext: `Your recent scores have dipped from ~${worst.trend.priorAvg}% to ~${worst.trend.recentAvg}%. A short session now helps a lot.`,
      badge: "Needs Attention",
    };
  }

  // ── Priority 2: Domains with no data yet ────────────────────────────────
  const uncharted = assessed.filter((a) => a.trend.recentAvg === null);
  if (uncharted.length > 0) {
    const first = uncharted[0];
    return {
      domain: first.domain,
      urgency: "medium",
      reason: "new",
      headline: `Try ${DOMAIN_META[first.domain]?.label} for the first time`,
      subtext: `We don't have data for this yet — a quick round helps us understand your full cognitive profile.`,
      badge: "New Activity",
    };
  }

  // ── Priority 3: Weakest measured domain ─────────────────────────────────
  const sorted = [...assessed].sort(
    (a, b) => (a.trend.recentAvg ?? 0) - (b.trend.recentAvg ?? 0)
  );
  const weakest = sorted[0];

  // If it's improving, acknowledge that and still recommend it
  if (weakest.trend.status === "improving") {
    return {
      domain: weakest.domain,
      urgency: "low",
      reason: "improving",
      headline: `${DOMAIN_META[weakest.domain]?.label} is improving — keep it up!`,
      subtext: `Your score rose from ~${weakest.trend.priorAvg}% to ~${weakest.trend.recentAvg}%. One more session to solidify the gain.`,
      badge: "On a Roll",
    };
  }

  return {
    domain: weakest.domain,
    urgency: "normal",
    reason: "weakest",
    headline: `Focus on ${DOMAIN_META[weakest.domain]?.label} today`,
    subtext: `At ~${weakest.trend.recentAvg}%, this is your current area to strengthen. Steady practice builds resilience.`,
    badge: "Recommended",
  };
}

/**
 * Calculates consecutive active days streak from session timestamps
 */
export function calculateStreak(sessions) {
  if (!sessions || !sessions.length) return 0;

  const dates = Array.from(
    new Set(
      sessions.map((s) => new Date(s.timestamp).toISOString().split("T")[0])
    )
  ).sort().reverse();

  if (!dates.length) return 0;

  const todayStr = new Date().toISOString().split("T")[0];
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  // Must have played today or yesterday to have an active streak
  if (dates[0] !== todayStr && dates[0] !== yesterdayStr) {
    return 0;
  }

  let streak = 1;
  for (let i = 0; i < dates.length - 1; i++) {
    const current = new Date(dates[i]);
    const prev = new Date(dates[i + 1]);
    const diffDays = Math.round((current - prev) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * RICHER COGNITIVE PROFILE — Computes full domain breakdown, streaks, best/worst scores, and clinical indexes
 */
export function generateDetailedCognitiveProfile(state) {
  const sessions = state?.sessions || [];
  const domains = ["memory", "attention", "recall"];

  const domainBreakdown = {};
  let totalScoreSum = 0;
  let totalScoreCount = 0;

  domains.forEach((d) => {
    const list = sessions.filter((s) => s.domain === d).sort((a, b) => a.timestamp - b.timestamp);
    const scores = list.map((s) => s.score);
    const trend = computeTrend(sessions, d);

    const avgScore = scores.length ? avg(scores) : 0;
    const bestScore = scores.length ? Math.max(...scores) : 0;
    const worstScore = scores.length ? Math.min(...scores) : 0;
    const lastSession = list.length ? list[list.length - 1] : null;

    if (scores.length) {
      totalScoreSum += avgScore;
      totalScoreCount++;
    }

    domainBreakdown[d] = {
      domain: d,
      meta: DOMAIN_META[d],
      attemptCount: list.length,
      averageScore: avgScore,
      bestScore,
      worstScore,
      difficultyLevel: state?.difficulty?.[d] || 1,
      trend,
      lastPlayedAt: lastSession?.timestamp || null,
    };
  });

  const overallIndex = totalScoreCount > 0 ? Math.round(totalScoreSum / totalScoreCount) : 75;
  const streakDays = calculateStreak(sessions);

  // Identify highest and lowest performing domains
  const sortedByAvg = domains
    .filter((d) => domainBreakdown[d].attemptCount > 0)
    .sort((a, b) => domainBreakdown[b].averageScore - domainBreakdown[a].averageScore);

  const primaryStrength = sortedByAvg.length ? DOMAIN_META[sortedByAvg[0]].label : "Memory";
  const focusArea = sortedByAvg.length
    ? DOMAIN_META[sortedByAvg[sortedByAvg.length - 1]].label
    : "Routine Recall";

  return {
    patientName: state?.patient?.name || "Patient",
    isAssessmentCompleted: state?.profile?.isAssessmentCompleted ?? true,
    assessmentDate: state?.profile?.assessmentDate || null,
    streakDays,
    totalExercises: sessions.length,
    overallIndex,
    primaryStrength,
    focusArea,
    domainBreakdown,
  };
}

/**
 * Evaluates the 3-question Onboarding Assessment and produces initial baseline seeds
 */
export function evaluateOnboardingAssessment(answers) {
  const now = Date.now();
  // answers format: { memoryScore: 0-100, attentionScore: 0-100, recallScore: 0-100 }
  const memoryScore = Math.max(30, Math.min(100, answers.memoryScore || 80));
  const attentionScore = Math.max(30, Math.min(100, answers.attentionScore || 75));
  const recallScore = Math.max(30, Math.min(100, answers.recallScore || 70));

  const sessions = [
    { id: `init_mem_${now}`, domain: "memory", score: memoryScore, difficultyLevel: 1, timestamp: now - 3600000 * 2 },
    { id: `init_att_${now}`, domain: "attention", score: attentionScore, difficultyLevel: 1, timestamp: now - 3600000 },
    { id: `init_rec_${now}`, domain: "recall", score: recallScore, difficultyLevel: 1, timestamp: now },
  ];

  const difficulty = {
    memory: memoryScore >= 80 ? 2 : 1,
    attention: attentionScore >= 80 ? 2 : 1,
    recall: recallScore >= 80 ? 2 : 1,
  };

  const overall = Math.round((memoryScore + attentionScore + recallScore) / 3);

  const profile = {
    isAssessmentCompleted: true,
    assessmentDate: now,
    streakDays: 1,
    lastActiveDate: now,
    overallIndex: overall,
    primaryStrength: memoryScore >= attentionScore && memoryScore >= recallScore ? "Memory" : attentionScore >= recallScore ? "Attention" : "Routine Recall",
    focusArea: memoryScore <= attentionScore && memoryScore <= recallScore ? "Memory" : attentionScore <= recallScore ? "Attention" : "Routine Recall",
  };

  return { sessions, difficulty, profile };
}

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

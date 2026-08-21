import { Grid3x3, Sparkles, ListChecks } from "lucide-react";

export const T = {
  pine: "#1F4E45",
  pineDark: "#163A33",
  ivory: "#FBF7EF",
  sage: "#D7E4D2",
  sageDeep: "#AFC7A8",
  marigold: "#E2A63B",
  marigoldDeep: "#C98A22",
  clay: "#C1613F",
  ink: "#22302B",
  inkSoft: "#5A6B63",
  white: "#FFFFFF",
};

export const DOMAIN_META = {
  memory: {
    label: "Memory",
    color: T.pine,
    icon: Grid3x3,
    description: "Visual association & pattern recall",
  },
  attention: {
    label: "Attention",
    color: T.marigoldDeep,
    icon: Sparkles,
    description: "Focus, sequencing & working memory",
  },
  recall: {
    label: "Routine Recall",
    color: T.clay,
    icon: ListChecks,
    description: "Chronological daily sequence memory",
  },
};

export const STORAGE_KEY = "smriti:state:v1";

export const PATIENT_NAME = "Ratna Devi";

export const EMOJI_SET = ["🌸", "🍵", "🦋", "🌾", "🐘", "🎋", "🌙", "🐦", "🪁", "🥭"];

export const ROUTINE_ITEMS = [
  { id: "wake", label: "Wake up", emoji: "🌅" },
  { id: "brush", label: "Brush teeth", emoji: "🪥" },
  { id: "med", label: "Take morning medicine", emoji: "💊" },
  { id: "breakfast", label: "Eat breakfast", emoji: "🍚" },
  { id: "walk", label: "Morning walk", emoji: "🚶" },
  { id: "lunch", label: "Eat lunch", emoji: "🍛" },
];

export const getDefaultState = () => {
  const now = Date.now();
  const DAY = 1000 * 60 * 60 * 24;

  return {
    patient: {
      name: PATIENT_NAME,
      age: 74,
      location: "Guwahati, Assam",
      language: "en",
    },
    profile: {
      isAssessmentCompleted: true,
      assessmentDate: now - 7 * DAY,
      streakDays: 4,
      lastActiveDate: now,
      overallIndex: 82,
      primaryStrength: "Memory",
      focusArea: "Routine Recall",
    },
    sessions: [
      { id: "s_1", domain: "memory", score: 85, difficultyLevel: 1, timestamp: now - 6 * DAY },
      { id: "s_2", domain: "attention", score: 80, difficultyLevel: 1, timestamp: now - 5 * DAY },
      { id: "s_3", domain: "recall", score: 75, difficultyLevel: 1, timestamp: now - 4 * DAY },
      { id: "s_4", domain: "memory", score: 90, difficultyLevel: 1, timestamp: now - 3 * DAY },
      { id: "s_5", domain: "attention", score: 85, difficultyLevel: 2, timestamp: now - 2 * DAY },
      { id: "s_6", domain: "recall", score: 80, difficultyLevel: 1, timestamp: now - 1 * DAY },
    ],
    difficulty: {
      memory: 2,
      attention: 2,
      recall: 1,
    },
    alerts: [],
    reminders: [
      { id: "r1", icon: "pill", label: "Morning medicine (BP & Vitamin)", time: "08:00 AM", done: false },
      { id: "r2", icon: "drop", label: "Drink warm water with honey", time: "11:00 AM", done: true },
      { id: "r3", icon: "cal", label: "Evening garden walk & fresh air", time: "05:00 PM", done: false },
      { id: "r4", icon: "pill", label: "Night medicine after dinner", time: "08:30 PM", done: false },
    ],
    offlineSyncPending: false,
    lastSyncedAt: now,
  };
};

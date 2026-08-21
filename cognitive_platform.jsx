import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Brain, Grid3x3, ListChecks, ArrowLeft, Bell, Users, TrendingUp,
  TrendingDown, Minus, Pill, Droplet, CalendarClock, Sparkles, Check,
  RotateCcw, Award, AlertTriangle
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

/* ---------------------------------------------------------------------- */
/* Design tokens                                                          */
/* ---------------------------------------------------------------------- */
const T = {
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

const DOMAIN_META = {
  memory: { label: "Memory", color: T.pine, icon: Grid3x3 },
  attention: { label: "Attention", color: T.marigoldDeep, icon: Sparkles },
  recall: { label: "Routine Recall", color: T.clay, icon: ListChecks },
};

const STORAGE_KEY = "cogplatform:state";

const PATIENT_NAME = "Ratna Devi";

/* ---------------------------------------------------------------------- */
/* Storage helpers                                                        */
/* ---------------------------------------------------------------------- */
const defaultState = () => ({
  sessions: [],
  difficulty: { memory: 1, attention: 1, recall: 1 },
  alerts: [],
  reminders: [
    { id: "r1", icon: "pill", label: "Morning medicine", done: false },
    { id: "r2", icon: "drop", label: "Drink water", done: false },
    { id: "r3", icon: "cal", label: "Evening walk", done: false },
  ],
});

async function loadState() {
  try {
    const res = await window.storage.get(STORAGE_KEY, false);
    if (res && res.value) return JSON.parse(res.value);
  } catch (e) {
    /* key not found yet */
  }
  return defaultState();
}
async function saveState(state) {
  try {
    await window.storage.set(STORAGE_KEY, JSON.stringify(state), false);
  } catch (e) {
    console.error("storage save failed", e);
  }
}

/* ---------------------------------------------------------------------- */
/* Trend / monitoring engine                                              */
/* ---------------------------------------------------------------------- */
function computeTrend(sessions, domain) {
  const list = sessions.filter((s) => s.domain === domain).sort((a, b) => a.timestamp - b.timestamp);
  if (list.length < 4) return { status: "insufficient", recentAvg: list.length ? avg(list.slice(-3).map((s) => s.score)) : null };
  const recent = list.slice(-3);
  const prior = list.slice(-6, -3).length ? list.slice(-6, -3) : list.slice(0, -3);
  const recentAvg = avg(recent.map((s) => s.score));
  const priorAvg = avg(prior.map((s) => s.score));
  const diff = recentAvg - priorAvg;
  let status = "stable";
  if (diff <= -12) status = "declining";
  else if (diff >= 10) status = "improving";
  return { status, recentAvg, priorAvg, diff };
}
function avg(arr) {
  return arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
}

/* ---------------------------------------------------------------------- */
/* Root App                                                                */
/* ---------------------------------------------------------------------- */
export default function App() {
  const [state, setState] = useState(null);
  const [role, setRole] = useState("patient");
  const [screen, setScreen] = useState("home"); // home | play:<game> | results
  const [lastResult, setLastResult] = useState(null);
  const stateRef = useRef(null);

  useEffect(() => {
    (async () => {
      const s = await loadState();
      setState(s);
      stateRef.current = s;
    })();
  }, []);

  const persist = useCallback((updater) => {
    setState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      stateRef.current = next;
      saveState(next);
      return next;
    });
  }, []);

  const handleGameComplete = useCallback(
    (domain, score, difficultyLevel) => {
      persist((prev) => {
        const session = { id: `s_${Date.now()}`, domain, score, difficultyLevel, timestamp: Date.now() };
        const sessions = [...prev.sessions, session];

        // adaptive difficulty
        const difficulty = { ...prev.difficulty };
        const cur = difficulty[domain];
        if (score >= 80 && cur < 3) difficulty[domain] = cur + 1;
        else if (score < 50 && cur > 1) difficulty[domain] = cur - 1;

        // monitoring + intervention
        const trend = computeTrend(sessions, domain);
        let alerts = prev.alerts;
        if (trend.status === "declining") {
          const alreadyFlagged = alerts.some(
            (a) => a.domain === domain && Date.now() - a.timestamp < 1000 * 60 * 60 * 24 * 3
          );
          if (!alreadyFlagged) {
            alerts = [
              {
                id: `a_${Date.now()}`,
                domain,
                message: `${DOMAIN_META[domain].label} scores dropped from ~${trend.priorAvg}% to ~${trend.recentAvg}%. Consider a check-in.`,
                timestamp: Date.now(),
              },
              ...alerts,
            ];
          }
        }

        const next = { ...prev, sessions, difficulty, alerts };
        setLastResult({ domain, score, trend });
        return next;
      });
      setScreen("results");
    },
    [persist]
  );

  const toggleReminder = (id) => {
    persist((prev) => ({
      ...prev,
      reminders: prev.reminders.map((r) => (r.id === id ? { ...r, done: !r.done } : r)),
    }));
  };

  if (!state) {
    return (
      <div style={{ background: T.ivory, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontFamily: "Inter, sans-serif", color: T.inkSoft }}>Loading platform…</p>
      </div>
    );
  }

  return (
    <div style={{ background: T.ivory, minHeight: "100vh", fontFamily: "Inter, sans-serif", color: T.ink }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        .disp { font-family: 'Fraunces', serif; }
        .mono { font-family: 'IBM Plex Mono', monospace; }
        button { font-family: inherit; }
        * { box-sizing: border-box; }
      `}</style>

      <TopBar role={role} setRole={setRole} setScreen={setScreen} />

      <div className="max-w-5xl mx-auto px-6 pb-16">
        {role === "patient" ? (
          screen === "home" && <PatientHome state={state} onPlay={(g) => setScreen(`play:${g}`)} onToggleReminder={toggleReminder} />
        ) : (
          <CaregiverDashboard state={state} />
        )}

        {role === "patient" && screen.startsWith("play:") && (
          <GameRunner
            game={screen.split(":")[1]}
            difficulty={state.difficulty}
            onExit={() => setScreen("home")}
            onComplete={handleGameComplete}
          />
        )}

        {role === "patient" && screen === "results" && lastResult && (
          <ResultsScreen result={lastResult} onDone={() => setScreen("home")} />
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Top bar                                                                 */
/* ---------------------------------------------------------------------- */
function TopBar({ role, setRole, setScreen }) {
  return (
    <div style={{ background: T.pine }} className="w-full">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain size={26} color={T.marigold} />
          <span className="disp" style={{ color: T.white, fontSize: 20, fontWeight: 600 }}>
            Smriti
          </span>
          <span style={{ color: T.sageDeep, fontSize: 13 }} className="ml-1 hidden sm:inline">
            cognitive care, North East
          </span>
        </div>
        <div className="flex gap-1 rounded-full p-1" style={{ background: T.pineDark }}>
          <RoleButton active={role === "patient"} label="Patient view" onClick={() => { setRole("patient"); setScreen("home"); }} />
          <RoleButton active={role === "caregiver"} label="Caregiver view" onClick={() => { setRole("caregiver"); setScreen("home"); }} />
        </div>
      </div>
    </div>
  );
}
function RoleButton({ active, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-1.5 rounded-full text-sm font-medium transition"
      style={{
        background: active ? T.marigold : "transparent",
        color: active ? T.pineDark : T.sage,
      }}
    >
      {label}
    </button>
  );
}

/* ---------------------------------------------------------------------- */
/* Wellbeing ring — signature element                                     */
/* ---------------------------------------------------------------------- */
function WellbeingRing({ domain, trend, size = 108 }) {
  const meta = DOMAIN_META[domain];
  const pct = trend.recentAvg ?? 0;
  const r = size / 2 - 10;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  const Icon = meta.icon;
  const trendIcon =
    trend.status === "declining" ? <TrendingDown size={14} color={T.clay} /> :
    trend.status === "improving" ? <TrendingUp size={14} color={T.pine} /> :
    <Minus size={14} color={T.inkSoft} />;

  return (
    <div className="flex flex-col items-center gap-2">
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size / 2} cy={size / 2} r={r} stroke={T.sage} strokeWidth="8" fill="none" />
          <circle
            cx={size / 2} cy={size / 2} r={r}
            stroke={meta.color} strokeWidth="8" fill="none"
            strokeDasharray={c} strokeDashoffset={trend.recentAvg == null ? c : offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <Icon size={18} color={meta.color} />
          <span className="disp" style={{ fontSize: 18, fontWeight: 600, color: T.ink }}>
            {trend.recentAvg == null ? "—" : `${trend.recentAvg}%`}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <span style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{meta.label}</span>
        {trend.status !== "insufficient" && trendIcon}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Patient Home                                                            */
/* ---------------------------------------------------------------------- */
function PatientHome({ state, onPlay, onToggleReminder }) {
  const declining = Object.keys(DOMAIN_META).find(
    (d) => computeTrend(state.sessions, d).status === "declining"
  );

  return (
    <div className="pt-8">
      <h1 className="disp" style={{ fontSize: 32, fontWeight: 600, color: T.ink }}>
        Good morning, {PATIENT_NAME.split(" ")[0]}
      </h1>
      <p style={{ color: T.inkSoft, fontSize: 16, marginTop: 4 }}>Let's take care of your mind today.</p>

      {declining && (
        <div
          className="mt-5 rounded-2xl p-4 flex items-center gap-3"
          style={{ background: "#FBEAE2", border: `1px solid ${T.clay}33` }}
        >
          <Sparkles size={22} color={T.clay} />
          <p style={{ fontSize: 15, color: T.ink }}>
            Let's spend a little extra time on <strong>{DOMAIN_META[declining].label}</strong> today — a short game helps a lot.
          </p>
        </div>
      )}

      {/* wellbeing rings */}
      <div className="mt-8 flex gap-8 flex-wrap">
        {Object.keys(DOMAIN_META).map((d) => (
          <WellbeingRing key={d} domain={d} trend={computeTrend(state.sessions, d)} />
        ))}
      </div>

      {/* games */}
      <h2 className="disp mt-10" style={{ fontSize: 22, fontWeight: 600, color: T.ink }}>Today's activities</h2>
      <div className="mt-4 grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <GameCard title="Memory Match" desc="Find the matching pairs" icon={Grid3x3} color={T.pine} onClick={() => onPlay("memory")} />
        <GameCard title="Pattern Path" desc="Watch, then repeat the pattern" icon={Sparkles} color={T.marigoldDeep} onClick={() => onPlay("attention")} />
        <GameCard title="Daily Routine" desc="Put the day back in order" icon={ListChecks} color={T.clay} onClick={() => onPlay("recall")} />
      </div>

      {/* reminders */}
      <h2 className="disp mt-10" style={{ fontSize: 22, fontWeight: 600, color: T.ink }}>Reminders</h2>
      <div className="mt-4 flex flex-col gap-3">
        {state.reminders.map((r) => (
          <ReminderRow key={r.id} reminder={r} onToggle={() => onToggleReminder(r.id)} />
        ))}
      </div>
    </div>
  );
}

function ReminderRow({ reminder, onToggle }) {
  const Icon = reminder.icon === "pill" ? Pill : reminder.icon === "drop" ? Droplet : CalendarClock;
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-4 rounded-2xl px-5 py-4 text-left w-full transition"
      style={{ background: reminder.done ? T.sage : T.white, border: `1px solid ${T.sage}` }}
    >
      <div
        style={{
          width: 40, height: 40, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center",
          background: reminder.done ? T.pine : T.ivory,
        }}
      >
        {reminder.done ? <Check size={20} color={T.white} /> : <Icon size={20} color={T.pine} />}
      </div>
      <span style={{ fontSize: 17, color: T.ink, textDecoration: reminder.done ? "line-through" : "none", opacity: reminder.done ? 0.6 : 1 }}>
        {reminder.label}
      </span>
    </button>
  );
}

function GameCard({ title, desc, icon: Icon, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className="rounded-2xl p-5 text-left transition hover:-translate-y-0.5"
      style={{ background: T.white, border: `1px solid ${T.sage}`, boxShadow: "0 2px 10px rgba(31,78,69,0.06)" }}
    >
      <div style={{ width: 48, height: 48, borderRadius: 14, background: `${color}1A`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={24} color={color} />
      </div>
      <p className="disp mt-3" style={{ fontSize: 19, fontWeight: 600, color: T.ink }}>{title}</p>
      <p style={{ fontSize: 14, color: T.inkSoft, marginTop: 2 }}>{desc}</p>
    </button>
  );
}

/* ---------------------------------------------------------------------- */
/* Results screen                                                          */
/* ---------------------------------------------------------------------- */
function ResultsScreen({ result, onDone }) {
  const meta = DOMAIN_META[result.domain];
  return (
    <div className="pt-16 flex flex-col items-center text-center">
      <div style={{ width: 84, height: 84, borderRadius: 42, background: `${meta.color}1A`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Award size={40} color={meta.color} />
      </div>
      <h2 className="disp mt-5" style={{ fontSize: 28, fontWeight: 600 }}>Well done!</h2>
      <p style={{ color: T.inkSoft, marginTop: 6, fontSize: 16 }}>
        You scored <strong style={{ color: T.ink }}>{result.score}%</strong> on {meta.label}.
      </p>
      {result.trend.status === "declining" && (
        <p style={{ color: T.clay, marginTop: 10, fontSize: 14, maxWidth: 380 }}>
          Your caregiver has been gently notified so they can check in with you.
        </p>
      )}
      <button
        onClick={onDone}
        className="mt-8 px-6 py-3 rounded-full font-medium"
        style={{ background: T.pine, color: T.white, fontSize: 16 }}
      >
        Back to home
      </button>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Game runner wrapper                                                     */
/* ---------------------------------------------------------------------- */
function GameRunner({ game, difficulty, onExit, onComplete }) {
  const level = difficulty[game];
  return (
    <div className="pt-8">
      <button onClick={onExit} className="flex items-center gap-2 mb-6" style={{ color: T.inkSoft }}>
        <ArrowLeft size={18} /> Back
      </button>
      {game === "memory" && <MemoryMatchGame level={level} onComplete={(s) => onComplete("memory", s, level)} />}
      {game === "attention" && <PatternPathGame level={level} onComplete={(s) => onComplete("attention", s, level)} />}
      {game === "recall" && <DailyRoutineGame level={level} onComplete={(s) => onComplete("recall", s, level)} />}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Game 1: Memory Match                                                    */
/* ---------------------------------------------------------------------- */
const EMOJI_SET = ["🌸", "🍵", "🦋", "🌾", "🐘", "🎋", "🌙", "🐦", "🪁", "🥭"];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function MemoryMatchGame({ level, onComplete }) {
  const pairs = level === 1 ? 3 : level === 2 ? 4 : 6;
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    const chosen = EMOJI_SET.slice(0, pairs);
    setCards(shuffle([...chosen, ...chosen]).map((e, i) => ({ id: i, emoji: e })));
  }, [pairs]);

  useEffect(() => {
    if (flipped.length === 2) {
      const [a, b] = flipped;
      setMoves((m) => m + 1);
      if (cards[a].emoji === cards[b].emoji) {
        setMatched((m) => [...m, a, b]);
        setTimeout(() => setFlipped([]), 400);
      } else {
        setTimeout(() => setFlipped([]), 700);
      }
    }
  }, [flipped, cards]);

  useEffect(() => {
    if (cards.length && matched.length === cards.length) {
      const ideal = pairs;
      const accuracy = Math.max(20, Math.round(100 - (moves - ideal) * 6));
      setTimeout(() => onComplete(Math.min(100, accuracy)), 500);
    }
  }, [matched]);

  const cols = pairs <= 3 ? 3 : pairs === 4 ? 4 : 4;

  return (
    <div>
      <h3 className="disp" style={{ fontSize: 22, fontWeight: 600 }}>Memory Match</h3>
      <p style={{ color: T.inkSoft, fontSize: 14, marginTop: 2 }}>Tap two cards to find a pair. Moves: {moves}</p>
      <div className="mt-6 grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))`, maxWidth: 420 }}>
        {cards.map((c, i) => {
          const isUp = flipped.includes(i) || matched.includes(i);
          return (
            <button
              key={c.id}
              disabled={isUp || flipped.length === 2}
              onClick={() => setFlipped((f) => [...f, i])}
              className="aspect-square rounded-xl flex items-center justify-center text-3xl transition"
              style={{
                background: isUp ? T.white : T.pine,
                border: `1px solid ${T.sage}`,
              }}
            >
              {isUp ? c.emoji : ""}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Game 2: Pattern Path (Simon-style, attention)                          */
/* ---------------------------------------------------------------------- */
function PatternPathGame({ level, onComplete }) {
  const seqLen = 2 + level; // 3,4,5
  const tiles = [T.pine, T.marigold, T.clay, T.sageDeep].slice(0, 4);
  const [sequence, setSequence] = useState([]);
  const [showingIdx, setShowingIdx] = useState(-1);
  const [phase, setPhase] = useState("intro"); // intro | showing | input | done
  const [userSeq, setUserSeq] = useState([]);
  const [mistakes, setMistakes] = useState(0);

  const start = () => {
    const seq = Array.from({ length: seqLen }, () => Math.floor(Math.random() * 4));
    setSequence(seq);
    setUserSeq([]);
    setMistakes(0);
    setPhase("showing");
  };

  useEffect(() => {
    if (phase !== "showing") return;
    let i = 0;
    setShowingIdx(sequence[0]);
    const iv = setInterval(() => {
      i++;
      if (i >= sequence.length) {
        clearInterval(iv);
        setShowingIdx(-1);
        setPhase("input");
      } else {
        setShowingIdx(sequence[i]);
      }
    }, 800);
    return () => clearInterval(iv);
  }, [phase, sequence]);

  const tap = (idx) => {
    if (phase !== "input") return;
    const next = [...userSeq, idx];
    setUserSeq(next);
    if (sequence[next.length - 1] !== idx) {
      setMistakes((m) => m + 1);
    }
    if (next.length === sequence.length) {
      const correctCount = next.filter((v, i) => v === sequence[i]).length;
      const accuracy = Math.round((correctCount / sequence.length) * 100);
      setPhase("done");
      setTimeout(() => onComplete(accuracy), 500);
    }
  };

  return (
    <div>
      <h3 className="disp" style={{ fontSize: 22, fontWeight: 600 }}>Pattern Path</h3>
      <p style={{ color: T.inkSoft, fontSize: 14, marginTop: 2 }}>
        {phase === "intro" && "Watch the pattern, then repeat it in the same order."}
        {phase === "showing" && "Watch closely…"}
        {phase === "input" && "Now tap the tiles in the same order."}
        {phase === "done" && "Great effort!"}
      </p>
      {phase === "intro" ? (
        <button onClick={start} className="mt-6 px-6 py-3 rounded-full font-medium" style={{ background: T.pine, color: T.white }}>
          Start
        </button>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3" style={{ maxWidth: 300 }}>
          {tiles.map((color, idx) => (
            <button
              key={idx}
              onClick={() => tap(idx)}
              disabled={phase !== "input"}
              className="aspect-square rounded-2xl transition"
              style={{
                background: color,
                opacity: showingIdx === idx ? 1 : phase === "showing" ? 0.35 : 0.85,
                transform: showingIdx === idx ? "scale(1.05)" : "scale(1)",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Game 3: Daily Routine Recall                                            */
/* ---------------------------------------------------------------------- */
const ROUTINE_ITEMS = [
  { id: "wake", label: "Wake up", emoji: "🌅" },
  { id: "brush", label: "Brush teeth", emoji: "🪥" },
  { id: "med", label: "Take medicine", emoji: "💊" },
  { id: "breakfast", label: "Eat breakfast", emoji: "🍚" },
  { id: "walk", label: "Morning walk", emoji: "🚶" },
  { id: "lunch", label: "Eat lunch", emoji: "🍛" },
];

function DailyRoutineGame({ level, onComplete }) {
  const count = level === 1 ? 4 : level === 2 ? 5 : 6;
  const [ordered, setOrdered] = useState([]);
  const [shuffled, setShuffled] = useState([]);
  const [chosen, setChosen] = useState([]);
  const [phase, setPhase] = useState("intro");

  const start = () => {
    const items = ROUTINE_ITEMS.slice(0, count);
    setOrdered(items);
    setShuffled(shuffle(items));
    setChosen([]);
    setPhase("showing");
    setTimeout(() => setPhase("input"), 2800);
  };

  const pick = (item) => {
    if (chosen.find((c) => c.id === item.id)) return;
    const next = [...chosen, item];
    setChosen(next);
    if (next.length === ordered.length) {
      const correctCount = next.filter((v, i) => v.id === ordered[i].id).length;
      const accuracy = Math.round((correctCount / ordered.length) * 100);
      setTimeout(() => onComplete(accuracy), 500);
    }
  };

  return (
    <div>
      <h3 className="disp" style={{ fontSize: 22, fontWeight: 600 }}>Daily Routine</h3>
      <p style={{ color: T.inkSoft, fontSize: 14, marginTop: 2 }}>
        {phase === "intro" && "Remember the order of the morning, then rebuild it."}
        {phase === "showing" && "Remember this order…"}
        {phase === "input" && "Tap the steps in the correct order."}
      </p>
      {phase === "intro" && (
        <button onClick={start} className="mt-6 px-6 py-3 rounded-full font-medium" style={{ background: T.pine, color: T.white }}>
          Start
        </button>
      )}
      {phase === "showing" && (
        <div className="mt-6 flex flex-col gap-2" style={{ maxWidth: 320 }}>
          {ordered.map((item, i) => (
            <div key={item.id} className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: T.white, border: `1px solid ${T.sage}` }}>
              <span style={{ color: T.inkSoft, fontSize: 13 }}>{i + 1}.</span>
              <span style={{ fontSize: 22 }}>{item.emoji}</span>
              <span style={{ fontSize: 16 }}>{item.label}</span>
            </div>
          ))}
        </div>
      )}
      {phase === "input" && (
        <>
          <div className="mt-4 flex gap-2 flex-wrap">
            {chosen.map((c, i) => (
              <div key={c.id} className="rounded-full px-3 py-1 text-sm" style={{ background: T.sage }}>
                {i + 1}. {c.emoji} {c.label}
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-3" style={{ gridTemplateColumns: "repeat(2, minmax(0,1fr))", maxWidth: 340 }}>
            {shuffled.map((item) => {
              const done = chosen.find((c) => c.id === item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => pick(item)}
                  disabled={!!done}
                  className="flex items-center gap-2 rounded-xl px-4 py-3 text-left"
                  style={{ background: done ? T.sage : T.white, border: `1px solid ${T.sage}`, opacity: done ? 0.5 : 1 }}
                >
                  <span style={{ fontSize: 20 }}>{item.emoji}</span>
                  <span style={{ fontSize: 15 }}>{item.label}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Caregiver Dashboard                                                     */
/* ---------------------------------------------------------------------- */
function CaregiverDashboard({ state }) {
  const domains = Object.keys(DOMAIN_META);
  const trends = Object.fromEntries(domains.map((d) => [d, computeTrend(state.sessions, d)]));

  // build merged chart data
  const maxLen = Math.max(0, ...domains.map((d) => state.sessions.filter((s) => s.domain === d).length));
  const chartData = Array.from({ length: maxLen }, (_, i) => {
    const row = { session: i + 1 };
    domains.forEach((d) => {
      const list = state.sessions.filter((s) => s.domain === d);
      row[d] = list[i] ? list[i].score : null;
    });
    return row;
  });

  const thisWeek = state.sessions.filter((s) => Date.now() - s.timestamp < 1000 * 60 * 60 * 24 * 7).length;

  return (
    <div className="pt-8">
      <div className="flex items-center gap-3">
        <div style={{ width: 52, height: 52, borderRadius: 26, background: T.sage, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Users size={24} color={T.pine} />
        </div>
        <div>
          <h1 className="disp" style={{ fontSize: 24, fontWeight: 600 }}>{PATIENT_NAME}</h1>
          <p style={{ color: T.inkSoft, fontSize: 14 }}>{thisWeek} sessions this week · {state.sessions.length} total logged</p>
        </div>
      </div>

      <div className="mt-8 flex gap-8 flex-wrap">
        {domains.map((d) => (
          <WellbeingRing key={d} domain={d} trend={trends[d]} />
        ))}
      </div>

      <h2 className="disp mt-10" style={{ fontSize: 20, fontWeight: 600 }}>Performance over time</h2>
      <div className="mt-4 rounded-2xl p-4" style={{ background: T.white, border: `1px solid ${T.sage}`, height: 260 }}>
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center" style={{ color: T.inkSoft, fontSize: 14 }}>
            No sessions logged yet — scores will appear here once activities are played.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid stroke={T.sage} strokeDasharray="3 3" />
              <XAxis dataKey="session" tick={{ fontSize: 12, fill: T.inkSoft }} label={{ value: "Session #", position: "insideBottom", offset: -3, fontSize: 12, fill: T.inkSoft }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: T.inkSoft }} />
              <Tooltip contentStyle={{ fontFamily: "Inter, sans-serif", fontSize: 13, borderRadius: 8, border: `1px solid ${T.sage}` }} />
              {domains.map((d) => (
                <Line key={d} type="monotone" dataKey={d} name={DOMAIN_META[d].label} stroke={DOMAIN_META[d].color} strokeWidth={2.5} dot={{ r: 3 }} connectNulls />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <h2 className="disp mt-10" style={{ fontSize: 20, fontWeight: 600 }}>Alerts</h2>
      <div className="mt-4 flex flex-col gap-3">
        {state.alerts.length === 0 && (
          <p style={{ color: T.inkSoft, fontSize: 14 }}>No alerts right now — everything looks steady.</p>
        )}
        {state.alerts.map((a) => (
          <div key={a.id} className="flex items-start gap-3 rounded-2xl p-4" style={{ background: "#FBEAE2", border: `1px solid ${T.clay}33` }}>
            <AlertTriangle size={20} color={T.clay} style={{ marginTop: 2 }} />
            <div>
              <p style={{ fontSize: 14, color: T.ink }}>{a.message}</p>
              <p className="mono" style={{ fontSize: 11, color: T.inkSoft, marginTop: 4 }}>
                {new Date(a.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

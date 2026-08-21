"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import TopBar from "@/components/layout/TopBar";
import PatientHome from "@/components/patient/PatientHome";
import CaregiverDashboard from "@/components/caregiver/CaregiverDashboard";
import GameRunner from "@/components/games/GameRunner";
import ResultsScreen from "@/components/games/ResultsScreen";
import { loadAppState, saveAppState } from "@/lib/storage";
import {
  computeTrend,
  calculateNextDifficulty,
  generateInterventionAlert,
} from "@/lib/cognitiveEngine";
import { Brain } from "lucide-react";
import { T } from "@/lib/constants";

export default function SmritiApp() {
  const [state, setState] = useState(null);
  const [role, setRole] = useState("patient"); // "patient" | "caregiver"
  const [screen, setScreen] = useState("home"); // "home" | "play:memory" | "play:attention" | "play:recall" | "results"
  const [lastResult, setLastResult] = useState(null);
  const stateRef = useRef(null);

  // Load state on initial mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      const data = await loadAppState();
      if (mounted) {
        setState(data);
        stateRef.current = data;
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Safe state updater with storage sync
  const updateState = useCallback((updater) => {
    setState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      stateRef.current = next;
      saveAppState(next);
      return next;
    });
  }, []);

  // Game completion handler
  const handleGameComplete = useCallback(
    (domain, score, currentLevel) => {
      updateState((prev) => {
        const session = {
          id: `s_${Date.now()}`,
          domain,
          score,
          difficultyLevel: currentLevel,
          timestamp: Date.now(),
        };
        const sessions = [...prev.sessions, session];

        // 1. Adaptive AI Difficulty update
        const nextDifficultyLevel = calculateNextDifficulty(
          prev.difficulty,
          domain,
          score
        );
        const difficulty = {
          ...prev.difficulty,
          [domain]: nextDifficultyLevel,
        };

        // 2. Trend & Alert monitoring
        const trend = computeTrend(sessions, domain);
        const alerts = generateInterventionAlert(sessions, prev.alerts, domain);

        const next = {
          ...prev,
          sessions,
          difficulty,
          alerts,
        };

        setLastResult({ domain, score, trend });
        return next;
      });

      setScreen("results");
    },
    [updateState]
  );

  // Reminder toggle
  const handleToggleReminder = useCallback(
    (reminderId) => {
      updateState((prev) => ({
        ...prev,
        reminders: prev.reminders.map((r) =>
          r.id === reminderId ? { ...r, done: !r.done } : r
        ),
      }));
    },
    [updateState]
  );

  // Loading state
  if (!state) {
    return (
      <div className="min-h-screen bg-ivory flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-pine flex items-center justify-center text-marigold animate-bounce shadow-card">
          <Brain className="w-8 h-8" />
        </div>
        <h2 className="font-display text-2xl font-bold text-ink mt-4">
          Smriti · স্মৃতি
        </h2>
        <p className="text-sm text-ink-soft mt-1">
          Loading cognitive care platform...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory text-ink flex flex-col selection:bg-marigold/30">
      {/* Navigation TopBar */}
      <TopBar role={role} setRole={setRole} setScreen={setScreen} />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6">
        {/* Patient Views */}
        {role === "patient" && (
          <>
            {screen === "home" && (
              <PatientHome
                state={state}
                onPlay={(gameKey) => setScreen(`play:${gameKey}`)}
                onToggleReminder={handleToggleReminder}
              />
            )}

            {screen.startsWith("play:") && (
              <GameRunner
                game={screen.split(":")[1]}
                difficulty={state.difficulty}
                onExit={() => setScreen("home")}
                onComplete={handleGameComplete}
              />
            )}

            {screen === "results" && lastResult && (
              <ResultsScreen
                result={lastResult}
                onDone={() => setScreen("home")}
              />
            )}
          </>
        )}

        {/* Caregiver View */}
        {role === "caregiver" && <CaregiverDashboard state={state} />}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-sage/60 py-6 text-center text-xs text-ink-soft">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Smriti · AI Cognitive Care Platform for North East India</span>
          <span className="text-pine font-medium">
            Culturally-tailored digital therapeutics & caregiver support
          </span>
        </div>
      </footer>
    </div>
  );
}

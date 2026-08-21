"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  AlertTriangle,
  Calendar,
  MapPin,
  Clock,
  TrendingUp,
  Activity,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { DOMAIN_META, T, PATIENT_NAME } from "@/lib/constants";
import { computeTrend } from "@/lib/cognitiveEngine";
import WellbeingRing from "../patient/WellbeingRing";

export default function CaregiverDashboard({ state }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const domains = Object.keys(DOMAIN_META);
  const trends = Object.fromEntries(
    domains.map((d) => [d, computeTrend(state?.sessions || [], d)])
  );

  // Group sessions into chart data
  const sessions = state?.sessions || [];
  const maxLen = Math.max(
    0,
    ...domains.map((d) => sessions.filter((s) => s.domain === d).length)
  );

  const chartData = Array.from({ length: maxLen }, (_, i) => {
    const row = { session: `Session ${i + 1}`, sessionNum: i + 1 };
    domains.forEach((d) => {
      const list = sessions.filter((s) => s.domain === d);
      row[d] = list[i] ? list[i].score : null;
    });
    return row;
  });

  const oneWeekAgo = Date.now() - 1000 * 60 * 60 * 24 * 7;
  const sessionsThisWeek = sessions.filter((s) => s.timestamp > oneWeekAgo).length;
  const patient = state?.patient || { name: PATIENT_NAME, age: 74, location: "Guwahati, Assam" };

  return (
    <div className="pt-6 pb-16 space-y-10">
      {/* Patient Clinical Profile Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-sage shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-pine flex items-center justify-center text-marigold shadow-gentle">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink">
                {patient.name}
              </h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Active Monitoring
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs sm:text-sm text-ink-soft mt-1.5">
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-pine" />
                {patient.location || "North East Region"}
              </span>
              <span>•</span>
              <span>Age: {patient.age || 74}</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-marigold-deep" />
                {sessionsThisWeek} sessions this week ({sessions.length} total)
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-ivory border border-sage p-3 rounded-2xl text-right">
            <p className="text-xs text-ink-soft">Caregiver Sync</p>
            <p className="text-sm font-bold text-pine flex items-center justify-end gap-1 mt-0.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Up to date
            </p>
          </div>
        </div>
      </div>

      {/* Domain Wellbeing Status */}
      <section>
        <div className="mb-4">
          <h2 className="font-display text-2xl font-bold text-ink">
            Current Cognitive Status
          </h2>
          <p className="text-sm text-ink-soft">
            Aggregated moving averages across primary cognitive domains
          </p>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 sm:overflow-visible">
          {domains.map((d) => (
            <WellbeingRing key={d} domain={d} trend={trends[d]} />
          ))}
        </div>
      </section>

      {/* Longitudinal Analytics Chart */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-sage shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="font-display text-2xl font-bold text-ink">
              Longitudinal Performance Trends
            </h2>
            <p className="text-sm text-ink-soft">
              Session-by-session scores tracking cognitive trajectory
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold text-ink-soft">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ background: T.pine }} />
              Memory
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ background: T.marigoldDeep }} />
              Attention
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ background: T.clay }} />
              Routine Recall
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          {!mounted ? (
            <div className="h-full flex items-center justify-center text-sm text-ink-soft">
              Loading analytics chart...
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-sm text-ink-soft bg-ivory/50 rounded-2xl border border-dashed border-sage">
              <Sparkles className="w-8 h-8 text-sage-deep mb-2" />
              <p>No activity sessions recorded yet.</p>
              <p className="text-xs text-ink-muted mt-1">Play an activity in Patient View to view analytics.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="#EBF2E8" strokeDasharray="4 4" />
                <XAxis
                  dataKey="session"
                  tick={{ fontSize: 12, fill: T.inkSoft }}
                  stroke={T.sageDeep}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 12, fill: T.inkSoft }}
                  stroke={T.sageDeep}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "16px",
                    border: `1px solid ${T.sage}`,
                    boxShadow: "0 4px 20px rgba(31, 78, 69, 0.08)",
                    fontSize: "13px",
                    fontFamily: "Inter, sans-serif",
                  }}
                />
                {domains.map((d) => (
                  <Line
                    key={d}
                    type="monotone"
                    dataKey={d}
                    name={DOMAIN_META[d].label}
                    stroke={DOMAIN_META[d].color}
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2, fill: "#FFFFFF" }}
                    activeDot={{ r: 7 }}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* Clinical Alerts & Intervention Recommendations */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-sage shadow-card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl font-bold text-ink">
              Clinical Care Alerts & Check-ins
            </h2>
            <p className="text-sm text-ink-soft">
              Early warning notices triggered by drop in cognitive accuracy
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-sage-light text-pine">
            {state?.alerts?.length || 0} Alerts
          </span>
        </div>

        {(!state?.alerts || state.alerts.length === 0) ? (
          <div className="flex items-center gap-4 p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/60">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 flex-shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">No Urgent Concerns Detected</p>
              <p className="text-xs text-ink-soft mt-0.5">
                Cognitive performance across all 3 domains is steady. Continue encouraging daily engagement.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {state.alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-start gap-4 p-4 sm:p-5 rounded-2xl bg-clay-light border border-clay/30"
              >
                <div className="w-10 h-10 rounded-xl bg-clay/20 flex items-center justify-center text-clay flex-shrink-0 mt-0.5">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-ink">
                      {DOMAIN_META[alert.domain]?.label || alert.domain} Attention Needed
                    </p>
                    <span className="text-[11px] font-mono text-ink-soft">
                      {new Date(alert.timestamp).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-ink-soft mt-1 leading-relaxed">
                    {alert.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

"use client";

import React from "react";
import { Pill, Droplet, CalendarClock, Check, Clock } from "lucide-react";
import { T } from "@/lib/constants";
import { getTranslation } from "@/lib/nerCulture";

export default function ReminderList({ reminders = [], onToggleReminder, language = "en" }) {
  const getIcon = (type) => {
    switch (type) {
      case "pill":
        return Pill;
      case "drop":
        return Droplet;
      case "cal":
      default:
        return CalendarClock;
    }
  };

  const completedCount = reminders.filter((r) => r.done).length;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink">
            {getTranslation(language, "dailyReminders")}
          </h2>
          <p className="text-sm text-ink-soft">
            {getTranslation(language, "remindersSubtitle")}
          </p>
        </div>
        <div className="px-3.5 py-1 rounded-full bg-sage-light border border-sage text-xs font-semibold text-pine">
          {completedCount} of {reminders.length} {getTranslation(language, "completed")}
        </div>
      </div>

      <div className="grid gap-3">
        {reminders.map((reminder) => {
          const Icon = getIcon(reminder.icon);
          return (
            <button
              key={reminder.id}
              onClick={() => onToggleReminder(reminder.id)}
              className={`flex items-center justify-between w-full p-4 sm:p-5 rounded-2xl border transition-all duration-200 text-left ${
                reminder.done
                  ? "bg-sage/40 border-sage text-ink-soft opacity-75 shadow-none"
                  : "bg-white border-sage/80 text-ink shadow-gentle hover:shadow-card hover:-translate-y-0.5"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                    reminder.done
                      ? "bg-pine text-white"
                      : "bg-sage-light text-pine border border-sage/60"
                  }`}
                >
                  {reminder.done ? (
                    <Check className="w-6 h-6 stroke-[3]" />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <p
                    className={`text-lg font-semibold tracking-tight ${
                      reminder.done ? "line-through text-ink-soft" : "text-ink"
                    }`}
                  >
                    {reminder.label}
                  </p>
                  {reminder.time && (
                    <span className="inline-flex items-center gap-1 text-xs text-ink-soft mt-0.5">
                      <Clock className="w-3 h-3" />
                      {reminder.time}
                    </span>
                  )}
                </div>
              </div>

              <div
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider ${
                  reminder.done
                    ? "bg-sage text-pine-dark"
                    : "bg-ivory border border-sage text-pine hover:bg-sage-light"
                }`}
              >
                {reminder.done ? getTranslation(language, "completed") : getTranslation(language, "tapToDone")}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

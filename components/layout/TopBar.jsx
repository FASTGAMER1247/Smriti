"use client";

import React, { useState, useRef, useEffect } from "react";
import { Brain, Users, Sparkles, Globe, ChevronDown, Check } from "lucide-react";
import { T } from "@/lib/constants";
import { SUPPORTED_LANGUAGES, getTranslation } from "@/lib/nerCulture";

export default function TopBar({ role, setRole, setScreen, language = "en", onLanguageChange }) {
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const activeLang = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="w-full shadow-sm sticky top-0 z-50" style={{ background: T.pine }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        {/* Brand & North East Mission */}
        <div 
          onClick={() => setScreen("home")}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/10 group-hover:bg-white/15 transition shadow-sm">
            <Brain className="w-6 h-6 text-marigold animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-2xl font-bold tracking-tight text-white">
                {getTranslation(language, "appTitle")}
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/15 text-sage-deep">
                {activeLang.nativeName}
              </span>
            </div>
            <p className="text-xs text-sage-deep hidden sm:block">
              {getTranslation(language, "tagline")}
            </p>
          </div>
        </div>

        {/* Status indicator, Regional Language Selector, & Role Switcher */}
        <div className="flex items-center gap-2.5">
          {/* Regional Language Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/25 hover:bg-black/35 text-xs text-sage hover:text-white transition border border-white/10"
              title="Change North Eastern Regional Language"
            >
              <Globe className="w-3.5 h-3.5 text-marigold" />
              <span className="font-medium hidden md:inline">{activeLang.nativeName}</span>
              <span className="font-medium md:hidden">{activeLang.code.toUpperCase()}</span>
              <ChevronDown className="w-3 h-3 text-sage" />
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-floating border border-sage/80 py-2 z-50 animate-in fade-in-50 zoom-in-95">
                <div className="px-3 py-1.5 border-b border-sage/40 text-[11px] font-bold text-ink-soft uppercase tracking-wider">
                  Select Regional Language (NER)
                </div>
                <div className="max-h-64 overflow-y-auto py-1">
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        onLanguageChange(lang.code);
                        setLangMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition ${
                        language === lang.code
                          ? "bg-sage-light font-bold text-pine"
                          : "text-ink hover:bg-ivory"
                      }`}
                    >
                      <div>
                        <p className="font-semibold text-sm">{lang.nativeName}</p>
                        <p className="text-[10px] text-ink-soft">{lang.label} · {lang.region}</p>
                      </div>
                      {language === lang.code && <Check className="w-4 h-4 text-pine" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/20 text-xs text-sage font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>{getTranslation(language, "offlineReady")}</span>
          </div>

          {/* Role Switcher */}
          <div 
            className="flex p-1 rounded-full gap-1 border border-white/10" 
            style={{ background: T.pineDark }}
          >
            <button
              onClick={() => {
                setRole("patient");
                setScreen("home");
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                role === "patient"
                  ? "bg-marigold text-pine-dark shadow-sm"
                  : "text-sage hover:text-white"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{getTranslation(language, "patientView")}</span>
            </button>
            <button
              onClick={() => {
                setRole("caregiver");
                setScreen("home");
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                role === "caregiver"
                  ? "bg-marigold text-pine-dark shadow-sm"
                  : "text-sage hover:text-white"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{getTranslation(language, "caregiverView")}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

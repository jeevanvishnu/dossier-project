"use client";

import React from "react";
import { Link } from "../../../i18n/routing";
import {
  ShieldCheck,
  Lightning,
  Clock,
  CurrencyCircleDollar,
  UserCheck,
  Pill,
  ArrowRight,
  Sparkle,
  FileCode,
} from "@phosphor-icons/react";
import { useAuthModal } from "../../components/AuthModalContext";
import { Footer } from "../../components/Footer";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";
import { useTranslations } from "next-intl";

export default function StartPage() {
  const tHero = useTranslations("hero");
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");
  const tAuth = useTranslations("auth");
  const { openAuthModal } = useAuthModal();

  return (
    <div className="min-h-screen bg-bg text-secondary flex flex-col font-sans">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 bg-bg/90 backdrop-blur-md border-b border-border h-16">
        <div className="w-full px-4 md:px-8 h-full flex items-center justify-between">
          <Link href="/start" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-accent/20 border border-accent/40 text-accent flex items-center justify-center font-bold text-xl">
              <Pill size={22} weight="fill" />
            </div>
            <div>
              <span className="font-lexend font-bold text-lg text-primary tracking-tight block leading-none">
                {tNav("portal")}
              </span>
              <span className="text-[10px] text-muted font-semibold uppercase tracking-wider">
                Kazakhstan Regulatory Dossier
              </span>
            </div>
          </Link>

          {/* Nav Anchors */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold">
            <a href="#features" className="text-secondary hover:text-accent transition-colors">
              Features
            </a>
            <a href="#about" className="text-secondary hover:text-accent transition-colors">
              {tNav("about")}
            </a>
            <a href="#tariffs" className="text-secondary hover:text-accent transition-colors">
              {tNav("pricing")}
            </a>
            <a href="#process" className="text-secondary hover:text-accent transition-colors">
              Process
            </a>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher compact />

            <button
              onClick={() => openAuthModal("signin")}
              className="px-4 py-2 text-xs font-bold text-primary hover:text-accent transition-colors cursor-pointer"
            >
              {tCommon("signIn")}
            </button>
            <button
              onClick={() => openAuthModal("signup")}
              className="px-4 py-2 text-xs font-bold bg-accent hover:bg-accent-hover text-white rounded-lg transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <span>{tHero("startProject")}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-4 md:px-8 border-b border-border overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-accent/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/25 text-accent text-xs font-semibold mb-6">
            <Sparkle size={14} />
            <span>Official Kazakhstan Medical & Regulatory Submission Portal</span>
          </div>

          <h1 className="font-lexend text-3xl sm:text-4xl md:text-5xl font-extrabold text-primary tracking-tight leading-tight mb-6">
            {tHero("title")}
          </h1>

          <p className="text-base sm:text-lg text-secondary leading-relaxed max-w-2xl mx-auto mb-8">
            {tHero("description")}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => openAuthModal("signup")}
              className="px-6 py-3 bg-accent hover:bg-accent-hover text-white font-bold text-sm rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>{tHero("startProject")}</span>
              <ArrowRight size={16} />
            </button>
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-surface hover:bg-surface-raised border border-border text-primary font-bold text-sm rounded-xl transition-all"
            >
              {tNav("dashboard")}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

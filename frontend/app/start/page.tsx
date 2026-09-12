"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Globe,
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
import { useAuthModal } from "../components/AuthModalContext";
import { Footer } from "../components/Footer";

export default function StartPage() {
  const { openAuthModal } = useAuthModal();
  const [language, setLanguage] = useState<"EN" | "RU" | "KK">("EN");

  const tariffs = [
    { name: "Tariff S", storage: "Up to 50 Records", price: "45,000 KZT / mo", tag: "Small Portfolios" },
    { name: "Tariff M", storage: "Up to 200 Records", price: "115,000 KZT / mo", tag: "Growing Pharma", recommended: true },
    { name: "Tariff L", storage: "Up to 500 Records", price: "250,000 KZT / mo", tag: "Enterprise" },
    { name: "Tariff XL", storage: "Up to 1,200 Records", price: "480,000 KZT / mo", tag: "High Volume" },
    { name: "Tariff OWN (Unlimited)", storage: "Unlimited Storage & Sequences", price: "Annual Custom Lease", tag: "Dedicated Infrastructure", accent: true },
  ];

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
                ECTC Platform
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
              About Portal
            </a>
            <a href="#tariffs" className="text-secondary hover:text-accent transition-colors">
              Tariffs and Pricing
            </a>
            <a href="#process" className="text-secondary hover:text-accent transition-colors">
              Our Process
            </a>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <div className="flex items-center gap-1 bg-surface border border-border rounded-lg px-2 py-1 text-xs">
              <Globe className="text-accent" size={14} />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as "EN" | "RU" | "KK")}
                className="bg-transparent text-primary outline-none font-semibold text-xs cursor-pointer"
              >
                <option value="EN" className="bg-surface">EN</option>
                <option value="RU" className="bg-surface">RU</option>
                <option value="KK" className="bg-surface">KK</option>
              </select>
            </div>

            <button
              onClick={() => openAuthModal("signin")}
              className="px-4 py-2 text-xs font-bold text-primary hover:text-accent transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => openAuthModal("signup")}
              className="px-4 py-2 text-xs font-bold bg-accent hover:bg-accent-hover text-white rounded-lg transition-all shadow-sm flex items-center gap-1.5"
            >
              <span>Get Started</span>
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
            Streamlined Pharmaceutical Dossier & Regulatory Submission Platform
          </h1>

          <p className="text-base sm:text-lg text-secondary leading-relaxed max-w-2xl mx-auto mb-8">
            Manage your contracts, track subscriptions, and seamlessly handle compliant regulatory workflows—all in one secure workspace tailored for Kazakhstan regulatory standards.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => openAuthModal("signup")}
              className="px-6 py-3 bg-accent hover:bg-accent-hover text-white font-bold text-sm rounded-xl shadow-sm transition-all flex items-center gap-2"
            >
              <span>Start Registration</span>
              <ArrowRight size={16} />
            </button>
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-surface hover:bg-surface-raised border border-border text-primary font-bold text-sm rounded-xl transition-all"
            >
              Explore Demo Workspace
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section id="features" className="py-16 px-4 md:px-8 w-full">
        <div className="text-center mb-12">
          <h2 className="font-lexend text-2xl md:text-3xl font-bold text-primary mb-3">
            Why Leading Pharma Companies Choose ECTC
          </h2>
          <p className="text-secondary text-sm max-w-xl mx-auto">
            Engineered specifically to solve compliance friction, speed up approval sequences, and safeguard multi-country product submissions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-surface border border-border hover:border-accent/40 rounded-2xl p-6 transition-all shadow-sm group">
            <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 text-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Globe size={24} />
            </div>
            <h3 className="font-lexend font-bold text-base text-primary mb-2">The First Web Portal</h3>
            <p className="text-xs text-secondary leading-relaxed">
              The first Web portal in Kazakhstan dedicated to the automated formation and validation of registration dossiers.
            </p>
          </div>

          <div className="bg-surface border border-border hover:border-accent/40 rounded-2xl p-6 transition-all shadow-sm group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Clock size={24} />
            </div>
            <h3 className="font-lexend font-bold text-base text-primary mb-2">24/7 Access</h3>
            <p className="text-xs text-secondary leading-relaxed">
              All you need for work is the Internet. Access your active contracts, dossiers, and audit trails securely anywhere.
            </p>
          </div>

          <div className="bg-surface border border-border hover:border-accent/40 rounded-2xl p-6 transition-all shadow-sm group">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <CurrencyCircleDollar size={24} />
            </div>
            <h3 className="font-lexend font-bold text-base text-primary mb-2">Advantageous Tariff</h3>
            <p className="text-xs text-secondary leading-relaxed">
              Allows you to plan costs strictly according to the precise size and record volume of your dossier portfolio.
            </p>
          </div>

          <div className="bg-surface border border-border hover:border-accent/40 rounded-2xl p-6 transition-all shadow-sm group">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <UserCheck size={24} />
            </div>
            <h3 className="font-lexend font-bold text-base text-primary mb-2">User-Friendly Interface</h3>
            <p className="text-xs text-secondary leading-relaxed">
              Designed for rapid user adaptability with intuitive multi-category document trees, sequence tagging, and MD5 tracking.
            </p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 px-4 md:px-8 bg-surface-raised/40 border-y border-border">
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-bold text-accent uppercase tracking-wider block mb-2">About ECTC Platform</span>
            <h2 className="font-lexend text-2xl md:text-3xl font-bold text-primary mb-4 leading-snug">
              Bridging Complex Regulatory Requirements with Efficient Digital Workflows
            </h2>
            <p className="text-sm text-secondary leading-relaxed mb-4">
              The ECTC platform was designed in direct collaboration with pharmaceutical regulatory specialists in Kazakhstan. We simplify the transition from manual, error-prone filing to standardized electronic registration dossiers (eCTD).
            </p>
            <p className="text-sm text-secondary leading-relaxed mb-6">
              Whether you are submitting as a Reference Member State or managing multi-country product extensions, our structured workspace guarantees sequence integrity, document MD5 checksum verification, and transparent billing.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-bg p-3.5 rounded-xl border border-border">
                <ShieldCheck className="text-accent mb-1" size={20} />
                <span className="text-xs font-bold text-primary block">Compliance Certified</span>
                <span className="text-[10px] text-muted">Kazakhstan & EAEU Standards</span>
              </div>
              <div className="bg-bg p-3.5 rounded-xl border border-border">
                <Lightning className="text-amber-500 mb-1" size={20} />
                <span className="text-xs font-bold text-primary block">Instant Generation</span>
                <span className="text-[10px] text-muted">XML & Subtree Packaging</span>
              </div>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-6 shadow-md space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-border">
              <FileCode size={24} className="text-accent" />
              <div>
                <p className="text-xs font-bold text-primary">Automated eCTD Structure</p>
                <p className="text-[10px] text-muted">Module 1 - Module 5 XML Tree Generator</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="p-2.5 rounded-lg bg-bg text-xs flex items-center justify-between">
                <span className="text-primary font-medium">Admin Information (Module 1)</span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded font-semibold">Validated</span>
              </div>
              <div className="p-2.5 rounded-lg bg-bg text-xs flex items-center justify-between">
                <span className="text-primary font-medium">Quality Overall Summary (Resume)</span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded font-semibold">Validated</span>
              </div>
              <div className="p-2.5 rounded-lg bg-bg text-xs flex items-center justify-between">
                <span className="text-primary font-medium">Nonclinical / Clinical Dossier (Minonazare)</span>
                <span className="text-[10px] bg-accent/15 text-accent px-2 py-0.5 rounded font-semibold">In Progress</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tariffs & Pricing Section */}
      <section id="tariffs" className="py-16 px-4 md:px-8 w-full">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-accent uppercase tracking-wider block mb-2">Transparent Subscriptions</span>
          <h2 className="font-lexend text-2xl md:text-3xl font-bold text-primary mb-3">
            Tariffs Tailored to Your Dossier Volume
          </h2>
          <p className="text-secondary text-sm max-w-xl mx-auto">
            Flexible plans designed to accommodate any volume of pharmaceutical registration dossiers.<br className="hidden sm:inline" />
            Select a scalable monthly storage tier or upgrade to the Tariff OWN unlimited annual lease plan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {tariffs.map((t) => (
            <div
              key={t.name}
              className={`rounded-2xl p-5 border flex flex-col justify-between transition-all ${t.accent
                  ? "bg-accent/10 border-accent text-primary shadow-md ring-1 ring-accent"
                  : t.recommended
                    ? "bg-surface border-accent/50 text-primary shadow-xs"
                    : "bg-surface border-border text-primary shadow-xs"
                }`}
            >
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-bg text-accent border border-border inline-block mb-3">
                  {t.tag}
                </span>
                <h3 className="font-lexend font-bold text-base mb-1">{t.name}</h3>
                <p className="text-xs text-secondary mb-4">{t.storage}</p>
                <div className="font-lexend font-extrabold text-sm text-accent mb-4">{t.price}</div>
              </div>

              <button
                onClick={() => openAuthModal("signup")}
                className={`w-full py-2 text-xs font-bold rounded-lg transition-colors ${t.accent || t.recommended
                    ? "bg-accent hover:bg-accent-hover text-white"
                    : "bg-bg hover:bg-surface-raised text-primary border border-border"
                  }`}
              >
                Select Plan
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Our Process Section */}
      <section id="process" className="py-16 px-4 md:px-8 bg-surface-raised/40 border-t border-border">
        <div className="w-full">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-accent uppercase tracking-wider block mb-2">Simple Workflow</span>
            <h2 className="font-lexend text-2xl md:text-3xl font-bold text-primary mb-3">
              Four Steps to Seamless Submission
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-bg border border-border p-5 rounded-xl relative">
              <span className="w-8 h-8 rounded-full bg-accent text-white font-bold text-xs flex items-center justify-center mb-3">
                01
              </span>
              <h4 className="font-lexend font-bold text-sm text-primary mb-1">Registration</h4>
              <p className="text-xs text-secondary leading-relaxed">
                Create your corporate account with verified organization credentials.
              </p>
            </div>

            <div className="bg-bg border border-border p-5 rounded-xl relative">
              <span className="w-8 h-8 rounded-full bg-accent text-white font-bold text-xs flex items-center justify-center mb-3">
                02
              </span>
              <h4 className="font-lexend font-bold text-sm text-primary mb-1">Tariff Selection</h4>
              <p className="text-xs text-secondary leading-relaxed">
                Choose the optimal record volume tier or request a custom annual lease.
              </p>
            </div>

            <div className="bg-bg border border-border p-5 rounded-xl relative">
              <span className="w-8 h-8 rounded-full bg-accent text-white font-bold text-xs flex items-center justify-center mb-3">
                03
              </span>
              <h4 className="font-lexend font-bold text-sm text-primary mb-1">Dossier Creation</h4>
              <p className="text-xs text-secondary leading-relaxed">
                Upload documents, tag sequence numbers, and calculate MD5 checksums.
              </p>
            </div>

            <div className="bg-bg border border-border p-5 rounded-xl relative">
              <span className="w-8 h-8 rounded-full bg-accent text-white font-bold text-xs flex items-center justify-center mb-3">
                04
              </span>
              <h4 className="font-lexend font-bold text-sm text-primary mb-1">Tracking & Submission</h4>
              <p className="text-xs text-secondary leading-relaxed">
                Generate XML packages and track regulatory agency status in real time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

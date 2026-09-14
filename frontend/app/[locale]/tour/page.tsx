"use client";

import React, { useState } from "react";
import { AppShell } from "../../components/AppShell";
import {
  CaretDown,
  CaretUp,
  Clock,
  ShieldCheck,
  TelegramLogo,
  BookOpen,
  SquaresFour,
  FileText,
  CreditCard,
  Folders,
  UserGear,
  ListBullets,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

export default function SystemTourPage() {
  const tTour = useTranslations("tour");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: tTour("faq1Q"),
      a: tTour("faq1A"),
    },
    {
      q: tTour("faq2Q"),
      a: tTour("faq2A"),
    },
    {
      q: tTour("faq3Q"),
      a: tTour("faq3A"),
    },
    {
      q: tTour("faq4Q"),
      a: tTour("faq4A"),
    },
  ];

  const modules = [
    {
      title: `${tTour("module1Title")} (/dashboard)`,
      icon: SquaresFour,
      desc: tTour("module1Desc"),
    },
    {
      title: `${tTour("module2Title")} (/contracts)`,
      icon: FileText,
      desc: tTour("module2Desc"),
    },
    {
      title: `${tTour("module3Title")} (/tariffs)`,
      icon: CreditCard,
      desc: tTour("module3Desc"),
    },
    {
      title: `${tTour("module4Title")} (/projects)`,
      icon: Folders,
      desc: tTour("module4Desc"),
    },
    {
      title: `${tTour("module5Title")} (/profile/account)`,
      icon: UserGear,
      desc: tTour("module5Desc"),
    },
    {
      title: `${tTour("module6Title")} (/journal)`,
      icon: ListBullets,
      desc: tTour("module6Desc"),
    },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="bg-surface border border-border p-5 rounded-2xl shadow-xs">
          <span className="text-[10px] uppercase tracking-wider font-bold text-accent px-2 py-0.5 rounded bg-accent/10 border border-border">
            {tTour("badgeLabel")}
          </span>
          <h1 className="font-lexend text-2xl font-bold text-primary mt-1">
            {tTour("title")}
          </h1>
          <p className="text-xs text-secondary">
            {tTour("sub")}
          </p>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent/15 text-accent text-xs font-bold border border-border">
                <TelegramLogo size={16} />
                <span>{tTour("slaBadge")}</span>
              </div>
              <h2 className="font-lexend font-bold text-lg text-primary">
                {tTour("slaTitle")}
              </h2>
              <div className="space-y-1 text-xs text-secondary">
                <p className="flex items-center gap-2">
                  <Clock size={16} className="text-accent" />
                  <span><strong>{tTour("scheduleLabel")}:</strong> {tTour("scheduleDetail")}</span>
                </p>
                <p className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-500" />
                  <span><strong>{tTour("responseLabel")}:</strong> {tTour("responseDetail")}</span>
                </p>
                <p className="flex items-center gap-2">
                  <BookOpen size={16} className="text-amber-500" />
                  <span><strong>{tTour("ruleLabel")}:</strong> {tTour("ruleDetail")}</span>
                </p>
              </div>
            </div>

            <a
              href="https://t.me/ectc_support"
              target="_blank"
              rel="noreferrer"
              className="px-5 py-3 bg-accent hover:bg-accent-hover text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 shrink-0"
            >
              <TelegramLogo size={18} />
              <span>{tTour("telegramBtn")}</span>
            </a>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-lexend font-bold text-base text-primary pb-3 border-b border-border">
            {tTour("faqTitle")}
          </h2>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-bg border border-border rounded-xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between text-xs font-bold text-primary hover:text-accent transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? (
                    <CaretUp size={16} className="text-accent shrink-0" />
                  ) : (
                    <CaretDown size={16} className="text-muted shrink-0" />
                  )}
                </button>

                {openFaq === idx && (
                  <div className="px-4 pb-4 pt-1 text-xs text-secondary leading-relaxed border-t border-border bg-surface-raised/50">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-lexend font-bold text-base text-primary pb-3 border-b border-border">
            {tTour("modulesTitle")}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modules.map((m) => {
              const Icon = m.icon;
              return (
                <div key={m.title} className="bg-bg border border-border p-4 rounded-xl space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-accent/15 text-accent flex items-center justify-center">
                      <Icon size={18} />
                    </div>
                    <h3 className="font-lexend font-bold text-xs text-primary">{m.title}</h3>
                  </div>
                  <p className="text-xs text-secondary leading-relaxed">{m.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

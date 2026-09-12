"use client";

import React, { useState } from "react";
import { AppShell } from "../components/AppShell";
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

export default function SystemTourPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "What should I do if my contract is expiring soon?",
      a: "Navigate to 'My Tariffs' or 'My Contracts' page. Select your active subscription plan and use the interactive lease extension counter to generate an updated KZT invoice. Payment activation automatically extends your legal terms without interrupting active dossier sequences.",
    },
    {
      q: "How do I perform a secure password reset?",
      a: "Go to 'Account Settings' (/profile/account) and select the 'Password Update' tab. Enter your current password and your new password (must be at least 8 characters). Administrators can also reset user credentials from the User Management Table.",
    },
    {
      q: "How do I transfer existing projects between different tariff plans?",
      a: "In 'My Projects' (/projects), open the Project Metadata Workspace for the target medicinal product. Under the Assigned Tariff dropdown, select your new available storage tier (e.g. Tariff OWN or Tariff L) and click 'Save Changes'.",
    },
    {
      q: "What happens if my payment activation is delayed?",
      a: "If your bank transfer or wire payment takes longer than expected, contact technical support immediately via the Telegram widget with your Invoice Number and Organization User ID. Support staff can temporarily extend grace access within 2 hours.",
    },
  ];

  const modules = [
    {
      title: "Dashboard Overview (/dashboard)",
      icon: SquaresFour,
      desc: "Centralized control center featuring the Current Tariff Plan Widget, administrative announcements area, My Dossiers real-time breakdown (Pinned, In Progress, Total), and PDF User Manual download.",
    },
    {
      title: "My Contracts Register (/contracts)",
      icon: FileText,
      desc: "Lists all conclusion types, contract numbers, start dates, expiration end dates, and legal status indicators distinguishing active agreements from expired terms.",
    },
    {
      title: "My Tariffs & Pricing (/tariffs)",
      icon: CreditCard,
      desc: "Header with active subscription details, interactive lease month counter with live KZT annual calculation, and payment execution audit table.",
    },
    {
      title: "My Projects & Dossiers (/projects)",
      icon: Folders,
      desc: "Captures medicinal product metadata, submission country/roles (RMS/CMS), multi-category file tree (Adin information, Resume, Minonazare) with drag-and-drop uploads and MD5 checksum tracking.",
    },
    {
      title: "Account & User Settings (/profile/account)",
      icon: UserGear,
      desc: "Admin view displaying User List Management Table with role toggles, custom avatar photo upload card (max 50KB, 130x130px limit), password reset, and corporate TIN/BIN details.",
    },
    {
      title: "Activity Log & Audit Trail (/journal)",
      icon: ListBullets,
      desc: "Tamper-evident audit trail table tracking logins, session exits, file uploads, and file deletions with precise timestamps and transaction hashes.",
    },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-surface border border-border p-5 rounded-2xl shadow-xs">
          <span className="text-[10px] uppercase tracking-wider font-bold text-accent px-2 py-0.5 rounded bg-accent/10 border border-border">
            Interactive Walkthrough & Regulations
          </span>
          <h1 className="font-lexend text-2xl font-bold text-primary mt-1">
            System Tour & Technical Support (/tour)
          </h1>
          <p className="text-xs text-secondary">
            In-depth module walkthroughs, common Q&A friction resolution, and official technical support regulations.
          </p>
        </div>

        {/* Technical Support Regulations Card */}
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent/15 text-accent text-xs font-bold border border-border">
                <TelegramLogo size={16} />
                <span>Official Technical Support Regulations</span>
              </div>
              <h2 className="font-lexend font-bold text-lg text-primary">
                Astana Operating Schedule & Reaction SLA
              </h2>
              <div className="space-y-1 text-xs text-secondary">
                <p className="flex items-center gap-2">
                  <Clock size={16} className="text-accent" />
                  <span><strong>Schedule:</strong> Monday–Friday, 09:00–18:00 (Astana / KZT Time)</span>
                </p>
                <p className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-500" />
                  <span><strong>Response Guarantee:</strong> Maximum 2-hour reaction SLA for active tickets</span>
                </p>
                <p className="flex items-center gap-2">
                  <BookOpen size={16} className="text-amber-500" />
                  <span><strong>Rule:</strong> Always provide your Organization User ID (e.g. USR-101) when requesting support</span>
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
              <span>Contact Technical Support (@ectc_support)</span>
            </a>
          </div>
        </div>

        {/* Q&A Accordions */}
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-lexend font-bold text-base text-primary pb-3 border-b border-border">
            Frequently Asked Questions & Friction Resolution
          </h2>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-bg border border-border rounded-xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between text-xs font-bold text-primary hover:text-accent transition-colors"
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

        {/* Module Walkthrough Descriptions */}
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-lexend font-bold text-base text-primary pb-3 border-b border-border">
            In-Depth Module Walkthrough Descriptions
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

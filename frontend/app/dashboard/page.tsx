"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppShell } from "../components/AppShell";
import {
  CreditCard,
  PencilSimple,
  Trash,
  BellRinging,
  PushPin,
  ClockAfternoon,
  Folders,
  FilePdf,
  DownloadSimple,
  ArrowUpRight,
  ShieldCheck,
} from "@phosphor-icons/react";
import toast from "react-hot-toast";

export default function DashboardPage() {
  const [activeTariff, setActiveTariff] = useState({
    name: "Tariff OWN (MUP)",
    type: "Unlimited Annual Lease",
    limit: "1,200 Records / Unlimited Dossiers",
    used: 480,
    max: 1200,
    status: "Active verified",
  });

  const [announcements] = useState([
    {
      id: "REF-KZ-2026-091",
      title: "Tax-Regime Classification Notice (2026-Q3)",
      content:
        "Official announcement: Value-added tax exemptions for Kazakhstan electronic regulatory submission services have been updated under Tax Code Clause 394.",
      date: "2026-09-10 09:30 AM",
      category: "Tax & Legal",
    },
    {
      id: "REF-KZ-2026-088",
      title: "eCTD Validation Engine Upgrade v4.2",
      content:
        "Module 1 XML validation rules for Concerned Member State (CMS) sequences updated to strictly align with Astana Ministry of Health guidelines.",
      date: "2026-09-08 14:15 PM",
      category: "System Update",
    },
  ]);

  const handleEditTariff = () => {
    toast.success("Opened Tariff Configuration Editor");
  };

  const handleDeleteTariff = () => {
    toast.error("Action restricted: Active subscription cannot be deleted.");
  };

  const handleDownloadManual = () => {
    toast.success("Downloading official ECTC PDF User Manual...");
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header Greeting */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface border border-border p-5 rounded-2xl shadow-xs">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-medium text-accent px-2 py-0.5 rounded bg-accent/10 border border-accent/20">
              Authenticated Client Session
            </span>
            <h1 className="font-lexend text-lg font-medium text-primary mt-1">
              Regulatory Overview & Control Center
            </h1>
            <p className="text-xs text-secondary">
              Kazakhstan Dossier Formation • Contract Lifecycle • Subscription Billing
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/projects"
              className="px-4 py-2 bg-accent hover:bg-accent-hover text-white font-semibold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
            >
              <span>+ Create New Project</span>
            </Link>
          </div>
        </div>

        {/* Top Grid: Tariff Plan Widget + Manual Teaser Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Tariff Plan Widget */}
          <div className="lg:col-span-2 bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center">
                    <CreditCard size={22} />
                  </div>
                  <div>
                    <h2 className="font-lexend font-medium text-base text-primary">Current Tariff Plan Widget</h2>
                    <p className="text-xs text-secondary">{activeTariff.type}</p>
                  </div>
                </div>

                {/* Edit / Delete Icons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleEditTariff}
                    title="Edit Configuration"
                    className="p-2 text-secondary hover:text-accent hover:bg-surface-raised rounded-lg transition-colors border border-border"
                  >
                    <PencilSimple size={16} />
                  </button>
                  <button
                    onClick={handleDeleteTariff}
                    title="Delete Configuration"
                    className="p-2 text-secondary hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors border border-border"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </div>

              {/* Tariff Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="bg-bg p-3.5 rounded-xl border border-border">
                  <span className="text-[10px] text-muted uppercase font-medium tracking-wider block mb-1">
                    Active Subscription Plan
                  </span>
                  <span className="font-lexend font-medium text-base text-accent block">
                    {activeTariff.name}
                  </span>
                  <span className="text-[11px] text-emerald-500 flex items-center gap-1 mt-1 font-normal">
                    <ShieldCheck size={14} />
                    {activeTariff.status}
                  </span>
                </div>

                <div className="bg-bg p-3.5 rounded-xl border border-border">
                  <span className="text-[10px] text-muted uppercase font-medium tracking-wider block mb-1">
                    Storage & Record Capacity
                  </span>
                  <span className="font-lexend font-medium text-base text-primary block">
                    {activeTariff.used} / {activeTariff.max} Records
                  </span>
                  {/* Usage Progress Bar */}
                  <div className="w-full bg-surface-raised h-2 rounded-full mt-2 overflow-hidden border border-border">
                    <div className="bg-accent h-full rounded-full" style={{ width: `${(activeTariff.used / activeTariff.max) * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <span className="text-xs text-secondary">
                Limit: <strong className="text-primary font-semibold">{activeTariff.limit}</strong>
              </span>
              <Link
                href="/tariffs"
                className="px-4 py-2 text-xs font-semibold bg-accent/15 hover:bg-accent/25 text-accent border border-accent/30 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <span>Change Plan</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>

          {/* Manual Teaser Card */}
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mb-4">
                <FilePdf size={24} />
              </div>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-accent px-2 py-0.5 rounded bg-accent/10">
                Official PDF Guide
              </span>
              <h3 className="font-lexend font-semibold text-base text-primary mt-2 mb-1">
                Platform User Manual
              </h3>
              <p className="text-xs text-secondary leading-relaxed mb-4">
                Step-by-step instructions for forming eCTD registration dossiers, generating XML sequences, and operating under Kazakhstan regulatory compliance.
              </p>
            </div>

            <button
              onClick={handleDownloadManual}
              className="w-full py-2.5 bg-bg hover:bg-surface-raised border border-border text-primary font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <DownloadSimple size={16} className="text-accent" />
              <span>Download Manual (PDF 4.2 MB)</span>
            </button>
          </div>
        </div>

        {/* Middle Section: My Dossiers Counter */}
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-border mb-5">
            <h3 className="font-lexend font-medium text-base text-primary">
              My Dossiers Real-Time Breakdown
            </h3>
            <Link
              href="/projects"
              className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
            >
              <span>Complete in progress</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Pinned Items */}
            <div className="bg-bg border border-border p-5 rounded-xl flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                <PushPin size={22} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-medium tracking-wider text-muted block">Pinned Items</span>
                <span className="font-lexend font-medium text-lg text-primary">4 Dossiers</span>
                <span className="text-[10px] text-amber-500 font-normal block mt-0.5">High Priority</span>
              </div>
            </div>

            {/* Dossiers In Progress */}
            <div className="bg-bg border border-border p-5 rounded-xl flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-accent/10 border border-accent/20 text-accent flex items-center justify-center shrink-0">
                <ClockAfternoon size={22} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-medium tracking-wider text-muted block">Dossiers In Progress</span>
                <span className="font-lexend font-medium text-lg text-primary">8 Sequences</span>
                <span className="text-[10px] text-accent font-normal block mt-0.5">Active Sequence Building</span>
              </div>
            </div>

            {/* Total Count */}
            <div className="bg-bg border border-border p-5 rounded-xl flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                <Folders size={22} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-medium tracking-wider text-muted block">Total Dossier Count</span>
                <span className="font-lexend font-medium text-lg text-primary">24 Projects</span>
                <span className="text-[10px] text-emerald-500 font-normal block mt-0.5">Lifetime Submissions</span>
              </div>
            </div>
          </div>
        </div>

        {/* User Notification Area */}
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2.5 pb-4 border-b border-border mb-4">
            <BellRinging size={20} className="text-accent" />
            <h3 className="font-lexend font-semibold text-base text-primary">
              User Notification Area (Administrative Announcements)
            </h3>
          </div>

          <div className="space-y-4">
            {announcements.map((item) => (
              <div key={item.id} className="bg-bg border border-border p-4 rounded-xl">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-primary">{item.title}</span>
                    <span className="text-[9px] font-semibold px-2 py-0.5 rounded bg-accent/15 text-accent">
                      {item.category}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted font-medium">
                    Ref ID: {item.id} • {item.date}
                  </span>
                </div>
                <p className="text-xs text-secondary leading-relaxed">{item.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

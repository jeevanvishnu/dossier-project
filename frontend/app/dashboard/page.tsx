"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppShell } from "../components/AppShell";
import {
  BellRinging,
  PushPin,
  LockKey,
  Files,
  CreditCard,
  Infinity as InfinityIcon,
  PencilSimple,
  Trash,
  X,
  CheckCircle,
  Sparkle,
} from "@phosphor-icons/react";
import toast from "react-hot-toast";

export default function DashboardPage() {
  const [dossierCounts] = useState({
    pinned: 0,
    inProgress: 7,
    total: 7,
  });

  const [activeTariff, setActiveTariff] = useState({
    name: "Tariff OWN (MUP) (unlimited)",
    isUnlimited: true,
    storageLimit: "Unlimited",
    recordsLimit: "Unlimited",
    status: "Active Plan",
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editTariffName, setEditTariffName] = useState(activeTariff.name);

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

  const handleDownloadManual = () => {
    toast.success("Downloading official ECTC PDF User Manual...");
  };

  const handleSaveTariffEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveTariff((prev) => ({ ...prev, name: editTariffName }));
    setIsEditModalOpen(false);
    toast.success("Tariff parameters updated successfully!");
  };

  const handleConfirmDeleteTariff = () => {
    setActiveTariff({
      name: "No Active Tariff",
      isUnlimited: false,
      storageLimit: "0 GB",
      recordsLimit: "0 Records",
      status: "Inactive",
    });
    setIsDeleteModalOpen(false);
    toast.error("Tariff configuration cleared.");
  };

  const handleResetTariff = () => {
    setActiveTariff({
      name: "Tariff OWN (MUP) (unlimited)",
      isUnlimited: true,
      storageLimit: "Unlimited",
      recordsLimit: "Unlimited",
      status: "Active Plan",
    });
    setEditTariffName("Tariff OWN (MUP) (unlimited)");
    toast.success("Reset to default Tariff OWN (MUP) (unlimited)!");
  };

  return (
    <AppShell>
      <div className="space-y-6">

        {/* Top Header Section: Current Tariff Plan Widget & Redesigned User Notification Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Current Tariff Plan Widget */}
          <div className="lg:col-span-7 bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative">
            <div>
              {/* Header & Top Right Action Buttons */}
              <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center shadow-xs">
                    <CreditCard size={20} weight="bold" />
                  </div>
                  <div>
                    <h3 className="font-lexend font-bold text-xs uppercase tracking-wider text-muted">
                      Current Tariff Plan Widget
                    </h3>
                    <span className="text-[11px] font-semibold text-emerald-500 flex items-center gap-1">
                      <CheckCircle size={13} weight="fill" /> {activeTariff.status}
                    </span>
                  </div>
                </div>

                {/* Top Right Action Buttons (Pencil & Trash Icons) */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditTariffName(activeTariff.name);
                      setIsEditModalOpen(true);
                    }}
                    title="Edit/Modify tariff parameters"
                    className="px-2.5 py-1.5 rounded-xl bg-bg hover:bg-surface-raised border border-border text-secondary hover:text-accent transition-colors flex items-center gap-1.5 text-xs font-semibold shadow-2xs"
                  >
                    <PencilSimple size={16} />
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                  <button
                    onClick={() => setIsDeleteModalOpen(true)}
                    title="Delete or clear current tariff configuration"
                    className="px-2.5 py-1.5 rounded-xl bg-bg hover:bg-red-500/10 border border-border text-secondary hover:text-red-500 transition-colors flex items-center gap-1.5 text-xs font-semibold shadow-2xs"
                  >
                    <Trash size={16} />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                </div>
              </div>

              {/* Tariff Details & Infinity Symbol Visual */}
              {activeTariff.isUnlimited ? (
                <div className="bg-bg border border-border rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1.5 text-center sm:text-left">
                    <span className="text-[10px] font-extrabold text-muted uppercase tracking-wider">Active Subscription Plan Name</span>
                    <h2 className="font-lexend font-extrabold text-lg text-primary">
                      {activeTariff.name}
                    </h2>
                    <p className="text-xs text-secondary leading-relaxed">
                      Unlimited data storage space, records, and capacity limits allocated.
                    </p>
                  </div>

                  {/* Infinity Symbol Visual Box */}
                  <div className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-accent/10 border border-accent/25 text-accent min-w-[125px] shrink-0 text-center shadow-xs">
                    <InfinityIcon size={38} weight="bold" />
                    <span className="text-[10px] font-extrabold uppercase tracking-wider mt-1 text-accent">
                      Infinity (∞)
                    </span>
                    <span className="text-[9px] text-muted font-medium">Unlimited Capacity</span>
                  </div>
                </div>
              ) : (
                <div className="bg-bg border border-dashed border-red-500/30 rounded-xl p-5 flex flex-col items-center justify-center text-center space-y-2">
                  <span className="text-xs font-semibold text-red-400">Tariff Configuration Cleared / Inactive</span>
                  <button
                    onClick={handleResetTariff}
                    className="text-xs text-accent underline font-semibold hover:text-accent-hover"
                  >
                    Restore Tariff OWN (MUP) (unlimited)
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Redesigned User Notification Area */}
          <div className="lg:col-span-5 bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center shadow-xs">
                    <BellRinging size={20} weight="fill" />
                  </div>
                  <div>
                    <h3 className="font-lexend font-semibold text-sm text-primary">
                      User Notification Area
                    </h3>
                    <p className="text-[10px] text-muted font-medium">Administrative Announcements</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-accent/15 text-accent font-bold text-[10px]">
                  {announcements.length} New
                </span>
              </div>

              <div className="space-y-3">
                {announcements.map((item) => (
                  <div key={item.id} className="bg-bg border border-border p-3.5 rounded-xl hover:border-accent/30 transition-colors">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-bold text-primary truncate max-w-[200px]">{item.title}</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-accent/15 text-accent shrink-0">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-secondary leading-snug line-clamp-2">{item.content}</p>
                    <div className="mt-2 text-[9px] text-muted font-medium flex items-center justify-between border-t border-border/40 pt-1.5">
                      <span>Ref ID: {item.id}</span>
                      <span>{item.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* 3-Card Header Grid (Matching reference image changeplan.png) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Card 1: My dossiers */}
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <h3 className="font-lexend font-bold text-lg text-primary text-center mb-6">
                My dossiers
              </h3>

              <div className="space-y-4">
                {/* Pinned */}
                <div className="flex items-center justify-between py-1.5 px-2 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center shadow-xs shrink-0">
                      <PushPin size={18} weight="fill" />
                    </div>
                    <span className="text-sm font-semibold text-primary">Pinned</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-secondary/30 font-light">|</span>
                    <span className="font-lexend font-bold text-base text-primary min-w-[20px] text-right">
                      {dossierCounts.pinned}
                    </span>
                  </div>
                </div>

                {/* In progress */}
                <div className="flex items-center justify-between py-1.5 px-2 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
                      <LockKey size={18} weight="fill" />
                    </div>
                    <span className="text-sm font-semibold text-primary">In progress</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-secondary/30 font-light">|</span>
                    <span className="font-lexend font-bold text-base text-primary min-w-[20px] text-right">
                      {dossierCounts.inProgress}
                    </span>
                  </div>
                </div>

                {/* Total count */}
                <div className="flex items-center justify-between py-1.5 px-2 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-700 text-white flex items-center justify-center shadow-xs shrink-0">
                      <Files size={18} weight="fill" />
                    </div>
                    <span className="text-sm font-semibold text-primary">Total count</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-secondary/30 font-light">|</span>
                    <span className="font-lexend font-bold text-base text-primary min-w-[20px] text-right">
                      {dossierCounts.total}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <Link
                href="/projects"
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-xl transition-all shadow-xs hover:shadow-md flex items-center justify-center text-center"
              >
                Complete in progress
              </Link>
            </div>
          </div>

          {/* Card 2: Running out of space on your tariff? */}
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <h3 className="font-lexend font-bold text-lg text-primary text-center mb-4 leading-snug">
                Running out of space on your tariff?
              </h3>

              {/* Image Container */}
              <div className="py-2 flex items-center justify-center">
                <img
                  src="/images/changeplan.png"
                  alt="Running out of space on your tariff?"
                  className="max-h-[130px] w-auto object-contain mx-auto rounded-lg shadow-xs"
                />
              </div>
            </div>

            <div className="mt-8">
              <Link
                href="/tariffs"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-all shadow-xs hover:shadow-md flex items-center justify-center text-center"
              >
                Change plan
              </Link>
            </div>
          </div>

          {/* Card 3: Don't forget to study the manual! */}
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <h3 className="font-lexend font-bold text-lg text-primary text-center mb-4 leading-snug">
                Don't forget to study the manual!
              </h3>

              {/* Image Container */}
              <div className="py-2 flex items-center justify-center">
                <img
                  src="/images/pdf-img.png"
                  alt="Don't forget to study the manual!"
                  className="max-h-[130px] w-auto object-contain mx-auto rounded-lg shadow-xs"
                />
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={handleDownloadManual}
                className="w-full py-3 bg-slate-900 hover:bg-black dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold text-sm rounded-xl transition-all shadow-xs hover:shadow-md flex items-center justify-center text-center"
              >
                Download manual now!
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Edit Tariff Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2 text-primary font-lexend font-bold">
                <PencilSimple size={20} className="text-accent" />
                <span>Edit Tariff Parameters</span>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-secondary hover:text-primary hover:bg-bg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveTariffEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-primary mb-1">
                  Active Subscription Plan Name
                </label>
                <input
                  type="text"
                  value={editTariffName}
                  onChange={(e) => setEditTariffName(e.target.value)}
                  className="w-full bg-bg border border-border rounded-xl px-3 py-2 text-xs text-primary focus:outline-none focus:border-accent"
                  required
                />
              </div>

              <div className="bg-bg p-3 rounded-xl border border-border space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-secondary">Capacity Limits:</span>
                  <span className="text-emerald-500 font-bold flex items-center gap-1">
                    <InfinityIcon size={14} /> Unlimited (∞)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">Data Storage:</span>
                  <span className="text-emerald-500 font-bold">Unlimited</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-bg hover:bg-surface-raised border border-border rounded-xl text-xs text-secondary font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                >
                  Save Parameters
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Tariff Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2 text-red-500 font-lexend font-bold">
                <Trash size={20} />
                <span>Clear Tariff Configuration</span>
              </div>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="p-1 rounded-lg text-secondary hover:text-primary hover:bg-bg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-secondary leading-relaxed">
              Are you sure you want to clear or delete the active subscription plan configuration (
              <strong className="text-primary">{activeTariff.name}</strong>)? This will remove your active capacity allocation status until reconfigured.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-bg hover:bg-surface-raised border border-border rounded-xl text-xs text-secondary font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteTariff}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
              >
                Clear Tariff Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}



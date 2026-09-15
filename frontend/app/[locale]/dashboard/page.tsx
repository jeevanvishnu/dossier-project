"use client";

import React, { useState } from "react";
import { Link } from "../../../i18n/routing";
import { AppShell } from "../../components/AppShell";
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
} from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

export default function DashboardPage() {
  const tDash = useTranslations("dashboard");
  const tCommon = useTranslations("common");

  const [dossierCounts] = useState({
    pinned: 0,
    inProgress: 7,
    total: 7,
  });

  const [activeTariff, setActiveTariff] = useState({
    name: "Tariff OWN (MUP) (Unlimited)",
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
      titleKey: "taxAlertTitle",
      titleDefault: "Tax-Regime Classification Notice (2026-Q3)",
      contentKey: "taxAlertBody",
      contentDefault:
        "Official announcement: Value-added tax exemptions for Kazakhstan electronic regulatory submission services have been updated under Tax Code Clause 394.",
      date: "2026-09-10 09:30 AM",
      category: "Tax & Legal",
    },
    {
      id: "REF-KZ-2026-088",
      titleKey: "contractAlertTitle",
      titleDefault: "eCTD Validation Engine Upgrade v4.2",
      contentKey: "contractAlertBody",
      contentDefault:
        "Module 1 XML validation rules for Concerned Member State (CMS) sequences updated to strictly align with Astana Ministry of Health guidelines.",
      date: "2026-09-08 14:15 PM",
      category: "System Update",
    },
  ]);

  const handleDownloadManual = () => {
    toast.success(tDash("manualCardBtn"));
  };

  const handleSaveTariffEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveTariff((prev) => ({ ...prev, name: editTariffName }));
    setIsEditModalOpen(false);
    toast.success(tCommon("save"));
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
    toast.error(tDash("clearTariffStatus"));
  };

  const handleResetTariff = () => {
    setActiveTariff({
      name: "Tariff OWN (MUP) (Unlimited)",
      isUnlimited: true,
      storageLimit: "Unlimited",
      recordsLimit: "Unlimited",
      status: "Active Plan",
    });
    setEditTariffName("Tariff OWN (MUP) (Unlimited)");
    toast.success(tDash("restoreTariff"));
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
                    <h3 className="font-lexend font-semibold text-xs uppercase tracking-wider text-muted">
                      {tDash("activeTariff")}
                    </h3>
                    <span className="text-[11px] font-semibold text-emerald-500 flex items-center gap-1">
                      <CheckCircle size={13} weight="fill" /> {activeTariff.status === "Active Plan" ? tDash("activePlan") : activeTariff.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditTariffName(activeTariff.name);
                      setIsEditModalOpen(true);
                    }}
                    title="Edit/Modify tariff parameters"
                    className="px-2.5 py-1.5 rounded-xl bg-bg hover:bg-surface-raised border border-border text-secondary hover:text-accent transition-colors flex items-center gap-1.5 text-xs font-medium shadow-2xs"
                  >
                    <PencilSimple size={16} />
                    <span className="hidden sm:inline">{tCommon("edit")}</span>
                  </button>
                  <button
                    onClick={() => setIsDeleteModalOpen(true)}
                    title="Delete or clear current tariff configuration"
                    className="px-2.5 py-1.5 rounded-xl bg-bg hover:bg-red-500/10 border border-border text-secondary hover:text-red-500 transition-colors flex items-center gap-1.5 text-xs font-medium shadow-2xs"
                  >
                    <Trash size={16} />
                    <span className="hidden sm:inline">{tCommon("delete")}</span>
                  </button>
                </div>
              </div>

              {activeTariff.isUnlimited ? (
                <div className="bg-bg border border-border rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1.5 text-center sm:text-left">
                    <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">{tDash("activeTariff")}</span>
                    <h2 className="font-lexend font-bold text-base md:text-lg text-primary">
                      {activeTariff.name}
                    </h2>
                    <p className="text-xs text-secondary leading-relaxed font-normal">
                      {tDash("welcomeSub")}
                    </p>
                  </div>

                  <div className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-accent/10 border border-accent/25 text-accent min-w-[125px] shrink-0 text-center shadow-xs">
                    <InfinityIcon size={38} weight="bold" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider mt-1 text-accent">
                      {tDash("infinity")}
                    </span>
                    <span className="text-[9px] text-muted font-medium">{tDash("storageUsed")}</span>
                  </div>
                </div>
              ) : (
                <div className="bg-bg border border-dashed border-red-500/30 rounded-xl p-5 flex flex-col items-center justify-center text-center space-y-2">
                  <span className="text-xs font-medium text-red-600 dark:text-red-400">{tDash("clearTariffStatus")}</span>
                  <button
                    onClick={handleResetTariff}
                    className="text-xs text-accent underline font-medium hover:text-accent-hover"
                  >
                    {tDash("restoreTariff")}
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
                      {tDash("recentActivity")}
                    </h3>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-accent/15 text-accent font-semibold text-[10px]">
                  {announcements.length} {tDash("notificationsNew")}
                </span>
              </div>

                {announcements.map((item) => {
                  const titleLabel = tDash.has(item.titleKey as any) ? tDash(item.titleKey as any) : item.titleDefault;
                  const contentLabel = tDash.has(item.contentKey as any) ? tDash(item.contentKey as any) : item.contentDefault;
                  return (
                    <div key={item.id} className="bg-bg border border-border p-3.5 rounded-xl hover:border-accent/30 transition-colors">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-semibold text-primary truncate max-w-[200px]">{titleLabel}</span>
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-accent/15 text-accent shrink-0">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-secondary leading-snug line-clamp-2 font-normal">{contentLabel}</p>
                      <div className="mt-2 text-[9px] text-muted font-medium flex items-center justify-between border-t border-border/40 pt-1.5">
                        <span>Ref ID: {item.id}</span>
                        <span>{item.date}</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

        </div>

        {/* 3-Card Header Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Card 1: My dossiers */}
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <h3 className="font-lexend font-semibold text-base md:text-lg text-primary text-center mb-6">
                {tDash("activeDossiers")}
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-1.5 px-2 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent text-white flex items-center justify-center shadow-xs shrink-0">
                      <PushPin size={18} weight="fill" />
                    </div>
                    <span className="text-sm font-medium text-primary">{tDash("dossierPinned")}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-secondary/30 font-light">|</span>
                    <span className="font-lexend font-semibold text-base text-primary min-w-[20px] text-right">
                      {dossierCounts.pinned}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-1.5 px-2 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
                      <LockKey size={18} weight="fill" />
                    </div>
                    <span className="text-sm font-medium text-primary">{tCommon("inReview")}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-secondary/30 font-light">|</span>
                    <span className="font-lexend font-semibold text-base text-primary min-w-[20px] text-right">
                      {dossierCounts.inProgress}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-1.5 px-2 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-700 text-white flex items-center justify-center shadow-xs shrink-0">
                      <Files size={18} weight="fill" />
                    </div>
                    <span className="text-sm font-medium text-primary">{tDash("totalContracts")}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-secondary/30 font-light">|</span>
                    <span className="font-lexend font-semibold text-base text-primary min-w-[20px] text-right">
                      {dossierCounts.total}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <Link
                href="/projects"
                className="w-full py-3 bg-accent hover:bg-accent-hover text-white font-medium text-sm rounded-xl transition-all shadow-xs hover:shadow-md flex items-center justify-center text-center"
              >
                {tDash("newProject")}
              </Link>
            </div>
          </div>

          {/* Card 2: Running out of space on your tariff? */}
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <h3 className="font-lexend font-semibold text-base md:text-lg text-primary text-center mb-4 leading-snug">
                {tDash("manageSubscriptions")}
              </h3>

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
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-xl transition-all shadow-xs hover:shadow-md flex items-center justify-center text-center"
              >
                {tDash("manageSubscriptions")}
              </Link>
            </div>
          </div>

          {/* Card 3: Don't forget to study the manual! */}
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <h3 className="font-lexend font-semibold text-base md:text-lg text-primary text-center mb-4 leading-snug">
                {tDash("manualCardTitle")}
              </h3>

              <div className="py-2 flex items-center justify-center">
                <img
                  src="/images/pdf-img.png"
                  alt={tDash("manualCardTitle")}
                  className="max-h-[130px] w-auto object-contain mx-auto rounded-lg shadow-xs"
                />
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={handleDownloadManual}
                className="w-full py-3 bg-slate-900 hover:bg-black dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-medium text-sm rounded-xl transition-all shadow-xs hover:shadow-md flex items-center justify-center text-center cursor-pointer"
              >
                {tDash("manualCardBtn")}
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
                <span>{tDash("editTariffTitle")}</span>
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
                  {tDash("editTariffLabel")}
                </label>
                <input
                  type="text"
                  value={editTariffName}
                  onChange={(e) => setEditTariffName(e.target.value)}
                  className="w-full bg-bg border border-border rounded-xl px-3 py-2 text-xs text-primary focus:outline-none focus:border-accent"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-bg hover:bg-surface-raised border border-border rounded-xl text-xs text-secondary font-medium transition-colors"
                >
                  {tCommon("cancel")}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-xl text-xs font-semibold transition-colors shadow-xs"
                >
                  {tCommon("save")}
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
                <span>{tDash("clearTariffTitle")}</span>
              </div>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="p-1 rounded-lg text-secondary hover:text-primary hover:bg-bg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-secondary leading-relaxed">
              {tDash("clearTariffConfirm")} (
              <strong className="text-primary font-semibold">{activeTariff.name}</strong>)?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-bg hover:bg-surface-raised border border-border rounded-xl text-xs text-secondary font-medium transition-colors"
              >
                {tCommon("cancel")}
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteTariff}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs"
              >
                {tCommon("delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

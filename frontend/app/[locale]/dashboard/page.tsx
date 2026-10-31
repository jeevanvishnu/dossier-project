"use client";

import React, { useState, useEffect } from "react";
import { Link } from "../../../i18n/routing";
import { AppShell } from "../../components/AppShell";
import {
  BellRinging,
  PushPin,
  LockKey,
  Files,
  CreditCard,
  Users,
  HardDrive,
  CheckCircle,
  Warning,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/axios";
import { SuperAdminDashboard } from "../../components/dashboard/SuperAdminDashboard";

interface DashboardStats {
  maxUsers: number;
  storageGb: number;
  usedStorageBytes: number;
}

export default function DashboardPage() {
  const tDash = useTranslations("dashboard");
  const tCommon = useTranslations("common");
  const { user } = useAuth();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (user && user.role !== "superadmin") {
      api
        .get("/dashboard/stats")
        .then((res) => {
          if (res.data?.success) {
            setStats({
              maxUsers: res.data.maxUsers,
              storageGb: res.data.storageGb,
              usedStorageBytes: res.data.usedStorageBytes,
            });
          }
        })
        .catch((err) => {
          console.error("Failed to load dashboard stats:", err);
        })
        .finally(() => {
          setLoadingStats(false);
        });
    }
  }, [user]);

  const [dossierCounts] = useState({
    pinned: 0,
    inProgress: 7,
    total: 7,
  });

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

  if (user?.role === "superadmin") {
    return <SuperAdminDashboard />;
  }

  // Calculate storage usage percentage
  const storageLimitBytes = (stats?.storageGb ?? 1) * 1024 * 1024 * 1024;
  const usedBytes = stats?.usedStorageBytes ?? 0;
  const rawGaugePercent = Math.min(
    100,
    Math.round((usedBytes / storageLimitBytes) * 100)
  );

  // Format used storage display
  const usedMB = (usedBytes / (1024 * 1024)).toFixed(1);
  const usedGB = (usedBytes / (1024 * 1024 * 1024)).toFixed(2);
  const formattedUsedStorage =
    usedBytes >= 1024 * 1024 * 1024 ? `${usedGB} GB` : `${usedMB} MB`;

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Top Header Section: Tariff & Limits Widget + Announcements */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Current Tariff Plan & Enforced Limits Widget */}
          <div className="lg:col-span-7 bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative">
            <div>
              {/* Header */}
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
                      <CheckCircle size={13} weight="fill" /> {tDash("activePlan")}
                    </span>
                  </div>
                </div>

                {rawGaugePercent >= 90 && (
                  <span className="px-2.5 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-500 font-semibold text-[11px] flex items-center gap-1">
                    <Warning size={14} weight="fill" /> High Storage Usage
                  </span>
                )}
              </div>

              {/* Body */}
              <div className="bg-bg border border-border rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-3 text-center sm:text-left">
                  <div>
                    <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">
                      Subscription Plan
                    </span>
                    <h2 className="font-lexend font-bold text-base md:text-lg text-primary">
                      Company Admin Plan
                    </h2>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5 text-secondary">
                      <Users size={16} className="text-accent" />
                      <span>
                        Max Users:{" "}
                        <strong className="text-primary font-semibold">
                          {loadingStats ? "..." : stats?.maxUsers ?? 1}
                        </strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-secondary">
                      <HardDrive size={16} className="text-accent" />
                      <span>
                        Storage Capacity:{" "}
                        <strong className="text-primary font-semibold">
                          {loadingStats ? "..." : `${stats?.storageGb ?? 1} GB`}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Speedometer Segmented Gauge Meter Widget (Segmented pill design with needle & tick scale) */}
                {(() => {
                  const isRed = rawGaugePercent >= 90;
                  const isWarning = rawGaugePercent >= 75 && rawGaugePercent < 90;
                  const activeColor = isRed
                    ? "#ef4444"
                    : isWarning
                    ? "#f59e0b"
                    : "#10b981";
                  const glowColor = isRed
                    ? "rgba(239, 68, 68, 0.45)"
                    : isWarning
                    ? "rgba(245, 158, 11, 0.45)"
                    : "rgba(16, 185, 129, 0.4)";
                  const textColorClass = isRed
                    ? "text-red-500"
                    : isWarning
                    ? "text-amber-500"
                    : "text-emerald-500";

                  // Gauge geometry
                  const cx = 105;
                  const cy = 96;
                  const rIn = 45;
                  const rOut = 65;
                  const strokeWidth = 7;
                  const totalSegments = 14;

                  // 14 pill segments fanning from 180° (left) to 0° (right)
                  const segments = Array.from({ length: totalSegments }, (_, i) => {
                    const deg = 180 - (i * 180) / (totalSegments - 1);
                    const rad = (deg * Math.PI) / 180;
                    const x1 = cx + rIn * Math.cos(rad);
                    const y1 = cy - rIn * Math.sin(rad);
                    const x2 = cx + rOut * Math.cos(rad);
                    const y2 = cy - rOut * Math.sin(rad);
                    const threshold = (i / (totalSegments - 1)) * 100;
                    const isActive =
                      rawGaugePercent > 0 && threshold <= rawGaugePercent + 0.5;

                    return {
                      i,
                      deg,
                      x1,
                      y1,
                      x2,
                      y2,
                      isActive,
                    };
                  });

                  // Scale numeric labels matching reference design (0, 25, 35, 50, 65, 85, 100)
                  const scaleLabels = [
                    { text: "0", x: 18, y: 99, anchor: "end" },
                    { text: "25", x: 38, y: 52, anchor: "middle" },
                    { text: "35", x: 58, y: 31, anchor: "middle" },
                    { text: "50", x: 105, y: 14, anchor: "middle" },
                    { text: "65", x: 152, y: 31, anchor: "middle" },
                    { text: "85", x: 172, y: 52, anchor: "middle" },
                    { text: "100", x: 192, y: 99, anchor: "start" },
                  ];

                  // Needle angle (-90deg at 0% to +90deg at 100%)
                  const needleAngle = -90 + (rawGaugePercent / 100) * 180;

                  return (
                    <div className="flex flex-col items-center justify-center shrink-0 text-center w-[195px] sm:w-[210px]">
                      <div className="relative w-full h-[114px] flex items-center justify-center select-none">
                        <svg
                          className="w-full h-full overflow-visible"
                          viewBox="0 0 210 114"
                        >
                          {/* Radial segmented capsules */}
                          {segments.map((seg) => (
                            <line
                              key={seg.i}
                              x1={seg.x1.toFixed(1)}
                              y1={seg.y1.toFixed(1)}
                              x2={seg.x2.toFixed(1)}
                              y2={seg.y2.toFixed(1)}
                              strokeWidth={strokeWidth}
                              strokeLinecap="round"
                              stroke={seg.isActive ? activeColor : undefined}
                              className={
                                seg.isActive
                                  ? "transition-all duration-300"
                                  : "stroke-slate-200 dark:stroke-[#243045] transition-all duration-300"
                              }
                              style={
                                seg.isActive
                                  ? { filter: `drop-shadow(0 0 3.5px ${glowColor})` }
                                  : undefined
                              }
                            />
                          ))}

                          {/* Outer scale numbers (0, 25, 35, 50, 65, 85, 100) */}
                          {scaleLabels.map((lbl) => (
                            <text
                              key={lbl.text}
                              x={lbl.x}
                              y={lbl.y}
                              textAnchor={lbl.anchor as "end" | "middle" | "start"}
                              className="fill-muted font-sans font-semibold text-[8.5px] select-none"
                            >
                              {lbl.text}
                            </text>
                          ))}

                          {/* Tapered Needle Dial */}
                          <g
                            style={{
                              transform: `rotate(${needleAngle}deg)`,
                              transformOrigin: `${cx}px ${cy}px`,
                              transition:
                                "transform 0.7s cubic-bezier(0.34, 1.3, 0.64, 1)",
                            }}
                          >
                            <polygon
                              points={`${cx - 2.2},${cy} ${cx - 0.7},${cy - 43} ${
                                cx + 0.7
                              },${cy - 43} ${cx + 2.2},${cy}`}
                              className="fill-slate-800 dark:fill-slate-100"
                              style={{
                                filter: "drop-shadow(0px 1px 2px rgba(0,0,0,0.35))",
                              }}
                            />
                          </g>

                          {/* Needle Pivot Hub */}
                          <circle
                            cx={cx}
                            cy={cy}
                            r="6.5"
                            className="fill-slate-900 dark:fill-slate-800 stroke-slate-300 dark:stroke-slate-600"
                            strokeWidth="1.5"
                          />
                          <circle
                            cx={cx}
                            cy={cy}
                            r="2.2"
                            fill={activeColor}
                            style={{ filter: `drop-shadow(0 0 2px ${activeColor})` }}
                          />
                        </svg>
                      </div>

                      {/* Percentage & Capacity readout */}
                      <div className="flex flex-col items-center mt-0.5">
                        <span
                          className={`text-sm font-extrabold font-lexend tracking-tight transition-colors duration-300 ${textColorClass}`}
                        >
                          {rawGaugePercent}%
                        </span>
                        <span className="text-[10px] text-muted font-medium mt-0.5">
                          {loadingStats
                            ? "Loading storage..."
                            : `${formattedUsedStorage} / ${stats?.storageGb ?? 1} GB`}
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* User Notification Area */}
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
                const titleLabel = tDash.has(item.titleKey as any)
                  ? tDash(item.titleKey as any)
                  : item.titleDefault;
                const contentLabel = tDash.has(item.contentKey as any)
                  ? tDash(item.contentKey as any)
                  : item.contentDefault;
                return (
                  <div
                    key={item.id}
                    className="bg-bg border border-border p-3.5 rounded-xl hover:border-accent/30 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-semibold text-primary truncate max-w-[200px]">
                        {titleLabel}
                      </span>
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-accent/15 text-accent shrink-0">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-secondary leading-snug line-clamp-2 font-normal">
                      {contentLabel}
                    </p>
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
          {/* Card 1: Active Dossiers */}
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
                    <span className="text-sm font-medium text-primary">
                      {tDash("dossierPinned")}
                    </span>
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
                    <span className="text-sm font-medium text-primary">
                      {tCommon("inReview")}
                    </span>
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
                    <span className="text-sm font-medium text-primary">
                      {tDash("totalContracts")}
                    </span>
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

          {/* Card 2: Manage Subscriptions */}
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

          {/* Card 3: Manual */}
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
    </AppShell>
  );
}

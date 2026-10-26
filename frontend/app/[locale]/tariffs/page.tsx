"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "../../components/AppShell";
import { useTranslations } from "next-intl";
import {
  Calculator,
  Receipt,
  ShieldCheck,
  CheckCircle,
  Sparkles,
  Infinity as InfinityIcon,
  Zap,
  Check,
  ArrowRight,
  ChevronsUpDown,
} from "lucide-react";
import { toast } from "sonner";

export default function TariffsPage() {
  const tTariffs = useTranslations("tariffs");

  const [gaugeAnimated, setGaugeAnimated] = useState(false);
  const [gaugePercent, setGaugePercent] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setGaugeAnimated(true);
    }, 150);

    const startTime = performance.now();
    const duration = 2400; // Slow, unhurried 2.4s sweep

    const animateCount = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setGaugePercent(Math.round(easeProgress * 100));

      if (progress < 1) {
        requestAnimationFrame(animateCount);
      }
    };

    const countTimer = setTimeout(() => {
      requestAnimationFrame(animateCount);
    }, 150);

    return () => {
      clearTimeout(timer);
      clearTimeout(countTimer);
    };
  }, []);

  const [leaseMonths, setLeaseMonths] = useState(12);
  const monthlyRateKzt = 115000;

  // Calculate discount percentage based on months
  const discountPct = leaseMonths >= 24 ? 20 : leaseMonths >= 12 ? 15 : leaseMonths >= 6 ? 10 : 0;
  const discountMultiplier = 1 - discountPct / 100;
  const totalPriceKzt = Math.round(monthlyRateKzt * leaseMonths * discountMultiplier);
  const totalSavingsKzt = Math.round(monthlyRateKzt * leaseMonths * (discountPct / 100));

  const paymentHistory = [
    {
      invoiceNo: "INV-2026-0012",
      quantityKey: "qty12Months",
      quantityDefault: "12 Months Lease",
      billingDate: "2026-01-15",
      amount: "1,173,000 KZT",
      status: "Completed",
      completionDate: "2026-01-15 11:20 AM",
    },
    {
      invoiceNo: "INV-2025-0089",
      quantityKey: "qty6Months",
      quantityDefault: "6 Months Lease",
      billingDate: "2025-06-01",
      amount: "621,000 KZT",
      status: "Completed",
      completionDate: "2025-06-01 14:05 PM",
    },
  ];

  const handleGetInvoice = () => {
    toast.success(
      tTariffs("invoiceToast", {
        months: leaseMonths,
        amount: totalPriceKzt.toLocaleString(),
      })
    );
  };

  const presetDurations = [
    { months: 1, label: tTariffs("month1"), discount: 0 },
    { months: 6, label: tTariffs("month6"), discount: 10 },
    { months: 12, label: tTariffs("month12"), discount: 15 },
    { months: 24, label: tTariffs("month24"), discount: 20 },
  ];

  return (
    <AppShell>
      <div className="space-y-6 w-full">
        {/* Top Header Row matching the 'Employees' clean model */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-lexend text-2xl font-bold text-primary tracking-tight">
              {tTariffs("title")}
            </h1>
            <p className="text-xs text-secondary mt-1 max-w-2xl">
              {tTariffs("sub")}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold text-xs shadow-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Tariff OWN Active
            </span>
          </div>
        </div>

        {/* Main Redesigned Tariff Calculator Card */}
        <div className="bg-surface border border-border rounded-3xl p-6 shadow-xs">
          {/* Section Header */}
          <div className="flex items-center gap-3 pb-4 border-b border-border/60 mb-5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center shrink-0">
              <Calculator className="w-4.5 h-4.5 text-amber-500" />
            </div>
            <div>
              <h2 className="font-lexend font-bold text-sm sm:text-base text-primary">
                {tTariffs("calcHeader")}
              </h2>
              <p className="text-[11px] sm:text-xs text-secondary">{tTariffs("calcSub")}</p>
            </div>
          </div>

          {/* Calculator Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* LEFT SIDE: Capacity Gauge & Dynamic Price Bar Slider */}
            <div className="lg:col-span-7 space-y-4 flex flex-col justify-between">
              {/* Unlimited Capacity Speedometer Gauge Widget */}
              <div className="bg-bg/80 border border-border rounded-2xl p-4.5 relative overflow-hidden flex flex-col sm:flex-row items-center gap-5">
                {/* SVG Speedometer Gauge Graphic */}
                {(() => {
                  const needleAngle = 5 + (gaugePercent / 100) * 170;
                  const dashOffset = 151 * (1 - gaugePercent / 100);
                  const isRed = gaugePercent <= 50;
                  const strokeColor = isRed ? "#ef4444" : "#10b981";
                  const glowColor = isRed ? "rgba(239, 68, 68, 0.6)" : "rgba(16, 185, 129, 0.6)";
                  const textColorClass = isRed ? "text-red-400" : "text-emerald-400";

                  return (
                    <div className="relative w-36 h-24 shrink-0 flex flex-col items-center justify-center pt-1">
                      <svg className="w-full h-full" viewBox="0 0 140 90">
                        {/* Background Arc Track */}
                        <path
                          d="M 22 75 A 48 48 0 0 1 118 75"
                          fill="none"
                          stroke="#262d3d"
                          strokeWidth="14"
                          strokeLinecap="round"
                        />
                        {/* Active Filled Progress Arc */}
                        <path
                          d="M 22 75 A 48 48 0 0 1 118 75"
                          fill="none"
                          stroke={strokeColor}
                          strokeWidth="14"
                          strokeLinecap="round"
                          style={{
                            strokeDasharray: 151,
                            strokeDashoffset: dashOffset,
                            transition: "stroke 0.4s ease, filter 0.4s ease",
                            filter: `drop-shadow(0px 0px 8px ${glowColor})`,
                          }}
                        />
                        {/* Red Needle Dial Rotating from 0% (5deg) to 100% (175deg) */}
                        <line
                          x1="70"
                          y1="75"
                          x2="28"
                          y2="75"
                          stroke="#ef4444"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          transform={`rotate(${needleAngle}, 70, 75)`}
                        />
                        {/* Red Pivot Center Dot */}
                        <circle cx="70" cy="75" r="5.5" fill="#ef4444" />
                        <circle cx="70" cy="75" r="2.5" fill="#ffffff" />
                      </svg>
                      {/* Gauge Text Below Pivot */}
                      <div className="flex items-center gap-1 mt-0.5">
                        <InfinityIcon className="w-3.5 h-3.5 text-accent" />
                        <span className={`text-[10px] font-black tracking-wider transition-colors duration-300 ${textColorClass}`}>
                          {gaugePercent}% {gaugePercent === 100 ? "FULL" : ""}
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* Gauge Info Text */}
                <div className="space-y-1.5 text-center sm:text-left">
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {tTariffs("gaugeStatus")}
                  </div>
                  <h3 className="font-lexend font-bold text-sm text-primary">
                    {tTariffs("unlimitedQuota")}
                  </h3>
                  <p className="text-xs text-secondary leading-relaxed">
                    Your current plan has zero restriction on XML dossier submissions, database uploads, or record generations.
                  </p>
                </div>
              </div>

              {/* Price Bar & Duration Controls */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-primary flex items-center gap-1.5">
                    <span>{tTariffs("durationLabel")}</span>
                    <span className="text-accent font-extrabold text-xs px-2.5 py-0.5 rounded-full bg-accent/10 border border-accent/20">
                      {leaseMonths} {tTariffs("months")}
                    </span>
                  </label>
                  {discountPct > 0 && (
                    <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      Save {totalSavingsKzt.toLocaleString()} KZT
                    </span>
                  )}
                </div>

                {/* Interactive Price & Duration Range Bar */}
                <div className="relative pt-0.5">
                  <input
                    type="range"
                    min="1"
                    max="24"
                    step="1"
                    value={leaseMonths}
                    onChange={(e) => setLeaseMonths(parseInt(e.target.value))}
                    className="w-full h-2 bg-bg rounded-lg appearance-none cursor-pointer accent-accent border border-border shadow-inner"
                  />
                </div>

                {/* Duration Presets Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {presetDurations.map((preset) => (
                    <button
                      key={preset.months}
                      type="button"
                      onClick={() => setLeaseMonths(preset.months)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all border text-center cursor-pointer ${
                        leaseMonths === preset.months
                          ? "bg-accent/15 border-accent text-accent shadow-xs"
                          : "bg-bg border-border text-secondary hover:text-primary hover:border-border/80"
                      }`}
                    >
                      <div>{preset.months} {tTariffs("months")}</div>
                      {preset.discount > 0 ? (
                        <div className="text-[10px] text-emerald-400 mt-0.5 font-bold">
                          {preset.discount}% OFF
                        </div>
                      ) : (
                        <div className="text-[10px] text-muted mt-0.5 font-medium">Standard</div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Price Breakdown Details Box */}
                <div className="bg-bg/70 p-3.5 rounded-2xl border border-border space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-secondary">{tTariffs("baseRate")}</span>
                    <span className="text-primary font-semibold">
                      {monthlyRateKzt.toLocaleString()} {tTariffs("perMonth")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-secondary">{tTariffs("appliedDiscount")}</span>
                    <span className="text-emerald-400 font-extrabold">
                      {tTariffs("discountPct", { pct: discountPct })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE: Calculated Money Display & Get Invoice Action */}
            <div className="lg:col-span-5 bg-gradient-to-b from-bg to-bg/60 border border-border p-6 rounded-2xl text-center flex flex-col justify-between shadow-xs relative overflow-hidden">
              <div className="absolute top-0 right-0 w-28 h-28 bg-accent/10 rounded-full blur-2xl pointer-events-none" />

              <div className="space-y-4">
                <span className="text-[10px] uppercase tracking-widest font-bold text-muted block">
                  {tTariffs("totalCalculationTitle")}
                </span>

                {/* Prominent Money Display */}
                <div className="py-2">
                  <div className="font-lexend font-black text-3xl sm:text-4xl text-accent tracking-tight drop-shadow-xs">
                    {totalPriceKzt.toLocaleString()}
                  </div>
                  <div className="text-xs font-bold text-accent/80 tracking-wider uppercase mt-1">
                    {tTariffs("kzt")}
                  </div>
                </div>

                {/* Features Included */}
                <div className="text-left bg-surface/70 border border-border/60 p-4 rounded-xl space-y-2.5">
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" /> Lease Benefits Included
                  </div>
                  <div className="text-xs text-secondary flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>24/7 Portal & eCTD Sequence Builder access</span>
                  </div>
                  <div className="text-xs text-secondary flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Automated XML Sequence validation & check</span>
                  </div>
                  <div className="text-xs text-secondary flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Dedicated VIP Support & Priority Execution</span>
                  </div>
                </div>
              </div>

              {/* Get Invoice Button */}
              <div className="pt-5">
                <button
                  type="button"
                  onClick={handleGetInvoice}
                  className="w-full py-3 px-5 bg-accent hover:bg-accent-hover text-white font-semibold text-xs rounded-full shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Receipt className="w-4 h-4" />
                  <span>{tTariffs("getInvoiceBtn")}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tariff Payment History & Execution Audit Table */}
        <div className="bg-surface border border-border rounded-3xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/60 text-secondary">
                  <th className="py-4.5 px-6 font-semibold">
                    <span className="inline-flex items-center gap-1.5">
                      {tTariffs("colInvoiceNo")}
                      <ChevronsUpDown className="w-3.5 h-3.5 text-muted/70" />
                    </span>
                  </th>
                  <th className="py-4.5 px-6 font-semibold">
                    <span className="inline-flex items-center gap-1.5">
                      {tTariffs("colQuantity")}
                      <ChevronsUpDown className="w-3.5 h-3.5 text-muted/70" />
                    </span>
                  </th>
                  <th className="py-4.5 px-6 font-semibold">
                    <span className="inline-flex items-center gap-1.5">
                      {tTariffs("colBillingDate")}
                      <ChevronsUpDown className="w-3.5 h-3.5 text-muted/70" />
                    </span>
                  </th>
                  <th className="py-4.5 px-6 font-semibold">
                    <span className="inline-flex items-center gap-1.5">
                      {tTariffs("colAmount")}
                      <ChevronsUpDown className="w-3.5 h-3.5 text-muted/70" />
                    </span>
                  </th>
                  <th className="py-4.5 px-6 font-semibold">
                    <span className="inline-flex items-center gap-1.5">
                      {tTariffs("colExecutionStatus")}
                      <ChevronsUpDown className="w-3.5 h-3.5 text-muted/70" />
                    </span>
                  </th>
                  <th className="py-4.5 px-6 font-semibold">
                    <span className="inline-flex items-center gap-1.5">
                      {tTariffs("colCompletionDate")}
                      <ChevronsUpDown className="w-3.5 h-3.5 text-muted/70" />
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {paymentHistory.map((item) => (
                  <tr key={item.invoiceNo} className="hover:bg-surface-raised/40 transition-colors">
                    <td className="py-4.5 px-6 font-mono font-semibold text-primary">{item.invoiceNo}</td>
                    <td className="py-4.5 px-6 font-medium text-primary text-sm">
                      {tTariffs.has(item.quantityKey as any)
                        ? tTariffs(item.quantityKey as any)
                        : item.quantityDefault}
                    </td>
                    <td className="py-4.5 px-6 text-secondary font-mono text-xs">{item.billingDate}</td>
                    <td className="py-4.5 px-6 font-bold text-accent text-xs">{item.amount}</td>
                    <td className="py-4.5 px-6">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        {tTariffs("statusCompleted")}
                      </span>
                    </td>
                    <td className="py-4.5 px-6 font-mono text-xs text-secondary">{item.completionDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}


"use client";

import React, { useState } from "react";
import { AppShell } from "../components/AppShell";
import {
  CreditCard,
  Calculator,
  Receipt,
  CheckCircle,
  ShieldCheck,
  Sparkle,
  TrendUp,
  HardDrives,
  Clock,
  DownloadSimple,
  ArrowRight,
  Info,
  Check,
  SlidersHorizontal,
} from "@phosphor-icons/react";
import toast from "react-hot-toast";

export default function TariffsPage() {
  const [leaseMonths, setLeaseMonths] = useState<number>(12);
  const monthlyRateKzt = 115000; // Rate in Kazakhstani Tenge (KZT) for Tariff M / Unlimited Lease

  const getDiscount = (months: number) => {
    if (months >= 24) return 0.20;
    if (months >= 12) return 0.15;
    if (months >= 6) return 0.10;
    return 0.0;
  };

  const discountPercent = getDiscount(leaseMonths);
  const discountMultiplier = 1 - discountPercent;
  const rawTotalPrice = leaseMonths * monthlyRateKzt;
  const totalPriceKzt = Math.round(rawTotalPrice * discountMultiplier);
  const savingsKzt = rawTotalPrice - totalPriceKzt;

  const [paymentHistory] = useState([
    {
      invoiceNo: "INV-KZ-2026-0091",
      quantity: "12 Months Unlimited Lease",
      billingDate: "2026-01-15",
      amount: "1,173,000 KZT",
      status: "Execution Completed",
      completionDate: "2026-01-15 11:20 AM",
    },
    {
      invoiceNo: "INV-KZ-2025-0842",
      quantity: "6 Months Storage (Tariff M)",
      billingDate: "2025-06-01",
      amount: "621,000 KZT",
      status: "Execution Completed",
      completionDate: "2025-06-01 14:05 PM",
    },
    {
      invoiceNo: "INV-KZ-2024-0310",
      quantity: "3 Months Pilot Pack",
      billingDate: "2024-03-10",
      amount: "345,000 KZT",
      status: "Execution Completed",
      completionDate: "2024-03-10 16:45 PM",
    },
  ]);

  const handleGetInvoice = () => {
    toast.success(
      `Official KZT Invoice generated for ${leaseMonths} months (${totalPriceKzt.toLocaleString()} KZT). Added to Payment History!`
    );
  };

  const durationOptions = [
    { months: 1, label: "1 Month", discount: "Base Rate" },
    { months: 6, label: "6 Months", discount: "10% OFF" },
    { months: 12, label: "12 Months", discount: "15% OFF", popular: true },
    { months: 24, label: "24 Months", discount: "20% OFF", bestValue: true },
  ];

  return (
    <AppShell>
      <div className="space-y-6 pb-10">
        {/* Page Hero Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface border border-border p-5 rounded-2xl shadow-xs">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-medium text-accent px-2 py-0.5 rounded bg-accent/10 border border-accent/20">
              Subscription & Capacity Management
            </span>
            <h1 className="font-lexend text-2xl font-bold text-primary mt-1">
              My Tariffs & Subscription Settings
            </h1>
            <p className="text-xs text-secondary mt-0.5">
              Monitor storage quotas, compute lease extension estimates in Kazakhstani Tenge (KZT), and track historical financial execution receipts.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button className="px-3 py-1.5 bg-bg hover:bg-surface-raised text-primary border border-border font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5">
              <DownloadSimple size={16} />
              <span>Export Audit Summary</span>
            </button>
          </div>
        </div>

        {/* Tariff Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Active Tariff */}
          <div className="bg-surface border border-border rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] text-muted font-semibold uppercase tracking-wider block mb-1">
                  Current Tariff Tier
                </span>
                <h3 className="font-lexend font-bold text-xl text-accent tracking-tight flex items-center gap-2">
                  Tariff OWN
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-accent/15 text-accent border border-accent/30">
                    Unlimited
                  </span>
                </h3>
              </div>
              <div className="w-9 h-9 rounded-xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center shrink-0">
                <CreditCard size={20} weight="bold" />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border/60 flex items-center justify-between">
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                <ShieldCheck size={14} weight="fill" /> Active Annual Lease
              </span>
              <span className="text-xs text-secondary font-medium">Enterprise License</span>
            </div>
          </div>

          {/* Card 2: Record Capacity */}
          <div className="bg-surface border border-border rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="w-full pr-3">
                <span className="text-[10px] text-muted font-semibold uppercase tracking-wider block mb-1">
                  Allowable Record Capacity
                </span>
                <h3 className="font-lexend font-bold text-xl text-primary tracking-tight">
                  1,200 <span className="text-xs font-normal text-secondary">Records</span>
                </h3>
              </div>
              <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center shrink-0">
                <HardDrives size={20} weight="bold" />
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4 space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-secondary">480 Consumed</span>
                <span className="text-accent font-semibold">40% Used</span>
              </div>
              <div className="h-1.5 w-full bg-bg rounded-full overflow-hidden border border-border/80">
                <div className="h-full bg-gradient-to-r from-accent via-sky-400 to-indigo-500 rounded-full w-[40%]" />
              </div>
            </div>
          </div>

          {/* Card 3: Lease Expiry */}
          <div className="bg-surface border border-border rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] text-muted font-semibold uppercase tracking-wider block mb-1">
                  Current Lease Expiry
                </span>
                <h3 className="font-lexend font-bold text-xl text-primary tracking-tight">
                  Jan 14, 2027
                </h3>
              </div>
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                <Clock size={20} weight="bold" />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border/60 flex items-center justify-between">
              <span className="text-xs text-amber-400 font-medium flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                <TrendUp size={14} weight="bold" /> 12 Months Remaining
              </span>
              <span className="text-xs text-secondary font-medium">Auto-renew Off</span>
            </div>
          </div>
        </div>

        {/* Interactive Tariff Calculator Section */}
        <div className="bg-surface border border-border rounded-2xl p-5 md:p-6 shadow-xs">
          {/* Header Title */}
          <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                <Calculator size={20} weight="bold" />
              </div>
              <div>
                <h2 className="font-lexend font-bold text-base text-primary flex items-center gap-2">
                  Lease Extension Calculator
                  <span className="text-[11px] font-normal text-muted bg-bg px-2 py-0.5 rounded-md border border-border">
                    Interactive KZT Estimator
                  </span>
                </h2>
                <p className="text-xs text-secondary mt-0.5 font-normal">
                  Select your lease extension window to calculate bulk volume discounts automatically.
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-xs text-secondary bg-bg px-2.5 py-1 rounded-lg border border-border">
              <SlidersHorizontal size={15} className="text-accent" />
              <span>Real-time Pricing</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Controls: Presets + Custom Slider (7 Columns) */}
            <div className="lg:col-span-7 space-y-5">
              {/* Presets Grid */}
              <div>
                <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-2.5">
                  Quick Select Duration:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {durationOptions.map((opt) => {
                    const isSelected = leaseMonths === opt.months;
                    return (
                      <button
                        key={opt.months}
                        onClick={() => setLeaseMonths(opt.months)}
                        className={`relative p-3 rounded-xl border text-left transition-all duration-150 flex flex-col justify-between ${
                          isSelected
                            ? "bg-accent/15 border-accent text-primary ring-1 ring-accent/30 shadow-xs"
                            : "bg-bg hover:bg-surface-raised border-border text-secondary hover:text-primary"
                        }`}
                      >
                        {opt.popular && (
                          <span className="absolute -top-2 right-2 px-1.5 py-0.5 bg-accent text-white text-[9px] font-semibold uppercase rounded">
                            Popular
                          </span>
                        )}
                        {opt.bestValue && (
                          <span className="absolute -top-2 right-2 px-1.5 py-0.5 bg-emerald-500 text-white text-[9px] font-semibold uppercase rounded">
                            Best Value
                          </span>
                        )}
                        <div>
                          <div className="font-lexend font-semibold text-xs text-primary flex items-center justify-between">
                            {opt.label}
                            {isSelected && <Check size={14} className="text-accent" weight="bold" />}
                          </div>
                        </div>
                        <div className="mt-2 text-[10px] font-medium">
                          <span
                            className={
                              opt.discount.includes("OFF")
                                ? "text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20"
                                : "text-muted"
                            }
                          >
                            {opt.discount}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Slider Input */}
              <div className="bg-bg p-4 rounded-xl border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-primary flex items-center gap-2">
                    Custom Duration:
                    <span className="text-accent font-semibold text-xs bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
                      {leaseMonths} {leaseMonths === 1 ? "Month" : "Months"}
                    </span>
                  </label>
                  {discountPercent > 0 && (
                    <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                      <Sparkle size={13} weight="fill" />
                      {Math.round(discountPercent * 100)}% Discount Applied
                    </span>
                  )}
                </div>

                <div className="relative pt-1">
                  <input
                    type="range"
                    min="1"
                    max="24"
                    value={leaseMonths}
                    onChange={(e) => setLeaseMonths(parseInt(e.target.value))}
                    className="w-full h-2 bg-surface-raised rounded-lg appearance-none cursor-pointer accent-accent border border-border"
                  />
                  <div className="flex items-center justify-between text-[10px] text-muted font-medium mt-2">
                    <span>1 Month</span>
                    <span>6 Months</span>
                    <span>12 Months</span>
                    <span>24 Months</span>
                  </div>
                </div>
              </div>

              {/* Rate Breakdown Table */}
              <div className="bg-bg p-3.5 rounded-xl border border-border space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-secondary">Standard Rate per Month:</span>
                  <span className="text-primary font-medium">{monthlyRateKzt.toLocaleString()} KZT</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-secondary">Gross Subtotal ({leaseMonths} mo):</span>
                  <span className="text-secondary line-through font-mono">
                    {rawTotalPrice.toLocaleString()} KZT
                  </span>
                </div>
                {savingsKzt > 0 && (
                  <div className="flex justify-between items-center text-emerald-400 font-medium pt-1 border-t border-border/50">
                    <span className="flex items-center gap-1">
                      <Sparkle size={13} /> Total Bulk Savings:
                    </span>
                    <span className="font-mono font-semibold">-{savingsKzt.toLocaleString()} KZT</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Summary Card (5 Columns) */}
            <div className="lg:col-span-5 bg-surface-raised border border-border p-5 rounded-2xl space-y-5 shadow-xs">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-accent block mb-1">
                  ESTIMATED TOTAL INVESTMENT
                </span>
                <div className="font-lexend font-bold text-2xl text-primary tracking-tight">
                  {totalPriceKzt.toLocaleString()}{" "}
                  <span className="text-base font-semibold text-accent">KZT</span>
                </div>
                <p className="text-xs text-secondary mt-1.5 leading-relaxed font-normal">
                  Includes full unlimited schema processing, automated XML verification engine, and 24/7 priority support.
                </p>
              </div>

              <div className="space-y-2 pt-3 border-t border-border">
                <div className="flex items-center gap-2 text-xs text-secondary">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                    <Check size={11} weight="bold" />
                  </div>
                  <span>Instant license activation upon receipt</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-secondary">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                    <Check size={11} weight="bold" />
                  </div>
                  <span>Official tax-compliant KZT invoice generation</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-secondary">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                    <Check size={11} weight="bold" />
                  </div>
                  <span>Locked-in pricing guarantee during lease</span>
                </div>
              </div>

              <button
                onClick={handleGetInvoice}
                className="w-full py-2.5 px-4 bg-accent hover:bg-accent-hover text-white font-semibold text-xs rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Receipt size={16} weight="bold" />
                <span>Get Official Invoice (KZT)</span>
                <ArrowRight size={14} weight="bold" />
              </button>
            </div>
          </div>
        </div>

        {/* Tariff Payment Audit History */}
        <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xs">
          <div className="p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center shrink-0">
                <Receipt size={20} weight="bold" />
              </div>
              <div>
                <h2 className="font-lexend font-bold text-base text-primary">
                  Payment History & Execution Audit
                </h2>
                <p className="text-xs text-secondary font-normal">
                  Immutable record of past subscription payments and financial completions
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted font-medium bg-bg px-2.5 py-1 rounded-lg border border-border">
                Total Orders: <strong className="text-primary font-semibold">{paymentHistory.length}</strong>
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-secondary">
              <thead className="bg-bg/90 text-primary uppercase font-semibold text-[10px] tracking-wider border-b border-border">
                <tr>
                  <th className="py-3.5 px-5">Invoice Identifier</th>
                  <th className="py-3.5 px-5">Subscription Lease Package</th>
                  <th className="py-3.5 px-5">Billing Date</th>
                  <th className="py-3.5 px-5">Total Amount (KZT)</th>
                  <th className="py-3.5 px-5">Execution Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {paymentHistory.map((item) => (
                  <tr
                    key={item.invoiceNo}
                    className="hover:bg-surface-raised/70 transition-colors group"
                  >
                    <td className="py-3.5 px-5 font-mono font-medium text-primary flex items-center gap-2">
                      <Receipt size={16} className="text-accent" />
                      {item.invoiceNo}
                    </td>
                    <td className="py-3.5 px-5 font-medium text-primary">{item.quantity}</td>
                    <td className="py-3.5 px-5 text-secondary">{item.billingDate}</td>
                    <td className="py-3.5 px-5 font-mono font-semibold text-accent">{item.amount}</td>
                    <td className="py-3.5 px-5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                        <CheckCircle size={14} weight="fill" />
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => toast.success(`Downloading PDF for ${item.invoiceNo}`)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:text-accent-hover transition-colors px-2 py-1 rounded-md hover:bg-accent/10"
                        title="Download Invoice PDF"
                      >
                        <DownloadSimple size={15} weight="bold" />
                        <span>PDF</span>
                      </button>
                    </td>
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




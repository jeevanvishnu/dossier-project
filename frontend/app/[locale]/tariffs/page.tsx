"use client";

import React, { useState } from "react";
import { AppShell } from "../../components/AppShell";
import { useTranslations } from "next-intl";
import { CreditCard, Calculator, Receipt, ShieldCheck, CheckCircle } from "@phosphor-icons/react";
import { toast } from "sonner";

export default function TariffsPage() {
  const tTariffs = useTranslations("tariffs");

  const [leaseMonths, setLeaseMonths] = useState(12);
  const monthlyRateKzt = 115000;
  const discountMultiplier = leaseMonths >= 12 ? 0.85 : leaseMonths >= 6 ? 0.9 : 1.0;
  const totalPriceKzt = Math.round(monthlyRateKzt * leaseMonths * discountMultiplier);

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
    toast.success(tTariffs("invoiceToast", { months: leaseMonths, amount: totalPriceKzt.toLocaleString() }));
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="bg-surface border border-border p-5 rounded-2xl shadow-xs">
          <span className="text-[10px] uppercase tracking-wider font-bold text-accent px-2 py-0.5 rounded bg-accent/10 border border-accent/20">
            {tTariffs("badgeLabel")}
          </span>
          <h1 className="font-lexend text-2xl font-bold text-primary mt-1">
            {tTariffs("title")}
          </h1>
          <p className="text-xs text-secondary">
            {tTariffs("sub")}
          </p>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 pb-4 border-b border-border mb-5">
            <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center">
              <CreditCard size={22} />
            </div>
            <div>
              <h2 className="font-lexend font-bold text-base text-primary">{tTariffs("infoHeader")}</h2>
              <p className="text-xs text-secondary">{tTariffs("infoSub")}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-bg p-4 rounded-xl border border-border">
              <span className="text-[10px] text-muted font-bold uppercase tracking-wider block mb-1">{tTariffs("activePlanLabel")}</span>
              <span className="font-lexend font-extrabold text-xl text-accent block">Tariff OWN (Unlimited)</span>
              <span className="text-[11px] text-emerald-500 font-semibold flex items-center gap-1 mt-1">
                <ShieldCheck size={14} /> {tTariffs("activeLeaseStatus")}
              </span>
            </div>

            <div className="bg-bg p-4 rounded-xl border border-border">
              <span className="text-[10px] text-muted font-bold uppercase tracking-wider block mb-1">{tTariffs("capacityLabel")}</span>
              <span className="font-lexend font-extrabold text-xl text-primary block">{tTariffs("capacityValue")}</span>
              <span className="text-[11px] text-secondary block mt-1">{tTariffs("capacityConsumed")}</span>
            </div>

            <div className="bg-bg p-4 rounded-xl border border-border">
              <span className="text-[10px] text-muted font-bold uppercase tracking-wider block mb-1">{tTariffs("expiryLabel")}</span>
              <span className="font-lexend font-extrabold text-xl text-primary block">{tTariffs("expiryValue")}</span>
              <span className="text-[11px] text-accent font-semibold block mt-1">{tTariffs("expiryRemaining")}</span>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 pb-4 border-b border-border mb-5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center">
              <Calculator size={22} />
            </div>
            <div>
              <h2 className="font-lexend font-bold text-base text-primary">{tTariffs("calcHeader")}</h2>
              <p className="text-xs text-secondary">{tTariffs("calcSub")}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-primary mb-2">
                  {tTariffs("durationLabel")} <span className="text-accent font-extrabold">{leaseMonths} {tTariffs("months")}</span>
                </label>

                <input
                  type="range"
                  min="1"
                  max="24"
                  value={leaseMonths}
                  onChange={(e) => setLeaseMonths(parseInt(e.target.value))}
                  className="w-full h-2 bg-bg rounded-lg appearance-none cursor-pointer accent-accent border border-border"
                />

                <div className="flex items-center justify-between text-[10px] text-muted font-bold mt-2">
                  <span>{tTariffs("month1")}</span>
                  <span>{tTariffs("month6")}</span>
                  <span>{tTariffs("month12")}</span>
                  <span>{tTariffs("month24")}</span>
                </div>
              </div>

              <div className="bg-bg p-3.5 rounded-xl border border-border space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-secondary">{tTariffs("baseRate")}</span>
                  <span className="text-primary font-medium">{monthlyRateKzt.toLocaleString()} {tTariffs("perMonth")}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-secondary">{tTariffs("appliedDiscount")}</span>
                  <span className="text-emerald-500 font-bold">{tTariffs("discountPct", { pct: Math.round((1 - discountMultiplier) * 100) })}</span>
                </div>
              </div>
            </div>

            <div className="bg-bg border border-border p-6 rounded-2xl text-center space-y-4 shadow-xs">
              <span className="text-[10px] uppercase tracking-wider font-bold text-muted block">
                {tTariffs("totalCalculationTitle")}
              </span>
              <div className="font-lexend font-black text-3xl text-accent">
                {totalPriceKzt.toLocaleString()} <span className="text-lg">{tTariffs("kzt")}</span>
              </div>
              <p className="text-xs text-secondary">
                {tTariffs("includesText")}
              </p>

              <button
                onClick={handleGetInvoice}
                className="w-full py-3 bg-accent hover:bg-accent-hover text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Receipt size={18} />
                <span>{tTariffs("getInvoiceBtn")}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-border flex items-center gap-2">
            <Receipt size={20} className="text-accent" />
            <h2 className="font-lexend font-bold text-base text-primary">
              {tTariffs("historyTitle")}
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-secondary">
              <thead className="bg-bg text-primary uppercase font-bold text-[10px] tracking-wider border-b border-border">
                <tr>
                  <th className="py-3.5 px-4">{tTariffs("colInvoiceNo")}</th>
                  <th className="py-3.5 px-4">{tTariffs("colQuantity")}</th>
                  <th className="py-3.5 px-4">{tTariffs("colBillingDate")}</th>
                  <th className="py-3.5 px-4">{tTariffs("colAmount")}</th>
                  <th className="py-3.5 px-4">{tTariffs("colExecutionStatus")}</th>
                  <th className="py-3.5 px-4">{tTariffs("colCompletionDate")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paymentHistory.map((item) => (
                  <tr key={item.invoiceNo} className="hover:bg-surface-raised transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-primary">{item.invoiceNo}</td>
                    <td className="py-3.5 px-4 font-medium text-primary">
                      {tTariffs.has(item.quantityKey as any) ? tTariffs(item.quantityKey as any) : item.quantityDefault}
                    </td>
                    <td className="py-3.5 px-4">{item.billingDate}</td>
                    <td className="py-3.5 px-4 font-bold text-accent">{item.amount}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        <CheckCircle size={14} />
                        {tTariffs("statusCompleted")}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium">{item.completionDate}</td>
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

"use client";

import React, { useState } from "react";
import { AppShell } from "../../components/AppShell";
import { useTranslations } from "next-intl";
import { Receipt, CheckCircle, MagnifyingGlass, DownloadSimple } from "@phosphor-icons/react";
import { toast } from "sonner";

export default function PaymentsPage() {
  const tPayments = useTranslations("payments");
  const [searchTerm, setSearchTerm] = useState("");

  const [transactions] = useState([
    {
      txHash: "TX-KZ-9928101",
      invoiceNo: "INV-KZ-2026-0091",
      descKey: "desc12Months",
      descDefault: "12 Months Unlimited Lease (Tariff OWN)",
      date: "2026-01-15 11:20 AM",
      amountKzt: "1,173,000 KZT",
      method: "Kaspi Business / Wire Transfer",
      status: "Completed",
    },
    {
      txHash: "TX-KZ-8812902",
      invoiceNo: "INV-KZ-2025-0842",
      descKey: "desc6Months",
      descDefault: "6 Months Storage (Tariff M)",
      date: "2025-06-01 14:05 PM",
      amountKzt: "621,000 KZT",
      method: "Halyk Bank Corporate",
      status: "Completed",
    },
    {
      txHash: "TX-KZ-7729103",
      invoiceNo: "INV-KZ-2024-0310",
      descKey: "desc3Months",
      descDefault: "3 Months Pilot Registration Pack",
      date: "2024-03-10 16:45 PM",
      amountKzt: "345,000 KZT",
      method: "BCC Corporate Card",
      status: "Completed",
    },
  ]);

  const filtered = transactions.filter((t) => {
    const descLabel = tPayments.has(t.descKey as any) ? tPayments(t.descKey as any) : t.descDefault;
    return (
      t.txHash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      descLabel.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="bg-surface border border-border p-5 rounded-2xl shadow-xs">
          <span className="text-[10px] uppercase tracking-wider font-bold text-accent px-2 py-0.5 rounded bg-accent/10 border border-accent/20">
            {tPayments("badgeLabel")}
          </span>
          <h1 className="font-lexend text-2xl font-bold text-primary mt-1">
            {tPayments("title")}
          </h1>
          <p className="text-xs text-secondary">
            {tPayments("sub")}
          </p>
        </div>

        <div className="bg-surface border border-border p-4 rounded-2xl flex items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-2 bg-bg border border-border rounded-xl px-3 py-2 text-xs text-muted w-full sm:w-80">
            <MagnifyingGlass size={16} className="text-muted shrink-0" />
            <input
              type="text"
              placeholder={tPayments("searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-primary outline-none w-full text-xs"
            />
          </div>

          <button
            onClick={() => toast.success(tPayments("exportedToast"))}
            className="px-3 py-1.5 bg-bg hover:bg-surface-raised text-primary border border-border font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <DownloadSimple size={14} className="text-accent" />
            <span>{tPayments("exportCsv")}</span>
          </button>
        </div>

        <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-border flex items-center gap-2">
            <Receipt size={20} className="text-accent" />
            <h2 className="font-lexend font-bold text-base text-primary">
              {tPayments("tableTitle")}
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-secondary">
              <thead className="bg-bg text-primary uppercase font-bold text-[10px] tracking-wider border-b border-border">
                <tr>
                  <th className="py-3.5 px-4">{tPayments("colTxHash")}</th>
                  <th className="py-3.5 px-4">{tPayments("colInvoiceNo")}</th>
                  <th className="py-3.5 px-4">{tPayments("colDesc")}</th>
                  <th className="py-3.5 px-4">{tPayments("colMethod")}</th>
                  <th className="py-3.5 px-4">{tPayments("colDate")}</th>
                  <th className="py-3.5 px-4">{tPayments("colAmount")}</th>
                  <th className="py-3.5 px-4">{tPayments("colStatus")}</th>
                  <th className="py-3.5 px-4 text-right">{tPayments("colReceipt")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((t) => (
                  <tr key={t.txHash} className="hover:bg-surface-raised transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-accent">{t.txHash}</td>
                    <td className="py-3.5 px-4 font-mono text-primary">{t.invoiceNo}</td>
                    <td className="py-3.5 px-4 text-primary font-medium">
                      {tPayments.has(t.descKey as any) ? tPayments(t.descKey as any) : t.descDefault}
                    </td>
                    <td className="py-3.5 px-4 text-secondary">{t.method}</td>
                    <td className="py-3.5 px-4 font-medium">{t.date}</td>
                    <td className="py-3.5 px-4 font-extrabold text-accent">{t.amountKzt}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        <CheckCircle size={14} />
                        {tPayments("statusCompleted")}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => toast.success(tPayments("downloadToast", { id: t.txHash }))}
                        className="p-1 text-accent hover:bg-accent/15 rounded transition-colors inline-flex items-center gap-1 font-semibold cursor-pointer"
                      >
                        <DownloadSimple size={14} />
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

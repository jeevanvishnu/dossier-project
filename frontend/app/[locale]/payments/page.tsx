"use client";

import React, { useState } from "react";
import { AppShell } from "../../components/AppShell";
import { useTranslations } from "next-intl";
import {
  CheckCircle,
  MagnifyingGlass,
  DownloadSimple,
  CaretUpDown,
  FileArrowDown,
} from "@phosphor-icons/react";
import { toast } from "sonner";

export default function PaymentsPage() {
  const tPayments = useTranslations("payments");
  const tCommon = useTranslations("common");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "completed">("all");

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

  const completedCount = transactions.filter((t) => t.status === "Completed").length;

  const filtered = transactions.filter((t) => {
    const descLabel = tPayments.has(t.descKey as any) ? tPayments(t.descKey as any) : t.descDefault;
    const matchesSearch =
      t.txHash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      descLabel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.method.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || (filterStatus === "completed" && t.status === "Completed");
    return matchesSearch && matchesStatus;
  });

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Top Header Row matching the 'Employees' clean model */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-3">
            <h1 className="font-lexend text-2xl font-bold text-primary tracking-tight">
              {tPayments("title")}
            </h1>

            {/* Segmented Pill Tabs */}
            <div className="inline-flex items-center p-1 bg-surface border border-border rounded-full shadow-xs">
              <button
                type="button"
                onClick={() => setFilterStatus("completed")}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  filterStatus === "completed"
                    ? "bg-accent text-white shadow-xs"
                    : "text-secondary hover:text-primary"
                }`}
              >
                <span>{tPayments("statusCompleted")}</span>
                <span
                  className={`w-4.5 h-4.5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    filterStatus === "completed" ? "bg-white/20 text-white" : "bg-surface-raised text-muted"
                  }`}
                >
                  {completedCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFilterStatus("all")}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  filterStatus === "all"
                    ? "bg-accent text-white shadow-xs"
                    : "text-secondary hover:text-primary"
                }`}
              >
                <span>{tCommon("viewAll") || "All"}</span>
                <span
                  className={`w-4.5 h-4.5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    filterStatus === "all" ? "bg-white/20 text-white" : "bg-surface-raised text-muted"
                  }`}
                >
                  {transactions.length}
                </span>
              </button>
            </div>
          </div>

          {/* Action Button & Search */}
          <div className="flex items-center gap-3 self-start md:self-end">
            <div className="flex items-center gap-2 bg-surface border border-border rounded-full px-4 py-2 text-xs text-muted w-52 sm:w-64 shadow-xs focus-within:border-accent transition-colors">
              <MagnifyingGlass size={15} className="text-muted shrink-0" />
              <input
                type="text"
                placeholder={tPayments("searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent text-primary outline-none w-full text-xs placeholder:text-muted"
              />
            </div>

            <button
              type="button"
              onClick={() => toast.success(tPayments("exportedToast"))}
              className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white font-semibold text-xs rounded-full shadow-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <FileArrowDown size={16} weight="bold" />
              <span>{tPayments("exportCsv")}</span>
            </button>
          </div>
        </div>

        {/* Clean Rounded Table Container */}
        <div className="bg-surface border border-border rounded-3xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/60 text-secondary">
                  <th className="py-4.5 px-6 font-semibold">
                    <span className="inline-flex items-center gap-1.5">
                      {tPayments("colTxHash")}
                      <CaretUpDown size={14} className="text-muted/70" />
                    </span>
                  </th>
                  <th className="py-4.5 px-6 font-semibold">
                    <span className="inline-flex items-center gap-1.5">
                      {tPayments("colInvoiceNo")}
                      <CaretUpDown size={14} className="text-muted/70" />
                    </span>
                  </th>
                  <th className="py-4.5 px-6 font-semibold">
                    <span className="inline-flex items-center gap-1.5">
                      {tPayments("colDesc")}
                      <CaretUpDown size={14} className="text-muted/70" />
                    </span>
                  </th>
                  <th className="py-4.5 px-6 font-semibold">
                    <span className="inline-flex items-center gap-1.5">
                      {tPayments("colMethod")}
                      <CaretUpDown size={14} className="text-muted/70" />
                    </span>
                  </th>
                  <th className="py-4.5 px-6 font-semibold">
                    <span className="inline-flex items-center gap-1.5">
                      {tPayments("colDate")}
                      <CaretUpDown size={14} className="text-muted/70" />
                    </span>
                  </th>
                  <th className="py-4.5 px-6 font-semibold">
                    <span className="inline-flex items-center gap-1.5">
                      {tPayments("colAmount")}
                      <CaretUpDown size={14} className="text-muted/70" />
                    </span>
                  </th>
                  <th className="py-4.5 px-6 font-semibold">
                    <span className="inline-flex items-center gap-1.5">
                      {tPayments("colStatus")}
                      <CaretUpDown size={14} className="text-muted/70" />
                    </span>
                  </th>
                  <th className="py-4.5 px-6 text-right font-semibold">
                    {tPayments("colReceipt")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-muted">
                      No transactions found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((t) => (
                    <tr
                      key={t.txHash}
                      className="hover:bg-surface-raised/40 transition-colors"
                    >
                      <td className="py-4.5 px-6 font-mono font-semibold text-accent text-xs">
                        {t.txHash}
                      </td>
                      <td className="py-4.5 px-6 font-mono text-primary text-xs">
                        {t.invoiceNo}
                      </td>
                      <td className="py-4.5 px-6 text-primary font-medium text-sm">
                        {tPayments.has(t.descKey as any) ? tPayments(t.descKey as any) : t.descDefault}
                      </td>
                      <td className="py-4.5 px-6 text-secondary text-xs">
                        {t.method}
                      </td>
                      <td className="py-4.5 px-6 text-secondary font-mono text-xs">
                        {t.date}
                      </td>
                      <td className="py-4.5 px-6 font-bold text-accent text-xs">
                        {t.amountKzt}
                      </td>
                      <td className="py-4.5 px-6">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle size={13} weight="fill" />
                          {tPayments("statusCompleted")}
                        </span>
                      </td>
                      <td className="py-4.5 px-6 text-right">
                        <button
                          type="button"
                          onClick={() => toast.success(tPayments("downloadToast", { id: t.txHash }))}
                          title={tPayments("colReceipt")}
                          className="w-8 h-8 rounded-full bg-surface-raised hover:bg-accent/15 text-secondary hover:text-accent border border-border/60 transition-all inline-flex items-center justify-center cursor-pointer shadow-xs"
                        >
                          <DownloadSimple size={15} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

"use client";

import React, { useState } from "react";
import { AppShell } from "../../components/AppShell";
import {
  Plus,
  DownloadSimple,
  MagnifyingGlass,
  CaretUpDown,
  CheckCircle,
  WarningOctagon,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export default function ContractsPage() {
  const tContracts = useTranslations("contracts");
  const tCommon = useTranslations("common");

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "active" | "expired">("all");

  const [contracts] = useState([
    {
      id: "ITAVE-KZ-2026-8812",
      typeKey: "typeAnnualLease",
      typeDefault: "Annual Storage Lease (Tariff OWN)",
      startDate: "2026-01-15",
      endDate: "2027-01-14",
      status: "Active Legal",
      parties: "PharmaKZ LLC / ITAVE Digital",
    },
    {
      id: "ITAVE-KZ-2025-4102",
      typeKey: "typeMonthlyTierM",
      typeDefault: "Monthly Record Tier M",
      startDate: "2025-06-01",
      endDate: "2026-05-31",
      status: "Active Legal",
      parties: "MedTech Asia / ITAVE Digital",
    },
    {
      id: "ITAVE-KZ-2024-1109",
      typeKey: "typeInitialReg",
      typeDefault: "Initial Registration Agreement",
      startDate: "2024-03-10",
      endDate: "2025-03-09",
      status: "Expired Terms",
      parties: "Biomedical KZ / ITAVE Digital",
    },
    {
      id: "ITAVE-KZ-2023-0045",
      typeKey: "typePilotDossier",
      typeDefault: "Pilot Dossier Processing Contract",
      startDate: "2023-01-01",
      endDate: "2023-12-31",
      status: "Expired Terms",
      parties: "KazPharma Group / ITAVE Digital",
    },
  ]);

  const activeCount = contracts.filter((c) => c.status === "Active Legal").length;
  const expiredCount = contracts.filter((c) => c.status === "Expired Terms").length;

  const filteredContracts = contracts.filter((c) => {
    const typeLabel = tContracts.has(c.typeKey as any) ? tContracts(c.typeKey as any) : c.typeDefault;
    const matchesSearch =
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      typeLabel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.parties.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterType === "all" ||
      (filterType === "active" && c.status === "Active Legal") ||
      (filterType === "expired" && c.status === "Expired Terms");
    return matchesSearch && matchesStatus;
  });

  const handleDownloadPdf = (contractId: string) => {
    toast.success(tContracts("downloadPdfToast", { id: contractId }));
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Top Header Row matching the 'Employees' clean model */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-3">
            <h1 className="font-lexend text-2xl font-bold text-primary tracking-tight">
              {tContracts("title")}
            </h1>

            {/* Segmented Pill Tabs */}
            <div className="inline-flex items-center p-1 bg-surface border border-border rounded-full shadow-xs">
              <button
                type="button"
                onClick={() => setFilterType("active")}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  filterType === "active"
                    ? "bg-accent text-white shadow-xs"
                    : "text-secondary hover:text-primary"
                }`}
              >
                <span>{tContracts("statusActive")}</span>
                <span
                  className={`w-4.5 h-4.5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    filterType === "active" ? "bg-white/20 text-white" : "bg-surface-raised text-muted"
                  }`}
                >
                  {activeCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFilterType("expired")}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  filterType === "expired"
                    ? "bg-accent text-white shadow-xs"
                    : "text-secondary hover:text-primary"
                }`}
              >
                <span>{tContracts("statusExpired")}</span>
                <span
                  className={`w-4.5 h-4.5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    filterType === "expired" ? "bg-white/20 text-white" : "bg-surface-raised text-muted"
                  }`}
                >
                  {expiredCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFilterType("all")}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  filterType === "all"
                    ? "bg-accent text-white shadow-xs"
                    : "text-secondary hover:text-primary"
                }`}
              >
                <span>{tCommon("viewAll") || "All"}</span>
                <span
                  className={`w-4.5 h-4.5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    filterType === "all" ? "bg-white/20 text-white" : "bg-surface-raised text-muted"
                  }`}
                >
                  {contracts.length}
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
                placeholder={tContracts("searchContracts")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent text-primary outline-none w-full text-xs placeholder:text-muted"
              />
            </div>

            <button
              type="button"
              onClick={() => toast.success(tContracts("requestInitiatedToast"))}
              className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white font-semibold text-xs rounded-full shadow-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Plus size={16} weight="bold" />
              <span>{tContracts("createContract")}</span>
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
                      {tContracts("colNumber")}
                      <CaretUpDown size={14} className="text-muted/70" />
                    </span>
                  </th>
                  <th className="py-4.5 px-6 font-semibold">
                    <span className="inline-flex items-center gap-1.5">
                      {tContracts("colType")}
                      <CaretUpDown size={14} className="text-muted/70" />
                    </span>
                  </th>
                  <th className="py-4.5 px-6 font-semibold">
                    <span className="inline-flex items-center gap-1.5">
                      {tContracts("colPartner")}
                      <CaretUpDown size={14} className="text-muted/70" />
                    </span>
                  </th>
                  <th className="py-4.5 px-6 font-semibold">
                    <span className="inline-flex items-center gap-1.5">
                      {tContracts("colStartDate")}
                      <CaretUpDown size={14} className="text-muted/70" />
                    </span>
                  </th>
                  <th className="py-4.5 px-6 font-semibold">
                    <span className="inline-flex items-center gap-1.5">
                      {tContracts("colValidUntil")}
                      <CaretUpDown size={14} className="text-muted/70" />
                    </span>
                  </th>
                  <th className="py-4.5 px-6 font-semibold">
                    <span className="inline-flex items-center gap-1.5">
                      {tContracts("colStatus")}
                      <CaretUpDown size={14} className="text-muted/70" />
                    </span>
                  </th>
                  <th className="py-4.5 px-6 text-right font-semibold">
                    {tContracts("colActions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredContracts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted">
                      No contracts found.
                    </td>
                  </tr>
                ) : (
                  filteredContracts.map((c) => (
                    <tr
                      key={c.id}
                      className="hover:bg-surface-raised/40 transition-colors"
                    >
                      <td className="py-4.5 px-6 font-mono font-semibold text-primary text-xs">
                        {c.id}
                      </td>
                      <td className="py-4.5 px-6 font-medium text-primary text-sm">
                        {tContracts.has(c.typeKey as any) ? tContracts(c.typeKey as any) : c.typeDefault}
                      </td>
                      <td className="py-4.5 px-6 text-secondary text-xs">
                        {c.parties}
                      </td>
                      <td className="py-4.5 px-6 text-secondary font-mono text-xs">
                        {c.startDate}
                      </td>
                      <td className="py-4.5 px-6 text-secondary font-mono text-xs">
                        {c.endDate}
                      </td>
                      <td className="py-4.5 px-6">
                        {c.status === "Active Legal" ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle size={13} weight="fill" />
                            {tContracts("statusActive")}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            <WarningOctagon size={13} weight="fill" />
                            {tContracts("statusExpired")}
                          </span>
                        )}
                      </td>
                      <td className="py-4.5 px-6 text-right">
                        <button
                          type="button"
                          onClick={() => handleDownloadPdf(c.id)}
                          title={tContracts("downloadPdf")}
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

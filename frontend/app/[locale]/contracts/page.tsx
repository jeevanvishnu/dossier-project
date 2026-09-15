"use client";

import React, { useState } from "react";
import { AppShell } from "../../components/AppShell";
import { FileText, CheckCircle, WarningOctagon, Plus, DownloadSimple, MagnifyingGlass } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

export default function ContractsPage() {
  const tContracts = useTranslations("contracts");
  const tCommon = useTranslations("common");

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const [contracts] = useState([
    {
      id: "ECTC-KZ-2026-8812",
      typeKey: "typeAnnualLease",
      typeDefault: "Annual Storage Lease (Tariff OWN)",
      startDate: "2026-01-15",
      endDate: "2027-01-14",
      status: "Active Legal",
      parties: "PharmaKZ LLC / ECTC Digital",
    },
    {
      id: "ECTC-KZ-2025-4102",
      typeKey: "typeMonthlyTierM",
      typeDefault: "Monthly Record Tier M",
      startDate: "2025-06-01",
      endDate: "2026-05-31",
      status: "Active Legal",
      parties: "MedTech Asia / ECTC Digital",
    },
    {
      id: "ECTC-KZ-2024-1109",
      typeKey: "typeInitialReg",
      typeDefault: "Initial Registration Agreement",
      startDate: "2024-03-10",
      endDate: "2025-03-09",
      status: "Expired Terms",
      parties: "Biomedical KZ / ECTC Digital",
    },
    {
      id: "ECTC-KZ-2023-0045",
      typeKey: "typePilotDossier",
      typeDefault: "Pilot Dossier Processing Contract",
      startDate: "2023-01-01",
      endDate: "2023-12-31",
      status: "Expired Terms",
      parties: "KazPharma Group / ECTC Digital",
    },
  ]);

  const filteredContracts = contracts.filter((c) => {
    const typeLabel = tContracts.has(c.typeKey as any) ? tContracts(c.typeKey as any) : c.typeDefault;
    const matchesSearch = c.id.toLowerCase().includes(searchTerm.toLowerCase()) || typeLabel.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterType === "all" || (filterType === "active" && c.status === "Active Legal") || (filterType === "expired" && c.status === "Expired Terms");
    return matchesSearch && matchesStatus;
  });

  const handleDownloadPdf = (contractId: string) => {
    toast.success(tContracts("downloadPdfToast", { id: contractId }));
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface border border-border p-5 rounded-2xl shadow-xs">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-medium text-accent px-2 py-0.5 rounded bg-accent/10 border border-accent/20">
              {tContracts("badgeLabel")}
            </span>
            <h1 className="font-lexend text-2xl font-bold text-primary mt-1">
              {tContracts("title")}
            </h1>
            <p className="text-xs text-secondary">
              {tContracts("sub")}
            </p>
          </div>

          <button
            onClick={() => toast.success(tContracts("requestInitiatedToast"))}
            className="px-4 py-2 bg-accent hover:bg-accent-hover text-white font-medium text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Plus size={16} />
            <span>{tContracts("createContract")}</span>
          </button>
        </div>

        <div className="bg-surface border border-border p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-2 bg-bg border border-border rounded-xl px-3 py-2 text-xs text-muted w-full sm:w-80">
            <MagnifyingGlass size={16} className="text-muted shrink-0" />
            <input
              type="text"
              placeholder={tContracts("searchContracts")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-primary outline-none w-full text-xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setFilterType("all")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                filterType === "all" ? "bg-accent text-white" : "bg-bg text-secondary hover:text-primary border border-border"
              }`}
            >
              {tContracts("filterStatus")} ({contracts.length})
            </button>
            <button
              onClick={() => setFilterType("active")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                filterType === "active" ? "bg-emerald-500 text-white" : "bg-bg text-secondary hover:text-primary border border-border"
              }`}
            >
              {tContracts("statusActive")}
            </button>
            <button
              onClick={() => setFilterType("expired")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                filterType === "expired" ? "bg-red-500 text-white" : "bg-bg text-secondary hover:text-primary border border-border"
              }`}
            >
              {tContracts("statusExpired")}
            </button>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-border flex items-center gap-2">
            <FileText size={20} className="text-accent" />
            <h2 className="font-lexend font-bold text-base text-primary">
              {tContracts("title")}
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-secondary">
              <thead className="bg-bg text-primary uppercase font-bold text-[10px] tracking-wider border-b border-border">
                <tr>
                  <th className="py-3.5 px-4">{tContracts("colNumber")}</th>
                  <th className="py-3.5 px-4">{tContracts("colType")}</th>
                  <th className="py-3.5 px-4">{tContracts("colPartner")}</th>
                  <th className="py-3.5 px-4">{tContracts("colStartDate")}</th>
                  <th className="py-3.5 px-4">{tContracts("colValidUntil")}</th>
                  <th className="py-3.5 px-4">{tContracts("colStatus")}</th>
                  <th className="py-3.5 px-4 text-right">{tContracts("colActions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredContracts.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-raised transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-primary">{c.id}</td>
                    <td className="py-3.5 px-4 font-medium text-primary">
                      {tContracts.has(c.typeKey as any) ? tContracts(c.typeKey as any) : c.typeDefault}
                    </td>
                    <td className="py-3.5 px-4 text-secondary">{c.parties}</td>
                    <td className="py-3.5 px-4 font-medium">{c.startDate}</td>
                    <td className="py-3.5 px-4 font-medium">{c.endDate}</td>
                    <td className="py-3.5 px-4">
                      {c.status === "Active Legal" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          <CheckCircle size={14} />
                          {tContracts("statusActive")}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/10 text-red-500 border border-red-500/20">
                          <WarningOctagon size={14} />
                          {tContracts("statusExpired")}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDownloadPdf(c.id)}
                        className="p-1.5 text-accent hover:bg-accent/15 rounded-lg transition-colors inline-flex items-center gap-1 font-semibold text-[11px] cursor-pointer"
                      >
                        <DownloadSimple size={14} />
                        <span>{tContracts("downloadPdf")}</span>
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

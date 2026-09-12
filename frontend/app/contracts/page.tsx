"use client";

import React, { useState } from "react";
import { AppShell } from "../components/AppShell";
import { FileText, CheckCircle, WarningOctagon, Plus, DownloadSimple, MagnifyingGlass } from "@phosphor-icons/react";
import toast from "react-hot-toast";

export default function ContractsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const [contracts] = useState([
    {
      id: "ECTC-KZ-2026-8812",
      type: "Annual Storage Lease (Tariff OWN)",
      startDate: "2026-01-15",
      endDate: "2027-01-14",
      status: "Active Legal",
      parties: "PharmaKZ LLC / ECTC Digital",
    },
    {
      id: "ECTC-KZ-2025-4102",
      type: "Monthly Record Tier M",
      startDate: "2025-06-01",
      endDate: "2026-05-31",
      status: "Active Legal",
      parties: "MedTech Asia / ECTC Digital",
    },
    {
      id: "ECTC-KZ-2024-1109",
      type: "Initial Registration Agreement",
      startDate: "2024-03-10",
      endDate: "2025-03-09",
      status: "Expired Terms",
      parties: "Biomedical KZ / ECTC Digital",
    },
    {
      id: "ECTC-KZ-2023-0045",
      type: "Pilot Dossier Processing Contract",
      startDate: "2023-01-01",
      endDate: "2023-12-31",
      status: "Expired Terms",
      parties: "KazPharma Group / ECTC Digital",
    },
  ]);

  const filteredContracts = contracts.filter((c) => {
    const matchesSearch = c.id.toLowerCase().includes(searchTerm.toLowerCase()) || c.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterType === "all" || (filterType === "active" && c.status === "Active Legal") || (filterType === "expired" && c.status === "Expired Terms");
    return matchesSearch && matchesStatus;
  });

  const handleDownloadPdf = (contractId: string) => {
    toast.success(`Downloading signed PDF document for ${contractId}...`);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface border border-border p-5 rounded-2xl shadow-xs">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-medium text-accent px-2 py-0.5 rounded bg-accent/10 border border-accent/20">
              Contract Lifecycle Management
            </span>
            <h1 className="font-lexend text-xl font-medium text-primary mt-1">
              My Contracts Register
            </h1>
            <p className="text-xs text-secondary">
              Legally binding service agreements, execution types, start dates, and expiration timelines.
            </p>
          </div>

          <button
            onClick={() => toast.success("Contract Request form initiated.")}
            className="px-4 py-2 bg-accent hover:bg-accent-hover text-white font-medium text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 shrink-0"
          >
            <Plus size={16} />
            <span>Request New Contract</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-surface border border-border p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-2 bg-bg border border-border rounded-xl px-3 py-2 text-xs text-muted w-full sm:w-80">
            <MagnifyingGlass size={16} className="text-muted shrink-0" />
            <input
              type="text"
              placeholder="Search contract number or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-primary outline-none w-full text-xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setFilterType("all")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                filterType === "all" ? "bg-accent text-white" : "bg-bg text-secondary hover:text-primary border border-border"
              }`}
            >
              All Contracts ({contracts.length})
            </button>
            <button
              onClick={() => setFilterType("active")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                filterType === "active" ? "bg-emerald-500 text-white" : "bg-bg text-secondary hover:text-primary border border-border"
              }`}
            >
              Active Legal
            </button>
            <button
              onClick={() => setFilterType("expired")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                filterType === "expired" ? "bg-red-500 text-white" : "bg-bg text-secondary hover:text-primary border border-border"
              }`}
            >
              Expired Terms
            </button>
          </div>
        </div>

        {/* Contract Register Table */}
        <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-border flex items-center gap-2">
            <FileText size={20} className="text-accent" />
            <h2 className="font-lexend font-bold text-base text-primary">
              Contract Register & Status Audit
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-secondary">
              <thead className="bg-bg text-primary uppercase font-bold text-[10px] tracking-wider border-b border-border">
                <tr>
                  <th className="py-3.5 px-4">Contract Number</th>
                  <th className="py-3.5 px-4">Conclusion Type</th>
                  <th className="py-3.5 px-4">Contracting Parties</th>
                  <th className="py-3.5 px-4">Start Date</th>
                  <th className="py-3.5 px-4">Expiration End Date</th>
                  <th className="py-3.5 px-4">Status Indicator</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredContracts.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-raised transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-primary">{c.id}</td>
                    <td className="py-3.5 px-4 font-medium text-primary">{c.type}</td>
                    <td className="py-3.5 px-4 text-secondary">{c.parties}</td>
                    <td className="py-3.5 px-4 font-medium">{c.startDate}</td>
                    <td className="py-3.5 px-4 font-medium">{c.endDate}</td>
                    <td className="py-3.5 px-4">
                      {c.status === "Active Legal" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          <CheckCircle size={14} />
                          Active Legal
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/10 text-red-500 border border-red-500/20">
                          <WarningOctagon size={14} />
                          Expired Terms
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDownloadPdf(c.id)}
                        className="p-1.5 text-accent hover:bg-accent/15 rounded-lg transition-colors inline-flex items-center gap-1 font-semibold text-[11px]"
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

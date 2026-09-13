"use client";

import React, { useState } from "react";
import { AppShell } from "../../components/AppShell";
import { ComingSoon } from "../../components/ComingSoon";
import { useTranslations } from "next-intl";
import {
  ListBullets,
  ShieldCheck,
  SignIn,
  SignOut,
  UploadSimple,
  Trash,
  MagnifyingGlass,
  Hash,
  DownloadSimple,
} from "@phosphor-icons/react";
import toast from "react-hot-toast";

export default function AuditJournalPage() {
  const tJournal = useTranslations("journal");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const [logs] = useState([
    {
      txHash: "HASH-77a89102b182",
      timestamp: "2026-09-12 09:14:22",
      userId: "USR-101 (Dr. Alikhan Saparov)",
      eventType: "Successful Login",
      eventCategory: "AUTH",
      details: "Authenticated via unified single route with Admin Role.",
    },
    {
      txHash: "HASH-66f91021c991",
      timestamp: "2026-09-11 18:30:10",
      userId: "USR-102 (Daniya Zhumagaliyeva)",
      eventType: "File Upload",
      eventCategory: "DOSSIER",
      details: "Uploaded Module1_AdminInformation_KZ.pdf (Seq #0004). MD5 calculated.",
    },
    {
      txHash: "HASH-55e10291a882",
      timestamp: "2026-09-11 17:05:44",
      userId: "USR-102 (Daniya Zhumagaliyeva)",
      eventType: "File Deletion",
      eventCategory: "DOSSIER",
      details: "Removed outdated Draft_Specification_v1.docx from Minonazare tree.",
    },
    {
      txHash: "HASH-44d01928b771",
      timestamp: "2026-09-11 12:00:00",
      userId: "USR-101 (Dr. Alikhan Saparov)",
      eventType: "Session Exit",
      eventCategory: "AUTH",
      details: "User initiated sign out from client portal.",
    },
  ]);

  const filteredLogs = logs.filter((l) => {
    const matchesSearch =
      l.txHash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.eventType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterType === "all" ||
      (filterType === "auth" && l.eventCategory === "AUTH") ||
      (filterType === "dossier" && l.eventCategory === "DOSSIER");
    return matchesSearch && matchesCategory;
  });

  const getEventIcon = (type: string) => {
    if (type.includes("Login")) return <SignIn className="text-emerald-500" size={16} />;
    if (type.includes("Exit")) return <SignOut className="text-amber-500" size={16} />;
    if (type.includes("Upload")) return <UploadSimple className="text-accent" size={16} />;
    if (type.includes("Deletion")) return <Trash className="text-red-500" size={16} />;
    return <ShieldCheck className="text-accent" size={16} />;
  };

  return (
    <AppShell>
      {/* Active Coming Soon View */}
      <ComingSoon
        title={tJournal("title")}
        description={tJournal("sub")}
      />

      {/* 
      ========================================================================
      ORIGINAL JOURNAL PAGE DESIGN CODE (COMMENTED OUT FOR PRESERVATION)
      ========================================================================
      <div className="space-y-6">
        <div className="bg-surface border border-border p-5 rounded-2xl shadow-xs">
          <span className="text-[10px] uppercase tracking-wider font-bold text-accent px-2 py-0.5 rounded bg-accent/10 border border-accent/20">
            Tamper-Evident System Audit Trail
          </span>
          <h1 className="font-lexend text-2xl font-bold text-primary mt-1">
            Activity Log & Audit Trail (/journal)
          </h1>
          <p className="text-xs text-secondary">
            Chronological system events (successful logins, session exits, file uploads, file deletions) with precise timestamps, user IDs, and unique transaction hashes.
          </p>
        </div>

        <div className="bg-surface border border-border p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-2 bg-bg border border-border rounded-xl px-3 py-2 text-xs text-muted w-full sm:w-80">
            <MagnifyingGlass size={16} className="text-muted shrink-0" />
            <input
              type="text"
              placeholder="Search hash, user ID, event type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-primary outline-none w-full text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterType("all")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                filterType === "all" ? "bg-accent text-white" : "bg-bg text-secondary border border-border"
              }`}
            >
              All Events ({logs.length})
            </button>
            <button
              onClick={() => setFilterType("auth")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                filterType === "auth" ? "bg-emerald-500 text-white" : "bg-bg text-secondary border border-border"
              }`}
            >
              Auth Events
            </button>
            <button
              onClick={() => setFilterType("dossier")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                filterType === "dossier" ? "bg-amber-500 text-white" : "bg-bg text-secondary border border-border"
              }`}
            >
              Dossier Operations
            </button>
            <button
              onClick={() => toast.success("Exported tamper-evident Audit Log to CSV")}
              className="px-3 py-1.5 bg-bg hover:bg-surface-raised text-primary border border-border font-semibold text-xs rounded-lg transition-colors flex items-center gap-1"
            >
              <DownloadSimple size={14} className="text-accent" />
              <span>Export</span>
            </button>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-border flex items-center gap-2">
            <ListBullets size={20} className="text-accent" />
            <h2 className="font-lexend font-bold text-base text-primary">
              Audit Trail Chronological Event Table
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-secondary">
              <thead className="bg-bg text-primary uppercase font-bold text-[10px] tracking-wider border-b border-border">
                <tr>
                  <th className="py-3.5 px-4">Transaction Hash (ID)</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">Acting User ID</th>
                  <th className="py-3.5 px-4">System Event</th>
                  <th className="py-3.5 px-4">Event Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredLogs.map((log) => (
                  <tr key={log.txHash} className="hover:bg-surface-raised transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-accent flex items-center gap-1.5">
                      <Hash size={14} className="text-accent shrink-0" />
                      <span>{log.txHash}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-primary font-medium">{log.timestamp}</td>
                    <td className="py-3.5 px-4 text-primary font-semibold">{log.userId}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-bg border border-border">
                        {getEventIcon(log.eventType)}
                        <span className="text-primary">{log.eventType}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-secondary leading-relaxed">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      */}
    </AppShell>
  );
}

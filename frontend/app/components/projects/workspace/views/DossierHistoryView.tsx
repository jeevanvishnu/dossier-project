"use client";

import React, { useState } from "react";
import {
  Clock,
  MagnifyingGlass,
  DownloadSimple,
  User,
  TerminalWindow,
  CheckCircle,
  WarningCircle,
  XCircle,
} from "@phosphor-icons/react";
import toast from "react-hot-toast";

interface AuditLogRow {
  id: string;
  formationDate: string;
  userCredentials: string;
  userId: string;
  status: "SUCCESS" | "WARNING" | "ERROR";
  resultLog: string;
}

export const DossierHistoryView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");

  const historyLogs: AuditLogRow[] = [
    {
      id: "log-1",
      formationDate: "2026-09-13 11:20:14",
      userCredentials: "Dr. Alikhan Saparov",
      userId: "USR-902",
      status: "SUCCESS",
      resultLog: "SUCCESS: Metadata fields updated and dossier configuration locked for Kazakhstan.",
    },
    {
      id: "log-2",
      formationDate: "2026-09-13 10:14:02",
      userCredentials: "Dr. Alikhan Saparov",
      userId: "USR-902",
      status: "WARNING",
      resultLog: "WARNING: Module 1.3 SmPC document checksum validated with non-critical encoding warning.",
    },
    {
      id: "log-3",
      formationDate: "2026-09-12 16:45:02",
      userCredentials: "Dr. Alikhan Saparov",
      userId: "USR-902",
      status: "SUCCESS",
      resultLog: "SUCCESS: Cover Letter PDF uploaded into Module 1.0 with computed MD5 checksum.",
    },
    {
      id: "log-4",
      formationDate: "2026-09-12 12:00:19",
      userCredentials: "System Validator",
      userId: "SYS-001",
      status: "ERROR",
      resultLog: "ERROR: DTD validation failed for index.xml draft in Sequence 0001 (Schema schema-kz-v1.2 failed).",
    },
    {
      id: "log-5",
      formationDate: "2026-09-11 14:02:59",
      userCredentials: "Elena Vance",
      userId: "USR-405",
      status: "SUCCESS",
      resultLog: "SUCCESS: Initial XML structure generated for Sequence 0000.",
    },
    {
      id: "log-6",
      formationDate: "2026-09-10 09:15:33",
      userCredentials: "Dr. Alikhan Saparov",
      userId: "USR-902",
      status: "SUCCESS",
      resultLog: "SUCCESS: Project PRJ-KZ-2026-001 initialized for Kazakhstan submission.",
    },
  ];

  const filteredLogs = historyLogs.filter(
    (log) =>
      log.resultLog.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userCredentials.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.formationDate.includes(searchQuery) ||
      log.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExportCSV = () => {
    toast.success("Exporting Dossier History audit trail as CSV...");
  };

  const getLogStyle = (status: "SUCCESS" | "WARNING" | "ERROR") => {
    switch (status) {
      case "SUCCESS":
        return {
          bg: "bg-slate-950/80 border-emerald-500/30 text-emerald-400",
          icon: <CheckCircle size={15} className="text-emerald-400 shrink-0 mt-0.5" weight="fill" />,
        };
      case "WARNING":
        return {
          bg: "bg-slate-950/80 border-amber-500/30 text-amber-300",
          icon: <WarningCircle size={15} className="text-amber-400 shrink-0 mt-0.5" weight="fill" />,
        };
      case "ERROR":
        return {
          bg: "bg-slate-950/80 border-rose-500/30 text-rose-300",
          icon: <XCircle size={15} className="text-rose-400 shrink-0 mt-0.5" weight="fill" />,
        };
    }
  };

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm space-y-0">
      {/* Card Header & Controls */}
      <div className="p-5 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-accent/15 text-accent border border-accent/20">
            <Clock size={20} weight="bold" />
          </div>
          <div>
            <h2 className="font-lexend font-bold text-base md:text-lg text-primary">
              Section 4: Dossier History & Audit Logs
            </h2>
            <p className="text-xs text-secondary mt-0.5">
              Immutable timestamped trail of project data changes, validation events, and execution logs
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Bar */}
          <div className="relative flex items-center min-w-[240px]">
            <MagnifyingGlass size={16} className="absolute left-3 text-muted" />
            <input
              type="text"
              placeholder="Search history logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-bg border border-border focus:border-accent text-primary text-xs rounded-xl pl-9 pr-3 py-2 focus:outline-none transition-colors"
            />
          </div>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            type="button"
            className="px-3.5 py-2 bg-surface-raised hover:bg-border text-primary border border-border font-semibold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <DownloadSimple size={15} weight="bold" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Audit Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-secondary">
          <thead className="bg-bg text-primary uppercase font-bold text-[10px] tracking-wider border-b border-border">
            <tr>
              <th className="py-3.5 px-5">FORMATION DATE</th>
              <th className="py-3.5 px-5">USER CREDENTIALS</th>
              <th className="py-3.5 px-5">EXECUTION RESULT LOGS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-8 text-center text-muted text-xs">
                  No audit logs matching your search filter.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => {
                const style = getLogStyle(log.status);
                return (
                  <tr key={log.id} className="hover:bg-surface-raised transition-colors">
                    {/* FORMATION DATE */}
                    <td className="py-4 px-5 font-mono text-xs font-semibold text-primary whitespace-nowrap">
                      {log.formationDate}
                    </td>

                    {/* USER CREDENTIALS */}
                    <td className="py-4 px-5 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-raised border border-border text-xs font-medium text-primary shadow-2xs">
                        <User size={13} className="text-accent" weight="bold" />
                        <span>{log.userCredentials}</span>
                        <span className="font-mono text-[10px] text-muted font-bold">
                          (ID: {log.userId})
                        </span>
                      </div>
                    </td>

                    {/* EXECUTION RESULT LOGS */}
                    <td className="py-4 px-5">
                      <div className={`flex items-start gap-2 border p-2.5 rounded-xl font-mono text-xs shadow-inner ${style.bg}`}>
                        {style.icon}
                        <span className="break-all">{log.resultLog}</span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};


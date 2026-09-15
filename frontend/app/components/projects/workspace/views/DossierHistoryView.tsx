"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Clock,
  MagnifyingGlass,
  DownloadSimple,
  User,
  CheckCircle,
  WarningCircle,
  XCircle,
} from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { api, handleApiError } from "@/app/lib/axios";
import { SkeletonTableRow } from "@/app/components/ui/Skeleton";

interface AuditLogRow {
  id: string;
  formationDate: string;
  userCredentials: string;
  userId: string;
  status: "SUCCESS" | "WARNING" | "ERROR";
  resultLog: string;
}

interface DossierHistoryViewProps {
  projectId?: string;
}

export const DossierHistoryView: React.FC<DossierHistoryViewProps> = ({ projectId = "1" }) => {
  const tWorkspace = useTranslations("workspace");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [historyLogs, setHistoryLogs] = useState<AuditLogRow[]>([
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
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const itemsPerPage = 10;

  // Fetch real audit logs from backend API
  useEffect(() => {
    if (!projectId) return;

    const fetchAuditLogs = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/projects/${projectId}/audit-logs`, {
          params: { search: searchQuery, page: currentPage, limit: itemsPerPage },
        });

        if (response.data?.success && Array.isArray(response.data?.data)) {
          const apiLogs: AuditLogRow[] = response.data.data.map((log: any) => ({
            id: `log-${log.id}`,
            formationDate: log.formationDate ? new Date(log.formationDate).toLocaleString() : new Date().toLocaleString(),
            userCredentials: log.userCredentials || "System",
            userId: `LOG-${log.id}`,
            status: log.logType as "SUCCESS" | "WARNING" | "ERROR",
            resultLog: `${log.logType}: ${log.message}`,
          }));

          setHistoryLogs(apiLogs);
          if (response.data.pagination) {
            setTotalPages(response.data.pagination.totalPages || 1);
          }
        }
      } catch (err: any) {
        console.warn("Could not fetch audit logs from API:", err?.message);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchAuditLogs();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [projectId, searchQuery, currentPage]);

  const handleExportCSV = async () => {
    try {
      const exportUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/projects/${projectId}/audit-logs/export`;
      window.open(exportUrl, "_blank");
      toast.success("Downloading audit logs CSV...");
    } catch (err) {
      handleApiError(err, "Failed to export audit logs CSV");
    }
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
              {tWorkspace("historyTitle")}
            </h2>
            <p className="text-xs text-secondary mt-0.5">
              {tWorkspace("historySub")}
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
            <span>{tWorkspace("btnExportCsv")}</span>
          </button>
        </div>
      </div>

      {/* Audit Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-secondary">
          <thead className="bg-bg text-primary uppercase font-bold text-[10px] tracking-wider border-b border-border">
            <tr>
              <th className="py-3.5 px-5">{tWorkspace("tableColFormationDate")}</th>
              <th className="py-3.5 px-5">{tWorkspace("tableColUserCredentials")}</th>
              <th className="py-3.5 px-5">{tWorkspace("tableColResultLogs")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <>
                <SkeletonTableRow columns={3} />
                <SkeletonTableRow columns={3} />
                <SkeletonTableRow columns={3} />
              </>
            ) : historyLogs.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-8 text-center text-muted text-xs">
                  {tWorkspace("noLogsFound")}
                </td>
              </tr>
            ) : (
              historyLogs.map((log) => {
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
                          ({log.userId})
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

      {/* Pagination Controls */}
      {!isLoading && historyLogs.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 p-4 border-t border-border bg-surface">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 bg-bg border border-border rounded-lg text-xs font-semibold text-secondary hover:text-primary hover:bg-surface-raised disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-xs text-secondary font-mono">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 bg-bg border border-border rounded-lg text-xs font-semibold text-secondary hover:text-primary hover:bg-surface-raised disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

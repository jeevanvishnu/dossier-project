"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  FileCode,
  FileZip,
  DownloadSimple,
  Key,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { api } from "@/app/lib/axios";
import { SkeletonTableRow } from "@/app/components/ui/Skeleton";

interface XmlPackageRow {
  id: string;
  fullName: string;
  date: string;
  size: string;
  xmlChecksum: string;
  zipChecksum: string;
  downloadUrl: string;
}

interface XmlCreationHistoryViewProps {
  projectId?: string;
}

export const XmlCreationHistoryView: React.FC<XmlCreationHistoryViewProps> = ({ projectId = "1" }) => {
  const tWorkspace = useTranslations("workspace");
  const tToasts = useTranslations("toasts");
  const tErrors = useTranslations("errors");
  const [xmlPackages, setXmlPackages] = useState<XmlPackageRow[]>([
    {
      id: "pkg-1",
      fullName: "eCTD_PRJ-KZ-2026-001_Seq0000.zip",
      date: "2026-09-13 12:40:00",
      size: "24.5 MB",
      xmlChecksum: "9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d",
      zipChecksum: "e4d909c290d0fb1ca068ffaddf22cbd0",
      downloadUrl: "#",
    },
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchPackages = async () => {
    if (!projectId) return;
    setIsLoading(true);
    try {
      const response = await api.get(`/projects/${projectId}/packages`);
      if (response.data?.success && Array.isArray(response.data?.data)) {
        const archives: XmlPackageRow[] = response.data.data.map((pkg: any) => ({
          id: `pkg-${pkg.id}`,
          fullName: pkg.fullName,
          date: pkg.generatedAt ? new Date(pkg.generatedAt).toLocaleString() : new Date().toLocaleString(),
          size: pkg.size ? `${(pkg.size / (1024 * 1024)).toFixed(2)} MB` : "24.5 MB",
          xmlChecksum: pkg.xmlChecksum || "md5_hash_placeholder",
          zipChecksum: pkg.zipChecksum || "md5_hash_placeholder",
          downloadUrl: pkg.downloadUrl || "#",
        }));
        setXmlPackages(archives);
      }
    } catch (err: any) {
      console.warn("Could not fetch packages from API:", err?.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, [projectId]);

  const handleDownload = (packageName: string, downloadUrl: string) => {
    if (downloadUrl && downloadUrl !== "#") {
      window.open(downloadUrl, "_blank");
      toast.success(tToasts("downloadingArchive", { package: packageName }));
    } else {
      toast.error(tErrors("downloadUrlUnavailable"));
    }
  };

  return (
    <div className="space-y-6">
      {/* XML & Package Archives Table */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
        {/* Card Header */}
        <div className="p-5 border-b border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
              <FileCode size={20} weight="bold" />
            </div>
            <div>
              <h2 className="font-lexend font-bold text-base md:text-lg text-primary">
                {tWorkspace("xmlTitle")}
              </h2>
              <p className="text-xs text-secondary mt-0.5">
                {tWorkspace("xmlSub")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              {tWorkspace("archivesCount")}: {xmlPackages.length}
            </span>
          </div>
        </div>

        {/* Package Archive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-secondary">
            <thead className="bg-bg text-primary uppercase font-bold text-[10px] tracking-wider border-b border-border">
              <tr>
                <th className="py-3.5 px-5">{tWorkspace("tableColFullName")}</th>
                <th className="py-3.5 px-5">{tWorkspace("tableColDate")}</th>
                <th className="py-3.5 px-5">{tWorkspace("tableColSize")}</th>
                <th className="py-3.5 px-5">{tWorkspace("tableColXmlMd5")}</th>
                <th className="py-3.5 px-5">{tWorkspace("tableColZipMd5")}</th>
                <th className="py-3.5 px-5 text-center">{tWorkspace("tableColActions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <>
                  <SkeletonTableRow columns={6} />
                  <SkeletonTableRow columns={6} />
                </>
              ) : xmlPackages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted text-xs">
                    {tWorkspace("noPackagesYet")}
                  </td>
                </tr>
              ) : (
                xmlPackages.map((pkg) => (
                  <tr key={pkg.id} className="hover:bg-surface-raised transition-colors">
                    {/* FULL NAME */}
                    <td className="py-4 px-5 font-semibold text-primary flex items-center gap-2.5">
                      <FileZip size={20} className="text-amber-400 shrink-0" weight="fill" />
                      <span className="font-mono text-xs truncate max-w-[220px]" title={pkg.fullName}>
                        {pkg.fullName}
                      </span>
                    </td>

                    {/* DATE */}
                    <td className="py-4 px-5 font-mono text-xs whitespace-nowrap">{pkg.date}</td>

                    {/* SIZE */}
                    <td className="py-4 px-5 font-mono text-xs font-semibold text-accent whitespace-nowrap">
                      {pkg.size}
                    </td>

                    {/* XML CHECKSUM */}
                    <td className="py-4 px-5">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono bg-bg border border-border text-primary">
                        <Key size={12} className="text-accent shrink-0" />
                        <span className="truncate max-w-[130px]" title={pkg.xmlChecksum}>
                          {pkg.xmlChecksum}
                        </span>
                      </div>
                    </td>

                    {/* ZIP CHECKSUM */}
                    <td className="py-4 px-5">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono bg-bg border border-border text-primary">
                        <Key size={12} className="text-amber-400 shrink-0" />
                        <span className="truncate max-w-[130px]" title={pkg.zipChecksum}>
                          {pkg.zipChecksum}
                        </span>
                      </div>
                    </td>

                    {/* ACTION */}
                    <td className="py-4 px-5 text-center">
                      <button
                        onClick={() => handleDownload(pkg.fullName, pkg.downloadUrl)}
                        type="button"
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all inline-flex items-center gap-1.5 cursor-pointer active:scale-95 whitespace-nowrap"
                      >
                        <DownloadSimple size={15} weight="bold" />
                        <span>{tWorkspace("btnDownloadPackage")}</span>
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
  );
};

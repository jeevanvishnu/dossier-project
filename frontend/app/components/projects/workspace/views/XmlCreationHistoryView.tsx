"use client";

import React, { useState, useEffect } from "react";
import {
  FileCode,
  FileZip,
  DownloadSimple,
  Key,
  Gear,
} from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { api, handleApiError } from "@/app/lib/axios";

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
  const [isCompiling, setIsCompiling] = useState<boolean>(false);

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

  const handleCompilePackage = async () => {
    setIsCompiling(true);
    toast.loading("Compiling in-memory eCTD XML backbone & ZIP archive...", { id: "compile-toast" });
    try {
      const response = await api.post(`/projects/${projectId}/compile`);
      if (response.data?.success) {
        toast.success("eCTD Package compiled and uploaded to ImageKit!", { id: "compile-toast" });
        await fetchPackages();
      }
    } catch (err) {
      toast.dismiss("compile-toast");
      handleApiError(err, "Failed to compile eCTD dossier package");
    } finally {
      setIsCompiling(false);
    }
  };

  const handleDownload = (packageName: string, downloadUrl: string) => {
    if (downloadUrl && downloadUrl !== "#") {
      window.open(downloadUrl, "_blank");
      toast.success(`Downloading eCTD archive package: ${packageName}`);
    } else {
      toast.error("Download URL not available for this package.");
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
                XML & Package Archives
              </h2>
              <p className="text-xs text-secondary mt-0.5">
                Tracks generated submission ZIP archives and verified MD5 checksum hashes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCompilePackage}
              disabled={isCompiling}
              type="button"
              className="px-4 py-2 bg-accent hover:bg-accent-hover text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Gear size={16} className={isCompiling ? "animate-spin" : ""} weight="bold" />
              <span>{isCompiling ? "Compiling ZIP..." : "Compile eCTD Package"}</span>
            </button>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              Available ZIP Archives: {xmlPackages.length}
            </span>
          </div>
        </div>

        {/* Package Archive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-secondary">
            <thead className="bg-bg text-primary uppercase font-bold text-[10px] tracking-wider border-b border-border">
              <tr>
                <th className="py-3.5 px-5">FULL NAME</th>
                <th className="py-3.5 px-5">DATE</th>
                <th className="py-3.5 px-5">SIZE</th>
                <th className="py-3.5 px-5">XML CHECKSUM (MD5 ALGORITHM)</th>
                <th className="py-3.5 px-5">ZIP CHECKSUM (MD5 ALGORITHM)</th>
                <th className="py-3.5 px-5 text-center">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted text-xs">
                    Loading package archives...
                  </td>
                </tr>
              ) : xmlPackages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted text-xs">
                    No compiled packages yet. Click "Compile eCTD Package" to generate one.
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
                        <span>Download Package</span>
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

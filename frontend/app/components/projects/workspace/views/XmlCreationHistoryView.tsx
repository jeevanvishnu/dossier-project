"use client";

import React from "react";
import {
  FileCode,
  FileZip,
  DownloadSimple,
  Key,
} from "@phosphor-icons/react";
import toast from "react-hot-toast";

interface XmlPackageRow {
  id: string;
  fullName: string;
  date: string;
  size: string;
  xmlChecksum: string;
  zipChecksum: string;
}

export const XmlCreationHistoryView: React.FC = () => {
  // XML & Package Archives Data
  const xmlPackages: XmlPackageRow[] = [
    {
      id: "pkg-1",
      fullName: "eCTD_PRJ-KZ-2026-001_Seq0000.zip",
      date: "2026-09-13 12:40:00",
      size: "24.5 MB",
      xmlChecksum: "9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d",
      zipChecksum: "e4d909c290d0fb1ca068ffaddf22cbd0",
    },
    {
      id: "pkg-2",
      fullName: "eCTD_PRJ-KZ-2026-001_Seq0001_Draft.zip",
      date: "2026-09-10 17:15:22",
      size: "18.2 MB",
      xmlChecksum: "1f2e3d4c5b6a7b8c9d0e1f2a3b4c5d6e",
      zipChecksum: "7f8b910a11c12d3e4f5a6b7c8d9e0f1a",
    },
  ];

  const handleDownload = (packageName: string) => {
    toast.success(`Downloading eCTD archive package: ${packageName}`);
  };

  return (
    <div className="space-y-6">

      {/* XML & Package Archives Table */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
        {/* Card Header */}
        <div className="p-5 border-b border-border flex items-center justify-between gap-3">
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
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
            Available ZIP Archives: {xmlPackages.length}
          </span>
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
              {xmlPackages.map((pkg) => (
                <tr key={pkg.id} className="hover:bg-surface-raised transition-colors">
                  {/* FULL NAME */}
                  <td className="py-4 px-5 font-semibold text-primary flex items-center gap-2.5">
                    <FileZip size={20} className="text-amber-400 shrink-0" weight="fill" />
                    <span className="font-mono text-xs">{pkg.fullName}</span>
                  </td>

                  {/* DATE */}
                  <td className="py-4 px-5 font-mono text-xs">{pkg.date}</td>

                  {/* SIZE */}
                  <td className="py-4 px-5 font-mono text-xs font-semibold text-accent">
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
                      onClick={() => handleDownload(pkg.fullName)}
                      type="button"
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all inline-flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <DownloadSimple size={15} weight="bold" />
                      <span>Download Package</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

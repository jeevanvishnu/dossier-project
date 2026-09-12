"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { AppShell } from "../../components/AppShell";
import {
  Folder,
  FileCode,
  UploadSimple,
  CheckCircle,
  FileZip,
  Hash,
  CaretRight,
  Sparkle,
  TreeStructure,
  DownloadSimple,
} from "@phosphor-icons/react";
import toast from "react-hot-toast";

interface PageParams {
  params: Promise<{ id: string }>;
}

export default function ProjectDetailPage({ params }: PageParams) {
  const { id } = use(params);

  const [activeCategory, setActiveCategory] = useState<"admin" | "resume" | "minonazare">("admin");
  const [dragActive, setDragActive] = useState(false);

  const [fileTree, setFileTree] = useState({
    admin: [
      {
        name: "Module1_AdminInformation_KZ.pdf",
        size: "1.2 MB",
        sequence: "0004",
        uploadDate: "2026-09-10",
        completionDate: "2026-09-10",
        md5: "e4d909c290d0fb1ca068ffaddf22cbd0",
        status: "Validated",
      },
      {
        name: "ApplicationForm_Astana_MOH.pdf",
        size: "850 KB",
        sequence: "0004",
        uploadDate: "2026-09-09",
        completionDate: "2026-09-09",
        md5: "7f8b910a11c12d3e4f5a6b7c8d9e0f1a",
        status: "Validated",
      },
    ],
    resume: [
      {
        name: "Module2_QualityOverallSummary_Resume.pdf",
        size: "3.4 MB",
        sequence: "0004",
        uploadDate: "2026-09-08",
        completionDate: "2026-09-08",
        md5: "a1b2c3d4e5f607182930415263748596",
        status: "Validated",
      },
    ],
    minonazare: [
      {
        name: "Module3_Minonazare_QualityDossier.pdf",
        size: "14.8 MB",
        sequence: "0003",
        uploadDate: "2026-09-05",
        completionDate: "2026-09-06",
        md5: "9876543210fedcba0987654321fedcba",
        status: "Checksum Verified",
      },
      {
        name: "Module4_Nonclinical_StudyReports.pdf",
        size: "8.1 MB",
        sequence: "0003",
        uploadDate: "2026-09-04",
        completionDate: "2026-09-05",
        md5: "1234567890abcdef1234567890abcdef",
        status: "Checksum Verified",
      },
    ],
  });

  const [xmlHistory] = useState([
    {
      generationDate: "2026-09-11 16:45:00",
      sequence: "0004",
      actingUser: "Dr. Alikhan Saparov (ID: USR-902)",
      resultLog: "SUCCESS: XML Schema Validated against Kazakhstan EAEU v3.1",
      fileSize: "28.4 MB (Zip)",
      zipChecksum: "md5:8829f00119284bc710293aa992019283",
    },
    {
      generationDate: "2026-09-06 10:15:30",
      sequence: "0003",
      actingUser: "Dr. Alikhan Saparov (ID: USR-902)",
      resultLog: "SUCCESS: Sequence 0003 compiled & archived",
      fileSize: "22.1 MB (Zip)",
      zipChecksum: "md5:7718e99001817ab609182bb881908172",
    },
  ]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      uploadFile(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0]);
    }
  };

  const uploadFile = (file: File) => {
    const fakeMd5 = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const newDoc = {
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      sequence: "0004",
      uploadDate: new Date().toISOString().split("T")[0],
      completionDate: new Date().toISOString().split("T")[0],
      md5: fakeMd5,
      status: "MD5 Computed",
    };

    setFileTree((prev) => ({
      ...prev,
      [activeCategory]: [newDoc, ...prev[activeCategory]],
    }));

    toast.success(`Uploaded ${file.name} to [${activeCategory.toUpperCase()}] category with MD5: ${fakeMd5.substring(0, 8)}...`);
  };

  const handleGenerateXml = () => {
    toast.success("Generating eCTD XML tree sequence 0005 & compiling ZIP package...");
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <Link href="/projects" className="text-accent hover:underline">
            ← Back to Projects Workspace
          </Link>
          <CaretRight size={12} className="text-muted" />
          <span className="text-primary font-bold">Project Detail [{id}]</span>
        </div>

        {/* Project Header Overview */}
        <div className="bg-surface border border-border p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold text-accent px-2 py-0.5 rounded bg-accent/10 border border-accent/20">
                {id}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Active RMS Submission
              </span>
            </div>
            <h1 className="font-lexend text-2xl font-bold text-primary">
              Paracetamol Extra KZ 500mg
            </h1>
            <p className="text-xs text-secondary mt-0.5">
              Manufacturer: PharmKazakhstan JSC • Applicant: MedTech Alliance • Country: Kazakhstan
            </p>
          </div>

          <button
            onClick={handleGenerateXml}
            className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 shrink-0"
          >
            <Sparkle size={18} />
            <span>Generate eCTD XML Package</span>
          </button>
        </div>

        {/* Multi-Category File Tree & Drag-Drop Component */}
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div className="flex items-center gap-2">
              <TreeStructure size={22} className="text-accent" />
              <h2 className="font-lexend font-bold text-base text-primary">
                Multi-Category Document Upload & Structuring Component
              </h2>
            </div>
            <span className="text-xs font-semibold text-accent">Active Sequence: #0004</span>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 bg-bg p-1.5 rounded-xl border border-border">
            <button
              onClick={() => setActiveCategory("admin")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${
                activeCategory === "admin"
                  ? "bg-accent text-white"
                  : "text-secondary hover:text-primary"
              }`}
            >
              <Folder size={16} />
              <span>Admin Information (Module 1)</span>
              <span className="text-[10px] bg-black/20 px-1.5 py-0.5 rounded font-mono text-white">
                {fileTree.admin.length}
              </span>
            </button>

            <button
              onClick={() => setActiveCategory("resume")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${
                activeCategory === "resume"
                  ? "bg-accent text-white"
                  : "text-secondary hover:text-primary"
              }`}
            >
              <Folder size={16} />
              <span>Resume / QOS (Module 2)</span>
              <span className="text-[10px] bg-black/20 px-1.5 py-0.5 rounded font-mono text-white">
                {fileTree.resume.length}
              </span>
            </button>

            <button
              onClick={() => setActiveCategory("minonazare")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${
                activeCategory === "minonazare"
                  ? "bg-accent text-white"
                  : "text-secondary hover:text-primary"
              }`}
            >
              <Folder size={16} />
              <span>Minonazare / Quality (Module 3-5)</span>
              <span className="text-[10px] bg-black/20 px-1.5 py-0.5 rounded font-mono text-white">
                {fileTree.minonazare.length}
              </span>
            </button>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors relative ${
              dragActive
                ? "border-accent bg-accent/10"
                : "border-border bg-bg hover:border-accent/40"
            }`}
          >
            <input
              type="file"
              onChange={handleFileInput}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="w-12 h-12 rounded-full bg-accent/15 border border-accent/30 text-accent flex items-center justify-center mx-auto mb-3">
              <UploadSimple size={24} />
            </div>
            <p className="font-lexend font-bold text-sm text-primary mb-1">
              Drag & Drop file to upload into [{activeCategory.toUpperCase()}]
            </p>
            <p className="text-xs text-secondary mb-3">
              Supports PDF, DOCX, XML files. Automatic MD5 checksum encoding & sequence tagging enabled.
            </p>
            <span className="px-4 py-1.5 bg-accent/15 text-accent font-bold text-xs rounded-lg inline-block border border-accent/20">
              Browse Files from Computer
            </span>
          </div>

          {/* Document File Tree Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-secondary">
              <thead className="bg-bg text-primary uppercase font-bold text-[10px] tracking-wider border-b border-border">
                <tr>
                  <th className="py-3 px-4">Document Title</th>
                  <th className="py-3 px-4">File Size</th>
                  <th className="py-3 px-4">Seq Tag</th>
                  <th className="py-3 px-4">Upload Date</th>
                  <th className="py-3 px-4">Completion Date</th>
                  <th className="py-3 px-4">MD5 Checksum Tracking</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {fileTree[activeCategory].map((doc, idx) => (
                  <tr key={idx} className="hover:bg-surface-raised transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-primary flex items-center gap-2">
                      <FileCode size={16} className="text-accent shrink-0" />
                      <span>{doc.name}</span>
                    </td>
                    <td className="py-3.5 px-4 text-secondary">{doc.size}</td>
                    <td className="py-3.5 px-4 font-mono text-accent font-bold">#{doc.sequence}</td>
                    <td className="py-3.5 px-4">{doc.uploadDate}</td>
                    <td className="py-3.5 px-4">{doc.completionDate}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 font-mono text-[11px] text-primary bg-bg px-2 py-1 rounded border border-border w-fit">
                        <Hash size={12} className="text-accent shrink-0" />
                        <span className="truncate max-w-[120px]" title={doc.md5}>
                          {doc.md5}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        <CheckCircle size={12} />
                        {doc.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dossier & XML History Tables */}
        <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-border flex items-center gap-2">
            <FileZip size={20} className="text-accent" />
            <h2 className="font-lexend font-bold text-base text-primary">
              Dossier & XML Generation History Log
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-secondary">
              <thead className="bg-bg text-primary uppercase font-bold text-[10px] tracking-wider border-b border-border">
                <tr>
                  <th className="py-3.5 px-4">Generation Timestamp</th>
                  <th className="py-3.5 px-4">Sequence</th>
                  <th className="py-3.5 px-4">Acting User</th>
                  <th className="py-3.5 px-4">Result Validation Log</th>
                  <th className="py-3.5 px-4">Package Size</th>
                  <th className="py-3.5 px-4">Zip MD5 Checksum</th>
                  <th className="py-3.5 px-4 text-right">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {xmlHistory.map((h, i) => (
                  <tr key={i} className="hover:bg-surface-raised transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-primary">{h.generationDate}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-accent">Seq #{h.sequence}</td>
                    <td className="py-3.5 px-4 text-primary font-medium">{h.actingUser}</td>
                    <td className="py-3.5 px-4 text-emerald-500 font-semibold">{h.resultLog}</td>
                    <td className="py-3.5 px-4">{h.fileSize}</td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-muted">{h.zipChecksum}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => toast.success(`Downloading Sequence ${h.sequence} eCTD ZIP...`)}
                        className="p-1.5 text-accent hover:bg-accent/15 rounded-lg transition-colors inline-flex items-center gap-1 font-bold text-[11px]"
                      >
                        <DownloadSimple size={14} />
                        <span>ZIP</span>
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

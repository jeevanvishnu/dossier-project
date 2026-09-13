"use client";

import React, { useState, useMemo } from "react";
import {
  UploadSimple,
  Folder,
  FolderOpen,
  FileText,
  FilePdf,
  Key,
  Trash,
  List,
  LockKey,
  FileCode,
  Package,
  CaretDown,
  CaretRight,
  MagnifyingGlass,
} from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { ECTD_FULL_TREE, CTDNode } from "@/app/constants/ctdStructure";

interface UploadedFile {
  id: string;
  name: string;
  sequence: string;
  uploadDate: string;
  completionDate: string;
  md5Hash: string;
}

// Module definitions for far-left sidebar matching reference model
const MAIN_MODULE_TABS = [
  { id: "m1", code: "1", label: "1. Admin information" },
  { id: "m2", code: "2", label: "2. CTD Summaries" },
  { id: "m3", code: "3", label: "3. Quality" },
  { id: "m4", code: "4", label: "4. Non-clinical study reports" },
  { id: "m5", code: "5", label: "5. Clinical study reports" },
];

function findNodeById(nodes: CTDNode[], id: string): CTDNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

function countFilesForNode(node: CTDNode, filesMap: Record<string, UploadedFile[]>): number {
  let count = (filesMap[node.id] || []).length;
  if (node.children) {
    for (const child of node.children) {
      count += countFilesForNode(child, filesMap);
    }
  }
  return count;
}

export const UploadDocumentsView: React.FC = () => {
  const [activeMainModuleId, setActiveMainModuleId] = useState<string>("m1");
  const [selectedModuleId, setSelectedModuleId] = useState<string>("1.0");
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Track expanded folder nodes
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    m1: true,
    "1.2": false,
    "1.3": false,
    m2: true,
    m3: true,
    m4: true,
    m5: true,
  });

  // Uploaded files map per leaf node
  const [moduleFiles, setModuleFiles] = useState<Record<string, UploadedFile[]>>({
    "1.0": [
      {
        id: "file-1",
        name: "1.0. Cover Letter Miconazole.pdf",
        sequence: "0000",
        uploadDate: "14.08.2023",
        completionDate: "14.08.2023",
        md5Hash: "MD5",
      },
    ],
    "1.1": [
      {
        id: "file-2",
        name: "1.1. Table of Contents KZ.pdf",
        sequence: "0000",
        uploadDate: "14.08.2023",
        completionDate: "14.08.2023",
        md5Hash: "MD5",
      },
    ],
    "1.3.1-02001": [
      {
        id: "file-3",
        name: "1.3. SmPC Miconazole Spray 2%.pdf",
        sequence: "0000",
        uploadDate: "14.08.2023",
        completionDate: "14.08.2023",
        md5Hash: "MD5",
      },
    ],
  });

  // Active module root node
  const activeRootModule = useMemo(() => {
    return ECTD_FULL_TREE.find((m) => m.id === activeMainModuleId) || ECTD_FULL_TREE[0];
  }, [activeMainModuleId]);

  const activeNode = useMemo(
    () => findNodeById(ECTD_FULL_TREE, selectedModuleId) || activeRootModule.children?.[0] || activeRootModule,
    [selectedModuleId, activeRootModule]
  );

  const currentFiles = moduleFiles[selectedModuleId] || [];

  const toggleExpand = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  const handleMainModuleClick = (modId: string) => {
    setActiveMainModuleId(modId);
    const targetRoot = ECTD_FULL_TREE.find((m) => m.id === modId);
    if (targetRoot && targetRoot.children && targetRoot.children.length > 0) {
      setSelectedModuleId(targetRoot.children[0].id);
    } else if (targetRoot) {
      setSelectedModuleId(targetRoot.id);
    }
  };

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
      addFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      addFile(e.target.files[0]);
    }
  };

  const addFile = (file: File) => {
    const todayStr = "14.08.2023";
    const newFile: UploadedFile = {
      id: `file-${Date.now()}`,
      name: file.name,
      sequence: "0000",
      uploadDate: todayStr,
      completionDate: todayStr,
      md5Hash: "MD5",
    };

    setModuleFiles((prev) => ({
      ...prev,
      [selectedModuleId]: [...(prev[selectedModuleId] || []), newFile],
    }));

    toast.success(`Uploaded ${file.name}`);
  };

  const handleDeleteFile = (fileId: string, fileName: string) => {
    setModuleFiles((prev) => ({
      ...prev,
      [selectedModuleId]: prev[selectedModuleId].filter((f) => f.id !== fileId),
    }));
    toast.error(`Removed ${fileName}`);
  };

  const matchesSearch = (node: CTDNode, query: string): boolean => {
    if (!query) return true;
    const q = query.toLowerCase();
    const matchSelf =
      node.title.toLowerCase().includes(q) ||
      (node.code && node.code.toLowerCase().includes(q)) ||
      (node.docId && node.docId.toLowerCase().includes(q));

    if (matchSelf) return true;
    if (node.children) {
      return node.children.some((child) => matchesSearch(child, query));
    }
    return false;
  };

  // Render tree node inside middle pane
  const renderTreeNode = (node: CTDNode, depth: number = 0) => {
    if (searchQuery && !matchesSearch(node, searchQuery)) {
      return null;
    }

    const isSelected = selectedModuleId === node.id;
    const isFolder = node.isFolder || (node.children && node.children.length > 0);
    const isExpanded = searchQuery ? true : !!expandedNodes[node.id];
    const fileCount = countFilesForNode(node, moduleFiles);

    return (
      <div key={node.id} className="space-y-0.5">
        <div
          onClick={() => setSelectedModuleId(node.id)}
          style={{ paddingLeft: `${depth * 12 + 6}px` }}
          className={`flex items-center justify-between py-1.5 px-2 rounded text-xs font-medium cursor-pointer transition-colors ${isSelected
              ? "bg-sky-100 dark:bg-sky-950/60 border border-sky-300 dark:border-sky-700 text-sky-900 dark:text-sky-200 font-semibold"
              : "hover:bg-gray-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 border border-transparent"
            }`}
        >
          <div className="flex items-center gap-1.5 min-w-0 pr-2">
            {isFolder ? (
              <button
                type="button"
                onClick={(e) => toggleExpand(node.id, e)}
                className="p-0.5 hover:bg-gray-200 dark:hover:bg-slate-700 rounded text-slate-500 shrink-0 cursor-pointer"
              >
                {isExpanded ? <CaretDown size={12} weight="bold" /> : <CaretRight size={12} weight="bold" />}
              </button>
            ) : (
              <span className="w-3 shrink-0" />
            )}

            {isFolder ? (
              isExpanded ? (
                <FolderOpen size={16} weight="fill" className="text-amber-500 shrink-0" />
              ) : (
                <Folder size={16} weight="regular" className="text-amber-500 shrink-0" />
              )
            ) : (
              <FilePdf
                size={16}
                weight="fill"
                className={isSelected ? "text-emerald-600 dark:text-emerald-400 shrink-0" : "text-red-500/80 shrink-0"}
              />
            )}

            <span className="truncate text-[11.5px] leading-snug">
              {node.code && <span className="font-semibold text-slate-900 dark:text-slate-100 mr-1">{node.code}</span>}
              {node.docId && <span className="font-bold text-slate-800 dark:text-slate-200 mr-1">- {node.docId}</span>}
              <span>{node.title}</span>
            </span>
          </div>

          {fileCount > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-sky-600 text-white font-mono shrink-0">
              {fileCount}
            </span>
          )}
        </div>

        {isFolder && isExpanded && node.children && (
          <div className="space-y-0.5">
            {node.children.map((child) => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const selectedNodeLabel = `${activeNode.code ? activeNode.code + " " : ""}${activeNode.docId ? "- " + activeNode.docId + " " : ""
    }${activeNode.title}`;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-4 font-sans text-slate-800 dark:text-slate-200">
      {/* Top Header matching reference screenshot */}
      <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-bold text-base text-red-700 dark:text-red-400 tracking-tight">
              Dossier ID:
            </span>
            <span className="font-bold text-base text-slate-900 dark:text-slate-100 font-mono">
              166141-00-220:4757-3700-66401p15e3
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Creation date, submission country role, sequence • <span className="font-semibold text-slate-700 dark:text-slate-300">14.08.2023</span> • RENKOMOKYUMS_ID: 498 barts • Total size: 2062
          </p>
        </div>

        {/* Top Right Action Icons matching screenshot */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
            title="Dossier documents"
          >
            <FileCode size={16} weight="bold" />
          </button>
          <button
            type="button"
            className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
            title="Packaging details"
          >
            <Package size={16} weight="bold" />
          </button>
          <button
            type="button"
            className="p-1.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 transition-colors cursor-pointer"
            title="Lock & Secure"
          >
            <LockKey size={16} weight="bold" />
          </button>
        </div>
      </div>

      {/* 3-Column Layout matching Reference Image Model */}
      <div className="flex flex-col lg:flex-row min-h-[580px] border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
        {/* Column 1: Far Left Dark Tab Sidebar (18% width) */}
        <div className="w-full lg:w-[18%] bg-slate-800 text-slate-200 flex flex-col shrink-0 border-r border-slate-700">
          {/* Header Bar */}
          <div className="bg-slate-900 py-2.5 px-3 border-b border-slate-700 flex items-center justify-center">
            <List size={18} className="text-slate-300" weight="bold" />
          </div>

          {/* Module List Tabs */}
          <div className="flex flex-col divide-y divide-slate-700/60">
            {MAIN_MODULE_TABS.map((tab) => {
              const isActive = activeMainModuleId === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleMainModuleClick(tab.id)}
                  className={`text-left px-3.5 py-3 text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${isActive
                      ? "bg-sky-100 text-sky-800 font-bold border-l-4 border-sky-600"
                      : "hover:bg-slate-700/50 text-slate-300"
                    }`}
                >
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Column 2: Middle Sub-Node Navigation Tree (35% width) */}
        <div className="w-full lg:w-[35%] bg-slate-50 dark:bg-slate-900/60 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 p-2.5 space-y-2">
          {/* Search Bar */}
          <div className="relative">
            <MagnifyingGlass size={14} className="absolute left-2.5 top-2 text-slate-400" />
            <input
              type="text"
              placeholder="Search sections or doc ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Sub-node list */}
          <div className="overflow-y-auto pr-1 space-y-0.5 max-h-[520px] custom-scrollbar flex-1">
            {activeRootModule.children ? (
              activeRootModule.children.map((child) => renderTreeNode(child, 0))
            ) : (
              renderTreeNode(activeRootModule, 0)
            )}
          </div>
        </div>

        {/* Column 3: Right Area - Upload Zone & Data Table (47% width) */}
        <div className="w-full lg:w-[47%] bg-white dark:bg-slate-900 p-4 flex flex-col space-y-4">
          {/* Dropzone Container */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-all relative ${dragActive
                ? "border-sky-500 bg-sky-50 dark:bg-sky-950/30"
                : "border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 hover:border-sky-400"
              }`}
          >
            <input
              type="file"
              onChange={handleFileInput}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
            />
            <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400 flex items-center justify-center mx-auto mb-2">
              <LockKey size={18} weight="bold" />
            </div>
            <p className="font-semibold text-xs text-slate-700 dark:text-slate-300">
              Drag and drop or click here to upload files
            </p>
          </div>

          {/* Current Selected Node Tag Label */}
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 truncate">
            <span className="text-slate-400">Section:</span>
            <span className="text-sky-700 dark:text-sky-300 font-mono truncate">{selectedNodeLabel}</span>
          </div>

          {/* Dark File Table matching Screenshot */}
          <div className="border border-slate-300 dark:border-slate-800 rounded-lg overflow-hidden flex-1 shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                {/* Dark Header matching screenshot */}
                <thead className="bg-slate-800 text-white uppercase text-[10.5px] font-bold tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Document name</th>
                    <th className="py-2.5 px-3">Sequence</th>
                    <th className="py-2.5 px-3">Upload date</th>
                    <th className="py-2.5 px-3">Upload date</th>
                    <th className="py-2.5 px-3">Document completion date</th>
                    <th className="py-2.5 px-3">Encoding</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {currentFiles.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-xs text-slate-400">
                        No uploaded files in this section.
                      </td>
                    </tr>
                  ) : (
                    currentFiles.map((file) => (
                      <tr key={file.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-sky-700 dark:text-sky-400 flex items-center gap-1.5">
                          <FilePdf size={16} className="text-sky-600 dark:text-sky-400 shrink-0" weight="fill" />
                          <span className="truncate max-w-[160px] cursor-pointer hover:underline">{file.name}</span>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-slate-100">{file.sequence}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px]">{file.uploadDate}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px]">{file.uploadDate}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px]">{file.completionDate}</td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-slate-900 dark:text-slate-100">{file.md5Hash}</td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteFile(file.id, file.name)}
                            className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors cursor-pointer"
                            title="Delete file"
                          >
                            <Trash size={14} />
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
      </div>
    </div>
  );
};

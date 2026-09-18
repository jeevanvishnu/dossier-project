"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Folder,
  FolderOpen,
  FilePdf,
  Trash,
  List,
  LockKey,
  Package,
  CaretDown,
  CaretRight,
  MagnifyingGlass,
  CircleNotch,
  PencilSimple,
  Calendar,
  X,
  LockKeyOpen,
  ShieldCheck,
  Warning,
  UploadSimple,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { Virtuoso } from "react-virtuoso";
import { ECTD_FULL_TREE, CTDNode } from "@/app/constants/ctdStructure";
import { api, handleApiError } from "@/app/lib/axios";
import { SkeletonTableRow } from "@/app/components/ui/Skeleton";

interface UploadedFile {
  id: string;
  name: string;
  sequence: string;
  uploadDate: string;
  completionDate: string;
  md5Hash: string;
  imageKitUrl?: string;
  issueDate?: string;
  expirationDate?: string;
}



function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

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

function getAncestorNodeIds(nodes: CTDNode[], targetId: string, currentPath: string[] = []): string[] | null {
  for (const node of nodes) {
    if (node.id === targetId) {
      return currentPath;
    }
    if (node.children) {
      const found = getAncestorNodeIds(node.children, targetId, [...currentPath, node.id]);
      if (found) return found;
    }
  }
  return null;
}

interface UploadDocumentsViewProps {
  projectId?: string;
  isDossierComplete?: boolean;
}

export const UploadDocumentsView: React.FC<UploadDocumentsViewProps> = ({
  projectId = "1",
  isDossierComplete = true,
}) => {
  const tWorkspace = useTranslations("workspace");
  const tCommon = useTranslations("common");
  const tDocTitles = useTranslations("documentTitles");
  const tErrors = useTranslations("errors");
  const tToasts = useTranslations("toasts");

  const getNodeTitle = (node: CTDNode) => {
    const key = node.id.replace(/[\.\-]/g, "_");
    if (tDocTitles.has(key as any)) {
      return tDocTitles(key as any);
    }
    return node.title;
  };

  if (!isDossierComplete) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-amber-500/30 rounded-2xl p-8 text-center space-y-4 shadow-sm font-sans">
        <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
          <LockKey size={26} weight="bold" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          {tWorkspace("tabLocked")}
        </h3>
        <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          {tWorkspace("tabLockedToast")}
        </p>
      </div>
    );
  }

  const mainModuleTabs = useMemo(
    () => [
      { id: "m1", code: "1", label: tWorkspace("m1Label") },
      { id: "m2", code: "2", label: tWorkspace("m2Label") },
      { id: "m3", code: "3", label: tWorkspace("m3Label") },
      { id: "m4", code: "4", label: tWorkspace("m4Label") },
      { id: "m5", code: "5", label: tWorkspace("m5Label") },
    ],
    [tWorkspace]
  );

  const [activeMainModuleId, setActiveMainModuleId] = useState<string>("m1");
  const [selectedModuleId, setSelectedModuleId] = useState<string>("1.0");
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadingFileName, setUploadingFileName] = useState<string>("");
  const [uploadingFileSize, setUploadingFileSize] = useState<string>("");
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "processing" | "success">("idle");
  const [isDownloadingZip, setIsDownloadingZip] = useState<boolean>(false);

  const [isLoadingDoc, setIsLoadingDoc] = useState<boolean>(false);
  const [isDossierLocked, setIsDossierLocked] = useState<boolean>(false);
  const [isLockModalOpen, setIsLockModalOpen] = useState<boolean>(false);

  const handleToggleLock = () => {
    setIsLockModalOpen(true);
  };

  const handleConfirmToggleLock = () => {
    if (isDossierLocked) {
      setIsDossierLocked(false);
      toast.success(tToasts("dossierUnlocked"));
    } else {
      setIsDossierLocked(true);
      toast.success(tToasts("dossierLocked"));
    }
    setIsLockModalOpen(false);
  };

  const handleDownloadZip = async () => {
    if (isDownloadingZip) return;

    const hasUploadedFiles = Object.values(moduleFiles).some(
      (files) => files && files.length > 0
    );

    if (!hasUploadedFiles) {
      toast.error(tWorkspace("pleaseAddFile"));
      return;
    }

    setIsDownloadingZip(true);
    toast.loading(tWorkspace("compilingBtn"), { id: "zip-download-toast" });
    try {
      let activeSeq: string | undefined = undefined;
      let activeConfigId: string | undefined = undefined;
      if (typeof window !== "undefined") {
        activeSeq = sessionStorage.getItem(`active_dossier_sequence_${projectId}`) || undefined;
        activeConfigId = sessionStorage.getItem(`active_dossier_id_${projectId}`) || undefined;
      }
      const compileRes = await api.post(`/projects/${projectId}/compile`, {
        sequence: activeSeq,
        dossierConfigId: activeConfigId ? parseInt(activeConfigId) : undefined,
      });
      if (compileRes.data?.success && compileRes.data?.data?.downloadUrl) {
        const downloadUrl = compileRes.data.data.downloadUrl;
        window.open(downloadUrl, "_blank");
        toast.success(tToasts("zipCompiled"), { id: "zip-download-toast" });
      } else {
        toast.error(tErrors("noDocsToCompile"), { id: "zip-download-toast" });
      }
    } catch (err: any) {
      handleApiError(err, tErrors("failedDownloadZip"), { id: "zip-download-toast" });
    } finally {
      setIsDownloadingZip(false);
    }
  };

  // Document lifecycle operation state ('new' | 'replace' | 'delete')
  const [selectedOperation, setSelectedOperation] = useState<"new" | "replace" | "delete">("new");

  // Load cached CTD tree expanded state from sessionStorage
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = sessionStorage.getItem(`ectd_expanded_nodes_${projectId}`);
        if (cached) {
          return JSON.parse(cached);
        }
      } catch (err) {
        console.warn("Could not load expanded tree state from sessionStorage", err);
      }
    }
    return {
      m1: true,
      "1.2": false,
      "1.3": false,
      m2: true,
      m3: true,
      m4: true,
      m5: true,
    };
  });

  // Save expandedNodes state to sessionStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(`ectd_expanded_nodes_${projectId}`, JSON.stringify(expandedNodes));
      } catch (err) {
        console.warn("Could not save expanded tree state to sessionStorage", err);
      }
    }
  }, [expandedNodes, projectId]);

  const [moduleFiles, setModuleFiles] = useState<Record<string, UploadedFile[]>>({});

  const expandAncestors = (nodeId: string) => {
    const ancestors = getAncestorNodeIds(ECTD_FULL_TREE, nodeId);
    if (ancestors && ancestors.length > 0) {
      setExpandedNodes((prev) => {
        const next = { ...prev };
        ancestors.forEach((ancId) => {
          next[ancId] = true;
        });
        next[nodeId] = true;
        return next;
      });

      const mainModuleId = ancestors[0];
      if (mainModuleId && mainModuleTabs.some((t) => t.id === mainModuleId)) {
        setActiveMainModuleId(mainModuleId);
      }
    }
  };

  const fetchAllDocuments = async () => {
    if (!projectId) return;
    try {
      const response = await api.get(`/projects/${projectId}/documents`);
      if (response.data?.success && Array.isArray(response.data?.data)) {
        const docs = response.data.data;
        const newMap: Record<string, UploadedFile[]> = {};
        docs.forEach((doc: any) => {
          const uploadedAtDate = doc.uploadedAt ? new Date(doc.uploadedAt) : new Date();
          const item: UploadedFile = {
            id: String(doc.id),
            name: doc.originalName,
            sequence: doc.sequence || "0000",
            uploadDate: isNaN(uploadedAtDate.getTime()) ? new Date().toLocaleDateString() : uploadedAtDate.toLocaleDateString(),
            completionDate: isNaN(uploadedAtDate.getTime()) ? new Date().toLocaleDateString() : uploadedAtDate.toLocaleDateString(),
            md5Hash: doc.md5Checksum ? (doc.md5Checksum.length > 15 ? doc.md5Checksum.slice(0, 10) + "..." : doc.md5Checksum) : "MD5",
            imageKitUrl: doc.imageKitUrl,
            issueDate: doc.issueDate ? new Date(doc.issueDate).toISOString() : undefined,
            expirationDate: doc.expirationDate ? new Date(doc.expirationDate).toISOString() : undefined,
          };
          if (!newMap[doc.nodeId]) {
            newMap[doc.nodeId] = [];
          }
          newMap[doc.nodeId].push(item);
        });
        setModuleFiles(newMap);
      }
    } catch (err: any) {
      console.warn("Could not fetch all project documents", err);
    }
  };

  // Fetch all project documents on initial mount & whenever projectId changes
  useEffect(() => {
    fetchAllDocuments();
  }, [projectId]);

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
      const file = e.dataTransfer.files[0];
      // Pre-upload client file size validation (50MB Limit)
      if (file.size > 50 * 1024 * 1024) {
        toast.error(tErrors("fileSizeLimit50MB"));
        return;
      }
      uploadFileToBackend(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Pre-upload client file size validation (50MB Limit)
      if (file.size > 50 * 1024 * 1024) {
        toast.error(tErrors("fileSizeLimit50MB"));
        return;
      }
      uploadFileToBackend(file);
    }
  };

  const [selectedDocCode, setSelectedDocCode] = useState<string>("");

  const uploadFileToBackend = async (file?: File) => {
    if ((selectedOperation === "new" || selectedOperation === "replace") && !file) {
      toast.error(tErrors("selectFileToAttach"));
      return;
    }

    if (file) {
      setUploadingFileName(file.name);
      setUploadingFileSize(formatBytes(file.size));
      setUploadProgress(0);
      setUploadStatus("uploading");
    } else {
      setUploadingFileName("");
      setUploadingFileSize("");
      setUploadProgress(0);
      setUploadStatus("uploading");
    }
    setIsUploading(true);

    try {
      const formData = new FormData();
      if (file) {
        formData.append("file", file);
      }
      formData.append("operation", selectedOperation);
      if (selectedDocCode) {
        formData.append("docCode", selectedDocCode);
      }

      const response = await api.post(
        `/projects/${projectId}/documents/${selectedModuleId}?operation=${selectedOperation}${selectedDocCode ? `&docCode=${selectedDocCode}` : ""}`,
        formData,
        {
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percent = Math.min(99, Math.round((progressEvent.loaded * 100) / progressEvent.total));
              setUploadProgress(percent);
              if (percent >= 99) {
                setUploadStatus("processing");
              }
            }
          },
        }
      );

      if (response.data?.success && response.data?.data) {
        setUploadProgress(100);
        setUploadStatus("success");

        const doc = response.data.data;
        if (selectedOperation === "delete" || doc.status === "deleted") {
          setModuleFiles((prev) => ({
            ...prev,
            [selectedModuleId]: [],
          }));
          toast.success(tToasts("markedDeleted"));
        } else {
          const uploadedAtDate = doc.uploadedAt ? new Date(doc.uploadedAt) : new Date();
          const newFileItem: UploadedFile = {
            id: String(doc.id),
            name: doc.originalName,
            sequence: doc.sequence || "0000",
            uploadDate: isNaN(uploadedAtDate.getTime()) ? new Date().toLocaleDateString() : uploadedAtDate.toLocaleDateString(),
            completionDate: isNaN(uploadedAtDate.getTime()) ? new Date().toLocaleDateString() : uploadedAtDate.toLocaleDateString(),
            md5Hash: doc.md5Checksum ? doc.md5Checksum.slice(0, 10) + "..." : "MD5",
            imageKitUrl: doc.imageKitUrl,
            issueDate: doc.issueDate ? new Date(doc.issueDate).toISOString() : undefined,
            expirationDate: doc.expirationDate ? new Date(doc.expirationDate).toISOString() : undefined,
          };

          setModuleFiles((prev) => ({
            ...prev,
            [selectedModuleId]: [newFileItem],
          }));

          expandAncestors(selectedModuleId);
          fetchAllDocuments();

          toast.success(tToasts("uploadedSuccessfully", { name: doc.originalName, op: selectedOperation.toUpperCase() }));
        }
      }
    } catch (err) {
      handleApiError(err, `Failed to execute ${selectedOperation} operation`);
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        setUploadStatus("idle");
        setUploadingFileName("");
        setUploadingFileSize("");
      }, 700);
    }
  };

  const handleExecuteDeleteOperation = async () => {
    uploadFileToBackend(undefined);
  };

  // Edit document dates modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingFile, setEditingFile] = useState<UploadedFile | null>(null);
  const [editIssueDate, setEditIssueDate] = useState<string>("");
  const [editExpirationDate, setEditExpirationDate] = useState<string>("");
  const [isSavingDates, setIsSavingDates] = useState<boolean>(false);

  // Delete document confirmation modal state
  const [deleteConfirmFile, setDeleteConfirmFile] = useState<UploadedFile | null>(null);
  const [isDeletingFile, setIsDeletingFile] = useState<boolean>(false);

  const handleOpenDeleteModal = (file: UploadedFile) => {
    setDeleteConfirmFile(file);
  };

  const handleOpenEditModal = (file: UploadedFile) => {
    setEditingFile(file);
    const formattedIssue = file.issueDate ? new Date(file.issueDate).toISOString().split("T")[0] : "";
    const formattedExp = file.expirationDate ? new Date(file.expirationDate).toISOString().split("T")[0] : "";
    setEditIssueDate(formattedIssue);
    setEditExpirationDate(formattedExp);
    setIsEditModalOpen(true);
  };

  const handleSaveDates = async () => {
    if (!editingFile) return;

    if (editIssueDate && editExpirationDate) {
      const issue = new Date(editIssueDate);
      const exp = new Date(editExpirationDate);
      if (exp < issue) {
        toast.error(tErrors("expiryBeforeIssue"));
        return;
      }
    }

    setIsSavingDates(true);
    try {
      const response = await api.put(`/projects/${projectId}/documents/${selectedModuleId}/dates`, {
        docId: editingFile.id,
        fileName: editingFile.name,
        issueDate: editIssueDate || null,
        expirationDate: editExpirationDate || null,
      });

      if (response.data?.success) {
        toast.success(tToasts("documentDatesUpdated"));
        const updatedDoc = response.data.data;
        setModuleFiles((prev) => ({
          ...prev,
          [selectedModuleId]: (prev[selectedModuleId] || []).map((f) =>
            f.id === editingFile.id
              ? {
                ...f,
                id: String(updatedDoc?.id || f.id),
                issueDate: editIssueDate ? new Date(editIssueDate).toISOString() : undefined,
                expirationDate: editExpirationDate ? new Date(editExpirationDate).toISOString() : undefined,
              }
              : f
          ),
        }));
        setIsEditModalOpen(false);
      }
    } catch (err: any) {
      handleApiError(err, "Failed to update document dates");
    } finally {
      setIsSavingDates(false);
    }
  };

  const countFilesForNode = (node: CTDNode, filesMap: Record<string, UploadedFile[]>): number => {
    let count = filesMap[node.id] ? filesMap[node.id].length : 0;
    if (node.children) {
      for (const child of node.children) {
        count += countFilesForNode(child, filesMap);
      }
    }
    return count;
  };

  interface FlatNode {
    node: CTDNode;
    depth: number;
  }

  const getFlattenedTree = (
    nodes: CTDNode[],
    depth: number,
    expanded: Record<string, boolean>,
    searchQ: string
  ): FlatNode[] => {
    let result: FlatNode[] = [];
    for (const node of nodes) {
      if (searchQ && !matchesSearch(node, searchQ)) {
        continue;
      }
      result.push({ node, depth });
      const isExpanded = searchQ ? true : !!expanded[node.id];
      if (isExpanded && node.children) {
        result = result.concat(getFlattenedTree(node.children, depth + 1, expanded, searchQ));
      }
    }
    return result;
  };

  const flatTree = useMemo(() => {
    if (activeRootModule.children) {
      return getFlattenedTree(activeRootModule.children, 0, expandedNodes, searchQuery);
    }
    return getFlattenedTree([activeRootModule], 0, expandedNodes, searchQuery);
  }, [activeRootModule, expandedNodes, searchQuery]);

  const selectedNodeLabel = `${activeNode.code ? activeNode.code + " " : ""}${activeNode.docId ? "- " + activeNode.docId + " " : ""
    }${getNodeTitle(activeNode)}`;

  const handleConfirmDeleteFile = async () => {
    if (!deleteConfirmFile) return;
    setIsDeletingFile(true);
    try {
      await api.delete(`/projects/${projectId}/documents/${selectedModuleId}?docId=${deleteConfirmFile.id}`);
      setModuleFiles((prev) => ({
        ...prev,
        [selectedModuleId]: (prev[selectedModuleId] || []).filter((f) => f.id !== deleteConfirmFile.id),
      }));
      fetchAllDocuments();
      toast.success(tToasts("removedAndTombstoned", { name: deleteConfirmFile.name }));
      setDeleteConfirmFile(null);
    } catch (err) {
      handleApiError(err, `Failed to delete ${deleteConfirmFile.name}`);
    } finally {
      setIsDeletingFile(false);
    }
  };

  const matchesSearch = (node: CTDNode, query: string): boolean => {
    if (!query) return true;
    const q = query.toLowerCase();
    const title = getNodeTitle(node).toLowerCase();
    const matchSelf =
      title.includes(q) ||
      node.title.toLowerCase().includes(q) ||
      (node.code && node.code.toLowerCase().includes(q)) ||
      (node.docId && node.docId.toLowerCase().includes(q));

    if (matchSelf) return true;
    if (node.children) {
      return node.children.some((child) => matchesSearch(child, query));
    }
    return false;
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-4 shadow-xs space-y-4 font-sans text-primary">
      {/* Top Header */}
      <div className="flex items-start justify-between border-b border-border pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-bold text-base text-red-700 dark:text-red-400 tracking-tight">
              {tWorkspace("dossierId")}
            </span>
            <span className="font-bold text-base text-primary font-mono">
              {projectId || "1661e1dd-22db-4f57-970d-b64401c1f5a5"}
            </span>
          </div>
          <p className="text-[11px] text-muted">
            {tWorkspace("streamInfo")}
          </p>
        </div>

        {/* Top Right Action Icons */}
        <div className="flex items-center gap-1.5">
          {/* Icon 1: Lock / Unlock Toggle Button */}
          <button
            type="button"
            onClick={handleToggleLock}
            className={`p-1.5 rounded transition-all cursor-pointer border ${isDossierLocked
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20"
              }`}
            title={
              isDossierLocked
                ? tWorkspace("btnUnlockStructure")
                : tWorkspace("btnLockStructure")
            }
          >
            {isDossierLocked ? <LockKey size={16} weight="bold" /> : <LockKeyOpen size={16} weight="bold" />}
          </button>

          {/* Icon 3: Download ZIP Package */}
          <button
            type="button"
            onClick={handleDownloadZip}
            disabled={!isDossierLocked || isDownloadingZip}
            className="p-1.5 rounded bg-surface-raised hover:bg-border text-primary hover:text-accent transition-colors border border-border cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            title={
              !isDossierLocked
                ? tWorkspace("uploadDropzoneLocked")
                : tWorkspace("btnDownloadZip")
            }
          >
            {isDownloadingZip ? (
              <CircleNotch size={16} className="animate-spin text-accent" weight="bold" />
            ) : (
              <Package size={16} weight="bold" />
            )}
          </button>
        </div>
      </div>

      {/* 3-Column Layout */}
      <div className="flex flex-col lg:flex-row min-h-[580px] border border-border rounded-lg overflow-hidden">
        {/* Column 1: Far Left Tab Sidebar (18% width) */}
        <div className="w-full lg:w-[18%] bg-surface-raised text-primary flex flex-col shrink-0 border-r border-border">
          <div className="bg-bg py-2.5 px-3 border-b border-border flex items-center justify-center">
            <List size={18} className="text-secondary" weight="bold" />
          </div>

          <div className="flex flex-col divide-y divide-border">
            {mainModuleTabs.map((tab) => {
              const isActive = activeMainModuleId === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleMainModuleClick(tab.id)}
                  className={`text-left px-3.5 py-3 text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${isActive
                    ? "bg-accent/15 text-accent font-bold border-l-4 border-accent"
                    : "hover:bg-bg/60 text-secondary"
                    }`}
                >
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Column 2: Middle Sub-Node Navigation Tree (35% width) */}
        <div className="w-full lg:w-[35%] bg-bg border-r border-border flex flex-col shrink-0 p-2.5 space-y-2">
          <div className="relative">
            <MagnifyingGlass size={14} className="absolute left-2.5 top-2 text-muted" />
            <input
              type="text"
              placeholder={tWorkspace("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1 bg-surface border border-border rounded text-xs text-primary focus:outline-none focus:border-accent"
            />
          </div>

          <div className="flex-1 h-[520px]">
            <Virtuoso
              style={{ height: '100%', width: '100%' }}
              data={flatTree}
              itemContent={(_index, flatNode) => {
                const { node, depth } = flatNode;
                const isSelected = selectedModuleId === node.id;
                const isFolder = node.isFolder || (node.children && node.children.length > 0);
                const isExpanded = searchQuery ? true : !!expandedNodes[node.id];
                const fileCount = countFilesForNode(node, moduleFiles);

                return (
                  <div key={node.id} className="pb-0.5 pr-1">
                    <div
                      onClick={() => setSelectedModuleId(node.id)}
                      style={{ paddingLeft: `${depth * 12 + 6}px` }}
                      className={`flex items-center justify-between py-1.5 px-2 rounded text-xs font-medium cursor-pointer transition-colors ${isSelected
                        ? "bg-accent/15 border border-accent/40 text-accent font-semibold"
                        : "hover:bg-surface-raised text-secondary border border-transparent"
                        }`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0 pr-2">
                        {isFolder ? (
                          <button
                            type="button"
                            onClick={(e) => toggleExpand(node.id, e)}
                            className="p-0.5 hover:bg-surface-raised rounded text-muted shrink-0 cursor-pointer"
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
                          {node.code && <span className="font-semibold text-primary mr-1">{node.code}</span>}
                          {node.docId && <span className="font-bold text-primary mr-1">- {node.docId}</span>}
                          <span>{getNodeTitle(node)}</span>
                        </span>
                      </div>

                      {fileCount > 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-accent text-white font-mono shrink-0">
                          {fileCount}
                        </span>
                      )}
                    </div>
                  </div>
                );
              }}
            />
          </div>
        </div>

        {/* Column 3: Right Area - Upload Zone & Data Table (47% width) */}
        <div className="w-full lg:w-[47%] bg-surface p-4 flex flex-col space-y-4">
          <div
            onDragEnter={isDossierLocked || isUploading ? undefined : handleDrag}
            onDragOver={isDossierLocked || isUploading ? undefined : handleDrag}
            onDragLeave={isDossierLocked || isUploading ? undefined : handleDrag}
            onDrop={isDossierLocked || isUploading ? undefined : handleDrop}
            className={`border-2 border-dashed rounded-xl p-5 text-center transition-all relative ${
              isDossierLocked
                ? "border-border bg-surface-raised/40 opacity-60 cursor-not-allowed"
                : isUploading
                ? "border-accent/50 bg-accent/5 dark:bg-accent/10 shadow-sm"
                : dragActive
                ? "border-accent bg-accent/10 scale-[1.01]"
                : "border-border bg-bg/50 hover:border-accent/70 hover:bg-surface-raised/50"
            }`}
          >
            <input
              type="file"
              disabled={isUploading || isDossierLocked}
              onChange={handleFileInput}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10 disabled:cursor-not-allowed"
            />
            {isUploading ? (
              <div className="space-y-3 py-1">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-surface-raised border border-border flex items-center justify-center shrink-0 shadow-xs">
                      <CircleNotch size={18} className="animate-spin text-accent" weight="bold" />
                    </div>
                    <div className="text-left min-w-0">
                      <p className="text-xs font-bold text-primary truncate max-w-[220px]" title={uploadingFileName}>
                        {uploadingFileName || tWorkspace("uploadingDocument")}
                      </p>
                      <p className="text-[10.5px] text-muted mt-0.5">
                        {uploadingFileSize ? `${uploadingFileSize} • ` : ""}
                        {uploadStatus === "processing"
                          ? tWorkspace("processingDocument")
                          : tWorkspace("uploadingDocument")}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-primary shrink-0">
                    {uploadProgress}%
                  </span>
                </div>

                <div className="w-full">
                  {uploadStatus === "processing" ? (
                    <progress className="progress w-full"></progress>
                  ) : (
                    <progress className="progress w-full" value={uploadStatus === "success" ? 100 : uploadProgress} max="100"></progress>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <div className="w-9 h-9 rounded-full bg-accent/15 text-accent flex items-center justify-center mx-auto mb-2 transition-transform group-hover:scale-110">
                  {isDossierLocked ? (
                    <LockKey size={20} weight="bold" />
                  ) : (
                    <UploadSimple size={20} weight="bold" />
                  )}
                </div>
                <p className="font-semibold text-xs text-primary">
                  {isDossierLocked
                    ? tWorkspace("uploadDropzoneLocked")
                    : selectedOperation === "replace"
                    ? tWorkspace("uploadDropzoneReplace")
                    : tWorkspace("uploadDropzoneNew")}
                </p>
                <p className="text-[10.5px] text-muted mt-1">{tWorkspace("maxFileLimit")}</p>
              </div>
            )}
          </div>

          <div className="text-xs font-semibold text-primary flex items-center gap-1.5 truncate">
            <span className="text-muted">{tWorkspace("sectionLabel")}</span>
            <span className="text-accent font-mono truncate">{selectedNodeLabel}</span>
          </div>

          <div className="border border-border rounded-lg overflow-hidden flex-1 shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-raised text-primary uppercase text-[10.5px] font-bold tracking-wider border-b border-border">
                  <tr>
                    <th className="py-2.5 px-3">{tWorkspace("tableColDocumentName")}</th>
                    <th className="py-2.5 px-3">{tWorkspace("tableColSequence")}</th>
                    <th className="py-2.5 px-3">{tWorkspace("tableColUploadDate")}</th>
                    <th className="py-2.5 px-3">{tWorkspace("tableColIssueDate")}</th>
                    <th className="py-2.5 px-3">{tWorkspace("tableColExpirationDate")}</th>
                    <th className="py-2.5 px-3">{tWorkspace("tableColMd5")}</th>
                    <th className="py-2.5 px-3 text-center">{tWorkspace("tableColActions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {isLoadingDoc ? (
                    <SkeletonTableRow columns={6} />
                  ) : currentFiles.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                        {tWorkspace("noDocsFound")}
                      </td>
                    </tr>
                  ) : (
                    currentFiles.map((file) => (
                      <tr key={file.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-sky-700 dark:text-sky-400 flex items-center gap-1.5">
                          <FilePdf size={16} className="text-sky-600 dark:text-sky-400 shrink-0" weight="fill" />
                          <a
                            href={file.imageKitUrl || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="truncate max-w-[160px] cursor-pointer hover:underline"
                          >
                            {file.name}
                          </a>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-slate-100">{file.sequence}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px]">
                          {file.uploadDate || "-"}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px]">
                          {file.issueDate ? new Date(file.issueDate).toLocaleDateString() : "-"}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px]">
                          {file.expirationDate ? new Date(file.expirationDate).toLocaleDateString() : "-"}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-slate-900 dark:text-slate-100">{file.md5Hash}</td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              disabled={isDossierLocked}
                              onClick={() => handleOpenEditModal(file)}
                              className="p-1 rounded text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/50 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                              title={isDossierLocked ? "Unlock dossier to edit document dates" : "Edit document dates"}
                            >
                              <PencilSimple size={14} weight="bold" />
                            </button>
                            <button
                              type="button"
                              disabled={isDossierLocked}
                              onClick={() => handleOpenDeleteModal(file)}
                              className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                              title={isDossierLocked ? "Unlock dossier to delete file" : "Delete file"}
                            >
                              <Trash size={14} />
                            </button>
                          </div>
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

      {/* Edit Document Dates Modal */}
      {isEditModalOpen && editingFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-sky-600 dark:text-sky-400" weight="bold" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Update Document Dates
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <X size={16} weight="bold" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 rounded-lg">
                <p className="font-semibold text-slate-700 dark:text-slate-300 truncate">
                  <span className="text-sky-600 dark:text-sky-400 font-bold">Document: </span>
                  {editingFile.name}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  Section: <span className="font-mono">{selectedNodeLabel}</span>
                </p>
              </div>

              {editIssueDate && editExpirationDate && new Date(editExpirationDate) < new Date(editIssueDate) && (
                <div className="p-2.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/60 rounded-lg text-red-600 dark:text-red-400 font-semibold text-[11px]">
                  ⚠️ Expiration date cannot be earlier than issue date.
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Date of Document Issue
                  </label>
                  <input
                    type="date"
                    value={editIssueDate}
                    max={editExpirationDate || undefined}
                    onChange={(e) => setEditIssueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Document Expiration Date
                  </label>
                  <input
                    type="date"
                    value={editExpirationDate}
                    min={editIssueDate || undefined}
                    onChange={(e) => setEditExpirationDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500 font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={
                  isSavingDates ||
                  !!(editIssueDate && editExpirationDate && new Date(editExpirationDate) < new Date(editIssueDate))
                }
                onClick={handleSaveDates}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSavingDates && <CircleNotch size={14} className="animate-spin" weight="bold" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Lock / Unlock Confirmation Alert Modal */}
      {isLockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                {isDossierLocked ? (
                  <LockKeyOpen size={20} className="text-amber-500" weight="bold" />
                ) : (
                  <ShieldCheck size={20} className="text-emerald-500" weight="bold" />
                )}
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  {isDossierLocked ? "Unlock Dossier Structure?" : "Lock Dossier Structure?"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLockModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <X size={16} weight="bold" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-5 space-y-3 text-xs text-slate-600 dark:text-slate-300">
              {isDossierLocked ? (
                <>
                  <p className="leading-relaxed">
                    {tWorkspace("lockModalUnlockBody")}
                  </p>
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-lg space-y-1.5 text-amber-900 dark:text-amber-200">
                    <p className="font-bold text-[11px] uppercase tracking-wider text-amber-700 dark:text-amber-300">
                      {tWorkspace("lockModalWhenUnlocked")}
                    </p>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                      <li>{tWorkspace("lockModalUnlockedItem1")}</li>
                      <li>{tWorkspace("lockModalUnlockedItem2")}</li>
                    </ul>
                  </div>
                </>
              ) : (
                <>
                  <p className="leading-relaxed">
                    {tWorkspace("lockModalLockBody")}
                  </p>
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-lg space-y-1.5 text-emerald-900 dark:text-emerald-200">
                    <p className="font-bold text-[11px] uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                      {tWorkspace("lockModalWhenLocked")}
                    </p>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                      <li>{tWorkspace("lockModalLockedItem1")}</li>
                      <li>{tWorkspace("lockModalLockedItem2")}</li>
                      <li>{tWorkspace("lockModalLockedItem3")}</li>
                    </ul>
                  </div>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <button
                type="button"
                onClick={() => setIsLockModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmToggleLock}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold text-white transition-colors cursor-pointer ${isDossierLocked
                  ? "bg-amber-600 hover:bg-amber-500 shadow-xs"
                  : "bg-emerald-600 hover:bg-emerald-500 shadow-xs"
                  }`}
              >
                {isDossierLocked ? "Unlock Dossier for Editing" : "Lock Dossier & Enable ZIP"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Delete Document Warning Modal */}
      {deleteConfirmFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-red-50/50 dark:bg-red-950/20">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <Warning size={22} weight="bold" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  {tWorkspace("deleteConfirmTitle") || "Delete Document?"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDeleteConfirmFile(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <X size={16} weight="bold" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-lg text-red-900 dark:text-red-200 space-y-1">
                <p className="font-semibold text-xs leading-relaxed">
                  {tWorkspace("deleteConfirmMsg") || "Are you sure you want to delete this document? This action will remove the document and create an eCTD tombstone record."}
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-lg space-y-2 text-slate-700 dark:text-slate-300">
                <div className="flex justify-between items-center text-[11.5px]">
                  <span className="font-medium text-slate-400">Document Name:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 truncate max-w-[210px]">{deleteConfirmFile.name}</span>
                </div>
                <div className="flex justify-between items-center text-[11.5px]">
                  <span className="font-medium text-slate-400">Sequence:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{deleteConfirmFile.sequence}</span>
                </div>
                <div className="flex justify-between items-center text-[11.5px]">
                  <span className="font-medium text-slate-400">MD5 Checksum:</span>
                  <span className="font-mono text-slate-900 dark:text-slate-100">{deleteConfirmFile.md5Hash}</span>
                </div>
                <div className="flex justify-between items-center text-[11.5px]">
                  <span className="font-medium text-slate-400">Section:</span>
                  <span className="font-mono text-sky-600 dark:text-sky-400 truncate max-w-[210px]">{selectedNodeLabel}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <button
                type="button"
                disabled={isDeletingFile}
                onClick={() => setDeleteConfirmFile(null)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                {tCommon("cancel") || "Cancel"}
              </button>
              <button
                type="button"
                disabled={isDeletingFile}
                onClick={handleConfirmDeleteFile}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-500 text-white transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50 shadow-xs"
              >
                {isDeletingFile ? (
                  <CircleNotch size={14} className="animate-spin" weight="bold" />
                ) : (
                  <Trash size={14} weight="bold" />
                )}
                <span>{isDeletingFile ? (tWorkspace("deletingDoc") || "Deleting...") : (tWorkspace("deleteConfirmBtn") || "Delete Document")}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

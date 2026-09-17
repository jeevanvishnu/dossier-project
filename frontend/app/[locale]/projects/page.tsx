"use client";

import React, { useState } from "react";
import { Link, useRouter } from "../../../i18n/routing";
import { AppShell } from "../../components/AppShell";
import {
  Plus,
  Pill,
  ArrowRight,
  ArrowLeft,
  MagnifyingGlass,
  SquaresFour,
  List,
  SlidersHorizontal,
  Trash,
  User,
  Package,
  CalendarBlank,
  Tag,
  Flask,
  FileText,
  X,
  Buildings,
  Certificate,
  Sparkle,
  CircleNotch,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { useTranslations, useLocale } from "next-intl";

import { api, handleApiError } from "@/app/lib/axios";
import { SkeletonCard, SkeletonTableRow } from "@/app/components/ui/Skeleton";
import {
  translateValue,
  tariffMapRu,
  productTypeMapRu,
  dosageFormMapRu,
  additionalFeatureMapRu,
  responsibleUserMapRu,
  statusMapRu,
} from "@/app/lib/i18nLookups";

interface ProjectItem {
  id: string;
  productName: string;
  manufacturer: string;
  dosageForm: string;
  drugType: string; // Product Type
  additionalFeature: string;
  mah: string; // Marketing Authorization Holder (Registration Holder)
  responsiblePerson: string; // Responsible User
  assignedTariff: string; // Tariff
  tariffComment: string;
  date: string;
  projectVolume: string;
  status: string;
  country: string;
  role: string;
  sequence: string;
}

export default function ProjectsPage() {
  const router = useRouter();
  const tProjects = useTranslations("projects");
  const tWorkspace = useTranslations("workspace");
  const tCommon = useTranslations("common");
  const tToasts = useTranslations("toasts");
  const locale = useLocale();

  const [deleteConfirmProject, setDeleteConfirmProject] = useState<ProjectItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState<boolean>(true);
  const [isCreatingProject, setIsCreatingProject] = useState<boolean>(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const itemsPerPage = 10;

  const handleCreateNewProject = () => {
    router.push("/projects/new?tab=dossier-data");
  };

  // Fetch real projects from backend database
  React.useEffect(() => {
    const fetchProjects = async () => {
      setIsLoadingProjects(true);
      try {
        const response = await api.get(`/projects?page=${currentPage}&limit=${itemsPerPage}`);
        if (response.data?.success && Array.isArray(response.data?.data)) {
          const dbProjects: ProjectItem[] = response.data.data.map((p: any) => ({
            id: p.projectCode || String(p.id),
            productName: p.productName,
            manufacturer: p.manufacturer || "-",
            dosageForm: p.dosageForm || "-",
            drugType: p.productType || "-",
            additionalFeature: p.additionalFeature || "Standard",
            mah: p.mahHolder || "-",
            responsiblePerson: p.responsibleUser || "-",
            assignedTariff: p.tariff || "Tariff OWN",
            tariffComment: "eCTD Regulatory Submission License",
            date: p.createdAt ? p.createdAt.split("T")[0] : new Date().toISOString().split("T")[0],
            projectVolume: "-",
            status: p.status || "In Progress",
            country: p.dossierConfig?.submissionCountry || "-",
            role: p.dossierConfig?.role || "-",
            sequence: p.dossierConfig?.dossierSequence || "0000",
          }));
          setProjects(dbProjects);
          if (response.data.pagination) {
            setTotalPages(response.data.pagination.totalPages || 1);
          }
        }
      } catch (err: any) {
        console.warn("Could not fetch projects from backend API:", err?.message);
      } finally {
        setIsLoadingProjects(false);
      }
    };

    fetchProjects();
  }, [currentPage]);



  const handleDeleteProject = async (targetPrj: ProjectItem) => {
    setIsDeletingId(targetPrj.id);
    try {
      const response = await api.delete(`/projects/${targetPrj.id}`);
      if (response.data?.success || response.status === 200) {
        setProjects((prev) => prev.filter((p) => p.id !== targetPrj.id));
        setDeleteConfirmProject(null);
        toast.success(tToasts("projectDeleted", { name: targetPrj.productName }));
      }
    } catch (err) {
      handleApiError(err, "Failed to delete project");
    } finally {
      setIsDeletingId(null);
    }
  };

  const filteredProjects = projects.filter(
    (p) =>
      p.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.mah.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.responsiblePerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.drugType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.assignedTariff.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface border border-border p-5 rounded-2xl shadow-xs">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-accent px-2 py-0.5 rounded bg-accent/10 border border-accent/20">
              {tProjects("workspaceBadge")}
            </span>
            <h1 className="font-lexend text-2xl font-bold text-primary mt-1">
              {tProjects("title")}
            </h1>
            <p className="text-xs text-secondary">
              {tProjects("sub")}
            </p>
          </div>

          <button
            onClick={handleCreateNewProject}
            disabled={isCreatingProject}
            className="px-4 py-2 bg-accent hover:bg-accent-hover text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
          >
            {isCreatingProject ? <CircleNotch size={16} className="animate-spin" /> : <Plus size={16} />}
            <span>{tProjects("newProjectBtn")}</span>
          </button>
        </div>

        {/* Filter & Toolbar */}
        <div className="bg-surface border border-border p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          {/* Search Box */}
          <div className="flex items-center gap-2 bg-bg border border-border rounded-xl px-3 py-2 text-xs text-muted w-full sm:w-80">
            <MagnifyingGlass size={16} className="text-muted shrink-0" />
            <input
              type="text"
              placeholder={tCommon("search")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-primary outline-none w-full text-xs"
            />
          </div>

          {/* Right Controls: View Toggle + Stats */}
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            <div className="text-xs text-secondary font-semibold">
              {tProjects("activeCount")}: <strong className="text-accent">{projects.length}</strong>
            </div>

            {/* Grid / List Mode Switcher */}
            <div className="flex items-center bg-bg border border-border p-1 rounded-xl gap-1">
              <button
                onClick={() => setViewMode("grid")}
                title="Grid View"
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${viewMode === "grid"
                  ? "bg-accent text-white shadow-xs"
                  : "text-secondary hover:text-primary hover:bg-surface"
                  }`}
              >
                <SquaresFour size={16} />
                <span className="hidden md:inline text-[11px]">{tProjects("gridView")}</span>
              </button>

              <button
                onClick={() => setViewMode("list")}
                title="List View"
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${viewMode === "list"
                  ? "bg-accent text-white shadow-xs"
                  : "text-secondary hover:text-primary hover:bg-surface"
                  }`}
              >
                <List size={16} />
                <span className="hidden md:inline text-[11px]">{tProjects("listView")}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Loading Skeleton View */}
        {isLoadingProjects ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : (
            <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-border">
                <div className="animate-pulse bg-surface-raised h-5 w-48 rounded" />
              </div>
              <table className="w-full text-left text-xs">
                <thead className="bg-bg text-primary uppercase font-bold text-[10px] tracking-wider border-b border-border">
                  <tr>
                    <th className="py-3.5 px-5">{tProjects("colName")}</th>
                    <th className="py-3.5 px-5">{tProjects("labelTariff")}</th>
                    <th className="py-3.5 px-5">{tProjects("labelProductType")}</th>
                    <th className="py-3.5 px-5">{tProjects("labelDate")}</th>
                    <th className="py-3.5 px-5">{tProjects("labelManufacturer")}</th>
                    <th className="py-3.5 px-5">{tProjects("labelProjectVolume")}</th>
                    <th className="py-3.5 px-5 text-right">{tCommon("actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  <SkeletonTableRow columns={7} />
                  <SkeletonTableRow columns={7} />
                  <SkeletonTableRow columns={7} />
                </tbody>
              </table>
            </div>
          )
        ) : filteredProjects.length === 0 ? (
          <div className="bg-surface border border-border rounded-2xl p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto text-accent">
              <MagnifyingGlass size={24} />
            </div>
            <h3 className="font-lexend text-base font-bold text-primary">{tProjects("noProjectsTitle")}</h3>
            <p className="text-xs text-secondary max-w-sm mx-auto">
              {tProjects("noProjectsDesc")}
            </p>
          </div>
        ) : null}

        {/* 1. GRID VIEW MODEL */}
        {viewMode === "grid" && filteredProjects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((prj) => (
              <div
                key={prj.id}
                className="bg-surface border border-border hover:border-accent/40 rounded-2xl p-5 shadow-sm flex flex-col justify-between transition-all group relative"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${prj.status.includes("Approved")
                          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                          : "bg-accent/10 text-accent border border-accent/20"
                          }`}
                      >
                        {translateValue(prj.status, locale, statusMapRu)}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-lexend font-bold text-base text-primary mb-1 group-hover:text-accent transition-colors">
                    {prj.productName}
                  </h3>
                  <p className="text-xs text-secondary mb-3 flex items-center gap-1.5 font-medium">
                    <Pill size={14} className="text-accent shrink-0" />
                    <span>{translateValue(prj.dosageForm, locale, dosageFormMapRu)}</span>
                  </p>

                  <div className="space-y-2 bg-bg p-3 rounded-xl border border-border text-xs mb-4">
                    <div className="flex justify-between">
                      <span className="text-muted">{tProjects("labelManufacturer")}:</span>
                      <span className="text-primary font-medium truncate max-w-[150px]">{prj.manufacturer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">{tProjects("labelMah")}:</span>
                      <span className="text-accent font-semibold truncate max-w-[150px]">{prj.mah}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">{tProjects("labelProductType")}:</span>
                      <span className="text-primary font-semibold">{translateValue(prj.drugType, locale, productTypeMapRu)}</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-muted shrink-0">{tProjects("labelTariff")}:</span>
                      <span className="font-bold text-accent text-[11px]">{translateValue(prj.assignedTariff, locale, tariffMapRu)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">{tProjects("labelResponsibleUser")}:</span>
                      <span className="text-primary font-semibold">{translateValue(prj.responsiblePerson, locale, responsibleUserMapRu)}</span>
                    </div>
                    {prj.additionalFeature && (
                      <div className="pt-1.5 border-t border-border/60 text-[11px] text-secondary">
                        <span className="font-semibold text-accent">{tProjects("labelFeature")}: </span>
                        <span>{translateValue(prj.additionalFeature, locale, additionalFeatureMapRu)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="text-[10px] text-muted font-mono">{tProjects("labelDate")}: {prj.date}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setDeleteConfirmProject(prj)}
                      title={tCommon("delete")}
                      className="p-1.5 bg-bg hover:bg-rose-500/10 text-secondary hover:text-rose-400 border border-border rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash size={14} />
                    </button>
                    <Link
                      href={`/projects/${prj.id}?tab=dossier-data`}
                      className="px-3 py-1.5 bg-accent/15 hover:bg-accent/25 text-accent font-bold text-xs rounded-lg transition-colors flex items-center gap-1"
                    >
                      <span>{tProjects("openWorkspace")}</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 2. LIST VIEW MODEL */}
        {viewMode === "list" && filteredProjects.length > 0 && (
          <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-bg border-b border-border text-muted font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-4">{tProjects("colName")}</th>
                    <th className="py-3.5 px-4">{tProjects("labelTariff")}</th>
                    <th className="py-3.5 px-4">{tProjects("labelProductType")}</th>
                    <th className="py-3.5 px-4">{tProjects("labelDate")}</th>
                    <th className="py-3.5 px-4">{tProjects("labelManufacturer")}</th>
                    <th className="py-3.5 px-4">{tProjects("labelProjectVolume")}</th>
                    <th className="py-3.5 px-4 text-center">{tCommon("actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredProjects.map((prj) => (
                    <tr key={prj.id} className="hover:bg-bg/60 transition-colors group">
                      {/* 1. Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col min-w-[140px]">
                          <span className="font-lexend font-bold text-primary group-hover:text-accent transition-colors text-xs">
                            {prj.productName}
                          </span>
                        </div>
                      </td>

                      {/* 2. Tariff */}
                      <td className="py-3.5 px-4 min-w-[120px]">
                        <span className="font-bold text-accent text-[11px] block">{translateValue(prj.assignedTariff, locale, tariffMapRu)}</span>
                      </td>

                      {/* 3. Product Type */}
                      <td className="py-3.5 px-4 text-primary font-medium whitespace-nowrap">
                        <span className="px-2 py-0.5 bg-bg border border-border rounded text-[11px]">
                          {translateValue(prj.drugType, locale, productTypeMapRu)}
                        </span>
                      </td>

                      {/* 4. Date */}
                      <td className="py-3.5 px-4 text-secondary font-medium whitespace-nowrap">
                        {prj.date}
                      </td>

                      {/* 5. Manufacturer */}
                      <td className="py-3.5 px-4 text-primary font-medium min-w-[130px]">
                        {prj.manufacturer}
                      </td>

                      {/* 6. Project Volume */}
                      <td className="py-3.5 px-4 text-secondary font-medium whitespace-nowrap">
                        {prj.projectVolume || "1 Vol"}
                      </td>

                      {/* 7. Actions (Edit, Remove, Open) */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setDeleteConfirmProject(prj)}
                            title={tCommon("delete")}
                            className="p-1.5 bg-bg hover:bg-rose-500/10 text-secondary hover:text-rose-400 border border-border rounded-lg transition-colors inline-flex items-center cursor-pointer"
                          >
                            <Trash size={14} />
                          </button>
                          <Link
                            href={`/projects/${prj.id}?tab=dossier-data`}
                            title={tProjects("openWorkspace")}
                            className="p-1.5 bg-accent/15 hover:bg-accent/25 text-accent font-bold text-xs rounded-lg transition-colors inline-flex items-center"
                          >
                            <ArrowRight size={14} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination Controls */}
        {!isLoadingProjects && projects.length > 0 && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface border border-border p-4 rounded-2xl shadow-xs text-xs text-secondary mt-6">
            <div>
              {tWorkspace("showingDossiers", {
                start: (currentPage - 1) * itemsPerPage + 1,
                end: Math.min(currentPage * itemsPerPage, filteredProjects.length),
                total: filteredProjects.length,
              })}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3.5 py-1.5 bg-bg border border-border rounded-xl text-xs font-semibold text-secondary hover:text-primary hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all flex items-center gap-1"
              >
                <ArrowLeft size={13} weight="bold" />
                <span>{tWorkspace("previous")}</span>
              </button>
              <span className="font-mono text-xs font-semibold text-primary px-2">
                {tWorkspace("pageOf", { current: currentPage, total: totalPages })}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3.5 py-1.5 bg-bg border border-border rounded-xl text-xs font-semibold text-secondary hover:text-primary hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all flex items-center gap-1"
              >
                <span>{tWorkspace("next")}</span>
                <ArrowRight size={13} weight="bold" />
              </button>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-surface border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center gap-3 text-rose-500">
                <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                  <Trash size={22} />
                </div>
                <div>
                  <h3 className="font-lexend font-bold text-base text-primary">{tProjects("deleteProjectTitle")}</h3>
                  <p className="font-lexend font-bold text-sm text-rose-400 mt-0.5">{deleteConfirmProject.productName}</p>
                  <span className="font-mono text-[10px] text-muted block">{deleteConfirmProject.id}</span>
                </div>
              </div>

              <p className="text-xs text-secondary leading-relaxed">
                {tProjects("deleteProjectConfirm")}
              </p>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  disabled={isDeletingId === deleteConfirmProject.id}
                  onClick={() => setDeleteConfirmProject(null)}
                  className="px-4 py-2 bg-bg hover:bg-surface-raised border border-border text-secondary font-semibold rounded-lg cursor-pointer disabled:opacity-50 text-xs"
                >
                  {tCommon("cancel")}
                </button>
                <button
                  type="button"
                  disabled={isDeletingId === deleteConfirmProject.id}
                  onClick={() => handleDeleteProject(deleteConfirmProject)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition-all shadow-sm cursor-pointer flex items-center gap-2 disabled:opacity-50 text-xs"
                >
                  {isDeletingId === deleteConfirmProject.id && <CircleNotch size={16} className="animate-spin" />}
                  <span>{isDeletingId === deleteConfirmProject.id ? tProjects("deleting") : tProjects("confirmDelete")}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

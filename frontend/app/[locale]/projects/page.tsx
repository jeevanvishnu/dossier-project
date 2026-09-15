"use client";

import React, { useState } from "react";
import { Link } from "../../../i18n/routing";
import { AppShell } from "../../components/AppShell";
import {
  Plus,
  Pill,
  ArrowRight,
  MagnifyingGlass,
  SquaresFour,
  List,
  SlidersHorizontal,
  PencilSimple,
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
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

import { api, handleApiError } from "@/app/lib/axios";
import { SkeletonCard, SkeletonTableRow } from "@/app/components/ui/Skeleton";

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
  const tProjects = useTranslations("projects");
  const tCommon = useTranslations("common");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [deleteConfirmProject, setDeleteConfirmProject] = useState<ProjectItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  const [newProject, setNewProject] = useState({
    productName: "",
    manufacturer: "",
    dosageForm: "",
    drugType: "",
    additionalFeature: "",
    mah: "",
    responsiblePerson: "",
    assignedTariff: "Tariff OWN",
    tariffComment: "",
    date: new Date().toISOString().split("T")[0],
    projectVolume: "",
    submissionCountry: "KAZAKHSTAN",
    submissionRole: "",
    initialSequence: "Sequence 0000",
  });

  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState<boolean>(true);
  const [isCreatingProject, setIsCreatingProject] = useState<boolean>(false);
  const [isUpdatingProject, setIsUpdatingProject] = useState<boolean>(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const itemsPerPage = 10;

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

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreatingProject) return;
    setIsCreatingProject(true);
    try {
      const payload = {
        productName: newProject.productName,
        dosageForm: newProject.dosageForm,
        productType: newProject.drugType,
        manufacturer: newProject.manufacturer,
        mahHolder: newProject.mah,
        responsibleUser: newProject.responsiblePerson,
        tariff: newProject.assignedTariff || "Tariff OWN",
        additionalFeature: newProject.additionalFeature || "Standard",
        submissionCountry: newProject.submissionCountry,
        role: newProject.submissionRole,
        dossierSequence: newProject.initialSequence,
      };

      const response = await api.post("/projects", payload);
      if (response.data?.success) {
        const createdData = response.data.data;
        const createdProjectObj = createdData.project;
        const createdConfigObj = createdData.config;

        const created: ProjectItem = {
          id: createdProjectObj.projectCode || String(createdProjectObj.id),
          productName: createdProjectObj.productName,
          manufacturer: createdProjectObj.manufacturer || newProject.manufacturer,
          dosageForm: createdProjectObj.dosageForm || newProject.dosageForm,
          drugType: createdProjectObj.productType || newProject.drugType,
          additionalFeature: createdProjectObj.additionalFeature || newProject.additionalFeature || "Standard",
          mah: createdProjectObj.mahHolder || newProject.mah,
          responsiblePerson: createdProjectObj.responsibleUser || newProject.responsiblePerson,
          assignedTariff: createdProjectObj.tariff || newProject.assignedTariff || "Tariff OWN",
          tariffComment: newProject.tariffComment,
          date: createdProjectObj.createdAt ? createdProjectObj.createdAt.split("T")[0] : newProject.date,
          projectVolume: newProject.projectVolume,
          status: createdProjectObj.status || "In Progress",
          country: createdConfigObj?.submissionCountry || newProject.submissionCountry,
          role: createdConfigObj?.role || newProject.submissionRole,
          sequence: createdConfigObj?.dossierSequence || newProject.initialSequence,
        };

        setProjects([created, ...projects]);
        setNewProject({
          productName: "",
          manufacturer: "",
          dosageForm: "",
          drugType: "",
          additionalFeature: "",
          mah: "",
          responsiblePerson: "",
          assignedTariff: "Tariff OWN",
          tariffComment: "",
          date: new Date().toISOString().split("T")[0],
          projectVolume: "",
          submissionCountry: "",
          submissionRole: "",
          initialSequence: "Sequence 0000",
        });
        setShowCreateModal(false);
        toast.success(`Project ${created.productName} created successfully!`);
      }
    } catch (err) {
      handleApiError(err, "Failed to create project");
    } finally {
      setIsCreatingProject(false);
    }
  };

  const handleSaveEditProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject || isUpdatingProject) return;
    setIsUpdatingProject(true);
    try {
      const payload = {
        productName: editingProject.productName,
        dosageForm: editingProject.dosageForm,
        productType: editingProject.drugType,
        manufacturer: editingProject.manufacturer,
        mahHolder: editingProject.mah,
        responsibleUser: editingProject.responsiblePerson,
        tariff: editingProject.assignedTariff || "Tariff OWN",
        additionalFeature: editingProject.additionalFeature,
        status: editingProject.status,
      };

      const response = await api.put(`/projects/${editingProject.id}`, payload);
      if (response.data?.success) {
        setProjects(projects.map((p) => (p.id === editingProject.id ? editingProject : p)));
        toast.success(`Project ${editingProject.productName} updated successfully!`);
        setEditingProject(null);
      }
    } catch (err) {
      handleApiError(err, "Failed to update project");
    } finally {
      setIsUpdatingProject(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    setIsDeletingId(id);
    try {
      const response = await api.delete(`/projects/${id}`);
      if (response.data?.success || response.status === 200) {
        setProjects(projects.filter((p) => p.id !== id));
        setDeleteConfirmProject(null);
        setEditingProject(null);
        toast.success(`Project ${id} deleted successfully`);
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
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-accent hover:bg-accent-hover text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Plus size={16} />
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
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === "grid"
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
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === "list"
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
                    <th className="py-3.5 px-5">ID</th>
                    <th className="py-3.5 px-5">{tProjects("colName")}</th>
                    <th className="py-3.5 px-5">{tProjects("colDosageForm")}</th>
                    <th className="py-3.5 px-5">MAH</th>
                    <th className="py-3.5 px-5">{tCommon("status")}</th>
                    <th className="py-3.5 px-5 text-right">{tCommon("actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  <SkeletonTableRow columns={6} />
                  <SkeletonTableRow columns={6} />
                  <SkeletonTableRow columns={6} />
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
                      <span className="font-mono text-xs font-bold text-accent">
                        {prj.id}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          prj.status.includes("Approved")
                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                            : "bg-accent/10 text-accent border border-accent/20"
                        }`}
                      >
                        {prj.status}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-lexend font-bold text-base text-primary mb-1 group-hover:text-accent transition-colors">
                    {prj.productName}
                  </h3>
                  <p className="text-xs text-secondary mb-3 flex items-center gap-1.5 font-medium">
                    <Pill size={14} className="text-accent shrink-0" />
                    <span>{prj.dosageForm}</span>
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
                      <span className="text-primary font-semibold">{prj.drugType}</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-muted shrink-0">{tProjects("labelTariff")}:</span>
                      <span className="font-bold text-accent text-[11px]">{prj.assignedTariff}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">{tProjects("labelResponsibleUser")}:</span>
                      <span className="text-primary font-semibold">{prj.responsiblePerson}</span>
                    </div>
                    {prj.additionalFeature && (
                      <div className="pt-1.5 border-t border-border/60 text-[11px] text-secondary">
                        <span className="font-semibold text-accent">{tProjects("labelFeature")}: </span>
                        <span>{prj.additionalFeature}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="text-[10px] text-muted font-mono">{tProjects("labelDate")}: {prj.date}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setEditingProject(prj)}
                      title={tCommon("edit")}
                      className="p-1.5 bg-bg hover:bg-accent/10 text-secondary hover:text-accent border border-border rounded-lg transition-colors cursor-pointer"
                    >
                      <PencilSimple size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmProject(prj)}
                      title={tCommon("delete")}
                      className="p-1.5 bg-bg hover:bg-rose-500/10 text-secondary hover:text-rose-400 border border-border rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash size={14} />
                    </button>
                    <Link
                      href={`/projects/${prj.id}`}
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
                    <th className="py-3.5 px-4">{tProjects("labelManufacturer")}</th>
                    <th className="py-3.5 px-4">{tProjects("colDosageForm")}</th>
                    <th className="py-3.5 px-4">{tProjects("labelProductType")}</th>
                    <th className="py-3.5 px-4">{tProjects("colAdditionalFeature")}</th>
                    <th className="py-3.5 px-4">{tProjects("labelMah")}</th>
                    <th className="py-3.5 px-4">{tProjects("labelResponsibleUser")}</th>
                    <th className="py-3.5 px-4">{tProjects("labelTariff")}</th>
                    <th className="py-3.5 px-4">{tCommon("status")}</th>
                    <th className="py-3.5 px-4 text-center">{tCommon("actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredProjects.map((prj) => (
                    <tr key={prj.id} className="hover:bg-bg/60 transition-colors group">
                      {/* 1. Product Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col min-w-[140px]">
                          <span className="font-mono text-[10px] font-bold text-accent">
                            {prj.id}
                          </span>
                          <span className="font-lexend font-bold text-primary group-hover:text-accent transition-colors text-xs">
                            {prj.productName}
                          </span>
                        </div>
                      </td>

                      {/* 2. Manufacturer */}
                      <td className="py-3.5 px-4 text-primary font-medium min-w-[130px]">
                        {prj.manufacturer}
                      </td>

                      {/* 3. Dosage Form */}
                      <td className="py-3.5 px-4 text-secondary font-medium whitespace-nowrap">
                        {prj.dosageForm}
                      </td>

                      {/* 4. Product Type */}
                      <td className="py-3.5 px-4 text-primary font-medium whitespace-nowrap">
                        <span className="px-2 py-0.5 bg-bg border border-border rounded text-[11px]">
                          {prj.drugType}
                        </span>
                      </td>

                      {/* 5. Additional Feature */}
                      <td className="py-3.5 px-4 text-secondary text-[11px] min-w-[150px]">
                        <span className="line-clamp-2" title={prj.additionalFeature}>
                          {prj.additionalFeature || "Standard"}
                        </span>
                      </td>

                      {/* 6. MAH (Registration Holder) */}
                      <td className="py-3.5 px-4 text-accent font-semibold min-w-[140px]">
                        {prj.mah}
                      </td>

                      {/* 7. Responsible User */}
                      <td className="py-3.5 px-4 text-primary font-semibold whitespace-nowrap">
                        {prj.responsiblePerson}
                      </td>

                      {/* 8. Tariff */}
                      <td className="py-3.5 px-4 min-w-[120px]">
                        <span className="font-bold text-accent text-[11px] block">{prj.assignedTariff}</span>
                      </td>

                      {/* 9. Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded inline-block ${
                            prj.status.includes("Approved")
                              ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                              : "bg-accent/10 text-accent border border-accent/20"
                          }`}
                        >
                          {prj.status}
                        </span>
                      </td>

                      {/* 10. Actions */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setEditingProject(prj)}
                            title="Edit Project"
                            className="p-1.5 bg-bg hover:bg-accent/10 text-secondary hover:text-accent border border-border rounded-lg transition-colors inline-flex items-center cursor-pointer"
                          >
                            <PencilSimple size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmProject(prj)}
                            title="Delete Project"
                            className="p-1.5 bg-bg hover:bg-rose-500/10 text-secondary hover:text-rose-400 border border-border rounded-lg transition-colors inline-flex items-center cursor-pointer"
                          >
                            <Trash size={14} />
                          </button>
                          <Link
                            href={`/projects/${prj.id}`}
                            title="Open Workspace"
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
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 bg-bg border border-border rounded-lg text-xs font-semibold text-secondary hover:text-primary hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-xs text-secondary font-mono">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 bg-bg border border-border rounded-lg text-xs font-semibold text-secondary hover:text-primary hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}

        {/* Create Project Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-surface border border-border rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Pill size={22} className="text-accent" />
                  <h2 className="font-lexend font-bold text-lg text-primary">
                    {tProjects("createModalTitle")}
                  </h2>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-secondary hover:text-primary p-1 rounded-lg hover:bg-bg cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* 1. Product Name */}
                  <div>
                    <label className="block text-primary font-semibold mb-1">{tProjects("formProductName")}</label>
                    <input
                      type="text"
                      required
                      value={newProject.productName}
                      onChange={(e) => setNewProject({ ...newProject, productName: e.target.value })}
                      className="w-full bg-bg border border-border rounded-lg p-2.5 text-primary outline-none focus:border-accent"
                      placeholder="Paracetamol Extra KZ"
                    />
                  </div>

                  {/* 2. Manufacturer */}
                  <div>
                    <label className="block text-primary font-semibold mb-1">{tProjects("formManufacturer")}</label>
                    <input
                      type="text"
                      required
                      value={newProject.manufacturer}
                      onChange={(e) => setNewProject({ ...newProject, manufacturer: e.target.value })}
                      className="w-full bg-bg border border-border rounded-lg p-2.5 text-primary outline-none focus:border-accent"
                      placeholder="PharmKazakhstan Manufacturing JSC"
                    />
                  </div>

                  {/* 3. Dosage Form */}
                  <div>
                    <label className="block text-primary font-semibold mb-1">{tProjects("formDosageForm")}</label>
                    <div className="relative">
                      <select
                        required
                        value={newProject.dosageForm}
                        onChange={(e) => setNewProject({ ...newProject, dosageForm: e.target.value })}
                        className="w-full bg-bg border border-border rounded-lg p-2.5 pr-8 text-primary outline-none focus:border-accent appearance-none cursor-pointer"
                      >
                        <option value="" disabled>Select dosage form...</option>
                        <option value="External spray">External spray</option>
                        <option value="Cream">Cream</option>
                        <option value="Ointment">Ointment</option>
                        <option value="Solution">Solution</option>
                        <option value="Tablets">Tablets</option>
                        <option value="Capsules">Capsules</option>
                        <option value="Syrup">Syrup</option>
                        <option value="Injection">Injection</option>
                        <option value="Powder for solution">Powder for solution</option>
                        <option value="Gel">Gel</option>
                        <option value="Drops">Drops</option>
                        <option value="Suppositories">Suppositories</option>
                        <option value="Patch">Patch</option>
                        <option value="Inhaler">Inhaler</option>
                      </select>
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                    </div>
                  </div>

                  {/* 4. Product Type */}
                  <div>
                    <label className="block text-primary font-semibold mb-1">{tProjects("formProductType")}</label>
                    <div className="relative">
                      <select
                        required
                        value={newProject.drugType}
                        onChange={(e) => setNewProject({ ...newProject, drugType: e.target.value })}
                        className="w-full bg-bg border border-border rounded-lg p-2.5 pr-8 text-primary outline-none focus:border-accent appearance-none cursor-pointer"
                      >
                        <option value="" disabled>Select type of medicinal product...</option>
                        <option value="Reproduced (Generic)">Reproduced (Generic)</option>
                        <option value="Original">Original</option>
                        <option value="Biosimilar">Biosimilar</option>
                        <option value="Biological">Biological</option>
                        <option value="Herbal">Herbal</option>
                        <option value="Orphan">Orphan</option>
                        <option value="Radio-pharmaceutical">Radio-pharmaceutical</option>
                        <option value="Fixed-dose combination">Fixed-dose combination</option>
                      </select>
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                    </div>
                  </div>

                  {/* 5. Additional Feature */}
                  <div>
                    <label className="block text-primary font-semibold mb-1">{tProjects("formAdditionalFeature")}</label>
                    <div className="relative">
                      <select
                        value={newProject.additionalFeature}
                        onChange={(e) => setNewProject({ ...newProject, additionalFeature: e.target.value })}
                        className="w-full bg-bg border border-border rounded-lg p-2.5 pr-8 text-primary outline-none focus:border-accent appearance-none cursor-pointer"
                      >
                        <option value="">None / Standard</option>
                        <option value="Prescription / Topical antifungal">Prescription / Topical antifungal</option>
                        <option value="OTC / Topical antifungal">OTC / Topical antifungal</option>
                        <option value="Cold-Chain Storage">Cold-Chain Storage</option>
                        <option value="Fast-Track Review">Fast-Track Review</option>
                        <option value="Orphan Drug Designation">Orphan Drug Designation</option>
                        <option value="Controlled Substance">Controlled Substance</option>
                        <option value="Paediatric Use">Paediatric Use</option>
                        <option value="Combination Product">Combination Product</option>
                      </select>
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                    </div>
                  </div>

                  {/* 6. MAH (Registration Holder) */}
                  <div>
                    <label className="block text-primary font-semibold mb-1">{tProjects("formMah")}</label>
                    <input
                      type="text"
                      required
                      value={newProject.mah}
                      onChange={(e) => setNewProject({ ...newProject, mah: e.target.value })}
                      className="w-full bg-bg border border-border rounded-lg p-2.5 text-primary outline-none focus:border-accent"
                      placeholder="MedTech Alliance LLP"
                    />
                  </div>

                  {/* 7. Responsible User */}
                  <div>
                    <label className="block text-primary font-semibold mb-1">{tProjects("formResponsibleUser")}</label>
                    <div className="relative">
                      <select
                        required
                        value={newProject.responsiblePerson}
                        onChange={(e) => setNewProject({ ...newProject, responsiblePerson: e.target.value })}
                        className="w-full bg-bg border border-border rounded-lg p-2.5 pr-8 text-primary outline-none focus:border-accent appearance-none cursor-pointer"
                      >
                        <option value="" disabled>Select responsible user...</option>
                        <option value="Dr. Alikhan Saparov">Dr. Alikhan Saparov</option>
                        <option value="Elena Vance">Elena Vance</option>
                        <option value="Aisulu Bekova">Aisulu Bekova</option>
                        <option value="Maxat Dzhaksybekov">Maxat Dzhaksybekov</option>
                        <option value="Zarina Nurlanovna">Zarina Nurlanovna</option>
                      </select>
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                    </div>
                  </div>

                  {/* 8. Tariff */}
                  <div>
                    <label className="block text-primary font-semibold mb-1">{tProjects("formTariff")}</label>
                    <div className="relative">
                      <select
                        value={newProject.assignedTariff}
                        onChange={(e) => setNewProject({ ...newProject, assignedTariff: e.target.value })}
                        className="w-full bg-bg border border-border rounded-lg p-2.5 pr-8 text-primary outline-none focus:border-accent appearance-none cursor-pointer"
                      >
                        <option value="Tariff OWN">Tariff OWN (Unlimited Annual)</option>
                        <option value="Tariff M">Tariff M (Standard Review)</option>
                        <option value="Tariff L">Tariff L (National Fast-Track)</option>
                      </select>
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                  <button
                    type="button"
                    disabled={isCreatingProject}
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 bg-bg hover:bg-surface-raised border border-border text-secondary font-semibold rounded-lg cursor-pointer disabled:opacity-50"
                  >
                    {tCommon("cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingProject}
                    className="px-5 py-2 bg-accent hover:bg-accent-hover text-white font-bold rounded-lg transition-all shadow-sm cursor-pointer flex items-center gap-2 disabled:opacity-50"
                  >
                    {isCreatingProject && <CircleNotch size={16} className="animate-spin" />}
                    <span>{isCreatingProject ? tProjects("creating") : tCommon("save")}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Project Modal */}
        {editingProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-surface border border-border rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <PencilSimple size={22} className="text-accent" />
                  <div>
                    <h2 className="font-lexend font-bold text-base text-primary">
                      {tProjects("editModalTitle")} ({editingProject.id})
                    </h2>
                    <p className="text-[11px] text-secondary">{editingProject.productName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingProject(null)}
                  className="text-secondary hover:text-primary p-1 rounded-lg hover:bg-bg cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveEditProject} className="space-y-4 text-xs">
                <div className="space-y-3 bg-bg p-4 rounded-xl border border-border">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-muted uppercase font-bold">{tProjects("formProductName")}</label>
                      <input
                        type="text"
                        required
                        value={editingProject.productName}
                        onChange={(e) =>
                          setEditingProject({ ...editingProject, productName: e.target.value })
                        }
                        className="w-full bg-surface border border-border rounded p-2 text-primary text-xs outline-none focus:border-accent"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted uppercase font-bold">{tProjects("formManufacturer")}</label>
                      <input
                        type="text"
                        value={editingProject.manufacturer}
                        onChange={(e) =>
                          setEditingProject({ ...editingProject, manufacturer: e.target.value })
                        }
                        className="w-full bg-surface border border-border rounded p-2 text-primary text-xs outline-none focus:border-accent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-muted uppercase font-bold">{tProjects("formDosageForm")}</label>
                      <div className="relative">
                        <select
                          value={editingProject.dosageForm}
                          onChange={(e) =>
                            setEditingProject({ ...editingProject, dosageForm: e.target.value })
                          }
                          className="w-full bg-surface border border-border rounded p-2 pr-8 text-primary text-xs outline-none focus:border-accent appearance-none cursor-pointer"
                        >
                          <option value="" disabled>Select dosage form...</option>
                          <option value="External spray">External spray</option>
                          <option value="Cream">Cream</option>
                          <option value="Ointment">Ointment</option>
                          <option value="Solution">Solution</option>
                          <option value="Tablets">Tablets</option>
                          <option value="Capsules">Capsules</option>
                          <option value="Syrup">Syrup</option>
                          <option value="Injection">Injection</option>
                          <option value="Powder for solution">Powder for solution</option>
                          <option value="Gel">Gel</option>
                          <option value="Drops">Drops</option>
                          <option value="Suppositories">Suppositories</option>
                          <option value="Patch">Patch</option>
                          <option value="Inhaler">Inhaler</option>
                          {editingProject.dosageForm &&
                            !["External spray", "Cream", "Ointment", "Solution", "Tablets", "Capsules", "Syrup", "Injection", "Powder for solution", "Gel", "Drops", "Suppositories", "Patch", "Inhaler"].includes(editingProject.dosageForm) && (
                              <option value={editingProject.dosageForm}>{editingProject.dosageForm}</option>
                            )}
                        </select>
                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-secondary">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-muted uppercase font-bold">{tProjects("formProductType")}</label>
                      <div className="relative">
                        <select
                          value={editingProject.drugType}
                          onChange={(e) =>
                            setEditingProject({ ...editingProject, drugType: e.target.value })
                          }
                          className="w-full bg-surface border border-border rounded p-2 pr-8 text-primary text-xs outline-none focus:border-accent appearance-none cursor-pointer"
                        >
                          <option value="" disabled>Select type of medicinal product...</option>
                          <option value="Reproduced (Generic)">Reproduced (Generic)</option>
                          <option value="Original">Original</option>
                          <option value="Biosimilar">Biosimilar</option>
                          <option value="Biological">Biological</option>
                          <option value="Herbal">Herbal</option>
                          <option value="Orphan">Orphan</option>
                          <option value="Radio-pharmaceutical">Radio-pharmaceutical</option>
                          <option value="Fixed-dose combination">Fixed-dose combination</option>
                          {editingProject.drugType &&
                            !["Reproduced (Generic)", "Original", "Biosimilar", "Biological", "Herbal", "Orphan", "Radio-pharmaceutical", "Fixed-dose combination"].includes(editingProject.drugType) && (
                              <option value={editingProject.drugType}>{editingProject.drugType}</option>
                            )}
                        </select>
                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-secondary">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-muted uppercase font-bold">{tProjects("formMah")}</label>
                      <input
                        type="text"
                        value={editingProject.mah}
                        onChange={(e) =>
                          setEditingProject({ ...editingProject, mah: e.target.value })
                        }
                        className="w-full bg-surface border border-border rounded p-2 text-primary text-xs outline-none focus:border-accent"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted uppercase font-bold">{tProjects("formResponsibleUser")}</label>
                      <div className="relative">
                        <select
                          value={editingProject.responsiblePerson}
                          onChange={(e) =>
                            setEditingProject({ ...editingProject, responsiblePerson: e.target.value })
                          }
                          className="w-full bg-surface border border-border rounded p-2 pr-8 text-primary text-xs outline-none focus:border-accent appearance-none cursor-pointer"
                        >
                          <option value="" disabled>Select responsible user...</option>
                          <option value="Dr. Alikhan Saparov">Dr. Alikhan Saparov</option>
                          <option value="Elena Vance">Elena Vance</option>
                          <option value="Aisulu Bekova">Aisulu Bekova</option>
                          <option value="Maxat Dzhaksybekov">Maxat Dzhaksybekov</option>
                          <option value="Zarina Nurlanovna">Zarina Nurlanovna</option>
                          {editingProject.responsiblePerson &&
                            !["Dr. Alikhan Saparov", "Elena Vance", "Aisulu Bekova", "Maxat Dzhaksybekov", "Zarina Nurlanovna"].includes(editingProject.responsiblePerson) && (
                              <option value={editingProject.responsiblePerson}>{editingProject.responsiblePerson}</option>
                            )}
                        </select>
                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-secondary">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-muted uppercase font-bold">{tProjects("formTariff")}</label>
                      <div className="relative">
                        <select
                          value={editingProject.assignedTariff}
                          onChange={(e) =>
                            setEditingProject({ ...editingProject, assignedTariff: e.target.value })
                          }
                          className="w-full bg-surface border border-border rounded p-2 pr-8 text-primary text-xs outline-none focus:border-accent appearance-none cursor-pointer"
                        >
                          <option value="Tariff OWN">Tariff OWN (Unlimited Annual)</option>
                          <option value="Tariff M">Tariff M (Standard Review)</option>
                          <option value="Tariff L">Tariff L (National Fast-Track)</option>
                          {editingProject.assignedTariff &&
                            !["Tariff OWN", "Tariff M", "Tariff L", "Tariff OWN (Unlimited Annual)", "Tariff M (Standard Review)", "Tariff L (National Fast-Track)"].includes(editingProject.assignedTariff) && (
                              <option value={editingProject.assignedTariff}>{editingProject.assignedTariff}</option>
                            )}
                        </select>
                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-secondary">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-muted uppercase font-bold">{tProjects("formAdditionalFeature")}</label>
                      <div className="relative">
                        <select
                          value={editingProject.additionalFeature}
                          onChange={(e) =>
                            setEditingProject({ ...editingProject, additionalFeature: e.target.value })
                          }
                          className="w-full bg-surface border border-border rounded p-2 pr-8 text-primary text-xs outline-none focus:border-accent appearance-none cursor-pointer"
                        >
                          <option value="">None / Standard</option>
                          <option value="Prescription / Topical antifungal">Prescription / Topical antifungal</option>
                          <option value="OTC / Topical antifungal">OTC / Topical antifungal</option>
                          <option value="Cold-Chain Storage">Cold-Chain Storage</option>
                          <option value="Fast-Track Review">Fast-Track Review</option>
                          <option value="Orphan Drug Designation">Orphan Drug Designation</option>
                          <option value="Controlled Substance">Controlled Substance</option>
                          <option value="Paediatric Use">Paediatric Use</option>
                          <option value="Combination Product">Combination Product</option>
                          {editingProject.additionalFeature &&
                            !["", "None / Standard", "Prescription / Topical antifungal", "OTC / Topical antifungal", "Cold-Chain Storage", "Fast-Track Review", "Orphan Drug Designation", "Controlled Substance", "Paediatric Use", "Combination Product"].includes(editingProject.additionalFeature) && (
                              <option value={editingProject.additionalFeature}>{editingProject.additionalFeature}</option>
                            )}
                        </select>
                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-secondary">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
                  <button
                    type="button"
                    disabled={isUpdatingProject}
                    onClick={() => setEditingProject(null)}
                    className="px-4 py-2 bg-bg hover:bg-surface-raised border border-border text-secondary font-semibold rounded-lg cursor-pointer disabled:opacity-50"
                  >
                    {tCommon("cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingProject}
                    className="px-5 py-2 bg-accent hover:bg-accent-hover text-white font-bold rounded-lg transition-all shadow-sm cursor-pointer flex items-center gap-2 disabled:opacity-50"
                  >
                    {isUpdatingProject && <CircleNotch size={16} className="animate-spin" />}
                    <span>{isUpdatingProject ? tProjects("saving") : tProjects("saveChanges")}</span>
                  </button>
                </div>
              </form>
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
                  <span className="font-mono text-xs text-rose-400 font-semibold">{deleteConfirmProject.id}</span>
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
                  onClick={() => handleDeleteProject(deleteConfirmProject.id)}
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

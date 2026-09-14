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
} from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

import { api, handleApiError } from "@/app/lib/axios";

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
  const [activeSettingsProject, setActiveSettingsProject] = useState<ProjectItem | null>(null);
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
    assignedTariff: "",
    tariffComment: "",
    date: new Date().toISOString().split("T")[0],
    projectVolume: "",
    submissionCountry: "",
    submissionRole: "",
    initialSequence: "Sequence 0000",
  });

  const [projects, setProjects] = useState<ProjectItem[]>([]);

  // Fetch real projects from backend database
  React.useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await api.get("/projects");
        if (response.data?.success && Array.isArray(response.data?.data)) {
          const dbProjects: ProjectItem[] = response.data.data.map((p: any) => ({
            id: String(p.id),
            productName: p.productName,
            manufacturer: p.manufacturer || "-",
            dosageForm: p.dosageForm || "-",
            drugType: p.productType || "-",
            additionalFeature: p.projectCode || "eCTD Dossier",
            mah: p.mahHolder || "-",
            responsiblePerson: p.responsibleUser || "-",
            assignedTariff: p.tariff || "-",
            tariffComment: "eCTD Regulatory Submission License",
            date: p.createdAt ? p.createdAt.split("T")[0] : new Date().toISOString().split("T")[0],
            projectVolume: "-",
            status: p.status || "In Progress",
            country: p.dossierConfig?.submissionCountry || "-",
            role: p.dossierConfig?.role || "-",
            sequence: p.dossierConfig?.dossierSequence || "0000",
          }));
          setProjects(dbProjects);
        }
      } catch (err: any) {
        console.warn("Could not fetch projects from backend API:", err?.message);
      }
    };

    fetchProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        productName: newProject.productName,
        dosageForm: newProject.dosageForm,
        productType: newProject.drugType,
        manufacturer: newProject.manufacturer,
        mahHolder: newProject.mah,
        responsibleUser: newProject.responsiblePerson,
        tariff: newProject.assignedTariff,
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
          id: String(createdProjectObj.id),
          productName: createdProjectObj.productName,
          manufacturer: createdProjectObj.manufacturer || newProject.manufacturer,
          dosageForm: createdProjectObj.dosageForm || newProject.dosageForm,
          drugType: createdProjectObj.productType || newProject.drugType,
          additionalFeature: newProject.additionalFeature,
          mah: createdProjectObj.mahHolder || newProject.mah,
          responsiblePerson: createdProjectObj.responsibleUser || newProject.responsiblePerson,
          assignedTariff: createdProjectObj.tariff || newProject.assignedTariff,
          tariffComment: newProject.tariffComment,
          date: createdProjectObj.createdAt ? createdProjectObj.createdAt.split("T")[0] : newProject.date,
          projectVolume: newProject.projectVolume,
          status: createdProjectObj.status || "In Progress",
          country: createdConfigObj?.submissionCountry || newProject.submissionCountry,
          role: createdConfigObj?.role || newProject.submissionRole,
          sequence: createdConfigObj?.dossierSequence || newProject.initialSequence,
        };

        setProjects([created, ...projects]);
        setShowCreateModal(false);
        toast.success(`Project ${created.productName} created successfully in database!`);
      }
    } catch (err) {
      handleApiError(err, "Failed to create project in database");
    }
  };

  const handleDeleteProject = (id: string) => {
    setProjects(projects.filter((p) => p.id !== id));
    setActiveSettingsProject(null);
    toast.success(`Project ${id} removed`);
  };

  const handleUpdateProjectSettings = (updated: ProjectItem) => {
    setProjects(projects.map((p) => (p.id === updated.id ? updated : p)));
    setActiveSettingsProject(null);
    toast.success(`Project ${updated.id} updated!`);
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
              Dossier Submission Workspace
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
              Active Projects: <strong className="text-accent">{projects.length}</strong>
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
                <span className="hidden md:inline text-[11px]">Grid</span>
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
                <span className="hidden md:inline text-[11px]">List</span>
              </button>
            </div>
          </div>
        </div>

        {/* Empty Search Result State */}
        {filteredProjects.length === 0 && (
          <div className="bg-surface border border-border rounded-2xl p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto text-accent">
              <MagnifyingGlass size={24} />
            </div>
            <h3 className="font-lexend text-base font-bold text-primary">No Projects Found</h3>
            <p className="text-xs text-secondary max-w-sm mx-auto">
              No matching projects for &quot;{searchTerm}&quot;. Try modifying your search filter or create a new project.
            </p>
          </div>
        )}

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
                        {prj.id.startsWith("PRJ-") ? prj.id : `PRJ-${prj.id}`}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${prj.status.includes("Approved")
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
                      <span className="text-muted">Manufacturer:</span>
                      <span className="text-primary font-medium truncate max-w-[150px]">{prj.manufacturer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">MAH (Holder):</span>
                      <span className="text-accent font-semibold truncate max-w-[150px]">{prj.mah}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Product Type:</span>
                      <span className="text-primary font-semibold">{prj.drugType}</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-muted shrink-0">Tariff:</span>
                      <span className="font-bold text-accent text-[11px]">{prj.assignedTariff}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Responsible User:</span>
                      <span className="text-primary font-semibold">{prj.responsiblePerson}</span>
                    </div>
                    {prj.additionalFeature && (
                      <div className="pt-1.5 border-t border-border/60 text-[11px] text-secondary">
                        <span className="font-semibold text-accent">Feature: </span>
                        <span>{prj.additionalFeature}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="text-[10px] text-muted font-mono">Date: {prj.date}</span>
                  <Link
                    href={`/projects/${prj.id}`}
                    className="px-3 py-1.5 bg-accent/15 hover:bg-accent/25 text-accent font-bold text-xs rounded-lg transition-colors flex items-center gap-1"
                  >
                    <span>Open Workspace</span>
                    <ArrowRight size={14} />
                  </Link>
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
                    <th className="py-3.5 px-4">Name</th>
                    <th className="py-3.5 px-4">Manufacturer</th>
                    <th className="py-3.5 px-4">Dosage Form</th>
                    <th className="py-3.5 px-4">Product Type</th>
                    <th className="py-3.5 px-4">Additional Feature</th>
                    <th className="py-3.5 px-4">MAH (Holder)</th>
                    <th className="py-3.5 px-4">Responsible User</th>
                    <th className="py-3.5 px-4">Tariff</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredProjects.map((prj) => (
                    <tr key={prj.id} className="hover:bg-bg/60 transition-colors group">
                      {/* 1. Product Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col min-w-[140px]">
                          <span className="font-mono text-[10px] font-bold text-accent">
                            {prj.id.startsWith("PRJ-") ? prj.id : `PRJ-${prj.id}`}
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
                          className={`text-[10px] font-bold px-2 py-0.5 rounded inline-block ${prj.status.includes("Approved")
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

        {/* Create Project Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-surface border border-border rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Pill size={22} className="text-accent" />
                  <h2 className="font-lexend font-bold text-lg text-primary">
                    Create a Project
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
                    <label className="block text-primary font-semibold mb-1">Product Name</label>
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
                    <label className="block text-primary font-semibold mb-1">Manufacturer</label>
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
                    <label className="block text-primary font-semibold mb-1">Dosage Form</label>
                    <input
                      type="text"
                      required
                      value={newProject.dosageForm}
                      onChange={(e) => setNewProject({ ...newProject, dosageForm: e.target.value })}
                      className="w-full bg-bg border border-border rounded-lg p-2.5 text-primary outline-none focus:border-accent"
                      placeholder="Tablets 500mg, Syrup 100mg/5ml"
                    />
                  </div>

                  {/* 4. Product Type */}
                  <div>
                    <label className="block text-primary font-semibold mb-1">Product Type</label>
                    <input
                      type="text"
                      required
                      value={newProject.drugType}
                      onChange={(e) => setNewProject({ ...newProject, drugType: e.target.value })}
                      className="w-full bg-bg border border-border rounded-lg p-2.5 text-primary outline-none focus:border-accent"
                      placeholder="Generics / Small Molecule, Biological"
                    />
                  </div>

                  {/* 5. Additional Feature */}
                  <div>
                    <label className="block text-primary font-semibold mb-1">Additional Feature</label>
                    <input
                      type="text"
                      value={newProject.additionalFeature}
                      onChange={(e) => setNewProject({ ...newProject, additionalFeature: e.target.value })}
                      className="w-full bg-bg border border-border rounded-lg p-2.5 text-primary outline-none focus:border-accent"
                      placeholder="Cold-Chain Storage, Fast-Track Review"
                    />
                  </div>

                  {/* 6. MAH (Registration Holder) */}
                  <div>
                    <label className="block text-primary font-semibold mb-1">MAH (Registration Holder)</label>
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
                    <label className="block text-primary font-semibold mb-1">Responsible User</label>
                    <input
                      type="text"
                      required
                      value={newProject.responsiblePerson}
                      onChange={(e) => setNewProject({ ...newProject, responsiblePerson: e.target.value })}
                      className="w-full bg-bg border border-border rounded-lg p-2.5 text-primary outline-none focus:border-accent"
                      placeholder="Dr. Alikhan Saparov"
                    />
                  </div>

                  {/* 8. Tariff */}
                  <div>
                    <label className="block text-primary font-semibold mb-1">Tariff</label>
                    <select
                      value={newProject.assignedTariff}
                      onChange={(e) => setNewProject({ ...newProject, assignedTariff: e.target.value })}
                      className="w-full bg-bg border border-border rounded-lg p-2.5 text-primary outline-none focus:border-accent"
                    >
                      <option value="Tariff OWN">Tariff OWN (Unlimited Annual)</option>
                      <option value="Tariff M">Tariff M (Standard Review)</option>
                      <option value="Tariff L">Tariff L (National Fast-Track)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 bg-bg hover:bg-surface-raised border border-border text-secondary font-semibold rounded-lg cursor-pointer"
                  >
                    {tCommon("cancel")}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-accent hover:bg-accent-hover text-white font-bold rounded-lg transition-all shadow-sm cursor-pointer"
                  >
                    {tCommon("save")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Settings & Gear Action Modal */}
        {activeSettingsProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-surface border border-border rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={22} className="text-accent" />
                  <div>
                    <h2 className="font-lexend font-bold text-base text-primary">
                      Project Configuration ({activeSettingsProject.id.startsWith("PRJ-") ? activeSettingsProject.id : `PRJ-${activeSettingsProject.id}`})
                    </h2>
                    <p className="text-[11px] text-secondary">{activeSettingsProject.productName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveSettingsProject(null)}
                  className="text-secondary hover:text-primary p-1 rounded-lg hover:bg-bg cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                {/* Project Details Form */}
                <div className="space-y-3 bg-bg p-4 rounded-xl border border-border">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-muted uppercase font-bold">Product Name</label>
                      <input
                        type="text"
                        value={activeSettingsProject.productName}
                        onChange={(e) =>
                          setActiveSettingsProject({ ...activeSettingsProject, productName: e.target.value })
                        }
                        className="w-full bg-surface border border-border rounded p-1.5 text-primary text-xs outline-none focus:border-accent"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted uppercase font-bold">Manufacturer</label>
                      <input
                        type="text"
                        value={activeSettingsProject.manufacturer}
                        onChange={(e) =>
                          setActiveSettingsProject({ ...activeSettingsProject, manufacturer: e.target.value })
                        }
                        className="w-full bg-surface border border-border rounded p-1.5 text-primary text-xs outline-none focus:border-accent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-muted uppercase font-bold">Dosage Form</label>
                      <input
                        type="text"
                        value={activeSettingsProject.dosageForm}
                        onChange={(e) =>
                          setActiveSettingsProject({ ...activeSettingsProject, dosageForm: e.target.value })
                        }
                        className="w-full bg-surface border border-border rounded p-1.5 text-primary text-xs outline-none focus:border-accent"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted uppercase font-bold">Product Type</label>
                      <input
                        type="text"
                        value={activeSettingsProject.drugType}
                        onChange={(e) =>
                          setActiveSettingsProject({ ...activeSettingsProject, drugType: e.target.value })
                        }
                        className="w-full bg-surface border border-border rounded p-1.5 text-primary text-xs outline-none focus:border-accent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-muted uppercase font-bold">MAH (Registration Holder)</label>
                      <input
                        type="text"
                        value={activeSettingsProject.mah}
                        onChange={(e) =>
                          setActiveSettingsProject({ ...activeSettingsProject, mah: e.target.value })
                        }
                        className="w-full bg-surface border border-border rounded p-1.5 text-primary text-xs outline-none focus:border-accent"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted uppercase font-bold">Responsible User</label>
                      <input
                        type="text"
                        value={activeSettingsProject.responsiblePerson}
                        onChange={(e) =>
                          setActiveSettingsProject({ ...activeSettingsProject, responsiblePerson: e.target.value })
                        }
                        className="w-full bg-surface border border-border rounded p-1.5 text-primary text-xs outline-none focus:border-accent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-muted uppercase font-bold">Tariff</label>
                      <input
                        type="text"
                        value={activeSettingsProject.assignedTariff}
                        onChange={(e) =>
                          setActiveSettingsProject({ ...activeSettingsProject, assignedTariff: e.target.value })
                        }
                        className="w-full bg-surface border border-border rounded p-1.5 text-primary text-xs outline-none focus:border-accent"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted uppercase font-bold">Status</label>
                      <select
                        value={activeSettingsProject.status}
                        onChange={(e) =>
                          setActiveSettingsProject({ ...activeSettingsProject, status: e.target.value })
                        }
                        className="w-full bg-surface border border-border rounded p-1.5 text-primary text-xs outline-none focus:border-accent"
                      >
                        <option value="In Progress">In Progress</option>
                        <option value="Submitted / Approved">Submitted / Approved</option>
                        <option value="Drafting">Drafting</option>
                        <option value="On Hold">On Hold</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-muted uppercase font-bold">Additional Feature</label>
                    <input
                      type="text"
                      value={activeSettingsProject.additionalFeature}
                      onChange={(e) =>
                        setActiveSettingsProject({ ...activeSettingsProject, additionalFeature: e.target.value })
                      }
                      className="w-full bg-surface border border-border rounded p-1.5 text-primary text-xs outline-none focus:border-accent"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => handleDeleteProject(activeSettingsProject.id)}
                    className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash size={14} />
                    <span>Delete Project</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/projects/${activeSettingsProject.id}`}
                      className="px-3 py-1.5 bg-accent/15 hover:bg-accent/25 text-accent font-bold rounded-lg transition-colors flex items-center gap-1"
                    >
                      <span>Open Workspace</span>
                      <ArrowRight size={14} />
                    </Link>

                    <button
                      onClick={() => handleUpdateProjectSettings(activeSettingsProject)}
                      className="px-4 py-1.5 bg-accent hover:bg-accent-hover text-white font-bold rounded-lg transition-all shadow-sm cursor-pointer"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}


"use client";

import React, { useState } from "react";
import { Link } from "../../../i18n/routing";
import { AppShell } from "../../components/AppShell";
import {
  Plus,
  Pill,
  ArrowRight,
  MagnifyingGlass,
} from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

export default function ProjectsPage() {
  const tProjects = useTranslations("projects");
  const tCommon = useTranslations("common");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [newProject, setNewProject] = useState({
    productName: "Paracetamol Extra KZ",
    dosageForm: "Tablets 500mg",
    productType: "Generics / Medicinal Product",
    manufacturer: "PharmKazakhstan Manufacturing JSC",
    applicant: "MedTech Alliance LLP",
    responsiblePerson: "Dr. Alikhan Saparov",
    assignedTariff: "Tariff OWN (Unlimited)",
    submissionCountry: "Kazakhstan (Astana)",
    submissionRole: "Reference Member State (RMS)",
    procedureType: "National / EAEU Mutual Recognition",
    initialSequence: "0000",
  });

  const [projects, setProjects] = useState([
    {
      id: "PRJ-KZ-2026-001",
      productName: "Paracetamol Extra KZ",
      dosageForm: "Tablets 500mg",
      manufacturer: "PharmKazakhstan JSC",
      country: "Kazakhstan",
      role: "Reference Member State (RMS)",
      sequence: "0004",
      status: "In Progress",
      assignedTariff: "Tariff OWN",
      updatedAt: "2026-09-11",
    },
    {
      id: "PRJ-KZ-2026-002",
      productName: "Amoxicillin Forte",
      dosageForm: "Capsules 250mg",
      manufacturer: "BioMed Almaty",
      country: "Kazakhstan",
      role: "Concerned Member State (CMS)",
      sequence: "0002",
      status: "Submitted / Approved",
      assignedTariff: "Tariff M",
      updatedAt: "2026-09-05",
    },
    {
      id: "PRJ-KZ-2026-003",
      productName: "Ibuprofen Oral Solution",
      dosageForm: "Syrup 100mg/5ml",
      manufacturer: "KazPharma Synthetics",
      country: "Kazakhstan",
      role: "National Submission",
      sequence: "0001",
      status: "In Progress",
      assignedTariff: "Tariff L",
      updatedAt: "2026-09-01",
    },
  ]);

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    const created = {
      id: `PRJ-KZ-2026-00${projects.length + 1}`,
      productName: newProject.productName,
      dosageForm: newProject.dosageForm,
      manufacturer: newProject.manufacturer,
      country: newProject.submissionCountry,
      role: newProject.submissionRole,
      sequence: newProject.initialSequence,
      status: "In Progress",
      assignedTariff: newProject.assignedTariff,
      updatedAt: new Date().toISOString().split("T")[0],
    };
    setProjects([created, ...projects]);
    setShowCreateModal(false);
    toast.success(`Project ${created.id} initialized successfully!`);
  };

  const filteredProjects = projects.filter(
    (p) =>
      p.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase())
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

        {/* Filter Bar */}
        <div className="bg-surface border border-border p-4 rounded-2xl flex items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-2 bg-bg border border-border rounded-xl px-3 py-2 text-xs text-muted w-full sm:w-96">
            <MagnifyingGlass size={16} className="text-muted shrink-0" />
            <input
              type="text"
              placeholder={tCommon("search")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-primary outline-none w-full text-xs"
            />
          </div>

          <div className="text-xs text-secondary font-semibold">
            Active Projects: <strong className="text-accent">{projects.length}</strong>
          </div>
        </div>

        {/* Projects Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((prj) => (
            <div
              key={prj.id}
              className="bg-surface border border-border hover:border-accent/40 rounded-2xl p-5 shadow-sm flex flex-col justify-between transition-all group"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
                  <span className="font-mono text-xs font-bold text-accent">{prj.id}</span>
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

                <h3 className="font-lexend font-bold text-base text-primary mb-1 group-hover:text-accent transition-colors">
                  {prj.productName}
                </h3>
                <p className="text-xs text-secondary mb-3">{prj.dosageForm}</p>

                <div className="space-y-2 bg-bg p-3 rounded-xl border border-border text-xs mb-4">
                  <div className="flex justify-between">
                    <span className="text-muted">Manufacturer:</span>
                    <span className="text-primary font-medium truncate max-w-[160px]">{prj.manufacturer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Submission Country:</span>
                    <span className="text-primary font-medium">{prj.country}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Submission Role:</span>
                    <span className="text-accent font-semibold">{prj.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Active Sequence:</span>
                    <span className="font-mono font-bold text-primary">Seq #{prj.sequence}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="text-[10px] text-muted">Updated: {prj.updatedAt}</span>
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

        {/* Create Project Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-surface border border-border rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Pill size={22} className="text-accent" />
                  <h2 className="font-lexend font-bold text-lg text-primary">
                    Project Metadata Workspace Setup
                  </h2>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-secondary hover:text-primary text-xs font-bold px-2 py-1 bg-bg border border-border rounded cursor-pointer"
                >
                  ✕ {tCommon("close")}
                </button>
              </div>

              <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
                <div className="space-y-3">
                  <h3 className="font-lexend font-bold text-accent text-xs uppercase tracking-wider">
                    1. Medicinal Product Information
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-primary font-semibold mb-1">Medicinal Product Name</label>
                      <input
                        type="text"
                        required
                        value={newProject.productName}
                        onChange={(e) => setNewProject({ ...newProject, productName: e.target.value })}
                        className="w-full bg-bg border border-border rounded-lg p-2.5 text-primary outline-none focus:border-accent"
                      />
                    </div>

                    <div>
                      <label className="block text-primary font-semibold mb-1">Dosage Form</label>
                      <input
                        type="text"
                        required
                        value={newProject.dosageForm}
                        onChange={(e) => setNewProject({ ...newProject, dosageForm: e.target.value })}
                        className="w-full bg-bg border border-border rounded-lg p-2.5 text-primary outline-none focus:border-accent"
                      />
                    </div>
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
      </div>
    </AppShell>
  );
}

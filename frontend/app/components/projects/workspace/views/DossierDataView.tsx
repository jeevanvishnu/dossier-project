"use client";

import React, { useState, useEffect } from "react";
import {
  CaretDown,
  FloppyDiskBack,
  Globe,
  Check,
  Plus,
  Trash,
  Tag,
} from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { api, handleApiError } from "@/app/lib/axios";

interface ExcipientItem {
  id: string;
  name: string;
  concentration: string;
  category: string;
}

interface DossierDataViewProps {
  projectId?: string;
}

export const DossierDataView: React.FC<DossierDataViewProps> = ({ projectId = "1" }) => {
  // Sub-tabs state
  const [activeSubTab, setActiveSubTab] = useState<string>("Medicinal Product");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const subTabs = [
    "Medicinal Product",
    "Active Substance",
    "Excipients",
    "Pharmaceutical Product",
    "Indications",
    "Manufacturer",
  ];

  // 1. Medicinal Product Form State
  const [medicinalState, setMedicinalState] = useState({
    productName: "Miconazole",
    dosageForm: "External spray",
    productType: "Reproduced (Generic)",
    additionalFeature: "Prescription / Topical antifungal",
    manufacturer: "Medical Union Pharmaceuticals",
    mah: "Medical Union Pharmaceuticals LLP",
    responsibleUser: "Dr. Alikhan Saparov",
    tariff: "Standard eCTD Submission Fee - 450,000 KZT",
    status: "Active",
  });

  // 2. Active Substance Form State
  const [activeSubstanceState, setActiveSubstanceState] = useState({
    inn: "Miconazole Nitrate",
    casNumber: "22839-47-0",
    activeManufacturer: "Zhejiang Chemical Co., Ltd.",
    qualityStandard: "Ph. Eur. 10.0 / USP 43",
  });

  // 3. Excipients Form State
  const [excipientsList, setExcipientsList] = useState<ExcipientItem[]>([
    {
      id: "exc-1",
      name: "Ethanol 96%",
      concentration: "55.0 % v/v",
      category: "Solvent / Vehicle",
    },
    {
      id: "exc-2",
      name: "Propylene Glycol",
      concentration: "10.0 % w/v",
      category: "Humectant / Solvent",
    },
    {
      id: "exc-3",
      name: "Macrogolcetostearyl Ether",
      concentration: "2.5 % w/v",
      category: "Surfactant / Emulsifier",
    },
    {
      id: "exc-4",
      name: "Purified Water",
      concentration: "q.s. to 100%",
      category: "Vehicle",
    },
  ]);

  const [newExcipient, setNewExcipient] = useState({
    name: "",
    concentration: "",
    category: "Vehicle",
  });

  // 4. Pharmaceutical Product Form State
  const [pharmaceuticalState, setPharmaceuticalState] = useState({
    shelfLife: "24 Months",
    storageConditions:
      "Do not store above 25°C. Keep container tightly closed and protect from direct sunlight.",
    containerClosure:
      "HDPE spray bottle equipped with a mechanical metering pump and protective cap.",
    packagingSizes: "30 ml spray bottle, 50 ml spray bottle",
  });

  // 5. Indications Form State
  const [indicationsState, setIndicationsState] = useState({
    therapeuticIndications:
      "Treatment of topical dermatomycoses caused by dermatophytes, yeasts, and other fungi sensitive to Miconazole (e.g. tinea pedis, tinea corporis, tinea cruris).",
    icd10Tags: ["B35.3 (Tinea pedis)", "B35.4 (Tinea corporis)", "B35.6 (Tinea cruris)"],
    targetPopulation: "Adults & Adolescents > 12 yrs",
  });

  const [newIcd10Tag, setNewIcd10Tag] = useState("");

  // 6. Manufacturer Form State
  const [manufacturerState, setManufacturerState] = useState({
    primarySite: "Plant No. 2, MUP Almaty, Kazakhstan",
    secondaryPackaging: "PackLogistics KZ Ltd., Almaty",
    batchReleaseLocation: "Quality Control Lab MUP Almaty",
    gmpCertificate: "GMP-KZ-2025-08912",
  });

  // Card 2 Configuration Form State
  const [configState, setConfigState] = useState({
    submissionCountry: "KAZAKHSTAN",
    roleOfSubmissionCountry: "Reference Member State (RMS)",
    procedureType: "Mutual Recognition (MRP)",
    typeOfProcedure: "Bringing into conformity",
    applicationNumber: "KZ-MOH-2026-88192",
    dossierSequence: "Sequence 0000",
  });

  // Concurrency version control state
  const [projectVersion, setProjectVersion] = useState<number | undefined>(undefined);

  // Load project metadata from backend API
  useEffect(() => {
    if (!projectId) return;

    const fetchDossierData = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/projects/${projectId}/dossier-data`);
        if (response.data?.success && response.data?.data) {
          const { project, dossierConfig } = response.data.data;
          if (project) {
            if (typeof project.version === "number") {
              setProjectVersion(project.version);
            }
            setMedicinalState((prev) => ({
              ...prev,
              productName: project.productName || prev.productName,
              dosageForm: project.dosageForm || prev.dosageForm,
              productType: project.productType || prev.productType,
              manufacturer: project.manufacturer || prev.manufacturer,
              mah: project.mahHolder || prev.mah,
              responsibleUser: project.responsibleUser || prev.responsibleUser,
              tariff: project.tariff || prev.tariff,
              status: project.status || prev.status,
            }));
          }
          if (dossierConfig) {
            setConfigState((prev) => ({
              ...prev,
              submissionCountry: dossierConfig.submissionCountry || prev.submissionCountry,
              roleOfSubmissionCountry: dossierConfig.role || prev.roleOfSubmissionCountry,
              procedureType: dossierConfig.procedureType || prev.procedureType,
              typeOfProcedure: dossierConfig.typeOfProcedure || prev.typeOfProcedure,
              applicationNumber: dossierConfig.applicationNumber || prev.applicationNumber,
              dossierSequence: dossierConfig.dossierSequence || prev.dossierSequence,
            }));
          }
        }
      } catch (err: any) {
        // Fallback gracefully to default state if endpoint fails or project doesn't exist yet in DB
        console.warn("Could not fetch project dossier data from API:", err?.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDossierData();
  }, [projectId]);

  const saveToBackend = async () => {
    setIsSaving(true);
    try {
      const payload = {
        version: projectVersion,
        productName: medicinalState.productName,
        dosageForm: medicinalState.dosageForm,
        productType: medicinalState.productType,
        manufacturer: medicinalState.manufacturer,
        mahHolder: medicinalState.mah,
        responsibleUser: medicinalState.responsibleUser,
        tariff: medicinalState.tariff,
        status: medicinalState.status,
        submissionCountry: configState.submissionCountry,
        role: configState.roleOfSubmissionCountry,
        procedureType: configState.procedureType,
        typeOfProcedure: configState.typeOfProcedure,
        applicationNumber: configState.applicationNumber,
        dossierSequence: configState.dossierSequence,
      };

      const response = await api.put(`/projects/${projectId}/dossier-data`, payload);
      if (response.data?.success) {
        if (response.data?.data?.project?.version) {
          setProjectVersion(response.data.data.project.version);
        }
        toast.success("Dossier metadata saved successfully to database!");
      }
    } catch (err: any) {
      if (err?.response?.status === 409) {
        toast.error(
          "Conflict: Another team member has updated this dossier data. Please refresh and try again.",
          { duration: 6000 }
        );
      } else {
        handleApiError(err, "Failed to save dossier data to database");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveCard1 = () => {
    saveToBackend();
  };

  const handleSaveCard2 = () => {
    saveToBackend();
  };

  const handleAddExcipient = () => {
    if (!newExcipient.name || !newExcipient.concentration) {
      toast.error("Please provide both name and concentration for the excipient.");
      return;
    }
    const item: ExcipientItem = {
      id: `exc-${Date.now()}`,
      name: newExcipient.name,
      concentration: newExcipient.concentration,
      category: newExcipient.category,
    };
    setExcipientsList([...excipientsList, item]);
    setNewExcipient({ name: "", concentration: "", category: "Vehicle" });
    toast.success("Added new excipient.");
  };

  const handleDeleteExcipient = (id: string) => {
    setExcipientsList(excipientsList.filter((e) => e.id !== id));
    toast.error("Excipient removed.");
  };

  const handleAddIcd10Tag = () => {
    if (!newIcd10Tag.trim()) return;
    if (indicationsState.icd10Tags.includes(newIcd10Tag.trim())) {
      toast.error("Tag already exists.");
      return;
    }
    setIndicationsState({
      ...indicationsState,
      icd10Tags: [...indicationsState.icd10Tags, newIcd10Tag.trim()],
    });
    setNewIcd10Tag("");
  };

  const handleRemoveIcd10Tag = (tag: string) => {
    setIndicationsState({
      ...indicationsState,
      icd10Tags: indicationsState.icd10Tags.filter((t) => t !== tag),
    });
  };

  return (
    <div className="space-y-6">
      {/* CARD 1: Project Data (Metadata Form) */}
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm space-y-6">
        {/* Card Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <h2 className="font-lexend font-bold text-base md:text-lg text-primary">
              Section 1: Project Data (Metadata Form)
            </h2>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase tracking-wider">
            Active Sub-tab: {activeSubTab.toUpperCase()}
          </span>
        </div>

        {/* Horizontal Sub-Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {subTabs.map((tab) => {
            const isActive = activeSubTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveSubTab(tab)}
                type="button"
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-accent text-white shadow-xs"
                    : "bg-surface-raised text-secondary hover:text-primary hover:bg-border border border-border"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* SUB-TAB 1: Medicinal Product */}
        {activeSubTab === "Medicinal Product" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Field 1: Product Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-secondary">Product Name</label>
              <input
                type="text"
                value={medicinalState.productName}
                onChange={(e) =>
                  setMedicinalState({ ...medicinalState, productName: e.target.value })
                }
                className="w-full bg-bg border border-border focus:border-accent text-primary text-xs rounded-xl px-3 py-2.5 focus:outline-none transition-colors"
              />
            </div>

            {/* Field 2: Dosage Form */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-secondary">Dosage Form</label>
              <div className="relative flex items-center">
                <select
                  value={medicinalState.dosageForm}
                  onChange={(e) => setMedicinalState({ ...medicinalState, dosageForm: e.target.value })}
                  className="w-full bg-bg border border-border focus:border-accent text-primary text-xs rounded-xl px-3 py-2.5 pr-8 appearance-none focus:outline-none transition-colors cursor-pointer"
                >
                  <option value="External spray">External spray</option>
                  <option value="Cream">Cream</option>
                  <option value="Ointment">Ointment</option>
                  <option value="Solution">Solution</option>
                </select>
                <CaretDown size={12} className="absolute right-2.5 text-secondary pointer-events-none" />
              </div>
            </div>

            {/* Field 3: Product Type */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-secondary">
                Product Type
              </label>
              <div className="relative flex items-center">
                <select
                  value={medicinalState.productType}
                  onChange={(e) =>
                    setMedicinalState({ ...medicinalState, productType: e.target.value })
                  }
                  className="w-full bg-bg border border-border focus:border-accent text-primary text-xs rounded-xl px-3 py-2.5 pr-8 appearance-none focus:outline-none transition-colors cursor-pointer"
                >
                  <option value="Reproduced (Generic)">Reproduced (Generic)</option>
                  <option value="Original">Original</option>
                  <option value="Biosimilar">Biosimilar</option>
                </select>
                <CaretDown size={12} className="absolute right-2.5 text-secondary pointer-events-none" />
              </div>
            </div>

            {/* Field 4: Additional Feature */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-secondary">
                Additional Feature
              </label>
              <div className="relative flex items-center">
                <select
                  value={medicinalState.additionalFeature}
                  onChange={(e) =>
                    setMedicinalState({ ...medicinalState, additionalFeature: e.target.value })
                  }
                  className="w-full bg-bg border border-border focus:border-accent text-primary text-xs rounded-xl px-3 py-2.5 pr-8 appearance-none focus:outline-none transition-colors cursor-pointer"
                >
                  <option value="Prescription / Topical antifungal">
                    Prescription / Topical antifungal
                  </option>
                  <option value="OTC / Topical antifungal">OTC / Topical antifungal</option>
                </select>
                <CaretDown size={12} className="absolute right-2.5 text-secondary pointer-events-none" />
              </div>
            </div>

            {/* Field 5: Manufacturer */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-secondary">Manufacturer</label>
              <input
                type="text"
                value={medicinalState.manufacturer}
                onChange={(e) => setMedicinalState({ ...medicinalState, manufacturer: e.target.value })}
                className="w-full bg-bg border border-border focus:border-accent text-primary text-xs rounded-xl px-3 py-2.5 focus:outline-none transition-colors"
              />
            </div>

            {/* Field 6: Marketing Authorization Holder (MAH) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-secondary">
                Marketing Authorization Holder (MAH)
              </label>
              <input
                type="text"
                value={medicinalState.mah}
                onChange={(e) => setMedicinalState({ ...medicinalState, mah: e.target.value })}
                className="w-full bg-bg border border-border focus:border-accent text-primary text-xs rounded-xl px-3 py-2.5 focus:outline-none transition-colors"
              />
            </div>

            {/* Field 7: User Responsible for the Project */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-secondary">
                User Responsible for the Project
              </label>
              <div className="relative flex items-center">
                <select
                  value={medicinalState.responsibleUser}
                  onChange={(e) =>
                    setMedicinalState({ ...medicinalState, responsibleUser: e.target.value })
                  }
                  className="w-full bg-bg border border-border focus:border-accent text-primary text-xs rounded-xl px-3 py-2.5 pr-8 appearance-none focus:outline-none transition-colors cursor-pointer"
                >
                  <option value="Dr. Alikhan Saparov">
                    Dr. Alikhan Saparov
                  </option>
                  <option value="Elena Vance">
                    Elena Vance
                  </option>
                </select>
                <CaretDown size={12} className="absolute right-2.5 text-secondary pointer-events-none" />
              </div>
            </div>

            {/* Field 8: Tariff */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-secondary">Tariff</label>
              <div className="relative flex items-center">
                <select
                  value={medicinalState.tariff}
                  onChange={(e) =>
                    setMedicinalState({ ...medicinalState, tariff: e.target.value })
                  }
                  className="w-full bg-bg border border-border focus:border-accent text-primary text-xs rounded-xl px-3 py-2.5 pr-8 appearance-none focus:outline-none transition-colors cursor-pointer"
                >
                  <option value="Standard eCTD Submission Fee - 450,000 KZT">
                    Standard eCTD Submission Fee - 450,000 KZT
                  </option>
                  <option value="Tariff OWN (MUP)">Tariff OWN (MUP)</option>
                  <option value="Tariff Standard (EAEU)">Tariff Standard (EAEU)</option>
                </select>
                <CaretDown size={12} className="absolute right-2.5 text-secondary pointer-events-none" />
              </div>
            </div>
          </div>
        )}

        {/* SUB-TAB 2: Active Substance */}
        {activeSubTab === "Active Substance" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-secondary">
                International Nonproprietary Name (INN) <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={activeSubstanceState.inn}
                onChange={(e) =>
                  setActiveSubstanceState({ ...activeSubstanceState, inn: e.target.value })
                }
                className="w-full bg-bg border border-border focus:border-accent text-primary text-xs rounded-xl px-3 py-2.5 focus:outline-none transition-colors font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-secondary">CAS Number</label>
              <input
                type="text"
                value={activeSubstanceState.casNumber}
                onChange={(e) =>
                  setActiveSubstanceState({ ...activeSubstanceState, casNumber: e.target.value })
                }
                className="w-full bg-bg border border-border focus:border-accent text-primary text-xs rounded-xl px-3 py-2.5 focus:outline-none transition-colors font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-secondary">
                Manufacturer of Active Substance
              </label>
              <input
                type="text"
                value={activeSubstanceState.activeManufacturer}
                onChange={(e) =>
                  setActiveSubstanceState({
                    ...activeSubstanceState,
                    activeManufacturer: e.target.value,
                  })
                }
                className="w-full bg-bg border border-border focus:border-accent text-primary text-xs rounded-xl px-3 py-2.5 focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-secondary">
                Quality Standard (Ph. Eur. / USP)
              </label>
              <input
                type="text"
                value={activeSubstanceState.qualityStandard}
                onChange={(e) =>
                  setActiveSubstanceState({
                    ...activeSubstanceState,
                    qualityStandard: e.target.value,
                  })
                }
                className="w-full bg-bg border border-border focus:border-accent text-primary text-xs rounded-xl px-3 py-2.5 focus:outline-none transition-colors font-semibold"
              />
            </div>
          </div>
        )}

        {/* SUB-TAB 3: Excipients */}
        {activeSubTab === "Excipients" && (
          <div className="space-y-4">
            {/* Add Excipient Bar */}
            <div className="bg-bg border border-border p-3.5 rounded-xl flex flex-col md:flex-row items-end gap-3">
              <div className="w-full md:w-1/3 space-y-1">
                <label className="block text-[11px] font-semibold text-secondary">Excipient Name</label>
                <input
                  type="text"
                  placeholder="Ethanol 96%"
                  value={newExcipient.name}
                  onChange={(e) => setNewExcipient({ ...newExcipient, name: e.target.value })}
                  className="w-full bg-surface border border-border focus:border-accent text-primary text-xs rounded-lg px-3 py-2 focus:outline-none"
                />
              </div>
              <div className="w-full md:w-1/3 space-y-1">
                <label className="block text-[11px] font-semibold text-secondary">Concentration</label>
                <input
                  type="text"
                  placeholder="55.0 % v/v"
                  value={newExcipient.concentration}
                  onChange={(e) => setNewExcipient({ ...newExcipient, concentration: e.target.value })}
                  className="w-full bg-surface border border-border focus:border-accent text-primary text-xs rounded-lg px-3 py-2 focus:outline-none"
                />
              </div>
              <div className="w-full md:w-1/3 space-y-1">
                <label className="block text-[11px] font-semibold text-secondary">Functional Category</label>
                <select
                  value={newExcipient.category}
                  onChange={(e) => setNewExcipient({ ...newExcipient, category: e.target.value })}
                  className="w-full bg-surface border border-border focus:border-accent text-primary text-xs rounded-lg px-3 py-2 focus:outline-none cursor-pointer"
                >
                  <option value="Vehicle">Vehicle</option>
                  <option value="Solvent / Vehicle">Solvent / Vehicle</option>
                  <option value="Humectant / Solvent">Humectant / Solvent</option>
                  <option value="Surfactant / Emulsifier">Surfactant / Emulsifier</option>
                  <option value="Preservative">Preservative</option>
                </select>
              </div>
              <button
                onClick={handleAddExcipient}
                type="button"
                className="w-full md:w-auto px-4 py-2 bg-accent hover:bg-accent-hover text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                <Plus size={15} weight="bold" />
                <span>Add Excipient</span>
              </button>
            </div>

            {/* Dynamic Excipients Table */}
            <div className="border border-border rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs text-secondary">
                <thead className="bg-bg text-primary uppercase font-bold text-[10px] tracking-wider border-b border-border">
                  <tr>
                    <th className="py-3 px-4">EXCIPIENT INGREDIENT</th>
                    <th className="py-3 px-4">CONCENTRATION / QUANTITY</th>
                    <th className="py-3 px-4">FUNCTIONAL CATEGORY</th>
                    <th className="py-3 px-4 text-center">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-surface">
                  {excipientsList.map((exc) => (
                    <tr key={exc.id} className="hover:bg-surface-raised transition-colors">
                      <td className="py-3 px-4 font-semibold text-primary">{exc.name}</td>
                      <td className="py-3 px-4 font-mono text-accent font-bold">{exc.concentration}</td>
                      <td className="py-3 px-4">{exc.category}</td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleDeleteExcipient(exc.id)}
                          type="button"
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                        >
                          <Trash size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SUB-TAB 4: Pharmaceutical Product */}
        {activeSubTab === "Pharmaceutical Product" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-secondary">Shelf-Life Parameters</label>
              <input
                type="text"
                value={pharmaceuticalState.shelfLife}
                onChange={(e) =>
                  setPharmaceuticalState({ ...pharmaceuticalState, shelfLife: e.target.value })
                }
                className="w-full bg-bg border border-border focus:border-accent text-primary text-xs rounded-xl px-3 py-2.5 focus:outline-none font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-secondary">Packaging Sizes</label>
              <input
                type="text"
                value={pharmaceuticalState.packagingSizes}
                onChange={(e) =>
                  setPharmaceuticalState({ ...pharmaceuticalState, packagingSizes: e.target.value })
                }
                className="w-full bg-bg border border-border focus:border-accent text-primary text-xs rounded-xl px-3 py-2.5 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-xs font-semibold text-secondary">
                Storage Conditions & Precautions
              </label>
              <textarea
                rows={2}
                value={pharmaceuticalState.storageConditions}
                onChange={(e) =>
                  setPharmaceuticalState({ ...pharmaceuticalState, storageConditions: e.target.value })
                }
                className="w-full bg-bg border border-border focus:border-accent text-primary text-xs rounded-xl p-3 focus:outline-none resize-none"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-xs font-semibold text-secondary">
                Container Closure Description
              </label>
              <textarea
                rows={2}
                value={pharmaceuticalState.containerClosure}
                onChange={(e) =>
                  setPharmaceuticalState({ ...pharmaceuticalState, containerClosure: e.target.value })
                }
                className="w-full bg-bg border border-border focus:border-accent text-primary text-xs rounded-xl p-3 focus:outline-none resize-none"
              />
            </div>
          </div>
        )}

        {/* SUB-TAB 5: Indications */}
        {activeSubTab === "Indications" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-xs font-semibold text-secondary">
                  Therapeutic Indications Text Area
                </label>
                <textarea
                  rows={3}
                  value={indicationsState.therapeuticIndications}
                  onChange={(e) =>
                    setIndicationsState({ ...indicationsState, therapeuticIndications: e.target.value })
                  }
                  className="w-full bg-bg border border-border focus:border-accent text-primary text-xs rounded-xl p-3 focus:outline-none resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-secondary">
                  Target Patient Population Selector
                </label>
                <div className="relative flex items-center">
                  <select
                    value={indicationsState.targetPopulation}
                    onChange={(e) =>
                      setIndicationsState({ ...indicationsState, targetPopulation: e.target.value })
                    }
                    className="w-full bg-bg border border-border focus:border-accent text-primary text-xs rounded-xl px-3 py-2.5 pr-8 appearance-none focus:outline-none cursor-pointer"
                  >
                    <option value="Adults & Adolescents > 12 yrs">Adults & Adolescents &gt; 12 yrs</option>
                    <option value="Adults Only (≥ 18 yrs)">Adults Only (≥ 18 yrs)</option>
                    <option value="Pediatric Population (2-12 yrs)">Pediatric Population (2-12 yrs)</option>
                    <option value="All Age Groups">All Age Groups</option>
                  </select>
                  <CaretDown size={12} className="absolute right-2.5 text-secondary pointer-events-none" />
                </div>
              </div>

              {/* ICD-10 Tags */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-secondary">
                  ICD-10 Disease Classification Tags
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="B35.1 (Tinea unguium)"
                    value={newIcd10Tag}
                    onChange={(e) => setNewIcd10Tag(e.target.value)}
                    className="flex-1 bg-bg border border-border focus:border-accent text-primary text-xs rounded-xl px-3 py-2 focus:outline-none"
                  />
                  <button
                    onClick={handleAddIcd10Tag}
                    type="button"
                    className="px-3 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Add Tag
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {indicationsState.icd10Tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-mono font-medium"
                    >
                      <Tag size={12} />
                      <span>{tag}</span>
                      <button
                        onClick={() => handleRemoveIcd10Tag(tag)}
                        className="hover:text-red-400 cursor-pointer ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUB-TAB 6: Manufacturer */}
        {activeSubTab === "Manufacturer" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-secondary">Primary Manufacturing Sites</label>
              <input
                type="text"
                value={manufacturerState.primarySite}
                onChange={(e) =>
                  setManufacturerState({ ...manufacturerState, primarySite: e.target.value })
                }
                className="w-full bg-bg border border-border focus:border-accent text-primary text-xs rounded-xl px-3 py-2.5 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-secondary">
                Secondary Packaging Facilities
              </label>
              <input
                type="text"
                value={manufacturerState.secondaryPackaging}
                onChange={(e) =>
                  setManufacturerState({ ...manufacturerState, secondaryPackaging: e.target.value })
                }
                className="w-full bg-bg border border-border focus:border-accent text-primary text-xs rounded-xl px-3 py-2.5 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-secondary">Batch Release Locations</label>
              <input
                type="text"
                value={manufacturerState.batchReleaseLocation}
                onChange={(e) =>
                  setManufacturerState({ ...manufacturerState, batchReleaseLocation: e.target.value })
                }
                className="w-full bg-bg border border-border focus:border-accent text-primary text-xs rounded-xl px-3 py-2.5 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-secondary">
                GMP Certificate Number
              </label>
              <input
                type="text"
                value={manufacturerState.gmpCertificate}
                onChange={(e) =>
                  setManufacturerState({ ...manufacturerState, gmpCertificate: e.target.value })
                }
                className="w-full bg-bg border border-border focus:border-accent text-primary text-xs rounded-xl px-3 py-2.5 focus:outline-none font-mono font-bold text-accent"
              />
            </div>
          </div>
        )}

        {/* Card Footer Actions */}
        <div className="flex justify-end items-center gap-3 pt-2 border-t border-border">
          <button
            onClick={handleSaveCard1}
            disabled={isSaving}
            type="button"
            className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <FloppyDiskBack size={16} weight="fill" />
            <span>{isSaving ? "Saving..." : "Save Data"}</span>
          </button>
        </div>
      </div>

      {/* CARD 2: Dossier Data Configuration */}
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm space-y-6">
        {/* Card Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Globe size={20} className="text-accent" />
            <h2 className="font-lexend font-bold text-base md:text-lg text-primary">
              Section 2: Dossier Data Configuration
            </h2>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
            Regulatory Target: {configState.submissionCountry}
          </span>
        </div>

        {/* Form Grid (6 columns x 1 row) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Field 1: Submission Country * */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-secondary">
              Submission Country <span className="text-red-400">*</span>
            </label>
            <div className="relative flex items-center">
              <select
                value={configState.submissionCountry}
                onChange={(e) => setConfigState({ ...configState, submissionCountry: e.target.value })}
                className="w-full bg-bg border border-border focus:border-accent text-primary text-xs rounded-xl px-3 py-2.5 pr-8 appearance-none focus:outline-none transition-colors cursor-pointer"
              >
                <option value="KAZAKHSTAN">KAZAKHSTAN</option>
                <option value="US">UNITED STATES (US)</option>
                <option value="RUSSIA">RUSSIA</option>
                <option value="BELARUS">BELARUS</option>
                <option value="ARMENIA">ARMENIA</option>
                <option value="KYRGYZSTAN">KYRGYZSTAN</option>
              </select>
              <CaretDown size={12} className="absolute right-2.5 text-secondary pointer-events-none" />
            </div>
          </div>

          {/* Field 2: Role of Submission Country */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-secondary">
              Role of Submission Country
            </label>
            <div className="relative flex items-center">
              <select
                value={configState.roleOfSubmissionCountry}
                onChange={(e) =>
                  setConfigState({ ...configState, roleOfSubmissionCountry: e.target.value })
                }
                className="w-full bg-bg border border-border focus:border-accent text-primary text-xs rounded-xl px-3 py-2.5 pr-8 appearance-none focus:outline-none transition-colors cursor-pointer"
              >
                <option value="Reference Member State (RMS)">Reference Member State (RMS)</option>
                <option value="Concerned Member State (CMS)">Concerned Member State (CMS)</option>
              </select>
              <CaretDown size={12} className="absolute right-2.5 text-secondary pointer-events-none" />
            </div>
          </div>

          {/* Field 3: Procedure Type * */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-secondary">
              Procedure Type <span className="text-red-400">*</span>
            </label>
            <div className="relative flex items-center">
              <select
                value={configState.procedureType}
                onChange={(e) => setConfigState({ ...configState, procedureType: e.target.value })}
                className="w-full bg-bg border border-border focus:border-accent text-primary text-xs rounded-xl px-3 py-2.5 pr-8 appearance-none focus:outline-none transition-colors cursor-pointer"
              >
                <option value="Recognition">Recognition</option>
                <option value="Mutual Recognition (MRP)">Mutual Recognition (MRP)</option>
                <option value="Decentralized Procedure (DCP)">Decentralized Procedure (DCP)</option>
                <option value="National Registration">National Registration</option>
                <option value="Variation">Variation</option>
              </select>
              <CaretDown size={12} className="absolute right-2.5 text-secondary pointer-events-none" />
            </div>
          </div>

          {/* Field 4: Type of Procedure */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-secondary">Type of Procedure</label>
            <div className="relative flex items-center">
              <select
                value={configState.typeOfProcedure}
                onChange={(e) => setConfigState({ ...configState, typeOfProcedure: e.target.value })}
                className="w-full bg-bg border border-border focus:border-accent text-primary text-xs rounded-xl px-3 py-2.5 pr-8 appearance-none focus:outline-none transition-colors cursor-pointer"
              >
                <option value="Bringing into conformity">Bringing into conformity</option>
                <option value="National Registration">National Registration</option>
                <option value="Re-registration">Re-registration</option>
                <option value="Variation">Variation</option>
              </select>
              <CaretDown size={12} className="absolute right-2.5 text-secondary pointer-events-none" />
            </div>
          </div>

          {/* Field 5: Application Number */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-secondary">Application Number</label>
            <input
              type="text"
              value={configState.applicationNumber}
              onChange={(e) => setConfigState({ ...configState, applicationNumber: e.target.value })}
              className="w-full bg-bg border border-border focus:border-accent text-primary text-xs rounded-xl px-3 py-2.5 focus:outline-none transition-colors"
            />
          </div>

          {/* Field 6: Dossier Sequence */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-secondary">Dossier Sequence</label>
            <div className="relative flex items-center">
              <select
                value={configState.dossierSequence}
                onChange={(e) => setConfigState({ ...configState, dossierSequence: e.target.value })}
                className="w-full bg-bg border border-border focus:border-accent text-primary text-xs rounded-xl px-3 py-2.5 pr-8 appearance-none focus:outline-none transition-colors cursor-pointer"
              >
                <option value="Sequence 0000">Sequence 0000</option>
                <option value="Sequence 0001">Sequence 0001</option>
                <option value="Sequence 0002">Sequence 0002</option>
              </select>
              <CaretDown size={12} className="absolute right-2.5 text-secondary pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Card Footer Action */}
        <div className="flex justify-end pt-2 border-t border-border">
          <button
            onClick={handleSaveCard2}
            disabled={isSaving}
            type="button"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Check size={16} weight="bold" />
            <span>{isSaving ? "Saving..." : "Save Data"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

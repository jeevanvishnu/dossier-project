"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  CaretDown,
  FloppyDiskBack,
  Globe,
  Check,
  Plus,
  Trash,
  Tag,
  CircleNotch,
  CheckCircle,
  LockKey,
  PencilSimple,
  X,
  ArrowRight,
} from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { api, handleApiError } from "@/app/lib/axios";
import { SkeletonForm } from "@/app/components/ui/Skeleton";

interface ExcipientItem {
  id: string;
  name: string;
  concentration: string;
  category: string;
}

interface DossierDataViewProps {
  projectId?: string;
  onNavigateToUpload?: () => void;
  onStatusChange?: (status: { isProjectSaved: boolean; isDossierSaved: boolean }) => void;
}

export const DossierDataView: React.FC<DossierDataViewProps> = ({
  projectId = "1",
  onNavigateToUpload,
  onStatusChange,
}) => {
  const tWorkspace = useTranslations("workspace");
  const tCommon = useTranslations("common");

  // Sub-tabs state
  const [activeSubTab, setActiveSubTab] = useState<string>("Medicinal Product");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Separate saving & verification status for Section 1 and Section 2
  const [isSavingProject, setIsSavingProject] = useState<boolean>(false);
  const [isSavingDossier, setIsSavingDossier] = useState<boolean>(false);
  const [isProjectSaved, setIsProjectSaved] = useState<boolean>(false);
  const [isDossierSaved, setIsDossierSaved] = useState<boolean>(false);
  const [isEditingProject, setIsEditingProject] = useState<boolean>(false);
  const [isEditingDossier, setIsEditingDossier] = useState<boolean>(false);

  // Calculated edit accessibility
  const isSection1Disabled = isProjectSaved && !isEditingProject;
  const isSection2Disabled = !isProjectSaved || (isDossierSaved && !isEditingDossier);

  const subTabs = [
    "Medicinal Product",
    "Active Substance",
    "Excipients",
    "Pharmaceutical Product",
    "Indications",
    "Manufacturer",
  ];

  const subTabsMap: Record<string, string> = {
    "Medicinal Product": tWorkspace("subTabMedicinalProduct"),
    "Active Substance": tWorkspace("subTabActiveSubstance"),
    "Excipients": tWorkspace("subTabExcipients"),
    "Pharmaceutical Product": tWorkspace("subTabPharmProduct"),
    "Indications": tWorkspace("subTabIndications"),
    "Manufacturer": tWorkspace("subTabManufacturer"),
  };

  // 1. Medicinal Product Form State
  const [medicinalState, setMedicinalState] = useState({
    productName: "",
    dosageForm: "",
    productType: "",
    additionalFeature: "",
    manufacturer: "",
    mah: "",
    responsibleUser: "",
    tariff: "",
    status: "Active",
  });

  // 2. Active Substance Form State
  const [activeSubstanceState, setActiveSubstanceState] = useState({
    inn: "",
    casNumber: "",
    activeManufacturer: "",
    qualityStandard: "",
  });

  // 3. Excipients Form State
  const [excipientsList, setExcipientsList] = useState<ExcipientItem[]>([]);

  const [newExcipient, setNewExcipient] = useState({
    name: "",
    concentration: "",
    category: "Vehicle",
  });

  // 4. Pharmaceutical Product Form State
  const [pharmaceuticalState, setPharmaceuticalState] = useState({
    shelfLife: "",
    storageConditions: "",
    containerClosure: "",
    packagingSizes: "",
  });

  // 5. Indications Form State
  const [indicationsState, setIndicationsState] = useState({
    therapeuticIndications: "",
    icd10Tags: [] as string[],
    targetPopulation: "",
  });

  const [newIcd10Tag, setNewIcd10Tag] = useState("");

  // 6. Manufacturer Form State
  const [manufacturerState, setManufacturerState] = useState({
    primarySite: "",
    secondaryPackaging: "",
    batchReleaseLocation: "",
    gmpCertificate: "",
  });

  // Card 2 Configuration Form State
  const [configState, setConfigState] = useState({
    submissionCountry: "KAZAKHSTAN",
    roleOfSubmissionCountry: "Reference Member State (RMS)",
    procedureType: "Mutual Recognition (MRP)",
    typeOfProcedure: "Bringing into conformity",
    applicationNumber: "",
    dossierSequence: "Sequence 0000",
  });

  // Concurrency version control state
  const [projectVersion, setProjectVersion] = useState<number | undefined>(undefined);

  // Snapshots for cancel functionality
  const [savedMedicinalState, setSavedMedicinalState] = useState<typeof medicinalState | null>(null);
  const [savedConfigState, setSavedConfigState] = useState<typeof configState | null>(null);
  const [savedActiveSubstanceState, setSavedActiveSubstanceState] = useState<typeof activeSubstanceState | null>(null);
  const [savedExcipientsList, setSavedExcipientsList] = useState<typeof excipientsList | null>(null);
  const [savedPharmaceuticalState, setSavedPharmaceuticalState] = useState<typeof pharmaceuticalState | null>(null);
  const [savedIndicationsState, setSavedIndicationsState] = useState<typeof indicationsState | null>(null);
  const [savedManufacturerState, setSavedManufacturerState] = useState<typeof manufacturerState | null>(null);

  // Load project metadata from backend API
  useEffect(() => {
    if (!projectId) return;

    const fetchDossierData = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/projects/${projectId}/dossier-data`);
        if (response.data?.success && response.data?.data) {
          const { project, dossierConfig } = response.data.data;
            let projSaved = false;
            let dosSaved = false;

            if (project) {
              if (typeof project.version === "number") {
                setProjectVersion(project.version);
              }
              const fetchedMedicinal = {
                productName: project.productName || "",
                dosageForm: project.dosageForm || "",
                productType: project.productType || "",
                additionalFeature: project.additionalFeature || "",
                manufacturer: project.manufacturer || "",
                mah: project.mahHolder || "",
                responsibleUser: project.responsibleUser || "",
                tariff: project.tariff || "",
                status: project.status || "Active",
              };
              setMedicinalState(fetchedMedicinal);
              setSavedMedicinalState(fetchedMedicinal);
              projSaved = Boolean(project.isProjectSaved);
              setIsProjectSaved(projSaved);
            }
            if (dossierConfig) {
              const rawCountry = dossierConfig.submissionCountry;
              const normalizedCountry = (!rawCountry || rawCountry === "US" || rawCountry === "KZ") ? "KAZAKHSTAN" : rawCountry;
              const rawAppNum = dossierConfig.applicationNumber || "";
              const isAppNumDefaultOrId =
                !rawAppNum ||
                rawAppNum === "KZ-MOH-2026-88192" ||
                (project && (rawAppNum === project.projectCode || rawAppNum === String(project.id)));
              const cleanedAppNum = isAppNumDefaultOrId ? "" : rawAppNum;
              const fetchedConfig = {
                submissionCountry: normalizedCountry,
                roleOfSubmissionCountry: dossierConfig.role || "Reference Member State (RMS)",
                procedureType: dossierConfig.procedureType || "Mutual Recognition (MRP)",
                typeOfProcedure: dossierConfig.typeOfProcedure || "Bringing into conformity",
                applicationNumber: cleanedAppNum,
                dossierSequence: dossierConfig.dossierSequence || "Sequence 0000",
              };
              setConfigState(fetchedConfig);
              setSavedConfigState(fetchedConfig);

              if (dossierConfig.dossierDetails) {
                const details = dossierConfig.dossierDetails;
                if (details.activeSubstance) {
                  setActiveSubstanceState(details.activeSubstance);
                  setSavedActiveSubstanceState(details.activeSubstance);
                }
                if (details.excipients && Array.isArray(details.excipients)) {
                  setExcipientsList(details.excipients);
                  setSavedExcipientsList(details.excipients);
                }
                if (details.pharmaceutical) {
                  setPharmaceuticalState(details.pharmaceutical);
                  setSavedPharmaceuticalState(details.pharmaceutical);
                }
                if (details.indications) {
                  setIndicationsState(details.indications);
                  setSavedIndicationsState(details.indications);
                }
                if (details.manufacturer) {
                  setManufacturerState(details.manufacturer);
                  setSavedManufacturerState(details.manufacturer);
                }
              }

              dosSaved = Boolean(dossierConfig.isDossierSaved);
              setIsDossierSaved(dosSaved);
            }

            if (onStatusChange) {
              onStatusChange({ isProjectSaved: projSaved, isDossierSaved: dosSaved });
            }
          }
        } catch (err: any) {
          console.warn("Could not fetch project dossier data from API:", err?.message);
        } finally {
          setIsLoading(false);
        }
      };

      fetchDossierData();
    }, [projectId, onStatusChange]);

  // Section 1: Save Project Data
  const handleSaveCard1 = async () => {
    if (!medicinalState.productName.trim()) {
      toast.error("Dossier Name is required.");
      return;
    }
    setIsSavingProject(true);
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
      };

      const response = await api.put(`/projects/${projectId}/dossier-data`, payload);
      if (response.data?.success) {
        if (response.data?.data?.project?.version) {
          setProjectVersion(response.data.data.project.version);
        }
        setSavedMedicinalState(medicinalState);
        setIsProjectSaved(true);
        setIsEditingProject(false);
        if (onStatusChange) {
          onStatusChange({ isProjectSaved: true, isDossierSaved });
        }
        toast.success("Project data saved successfully! Dossier Configuration is now activated.");
      }
    } catch (err: any) {
      if (err?.response?.status === 409) {
        toast.error(
          "Conflict: Another team member has updated this dossier data. Please refresh and try again.",
          { duration: 6000 }
        );
      } else {
        handleApiError(err, "Failed to save project data");
      }
    } finally {
      setIsSavingProject(false);
    }
  };

  // Medicinal Product Metadata: Cancel Handler
  const handleCancelCard1 = () => {
    if (savedMedicinalState) {
      setMedicinalState(savedMedicinalState);
    }
    setIsEditingProject(false);
    toast("Editing project data cancelled.");
  };

  // Medicinal Product Metadata: Edit Handler
  const handleEditCard1 = async () => {
    if (isEditingProject) {
      await handleSaveCard1();
    } else {
      setSavedMedicinalState(medicinalState);
      setIsEditingProject(true);
      toast.success("Project Data enabled for editing. Modify fields and click 'Update Data'.");
    }
  };

  // Dossier Data Configuration: Save Handler
  const handleSaveCard2 = async () => {
    if (!isProjectSaved) {
      toast.error("Please save Project Data first to activate Dossier Data Configuration.");
      return;
    }
    if (!configState.submissionCountry || !configState.procedureType) {
      toast.error("Submission Country and Procedure Sub-type are required.");
      return;
    }
    setIsSavingDossier(true);
    try {
      const dossierDetailsPayload = {
        activeSubstance: activeSubstanceState,
        excipients: excipientsList,
        pharmaceutical: pharmaceuticalState,
        indications: indicationsState,
        manufacturer: manufacturerState,
      };

      const payload = {
        version: projectVersion,
        submissionCountry: configState.submissionCountry,
        role: configState.roleOfSubmissionCountry,
        procedureType: configState.procedureType,
        typeOfProcedure: configState.typeOfProcedure,
        applicationNumber: configState.applicationNumber,
        dossierSequence: configState.dossierSequence,
        dossierDetails: dossierDetailsPayload,
      };

      const response = await api.put(`/projects/${projectId}/dossier-data`, payload);
      if (response.data?.success) {
        if (response.data?.data?.project?.version) {
          setProjectVersion(response.data.data.project.version);
        }
        setSavedConfigState(configState);
        setSavedActiveSubstanceState(activeSubstanceState);
        setSavedExcipientsList(excipientsList);
        setSavedPharmaceuticalState(pharmaceuticalState);
        setSavedIndicationsState(indicationsState);
        setSavedManufacturerState(manufacturerState);
        setIsDossierSaved(true);
        setIsEditingDossier(false);
        if (onStatusChange) {
          onStatusChange({ isProjectSaved: true, isDossierSaved: true });
        }
        toast.success("Dossier data configuration & sub-tab metadata saved successfully!");
      }
    } catch (err: any) {
      if (err?.response?.status === 409) {
        toast.error(
          "Conflict: Another team member has updated this dossier data. Please refresh and try again.",
          { duration: 6000 }
        );
      } else {
        handleApiError(err, "Failed to save dossier configuration");
      }
    } finally {
      setIsSavingDossier(false);
    }
  };

  // Section 2: Cancel Handler
  const handleCancelCard2 = () => {
    if (savedConfigState) setConfigState(savedConfigState);
    if (savedActiveSubstanceState) setActiveSubstanceState(savedActiveSubstanceState);
    if (savedExcipientsList) setExcipientsList(savedExcipientsList);
    if (savedPharmaceuticalState) setPharmaceuticalState(savedPharmaceuticalState);
    if (savedIndicationsState) setIndicationsState(savedIndicationsState);
    if (savedManufacturerState) setManufacturerState(savedManufacturerState);
    setIsEditingDossier(false);
    toast("Editing dossier configuration cancelled.");
  };

  // Section 2: Edit Handler
  const handleEditCard2 = async () => {
    if (isEditingDossier) {
      await handleSaveCard2();
    } else {
      setSavedConfigState(configState);
      setSavedActiveSubstanceState(activeSubstanceState);
      setSavedExcipientsList(excipientsList);
      setSavedPharmaceuticalState(pharmaceuticalState);
      setSavedIndicationsState(indicationsState);
      setSavedManufacturerState(manufacturerState);
      setIsEditingDossier(true);
      toast.success("Dossier Data enabled for editing. Modify fields and click 'Save Dossier Data'.");
    }
  };

  const handleAddExcipient = () => {
    if (isSection1Disabled) return;
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
    if (isSection1Disabled) return;
    setExcipientsList(excipientsList.filter((e) => e.id !== id));
    toast.error("Excipient removed.");
  };

  const handleAddIcd10Tag = () => {
    if (isSection1Disabled) return;
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
    if (isSection1Disabled) return;
    setIndicationsState({
      ...indicationsState,
      icd10Tags: indicationsState.icd10Tags.filter((t) => t !== tag),
    });
  };

  // Helper renderers with green tick & disabled/edit support
  const renderTextInput = (
    label: string,
    value: string,
    onChange: (val: string) => void,
    isSaved: boolean,
    isDisabled?: boolean,
    required?: boolean,
    placeholder?: string,
    extraClasses?: string
  ) => (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-secondary">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
        {isSaved && (
          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
            <CheckCircle size={12} weight="fill" />
            Valid
          </span>
        )}
      </div>
      <div className="relative flex items-center">
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          disabled={isDisabled}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full bg-bg border ${
            isDisabled
              ? "border-border/60 text-secondary bg-surface-raised/40 cursor-not-allowed opacity-75"
              : isSaved
              ? "border-emerald-500/70 focus:border-emerald-500 bg-emerald-950/10 text-primary"
              : "border-border focus:border-accent text-primary"
          } text-xs rounded-xl px-3 py-2.5 ${isSaved ? "pr-9" : ""} focus:outline-none transition-all ${
            extraClasses || ""
          }`}
        />
        {isSaved && (
          <CheckCircle
            size={16}
            weight="fill"
            className="absolute right-2.5 text-emerald-400 pointer-events-none z-10"
          />
        )}
      </div>
    </div>
  );

  const renderSelectInput = (
    label: string,
    value: string,
    onChange: (val: string) => void,
    options: { label: string; value: string }[],
    isSaved: boolean,
    isDisabled?: boolean,
    required?: boolean
  ) => (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-secondary">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
        {isSaved && (
          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
            <CheckCircle size={12} weight="fill" />
            Valid
          </span>
        )}
      </div>
      <div className="relative flex items-center">
        <select
          value={value}
          disabled={isDisabled}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full bg-bg border ${
            isDisabled
              ? "border-border/60 text-secondary bg-surface-raised/40 cursor-not-allowed opacity-75"
              : isSaved
              ? "border-emerald-500/70 focus:border-emerald-500 bg-emerald-950/10 text-primary"
              : "border-border focus:border-accent text-primary"
          } text-xs rounded-xl px-3 py-2.5 ${isSaved ? "pr-12" : "pr-8"} appearance-none focus:outline-none transition-all ${
            isDisabled ? "cursor-not-allowed" : "cursor-pointer"
          }`}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-2.5 flex items-center gap-1 pointer-events-none z-10">
          {isSaved && <CheckCircle size={15} weight="fill" className="text-emerald-400" />}
          <CaretDown size={12} className="text-secondary" />
        </div>
      </div>
    </div>
  );

  const renderTextareaInput = (
    label: string,
    value: string,
    onChange: (val: string) => void,
    isSaved: boolean,
    isDisabled?: boolean,
    rows: number = 2
  ) => (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-secondary">{label}</label>
        {isSaved && (
          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
            <CheckCircle size={12} weight="fill" />
            Valid
          </span>
        )}
      </div>
      <div className="relative flex items-center">
        <textarea
          rows={rows}
          value={value}
          disabled={isDisabled}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full bg-bg border ${
            isDisabled
              ? "border-border/60 text-secondary bg-surface-raised/40 cursor-not-allowed opacity-75"
              : isSaved
              ? "border-emerald-500/70 focus:border-emerald-500 bg-emerald-950/10 text-primary"
              : "border-border focus:border-accent text-primary"
          } text-xs rounded-xl p-3 ${isSaved ? "pr-9" : ""} focus:outline-none resize-none transition-all`}
        />
        {isSaved && (
          <CheckCircle
            size={16}
            weight="fill"
            className="absolute right-2.5 top-3 text-emerald-400 pointer-events-none z-10"
          />
        )}
      </div>
    </div>
  );

  if (isLoading) {
    return <SkeletonForm />;
  }

  return (
    <div className="space-y-6">
      {/* CARD 1: Project Data (Metadata Form) */}
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm space-y-6">
        {/* Card Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <h2 className="font-lexend font-bold text-base md:text-lg text-primary">
              {tWorkspace("section1Title")}
            </h2>
          </div>
          {isProjectSaved ? (
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle size={14} weight="fill" />
              {isEditingProject ? tWorkspace("editingStatus") : tWorkspace("savedStatus")}
            </span>
          ) : (
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase tracking-wider">
              {subTabsMap[activeSubTab]?.toUpperCase()}
            </span>
          )}
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
                {subTabsMap[tab] || tab}
              </button>
            );
          })}
        </div>

        {/* SUB-TAB 1: Medicinal Product */}
        {activeSubTab === "Medicinal Product" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {renderTextInput(
              "Dossier Name",
              medicinalState.productName,
              (val) => setMedicinalState({ ...medicinalState, productName: val }),
              isProjectSaved,
              isSection1Disabled
            )}
            {renderSelectInput(
              "Dosage Form",
              medicinalState.dosageForm,
              (val) => setMedicinalState({ ...medicinalState, dosageForm: val }),
              [
                { label: "External spray", value: "External spray" },
                { label: "Cream", value: "Cream" },
                { label: "Ointment", value: "Ointment" },
                { label: "Solution", value: "Solution" },
              ],
              isProjectSaved,
              isSection1Disabled
            )}
            {renderSelectInput(
              "Type of Medicinal Product",
              medicinalState.productType,
              (val) => setMedicinalState({ ...medicinalState, productType: val }),
              [
                { label: "Reproduced (Generic)", value: "Reproduced (Generic)" },
                { label: "Original", value: "Original" },
                { label: "Biosimilar", value: "Biosimilar" },
              ],
              isProjectSaved,
              isSection1Disabled
            )}
            {renderSelectInput(
              "Additional Feature",
              medicinalState.additionalFeature,
              (val) => setMedicinalState({ ...medicinalState, additionalFeature: val }),
              [
                { label: "Prescription / Topical antifungal", value: "Prescription / Topical antifungal" },
                { label: "OTC / Topical antifungal", value: "OTC / Topical antifungal" },
              ],
              isProjectSaved,
              isSection1Disabled
            )}
            {renderTextInput(
              "Manufacturer",
              medicinalState.manufacturer,
              (val) => setMedicinalState({ ...medicinalState, manufacturer: val }),
              isProjectSaved,
              isSection1Disabled
            )}
            {renderTextInput(
              "Marketing Authorization Holder (MAH)",
              medicinalState.mah,
              (val) => setMedicinalState({ ...medicinalState, mah: val }),
              isProjectSaved,
              isSection1Disabled
            )}
            {renderSelectInput(
              "User Responsible for the Project",
              medicinalState.responsibleUser,
              (val) => setMedicinalState({ ...medicinalState, responsibleUser: val }),
              [
                { label: "Dr. Alikhan Saparov", value: "Dr. Alikhan Saparov" },
                { label: "Elena Vance", value: "Elena Vance" },
              ],
              isProjectSaved,
              isSection1Disabled
            )}
            {renderSelectInput(
              "Tariff",
              medicinalState.tariff,
              (val) => setMedicinalState({ ...medicinalState, tariff: val }),
              [
                { label: "Standard eCTD Submission Fee - 450,000 KZT", value: "Standard eCTD Submission Fee - 450,000 KZT" },
                { label: "Tariff OWN (MUP)", value: "Tariff OWN (MUP)" },
                { label: "Tariff Standard (EAEU)", value: "Tariff Standard (EAEU)" },
              ],
              isProjectSaved,
              isSection1Disabled
            )}
          </div>
        )}

        {/* SUB-TAB 2: Active Substance */}
        {activeSubTab === "Active Substance" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {renderTextInput(
              "International Nonproprietary Name (INN)",
              activeSubstanceState.inn,
              (val) => setActiveSubstanceState({ ...activeSubstanceState, inn: val }),
              isProjectSaved,
              isSection1Disabled,
              true,
              "",
              "font-semibold"
            )}
            {renderTextInput(
              "CAS Number",
              activeSubstanceState.casNumber,
              (val) => setActiveSubstanceState({ ...activeSubstanceState, casNumber: val }),
              isProjectSaved,
              isSection1Disabled,
              false,
              "",
              "font-mono"
            )}
            {renderTextInput(
              "Manufacturer of Active Substance",
              activeSubstanceState.activeManufacturer,
              (val) => setActiveSubstanceState({ ...activeSubstanceState, activeManufacturer: val }),
              isProjectSaved,
              isSection1Disabled
            )}
            {renderTextInput(
              "Quality Standard (Ph. Eur. / USP)",
              activeSubstanceState.qualityStandard,
              (val) => setActiveSubstanceState({ ...activeSubstanceState, qualityStandard: val }),
              isProjectSaved,
              isSection1Disabled,
              false,
              "",
              "font-semibold"
            )}
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
                  disabled={isSection1Disabled}
                  value={newExcipient.name}
                  onChange={(e) => setNewExcipient({ ...newExcipient, name: e.target.value })}
                  className="w-full bg-surface border border-border focus:border-accent text-primary text-xs rounded-lg px-3 py-2 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <div className="w-full md:w-1/3 space-y-1">
                <label className="block text-[11px] font-semibold text-secondary">Concentration</label>
                <input
                  type="text"
                  placeholder="55.0 % v/v"
                  disabled={isSection1Disabled}
                  value={newExcipient.concentration}
                  onChange={(e) => setNewExcipient({ ...newExcipient, concentration: e.target.value })}
                  className="w-full bg-surface border border-border focus:border-accent text-primary text-xs rounded-lg px-3 py-2 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <div className="w-full md:w-1/3 space-y-1">
                <label className="block text-[11px] font-semibold text-secondary">Functional Category</label>
                <select
                  disabled={isSection1Disabled}
                  value={newExcipient.category}
                  onChange={(e) => setNewExcipient({ ...newExcipient, category: e.target.value })}
                  className="w-full bg-surface border border-border focus:border-accent text-primary text-xs rounded-lg px-3 py-2 focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                disabled={isSection1Disabled}
                type="button"
                className="w-full md:w-auto px-4 py-2 bg-accent hover:bg-accent-hover text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
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
                      <td className="py-3 px-4 font-semibold text-primary flex items-center gap-2">
                        {isProjectSaved && <CheckCircle size={14} weight="fill" className="text-emerald-400 shrink-0" />}
                        <span>{exc.name}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-accent font-bold">{exc.concentration}</td>
                      <td className="py-3 px-4">{exc.category}</td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleDeleteExcipient(exc.id)}
                          disabled={isSection1Disabled}
                          type="button"
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
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
            {renderTextInput(
              "Shelf-Life Parameters",
              pharmaceuticalState.shelfLife,
              (val) => setPharmaceuticalState({ ...pharmaceuticalState, shelfLife: val }),
              isProjectSaved,
              isSection1Disabled,
              false,
              "",
              "font-semibold"
            )}
            {renderTextInput(
              "Packaging Sizes",
              pharmaceuticalState.packagingSizes,
              (val) => setPharmaceuticalState({ ...pharmaceuticalState, packagingSizes: val }),
              isProjectSaved,
              isSection1Disabled
            )}
            <div className="md:col-span-2">
              {renderTextareaInput(
                "Storage Conditions & Precautions",
                pharmaceuticalState.storageConditions,
                (val) => setPharmaceuticalState({ ...pharmaceuticalState, storageConditions: val }),
                isProjectSaved,
                isSection1Disabled,
                2
              )}
            </div>
            <div className="md:col-span-2">
              {renderTextareaInput(
                "Container Closure Description",
                pharmaceuticalState.containerClosure,
                (val) => setPharmaceuticalState({ ...pharmaceuticalState, containerClosure: val }),
                isProjectSaved,
                isSection1Disabled,
                2
              )}
            </div>
          </div>
        )}

        {/* SUB-TAB 5: Indications */}
        {activeSubTab === "Indications" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                {renderTextareaInput(
                  "Therapeutic Indications Text Area",
                  indicationsState.therapeuticIndications,
                  (val) => setIndicationsState({ ...indicationsState, therapeuticIndications: val }),
                  isProjectSaved,
                  isSection1Disabled,
                  3
                )}
              </div>
              {renderSelectInput(
                "Target Patient Population Selector",
                indicationsState.targetPopulation,
                (val) => setIndicationsState({ ...indicationsState, targetPopulation: val }),
                [
                  { label: "Adults & Adolescents > 12 yrs", value: "Adults & Adolescents > 12 yrs" },
                  { label: "Adults Only (≥ 18 yrs)", value: "Adults Only (≥ 18 yrs)" },
                  { label: "Pediatric Population (2-12 yrs)", value: "Pediatric Population (2-12 yrs)" },
                  { label: "All Age Groups", value: "All Age Groups" },
                ],
                isProjectSaved,
                isSection1Disabled
              )}

              {/* ICD-10 Tags */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-secondary">
                  ICD-10 Disease Classification Tags
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="B35.1 (Tinea unguium)"
                    disabled={isSection1Disabled}
                    value={newIcd10Tag}
                    onChange={(e) => setNewIcd10Tag(e.target.value)}
                    className="flex-1 bg-bg border border-border focus:border-accent text-primary text-xs rounded-xl px-3 py-2 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    onClick={handleAddIcd10Tag}
                    disabled={isSection1Disabled}
                    type="button"
                    className="px-3 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-bold rounded-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                      {!isSection1Disabled && (
                        <button
                          onClick={() => handleRemoveIcd10Tag(tag)}
                          className="hover:text-red-400 cursor-pointer ml-1"
                        >
                          ×
                        </button>
                      )}
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
            {renderTextInput(
              "Primary Manufacturing Sites",
              manufacturerState.primarySite,
              (val) => setManufacturerState({ ...manufacturerState, primarySite: val }),
              isProjectSaved,
              isSection1Disabled
            )}
            {renderTextInput(
              "Secondary Packaging Facilities",
              manufacturerState.secondaryPackaging,
              (val) => setManufacturerState({ ...manufacturerState, secondaryPackaging: val }),
              isProjectSaved,
              isSection1Disabled
            )}
            {renderTextInput(
              "Batch Release Locations",
              manufacturerState.batchReleaseLocation,
              (val) => setManufacturerState({ ...manufacturerState, batchReleaseLocation: val }),
              isProjectSaved,
              isSection1Disabled
            )}
            {renderTextInput(
              "GMP Certificate Number",
              manufacturerState.gmpCertificate,
              (val) => setManufacturerState({ ...manufacturerState, gmpCertificate: val }),
              isProjectSaved,
              isSection1Disabled,
              false,
              "",
              "font-mono font-bold text-accent"
            )}
          </div>
        )}

        {/* Card 1 Footer Actions */}
        <div className="flex justify-end items-center gap-3 pt-2 border-t border-border">
          {isProjectSaved ? (
            <div className="flex items-center gap-3">
              {isEditingProject && (
                <button
                  onClick={handleCancelCard1}
                  type="button"
                  className="px-4 py-2.5 bg-surface-raised hover:bg-border text-secondary hover:text-primary border border-border text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-xs"
                >
                  <X size={15} weight="bold" />
                  <span>{tWorkspace("cancelBtn")}</span>
                </button>
              )}
              <button
                onClick={handleEditCard1}
                disabled={isSavingProject}
                type="button"
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95 border border-amber-400/40"
              >
                {isSavingProject ? (
                  <CircleNotch size={16} className="animate-spin" />
                ) : isEditingProject ? (
                  <FloppyDiskBack size={16} weight="fill" />
                ) : (
                  <PencilSimple size={16} weight="bold" />
                )}
                <span>{isSavingProject ? tWorkspace("updating") : tWorkspace("btnEditSection1")}</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleSaveCard1}
              disabled={isSavingProject}
              type="button"
              className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
            >
              {isSavingProject ? (
                <CircleNotch size={16} className="animate-spin" />
              ) : (
                <FloppyDiskBack size={16} weight="fill" />
              )}
              <span>{isSavingProject ? tWorkspace("saving") : tWorkspace("btnSaveSection1")}</span>
            </button>
          )}
        </div>
      </div>

      {/* CARD 2: Dossier Data Configuration */}
      <div
        className={`bg-surface border transition-all rounded-2xl p-6 shadow-sm space-y-6 ${
          !isProjectSaved ? "opacity-90 border-border/80" : "border-border"
        }`}
      >
        {/* Card Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Globe size={20} className={isProjectSaved ? "text-accent" : "text-secondary"} />
            <h2 className="font-lexend font-bold text-base md:text-lg text-primary flex items-center gap-2">
              <span>{tWorkspace("section2Title")}</span>
              {!isProjectSaved && <LockKey size={16} className="text-amber-400" />}
            </h2>
          </div>
          {!isProjectSaved ? (
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider flex items-center gap-1.5">
              <LockKey size={14} weight="bold" />
              {tWorkspace("lockedStatus")}
            </span>
          ) : isDossierSaved ? (
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle size={14} weight="fill" />
              {isEditingDossier ? tWorkspace("editingStatus") : tWorkspace("savedStatus")}
            </span>
          ) : (
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
              Regulatory Target: {configState.submissionCountry}
            </span>
          )}
        </div>

        {/* Form Grid (6 columns x 1 row) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {renderSelectInput(
            "Submission Country",
            configState.submissionCountry,
            (val) => setConfigState({ ...configState, submissionCountry: val }),
            [
              { label: "KAZAKHSTAN", value: "KAZAKHSTAN" },
              { label: "UNITED STATES (US)", value: "US" },
              { label: "RUSSIA", value: "RUSSIA" },
              { label: "BELARUS", value: "BELARUS" },
              { label: "ARMENIA", value: "ARMENIA" },
              { label: "KYRGYZSTAN", value: "KYRGYZSTAN" },
            ],
            isDossierSaved,
            isSection2Disabled,
            true
          )}

          {renderSelectInput(
            "Role of Submission Country",
            configState.roleOfSubmissionCountry,
            (val) => setConfigState({ ...configState, roleOfSubmissionCountry: val }),
            [
              { label: "Reference Member State (RMS)", value: "Reference Member State (RMS)" },
              { label: "Concerned Member State (CMS)", value: "Concerned Member State (CMS)" },
            ],
            isDossierSaved,
            isSection2Disabled
          )}

          {renderSelectInput(
            "Procedure Sub-type",
            configState.procedureType,
            (val) => setConfigState({ ...configState, procedureType: val }),
            [
              { label: "Recognition", value: "Recognition" },
              { label: "Mutual Recognition (MRP)", value: "Mutual Recognition (MRP)" },
              { label: "Decentralized Procedure (DCP)", value: "Decentralized Procedure (DCP)" },
              { label: "National Registration", value: "National Registration" },
              { label: "Variation", value: "Variation" },
            ],
            isDossierSaved,
            isSection2Disabled,
            true
          )}

          {renderSelectInput(
            "Type of Procedure",
            configState.typeOfProcedure,
            (val) => setConfigState({ ...configState, typeOfProcedure: val }),
            [
              { label: "Bringing into conformity", value: "Bringing into conformity" },
              { label: "National Registration", value: "National Registration" },
              { label: "Re-registration", value: "Re-registration" },
              { label: "Variation", value: "Variation" },
            ],
            isDossierSaved,
            isSection2Disabled
          )}

          {renderTextInput(
            "Application Number",
            configState.applicationNumber,
            (val) => setConfigState({ ...configState, applicationNumber: val }),
            isDossierSaved,
            isSection2Disabled
          )}

          {renderSelectInput(
            "Dossier Sequence",
            configState.dossierSequence,
            (val) => setConfigState({ ...configState, dossierSequence: val }),
            [
              { label: "Sequence 0000", value: "Sequence 0000" },
              { label: "Sequence 0001", value: "Sequence 0001" },
              { label: "Sequence 0002", value: "Sequence 0002" },
            ],
            isDossierSaved,
            isSection2Disabled
          )}
        </div>

        {/* Card 2 Footer Action */}
        <div className="flex justify-end items-center gap-3 pt-2 border-t border-border">
          {!isProjectSaved ? (
            <button
              disabled
              type="button"
              title="Save Project Data first to activate Dossier Data Configuration"
              className="px-5 py-2.5 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-700/50 cursor-not-allowed opacity-60"
            >
              <LockKey size={16} weight="bold" />
              <span>{tWorkspace("btnSaveSection1First")}</span>
            </button>
          ) : isDossierSaved ? (
            <div className="flex items-center gap-3">
              {isEditingDossier && (
                <button
                  onClick={handleCancelCard2}
                  type="button"
                  className="px-4 py-2.5 bg-surface-raised hover:bg-border text-secondary hover:text-primary border border-border text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-xs"
                >
                  <X size={15} weight="bold" />
                  <span>{tWorkspace("cancelBtn")}</span>
                </button>
              )}
              <button
                onClick={handleEditCard2}
                disabled={isSavingDossier}
                type="button"
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95 border border-amber-400/40"
              >
                {isSavingDossier ? (
                  <CircleNotch size={16} className="animate-spin" />
                ) : isEditingDossier ? (
                  <FloppyDiskBack size={16} weight="fill" />
                ) : (
                  <PencilSimple size={16} weight="bold" />
                )}
                <span>
                  {isSavingDossier ? tWorkspace("updating") : tWorkspace("btnEditSection2")}
                </span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleSaveCard2}
              disabled={isSavingDossier}
              type="button"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95 shadow-emerald-900/20 shadow-md"
            >
              {isSavingDossier ? (
                <CircleNotch size={16} className="animate-spin" />
              ) : (
                <Check size={16} weight="bold" />
              )}
              <span>{isSavingDossier ? tWorkspace("saving") : tWorkspace("btnSaveSection2")}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

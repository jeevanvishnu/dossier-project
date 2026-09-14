"use client";

import React from "react";
import { Folder, UploadSimple, Clock, FileCode, LockKey } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

export type TabType = "dossier-data" | "upload-docs" | "dossier-history" | "xml-history";

interface ProjectTabsProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isDossierComplete?: boolean;
}

export const ProjectTabs: React.FC<ProjectTabsProps> = ({
  activeTab,
  setActiveTab,
  isDossierComplete = false,
}) => {
  const tWorkspace = useTranslations("workspace");

  const tabs = [
    {
      id: "dossier-data" as TabType,
      label: tWorkspace("tabDossierData"),
      icon: Folder,
    },
    {
      id: "upload-docs" as TabType,
      label: tWorkspace("tabUploadDocs"),
      icon: UploadSimple,
      isLocked: !isDossierComplete,
    },
    {
      id: "dossier-history" as TabType,
      label: tWorkspace("tabDossierHistory"),
      icon: Clock,
    },
    {
      id: "xml-history" as TabType,
      label: tWorkspace("tabXmlHistory"),
      icon: FileCode,
    },
  ];

  const handleTabClick = (tabId: TabType, isLocked?: boolean) => {
    if (tabId === "upload-docs" && isLocked) {
      toast.error(
        tWorkspace("tabLockedToast"),
        {
          icon: "🔒",
          duration: 4000,
        }
      );
      return;
    }
    setActiveTab(tabId);
  };

  return (
    <div className="bg-surface border border-border p-1.5 rounded-2xl shadow-xs flex flex-col sm:flex-row gap-1.5">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        const isLocked = tab.isLocked;

        return (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id, isLocked)}
            type="button"
            className={`flex-1 py-3 px-4 rounded-xl text-xs md:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              isActive
                ? "bg-accent text-white shadow-xs"
                : isLocked
                ? "text-secondary/60 hover:text-secondary bg-surface-raised/40 hover:bg-surface-raised cursor-not-allowed opacity-75"
                : "text-secondary hover:text-primary hover:bg-surface-raised"
            }`}
          >
            <Icon size={18} weight={isActive ? "fill" : "regular"} />
            <span>{tab.label}</span>
            {isLocked && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <LockKey size={12} weight="bold" />
                {tWorkspace("tabLocked")}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};


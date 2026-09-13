"use client";

import React from "react";
import { Folder, UploadSimple, Clock, FileCode } from "@phosphor-icons/react";

export type TabType = "dossier-data" | "upload-docs" | "dossier-history" | "xml-history";

interface ProjectTabsProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const ProjectTabs: React.FC<ProjectTabsProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    {
      id: "dossier-data" as TabType,
      label: "Dossier data",
      icon: Folder,
    },
    {
      id: "upload-docs" as TabType,
      label: "Upload documents",
      icon: UploadSimple,
    },
    {
      id: "dossier-history" as TabType,
      label: "Dossier history",
      icon: Clock,
    },
    {
      id: "xml-history" as TabType,
      label: "Compilations & XML History",
      icon: FileCode,
    },
  ];

  return (
    <div className="bg-surface border border-border p-1.5 rounded-2xl shadow-xs flex flex-col sm:flex-row gap-1.5">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            type="button"
            className={`flex-1 py-3 px-4 rounded-xl text-xs md:text-sm font-semibold transition-all flex items-center justify-center gap-2.5 cursor-pointer ${
              isActive
                ? "bg-accent text-white shadow-xs"
                : "text-secondary hover:text-primary hover:bg-surface-raised"
            }`}
          >
            <Icon size={18} weight={isActive ? "fill" : "regular"} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

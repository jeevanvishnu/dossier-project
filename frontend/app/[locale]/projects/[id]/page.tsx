"use client";

import React, { useState, use, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "../../../components/AppShell";
import { ProjectHeader } from "../../../components/projects/workspace/shared/ProjectHeader";
import { ProjectTabs, TabType } from "../../../components/projects/workspace/shared/ProjectTabs";
import { DossierDataView } from "../../../components/projects/workspace/views/DossierDataView";
import { UploadDocumentsView } from "../../../components/projects/workspace/views/UploadDocumentsView";
import { DossierHistoryView } from "../../../components/projects/workspace/views/DossierHistoryView";
import { XmlCreationHistoryView } from "../../../components/projects/workspace/views/XmlCreationHistoryView";

interface PageParams {
  params: Promise<{ id: string }>;
}

function ProjectWorkspaceContent({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const initialTabParam = searchParams.get("tab") as TabType | null;

  // Initialize strictly on "dossier-data" (Tab 1) by default
  const [activeTab, setActiveTab] = useState<TabType>(
    initialTabParam && ["dossier-data", "upload-docs", "dossier-history", "xml-history"].includes(initialTabParam)
      ? initialTabParam
      : "dossier-data"
  );

  return (
    <div className="space-y-6 w-full pb-12">
      {/* 1. Persistent Top Header & Actions */}
      <ProjectHeader projectId={id} />

      {/* 2. Main Tabbed Navigation Bar */}
      <ProjectTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Dynamic Views Rendering based on active tab */}
      {activeTab === "dossier-data" && <DossierDataView projectId={id} />}
      {activeTab === "upload-docs" && <UploadDocumentsView projectId={id} />}
      {activeTab === "dossier-history" && <DossierHistoryView projectId={id} />}
      {activeTab === "xml-history" && <XmlCreationHistoryView projectId={id} />}
    </div>
  );
}

export default function ProjectDetailPage({ params }: PageParams) {
  const { id } = use(params);

  return (
    <AppShell>
      <Suspense fallback={<div className="p-8 text-center text-muted">Loading workspace...</div>}>
        <ProjectWorkspaceContent id={id} />
      </Suspense>
    </AppShell>
  );
}

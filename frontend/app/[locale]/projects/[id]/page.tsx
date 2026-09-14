"use client";

import React, { useState, useEffect, use, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "../../../components/AppShell";
import { ProjectHeader } from "../../../components/projects/workspace/shared/ProjectHeader";
import { ProjectTabs, TabType } from "../../../components/projects/workspace/shared/ProjectTabs";
import { DossierDataView } from "../../../components/projects/workspace/views/DossierDataView";
import { UploadDocumentsView } from "../../../components/projects/workspace/views/UploadDocumentsView";
import { DossierHistoryView } from "../../../components/projects/workspace/views/DossierHistoryView";
import { XmlCreationHistoryView } from "../../../components/projects/workspace/views/XmlCreationHistoryView";
import { WorkspaceSkeleton } from "../../../components/ui/Skeleton";
import { api } from "../../../lib/axios";

interface PageParams {
  params: Promise<{ id: string }>;
}

function ProjectWorkspaceContent({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const initialTabParam = searchParams.get("tab") as TabType | null;

  const [activeTab, setActiveTab] = useState<TabType>(
    initialTabParam && ["dossier-data", "upload-docs", "dossier-history", "xml-history"].includes(initialTabParam)
      ? initialTabParam
      : "dossier-data"
  );

  const [isDossierComplete, setIsDossierComplete] = useState<boolean>(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState<boolean>(true);

  useEffect(() => {
    if (!id) return;
    const checkDossierStatus = async () => {
      setIsCheckingStatus(true);
      try {
        const response = await api.get(`/projects/${id}/dossier-data`);
        if (response.data?.success && response.data?.data) {
          const { project, dossierConfig } = response.data.data;
          const complete = Boolean(project?.isProjectSaved && dossierConfig?.isDossierSaved);
          setIsDossierComplete(complete);

          // If dossier is incomplete, redirect active tab to dossier-data if currently trying to view upload-docs
          if (!complete) {
            setActiveTab((currentTab) => {
              if (currentTab === "upload-docs") {
                return "dossier-data";
              }
              return currentTab;
            });
          }
        }
      } catch (err) {
        // ignore fetch errors
      } finally {
        setIsCheckingStatus(false);
      }
    };
    checkDossierStatus();
  }, [id]);

  const handleStatusChange = React.useCallback(
    ({ isProjectSaved, isDossierSaved }: { isProjectSaved: boolean; isDossierSaved: boolean }) => {
      setIsDossierComplete(Boolean(isProjectSaved && isDossierSaved));
    },
    []
  );

  if (isCheckingStatus) {
    return <WorkspaceSkeleton />;
  }

  return (
    <div className="space-y-6 w-full pb-12">
      {/* 1. Persistent Top Header & Actions */}
      <ProjectHeader projectId={id} />

      {/* 2. Main Tabbed Navigation Bar */}
      <ProjectTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDossierComplete={isDossierComplete}
      />

      {/* Dynamic Views Rendering based on active tab */}
      {activeTab === "dossier-data" && (
        <DossierDataView
          projectId={id}
          onNavigateToUpload={() => setActiveTab("upload-docs")}
          onStatusChange={handleStatusChange}
        />
      )}
      {activeTab === "upload-docs" && (
        <UploadDocumentsView projectId={id} isDossierComplete={isDossierComplete} />
      )}
      {activeTab === "dossier-history" && <DossierHistoryView projectId={id} />}
      {activeTab === "xml-history" && <XmlCreationHistoryView projectId={id} />}
    </div>
  );
}

export default function ProjectDetailPage({ params }: PageParams) {
  const { id } = use(params);

  return (
    <AppShell>
      <Suspense fallback={<WorkspaceSkeleton />}>
        <ProjectWorkspaceContent id={id} />
      </Suspense>
    </AppShell>
  );
}


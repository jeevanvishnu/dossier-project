"use client";

import React from "react";
import { LinkIcon, X } from "@phosphor-icons/react";
import { Link } from "../../../../../i18n/routing";
import { useTranslations } from "next-intl";

interface ProjectHeaderProps {
  projectId?: string;
  onCompile?: () => void;
}

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  projectId = "1661e1dd-22db-4f57-970d-b64401c1f5a5",
}) => {
  const tWorkspace = useTranslations("workspace");
  const tCommon = useTranslations("common");
  const formattedProjectId = projectId;

  return (
    <div className="bg-surface border border-border p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
      {/* Left Content: Link icon followed by dynamic Project ID title and subtitle */}
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-accent/15 border border-accent/30 text-accent shrink-0 mt-0.5">
          <LinkIcon size={22} weight="bold" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-lexend text-xl md:text-2xl font-bold text-primary tracking-tight">
              {tWorkspace("projectTitle")} {formattedProjectId}
            </h1>
          </div>
          <p className="text-xs md:text-sm text-muted font-medium">
            External spray 2% • Medical Union Pharmaceuticals • Kazakhstan Submission
          </p>
        </div>
      </div>

      {/* Right Controls: Cancel Button */}
      <div className="flex items-center gap-3 shrink-0">
        <Link
          href="/projects"
          className="px-4 py-2.5 bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 font-bold text-xs md:text-sm rounded-xl transition-all flex items-center gap-2 cursor-pointer active:scale-95 shadow-xs"
        >
          <X size={16} weight="bold" />
          <span>{tCommon("cancel")}</span>
        </Link>
      </div>
    </div>
  );
};


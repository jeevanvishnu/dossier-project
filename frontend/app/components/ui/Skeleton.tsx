"use client";

import React from "react";

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = "", style }) => {
  return (
    <div
      style={style}
      className={`animate-pulse bg-surface-raised/80 rounded-xl ${className}`}
    />
  );
};

export const SkeletonText: React.FC<{ className?: string }> = ({ className = "h-4 w-3/4" }) => {
  return <Skeleton className={`my-1 ${className}`} />;
};

export const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-surface border border-border p-5 rounded-2xl shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="grid grid-cols-2 gap-3 pt-2">
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    </div>
  );
};

export const SkeletonTableRow: React.FC<{ columns?: number }> = ({ columns = 4 }) => {
  return (
    <tr className="border-b border-border/50 animate-pulse">
      {Array.from({ length: columns }).map((_, idx) => (
        <td key={idx} className="py-4 px-5">
          <Skeleton className={`h-4 ${idx === 0 ? "w-28" : idx === 1 ? "w-36" : "w-48"}`} />
        </td>
      ))}
    </tr>
  );
};

export const SkeletonForm: React.FC = () => {
  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-6 w-28 rounded-full" />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-28 shrink-0 rounded-xl" />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4 border-t border-border">
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>
    </div>
  );
};

export const WorkspaceSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 w-full pb-12 animate-pulse">
      {/* Workspace Header Skeleton */}
      <div className="bg-surface border border-border p-6 rounded-2xl space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-9 w-32 rounded-xl" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>

      {/* Workspace Tabs Skeleton */}
      <div className="flex gap-3">
        <Skeleton className="h-11 w-36 rounded-xl" />
        <Skeleton className="h-11 w-36 rounded-xl" />
        <Skeleton className="h-11 w-36 rounded-xl" />
        <Skeleton className="h-11 w-36 rounded-xl" />
      </div>

      {/* Main View Skeleton Form */}
      <SkeletonForm />
    </div>
  );
};

export const SuperAdminDashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 pb-12 animate-pulse">
      {/* Header Bar Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-72" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <Skeleton className="h-4 w-96 mt-2" />
        </div>
        <Skeleton className="h-9 w-32 rounded-xl" />
      </div>

      {/* Core Platform Account & Infra KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="bg-surface border border-border p-5 rounded-2xl shadow-sm flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-7 w-16" />
            </div>
          </div>
        ))}
      </div>

      {/* Financial Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface border border-border p-5 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-3.5 w-64" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-7 w-20 rounded-lg" />
              <Skeleton className="h-7 w-20 rounded-lg" />
            </div>
          </div>
          <Skeleton className="h-[280px] w-full rounded-xl" />
        </div>

        <div className="bg-surface border border-border p-5 rounded-2xl shadow-sm space-y-4">
          <div className="space-y-1">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-3.5 w-44" />
          </div>
          <div className="flex justify-center items-center py-4">
            <Skeleton className="w-44 h-44 rounded-full border-8 border-surface-raised" />
          </div>
          <div className="space-y-2 pt-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>

      {/* Demographics & Role Split Skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        {Array.from({ length: 2 }).map((_, idx) => (
          <div key={idx} className="bg-surface border border-border p-5 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="h-5 w-44" />
                <Skeleton className="h-3.5 w-32" />
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="space-y-3 pt-2">
              {Array.from({ length: 5 }).map((_, rIdx) => (
                <div key={rIdx} className="flex justify-between items-center py-2 border-b border-border/40">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const CompaniesTableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, idx) => (
        <tr key={idx} className="border-b border-border/50 animate-pulse">
          <td className="px-6 py-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </td>
          <td className="px-6 py-4">
            <Skeleton className="h-4 w-40" />
          </td>
          <td className="px-6 py-4">
            <Skeleton className="h-4 w-28" />
          </td>
          <td className="px-6 py-4">
            <Skeleton className="h-4 w-36" />
          </td>
          <td className="px-6 py-4 text-right">
            <div className="flex items-center justify-end gap-2">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <Skeleton className="w-8 h-8 rounded-lg" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
};

export const CompanyUsersTableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, idx) => (
        <tr key={idx} className="border-b border-border/50 animate-pulse">
          <td className="px-6 py-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-full shrink-0" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
          </td>
          <td className="px-6 py-4">
            <Skeleton className="h-6 w-28 rounded-lg" />
          </td>
          <td className="px-6 py-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>
          </td>
          <td className="px-6 py-4 text-right">
            <div className="flex items-center justify-end gap-2">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <Skeleton className="w-8 h-8 rounded-lg" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
};


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

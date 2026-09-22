"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "../AppShell";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/axios";
import { 
  Users, 
  Buildings, 
  Database,
  ShieldCheck,
  ArrowsClockwise
} from "@phosphor-icons/react";
import { SuperAdminCharts } from "./SuperAdminCharts";

import { SuperAdminDashboardSkeleton } from "../ui/Skeleton";

export function SuperAdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  const fetchStats = async () => {
    try {
      const response = await api.get("/admin/stats");
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch super admin stats", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  if (loading) {
    return (
      <AppShell>
        <SuperAdminDashboardSkeleton />
      </AppShell>
    );
  }

  if (!stats) {
    return (
      <AppShell>
        <div className="p-8 text-center bg-surface border border-border rounded-2xl">
          <p className="text-error font-medium">Failed to load system stats.</p>
          <button
            onClick={handleRefresh}
            className="mt-3 px-4 py-2 bg-accent text-white text-xs font-semibold rounded-xl hover:bg-accent-hover transition-colors"
          >
            Retry
          </button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6 pb-12">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-extrabold font-lexend text-primary tracking-tight">
                Super Admin Command Center
              </h2>
              <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-semibold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Operational
              </span>
            </div>
            <p className="text-xs text-secondary mt-1">
              Global platform oversight, revenue metrics, subscriptions & account health
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-surface hover:bg-surface-raised border border-border rounded-xl text-xs font-medium text-primary shadow-xs transition-colors"
            >
              <ArrowsClockwise size={15} className={refreshing ? "animate-spin text-accent" : "text-secondary"} />
              Refresh Data
            </button>
          </div>
        </div>
        
        {/* Core Platform Account & Infra KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface border border-border p-5 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/15 text-accent flex items-center justify-center shrink-0">
              <Buildings size={24} weight="fill" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-wider">Registered Companies</p>
              <p className="text-2xl font-bold text-primary font-lexend mt-0.5">{stats.totalCompanies}</p>
            </div>
          </div>
          
          <div className="bg-surface border border-border p-5 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center shrink-0">
              <Users size={24} weight="fill" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-wider">Platform Users</p>
              <p className="text-2xl font-bold text-primary font-lexend mt-0.5">{stats.totalUsers}</p>
            </div>
          </div>

          <div className="bg-surface border border-border p-5 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
              <ShieldCheck size={24} weight="fill" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-wider">Active Admins</p>
              <p className="text-2xl font-bold text-primary font-lexend mt-0.5">{stats.activeAdmins}</p>
            </div>
          </div>

          <div className="bg-surface border border-border p-5 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/15 text-purple-500 flex items-center justify-center shrink-0">
              <Database size={24} weight="fill" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-wider">Storage Utilized</p>
              <p className="text-2xl font-bold text-primary font-lexend mt-0.5">{stats.storageUsedGb} GB</p>
            </div>
          </div>
        </div>

        {/* Recharts Financial Intelligence Suite */}
        <SuperAdminCharts
          financialSummary={stats.financialSummary}
          monthlyFinancials={stats.monthlyFinancials}
          revenueByTier={stats.revenueByTier}
          recentTransactions={stats.recentTransactions}
        />

        {/* Supplementary Platform Demographics & Volume */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          {/* User Registration Velocity */}
          <div className="bg-surface border border-border p-5 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-lexend font-bold text-base text-primary">User Onboarding Velocity</h3>
                <p className="text-xs text-secondary mt-0.5">Historical monthly sign-ups</p>
              </div>
              <span className="text-xs font-medium text-muted">Last 6 Months</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted uppercase bg-surface-raised/50 border-b border-border">
                  <tr>
                    <th className="px-4 py-2.5 rounded-l-lg">Billing Cycle / Month</th>
                    <th className="px-4 py-2.5 text-right rounded-r-lg">New Users Added</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {stats.monthlyUsers?.map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-surface-raised/30 transition-colors">
                      <td className="px-4 py-2.5 font-medium text-primary">{item.month} 2026</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-accent">+{item.users}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* User Role Distribution */}
          <div className="bg-surface border border-border p-5 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-lexend font-bold text-base text-primary">Access & Permission Matrix</h3>
                <p className="text-xs text-secondary mt-0.5">Active permission levels across platform</p>
              </div>
              <span className="text-xs font-medium text-muted">Role Split</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted uppercase bg-surface-raised/50 border-b border-border">
                  <tr>
                    <th className="px-4 py-2.5 rounded-l-lg">Assigned Role</th>
                    <th className="px-4 py-2.5 text-right rounded-r-lg">Account Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {stats.roleDistribution?.map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-surface-raised/30 transition-colors">
                      <td className="px-4 py-2.5 font-medium text-primary capitalize flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-accent" />
                        {item.role}
                      </td>
                      <td className="px-4 py-2.5 text-right font-semibold text-primary">{item.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

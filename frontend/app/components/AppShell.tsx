"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Bell, List, User, CaretRight, CheckCircle } from "@phosphor-icons/react";
import { useAuth } from "../context/AuthContext";
import { ThemeToggle } from "./ThemeToggle";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { user } = useAuth();

  // Dynamic breadcrumb text generator
  const getBreadcrumbTitle = () => {
    if (!pathname || pathname === "/dashboard") return "Dashboard Overview";
    if (pathname.startsWith("/contracts")) return "My Contracts & Agreements";
    if (pathname.startsWith("/tariffs")) return "Subscription & Storage Tariffs";
    if (pathname.startsWith("/projects")) return "Regulatory Projects & Dossier Submissions";
    if (pathname.startsWith("/payments")) return "Payment History & Financial Ledger";
    if (pathname.startsWith("/profile/account")) return "Account & User Management";
    if (pathname.startsWith("/journal")) return "System Activity Log & Audit Trail";
    if (pathname.startsWith("/tour")) return "System Tour & Technical Support";
    return "Client Workspace";
  };

  return (
    <div className="min-h-screen bg-bg text-secondary flex overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative w-64 bg-surface h-full shadow-2xl z-10">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen">
        {/* Persistent Topbar */}
        <header className="h-16 bg-surface/90 backdrop-blur-md border-b border-border px-4 md:px-6 flex items-center justify-between shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 text-secondary hover:text-primary rounded-lg bg-bg border border-border"
            >
              <List size={20} />
            </button>

            <div className="flex items-center gap-2 text-xs font-semibold">
              <Link href="/dashboard" className="text-muted hover:text-accent transition-colors">
                ECTC Workspace
              </Link>
              <CaretRight size={12} className="text-muted" />
              <span className="text-primary font-bold">{getBreadcrumbTitle()}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <ThemeToggle />

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-secondary hover:text-primary rounded-lg bg-bg border border-border relative transition-colors"
                title="Notifications"
              >
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent animate-pulse" />
              </button>

              {/* Notification Popover */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-surface border border-border rounded-xl shadow-2xl z-50 p-4 text-xs">
                  <div className="flex items-center justify-between border-b border-border pb-2.5 mb-2.5">
                    <span className="font-bold text-primary font-lexend">Administrative Alerts</span>
                    <span className="text-[10px] bg-accent/15 text-accent px-1.5 py-0.5 rounded font-semibold">
                      2 Unread
                    </span>
                  </div>

                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    <div className="p-2.5 rounded-lg bg-bg border border-border">
                      <div className="flex items-center gap-1.5 text-emerald-500 font-semibold mb-1">
                        <CheckCircle size={14} />
                        <span>Tax Regime Update (2026-Q3)</span>
                      </div>
                      <p className="text-[11px] text-secondary leading-snug">
                        Kazakhstan tax classification for digital regulatory software services updated under REF-KZ-992.
                      </p>
                      <span className="text-[9px] text-muted block mt-1">Today, 08:30 AM</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-bg border border-border">
                      <div className="flex items-center gap-1.5 text-accent font-semibold mb-1">
                        <Bell size={14} />
                        <span>Contract Renewal Notice</span>
                      </div>
                      <p className="text-[11px] text-secondary leading-snug">
                        Contract #KZ-2026-8812 is active and verified for 12 months.
                      </p>
                      <span className="text-[9px] text-muted block mt-1">Yesterday, 14:15 PM</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Pill */}
            <Link
              href="/profile/account"
              className="flex items-center gap-2 bg-bg hover:bg-surface-raised border border-border rounded-lg px-2.5 py-1.5 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs font-bold">
                {user?.name ? user.name.charAt(0).toUpperCase() : <User size={14} />}
              </div>
              <span className="hidden sm:inline text-xs font-semibold text-primary">{user?.name || "Account"}</span>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 w-full">{children}</main>
      </div>
    </div>
  );
}

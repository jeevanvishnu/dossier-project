"use client";

import React, { useState, useEffect } from "react";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { Sidebar } from "./Sidebar";
import { Bell, List, User, CaretRight, CheckCircle } from "@phosphor-icons/react";
import { useAuth } from "../context/AuthContext";
import { useAuthModal } from "./AuthModalContext";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useTranslations } from "next-intl";

export function AppShell({ children }: { children: React.ReactNode }) {
  const tApp = useTranslations("appShell");
  const pathname = usePathname();
  const router = useRouter();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { user, isAuthenticated, isLoading } = useAuth();
  const { openAuthModal } = useAuthModal();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/");
      openAuthModal("signin");
    }
  }, [isLoading, isAuthenticated, router, openAuthModal]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const getBreadcrumbTitle = () => {
    if (!pathname || pathname === "/dashboard") return tApp("breadcrumbOverview");
    if (pathname.startsWith("/contracts")) return tApp("breadcrumbContracts");
    if (pathname.startsWith("/tariffs")) return tApp("breadcrumbTariffs");
    if (pathname.startsWith("/projects")) return tApp("breadcrumbProjects");
    if (pathname.startsWith("/payments")) return tApp("breadcrumbPayments");
    if (pathname.startsWith("/profile/account")) return tApp("breadcrumbAccount");
    if (pathname.startsWith("/journal")) return tApp("breadcrumbJournal");
    if (pathname.startsWith("/tour")) return tApp("breadcrumbTour");
    return tApp("breadcrumbWorkspace");
  };

  return (
    <div className="min-h-screen bg-bg text-secondary flex overflow-hidden">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

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

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen">
        <header className="h-16 bg-surface/90 backdrop-blur-md border-b border-border px-4 md:px-6 flex items-center justify-between shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 text-secondary hover:text-primary rounded-lg bg-bg border border-border cursor-pointer"
            >
              <List size={20} />
            </button>

            <div className="flex items-center gap-2 text-xs font-semibold">
              <Link href="/dashboard" className="text-muted hover:text-accent transition-colors">
                {tApp("workspaceTitle")}
              </Link>
              <CaretRight size={12} className="text-muted" />
              <span className="text-primary font-bold">{getBreadcrumbTitle()}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher compact />

            <ThemeToggle />

            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-secondary hover:text-primary rounded-lg bg-bg border border-border relative transition-colors cursor-pointer"
                title="Notifications"
              >
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent animate-pulse" />
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-surface border border-border rounded-xl shadow-2xl z-50 p-4 text-xs">
                  <div className="flex items-center justify-between border-b border-border pb-2.5 mb-2.5">
                    <span className="font-bold text-primary font-lexend">{tApp("alertsTitle")}</span>
                    <span className="text-[10px] bg-accent/15 text-accent px-1.5 py-0.5 rounded font-semibold">
                      {tApp("unreadAlerts")}
                    </span>
                  </div>

                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    <div className="p-2.5 rounded-lg bg-bg border border-border">
                      <div className="flex items-center gap-1.5 text-emerald-500 font-semibold mb-1">
                        <CheckCircle size={14} />
                        <span>{tApp("taxAlertTitle")}</span>
                      </div>
                      <p className="text-[11px] text-secondary leading-snug">
                        {tApp("taxAlertBody")}
                      </p>
                      <span className="text-[9px] text-muted block mt-1">{tApp("taxAlertTime")}</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-bg border border-border">
                      <div className="flex items-center gap-1.5 text-accent font-semibold mb-1">
                        <Bell size={14} />
                        <span>{tApp("contractAlertTitle")}</span>
                      </div>
                      <p className="text-[11px] text-secondary leading-snug">
                        {tApp("contractAlertBody")}
                      </p>
                      <span className="text-[9px] text-muted block mt-1">{tApp("contractAlertTime")}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/profile/account"
              className="flex items-center gap-2 bg-bg hover:bg-surface-raised border border-border rounded-lg px-2.5 py-1.5 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs font-bold">
                {user?.name ? user.name.charAt(0).toUpperCase() : <User size={14} />}
              </div>
              <span className="hidden sm:inline text-xs font-semibold text-primary">{user?.name || tApp("breadcrumbAccount")}</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 w-full">{children}</main>
      </div>
    </div>
  );
}

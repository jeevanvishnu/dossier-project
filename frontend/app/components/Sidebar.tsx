"use client";

import React from "react";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import {
  Compass,
  SquaresFour,
  FileText,
  CreditCard,
  Folders,
  Receipt,
  UserGear,
  ListBullets,
  SignOut,
  Buildings,
  UsersThree,
} from "@phosphor-icons/react";
import { SupportWidget } from "./SupportWidget";
import { useAuth } from "../context/AuthContext";
import { useTranslations } from "next-intl";

export function Sidebar() {
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const roleLower = user?.role?.toLowerCase();
  const isAdmin = roleLower === "admin" || roleLower === "superadmin";

  const systemTourItem = { name: tNav("systemTour"), href: "/tour", icon: Compass };
  const activityLogItem = { name: tNav("activityLog"), href: "/journal", icon: ListBullets };
  const accountSettingsItem = { name: tNav("accountSettings"), href: "/profile/account", icon: UserGear };

  const superAdminNavItems = [
    { name: tNav("dashboard"), href: "/dashboard", icon: SquaresFour },
    { name: tNav("superAdminCompanies"), href: "/super-admin/companies", icon: Buildings },
    { name: tNav("superAdminCompanyAdmin"), href: "/super-admin/company-users", icon: UsersThree },
  ];

  const userMainItems = [
    { name: tNav("dashboard"), href: "/dashboard", icon: SquaresFour },
    { name: tNav("myContracts"), href: "/contracts", icon: FileText },
    { name: tNav("myTariffs"), href: "/tariffs", icon: CreditCard },
    { name: tNav("myProjects"), href: "/projects", icon: Folders },
    { name: tNav("paymentHistory"), href: "/payments", icon: Receipt },
  ];

  const mainMenuItems = roleLower === "superadmin" ? superAdminNavItems : userMainItems;

  const generalItems = roleLower === "superadmin"
    ? []
    : isAdmin
      ? [systemTourItem, activityLogItem, accountSettingsItem]
      : [accountSettingsItem];

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/start");
    } catch (error) {
      console.error("[Sidebar] Error during logout execution:", error);
    }
  };

  const renderNavLink = (item: { name: string; href: string; icon: React.ElementType }) => {
    const Icon = item.icon;
    const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
    return (
      <Link
        key={item.name}
        href={item.href}
        className={`group flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 ${
          isActive
            ? "bg-accent text-white font-semibold shadow-xs"
            : "text-secondary hover:text-primary hover:bg-surface-raised"
        }`}
      >
        <Icon
          size={19}
          weight={isActive ? "fill" : "regular"}
          className={`shrink-0 transition-colors ${isActive ? "text-white" : "text-muted group-hover:text-primary"}`}
        />
        <span className="truncate">{item.name}</span>
      </Link>
    );
  };

  return (
    <aside className="w-64 bg-surface border-r border-border min-h-screen flex flex-col justify-between shrink-0 select-none pb-4">
      <div>
        {/* Brand / Portal Header */}
        <div className="h-18 px-5 flex items-center border-b border-border/40">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center text-white shadow-xs transition-transform group-hover:scale-105 shrink-0">
              <SquaresFour size={20} weight="fill" />
            </div>
            <span className="font-lexend font-bold text-base text-primary tracking-tight leading-none group-hover:text-accent transition-colors">
              {tNav("portal")}
            </span>
          </Link>
        </div>

        {/* Navigation Groups */}
        <nav className="px-3.5 space-y-1 mt-4">
          {/* Main Menu Section */}
          <p className="px-3.5 pb-2 text-[11px] font-bold text-muted uppercase tracking-wider">
            {tNav("mainMenu")}
          </p>
          <div className="space-y-1">
            {mainMenuItems.map(renderNavLink)}
          </div>

          {/* General Section */}
          <div className="pt-5 mt-4 border-t border-border/40">
            <p className="px-3.5 pb-2 text-[11px] font-bold text-muted uppercase tracking-wider">
              {tNav("general")}
            </p>
            <div className="space-y-1">
              {generalItems.map(renderNavLink)}

              <button
                onClick={handleLogout}
                className="w-full group flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-[13px] font-medium text-red-500 hover:bg-red-500/10 hover:text-red-600 transition-all duration-150 cursor-pointer text-left"
              >
                <SignOut size={19} className="shrink-0 text-red-500 transition-colors" />
                <span className="truncate">{tCommon("logout")}</span>
              </button>
            </div>
          </div>
        </nav>
      </div>

      {/* Bottom Support Widget */}
      <div className="p-3.5">
        <SupportWidget />
      </div>
    </aside>
  );
}
